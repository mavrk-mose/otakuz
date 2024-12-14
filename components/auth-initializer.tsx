import { cookies } from 'next/headers';
import useAuthStore from '@/store/use-auth-store';

export async function AuthInitializer() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');

    if (token) {
        // You might want to verify the token on the server-side here
        // For now, we'll just set it in the store
        useAuthStore.getState().setToken(token.value);
    }

    return null;
}