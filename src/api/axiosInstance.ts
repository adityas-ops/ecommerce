import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://dummyjson.com/',
  timeout: 10000,
});

export default axiosInstance;
