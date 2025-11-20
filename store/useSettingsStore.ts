import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  notifications: boolean
  healthAlerts: boolean
  weeklyReports: boolean
  dataSharing: boolean
  setNotifications: (value: boolean) => void
  setHealthAlerts: (value: boolean) => void
  setWeeklyReports: (value: boolean) => void
  setDataSharing: (value: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifications: true,
      healthAlerts: true,
      weeklyReports: true,
      dataSharing: false,
      setNotifications: (value: boolean) => set({ notifications: value }),
      setHealthAlerts: (value: boolean) => set({ healthAlerts: value }),
      setWeeklyReports: (value: boolean) => set({ weeklyReports: value }),
      setDataSharing: (value: boolean) => set({ dataSharing: value }),
    }),
    {
      name: 'settings-storage',
    }
  )
)
