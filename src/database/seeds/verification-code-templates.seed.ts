import { DataSource } from 'typeorm';
import { EmailTemplate, EmailTemplateType, EmailTemplateStatus } from '../../entities/email-template.entity';

export async function seedVerificationCodeTemplates(dataSource: DataSource) {
  const emailTemplateRepository = dataSource.getRepository(EmailTemplate);

  const templates = [
    {
      name: 'Password Change Verification',
      type: EmailTemplateType.PASSWORD_CHANGE_VERIFICATION,
      subject: 'Password Change Verification - Kumu Coaching',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Change Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #00b894 0%, #00a085 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Change Verification</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi {{firstName}},</h2>
            
            <p>We received a request to change your password for your Kumu Coaching account.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00b894;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; text-align: center; color: #00b894;">Your verification code is:</p>
              <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; text-align: center; color: #333; letter-spacing: 5px;">{{verificationCode}}</p>
            </div>
            
            <p>Enter this code in the application to complete your password change.</p>
            
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #0c5460;"><strong>Security Notice:</strong> This code will expire in {{expiryTime}} for security reasons.</p>
            </div>
            
            <p>If you didn't request this password change, please ignore this email and consider changing your password immediately for security.</p>
            
            <p>Best regards,<br>The Kumu Coaching Team</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2024 Kumu Coaching. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Password Change Verification
        
        Hi {{firstName}},
        
        We received a request to change your password for your Kumu Coaching account.
        
        Your verification code is: {{verificationCode}}
        
        Enter this code in the application to complete your password change.
        
        Security Notice: This code will expire in {{expiryTime}} for security reasons.
        
        If you didn't request this password change, please ignore this email and consider changing your password immediately for security.
        
        Best regards,
        The Kumu Coaching Team
        
        © 2024 Kumu Coaching. All rights reserved.
      `,
      variables: ['firstName', 'verificationCode', 'expiryTime'],
      status: EmailTemplateStatus.ACTIVE,
      description: 'Verification code email for password changes'
    },
    {
      name: 'Email Change Verification',
      type: EmailTemplateType.EMAIL_CHANGE_VERIFICATION,
      subject: 'Email Change Verification - Kumu Coaching',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Change Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #00b894 0%, #00a085 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Email Change Verification</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi {{firstName}},</h2>
            
            <p>We received a request to change your email address for your Kumu Coaching account.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00b894;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; text-align: center; color: #00b894;">Your verification code is:</p>
              <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; text-align: center; color: #333; letter-spacing: 5px;">{{verificationCode}}</p>
            </div>
            
            <div style="background: #e8f5e8; border: 1px solid #c3e6c3; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #2d5a2d;"><strong>New email address:</strong> {{newEmail}}</p>
            </div>
            
            <p>Enter this code in the application to complete your email change.</p>
            
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #0c5460;"><strong>Security Notice:</strong> This code will expire in {{expiryTime}} for security reasons.</p>
            </div>
            
            <p>If you didn't request this email change, please ignore this email and consider changing your password immediately for security.</p>
            
            <p>Best regards,<br>The Kumu Coaching Team</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2024 Kumu Coaching. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Email Change Verification
        
        Hi {{firstName}},
        
        We received a request to change your email address for your Kumu Coaching account.
        
        Your verification code is: {{verificationCode}}
        
        New email address: {{newEmail}}
        
        Enter this code in the application to complete your email change.
        
        Security Notice: This code will expire in {{expiryTime}} for security reasons.
        
        If you didn't request this email change, please ignore this email and consider changing your password immediately for security.
        
        Best regards,
        The Kumu Coaching Team
        
        © 2024 Kumu Coaching. All rights reserved.
      `,
      variables: ['firstName', 'verificationCode', 'newEmail', 'expiryTime'],
      status: EmailTemplateStatus.ACTIVE,
      description: 'Verification code email for email address changes'
    },
    {
      name: 'Phone Change Verification',
      type: EmailTemplateType.PHONE_CHANGE_VERIFICATION,
      subject: 'Phone Change Verification - Kumu Coaching',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Phone Change Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #00b894 0%, #00a085 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Phone Change Verification</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi {{firstName}},</h2>
            
            <p>We received a request to change your phone number for your Kumu Coaching account.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00b894;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; text-align: center; color: #00b894;">Your verification code is:</p>
              <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; text-align: center; color: #333; letter-spacing: 5px;">{{verificationCode}}</p>
            </div>
            
            <div style="background: #e8f5e8; border: 1px solid #c3e6c3; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #2d5a2d;"><strong>New phone number:</strong> {{newPhone}}</p>
            </div>
            
            <p>Enter this code in the application to complete your phone number change.</p>
            
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #0c5460;"><strong>Security Notice:</strong> This code will expire in {{expiryTime}} for security reasons.</p>
            </div>
            
            <p>If you didn't request this phone number change, please ignore this email and consider changing your password immediately for security.</p>
            
            <p>Best regards,<br>The Kumu Coaching Team</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2024 Kumu Coaching. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Phone Change Verification
        
        Hi {{firstName}},
        
        We received a request to change your phone number for your Kumu Coaching account.
        
        Your verification code is: {{verificationCode}}
        
        New phone number: {{newPhone}}
        
        Enter this code in the application to complete your phone number change.
        
        Security Notice: This code will expire in {{expiryTime}} for security reasons.
        
        If you didn't request this phone number change, please ignore this email and consider changing your password immediately for security.
        
        Best regards,
        The Kumu Coaching Team
        
        © 2024 Kumu Coaching. All rights reserved.
      `,
      variables: ['firstName', 'verificationCode', 'newPhone', 'expiryTime'],
      status: EmailTemplateStatus.ACTIVE,
      description: 'Verification code email for phone number changes'
    },
    {
      name: 'Profile Update Verification',
      type: EmailTemplateType.PROFILE_UPDATE_VERIFICATION,
      subject: 'Profile Update Verification - Kumu Coaching',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Profile Update Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #00b894 0%, #00a085 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Profile Update Verification</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi {{firstName}},</h2>
            
            <p>We received a request to update your profile information for your Kumu Coaching account.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00b894;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; text-align: center; color: #00b894;">Your verification code is:</p>
              <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; text-align: center; color: #333; letter-spacing: 5px;">{{verificationCode}}</p>
            </div>
            
            <p>Enter this code in the application to complete your profile update.</p>
            
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #0c5460;"><strong>Security Notice:</strong> This code will expire in {{expiryTime}} for security reasons.</p>
            </div>
            
            <p>If you didn't request this profile update, please ignore this email and consider changing your password immediately for security.</p>
            
            <p>Best regards,<br>The Kumu Coaching Team</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2024 Kumu Coaching. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Profile Update Verification
        
        Hi {{firstName}},
        
        We received a request to update your profile information for your Kumu Coaching account.
        
        Your verification code is: {{verificationCode}}
        
        Enter this code in the application to complete your profile update.
        
        Security Notice: This code will expire in {{expiryTime}} for security reasons.
        
        If you didn't request this profile update, please ignore this email and consider changing your password immediately for security.
        
        Best regards,
        The Kumu Coaching Team
        
        © 2024 Kumu Coaching. All rights reserved.
      `,
      variables: ['firstName', 'verificationCode', 'expiryTime'],
      status: EmailTemplateStatus.ACTIVE,
      description: 'Verification code email for profile updates'
    },
    {
      name: 'Account Deletion Verification',
      type: EmailTemplateType.ACCOUNT_DELETION_VERIFICATION,
      subject: 'Account Deletion Verification - Kumu Coaching',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Deletion Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Account Deletion Verification</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi {{firstName}},</h2>
            
            <p>We received a request to delete your Kumu Coaching account.</p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-weight: bold;">⚠️ WARNING: This action is irreversible!</p>
              <p style="margin: 10px 0 0 0; color: #856404;">All your data, subscriptions, and progress will be permanently deleted.</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e74c3c;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; text-align: center; color: #e74c3c;">Your verification code is:</p>
              <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; text-align: center; color: #333; letter-spacing: 5px;">{{verificationCode}}</p>
            </div>
            
            <p>Enter this code in the application to confirm the deletion of your account.</p>
            
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #0c5460;"><strong>Security Notice:</strong> This code will expire in {{expiryTime}} for security reasons.</p>
            </div>
            
            <p>If you didn't request this account deletion, please ignore this email and consider changing your password immediately for security.</p>
            
            <p>Best regards,<br>The Kumu Coaching Team</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© 2024 Kumu Coaching. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Account Deletion Verification
        
        Hi {{firstName}},
        
        We received a request to delete your Kumu Coaching account.
        
        WARNING: This action is irreversible! All your data, subscriptions, and progress will be permanently deleted.
        
        Your verification code is: {{verificationCode}}
        
        Enter this code in the application to confirm the deletion of your account.
        
        Security Notice: This code will expire in {{expiryTime}} for security reasons.
        
        If you didn't request this account deletion, please ignore this email and consider changing your password immediately for security.
        
        Best regards,
        The Kumu Coaching Team
        
        © 2024 Kumu Coaching. All rights reserved.
      `,
      variables: ['firstName', 'verificationCode', 'expiryTime'],
      status: EmailTemplateStatus.ACTIVE,
      description: 'Verification code email for account deletion'
    }
  ];

  for (const template of templates) {
    const existingTemplate = await emailTemplateRepository.findOne({
      where: { type: template.type },
    });

    if (!existingTemplate) {
      const newTemplate = emailTemplateRepository.create(template);
      await emailTemplateRepository.save(newTemplate);
      console.log(`Created email template: ${template.name}`);
    } else {
      console.log(`Email template already exists: ${template.name}`);
    }
  }
}

