"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3Icon } from "lucide-react"

interface AttributeDistributionTableProps {
  data: Record<string, number>
}

export default function AttributeDistributionTable({ data }: AttributeDistributionTableProps) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-muted-foreground">No attribute data available</p>
      </div>
    )
  }

  // Convert the data object to an array of [attribute, count] pairs
  const attributeEntries = Object.entries(data)

  // Sort by count in descending order
  const sortedAttributes = attributeEntries.sort((a, b) => b[1] - a[1])

  // Calculate total for percentages
  const total = sortedAttributes.reduce((sum, [_, count]) => sum + count, 0)

  return (
    <Card className="border shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gray-50 dark:bg-gray-900 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <BarChart3Icon size={18} className="text-blue-600" />
          Product Attributes Distribution
        </CardTitle>
        <CardDescription>Breakdown of product attributes and their frequency</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
              <TableRow>
                <TableHead className="font-semibold">Attribute</TableHead>
                <TableHead className="font-semibold text-right">Count</TableHead>
                <TableHead className="font-semibold text-right">Percentage</TableHead>
                <TableHead className="font-semibold">Distribution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAttributes.map(([attribute, count], index) => {
                const percentage = (count / total) * 100

                return (
                  <TableRow key={attribute} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <TableCell className="font-medium">{attribute}</TableCell>
                    <TableCell className="text-right">{count}</TableCell>
                    <TableCell className="text-right">{percentage.toFixed(1)}%</TableCell>
                    <TableCell className="w-1/3">
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full animate-in slide-in-from-left duration-1000"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: getColorForIndex(index),
                            animationDelay: `${index * 50}ms`,
                          }}
                        ></div>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to get color based on index
function getColorForIndex(index: number) {
  const colors = [
    "#4f46e5", // indigo
    "#8b5cf6", // violet
    "#06b6d4", // cyan
    "#0ea5e9", // sky
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f97316", // orange
  ]
  return colors[index % colors.length]
}
