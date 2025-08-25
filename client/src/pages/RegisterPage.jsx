import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { inviteAPI } from '../lib/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Navbar } from '../components/Navbar'

export function RegisterPage() {
	const [searchParams] = useSearchParams()
	const token = searchParams.get('token')
	
	const [step, setStep] = useState(1) // 1: Form, 2: OTP Request, 3: OTP Verification
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
		otp: ''
	})
	const [errors, setErrors] = useState({})
	const [isRequestingOTP, setIsRequestingOTP] = useState(false)

	const registerMutation = useMutation({
		mutationFn: (data) => inviteAPI.acceptInvite(token, data),
		onSuccess: () => {
			// Redirect to login after successful registration
			window.location.href = '/login?message=Registration successful! Please sign in.'
		},
		onError: (error) => {
			setErrors({ submit: error.response?.data?.message || 'Registration failed' })
		}
	})

	useEffect(() => {
		if (!token) {
			setErrors({ submit: 'Invalid or missing invite token. Please contact your administrator.' })
		}
	}, [token])

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
		
		if (step === 1) {
			// Step 1: Form validation
			const newErrors = {}
			if (!formData.name.trim()) newErrors.name = 'Name is required'
			if (!formData.email) newErrors.email = 'Email is required'
			if (!formData.password) newErrors.password = 'Password is required'
			if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
			if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required'
			if (formData.password !== formData.confirmPassword) {
				newErrors.confirmPassword = 'Passwords do not match'
			}
			
			if (Object.keys(newErrors).length > 0) {
				setErrors(newErrors)
				return
			}

			if (!token) {
				setErrors({ submit: 'Invalid or missing invite token' })
				return
			}

			// Request OTP
			try {
				setIsRequestingOTP(true)
				setErrors({})
				await inviteAPI.requestInviteOTP(formData.email, token)
				setStep(2)
			} catch (error) {
				setErrors({ submit: error.response?.data?.message || 'Failed to send OTP' })
			} finally {
				setIsRequestingOTP(false)
			}
		} else if (step === 2) {
			// Step 2: OTP verification
			if (!formData.otp || formData.otp.length !== 6) {
				setErrors({ otp: 'Please enter a valid 6-digit OTP' })
				return
			}

			if (!token) {
				setErrors({ submit: 'Invalid or missing invite token' })
				return
			}

			registerMutation.mutate({
				name: formData.name.trim(),
				email: formData.email,
				password: formData.password,
				confirmPassword: formData.confirmPassword,
				otp: formData.otp
			})
		}
	}

	if (!token) {
		return (
			<div className="min-h-screen gradient-bg">
				<Navbar />
				<div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
					<Card className="w-full max-w-md shadow-medium">
						<CardHeader className="space-y-1">
							<CardTitle className="text-2xl font-bold text-center text-[rgb(239,68,68)]">Invalid Invite</CardTitle>
							<CardDescription className="text-center">
								This invite link is invalid or has expired
							</CardDescription>
						</CardHeader>
						<CardContent className="text-center">
							<p className="text-muted-foreground mb-4">
								Please contact your administrator for a new invite link.
							</p>
							<Button variant="outline" asChild>
								<a href="/">Back to Home</a>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen gradient-bg">
			<Navbar />
			
			<div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
				<Card className="w-full max-w-md shadow-medium">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl font-bold text-center">Create Your Account</CardTitle>
						<CardDescription className="text-center">
							Complete your registration with the invite link
						</CardDescription>
					</CardHeader>
										<CardContent>
						{step === 1 ? (
							<>
								<form onSubmit={handleSubmit} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="name">Full Name</Label>
										<Input
											id="name"
											name="name"
											type="text"
											placeholder="Enter your full name"
											value={formData.name}
											onChange={handleChange}
											className={errors.name ? 'border-[rgb(239,68,68)]' : ''}
										/>
										{errors.name && (
											<p className="text-sm text-[rgb(239,68,68)]">{errors.name}</p>
										)}
									</div>
									
									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
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
										<Label htmlFor="password">Password</Label>
										<Input
											id="password"
											name="password"
											type="password"
											placeholder="Create a password"
											value={formData.password}
											onChange={handleChange}
											className={errors.password ? 'border-[rgb(239,68,68)]' : ''}
										/>
										{errors.password && (
											<p className="text-sm text-[rgb(239,68,68)]">{errors.password}</p>
										)}
									</div>
									
									<div className="space-y-2">
										<Label htmlFor="confirmPassword">Confirm Password</Label>
										<Input
											id="confirmPassword"
											name="confirmPassword"
											type="password"
											placeholder="Confirm your password"
											value={formData.confirmPassword}
											onChange={handleChange}
											className={errors.confirmPassword ? 'border-[rgb(239,68,68)]' : ''}
										/>
										{errors.confirmPassword && (
											<p className="text-sm text-[rgb(239,68,68)]">{errors.confirmPassword}</p>
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
										className="w-full h-11 text-base font-medium" 
										disabled={isRequestingOTP}
									>
										{isRequestingOTP ? (
											<div className="flex items-center space-x-2">
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
												<span>Sending OTP...</span>
											</div>
										) : (
											'Continue to OTP Verification'
										)}
									</Button>
								</form>
								
								<div className="mt-6 text-center">
									<p className="text-sm text-muted-foreground">
										Already have an account?{' '}
										<a href="/login" className="text-primary hover:underline font-medium">
											Sign in here
										</a>
									</p>
								</div>
							</>
						) : (
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="text-center space-y-4">
									<div className="p-4 bg-[rgb(240,249,255)] border border-[rgb(186,230,253)] rounded-lg">
										<p className="text-[rgb(14,116,144)] font-medium">
											📧 OTP sent to {formData.email}
										</p>
										<p className="text-sm text-[rgb(14,116,144)] mt-1">
											Please check your email and enter the 6-digit verification code below.
										</p>
									</div>
									
									<div className="space-y-2">
										<Label htmlFor="otp">Verification Code</Label>
										<Input
											id="otp"
											name="otp"
											type="text"
											placeholder="Enter 6-digit OTP"
											value={formData.otp}
											onChange={handleChange}
											maxLength={6}
											className={errors.otp ? 'border-[rgb(239,68,68)]' : ''}
										/>
										{errors.otp && (
											<p className="text-sm text-[rgb(239,68,68)]">{errors.otp}</p>
										)}
									</div>
									
									{errors.submit && (
										<div className="p-3 bg-[rgb(254,242,242)] border border-[rgb(254,202,202)] rounded-md">
											<p className="text-sm text-[rgb(239,68,68)]">{errors.submit}</p>
										</div>
									)}
									
									<div className="flex gap-3">
										<Button 
											type="button" 
											variant="outline" 
											className="flex-1"
											onClick={() => setStep(1)}
										>
											Back
										</Button>
										<Button 
											type="submit" 
											variant="cta" 
											className="flex-1"
											disabled={registerMutation.isPending}
										>
											{registerMutation.isPending ? (
												<div className="flex items-center space-x-2">
													<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
													<span>Verifying...</span>
												</div>
											) : (
												'Verify & Complete Registration'
											)}
										</Button>
									</div>
								</div>
							</form>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
