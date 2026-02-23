# Analytics Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a colorful analytics dashboard at `/analytics` with various chart types, real data integration, and semi-interactive filtering.

**Architecture:** Single page with 4 top summary cards + 4 chart sections. Components organized in `components/analytics/`, data fetching via Server Actions. Use Recharts for visualization with TanStack Query for data management.

**Tech Stack:** Next.js 16, React 19, TypeScript, Recharts (already installed), Prisma, Lucide React, Tailwind CSS v4, TanStack Query

---

## Task 1: Install Dependencies and Setup Directory Structure

**Files:**

- Create: `components/analytics/.gitkeep`
- Create: `lib/analytics/.gitkeep`

**Step 1: Create analytics directories**

Run:

```bash
mkdir -p components/analytics lib/analytics
touch components/analytics/.gitkeep lib/analytics/.gitkeep
```

Expected: Directories created successfully

**Step 2: Verify Recharts is installed**

Run:

```bash
grep "recharts" package.json
```

Expected: `"recharts": "^3.7.0"` or similar

**Step 3: Install date-fns (already in project)**

Run:

```bash
grep "date-fns" package.json
```

Expected: `"date-fns": "^4.1.0"` - should already be installed

**Step 4: Commit**

```bash
git add components/analytics lib/analytics
git commit -m "feat: setup analytics directory structure"
```

---

## Task 2: Create Data Fetchers (Server Actions)

**Files:**

- Create: `lib/analytics/data-fetchers.ts`

**Step 1: Write the data fetchers file**

Create `lib/analytics/data-fetchers.ts`:

```typescript
"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth/config";

// Get total users count
export async function getTotalUsers() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const count = await prisma.user.count();
  return count;
}

// Get users by role
export async function getUsersByRole() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const users = await prisma.user.findMany({
    include: {
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  const roleCounts = users.reduce(
    (acc, user) => {
      const roleName = user.role.name;
      acc[roleName] = (acc[roleName] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return roleCounts;
}

// Get user growth over time
export async function getUserGrowth(days: number = 30) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    include: {
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  // Group by date and role
  const growthData = users.reduce(
    (acc, user) => {
      const date = user.createdAt.toISOString().split("T")[0];
      const role = user.role.name;

      if (!acc[date]) {
        acc[date] = {};
      }
      acc[date][role] = (acc[date][role] || 0) + 1;

      return acc;
    },
    {} as Record<string, Record<string, number>>
  );

  return growthData;
}

// Get recent activity (simulated for now)
export async function getRecentActivity() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // For now, return mock data since we don't have activity logs
  return [
    {
      id: "1",
      time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      user: "Admin User",
      action: "login",
      status: "success",
      details: "Logged in from 192.168.1.1",
    },
    {
      id: "2",
      time: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      user: "Test User",
      action: "login_failed",
      status: "failed",
      details: "Invalid password",
    },
    {
      id: "3",
      time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      user: "Admin User",
      action: "user_updated",
      status: "success",
      details: "Updated role for user@example.com",
    },
  ];
}

// Get storage usage
export async function getStorageUsage() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const fileCount = await prisma.file.count();
  const totalSize = await prisma.file.aggregate({
    _sum: {
      size: true,
    },
  });

  return {
    totalFiles: fileCount,
    totalSize: totalSize._sum.size || 0,
    breakdown: {
      avatars: 0, // Would need actual aggregation
      uploads: totalSize._sum.size || 0,
      database: 0,
      logs: 0,
      other: 0,
    },
  };
}
```

**Step 2: Run TypeScript check**

Run:

```bash
pnpm tsc --noEmit
```

Expected: No errors (may have some import warnings from other files)

**Step 3: Commit**

```bash
git add lib/analytics/data-fetchers.ts
git commit -m "feat: add analytics data fetchers (server actions)"
```

---

## Task 3: Create Mock Data Generator

**Files:**

- Create: `lib/analytics/mock-data.ts`

**Step 1: Write mock data generator**

