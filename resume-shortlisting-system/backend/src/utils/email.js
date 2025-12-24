import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  emailVerification: (data) => ({
    subject: 'Verify Your Email Address',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.name},</h2>
            <p>Thank you for registering with our Resume Shortlisting System. Please verify your email address by clicking the button below:</p>
            <a href="${data.verificationUrl}" class="button">Verify Email</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p>${data.verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Resume Shortlisting System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  passwordReset: (data) => ({
    subject: 'Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.name},</h2>
            <p>You requested a password reset for your account. Click the button below to reset your password:</p>
            <a href="${data.resetUrl}" class="button">Reset Password</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p>${data.resetUrl}</p>
            <p>This link will expire in 10 minutes.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Resume Shortlisting System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  applicationReceived: (data) => ({
    subject: 'Application Received',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Received</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Received</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.candidateName},</h2>
            <p>Thank you for your application for the <strong>${data.jobTitle}</strong> position at <strong>${data.company}</strong>.</p>
            <p>We have received your application and will review it carefully. You will hear from us within the next few days.</p>
            <p><strong>Application Details:</strong></p>
            <ul>
              <li>Position: ${data.jobTitle}</li>
              <li>Company: ${data.company}</li>
              <li>Applied Date: ${data.appliedDate}</li>
              <li>Application ID: ${data.applicationId}</li>
            </ul>
            <p>Good luck with your application!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Resume Shortlisting System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  applicationStatusUpdate: (data) => ({
    subject: 'Application Status Update',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ffc107; color: #333; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .status { padding: 10px; background: #e9ecef; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Status Update</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.candidateName},</h2>
            <p>Your application status has been updated for the <strong>${data.jobTitle}</strong> position at <strong>${data.company}</strong>.</p>
            <div class="status">
              <strong>New Status:</strong> ${data.newStatus}
            </div>
            ${data.message ? `<p>${data.message}</p>` : ''}
            ${data.nextSteps ? `<p><strong>Next Steps:</strong> ${data.nextSteps}</p>` : ''}
            <p>Application ID: ${data.applicationId}</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Resume Shortlisting System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  interviewScheduled: (data) => ({
    subject: 'Interview Scheduled',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Interview Scheduled</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #17a2b8; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .interview-details { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Interview Scheduled</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.candidateName},</h2>
            <p>Great news! We have scheduled an interview for your application to the <strong>${data.jobTitle}</strong> position at <strong>${data.company}</strong>.</p>
            <div class="interview-details">
              <h3>Interview Details:</h3>
              <p><strong>Date:</strong> ${data.interviewDate}</p>
              <p><strong>Time:</strong> ${data.interviewTime}</p>
              <p><strong>Type:</strong> ${data.interviewType}</p>
              ${data.location ? `<p><strong>Location:</strong> ${data.location}</p>` : ''}
              ${data.duration ? `<p><strong>Duration:</strong> ${data.duration} minutes</p>` : ''}
            </div>
            ${data.instructions ? `<p><strong>Instructions:</strong> ${data.instructions}</p>` : ''}
            <p>Please confirm your attendance by replying to this email or contacting us.</p>
            <p>Good luck with your interview!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Resume Shortlisting System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// Send email function
export const sendEmail = async ({ to, subject, template, data, attachments = [] }) => {
  try {
    const transporter = createTransporter();
    
    // Get template
    const emailTemplate = emailTemplates[template];
    if (!emailTemplate) {
      throw new Error(`Email template '${template}' not found`);
    }

    const { html, subject: templateSubject } = emailTemplate(data);

    const mailOptions = {
      from: `"Resume Shortlisting System" <${process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(',') : to,
      subject: subject || templateSubject,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to,
      subject: mailOptions.subject,
      timestamp: new Date().toISOString(),
    });

    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Send bulk emails
export const sendBulkEmails = async (emails) => {
  try {
    const transporter = createTransporter();
    const results = [];

    for (const email of emails) {
      try {
        const emailTemplate = emailTemplates[email.template];
        if (!emailTemplate) {
          throw new Error(`Email template '${email.template}' not found`);
        }

        const { html, subject: templateSubject } = emailTemplate(email.data);

        const mailOptions = {
          from: `"Resume Shortlisting System" <${process.env.SMTP_USER}>`,
          to: email.to,
          subject: email.subject || templateSubject,
          html,
          attachments: email.attachments || [],
        };

        const info = await transporter.sendMail(mailOptions);
        results.push({ success: true, messageId: info.messageId, to: email.to });
      } catch (error) {
        results.push({ success: false, error: error.message, to: email.to });
      }
    }

    return results;
  } catch (error) {
    console.error('Bulk email sending failed:', error);
    throw error;
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration failed:', error.message);
    return false;
  }
};
