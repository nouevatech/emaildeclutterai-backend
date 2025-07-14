const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const {
  fetchEmailMetadata,
  bulkSummarize,
  bulkDelete,
  bulkUnsubscribe,
  prioritizeEmails
} = require('../controllers/gmailController');

// Middleware: protect routes
router.use(isAuthenticated);

// Fetch email subjects and headers
router.get('/list', fetchEmailMetadata);

// Prioritize emails by importance (Lean AI)
router.post('/prioritize', prioritizeEmails);

//  Bulk summarize selected emails
router.post('/summarize', bulkSummarize);

//  Bulk delete selected email IDs
router.post('/delete', bulkDelete);

//  Bulk unsubscribe from senders
router.post('/unsubscribe', bulkUnsubscribe);

module.exports = router;
