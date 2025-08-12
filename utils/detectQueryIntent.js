export const detectQueryIntent = (message) => {
  const roadKeywords = [
    'bus', 'train', 'subway', 'transit', 'commute', 'station',
    'stop', 'gtfs', 'go transit', 'up express', 'rail'
  ];

  const flightKeywords = [
    'flight', 'airport', 'airline', 'plane', 'boarding', 'arrival',
    'departure', 'terminal', 'aviation'
  ];

  const lowerMessage = message.toLowerCase();
  const isRoad = roadKeywords.some(keyword => lowerMessage.includes(keyword));
  const isFlight = flightKeywords.some(keyword => lowerMessage.includes(keyword));

  if (isRoad && !isFlight) return 'road';
  if (isFlight && !isRoad) return 'flight';
  return 'unknown';
};