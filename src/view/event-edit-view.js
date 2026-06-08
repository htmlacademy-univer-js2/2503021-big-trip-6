import he from 'he';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {humanizeEditFormDate} from '../utils/date.js';

const EVENT_TYPES = [
  'taxi',
  'bus',
  'train',
  'ship',
  'drive',
  'flight',
  'check-in',
  'sightseeing',
  'restaurant',
];

const capitalize = (value) => value[0].toUpperCase() + value.slice(1);

const createEventTypeTemplate = (type, currentType, isDisabled) => {
  const checked = type === currentType ? 'checked' : '';
  const disabled = isDisabled ? 'disabled' : '';

  return (
    `<div class="event__type-item">
      <input
        id="event-type-${type}-1"
        class="event__type-input visually-hidden"
        type="radio"
        name="event-type"
        value="${type}"
        ${checked}
        ${disabled}
      >
      <label
        class="event__type-label event__type-label--${type}"
        for="event-type-${type}-1"
      >
        ${capitalize(type)}
      </label>
    </div>`
  );
};

const createDestinationOptionTemplate = (destination) => (
  `<option value="${he.encode(destination.name)}"></option>`
);

const createAvailableOfferTemplate = (offer, selectedOfferIds, isDisabled) => {
  const checked = selectedOfferIds.includes(offer.id) ? 'checked' : '';
  const disabled = isDisabled ? 'disabled' : '';

  return (
    `<div class="event__offer-selector">
      <input
        class="event__offer-checkbox visually-hidden"
        id="event-offer-${offer.id}"
        type="checkbox"
        name="event-offer-${offer.id}"
        value="${offer.id}"
        ${checked}
        ${disabled}
      >
      <label class="event__offer-label" for="event-offer-${offer.id}">
        <span class="event__offer-title">${he.encode(offer.title)}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>`
  );
};

const createDestinationPictureTemplate = (picture) => (
  `<img
    class="event__photo"
    src="${picture.src}"
    alt="${he.encode(picture.description)}"
  >`
);

const createDestinationPicturesTemplate = (pictures) => {
  if (pictures.length === 0) {
    return '';
  }

  return (
    `<div class="event__photos-container">
      <div class="event__photos-tape">
        ${pictures
      .map((picture) => createDestinationPictureTemplate(picture))
      .join('')}
      </div>
    </div>`
  );
};

const createDestinationDescriptionTemplate = (description) => {
  if (!description) {
    return '';
  }

  return (
    `<p class="event__destination-description">
      ${he.encode(description)}
    </p>`
  );
};

const createOffersSectionTemplate = (
  availableOffers,
  selectedOfferIds,
  isDisabled
) => {
  if (availableOffers.length === 0) {
    return '';
  }

  return (
    `<section class="event__section event__section--offers">
      <h3 class="event__section-title event__section-title--offers">Offers</h3>

      <div class="event__available-offers">
        ${availableOffers
      .map((offer) => createAvailableOfferTemplate(
        offer,
        selectedOfferIds,
        isDisabled
      ))
      .join('')}
      </div>
    </section>`
  );
};

const createDestinationSectionTemplate = (destination) => {
  if (!destination) {
    return '';
  }

  const pictures = destination.pictures ?? [];
  const description = destination.description ?? '';

  if (!description && pictures.length === 0) {
    return '';
  }

  return (
    `<section class="event__section event__section--destination">
      <h3 class="event__section-title event__section-title--destination">
        Destination
      </h3>

      ${createDestinationDescriptionTemplate(description)}
      ${createDestinationPicturesTemplate(pictures)}
    </section>`
  );
};

