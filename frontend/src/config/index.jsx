const { default: axios } = require("axios");

export const BASE_URL ="http://https://proconnect-pj1y.onrender.com/:5000"

export const clientServer = axios.create({
baseURL: BASE_URL,
});