Create `lib/analytics/mock-data.ts`:

```typescript
// Mock data for system metrics (not available in database)

export function generateMockApiRequests(days: number = 7) {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    data.push({
      date: date.toISOString().split("T")[0],
      requests: Math.floor(Math.random() * 5000) + 5000,
      successRate: 85 + Math.random() * 14,
      avgResponseTime: Math.floor(Math.random() * 200) + 50,
    });
  }

  return data;
}

export function generateMockResponseTime() {
  return [
    { range: "0-100ms", count: Math.floor(Math.random() * 5000) + 8000 },
    { range: "100-500ms", count: Math.floor(Math.random() * 2000) + 1000 },
    { range: "500ms-1s", count: Math.floor(Math.random() * 500) + 100 },
    { range: "1s+", count: Math.floor(Math.random() * 100) + 10 },
  ];
}

export function generateMockCacheHitRate() {
  return {
    hitRate: 85 + Math.floor(Math.random() * 10),
    hits: Math.floor(Math.random() * 50000) + 50000,
    total: Math.floor(Math.random() * 10000) + 60000,
  };
}

export function generateMockLoginActivity(days: number = 7) {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    data.push({
      date: date.toISOString().split("T")[0],
      successful: Math.floor(Math.random() * 100) + 50,
      failed: Math.floor(Math.random() * 20) + 5,
    });
  }

  return data;
}

export function generateMockBandwidth() {
  const data = [];
  const now = new Date();

  for (let i = 0; i < 20; i++) {
    const date = new Date(now);
    date.setHours(date.getHours() - i);

    data.push({
      time: date.toISOString(),
      fileSize: Math.floor(Math.random() * 10000000) + 100000,
      requests: Math.floor(Math.random() * 100) + 10,
      fileType: ["image", "document", "video", "other"][Math.floor(Math.random() * 4)],
    });
  }

  return data;
}

// Active sessions (simulated)
export function getActiveSessions() {
  return {
    current: Math.floor(Math.random() * 50) + 10,
    peak: Math.floor(Math.random() * 100) + 50,
    capacity: 200,
  };
}
```

**Step 2: Commit**

```bash
git add lib/analytics/mock-data.ts
git commit -m "feat: add mock data generator for system metrics"
```

---

## Task 4: Create Chart Wrapper Component

**Files:**

- Create: `components/analytics/chart-wrapper.tsx`

**Step 1: Write chart wrapper component**

Create `components/analytics/chart-wrapper.tsx`:

```typescript
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartWrapperProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  accentColor?: "blue" | "green" | "orange" | "purple" | "pink" | "red" | "cyan" | "yellow";
}

const accentColors = {
  blue: "border-blue-500 bg-blue-50",
  green: "border-green-500 bg-green-50",
  orange: "border-orange-500 bg-orange-50",
  purple: "border-purple-500 bg-purple-50",
  pink: "border-pink-500 bg-pink-50",
  red: "border-red-500 bg-red-50",
  cyan: "border-cyan-500 bg-cyan-50",
  yellow: "border-yellow-500 bg-yellow-50",
};

const iconColors = {
  blue: "text-blue-500",
  green: "text-green-500",
  orange: "text-orange-500",
  purple: "text-purple-500",
  pink: "text-pink-500",
  red: "text-red-500",
  cyan: "text-cyan-500",
  yellow: "text-yellow-500",
};

export function ChartWrapper({ title, icon: Icon, children, className, accentColor = "blue" }: ChartWrapperProps) {
  return (
    <div
      className={cn(
        "border-l-4 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow",
        accentColors[accentColor],
        className
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <Icon className={cn("w-5 h-5", iconColors[accentColor])} />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/analytics/chart-wrapper.tsx
git commit -m "feat: add reusable chart wrapper component"
```

---

## Task 5: Create Summary Cards Component

**Files:**

- Create: `components/analytics/summary-cards.tsx`

**Step 1: Write summary cards component**

