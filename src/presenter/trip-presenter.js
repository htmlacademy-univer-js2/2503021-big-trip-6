import {render, remove} from '../framework/render.js';
import {
  FilterType,
  LoadErrorMessage,
  NoEventMessage,
  SortType,
  UpdateType,
  UserAction,
} from '../const.js';
import {filter} from '../utils/filter.js';
import {sortPoint} from '../utils/sort.js';
import EventPresenter from './event-presenter.js';
import NewEventPresenter from './new-event-presenter.js';
import SortView from '../view/sort-view.js';
import NoEventView from '../view/no-event-view.js';
import LoadingView from '../view/loading-view.js';

export default class TripPresenter {
  #tripEventsContainer = null;
  #eventListElement = null;
  #tripModel = null;
  #filterModel = null;
  #newEventButton = null;
  #currentSortType = SortType.DAY;
  #eventPresenters = new Map();
  #newEventPresenter = null;
  #sortComponent = null;
  #noEventComponent = null;
  #loadingComponent = new LoadingView();
  #isCreating = false;
  #isActionInProgress = false;

  constructor({tripEventsContainer, tripModel, filterModel, newEventButton}) {
    this.#tripEventsContainer = tripEventsContainer;
    this.#tripModel = tripModel;
    this.#filterModel = filterModel;
    this.#newEventButton = newEventButton;

    this.#tripModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  init() {
    this.#newEventButton.addEventListener(
      'click',
      this.#handleNewEventButtonClick
    );

