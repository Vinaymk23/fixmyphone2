/**
 * Cloud Functions for fixmyPhone — email notifications on new leads.
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const { Resend } = require("resend");

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

const APP_ID = "fixmyphone-website-889b5";
const NOTIFY_EMAIL = "support@gofixmyphone.com";
const FROM_EMAIL = "fixmyPhone Alerts <onboarding@resend.dev>";

function escapeHtml(value) {
  return String(value ?? "N/A").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

exports.notifyOnNewQuote = onDocumentCreated(
  {
    document: `artifacts/${APP_ID}/public/data/quoteRequests/{quoteId}`,
    secrets: [RESEND_API_KEY],
    region: "us-central1",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const data = snap.data();
    const quoteId = event.params.quoteId;

    const name = escapeHtml(data.name);
    const phone = escapeHtml(data.phone);
    const email = escapeHtml(data.email);
    const device = escapeHtml(data.device);
    const services = escapeHtml(data.services || data.message);

    const resend = new Resend(RESEND_API_KEY.value());

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [NOTIFY_EMAIL],
      reply_to: data.email || undefined,
      subject: `New Repair Request — ${device !== "N/A" ? device : "fixmyPhone"}`,
      html: `
        <h2 style="margin:0 0 16px;">New quote / contact request</h2>
        <table cellpadding="6" style="border-collapse:collapse;">
          <tr><td><strong>Name</strong></td><td>${name}</td></tr>
          <tr><td><strong>Phone</strong></td><td><a href="tel:${phone}">${phone}</a></td></tr>
          <tr><td><strong>Email</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td><strong>Device</strong></td><td>${device}</td></tr>
          <tr><td><strong>Issue / Services</strong></td><td>${services}</td></tr>
          <tr><td><strong>Quote ID</strong></td><td>${quoteId}</td></tr>
        </table>
        <p style="margin-top:16px;">
          <a href="https://gofixmyphone.com/track.html?id=${quoteId}">View / track this request</a>
          &nbsp;|&nbsp;
          <a href="https://gofixmyphone.com/admin.html">Open admin dashboard</a>
        </p>
      `,
    });
  },
);
