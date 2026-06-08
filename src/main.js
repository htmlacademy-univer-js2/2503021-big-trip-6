import TripPresenter from './presenter/trip-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import TripModel from './model/trip-model.js';
import FilterModel from './model/filter-model.js';
import TripApiService from './trip-api-service.js';
import {UpdateType} from './const.js';
import TripInfoPresenter from './presenter/trip-info-presenter.js';

const END_POINT = 'https://23.objects.htmlacademy.pro/big-trip';
const AUTHORIZATION = `Basic ${Math.random().toString(36).slice(2)}`;

const filtersContainer = document.querySelector('.trip-controls__filters');
const tripEventsContainer = document.querySelector('.trip-events');
const newEventButton = document.querySelector('.trip-main__event-add-btn');
const tripMainContainer = document.querySelector('.trip-main');

const tripModel = new TripModel({
  tripApiService: new TripApiService(END_POINT, AUTHORIZATION),
});

const filterModel = new FilterModel();

const tripPresenter = new TripPresenter({
  tripEventsContainer,
  tripModel,
  filterModel,
  newEventButton,
});

const tripInfoPresenter = new TripInfoPresenter({
  tripMainContainer,
  tripModel,
});

const filterPresenter = new FilterPresenter({
  filterContainer: filtersContainer,
  tripModel,
  filterModel,
});

filterPresenter.init();
tripPresenter.init();
tripInfoPresenter.init();

tripModel.init(UpdateType.INIT);
