# Analytics Dashboard Design

## Goal

Create a comprehensive analytics dashboard at `/analytics` that serves as:

- **Showcase**: Demonstrates data visualization capabilities of the boilerplate
- **Template**: Reusable dashboard structure users can copy for their projects
- **Implementation**: Real data integration with RBAC system (users, roles, permissions, activity)

## Architecture

### Page Structure

```
/analytics (single page app)
├── Top: 4 Summary Cards (horizontal)
├── Filter Bar (date range, refresh, export)
├── Section 1: User Stats (2 charts)
├── Section 2: System Stats (3 charts)
├── Section 3: Activity Logs (chart + table)
└── Section 4: Resource Usage (2 charts)
```

### Color Scheme

- **Background**: White/neutral
- **Card Accents**: Each card has unique color
  - Blue, Green, Orange, Purple, Pink, Red, Cyan, Yellow (randomly assigned)
- **Purpose**: Colorful, vibrant, engaging visual design

### Data Sources

- **Real Data**: Users, roles, permissions, activity logs (from database)
- **Simulated Data**: System metrics (API requests, response times, cache hit rate)

## Components

### 1. Top Summary Cards (4 cards, horizontal row)

**Card 1: Total Users** (Blue accent)

- Icon: Users
- Metric: Total registered users
- Subtext: "+X from last period"
- Chart: Mini sparkline (user growth trend)
- Width: 25% (responsive)

**Card 2: Active Sessions** (Green accent)

- Icon: Activity
- Metric: Current active sessions
- Subtext: "Peak: X today"
- Chart: Mini progress bar (capacity %)
- Width: 25%

**Card 3: API Requests** (Orange accent)

- Icon: Zap/TrendingUp
- Metric: Total API requests (24h)
- Subtext: "X/sec average"
- Chart: Mini area chart (request volume)
- Width: 25%

**Card 4: Storage Used** (Purple accent)

- Icon: Database/HardDrive
- Metric: X GB / Y GB used
- Subtext: "Z% available"
- Chart: Mini donut chart (storage breakdown)
- Width: 25%

### 2. Filter Bar

**Components:**

- Date Range Picker: 7 days / 30 days / 90 days / Custom
- Refresh Button: Manual refresh with loading spinner
- Export Button: Export as PDF/image

**Behavior:** Filter changes trigger animation refresh on all charts

### 3. Section 1: User Stats

**Layout:** 2 charts (50% width each)

**Chart A: User Growth by Role** (Stacked Bar Chart)

- X-axis: Time (days/weeks based on date range)
- Y-axis: Number of users
- Stacked by: Role (ADMIN, USER, MANAGER, etc.)
- Colors: Each role has different color (blue, green, orange, purple)
- Interaction: Hover tooltip with exact count
- Animation: Bars grow from bottom

**Chart B: User Distribution by Role** (Donut Chart)

- Center: Total user count
- Segments: Each role with percentage
- Colors: Match stacked bar chart
- Legend: Right side
- Interaction: Hover expands segment
- Animation: Segments rotate in

**Data Source:** Real (users table, roles, role assignments)

### 4. Section 2: System Stats

**Layout:** 3 charts (33% width each)

**Chart C: API Request Volume** (Area Chart)

- X-axis: Time (hours/days)
- Y-axis: Request count
- Filled area with gradient
- Color: Pink accent
- Interaction: Hover tooltip
- Animation: Area fills from left

**Chart D: Response Time Distribution** (Bar Chart)

- X-axis: Response time ranges (0-100ms, 100-500ms, 500ms-1s, 1s+)
- Y-axis: Number of requests
- Color: Cyan accent
- Interaction: Hover shows count
- Animation: Bars grow from bottom

**Chart E: Cache Hit Rate** (Gauge/Progress Chart)

- Metric: Hit percentage (e.g., 85%)
- Visual: Circular gauge
- Color: Green (>80%), Yellow (50-80%), Red (<50%)
- Subtext: "X hits / Y total"
- Animation: Gauge fills from 0

**Data Source:** Simulated (monitoring integration needed for production)

### 5. Section 3: Activity Logs

**Layout:** 1 chart (50%) + 1 table (50%)

**Chart F: Login Activity Over Time** (Line Chart)

- X-axis: Time (hours/days)
- Y-axis: Login count
- Two lines: Successful (green) vs Failed (red)
- Interaction: Hover tooltip
- Animation: Lines draw from left

**Table: Recent Activity** (Timeline List)

- Columns: Time, User, Action, Status, Details
- Rows: Last 10 activities
- Status badges: Success (green), Failed (red), Pending (yellow)
- Interaction: Row hover effects
- Scrollable if >10 rows

**Data Source:** Real (auth logs, user activity)

### 6. Section 4: Resource Usage

**Layout:** 2 charts (50% width each)

**Chart G: Storage Breakdown** (Pie Chart)

- Segments: User avatars, File uploads, Database, Logs, Other
- Colors: 5 different colors
- Legend: Below chart
- Interaction: Hover expands segment, shows size
- Animation: Segments rotate in

**Chart H: Bandwidth Usage** (Bubble Chart)

- X-axis: Time
- Y-axis: File size
- Bubble size: Number of requests
- Color gradient: Blue → Green → Orange
- Interaction: Hover shows file details
- Animation: Bubbles pop in

**Data Source:** Real (file uploads, storage metrics)

## Chart Types Used

All chart types for maximum variety:

1. **Basic**: Bar, Line, Pie, Donut
2. **Advanced**: Area, Stacked Bar, Progress Bar, Sparkline, Heatmap
3. **Complex**: Radar, Scatter, Bubble, Funnel, Gauge

## Interactivity

**Semi-Interactive:**

- Date range picker (7/30/90 days, custom)
- Simple filters
- Hover tooltips on all charts
- Entrance animations on page load
- Filter change triggers smooth refresh

**NOT Included:**

- Real-time data streaming
- Complex drill-down
- Custom chart configuration

## Tech Stack

- **Charts Library**: Recharts (recommended) or Chart.js
- **Icons**: Lucide React (already in project)
- **Styling**: Tailwind CSS v4 (already in project)
- **Animations**: Framer Motion or CSS animations
- **Data Fetching**: Server Actions + TanStack Query

## File Structure

```
app/analytics/
├── page.tsx                 # Main dashboard page
├── layout.tsx               # Layout (if needed)
└── loading.tsx              # Loading state

components/analytics/
├── summary-cards.tsx        # Top 4 summary cards
├── filter-bar.tsx           # Date picker + controls
├── user-stats-section.tsx   # User growth + distribution
├── system-stats-section.tsx # API + response + cache
├── activity-section.tsx     # Login chart + activity table
├── resource-section.tsx     # Storage + bandwidth
└── chart-wrapper.tsx        # Reusable chart container

lib/analytics/
├── data-fetchers.ts         # Server actions for data
├── chart-data.ts            # Data transformation for charts
└── mock-data.ts             # Simulated system metrics
```

## Implementation Notes

1. **Reusability**: Each section is self-contained component
2. **Performance**: Chart data should be memoized
3. **Responsive**: Mobile-first, stack cards on small screens
4. **Accessibility**: ARIA labels on charts, keyboard navigation
5. **Testing**: Unit tests for data transformations, component tests

## Verification

After implementation:

1. Navigate to `/analytics` - page loads without errors
2. All charts render with sample data
3. Date range picker changes chart data
4. Hover tooltips work on all charts
5. Colors are vibrant and distinct
6. Layout responsive on mobile/tablet/desktop
7. Real data loads from database (users, roles, activity)
8. Animations smooth and not jarring
