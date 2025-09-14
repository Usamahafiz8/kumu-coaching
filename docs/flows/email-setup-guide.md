# Email Setup Guide

## Overview
This guide will help you configure email services for the Kumu Coaching platform.

## Quick Setup Options

### Option 1: Gmail (Recommended for Testing)

#### Step 1: Enable App Passwords
1. Go to [Google Account Settings](https://myaccount.google.com)
2. Click **"Security"** in the left sidebar
3. Enable **"2-Step Verification"** if not already enabled
4. Go to **"App passwords"**
5. Generate a new app password for "Mail"
6. Copy the 16-character password

#### Step 2: Configure in Admin Panel
1. Login to admin panel: `http://localhost:3002/admin/login`
2. Go to **"Email Config"** tab
3. Enter these settings:
   - **SMTP Host**: `smtp.gmail.com`
   - **SMTP Port**: `587`
   - **Username**: `your-email@gmail.com`
   - **Password**: `your-app-password` (16-character app password)
   - **Secure**: Check "Use secure connection (SSL/TLS)"
   - **From Email**: `your-email@gmail.com`
   - **From Name**: `Kumu Coaching`
4. Click **"Test Connection"**
5. Click **"Save Configuration"**

### Option 2: Outlook/Hotmail

#### Step 1: Enable SMTP Access
1. Go to [Outlook Settings](https://outlook.live.com)
2. Click gear icon → **"View all Outlook settings"**
3. Go to **"Mail"** → **"Sync email"**
4. Enable **"Let devices and apps use POP"**

#### Step 2: Configure in Admin Panel
- **SMTP Host**: `smtp-mail.outlook.com`
- **SMTP Port**: `587`
- **Username**: `your-email@outlook.com`
- **Password**: `your-outlook-password`
- **Secure**: Check "Use secure connection (SSL/TLS)"

### Option 3: Yahoo Mail

#### Step 1: Generate App Password
1. Go to [Yahoo Mail](https://mail.yahoo.com)
2. Click gear icon → **"More settings"**
3. Go to **"Mailboxes"** → **"Your email address"**
4. Click **"Generate app password"**
5. Copy the generated password

#### Step 2: Configure in Admin Panel
- **SMTP Host**: `smtp.mail.yahoo.com`
- **SMTP Port**: `587`
- **Username**: `your-email@yahoo.com`
- **Password**: `your-app-password`
- **Secure**: Check "Use secure connection (SSL/TLS)"

### Option 4: Custom SMTP (Hosting Provider)

#### Common Hosting Providers

**cPanel Hosting:**
- **SMTP Host**: `mail.yourdomain.com`
- **SMTP Port**: `587` or `465`
- **Username**: `your-email@yourdomain.com`
- **Password**: `your-email-password`

**Bluehost:**
- **SMTP Host**: `mail.yourdomain.com`
- **SMTP Port**: `465` (SSL) or `587` (TLS)
- **Username**: `your-email@yourdomain.com`
- **Password**: `your-email-password`

**GoDaddy:**
- **SMTP Host**: `smtpout.secureserver.net`
- **SMTP Port**: `465` (SSL) or `587` (TLS)
- **Username**: `your-email@yourdomain.com`
- **Password**: `your-email-password`

**SiteGround:**
- **SMTP Host**: `mail.yourdomain.com`
- **SMTP Port**: `465` (SSL) or `587` (TLS)
- **Username**: `your-email@yourdomain.com`
- **Password**: `your-email-password`

## Port and Security Settings

### Port 587 (TLS) - Recommended
- **Security**: TLS encryption
- **Compatibility**: Works with most providers
- **Settings**: Check "Use secure connection (SSL/TLS)"

### Port 465 (SSL)
- **Security**: SSL encryption
- **Compatibility**: Older but still secure
- **Settings**: Check "Use secure connection (SSL/TLS)"

### Port 25 (No Encryption) - Not Recommended
- **Security**: No encryption
- **Compatibility**: May be blocked by ISPs
- **Settings**: Uncheck "Use secure connection"

## Testing Your Configuration

### Step 1: Test Connection
1. Fill in all SMTP settings
2. Click **"Test Connection"**
3. Look for success message

### Step 2: Send Test Email
1. Enter a test email address
2. Click **"Send Test"**
3. Check your inbox (and spam folder)

### Step 3: Verify Email Delivery
- Check inbox for test email
- Check spam/junk folder
- Verify email formatting
- Test with different email providers

## Common Issues and Solutions

### 1. "Connection Failed" Error

**Possible Causes:**
- Wrong SMTP host or port
- Incorrect username/password
- Firewall blocking connection
- Provider blocking SMTP access

**Solutions:**
- Verify SMTP settings with your provider
- Check if 2FA is enabled (use app password)
- Try different port (587 vs 465)
- Contact hosting provider for SMTP settings

### 2. "Authentication Failed" Error

**Possible Causes:**
- Wrong username or password
- Using regular password instead of app password
- Account security settings blocking access

**Solutions:**
- Use app password for Gmail/Yahoo
- Verify username is correct email address
- Check account security settings
- Enable "Less secure app access" (not recommended)

### 3. "Email Not Delivered" Error

**Possible Causes:**
- Email going to spam folder
- Invalid recipient email
- Provider blocking outgoing emails
- DNS/SPF records not configured

**Solutions:**
- Check spam folder
- Verify recipient email address
- Configure SPF/DKIM records
- Contact provider about sending limits

### 4. "SSL/TLS Error" Error

**Possible Causes:**
- Wrong security settings
- Provider doesn't support encryption
- Certificate issues

**Solutions:**
- Try different port (587 vs 465)
- Check/uncheck "Use secure connection"
- Verify provider supports encryption
- Contact provider for correct settings

## Email Templates

### Pre-built Templates
The system includes these email templates:

1. **Welcome Email** - New user registration
2. **Email Verification** - Email address verification
3. **Password Reset** - Password reset requests
4. **Subscription Confirmation** - Successful subscription
5. **Payment Success** - Payment confirmation
6. **Influencer Invitation** - Invite influencers

### Template Variables
Templates support these variables:
- `{{firstName}}` - User's first name
- `{{lastName}}` - User's last name
- `{{email}}` - User's email address
- `{{verificationUrl}}` - Email verification link
- `{{resetUrl}}` - Password reset link
- `{{planName}}` - Subscription plan name
- `{{amount}}` - Payment amount
- `{{dashboardUrl}}` - Link to user dashboard

## Production Considerations

### 1. Email Deliverability
- Set up SPF records: `v=spf1 include:_spf.google.com ~all`
- Configure DKIM signing
- Set up DMARC policy
- Monitor bounce rates

### 2. Sending Limits
- Gmail: 500 emails/day (free), 2000/day (paid)
- Outlook: 300 emails/day
- Yahoo: 500 emails/day
- Custom SMTP: Check with provider

### 3. Monitoring
- Set up email delivery monitoring
- Track bounce rates
- Monitor spam complaints
- Set up alerts for failures

### 4. Backup Options
- Configure multiple SMTP providers
- Set up failover mechanisms
- Use email service providers (SendGrid, Mailgun)
- Implement retry logic

## Advanced Configuration

### Using Email Service Providers

**SendGrid:**
- **SMTP Host**: `smtp.sendgrid.net`
- **SMTP Port**: `587`
- **Username**: `apikey`
- **Password**: `your-sendgrid-api-key`

**Mailgun:**
- **SMTP Host**: `smtp.mailgun.org`
- **SMTP Port**: `587`
- **Username**: `your-mailgun-username`
- **Password**: `your-mailgun-password`

**Amazon SES:**
- **SMTP Host**: `email-smtp.us-east-1.amazonaws.com`
- **SMTP Port**: `587`
- **Username**: `your-ses-username`
- **Password**: `your-ses-password`

## Security Best Practices

### 1. Credential Management
- ✅ Use app passwords instead of regular passwords
- ✅ Store credentials encrypted in database
- ✅ Rotate passwords regularly
- ✅ Use different credentials for different environments

### 2. Email Security
- ✅ Use TLS/SSL encryption
- ✅ Verify sender authenticity
- ✅ Implement rate limiting
- ✅ Monitor for abuse

### 3. Content Security
- ✅ Validate email addresses
- ✅ Sanitize email content
- ✅ Use proper headers
- ✅ Implement unsubscribe links

---

**Need Help?** Check the admin panel help section or contact your email provider's support.
