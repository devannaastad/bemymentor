# Session Reminder Cron Setup

## Overview

The session reminder system sends email and in-app notifications to both mentors and students 1 hour before their scheduled sessions.

## How It Works

1. **Cron job runs every 15 minutes** - Checks for sessions starting in ~1 hour
2. **Sends email reminders** - Both mentor and student get emails
3. **Creates in-app notifications** - Shows up in notification bell
4. **Prevents duplicates** - Tracks `reminderSentAt` to avoid re-sending

## Setup Instructions

### Option 1: Vercel Cron (Recommended for production)

1. Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/session-reminders",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

2. Set environment variable in Vercel:
```
CRON_SECRET=your-random-secret-here
```

3. Deploy to Vercel - cron will run automatically

### Option 2: GitHub Actions (Free alternative)

1. Create `.github/workflows/session-reminders.yml`:

```yaml
name: Session Reminders

on:
  schedule:
    # Runs every 15 minutes
    - cron: '*/15 * * * *'
  workflow_dispatch: # Allow manual triggers

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Session Reminders
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-app.vercel.app/api/cron/session-reminders
```

2. Add `CRON_SECRET` to GitHub repository secrets

### Option 3: External Cron Service (cron-job.org, EasyCron, etc.)

1. Sign up for a free cron service
2. Create a GET request to:
   ```
   https://your-app.vercel.app/api/cron/session-reminders
   ```
3. Add Authorization header:
   ```
   Authorization: Bearer YOUR_CRON_SECRET
   ```
4. Set schedule: Every 15 minutes (`*/15 * * * *`)

## Testing

### Manual trigger for testing:

```bash
# Generate a random CRON_SECRET
export CRON_SECRET=$(openssl rand -hex 32)

# Add to .env.local
echo "CRON_SECRET=$CRON_SECRET" >> .env.local

# Test locally
curl -X GET \
  -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/session-reminders
```

### Expected response:

```json
{
  "ok": true,
  "data": {
    "checked": 5,
    "sent": 3,
    "failed": 0,
    "notifications": 6
  }
}
```

## What Gets Sent

### Email Reminder

- **Subject**: "Reminder: Session with [Name] starts in 1 hour"
- **Content**:
  - Session details (date, time, duration)
  - Meeting link (if available)
  - Link to dashboard

### In-App Notification

- **Title**: "Session starting soon!"
- **Message**: "Your session with [Name] starts in 1 hour at [time]"
- **Link**: Direct link to booking page

## Notification Types

The system creates notifications for:

1. **SESSION_REMINDER** - 1 hour before session (both mentor & student)
2. **SESSION_COMPLETED** - When mentor marks session complete (student only)
3. **SESSION_CONFIRMED** - When student confirms completion (mentor only)

## Database Fields

### Booking Model
- `reminderSentAt` - Timestamp when reminder was sent (prevents duplicates)

### Notification Model
- `bookingId` - Links notification to specific booking
- `type` - Type of notification (SESSION_REMINDER, etc.)
- `isRead` - Whether user has seen it
- `readAt` - When it was read

## Troubleshooting

### Reminders not sending?

1. Check cron is running:
   ```bash
   # View Vercel logs
   vercel logs --follow
   ```

2. Check for errors in database:
   ```sql
   SELECT id, "scheduledAt", "reminderSentAt", status
   FROM "Booking"
   WHERE "scheduledAt" BETWEEN NOW() AND NOW() + INTERVAL '2 hours'
   AND status = 'CONFIRMED';
   ```

3. Verify CRON_SECRET matches

### Duplicate reminders?

- Check `reminderSentAt` field is being set
- Ensure cron isn't running more frequently than every 15 minutes

### Email not delivering?

- Verify RESEND_API_KEY is set
- Check Resend dashboard for delivery status
- Verify EMAIL_FROM domain is verified

## Environment Variables Required

```env
# Required
RESEND_API_KEY=re_xxxxx
CRON_SECRET=your-secret-here

# Optional
EMAIL_FROM="BeMyMentor <noreply@yourdomain.com>"
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Cost Estimates

- **Vercel Cron**: Free on Pro plan
- **Resend**: 3,000 emails/month free, then $20/month for 50k
- **Database queries**: ~96 queries/day (every 15 min) - negligible cost

## Future Enhancements

- [ ] 24-hour advance reminder
- [ ] Custom reminder timing per user
- [ ] SMS notifications (Twilio)
- [ ] Reminder preferences (email only, in-app only, both)
