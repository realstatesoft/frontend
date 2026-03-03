import Cookies from "js-cookie";

export const COOKIE_NAME = "accessToken";

export const COOKIE_OPTIONS = {
  expires: 1, 
  secure: import.meta.env.PROD, 
  sameSite: "Strict",
};

export function getAccessToken() {
  return Cookies.get(COOKIE_NAME) ?? null;
}

export function setAccessToken(token) {
  Cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
}

export function removeAccessToken() {
  Cookies.remove(COOKIE_NAME);
}
