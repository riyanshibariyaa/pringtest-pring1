"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts"

import { cn } from "@/lib/utils"

const COLORS = ["#0077C0", "#434343", "#1a8dd4", "#5a5a5a", "#005a9e"]

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("w-full h-[300px]", className)} {...props}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    )
  },
)
ChartContainer.displayName = "ChartContainer"

interface PieChartComponentProps {
  data: Array<{ name: string; value: number }>
  className?: string
}

const PieChartComponent = ({ data, className }: PieChartComponentProps) => {
  return (
    <ChartContainer className={className}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ChartContainer>
  )
}

interface BarChartComponentProps {
  data: Array<{ name: string; value: number }>
  className?: string
}

const BarChartComponent = ({ data, className }: BarChartComponentProps) => {
  return (
    <ChartContainer className={className}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#434343" />
        <XAxis dataKey="name" stroke="#a0a0a0" />
        <YAxis stroke="#a0a0a0" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#434343",
            border: "1px solid #0077C0",
            borderRadius: "8px",
            color: "#ffffff",
          }}
        />
        <Bar dataKey="value" fill="#0077C0" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}

interface LineChartComponentProps {
  data: Array<{ name: string; value: number }>
  className?: string
}

const LineChartComponent = ({ data, className }: LineChartComponentProps) => {
  return (
    <ChartContainer className={className}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#434343" />
        <XAxis dataKey="name" stroke="#a0a0a0" />
        <YAxis stroke="#a0a0a0" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#434343",
            border: "1px solid #0077C0",
            borderRadius: "8px",
            color: "#ffffff",
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#0077C0"
          strokeWidth={3}
          dot={{ fill: "#0077C0", strokeWidth: 2, r: 6 }}
          activeDot={{ r: 8, stroke: "#0077C0", strokeWidth: 2 }}
        />
      </LineChart>
    </ChartContainer>
  )
}

export { ChartContainer, PieChartComponent, BarChartComponent, LineChartComponent }
