/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

type ChartDataProps = {
  data: any[]
  config: {
    [key: string]: {
      label: string
      color: string
    }
  }
}

export function RevenueLineChart({ data, config }: ChartDataProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis 
          dataKey="name" 
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip
          contentStyle={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Line 
          type="monotone" 
          dataKey="revenue"
          stroke={config.revenue.color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function FuelUsageLineChart({ data, config }: ChartDataProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis 
          dataKey="name" 
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}L`}
        />
        <Tooltip
          contentStyle={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Line 
          type="monotone" 
          dataKey="fuel_usage"
          stroke={config.fuel_usage.color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}