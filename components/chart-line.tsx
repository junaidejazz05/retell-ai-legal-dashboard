"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { getWeeklyCallVolume, type Call } from "@/lib/retell-api"

const chartConfig = {
  incoming: {
    label: "Incoming",
    color: "hsl(var(--chart-1))",
  },
  outgoing: {
    label: "Outgoing",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface ChartLineProps {
  data: Call[]
  loading: boolean
}

export function ChartLine({ data, loading }: ChartLineProps) {
  const chartData = getWeeklyCallVolume(data)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">Loading chart data...</p>
      </div>
    )
  }

  const totalCalls = chartData.reduce((sum, day) => sum + day.incoming + day.outgoing, 0)
  const trend = chartData.length > 1 
    ? ((chartData[chartData.length - 1].incoming + chartData[chartData.length - 1].outgoing) - 
       (chartData[0].incoming + chartData[0].outgoing)) / 
       (chartData[0].incoming + chartData[0].outgoing) * 100
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Call Volume</CardTitle>
        <CardDescription>Past 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line dataKey="incoming" type="monotone" stroke="var(--color-incoming)" strokeWidth={2} dot={false} />
            <Line dataKey="outgoing" type="monotone" stroke="var(--color-outgoing)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {trend >= 0 ? "Trending up" : "Trending down"} by {Math.abs(trend).toFixed(1)}% this week <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {totalCalls} total calls in the last 7 days
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
