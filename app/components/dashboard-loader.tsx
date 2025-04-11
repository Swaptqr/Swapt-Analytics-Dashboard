"use client"

import { motion } from "framer-motion"
import { BarChart3Icon, ClockIcon, DollarSignIcon, ShoppingCartIcon, Users } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoader() {
    return (
        <div className="space-y-6 w-full">
            {/* Header with animated gradient */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 border border-blue-100 dark:border-blue-900/50 shadow-sm">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-100/0 via-blue-200/30 to-blue-100/0 dark:from-blue-800/0 dark:via-blue-700/10 dark:to-blue-800/0"
                    animate={{
                        x: ["0%", "100%", "0%"],
                    }}
                    transition={{
                        duration: 5,
                        ease: "easeInOut",
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "loop",
                    }}
                />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="bg-blue-600 text-white p-2 rounded-lg"
                        >
                            <BarChart3Icon className="h-6 w-6" />
                        </motion.div>
                        <div>
                            <motion.h1
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-2xl sm:text-3xl font-bold"
                            >
                                Swapt Analytics Dashboard
                            </motion.h1>
                            <motion.p
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-sm text-muted-foreground"
                            >
                                Loading your analytics data...
                            </motion.p>
                        </div>
                    </div>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex gap-2"
                    >
                        <Skeleton className="h-10 w-32 rounded-md" />
                        <Skeleton className="h-10 w-32 rounded-md" />
                    </motion.div>
                </div>

                {/* Loading progress bar */}
                <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-blue-600"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 8, ease: "easeInOut" }}
                />
            </div>

            {/* Loading message */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center justify-center gap-3 text-sm text-muted-foreground"
            >
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <span>Fetching your latest analytics data...</span>
            </motion.div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { icon: <BarChart3Icon className="h-4 w-4" />, title: "Purchase Frequency", color: "bg-indigo-600" },
                    { icon: <DollarSignIcon className="h-4 w-4" />, title: "Customer LTV", color: "bg-violet-600" },
                    { icon: <ShoppingCartIcon className="h-4 w-4" />, title: "Average Order Value", color: "bg-emerald-600" },
                    { icon: <DollarSignIcon className="h-4 w-4" />, title: "Total Revenue", color: "bg-amber-600" },
                ].map((metric, index) => (
                    <motion.div
                        key={metric.title}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    >
                        <Card className="border shadow-sm overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white dark:bg-gray-950">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-full ${metric.color} text-white`}>{metric.icon}</div>
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-4 w-8" />
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-3 w-24" />
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Swapt Metrics Summary Placeholder */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                <Card className="border shadow-sm">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-t-lg border-b">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-blue-600 text-white">
                                <Users className="h-4 w-4" />
                            </div>
                            <Skeleton className="h-5 w-48" />
                        </div>
                        <Skeleton className="h-4 w-64 mt-1" />
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Skeleton className="h-32 w-full rounded-lg" />
                            <Skeleton className="h-32 w-full rounded-lg" />
                        </div>
                        <Skeleton className="h-20 w-full rounded-lg mt-6" />
                    </CardContent>
                </Card>
            </motion.div>

            {/* Interval Metrics */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                <Card className="border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-blue-600 text-white">
                                <ClockIcon className="h-4 w-4" />
                            </div>
                            <Skeleton className="h-5 w-32" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-64" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[0, 1, 2].map((i) => (
                                    <Card key={i} className="border shadow-sm">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between">
                                                <Skeleton className="h-5 w-24" />
                                                <Skeleton className="h-5 w-16" />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-3/4" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Tabs and Content */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
            >
                <Card className="border shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex space-x-2">
                            {[0, 1, 2].map((i) => (
                                <Skeleton key={i} className="h-8 w-24 rounded-md" />
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Skeleton className="h-64 w-full rounded-lg" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Skeleton className="h-32 w-full rounded-lg" />
                                <Skeleton className="h-32 w-full rounded-lg" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Animated dots */}
            <div className="flex justify-center items-center gap-2 py-4">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-blue-600"
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.2,
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
