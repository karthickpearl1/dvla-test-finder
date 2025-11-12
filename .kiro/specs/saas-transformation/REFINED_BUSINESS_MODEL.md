# UK Driving Test Booking Service - Refined Business Model

## Executive Summary

A **pay-per-use booking service** that finds and optionally books alternative driving test dates/centres for users. One centralized service handles all user requests efficiently.

**Key Insight:** This is NOT a SaaS subscription model. It's a **concierge booking service** with one-time or unlimited plans per license.

## Your Vision (Clarified)

### Core Service Flow

```
User Signs Up
    ↓
Creates Request (up to 3 preferences)
    ├─ Preference 1: Specific Centre + Date Range
    ├─ Preference 2: Specific Centre + Date Range
    ├─ Preference 3: ANY Location + Date Range
    └─ (or any combination of specific/any)
    ↓
Chooses Service Level
    ├─ Notify Only (when slot found)
    └─ Auto-Book (book first available + notify)
    ↓
Service Monitors (centralized)
    ↓
Slot Found → Action Taken
    ├─ Notify Only: Email sent
    └─ Auto-Book: Booking made + Email sent
    ↓
User Confirms Receipt
    ↓
Request Marked COMPLETED
```

### Preference Options

**Users can configure each preference as:**

1. **Specific Centre + Date Range**
   - Example: "London (Hendon) between Jan 15 - Feb 15"
   - Most specific, highest priority

2. **ANY Location + Date Range**
   - Example: "Any centre between Jan 10 - Jan 20"
   - Maximum flexibility, fastest results
   - Useful for urgent bookings

3. **Multiple Centres + Date Range**
   - Example: "London (Hendon) OR London (Mill Hill) between Jan 15 - Feb 15"
   - Flexibility within preferred area

**Priority Matching:**
- Service checks preferences in order (1, 2, 3)
- First match wins (books or notifies)
- "ANY location" typically finds slots fastest

### Key Rules

1. **Per License Pricing:** Each driving license = separate payment
2. **Request-Based:** User creates "requests" with preferences
3. **One-Time or Unlimited:** Two plan types per license
4. **3-Week Guarantee:** Refund if no slot found in 3 weeks
5. **No Refund After Use:** If service finds/books once, no refund
6. **Centralized Service:** One instance serves all users

## Revised Pricing Model (Psychology-Optimized)

### Recommended Pricing Structure

#### Option A: Simple Two-Tier (Recommended)

**1. One-Time Request - £19.99**
- Find and notify OR auto-book ONE slot
- Up to 3 test centre preferences
- Up to 3-week date range per centre
- Email + SMS notifications
- 3-week money-back guarantee
- Request expires after successful booking
- **Psychology:** Low commitment, try before unlimited

**2. Unlimited (3 Months) - £49.99**
- Unlimited requests for 3 months
- Same features as One-Time
- Create new requests as old ones complete
- Priority processing (checked first)
- **Psychology:** Better value, encourages commitment

**3. Unlimited (6 Months) - £79.99** ⭐ Best Value
- Everything in 3-month plan
- 6 months of unlimited requests
- Highest priority processing
- **Psychology:** Anchoring effect, makes 3-month look good

#### Option B: Tiered by Features

**1. Notify Only - £14.99 (One-Time)**
- Service finds slots and notifies you
- You book manually
- Up to 3 preferences
- **Psychology:** Lower entry point

**2. Auto-Book - £24.99 (One-Time)**
- Service automatically books for you
- Notifies after booking
- Up to 3 preferences
- **Psychology:** Premium for convenience

**3. Unlimited Auto-Book - £59.99 (3 Months)**
- Unlimited auto-booking requests
- Priority processing
- **Psychology:** Best for serious users

#### Option C: Freemium + Premium (Growth Focused)

**1. Free Trial**
- One request (notify only)
- 1 test centre preference
- 1-week date range
- Email notifications only
- **Psychology:** Try before buy, lead generation

**2. Standard - £19.99 (One-Time)**
- Notify or auto-book
- 3 preferences
- 3-week date range
- Email + SMS
- **Psychology:** Proven value from free trial

**3. Premium - £49.99 (3 Months)**
- Unlimited requests
- Priority processing
- Dedicated support
- **Psychology:** Upgrade path from standard

