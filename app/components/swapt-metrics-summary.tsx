"use client"

import { motion } from "framer-motion"
import { Users, UserPlus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SwaptMetricsSummaryProps {
    totalSwaptSubmits: number
    netNewSubscribers: number
}

export default function SwaptMetricsSummary({ totalSwaptSubmits, netNewSubscribers }: SwaptMetricsSummaryProps) {
    const conversionRate = netNewSubscribers > 0 ? (netNewSubscribers / totalSwaptSubmits) * 100 : 0

    // Add debugging
    console.log("SwaptMetricsSummary received:", { totalSwaptSubmits, netNewSubscribers, conversionRate })

    return (
        <Card className="border shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-t-lg border-b">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Users className="h-5 w-5 text-blue-600" />
                    Swapt Submission Metrics
                </CardTitle>
                <CardDescription>Summary of all Swapt submissions and new subscribers</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Total Swapt Submits */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Total Swapt Submits</h3>
                                <div className="mt-2 flex items-baseline">
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                        {totalSwaptSubmits.toLocaleString()}
                                    </p>
                                </div>
                                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">Total number of Swapt codes submitted</p>
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full">
                                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="relative pt-1">
                                <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200 dark:bg-blue-700/50">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1 }}
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                                    ></motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Net New Subscribers */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-100 dark:border-emerald-800"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Net New Subscribers</h3>
                                <div className="mt-2 flex items-baseline">
                                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {netNewSubscribers.toLocaleString()}
                                    </p>
                                </div>
                                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                                    Unique profiles that submitted Swapt codes
                                </p>
                            </div>
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-800 rounded-full">
                                <UserPlus className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="relative pt-1">
                                <div className="overflow-hidden h-2 text-xs flex rounded bg-emerald-200 dark:bg-emerald-700/50">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, conversionRate * 100)}%` }}
                                        transition={{ duration: 1 }}
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-600"
                                    ></motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Conversion Rate */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium">Conversion Rate</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                Percentage of unique subscribers from total submissions
                            </p>
                        </div>
                        <div className="text-lg font-bold">{conversionRate.toFixed(1)}%</div>
                    </div>
                    <div className="mt-2">
                        <div className="relative pt-1">
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, conversionRate)}%` }}
                                    transition={{ duration: 1 }}
                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-600"
                                ></motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
