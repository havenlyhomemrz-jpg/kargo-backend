import axios from 'axios';

const DEFAULT_API_URL = 'https://kargo-backend-nmfh.onrender.com';

const readViteEnv = (key) => {
  try {
    // eslint-disable-next-line no-new-func
    return Function(
      `return typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.${key} : undefined;`
    )();
  } catch (error) {
    return undefined;
  }
};

const normalizeApiUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return DEFAULT_API_URL;
  }

  return value.replace(/\/+$/, '');
};

export const API_BASE_URL = normalizeApiUrl(
  process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || readViteEnv('VITE_API_URL')
);

axios.defaults.baseURL = API_BASE_URL;