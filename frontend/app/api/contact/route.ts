import { NextResponse } from "next/server";

/**
 * POST /api/contact — accept marketing-site contact form submissions and
 * forward them to hello@genuflow.com via Resend.
 *
 * When `RESEND_API_KEY` is unset, the endpoint logs the submission to
 * stdout and returns 200 so the form remains testable locally without a
 * real account. This mirrors the placeholder pattern used by the
 * billing / Stripe surface.
 */

const TO_ADDRESS = "hello@genuflow.com";
const FROM_ADDRESS = "Genuflow Contact <noreply@genuflow.com>";

interface ContactBody {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
}

interface Validated {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function validate(body: ContactBody): { ok: true; value: Validated } | { ok: false; error: string } {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name) return { ok: false, error: "name is required" };
  if (name.length > 200) return { ok: false, error: "name is too long" };

  if (!email) return { ok: false, error: "email is required" };
  if (email.length > 254 || !email.includes("@") || !email.includes(".")) {
    return { ok: false, error: "a valid email is required" };
  }

  if (!subject) return { ok: false, error: "subject is required" };
  if (subject.length > 200) return { ok: false, error: "subject is too long" };

  if (!message) return { ok: false, error: "message is required" };
  if (message.length > 5000) {
    return { ok: false, error: "message must be at most 5000 characters" };
  }

  return { ok: true, value: { name, email, subject, message } };
}

function htmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmail(v: Validated): { subject: string; html: string; text: string } {
  const subject = `[Contact] ${v.subject}`;
  const text = [
    `From: ${v.name} <${v.email}>`,
    `Subject: ${v.subject}`,
    "",
    v.message,
  ].join("\n");
  const html = `
    <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; color: #111;">
      <h2 style="margin:0 0 16px;">New contact form submission</h2>
      <p style="margin:0 0 4px;"><strong>From:</strong> ${htmlEscape(v.name)} &lt;${htmlEscape(v.email)}&gt;</p>
      <p style="margin:0 0 16px;"><strong>Subject:</strong> ${htmlEscape(v.subject)}</p>
      <pre style="white-space: pre-wrap; padding: 16px; background: #f5f5f5; border-radius: 8px; font-family: inherit;">${htmlEscape(v.message)}</pre>
    </div>
  `;
  return { subject, html, text };
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const result = validate(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const v = result.value;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Placeholder mode. Log to stdout so the submission isn't lost
    // during local development and return success so the form
    // exercises the happy path.
    console.log(
      JSON.stringify({
        event: "contact.placeholder",
        from: { name: v.name, email: v.email },
        subject: v.subject,
        message_length: v.message.length,
      }),
    );
    return NextResponse.json({ ok: true, placeholder: true });
  }

  const { subject, html, text } = buildEmail(v);
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: TO_ADDRESS,
        reply_to: v.email,
        subject,
        html,
        text,
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      console.error(
        JSON.stringify({
          event: "contact.resend_failure",
          status: resp.status,
          body: detail.slice(0, 500),
        }),
      );
      return NextResponse.json(
        { error: "failed to send message; please try again later" },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(
      JSON.stringify({
        event: "contact.resend_exception",
        error: e instanceof Error ? e.message : String(e),
      }),
    );
    return NextResponse.json(
      { error: "failed to send message; please try again later" },
      { status: 502 },
    );
  }
}