### My Recommendation: **Option A with Twist**

```
┌─────────────────────────────────────────────────────────┐
│                    PRICING TABLE                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🎯 One-Time Request          £19.99                    │
│     ✓ Find & book ONE slot                              │
│     ✓ Up to 3 centre preferences                        │
│     ✓ Auto-book or notify                               │
│     ✓ 3-week guarantee                                  │
│     ✓ Perfect for: First-time users                     │
│                                                          │
│  ⚡ Unlimited (3 Months)      £49.99                    │
│     ✓ Unlimited requests                                │
│     ✓ Priority processing                               │
│     ✓ Same features as One-Time                         │
│     ✓ Perfect for: Flexible learners                    │
│                                                          │
│  ⭐ Unlimited (6 Months)      £79.99  [BEST VALUE]     │
│     ✓ Everything in 3-month                             │
│     ✓ Highest priority                                  │
│     ✓ Save £20 vs 2x 3-month                           │
│     ✓ Perfect for: Long-term planning                   │
│                                                          │
└─────────────────────────────────────────────────────────┘

💡 Additional License: +£15/month per extra license
```

### Psychology Tactics to Maximize Revenue

#### 1. **Anchoring Effect**
- Show 6-month plan first (£79.99)
- Makes 3-month (£49.99) look reasonable
- Makes one-time (£19.99) look like a steal

#### 2. **Decoy Pricing**
Add a "Premium One-Time" option:
- **One-Time Standard:** £19.99 (3 preferences)
- **One-Time Premium:** £29.99 (5 preferences) ← Decoy
- **Unlimited 3-Month:** £49.99 (unlimited)

Most will choose Unlimited because Premium One-Time looks bad value.

#### 3. **Urgency & Scarcity**
- "Only 50 slots available this month"
- "Join 247 learners who found slots this week"
- "Average booking time: 4.2 days"

#### 4. **Social Proof**
- "Sarah from London booked in 2 days"
- "98% success rate in finding slots"
- "£2.1M saved in test fees for our users"

#### 5. **Loss Aversion**
- "Don't wait 6 months for a test"
- "Slots fill up in minutes - we catch them"
- "Failed tests cost £62 + instructor fees"

#### 6. **Bundling**
**Family Plan - £89.99 (3 Months)**
- 2 licenses included
- Unlimited requests for both
- Save £10 vs individual plans
- **Psychology:** Perceived value, higher AOV

**Instructor Plan - £149.99 (3 Months)**
- 5 licenses included
- Unlimited requests for all
- Priority support
- **Psychology:** B2B pricing, higher margins

#### 7. **Upsells & Add-Ons**

**During Checkout:**
- ✅ Priority Processing: +£5 (checked first)
- ✅ SMS Notifications: +£3 (instant alerts)
- ✅ Extended Guarantee: +£5 (6 weeks instead of 3)
- ✅ Booking Concierge: +£10 (we handle everything)

**After First Success:**
- "Need another slot? Get Unlimited for £39.99 (£10 off)"
- "Refer a friend, both get £5 credit"

#### 8. **Tiered Success Fees** (Alternative Model)

Instead of upfront payment:
- **Free to use**
- **£29.99 when we find a slot** (notify only)
- **£39.99 when we book a slot** (auto-book)
- **Psychology:** No risk, pay only for results

**Pros:**
- Lower barrier to entry
- Higher conversion rate
- Users feel less risk

**Cons:**
- Revenue only when successful
- Need payment method upfront
- Potential disputes

#### 9. **Subscription Hybrid** (Best of Both Worlds)

**Pay-As-You-Go:**
- £19.99 per request
- No commitment

**Subscription (Better Value):**
- £29.99/month = 2 requests/month
- £49.99/month = unlimited requests
- Cancel anytime

**Psychology:** 
- Subscription feels like better value
- Recurring revenue for you
- Users stay longer

### Revenue Optimization Strategies

#### Strategy 1: Maximize Average Order Value (AOV)

**Current AOV:** £19.99 (one-time)

**Tactics:**
1. Default to 3-month plan (£49.99)
2. Show savings: "Save £10 vs 3x one-time"
3. Add-ons at checkout: +£5-10
4. **Target AOV:** £55-60

