const Business = require("../models/Business.model");

const PLAN_LIMITS = {
  free: { messages: 500, aiReplies: 100 },
  pro: { messages: 10000, aiReplies: 5000 },
};

/**
 * Upgrade business plan
 */
async function upgradePlan(businessId, newPlan) {
  if (!PLAN_LIMITS[newPlan]) {
    throw new Error(`Invalid plan: ${newPlan}`);
  }

  const business = await Business.findById(businessId);
  if (!business) {
    throw new Error("Business not found");
  }

  business.plan = newPlan;
  await business.save();

  return {
    message: `Plan upgraded to ${newPlan}`,
    plan: business.plan,
    limits: PLAN_LIMITS[newPlan],
  };
}

/**
 * Downgrade business plan
 */
async function downgradePlan(businessId, newPlan) {
  if (!PLAN_LIMITS[newPlan]) {
    throw new Error(`Invalid plan: ${newPlan}`);
  }

  const business = await Business.findById(businessId);
  if (!business) {
    throw new Error("Business not found");
  }

  // Check if current usage exceeds new plan limits
  const newLimits = PLAN_LIMITS[newPlan];
  if (
    business.usage.messagesThisMonth > newLimits.messages ||
    business.usage.aiRepliesThisMonth > newLimits.aiReplies
  ) {
    throw new Error(
      "Cannot downgrade: Current usage exceeds new plan limits"
    );
  }

  business.plan = newPlan;
  await business.save();

  return {
    message: `Plan downgraded to ${newPlan}`,
    plan: business.plan,
    limits: PLAN_LIMITS[newPlan],
  };
}

/**
 * Get plan details
 */
function getPlanDetails(plan) {
  return {
    plan,
    limits: PLAN_LIMITS[plan] || PLAN_LIMITS.free,
    features: {
      free: ["500 messages/month", "100 AI replies/month", "Basic analytics"],
      pro: ["10,000 messages/month", "5,000 AI replies/month", "Advanced analytics", "Priority support"],
    }[plan] || [],
  };
}

module.exports = {
  upgradePlan,
  downgradePlan,
  getPlanDetails,
  PLAN_LIMITS,
};
