# Drone Operations Coordinator AI Agent

An intelligent conversational AI assistant for managing drone operations, pilot assignments, and mission coordination.

## 🎯 Overview

This AI agent helps drone operations coordinators efficiently manage:
- **Pilot roster** - Track availability, skills, and assignments
- **Drone fleet** - Monitor inventory, maintenance, and deployments  
- **Mission assignments** - Match pilots and drones to projects
- **Conflict detection** - Prevent double-bookings and skill mismatches
- **Urgent reassignments** - Quickly staff high-priority missions

## ✨ Features

### 1. Roster Management
- Query pilot availability by skill, certification, location
- View current assignments
- Update pilot status (Available / On Leave / Unavailable)
- Track when pilots return from leave

### 2. Assignment Tracking  
- Smart auto-matching of pilots to missions
- Manual assignment with conflict validation
- Track active assignments across all projects
- Reassignment capabilities

### 3. Drone Inventory
- Query fleet by capability, availability, location
- Track deployment status and assignments
- Flag maintenance issues
- Update drone status

### 4. Conflict Detection
Automatically detects and warns about:
- ❌ **Double-booking** - Pilot/drone assigned to overlapping dates
- ❌ **Skill mismatch** - Pilot lacks required skills
- ❌ **Certification issues** - Missing required certifications  
- ⚠️ **Location mismatch** - Pilot/drone in different city than mission
- ❌ **Maintenance conflicts** - Drone assigned while in maintenance
- ❌ **Availability issues** - Pilot on leave during mission dates

### 5. Urgent Reassignment
- Prioritizes urgent missions
- Auto-recommends best available pilot
- Quick assignment workflow
- Emergency replacement suggestions

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React 18 + Tailwind CSS
- **Icons:** Lucide React
- **State Management:** React Hooks (useState)
- **Deployment:** Vercel/Replit/Railway compatible

### Component Structure
```
DroneCoordinator (Main Component)
├── Header (Stats & Sync Status)
├── Dashboard Stats (4 metric cards)
├── Chat Interface
│   ├── Message History
│   ├── Loading Indicator
│   └── Input Area
└── Business Logic
    ├── NLP Query Parser
    ├── Conflict Detector
    ├── Auto-Assignment Engine
    └── State Management
```

### Data Models

**Pilot:**
```javascript
{
  pilot_id: string,
  name: string,
  skills: string[],
  certifications: string[],
  location: string,
  status: 'Available' | 'Assigned' | 'On Leave',
  current_assignment: string | null,
  available_from: date
}
```

**Drone:**
```javascript
{
  drone_id: string,
  model: string,
  capabilities: string[],
  status: 'Available' | 'Maintenance' | 'Assigned',
  location: string,
  current_assignment: string | null,
  maintenance_due: date
}
```

**Mission:**
```javascript
{
  project_id: string,
  client: string,
  location: string,
  required_skills: string[],
  required_certs: string[],
  start_date: date,
  end_date: date,
  priority: 'Standard' | 'High' | 'Urgent',
  assigned_pilot: string | null,
  assigned_drone: string | null
}
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. **Extract the ZIP file**
```bash
unzip drone-coordinator.zip
cd drone-coordinator
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:5173
```

### Deployment

**Vercel (Recommended):**
```bash
npm install -g vercel
vercel
```

**Replit:**
1. Upload files to Replit
2. Set run command: `npm run dev`
3. Click "Run"

## 💬 Usage Examples

### Basic Queries
```
"Who's available?"
"Available pilots with Mapping skills"
"Show me drones"
"What missions do we have?"
```

### Assignment Operations
```
"Assign P001 to PRJ001"
"Assign to PRJ002"  (auto-suggests best pilot)
"Update P001 status to On Leave"
```

### Conflict Detection
```
"Check for conflicts"
"Any issues with current assignments?"
```

### Urgent Missions
```
"Show urgent missions"
"urgent"
"Need immediate assignment for PRJ002"
```

## 🔧 Configuration

### Google Sheets Integration (Future)
To enable 2-way sync with Google Sheets:

1. Create Google Cloud Project
2. Enable Google Sheets API
3. Create OAuth 2.0 credentials
4. Add backend API endpoint (Node.js/Python)
5. Implement sync logic:
   - Read: On app load
   - Write: On status/assignment updates

**Backend Structure:**
```javascript
// server.js
const express = require('express');
const { google } = require('googleapis');

