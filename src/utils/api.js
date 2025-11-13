// src/utils/api.js
const RAW_BASE = import.meta.env.VITE_API_URL || "https://pwa-be-tpf.vercel.app";
const BASE = RAW_BASE.replace(/\/$/, ""); // sin slash final

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
  // Si ya es URL absoluta, retornar tal cual
  if (/^https?:\/\//.test(path)) return path;
  // Soportar rutas que comiencen con / o sin /
  if (path.startsWith("/")) return `${BASE}${path}`;
  return `${BASE}/${path}`;
}

async function request(path, { method = "GET", body = null, raw = false, headers: extraHeaders = {} } = {}) {
  const token = _AUTH_TOKEN || (typeof localStorage !== "undefined" ? localStorage.getItem("auth_token") : null);
  const headers = { ...extraHeaders };
  if (body !== null && !raw) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = buildUrl(path);
  const init = { method, headers, body: body !== null && !raw ? JSON.stringify(body) : body };

  // Debug logging en desarrollo
  if (import.meta.env.DEV) {
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
    const message = (data && (data.message || data.msg || data.error)) || res.statusText || "Error en la petición";
    const err = new Error(message);
    err.status = res.status;
    err.response = data;
    if (import.meta.env.DEV) {
      console.error("[api] ERROR RESPONSE", { url, status: res.status, body: data });
    }
    throw err;
  }

  if (import.meta.env.DEV) {
    console.info("[api] RESPONSE", { url, status: res.status, data });
  }
  return data;
}

export async function get(path) { return request(path, { method: "GET" }); }
export async function post(path, body, opts = {}) { return request(path, { method: "POST", body: body ?? null, raw: !!opts.raw }); }
export async function put(path, body) { return request(path, { method: "PUT", body: body ?? null }); }
export async function del(path) { return request(path, { method: "DELETE" }); }

export default { request, get, post, put, del, setToken, BASE };