// stores/auth.store.ts
import { create } from "zustand";
import type { PublicUser } from "@/types/models";

interface AuthState {
  user: PublicUser | null;
  isLoaded: boolean;
  setUser: (u: PublicUser | null) => void;
  setLoaded: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoaded: false,
  setUser: (user) => set({ user, isLoaded: true }),
  setLoaded: (isLoaded) => set({ isLoaded }),
}));