Create `components/analytics/summary-cards.tsx`:

```typescript
"use client";

import { Users, Activity, Zap, Database } from "lucide-react";
import { ChartWrapper } from "./chart-wrapper";
import {
  getTotalUsers,
  getUsersByRole,
  getStorageUsage,
} from "@/lib/analytics/data-fetchers";
import { getActiveSessions, generateMockApiRequests } from "@/lib/analytics/mock-data";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, DonutChart, PieChart, Pie, Cell, Progress } from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ec4899", "#ef4444"];

export function SummaryCards() {
  // Fetch real data
  const { data: totalUsers } = useQuery({
    queryKey: ["totalUsers"],
    queryFn: getTotalUsers,
  });

  const { data: roleData } = useQuery({
    queryKey: ["usersByRole"],
    queryFn: getUsersByRole,
  });

  const { data: storageData } = useQuery({
    queryKey: ["storageUsage"],
    queryFn: getStorageUsage,
  });

  // Mock data
  const activeSessions = getActiveSessions();
  const apiRequests = generateMockApiRequests(7);

  // Growth trend for users (mock percentage)
  const userGrowth = "+12% from last month";

  // Storage donut chart data
  const storageChartData = storageData ? [
    { name: "Uploads", value: storageData.breakdown.uploads || 0 },
    { name: "Avatars", value: storageData.breakdown.avatars || 0 },
    { name: "Database", value: storageData.breakdown.database || 0 },
    { name: "Logs", value: storageData.breakdown.logs || 0 },
    { name: "Other", value: storageData.breakdown.other || 0 },
  ].filter(d => d.value > 0) : [];

  // API request mini chart data
  const apiChartData = apiRequests.slice(-7).map(d => ({
    value: d.requests,
  }));

  const activePercentage = (activeSessions.current / activeSessions.capacity) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Card 1: Total Users */}
      <ChartWrapper title="Total Users" icon={Users} accentColor="blue">
        <div className="space-y-2">
          <p className="text-3xl font-bold">{totalUsers || 0}</p>
          <p className="text-sm text-muted-foreground">{userGrowth}</p>
          <div className="h-12">
            <AreaChart width={200} height={48} data={apiChartData}>
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </AreaChart>
          </div>
        </div>
      </ChartWrapper>

      {/* Card 2: Active Sessions */}
      <ChartWrapper title="Active Sessions" icon={Activity} accentColor="green">
        <div className="space-y-2">
          <p className="text-3xl font-bold">{activeSessions.current}</p>
          <p className="text-sm text-muted-foreground">Peak: {activeSessions.peak} today</p>
          <Progress value={activePercentage} className="h-2" />
        </div>
      </ChartWrapper>

      {/* Card 3: API Requests */}
      <ChartWrapper title="API Requests (24h)" icon={Zap} accentColor="orange">
        <div className="space-y-2">
          <p className="text-3xl font-bold">
            {apiRequests.reduce((sum, d) => sum + d.requests, 0).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            {Math.round(apiRequests.reduce((sum, d) => sum + d.requests, 0) / 86400)}/sec avg
          </p>
          <div className="h-12">
            <AreaChart width={200} height={48} data={apiChartData}>
              <Area type="monotone" dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
            </AreaChart>
          </div>
        </div>
      </ChartWrapper>

      {/* Card 4: Storage Used */}
      <ChartWrapper title="Storage Used" icon={Database} accentColor="purple">
        <div className="space-y-2">
          {storageData && (
            <>
              <p className="text-3xl font-bold">
                {(storageData.totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB
              </p>
              <p className="text-sm text-muted-foreground">
                {storageData.totalFiles} files
              </p>
              <div className="h-12 flex items-center justify-center">
                <DonutChart width={100} height={100} data={storageChartData} className="text-xs">
                  {storageChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </DonutChart>
              </div>
            </>
          )}
        </div>
      </ChartWrapper>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/analytics/summary-cards.tsx
git commit -m "feat: add summary cards component with data fetching"
```

