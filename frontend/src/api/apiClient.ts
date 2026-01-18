const BASE_URL = import.meta.env.VITE_API_URL as string;

if (!BASE_URL) {
  throw new Error(
    "VITE_API_URL is not set. Create frontend/.env.local with VITE_API_URL=http://localhost:8080"
  );
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
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
