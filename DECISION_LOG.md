# Decision Log - Drone Operations Coordinator AI Agent

**Developer:** Claude AI  
**Timeline:** 6 hours  
**Date:** February 10, 2026

---

## Key Assumptions

### 1. **Data Synchronization Strategy**
- **Assumption:** Real-time Google Sheets sync is handled server-side via Google Sheets API
- **Rationale:** Client-side direct Google Sheets access poses security risks (exposed API keys)
- **Implementation:** Built a React frontend that would connect to a backend API endpoint (not fully implemented due to time constraints, but architecture designed for it)
- **Production Approach:** Use Google Apps Script or Node.js backend to handle OAuth and API calls

### 2. **Conversation Interface Priority**
- **Assumption:** Users prefer natural language over complex forms
- **Rationale:** Operations coordinators are busy; conversational AI reduces cognitive load
- **Implementation:** Built NLP-lite query processing with pattern matching for common intents
- **Examples Supported:**
  - "Who's available for Mapping?"
  - "Assign P001 to PRJ001"
  - "Show urgent missions"
  - "Check for conflicts"

### 3. **Data Model Extensions**
Added fields beyond provided CSV samples:
- **Pilots:** `available_from` (date) - tracks when pilot returns from leave
- **Missions:** `assigned_pilot`, `assigned_drone` - tracks assignments
- **Drones:** Kept original structure
- **Rationale:** Needed temporal data for conflict detection and assignment tracking

---

## Trade-offs Chosen

### 1. **Client-Side State vs. Backend Database**
**Chosen:** Client-side React state with simulated persistence  
**Alternative:** Full backend with PostgreSQL/MongoDB

**Why:**
- ✅ Faster prototyping within 6-hour timeline
- ✅ Demonstrates all core functionality
- ✅ Easy to extend to real backend (data models are ready)
- ❌ No true persistence (would reset on page refresh)
- ❌ No multi-user concurrent access

**Production Path:** Migrate state to Redux + Node.js backend with Google Sheets bidirectional sync

### 2. **Conflict Detection Approach**
**Chosen:** Eager validation (check before assignment)  
**Alternative:** Lazy validation (check after assignment)

**Why:**
- ✅ Prevents invalid states from being saved
- ✅ Provides immediate feedback to user
- ✅ Easier to undo/rollback
- ❌ Slightly slower assignment flow

**Implementation Details:**
```javascript
Conflicts checked:
1. Pilot unavailability (On Leave)
2. Skill/certification mismatches
3. Location mismatches (warning, not blocker)
4. Double-booking (pilot or drone)
5. Drone in maintenance
```

### 3. **Smart Assignment Logic**
**Chosen:** Auto-suggest best pilot when not specified  
**Alternative:** Require manual pilot selection always

**Why:**
- ✅ Saves coordinator time
- ✅ Uses algorithmic matching (skills + location + availability)
- ✅ User can override by specifying pilot ID
- ❌ May not account for soft factors (pilot preference, past performance)

**Matching Algorithm:**
```
1. Filter by status: 'Available'
2. Filter by required skills (ALL must match)
3. Filter by required certifications (ALL must match)
4. Prefer pilots in same location as mission
5. Return first match
```

---

## Urgent Reassignment Interpretation

### Problem Statement
> "The agent should help coordinate urgent reassignments"

### My Interpretation
Urgent reassignments occur in two scenarios:

#### **Scenario A: New Urgent Mission Arrives**
- Mission has `priority: "Urgent"`
- No pilot assigned yet
- Need immediate staffing

**Implementation:**
- Command: "Show urgent missions" or "urgent"
- Agent lists all urgent missions without assignments
- Provides auto-recommended pilot
- User can confirm with one command: "Assign to PRJ002"

#### **Scenario B: Emergency Pilot Replacement**
- Assigned pilot suddenly unavailable (injury, equipment failure, etc.)
- Need to quickly find replacement

**Implementation:**
- Coordinator marks pilot as "On Leave"
- Agent detects conflict in next "Check conflicts" scan
- Agent suggests replacement pilot from available pool
- Quick reassignment command supported

### Why This Interpretation?
- **Real-world alignment:** Matches actual drone operations emergencies
- **Time-critical:** Both scenarios require fast decision-making
- **AI value-add:** Agent reduces coordination overhead by pre-computing best matches

### Example Workflow
```
User: "urgent"
Agent: 🚨 Urgent Mission Alert:
       PRJ002 - Client B
       Required: Inspection, Night Ops
       ✅ Recommended: Neha (P002)
       Type "assign P002 to PRJ002"

User: "assign P002 to PRJ002"
Agent: ✅ Assignment successful!
```

---

