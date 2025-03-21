import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api"; // FastAPI backend

export const loginUser = async (data) => {
  const response = await axios.post(`${API_URL}/login`, data);
  return response.data;
};
