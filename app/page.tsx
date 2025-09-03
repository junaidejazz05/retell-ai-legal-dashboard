"use client"

import { PhoneCall, Clock, TrendingUp, Users, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartArea } from "@/components/chart-area"
import { ChartBar } from "@/components/chart-bar"
import { ChartLine } from "@/components/chart-line"
import { ChartPie } from "@/components/chart-pie"
import { useEffect, useState } from "react"
import { fetchCalls, calculateMetrics, type Call } from "@/lib/retell-api"

export default function Page() {
  const [metrics, setMetrics] = useState({
    totalCallsAllTime: 0,
    totalCallsToday: 0,
    percentChangeFromYesterday: 0,
    newClientCalls: 0,
    percentChangeNewClients: 0,
    avgDuration: "0:00",
    durationChange: "+",
    durationDiff: "0:00",
    conversionRate: 0,
    conversionRateChange: 0,
  })
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCallData = async () => {
      try {
        const response = await fetchCalls()
        setCalls(response.calls || [])
        const calculatedMetrics = calculateMetrics(response.calls || [])
        setMetrics(calculatedMetrics)
      } catch (error) {
        console.error("Failed to load call data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCallData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Call analytics and performance metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls (All Time)</CardTitle>
              <PhoneCall className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : metrics.totalCallsAllTime}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Client Calls</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : metrics.newClientCalls}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-accent">
                  {loading ? "..." : `${metrics.percentChangeNewClients >= 0 ? "+" : ""}${metrics.percentChangeNewClients.toFixed(1)}%`}
                </span> from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Call Duration (All Time)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : metrics.avgDuration}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-accent">
                  {loading ? "..." : `${metrics.durationChange}${metrics.durationDiff}`}
                </span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : `${metrics.conversionRate}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-accent">
                  {loading ? "..." : `${metrics.conversionRateChange >= 0 ? "+" : ""}${metrics.conversionRateChange.toFixed(1)}%`}
                </span> from last quarter
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Call Volume
                </CardTitle>
                <CardDescription>Track incoming calls and client inquiries over the past 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartLine data={calls} loading={loading} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Call Types Distribution
                </CardTitle>
                <CardDescription>Breakdown of consultation types and practice areas</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPie data={calls} loading={loading} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Monthly Performance
                </CardTitle>
                <CardDescription>Compare call volume and conversion rates by month</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartBar data={calls} loading={loading} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Call Duration Trends
                </CardTitle>
                <CardDescription>Average call length and consultation time analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartArea data={calls} loading={loading} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
