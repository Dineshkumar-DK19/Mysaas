function resetUsageIfNeeded(business) {
  if (!business || !business.usage) return;

  const now = new Date();
  const last = new Date(business.usage.lastReset || now);

  if (
    now.getMonth() !== last.getMonth() ||
    now.getFullYear() !== last.getFullYear()
  ) {
    business.usage.messagesThisMonth = 0;
    business.usage.aiRepliesThisMonth = 0;
    business.usage.warned80 = false;
    business.usage.warned100 = false;
    business.usage.lastReset = now;
  }
}

module.exports = { resetUsageIfNeeded };
