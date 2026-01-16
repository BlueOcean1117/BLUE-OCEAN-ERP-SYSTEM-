import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,

});

export default API;



/*
import axios from "axios";

const API = axios.create({
  baseURL: "https://blue-ocean-erp-system-final.onrender.com/api",
});

export default API;*/

