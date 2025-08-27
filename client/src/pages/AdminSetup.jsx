import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Select } from '../components/ui/select'
import { Navbar } from '../components/Navbar'
import { Navigate } from 'react-router-dom'
import { authAPI } from '../lib/api'

export function AdminSetup() {
	const [step, setStep] = useState(1) // 1: Form, 2: OTP Request, 3: OTP Verification
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
		societyName: '',
		societyAddress: '',
		housingType: 'apartment',
		otp: ''
	})
	const [errors, setErrors] = useState({})
	const [isRequestingOTP, setIsRequestingOTP] = useState(false)
	const [isResendingOTP, setIsResendingOTP] = useState(false)
	
	const { registerAdmin, isRegistering , refetchUser } = useAuth()
	const [registrationSuccess, setRegistrationSuccess] = useState(false)

	// If registration was successful, redirect to complete enrollment
	if (registrationSuccess) {
		return <Navigate to="/complete-enrollment" replace />
	}

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

	const handleResendOTP = async () => {
		if (!formData.email) {
			setErrors({ submit: 'Unable to resend OTP. Please go back and try again.' })
			return
		}

		try {
			setIsResendingOTP(true)
			setErrors({})
			await authAPI.requestAdminOTP(formData.email)
			setErrors({ otp: '' }) // Clear any OTP errors
		} catch (error) {
			setErrors({ submit: error.response?.data?.message || 'Failed to resend OTP' })
		} finally {
			setIsResendingOTP(false)
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
			if (!/(?=.*[a-zA-Z])/.test(formData.password)) newErrors.password = 'Password must contain at least one letter'
			if (!/(?=.*\d)/.test(formData.password)) newErrors.password = 'Password must contain at least one number'
			if (formData.password !== formData.confirmPassword) {
				newErrors.confirmPassword = 'Passwords do not match'
			}
			if (!formData.societyName.trim()) newErrors.societyName = 'Society name is required'
			if (!formData.societyAddress.trim()) newErrors.societyAddress = 'Society address is required'
			if (!formData.housingType) newErrors.housingType = 'Housing type is required'
			
			if (Object.keys(newErrors).length > 0) {
				setErrors(newErrors)
				return
			}

			// Request OTP
			try {
				setIsRequestingOTP(true)
				setErrors({})
				await authAPI.requestAdminOTP(formData.email)
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

			try {
				setErrors({})
				const result = await registerAdmin({
					name: formData.name.trim(),
					email: formData.email,
					password: formData.password,
					societyName: formData.societyName.trim(),
					societyAddress: formData.societyAddress.trim(),
					housingType: formData.housingType,
					otp: formData.otp
				})
				// Only set success state if registration was actually successful
				if (result && result.message === 'Admin account and society created successfully') {
					setRegistrationSuccess(true)
					refetchUser()
				}
			} catch (error) {
				// Handle OTP errors specifically - stay on OTP step
				const errorMessage = error.response?.data?.message || 'Registration failed'
				
				// Check if it's an OTP-related error
				if (errorMessage.toLowerCase().includes('otp') || 
					errorMessage.toLowerCase().includes('verification') ||
					errorMessage.toLowerCase().includes('invalid') ||
					errorMessage.toLowerCase().includes('expired')) {
					setErrors({ otp: errorMessage })
				} else {
					// For other errors, show as general error
					setErrors({ submit: errorMessage })
				}
			}
		}
	}

	return (
		<div className="min-h-screen gradient-bg">
			<Navbar />
			
			<div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-8">
				<Card className="w-full max-w-2xl shadow-medium">
					<CardHeader className="space-y-1 px-6 sm:px-8 pt-6 sm:pt-8">
						<CardTitle className="text-xl sm:text-2xl font-bold text-center">Admin Registration</CardTitle>
						<CardDescription className="text-center text-sm sm:text-base">
							Create your society and admin account
						</CardDescription>
					</CardHeader>
					<CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
						{step === 1 ? (
							<>
								<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
									{/* Admin Account Section */}
									<div className="space-y-4 sm:space-y-6">
										<h3 className="text-lg sm:text-xl font-semibold text-foreground">Admin Account</h3>
										
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
											<div className="space-y-2">
												<Label htmlFor="name" className="text-sm sm:text-base">Full Name</Label>
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
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
											<div className="space-y-2">
												<Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
												<Input
													id="password"
													name="password"
													type="password"
													placeholder="Create a password (min 6 chars, letters + numbers)"
													value={formData.password}
													onChange={handleChange}
													className={errors.password ? 'border-[rgb(239,68,68)]' : ''}
												/>
												{errors.password && (
													<p className="text-sm text-[rgb(239,68,68)]">{errors.password}</p>
												)}
												<p className="text-xs text-muted-foreground">
													Password must be at least 6 characters with both letters and numbers
												</p>
											</div>

											<div className="space-y-2">
												<Label htmlFor="confirmPassword" className="text-sm sm:text-base">Confirm Password</Label>
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
										</div>
									</div>

									{/* Society Information Section */}
									<div className="space-y-4 sm:space-y-6">
										<h3 className="text-lg sm:text-xl font-semibold text-foreground">Society Information</h3>
										
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
											<div className="space-y-2">
												<Label htmlFor="societyName" className="text-sm sm:text-base">Society Name</Label>
												<Input
													id="societyName"
													name="societyName"
													type="text"
													placeholder="Enter society name"
													value={formData.societyName}
													onChange={handleChange}
													className={errors.societyName ? 'border-[rgb(239,68,68)]' : ''}
												/>
												{errors.societyName && (
													<p className="text-sm text-[rgb(239,68,68)]">{errors.societyName}</p>
												)}
											</div>

											<div className="space-y-2">
												<Label htmlFor="housingType" className="text-sm sm:text-base">Housing Type</Label>
												<Select
													id="housingType"
													options={[
														{ value: "villa", label: "Villa" },
														{ value: "flat", label: "Flat" }
													]}
													value={formData.housingType}
													onChange={(value) => {
														setFormData(prev => ({ ...prev, housingType: value }))
														if (errors.housingType) {
															setErrors(prev => ({ ...prev, housingType: '' }))
														}
													}}
													placeholder="Select housing type"
												/>
												{errors.housingType && (
													<p className="text-sm text-destructive">{errors.housingType}</p>
												)}
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="societyAddress" className="text-sm sm:text-base">Society Address</Label>
											<Input
												id="societyAddress"
												name="societyAddress"
												type="text"
												placeholder="Enter complete address"
												value={formData.societyAddress}
												onChange={handleChange}
												className={errors.societyAddress ? 'border-[rgb(239,68,68)]' : ''}
											/>
											{errors.societyAddress && (
												<p className="text-sm text-[rgb(239,68,68)]">{errors.societyAddress}</p>
											)}
										</div>
									</div>

									{errors.submit && (
										<div className="p-3 bg-[rgb(254,242,242)] border border-[rgb(254,202,202)] rounded-md">
											<p className="text-sm text-[rgb(239,68,68)]">{errors.submit}</p>
										</div>
									)}

									<Button 
										type="submit" 
										variant="cta" 
										className="w-full h-11 sm:h-12 text-base font-medium" 
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
							<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
								<div className="text-center space-y-4">
									<div className="p-4 bg-[rgb(240,249,255)] border border-[rgb(186,230,253)] rounded-lg">
										<p className="text-[rgb(14,116,144)] font-medium text-sm sm:text-base">
											📧 OTP sent to {formData.email}
										</p>
										<p className="text-sm text-[rgb(14,116,144)] mt-1">
											Please check your email and enter the 6-digit verification code below.
										</p>
									</div>
									
									<div className="space-y-2">
										<Label htmlFor="otp" className="text-sm sm:text-base">Verification Code</Label>
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
									
									<div className="flex flex-col gap-3">
										<div className="flex flex-col md:flex-row gap-3">
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
												disabled={isRegistering}
											>
												{isRegistering ? (
													<div className="flex items-center space-x-2">
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
														<span>Verifying...</span>
													</div>
												) : (
													'Verify & Complete Registration'
												)}
											</Button>
										</div>
										
										<Button 
											type="button" 
											variant="ghost" 
											className="text-sm text-muted-foreground hover:text-primary"
											onClick={handleResendOTP}
											disabled={isResendingOTP}
										>
											{isResendingOTP ? (
												<div className="flex items-center space-x-2">
													<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
													<span>Resending...</span>
												</div>
											) : (
												"Didn't receive the code? Resend OTP"
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
