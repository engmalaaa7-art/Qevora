import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, ENV

logger = logging.getLogger("qevora.email")

class EmailService:
    @staticmethod
    async def send_email(to_email: str, subject: str, html_content: str):
        if not to_email:
            logger.error("No recipient email specified.")
            return

        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = SMTP_FROM
        message["To"] = to_email

        html_part = MIMEText(html_content, "html", "utf-8")
        message.attach(html_part)

        if ENV == "development" and SMTP_HOST == "localhost" and SMTP_PORT == 1025:
            # Connect to Mailhog without authentication
            try:
                await aiosmtplib.send(
                    message,
                    hostname=SMTP_HOST,
                    port=SMTP_PORT,
                    use_tls=False
                )
                logger.info(f"Dev verification email sent to {to_email} via Mailhog.")
            except Exception as e:
                logger.error(f"Failed to dispatch dev email to {to_email}: {e}")
        else:
            # Production SMTP dispatch with authentication
            if not SMTP_USER or not SMTP_PASS:
                logger.warning(f"SMTP authentication credentials missing. Simulating delivery to {to_email}...")
                return

            try:
                await aiosmtplib.send(
                    message,
                    hostname=SMTP_HOST,
                    port=SMTP_PORT,
                    username=SMTP_USER,
                    password=SMTP_PASS,
                    use_tls=True if SMTP_PORT == 465 else False,
                    start_tls=True if SMTP_PORT == 587 else False
                )
                logger.info(f"Production email dispatched successfully to {to_email}.")
            except Exception as e:
                logger.error(f"Production SMTP sending failed: {e}")

    @staticmethod
    async def send_verification_email(to_email: str, verification_token: str):
        subject = "Verify your Qevora account"
        verification_link = f"https://qevora.com/verify?token={verification_token}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #0c0a0f; color: #f3f4f6; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #13111a; border: 1px solid #2d2640; border-radius: 8px; padding: 40px;">
                    <h2 style="color: #a78bfa; text-align: center;">Welcome to Qevora</h2>
                    <p>Thank you for signing up. Please verify your email address to complete your account setup:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{verification_link}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a>
                    </div>
                    <p style="font-size: 12px; color: #9ca3af; text-align: center;">If you did not create a Qevora account, please ignore this email.</p>
                </div>
            </body>
        </html>
        """
        await EmailService.send_email(to_email, subject, html_content)

    @staticmethod
    async def send_password_reset_email(to_email: str, reset_token: str):
        subject = "Reset your Qevora Password"
        reset_link = f"https://qevora.com/reset-password?token={reset_token}"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #0c0a0f; color: #f3f4f6; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #13111a; border: 1px solid #2d2640; border-radius: 8px; padding: 40px;">
                    <h2 style="color: #a78bfa; text-align: center;">Password Reset Request</h2>
                    <p>You requested a password reset for your Qevora account. Click the button below to configure a new password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{reset_link}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
                    </div>
                    <p style="font-size: 12px; color: #9ca3af; text-align: center;">This link will expire in 1 hour. If you didn't request a reset, you can safely ignore this email.</p>
                </div>
            </body>
        </html>
        """
        await EmailService.send_email(to_email, subject, html_content)

    @staticmethod
    async def send_welcome_email(to_email: str, full_name: str):
        subject = "Welcome to Qevora!"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #0c0a0f; color: #f3f4f6; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #13111a; border: 1px solid #2d2640; border-radius: 8px; padding: 40px;">
                    <h2 style="color: #a78bfa; text-align: center;">Welcome, {full_name}!</h2>
                    <p>We're thrilled to have you join Qevora, the AI Website Operating System.</p>
                    <p>Get started today by creating your first project and unleashing the generation engine to build premium bilingual websites in seconds.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://qevora.com/dashboard" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
                    </div>
                </div>
            </body>
        </html>
        """
        await EmailService.send_email(to_email, subject, html_content)

    @staticmethod
    async def send_project_published_email(to_email: str, project_name: str, live_url: str):
        subject = f"Your site '{project_name}' is live!"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #0c0a0f; color: #f3f4f6; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #13111a; border: 1px solid #2d2640; border-radius: 8px; padding: 40px;">
                    <h2 style="color: #a78bfa; text-align: center;">Congratulations! Your site is live</h2>
                    <p>Your project <strong>{project_name}</strong> was successfully compiled and published on Qevora nodes.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{live_url}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">View Live Site</a>
                    </div>
                    <p>Live URL: <a href="{live_url}" style="color: #a78bfa;">{live_url}</a></p>
                </div>
            </body>
        </html>
        """
        await EmailService.send_email(to_email, subject, html_content)
