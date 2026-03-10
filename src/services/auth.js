import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// For Android Emulator -> 10.0.2.2
// For Physical Device -> Use your LAN IP (e.g., 192.168.1.5)
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (username, password) => {
  try {
    const response = await api.post('/login/', { username, password });
    if (response.data.access) {
      await SecureStore.setItemAsync('token', response.data.access);
      await SecureStore.setItemAsync('refresh', response.data.refresh);
      // Store user roles/info if needed, for instance:
      await SecureStore.setItemAsync('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Login failed');
    }
    throw new Error('Network error');
  }
};

export const logout = async () => {
  await SecureStore.deleteItemAsync('token');
  await SecureStore.deleteItemAsync('refresh');
  await SecureStore.deleteItemAsync('user');
};

export const getToken = async () => {
  return await SecureStore.getItemAsync('token');
};

export const getUser = async () => {
  const user = await SecureStore.getItemAsync('user');
  return user ? JSON.parse(user) : null;
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/password-reset/', { email });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Failed to send reset link');
    }
    throw new Error('Network error');
  }
};

export const resetPasswordConfirm = async (uid, token, password) => {
  try {
    const response = await api.post('/password-reset/confirm/', { uid, token, password });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to reset password');
    }
    throw new Error('Network error');
  }
};
export const sendOTP = async (email) => {
  try {
    const response = await api.post('/password-reset/send-otp/', { email });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to send OTP');
    }
    throw new Error('Network error');
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const response = await api.post('/password-reset/verify-otp/', { email, otp });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Invalid OTP');
    }
    throw new Error('Network error');
  }
};

export const resetPasswordWithOTP = async (email, otp, password) => {
  try {
    const response = await api.post('/password-reset/reset-with-otp/', { email, otp, password });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to reset password');
    }
    throw new Error('Network error');
  }
};
