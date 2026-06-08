import dayjs from 'dayjs';

const getSortedPointsByDateFrom = (points) =>
  [...points].sort((pointA, pointB) =>
    new Date(pointA.dateFrom) - new Date(pointB.dateFrom)
  );

const getDestinationNameById = (destinationId, destinations) => {
  const destination = destinations.find((item) => item.id === destinationId);

  return destination ? destination.name : '';
};

const getTripTitle = (points, destinations) => {
  const sortedPoints = getSortedPointsByDateFrom(points);

  const destinationNames = sortedPoints
    .map((point) => getDestinationNameById(point.destinationId, destinations))
    .filter((name) => name !== '');

  if (destinationNames.length === 0) {
    return '';
  }

  if (destinationNames.length > 3) {
    return `${destinationNames[0]} &mdash; ... &mdash; ${destinationNames[destinationNames.length - 1]}`;
  }

  return destinationNames.join(' &mdash; ');
};

const getTripDates = (points) => {
  if (points.length === 0) {
    return '';
  }

  const sortedPoints = getSortedPointsByDateFrom(points);
  const firstPoint = sortedPoints[0];
  const lastPoint = sortedPoints[sortedPoints.length - 1];

  const dateFrom = dayjs(firstPoint.dateFrom).format('D MMM').toUpperCase();
  const dateTo = dayjs(lastPoint.dateTo).format('D MMM').toUpperCase();

  return `${dateFrom}&nbsp;&mdash;&nbsp;${dateTo}`;
};

const getPointOffersPrice = (point, offers) =>
  offers
    .filter((offer) => point.offerIds.includes(offer.id))
    .reduce((total, offer) => total + offer.price, 0);

const getTripCost = (points, offers) =>
  points.reduce(
    (total, point) =>
      total + point.basePrice + getPointOffersPrice(point, offers),
    0
  );

export {
  getTripTitle,
  getTripDates,
  getTripCost,
};
