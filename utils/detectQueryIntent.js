export const detectQueryIntent = (message) => {
  const roadKeywords = [
    'bus', 'train', 'subway', 'transit', 'commute', 'station',
    'stop', 'gtfs', 'go transit', 'up express', 'rail', 'streetcar',
    'tram', 'metro', 'trolley', 'departure', 'arrival', 'schedule',
    'timetable', 'platform', 'route', 'line', 'service', 'connection'
  ];

  const flightKeywords = [
    'flight', 'airport', 'airline', 'plane', 'boarding', 'arrival',
    'departure', 'terminal', 'aviation', 'aircraft', 'runway', 'gate',
    'takeoff', 'landing', 'pilot', 'crew', 'passenger', 'ticket',
    'booking', 'check-in', 'luggage', 'baggage', 'security'
  ];

  const lowerMessage = message.toLowerCase();
  const isRoad = roadKeywords.some(keyword => lowerMessage.includes(keyword));
  const isFlight = flightKeywords.some(keyword => lowerMessage.includes(keyword));

  // Handle edge cases where both might match
  const roadScore = roadKeywords.filter(keyword => lowerMessage.includes(keyword)).length;
  const flightScore = flightKeywords.filter(keyword => lowerMessage.includes(keyword)).length;

  if (roadScore > flightScore) return 'road';
  if (flightScore > roadScore) return 'flight';
  if (isRoad && isFlight && roadScore === flightScore) return 'unknown';
  
  return 'unknown';
};
