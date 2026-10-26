import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from utils.api_error import ApiError


def send_otp_email(to_email: str, otp: str, purpose: str = "reset_password") -> None:
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("EMAIL_USER") or os.getenv("SMTP_USER")
    raw_code = os.getenv("EMAIL_CODE") or os.getenv("SMTP_PASSWORD") or ""
    smtp_password = raw_code.replace(" ", "")
    from_name = os.getenv("SMTP_FROM_NAME", "Mộc Trầm Store").strip("\"'")

    if not smtp_user:
        raise ApiError(
            status_code=500,
            message="Hệ thống chưa cấu hình tài khoản email người gửi (EMAIL_USER trong .env).",
        )

    if not smtp_password:
        raise ApiError(
            status_code=500,
            message="Hệ thống chưa cấu hình mật khẩu email người gửi (EMAIL_CODE trong .env).",
        )

    if purpose == "register":
        subject = f"[{from_name}] Mã xác thực đăng ký tài khoản"
        section_title = "Xác thực đăng ký tài khoản"
        greeting_text = (
            f"Xin chào,\n\n"
            f"Cảm ơn bạn đã đăng ký tài khoản tại {from_name}.\n"
            f"Mã OTP kích hoạt tài khoản của bạn là: {otp}\n\n"
            f"Mã này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.\n"
            f"Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email.\n\n"
            f"Trân trọng,\n{from_name}"
        )
        intro_html = f"Xin chào, cảm ơn bạn đã đăng ký tài khoản tại <strong>{from_name}</strong> với email <strong>{to_email}</strong>."
        instruction_html = "Dưới đây là mã xác thực OTP để kích hoạt tài khoản của bạn. Mã này có hiệu lực trong vòng <strong>5 phút</strong>:"
        footer_note_html = (
            "Nếu bạn không thực hiện đăng ký này, hãy yên tâm bỏ qua email này."
        )
    else:
        subject = f"[{from_name}] Mã xác thực đặt lại mật khẩu"
        section_title = "Yêu cầu đặt lại mật khẩu"
        greeting_text = (
            f"Xin chào,\n\n"
            f"Bạn vừa yêu cầu đặt lại mật khẩu tại {from_name}.\n"
            f"Mã OTP của bạn là: {otp}\n\n"
            f"Mã này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.\n"
            f"Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email.\n\n"
            f"Trân trọng,\n{from_name}"
        )
        intro_html = f"Xin chào, chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email <strong>{to_email}</strong>."
        instruction_html = "Dưới đây là mã xác thực OTP của bạn. Mã này có hiệu lực trong vòng <strong>5 phút</strong>:"
        footer_note_html = "Nếu bạn không thực hiện yêu cầu này, hãy yên tâm bỏ qua email này hoặc liên hệ ngay với chúng tôi để bảo vệ tài khoản."

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{from_name} <{smtp_user}>"
    msg["To"] = to_email

    plain_text = greeting_text

    html_content = f"""
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <title>Mã xác thực OTP - {from_name}</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f7f5f0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #eae6df;">
            <tr>
                <td style="background-color: #3b2a20; padding: 28px 20px; text-align: center;">
                    <h1 style="margin: 0; color: #d4af37; font-size: 24px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">
                        {from_name}
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #e8dcc4; font-size: 13px;">Thương mại điện tử & Tinh hoa Trầm Hương</p>
                </td>
            </tr>
            <tr>
                <td style="padding: 32px 30px;">
                    <h2 style="margin: 0 0 16px 0; color: #222222; font-size: 20px; font-weight: 600;">
                        {section_title}
                    </h2>
                    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #555555;">
                        {intro_html}
                    </p>
                    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #555555;">
                        {instruction_html}
                    </p>
                    <div style="text-align: center; margin: 28px 0;">
                        <div style="display: inline-block; background-color: #fcf9f2; border: 2px dashed #d4af37; border-radius: 8px; padding: 16px 36px;">
                            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #8c6239; font-family: 'Courier New', Courier, monospace;">
                                {otp}
                            </span>
                        </div>
                    </div>
                    <div style="background-color: #fff8e6; border-left: 4px solid #d4af37; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0; font-size: 13px; color: #7a5c1e; line-height: 1.5;">
                            <strong>Lưu ý bảo mật:</strong> Tuyệt đối không cung cấp mã OTP này cho bất kỳ ai, kể cả nhân viên hỗ trợ của {from_name}.
                        </p>
                    </div>
                    <p style="margin: 20px 0 0 0; font-size: 13px; line-height: 1.6; color: #777777;">
                        {footer_note_html}
                    </p>
                </td>
            </tr>
            <tr>
                <td style="background-color: #faf8f5; padding: 20px; text-align: center; border-top: 1px solid #f0ebe1;">
                    <p style="margin: 0; font-size: 12px; color: #999999;">
                        © {from_name}. Mọi quyền được bảo lưu.
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    msg.attach(MIMEText(plain_text, "plain", "utf-8"))
    msg.attach(MIMEText(html_content, "html", "utf-8"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
            print(f"[EMAIL SUCCESS] Đã gửi mã OTP đến {to_email}")
    except smtplib.SMTPAuthenticationError as e:
        print(f"[EMAIL ERROR] Xác thực SMTP thất bại: {e}")
        raise ApiError(
            status_code=500,
            message="Xác thực email gửi thất bại. Vui lòng kiểm tra lại EMAIL_USER và EMAIL_CODE trong file .env.",
        ) from None
    except Exception as e:
        print(f"[EMAIL ERROR] Không thể gửi email: {e}")
        raise ApiError(
            status_code=500,
            message="Không thể gửi email xác thực. Vui lòng thử lại sau.",
        ) from None
