import { create } from "zustand";

export const useUserStore = create((set) => ({
  user: "", // Always empty on refresh
  setUser: (user) => set({ user }),
}));