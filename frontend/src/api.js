import axios from 'axios';

export const SERVER_ORIGIN = 'http://localhost:5000';

const API = axios.create({
    baseURL: `${SERVER_ORIGIN}/api`,
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Listing images are absolute Cloudinary URLs; older/local paths (e.g. /uploads/...)
// still resolve against the API server for backward compatibility.
export const getImageUrl = (path) => {
    if (!path) return '';
    return /^https?:\/\//i.test(path) ? path : `${SERVER_ORIGIN}${path}`;
};

export default API;
