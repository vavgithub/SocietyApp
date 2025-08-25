import { createContext, useContext, useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authAPI } from '../lib/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const [hasCheckedAuth, setHasCheckedAuth] = useState(false)
	const queryClient = useQueryClient()

	// Query to get current user
	const { data: userData, isLoading: isUserLoading, error } = useQuery({
		queryKey: ['user'],
		queryFn: authAPI.getMe,
		retry: false,
		enabled: false, // Don't auto-fetch, we'll trigger manually
	})

	// Login mutation
	const loginMutation = useMutation({
		mutationFn: authAPI.login,
		onSuccess: (data) => {
			console.log('Login successful, user data:', data.user)
			setUser(data.user)
			queryClient.setQueryData(['user'], data.user)
		},
		onError: (error) => {
			console.error('Login failed:', error.message)
		},
	})

	// Logout mutation
	const logoutMutation = useMutation({
		mutationFn: authAPI.logout,
		onSuccess: () => {
			setUser(null)
			queryClient.setQueryData(['user'], null)
			queryClient.clear()
		},
	})

	// Register admin mutation
	const registerAdminMutation = useMutation({
		mutationFn: authAPI.registerAdmin,
		onSuccess: (data) => {
			setUser(data.user)
			queryClient.setQueryData(['user'], data.user)
		},
		onError: (error) => {
			console.error('Registration failed:', error.message)
		},
	})

	// Check authentication on mount
	useEffect(() => {
		const checkAuth = async () => {
			try {
				setIsLoading(true)
				const userData = await authAPI.getMe()
				setUser(userData.user)
				queryClient.setQueryData(['user'], userData.user)
			} catch (error) {
				// User not authenticated - clear any existing user data
				setUser(null)
				queryClient.setQueryData(['user'], null)
			} finally {
				setIsLoading(false)
				setHasCheckedAuth(true)
			}
		}

		checkAuth()
	}, [])

	const login = async (email, password) => {
		try {
			const result = await loginMutation.mutateAsync({email,password})
			return result
		} catch (error) {
			throw error
		}
	}
	
	const logout = () => logoutMutation.mutate()
	const registerAdmin = (data) => registerAdminMutation.mutate(data)
	
	const updateUser = (newUserData) => {
		setUser(newUserData)
		queryClient.setQueryData(['user'], newUserData)
	}

	const value = {
		user,
		isLoading: isLoading || isUserLoading,
		hasCheckedAuth,
		login,
		logout,
		registerAdmin,
		updateUser,
		isAuthenticated: !!user,
		loginError: loginMutation.error?.message,
		registerError: registerAdminMutation.error?.message,
		isLoggingIn: loginMutation.isPending,
		isLoggingOut: logoutMutation.isPending,
		isRegistering: registerAdminMutation.isPending,
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
