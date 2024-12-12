"use client"

import { create } from 'zustand';
import { User } from 'firebase/auth';

interface IAuth {
    user: User | null;
    loading: boolean;
    token: string | null;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setToken: (token: string | null) => void;
    signIn: (provider: string, credentials?: any) => Promise<User>;
    signOut: () => Promise<void>;
}

const useAuthStore = create<IAuth>((set) => ({
    user: null,
    token: null,
    loading: true,
    setUser: (user) => set({ user }),
    setToken: (token) => set({ token }),
    setLoading: (loading) => set({ loading }),
    signIn: async () => {
        throw new Error('signIn not implemented');
    },
    signOut: async () => {
        throw new Error('signOut not implemented');
    },
}));

export default useAuthStore;

