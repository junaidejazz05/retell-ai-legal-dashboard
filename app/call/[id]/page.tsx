"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Phone,
  Clock,
  Calendar,
  User,
  FileText,
  DollarSign,
  ArrowLeft,
  Download,
  ExternalLink,
  Mic,
  FileAudio,
  Database,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type CallCostItem = { product: string; unit_price: number; cost: number }

type CallDetail = {
  call_id: string
  agent_id: string
  call_status: string
  direction: string
  duration_ms: number
  start_timestamp: number
  end_timestamp: number
  from_number?: string
  to_number?: string
  call_analysis?: {
    user_sentiment?: string
    call_successful?: boolean
    call_summary?: string
  }
  call_cost?: {
    combined_cost?: number
    product_costs?: CallCostItem[]
  }
  transcript?: string
  recording_url?: string
  public_log_url?: string
  knowledge_base_retrieved_contents_url?: string
}

export default function CallDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id

  const [call, setCall] = useState<CallDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) return
    const fetchCall = async () => {
      try {
        const res = await fetch(`/api/calls/${id}`)
        if (!res.ok) throw new Error(await res.text())
        const data = (await res.json()) as CallDetail
        setCall(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch call details")
      } finally {
        setLoading(false)
      }
    }
    fetchCall()
  }, [id])

  const formatDuration = (ms?: number) => {
    if (!ms) return "0m 00s"
    const sec = Math.floor(ms / 1000)
    const minutes = Math.floor(sec / 60)
    const seconds = sec % 60
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "-"
    const date = new Date(Number(timestamp))
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Call Details</h1>
          <p className="text-sm text-muted-foreground mt-1">Call ID: {id}</p>
        </div>
        <Button variant="ghost" onClick={() => router.back()} className="inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading call details...</p>
        </div>
      )}

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6 text-red-700">{error}</CardContent>
        </Card>
      )}

      {!loading && call && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Duration</CardDescription>
                <CardTitle className="text-xl flex items-center justify-between">
                  <span>{formatDuration(call.duration_ms)}</span>
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Status</CardDescription>
                <div className="flex items-center justify-between">
                  <Badge variant={call.call_status === "ended" ? "default" : "secondary"}>
                    {call.call_status || "-"}
                  </Badge>
                  <Phone className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Sentiment</CardDescription>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{call.call_analysis?.user_sentiment || "-"}</span>
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Cost</CardDescription>
                <CardTitle className="text-xl flex items-center justify-between">
                  <span>${call.call_cost?.combined_cost ?? 0}</span>
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Call Information
              </CardTitle>
              <CardDescription>Timing and agent metadata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Start Time</p>
                  <p className="mt-1 font-medium">{formatDate(call.start_timestamp)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Time</p>
                  <p className="mt-1 font-medium">{formatDate(call.end_timestamp)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Agent ID</p>
                  <p className="mt-1 font-medium break-all">{call.agent_id || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Call Successful</p>
                  <div className="flex items-center gap-2 mt-1">
                    {call.call_analysis?.call_successful ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 font-medium">Yes</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-red-700 font-medium">No</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {call.call_analysis?.call_summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Call Analysis
                </CardTitle>
                <CardDescription>Automatic summary generated by Retell AI</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Call Summary</p>
                  <div className="rounded-md bg-muted p-4 text-sm leading-6">
                    {call.call_analysis.call_summary}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {call.transcript && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Transcript
                </CardTitle>
                <CardDescription>Raw conversation text</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-muted p-4">
                  <pre className="whitespace-pre-wrap text-sm font-mono">{call.transcript}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {call.recording_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileAudio className="w-5 h-5" />
                    Recording
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <audio controls src={call.recording_url} className="w-full mb-4"></audio>
                  <a
                    href={call.recording_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <Download className="w-4 h-4" />
                    Download Recording
                  </a>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Additional Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {call.public_log_url && (
                    <a
                      href={call.public_log_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      View Public Log
                    </a>
                  )}
                  {call.knowledge_base_retrieved_contents_url && (
                    <a
                      href={call.knowledge_base_retrieved_contents_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Database className="w-4 h-4" />
                      View Retrieved Knowledge
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {call.call_cost && call.call_cost.product_costs && call.call_cost.product_costs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {call.call_cost.product_costs.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.product}</TableCell>
                        <TableCell>${item.unit_price}</TableCell>
                        <TableCell className="font-medium">${item.cost}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} className="font-medium">Total</TableCell>
                      <TableCell className="font-semibold">${call.call_cost.combined_cost}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}


