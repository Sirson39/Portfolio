const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { message: "Method not allowed." });
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { message: "Invalid request body." });
  }

  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim();
  const message = String(payload.message || "").trim();

  if (!name || !email || !message) {
    return jsonResponse(400, { message: "Please fill in all fields." });
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return jsonResponse(500, {
      message:
        "Email service is not configured yet. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in Netlify environment variables.",
    });
  }

  if (pass === "YOUR_GMAIL_APP_PASSWORD") {
    return jsonResponse(500, {
      message:
        "SMTP_PASS is still the placeholder value. Replace it with your real Gmail App Password.",
    });
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    auth: {
      user,
      pass,
    },
  });

  const subject = `Portfolio message from ${name}`;
  const text = [`Name: ${name}`, `Email: ${email}`, "", message].join("\n");
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2 style="margin: 0 0 12px;">New portfolio message</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || user,
      to: process.env.CONTACT_TO_EMAIL || "sirsonsharma39@gmail.com",
      replyTo: email,
      subject,
      text,
      html,
    });

    return jsonResponse(200, { ok: true });
  } catch (error) {
    console.error("Email send failed:", error);
    return jsonResponse(500, {
      message: error?.message || "Email could not be sent right now.",
    });
  }
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
