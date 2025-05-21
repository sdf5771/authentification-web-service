import { create } from 'zustand';

type User = {
    email: string;
    name: string;
}

type State = {
    user: User | null;
    accessToken: string | null;
}

type Actions = {
    setUser: (user: User) => void;
    setAccessToken: (accessToken: string) => void;
    clearAuth: () => void;
}

const useAuthStore = create<State & Actions>((set) => ({
    user: null,
    accessToken: null,
    setUser: (user: User) => set({ user }),
    setAccessToken: (accessToken: string) => set({ accessToken }),
    clearAuth: () => set({ user: null, accessToken: null }),
}))

export default useAuthStore;