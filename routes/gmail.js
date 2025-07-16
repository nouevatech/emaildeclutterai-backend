const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/authMiddleware");
const controller = require("../controllers/gmailController");

router.use(isAuthenticated);

router.get("/list", controller.fetchEmailMetadata);
router.post("/summarize", controller.bulkSummarize);
router.post("/prioritize", controller.prioritizeEmails);
router.post("/delete", controller.bulkDelete);
router.post("/unsubscribe", controller.bulkUnsubscribe);
//router.post("/categorize", controller.categorizeEmails);

module.exports = router;
