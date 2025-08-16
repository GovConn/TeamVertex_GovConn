from app.core.config import MJ_APIKEY_PRIVATE, MJ_APIKEY_PUBLIC
from mailjet_rest import Client
from typing import List
from app.utils.logger import logger
import os

api_key = os.getenv("MJ_APIKEY_PUBLIC", MJ_APIKEY_PUBLIC)
api_secret = os.getenv("MJ_APIKEY_PRIVATE", MJ_APIKEY_PRIVATE)

mailjet = Client(auth=(api_key, api_secret))
        

def send(
    sender_name: str,
    recipient_email: str,
    recipient_name: str,
    subject: str,
    html_content: str,
    sender_email: str = "roarofdeath123@gmail.com",
) -> dict:
    try:
        recipients = [
            {
                'Email': recipient_email,
                'Name': recipient_name,
            }
        ]

        data = {
            'FromEmail': sender_email,
            'FromName': sender_name,
            'Subject': subject,
            'Text-part': 'Hello, welcome to our service!',
            'Html-part': html_content,
            'Recipients': recipients,
        }

        result = mailjet.send.create(data=data)
        logger.info(f"mailjet response: {result.status_code} - {result.json()}")
        return result.json()
    except Exception as e:
        logger.error(f"Failed to send email via Mailjet: {e}.")
        raise

def get_temporary_password_email_html(recipient_name: str, temp_password: str) -> str:
    return f"""
    <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background-color: #f4f6f8;
                    margin: 0;
                    padding: 0;
                    color: #333333;
                }}
                .container {{
                    max-width: 600px;
                    background-color: #ffffff;
                    margin: 40px auto;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }}
                h1 {{
                    color: #0a5eb7;
                    font-size: 24px;
                    margin-bottom: 20px;
                }}
                p {{
                    font-size: 16px;
                    line-height: 1.5;
                    margin: 15px 0;
                }}
                .password-box {{
                    background-color: #e1f0ff;
                    border: 2px dashed #0a5eb7;
                    border-radius: 6px;
                    padding: 15px;
                    font-size: 20px;
                    font-weight: bold;
                    color: #0a5eb7;
                    text-align: center;
                    letter-spacing: 4px;
                    margin: 25px 0;
                }}
                .footer {{
                    margin-top: 30px;
                    font-size: 14px;
                    color: #888888;
                    text-align: center;
                }}
                @media only screen and (max-width: 620px) {{
                    .container {{
                        width: 90%;
                        padding: 20px;
                    }}
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Welcome, {recipient_name}!</h1>
                <p>Thank you for registering with GovConn Service.</p>
                <p>Your temporary password is:</p>
                <div class="password-box">{temp_password}</div>
                <p>Please use this password to log in and make sure to change it as soon as possible to keep your account secure.</p>
                <p><strong>Note:</strong> This password is valid for 24 hours.</p>
                <p>If you did not initiate this registration, please contact our support team immediately.</p>
                <div class="footer">
                    Best regards,<br>
                    GovConn Service Team
                </div>
            </div>
        </body>
    </html>
    """

def get_password_change_email_html(recipient_name: str) -> str:
    return f"""
    <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background-color: #f4f6f8;
                    margin: 0;
                    padding: 0;
                    color: #333333;
                }}
                .container {{
                    max-width: 600px;
                    background-color: #ffffff;
                    margin: 40px auto;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }}
                h1 {{
                    color: #0a5eb7;
                    font-size: 24px;
                    margin-bottom: 20px;
                }}
                p {{
                    font-size: 16px;
                    line-height: 1.5;
                    margin: 15px 0;
                }}
                .password-box {{
                    background-color: #e1f0ff;
                    border: 2px dashed #0a5eb7;
                    border-radius: 6px;
                    padding: 15px;
                    font-size: 20px;
                    font-weight: bold;
                    color: #0a5eb7;
                    text-align: center;
                    letter-spacing: 4px;
                    margin: 25px 0;
                }}
                .footer {{
                    margin-top: 30px;
                    font-size: 14px;
                    color: #888888;
                    text-align: center;
                }}
                @media only screen and (max-width: 620px) {{
                    .container {{
                        width: 90%;
                        padding: 20px;
                    }}
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Password Change Confirmation</h1>
                <p>Dear {recipient_name},</p>
                <p>Your password has been changed successfully.</p>
                <p>If you did not initiate this change, please contact our support team immediately.</p>
                <div class="footer">
                    Best regards,<br>
                    GovConn Service Team
                </div>
            </div>
        </body>
    </html>
    """

# if __name__ == "__main__":
#     # Test the email HTML generation and send it
#     test_html = get_temporary_password_email_html("John Doe", "TempPass123")
#     send(
#         sender_name="GovConn Support",
#         recipient_email="1pawanpinsara@gmail.com",
#         recipient_name="John Doe",
#         subject="Your Temporary Password",
#         html_content=test_html
#     )
