"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import {
  BarChart3Icon,
  DownloadIcon,
  CalendarIcon,
  TrendingUpIcon,
  ShoppingCartIcon,
  PackageIcon,
  DollarSignIcon,
  TagIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import NoDataState from "./components/no-data-state"
import ApiKeyManager from "./components/api-key-manager"
import IntervalMetricsChart from "../components/interval-metrics-chart"
import DashboardLoader from "./components/dashboard-loader"
import SwaptMetricsSummary from "./components/swapt-metrics-summary"

// ==========================================
// Data Types
// ==========================================
interface Metric {
  value: string
  change: number
  label: string
  data: any[]
}

interface ProductCategory {
  name: string
  count: number
  percentage: string
}

interface DetailedMetrics {
  products: {
    topCategories: ProductCategory[]
    attributeDistribution: Record<string, number>
    itemsPerOrder: string
    discountRate: number
  }
  orders: {
    total: number
    averageItemCount: string
    discountedOrders?: number
    discountedOrdersPercentage: number | string
    dailyAverage?: string
    frequency?: {
      daily: number
      weekly: number
      monthly: number
    }
  }
  orderDetails?: Array<{
    id: string
    date: string
    items: number
    value: number
    ltv: number
    status: string
    profileId?: string
  }>
}

// Update the SwaptData interface to include totalSwaptSubmits and netNewSubscribers
interface SwaptData {
  metrics: {
    purchaseFrequency: Metric
    customerLTV: Metric
    aov: Metric
    avgSwaptSubmits: Metric
    avgSwaptInterval: Metric
    avgOrderInterval: Metric
    totalSwaptSubmits?: number // Add this field
    netNewSubscribers?: number // Add this field
  }
  detailedData: any[]
  detailedMetrics: DetailedMetrics
}

// Update the ensureDataStructure function to properly handle the new fields
function ensureDataStructure(data: any): SwaptData {
  const defaultData: SwaptData = {
    metrics: {
      purchaseFrequency: { value: "0", change: 0, label: "N/A", data: [] },
      customerLTV: { value: "0", change: 0, label: "N/A", data: [] },
      aov: { value: "0", change: 0, label: "N/A", data: [] },
      avgSwaptSubmits: { value: "0", change: 0, label: "Avg. Swapt Submits per Profile", data: [] },
      avgSwaptInterval: { value: "0", change: 0, label: "Avg. Interval Between Swapt Submits (hrs)", data: [] },
      avgOrderInterval: { value: "0", change: 0, label: "Avg. Interval Between Orders (hrs)", data: [] },
      totalSwaptSubmits: 0, // Default value
      netNewSubscribers: 0, // Default value
    },
    detailedData: [],
    detailedMetrics: {
      products: {
        topCategories: [],
        attributeDistribution: {},
        itemsPerOrder: "0",
        discountRate: 0,
      },
      orders: {
        total: 0,
        averageItemCount: "0",
        discountedOrdersPercentage: 0,
      },
    },
  }

  if (!data) return defaultData
  if (!data.metrics) data.metrics = defaultData.metrics
  if (!data.metrics.purchaseFrequency) data.metrics.purchaseFrequency = defaultData.metrics.purchaseFrequency
  if (!data.metrics.customerLTV) data.metrics.customerLTV = defaultData.metrics.customerLTV
  if (!data.metrics.aov) data.metrics.aov = defaultData.metrics.aov
  if (!data.metrics.avgSwaptSubmits) data.metrics.avgSwaptSubmits = defaultData.metrics.avgSwaptSubmits
  if (!data.metrics.avgSwaptInterval) data.metrics.avgSwaptInterval = defaultData.metrics.avgSwaptInterval
  if (!data.metrics.avgOrderInterval) data.metrics.avgOrderInterval = defaultData.metrics.avgOrderInterval

  // Ensure these fields are explicitly set
  data.metrics.totalSwaptSubmits = data.metrics.totalSwaptSubmits || 0
  data.metrics.netNewSubscribers = data.metrics.netNewSubscribers || 0

  if (!data.detailedMetrics) data.detailedMetrics = defaultData.detailedMetrics
  if (!data.detailedMetrics.products) data.detailedMetrics.products = defaultData.detailedMetrics.products
  if (!data.detailedMetrics.products.topCategories) {
    data.detailedMetrics.products.topCategories = []
  }
  if (!data.detailedMetrics.orders) data.detailedMetrics.orders = defaultData.detailedMetrics.orders
  return data
}

