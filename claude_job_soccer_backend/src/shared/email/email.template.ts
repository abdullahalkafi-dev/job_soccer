import { TCreateAccount, TResetPassword } from "./email.type";

const themes = {
  "theme-red": {
    primary: "#e74c3c",
    secondary: "#c0392b",
    accent: "#fdeeee",
  },
  "theme-green": {
    primary: "#2ecc71",
    secondary: "#27ae60",
    accent: "#eafaf1",
  },
  "theme-purple": {
    primary: "#9b59b6",
    secondary: "#8e44ad",
    accent: "#f5eef8",
  },
  "theme-orange": {
    primary: "#f39c12",
    secondary: "#d35400",
    accent: "#fef5e7",
  },
  "theme-blue": {
    primary: "#3498db",
    secondary: "#2980b9",
    accent: "#e7f4fd",
  },
};

const createAccount = (values: TCreateAccount) => {
  const theme = themes[values.theme] ?? themes["theme-blue"];

  const data = {
    to: values.email,
    subject: "Verify your account",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      background-color: #f6f6f6;
      color: #333333;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    td {
      border-collapse: collapse;
    }
    .container {
      max-width: 100%;
      width: 100%;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .header {
      background-color: ${theme.primary};
      padding: 30px 20px;
      text-align: center;
    }
    .logo {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .content {
      padding: 30px;
      background-color: #ffffff;
    }
    .greeting {
      color: ${theme.primary};
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 22px;
      font-weight: 600;
    }
    .message {
      margin-bottom: 25px;
      font-size: 16px;
      line-height: 1.6;
    }
    .otp-container {
      text-align: center;
      margin: 30px 0;
    }
    .otp {
      display: inline-block;
      background-color: ${theme.primary};
      color: #ffffff;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 4px;
      padding: 18px 30px;
      border-radius: 12px;
      border: 2px dashed ${theme.secondary};
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      text-transform: uppercase;
    }
    .footer {
      background-color: ${theme.accent};
      padding: 25px 20px;
      text-align: center;
      color: #666666;
      font-size: 14px;
    }
    .security-notice {
      background-color: ${theme.accent};
      border-left: 4px solid ${theme.primary};
      padding: 15px;
      margin-top: 25px;
      border-radius: 4px;
    }
    .disclaimer {
      margin-top: 25px;
      font-size: 14px;
      color: #777777;
    }
    /* Mobile Styles */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .header {
        padding: 25px 15px;
      }
      .logo {
        font-size: 24px;
      }
      .content {
        padding: 25px 15px;
      }
      .greeting {
        font-size: 20px;
      }
      .message {
        font-size: 15px;
      }
      .otp {
        font-size: 20px;
        padding: 15px 20px;
        letter-spacing: 3px;
      }
    }
    @media only screen and (max-width: 480px) {
      .header {
        padding: 20px 10px;
      }
      .logo {
        font-size: 22px;
      }
      .content {
        padding: 20px 10px;
      }
      .greeting {
        font-size: 18px;
      }
      .otp {
        font-size: 18px;
        padding: 12px 15px;
        letter-spacing: 2px;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f6f6;">
  <div class="container">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" valign="top">
          <table class="email-container" border="0" cellpadding="0" cellspacing="0" width="600">
            <!-- Header -->
            <tr>
              <td class="header">
                <h1 class="logo">PlayScout app</h1>
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td class="content">
                <h2 class="greeting">Hello, ${values.name}!</h2>
                <p class="message">Thank you for signing up. Please verify your email address to complete your registration.</p>

                <div class="otp-container">
                  <div class="otp">${values.otp}</div>
                </div>

                <p class="message">If you didn't create an account, you can safely ignore this email.</p>
                
                <div class="security-notice">
                  <p style="margin: 0; font-size: 14px;"><strong>Security Notice:</strong> Never share this OTP with anyone. Our team will never ask for your password or this verification code.</p>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="footer">
                <p style="margin: 0;">© 2025 PlayScout app. All rights reserved.</p>
                <p style="margin: 8px 0 0 0; font-size: 12px;">This email was sent to ${values.email}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`,
  };

  return data;
};

const resetPassword = (values: TResetPassword) => {
  const theme =
    themes[values.theme as keyof typeof themes] ?? themes["theme-blue"];

  const data = {
    to: values.email,
    subject: "Reset your password",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset</title>
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      background-color: #f6f6f6;
      color: #333333;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    td {
      border-collapse: collapse;
    }
    .container {
      max-width: 100%;
      width: 100%;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .header {
      background-color: ${theme.primary};
      padding: 30px 20px;
      text-align: center;
    }
    .logo {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .content {
      padding: 30px;
      background-color: #ffffff;
    }
    .greeting {
      color: ${theme.primary};
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 22px;
      font-weight: 600;
    }
    .message {
      margin-bottom: 25px;
      font-size: 16px;
      line-height: 1.6;
    }
    .otp-container {
      text-align: center;
      margin: 30px 0;
    }
    .otp {
      display: inline-block;
      background-color: ${theme.primary};
      color: #ffffff;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 4px;
      padding: 18px 30px;
      border-radius: 12px;
      border: 2px dashed ${theme.secondary};
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      text-transform: uppercase;
    }
    .footer {
      background-color: ${theme.accent};
      padding: 25px 20px;
      text-align: center;
      color: #666666;
      font-size: 14px;
    }
    .security-notice {
      background-color: ${theme.accent};
      border-left: 4px solid ${theme.primary};
      padding: 15px;
      margin-top: 25px;
      border-radius: 4px;
    }
    .expiration {
      text-align: center;
      margin: 20px 0;
      padding: 12px;
      background-color: #f9f9f9;
      border-radius: 6px;
      font-weight: 600;
      color: #555555;
      border: 1px solid #eeeeee;
    }
    .disclaimer {
      margin-top: 25px;
      font-size: 14px;
      color: #777777;
    }
    /* Mobile Styles */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .header {
        padding: 25px 15px;
      }
      .logo {
        font-size: 24px;
      }
      .content {
        padding: 25px 15px;
      }
      .greeting {
        font-size: 20px;
      }
      .message {
        font-size: 15px;
      }
      .otp {
        font-size: 20px;
        padding: 15px 20px;
        letter-spacing: 3px;
      }
      .expiration {
        font-size: 14px;
      }
    }
    @media only screen and (max-width: 480px) {
      .header {
        padding: 20px 10px;
      }
      .logo {
        font-size: 22px;
      }
      .content {
        padding: 20px 10px;
      }
      .greeting {
        font-size: 18px;
      }
      .otp {
        font-size: 18px;
        padding: 12px 15px;
        letter-spacing: 2px;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f6f6;">
  <div class="container">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" valign="top">
          <table class="email-container" border="0" cellpadding="0" cellspacing="0" width="600">
            <!-- Header -->
            <tr>
              <td class="header">
                <h1 class="logo">PlayScout app</h1>
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td class="content">
                <h2 class="greeting">Hello, ${values.name}!</h2>
                <p class="message">We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
                <p class="message">To reset your password, use the OTP below:</p>

                <div class="otp-container">
                  <div class="otp">${values.otp}</div>
                </div>

                <div class="expiration">
                  This OTP will expire in <strong>${values.expiresIn} minutes</strong>
                </div>

                <div class="security-notice">
                  <p style="margin: 0; font-size: 14px;"><strong>Security Notice:</strong> Never share this OTP with anyone. Our team will never ask for your password or this reset code.</p>
                </div>
                
                <p class="message disclaimer">If you're having trouble with the OTP, please contact our support team.</p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="footer">
                <p style="margin: 0;">© 2025 PlayScout app. All rights reserved.</p>
                <p style="margin: 8px 0 0 0; font-size: 12px;">This email was sent to ${values.email}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`,
  };

  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassword,
};
