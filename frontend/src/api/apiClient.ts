const BASE_URL = import.meta.env.VITE_API_URL as string;

if (!BASE_URL) {
  throw new Error(
    "VITE_API_URL is not set. Create frontend/.env.local with VITE_API_URL=http://localhost:8080"
  );
}

const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "authUser";

export type AuthUser = {
  displayName: string;
  avatarId: string;
};

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
};

const setAuthUser = (user: AuthUser): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const getAuthUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

const decodeBase64Url = (value: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (padded.length % 4)) % 4;
    const withPadding = `${padded}${"=".repeat(padLength)}`;
    return window.atob(withPadding);
  } catch {
    return null;
  }
};

const parseJwtPayload = (token: string): Record<string, unknown> | null => {
  const parts = token.split(".");
  if (parts.length < 2 || !parts[1]) return null;
  const decoded = decodeBase64Url(parts[1]);
  if (!decoded) return null;
  try {
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const setAuthFromToken = (token: string): void => {
  setAuthToken(token);
  const payload = parseJwtPayload(token);
  if (!payload) return;
  const displayName = String(payload.displayName || "").trim();
  const avatarId = String(payload.avatarId || "").trim();
  if (!displayName) return;
  setAuthUser({ displayName, avatarId });
};

export const clearAuthToken = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const clearAuthUser = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_USER_KEY);
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      data?.error ||
      data?.message ||
      `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return data as T;
}

// ---------- Auth ----------
export type AuthResponse = {
  user: {
    displayName: string;
  };
  token: string;
};

type RegisterUserBody = {
  displayName: string;
  email: string;
  password: string;
  avatarId: string;
};

export async function registerUser(body: RegisterUserBody): Promise<AuthResponse> {
  return request<AuthResponse>(`/api/auth/register`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

type LoginUserBody = {
  email: string;
  password: string;
};

export async function loginUser(body: LoginUserBody): Promise<AuthResponse> {
  return request<AuthResponse>(`/api/auth/login`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ---------- Resources ----------
export type ResourceDto = {
  _id: string;
  title: string;
  tags: string[];
  textContent: string;
  type: "plain_text";
  createdAt: string;
  updatedAt: string;
};

type GetUserResourcesResponse = {
  success: true;
  count: number;
  resources: ResourceDto[];
};

type GetResourceByIdResponse = {
  success: true;
  resource: ResourceDto;
};

export async function getUserResources(): Promise<ResourceDto[]> {
  const res = await request<GetUserResourcesResponse>(`/api/resources`);
  return res.resources;
}

type CreateResourceBody = {
  title: string;
  textContent: string;
  tags: string[];
};

type CreateResourceResponse = {
  success: true;
  resource: ResourceDto;
};

type UpdateResourceBody = {
  title?: string;
  tags?: string[];
  textContent?: string;
};

type UpdateResourceResponse = {
  success: true;
  resource: ResourceDto;
};

export async function getResourceById(resourceId: string): Promise<ResourceDto> {
  const res = await request<GetResourceByIdResponse>(`/api/resources/${resourceId}`);
  return res.resource;
}

export async function createResource(body: CreateResourceBody): Promise<ResourceDto> {
  const res = await request<CreateResourceResponse>(`/api/resources`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.resource;
}

export async function updateResource(
  resourceId: string,
  body: UpdateResourceBody
): Promise<ResourceDto> {
  const res = await request<UpdateResourceResponse>(`/api/resources/${resourceId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return res.resource;
}

export async function deleteResource(resourceId: string): Promise<void> {
  await request<unknown>(`/api/resources/${resourceId}`, { method: "DELETE" });
}

type AskAiResponse = {
  response: string;
};

export async function askAi(prompt: string): Promise<string> {
  const res = await request<AskAiResponse>(`/api/ai/ask`, {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
  return res.response;
}
