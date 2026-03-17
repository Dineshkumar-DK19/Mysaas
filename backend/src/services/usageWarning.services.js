function checkUsageWarnings(business, limits) {
  if (!business?.usage || !limits) return null;

  const msgPercent =
    (business.usage.messagesThisMonth / limits.messages) * 100;

  const aiPercent =
    (business.usage.aiRepliesThisMonth / limits.aiReplies) * 100;

  if (!business.usage.warned80 && (msgPercent >= 80 || aiPercent >= 80)) {
    business.usage.warned80 = true;
    return "⚠️ You’ve used 80% of your monthly quota.";
  }

  if (!business.usage.warned100 && (msgPercent >= 100 || aiPercent >= 100)) {
    business.usage.warned100 = true;
    return "🚫 Monthly limit reached. Upgrade to continue.";
  }

  return null;
}

module.exports = { checkUsageWarnings };
