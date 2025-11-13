// src/utils/api.js
const RAW_BASE = import.meta.env.VITE_API_URL || "https://pwa-be-tpf.vercel.app";
const BASE = RAW_BASE.replace(/\/$/, ""); // no trailing slash

let _AUTH_TOKEN = null;

export function setToken(token) {
  _AUTH_TOKEN = token;
  try {
    if (typeof localStorage !== "undefined") {
      if (token) localStorage.setItem("auth_token", token);
      else localStorage.removeItem("auth_token");
    }
  } catch (e) {
    console.warn("setToken error", e);
  }
}

function buildUrl(path) {
  // If path already looks like a full URL, return it untouched
  if (/^https?:\/\//.test(path)) return path;
  // If the path already begins with "/api", avoid adding an extra /api
  // The backend uses endpoints like /api/auth/..., so accept both "/api/..." and "/auth/..."
  if (path.startsWith("/")) {
    // prefer BASE + path
    return `${BASE}${path}`;
  }
  return `${BASE}/${path}`;
}

async function request(path, { method = "GET", body = null, raw = false, headers: extraHeaders = {} } = {}) {
  const token = _AUTH_TOKEN || (typeof localStorage !== "undefined" ? localStorage.getItem("auth_token") : null);
  const headers = { ...extraHeaders };
  if (body !== null && !raw) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = buildUrl(path);
  const init = { method, headers, body: body !== null && !raw ? JSON.stringify(body) : body };

  // small debug logging in dev mode
  const isDev = import.meta.env.DEV;
  if (isDev) {
    console.info("[api] REQUEST", method, url, body ? body : "");
  }

  let res;
  try {
    res = await fetch(url, init);
  } catch (err) {
    const e = new Error("Network error or request timed out");
    e.cause = err;
    throw e;
  }

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = text;
  }

  if (!res.ok) {
    // extract a useful error message if server provided
    const message = (data && (data.message || data.msg || data.error)) || res.statusText || "Error en la petición";
    const err = new Error(message);
    err.status = res.status;
    err.response = data;
    if (isDev) {
      console.error("[api] ERROR RESPONSE", { url, status: res.status, body: data });
    }
    throw err;
  }

  if (isDev) {
    console.info("[api] RESPONSE", { url, status: res.status, data });
  }
  return data;
}

export async function get(path) { return request(path, { method: "GET" }); }
export async function post(path, body, opts = {}) { return request(path, { method: "POST", body: body ?? null, raw: !!opts.raw }); }
export async function put(path, body) { return request(path, { method: "PUT", body: body ?? null }); }
export async function del(path) { return request(path, { method: "DELETE" }); }

export default { request, get, post, put, del, setToken, BASE };