/*const express = require('express');
const { google } = require('googleapis');

const router = express.Router();

// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/auth/google');
}

// Gmail fetch route
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    const accessToken = req.user.accessToken;

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Get list of recent email IDs (only metadata, no body)
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
    });

    const messages = listRes.data.messages || [];

    const emails = await Promise.all(
      messages.map(async (msg) => {
        const msgRes = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'Date'],
        });

        const headers = msgRes.data.payload.headers;
        const email = {
          id: msg.id,
          subject: headers.find((h) => h.name === 'Subject')?.value || '',
          from: headers.find((h) => h.name === 'From')?.value || '',
          date: headers.find((h) => h.name === 'Date')?.value || '',
        };

        return email;
      })
    );

    res.json({ user: req.user.name, emails });
  } catch (err) {
    console.error('Error fetching emails:', err);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

module.exports = router;
*/