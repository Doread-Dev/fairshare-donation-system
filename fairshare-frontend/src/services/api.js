const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(
  endpoint,
  { method = "GET", data, params, headers = {}, responseType = "json" } = {}
) {
  let url = BASE_URL + endpoint;
  if (params && typeof params === "object") {
    const query = new URLSearchParams(params).toString();
    url += `?${query}`;
  }
  const token = getToken();
  const fetchOptions = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };
  if (token) {
    fetchOptions.headers["Authorization"] = `Bearer ${token}`;
  }
  if (data) {
    fetchOptions.body = JSON.stringify(data);
  }
  try {
    const res = await fetch(url, fetchOptions);
    if (!res.ok) {
      const errorResult = await res.json().catch(() => res.text());
      throw {
        status: res.status,
        message: errorResult?.message || errorResult,
      };
    }

    if (responseType === "blob") {
      return res.blob();
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return res.json();
    }
    return res.text();
  } catch (err) {
    // Standardize error object
    throw {
      status: err.status || 500,
      message: err.message || "Network error",
    };
  }
}

const api = {
  get: (endpoint, params, headers) =>
    request(endpoint, { method: "GET", params, headers }),
  post: (endpoint, data, headers) =>
    request(endpoint, { method: "POST", data, headers }),
  put: (endpoint, data, headers) =>
    request(endpoint, { method: "PUT", data, headers }),
  delete: (endpoint, data, headers) =>
    request(endpoint, { method: "DELETE", data, headers }),
  getBlob: (endpoint, params, headers) =>
    request(endpoint, { method: "GET", params, headers, responseType: "blob" }),
};

export default api;
