const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const buildHeaders = (token, extra = {}) => {
  const headers = {
    Accept: "application/json",
    ...extra,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let message = response.statusText;
    let errorData = null;
    try {
      errorData = await response.json();
      if (errorData?.detail) {
        if (Array.isArray(errorData.detail)) {
          message = errorData.detail.map((item) => item.msg || item).join(", ");
        } else if (typeof errorData.detail === "object") {
          message = errorData.detail.message || JSON.stringify(errorData.detail);
        } else {
          message = errorData.detail;
        }
      } else if (errorData?.message) {
        message = errorData.message;
      }
    } catch (error) {
      console.log("Error parsing error response:", error);
      // ignore JSON parse errors
    }
    const error = new Error(message || "Request failed");
    error.status = response.status;
    if (errorData) {
      error.body = errorData;
    }
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

export const login = async (username, password, totpCode) => {
  const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(
      totpCode
        ? { username, password, totp_code: totpCode }
        : { username, password }
    ),
  });

  return handleResponse(response);
};

export const refreshAccessToken = async () => {
  const response = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  });

  return handleResponse(response);
};

export const register = async ({ username, password, role }) => {
  const response = await fetch(`${API_BASE_URL}/v1/auth/register`, {
    method: "POST",
    headers: buildHeaders(null, { "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify({ username, password, role }),
  });

  return handleResponse(response);
};

export const getCurrentUser = async (token) => {
  const response = await fetch(`${API_BASE_URL}/v1/auth/me`, {
    method: "GET",
    headers: buildHeaders(token),
    credentials: "include",
  });

  return handleResponse(response);
};

export const updateCurrentUser = async (token, payload) => {
  const response = await fetch(`${API_BASE_URL}/v1/users/me`, {
    method: "PATCH",
    headers: buildHeaders(token, { "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

export const changePassword = async (token, payload) => {
  const response = await fetch(`${API_BASE_URL}/v1/users/me/password`, {
    method: "POST",
    headers: buildHeaders(token, { "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

export const initiateTotpSetup = async (token) => {
  const response = await fetch(`${API_BASE_URL}/v1/users/me/totp/setup`, {
    method: "POST",
    headers: buildHeaders(token),
    credentials: "include",
  });

  return handleResponse(response);
};

export const verifyTotpSetup = async (token, payload) => {
  const response = await fetch(`${API_BASE_URL}/v1/users/me/totp/verify`, {
    method: "POST",
    headers: buildHeaders(token, { "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

export const disableTotp = async (token, payload) => {
  const response = await fetch(`${API_BASE_URL}/v1/users/me/totp/disable`, {
    method: "POST",
    headers: buildHeaders(token, { "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

export const listJobs = async (token) => {
  const response = await fetch(`${API_BASE_URL}/v1/jobs`, {
    method: "GET",
    headers: buildHeaders(token),
    credentials: "include",
  });

  return handleResponse(response);
};

export const createJob = async (token, payload) => {
  const response = await fetch(`${API_BASE_URL}/v1/jobs`, {
    method: "POST",
    headers: buildHeaders(token, { "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

export const uploadTranscription = async (token, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/v1/transcribe/upload`, {
    method: "POST",
    headers: buildHeaders(token),
    credentials: "include",
    body: formData,
  });

  return handleResponse(response);
};

export const logout = async () => {
  const response = await fetch(`${API_BASE_URL}/v1/auth/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  });

  return handleResponse(response);
};

export const apiConfig = {
  API_BASE_URL,
};
