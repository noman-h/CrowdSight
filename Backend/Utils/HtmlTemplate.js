exports.forgetotp=(username,otp)=>{
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your OTP Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: 'Segoe UI', Arial, sans-serif;">

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7; padding: 40px 0;">
        <tr>
            <td align="center">

                <!-- Main Container -->
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); max-width: 600px; width: 100%;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <!-- Logo -->
                                       CrowdSight
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            
                            <!-- Icon -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 25px;">
                                        <table role="presentation" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="background-color: #f0efff; width: 70px; height: 70px; border-radius: 50%; text-align: center; vertical-align: middle;">
                                                    <span style="font-size: 32px; line-height: 70px;">🔐</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Title -->
                            <h1 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 24px; font-weight: 700; text-align: center;">
                                Password Reset Request
                            </h1>

                            <!-- Message -->
                            <p style="margin: 0 0 30px 0; color: #666666; font-size: 15px; line-height: 24px; text-align: center;">
                                Hi <strong>${username}</strong>,<br>
                                We received a request to reset your password. Use the verification code below to proceed. This code is valid for <strong>10 minutes</strong>.
                            </p>

                            <!-- OTP Code Box -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 10px 0 30px 0;">
                                        <table role="presentation" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="background-color: #f8f7ff; border: 2px dashed #764ba2; border-radius: 10px; padding: 20px 40px;">
                                                    <span style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #667eea; font-family: 'Courier New', monospace;">
                                                       ${otp}
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Expiry Notice -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <p style="margin: 0; color: #999999; font-size: 13px;">
                                            ⏱️ This code will expire in <strong style="color: #764ba2;">10 minutes</strong>
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Divider -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="border-top: 1px solid #eeeeee; padding-top: 25px;">
                                        <p style="margin: 0 0 10px 0; color: #999999; font-size: 13px; line-height: 20px; text-align: center;">
                                            If you didn't request this password reset, please ignore this email or contact support if you have concerns.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Security Note -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                                <tr>
                                    <td style="background-color: #fff9e6; border-radius: 8px; padding: 15px 20px;">
                                        <p style="margin: 0; color: #997404; font-size: 12px; line-height: 18px; text-align: center;">
                                            🛡️ <strong>Security tip:</strong> Never share this code with anyone. Our team will never ask for your OTP.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f8f8; padding: 30px; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
                                © 2024 YourCompany. All rights reserved.
                            </p>
                            <p style="margin: 0 0 15px 0; color: #999999; font-size: 12px;">
                                123 Business Street, City, Country
                            </p>
                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                <tr>
                                    <td style="padding: 0 8px;">
                                        <a href="#" style="color: #667eea; text-decoration: none; font-size: 12px;">Help Center</a>
                                    </td>
                                    <td style="color: #cccccc;">|</td>
                                    <td style="padding: 0 8px;">
                                        <a href="#" style="color: #667eea; text-decoration: none; font-size: 12px;">Privacy Policy</a>
                                    </td>
                                    <td style="color: #cccccc;">|</td>
                                    <td style="padding: 0 8px;">
                                        <a href="#" style="color: #667eea; text-decoration: none; font-size: 12px;">Contact Us</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
                <!-- End Main Container -->

            </td>
        </tr>
    </table>

