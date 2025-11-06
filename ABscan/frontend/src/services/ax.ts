import axios from "axios";

// Динамически определяем URL API на основе текущего хоста
// Это позволяет работать как с localhost, так и с IP-адресами (для GoLogin)
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Используем тот же хост, что и фронтенд, но порт 7000 для API
  const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
  return `http://${hostname}:7000`;
};

const BASE_URL = getBaseUrl();

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Получить все сканы
export const fetchScans = async () => {
  try {
    const response = await api.get("/scans");
    return response.data; // возвращаем только данные
  } catch (error) {
    console.error("Ошибка при загрузке сканов:", error);
    throw error;
  }
};

// Получить один скан по id
export const fetchScan = async (scanId: number) => {
  try {
    const response = await api.get(`/scans/${scanId}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при загрузке скана ${scanId}:`, error);
    throw error;
  }
};

// Создать новый скан (для Главной страницы)
export const createScan = async (data: { user: number; isAb: boolean }) => {
  try {
    const response = await api.post("/scans", data);
    return response.data;
  } catch (error) {
    console.error("Ошибка при создании скана:", error);
    throw error;
  }
};

// Удалить скан по id
export const deleteScan = async (scanId: number) => {
  try {
    await api.delete(`/scans/${scanId}`);
  } catch (error) {
    console.error(`Ошибка при удалении скана ${scanId}:`, error);
    throw error;
  }
};

export const createUser = async () => {
  try {
    const response = await api.post("/users");
    return response.data; // возвращаем только данные
  } catch (error) {
    console.error("Ошибка при создании пользователя:", error);
    throw error;
  }
};

export const fetchUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch (error) {
    console.error("Ошибка при загрузке пользователей:", error);
    throw error;
  }
};
