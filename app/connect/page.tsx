"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Watch, Activity, Scale, Check, Plus, Upload, FileSpreadsheet, 
  Bluetooth, Heart, RefreshCw, ExternalLink, AlertCircle, Loader2,
  Smartphone, Wifi, X
} from "lucide-react"
import { useState, useRef, useEffect, useCallback } from "react"
import toast from "react-hot-toast"
import { 
  connectWallet, 
  mintDataConnectionCredential,
  getCredentialsForAddress,
  type HealthCredential 
} from "@/lib/blockdag"
import {
  REAL_DEVICES,
  generateOAuthUrl,
  exchangeCodeForToken,
  getStoredTokens,
  disconnectDevice,
  connectBluetoothHeartRate,
  connectBluetoothScale,
  disconnectBluetoothDevice,
  getAllConnectionStatuses,
  fetchGoogleFitData,
  fetchFitbitData,
  fetchOuraData,
  storeHealthData,
  type DeviceConnection,
  type HealthData,
} from "@/lib/device-integrations"

export default function ConnectPage() {
  const [userAddress, setUserAddress] = useState<string>("")
  const [connectionCredentials, setConnectionCredentials] = useState<HealthCredential[]>([])
  const [devices, setDevices] = useState<DeviceConnection[]>(REAL_DEVICES)
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const [liveHeartRate, setLiveHeartRate] = useState<number | null>(null)
  const [liveWeight, setLiveWeight] = useState<{ value: number; unit: string } | null>(null)
  const [manualEntry, setManualEntry] = useState({
    type: 'weight',
    value: '',
    unit: 'kg',
  })
  const [syncingDevice, setSyncingDevice] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Initialize wallet and check connection statuses
  useEffect(() => {
    const initialize = async () => {
      try {
        // Connect wallet
        const address = await connectWallet()
        if (address) {
          setUserAddress(address)
          
          // Load existing connection credentials
          const credentials = await getCredentialsForAddress(address)
          const connectionCreds = credentials.filter(cred => 
            cred.badgeType === 'data_connection'
          )
          setConnectionCredentials(connectionCreds)
        }
        
        // Check all device connection statuses
        const statuses = getAllConnectionStatuses()
        setDevices(prev => prev.map(device => ({
          ...device,
          connected: statuses[device.id]?.connected || false,
          lastSync: statuses[device.id]?.lastSync || null,
        })))
      } catch (error) {
        console.log("Initialization error:", error)
      }
    }
    
    initialize()
  }, [])

  // Mint blockchain credential for connection
  const mintConnectionCredential = useCallback(async (device: DeviceConnection) => {
    if (!userAddress) return
    
    try {
      const credential = await mintDataConnectionCredential(
        userAddress,
        device.name,
        {
          deviceId: device.id,
          name: device.name,
          description: device.description,
          metrics: device.metrics,
          connectionType: device.connectionType,
          connectedAt: new Date().toISOString()
        }
      )
      
      if (credential) {
        setConnectionCredentials(prev => [...prev, credential])
        console.log(`🎉 Credential minted for ${device.name}`)
      }
    } catch (error) {
      console.error('Credential minting error:', error)
    }
  }, [userAddress])

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const provider = params.get('provider')
      const error = params.get('error')
      
      if (error) {
        toast.error(`Connection failed: ${error}`)
        // Clean URL
        window.history.replaceState({}, '', '/connect')
        return
      }
      
      if (code && provider) {
        setIsLoading(prev => ({ ...prev, [provider]: true }))
        toast.loading(`Completing ${provider} connection...`, { id: 'oauth' })
        
        try {
          const tokens = await exchangeCodeForToken(provider, code)
          if (tokens) {
            // Update device status
            setDevices(prev => prev.map(d => 
              d.id === provider 
                ? { ...d, connected: true, lastSync: 'Just now' }
                : d
            ))
            
            // Mint blockchain credential
            if (userAddress) {
              const device = REAL_DEVICES.find(d => d.id === provider)
              if (device) {
                await mintConnectionCredential(device)
              }
            }
            
            toast.success(`✅ ${provider} connected successfully!`, { id: 'oauth' })
          } else {
            toast.error('Failed to complete connection', { id: 'oauth' })
          }
        } catch {
          toast.error('Connection error', { id: 'oauth' })
        } finally {
          setIsLoading(prev => ({ ...prev, [provider]: false }))
          // Clean URL
          window.history.replaceState({}, '', '/connect')
        }
      }
    }
    
    handleOAuthCallback()
  }, [userAddress, mintConnectionCredential])

  // Handle OAuth device connection
  const connectOAuthDevice = useCallback((deviceId: string) => {
    const oauthUrl = generateOAuthUrl(deviceId)
    
    if (!oauthUrl) {
      toast.error('OAuth not configured for this service. Please add API credentials.')
      return
    }
    
    // Redirect to OAuth provider
    window.location.href = oauthUrl
  }, [])

  // Handle Bluetooth device connection
  const connectBluetoothDevice = async (deviceId: string) => {
    setIsLoading(prev => ({ ...prev, [deviceId]: true }))
    
    try {
      if (deviceId === 'web_bluetooth_hr') {
        toast.loading('Searching for heart rate monitors...', { id: 'bluetooth' })
        
        const result = await connectBluetoothHeartRate((hr) => {
          setLiveHeartRate(hr)
          // Store the reading
          const healthData: HealthData = {
            source: 'bluetooth_hr',
            timestamp: new Date().toISOString(),
            type: 'heart_rate',
            value: hr,
            unit: 'bpm',
          }
          storeHealthData([healthData])
        })
        
        if (result.success) {
          setDevices(prev => prev.map(d => 
            d.id === deviceId 
              ? { ...d, connected: true, lastSync: 'Live' }
              : d
          ))
          toast.success(`✅ Connected to ${result.deviceName}!`, { id: 'bluetooth' })
          
          // Mint credential
          const device = REAL_DEVICES.find(d => d.id === deviceId)
          if (device && userAddress) {
            await mintConnectionCredential(device)
          }
        } else {
          toast.error(result.error || 'Failed to connect', { id: 'bluetooth' })
        }
      } else if (deviceId === 'web_bluetooth_scale') {
        toast.loading('Searching for smart scales...', { id: 'bluetooth' })
        
        const result = await connectBluetoothScale((weight, unit) => {
          setLiveWeight({ value: weight, unit })
          // Store the reading
          const healthData: HealthData = {
            source: 'bluetooth_scale',
            timestamp: new Date().toISOString(),
            type: 'weight',
            value: weight,
            unit,
          }
          storeHealthData([healthData])
        })
        
        if (result.success) {
          setDevices(prev => prev.map(d => 
            d.id === deviceId 
              ? { ...d, connected: true, lastSync: 'Live' }
              : d
          ))
          toast.success(`✅ Connected to ${result.deviceName}!`, { id: 'bluetooth' })
          
          // Mint credential
          const device = REAL_DEVICES.find(d => d.id === deviceId)
          if (device && userAddress) {
            await mintConnectionCredential(device)
          }
        } else {
          toast.error(result.error || 'Failed to connect', { id: 'bluetooth' })
        }
      }
    } catch (error) {
      console.error('Bluetooth connection error:', error)
      toast.error('Bluetooth connection failed', { id: 'bluetooth' })
    } finally {
      setIsLoading(prev => ({ ...prev, [deviceId]: false }))
    }
  }

  // Handle device disconnection
  const handleDisconnect = (device: DeviceConnection) => {
    if (device.connectionType === 'oauth') {
      disconnectDevice(device.id)
    } else if (device.connectionType === 'web-bluetooth') {
      if (device.id === 'web_bluetooth_hr') {
        disconnectBluetoothDevice('heart_rate')
        setLiveHeartRate(null)
      } else if (device.id === 'web_bluetooth_scale') {
        disconnectBluetoothDevice('scale')
        setLiveWeight(null)
      }
    }
    
    setDevices(prev => prev.map(d => 
      d.id === device.id 
        ? { ...d, connected: false, lastSync: null }
        : d
    ))
    
    toast.success(`${device.name} disconnected`)
  }

  // Handle device toggle
  const toggleConnection = (device: DeviceConnection) => {
    if (device.connected) {
      handleDisconnect(device)
    } else {
      if (device.connectionType === 'oauth') {
        connectOAuthDevice(device.id)
      } else if (device.connectionType === 'web-bluetooth') {
        connectBluetoothDevice(device.id)
      }
    }
  }

  // Sync data from connected device
  const syncDeviceData = async (deviceId: string) => {
    setSyncingDevice(deviceId)
    const device = devices.find(d => d.id === deviceId)
    
    try {
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      let healthData: HealthData[] = []
      
      if (deviceId === 'google_fit') {
        toast.loading('Syncing Google Fit data...', { id: 'sync' })
        const steps = await fetchGoogleFitData('steps', weekAgo, now)
        const heartRate = await fetchGoogleFitData('heart_rate', weekAgo, now)
        const sleep = await fetchGoogleFitData('sleep', weekAgo, now)
        healthData = [...steps, ...heartRate, ...sleep]
      } else if (deviceId === 'fitbit') {
        toast.loading('Syncing Fitbit data...', { id: 'sync' })
        const steps = await fetchFitbitData('steps', now)
        const heartRate = await fetchFitbitData('heart_rate', now)
        const sleep = await fetchFitbitData('sleep', now)
        healthData = [...steps, ...heartRate, ...sleep]
      } else if (deviceId === 'oura') {
        toast.loading('Syncing Oura data...', { id: 'sync' })
        const sleep = await fetchOuraData('sleep', weekAgo, now)
        const readiness = await fetchOuraData('readiness', weekAgo, now)
        const activity = await fetchOuraData('activity', weekAgo, now)
        healthData = [...sleep, ...readiness, ...activity]
      }
      
      if (healthData.length > 0) {
        storeHealthData(healthData)
        toast.success(`✅ Synced ${healthData.length} records from ${device?.name}`, { id: 'sync' })
        
        // Update last sync time
        setDevices(prev => prev.map(d => 
          d.id === deviceId 
            ? { ...d, lastSync: 'Just now' }
            : d
        ))
      } else {
        toast.success('Already up to date', { id: 'sync' })
      }
    } catch (error) {
      console.error('Sync error:', error)
      toast.error('Failed to sync data', { id: 'sync' })
    } finally {
      setSyncingDevice(null)
    }
  }

  // Handle manual data entry
  const handleManualEntry = () => {
    if (!manualEntry.value) {
      toast.error('Please enter a value')
      return
    }
    
    const value = parseFloat(manualEntry.value)
    if (isNaN(value)) {
      toast.error('Please enter a valid number')
      return
    }
    
    const healthData: HealthData = {
      source: 'manual',
      timestamp: new Date().toISOString(),
      type: manualEntry.type as HealthData['type'],
      value,
      unit: manualEntry.unit,
    }
    
    storeHealthData([healthData])
    toast.success(`✅ ${manualEntry.type} recorded: ${value} ${manualEntry.unit}`)
    setManualEntry(prev => ({ ...prev, value: '' }))
  }

  // CSV file upload handler
  const parseCSVFile = (file: File): Promise<Record<string, string>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split('\n').filter(line => line.trim())
          
          if (lines.length < 2) {
            reject(new Error('CSV file is empty or invalid'))
            return
          }
          
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
          const data = []
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',')
            const row: Record<string, string> = {}
            
            headers.forEach((header, index) => {
              row[header] = values[index]?.trim() || ''
            })
            
            data.push(row)
            
            const progress = Math.floor((i / lines.length) * 100)
            setUploadProgress(progress)
          }
          
          resolve(data)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }
    
    setIsUploading(true)
    setUploadProgress(0)
    toast.loading("Processing CSV file...", { id: 'csv' })
    
    try {
      const data = await parseCSVFile(file)
      
      // Convert CSV data to health data
      const healthData: HealthData[] = data.map(row => ({
        source: 'csv_import',
        timestamp: row.date || row.timestamp || new Date().toISOString(),
        type: (row.type || 'activity') as HealthData['type'],
        value: parseFloat(row.value || '0'),
        unit: row.unit || '',
        metadata: row,
      })).filter(d => !isNaN(d.value))
      
      storeHealthData(healthData)
      
      toast.success(
        `✅ Imported ${healthData.length} health records from ${file.name}`,
        { id: 'csv', duration: 5000 }
      )
      
    } catch {
      toast.error(
        `Failed to parse CSV file. Please ensure it's formatted correctly.`,
        { id: 'csv' }
      )
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const connectedCount = devices.filter(c => c.connected).length

  // Get connection icon based on type
  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'oauth': return <Wifi className="h-4 w-4" />
      case 'web-bluetooth': return <Bluetooth className="h-4 w-4" />
      case 'manual': return <Smartphone className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  // Suppress unused variable warnings
  console.log('Connection credentials loaded:', connectionCredentials.length)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Connect Your Devices
          </h1>
          <p className="text-gray-400 text-lg">
            Sync your wearables and health apps to get comprehensive insights
          </p>
        </div>

        {/* Stats Card */}
        <Card className="mb-8 backdrop-blur-sm bg-gray-800/50 border-gray-700 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl text-white">Connected Sources</CardTitle>
                <CardDescription className="mt-2 text-gray-400">
                  {connectedCount} of {devices.length} sources connected
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                  <Check className="h-3 w-3 mr-1" />
                  {connectedCount} Active
                </Badge>
                <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/20">
                  {devices.length - connectedCount} Available
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Live Data Display */}
        {(liveHeartRate !== null || liveWeight !== null) && (
          <Card className="mb-8 backdrop-blur-sm bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-400 animate-pulse" />
                Live Readings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveHeartRate !== null && (
                  <div className="p-4 rounded-lg bg-gray-900/50 border border-red-500/30">
                    <div className="flex items-center gap-3">
                      <Heart className="h-8 w-8 text-red-500 animate-pulse" />
                      <div>
                        <p className="text-sm text-gray-400">Heart Rate</p>
                        <p className="text-3xl font-bold text-white">
                          {liveHeartRate} <span className="text-lg text-gray-400">bpm</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {liveWeight !== null && (
                  <div className="p-4 rounded-lg bg-gray-900/50 border border-blue-500/30">
                    <div className="flex items-center gap-3">
                      <Scale className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-400">Weight</p>
                        <p className="text-3xl font-bold text-white">
                          {liveWeight.value.toFixed(1)} <span className="text-lg text-gray-400">{liveWeight.unit}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Entry Card */}
        <Card className="mb-8 backdrop-blur-sm bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              ✏️ Manual Entry
            </CardTitle>
            <CardDescription className="text-gray-300">
              Quickly log your health metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[150px]">
                <label className="text-sm text-gray-400 mb-1 block">Metric Type</label>
                <select
                  value={manualEntry.type}
                  onChange={(e) => setManualEntry(prev => ({ 
                    ...prev, 
                    type: e.target.value,
                    unit: e.target.value === 'weight' ? 'kg' : 
                          e.target.value === 'heart_rate' ? 'bpm' :
                          e.target.value === 'blood_glucose' ? 'mg/dL' :
                          e.target.value === 'temperature' ? '°C' : ''
                  }))}
                  title="Select metric type"
                  aria-label="Metric type selector"
                  className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white"
                >
                  <option value="weight">Weight</option>
                  <option value="heart_rate">Heart Rate</option>
                  <option value="blood_glucose">Blood Glucose</option>
                  <option value="blood_pressure">Blood Pressure</option>
                  <option value="temperature">Temperature</option>
                  <option value="steps">Steps</option>
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="text-sm text-gray-400 mb-1 block">Value</label>
                <Input
                  type="number"
                  value={manualEntry.value}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Enter value"
                  className="bg-gray-900/50 border-gray-700 text-white"
                />
              </div>
              <div className="w-24">
                <label className="text-sm text-gray-400 mb-1 block">Unit</label>
                <Input
                  value={manualEntry.unit}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="Unit"
                  className="bg-gray-900/50 border-gray-700 text-white"
                />
              </div>
              <Button
                onClick={handleManualEntry}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Log
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CSV Upload Card */}
        <Card className="mb-8 backdrop-blur-sm bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-purple-400" />
              Import CSV Data
            </CardTitle>
            <CardDescription className="text-gray-300">
              Import health data exports from any app or device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
              title="Upload CSV file"
            />
            
            {isUploading && uploadProgress > 0 && (
              <div className="mb-4 p-4 rounded-lg bg-gray-900/50 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">Processing...</span>
                  <span className="text-sm text-gray-400">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="lg"
              disabled={isUploading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Upload className={`h-5 w-5 mr-2 ${isUploading ? 'animate-pulse' : ''}`} />
              {isUploading ? 'Processing...' : 'Choose CSV File'}
            </Button>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Expected columns: date/timestamp, type, value, unit
            </p>
          </CardContent>
        </Card>

        {/* Device Connection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <Card 
              key={device.id}
              className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl backdrop-blur-sm ${
                device.connected 
                  ? "bg-gray-800/50 border-gray-700 shadow-lg" 
                  : "bg-gray-800/30 border-gray-700/50"
              }`}
            >
              {device.connected && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-none">
                    <Check className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${device.color} text-4xl`}>
                    {device.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1 text-white flex items-center gap-2">
                      {device.name}
                      {getConnectionIcon(device.connectionType)}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-400">
                      {device.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Connection Status */}
                {device.connected && device.lastSync && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-green-400">
                          {device.lastSync === 'Live' ? '🔴 Live' : `Last synced: ${device.lastSync}`}
                        </span>
                      </div>
                      {device.connectionType === 'oauth' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => syncDeviceData(device.id)}
                          disabled={syncingDevice === device.id}
                          className="h-8 px-2 text-green-400 hover:text-green-300"
                        >
                          {syncingDevice === device.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Connection Type Badge */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-gray-900/50 text-gray-300 border-gray-700">
                    {device.connectionType === 'oauth' && '🔐 OAuth'}
                    {device.connectionType === 'web-bluetooth' && '🔵 Bluetooth'}
                    {device.connectionType === 'manual' && '✏️ Manual'}
                  </Badge>
                </div>

                {/* Metrics */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2 uppercase">
                    Available Metrics
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {device.metrics.map((metric) => (
                      <Badge 
                        key={metric}
                        variant="outline"
                        className="text-xs bg-gray-900/50 text-gray-300 border-gray-700"
                      >
                        {metric}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* OAuth Warning */}
                {device.connectionType === 'oauth' && !getStoredTokens(device.id) && !device.connected && (
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5" />
                      <p className="text-xs text-yellow-400">
                        Requires OAuth setup. Contact admin if connection fails.
                      </p>
                    </div>
                  </div>
                )}

                {/* Connect/Disconnect Button */}
                {device.connectionType !== 'manual' && (
                  <Button
                    onClick={() => toggleConnection(device)}
                    disabled={isLoading[device.id]}
                    className={`w-full ${
                      device.connected
                        ? "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                        : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    }`}
                  >
                    {isLoading[device.id] ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : device.connected ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Disconnect
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Setup Instructions */}
        <Card className="mt-8 backdrop-blur-sm bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ExternalLink className="h-5 w-5 text-blue-400" />
              Developer Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-300">
              To enable OAuth connections, add the following environment variables:
            </p>
            <div className="p-4 rounded-lg bg-gray-900/70 border border-gray-700 font-mono text-xs text-gray-300 overflow-x-auto">
              <pre>{`# Google Fit
NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID=your_client_id
GOOGLE_FIT_CLIENT_SECRET=your_secret

# Fitbit
NEXT_PUBLIC_FITBIT_CLIENT_ID=your_client_id
FITBIT_CLIENT_SECRET=your_secret

# Oura
NEXT_PUBLIC_OURA_CLIENT_ID=your_client_id
OURA_CLIENT_SECRET=your_secret

# Strava
NEXT_PUBLIC_STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_secret

# Withings
NEXT_PUBLIC_WITHINGS_CLIENT_ID=your_client_id
WITHINGS_CLIENT_SECRET=your_secret`}</pre>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <a 
                href="https://console.cloud.google.com/apis/credentials" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="h-4 w-4" />
                Google Cloud Console
              </a>
              <a 
                href="https://dev.fitbit.com/apps" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="h-4 w-4" />
                Fitbit Developer Portal
              </a>
              <a 
                href="https://cloud.ouraring.com/oauth2/applications" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="h-4 w-4" />
                Oura Developer Portal
              </a>
              <a 
                href="https://www.strava.com/settings/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="h-4 w-4" />
                Strava API Settings
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Card */}
        <Card className="mt-8 backdrop-blur-sm bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5 text-purple-400" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-300">
              Your health data is encrypted and stored locally. OAuth tokens are securely managed 
              and all connections are credential-backed on the BlockDAG blockchain.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-start gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Watch className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Real-time Sync</p>
                  <p className="text-xs text-gray-400">Automatic updates from devices</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Bluetooth className="h-4 w-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Direct Connect</p>
                  <p className="text-xs text-gray-400">Web Bluetooth support</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Check className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Verified Data</p>
                  <p className="text-xs text-gray-400">BlockDAG backed credentials</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
