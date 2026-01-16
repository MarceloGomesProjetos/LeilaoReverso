const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5432', // Certifique-se de que esta é a porta do seu backend
});

module.exports = api;