</body>
</html>`
}


exports.otptemplatetoverifyemail = (username, otp) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Verify Your Email</title>
</head>

<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0"
    style="background:#f4f4f4;padding:30px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:10px;overflow:hidden;
          box-shadow:0 2px 10px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td align="center"
              style="background:#2563eb;padding:25px;">
              <h1 style="color:#ffffff;margin:0;">
                Verify Your Email
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:35px;color:#333333;">

              <h2 style="margin-top:0;">
                Hello ${username},
              </h2>

              <p style="font-size:16px;line-height:1.6;">
                Thank you for registering with us!
              </p>

              <p style="font-size:16px;line-height:1.6;">
                Please use the OTP below to verify your email address
                and complete your registration.
              </p>

              <!-- OTP -->
              <div style="text-align:center;margin:30px 0;">
                <span style="
                  display:inline-block;
                  padding:15px 35px;
                  font-size:32px;
                  font-weight:bold;
                  letter-spacing:8px;
                  color:#2563eb;
                  background:#eef4ff;
                  border:2px dashed #2563eb;
                  border-radius:8px;
                ">
                  ${otp}
                </span>
              </div>

              <p style="font-size:15px;color:#666;">
                This OTP is valid for <strong>10 minutes</strong>.
              </p>

              <p style="font-size:15px;color:#666;">
                Please do not share this OTP with anyone.
              </p>

              <p style="font-size:15px;color:#666;">
                If you did not create an account with us, you can safely
                ignore this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center"
              style="background:#f8f8f8;padding:20px;color:#888;font-size:13px;">
              © ${new Date().getFullYear()} crowdsight.
              All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
};


exports.adminUpdateOtpTemplate = (username, otp) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Admin Details Update Verification</title>
</head>

<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0"
    style="background:#f4f4f4;padding:30px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:10px;overflow:hidden;
          box-shadow:0 2px 10px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td align="center"
              style="background:#2563eb;padding:25px;">
              <h1 style="color:#ffffff;margin:0;">
                🔐 Verify Admin Details Update
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:35px;color:#333333;">

              <h2 style="margin-top:0;">
                Hello ${username},
              </h2>

              <p style="font-size:16px;line-height:1.6;">
                We received a request to update your Admin account details.
              </p>

              <p style="font-size:16px;line-height:1.6;">
                Please use the OTP below to verify and authorize this update.
              </p>

              <!-- OTP -->
              <div style="text-align:center;margin:30px 0;">
                <span style="
                  display:inline-block;
                  padding:15px 35px;
                  font-size:32px;
                  font-weight:bold;
                  letter-spacing:8px;
                  color:#2563eb;
                  background:#eef4ff;
                  border:2px dashed #2563eb;
                  border-radius:8px;
                ">
                  ${otp}
                </span>
              </div>

              <p style="font-size:15px;color:#666;">
                This OTP is valid for <strong>10 minutes</strong>.
              </p>

              <p style="font-size:15px;color:#666;">
                Please do not share this OTP with anyone.
              </p>

              <p style="font-size:15px;color:#dc2626;font-weight:bold;">
                ⚠ If you did not request this change, please ignore this
                email and secure your account immediately.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center"
              style="background:#f8f8f8;padding:20px;color:#888;font-size:13px;">
              © ${new Date().getFullYear()} crowdsight.
              All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
};

exports.adminCheckIdTemplate = (adminName, checkId) => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Admin Status Tracking ID</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
  style="background:#ffffff;border-radius:10px;overflow:hidden;">

<!-- Header -->
<tr>
<td align="center" style="background:#2563eb;padding:25px;">
<h1 style="margin:0;color:#ffffff;">
👤 Admin Status Tracking ID
</h1>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:35px;">

<p style="font-size:16px;color:#444;line-height:24px;">
Thank you for submitting your Admin registration request.
Your request has been received successfully and is currently under
review by the Super Admin.
</p>

<table width="100%" cellpadding="12" cellspacing="0"
  style="border:1px solid #e5e7eb;border-collapse:collapse;margin:25px 0;">

<tr>
<td style="font-weight:bold;background:#f9fafb;">
Admin Name
</td>
<td>
${adminName}
</td>
</tr>

<tr>
<td style="font-weight:bold;background:#f9fafb;">
Status Tracking ID
</td>
<td style="font-family:monospace;font-size:16px;font-weight:bold;color:#2563eb;">
${checkId}
</td>
</tr>

</table>

<p style="font-size:15px;color:#555;line-height:24px;">
Please save this <strong>Status Tracking ID</strong>.
You can use it anytime to check the current status of your Admin
registration request on our website.
</p>

<p style="margin-top:30px;color:#444;">
Regards,<br>
<b> crowdsight Team</b>
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td align="center"
  style="background:#f3f4f6;padding:20px;font-size:13px;color:#777;">
© ${new Date().getFullYear()}  crowdsight 
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};

exports.adminApprovedTemplate = (adminName, email, password) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Admin Registration Approved</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
  style="background:#ffffff;border-radius:10px;overflow:hidden;">

  <!-- Header -->
  <tr>
    <td align="center" style="background:#16a34a;padding:25px;">
      <h1 style="margin:0;color:#ffffff;">
        ✅ Admin Registration Approved
      </h1>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:35px;">

      <p style="font-size:16px;color:#444;">
        Congratulations ${adminName}!
      </p>

      <p style="font-size:16px;color:#444;">
        Your Admin registration has been approved by the Super Admin.
        You can now log in to your Admin account.
      </p>

      <!-- Credentials -->
      <table width="100%" cellpadding="12" cellspacing="0"
        style="border:1px solid #e5e7eb;border-collapse:collapse;margin:25px 0;">

        <tr>
          <td style="font-weight:bold;background:#f9fafb;">
            Name
          </td>
          <td>${adminName}</td>
        </tr>

        <tr>
          <td style="font-weight:bold;background:#f9fafb;">
            Email
          </td>
          <td>${email}</td>
        </tr>

        <tr>
          <td style="font-weight:bold;background:#f9fafb;">
            Password
          </td>
          <td>${password}</td>
        </tr>

      </table>

      <p style="color:#d97706;font-weight:bold;">
        ⚠ Please change your password after your first login.
      </p>

      <div style="text-align:center;margin-top:30px;">
        <a
          href="https://your-domain.com/admin/login"
          style="background:#2563eb;color:#ffffff;padding:12px 28px;
          text-decoration:none;border-radius:6px;font-weight:bold;
          display:inline-block;">
          Login Now
        </a>
      </div>

    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td align="center"
      style="background:#f3f4f6;padding:20px;font-size:13px;color:#777;">
      © ${new Date().getFullYear()}  crowdsight 
    </td>
  </tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};

exports.adminRejectedTemplate = (adminName, reason) => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Admin Registration Rejected</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
  style="background:#ffffff;border-radius:10px;overflow:hidden;">

<!-- Header -->
<tr>
<td align="center" style="background:#dc2626;padding:25px;">
<h1 style="margin:0;color:#ffffff;">
❌ Admin Registration Rejected
</h1>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:35px;">

<p style="font-size:16px;color:#444;">
Unfortunately, your Admin registration request has been rejected
by the Super Admin.
</p>

<table width="100%" cellpadding="12" cellspacing="0"
  style="border:1px solid #e5e7eb;border-collapse:collapse;margin:25px 0;">

<tr>
<td style="font-weight:bold;background:#f9fafb;">
Admin Name
</td>
<td>
${adminName}
</td>
</tr>

<tr>
<td style="font-weight:bold;background:#f9fafb;">
Reason
</td>
<td>
${reason}
</td>
</tr>

</table>

<p style="font-size:15px;color:#555;line-height:24px;">
Please review the rejection reason carefully. You may update your
information and submit a new Admin registration request if applicable.
</p>

<p style="margin-top:30px;color:#444;">
Regards,<br>
<b> crowdsight Team</b>
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td align="center"
  style="background:#f3f4f6;padding:20px;font-size:13px;color:#777;">
© ${new Date().getFullYear()}  crowdsight 
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};


exports.accountCreatedTemplate = (username) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Account Created</title>
  </head>
  <body style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px;">

    <div style="max-width:600px; margin:auto; background:#fff; padding:30px; border-radius:8px; border:1px solid #ddd;">

      <h2 style="color:#28a745;">🎉 Account Created Successfully</h2>

      <p>Hello <strong>${username}</strong>,</p>

      <p>Your account has been created successfully.</p>

      <p>You can now log in and start using our services.</p>

      <p>If you did not create this account, please contact our support team immediately.</p>

      <hr style="margin:25px 0;">

      <p style="color:#777; font-size:14px;">
        Thank you,<br>
        <strong>Your App Team</strong>
      </p>

    </div>

  </body>
  </html>
  `;
};



