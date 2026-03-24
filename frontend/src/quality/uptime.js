const minutesFromSegment = (segment) => {
  if (!segment) {
    return 0;
  }

  if (typeof segment.durationMinutes === 'number' && Number.isFinite(segment.durationMinutes)) {
    return Math.max(segment.durationMinutes, 0);
  }

  const start = segment.start instanceof Date ? segment.start.getTime() : Date.parse(segment.start);
  const end = segment.end instanceof Date ? segment.end.getTime() : Date.parse(segment.end);

  if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
    return (end - start) / 60000;
  }

  return 0;
};

const isUpSegment = (segment) => {
  if (!segment) {
    return false;
  }
  if (typeof segment.isUp === 'boolean') {
    return segment.isUp;
  }
  if (typeof segment.status === 'string') {
    return segment.status.toLowerCase() === 'up';
  }
  return true;
};

/**
 * Aggregates uptime for ISO 13485 / 14971 reliability evidence.
 */
const calculateUptimePercentage = (segments) => {
  if (!Array.isArray(segments) || segments.length === 0) {
    return {
      uptimePercent: 0,
      totalMinutes: 0,
      uptimeMinutes: 0,
      downtimeMinutes: 0
    };
  }

  let totalMinutes = 0;
  let uptimeMinutes = 0;

  segments.forEach((segment) => {
    const durationMinutes = minutesFromSegment(segment);
    if (!durationMinutes) {
      return;
    }
    totalMinutes += durationMinutes;
    if (isUpSegment(segment)) {
      uptimeMinutes += durationMinutes;
    }
  });

  const downtimeMinutes = Math.max(totalMinutes - uptimeMinutes, 0);
  const uptimePercent = totalMinutes > 0 ? (uptimeMinutes / totalMinutes) * 100 : 0;

  return {
    uptimePercent,
    totalMinutes,
    uptimeMinutes,
    downtimeMinutes
  };
};

export { calculateUptimePercentage };
