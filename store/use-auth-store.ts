"use client"

import { create } from 'zustand';
import { User } from 'firebase/auth';

interface  IAuth {
    user:  User |  null;
    loading:  boolean;
    token: string | null;
    setUser: (user: User | null) => void,
    setLoading: (loading: boolean) => void,
    setToken: (token: string | null) => void
}

const useAuthStore = create<IAuth>((set) => ({
    setUser: (user) => set({ user }),
    setToken: (token) => set({ token }),
    setLoading: (loading) => set({ loading }),
    user: null,
    token: null,
    loading: false,
}));

export default useAuthStore