import { create } from "zustand"

type UserStore = {
  user: string | null
  setUser: (user: string) => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