## What I'd Do Differently With More Time

### 1. **Full Google Sheets Integration** (2-3 hours)
- Implement OAuth 2.0 flow
- Build Node.js/Express backend
- Bidirectional sync: Read on load, Write on update
- Webhook for real-time updates from Sheets

### 2. **Advanced NLP** (3-4 hours)
- Integrate OpenAI GPT-4 or Anthropic Claude API
- Handle complex queries: "Find me a pilot in Mumbai with thermal skills available next week"
- Multi-turn conversations for clarification
- Context retention across queries

### 3. **Conflict Resolution Wizard** (2 hours)
- When conflict detected, offer solutions:
  - "Move pilot from lower-priority mission?"
  - "Delay mission start by 1 day?"
  - "Use different drone from nearby location?"

### 4. **Notifications & Alerts** (1-2 hours)
- Email/Slack notifications for urgent assignments
- Reminder for upcoming maintenance
- Daily briefing: "3 missions start tomorrow, all staffed ✅"

### 5. **Analytics Dashboard** (2-3 hours)
- Pilot utilization rates
- Average assignment time
- Conflict frequency trends
- Fleet maintenance schedule calendar

### 6. **Mobile Optimization** (1-2 hours)
- Progressive Web App (PWA)
- Offline support
- Push notifications
- Touch-optimized UI

### 7. **Multi-tenancy** (3-4 hours)
- Different companies/teams
- Role-based access (admin, coordinator, pilot)
- Audit logs for compliance

---

## Architecture Overview

### Tech Stack Choices

**Frontend:**
- **React 18** - Component-based UI, fast development
- **Tailwind CSS** - Rapid styling, responsive design
- **Lucide Icons** - Clean, professional icons

**Why React?**
- Excellent state management
- Rich ecosystem
- Easy to deploy (Vercel, Netlify)
- Industry standard for dashboards

**State Management:**
- **React useState hooks** - Sufficient for prototype
- **Production:** Would use Redux Toolkit or Zustand

**Deployment:**
- **Target:** Vercel (automatic HTTPS, global CDN, zero config)
- **Alternative:** Replit (for live collaboration), Railway (backend needed)

### Data Flow
```
User Input → NLP Parser → Intent Detection → 
  → Business Logic (Conflict Check) → 
  → State Update → 
  → UI Re-render → 
  → (Future: Sync to Google Sheets)
```

### File Structure (Production)
```
/client
  /src
    /components
      - DroneCoordinator.jsx
      - PilotCard.jsx
      - MissionCard.jsx
    /utils
      - conflictDetection.js
      - nlpParser.js
    /api
      - sheetsSync.js
/server
  /routes
    - pilots.js
    - drones.js
    - missions.js
  /services
    - googleSheets.js
  - server.js
```

---

## Edge Cases Handled

✅ **Pilot assigned to overlapping dates**  
- Detection: Date overlap calculation
- Response: High-severity conflict warning

✅ **Pilot lacks required certification**  
- Detection: Array intersection check
- Response: Blocks assignment

✅ **Drone in maintenance**  
- Detection: Status check
- Response: High-severity conflict

✅ **Pilot and drone in different locations**  
- Detection: Location comparison
- Response: Medium-severity warning (allows assignment)

✅ **Auto-suggestion when pilot not specified**  
- Behavior: Finds best match, suggests to user

✅ **Multiple urgent missions**  
- Behavior: Lists all, prioritizes by date

---

## Testing Approach

### Manual Test Cases Covered
1. ✅ Query available pilots
2. ✅ Query pilots by skill
3. ✅ Assign pilot to mission (valid)
4. ✅ Assign pilot to mission (conflict scenarios)
5. ✅ Update pilot status
6. ✅ Check drone availability
7. ✅ Detect conflicts in assignments
8. ✅ Handle urgent mission workflow
9. ✅ Auto-suggestion logic

### Would Add (With More Time)
- Unit tests (Jest)
- Integration tests (Cypress)
- Load testing (if multi-user)
- Accessibility testing (WCAG compliance)

---

## Conclusion

This prototype demonstrates:
- ✅ All 4 core features (Roster, Assignment, Inventory, Conflicts)
- ✅ Natural language interface
- ✅ Conflict detection with severity levels
- ✅ Smart auto-assignment
- ✅ Urgent mission prioritization
- ✅ Clean, professional UI
- ✅ Extensible architecture

**Next Steps for Production:**
1. Backend API (Node.js/Python)
2. Google Sheets OAuth integration
3. Database (PostgreSQL)
4. Enhanced NLP (GPT-4 integration)
5. Real-time notifications
6. Mobile app

**Estimated Production Timeline:** 2-3 weeks with full team
