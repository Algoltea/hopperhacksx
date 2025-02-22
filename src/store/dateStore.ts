import { create } from 'zustand'

interface DateState {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
}

export const useDateStore = create<DateState>((set) => ({
  date: new Date(),
  setDate: (date) => set({ date }),
})) 