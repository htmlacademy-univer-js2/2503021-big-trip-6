import {remove, render, replace} from '../framework/render.js';
import {UpdateType, UserAction} from '../const.js';
import EventEditView from '../view/event-edit-view.js';
import EventView from '../view/event-view.js';

export default class EventPresenter {
  #container = null;
  #destinations = [];
  #offers = [];
  #handleDataChange = null;
  #handleModeChange = null;

  #point = null;
  #eventComponent = null;
  #eventEditComponent = null;

  constructor({container, destinations, offers, onDataChange, onModeChange}) {
    this.#container = container;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(point) {
    this.#point = point;

    const prevEventComponent = this.#eventComponent;
    const prevEventEditComponent = this.#eventEditComponent;

    const destination = this.#destinations.find(
      (item) => item.id === this.#point.destinationId
    );

    const selectedOffers = this.#offers.filter(
      (offer) => this.#point.offerIds.includes(offer.id)
    );

    this.#eventComponent = new EventView({
      point: this.#point,
      destination,
      selectedOffers,
      onEditClick: this.#handleEditClick,
      onFavoriteClick: this.#handleFavoriteClick,
    });

    this.#eventEditComponent = new EventEditView({
      point: this.#point,
      destinations: this.#destinations,
      offers: this.#offers,
      onFormSubmit: this.#handleFormSubmit,
      onRollupClick: this.#handleRollupClick,
      onDeleteClick: this.#handleDeleteClick,
    });

    if (prevEventComponent === null || prevEventEditComponent === null) {
      render(this.#eventComponent, this.#container);
      return;
    }

    if (this.#container.contains(prevEventComponent.element)) {
      replace(this.#eventComponent, prevEventComponent);
    }

    if (this.#container.contains(prevEventEditComponent.element)) {
      replace(this.#eventEditComponent, prevEventEditComponent);
    }
  }

  resetView() {
    if (this.#container.contains(this.#eventEditComponent.element)) {
      this.#eventEditComponent.reset(this.#point);
      this.#replaceFormToEvent();
    }
  }

  destroy() {
    remove(this.#eventComponent);
    remove(this.#eventEditComponent);

    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  setSaving() {
    if (this.#container.contains(this.#eventEditComponent.element)) {
      this.#eventEditComponent.updateElement({
        isDisabled: true,
        isSaving: true,
      });
    }
  }

  setDeleting() {
    if (this.#container.contains(this.#eventEditComponent.element)) {
      this.#eventEditComponent.updateElement({
        isDisabled: true,
        isDeleting: true,
      });
    }
  }

  setAborting() {
    if (this.#container.contains(this.#eventEditComponent.element)) {
      this.#eventEditComponent.restoreControls();
      this.#eventEditComponent.shake();

      return;
    }

    if (this.#container.contains(this.#eventComponent.element)) {
      this.#eventComponent.shake();
    }
  }

  #replaceEventToForm() {
    replace(this.#eventEditComponent, this.#eventComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  #replaceFormToEvent() {
    replace(this.#eventComponent, this.#eventEditComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();

      this.#eventEditComponent.reset(this.#point);
      this.#replaceFormToEvent();
    }
  };

  #handleEditClick = () => {
    if (!this.#handleModeChange()) {
      return;
    }

    this.#replaceEventToForm();
  };

  #handleFormSubmit = (updatedPoint) => {
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.MINOR,
      updatedPoint
    );
  };

  #handleRollupClick = () => {
    this.#eventEditComponent.reset(this.#point);
    this.#replaceFormToEvent();
  };

  #handleFavoriteClick = (updatedPoint) => {
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.PATCH,
      updatedPoint
    );
  };

  #handleDeleteClick = (point) => {
    this.#handleDataChange(
      UserAction.DELETE_POINT,
      UpdateType.MINOR,
      point
    );
  };
}