#### Strategy 2: Maximize Lifetime Value (LTV)

**Current LTV:** £19.99 (one-time user)

**Tactics:**
1. Email after first success: "Need another? £39.99 for 3 months"
2. Referral program: "Refer 3 friends, get 1 month free"
3. Loyalty rewards: "5th request free"
4. **Target LTV:** £80-100

#### Strategy 3: Maximize Conversion Rate

**Current:** Unknown

**Tactics:**
1. Free trial (1 request, notify only)
2. Money-back guarantee (3 weeks)
3. Social proof (testimonials, stats)
4. Live chat support
5. **Target Conversion:** 5-10%

#### Strategy 4: Reduce Churn

**For Unlimited Plans:**

**Tactics:**
1. Send weekly updates: "We checked 47 times this week"
2. Success stories: "John found a slot in 3 days"
3. Proactive support: "Need help with preferences?"
4. **Target Retention:** 80%+ for 3-month plan

### Recommended Final Pricing (Optimized)

```
┌─────────────────────────────────────────────────────────┐
│                  SMART PRICING                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🎯 One Request                £19.99                   │
│     Perfect for trying us out                            │
│                                                          │
│  ⚡ 3-Month Unlimited          £49.99  [POPULAR]        │
│     Save £10 vs 3 one-time requests                     │
│     Most flexible option                                 │
│                                                          │
│  ⭐ 6-Month Unlimited          £79.99  [BEST VALUE]     │
│     Save £40 vs 6 one-time requests                     │
│     Highest priority processing                          │
│                                                          │
│  👨‍👩‍👧‍👦 Family (2 Licenses)      £89.99/3mo              │
│     Save £10 vs individual plans                         │
│                                                          │
│  🚗 Instructor (5 Licenses)    £199.99/3mo             │
│     Manage all students in one place                     │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Add-Ons (Optional)                                      │
│  ✓ Priority Processing         +£5                      │
│  ✓ SMS Notifications           +£3                      │
│  ✓ Booking Concierge           +£10                     │
└─────────────────────────────────────────────────────────┘
```

## Revised Architecture (Request-Based)

### Simplified Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PUBLIC WEBSITE                        │
│                                                          │
│  - Create Account (per license)                          │
│  - Create Request (3 preferences)                        │
│  - Choose Plan (one-time or unlimited)                   │
│  - Pay (Stripe)                                          │
│  - View Request Status                                   │
│  - Confirm Booking Receipt                               │
└──────────────────┬───────────────────────────────────────┘
                   │ REST API
                   ▼
┌─────────────────────────────────────────────────────────┐
│                    API SERVICE                           │
│                                                          │
│  - User Management (per license)                         │
│  - Request Management (CRUD)                             │
│  - Payment Processing (Stripe)                           │
│  - Status Updates                                        │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│                  DATABASE                                │
│                                                          │
│  - Users (license_number, email, phone)                  │
│  - Plans (one_time, unlimited_3mo, unlimited_6mo)        │
│  - Requests (preferences, status, priority)              │
│  - Bookings (confirmed, pending, failed)                 │
└─────────────────────────────────────────────────────────┘
                   ▲
                   │
┌─────────────────────────────────────────────────────────┐
│              CENTRALIZED MONITOR                         │
│         (Single Instance - Enhanced)                     │
│                                                          │
│  1. Query active requests from database                  │
│  2. Check DVSA for matching slots                        │
│  3. When match found:                                    │
│     - Notify Only: Send email/SMS                        │
│     - Auto-Book: Make booking + Send email/SMS           │
│  4. Update request status                                │
│  5. Wait for user confirmation                           │
│  6. Mark request as COMPLETED                            │
│                                                          │
│  Runs every 5-15 minutes (configurable)                  │
└─────────────────────────────────────────────────────────┘
```

### Database Schema (Simplified)

```sql
-- Users (one per license)
users (
  id UUID PRIMARY KEY,
  license_number VARCHAR(20) UNIQUE NOT NULL,
  booking_reference VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Plans (purchased by users)
plans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plan_type ENUM('one_time', 'unlimited_3mo', 'unlimited_6mo'),
  price DECIMAL(10,2),
  purchased_at TIMESTAMP,
  expires_at TIMESTAMP,
  requests_used INT DEFAULT 0,
  stripe_payment_id VARCHAR(255),
  refunded BOOLEAN DEFAULT FALSE
)

