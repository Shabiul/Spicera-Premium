// API utility functions for making HTTP requests

export interface ApiRequestOptions {
  on401?: "throw" | "returnNull";
}

export async function apiRequest(
  method: string,
  url: string,
  data?: any,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const token = localStorage.getItem('auth_token');
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (response.status === 401) {
    if (options.on401 === "returnNull") {
      return response;
    }
    // Clear invalid token
    localStorage.removeItem('auth_token');
    throw new Error('Authentication required');
  }

  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response;
}

export function getQueryFn(options: ApiRequestOptions = {}) {
  return async ({ queryKey }: { queryKey: readonly unknown[] }) => {
    const url = queryKey[0] as string;
    
    try {
      const response = await apiRequest('GET', url, undefined, options);
      
      if (response.status === 401 && options.on401 === "returnNull") {
        return null;
      }
      
      return response.json();
    } catch (error) {
      if (options.on401 === "returnNull" && error instanceof Error && error.message === 'Authentication required') {
        return null;
      }
      throw error;
    }
  };
}

// Products API
export const productsApi = {
  getAll: () => apiRequest('GET', '/api/products'),
  getFeatured: () => apiRequest('GET', '/api/products/featured'),
  getById: (id: string) => apiRequest('GET', `/api/products/${id}`),
};

// Cart API
export const cartApi = {
  getItems: () => apiRequest('GET', '/api/cart'),
  addItem: (data: { productId: string; quantity: number }) => 
    apiRequest('POST', '/api/cart', data),
  updateQuantity: (id: string, data: { quantity: number }) => 
    apiRequest('PUT', `/api/cart/${id}`, data),
  removeItem: (id: string) => apiRequest('DELETE', `/api/cart/${id}`),
  clear: () => apiRequest('DELETE', '/api/cart'),
};