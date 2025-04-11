import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import axios from "axios"

// ==========================================
// File Storage Setup
// ==========================================
const EXPORTS_FOLDER = path.join(process.cwd(), "public/exports")
const STATS_FILE = path.join(EXPORTS_FOLDER, "swapt_data.json")

if (!fs.existsSync(EXPORTS_FOLDER)) {
  fs.mkdirSync(EXPORTS_FOLDER, { recursive: true })
}

// ==========================================
// GET Endpoint: Fetch Stored Data
// ==========================================
export async function GET() {
  try {
    if (!fs.existsSync(STATS_FILE)) {
      return NextResponse.json({ error: "Data file not found" }, { status: 404 })
    }
    const fileData = fs.readFileSync(STATS_FILE, "utf-8")
    const jsonData = JSON.parse(fileData)
    return NextResponse.json(jsonData)
  } catch (error) {
    console.error("Error fetching swapt data:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

// ==========================================
// POST Endpoint: Fetch Data Using Provided API Key
// ==========================================
export async function POST(request: NextRequest) {
  try {
    const { storeId, apiKey } = await request.json()

    if (!storeId || !apiKey) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Always use Klaviyo fetching in this setup.
    const data = await fetchKlaviyoData(apiKey)
    // Process data as Klaviyo data (pass "klaviyo" as constant)
    const processedData = processStoreData(data, "klaviyo")

    // Save processed data to a JSON file
    if (processedData) {
      try {
        fs.writeFileSync(STATS_FILE, JSON.stringify(processedData, null, 2), "utf-8")
        console.log(`✅ Stats saved to ${STATS_FILE}`)
      } catch (error) {
        console.error("❌ Error saving stats to JSON:", error)
      }
    }

    return NextResponse.json({
      success: true,
      storeId,
      data: processedData,
    })
  } catch (error: any) {
    console.error("Error fetching store data:", error)
    return NextResponse.json({ error: "Failed to fetch store data", message: error.message }, { status: 500 })
  }
}

// ==========================================
// Helper: Dynamically Retrieve Metric IDs
// ==========================================
async function getMetricIds(baseUrl: string, headers: any): Promise<{ swaptId: string; orderId: string }> {
  const metricsUrl = `${baseUrl}/metrics`
  console.log("Fetching metric IDs from:", metricsUrl)
  const response = await axios.get(metricsUrl, { headers })
  const metrics = response.data.data
  let swaptId = ""
  let orderId = ""
  // Look for the metric names exactly as used in your account.
  for (const metric of metrics) {
    const name: string = metric.attributes.name
    if (name === "Submitted Swapt Code") {
      swaptId = metric.id
    } else if (name === "Placed Order") {
      orderId = metric.id
    }
  }
  if (!swaptId || !orderId) {
    throw new Error("Required metric IDs not found in the Klaviyo account")
  }
  console.log(`Found Swapt Code ID: ${swaptId}`)
  console.log(`Found Placed Order ID: ${orderId}`)
  return { swaptId, orderId }
}

// ==========================================
// Klaviyo-Specific Data Fetching (Dynamic Metric IDs)
// ==========================================
async function fetchKlaviyoData(apiKey: string) {
  // Use provided API key (or fallback)
  const keyToUse = apiKey || process.env.KLAVIYO_API_KEY || process.env.SWAPT_KLAVIYO_API_KEY || ""
  if (!keyToUse) {
    throw new Error("No Klaviyo API key provided or found in environment variables")
  }

  const BASE_URL = "https://a.klaviyo.com/api"
  const headers = {
    Authorization: `Klaviyo-API-Key ${keyToUse}`,
    revision: "2024-10-15",
    accept: "application/vnd.api+json",
  }

  // Retrieve metric IDs dynamically
  const { swaptId, orderId } = await getMetricIds(BASE_URL, headers)

  console.log("Fetching all Swapt events for metric ID:", swaptId)
  // Build URL using the required filter syntax (note the format: equals(metric_id,"<ID>"))
  const url = `${BASE_URL}/events?filter=equals(metric_id,"${swaptId}")&page[size]=100`
  const swaptEvents = await fetchAllEvents(url, headers)
  console.log(`Fetched ${swaptEvents.length} swapt events`)

  const allEvents = swaptEvents
  console.log(`Processing all ${allEvents.length} events...`)

  // Calculate metrics from Swapt events
  const profileSwaptTimestamps: Record<string, Date[]> = {}
  for (const event of allEvents) {
    const profileId = event.relationships.profile.data.id
    const eventTime = new Date(event.attributes.datetime)
    if (!profileSwaptTimestamps[profileId]) {
      profileSwaptTimestamps[profileId] = []
    }
    profileSwaptTimestamps[profileId].push(eventTime)
  }
  const uniqueSwaptProfiles = Object.keys(profileSwaptTimestamps).length
  const avgSwaptSubmits = uniqueSwaptProfiles > 0 ? allEvents.length / uniqueSwaptProfiles : 0

  const swaptIntervals: number[] = []
  for (const profile in profileSwaptTimestamps) {
    const times = profileSwaptTimestamps[profile].sort((a, b) => a.getTime() - b.getTime())
    if (times.length > 1) {
      for (let i = 1; i < times.length; i++) {
        const diff = (times[i].getTime() - times[i - 1].getTime()) / (1000 * 3600)
        swaptIntervals.push(diff)
      }
    }
  }
  const avgSwaptInterval =
    swaptIntervals.length > 0 ? swaptIntervals.reduce((a, b) => a + b, 0) / swaptIntervals.length : 0

  // Initialize order/purchase metrics
  let discountedOrders = 0
  let totalRevenueAllUsers = 0
  let totalPurchases = 0
  const topCategories: Record<string, number> = {}
  const attributeDistribution: Record<string, number> = {}
  const itemsPerOrder: number[] = []
  const purchaseDates: Date[] = []
  const orderDetails: any[] = []
  const customerOrders: Record<string, number[]> = {}

  // Process each Swapt event to get order events
  let eventIndex = 0
  for (const event of allEvents) {
    eventIndex++
    if (eventIndex % 50 === 0) {
      console.log(`Processed ${eventIndex} events so far...`)
    }
    const profileId = event.relationships.profile.data.id
    const swaptDate = new Date(event.attributes.datetime).toISOString()

    try {
      // Build URL for fetching purchases using the dynamic placed order metric ID:
      const purchasesUrl = `${BASE_URL}/events?filter=equals(metric_id,"${orderId}"),equals(profile_id,"${profileId}")&page[size]=100`
      const purchases = await fetchProfilePurchasesURL(purchasesUrl, headers, swaptDate)
      console.log(`For profile ${profileId}, fetched ${purchases.length} purchases`)
      const orderValues: number[] = []
      for (const purchase of purchases) {
        const purchaseValue = purchase.attributes.event_properties?.$value || 0
        if (purchaseValue >= 5) {
          if (purchase.attributes.event_properties?.Discounted) {
            discountedOrders++
          }
          totalRevenueAllUsers += purchaseValue
          totalPurchases++
          orderValues.push(purchaseValue)
          purchaseDates.push(new Date(purchase.attributes.datetime))

          let category = "Unknown"
          if (purchase.attributes.event_properties?.ProductCategories) {
            const cats = purchase.attributes.event_properties.ProductCategories
            category = Array.isArray(cats) && cats.length > 0 ? cats[0] : "Unknown"
          }
          let variant = "Unknown"
          if (purchase.attributes.event_properties?.ProductNames) {
            const names = purchase.attributes.event_properties.ProductNames
            variant = Array.isArray(names) && names.length > 0 ? names[0] : "Unknown"
          }
          topCategories[category] = (topCategories[category] || 0) + 1
          attributeDistribution[variant] = (attributeDistribution[variant] || 0) + 1

          const itemCount =
            purchase.attributes.event_properties?.ItemCount ||
            (purchase.attributes.event_properties?.ProductNames
              ? purchase.attributes.event_properties.ProductNames.length
              : 1)
          orderDetails.push({
            id: purchase.id,
            date: purchase.attributes.datetime,
            items: itemCount,
            value: purchaseValue,
            ltv: purchaseValue,
            status: "Completed",
            profileId: profileId,
          })
        }
      }
      if (orderValues.length > 0) {
        customerOrders[profileId] = orderValues
        itemsPerOrder.push(orderValues.length)
      }
    } catch (err) {
      console.error(`Error processing purchases for profile ${profileId}:`, err)
    }
  }
  console.log("Completed processing events for orders.")

  // Compute average order interval per profile
  const profileOrderTimestamps: Record<string, Date[]> = {}
  for (const order of orderDetails) {
    const pId = order.profileId
    if (!pId) continue
    if (!profileOrderTimestamps[pId]) {
      profileOrderTimestamps[pId] = []
    }
    profileOrderTimestamps[pId].push(new Date(order.date))
  }
  const orderIntervals: number[] = []
  for (const profile in profileOrderTimestamps) {
    const times = profileOrderTimestamps[profile].sort((a, b) => a.getTime() - b.getTime())
    if (times.length > 1) {
      for (let i = 1; i < times.length; i++) {
        const diff = (times[i].getTime() - times[i - 1].getTime()) / (1000 * 3600)
        orderIntervals.push(diff)
      }
    }
  }
  const avgOrderInterval =
    orderIntervals.length > 0 ? orderIntervals.reduce((a, b) => a + b, 0) / orderIntervals.length : 0

  // Other standard metrics
  const totalCustomers = Object.keys(customerOrders).length
  const avgOrdersPerCustomer = totalCustomers > 0 ? totalPurchases / totalCustomers : 0
  let dailyAverage = 0
  if (purchaseDates.length > 1) {
    const sortedDates = purchaseDates.sort((a, b) => a.getTime() - b.getTime())
    const firstDate = sortedDates[0]
    const lastDate = sortedDates[sortedDates.length - 1]
    const daysBetween = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)))
    dailyAverage = totalPurchases / daysBetween
  }
  const aov = totalPurchases > 0 ? totalRevenueAllUsers / totalPurchases : 0
  const ltv = totalCustomers > 0 ? totalRevenueAllUsers / totalCustomers : 0
  const avgItemsPerOrder =
    itemsPerOrder.length > 0 ? itemsPerOrder.reduce((a, b) => a + b, 0) / itemsPerOrder.length : 0

  // Additional console output for the new metrics:
  console.log("Final metrics:")
  console.log("Total Purchases:", totalPurchases)
  console.log("Total Revenue:", totalRevenueAllUsers)
  console.log("Average Order Value:", aov)
  console.log("Total Swapt Submits:", allEvents.length)
  console.log("Net New Subscribers:", uniqueSwaptProfiles)
  console.log("Avg. Swapt Submits per Profile:", avgSwaptSubmits)
  console.log("Avg. Interval Between Swapt Submits (hrs):", avgSwaptInterval.toFixed(2))
  console.log("Avg. Interval Between Orders (hrs):", avgOrderInterval.toFixed(2))

  return {
    metrics: {
      purchaseFrequency: {
        value: avgOrdersPerCustomer.toFixed(2),
        change: 0,
        label: "Avg. purchases per customer",
        data: [],
      },
      customerLTV: {
        value: ltv.toFixed(2),
        change: 0,
        label: "Lifetime value per customer",
        data: [],
      },
      aov: {
        value: aov.toFixed(2),
        change: 0,
        label: "Avg. revenue per order",
        data: [],
      },
      avgSwaptSubmits: {
        value: avgSwaptSubmits.toFixed(2),
        change: 0,
        label: "Avg. swapt submits per profile",
        data: [],
      },
      avgSwaptInterval: {
        value: avgSwaptInterval.toFixed(2),
        change: 0,
        label: "Avg. interval between swapt submits (hrs)",
        data: [],
      },
      avgOrderInterval: {
        value: avgOrderInterval.toFixed(2),
        change: 0,
        label: "Avg. interval between orders (hrs)",
        data: [],
      },
      // Add these fields explicitly to the returned data
      totalSwaptSubmits: allEvents.length,
      netNewSubscribers: uniqueSwaptProfiles,
    },
    detailedMetrics: {
      products: {
        topCategories: Object.entries(topCategories).map(([name, count]) => ({
          name,
          count,
          percentage: totalPurchases > 0 ? ((count / totalPurchases) * 100).toFixed(1) : "0",
        })),
        attributeDistribution,
        itemsPerOrder: avgItemsPerOrder.toFixed(2),
        discountRate: 0,
      },
      orders: {
        total: totalPurchases,
        averageItemCount: avgItemsPerOrder.toFixed(2),
        discountedOrders,
        discountedOrdersPercentage: totalPurchases > 0 ? ((discountedOrders / totalPurchases) * 100).toFixed(1) : "0",
        dailyAverage: dailyAverage.toFixed(2),
      },
      orderDetails,
    },
  }
}