-- Requests (created by users)
requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plan_id UUID REFERENCES plans(id),
  
  -- Preferences (up to 3)
  -- Each preference can be:
  -- {type: 'specific', centre_id: 123, date_from: '2024-01-15', date_to: '2024-02-15'}
  -- {type: 'any_location', date_from: '2024-01-10', date_to: '2024-01-20'}
  -- {type: 'multiple', centre_ids: [123, 456], date_from: '2024-01-15', date_to: '2024-02-15'}
  preferences JSONB,
  
  -- Service level
  service_type ENUM('notify_only', 'auto_book'),
  
  -- Status
  status ENUM('active', 'slot_found', 'booking_made', 'confirmed', 'completed', 'expired', 'refunded'),
  priority INT DEFAULT 0, -- Higher for unlimited plans
  
  -- Tracking
  created_at TIMESTAMP,
  slot_found_at TIMESTAMP,
  booking_made_at TIMESTAMP,
  confirmed_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Metadata
  attempts INT DEFAULT 0,
  last_checked_at TIMESTAMP
)

-- Bookings (when auto-book is used)
bookings (
  id UUID PRIMARY KEY,
  request_id UUID REFERENCES requests(id),
  centre_name VARCHAR(255),
  test_date DATE,
  test_time TIME,
  booking_reference VARCHAR(50),
  screenshot_path VARCHAR(500),
  status ENUM('pending_confirmation', 'confirmed', 'failed'),
  created_at TIMESTAMP
)

-- Notifications (audit trail)
notifications (
  id UUID PRIMARY KEY,
  request_id UUID REFERENCES requests(id),
  type ENUM('slot_found', 'booking_made', 'confirmation_reminder'),
  channel ENUM('email', 'sms'),
  sent_at TIMESTAMP,
  delivered BOOLEAN
)
```

## Request Lifecycle

### State Machine

```
ACTIVE
  ↓ (slot found)
SLOT_FOUND
  ↓ (if notify_only)
  ├─→ User books manually → CONFIRMED → COMPLETED
  ↓ (if auto_book)
BOOKING_MADE
  ↓ (user confirms)
CONFIRMED
  ↓
COMPLETED

Alternative paths:
ACTIVE → (3 weeks, no slot) → EXPIRED → REFUNDED
ACTIVE → (user cancels) → CANCELLED → REFUNDED (if unused)
```

### Request Processing Logic

```javascript
// Pseudo-code for centralized monitor

async function processRequests() {
  // 1. Get all active requests, ordered by priority
  const requests = await db.query(`
    SELECT * FROM requests 
    WHERE status = 'active' 
    ORDER BY priority DESC, created_at ASC
  `);
  
  // 2. For each request
  for (const request of requests) {
    // 3. Check if expired (3 weeks)
    if (isExpired(request, 21)) {
      await markAsExpired(request);
      await processRefund(request);
      continue;
    }
    
    // 4. Check DVSA for matching slots
    const matchingSlots = await checkDVSA(request.preferences);
    // For 'any_location' preferences, checks all available centres
    // For 'specific' preferences, checks only specified centres
    // Returns matches in preference order (1, 2, 3)
    
    // 5. If slot found
    if (matchingSlots.length > 0) {
      const bestSlot = matchingSlots[0]; // First preference match
      
      if (request.service_type === 'notify_only') {
        // Send notification
        await sendNotification(request, bestSlot);
        await updateStatus(request, 'slot_found');
      } else {
        // Auto-book
        const booking = await makeBooking(request, bestSlot);
        await sendNotification(request, booking);
        await updateStatus(request, 'booking_made');
      }
    }
    
    // 6. Update last checked timestamp
    await updateLastChecked(request);
  }
}

