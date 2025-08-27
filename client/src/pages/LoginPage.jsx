import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Navbar } from '../components/Navbar'
import { showSuccessToast } from '../lib/toast'

export const getDashboardPath = (role) => {
	switch (role) {
		case 'admin':
			return '/admin'
		case 'tenant':
			return '/tenant'
		case 'guard':
			return '/guard'
		default:
			return '/'
	}
}

export function LoginPage() {
	const [formData, setFormData] = useState({
		email: '',
		password: ''
	})
	const [errors, setErrors] = useState({})
	
	const { login, isLoggingIn, user, isAuthenticated } = useAuth()
	const navigate = useNavigate()
	const location = useLocation()

	// Redirect if already authenticated
	useEffect(() => {
		if (isAuthenticated && user) {
			const returnTo =  getDashboardPath(user.role)
			navigate(returnTo, { replace: true })
		}
	}, [isAuthenticated, user, navigate, location])

	// Helper function to get dashboard path based on role

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value
		}))
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors(prev => ({
				...prev,
				[name]: ''
			}))
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
	
		
		// Basic validation
		const newErrors = {}
		if (!formData.email) newErrors.email = 'Email is required'
		if (!formData.password) newErrors.password = 'Password is required'
		
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			return
		}

		try {
			const result = await login(formData.email, formData.password)
			if(result.user){
				showSuccessToast("User Logged In successfully")
			}
			// Login successful - redirection will be handled by useEffect
		} catch (error) {
			setErrors({ submit: error.response?.data?.message || 'Login failed' })
		}
	}

	return (
		<div className="min-h-screen gradient-bg">
			<Navbar />
			
			<div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8">
				<Card className="w-full max-w-md shadow-medium">
					<CardHeader className="space-y-1 px-6 sm:px-8 pt-6 sm:pt-8">
						<CardTitle className="text-xl sm:text-2xl font-bold text-center">Welcome Back</CardTitle>
						<CardDescription className="text-center text-sm sm:text-base">
							Sign in to your SocietySync account
						</CardDescription>
					</CardHeader>
					<CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
						<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
							<div className="space-y-2">
								<Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="Enter your email"
									value={formData.email}
									onChange={handleChange}
									className={errors.email ? 'border-[rgb(239,68,68)]' : ''}
								/>
								{errors.email && (
									<p className="text-sm text-[rgb(239,68,68)]">{errors.email}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
								<Input
									id="password"
									name="password"
									type="password"
									placeholder="Enter your password"
									value={formData.password}
									onChange={handleChange}
									className={errors.password ? 'border-[rgb(239,68,68)]' : ''}
								/>
								{errors.password && (
									<p className="text-sm text-[rgb(239,68,68)]">{errors.password}</p>
								)}
							</div>

							{errors.submit && (
								<div className="p-3 bg-[rgb(254,242,242)] border border-[rgb(254,202,202)] rounded-md">
									<p className="text-sm text-[rgb(239,68,68)]">{errors.submit}</p>
								</div>
							)}

							<Button 
								type="submit" 
								variant="cta" 
								className="w-full h-11  text-base font-medium" 
								disabled={isLoggingIn}
							>
								{isLoggingIn ? (
									<div className="flex items-center space-x-2">
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
										<span>Signing in...</span>
									</div>
								) : (
									'Sign In'
								)}
							</Button>
						</form>

						<div className="mt-6 text-center">
							<p className="text-sm text-muted-foreground">
								Don't have an account?{' '}
								<a href="/register" className="text-primary hover:underline font-medium">
									Sign up here
								</a>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
