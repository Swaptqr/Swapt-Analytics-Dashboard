"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  KeyIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeOffIcon,
  RefreshCcwIcon,
  ShieldCheckIcon,
  StoreIcon,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define the API key type (store type removed)
interface ApiKey {
  id: string
  name: string
  key: string
  isActive: boolean
  lastFetched?: Date | null
}

// Props: onFetchData now accepts (storeId, apiKey)
interface ApiKeyManagerProps {
  onFetchData: (storeId: string, apiKey: string) => Promise<any>
}

export default function ApiKeyManager({ onFetchData }: ApiKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyValue, setNewKeyValue] = useState("")
  const [showNewKeyForm, setShowNewKeyForm] = useState(false)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("active")

  // Load saved API keys from localStorage on component mount
  useEffect(() => {
    try {
      const storedKeys = localStorage.getItem("swapt_api_keys")
      if (storedKeys) {
        const parsedKeys = JSON.parse(storedKeys)
        if (Array.isArray(parsedKeys) && parsedKeys.length > 0) {
          setApiKeys(parsedKeys)
          console.log("Loaded API keys from localStorage:", parsedKeys)
        }
      }
    } catch (err) {
      console.error("Error loading API keys from localStorage:", err)
    }
  }, [])

  // Save API keys to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("swapt_api_keys", JSON.stringify(apiKeys))
    }
  }, [apiKeys])

  const handleAddKey = () => {
    if (!newKeyName || !newKeyValue) {
      setError("Please fill in all required fields")
      return
    }

    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      key: newKeyValue,
      isActive: true,
      lastFetched: null,
    }

    const updatedKeys = [...apiKeys, newKey]
    setApiKeys(updatedKeys)

    // Save to localStorage
    try {
      localStorage.setItem("swapt_api_keys", JSON.stringify(updatedKeys))
      console.log("Saved API keys to localStorage:", updatedKeys)
    } catch (err) {
      console.error("Error saving API keys to localStorage:", err)
    }

    setNewKeyName("")
    setNewKeyValue("")
    setShowNewKeyForm(false)
    setSuccess("API key added successfully")

    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleRemoveKey = (id: string) => {
    const updatedKeys = apiKeys.filter((key) => key.id !== id)
    setApiKeys(updatedKeys)

    // Update localStorage immediately
    if (typeof window !== "undefined") {
      localStorage.setItem("swapt_api_keys", JSON.stringify(updatedKeys))
    }

    setSuccess("API key removed successfully")
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleToggleKeyVisibility = (id: string) => {
    setShowKeys({ ...showKeys, [id]: !showKeys[id] })
  }

  const handleToggleKeyActive = (id: string) => {
    const updatedKeys = apiKeys.map((key) => (key.id === id ? { ...key, isActive: !key.isActive } : key))
    setApiKeys(updatedKeys)

    // Update localStorage immediately
    if (typeof window !== "undefined") {
      localStorage.setItem("swapt_api_keys", JSON.stringify(updatedKeys))
    }
  }

  const handleFetchData = async (key: ApiKey) => {
    setLoading({ ...loading, [key.id]: true })
    setError(null)
    try {
      await onFetchData(key.name, key.key)
      // Update lastFetched timestamp
      const updatedKeys = apiKeys.map((k) => (k.id === key.id ? { ...k, lastFetched: new Date() } : k))
      setApiKeys(updatedKeys)

      // Update localStorage immediately
      if (typeof window !== "undefined") {
        localStorage.setItem("swapt_api_keys", JSON.stringify(updatedKeys))
      }

      setSuccess(`Data fetched successfully from ${key.name}`)
    } catch (err: any) {
      console.error("Error fetching data:", err)
      setError(`Failed to fetch data from ${key.name}. Please check your API key and try again.`)
    } finally {
      setLoading({ ...loading, [key.id]: false })
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  // Filter keys: Active keys if activeTab === "active", otherwise show all keys.
  const filteredKeys = apiKeys.filter((key) => (activeTab === "all" ? true : key.isActive))

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <KeyIcon className="h-5 w-5 text-blue-600" />
              API Key Manager
            </CardTitle>
            <CardDescription>Manage your API keys to fetch and analyze data.</CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add New API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New API Key</DialogTitle>
                <DialogDescription>
                  Enter a name and your API key. This key will be stored locally so you won't need to re-enter it each
                  time.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="My Store"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="apiKey" className="text-right">
                    API Key
                  </Label>
                  <Input
                    id="apiKey"
                    value={newKeyValue}
                    onChange={(e) => setNewKeyValue(e.target.value)}
                    type="password"
                    placeholder="Enter your API key"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewKeyForm(false)
                    setNewKeyName("")
                    setNewKeyValue("")
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddKey} className="bg-blue-600 hover:bg-blue-700">
                  Add Key
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900 dark:text-green-400">
            <ShieldCheckIcon className="h-4 w-4 inline-block mr-1" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active Keys</TabsTrigger>
            <TabsTrigger value="all">All Keys</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-0">
            {filteredKeys.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                <div className="flex flex-col items-center justify-center">
                  <KeyIcon className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-muted-foreground mb-4">No active API keys found</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add New API Key
                      </Button>
                    </DialogTrigger>
                    {/* Dialog content */}
                  </Dialog>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredKeys.map((key) => (
                  <motion.div
                    key={key.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ApiKeyRow
                      entry={key}
                      isLoading={loading[key.id] || false}
                      onRemove={() => handleRemoveKey(key.id)}
                      onToggleActive={() => handleToggleKeyActive(key.id)}
                      onFetchData={() => handleFetchData(key)}
                      onToggleKeyVisibility={() => handleToggleKeyVisibility(key.id)}
                      showKeys={showKeys}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-0">
            {apiKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No API keys found. Add a new key to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <motion.div
                    key={key.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ApiKeyRow
                      entry={key}
                      isLoading={loading[key.id] || false}
                      onRemove={() => handleRemoveKey(key.id)}
                      onToggleActive={() => handleToggleKeyActive(key.id)}
                      onFetchData={() => handleFetchData(key)}
                      onToggleKeyVisibility={() => handleToggleKeyVisibility(key.id)}
                      showKeys={showKeys}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex flex-col items-start border-t pt-4">{/* Security note removed */}</CardFooter>
    </Card>
  )
}

// ----------------------------------------------------------------
// Helper Component: API Key Row
// ----------------------------------------------------------------
interface ApiKeyRowProps {
  entry: ApiKey
  isLoading: boolean
  onRemove: () => void
  onToggleActive: () => void
  onFetchData: () => void
  onToggleKeyVisibility: () => void
  showKeys: Record<string, boolean>
}

function ApiKeyRow({
  entry,
  isLoading,
  onRemove,
  onToggleActive,
  onFetchData,
  onToggleKeyVisibility,
  showKeys,
}: ApiKeyRowProps) {
  const truncatedKey = entry.key.length > 25 ? entry.key.slice(0, 25) + "..." : entry.key

  return (
    <div className="border border-gray-200 dark:border-gray-800 p-4 rounded-md shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      <div className="text-sm space-y-1 flex-1">
        <div className="flex items-center gap-2">
          <StoreIcon className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium text-lg">{entry.name}</h3>
          <Badge variant={entry.isActive ? "default" : "outline"}>{entry.isActive ? "Active" : "Inactive"}</Badge>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Label className="text-sm">API Key:</Label>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md">
            <code className="text-sm font-mono">
              {showKey(entry, showKeys) ? entry.key : "•".repeat(Math.min(20, entry.key.length))}
            </code>
            <Button variant="ghost" size="sm" onClick={onToggleKeyVisibility} className="h-6 w-6 p-0">
              {showKey(entry, showKeys) ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {entry.lastFetched && (
          <div className="text-xs text-muted-foreground mt-2">
            Last fetched: {new Date(entry.lastFetched).toLocaleString()}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 self-end md:self-center">
        <Button variant="outline" size="sm" onClick={onToggleActive}>
          {entry.isActive ? "Deactivate" : "Activate"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onFetchData}
          disabled={isLoading || !entry.isActive}
          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
        >
          {isLoading ? (
            <>
              <RefreshCcwIcon className="h-4 w-4 mr-2 animate-spin" />
              Fetching...
            </>
          ) : (
            <>
              <RefreshCcwIcon className="h-4 w-4 mr-2" />
              Fetch Data
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Helper function to always hide the key (adjust as needed)
function showKey(entry: ApiKey, showKeys: Record<string, boolean>): boolean {
  return showKeys[entry.id] || false
}
