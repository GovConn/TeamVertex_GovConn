import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, Calendar, FileText, TrendingUp, Clock } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

type Trend = "up" | "down";
type StatItem = {
  title: string;
  value: string;
  change?: string;
  trend?: Trend;
  icon: any;
  description?: string;
};

const recentActivity = [
  {
    id: 1,
    type: "appointment",
    service: "Birth Certificate",
    time: "2 hours ago",
    status: "completed",
  },
  {
    id: 2,
    type: "document",
    service: "Land Registration",
    time: "4 hours ago",
    status: "pending",
  },
  {
    id: 3,
    type: "appointment",
    service: "Marriage Certificate",
    time: "6 hours ago",
    status: "cancelled",
  },
  {
    id: 4,
    type: "document",
    service: "Business License",
    time: "1 day ago",
    status: "approved",
  },
];

const dummySeries = [
  { date: "Aug 1", max_reserved: 12 },
  { date: "Aug 2", max_reserved: 18 },
  { date: "Aug 3", max_reserved: 9 },
  { date: "Aug 4", max_reserved: 15 },
  { date: "Aug 5", max_reserved: 22 },
  { date: "Aug 6", max_reserved: 14 },
  { date: "Aug 7", max_reserved: 19 },
  { date: "Aug 8", max_reserved: 16 },
  { date: "Aug 9", max_reserved: 21 },
  { date: "Aug 10", max_reserved: 11 },
  { date: "Aug 11", max_reserved: 25 },
  { date: "Aug 12", max_reserved: 13 },
  { date: "Aug 13", max_reserved: 20 },
  { date: "Aug 14", max_reserved: 17 },
  { date: "Aug 15", max_reserved: 23 },
  { date: "Aug 16", max_reserved: 15 },
];

const dummyStats: StatItem[] = [
  {
    title: "Today's Appointments",
    value: "14",
    change: "+8.3%",
    trend: "up",
    icon: Calendar,
    description: "vs yesterday",
  },
  {
    title: "Change vs Yesterday",
    value: "+8.3%",
    change: "+8.3%",
    trend: "up",
    icon: FileText,
    description: "Appointments percentage change",
  },
  {
    title: "Most Slots Reserving Period",
    value: "10:00 - 11:00",
    change: "22 reserved",
    trend: "up",
    icon: Clock,
    description: "Aug 5",
  },
  {
    title: "Overall Satisfaction",
    value: "4.3",
    change: "across 5 categories",
    trend: "up",
    icon: BarChart3,
    description: "Avg rating",
  },
];

export function Dashboard() {
  const [stats] = useState<StatItem[]>(dummyStats);
  const [mostSeries] =
    useState<{ date: string; max_reserved: number }[]>(dummySeries);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your office operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              {(stat.change || stat.description) && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp
                    className={`mr-1 h-3 w-3 ${
                      stat.trend === "up" ? "text-success" : "text-destructive"
                    }`}
                  />
                  {stat.change && (
                    <span
                      className={
                        stat.trend === "up"
                          ? "text-success"
                          : "text-destructive"
                      }
                    >
                      {stat.change}
                    </span>
                  )}
                  {stat.description && (
                    <span className="ml-1">{stat.description}</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest service requests and appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {activity.type === "appointment" ? (
                      <Calendar className="h-4 w-4 text-primary" />
                    ) : (
                      <FileText className="h-4 w-4 text-accent" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {activity.service}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      activity.status === "completed"
                        ? "bg-success/20 text-success"
                        : activity.status === "pending"
                        ? "bg-warning/20 text-warning"
                        : activity.status === "approved"
                        ? "bg-success/20 text-success"
                        : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Daily Most-Reserved Slot Count
            </CardTitle>
            <CardDescription>
              Peak-slot reservations across days for the selected service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="w-full aspect-auto h-72 mx-auto"
              config={{
                max_reserved: {
                  label: "Max reserved",
                  color: "#ffc107",
                },
              }}
            >
              <BarChart data={mostSeries} margin={{ left: 8, right: 8 }}>
                <CartesianGrid vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} width={32} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent nameKey="max_reserved" />}
                />
                <Bar
                  dataKey="max_reserved"
                  fill="var(--color-max_reserved)"
                  radius={4}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
