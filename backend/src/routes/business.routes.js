const express = require("express");
const auth = require("../middleware/auth.middleware");
const { validateObjectId } = require("../middleware/validate.middleware");
const {
  createBusiness,
  getMyBusiness,
  getSettings,
  updateSettings,
  addRules,
  getRules,
  updateRule,
  deleteRule,
  getBusinessAnalytics,
  getUsage,
  upgradePlan,
  getPlanDetails,
  updateWhatsAppPhoneNumber,
} = require("../controllers/business.controller");

const router = express.Router();

router.post("/", auth, createBusiness);
router.get("/", auth, getMyBusiness);
router.get("/settings", auth, getSettings);
router.put("/settings", auth, updateSettings);
router.post("/rules", auth, addRules);
router.get("/rules", auth, getRules);
router.put("/rules/:ruleId", auth, validateObjectId, updateRule);
router.delete("/rules/:ruleId", auth, validateObjectId, deleteRule);
router.get("/analytics", auth, getBusinessAnalytics);
router.get("/usage", auth, getUsage);
router.post("/plan/upgrade", auth, upgradePlan);
router.get("/plan", auth, getPlanDetails);
router.put("/whatsapp/phone-number", auth, updateWhatsAppPhoneNumber);
module.exports = router;
