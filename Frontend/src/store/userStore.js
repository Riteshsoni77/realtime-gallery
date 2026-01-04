import { create } from "zustand";

export const useUserStore = create((set) => ({
  user: `User${Math.floor(Math.random() * 10000)}`, // random username
  setUser: (user) => set({ user }),
}));