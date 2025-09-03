"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { getCallTypesDistribution, type Call } from "@/lib/retell-api"

const chartConfig = {
  count: {
    label: "Calls",
  },
  "Initial Consultation": {
    label: "Initial Consultation",
    color: "hsl(var(--chart-1))",
  },
  "Follow-up": {
    label: "Follow-up",
    color: "hsl(var(--chart-2))",
  },
  "Case Update": {
    label: "Case Update",
    color: "hsl(var(--chart-3))",
  },
  "Emergency": {
    label: "Emergency",
    color: "hsl(var(--chart-4))",
  },
  "Other": {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

interface ChartPieProps {
  data: Call[]
  loading: boolean
}

export function ChartPie({ data, loading }: ChartPieProps) {
  const chartData = getCallTypesDistribution(data)
  
  const totalCalls = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0)
  }, [chartData])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">Loading chart data...</p>
      </div>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Call Types Distribution</CardTitle>
        <CardDescription>Breakdown by consultation type</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="count" nameKey="category" innerRadius={60} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {totalCalls.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                          Calls
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total calls analyzed <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">{totalCalls} calls categorized by type</div>
      </CardFooter>
    </Card>
  )
}
