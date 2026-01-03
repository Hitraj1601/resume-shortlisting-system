// API Service for backend communication

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Common headers for API requests
const getHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Generic API request handler
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getHeaders(!options.headers),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'An error occurred',
        error: data.error,
      };
    }

    return { success: true, data, ...data };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: getHeaders(false),
    });
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'hr' | 'candidate';
    company?: string;
  }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: getHeaders(false),
    });
  },

  getMe: async () => {
    return apiRequest('/auth/me');
  },

  logout: async () => {
    return apiRequest('/auth/logout', { method: 'POST' });
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  deleteAccount: async () => {
    return apiRequest('/auth/account', { method: 'DELETE' });
  },
};

// Vacancies API
export const vacanciesAPI = {
  getAll: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/vacancies${query}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/vacancies/${id}`);
  },

  create: async (vacancyData: any) => {
    return apiRequest('/vacancies', {
      method: 'POST',
      body: JSON.stringify(vacancyData),
    });
  },

  update: async (id: string, vacancyData: any) => {
    return apiRequest(`/vacancies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vacancyData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/vacancies/${id}`, {
      method: 'DELETE',
    });
  },

  close: async (id: string) => {
    return apiRequest(`/vacancies/${id}/close`, {
      method: 'PATCH',
    });
  },

  reopen: async (id: string) => {
    return apiRequest(`/vacancies/${id}/reopen`, {
      method: 'PATCH',
    });
  },
};

// Applications API
export const applicationsAPI = {
  getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/applications${query}`);
  },

  getByVacancy: async (vacancyId: string) => {
    return apiRequest(`/applications/vacancy/${vacancyId}`);
  },

  getMyApplications: async () => {
    return apiRequest('/applications/my');
  },

  getById: async (id: string) => {
    return apiRequest(`/applications/${id}`);
  },

  submit: async (applicationData: { vacancyId: string; resume?: any; coverLetter?: any }) => {
    return apiRequest('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  },

  updateStatus: async (id: string, status: string, hrNotes?: string) => {
    return apiRequest(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, hrNotes }),
    });
  },

  updateAIScore: async (id: string, aiScore: any, aiAnalysis?: any) => {
    return apiRequest(`/applications/${id}/ai-score`, {
      method: 'PATCH',
      body: JSON.stringify({ aiScore, aiAnalysis }),
    });
  },
};

// Users API
export const usersAPI = {
  getAll: async (params?: { role?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/users${query}`);
  },

  getProfile: async () => {
    return apiRequest('/users/profile');
  },

  updateProfile: async (profileData: any) => {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  getById: async (id: string) => {
    return apiRequest(`/users/${id}`);
  },

  deactivate: async (id: string) => {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// Candidates API
export const candidatesAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    skills?: string;
    location?: string;
    experience?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skills) queryParams.append('skills', params.skills);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.experience) queryParams.append('experience', params.experience);
    if (params?.search) queryParams.append('search', params.search);
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/candidates${query}`);
  },

  getBySkills: async (skills: string[]) => {
    return apiRequest(`/candidates/skills/${skills.join(',')}`);
  },
};

// Chat API
export const chatAPI = {
  getAll: async () => {
    return apiRequest('/chat');
  },

  getById: async (chatId: string) => {
    return apiRequest(`/chat/${chatId}`);
  },

  startChat: async (applicationId: string) => {
    return apiRequest('/chat/start', {
      method: 'POST',
      body: JSON.stringify({ applicationId }),
    });
  },

  sendMessage: async (chatId: string, content: string) => {
    return apiRequest(`/chat/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  markAsRead: async (chatId: string) => {
    return apiRequest(`/chat/${chatId}/read`, {
      method: 'PUT',
    });
  },

  getUnreadCount: async () => {
    return apiRequest('/chat/unread/count');
  },

  closeChat: async (chatId: string) => {
    return apiRequest(`/chat/${chatId}/close`, {
      method: 'PUT',
    });
  },
};

export default {
  auth: authAPI,
  vacancies: vacanciesAPI,
  applications: applicationsAPI,
  users: usersAPI,
  candidates: candidatesAPI,
};
