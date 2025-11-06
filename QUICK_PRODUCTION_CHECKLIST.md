# 🚀 Quick Production Checklist

## ⚡ Critical - Must Do Before Going Live

### 1. Vercel Environment Variables
Go to Vercel Project → Settings → Environment Variables and add:

```bash
NEXT_PUBLIC_APP_URL=https://bemymentor.dev
NEXTAUTH_URL=https://bemymentor.dev
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
AUTH_SECRET=<same as above>
```

### 2. Google OAuth
🔗 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

Add to **Authorized redirect URIs**:
```
https://bemymentor.dev/api/auth/callback/google
```

### 3. Stripe Webhook
🔗 [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)

Add endpoint:
```
https://bemymentor.dev/api/stripe/webhook
```

### 4. Stripe Connect Redirect
🔗 [Stripe Dashboard → Connect Settings](https://dashboard.stripe.com/settings/connect)

Add redirect URIs:
```
https://bemymentor.dev/api/stripe/connect/callback
https://bemymentor.dev/api/stripe/connect/refresh
```

### 5. Switch to Stripe LIVE Keys
In Vercel environment variables:
```bash
# Change from pk_test_ to pk_live_
STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

### 6. Resend Email Domain
🔗 [Resend Dashboard](https://resend.com/domains)

1. Add domain: `bemymentor.dev`
2. Add DNS records (SPF, DKIM, DMARC) to your domain registrar
3. Verify domain

Then add to Vercel:
```bash
EMAIL_FROM=BeMyMentor <noreply@bemymentor.dev>
```

### 7. UploadThing
🔗 [UploadThing Dashboard](https://uploadthing.com/dashboard)

Add to allowed origins:
```
https://bemymentor.dev
```

### 8. Domain DNS Settings
In your domain registrar (where you bought bemymentor.dev):

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 9. Add Domain to Vercel
Vercel Project → Settings → Domains → Add:
```
bemymentor.dev
www.bemymentor.dev
```

---

## ✅ After Deployment - Test These

- [ ] Sign in with Google works
- [ ] Create a test booking
- [ ] Complete a Stripe payment
- [ ] Receive confirmation email
- [ ] Upload a profile picture
- [ ] Check cron jobs ran (Vercel logs after 1 hour)

---

## 📋 All Services to Update

| Service | Action | Link |
|---------|--------|------|
| Vercel | Add environment variables | [Dashboard](https://vercel.com) |
| Google OAuth | Update redirect URIs | [Console](https://console.cloud.google.com/apis/credentials) |
| Stripe | Add webhook endpoint | [Dashboard](https://dashboard.stripe.com/webhooks) |
| Stripe | Update Connect redirects | [Settings](https://dashboard.stripe.com/settings/connect) |
| Resend | Verify domain | [Domains](https://resend.com/domains) |
| UploadThing | Add allowed origin | [Dashboard](https://uploadthing.com/dashboard) |
| Domain Registrar | Update DNS records | (Your registrar's dashboard) |

---

## 🆘 Troubleshooting

**Auth not working?**
- Check `NEXTAUTH_URL` matches your domain exactly
- Verify Google OAuth redirect URIs are correct

**Stripe failing?**
- Make sure you're using LIVE keys (pk_live_, sk_live_)
- Check webhook endpoint is receiving events

**Emails not sending?**
- Verify domain in Resend
- Check DNS records are properly configured
- Check `EMAIL_FROM` uses your verified domain

**Images not uploading?**
- Add domain to UploadThing allowed origins

---

Need the full guide? See `PRODUCTION_SETUP_GUIDE.md`
