const { google } = require("googleapis");
const { VertexAI } = require("@google-cloud/vertexai");

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: "us-central1",
});
const model = vertexAI.getGenerativeModel({ model: "gemini-1.5-pro" });

function getGmailClient(accessToken) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth });
}

exports.fetchEmailMetadata = async (req, res) => {
  try {
    const gmail = getGmailClient(req.user.accessToken);
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
    });
    const messages = response.data.messages || [];

    const fullMetadata = await Promise.all(
      messages.map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "metadata",
          metadataHeaders: ["Subject", "From", "Date"],
        });

        const headers = detail.data.payload.headers.reduce((acc, h) => {
          acc[h.name] = h.value;
          return acc;
        }, {});

        return {
          id: msg.id,
          subject: headers.Subject || "",
          from: headers.From || "",
          date: headers.Date || "",
        };
      })
    );

    res.json({ emails: fullMetadata });
  } catch (err) {
    console.error("Error fetching Gmail metadata:", err);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
};

exports.bulkSummarize = async (req, res) => {
  try {
    const emails = req.body.emails;
    const input = emails
      .map((e, i) => `${i + 1}. Subject: ${e.subject}\nFrom: ${e.from}`)
      .join("\n\n");
    const prompt = `Summarize the following emails using only subject and sender:\n\n${input}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const text = result.response.candidates[0].content.parts[0].text;
    res.json({ summaries: JSON.parse(text) });
  } catch (err) {
    console.error("Summarize error:", err);
    res.status(500).json({ error: "Summarize failed" });
  }
};

exports.prioritizeEmails = async (req, res) => {
  try {
    const emails = req.body.emails;
    const input = emails
      .map((e, i) => `${i + 1}. Subject: ${e.subject}\nFrom: ${e.from}`)
      .join("\n\n");
    const prompt = `Label each email as HIGH, MEDIUM, or LOW priority based on subject and sender.\n\n${input}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const text = result.response.candidates[0].content.parts[0].text;
    res.json({ prioritized: JSON.parse(text) });
  } catch (err) {
    console.error("Prioritize error:", err);
    res.status(500).json({ error: "Prioritization failed" });
  }
};

exports.categorizeEmails = async (req, res) => {
  try {
    const emails = req.body.emails;
    const input = emails
      .map((e, i) => `${i + 1}. Subject: ${e.subject}\nFrom: ${e.from}`)
      .join("\n\n");
    const prompt = `Group emails into categories: Priority, CC'd, Newsletters, Socials, Promotions, Unknown. Return count + short detail.\n\n${input}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const text = result.response.candidates[0].content.parts[0].text;
    res.json({ categories: JSON.parse(text) });
  } catch (err) {
    console.error("Categorize error:", err);
    res.status(500).json({ error: "Categorization failed" });
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    const ids = req.body.ids;
    const gmail = getGmailClient(req.user.accessToken);
    await Promise.all(
      ids.map((id) => gmail.users.messages.delete({ userId: "me", id }))
    );
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};

exports.bulkUnsubscribe = async (req, res) => {
  try {
    const ids = req.body.ids;
    const gmail = getGmailClient(req.user.accessToken);
    const links = [];

    for (const id of ids) {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id,
        format: "metadata",
        metadataHeaders: ["List-Unsubscribe"],
      });

      const header = msg.data.payload.headers.find(
        (h) => h.name.toLowerCase() === "list-unsubscribe"
      );
      if (header) {
        const match = header.value.match(/<(.+?)>/);
        if (match && match[1]) links.push({ id, unsubscribe: match[1] });
      }
    }

    res.json({ links });
  } catch (err) {
    console.error("Unsubscribe error:", err);
    res.status(500).json({ error: "Unsubscribe failed" });
  }
};