    this.#renderTrip();
  }

  get points() {
    const currentFilterType = this.#filterModel.filter;
    const points = this.#tripModel.points;
    const filteredPoints = filter[currentFilterType](points);

    return sortPoint[this.#currentSortType](filteredPoints);
  }

  #renderTrip() {
    if (this.#tripModel.isLoading) {
      this.#newEventButton.disabled = true;
      this.#renderLoading();
      return;
    }

    if (this.#tripModel.isLoadingError) {
      this.#newEventButton.disabled = true;
      this.#renderLoadError();
      return;
    }

    this.#newEventButton.disabled = this.#isCreating;

    const points = this.points;

    if (points.length === 0) {
      this.#renderNoEvents();
      return;
    }

    this.#renderSort();
    this.#renderEventList(points);
  }

  #renderLoading() {
    render(this.#loadingComponent, this.#tripEventsContainer);
  }

  #renderNoEvents() {
    this.#noEventComponent = new NoEventView({
      message: NoEventMessage[this.#filterModel.filter],
    });

    render(this.#noEventComponent, this.#tripEventsContainer);
  }

  #renderLoadError() {
    this.#noEventComponent = new NoEventView({
      message: LoadErrorMessage.FAILED,
    });

    render(this.#noEventComponent, this.#tripEventsContainer);
  }

  #renderSort() {
    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange,
    });

    render(this.#sortComponent, this.#tripEventsContainer);
  }

  #renderEventList(points) {
    this.#eventListElement = document.createElement('ul');
    this.#eventListElement.classList.add('trip-events__list');
    this.#tripEventsContainer.append(this.#eventListElement);

    points.forEach((point) => {
      this.#renderPoint(point);
    });
  }

  #renderPoint(point) {
    const eventPresenter = new EventPresenter({
      container: this.#eventListElement,
      destinations: this.#tripModel.destinations,
      offers: this.#tripModel.offers,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange,
    });

    eventPresenter.init(point);

    this.#eventPresenters.set(point.id, eventPresenter);
  }

  #renderNewPoint() {
    if (this.#newEventPresenter !== null) {
      return;
    }

    if (this.#noEventComponent !== null) {
      remove(this.#noEventComponent);
      this.#noEventComponent = null;
    }

    if (this.#eventListElement === null) {
      this.#eventListElement = document.createElement('ul');
      this.#eventListElement.classList.add('trip-events__list');
      this.#tripEventsContainer.append(this.#eventListElement);
    }

    this.#newEventPresenter = new NewEventPresenter({
      container: this.#eventListElement,
      destinations: this.#tripModel.destinations,
      offers: this.#tripModel.offers,
      onDataChange: this.#handleViewAction,
      onDestroy: this.#handleNewPointDestroy,
    });

    this.#newEventPresenter.init();
  }

  #clearTrip() {
    this.#eventPresenters.forEach((presenter) => {
      presenter.destroy();
    });

    this.#eventPresenters.clear();

    if (this.#newEventPresenter !== null) {
      this.#newEventPresenter.destroy();
      this.#newEventPresenter = null;
    }

    remove(this.#sortComponent);
    remove(this.#noEventComponent);
    remove(this.#loadingComponent);

    this.#sortComponent = null;
    this.#noEventComponent = null;

    if (this.#eventListElement) {
      this.#eventListElement.remove();
      this.#eventListElement = null;
    }
  }

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#eventPresenters.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this.#isCreating = false;
        this.#clearTrip();
        this.#renderTrip();
        break;
      case UpdateType.MAJOR:
        this.#currentSortType = SortType.DAY;
        this.#clearTrip();
        this.#renderTrip();
        break;
      case UpdateType.INIT:
        this.#clearTrip();
        this.#renderTrip();
        break;
    }
  };

  #handleViewAction = async (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT: {
        const eventPresenter = this.#eventPresenters.get(update.id);

        if (!eventPresenter) {
          return;
        }

        this.#isActionInProgress = true;
        eventPresenter.setSaving();

        try {
          await this.#tripModel.updatePoint(updateType, update);
        } catch (err) {
          const currentPresenter = this.#eventPresenters.get(update.id);

          if (currentPresenter) {
            currentPresenter.setAborting();
          }
        } finally {
          this.#isActionInProgress = false;
        }

        break;
      }

      case UserAction.ADD_POINT:
        if (this.#newEventPresenter === null) {
          return;
        }

        this.#isActionInProgress = true;
        this.#newEventPresenter.setSaving();

        try {
          await this.#tripModel.addPoint(updateType, update);
        } catch (err) {
          if (this.#newEventPresenter !== null) {
            this.#newEventPresenter.setAborting();
          }
        } finally {
          this.#isActionInProgress = false;
        }

        break;

      case UserAction.DELETE_POINT: {
        const eventPresenter = this.#eventPresenters.get(update.id);

        if (!eventPresenter) {
          return;
        }

        this.#isActionInProgress = true;
        eventPresenter.setDeleting();

        try {
          await this.#tripModel.deletePoint(updateType, update);
        } catch (err) {
          const currentPresenter = this.#eventPresenters.get(update.id);

          if (currentPresenter) {
            currentPresenter.setAborting();
          }
        } finally {
          this.#isActionInProgress = false;
        }

        break;
      }
    }
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;

    this.#clearTrip();
    this.#renderTrip();
  };

  #handleModeChange = () => {
    if (this.#isActionInProgress) {
      return false;
    }

    this.#eventPresenters.forEach((presenter) => {
      presenter.resetView();
    });

    if (this.#newEventPresenter !== null) {
      this.#handleNewPointDestroy();
    }

    return true;
  };

  #handleNewEventButtonClick = () => {
    if (
      this.#tripModel.isLoading ||
    this.#tripModel.isLoadingError ||
    this.#isActionInProgress
    ) {
      return;
    }

    if (!this.#handleModeChange()) {
      return;
    }

    this.#isCreating = true;
    this.#currentSortType = SortType.DAY;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);

    this.#newEventButton.disabled = true;
    this.#renderNewPoint();
  };

  #handleNewPointDestroy = () => {
    if (this.#newEventPresenter === null) {
      return;
    }

    this.#newEventPresenter.destroy();
    this.#newEventPresenter = null;
    this.#isCreating = false;
    this.#newEventButton.disabled = false;

    if (this.#tripModel.points.length === 0) {
      this.#clearTrip();
      this.#renderTrip();
    }
  };
}
