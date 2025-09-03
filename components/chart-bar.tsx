"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getMonthlyPerformance, type Call } from "@/lib/retell-api"

const chartConfig = {
  calls: {
    label: "Total Calls",
    color: "hsl(var(--chart-1))",
  },
  conversionRate: {
    label: "Conversion Rate (%)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface ChartBarProps {
  data: Call[]
  loading: boolean
}

export function ChartBar({ data, loading }: ChartBarProps) {
  const chartData = getMonthlyPerformance(data)
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">Loading chart data...</p>
      </div>
    )
  }
  const avgConversionRate = chartData.length > 0
    ? chartData.reduce((sum, month) => sum + month.conversionRate, 0) / chartData.length
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Performance</CardTitle>
        <CardDescription>Last 6 months overview</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="calls" fill="var(--color-calls)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="conversionRate" fill="var(--color-conversionRate)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Average conversion rate: {avgConversionRate.toFixed(1)}% <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">Call volume and success rates by month</div>
      </CardFooter>
    </Card>
  )
}
