import AbstractView from '../framework/view/abstract-view.js';
import {SortType} from '../const.js';

const createSortItemTemplate = ({type, title, isDisabled}, currentSortType) => {
  const checkedAttribute = type === currentSortType ? 'checked' : '';
  const disabledAttribute = isDisabled ? 'disabled' : '';

  return (
    `<div class="trip-sort__item trip-sort__item--${type}">
      <input
        id="sort-${type}"
        class="trip-sort__input visually-hidden"
        type="radio"
        name="trip-sort"
        value="sort-${type}"
        data-sort-type="${type}"
        ${checkedAttribute}
        ${disabledAttribute}
      >
      <label class="trip-sort__btn" for="sort-${type}">
        ${title}
      </label>
    </div>`
  );
};

const createSortTemplate = (currentSortType) => {
  const sortItems = [
    {
      type: SortType.DAY,
      title: 'Day',
      isDisabled: false,
    },
    {
      type: 'event',
      title: 'Event',
      isDisabled: true,
    },
    {
      type: SortType.TIME,
      title: 'Time',
      isDisabled: false,
    },
    {
      type: SortType.PRICE,
      title: 'Price',
      isDisabled: false,
    },
    {
      type: 'offers',
      title: 'Offers',
      isDisabled: true,
    },
  ];

  return (
    `<form class="trip-events__trip-sort trip-sort" action="#" method="get">
      ${sortItems
      .map((sortItem) => createSortItemTemplate(sortItem, currentSortType))
      .join('')}
    </form>`
  );
};

export default class SortView extends AbstractView {
  #currentSortType = SortType.DAY;
  #handleSortTypeChange = null;

  constructor({currentSortType, onSortTypeChange}) {
    super();

    this.#currentSortType = currentSortType;
    this.#handleSortTypeChange = onSortTypeChange;

    this.element.addEventListener('change', this.#sortTypeChangeHandler);
  }

  get template() {
    return createSortTemplate(this.#currentSortType);
  }

  #sortTypeChangeHandler = (evt) => {
    if (!evt.target.classList.contains('trip-sort__input')) {
      return;
    }

    evt.preventDefault();

    this.#handleSortTypeChange(evt.target.dataset.sortType);
  };
}
