"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { getCallDurationTrends, type Call } from "@/lib/retell-api"

const chartConfig = {
  duration: {
    label: "Avg Duration (min)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

interface ChartAreaProps {
  data: Call[]
  loading: boolean
}

export function ChartArea({ data, loading }: ChartAreaProps) {
  const chartData = getCallDurationTrends(data)
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">Loading chart data...</p>
      </div>
    )
  }
  const avgDuration = chartData.length > 0
    ? chartData.reduce((sum, day) => sum + day.duration, 0) / chartData.length
    : 0
  
  const trend = chartData.length > 1
    ? ((chartData[chartData.length - 1].duration - chartData[0].duration) / chartData[0].duration) * 100
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Duration Trends</CardTitle>
        <CardDescription>Average call duration over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="duration"
              type="natural"
              fill="var(--color-duration)"
              fillOpacity={0.4}
              stroke="var(--color-duration)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {trend >= 0 ? "Trending up" : "Trending down"} by {Math.abs(trend).toFixed(1)}% <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Average duration: {avgDuration.toFixed(1)} minutes
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