---

## Task 6: Create Filter Bar Component

**Files:**

- Create: `components/analytics/filter-bar.tsx`

**Step 1: Write filter bar component**

Create `components/analytics/filter-bar.tsx`:

```typescript
"use client";

import { Calendar, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface FilterBarProps {
  onDateRangeChange: (range: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function FilterBar({ onDateRangeChange, onRefresh, isRefreshing = false }: FilterBarProps) {
  const [dateRange, setDateRange] = useState("30");

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    onDateRangeChange(value);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <Select value={dateRange} onValueChange={handleDateRangeChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1" />

      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
        Refresh
      </Button>

      <Button variant="outline" size="sm">
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/analytics/filter-bar.tsx
git commit -m "feat: add filter bar component with date picker"
```

---

## Task 7: Create User Stats Section Component

**Files:**

- Create: `components/analytics/user-stats-section.tsx`

**Step 1: Write user stats section**

Create `components/analytics/user-stats-section.tsx`:

```typescript
"use client";

import { Users, User } from "lucide-react";
import { ChartWrapper } from "./chart-wrapper";
import { getUsersByRole, getUserGrowth } from "@/lib/analytics/data-fetchers";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, DonutChart, DonutChartCell, Label } from "recharts";

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "#3b82f6", // blue
  USER: "#22c55e", // green
  MANAGER: "#f97316", // orange
  EDITOR: "#a855f7", // purple
};

export function UserStatsSection({ dateRange = "30" }: { dateRange?: string }) {
  const days = parseInt(dateRange) || 30;

  const { data: roleData } = useQuery({
    queryKey: ["usersByRole"],
    queryFn: getUsersByRole,
  });

  const { data: growthData } = useQuery({
    queryKey: ["userGrowth", days],
    queryFn: () => getUserGrowth(days),
  });

  // Transform role data for donut chart
  const roleChartData = roleData
    ? Object.entries(roleData).map(([role, count]) => ({
        name: role,
        value: count,
      }))
    : [];

  // Transform growth data for stacked bar chart
  const stackedBarData = growthData
    ? Object.entries(growthData).map(([date, roles]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        ...roles,
      }))
    : [];

  const totalUsers = roleChartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">User Statistics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth by Role - Stacked Bar Chart */}
        <ChartWrapper title="User Growth by Role" icon={Users} accentColor="blue">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stackedBarData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(ROLE_COLORS).map((role) => (
                <Bar key={role} dataKey={role} stackId="1" fill={ROLE_COLORS[role]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* User Distribution - Donut Chart */}
        <ChartWrapper title="User Distribution by Role" icon={User} accentColor="green">
          <div className="flex items-center justify-center">
            <div style={{ position: "relative", width: 300, height: 300 }}>
              <DonutChart width={300} height={300} data={roleChartData}>
                {roleChartData.map((entry, index) => (
                  <DonutChartCell
                    key={`cell-${index}`}
                    fill={ROLE_COLORS[entry.name] || COLORS[index % COLORS.length]}
                  />
                ))}
                <Label
                  value={totalUsers.toString()}
                  position="center"
                  className="text-3xl font-bold fill-gray-900"
                />
              </DonutChart>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {roleChartData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: ROLE_COLORS[entry.name] }}
                />
                <span className="text-sm">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </ChartWrapper>
      </div>
    </section>
  );
}

const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ec4899", "#ef4444"];
```

**Step 2: Commit**

```bash
git add components/analytics/user-stats-section.tsx
git commit -m "feat: add user stats section with stacked bar and donut charts"
```

---

## Task 8: Create System Stats Section Component

**Files:**

- Create: `components/analytics/system-stats-section.tsx`

**Step 1: Write system stats section**

Create `components/analytics/system-stats-section.tsx`:

