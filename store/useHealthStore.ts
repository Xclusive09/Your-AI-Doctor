import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface HealthMetric {
  date: string
  steps: number
  sleepHours: number
  deepSleepPercent: number
  hrv: number
  glucose: number
  weight: number
  restingHeartRate: number
  vo2Max: number
  source?: string // Track data source (e.g., 'Apple Health', 'Google Fit', 'Manual')
}

export interface ConnectedDevice {
  id: string
  name: string
  connected: boolean
  lastSync: string | null
}

interface HealthStore {
  metrics: HealthMetric[]
  connectedDevices: ConnectedDevice[]
  isLoading: boolean
  hasRealData: boolean
  initializeData: () => void
  addMetric: (metric: HealthMetric) => void
  addMetrics: (metrics: HealthMetric[]) => void
  updateConnectedDevice: (id: string, updates: Partial<ConnectedDevice>) => void
  getMetricsForRange: (days: number) => HealthMetric[]
  getTodayMetric: () => HealthMetric | undefined
  getAverageSteps: (days: number) => number
  getAverageSleep: (days: number) => number
  getAverageHRV: (days: number) => number
  checkBadgeEligibility: (badgeType: string) => boolean
  clearAllData: () => void
}

// Generate realistic mock health data for the past 90 days (for demo purposes)
function generateMockData(): HealthMetric[] {
  const data: HealthMetric[] = []
  const today = new Date()
  
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Add some variance and trends
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    
    data.push({
      date: date.toISOString().split('T')[0],
      steps: Math.floor(8000 + Math.random() * 10000 + (isWeekend ? 2000 : 0)),
      sleepHours: +(5.5 + Math.random() * 4).toFixed(1),
      deepSleepPercent: Math.floor(15 + Math.random() * 25),
      hrv: Math.floor(40 + Math.random() * 70),
      glucose: Math.floor(70 + Math.random() * 60),
      weight: +(155 + Math.random() * 5 - 2.5).toFixed(1),
      restingHeartRate: Math.floor(55 + Math.random() * 20),
      vo2Max: Math.floor(35 + Math.random() * 20),
      source: 'Demo Data'
    })
  }
  
  return data
}

export const useHealthStore = create<HealthStore>()(
  persist(
    (set, get) => ({
      metrics: [],
      connectedDevices: [],
      isLoading: false,
      hasRealData: false,
      
      initializeData: () => {
        set({ isLoading: true })
        const { metrics, hasRealData } = get()
        
        // Only use mock data if no real data exists
        if (metrics.length === 0 && !hasRealData) {
          const mockData = generateMockData()
          set({ metrics: mockData, isLoading: false })
        } else {
          set({ isLoading: false })
        }
      },
      
      addMetric: (metric: HealthMetric) => {
        const { metrics } = get()
        set({ metrics: [...metrics, metric], hasRealData: true })
      },
      
      addMetrics: (newMetrics: HealthMetric[]) => {
        const { metrics } = get()
        // Merge metrics, avoiding duplicates by date
        const existingDates = new Set(metrics.map(m => m.date))
        const uniqueNewMetrics = newMetrics.filter(m => !existingDates.has(m.date))
        set({ 
          metrics: [...metrics, ...uniqueNewMetrics].sort((a, b) => a.date.localeCompare(b.date)),
          hasRealData: true 
        })
      },
      
      updateConnectedDevice: (id: string, updates: Partial<ConnectedDevice>) => {
        const { connectedDevices } = get()
        const updatedDevices = connectedDevices.map(device =>
          device.id === id ? { ...device, ...updates } : device
        )
        set({ connectedDevices: updatedDevices })
      },
      
      getMetricsForRange: (days: number) => {
        const { metrics } = get()
        return metrics.slice(-days)
      },
      
      getTodayMetric: () => {
        const { metrics } = get()
        return metrics[metrics.length - 1]
      },
      
      getAverageSteps: (days: number) => {
        const metrics = get().getMetricsForRange(days)
        if (metrics.length === 0) return 0
        const total = metrics.reduce((sum, m) => sum + m.steps, 0)
        return Math.floor(total / metrics.length)
      },
      
      getAverageSleep: (days: number) => {
        const metrics = get().getMetricsForRange(days)
        if (metrics.length === 0) return 0
        const total = metrics.reduce((sum, m) => sum + m.sleepHours, 0)
        return +(total / metrics.length).toFixed(1)
      },
      
      getAverageHRV: (days: number) => {
        const metrics = get().getMetricsForRange(days)
        if (metrics.length === 0) return 0
        const total = metrics.reduce((sum, m) => sum + m.hrv, 0)
        return Math.floor(total / metrics.length)
      },
      
      checkBadgeEligibility: (badgeType: string) => {
        const { metrics } = get()
        if (metrics.length === 0) return false
        
        switch (badgeType) {
          case 'verified-walker': {
            // 90 days with ≥10k steps
            const last90 = metrics.slice(-90)
            return last90.filter(m => m.steps >= 10000).length >= 90
          }
          case 'deep-sleep-master': {
            // 60 nights with ≥8h sleep
            const last90 = metrics.slice(-90)
            return last90.filter(m => m.sleepHours >= 8).length >= 60
          }
          case 'metabolic-champion': {
            // 30-day glucose SD < 15
            const last30 = metrics.slice(-30)
            if (last30.length < 30) return false
            const values = last30.map(m => m.glucose)
            const mean = values.reduce((a, b) => a + b, 0) / values.length
            const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
            const sd = Math.sqrt(variance)
            return sd < 15
          }
          case 'cardio-elite': {
            // 90-day average HRV > 70
            const last90 = metrics.slice(-90)
            if (last90.length < 90) return false
            const avgHRV = last90.reduce((sum, m) => sum + m.hrv, 0) / last90.length
            return avgHRV > 70
          }
          case 'century-club': {
            // 100k steps in 7 days (rolling window)
            for (let i = metrics.length - 1; i >= 6; i--) {
              const week = metrics.slice(i - 6, i + 1)
              const weekTotal = week.reduce((sum, m) => sum + m.steps, 0)
              if (weekTotal >= 100000) return true
            }
            return false
          }
          default:
            return false
        }
      },
      
      clearAllData: () => {
        set({ metrics: [], hasRealData: false })
      },
    }),
    {
      name: 'health-storage',
      partialize: (state) => ({
        metrics: state.metrics,
        connectedDevices: state.connectedDevices,
        hasRealData: state.hasRealData,
      }),
    }
  )
)
