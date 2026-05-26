import Cookies from "js-cookie";

const BASE_COOKIE_OPTIONS = {
  secure: Boolean(import.meta.env?.PROD),
  sameSite: "Lax",
};

// ─── Access Token (cookie de sesión, sin expires — lo controla el JWT) ────────
export function getAccessToken() {
  return Cookies.get("accessToken") ?? null;
}
export function setAccessToken(token) {
  Cookies.set("accessToken", token, BASE_COOKIE_OPTIONS);
}
export function removeAccessToken() {
  Cookies.remove("accessToken", BASE_COOKIE_OPTIONS);
}

// ─── Información del usuario (localStorage) ───────────────────────────────────
export function getUserInfo() {
  try {
    return JSON.parse(localStorage.getItem("userInfo")) ?? null;
  } catch {
    return null;
  }
}
export function setUserInfo(info) {
  localStorage.setItem("userInfo", JSON.stringify(info));
}
export function removeUserInfo() {
  localStorage.removeItem("userInfo");
}

// ─── Limpiar toda la sesión ───────────────────────────────────────────────────
export function clearSession() {
  removeAccessToken();
  removeUserInfo();
}
