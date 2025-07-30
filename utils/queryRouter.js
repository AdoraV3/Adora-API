export const detectQueryIntent = (query) => {
  const roadKeywords = [
    'bus', 'train', 'subway', 'transit', 'commute', 'station',
    'stop', 'gtfs', 'go transit', 'up express', 'rail'
  ];

  const flightKeywords = [
    'flight', 'airport', 'airline', 'plane', 'boarding', 'arrival',
    'departure', 'terminal', 'aviation'
  ];

  const lowerQuery = query.toLowerCase();

  const isRoad = roadKeywords.some(keyword => lowerQuery.includes(keyword));
  const isFlight = flightKeywords.some(keyword => lowerQuery.includes(keyword));

  if (isRoad && !isFlight) return 'road';
  if (isFlight && !isRoad) return 'flight';

  return 'unknown';
};