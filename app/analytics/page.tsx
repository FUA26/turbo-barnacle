import { ActivitySection } from "@/components/analytics/activity-section";
import { FilterBar } from "@/components/analytics/filter-bar";
import { ResourceSection } from "@/components/analytics/resource-section";
import { SummaryCards } from "@/components/analytics/summary-cards";
import { SystemStatsSection } from "@/components/analytics/system-stats-section";
import { UserStatsSection } from "@/components/analytics/user-stats-section";
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
