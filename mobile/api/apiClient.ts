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

    const fullUrl = `${BASE_URL}${path}`;

    // Debug logs
    console.log('🔥 API CALL START 🔥');
    console.log('BASE_URL:', BASE_URL);
    console.log('Path:', path);
    console.log('Full URL:', fullUrl);
    console.log('Method:', options.method || 'GET');
    console.log('Body:', options.body ? options.body.toString() : 'no body');
    console.log('Headers:', JSON.stringify({
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    }));

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const res = await fetch(fullUrl, {
        ...options,
        headers,
    });

    console.log('Response status:', res.status);

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
        const message = data?.error || data?.message || `Request failed: ${res.status} ${res.statusText}`;
        console.error('API Error:', message);
        throw new Error(message);
    }

    return data as T;
};

// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────

export type AuthResponse = {
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

// ──────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────

export type DashboardStatsDto = {
    documentsCount: number;
    flashcardsCount: number;
    quizzesCount: number;
};

export type WeeklyActivityDto = {
    flashcards: number;
    summaries: number;
    quizzes: number;
};

export type TodayActivityDto = {
    studiedMinutes: number;
    flashcardsReviewed: number;
    quizzesCompleted: number;
};

export type DashboardResponse = {
    stats: DashboardStatsDto;
    weeklyActivity: WeeklyActivityDto;
    todayActivity: TodayActivityDto;
};

export async function getDashboardData(): Promise<DashboardResponse> {
    return request<DashboardResponse>('/api/dashboard');
}

export type ActivityLogItemDto = {
    id: string;
    type: 'resource_uploaded' | 'summary_created' | 'flashcards_created' | 'quiz_created';
    resourceId: string;
    resourceTitle: string;
    createdAt: string;
};

export async function getActivityLog(limit = 10): Promise<ActivityLogItemDto[]> {
    const query = new URLSearchParams({ limit: String(limit) });
    return request<ActivityLogItemDto[]>(`/api/dashboard/activity?${query.toString()}`);
}

// ──────────────────────────────────────────────
// Resources
// ──────────────────────────────────────────────

export type ResourceSummaryDto = {
    content: string;
    createdAt: string;
};

export type ResourceDto = {
    _id: string;
    title: string;
    tags: string[];
    textContent: string;
    type: 'plain_text';
    createdAt: string;
    updatedAt: string;
    summary?: ResourceSummaryDto;
};

export async function getUserResources(): Promise<ResourceDto[]> {
    const res = await request<{ success: true; count: number; resources: ResourceDto[] }>('/api/resources');
    return res.resources;
}

export async function getResourceById(resourceId: string): Promise<ResourceDto> {
    const res = await request<{ success: true; resource: ResourceDto }>(`/api/resources/${resourceId}`);
    return res.resource;
}

export async function createResource(body: { title: string; textContent: string; tags: string[] }): Promise<ResourceDto> {
    const res = await request<{ success: true; resource: ResourceDto }>('/api/resources', {
        method: 'POST',
        body: JSON.stringify(body),
    });
    return res.resource;
}

export async function deleteResource(resourceId: string): Promise<void> {
    await request<unknown>(`/api/resources/${resourceId}`, { method: 'DELETE' });
}

export async function askAi(prompt: string): Promise<string> {
    const res = await request<{ response: string }>('/api/ai/ask', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
    });
    return res.response;
}
