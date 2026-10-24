
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000/api"
).replace(/\/+$/, "");

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token || null;
}

export function clearAccessToken() {
  accessToken = null;
}

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function getCsrfToken() {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("csrftoken="));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const method = (options.method || "GET").toUpperCase();
  const unsafeMethod = !["GET", "HEAD", "OPTIONS", "TRACE"].includes(method);

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Accept", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  try {
    if (unsafeMethod) {
      let csrfToken = getCsrfToken();

      if (!csrfToken) {
        const csrfResponse = await fetch(
          `${API_BASE_URL}/auth/status/`,
          { credentials: "include" }
        );

        if (!csrfResponse.ok) {
          throw new ApiError(
            "Unable to initialize CSRF protection.",
            csrfResponse.status
          );
        }

        csrfToken = getCsrfToken();
      }

      if (!csrfToken) {
        throw new ApiError("CSRF token is missing.");
      }

      headers.set("X-CSRFToken", csrfToken);
    }

    const response = await fetch(
      `${API_BASE_URL}/${path.replace(/^\/+/, "")}`,
      {
        ...options,
        method,
        headers,
        credentials: "include",
      }
    );

    if (response.status === 204) {
      if (!response.ok) {
        throw new ApiError("The request failed.", response.status);
      }
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    let data = null;

    if (contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        throw new ApiError(
          "The server returned an invalid response.",
          response.status
        );
      }
    } else {
      const text = await response.text();
      data = text ? { detail: text } : null;
    }

    if (!response.ok) {
      const message =
        data?.detail ||
        data?.message ||
        (response.status === 401
          ? "Your session has expired or you are not authenticated."
          : response.status === 403
            ? "The request was forbidden. Check your permissions and CSRF token."
            : response.status >= 500
              ? "A server error occurred. Please try again later."
              : "The request could not be completed.");

      throw new ApiError(message, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      "Unable to connect to the server. Check that the Django backend is running."
    );
  }
}

export const api = {
  get: (path, options = {}) =>
    request(path, { ...options, method: "GET" }),

  post: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  patch: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (path, options = {}) =>
    request(path, { ...options, method: "DELETE" }),
};
