"use client"

import { Phone, Search, Filter, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { fetchCalls, type Call } from "@/lib/retell-api"
import { useRouter } from "next/navigation"

export default function CallLogsPage() {
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    const loadCalls = async () => {
      try {
        const response = await fetchCalls()
        setCalls(response.calls || [])
      } catch (error) {
        console.error("Failed to load calls:", error)
        setError(error instanceof Error ? error.message : "Failed to load calls")
      } finally {
        setLoading(false)
      }
    }

    loadCalls()
  }, [])

  // Format duration from milliseconds to MM:SS
  const formatDuration = (ms?: number) => {
    if (!ms) return "0:00"
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Format timestamp to time string
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "-"
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  // Format date
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "-"
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Get call type based on duration and sentiment
  const getCallType = (call: Call) => {
    const duration = (call.duration_ms || 0) / 60000 // Convert to minutes
    
    if (duration > 15 && call.call_analysis?.user_sentiment === 'Positive') {
      return "Initial Consultation"
    } else if (duration > 10 && duration <= 15) {
      return "Case Update"
    } else if (duration > 5 && duration <= 10) {
      return "Follow-up"
    } else if (duration <= 5) {
      return "Quick Call"
    }
    return "Consultation"
  }

  // Filter calls based on search term
  const filteredCalls = calls.filter(call => {
    const searchLower = searchTerm.toLowerCase()
    const callType = getCallType(call).toLowerCase()
    const callId = call.call_id?.toLowerCase() || ""
    const phoneNumber = call.from_number?.toLowerCase() || call.to_number?.toLowerCase() || ""
    
    return callType.includes(searchLower) || 
           callId.includes(searchLower) || 
           phoneNumber.includes(searchLower)
  })

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Call Logs</h1>
        <p className="text-muted-foreground">View and manage all incoming and outgoing calls</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Recent Calls
              </CardTitle>
              <CardDescription>All calls from today</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search calls..." 
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading call logs...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredCalls.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No calls found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCalls.map((call) => (
                <div 
                  key={call.call_id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/call/${call.call_id}`)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Call ID: {call.call_id?.slice(0, 8)}...</p>
                      <p className="text-sm text-muted-foreground">
                        {call.direction === 'inbound' ? `From: ${call.from_number || 'Unknown'}` : `To: ${call.to_number || 'Unknown'}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">{formatDuration(call.duration_ms)}</p>
                      <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{getCallType(call)}</p>
                      <p className="text-xs text-muted-foreground">Type</p>
                    </div>
                    <div className="text-center">
                      <Badge 
                        variant={call.call_status === "ended" ? "default" : "secondary"}
                      >
                        {call.call_status || "Unknown"}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{formatTime(call.start_timestamp)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(call.start_timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