// ==========================================
// Helper: Fetch All Events with Pagination
// ==========================================
async function fetchAllEvents(url: string, headers: any) {
  const allEvents: any[] = []
  let pageCount = 0
  while (url) {
    pageCount++
    console.log(`Fetching events page ${pageCount}: ${url}`)
    try {
      const response = await axios.get(url, { headers })
      allEvents.push(...response.data.data)
      url = response.data.links?.next || null
    } catch (error) {
      console.error(`Error fetching events page ${pageCount}:`, error)
      throw error
    }
  }
  console.log(`Fetched a total of ${pageCount} event pages.`)
  return allEvents
}

// ==========================================
// Helper: Fetch Profile Purchases via URL
// ==========================================
async function fetchProfilePurchasesURL(url: string, headers: any, afterDate: string) {
  const purchases: any[] = []
  let pageCount = 0
  let currentUrl = url
  while (currentUrl) {
    pageCount++
    console.log(`Fetching purchases page ${pageCount} using URL: ${currentUrl}`)
    try {
      const response = await axios.get(currentUrl, { headers })
      purchases.push(...response.data.data)
      currentUrl = response.data.links?.next || null
    } catch (error) {
      console.error(`Error fetching purchases page ${pageCount}:`, error)
      break
    }
  }
  console.log(`Fetched ${purchases.length} purchases (raw) after ${afterDate}`)
  return purchases.filter((p) => new Date(p.attributes.datetime) >= new Date(afterDate))
}

// ==========================================
// Process Fetched Data into Standard Format
// ==========================================
function processStoreData(data: any, storeType: string) {
  // Since we support only Klaviyo now.
  if (storeType === "klaviyo") {
    return {
      metrics: {
        ...data.metrics,
        // Ensure these fields are explicitly included in the processed data
        totalSwaptSubmits: data.metrics.totalSwaptSubmits || 0,
        netNewSubscribers: data.metrics.netNewSubscribers || 0,
      },
      detailedData: [],
      detailedMetrics: data.detailedMetrics,
    }
  }
  return { error: "Unsupported store type" }
}
