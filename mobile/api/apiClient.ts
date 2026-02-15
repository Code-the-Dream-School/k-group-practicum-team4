import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

if (!BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not set. Add it to app.json / app.config.js');
}

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_KEY = 'authUser';

export type AuthUser = {
    displayName: string;
    avatarId: string;
};

export const setAuthToken = async (token: string): Promise<void> => {
    if (Platform.OS === 'web') {
        console.warn('SecureStore not supported on web – token not saved');
        return;
    }
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
};

export const getAuthToken = async (): Promise<string | null> => {
    if (Platform.OS === 'web') return null;
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
};

export const setAuthUser = async (user: AuthUser): Promise<void> => {
    if (Platform.OS === 'web') return;
    await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(user));
};

export const getAuthUser = async (): Promise<AuthUser | null> => {
    if (Platform.OS === 'web') return null;
    const raw = await SecureStore.getItemAsync(AUTH_USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
};

export const clearAuth = async (): Promise<void> => {
    if (Platform.OS === 'web') return;
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(AUTH_USER_KEY);
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
    const token = await getAuthToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
    });

    let data;
    const text = await res.text();
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = null;
    }

    if (!res.ok) {
        if (res.status === 401) {
            await clearAuth();
        }
        const message = data?.error || data?.message || `Request failed: ${res.status}`;
        throw new Error(message);
    }

    return data as T;
};

// Auth types
type AuthResponse = {
    user: { displayName: string };
    token: string;
};

type RegisterBody = {
    displayName: string;
    email: string;
    password: string;
    avatarId: string;
};

type LoginBody = {
    email: string;
    password: string;
};

export const registerUser = async (body: RegisterBody): Promise<AuthResponse> => {
    return request<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
    });
};

export const loginUser = async (body: LoginBody): Promise<AuthResponse> => {
    return request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
    });
};

export const setAuthFromToken = async (token: string): Promise<void> => {
    await setAuthToken(token);
};
