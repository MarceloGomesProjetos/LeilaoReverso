const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000', // Certifique-se de que esta é a porta do seu backend
});

module.exports = api;
