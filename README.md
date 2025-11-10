# BeMyMentor

A Next.js-based mentorship platform that connects learners with expert mentors. Users can browse mentors, book 1-on-1 sessions or purchase ACCESS passes, and manage their learning journey.

## Features

### For Learners
- **Browse Mentors**: Search and filter mentors by category, price, and offer type
- **Mentor Profiles**: View detailed mentor profiles with ratings, reviews, and social links
- **Booking System**: Book 1-on-1 sessions or purchase ACCESS passes
- **Secure Payments**: Integrated Stripe checkout for safe transactions
- **Dashboard**: Track bookings, saved mentors, and application status
- **Email Notifications**: Receive confirmation emails for all bookings

### For Mentors
- **Application Flow**: Apply to become a mentor with proof of expertise
- **Profile Setup**: Complete mentor profile with bio, social links, and profile image
- **Mentor Dashboard**: Manage incoming bookings, accept/decline requests
- **Flexible Pricing**: Offer ACCESS passes, hourly sessions, or both
- **Payment Processing**: Automatic payment handling via Stripe
- **Email Notifications**: Get notified of new bookings instantly

### For Admins
- **Application Review**: Approve or reject mentor applications
- **User Management**: Oversee platform users and mentors
- **Booking Analytics**: Track platform activity

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth v5 (Google OAuth)
- **Payments**: Stripe Checkout & Webhooks
- **Email**: Resend with React Email
- **File Uploads**: UploadThing
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Stripe account (for payments)
- Resend account (for emails)
- UploadThing account (for file uploads)
- Google OAuth credentials

### Environment Variables

Create a `.env` file in the root directory with the following variables (see `.env.example`):

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# UploadThing
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Email (Resend)
RESEND_API_KEY="re_xxx"

# Stripe
STRIPE_PUBLIC_KEY="pk_test_xxx"
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxx"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd bemymentor
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### Stripe Webhook Setup

For local development, use the Stripe CLI:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to local server:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
4. Copy the webhook signing secret to your `.env` file as `STRIPE_WEBHOOK_SECRET`

For production, configure a webhook endpoint in your Stripe dashboard:
- URL: `https://yourdomain.com/api/webhooks/stripe`
- Events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`

## Project Structure

```
bemymentor/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── bookings/        # Booking CRUD endpoints
│   │   ├── checkout-session/ # Stripe checkout session creation
│   │   ├── webhooks/stripe/ # Stripe webhook handler
│   │   └── ...
│   ├── bookings/            # Booking pages
│   ├── catalog/             # Mentor catalog/search
│   ├── dashboard/           # User dashboard
│   ├── mentor-dashboard/    # Mentor management
│   ├── mentors/[id]/        # Mentor detail pages
│   └── ...
├── components/
│   ├── booking/             # Booking form & payment components
│   ├── catalog/             # Mentor cards & filters
│   ├── common/              # Shared UI components
│   └── ...
├── lib/
│   ├── db.ts               # Prisma client
│   ├── email.ts            # Email sending utilities
│   ├── emails/             # Email templates (React Email)
│   ├── stripe.ts           # Stripe configuration
│   ├── schemas/            # Zod validation schemas
│   └── utils/              # Helper functions
├── prisma/
│   └── schema.prisma       # Database schema
└── ...
```

## Recent Updates

### Booking Flow & Payment Integration (Latest)

1. **Profile Images**:
   - Added profile image display to mentor cards and detail pages
   - Fallback avatar with gradient background for mentors without images

2. **Stripe Payment Integration**:
   - Created `/api/checkout-session` endpoint for Stripe checkout
   - Implemented Stripe webhook handler for payment confirmations
   - Updated booking confirmation page with payment states
   - Added `PaymentButton` component for initiating checkout

3. **Email Notifications**:
   - Booking confirmation emails sent to learners after payment
   - Mentor notification emails for new bookings
   - Beautiful HTML email templates with booking details

4. **Payment Flow**:
   - Create booking → Redirect to Stripe Checkout → Payment → Webhook updates status → Emails sent
   - Bookings start as `PENDING`, move to `CONFIRMED` after successful payment
   - Full payment tracking with `stripePaymentIntentId` and `stripePaidAt`

## Database Schema

Key models:

- **User**: NextAuth users with profile info
- **Mentor**: Mentor profiles with pricing and availability
- **Booking**: Booking records with payment tracking
- **Application**: Mentor application workflow
- **SavedMentor**: User's saved/favorited mentors

See `prisma/schema.prisma` for full schema.

## API Routes

### Bookings
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `GET /api/mentor/bookings` - Get mentor's bookings
- `PATCH /api/mentor/bookings/[id]` - Update booking status

### Payments
- `POST /api/checkout-session` - Create Stripe checkout session
- `POST /api/webhooks/stripe` - Handle Stripe webhook events

### Mentors
- `GET /api/mentors` - List/search mentors
- `POST /api/mentor-setup` - Complete mentor profile setup

### Applications
- `POST /api/applications` - Submit mentor application
- `GET /api/applications` - List applications (admin)
- `PATCH /api/admin/applications/[id]` - Review application

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add all environment variables
4. Deploy

### Stripe Configuration

- Set up webhook endpoint in production
- Configure Stripe Connect for mentor payouts (future feature)
- Test payments in Stripe test mode first

### Database

- Use a managed PostgreSQL provider (Supabase, Neon, Railway, etc.)
- Run migrations: `npx prisma migrate deploy`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add my feature"`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please open a GitHub issue or contact support@bemymentor.dev

---

Built with ❤️ using Next.js and Stripe
