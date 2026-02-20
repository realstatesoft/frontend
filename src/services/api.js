import axios from "axios";

const api = axios.create({
  baseURL: "baseURL: import.meta.env.VITE_API_URL,", // cambiar cuando exista backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;