"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClockIcon, RepeatIcon, UsersIcon, ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface IntervalMetricsChartProps {
    avgSwaptSubmits: string | number
    avgSwaptInterval: string | number
    avgOrderInterval: string | number
}

export default function IntervalMetricsChart({
    avgSwaptSubmits,
    avgSwaptInterval,
    avgOrderInterval,
}: IntervalMetricsChartProps) {
    const [activeTab, setActiveTab] = useState("all")
    const [animationComplete, setAnimationComplete] = useState(false)
    // Remove the chart type state and buttons at the top
    // 1. Remove this line:
    // const [chartType, setChartType] = useState<"bar" | "radial">("bar")

    const [chartType, setChartType] = useState<"bar" | "radial">("bar")

    // Convert string values to numbers if needed
    const swaptSubmits = typeof avgSwaptSubmits === "string" ? Number.parseFloat(avgSwaptSubmits) : avgSwaptSubmits
    const swaptInterval = typeof avgSwaptInterval === "string" ? Number.parseFloat(avgSwaptInterval) : avgSwaptInterval
    const orderInterval = typeof avgOrderInterval === "string" ? Number.parseFloat(avgOrderInterval) : avgOrderInterval

    // Reset animation state when tab changes
    useEffect(() => {
        setAnimationComplete(false)
        const timer = setTimeout(() => setAnimationComplete(true), 2000)
        return () => clearTimeout(timer)
    }, [activeTab, chartType])

    // Format time values for better readability
    const formatTimeValue = (hours: number) => {
        if (hours < 24) {
            return `${hours.toFixed(1)} hours`
        } else if (hours < 168) {
            return `${(hours / 24).toFixed(1)} days`
        } else {
            return `${(hours / 168).toFixed(1)} weeks`
        }
    }

    // Calculate the percentage difference between two values
    const calculatePercentageDiff = (value1: number, value2: number) => {
        if (value1 === 0) return 0
        return ((value2 - value1) / value1) * 100
    }

    // Create data for the charts
    const timeMetricsData = [
        {
            id: "swaptInterval",
            name: "Swapt Interval",
            value: swaptInterval,
            color: "hsl(var(--chart-2))",
            bgColor: "bg-[hsl(var(--chart-2))]",
            lightBgColor: "bg-[hsl(var(--chart-2))/10%]",
            icon: <ClockIcon className="h-4 w-4" />,
            description: "Hours between submissions",
            unit: "hrs",
            days: (swaptInterval / 24).toFixed(1),
            weeks: (swaptInterval / 168).toFixed(1),
        },
        {
            id: "orderInterval",
            name: "Order Interval",
            value: orderInterval,
            color: "hsl(var(--chart-3))",
            bgColor: "bg-[hsl(var(--chart-3))]",
            lightBgColor: "bg-[hsl(var(--chart-3))/10%]",
            icon: <RepeatIcon className="h-4 w-4" />,
            description: "Hours between orders",
            unit: "hrs",
            days: (orderInterval / 24).toFixed(1),
            weeks: (orderInterval / 168).toFixed(1),
        },
    ]

    return (
        <Card className="w-full">
            {/* 2. Remove the chart type buttons from the CardHeader:
      Replace the entire CardHeader div with: */}
            <CardHeader>
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <ClockIcon className="h-5 w-5 text-blue-600" />
                        Interval Metrics
                    </CardTitle>
                    <CardDescription>Analysis of user behavior patterns and time intervals</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4 w-full justify-start overflow-x-auto">
                        <TabsTrigger value="all">All Metrics</TabsTrigger>
                        <TabsTrigger value="swaptSubmits">Swapt Submits</TabsTrigger>
                        <TabsTrigger value="timeComparison">Time Comparison</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Swapt Submits Card */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key="swaptSubmits"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Card className="border shadow-md overflow-hidden h-full">
                                        <div className={`h-2 w-full bg-[hsl(var(--chart-1))]`}></div>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-2 rounded-full bg-[hsl(var(--chart-1))] text-white`}>
                                                        <UsersIcon className="h-4 w-4" />
                                                    </div>
                                                    <CardTitle className="text-base">Swapt Submits</CardTitle>
                                                </div>
                                                <div className="text-2xl font-bold">{swaptSubmits.toFixed(2)}</div>
                                            </div>
                                            <CardDescription>Average submissions per profile</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="mt-2">
                                                <div className="relative pt-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="text-xs font-semibold inline-block text-blue-600">Engagement Level</div>
                                                        <div className="text-xs font-semibold inline-block text-blue-600">
                                                            {swaptSubmits < 1 ? "Low" : swaptSubmits < 3 ? "Medium" : "High"}
                                                        </div>
                                                    </div>
                                                    <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(swaptSubmits * 25, 100)}%` }}
                                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                                                        ></motion.div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 text-sm">
                                                {swaptSubmits < 1
                                                    ? "Users submit swapt data less than once on average."
                                                    : swaptSubmits < 3
                                                        ? "Users submit swapt data regularly."
                                                        : "Users are highly engaged with the swapt feature."}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </AnimatePresence>

                            {/* Swapt Interval Card */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key="swaptInterval"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                >
                                    <Card className="border shadow-md overflow-hidden h-full">
                                        <div className={`h-2 w-full bg-[hsl(var(--chart-2))]`}></div>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-2 rounded-full bg-[hsl(var(--chart-2))] text-white`}>
                                                        <ClockIcon className="h-4 w-4" />
                                                    </div>
                                                    <CardTitle className="text-base">Swapt Interval</CardTitle>
                                                </div>
                                                <div className="text-2xl font-bold">{swaptInterval.toFixed(2)}</div>
                                            </div>
                                            <CardDescription>Hours between submissions</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="mt-2">
                                                <div className="text-sm font-medium mb-1">Time Equivalent</div>
                                                <div className="text-lg font-bold text-[hsl(var(--chart-2))]">
                                                    {formatTimeValue(swaptInterval)}
                                                </div>
                                            </div>

                                            <div className="mt-4 text-sm">
                                                Users submit swapt data approximately every{" "}
                                                {swaptInterval < 24
                                                    ? `${swaptInterval.toFixed(1)} hours`
                                                    : swaptInterval < 168
                                                        ? `${(swaptInterval / 24).toFixed(1)} days`
                                                        : `${(swaptInterval / 168).toFixed(1)} weeks`}
                                                .
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </AnimatePresence>

                            {/* Order Interval Card */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key="orderInterval"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <Card className="border shadow-md overflow-hidden h-full">
                                        <div className={`h-2 w-full bg-[hsl(var(--chart-3))]`}></div>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-2 rounded-full bg-[hsl(var(--chart-3))] text-white`}>
                                                        <RepeatIcon className="h-4 w-4" />
                                                    </div>
                                                    <CardTitle className="text-base">Order Interval</CardTitle>
                                                </div>
                                                <div className="text-2xl font-bold">{orderInterval.toFixed(2)}</div>
                                            </div>
                                            <CardDescription>Hours between orders</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="mt-2">
                                                <div className="text-sm font-medium mb-1">Time Equivalent</div>
                                                <div className="text-lg font-bold text-[hsl(var(--chart-3))]">
                                                    {formatTimeValue(orderInterval)}
                                                </div>
                                            </div>

                                            <div className="mt-4 text-sm">
                                                Customers place orders approximately every{" "}
                                                {orderInterval < 24
                                                    ? `${orderInterval.toFixed(1)} hours`
                                                    : orderInterval < 168
                                                        ? `${(orderInterval / 24).toFixed(1)} days`
                                                        : `${(orderInterval / 168).toFixed(1)} weeks`}
                                                .
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* 3. Remove the entire Visual Comparison section from the "all" TabsContent by removing this block: */}
                    </TabsContent>

                    <TabsContent value="swaptSubmits" className="mt-0">
                        <div className="flex flex-col items-center">
                            <div className="w-full max-w-md">
                                <Card className="border shadow-md overflow-hidden">
                                    <div className="h-3 w-full bg-[hsl(var(--chart-1))]"></div>
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 rounded-full bg-[hsl(var(--chart-1))] text-white">
                                                    <UsersIcon className="h-5 w-5" />
                                                </div>
                                                <CardTitle>Swapt Submits</CardTitle>
                                            </div>
                                            <div className="text-3xl font-bold">{swaptSubmits.toFixed(2)}</div>
                                        </div>
                                        <CardDescription>Average submissions per profile</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mt-4">
                                            <div className="relative pt-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-xs font-semibold inline-block text-blue-600">Engagement Level</div>
                                                    <div className="text-xs font-semibold inline-block text-blue-600">
                                                        {swaptSubmits < 1 ? "Low" : swaptSubmits < 3 ? "Medium" : "High"}
                                                    </div>
                                                </div>
                                                <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(swaptSubmits * 25, 100)}%` }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                                                    ></motion.div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 space-y-4">
                                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                                <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">What this means</h4>
                                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                                    This metric shows how many times, on average, each user submits swapt data. Higher values
                                                    indicate more frequent engagement with the swapt feature.
                                                </p>
                                            </div>

                                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                                                <h4 className="font-medium mb-2">Insight</h4>
                                                <p className="text-sm">
                                                    {swaptSubmits < 1
                                                        ? "Users are submitting swapt data less than once on average. Consider strategies to increase engagement with the swapt feature."
                                                        : swaptSubmits < 3
                                                            ? "Users are submitting swapt data regularly. This shows good engagement with the feature."
                                                            : "Users are highly engaged with the swapt feature, submitting data frequently. This indicates strong user adoption."}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="timeComparison" className="mt-0">
                        {/* 4. Update the Time Comparison tab to use a fixed bar chart with better colors and hover effects:
            Replace the entire CardContent in the "timeComparison" TabsContent with: */}
                        <CardContent>
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Swapt Interval Card */}
                                    <Card className="border shadow-md overflow-hidden">
                                        <div className="h-3 w-full bg-[hsl(var(--chart-2))]"></div>
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 rounded-full bg-[hsl(var(--chart-2))] text-white">
                                                        <ClockIcon className="h-5 w-5" />
                                                    </div>
                                                    <CardTitle>Swapt Interval</CardTitle>
                                                </div>
                                                <div className="text-3xl font-bold">{swaptInterval.toFixed(2)}</div>
                                            </div>
                                            <CardDescription>Hours between submissions</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="mt-2">
                                                <div className="text-sm font-medium mb-1">Time Equivalent</div>
                                                <div className="text-lg font-bold text-[hsl(var(--chart-2))]">
                                                    {formatTimeValue(swaptInterval)}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Order Interval Card */}
                                    <Card className="border shadow-md overflow-hidden">
                                        <div className="h-3 w-full bg-[hsl(var(--chart-3))]"></div>
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 rounded-full bg-[hsl(var(--chart-3))] text-white">
                                                        <RepeatIcon className="h-5 w-5" />
                                                    </div>
                                                    <CardTitle>Order Interval</CardTitle>
                                                </div>
                                                <div className="text-3xl font-bold">{orderInterval.toFixed(2)}</div>
                                            </div>
                                            <CardDescription>Hours between orders</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="mt-2">
                                                <div className="text-sm font-medium mb-1">Time Equivalent</div>
                                                <div className="text-lg font-bold text-[hsl(var(--chart-3))]">
                                                    {formatTimeValue(orderInterval)}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Visual Comparison */}
                                <Card className="border shadow-md">
                                    <CardHeader>
                                        <div>
                                            <CardTitle>Visual Comparison</CardTitle>
                                            <CardDescription>Direct comparison of time intervals</CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            <div className="relative h-96 bg-gray-50 dark:bg-gray-900 rounded-lg p-6 overflow-hidden mt-4">
                                                {/* Background grid lines with fixed positioning */}
                                                <div className="absolute inset-x-16 top-8 bottom-20 flex flex-col justify-between">
                                                    {[0, 1, 2, 3, 4].map((i) => (
                                                        <div key={i} className="border-t border-gray-200 dark:border-gray-800 w-full">
                                                            <span className="absolute -mt-2.5 -ml-12 text-xs font-medium text-gray-700 dark:text-gray-300 w-8 text-right">
                                                                {100 - i * 25}%
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Main comparison container */}
                                                <div className="absolute inset-x-16 top-8 bottom-20 flex items-end justify-around px-12">
                                                    {/* Swapt Interval */}
                                                    <div className="flex flex-col items-center w-1/3 group">
                                                        <div className="absolute -top-2 text-center">
                                                            <div className="font-bold text-lg text-[hsl(var(--chart-2))]">
                                                                {swaptInterval.toFixed(1)} hrs
                                                            </div>
                                                        </div>
                                                        <div className="h-full flex items-end">
                                                            <motion.div
                                                                className="w-24 bg-gradient-to-t from-[hsl(var(--chart-2))] to-[hsl(var(--chart-2))/80%] rounded-t-md relative group-hover:shadow-lg transition-shadow"
                                                                style={{
                                                                    height: `${(swaptInterval / Math.max(swaptInterval, orderInterval)) * 100}%`,
                                                                }}
                                                                initial={{ height: 0 }}
                                                                animate={{
                                                                    height: `${(swaptInterval / Math.max(swaptInterval, orderInterval)) * 100}%`,
                                                                }}
                                                                transition={{ duration: 1.5 }}
                                                            >
                                                                {/* Glass effect */}
                                                                <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white to-transparent opacity-30 rounded-t-md"></div>

                                                                {/* Percentage */}
                                                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-lg">
                                                                    {Math.round((swaptInterval / Math.max(swaptInterval, orderInterval)) * 100)}%
                                                                </div>

                                                                {/* Hover tooltip */}
                                                                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg text-sm z-10 min-w-[200px]">
                                                                    <div className="font-bold text-[hsl(var(--chart-2))] mb-1">Swapt Interval</div>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="text-gray-500 dark:text-gray-400">Hours:</div>
                                                                        <div className="font-medium">{swaptInterval.toFixed(1)}</div>
                                                                        <div className="text-gray-500 dark:text-gray-400">Days:</div>
                                                                        <div className="font-medium">{(swaptInterval / 24).toFixed(1)}</div>
                                                                        <div className="text-gray-500 dark:text-gray-400">Weeks:</div>
                                                                        <div className="font-medium">{(swaptInterval / 168).toFixed(1)}</div>
                                                                    </div>
                                                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                                        Users submit swapt data approximately every {formatTimeValue(swaptInterval)}
                                                                    </div>
                                                                    <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 bg-white dark:bg-gray-800"></div>
                                                                </div>
                                                            </motion.div>
                                                        </div>
                                                        <div className="mt-4 text-center">
                                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                                <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]"></div>
                                                                <span className="font-medium">Swapt Interval</span>
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {(swaptInterval / 24).toFixed(1)} days
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Comparison Arrow */}
                                                    <div className="flex flex-col items-center justify-center h-full group">
                                                        {/* Percentage Difference Badge - Positioned at the top */}
                                                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                                            <Badge
                                                                variant="outline"
                                                                className={`${orderInterval > swaptInterval
                                                                        ? "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700"
                                                                        : "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700"
                                                                    }`}
                                                            >
                                                                {orderInterval > swaptInterval ? (
                                                                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                                                                ) : (
                                                                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                                                                )}
                                                                {Math.abs(calculatePercentageDiff(swaptInterval, orderInterval)).toFixed(1)}%{" "}
                                                                {orderInterval > swaptInterval ? "longer" : "shorter"}
                                                            </Badge>
                                                        </div>

                                                        <motion.div
                                                            initial={{ scale: 0, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ delay: 1, duration: 0.5 }}
                                                            className={`p-3 rounded-full ${orderInterval > swaptInterval
                                                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                                } group-hover:shadow-md transition-shadow`}
                                                        >
                                                            {orderInterval > swaptInterval ? (
                                                                <svg
                                                                    width="24"
                                                                    height="24"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path
                                                                        d="M7 17L17 7M17 7H7M17 7V17"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>
                                                            ) : (
                                                                <svg
                                                                    width="24"
                                                                    height="24"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path
                                                                        d="M7 7L17 17M17 17H7M17 17V7"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>
                                                            )}
                                                        </motion.div>

                                                        {/* Hover tooltip */}
                                                        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg text-sm z-10 min-w-[220px]">
                                                            <div className="font-bold mb-1 text-center">Interval Comparison</div>
                                                            <div className="text-center mb-2">
                                                                <span
                                                                    className={`font-medium ${orderInterval > swaptInterval
                                                                            ? "text-amber-600 dark:text-amber-400"
                                                                            : "text-emerald-600 dark:text-emerald-400"
                                                                        }`}
                                                                >
                                                                    {Math.abs(calculatePercentageDiff(swaptInterval, orderInterval)).toFixed(1)}%{" "}
                                                                    {orderInterval > swaptInterval ? "longer" : "shorter"}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {orderInterval > swaptInterval
                                                                    ? "Customers place orders less frequently than they submit swapt data."
                                                                    : "Customers place orders more frequently than they submit swapt data."}
                                                            </div>
                                                            <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 bg-white dark:bg-gray-800"></div>
                                                        </div>
                                                    </div>

                                                    {/* Order Interval */}
                                                    <div className="flex flex-col items-center w-1/3 group">
                                                        <div className="absolute -top-2 text-center">
                                                            <div className="font-bold text-lg text-[hsl(var(--chart-3))]">
                                                                {orderInterval.toFixed(1)} hrs
                                                            </div>
                                                        </div>
                                                        <div className="h-full flex items-end">
                                                            <motion.div
                                                                className="w-24 bg-gradient-to-t from-[hsl(var(--chart-3))] to-[hsl(var(--chart-3))/80%] rounded-t-md relative group-hover:shadow-lg transition-shadow"
                                                                style={{
                                                                    height: `${(orderInterval / Math.max(swaptInterval, orderInterval)) * 100}%`,
                                                                }}
                                                                initial={{ height: 0 }}
                                                                animate={{
                                                                    height: `${(orderInterval / Math.max(swaptInterval, orderInterval)) * 100}%`,
                                                                }}
                                                                transition={{ duration: 1.5 }}
                                                            >
                                                                {/* Glass effect */}
                                                                <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white to-transparent opacity-30 rounded-t-md"></div>

                                                                {/* Percentage */}
                                                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-lg">
                                                                    {Math.round((orderInterval / Math.max(swaptInterval, orderInterval)) * 100)}%
                                                                </div>

                                                                {/* Hover tooltip */}
                                                                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg text-sm z-10 min-w-[200px]">
                                                                    <div className="font-bold text-[hsl(var(--chart-3))] mb-1">Order Interval</div>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div className="text-gray-500 dark:text-gray-400">Hours:</div>
                                                                        <div className="font-medium">{orderInterval.toFixed(1)}</div>
                                                                        <div className="text-gray-500 dark:text-gray-400">Days:</div>
                                                                        <div className="font-medium">{(orderInterval / 24).toFixed(1)}</div>
                                                                        <div className="text-gray-500 dark:text-gray-400">Weeks:</div>
                                                                        <div className="font-medium">{(orderInterval / 168).toFixed(1)}</div>
                                                                    </div>
                                                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                                        Customers place orders approximately every {formatTimeValue(orderInterval)}
                                                                    </div>
                                                                    <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 bg-white dark:bg-gray-800"></div>
                                                                </div>
                                                            </motion.div>
                                                        </div>
                                                        <div className="mt-4 text-center">
                                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                                <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-3))]"></div>
                                                                <span className="font-medium">Order Interval</span>
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {(orderInterval / 24).toFixed(1)} days
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Difference Analysis */}
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`p-2 rounded-full ${orderInterval > swaptInterval
                                                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                            }`}
                                                    >
                                                        {orderInterval > swaptInterval ? (
                                                            <ArrowUpIcon className="h-5 w-5" />
                                                        ) : (
                                                            <ArrowDownIcon className="h-5 w-5" />
                                                        )}
                                                    </div>
                                                    <span className="text-base font-medium">
                                                        Order interval is{" "}
                                                        <span className="font-bold">
                                                            {Math.abs(calculatePercentageDiff(swaptInterval, orderInterval)).toFixed(1)}%{" "}
                                                            {orderInterval > swaptInterval ? "longer" : "shorter"} than swapt interval
                                                        </span>
                                                    </span>
                                                </div>
                                                <div className="text-sm mt-2 ml-9">
                                                    {orderInterval > swaptInterval
                                                        ? "Customers place orders less frequently than they submit swapt data."
                                                        : "Customers place orders more frequently than they submit swapt data."}
                                                </div>
                                            </div>

                                            {/* Time Conversion Cards */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {timeMetricsData.map((metric) => (
                                                    <div
                                                        key={`${metric.id}-conversion`}
                                                        className={`${metric.lightBgColor} border rounded-lg p-4`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className={`w-3 h-3 rounded-full ${metric.bgColor}`}></div>
                                                            <h3 className="font-medium">{metric.name} in Different Units</h3>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-center">
                                                                <div className="text-xs text-muted-foreground mb-1">Hours</div>
                                                                <div className="text-lg font-bold">{metric.value.toFixed(1)}</div>
                                                            </div>
                                                            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-center">
                                                                <div className="text-xs text-muted-foreground mb-1">Days</div>
                                                                <div className="text-lg font-bold">{metric.days}</div>
                                                            </div>
                                                            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-center">
                                                                <div className="text-xs text-muted-foreground mb-1">Weeks</div>
                                                                <div className="text-lg font-bold">{metric.weeks}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}