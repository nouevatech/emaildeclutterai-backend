const { google } = require('googleapis');
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Gmail API
function getGmailClient(accessToken) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth });
}

// 📥 Fetch Email Metadata
exports.fetchEmailMetadata = async (req, res) => {
  try {
    const gmail = getGmailClient(req.user.accessToken);
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
    });

    const messages = response.data.messages || [];

    const fullMetadata = await Promise.all(
      messages.map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'Date'],
        });

        const headers = detail.data.payload.headers.reduce((acc, h) => {
          acc[h.name] = h.value;
          return acc;
        }, {});

        return {
          id: msg.id,
          subject: headers.Subject || '',
          from: headers.From || '',
          date: headers.Date || '',
        };
      })
    );

    res.json({ emails: fullMetadata });
  } catch (err) {
    console.error('Error fetching Gmail metadata:', err);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
};

// Prioritize Emails by Importance (Lean AI)
exports.prioritizeEmails = async (req, res) => {
  try {
    const emails = req.body.emails;

    const input = emails.map((email, i) => {
      return `${i + 1}. Subject: ${email.subject}\nFrom: ${email.from}`;
    }).join('\n\n');

    const prompt = `
You are an assistant that helps users sort their inbox.
Based only on email subject and sender, prioritize emails from most important to least important.
Label each as: [HIGH], [MEDIUM], or [LOW].

Emails:
${input}

Return JSON like:
[
  { "subject": "Team Update", "from": "manager@company.com", "priority": "HIGH" },
  ...
]
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const jsonText = completion.choices[0].message.content.trim();

    const parsed = JSON.parse(jsonText);
    res.json({ prioritized: parsed });
  } catch (err) {
    console.error('Error prioritizing emails:', err);
    res.status(500).json({ error: 'AI prioritization failed' });
  }
};


exports.bulkSummarize = async (req, res) => {
  try {
    const emails = req.body.emails; // Array of { subject, from }

    const input = emails.map((email, i) => {
      return `${i + 1}. Subject: ${email.subject}\nFrom: ${email.from}`;
    }).join('\n\n');

    const prompt = `
Summarize the following emails in plain English using only subject and sender.
Avoid guessing, be concise.

Emails:
${input}

Return summary like:
[
  "Update from HR about policy changes",
  "Meeting reminder from project team",
  ...
]
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const summaries = completion.choices[0].message.content.trim();
    res.json({ summaries: JSON.parse(summaries) });
  } catch (err) {
    console.error('Error generating summaries:', err);
    res.status(500).json({ error: 'Failed to summarize emails' });
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    const messageIds = req.body.ids; // e.g., [msgId1, msgId2]
    const gmail = getGmailClient(req.user.accessToken);

    await Promise.all(
      messageIds.map((id) =>
        gmail.users.messages.delete({
          userId: 'me',
          id: id,
        })
      )
    );

    res.json({ message: 'Selected emails deleted successfully.' });
  } catch (err) {
    console.error('Error deleting emails:', err);
    res.status(500).json({ error: 'Failed to delete emails' });
  }
};

exports.bulkUnsubscribe = async (req, res) => {
  try {
    const messageIds = req.body.ids;
    const gmail = getGmailClient(req.user.accessToken);

    const links = [];

    for (const id of messageIds) {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id,
        format: 'metadata',
        metadataHeaders: ['List-Unsubscribe'],
      });

      const header = msg.data.payload.headers.find(
        (h) => h.name.toLowerCase() === 'list-unsubscribe'
      );

      if (header) {
        const match = header.value.match(/<(.+?)>/); // extract URL or mailto
        if (match && match[1]) {
          links.push({ id, unsubscribe: match[1] });
        }
      }
    }

    res.json({ links });
  } catch (err) {
    console.error('Error extracting unsubscribe links:', err);
    res.status(500).json({ error: 'Failed to extract unsubscribe links' });
  }
};