// Run every 5-15 minutes
setInterval(processRequests, 5 * 60 * 1000);
```

## Refund Policy (Detailed)

### Automatic Refund Triggers

1. **No Slot Found in 3 Weeks**
   - Automatic refund processed
   - Email notification sent
   - Request marked as EXPIRED

2. **Service Failure**
   - DVSA website down for >48 hours
   - Technical issues preventing monitoring
   - Proactive refund offered

### No Refund Scenarios

1. **Service Used Successfully**
   - Slot found and notified
   - Booking made (even if user doesn't attend)
   - User confirms receipt

2. **User Cancellation After Use**
   - For unlimited plans, if any request completed
   - No pro-rata refunds

3. **User Error**
   - Wrong license details provided
   - Invalid booking reference
   - User books elsewhere without notifying

### Partial Refund (Goodwill)

- Technical issues causing delays: 50% refund
- User dissatisfaction (case-by-case): 25-50% refund

## "Any Location" Feature (Key Differentiator)

### Why This is Powerful

**User Scenario:**
- User needs a test ASAP (failed previous test, urgent need)
- Willing to travel anywhere for earliest slot
- Doesn't care about location, only date

**Traditional Approach:**
- User manually checks multiple centres
- Time-consuming and frustrating
- Slots fill up while searching

**Your Solution:**
- User selects "Any Location" + date range
- Service checks ALL centres automatically
- Finds earliest available slot
- Books it immediately (if auto-book enabled)

### Implementation Strategy

**Efficient Checking:**
```javascript
// For "any location" preferences
async function checkAnyLocation(dateFrom, dateTo) {
  // Use your existing test centre database (from collection)
  const allCentres = await db.query('SELECT * FROM test_centres');
  
  // Check each centre for availability in date range
  for (const centre of allCentres) {
    const slots = await checkCentreAvailability(centre, dateFrom, dateTo);
    if (slots.length > 0) {
      return { centre, slots }; // Return first match
    }
  }
  
  return null; // No slots found
}
```

**Optimization:**
- Check centres by proximity to user's postcode first
- Cache availability data (refresh every 5-15 minutes)
- Prioritize centres with historically high availability

### User Experience

**Preference Configuration UI:**
```
Preference 1:
  ○ Specific Centre: [Dropdown: Select Centre]
  ● Any Location
  Date Range: [Jan 15] to [Feb 15]
  
Preference 2:
  ● Specific Centre: [London (Hendon)]
  ○ Any Location
  Date Range: [Jan 20] to [Feb 28]
  
Preference 3:
  ○ Specific Centre: [Dropdown: Select Centre]
  ○ Any Location
  ○ Skip this preference
