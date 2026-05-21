# AttendX — Academic Attendance Intelligence System

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-00f5d4?style=flat-square&logoColor=white" alt="Version"/>
  <img src="https://img.shields.io/badge/license-MIT-7c3aed?style=flat-square" alt="License"/>
  <img src="https://img.shields.io/badge/platform-Web-00f5d4?style=flat-square" alt="Platform"/>
  <img src="https://img.shields.io/badge/stack-Vanilla%20JS-facc15?style=flat-square" alt="Stack"/>
</p>

<p align="center">
  <em>A modern, fully-featured attendance management dashboard for academic institutions</em>
</p>

---

## ✨ Features

### 🎯 Core Functionality
| Feature | Description |
|---------|-------------|
| **Student Management** | Add, edit, delete students with full profile details |
| **Attendance Marking** | Quick mark attendance with Present / Absent / Late status |
| **Bulk Operations** | Mark all present or all absent in one click |
| **Smart Reports** | Generate Daily, Weekly, and Monthly attendance reports |
| **Data Export** | Export reports as CSV with professional formatting |
| **Print Reports** | Print-ready professional reports with custom styling |

### 📊 Analytics & Visualization
- **Weekly Attendance Trend** — Bar chart showing present vs absent trends
- **Today's Ratio** — Donut chart for real-time attendance distribution
- **Monthly Trends** — Area chart for long-term pattern analysis
- **Class Performance** — Comparative bar chart across all classes
- **Attendance Heatmap** — 56-day visual heatmap of attendance density
- **Top Performers** — Ranked leaderboard of best attendance records

### 🎨 UI/UX Highlights
- 🌙 **Dark/Light Theme** toggle with persistent storage
- 🎨 **5 Accent Colors** — Cyan, Purple, Amber, Pink, Blue
- 🖥️ **Responsive Design** — Works on desktop, tablet, and mobile
- ⌨️ **Keyboard Shortcuts** — Cmd/Ctrl + K for search, Cmd/Ctrl + 1-5 for navigation
- 🔍 **Global Search Palette** — Quick access to any student or page
- 🔔 **Real-time Notifications** — Toast alerts and activity feed
- 📅 **Mini Calendar** — Interactive calendar in the right panel
- ⏱️ **Live Clock** — Real-time session timer and date display

---

## 🚀 Quick Start

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No server required — runs entirely client-side

### Installation

```bash
# Clone or download the project
git clone https://github.com/Ali-Nawaz-devt/AttendX-Attendace-Management.git

# Navigate to the project directory
cd attendx

# Open in browser (or use Live Server for development)
open index.html
```

### Demo Login
```
Username: admin
Password: admin123
```

---

## 📁 Project Structure

```
attendx/
├── 📄 index.html          # Main application shell + all UI sections
├── 📄 script.js           # Complete application logic (~900 lines)
├── 📄 style.css           # Full stylesheet with dark/light themes
└── 📄 README.md           # This file
```

> **Note:** This is a single-page application (SPA) with zero external dependencies beyond Google Fonts.

---

## 🏗️ Architecture

### State Management
```javascript
const state = {
  students: [],        // Student records array
  attendance: {},      // Date_Class keyed attendance records
  settings: {},      // Theme and accent preferences
  activity: [],      // Activity feed log
  notifications: [], // System notifications
  currentPage: 1,     // Pagination state
  itemsPerPage: 8   // Table pagination limit
};
```

### Data Persistence
All data is stored in **localStorage** with the following keys:
| Key | Data |
|-----|------|
| `attendx_students` | Student records |
| `attendx_attendance` | Attendance entries |
| `attendx_settings` | UI preferences |
| `attendx_activity` | Activity log |
| `attendx_notifications` | Notification queue |
| `attendx_session` | Active session token |

---

## 🎨 Design System

### Color Palette
| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--accent` | `#00f5d4` | `#00f5d4` | Primary actions, highlights |
| `--accent2` | `#7c3aed` | `#7c3aed` | Gradients, secondary |
| `--bg` | `#080d1a` | `#f0f4ff` | Page background |
| `--bg2` | `#0d1426` | `#e8edf8` | Card backgrounds |
| `--text` | `#e2e8f0` | `#1e293b` | Primary text |
| `--text2` | `#94a3b8` | `#475569` | Secondary text |
| `--success` | `#4ade80` | `#22c55e` | Present status |
| `--danger` | `#f87171` | `#ef4444` | Absent status |
| `--warning` | `#facc15` | `#f59e0b` | Late status |

