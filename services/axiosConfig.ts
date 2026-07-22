import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';

// ============================================================
//  API connection config
//  Points the React Native app at the XAMPP/PHP backend
//  (C:\xampp1\htdocs\acadocsphp) which talks to the
//  `acadocs_mobile` MySQL database.
//
//  Override with an environment variable (see .env / .env.example):
//    EXPO_PUBLIC_API_URL
//
//  The correct host depends on WHERE the app is running:
//   - Web / iOS Simulator : http://localhost/acadocsphp/api.php
//   - Android Emulator    : http://10.0.2.2/acadocsphp/api.php
//                            (10.0.2.2 = the emulator's alias for the host machine)
//   - Physical device     : http://<your-LAN-IP>/acadocsphp/api.php
//                            (the device can't reach localhost/10.0.2.2; set
//                             EXPO_PUBLIC_API_URL to your machine's LAN IP)
// ============================================================
const LOCALHOST_URL = 'http://localhost/acadocsphp/api.php';
const ANDROID_EMULATOR_URL = 'http://10.0.2.2/acadocsphp/api.php';

function defaultApiUrl(): string {
  if (Platform.OS === 'android') return ANDROID_EMULATOR_URL;
  // web (browser), iOS simulator, etc. all run on the same machine as XAMPP.
  return LOCALHOST_URL;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || defaultApiUrl();

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      console.error('Network Error (is the backend running?):', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
