"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface CategoryAffinityBarChartProps {
  data: Array<{ category: string; strength: number }>
}

// Update the CategoryAffinityBarChart component to fix the UI and make it scrollable
export default function CategoryAffinityBarChart({ data }: CategoryAffinityBarChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No category data available</p>
      </div>
    )
  }

  // Sort data by strength for better visualization
  const sortedData = [...data].sort((a, b) => b.strength - a.strength)

  return (
    <div className="w-full h-full">
      <div className="h-full overflow-y-auto pr-1 custom-scrollbar">
        <div className="flex flex-col h-full justify-start gap-4 px-4 pb-4">
          {sortedData.map((item, index) => {
            const isHovered = hoveredCategory === item.category

            return (
              <div key={item.category} className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{item.category}</span>
                  <span className="text-sm font-bold">{item.strength}%</span>
                </div>
                <div className="relative h-8 w-full bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                  <motion.div
                    className={`h-full rounded-md transition-all duration-300 ${isHovered ? "opacity-90" : ""}`}
                    style={{
                      width: `${item.strength}%`,
                      background: `linear-gradient(90deg, #4f46e5 0%, #8b5cf6 100%)`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.strength}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    onMouseEnter={() => setHoveredCategory(item.category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    {/* Glass effect */}
                    <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white to-transparent opacity-30"></div>
                  </motion.div>
                </div>

                {isHovered && (
                  <motion.div
                    className="text-xs text-muted-foreground mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    Customers with affinity for {item.category} are{" "}
                    {item.strength > 70 ? "highly likely" : item.strength > 40 ? "likely" : "somewhat likely"} to make
                    repeat purchases.
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
