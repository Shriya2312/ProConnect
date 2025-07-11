const { default: axios } = require("axios");

export const BASE_URL ="https://proconnect-p8eq.onrender.com/"

export const clientServer = axios.create({
baseURL: BASE_URL,
});