```typescript
"use client";

import { Activity, Clock, Database } from "lucide-react";
import { ChartWrapper } from "./chart-wrapper";
import { generateMockApiRequests, generateMockResponseTime, generateMockCacheHitRate } from "@/lib/analytics/mock-data";
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export function SystemStatsSection() {
  const [apiData, setApiData] = useState(generateMockApiRequests(7));
  const [responseTimeData, setResponseTimeData] = useState(generateMockResponseTime());
  const [cacheData, setCacheData] = useState(generateMockCacheHitRate());

  const refreshData = () => {
    setApiData(generateMockApiRequests(7));
    setResponseTimeData(generateMockResponseTime());
    setCacheData(generateMockCacheHitRate());
  };

  // Transform for area chart
  const areaChartData = apiData.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    requests: d.requests,
  }));

  // Response time chart
  const barChartData = responseTimeData.map((d) => ({
    name: d.range,
    value: d.count,
  }));

  // Cache gauge color
  const cacheColor = cacheData.hitRate >= 80 ? "#22c55e" : cacheData.hitRate >= 50 ? "#eab308" : "#ef4444";

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">System Statistics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Request Volume - Area Chart */}
        <ChartWrapper title="API Request Volume" icon={Activity} accentColor="pink">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={areaChartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#ec4899"
                fill="url(#colorPink)"
                fillOpacity={1}
              />
              <defs>
                <linearGradient id="colorPink" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Response Time Distribution - Bar Chart */}
        <ChartWrapper title="Response Time Distribution" icon={Clock} accentColor="cyan">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Cache Hit Rate - Gauge */}
        <ChartWrapper title="Cache Hit Rate" icon={Database} accentColor="green">
          <div className="flex flex-col items-center justify-center h-full py-4">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={cacheColor}
                  strokeWidth="12"
                  strokeDasharray={`${(cacheData.hitRate / 100) * 440} 440`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{cacheData.hitRate}%</span>
                <span className="text-sm text-gray-500">Hit Rate</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {cacheData.hits.toLocaleString()} / {cacheData.total.toLocaleString()} hits
            </p>
          </div>
        </ChartWrapper>
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add components/analytics/system-stats-section.tsx
git commit -m "feat: add system stats section with area, bar, and gauge charts"
```

---

## Task 9: Create Activity Section Component

**Files:**

- Create: `components/analytics/activity-section.tsx`

**Step 1: Write activity section**

Create `components/analytics/activity-section.tsx`:

```typescript
"use client";

import { Activity, Clock } from "lucide-react";
import { ChartWrapper } from "./chart-wrapper";
import { getRecentActivity } from "@/lib/analytics/data-fetchers";
import { generateMockLoginActivity } from "@/lib/analytics/mock-data";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function ActivitySection({ dateRange = "30" }: { dateRange?: string }) {
  const days = parseInt(dateRange) || 30;

  const { data: activities } = useQuery({
    queryKey: ["recentActivity"],
    queryFn: getRecentActivity,
  });

  const loginData = generateMockLoginActivity(days);

  const lineChartData = loginData.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    successful: d.successful,
    failed: d.failed,
  }));

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Activity Logs</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Activity - Line Chart */}
        <ChartWrapper title="Login Activity Over Time" icon={Activity} accentColor="green">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="successful" stroke="#22c55e" strokeWidth={2} />
              <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Recent Activity - Table */}
        <ChartWrapper title="Recent Activity" icon={Clock} accentColor="purple">
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {activities?.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{activity.user}</p>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.time).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(activity.status)}`}
                  >
                    {activity.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ChartWrapper>
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add components/analytics/activity-section.tsx
git commit -m "feat: add activity section with line chart and activity table"
```

---

## Task 10: Create Resource Section Component

**Files:**

- Create: `components/analytics/resource-section.tsx`

**Step 1: Write resource section**

Create `components/analytics/resource-section.tsx`:

```typescript
"use client";

import { HardDrive, TrendingUp } from "lucide-react";
import { ChartWrapper } from "./chart-wrapper";
import { getStorageUsage } from "@/lib/analytics/data-fetchers";
import { generateMockBandwidth } from "@/lib/analytics/mock-data";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ZAxis } from "recharts";

