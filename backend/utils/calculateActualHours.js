exports.calculateActualHours = (activeSessions = []) => {
  const totalMilliseconds = activeSessions.reduce((sum, session) => {
    if (session.from && session.to) {
      return sum + (new Date(session.to) - new Date(session.from));
    }
    return sum;
  }, 0);

  // Convert ms → hours and round to 2 decimals
  return parseFloat((totalMilliseconds / (1000 * 60 * 60)).toFixed(2));
};
