"""Transactional email delivery via SMTP."""
import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import parseaddr
from urllib.parse import quote

from app.core.config import get_settings

logger = logging.getLogger(__name__)

SMTP_HOST = os.environ.get("SMTP_HOST", "").strip()
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USERNAME = os.environ.get("SMTP_USERNAME", "").strip()
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "").strip()
FROM_ADDRESS = os.environ.get("EMAIL_FROM", SMTP_USERNAME).strip()
EMAIL_DELIVERY_DISABLED = os.environ.get("EMAIL_DELIVERY_DISABLED", "false").strip().lower() in {
    "1",
    "true",
    "yes",
    "on",
}


def _looks_like_email(address: str) -> bool:
    _, parsed = parseaddr(address or "")
    return bool(parsed and "@" in parsed and parsed.rsplit("@", 1)[-1].count(".") >= 1)


def _warn_if_invalid_config() -> None:
    if SMTP_USERNAME and not _looks_like_email(SMTP_USERNAME):
        logger.warning(
            "SMTP_USERNAME does not look like a valid email address: %s",
            SMTP_USERNAME,
        )
    if FROM_ADDRESS and not _looks_like_email(FROM_ADDRESS):
        logger.warning(
            "EMAIL_FROM does not look like a valid email address: %s",
            FROM_ADDRESS,
        )


def _send(to: str, subject: str, html: str) -> None:
    _warn_if_invalid_config()
    if EMAIL_DELIVERY_DISABLED:
        logger.info("Email delivery disabled by EMAIL_DELIVERY_DISABLED=true. Skipping email to %s", to)
        return

    if not SMTP_HOST or not SMTP_USERNAME or not SMTP_PASSWORD:
        logger.warning(
            "Email delivery is not configured. Set SMTP_HOST, SMTP_USERNAME, and SMTP_PASSWORD to enable sending emails."
        )
        logger.info("Skipped sending email to %s subject=%s", to, subject)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = FROM_ADDRESS
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(FROM_ADDRESS, [to], msg.as_string())
            logger.info("Sent email to %s subject=%s", to, subject)
    except smtplib.SMTPAuthenticationError as exc:
        logger.error(
            "SMTP authentication failed for %s. Verify SMTP_USERNAME, SMTP_PASSWORD, and use a Gmail app password if needed.",
            SMTP_USERNAME,
        )
        logger.exception("Failed to send email to %s", to)
    except Exception:
        # Don't let an SMTP failure crash the request; log for follow-up.
        logger.exception("Failed to send email to %s", to)


def _email_template(title: str, body_html: str) -> str:
    """Professional responsive email template with TalentLense branding."""
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;min-height:100vh;">
<tr><td align="center" style="padding:40px 16px;">
<table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
<tr><td style="background:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="text-align:center;padding-bottom:24px;">
<div style="width:40px;height:40px;background:linear-gradient(135deg,#4f46e5,#2563eb);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;margin:0 auto 12px;">
<span style="color:#ffffff;font-size:20px;font-weight:700;">TL</span>
</div>
<h1 style="color:#0b1220;font-size:20px;font-weight:700;margin:0;">TalentLense</h1>
</td></tr>
<tr><td style="border-top:1px solid #e6eaf2;padding-top:24px;">
<h2 style="color:#0b1220;font-size:18px;font-weight:600;margin:0 0 16px 0;">{title}</h2>
{body_html}
</td></tr>
<tr><td style="border-top:1px solid #e6eaf2;padding-top:24px;margin-top:24px;text-align:center;">
<p style="color:#94a3b8;font-size:12px;margin:0;">© 2026 TalentLense. All rights reserved.</p>
<p style="color:#94a3b8;font-size:12px;margin:4px 0 0 0;">AI-powered resume screening & candidate ranking</p>
</td></tr>
</table>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>"""


def send_verification_email(to: str, code: str) -> None:
    body = f"""
<p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 20px 0;">
Thanks for creating your TalentLense account. Use the verification code below to activate your account.
</p>
<div style="background:#f0f5ff;border-radius:12px;padding:20px;text-align:center;margin:0 0 20px 0;">
<span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#4f46e5;">{code}</span>
</div>
<p style="color:#94a3b8;font-size:12px;margin:0;text-align:center;">This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
"""
    _send(to, "Verify your email - TalentLense", _email_template("Verify your email address", body))


def send_password_reset_email(to: str, code: str) -> None:
    settings = get_settings()
    frontend_url = settings.FRONTEND_URL.rstrip('/')
    reset_link = f"{frontend_url}/reset-password?email={quote(to)}&code={quote(code)}"
    body = f"""
<p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 20px 0;">
A password reset was requested for your TalentLense account. Click the button below to set a new password.
</p>
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="text-align:center;padding:0 0 20px 0;">
<a href="{reset_link}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 32px;border-radius:10px;">Reset your password</a>
</td></tr>
</table>
<div style="background:#f8fafc;border-radius:12px;padding:16px;margin:0 0 16px 0;text-align:center;">
<p style="color:#475569;font-size:12px;margin:0 0 8px 0;">Or use this code to reset:</p>
<span style="font-size:20px;font-weight:700;letter-spacing:4px;color:#4f46e5;">{code}</span>
</div>
<p style="color:#94a3b8;font-size:12px;margin:0;text-align:center;">This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
"""
    _send(to, "Reset your password - TalentLense", _email_template("Reset your password", body))