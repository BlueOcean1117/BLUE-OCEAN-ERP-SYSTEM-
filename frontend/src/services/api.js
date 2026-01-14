import axios from "axios";

const API = axios.create({
  baseURL: "https://blue-ocean-erp-system-final.onrender.com/api",
});

export default API;

