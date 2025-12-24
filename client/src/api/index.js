import api from './axios';
import { authAPI } from './auth';

// Auth
export { authAPI };

// Traveller
export const travellerAPI = {
  getProfile: () => api.get('/traveller/profile'),
  updateProfile: (data) => api.patch('/traveller/profile', data),
  getBookings: (params) => api.get('/traveller/bookings', { params }),
  getItineraries: () => api.get('/traveller/itineraries'),
};

// Bookings
export const bookingAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getOne: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  checkAvailability: (guideId, date) => 
    api.get(`/bookings/availability/${guideId}`, { params: { date } }),
};

// Itineraries
export const itineraryAPI = {
  getAll: () => api.get('/itineraries'),
  getOne: (id) => api.get(`/itineraries/${id}`),
  create: (data) => api.post('/itineraries', data),
  update: (id, data) => api.patch(`/itineraries/${id}`, data),
  delete: (id) => api.delete(`/itineraries/${id}`),
  addAttractions: (id, attractionIds) => 
    api.post(`/itineraries/${id}/attractions`, { attractionIds }),
  removeAttractions: (id, attractionIds) => 
    api.delete(`/itineraries/${id}/attractions`, { data: { attractionIds } }),
  generateAI: (data) => api.post('/ai/generate', data),
};

// Reviews
export const reviewAPI = {
  getAll: (params) => api.get('/reviews', { params }),
  getByTarget: (targetType, targetId) => 
    api.get(`/reviews/target/${targetType}/${targetId}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.patch(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// Attractions
export const attractionAPI = {
  getAll: (params) => api.get('/attractions', { params }),
};

// Guides
export const guideAPI = {
  getAll: (params) => api.get('/guides', { params }),
  updateAvailability: (data) => api.patch('/guides/availability', data),
};

// AI
export const aiAPI = {
  chat: (message, context) => api.post('/ai/chat', { message, context }),
  travelPlanner: (data) => api.post('/ai/travel-planner', data),
  recommendations: (data) => api.post('/ai/recommendations', data),
  optimizeItinerary: (itineraryId) => 
    api.post('/ai/optimize-itinerary', { itineraryId }),
};

// Summary
export const summaryAPI = {
  getSummary: () => api.get('/summary'),
};





