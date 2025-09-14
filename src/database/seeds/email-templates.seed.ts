import { DataSource } from 'typeorm';
import { EmailTemplate, EmailTemplateType, EmailTemplateStatus } from '../../entities/email-template.entity';

export async function seedEmailTemplates(dataSource: DataSource) {
  const emailTemplateRepository = dataSource.getRepository(EmailTemplate);

  const templates = [
    {
      name: 'Welcome Email',
      type: EmailTemplateType.WELCOME,
      subject: 'Welcome to Kumu Coaching, {{firstName}}!',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Kumu Coaching</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Kumu Coaching!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi {{firstName}},</h2>
            
            <p>Welcome to Kumu Coaching! We're thrilled to have you join our community of learners and achievers.</p>
            
            <p>Your account has been successfully created with the email: <strong>{{email}}</strong></p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0; color: #667eea;">What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Complete your profile setup</li>
                <li>Explore our coaching programs</li>
                <li>Join our community discussions</li>
                <li>Start your journey to success!</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{loginUrl}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Get Started</a>
            </div>
            
            <p>If you have any questions, feel free to reach out to our support team at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
            
            <p>Best regards,<br>The Kumu Coaching Team</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2024 Kumu Coaching. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Welcome to Kumu Coaching!
        
        Hi {{firstName}},
        
        Welcome to Kumu Coaching! We're thrilled to have you join our community of learners and achievers.
        
        Your account has been successfully created with the email: {{email}}
        
        What's Next?
        - Complete your profile setup
        - Explore our coaching programs
        - Join our community discussions
        - Start your journey to success!
        
        Get started: {{loginUrl}}
        
        If you have any questions, feel free to reach out to our support team at {{supportEmail}}
        
        Best regards,
        The Kumu Coaching Team
        
        © 2024 Kumu Coaching. All rights reserved.
      `,
      variables: ['firstName', 'email', 'loginUrl', 'supportEmail'],
      status: EmailTemplateStatus.ACTIVE,
      description: 'Welcome email sent to new users after registration'
    },
    {
      name: 'Password Reset Email',
      type: EmailTemplateType.PASSWORD_RESET,
      subject: 'Reset Your Kumu Coaching Password',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi {{firstName}},</h2>
            
            <p>We received a request to reset your password for your Kumu Coaching account.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b6b;">
              <p style="margin: 0;"><strong>Account:</strong> {{email}}</p>
              <p style="margin: 10px 0 0 0;"><strong>Request Time:</strong> {{requestTime}}</p>
            </div>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{resetUrl}}" style="background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;"><strong>Security Notice:</strong> This link will expire in {{expiryTime}} for your security. If you didn't request this password reset, please ignore this email.</p>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">{{resetUrl}}</p>
            
            <p>Best regards,<br>The Kumu Coaching Team</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2024 Kumu Coaching. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Password Reset Request
        
        Hi {{firstName}},
        
        We received a request to reset your password for your Kumu Coaching account.
        
        Account: {{email}}
        Request Time: {{requestTime}}
        
        Click the link below to reset your password:
        {{resetUrl}}
        
        Security Notice: This link will expire in {{expiryTime}} for your security. If you didn't request this password reset, please ignore this email.
        
        Best regards,
        The Kumu Coaching Team
        
        © 2024 Kumu Coaching. All rights reserved.
      `,
      variables: ['firstName', 'email', 'resetUrl', 'requestTime', 'expiryTime'],
      status: EmailTemplateStatus.ACTIVE,
      description: 'Password reset email with secure reset link'
    },
    {
      name: 'Email Verification',
      type: EmailTemplateType.EMAIL_VERIFICATION,
      subject: 'Verify Your Email Address - Kumu Coaching',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #00b894 0%, #00a085 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Email</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi {{firstName}},</h2>
            
            <p>Thank you for signing up with Kumu Coaching! To complete your registration, please verify your email address.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00b894;">
              <p style="margin: 0;"><strong>Email to verify:</strong> {{email}}</p>
            </div>
            
            <p>Click the button below to verify your email address:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{verificationUrl}}" style="background: #00b894; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email</a>
            </div>
            
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #0c5460;">This verification link will expire in {{expiryTime}} for security reasons.</p>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #00b894;">{{verificationUrl}}</p>
            
            <p>Best regards,<br>The Kumu Coaching Team</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2024 Kumu Coaching. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Email Verification
        
        Hi {{firstName}},
        
        Thank you for signing up with Kumu Coaching! To complete your registration, please verify your email address.
        
        Email to verify: {{email}}
        
        Click the link below to verify your email address:
        {{verificationUrl}}
        
        This verification link will expire in {{expiryTime}} for security reasons.
        
        Best regards,
        The Kumu Coaching Team
        
        © 2024 Kumu Coaching. All rights reserved.
      `,
      variables: ['firstName', 'email', 'verificationUrl', 'expiryTime'],
      status: EmailTemplateStatus.ACTIVE,
      description: 'Email verification for new user registration'
    },
    {
      name: 'Subscription Confirmation',
      type: EmailTemplateType.SUBSCRIPTION_CONFIRMATION,
      subject: 'Welcome to {{planName}} - Kumu Coaching',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Subscription Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Subscription Confirmed!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Congratulations {{firstName}}!</h2>
            
            <p>Your subscription to <strong>{{planName}}</strong> has been successfully activated!</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6c5ce7;">
              <h3 style="margin-top: 0; color: #6c5ce7;">Subscription Details</h3>
              <p><strong>Plan:</strong> {{planName}}</p>
              <p><strong>Amount:</strong> $\{\{amount\}\}</p>
              <p><strong>Billing Cycle:</strong> {{billingCycle}}</p>
              <p><strong>Next Billing Date:</strong> {{nextBillingDate}}</p>
              <p><strong>Subscription ID:</strong> {{subscriptionId}}</p>
            </div>
            
            <div style="background: #e8f5e8; border: 1px solid #c3e6c3; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #2d5a2d;"><strong>🎉 You now have access to:</strong></p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>All premium coaching content</li>
                <li>Exclusive community access</li>
                <li>Priority support</li>
                <li>Advanced features and tools</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{dashboardUrl}}" style="background: #6c5ce7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Access Dashboard</a>
            </div>
            
            <p>If you have any questions about your subscription, please contact our support team at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
            
            <p>Thank you for choosing Kumu Coaching!</p>
            <p>Best regards,<br>The Kumu Coaching Team</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2024 Kumu Coaching. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Subscription Confirmation
        
        Congratulations {{firstName}}!
        
        Your subscription to {{planName}} has been successfully activated!
        
        Subscription Details:
        - Plan: {{planName}}
        - Amount: $\{\{amount\}\}
        - Billing Cycle: {{billingCycle}}
        - Next Billing Date: {{nextBillingDate}}
        - Subscription ID: {{subscriptionId}}
        
        🎉 You now have access to:
        - All premium coaching content
        - Exclusive community access
        - Priority support
        - Advanced features and tools
        
        Access your dashboard: {{dashboardUrl}}
        
        If you have any questions about your subscription, please contact our support team at {{supportEmail}}
        
        Thank you for choosing Kumu Coaching!
        
        Best regards,
        The Kumu Coaching Team
        
        © 2024 Kumu Coaching. All rights reserved.
      `,
      variables: ['firstName', 'planName', 'amount', 'billingCycle', 'nextBillingDate', 'subscriptionId', 'dashboardUrl', 'supportEmail'],
      status: EmailTemplateStatus.ACTIVE,
      description: 'Confirmation email sent after successful subscription purchase'
    },
    {
      name: 'Payment Success',
      type: EmailTemplateType.PAYMENT_SUCCESS,
      subject: 'Payment Confirmed - Kumu Coaching',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #00b894 0%, #00a085 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Payment Successful!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi {{firstName}},</h2>
            
            <p>Your payment has been successfully processed. Thank you for your purchase!</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00b894;">
              <h3 style="margin-top: 0; color: #00b894;">Payment Details</h3>
              <p><strong>Amount:</strong> $\{\{amount\}\}</p>
              <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
              <p><strong>Transaction ID:</strong> {{transactionId}}</p>
              <p><strong>Date:</strong> {{paymentDate}}</p>
              <p><strong>Description:</strong> {{description}}</p>
            </div>
            
            <div style="background: #e8f5e8; border: 1px solid #c3e6c3; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #2d5a2d;"><strong>✅ Payment Status:</strong> Completed</p>
            </div>
            
            <p>You can view your receipt and manage your subscription in your dashboard.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{dashboardUrl}}" style="background: #00b894; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Dashboard</a>
            </div>
            
            <p>If you have any questions about this payment, please contact our support team at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
            
            <p>Best regards,<br>The Kumu Coaching Team</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2024 Kumu Coaching. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Payment Successful!
        
        Hi {{firstName}},
        
        Your payment has been successfully processed. Thank you for your purchase!
        
        Payment Details:
        - Amount: $\{\{amount\}\}
        - Payment Method: {{paymentMethod}}
        - Transaction ID: {{transactionId}}
        - Date: {{paymentDate}}
        - Description: {{description}}
        
        ✅ Payment Status: Completed
        
        You can view your receipt and manage your subscription in your dashboard.
        
        View Dashboard: {{dashboardUrl}}
        
        If you have any questions about this payment, please contact our support team at {{supportEmail}}
        
        Best regards,
        The Kumu Coaching Team
        
        © 2024 Kumu Coaching. All rights reserved.
      `,
      variables: ['firstName', 'amount', 'paymentMethod', 'transactionId', 'paymentDate', 'description', 'dashboardUrl', 'supportEmail'],
      status: EmailTemplateStatus.ACTIVE,
      description: 'Payment confirmation email sent after successful payment'
    },
    {
      name: 'Influencer Invitation',
      type: EmailTemplateType.INFLUENCER_INVITATION,
      subject: 'You\'re Invited to Join Kumu Coaching as an Influencer!',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Influencer Invitation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Influencer Invitation</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi {{firstName}},</h2>
            
            <p>We're excited to invite you to join Kumu Coaching as an official influencer!</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fd79a8;">
              <h3 style="margin-top: 0; color: #fd79a8;">What You'll Get:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li><strong>{{commissionRate}}% commission</strong> on every referral</li>
                <li>Exclusive promo codes to share with your audience</li>
                <li>Access to influencer dashboard and analytics</li>
                <li>Priority support and special perks</li>
                <li>Monthly payout via Stripe</li>
              </ul>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;"><strong>Your Commission Rate:</strong> {{commissionRate}}% of each successful referral</p>
            </div>
            
            <p>To accept this invitation and start earning commissions, click the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{acceptUrl}}" style="background: #fd79a8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Accept Invitation</a>
            </div>
            
            <p>If you have any questions about the influencer program, please contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
            
            <p>We look forward to working with you!</p>
            <p>Best regards,<br>The Kumu Coaching Team</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2024 Kumu Coaching. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Influencer Invitation
        
        Hi {{firstName}},
        
        We're excited to invite you to join Kumu Coaching as an official influencer!
        
        What You'll Get:
        - {{commissionRate}}% commission on every referral
        - Exclusive promo codes to share with your audience
        - Access to influencer dashboard and analytics
        - Priority support and special perks
        - Monthly payout via Stripe
        
        Your Commission Rate: {{commissionRate}}% of each successful referral
        
        To accept this invitation and start earning commissions, click the link below:
        {{acceptUrl}}
        
        If you have any questions about the influencer program, please contact us at {{supportEmail}}
        
        We look forward to working with you!
        
        Best regards,
        The Kumu Coaching Team
        
        © 2024 Kumu Coaching. All rights reserved.
      `,
      variables: ['firstName', 'commissionRate', 'acceptUrl', 'supportEmail'],
      status: EmailTemplateStatus.ACTIVE,
      description: 'Invitation email sent to potential influencers'
    }
  ];

  for (const template of templates) {
    const existingTemplate = await emailTemplateRepository.findOne({
      where: { type: template.type }
    });

    if (!existingTemplate) {
      const newTemplate = emailTemplateRepository.create(template);
      await emailTemplateRepository.save(newTemplate);
      console.log(`✅ Created email template: ${template.name}`);
    } else {
      console.log(`⏭️  Email template already exists: ${template.name}`);
    }
  }
}
