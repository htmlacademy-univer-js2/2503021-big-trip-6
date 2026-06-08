import he from 'he';
import AbstractView from '../framework/view/abstract-view.js';
import {
  getDuration,
  humanizeEventDate,
  humanizeEventTime,
} from '../utils/date.js';

const createOfferTemplate = (offer) => (
  `<li class="event__offer">
    <span class="event__offer-title">${he.encode(offer.title)}</span>
    &plus;&euro;&nbsp;
    <span class="event__offer-price">${offer.price}</span>
  </li>`
);

function createEventTemplate({point, destination, selectedOffers}) {
  const favoriteClassName = point.isFavorite ? 'event__favorite-btn--active' : '';
  const offersTemplate = selectedOffers
    .map((offer) => createOfferTemplate(offer))
    .join('');

  const destinationName = destination ? destination.name : '';

  return (
    `<li class="trip-events__item">
      <div class="event">
        <time class="event__date" datetime="${point.dateFrom}">
          ${humanizeEventDate(point.dateFrom)}
        </time>

        <div class="event__type">
          <img
            class="event__type-icon"
            width="42"
            height="42"
            src="img/icons/${point.type}.png"
            alt="Event type icon"
          >
        </div>

        <h3 class="event__title">
          ${he.encode(point.type)} ${he.encode(destinationName)}
        </h3>

        <div class="event__schedule">
          <p class="event__time">
            <time class="event__start-time" datetime="${point.dateFrom}">
              ${humanizeEventTime(point.dateFrom)}
            </time>
            &mdash;
            <time class="event__end-time" datetime="${point.dateTo}">
              ${humanizeEventTime(point.dateTo)}
            </time>
          </p>
          <p class="event__duration">
            ${getDuration(point.dateFrom, point.dateTo)}
          </p>
        </div>

        <p class="event__price">
          &euro;&nbsp;<span class="event__price-value">${point.basePrice}</span>
        </p>

        <h4 class="visually-hidden">Offers:</h4>
        <ul class="event__selected-offers">
          ${offersTemplate}
        </ul>

        <button class="event__favorite-btn ${favoriteClassName}" type="button">
          <span class="visually-hidden">Add to favorite</span>
          <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
            <path d="M14 21l-1.03-.93C7.8 15.4 4 11.97 4 7.75 4 4.32 6.69 2 10 2c1.86 0 3.64.86 4 2.21C14.36 2.86 16.14 2 18 2c3.31 0 6 2.32 6 5.75 0 4.22-3.8 7.65-8.97 12.32L14 21z"/>
          </svg>
        </button>

        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </div>
    </li>`
  );
}

export default class EventView extends AbstractView {
  #point = null;
  #destination = null;
  #selectedOffers = [];
  #handleEditClick = null;
  #handleFavoriteClick = null;

  constructor({point, destination, selectedOffers, onEditClick, onFavoriteClick}) {
    super();

    this.#point = point;
    this.#destination = destination;
    this.#selectedOffers = selectedOffers;
    this.#handleEditClick = onEditClick;
    this.#handleFavoriteClick = onFavoriteClick;

    this.element
      .querySelector('.event__rollup-btn')
      .addEventListener('click', this.#editClickHandler);

    this.element
      .querySelector('.event__favorite-btn')
      .addEventListener('click', this.#favoriteClickHandler);
  }

  get template() {
    return createEventTemplate({
      point: this.#point,
      destination: this.#destination,
      selectedOffers: this.#selectedOffers,
    });
  }

  #editClickHandler = (evt) => {
    evt.preventDefault();

    this.#handleEditClick();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();

    this.#handleFavoriteClick({
      ...this.#point,
      isFavorite: !this.#point.isFavorite,
    });
  };
}
