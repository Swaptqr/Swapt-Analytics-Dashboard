"use client"

import { Button } from "@/components/ui/button"
import { RefreshCcwIcon } from "lucide-react"

interface NoDataStateProps {
  message?: string
  onRefresh?: () => void
}

export default function NoDataState({ message = "No data available", onRefresh }: NoDataStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <p className="text-muted-foreground mb-4">{message}</p>
      {onRefresh && (
        <Button variant="outline" onClick={onRefresh} className="flex items-center gap-2">
          <RefreshCcwIcon size={16} />
          Refresh Data
        </Button>
      )}
    </div>
  )
}
