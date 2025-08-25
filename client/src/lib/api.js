import axios from 'axios'

// Create axios instance with default config
const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
	withCredentials: true,
})


// Auth API
export const authAPI = {
	requestAdminOTP: async (email) => {
		const response = await api.post('/auth/request-admin-otp', { email })
		return response.data
	},
	registerAdmin: async (data) => {
		const response = await api.post('/auth/register-admin', data)
		return response.data
	},
	login: async ({email, password}) => {
		const response = await api.post('/auth/login', { email, password })
		return response.data
	},
	logout: async () => {
		const response = await api.post('/auth/logout')
		return response.data
	},
	getMe: async () => {
		const response = await api.get('/auth/me')
		return response.data
	},
}

// Invite API
export const inviteAPI = {
	generateInvite: async (data) => {
		const response = await api.post('/invites/generate', data)
		return response.data
	},
	requestInviteOTP: async (email, token) => {
		const response = await api.post('/invites/request-invite-otp', { email, token })
		return response.data
	},
	acceptInvite: async (token, data) => {
		const response = await api.post('/invites/accept', { ...data, token })
		return response.data
	},
}

// User API
export const userAPI = {
	updateProfile: async (data) => {
		const response = await api.put('/user/profile', data)
		return response.data
	},
}

// Admin API
export const adminAPI = {
	getApartment: async () => {
		const response = await api.get('/admin/apartment')
		return response.data
	},
	updateApartment: async (data) => {
		const response = await api.put('/admin/apartment', data)
		return response.data
	},
	getAvailableUnits: async () => {
		const response = await api.get('/admin/available-units')
		return response.data
	},
	getOccupiedUnits: async () => {
		const response = await api.get('/admin/occupied-units')
		return response.data
	},
	completeEnrollment: async (data) => {
		const response = await api.post('/admin/complete-enrollment', data)
		return response.data
	},
	getUsers: async () => {
		const response = await api.get('/admin/users')
		return response.data
	},
	updateUserStatus: async (userId, isActive) => {
		const response = await api.patch(`/admin/users/${userId}/status`, { isActive })
		return response.data
	},
	// Facilities management
	getFacilities: async () => {
		const response = await api.get('/admin/facilities')
		return response.data
	},
	addFacility: async (data) => {
		const response = await api.post('/admin/facilities', data)
		return response.data
	},
	updateFacility: async (data) => {
		const response = await api.put(`/admin/facilities/${data.id}`, data)
		return response.data
	},
	toggleFacilityStatus: async (data) => {
		const response = await api.patch(`/admin/facilities/${data.id}/status`, { isActive: data.isActive })
		return response.data
	},
}

// Tenant API
export const tenantAPI = {
	getSociety: async () => {
		const response = await api.get('/tenant/society')
		return response.data
	},
}

// Guard API
export const guardAPI = {
	getSociety: async () => {
		const response = await api.get('/guard/society')
		return response.data
	},
	getOccupiedUnits: async () => {
		const response = await api.get('/guard/occupied-units')
		return response.data
	},
}

// Announcement API
export const announcementAPI = {
	getAll: async () => {
		const response = await api.get('/announcements')
		return response.data
	},
	getUpcoming: async () => {
		const response = await api.get('/announcements/upcoming')
		return response.data
	},
	getLatestUpcoming: async () => {
		const response = await api.get('/announcements/latest-upcoming')
		return response.data
	},
	create: async (data) => {
		const response = await api.post('/announcements', data)
		return response.data
	},
	update: async (id, data) => {
		const response = await api.put(`/announcements/${id}`, data)
		return response.data
	},
	delete: async (id) => {
		const response = await api.delete(`/announcements/${id}`)
		return response.data
	},
	toggleStatus: async (id, isActive) => {
		const response = await api.patch(`/announcements/${id}/status`, { isActive })
		return response.data
	},
}

// Visitor API
export const visitorAPI = {
	// Get all visitors (Admin)
	getAll: async () => {
		const response = await api.get('/visitors')
		return response.data
	},
	// Get my visitors (Tenant)
	getMyVisitors: async () => {
		const response = await api.get('/visitors/my-visitors')
		return response.data
	},
	// Get today's visitors (Guard)
	getToday: async () => {
		const response = await api.get('/visitors/today')
		return response.data
	},
	// Get active visitors
	getActive: async () => {
		const response = await api.get('/visitors/active')
		return response.data
	},
	// Add new visitor (Guard)
	create: async (formData) => {
		const response = await api.post('/visitors', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		})
		return response.data
	},
	// Check out visitor (Guard)
	checkout: async (id, checkOutDateTime) => {
		const response = await api.patch(`/visitors/${id}/checkout`, { checkOutDateTime })
		return response.data
	},
	// Get visitor statistics
	getStats: async () => {
		const response = await api.get('/visitors/stats')
		return response.data
	},
	getStats: async () => {
		const response = await api.get('/visitors/stats')
		return response.data
	},
}