// ==========================================
// Helper to Calculate Total Revenue from Order Details
// ==========================================
const calculateTotalRevenue = (data: SwaptData): string => {
  if (!data || !data.detailedMetrics.orderDetails || data.detailedMetrics.orderDetails.length === 0) {
    return "0"
  }
  const total = data.detailedMetrics.orderDetails.reduce((sum, order) => sum + (order.value || 0), 0)
  return total.toFixed(2)
}

// ==========================================
// Main Dashboard Component
// ==========================================
export default function SwaptDashboard() {
  const [data, setData] = useState<SwaptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const itemsPerPageOptions = [10, 30, 50]
  const [activeTab, setActiveTab] = useState("overview")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [categorySort, setCategorySort] = useState<"default" | "highToLow" | "lowToHigh">("default")

  // ==========================================
  // Fetch data from API endpoint (GET /api/swapt-data)
  // ==========================================
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get("/api/swapt-data")
      const processedData = ensureDataStructure(response.data)
      setData(processedData)
      setLastUpdated(new Date())
    } catch (err) {
      setError("Failed to fetch data from API. Try loading from stored data.")
    } finally {
      setLoading(false)
    }
  }, [])

  // ==========================================
  // Load stored data from public/exports/swapt_data.json
  // ==========================================
  const loadStoredData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/exports/swapt_data.json")
      if (!response.ok) {
        throw new Error("Failed to load stored data")
      }
      const jsonData = await response.json()
      console.log("Raw data loaded:", jsonData)
      const processedData = ensureDataStructure(jsonData)
      console.log("Processed data:", processedData)
      setData(processedData)
      setLastUpdated(new Date())
    } catch (err) {
      setError("Failed to load stored data. Please try fetching from API.")
    } finally {
      setLoading(false)
    }
  }, [])

  // ==========================================
  // Export dashboard data as CSV
  // ==========================================
  const exportData = () => {
    if (!data) return
    const csvRows: string[] = []
    csvRows.push(["Metric", "Value", "Change", "Label"].join(","))
    csvRows.push(
      [
        "Purchase Frequency",
        data.metrics.purchaseFrequency.value,
        data.metrics.purchaseFrequency.change,
        data.metrics.purchaseFrequency.label,
      ].join(","),
    )
    csvRows.push(
      [
        "Customer LTV",
        data.metrics.customerLTV.value,
        data.metrics.customerLTV.change,
        data.metrics.customerLTV.label,
      ].join(","),
    )
    csvRows.push(
      ["Average Order Value", data.metrics.aov.value, data.metrics.aov.change, data.metrics.aov.label].join(","),
    )
    csvRows.push(["Total Revenue", calculateTotalRevenue(data), 0, "Total Revenue"].join(","))
    csvRows.push(
      [
        "Avg. Swapt Interval (hours)",
        data.metrics.avgSwaptInterval.value,
        data.metrics.avgSwaptInterval.change,
        data.metrics.avgSwaptInterval.label,
      ].join(","),
    )
    csvRows.push(
      [
        "Avg. Order Interval (hours)",
        data.metrics.avgOrderInterval.value,
        data.metrics.avgOrderInterval.change,
        data.metrics.avgOrderInterval.label,
      ].join(","),
    )
    csvRows.push(
      [
        "Avg. Swapt Submits per Profile",
        data.metrics.avgSwaptSubmits.value,
        data.metrics.avgSwaptSubmits.change,
        data.metrics.avgSwaptSubmits.label,
      ].join(","),
    )
    csvRows.push("") // empty row
    csvRows.push(["Product Category", "Count", "Percentage"].join(","))
    data.detailedMetrics.products.topCategories.forEach((category) => {
      csvRows.push([category.name, category.count, category.percentage].join(","))
    })
    csvRows.push("") // empty row
    csvRows.push(["Order Metrics", "Value"].join(","))
    csvRows.push(["Total Orders", data.detailedMetrics.orders.total].join(","))
    if (data.detailedMetrics.orders.dailyAverage) {
      csvRows.push(["Daily Average", data.detailedMetrics.orders.dailyAverage].join(","))
    }
    csvRows.push(["Discounted Orders", data.detailedMetrics.orders.discountedOrdersPercentage + "%"].join(","))
    csvRows.push(["Items Per Order", data.detailedMetrics.products.itemsPerOrder].join(","))
    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "swapt_data_export.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ==========================================
  // Export order details as CSV
  // ==========================================
  const exportOrderDetails = () => {
    if (!data || !data.detailedMetrics.orderDetails) return
    const csvRows: string[] = []
    csvRows.push(["Order ID", "Date", "Items", "Value", "Customer LTV", "Status"].join(","))
    data.detailedMetrics.orderDetails.forEach((order) => {
      csvRows.push(
        [order.id, order.date, order.items, order.value.toFixed(2), order.ltv.toFixed(2), order.status].join(","),
      )
    })
    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "order_details_export.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ==========================================
  // Dynamically fetch data using provided API key and store ID
  // ==========================================
  const handleFetchStoreData = async (storeId: string, apiKey: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/swapt-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Only sending storeId and apiKey
        body: JSON.stringify({ storeId, apiKey }),
      })
      if (!response.ok) {
        let errorMessage = `Failed to fetch store data (HTTP ${response.status})`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          console.warn("Could not parse error response.")
        }
        throw new Error(errorMessage)
      }
      const responseData = await response.json()
      setData(ensureDataStructure(responseData.data))
      setLastUpdated(new Date())
      return responseData.data
    } catch (error: any) {
      console.error("Error fetching store data:", error)
      setError(error.message || "Failed to fetch store data")
      throw error
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // Load default data on initial render
  // ==========================================
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ==========================================
  // Pagination helpers
  // ==========================================
  const getPageItems = (items: any[] = []) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return items.slice(startIndex, startIndex + itemsPerPage)
  }
  const totalPages = (items: any[] = []) => Math.ceil(items.length / itemsPerPage)

  // ==========================================
  // Date formatting helper
  // ==========================================
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <DashboardLoader />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold text-black dark:text-white">Swapt Analytics Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={loadStoredData}
                  variant="outline"
                  className="flex items-center gap-2 bg-white dark:bg-gray-950 shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Load Stored
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Load data from stored JSON file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={exportData}
                  disabled={!data}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                >
                  <DownloadIcon size={16} />
                  Export CSV
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export data as CSV file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="animate-pulse">
          <AlertTitle className="flex items-center gap-2">Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {lastUpdated && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <CalendarIcon size={14} />
          Last updated: {formatDate(lastUpdated)}
        </div>
      )}

      {/* API Key Manager – UI for entering store ID and API key */}
      <div className="mb-6">
        <ApiKeyManager onFetchData={handleFetchStoreData} />
      </div>

      {data && (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              title="Purchase Frequency"
              value={data.metrics.purchaseFrequency.value}
              label={data.metrics.purchaseFrequency.label}
              icon={<BarChart3Icon className="h-4 w-4" />}
              color="#4f46e5"
              status={data.metrics.purchaseFrequency.value ? "available" : "unavailable"}
            />
            <MetricCard
              title="Customer LTV"
              value={`$${data.metrics.customerLTV.value}`}
              label={data.metrics.customerLTV.label}
              icon={<DollarSignIcon className="h-4 w-4" />}
              color="#8b5cf6"
              status={data.metrics.customerLTV.value ? "available" : "unavailable"}
            />
            <MetricCard
              title="Average Order Value"
              value={`$${data.metrics.aov.value}`}
              label={data.metrics.aov.label}
              icon={<ShoppingCartIcon className="h-4 w-4" />}
              color="#10b981"
              status={data.metrics.aov.value ? "available" : "unavailable"}
            />
            <MetricCard
              title="Total Revenue"
              value={`$${calculateTotalRevenue(data)}`}
              label="Total Revenue"
              icon={<DollarSignIcon className="h-4 w-4" />}
              color="#f59e0b"
              status={calculateTotalRevenue(data) !== "0" ? "available" : "unavailable"}
            />
          </div>

          {/* Swapt Metrics Summary */}
          <SwaptMetricsSummary
            totalSwaptSubmits={data.metrics.totalSwaptSubmits || 0}
            netNewSubscribers={data.metrics.netNewSubscribers || 0}
          />

          {/* Interval Metrics Chart */}
          <IntervalMetricsChart
            avgSwaptSubmits={data.metrics.avgSwaptSubmits?.value || "0"}
            avgSwaptInterval={data.metrics.avgSwaptInterval?.value || "0"}
            avgOrderInterval={data.metrics.avgOrderInterval?.value || "0"}
          />

          {/* Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-white dark:bg-gray-950 border shadow-sm p-1 rounded-lg">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
              >
                Products
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
              >
                Orders
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <TrendingUpIcon size={20} className="text-blue-600" />
                  Dashboard Overview
                </h2>
              </div>

              {/* Comprehensive Metrics Table */}
              <Card className="border shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gray-50 dark:bg-gray-900 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3Icon size={18} className="text-blue-600" />
                    Key Performance Metrics
                  </CardTitle>
                  <CardDescription>Comprehensive view of all important metrics</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-900">
                      <TableRow>
                        <TableHead className="font-semibold">Metric</TableHead>
                        <TableHead className="font-semibold text-right">Current Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <TableCell className="font-medium">Purchase Frequency</TableCell>
                        <TableCell className="text-right font-bold">{data.metrics.purchaseFrequency.value}</TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <TableCell className="font-medium">Customer LTV</TableCell>
                        <TableCell className="text-right font-bold">${data.metrics.customerLTV.value}</TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <TableCell className="font-medium">Average Order Value</TableCell>
                        <TableCell className="text-right font-bold">${data.metrics.aov.value}</TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <TableCell className="font-medium">Total Revenue</TableCell>
                        <TableCell className="text-right font-bold">${calculateTotalRevenue(data)}</TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <TableCell className="font-medium">Total Orders</TableCell>
                        <TableCell className="text-right font-bold">
                          {data.detailedMetrics.orders?.total || 0}
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <TableCell className="font-medium">Daily Average Orders</TableCell>
                        <TableCell className="text-right font-bold">
                          {data.detailedMetrics.orders?.dailyAverage || 0}
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <TableCell className="font-medium">Items Per Order</TableCell>
                        <TableCell className="text-right font-bold">
                          {data.detailedMetrics.products?.itemsPerOrder || 0}
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <TableCell className="font-medium">Discounted Orders</TableCell>
                        <TableCell className="text-right font-bold">
                          {data.detailedMetrics.orders?.discountedOrdersPercentage || 0}%
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <TableCell className="font-medium">Avg. Swapt Interval (hrs)</TableCell>
                        <TableCell className="text-right font-bold">{data.metrics.avgSwaptInterval.value}</TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <TableCell className="font-medium">Avg. Order Interval (hrs)</TableCell>
                        <TableCell className="text-right font-bold">{data.metrics.avgOrderInterval.value}</TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <TableCell className="font-medium">Total Swapt Submits</TableCell>
                        <TableCell className="text-right font-bold">{data.metrics.totalSwaptSubmits || 0}</TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <TableCell className="font-medium">Net New Subscribers</TableCell>
                        <TableCell className="text-right font-bold">{data.metrics.netNewSubscribers || 0}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <SummaryCard
                  title="Total Orders"
                  value={data.detailedMetrics.orders?.total || 0}
                  icon={<ShoppingCartIcon className="h-5 w-5" />}
                  color="bg-blue-500"
                />
                <SummaryCard
                  title="Daily Average"
                  value={data.detailedMetrics.orders?.dailyAverage || "0"}
                  icon={<CalendarIcon className="h-5 w-5" />}
                  color="bg-purple-500"
                />
                <SummaryCard
                  title="Items Per Order"
                  value={data.detailedMetrics.products?.itemsPerOrder || "0"}
                  icon={<PackageIcon className="h-5 w-5" />}
                  color="bg-green-500"
                />
                <SummaryCard
                  title="Discounted Orders"
                  value={`${data.detailedMetrics.orders?.discountedOrdersPercentage || 0}%`}
                  icon={<TagIcon className="h-5 w-5" />}
                  color="bg-amber-500"
                />
              </div>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <PackageIcon size={20} className="text-blue-600" />
                  Product Analysis
                </h2>
              </div>

              <Card className="border shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gray-50 dark:bg-gray-900 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3Icon size={18} className="text-blue-600" />
                    Product Categories
                  </CardTitle>
                  <CardDescription>Sales distribution by product category</CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">Sort by:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCategorySort("default")}
                      className={categorySort === "default" ? "bg-blue-100 dark:bg-blue-900" : ""}
                    >
                      Default
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCategorySort("highToLow")}
                      className={categorySort === "highToLow" ? "bg-blue-100 dark:bg-blue-900" : ""}
                    >
                      High to Low
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCategorySort("lowToHigh")}
                      className={categorySort === "lowToHigh" ? "bg-blue-100 dark:bg-blue-900" : ""}
                    >
                      Low to High
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {data.detailedMetrics.products.topCategories.length > 0 ? (
                    <div className="p-6">
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {data.detailedMetrics.products.topCategories
                          .sort((a, b) => {
                            if (categorySort === "highToLow") {
                              return Number(b.percentage) - Number(a.percentage)
                            } else if (categorySort === "lowToHigh") {
                              return Number(a.percentage) - Number(b.percentage)
                            } else {
                              return 0
                            }
                          })
                          .map((category, index) => (
                            <div
                              key={category.name}
                              className="space-y-1 hover:bg-gray-50 dark:hover:bg-gray-900 p-2 rounded-md transition-colors"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium flex items-center group">
                                  <span
                                    className="inline-block w-3 h-3 rounded-full mr-2 group-hover:w-4 group-hover:h-4 transition-all"
                                    style={{ backgroundColor: getColorForIndex(index) }}
                                  ></span>
                                  {category.name}
                                </span>
                                <span className="text-sm font-semibold">{category.percentage}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full animate-in slide-in-from-left duration-1000"
                                  style={{
                                    width: `${category.percentage}%`,
                                    backgroundColor: getColorForIndex(index),
                                    animationDelay: `${index * 100}ms`,
                                    animationFillMode: "backwards",
                                  }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Count: {category.count}</span>
                                <span>Share: {category.percentage}%</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <NoDataState message="No product category data available" onRefresh={fetchData} />
                  )}
                </CardContent>
              </Card>

              <Card className="border shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gray-50 dark:bg-gray-900 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-600"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M9 21V9" />
                    </svg>
                    Items Per Order
                  </CardTitle>
                  <CardDescription>Average number of items purchased per order</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-40 pt-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 animate-in fade-in slide-in-from-bottom duration-1000">
                      {data.detailedMetrics.products.itemsPerOrder || 0}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">Average items per order</div>
                    <Progress
                      value={Number.parseFloat(data.detailedMetrics.products.itemsPerOrder || "0") * 20}
                      className="h-1.5 mt-4 w-48 animate-in fade-in slide-in-from-left duration-1000"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gray-50 dark:bg-gray-900 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <TagIcon size={18} className="text-amber-600" />
                    Discounted Orders
                  </CardTitle>
                  <CardDescription>Percentage of orders with discounts applied</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-40 pt-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-amber-600 dark:text-amber-400 animate-in fade-in slide-in-from-bottom duration-1000">
                      {data.detailedMetrics.orders.discountedOrdersPercentage || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">Orders with discounts</div>
                    <Progress
                      value={Number(data.detailedMetrics.orders.discountedOrdersPercentage || 0)}
                      className="h-1.5 mt-4 w-48 animate-in fade-in slide-in-from-left duration-1000"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <ShoppingCartIcon size={20} className="text-blue-600" />
                  Order Analysis
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gray-50 dark:bg-gray-900 rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCartIcon size={18} className="text-blue-600" />
                      Total
                    </CardTitle>
                    <CardDescription>Total number of orders placed</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center h-40 pt-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 animate-in fade-in slide-in-from-bottom duration-1000">
                        {data.detailedMetrics.orders.total || 0}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">Total orders</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gray-50 dark:bg-gray-900 rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon size={18} className="text-purple-600" />
                      Daily Average
                    </CardTitle>
                    <CardDescription>Average orders per day</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center h-40 pt-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-purple-600 dark:text-purple-400 animate-in fade-in slide-in-from-bottom duration-1000">
                        {data.detailedMetrics.orders.dailyAverage || 0}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">Orders per day</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gray-50 dark:bg-gray-900 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <TagIcon size={18} className="text-amber-600" />
                    Discounted Orders
                  </CardTitle>
                  <CardDescription>Detailed information about orders with discounts</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">
                          Percentage of Orders with Discounts
                        </span>
                        <span className="text-lg font-bold text-amber-600">
                          {data.detailedMetrics.orders?.discountedOrdersPercentage || 0}%
                        </span>
                      </div>
                      <Progress
                        value={Number(data.detailedMetrics.orders?.discountedOrdersPercentage || 0)}
                        className="h-2 w-full"
                      />

                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm font-medium text-muted-foreground">Number of Discounted Orders</span>
                        <span className="text-lg font-bold text-amber-600">
                          {data.detailedMetrics.orders?.discountedOrders || 0}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
                        <span className="text-lg font-bold">{data.detailedMetrics.orders?.total || 0}</span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center items-center">
                      <div className="relative w-32 h-32">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <circle cx="50" cy="50" r="40" fill="#f3f4f6" className="dark:fill-gray-800" />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke="#f59e0b"
                            strokeWidth="8"
                            strokeDasharray={`${Number(data.detailedMetrics.orders?.discountedOrdersPercentage || 0) * 2.51} 251`}
                            strokeDashoffset="0"
                            transform="rotate(-90 50 50)"
                          />
                          <text
                            x="50"
                            y="50"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="16"
                            fontWeight="bold"
                            fill="currentColor"
                          >
                            {data.detailedMetrics.orders?.discountedOrdersPercentage || 0}%
                          </text>
                        </svg>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Discount Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gray-50 dark:bg-gray-900 rounded-t-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCartIcon size={18} className="text-blue-600" />
                        Order Details
                      </CardTitle>
                      <CardDescription>Detailed order metrics for analysis and export</CardDescription>
                    </div>
                    <Button
                      onClick={exportOrderDetails}
                      disabled={!data?.detailedMetrics?.orderDetails}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <DownloadIcon size={16} />
                      Export Orders
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {data.detailedMetrics.orderDetails && data.detailedMetrics.orderDetails.length > 0 ? (
                    <div className="flex flex-col">
                      <div className="max-h-[400px] overflow-auto">
                        <Table>
                          <TableHeader className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                            <TableRow>
                              <TableHead className="font-semibold">Order ID</TableHead>
                              <TableHead className="font-semibold">Date</TableHead>
                              <TableHead className="font-semibold text-right">Items</TableHead>
                              <TableHead className="font-semibold text-right">Value</TableHead>
                              <TableHead className="font-semibold text-right">Customer LTV</TableHead>
                              <TableHead className="font-semibold text-right">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getPageItems(data.detailedMetrics.orderDetails).map((order, index) => (
                              <TableRow
                                key={`${order.id}-${index}`}
                                className="hover:bg-gray-50 dark:hover:bg-gray-900"
                              >
                                <TableCell className="font-medium">#{order.id}</TableCell>
                                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">{order.items}</TableCell>
                                <TableCell className="text-right">${order.value.toFixed(2)}</TableCell>
                                <TableCell className="text-right">${order.ltv.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                  <Badge
                                    className={
                                      order.status === "Completed"
                                        ? "bg-emerald-500"
                                        : order.status === "Processing"
                                          ? "bg-blue-500"
                                          : "bg-amber-500"
                                    }
                                  >
                                    {order.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="flex items-center justify-between p-4 border-t">
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-muted-foreground">
                            Showing {Math.min(itemsPerPage, data.detailedMetrics.orderDetails.length)} of{" "}
                            {data.detailedMetrics.orderDetails.length} orders
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Items per page:</span>
                            <select
                              value={itemsPerPage}
                              onChange={(e) => {
                                setItemsPerPage(Number(e.target.value))
                                setCurrentPage(1)
                              }}
                              className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm"
                            >
                              {itemsPerPageOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <span className="flex h-8 items-center justify-center px-3 text-sm">
                            Page {currentPage} of {totalPages(data.detailedMetrics.orderDetails)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages(data.detailedMetrics.orderDetails)),
                              )
                            }
                            disabled={currentPage === totalPages(data.detailedMetrics.orderDetails)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <NoDataState message="No order data available" onRefresh={fetchData} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

// ==========================================
// Helper Components
// ==========================================
function getColorForIndex(index: number, opacity = 1) {
  const colors = [
    `rgba(79, 70, 229, ${opacity})`, // indigo
    `rgba(139, 92, 246, ${opacity})`, // violet
    `rgba(6, 182, 212, ${opacity})`, // cyan
    `rgba(14, 165, 233, ${opacity})`, // sky
    `rgba(16, 185, 129, ${opacity})`, // emerald
    `rgba(245, 158, 11, ${opacity})`, // amber
    `rgba(239, 68, 68, ${opacity})`, // red
    `rgba(236, 72, 153, ${opacity})`, // pink
    `rgba(20, 184, 166, ${opacity})`, // teal
    `rgba(249, 115, 22, ${opacity})`, // orange
  ]
  return colors[index % colors.length]
}

interface MetricCardProps {
  title: string
  value: string
  label: string
  icon: React.ReactNode
  color: string
  status: "available" | "unavailable"
}

function MetricCard({ title, value, label, icon, color, status }: MetricCardProps) {
  return (
    <Card className="border shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white dark:bg-gray-950">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 rounded-full" style={{ backgroundColor: color, color: "white" }}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {status === "available" ? (
          <>
            <div className="text-2xl font-bold animate-in fade-in slide-in-from-bottom duration-500">{value}</div>
            <p className="text-xs text-muted-foreground">{label}</p>
          </>
        ) : (
          <div className="flex items-center justify-center h-16">
            <Badge
              variant="outline"
              className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 px-3 py-1 rounded-full"
            >
              No data available
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface SummaryCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
}

function SummaryCard({ title, value, icon, color }: SummaryCardProps) {
  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color} text-white`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
