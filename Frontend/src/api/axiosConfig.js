import axios from 'axios';

/*
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api', 
  withCredentials: true 
});
*/
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'; // Fallback for local dev outside Docker

console.log("Frontend API Base URL:", baseURL); // For debugging

const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true
});

export default axiosInstance;
