import {remove, render, RenderPosition} from '../framework/render.js';
import {UpdateType, UserAction} from '../const.js';
import EventEditView from '../view/event-edit-view.js';

const createDefaultPoint = () => ({
  type: 'flight',
  destinationId: null,
  offerIds: [],
  dateFrom: null,
  dateTo: null,
  basePrice: 0,
  isFavorite: false,
  isNew: true,
});

export default class NewEventPresenter {
  #container = null;
  #destinations = [];
  #offers = [];
  #handleDataChange = null;
  #handleDestroy = null;
  #eventEditComponent = null;

  constructor({container, destinations, offers, onDataChange, onDestroy}) {
    this.#container = container;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleDataChange = onDataChange;
    this.#handleDestroy = onDestroy;
  }

  init() {
    if (this.#eventEditComponent !== null) {
      return;
    }

    this.#eventEditComponent = new EventEditView({
      point: createDefaultPoint(),
      destinations: this.#destinations,
      offers: this.#offers,
      onFormSubmit: this.#handleFormSubmit,
      onRollupClick: this.#handleCancelClick,
      onDeleteClick: this.#handleCancelClick,
    });

    render(
      this.#eventEditComponent,
      this.#container,
      RenderPosition.AFTERBEGIN
    );

    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  destroy() {
    if (this.#eventEditComponent === null) {
      return;
    }

    remove(this.#eventEditComponent);
    this.#eventEditComponent = null;

    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  setSaving() {
    this.#eventEditComponent.updateElement({
      isDisabled: true,
      isSaving: true,
    });
  }

  setAborting() {
    this.#eventEditComponent.updateElement({
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    });

    this.#eventEditComponent.shake();
  }

  #handleFormSubmit = (point) => {
    this.#handleDataChange(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      point
    );
  };

  #handleCancelClick = () => {
    this.#handleDestroy();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();

      this.#handleDestroy();
    }
  };
}
