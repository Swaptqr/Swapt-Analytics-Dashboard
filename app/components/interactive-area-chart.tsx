"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface InteractiveAreaChartProps {
  data: Record<string, number[]>
  labels: string[]
  colors: Record<string, string>
}

export default function InteractiveAreaChart({ data, labels, colors }: InteractiveAreaChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    series: string
    index: number
    value: number
    x: number
    y: number
  } | null>(null)

  if (!data || Object.keys(data).length === 0 || !labels || labels.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  // Find the max value for scaling
  const allValues = Object.values(data).flat()
  const maxValue = Math.max(...allValues)
  const minValue = Math.min(...allValues)
  const range = maxValue - minValue
  const padding = range * 0.1 // 10% padding

  const yMax = maxValue + padding
  const yMin = Math.max(0, minValue - padding)

  // Create points for each dataset
  const datasets = Object.keys(data).map((key) => {
    return {
      name: key,
      color: colors[key] || "#000000",
      points: data[key].map((value, i) => {
        const x = (i / (labels.length - 1)) * 100
        const y = 100 - ((value - yMin) / (yMax - yMin)) * 100
        return { x, y, value, label: labels[i] }
      }),
    }
  })

  // Only show a subset of labels for readability
  const visibleLabels =
    labels.length <= 7
      ? labels
      : labels.filter((_, i) => i % Math.ceil(labels.length / 7) === 0 || i === labels.length - 1)

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-purple-50/30 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg"></div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-14 flex flex-col justify-between text-xs text-muted-foreground">
          <div>{yMax.toFixed(0)}</div>
          <div>{((yMax + yMin) / 2).toFixed(0)}</div>
          <div>{yMin.toFixed(0)}</div>
        </div>

        {/* Grid lines */}
        <div className="absolute left-14 right-0 top-0 bottom-0">
          <div className="absolute inset-0 border-b border-gray-200 dark:border-gray-800"></div>
          <div className="absolute inset-0 h-1/2 border-b border-gray-200 dark:border-gray-800"></div>
          <div className="absolute inset-0 h-1/4 border-b border-gray-200 dark:border-gray-800"></div>
          <div className="absolute inset-0 h-3/4 border-b border-gray-200 dark:border-gray-800"></div>

          {/* Lines for each dataset */}
          {datasets.map((dataset, datasetIndex) => (
            <div key={datasetIndex} className="absolute inset-0">
              <svg className="w-full h-full">
                {/* Area under the line */}
                <motion.path
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  transition={{ duration: 1, delay: datasetIndex * 0.3 }}
                  d={`
                    ${dataset.points.map((point, i) => `${i === 0 ? "M" : "L"} ${point.x}% ${point.y}%`).join(" ")}
                    L ${dataset.points[dataset.points.length - 1].x}% 100%
                    L 0% 100%
                    Z
                  `}
                  fill={`url(#gradient-${datasetIndex})`}
                />

                {/* Line with animation */}
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: datasetIndex * 0.3, ease: "easeInOut" }}
                  d={dataset.points.map((point, i) => `${i === 0 ? "M" : "L"} ${point.x}% ${point.y}%`).join(" ")}
                  fill="none"
                  stroke={dataset.color}
                  strokeWidth="2"
                  className="drop-shadow-sm"
                />

                {/* Gradient definitions */}
                <defs>
                  <linearGradient id={`gradient-${datasetIndex}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={dataset.color} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={dataset.color} stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Data points - show all points */}
                {dataset.points.map((point, i) => (
                  <g key={i}>
                    <circle
                      cx={`${point.x}%`}
                      cy={`${point.y}%`}
                      r="4"
                      fill={dataset.color}
                      stroke="white"
                      strokeWidth="1.5"
                      className={`drop-shadow-sm cursor-pointer transition-all duration-200 ${
                        hoveredPoint && hoveredPoint.series === dataset.name && hoveredPoint.index === i
                          ? "r-6 stroke-width-3"
                          : ""
                      }`}
                      onMouseEnter={() =>
                        setHoveredPoint({
                          series: dataset.name,
                          index: i,
                          value: point.value,
                          x: point.x,
                          y: point.y,
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />

                    {/* Larger invisible circle for easier hover */}
                    <circle
                      cx={`${point.x}%`}
                      cy={`${point.y}%`}
                      r="12"
                      fill="transparent"
                      onMouseEnter={() =>
                        setHoveredPoint({
                          series: dataset.name,
                          index: i,
                          value: point.value,
                          x: point.x,
                          y: point.y,
                        })
                      }
                      className="cursor-pointer"
                    />
                  </g>
                ))}
              </svg>
            </div>
          ))}

          {/* Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 text-sm z-10 pointer-events-none transform -translate-x-1/2 -translate-y-full border border-gray-200 dark:border-gray-700"
              style={{
                left: `calc(${hoveredPoint.x}% + 14px)`,
                top: `${hoveredPoint.y}%`,
                marginTop: "-10px",
                maxWidth: "200px",
              }}
            >
              <div className="font-bold text-blue-600 dark:text-blue-400">{labels[hoveredPoint.index]}</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[hoveredPoint.series] }}></div>
                <span className="whitespace-nowrap">
                  {hoveredPoint.series === "LTV" ? "$" : ""}
                  {hoveredPoint.value.toFixed(hoveredPoint.series === "Frequency" ? 2 : 0)}
                  {hoveredPoint.series === "Frequency" ? " orders" : hoveredPoint.series === "LTV" ? "" : "$"}
                </span>
              </div>
              {hoveredPoint.index > 0 &&
                data[hoveredPoint.series] &&
                data[hoveredPoint.series][hoveredPoint.index - 1] && (
                  <div className="text-xs text-muted-foreground mt-1">
                    <span
                      className={
                        hoveredPoint.value > data[hoveredPoint.series][hoveredPoint.index - 1]
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }
                    >
                      {(
                        ((hoveredPoint.value - data[hoveredPoint.series][hoveredPoint.index - 1]) /
                          data[hoveredPoint.series][hoveredPoint.index - 1]) *
                        100
                      ).toFixed(1)}
                      %{hoveredPoint.value > data[hoveredPoint.series][hoveredPoint.index - 1] ? " ↑" : " ↓"} from
                      previous
                    </span>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="h-6 flex justify-between mt-2 pl-14">
        {visibleLabels.map((label, i) => (
          <div key={i} className="text-xs text-muted-foreground">
            {label}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center mt-2 gap-6">
        {datasets.map((dataset, i) => (
          <div key={i} className="flex items-center group cursor-pointer">
            <div
              className="w-4 h-4 rounded-full mr-2 transition-transform duration-300 group-hover:scale-125"
              style={{ backgroundColor: dataset.color }}
            ></div>
            <span className="text-sm font-medium group-hover:font-bold transition-all">{dataset.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
