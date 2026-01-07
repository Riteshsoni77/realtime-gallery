import { create } from "zustand";

export const useUserStore = create((set) => ({
  user: "", // Start with empty string
  setUser: (user) => set({ user }),
}));