### Typography
- **Display Font:** Syne (weights: 400, 600, 700, 800)
- **Body Font:** DM Sans (weights: 300, 400, 500, 600)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open global search palette |
| `Cmd/Ctrl + 1` | Navigate to Dashboard |
| `Cmd/Ctrl + 2` | Navigate to Students |
| `Cmd/Ctrl + 3` | Navigate to Attendance |
| `Cmd/Ctrl + 4` | Navigate to Reports |
| `Cmd/Ctrl + 5` | Navigate to Analytics |
| `Escape` | Close modals / search palette |

---

## 📱 Responsive Breakpoints

| Breakpoint | Layout Changes |
|------------|----------------|
| `> 1200px` | Full layout with right panel |
| `≤ 1200px` | Right panel narrows to 240px |
| `≤ 900px` | Sidebar becomes mobile drawer, right panel hidden |
| `≤ 640px` | Single column stats, stacked controls, compact tables |

---

## 🛠️ Technical Details

### Canvas Charts
All charts are rendered using native HTML5 Canvas API (no Chart.js dependency):
- Weekly bar chart with gradient fills
- Donut/pie chart with center hole
- Area chart with gradient fill
- Horizontal bar chart for class comparison

### Animations
| Animation | Trigger |
|-----------|---------|
| Splash screen | Page load (2.4s duration) |
| Card entrance | Section navigation |
| Counter increment | Dashboard stats update |
| Circular progress | Attendance percentage change |
| Toast slide-in | Success/error/warning events |
| Modal scale-in | Open student modal |

### Security Features
- Session-based authentication with localStorage token
- Password visibility toggle
- Form validation on student creation
- Confirmation dialogs for destructive actions

---

## 🧪 Demo Data

The application ships with **30 pre-generated students** across 4 classes:

| Class | Students | Departments |
|-------|----------|-------------|
| Class A | 8 | Computer Science, Mathematics |
| Class B | 8 | Physics, English |
| Class C | 7 | Biology, Chemistry |
| Class D | 7 | Mixed |

Each student has randomized attendance history for realistic analytics.

---

## 📝 API & Functions

### Core Functions
```javascript
// Authentication
doLogin()           // Validate credentials & create session
doLogout()          // Clear session & return to login

// Navigation
navigate(section)   // Switch between dashboard sections
toggleSidebar()     // Collapse/expand sidebar

// Student Management
openStudentModal()  // Open add/edit modal
saveStudent()       // Create or update student record
deleteStudent()     // Remove student with confirmation
renderStudentTable() // Refresh student list with filters

// Attendance
loadAttendanceStudents()  // Load class roster for date
setStatus(id, status)     // Mark individual attendance
markAllPresent()          // Bulk mark all present
markAllAbsent()           // Bulk mark all absent
saveAttendance()          // Persist attendance records

// Reports
renderReports()      // Generate filtered reports
exportReportCSV()    // Download CSV file
printReport()        // Open print dialog

// Analytics
renderMonthlyChart()   // Draw area chart
renderClassChart()     // Draw comparison bars
renderHeatmap()        // Generate 56-day heatmap
renderTopPerformers()  // Update leaderboard

// Settings
setTheme(mode)       // Toggle dark/light
setAccent(color)     // Change primary color
resetAllData()       // Factory reset with confirmation
```

---

## 🖨️ Print Styles

The application includes dedicated print CSS that:
- Hides sidebar, right panel, and navigation
- Shows only the reports section
- Converts dark theme to light for printing
- Maintains professional table formatting
- Preserves color coding with `print-color-adjust: exact`

---

## 🚧 Future Enhancements

- [ ] Backend API integration (REST/GraphQL)
- [ ] Multi-user role support (Teacher, Admin, Student)
- [ ] Biometric attendance integration
- [ ] SMS/Email notification system
- [ ] PDF export with custom templates
- [ ] QR code-based attendance marking
- [ ] Data import from Excel/CSV
- [ ] Offline PWA support with Service Workers

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

<p align="center">
  <strong>Built with 💚 using vanilla HTML, CSS & JavaScript</strong><br/>
  <em>No frameworks. No build steps. Just pure web.</em>
</p>
