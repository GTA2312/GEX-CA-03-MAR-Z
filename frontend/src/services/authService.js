import API from './api';

export const loginRequest = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

export const registerRequest = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};