app.post('/api/sync-pilots', async (req, res) => {
  const sheets = google.sheets({ version: 'v4', auth });
  // Sync logic here
});
```

## 🧪 Testing

### Manual Test Scenarios

**Scenario 1: Available Pilot Query**
- Input: "Who's available?"
- Expected: List of pilots with status='Available'

**Scenario 2: Assignment with Conflict**
- Input: "Assign P004 to PRJ001"
- Expected: Warning - Pilot on leave

**Scenario 3: Smart Assignment**
- Input: "Assign to PRJ001"
- Expected: Auto-suggests P001 (has Mapping + DGCA)

**Scenario 4: Location Mismatch**
- Input: "Assign P003 to PRJ001"  
- Expected: Warning - Pilot in Mumbai, Project in Bangalore

**Scenario 5: Urgent Mission**
- Input: "urgent"
- Expected: Shows PRJ002 with auto-recommendation

## 📊 Data Flow

```
User Query
    ↓
NLP Parser (Pattern Matching)
    ↓
Intent Detection
    ↓
Business Logic Layer
    ├── Roster Management
    ├── Assignment Logic
    ├── Conflict Detection
    └── State Updates
    ↓
UI Update (React Re-render)
    ↓
(Future: Sync to Google Sheets)
```

## 🔒 Security Considerations

### Current (Prototype)
- No authentication (demo mode)
- Client-side state only
- No sensitive data exposure

### Production Requirements
- OAuth 2.0 for Google Sheets
- JWT authentication for API
- Role-based access control
- HTTPS only
- API rate limiting
- Input sanitization
- Audit logs

## 🎨 UI/UX Features

- **Real-time stats** - Dashboard shows live counts
- **Color-coded severity** - Red (high), Yellow (medium), Green (success)
- **Conversational interface** - Natural language queries
- **Auto-complete suggestions** - Quick action buttons
- **Responsive design** - Works on desktop and tablet
- **Loading states** - Clear feedback during processing
- **Error handling** - Graceful degradation

## 📈 Future Enhancements

### Short-term (1-2 weeks)
- [ ] Google Sheets bidirectional sync
- [ ] Backend API (Node.js/Express)
- [ ] PostgreSQL database
- [ ] Enhanced NLP (GPT-4 integration)

### Medium-term (1-2 months)
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Calendar integration
- [ ] Pilot mobile check-in
- [ ] Advanced analytics dashboard

### Long-term (3-6 months)
- [ ] Multi-tenancy support
- [ ] Machine learning for assignment optimization
- [ ] Predictive maintenance alerts
- [ ] Integration with flight planning software
- [ ] Automated compliance reporting

## 🐛 Known Limitations

1. **No persistence** - Data resets on page refresh (use localStorage or backend)
2. **No authentication** - Anyone can access (add auth layer)
3. **Single user** - No concurrent access handling (add WebSocket)
4. **Simple NLP** - Pattern matching only (integrate GPT-4)
5. **No Google Sheets sync** - Prototype mode (needs backend implementation)

## 📝 Edge Cases Handled

✅ Pilot assigned to overlapping mission dates  
✅ Pilot assigned to job requiring skills they lack  
✅ Pilot assigned to job requiring certifications they lack  
✅ Drone assigned but currently in maintenance  
✅ Pilot and assigned drone in different locations  
✅ Auto-suggestion when pilot ID not specified  
✅ Multiple urgent missions prioritization  
✅ Status updates reflected in assignments  

## 🤝 Contributing

This is a technical assignment prototype. For production use:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is created as a technical assignment for Skylark Drones.

## 👤 Author

**Claude AI**  
Technical Assignment - Drone Operations Coordinator

## 📧 Support

For questions or issues, please refer to the Decision Log or contact the development team.

---

**Built with ❤️ for Skylark Drones**
