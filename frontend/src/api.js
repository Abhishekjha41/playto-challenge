import axios from "axios";

export const api = axios.create({
  baseURL: "https://playto-challenge-production.up.railway.app/api/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

