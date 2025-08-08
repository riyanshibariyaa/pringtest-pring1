"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChartComponent, BarChartComponent, LineChartComponent } from "@/components/ui/chart"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  BarChart3,
  TrendingUp,
  Users,
  Globe,
  Smartphone,
  Monitor,
  ArrowLeft,
  Download,
  RefreshCw,
  Calendar,
  MapPin,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface AnalyticsData {
  timeRange: string
  recentScans: Array<{ time: string; count: number }>
  topEmployees: Array<{ employeeName: string; department: string; scanCount: number }>
  geoDistribution: Array<{ country: string; count: number }>
  deviceAnalytics: Array<{ type: string; count: number }>
  activeSessions: number
  lastUpdated: string
}

export default function AdvancedAnalyticsPage() {
  const router = useRouter()
  const [company, setCompany] = useState<any>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("24h")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const corporateData = localStorage.getItem("corporateUser")
    if (!corporateData) {
      router.push("/corporate/login")
      return
    }

    const parsedCompany = JSON.parse(corporateData)
    setCompany(parsedCompany)
    loadAnalytics(parsedCompany._id, timeRange)
  }, [router, timeRange])

  const loadAnalytics = async (companyId: string, range: string) => {
    try {
      setRefreshing(true)
      const response = await fetch(`/api/analytics/real-time?companyId=${companyId}&timeRange=${range}`)
      const data = await response.json()

      if (response.ok) {
        setAnalyticsData(data.analytics)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to load analytics",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    if (company) {
      loadAnalytics(company._id, timeRange)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/analytics/export?companyId=${company._id}&timeRange=${timeRange}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `analytics-${timeRange}-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export analytics data",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-white mt-4">Loading advanced analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="bg-brand-dark/80 backdrop-blur-lg border-b border-dark-border shadow-2xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()} className="text-white hover:bg-dark-surface">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-blue p-3 rounded-xl shadow-glow animate-pulse-glow">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Advanced Analytics</h1>
                  <p className="text-brand-blue text-sm">Real-time insights and reporting</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-dark-surface border-dark-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dark-surface border-dark-border">
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>

              <Button onClick={handleExport} className="bg-gradient-blue hover:shadow-glow-lg">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Real-time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-dark-surface/50 border-dark-border glass backdrop-blur-lg hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-muted">Active Sessions</p>
                  <p className="text-3xl font-bold text-white">{analyticsData?.activeSessions || 0}</p>
                </div>
                <div className="bg-green-500 p-3 rounded-full animate-pulse-glow">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-green-400 mt-2">Live now</p>
            </CardContent>
          </Card>

          <Card className="bg-dark-surface/50 border-dark-border glass backdrop-blur-lg hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-muted">Total Scans</p>
                  <p className="text-3xl font-bold text-white">
                    {analyticsData?.recentScans.reduce((sum, scan) => sum + scan.count, 0) || 0}
                  </p>
                </div>
                <div className="bg-brand-blue p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-brand-blue mt-2">In selected period</p>
            </CardContent>
          </Card>

          <Card className="bg-dark-surface/50 border-dark-border glass backdrop-blur-lg hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-muted">Countries</p>
                  <p className="text-3xl font-bold text-white">{analyticsData?.geoDistribution.length || 0}</p>
                </div>
                <div className="bg-purple-500 p-3 rounded-full">
                  <Globe className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-purple-400 mt-2">Global reach</p>
            </CardContent>
          </Card>

          <Card className="bg-dark-surface/50 border-dark-border glass backdrop-blur-lg hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-muted">Mobile Usage</p>
                  <p className="text-3xl font-bold text-white">
                    {analyticsData?.deviceAnalytics.find((d) => d.type === "Mobile")?.count || 0}
                  </p>
                </div>
                <div className="bg-orange-500 p-3 rounded-full">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-orange-400 mt-2">vs Desktop</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-dark-surface border-dark-border">
            <TabsTrigger value="overview" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="employees" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="geography" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white">
              <MapPin className="h-4 w-4 mr-2" />
              Geography
            </TabsTrigger>
            <TabsTrigger value="devices" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white">
              <Monitor className="h-4 w-4 mr-2" />
              Devices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="bg-dark-surface/50 border-dark-border glass backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-brand-blue" />
                  Scan Activity Over Time
                </CardTitle>
                <CardDescription className="text-dark-text-muted">
                  Real-time QR code scan activity for the selected time period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData?.recentScans && (
                  <LineChartComponent
                    data={analyticsData.recentScans.map((scan) => ({
                      name: scan.time,
                      value: scan.count,
                    }))}
                    className="h-80"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees">
            <Card className="bg-dark-surface/50 border-dark-border glass backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2 text-brand-blue" />
                  Top Performing Employees
                </CardTitle>
                <CardDescription className="text-dark-text-muted">
                  Employees with the most QR code scans
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData?.topEmployees && (
                  <BarChartComponent
                    data={analyticsData.topEmployees.map((emp) => ({
                      name: emp.employeeName,
                      value: emp.scanCount,
                    }))}
                    className="h-80"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geography">
            <Card className="bg-dark-surface/50 border-dark-border glass backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-brand-blue" />
                  Geographic Distribution
                </CardTitle>
                <CardDescription className="text-dark-text-muted">QR code scans by country</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData?.geoDistribution && (
                  <PieChartComponent
                    data={analyticsData.geoDistribution.map((geo) => ({
                      name: geo.country,
                      value: geo.count,
                    }))}
                    className="h-80"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices">
            <Card className="bg-dark-surface/50 border-dark-border glass backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Smartphone className="h-5 w-5 mr-2 text-brand-blue" />
                  Device Analytics
                </CardTitle>
                <CardDescription className="text-dark-text-muted">Mobile vs Desktop usage patterns</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData?.deviceAnalytics && (
                  <PieChartComponent
                    data={analyticsData.deviceAnalytics.map((device) => ({
                      name: device.type,
                      value: device.count,
                    }))}
                    className="h-80"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Last Updated */}
        {analyticsData?.lastUpdated && (
          <div className="text-center mt-8">
            <p className="text-dark-text-muted text-sm">
              <Calendar className="h-4 w-4 inline mr-2" />
              Last updated: {new Date(analyticsData.lastUpdated).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
