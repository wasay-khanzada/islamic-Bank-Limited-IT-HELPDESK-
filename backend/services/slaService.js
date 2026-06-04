const SLA_TIMERS = {
  high: 24,    // 24 Hours
  medium: 72,  // 72 Hours (3 Days)
  low: 168,    // 168 Hours (7 Days)
};

exports.calculateSlaDeadline = (priority, fromDate = new Date()) => {
  const hoursToAdd = SLA_TIMERS[priority.toLowerCase()] || SLA_TIMERS.medium;
  const deadline = new Date(fromDate);
  deadline.setHours(deadline.getHours() + hoursToAdd);
  return deadline;
};
