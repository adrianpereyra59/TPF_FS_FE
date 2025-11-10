import api from "./api.js";


export async function register(name, email, password) {
  const usuario = {
    email,
    username: name,
    password,
  };

  try {
    const data = await api.post("/auth/register", usuario);
    
    return data;
  } catch (err) {
    
    const message = err?.message || "Error al registrar";
    throw new Error(message);
  }
}


export async function login(email, password) {
  try {
    const data = await api.post("/auth/login", { email, password });
    return data;
  } catch (err) {
    const message = err?.message || "Error al iniciar sesión";
    throw new Error(message);
  }
}