```

**Matching Logic:**
1. Check Preference 1 (Any Location, Jan 15-Feb 15)
   - If found → Book/Notify
2. If not found, check Preference 2 (Hendon, Jan 20-Feb 28)
   - If found → Book/Notify
3. If not found, check Preference 3
   - If found → Book/Notify
4. If none found, continue monitoring

### Pricing Implications

**Should "Any Location" cost more?**

**Option 1: Same Price (Recommended)**
- Simpler pricing
- Encourages usage
- Faster results = happier customers

**Option 2: Premium Feature**
- "Any Location" only in Premium/Unlimited plans
- One-time plan limited to specific centres
- **Psychology:** Upsell to unlimited

**Option 3: Add-On**
- Base: 3 specific centre preferences
- +£5: Add "any location" option
- **Psychology:** Perceived premium feature

**My Recommendation:** Include in all plans (same price)
- Faster results = better reviews
- Competitive advantage
- Simpler to explain

### Marketing Angle

**Headline:** "Find a Test Slot Anywhere in the UK - Fast!"

**Value Proposition:**
- "Don't limit yourself to one centre"
- "We check 100+ centres automatically"
- "Get the earliest available slot, anywhere"
- "Most users find slots within 3 days with 'Any Location'"

**Use Cases:**
1. **Urgent Booking:** Failed test, need to rebook ASAP
2. **Flexible Learner:** Willing to travel for earlier date
3. **Rural Areas:** Local centre has long wait times
4. **Backup Option:** Specific centre as preference 1, any location as preference 2

## Competitive Advantages

### vs. fasterdrivingtest.co.uk

**Your Advantages:**
1. ✅ **Auto-booking** (they only notify)
2. ✅ **Multiple preferences** (3 centres + date ranges)
3. ✅ **"Any Location" option** (check all centres automatically) ⭐ UNIQUE
4. ✅ **Flexible plans** (one-time or unlimited)
5. ✅ **Money-back guarantee** (3 weeks)
6. ✅ **Centralized service** (more efficient)
7. ✅ **Request-based** (clear completion criteria)

**Their Advantages:**
- Established brand
- Existing user base
- SEO rankings

**Your Differentiation:**
- "We don't just find slots - we book them for you"
- "Check ANY location in the UK automatically" ⭐
- "Pay once, get unlimited requests for 3 months"
- "3-week guarantee or money back"
- "Most users find slots within 3 days with 'Any Location'"

## Revenue Projections (Revised)

### Conservative Scenario

**Assumptions:**
- 50% choose one-time (£19.99)
- 30% choose 3-month (£49.99)
- 20% choose 6-month (£79.99)
- Average: £35/user

**Month 1:** 20 users × £35 = £700
**Month 3:** 50 users × £35 = £1,750
**Month 6:** 100 users × £35 = £3,500
**Month 12:** 200 users × £35 = £7,000

**Year 1 Revenue:** ~£40,000
**Year 1 Costs:** ~£500 (hosting, domain, email)
**Year 1 Profit:** ~£39,500

### Growth Scenario

**Assumptions:**
- 30% choose one-time (£19.99)
- 40% choose 3-month (£49.99)
- 30% choose 6-month (£79.99)
- Average: £50/user
- 20% buy add-ons (+£8 average)
- Total average: £58/user

**Month 12:** 300 users × £58 = £17,400/month
**Month 24:** 600 users × £58 = £34,800/month

**Year 2 Revenue:** ~£300,000
**Year 2 Costs:** ~£5,000 (scaling costs)
**Year 2 Profit:** ~£295,000

### Instructor Plan Impact

**10 instructors × £199.99 × 4 quarters = £8,000/year**

This alone covers all your costs!

## Why This Model is Better

### vs. Traditional SaaS

**Traditional SaaS:**
- ❌ Ongoing monitoring (users may not need it)
- ❌ Subscription fatigue
- ❌ High churn
- ❌ Continuous value delivery required

**Your Model:**
- ✅ Clear outcome (find/book a slot)
- ✅ One-time or time-limited
- ✅ Pay for results
- ✅ Natural completion point

### Operational Efficiency

**One Centralized Service:**
- Checks DVSA once for all users
- Efficient resource usage
- Easier to maintain
- Scales better

**vs. Individual Instances:**
- Each user running own instance = wasteful
- DVSA gets hammered with requests
- Higher detection risk
- More maintenance

## Implementation Priorities

### Phase 1: MVP (4-6 weeks)

**Must-Have:**
1. User registration (per license)
2. Request creation (3 preferences)
3. Payment (Stripe - one-time only)
4. Centralized monitor (notify only)
5. Status dashboard
6. Email notifications

**Skip for Now:**
- Auto-booking (complex)
- Unlimited plans (add later)
- SMS notifications (add later)
- Add-ons (add later)

### Phase 2: Full Features (2-3 weeks)

**Add:**
7. Auto-booking functionality
8. Unlimited plans (3-month, 6-month)
9. Refund automation (3-week check)
10. User confirmation flow
11. SMS notifications

### Phase 3: Growth (Ongoing)

**Add:**
12. Family plans
13. Instructor plans
14. Add-ons (priority, concierge)
15. Referral program
16. Analytics dashboard

## Next Steps

1. **Validate Pricing**
   - Survey potential users
   - Test willingness to pay
   - A/B test pricing tiers

2. **Refine Requirements**
   - Detailed user flows
   - API specifications
   - Database schema finalization

3. **Build MVP**
   - Start with simplest version
   - One-time payment only
   - Notify only (no auto-book)
   - Prove the concept

4. **Launch & Iterate**
   - Soft launch to small group
   - Gather feedback
   - Add features based on demand

---

**This model is MUCH better because:**
- ✅ Clear value proposition (find/book a slot)
- ✅ Natural completion (request fulfilled)
- ✅ Efficient (one service, many users)
- ✅ Scalable (same cost for 10 or 1000 users)
- ✅ Higher perceived value (£19.99 vs £9.99/month)
- ✅ Lower maintenance (request-based, not continuous)

**Ready to create detailed requirements?**
