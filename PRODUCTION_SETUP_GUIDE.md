# Production Setup Guide for bemymentor.dev

## 🚀 Complete Checklist for Production Deployment

---

## 1. Environment Variables (Vercel)

In your Vercel project settings, add these environment variables:

### **Core Settings**
```bash
# App URL - CRITICAL!
NEXT_PUBLIC_APP_URL=https://bemymentor.dev
NEXTAUTH_URL=https://bemymentor.dev

# Auth Secret - Generate a new one for production!
NEXTAUTH_SECRET=<generate-new-secret>
AUTH_SECRET=<same-as-nextauth-secret>
AUTH_TRUST_HOST=true
```

**Generate New Secret:**
```bash
openssl rand -base64 32
```

---

## 2. Database (Neon/Supabase)

### **Update Connection Strings**
Your database should already be set up, but verify:

```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
DIRECT_URL=postgresql://user:password@host/database?sslmode=require
```

✅ **Action:** Make sure these are the PRODUCTION database URLs, not localhost!

---

## 3. Google OAuth Setup

### **Update Authorized Redirect URIs**

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Add these to **Authorized redirect URIs**:
   ```
   https://bemymentor.dev/api/auth/callback/google
   ```
4. Add to **Authorized JavaScript origins**:
   ```
   https://bemymentor.dev
   ```

### **Environment Variables**
```bash
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

---

## 4. Stripe Configuration

### **Update Stripe Settings**

#### **A. Webhook Endpoint**
1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Add endpoint URL:
   ```
   https://bemymentor.dev/api/stripe/webhook
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Copy the **Webhook Signing Secret**

#### **B. Stripe Connect Settings**
1. Go to [Stripe Dashboard > Settings > Connect](https://dashboard.stripe.com/settings/connect)
2. Update **Redirect URIs**:
   ```
   https://bemymentor.dev/api/stripe/connect/callback
   https://bemymentor.dev/api/stripe/connect/refresh
   ```

#### **C. Environment Variables**
```bash
# Use LIVE keys for production!
STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Stripe Connect
STRIPE_CONNECT_CLIENT_ID=<your-stripe-connect-client-id>
```

⚠️ **IMPORTANT:** Switch from `pk_test_` and `sk_test_` to `pk_live_` and `sk_live_` for production!

---

## 5. Email Service (Resend)

### **Update Domain**
1. Go to [Resend Dashboard > Domains](https://resend.com/domains)
2. Add your domain: `bemymentor.dev`
3. Add DNS records to your domain registrar:
   - Add the SPF, DKIM, and DMARC records provided by Resend
4. Verify the domain

### **Environment Variables**
```bash
RESEND_API_KEY=re_xxx
```

### **Update FROM Email**
Update the FROM email in `/lib/email.ts`:
```typescript
const FROM_EMAIL = "BeMyMentor <noreply@bemymentor.dev>";
```

---

## 6. UploadThing Configuration

### **Update Allowed Origins**
1. Go to [UploadThing Dashboard](https://uploadthing.com/dashboard)
2. Go to your app settings
3. Add allowed origins:
   ```
   https://bemymentor.dev
   ```

### **Environment Variables**
```bash
UPLOADTHING_SECRET=sk_live_xxx
UPLOADTHING_APP_ID=xxx
```

---

## 7. Vercel Cron Jobs

Your cron jobs are already configured in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/session-reminders",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/review-reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

### **Secure Your Cron Endpoints**
Add this environment variable:
```bash
CRON_SECRET=<generate-random-secret>
```

Generate with:
```bash
openssl rand -base64 32
```

---

## 8. Domain Configuration

### **A. DNS Settings**
In your domain registrar (where you bought bemymentor.dev):

1. Add **A Record** pointing to Vercel:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

2. Add **CNAME Record** for www:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### **B. Vercel Domain Setup**
1. Go to your Vercel project
2. Go to **Settings > Domains**
3. Add domain: `bemymentor.dev`
4. Add domain: `www.bemymentor.dev`
5. Vercel will automatically issue SSL certificates

---

## 9. Security Settings

### **Update CORS Settings**
Your API routes should already handle CORS, but verify they use the production domain.

### **Content Security Policy**
Consider adding CSP headers in `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
      ],
    },
  ]
}
```

---

## 10. Analytics & Monitoring (Optional)

Consider adding:
- **Vercel Analytics** (built-in, just enable it)
- **Sentry** for error tracking
- **Google Analytics** for user tracking

---

## 📋 Pre-Deployment Checklist

Before deploying to production, verify:

- [ ] All environment variables are set in Vercel
- [ ] Using LIVE Stripe keys (not test keys)
- [ ] Google OAuth redirect URIs updated
- [ ] Stripe webhook endpoint configured with production URL
- [ ] Stripe Connect redirect URIs updated
- [ ] Email domain verified in Resend
- [ ] UploadThing allowed origins updated
- [ ] DNS records configured for bemymentor.dev
- [ ] Domain added in Vercel
- [ ] CRON_SECRET generated and added
- [ ] Database is production database (not localhost)
- [ ] AUTH_SECRET is newly generated (not the example one)
- [ ] Test all critical flows:
  - [ ] User signup/login
  - [ ] Booking creation
  - [ ] Stripe payment
  - [ ] Email sending
  - [ ] Image upload
  - [ ] Mentor application
  - [ ] Calendar scheduling

---

## 🚨 Critical Post-Deployment Tests

After deploying, immediately test:

1. **Authentication**: Sign up with Google
2. **Payment**: Complete a test booking with Stripe
3. **Email**: Verify emails are received
4. **Upload**: Upload a profile picture
5. **Cron Jobs**: Check Vercel logs after 1 hour to verify cron jobs ran

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Stripe Connect**: https://stripe.com/docs/connect
- **Next.js Auth**: https://authjs.dev/
- **Resend Docs**: https://resend.com/docs

---

## 🔐 Security Notes

1. **Never commit `.env` files** to Git
2. **Rotate secrets** if they're ever exposed
3. **Use different secrets** for production vs development
4. **Enable 2FA** on all service accounts (Vercel, Stripe, etc.)
5. **Monitor logs** regularly for suspicious activity

---

Good luck with your launch! 🚀
