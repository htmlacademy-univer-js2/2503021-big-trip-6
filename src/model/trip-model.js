import Observable from '../framework/observable.js';

const LOADING_DELAY = 600;

export default class TripModel extends Observable {
  #points = [];
  #destinations = [];
  #offers = [];
  #tripApiService = null;
  #isLoading = true;
  #isLoadingError = false;

  constructor({tripApiService}) {
    super();

    this.#tripApiService = tripApiService;
  }

  get points() {
    return this.#points;
  }

  set points(points) {
    this.#points = points;
  }

  get destinations() {
    return this.#destinations;
  }

  get offers() {
    return this.#offers;
  }

  get isLoading() {
    return this.#isLoading;
  }

  get isLoadingError() {
    return this.#isLoadingError;
  }

  async init(updateType) {
    try {
      const [points, destinations, offers] = await Promise.all([
        this.#tripApiService.points,
        this.#tripApiService.destinations,
        this.#tripApiService.offers,
        new Promise((resolve) => setTimeout(resolve, LOADING_DELAY)),
      ]);

      this.#points = points;
      this.#destinations = destinations;
      this.#offers = offers;
      this.#isLoadingError = false;
    } catch (err) {
      this.#points = [];
      this.#destinations = [];
      this.#offers = [];
      this.#isLoadingError = true;
    }

    this.#isLoading = false;
    this._notify(updateType);
  }

  async updatePoint(updateType, updatedPoint) {
    const pointIndex = this.#points.findIndex(
      (point) => point.id === updatedPoint.id
    );

    if (pointIndex === -1) {
      throw new Error('Can not update unexisting point');
    }

    const response = await this.#tripApiService.updatePoint(updatedPoint);

    this.#points = [
      ...this.#points.slice(0, pointIndex),
      response,
      ...this.#points.slice(pointIndex + 1),
    ];

    this._notify(updateType, response);
  }

  async addPoint(updateType, newPoint) {
    const response = await this.#tripApiService.addPoint(newPoint);

    this.#points = [
      response,
      ...this.#points,
    ];

    this._notify(updateType, response);
  }

  async deletePoint(updateType, pointToDelete) {
    const pointIndex = this.#points.findIndex(
      (point) => point.id === pointToDelete.id
    );

    if (pointIndex === -1) {
      throw new Error('Can not delete unexisting point');
    }

    await this.#tripApiService.deletePoint(pointToDelete);

    this.#points = [
      ...this.#points.slice(0, pointIndex),
      ...this.#points.slice(pointIndex + 1),
    ];

    this._notify(updateType);
  }
}