const createEventEditTemplate = ({point, destinations, offers}) => {
  const currentDestination = destinations.find(
    (destination) => destination.id === point.destinationId
  );

  const availableOffers = offers.filter((offer) => offer.type === point.type);
  const selectedOfferIds = point.offerIds ?? [];

  const isDisabled = point.isDisabled ? 'disabled' : '';
  const resetButtonText = point.isNew ? 'Cancel' : 'Delete';
  const deleteButtonText = point.isDeleting ? 'Deleting...' : resetButtonText;
  const saveButtonText = point.isSaving ? 'Saving...' : 'Save';

  const eventTypesTemplate = EVENT_TYPES
    .map((type) => createEventTypeTemplate(type, point.type, point.isDisabled))
    .join('');

  const destinationOptionsTemplate = destinations
    .map((destination) => createDestinationOptionTemplate(destination))
    .join('');

  const destinationName = currentDestination
    ? he.encode(currentDestination.name)
    : '';

  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img
                class="event__type-icon"
                width="17"
                height="17"
                src="img/icons/${point.type}.png"
                alt="Event type icon"
              >
            </label>

            <input
              class="event__type-toggle visually-hidden"
              id="event-type-toggle-1"
              type="checkbox"
              ${isDisabled}
            >

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${eventTypesTemplate}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group event__field-group--destination">
            <label
              class="event__label event__type-output"
              for="event-destination-1"
            >
              ${capitalize(point.type)}
            </label>

            <input
              class="event__input event__input--destination"
              id="event-destination-1"
              type="text"
              name="event-destination"
              value="${destinationName}"
              list="destination-list-1"
              ${isDisabled}
            >

            <datalist id="destination-list-1">
              ${destinationOptionsTemplate}
            </datalist>
          </div>

          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input
              class="event__input event__input--time"
              id="event-start-time-1"
              type="text"
              name="event-start-time"
              value="${humanizeEditFormDate(point.dateFrom)}"
              ${isDisabled}
            >
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input
              class="event__input event__input--time"
              id="event-end-time-1"
              type="text"
              name="event-end-time"
              value="${humanizeEditFormDate(point.dateTo)}"
              ${isDisabled}
            >
          </div>

          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input
              class="event__input event__input--price"
              id="event-price-1"
              type="text"
              name="event-price"
              value="${point.basePrice}"
              ${isDisabled}
            >
          </div>

          <button
            class="event__save-btn btn btn--blue"
            type="submit"
            ${isDisabled}
          >
            ${saveButtonText}
          </button>
          <button
  class="event__reset-btn"
  type="reset"
>
  ${deleteButtonText}
</button>
<button class="event__rollup-btn" type="button">
  <span class="visually-hidden">Open event</span>
</button>
        </header>

        <section class="event__details">
          ${createOffersSectionTemplate(
      availableOffers,
      selectedOfferIds,
      point.isDisabled
    )}
          ${createDestinationSectionTemplate(currentDestination)}
        </section>
      </form>
    </li>`
  );
};

export default class EventEditView extends AbstractStatefulView {
  #destinations = [];
  #offers = [];
  #handleFormSubmit = null;
  #handleRollupClick = null;
  #handleDeleteClick = null;
  #datepickerStart = null;
  #datepickerEnd = null;

  constructor({
    point,
    destinations,
    offers,
    onFormSubmit,
    onRollupClick,
    onDeleteClick,
  }) {
    super();

    this._setState(EventEditView.parsePointToState(point));
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleRollupClick = onRollupClick;
    this.#handleDeleteClick = onDeleteClick;

    this._restoreHandlers();
  }

  get template() {
    return createEventEditTemplate({
      point: this._state,
      destinations: this.#destinations,
      offers: this.#offers,
    });
  }

  #destroyDatepickers() {
    if (this.#datepickerStart) {
      this.#datepickerStart.destroy();
      this.#datepickerStart = null;
    }

    if (this.#datepickerEnd) {
      this.#datepickerEnd.destroy();
      this.#datepickerEnd = null;
    }
  }

  removeElement() {
    this.#destroyDatepickers();

    super.removeElement();
  }

  reset(point) {
    this.updateElement(EventEditView.parsePointToState(point));
  }

  restoreControls() {
    this._setState({
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    });
  }

  _restoreHandlers() {
    this.element
      .querySelector('form')
      .addEventListener('submit', this.#formSubmitHandler);

    this.element
      .querySelector('.event__rollup-btn')
      .addEventListener('click', this.#rollupClickHandler);

    this.element
      .querySelector('.event__type-group')
      .addEventListener('change', this.#eventTypeChangeHandler);

    this.element
      .querySelector('.event__input--destination')
      .addEventListener('input', this.#destinationChangeHandler);

    this.element
      .querySelector('.event__reset-btn')
      .addEventListener('click', this.#deleteClickHandler);

    this.element
      .querySelector('.event__input--price')
      .addEventListener('input', this.#priceInputHandler);

    const offersElement = this.element.querySelector('.event__available-offers');

    if (offersElement) {
      offersElement.addEventListener('change', this.#offerChangeHandler);
    }

    this.#setDatepickers();
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();

    if (this._state.isDisabled) {
      return;
    }

    const destinationName = this.element
      .querySelector('.event__input--destination')
      .value;

    const selectedDestination = this.#destinations.find(
      (destination) => destination.name === destinationName
    );

    if (!selectedDestination) {
      return;
    }

    const point = EventEditView.parseStateToPoint({
      ...this._state,
      destinationId: selectedDestination.id,
    });

    if (!point.destinationId || !point.dateFrom || !point.dateTo) {
      return;
    }

    this.#handleFormSubmit(point);
  };

  #rollupClickHandler = (evt) => {
    evt.preventDefault();

    if (this._state.isDisabled) {
      return;
    }

    this.#handleRollupClick();
  };

  #eventTypeChangeHandler = (evt) => {
    this.updateElement({
      type: evt.target.value,
      offerIds: [],
    });
  };

  #destinationChangeHandler = (evt) => {
    const selectedDestination = this.#destinations.find(
      (destination) => destination.name === evt.target.value
    );

    if (!selectedDestination) {
      return;
    }

    this.updateElement({
      destinationId: selectedDestination.id,
    });
  };

  #offerChangeHandler = () => {
    const checkedOfferIds = Array
      .from(this.element.querySelectorAll('.event__offer-checkbox:checked'))
      .map((offerElement) => offerElement.value);

    this._setState({
      offerIds: checkedOfferIds,
    });
  };

  #priceInputHandler = (evt) => {
    evt.target.value = evt.target.value.replace(/\D/g, '');

    this._setState({
      basePrice: Number(evt.target.value),
    });
  };

  #deleteClickHandler = (evt) => {
    evt.preventDefault();

    if (this._state.isDisabled) {
      return;
    }

    this.#handleDeleteClick(EventEditView.parseStateToPoint(this._state));
  };

  #setDatepickers() {
    this.#datepickerStart = flatpickr(
      this.element.querySelector('[name="event-start-time"]'),
      {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        'time_24hr': true,
        allowInput: true,
        clickOpens: true,
        defaultDate: this._state.dateFrom,
        onChange: this.#dateFromChangeHandler,
      }
    );

    this.#datepickerEnd = flatpickr(
      this.element.querySelector('[name="event-end-time"]'),
      {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        'time_24hr': true,
        allowInput: true,
        clickOpens: true,
        defaultDate: this._state.dateTo,
        minDate: this._state.dateFrom,
        onChange: this.#dateToChangeHandler,
      }
    );
  }

  #dateFromChangeHandler = ([userDate]) => {
    if (!userDate) {
      return;
    }

    const dateFrom = userDate.toISOString();
    const dateTo = !this._state.dateTo || new Date(this._state.dateTo) < userDate
      ? dateFrom
      : this._state.dateTo;

    this._setState({
      dateFrom,
      dateTo,
    });
  };

  #dateToChangeHandler = ([userDate]) => {
    if (!userDate) {
      return;
    }

    this._setState({
      dateTo: userDate.toISOString(),
    });
  };

  static parsePointToState(point) {
    return {
      ...point,
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    };
  }

  static parseStateToPoint(state) {
    const point = {
      ...state,
    };

    delete point.isNew;
    delete point.isDisabled;
    delete point.isSaving;
    delete point.isDeleting;

    return point;
  }
}
