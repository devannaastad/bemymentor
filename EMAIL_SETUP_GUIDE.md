# Email Setup Guide for BeMyMentor.dev

This guide will help you set up professional email for your BeMyMentor.dev domain using Cloudflare Email Routing and Resend.

## Part 1: Cloudflare Email Routing (Receiving Emails)

Cloudflare Email Routing allows you to receive emails at your custom domain and forward them to your personal inbox.

### Step 1: Enable Email Routing in Cloudflare

1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain: `bemymentor.dev`
3. Go to **Email** in the left sidebar
4. Click **Email Routing** → **Get started**

### Step 2: Set Up Email Addresses

Create these essential email addresses and route them to your personal email:

| Email Address | Purpose | Forward To |
|--------------|---------|------------|
| `support@bemymentor.dev` | Customer support inquiries | Your personal email |
| `abuse@bemymentor.dev` | Abuse reports and violations | Your personal email |
| `billing@bemymentor.dev` | Payment and billing questions | Your personal email |
| `admin@bemymentor.dev` | Administrative notifications | Your personal email |
| `security@bemymentor.dev` | Security issues and reports | Your personal email |
| `contact@bemymentor.dev` | General inquiries | Your personal email |
| `noreply@bemymentor.dev` | Automated system emails (monitor bounces) | Your personal email |

**To add each email:**
1. Click **Create address**
2. Enter the email prefix (e.g., "support")
3. Choose destination: **Send to an email** → Enter your personal email
4. Click **Save**

### Step 3: Verify Your Destination Email

1. Cloudflare will send a verification email to your personal inbox
2. Click the verification link to confirm
3. Repeat for any additional destination emails

### Step 4: Verify DNS Records

Cloudflare should automatically add MX records. Verify they exist:

1. Go to **DNS** → **Records**
2. Look for MX records pointing to Cloudflare's email servers:
   - `route1.mx.cloudflare.net` (Priority 1)
   - `route2.mx.cloudflare.net` (Priority 2)
   - `route3.mx.cloudflare.net` (Priority 3)

---

## Part 2: Resend Setup (Sending Emails)

Resend allows you to send emails from your custom domain.

### Step 1: Add Domain in Resend

1. Log into your [Resend Dashboard](https://resend.com/domains)
2. Click **Add Domain**
3. Enter: `bemymentor.dev`
4. Click **Add**

### Step 2: Add DNS Records to Cloudflare

Resend will show you DNS records to add. Go to Cloudflare → DNS → Records and add:

**Example records (use the EXACT values from your Resend dashboard):**

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| TXT | `@` | `v=spf1 include:_spf.resend.com ~all` | DNS only (gray cloud) |
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4...` (long key) | DNS only |

**IMPORTANT:**
- Set **Proxy status** to **DNS only** (gray cloud icon, NOT orange)
- Use the exact values Resend provides (the DKIM key will be different)
- Wait 5-10 minutes for DNS propagation

### Step 3: Verify Domain in Resend

1. Return to Resend dashboard
2. Click **Verify** next to your domain
3. Wait for verification (usually takes a few minutes)
4. Status should change to "Verified" with a green checkmark

### Step 4: Update Environment Variable

Once verified, update your `.env.local` file:

```bash
EMAIL_FROM="BeMyMentor <noreply@bemymentor.dev>"
```

Then restart your development server:
```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null; sleep 2 && pnpm dev
```

---

## Part 3: Testing

### Test Receiving Emails (Cloudflare)

Send a test email to `support@bemymentor.dev` from another email account. You should receive it in your personal inbox within seconds.

### Test Sending Emails (Resend)

You can test sending from your application:

1. Navigate to any feature that sends emails (e.g., mentor application)
2. Check the recipient's inbox
3. Verify the email shows as from `noreply@bemymentor.dev`

Or use the Resend dashboard:
1. Go to **API Keys** → **Emails**
2. Click **Send Test Email**
3. Enter a recipient and send

---

## Troubleshooting

### Emails not being received at Cloudflare addresses

- Check that MX records are correctly set in Cloudflare DNS
- Verify you confirmed the destination email address
- Check spam folder in your personal inbox
- Wait 10-15 minutes for DNS propagation

### Cannot send emails from Resend

- Verify domain shows as "Verified" in Resend dashboard
- Check DNS records are set to "DNS only" (gray cloud)
- Ensure `EMAIL_FROM` in `.env.local` matches `noreply@bemymentor.dev`
- Check Resend API key is valid: `RESEND_API_KEY=re_WT89bYt6...`
- Review Resend logs for error messages

### SPF/DKIM failures

- Ensure SPF record includes: `include:_spf.resend.com`
- DKIM record must be exact match from Resend (long TXT value)
- Allow 24 hours for full DNS propagation worldwide

---

## Code Changes Made

All email addresses in the codebase have been updated from `@bemymentor.com` to `@bemymentor.dev`:

- ✅ Contact page ([app/contact/page.tsx](app/contact/page.tsx))
- ✅ Footer component ([components/landing/Footer.tsx](components/landing/Footer.tsx))
- ✅ FAQ component ([components/landing/FAQ.tsx](components/landing/FAQ.tsx))
- ✅ Email templates in `lib/emails/`
- ✅ Privacy and Terms pages
- ✅ All other references throughout the codebase

---

## Current Configuration

- **Domain**: bemymentor.dev
- **Email Provider (Sending)**: Resend
- **Email Routing (Receiving)**: Cloudflare Email Routing
- **Resend API Key**: Configured in `.env.local`
- **From Address**: `noreply@bemymentor.dev`

---

## Support Contacts Reference

For your website, these are the configured support emails:

- **General Support**: support@bemymentor.dev
- **Abuse Reports**: abuse@bemymentor.dev
- **Billing**: billing@bemymentor.dev
- **Admin/Mentor Applications**: admin@bemymentor.dev
- **Security Issues**: security@bemymentor.dev
- **General Contact**: contact@bemymentor.dev

All emails forward to your personal inbox via Cloudflare Email Routing.