const STORAGE_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ec4899"];

const FILE_TYPE_COLORS: Record<string, string> = {
  image: "#3b82f6",
  document: "#22c55e",
  video: "#f97316",
  other: "#a855f7",
};

export function ResourceSection() {
  const { data: storageData } = useQuery({
    queryKey: ["storageUsage"],
    queryFn: getStorageUsage,
  });

  const bandwidthData = generateMockBandwidth();

  // Storage pie chart data
  const storageChartData = storageData
    ? [
        { name: "Uploads", value: storageData.breakdown.uploads || 0 },
        { name: "Avatars", value: storageData.breakdown.avatars || 0 },
        { name: "Database", value: storageData.breakdown.database || 0 },
        { name: "Logs", value: storageData.breakdown.logs || 0 },
        { name: "Other", value: storageData.breakdown.other || 0 },
      ].filter((d) => d.value > 0)
    : [];

  // Bandwidth scatter chart data
  const scatterData = bandwidthData.map((d) => ({
    x: new Date(d.time).getTime(),
    y: d.fileSize,
    z: d.requests,
    fileType: d.fileType,
  }));

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Resource Usage</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Breakdown - Pie Chart */}
        <ChartWrapper title="Storage Breakdown" icon={HardDrive} accentColor="blue">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={storageChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${formatFileSize(entry.value)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {storageChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STORAGE_COLORS[index % STORAGE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatFileSize(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Bandwidth Usage - Bubble Chart */}
        <ChartWrapper title="Bandwidth Usage" icon={TrendingUp} accentColor="orange">
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <XAxis
                type="number"
                dataKey="x"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis
                type="number"
                dataKey="y"
                tickFormatter={(value) => formatFileSize(value)}
              />
              <ZAxis type="number" dataKey="z" range={[50, 300]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2 border rounded shadow">
                        <p>Time: {new Date(data.x).toLocaleString()}</p>
                        <p>Size: {formatFileSize(data.y)}</p>
                        <p>Requests: {data.z}</p>
                        <p>Type: {data.fileType}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={scatterData}>
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={FILE_TYPE_COLORS[entry.fileType]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add components/analytics/resource-section.tsx
git commit -m "feat: add resource section with pie and bubble charts"
```

---

## Task 11: Create Main Analytics Page

**Files:**

- Create: `app/analytics/page.tsx`

**Step 1: Write analytics page**

Create `app/analytics/page.tsx`:

```typescript
import { SummaryCards } from "@/components/analytics/summary-cards";
import { FilterBar } from "@/components/analytics/filter-bar";
import { UserStatsSection } from "@/components/analytics/user-stats-section";
import { SystemStatsSection } from "@/components/analytics/system-stats-section";
import { ActivitySection } from "@/components/analytics/activity-section";
import { ResourceSection } from "@/components/analytics/resource-section";
import { useState } from "react";

export const metadata = {
  title: "Analytics - Naiera Next",
  description: "Comprehensive analytics dashboard with colorful charts and metrics",
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

        <SummaryCards />

        <FilterBar
          onDateRangeChange={handleDateRangeChange}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        <UserStatsSection dateRange={dateRange} />

        <SystemStatsSection />

        <ActivitySection dateRange={dateRange} />

        <ResourceSection />
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/analytics/page.tsx
git commit -m "feat: add main analytics page with all sections"
```

---

## Task 12: Add Navigation Link to Dashboard

**Files:**

- Modify: `components/dashboard/sidebar.tsx` (or equivalent sidebar file)

**Step 1: Find sidebar file**

Run:

```bash
find components -name "*sidebar*" -o -name "*nav*" | grep -i dashboard
```

Expected: Path to sidebar/navigation component

**Step 2: Add analytics link**

Add to sidebar navigation (exact location depends on existing structure):

```typescript
<Link href="/analytics">
  <BarChart3 className="w-5 h-5" />
  <span>Analytics</span>
</Link>
```

**Step 3: Commit**

```bash
git add components/dashboard/sidebar.tsx
git commit -m "feat: add analytics link to sidebar navigation"
```

---

## Task 13: Add Loading State

**Files:**

- Create: `app/analytics/loading.tsx`

**Step 1: Write loading component**

Create `app/analytics/loading.tsx`:

```typescript
export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-white rounded-lg border border-gray-200 animate-pulse" />
          ))}
        </div>
        <div className="space-y-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-white rounded-lg border border-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/analytics/loading.tsx
git commit -m "feat: add loading state for analytics page"
```

---

## Task 14: Test the Dashboard

**Step 1: Start dev server**

Run:

```bash
pnpm dev
```

Expected: Server starts at http://localhost:3000

**Step 2: Navigate to analytics**

Open: http://localhost:3000/analytics

Expected: Page loads without errors

**Step 3: Verify components**

Check for:

- 4 summary cards visible
- Filter bar works (date picker, refresh button)
- User Stats section with charts
- System Stats section with charts
- Activity section with chart and table
- Resource section with charts
- All charts render correctly
- Colors are vibrant and distinct

**Step 4: Check console for errors**

Run:

```bash
Check browser DevTools Console
```

Expected: No errors or warnings

**Step 5: Test responsiveness**

Resize browser to tablet/mobile view

Expected: Cards stack vertically, charts remain readable

**Step 6: Commit any fixes**

```bash
git add .
git commit -m "fix: issues found during testing"
```

---

## Task 15: Add E2E Tests (Optional but Recommended)

**Files:**

- Create: `tests/e2e/analytics.spec.ts`

**Step 1: Write E2E test**

Create `tests/e2e/analytics.spec.ts`:

```typescript
import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.describe("Analytics Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should display analytics page", async ({ page }) => {
    await page.goto("/analytics");

    // Check page title
    await expect(page.locator("h1")).toContainText("Analytics Dashboard");

    // Check summary cards
    await expect(page.locator("text=Total Users")).toBeVisible();
    await expect(page.locator("text=Active Sessions")).toBeVisible();
    await expect(page.locator("text=API Requests")).toBeVisible();
    await expect(page.locator("text=Storage Used")).toBeVisible();
  });

  test("should display all sections", async ({ page }) => {
    await page.goto("/analytics");

    // Check sections
    await expect(page.locator("text=User Statistics")).toBeVisible();
    await expect(page.locator("text=System Statistics")).toBeVisible();
    await expect(page.locator("text=Activity Logs")).toBeVisible();
    await expect(page.locator("text=Resource Usage")).toBeVisible();
  });

  test("should have working filter bar", async ({ page }) => {
    await page.goto("/analytics");

    // Check date picker exists
    const dateRange = page.locator('[role="combobox"]');
    await expect(dateRange.first()).toBeVisible();

    // Check refresh button
    const refreshButton = page.locator("text=Refresh");
    await expect(refreshButton).toBeVisible();
  });
});
```

**Step 2: Run E2E tests**

Run:

```bash
pnpm test:e2e analytics.spec.ts
```

Expected: Tests pass

**Step 3: Commit**

```bash
git add tests/e2e/analytics.spec.ts
git commit -m "test: add E2E tests for analytics dashboard"
```

---

## Verification

After completing all tasks:

1. Navigate to `/analytics` - page loads without errors ✓
2. All 4 summary cards display with data ✓
3. Date range picker works and updates charts ✓
4. All 4 sections render correctly ✓
5. Charts use all required types (bar, line, pie, donut, area, stacked, gauge, bubble) ✓
6. Colors are vibrant and distinct (blue, green, orange, purple, pink, cyan, yellow) ✓
7. Layout responsive on mobile/tablet/desktop ✓
8. Real data loads from database (users, roles, storage) ✓
9. Mock data displays for system metrics ✓
10. Animations smooth on page load ✓
