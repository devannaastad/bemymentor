# BeMyMentor Search & Discovery Improvement Plan

## Overview
This document outlines the comprehensive upgrade to the mentor search and discovery system.

## Phase 1: Enhanced Search API ✅ (Mostly Done)
The current API already supports:
- Text search across name, tagline, and skills
- Category filtering
- Price range filtering
- Skills filtering
- Offer type filtering (ACCESS/TIME/BOTH)
- Sorting (rating, newest, reviews, price)
- Pagination

### Improvements Needed:
1. **Add relevancy scoring** - Weight matches in name higher than tagline
2. **Full-text search** - Use PostgreSQL `ts_vector` for better search
3. **Add more filters**:
   - Rating minimum (e.g., 4+ stars)
   - Verified mentors only
   - Available soon (has availability in next 7 days)
   - Languages spoken
   - Years of experience
4. **Search suggestions API** - Autocomplete endpoint

## Phase 2: UI/UX Improvements (HIGH PRIORITY)

### 2.1 Prominent Search Hero
```
┌────────────────────────────────────────────┐
│  What do you want to learn?                │
│  ┌──────────────────────────────────────┐  │
│  │ [Search icon] e.g., "Valorant coaching" │ │
│  └──────────────────────────────────────┘  │
│  Popular: Gaming • Trading • Streaming     │
└────────────────────────────────────────────┘
```

### 2.2 Advanced Filters Panel
- **Category pills** (Gaming, Trading, Streaming, YouTube)
- **Price range slider** ($0 - $500+)
- **Session type toggle** (Instant Access vs Live Session)
- **Rating filter** (4+ stars, 4.5+ stars, etc.)
- **Availability** ("Available this week")
- **Sort dropdown** (Best Match, Top Rated, Lowest Price, Newest)

### 2.3 Improved Mentor Cards
Each card should show:
- Profile photo + verified badge
- Name + primary skill (e.g., "Valorant Coach")
- Rating (⭐ 4.8 • 127 reviews)
- Price (Starting at $X/session)
- Quick stats (Years exp, Sessions taught)
- "Save" heart icon
- "Book Now" CTA

### 2.4 Empty States
- "No results found" with suggestions
- "Try these popular mentors instead..."
- Clear filters button

### 2.5 Mobile Responsive
- Filters in slide-out panel
- Stacked mentor cards
- Sticky search bar

## Phase 3: Database Enhancements

### Add to Mentor model:
```prisma
model Mentor {
  // Existing fields...

  // New fields for better search:
  yearsExperience   Int?           // How many years coaching
  languages         String[]       @default(["English"]) // Languages spoken
  responseTime      String?        // "Within 24 hours"
  totalSessions     Int            @default(0) // Total sessions taught
  repeatBookings    Int            @default(0) // Students who booked again

  // Search optimization:
  searchVector      String?        // PostgreSQL full-text search vector
  popularityScore   Float          @default(0) // Calculated score for ranking
}
```

## Phase 4: Advanced Features (FUTURE)

### 4.1 Personalization
- "Recommended for you" based on past views/bookings
- Save search preferences
- Email alerts for new mentors matching criteria

### 4.2 Analytics
- Track search queries
- Monitor filter usage
- A/B test different layouts

### 4.3 Real-time Availability
- Show "Next available: Tomorrow at 2pm"
- Filter by "Available this week"

## Implementation Priority

**Week 1** (Essential):
1. Improved search bar with placeholder examples
2. Better filter UI (category pills, price slider)
3. Enhanced mentor cards
4. Mobile-responsive filters

**Week 2** (Important):
1. Search autocomplete/suggestions
2. Relevancy scoring in API
3. Empty states and helpful suggestions
4. Rating filter

**Week 3** (Nice to have):
1. Database fields for languages, experience
2. Full-text search optimization
3. Availability filtering
4. Analytics setup

## Technical Stack

- **Frontend**: React with client-side filtering + debounced API calls
- **Backend**: Next.js API routes with Prisma
- **Search**: PostgreSQL full-text search (or Meilisearch if needed later)
- **UI**: Tailwind CSS with responsive design
- **State**: URL search params for shareable filter states

## Success Metrics

- Reduce "no results" searches by 50%
- Increase mentor profile clicks by 30%
- Improve booking conversion rate by 20%
- Reduce average time to find a mentor by 40%

## Files to Modify

1. `/app/catalog/page.tsx` - Main catalog page
2. `/app/api/mentors/route.ts` - Search API
3. `/components/catalog/MentorCard.tsx` - Card design
4. `/components/catalog/SearchBar.tsx` - NEW: Prominent search
5. `/components/catalog/FilterPanel.tsx` - NEW: Advanced filters
6. `/components/catalog/CategoryPills.tsx` - NEW: Quick category filter
7. `/prisma/schema.prisma` - Database schema updates
