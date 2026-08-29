# SecureFlow — Full‑Stack Security Event Monitoring Dashboard

A full-stack security event monitoring platform built with **React**, **Express.js**, and **PostgreSQL**. SecureFlow provides a professional dashboard for analyzing security threats, monitoring suspicious activities, and tracking incident responses.

**Portfolio Project** | [View Repository](https://github.com/sanojsethi/SecureFlow) | Built for Portfolio & Learning

---

## Dashboard Preview

<p align="center">
  <img src="https://github.com/user-attachments/assets/190adf32-7723-47c3-92bf-bdfb2b5b3825" width="48%" alt="SecureFlow Dashboard Overview" />
  <img src="https://github.com/user-attachments/assets/7c477ae5-0ae0-44e7-bff3-ff2a1b42d615" width="48%" alt="SecureFlow Dashboard Details" />
</p>

---

## Project Overview

SecureFlow is a full-stack security event monitoring dashboard designed to help security teams monitor, track, and respond to security events in real time. The application aggregates security events from a PostgreSQL database and presents them through an intuitive React interface backed by a REST API.

### Problem Statement

Security teams need a centralized platform to:
- **Monitor** incoming security threats and anomalies
- **Prioritize** events by risk level (Critical, High, Medium, Low)
- **Track** incident status (Blocked, Monitoring, Review, Resolved)
- **Analyze** threat patterns and event trends
- **Export** security data for compliance and audits

SecureFlow addresses these needs with a clean, responsive interface backed by a robust REST API and PostgreSQL data store.

---

## Why This Project Matters

This project demonstrates essential full-stack engineering competencies:

**Backend Architecture & REST API Design**
- Designed and implemented three core REST endpoints (`/api/health`, `/api/security-events`, `/api/threat-summary`) handling real-time data retrieval and aggregation
- Built with Express.js following RESTful principles with proper HTTP status codes and error handling
- Implemented CORS configuration for secure cross-origin communication

**Database Design & SQL Optimization**
- Architected PostgreSQL schema for scalable event storage
- Optimized queries using SQL `GROUP BY` and `ORDER BY` for efficient threat aggregation
- Demonstrated timestamp handling, data integrity, and relational database best practices

**Full-Stack Integration**
- Connected React frontend directly to Express backend via Fetch API
- Managed environment variables and secure credential handling with `.env` configuration
- Built end-to-end data flow from database → API → UI with error handling at each layer

**Real-World Feature Implementation**
- CSV export functionality for compliance reporting
- Live data refresh with configurable polling intervals
- Status tracking and event filtering across multiple data dimensions

---

## Project Objectives

1. Build a **full-stack application** demonstrating backend API development, database integration, and frontend UI skills
2. Implement **real-time data fetching** with configurable refresh intervals
3. Provide **filtering, sorting, and search** capabilities for security events
4. Enable **CSV export** for reporting and analysis
5. Demonstrate **React state management**, **REST API design**, and **PostgreSQL integration**

---

## Key Features

### Dashboard
- **Metric Cards**: Total events, Critical/High risk count, blocked events, events requiring review
- **Threat Type Analysis**: Aggregated counts by threat category (SQL Injection, XSS, Brute Force, Malware)
- **Risk Level Distribution**: Visual breakdown of events by severity
- **Live Event Table**: Real-time security event listings with IP addresses, threat types, and timestamps
- **Recent Activity**: Latest events with quick-access detail modals

### Security Analysis
- Event filtering by risk level
- Status distribution tracking (Blocked, Monitoring, Review, Resolved)
- Threat frequency metrics
- Comprehensive event timeline

### Alerts Management
- Filter alerts by risk level and status
- Full-text search (threat type, IP address, status)
- Detail view for individual alerts
- Quick action and status tracking

### Reporting
- Security summary report generation
- Risk distribution analysis
- Status breakdown reports
- CSV export functionality for compliance

### Admin Features
- User profile management (name, email, role)
- API connection settings and health monitoring
- Live monitoring toggle with configurable refresh intervals
- Database connection status display

### Settings & Configuration
- **Live Monitoring**: Enable/disable auto-refresh
- **Refresh Interval**: Adjustable polling frequency (5–60 seconds)
- **Notifications**: Toggle alert notifications
- **Compact Dashboard**: Toggle for UI density
- **API Health**: Real-time backend connectivity status

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| **Frontend Framework** | React 19.2 |
| **Build Tool** | Vite 8 |
| **Language** | JavaScript (ES6+) |
| **Styling** | CSS3 |
| **Backend** | Node.js + Express 5 |
| **Database** | PostgreSQL |
| **API Communication** | REST (Fetch API) |
| **Data Import** | CSV parsing |
| **Version Control** | Git/GitHub |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser / Client                       │
│  React Component Tree (Dashboard, Alerts, Reports, etc.)   │
└────────────────────────────┬────────────────────────────────┘
                             │ REST API (HTTP/JSON)
                             │
┌────────────────────────────┴────────────────────────────────┐
│                   Express.js Backend                         │
│  /api/health                                                 │
│  /api/security-events                                        │
│  /api/threat-summary                                         │
└────────────────────────────┬────────────────────────────────┘
                             │ SQL Queries
                             │
┌────────────────────────────┴────────────────────────────────┐
│                 PostgreSQL Database                          │
│  Table: public.security_events                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Folder Structure

```
secureflow/
├── src/                          # Frontend (React)
│   ├── App.jsx                  # Main dashboard component
│   ├── App.css                  # Dashboard styling
│   ├── main.jsx                 # React entry point
│   ├── index.css                # Global styles
│   ├── data/
│   │   └── securityData.js      # Navigation items, default settings
│   └── assets/                  # Images and icons
│
├── server/                       # Backend (Express.js)
│   ├── server.js                # Express API server
│   └── package.json             # Backend dependencies
│
├── public/                       # Static assets
├── index.html                    # HTML entry point
├── vite.config.js               # Vite build configuration
├── package.json                 # Frontend dependencies
├── secureflow-security-events.csv  # Sample data
├── eslint.config.js             # Code linting
└── README.md                     # This file
```

---

## Dashboard Functionality

### Main Dashboard View
The dashboard displays a concise security overview:

- **Metric Cards** (Top Row):
  - Total Security Events: Count of all events in the database
  - Critical/High Risk: Priority events requiring immediate attention
  - Blocked Events: Incidents successfully blocked by policy
  - Requires Review: Events in monitoring or review status

- **Threat Analysis**:
  - Bar chart of threat type distribution
  - Real-time counts aggregated from the database
  - Sortable by frequency

- **Risk Level Breakdown**:
  - Visual distribution of events by severity
  - Critical → High → Medium → Low progression

- **Security Events Table**:
  - Full event listing with columns: ID, IP Address, Threat Type, Risk Level, Status, Event Time
  - Sortable and paginated
  - Inline severity badges with color coding
  - CSV export capability

- **Data Source Indicator**:
  - Shows API connection status (green = connected, red = disconnected)
  - Displays database name and last refresh timestamp

---

## Security Event Data Explanation

Security events are stored in the PostgreSQL `security_events` table with the following structure:

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | Integer | Unique event identifier | 7 |
| `ip_address` | String | Source or target IP address | 192.168.2.40 |
| `threat_type` | String | Category of threat | XSS Attempt, SQL Injection, Brute Force, Malware |
| `risk_level` | String | Severity classification | Critical, High, Medium, Low |
| `status` | String | Current incident status | Blocked, Monitoring, Review, Resolved |
| `event_time` | Timestamp | When the event occurred | 2026-08-28T14:39:39.345Z |

### Example Events
```
1. SQL Injection (Critical) from 192.168.1.24 - Blocked
2. Brute Force (High) from 10.24.18.92 - Monitoring
3. XSS Attempt (High) from 172.16.4.51 - Blocked
4. Malware (Critical) from 192.168.1.35 - Blocked
5. Brute Force (Medium) from 10.10.20.15 - Review
6. SQL Injection (High) from 172.16.8.21 - Blocked
7. XSS Attempt (Medium) from 192.168.2.40 - Monitoring
```

---

## API Endpoints

All endpoints return JSON responses. The backend runs on `http://localhost:5000` by default.

### GET `/api/health`
**Description**: Check API and database availability

**Response (Success - 200):**
```json
{
  "status": "OK",
  "message": "SecureFlow API and PostgreSQL are available"
}
```

**Response (Database Error - 503):**
```json
{
  "status": "ERROR",
  "message": "SecureFlow API is running but PostgreSQL is unavailable"
}
```

---

### GET `/api/security-events`
**Description**: Retrieve all security events from the database

**Query Parameters**: None

**Response (200):**
```json
[
  {
    "id": 1,
    "ip_address": "192.168.1.24",
    "threat_type": "SQL Injection",
    "risk_level": "Critical",
    "status": "Blocked",
    "event_time": "2026-08-28T14:39:39.345Z"
  },
  {
    "id": 2,
    "ip_address": "10.24.18.92",
    "threat_type": "Brute Force",
    "risk_level": "High",
    "status": "Monitoring",
    "event_time": "2026-08-28T14:39:39.345Z"
  }
]
```

**Error Response (500):**
```json
{
  "error": "Database query failed"
}
```

---

### GET `/api/threat-summary`
**Description**: Get aggregated counts of events by threat type

**Query Parameters**: None

**Response (200):**
```json
[
  {
    "threat_type": "SQL Injection",
    "total": 2
  },
  {
    "threat_type": "Brute Force",
    "total": 2
  },
  {
    "threat_type": "XSS Attempt",
    "total": 2
  },
  {
    "threat_type": "Malware",
    "total": 1
  }
]
```

**Error Response (500):**
```json
{
  "error": "Database query failed"
}
```

---

## PostgreSQL Database Setup

### Database Schema

The application expects a PostgreSQL database with the following table structure:

```sql
CREATE TABLE public.security_events (
  id SERIAL PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  threat_type VARCHAR(100) NOT NULL,
  risk_level VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  event_time TIMESTAMP NOT NULL
);
```

### Connection Details

The backend connects to PostgreSQL using environment variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `PGUSER` | postgres | Database user |
| `PGHOST` | localhost | Database host |
| `PGPORT` | 5432 | Database port |
| `PGDATABASE` | secureflow_db | Database name |
| `PGPASSWORD` | (required) | Database password |

**Note**: Never commit credentials to version control. Use a `.env` file (excluded from Git).

---

## Installation Instructions

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 12+ (local or remote)
- **Git**

### Step 1: Clone the Repository

```bash
git clone https://github.com/sanojsethi/SecureFlow.git
cd SecureFlow
```

### Step 2: Install Frontend Dependencies

```bash
npm install
```

### Step 3: Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

---

## Run Locally

A short guide to run the project locally for development:

1. Create and seed the PostgreSQL database (see Backend Setup section).
2. Add environment variables in `server/.env` (PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE, PORT).
3. Start the backend server:

```bash
cd server
node server.js
```

4. Start the frontend dev server (from project root):

```bash
npm run dev
```

5. Open the frontend at `http://localhost:5173` and verify the API health at `http://localhost:5000/api/health`.

---

## Frontend Setup

### Development Environment

1. **Start the Vite dev server:**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

2. **Build for production:**
   ```bash
   npm run build
   ```
   Generates optimized production build files in the `dist/` directory

3. **Lint the code:**
   ```bash
   npm run lint
   ```

### Configuration

The frontend API URL is configured in `src/App.jsx`:
```javascript
export const API_URL = "http://localhost:5000";
```

Change this if your backend runs on a different address.

---

## Backend Setup

### Step 1: Create PostgreSQL Database

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE secureflow_db;

-- Connect to the new database
\c secureflow_db

-- Create security_events table
CREATE TABLE public.security_events (
  id SERIAL PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  threat_type VARCHAR(100) NOT NULL,
  risk_level VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  event_time TIMESTAMP NOT NULL
);

-- Insert sample data
INSERT INTO public.security_events 
  (ip_address, threat_type, risk_level, status, event_time) 
VALUES
  ('192.168.1.24', 'SQL Injection', 'Critical', 'Blocked', '2026-08-28T14:39:39.345Z'),
  ('10.24.18.92', 'Brute Force', 'High', 'Monitoring', '2026-08-28T14:39:39.345Z'),
  ('172.16.4.51', 'XSS Attempt', 'High', 'Blocked', '2026-08-28T14:39:39.345Z'),
  ('192.168.1.35', 'Malware', 'Critical', 'Blocked', '2026-08-28T14:39:39.345Z'),
  ('10.10.20.15', 'Brute Force', 'Medium', 'Review', '2026-08-28T14:39:39.345Z'),
  ('172.16.8.21', 'SQL Injection', 'High', 'Blocked', '2026-08-28T14:39:39.345Z'),
  ('192.168.2.40', 'XSS Attempt', 'Medium', 'Monitoring', '2026-08-28T14:39:39.345Z');
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `server/` directory:

```bash
# .env (Do NOT commit this file)
PGUSER=postgres
PGHOST=localhost
PGPORT=5432
PGDATABASE=secureflow_db
PGPASSWORD=your_password_here
PORT=5000
```

**⚠️ Security**: Never commit `.env` to version control. Add it to `.gitignore`.

### Step 3: Start the Backend Server

```bash
cd server
node server.js
```

You should see:
```
SecureFlow API running on http://localhost:5000
```

Verify the health endpoint:
```bash
curl http://localhost:5000/api/health
```

---

## How to Run the Complete Application

### Terminal 1: Start PostgreSQL (if local)

```bash
# macOS (Homebrew)
brew services start postgresql@15

# Or via Docker
docker run --name secureflow-postgres -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres:15
```

### Terminal 2: Start Backend Server

```bash
cd server
node server.js
# Output: SecureFlow API running on http://localhost:5000
```

### Terminal 3: Start Frontend Dev Server

```bash
npm run dev
# Output: VITE v... ready in XXX ms
# ➜  Local:   http://localhost:5173/
```

### Access the Dashboard

Open your browser and navigate to:
```
http://localhost:5173
```

**Default Login Credentials (Demo Mode):**
- Email: Any email address
- Password: Any password
- The app stores user preferences in browser localStorage

---

## Example API Usage

### Using cURL

**Fetch all security events:**
```bash
curl -X GET http://localhost:5000/api/security-events
```

**Get threat summary:**
```bash
curl -X GET http://localhost:5000/api/threat-summary
```

**Check API health:**
```bash
curl -X GET http://localhost:5000/api/health
```

### Using JavaScript/Fetch

```javascript
const API_URL = "http://localhost:5000";

// Fetch all events
async function getEvents() {
  const response = await fetch(`${API_URL}/api/security-events`);
  const events = await response.json();
  console.log(events);
}

// Fetch threat summary
async function getThreatSummary() {
  const response = await fetch(`${API_URL}/api/threat-summary`);
  const summary = await response.json();
  console.log(summary);
}

// Check API health
async function checkHealth() {
  const response = await fetch(`${API_URL}/api/health`);
  const health = await response.json();
  console.log(health.status === "OK" ? "API Connected ✓" : "API Error ✗");
}

getEvents();
getThreatSummary();
checkHealth();
```

---

## Skills Demonstrated

### Frontend Development
- ✓ React component composition and state management
- ✓ Hooks (useState, useEffect, useCallback, useMemo, useRef)
- ✓ Event handling and form validation
- ✓ CSS3 responsive design and flexbox layouts
- ✓ localStorage API for client-side data persistence
- ✓ Modal and dialog UI patterns
- ✓ CSV export functionality

### Backend Development
- ✓ Express.js REST API design and implementation
- ✓ CORS configuration for cross-origin requests
- ✓ PostgreSQL integration with node-pg
- ✓ SQL query optimization (GROUP BY, ORDER BY)
- ✓ Environment variable management (dotenv)
- ✓ Error handling and HTTP status codes
- ✓ Health check endpoints and monitoring

### Database Design
- ✓ PostgreSQL table design and schema planning
- ✓ Data aggregation and grouping (SQL GROUP BY)
- ✓ Timestamp handling and timezone awareness
- ✓ Query optimization for performance

### DevOps & Development Practices
- ✓ Git version control and repository management
- ✓ npm package management
- ✓ Environment configuration and secrets management
- ✓ Development vs. production builds
- ✓ Code quality with ESLint

---

## Development Workflow

### Code Quality

```bash
# Run ESLint
npm run lint
```

The project uses ESLint with React plugin hooks validation.

### Build Optimization

The Vite build process:
- Minifies JavaScript and CSS
- Code-splits for lazy loading
- Optimizes asset bundling
- Generates optimized production build files in `dist/`

```bash
npm run build        # Creates optimized build
npm run preview      # Preview production build locally
```

---

## Testing & Validation

### Manual Testing Checklist

- [ ] Frontend loads without errors
- [ ] Backend API responds to requests
- [ ] PostgreSQL database connection works
- [ ] Health endpoint returns status
- [ ] Security events load and display
- [ ] Threat summary aggregates correctly
- [ ] CSV export downloads file
- [ ] Filters and search work
- [ ] Live monitoring refresh works
- [ ] Settings persist in localStorage

### Debugging

**Browser Console:**
```javascript
// Check API URL
console.log("API_URL:", "http://localhost:5000")

// Test fetch
fetch("http://localhost:5000/api/health")
  .then(r => r.json())
  .then(d => console.log(d))
```

**Server Logs:**
```bash
# Backend error messages appear in terminal where server.js runs
# Look for:
# - "Health check failed"
# - "Database query failed"
# - "SecureFlow API running on..."
```

---

## Future Improvements

### Feature Enhancements
- [ ] User authentication with JWT tokens
- [ ] Role-based access control (RBAC) implementation
- [ ] Real-time WebSocket notifications for new events
- [ ] Advanced filtering (date range, custom queries)
- [ ] Event severity trend analysis (charts/graphs)
- [ ] Automated alert rules and escalation policies
- [ ] Email notifications for critical events
- [ ] Integration with SIEM systems (Splunk, ELK)

### Performance Optimization
- [ ] Implement event pagination (limit/offset)
- [ ] Add database indexing on frequently queried columns
- [ ] Caching layer (Redis) for threat summaries
- [ ] API rate limiting
- [ ] Frontend code splitting and lazy loading

### Infrastructure
- [ ] Docker containerization (Dockerfile, docker-compose)
- [ ] Kubernetes deployment manifests
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated testing (Jest, React Testing Library)
- [ ] Production database backup strategy

### Security Enhancements
- [ ] HTTPS/TLS encryption
- [ ] Input validation and sanitization
- [ ] SQL injection prevention (parameterized queries)
- [ ] CORS whitelist configuration
- [ ] API key authentication
- [ ] Rate limiting and DDoS protection
- [ ] Security headers (CSP, HSTS)
- [ ] Audit logging

---

## Security Considerations

### Current Implementation

✓ **CORS Enabled**: Backend accepts requests from frontend  
✓ **Environment Variables**: Secrets stored outside codebase  
✓ **Parameterized Queries**: SQL injection prevention (node-pg)  
✓ **Status Codes**: Proper HTTP error responses  

### Recommendations for Production

⚠️ **Not Implemented** (for demo/portfolio purposes):
- User authentication (JWT, OAuth)
- Authorization checks (role-based access)
- HTTPS/TLS encryption
- Input validation layer
- Rate limiting
- Audit logging
- Database encryption
- Security headers

For production deployment, implement the items above based on your organization's security requirements.

---

## Project Roadmap

### Version 1.0 (Current)
- ✓ Dashboard with metric cards and data visualization
- ✓ Security events table with filtering
- ✓ Threat summary aggregation
- ✓ CSV export capability
- ✓ Settings and user profile management
- ✓ API health monitoring

### Version 1.1 (Planned)
- [ ] Event detail drill-down with related incidents
- [ ] Advanced search and saved filters
- [ ] Dark mode theme
- [ ] Mobile responsive improvements

### Version 2.0 (Planned)
- [ ] User authentication and authorization
- [ ] Real-time WebSocket updates
- [ ] Elasticsearch integration for full-text search
- [ ] Grafana dashboard embeds
- [ ] SIEM API connectors

---

## Author

**Sanoj Sethi**  
Portfolio: [GitHub](https://github.com/sanojsethi)  
LinkedIn: [linkedin.com/in/sanojsethi](https://www.linkedin.com/in/sanojsethi)

---

## GitHub Repository

**SecureFlow**  
📍 [github.com/sanojsethi/SecureFlow](https://github.com/sanojsethi/SecureFlow)

**Repository Summary:**
- Full-stack portfolio application
- Frontend + Backend + Database
- Well-structured codebase suitable for portfolio review

**Connect:**
- ⭐ Star the repository if you find it useful
- 🔗 Fork to create your own version
- 💬 Open issues for questions or suggestions

---

## License

This project is open source and available under the **MIT License**.

You are free to use, modify, and distribute this project for personal, educational, and commercial purposes, provided that you include the original license notice.

See [LICENSE](LICENSE) for full details.

---

## Support & Contributions

Have feedback or want to contribute? Here's how:

1. **Report Issues**: Open a GitHub issue with a detailed description
2. **Suggest Features**: Describe your idea and use case
3. **Submit PRs**: Fork, branch, and create a pull request
4. **Discuss**: Start a discussion for major changes

---

**Built with ❤️ for Security Teams**  
*SecureFlow — Monitor. Analyze. Respond. Secure.*
