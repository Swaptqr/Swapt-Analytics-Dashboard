"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface FunnelChartProps {
  data: { name: string; value: number }[]
}

export default function InteractiveFunnelChart({ data }: FunnelChartProps) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  const maxValue = data[0].value
  const colors = ["#4f46e5", "#38bdf8", "#a855f7"]

  // Calculate conversion rates between steps
  const conversionRates = data.slice(1).map((step, index) => {
    const previousValue = data[index].value
    return (step.value / previousValue) * 100
  })

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          {data.map((step, index) => {
            const width = `${(step.value / maxValue) * 100}%`
            const isHovered = hoveredStep === index

            return (
              <div key={index} className="w-full flex flex-col items-center">
                <motion.div
                  className="relative w-full flex justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <motion.div
                    className={`h-16 rounded-md transition-all duration-300 ${isHovered ? "opacity-90 shadow-lg" : "shadow-md"}`}
                    style={{
                      width,
                      backgroundColor: colors[index % colors.length],
                      maxWidth: "90%",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    onMouseEnter={() => setHoveredStep(index)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                      {step.value}%
                    </div>

                    {/* Glass effect at the top */}
                    <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white to-transparent opacity-30 rounded-t-md"></div>
                  </motion.div>
                </motion.div>

                <div className="mt-2 text-sm font-medium">{step.name}</div>

                {index < data.length - 1 && (
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 5V19M12 19L5 12M12 19L19 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{conversionRates[index].toFixed(1)}% conversion</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Tooltip for detailed information */}
      {hoveredStep !== null && (
        <div
          className="absolute bg-white dark:bg-gray-800 shadow-lg rounded-md p-3 text-sm z-10 pointer-events-none transform -translate-x-1/2 -translate-y-full border border-gray-200 dark:border-gray-700"
          style={{
            left: "50%",
            top: `${120 + hoveredStep * 100}px`,
            minWidth: "220px",
          }}
        >
          <div className="font-bold text-blue-600 dark:text-blue-400">{data[hoveredStep].name}</div>
          <div className="mt-1 flex items-center">
            <span className="font-semibold">{data[hoveredStep].value.toFixed(1)}%</span>
            <span className="text-xs ml-2 text-muted-foreground">of total customers</span>
          </div>
          {hoveredStep > 0 && (
            <div className="mt-1 flex items-center">
              <span className="font-medium text-emerald-500">{conversionRates[hoveredStep - 1].toFixed(1)}%</span>
              <span className="text-xs ml-2 text-muted-foreground">conversion from {data[hoveredStep - 1].name}</span>
            </div>
          )}
          {hoveredStep < data.length - 1 && (
            <div className="mt-1 flex items-center">
              <span className="font-medium text-amber-500">{(100 - conversionRates[hoveredStep]).toFixed(1)}%</span>
              <span className="text-xs ml-2 text-muted-foreground">drop-off to next step</span>
            </div>
          )}
          <div className="mt-2 text-xs text-muted-foreground">
            {hoveredStep === 0
              ? "Product views by customers"
              : hoveredStep === 1
                ? "Customers who added to cart"
                : "Customers who completed purchase"}
          </div>
        </div>
      )}
    </div>
  )
}
