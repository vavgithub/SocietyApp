import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../lib/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { AuthenticatedLayout } from '../components/AuthenticatedLayout'
import { Navigate } from 'react-router-dom'

export function CompleteEnrollment() {
	const { user } = useAuth()
	const queryClient = useQueryClient()
	
	const [formData, setFormData] = useState({
		// Common fields
		contactInfo: {
			phone: '',
			email: ''
		},
		additionalInfo: '',
		
		// Villa specific fields
		wings: [{ name: '', apartmentPrefix: '', apartmentsPerFloor: 1 }],
		
		// Flat specific fields
		flats: [{ name: '', flatPrefix: '', numberOfFloors: 1, roomsPerFloor: 1 }]
	})
	const [errors, setErrors] = useState({})

	// Fetch apartment data
	const { data: apartment, isLoading } = useQuery({
		queryKey: ['apartment'],
		queryFn: adminAPI.getApartment,
	})

	// Complete enrollment mutation
	const completeEnrollmentMutation = useMutation({
		mutationFn: adminAPI.completeEnrollment,
		onSuccess: () => {
			queryClient.invalidateQueries(['apartment'])
		},
		onError: (error) => {
			setErrors({ submit: error.response?.data?.message || 'Failed to complete enrollment' })
		}
	})

	// Redirect to admin dashboard after successful completion
	if (completeEnrollmentMutation.isSuccess) {
		return <Navigate to="/admin" replace />
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

	const handleContactChange = (field, value) => {
		setFormData(prev => ({
			...prev,
			contactInfo: {
				...prev.contactInfo,
				[field]: value
			}
		}))
		// Clear error when user starts typing
		if (errors[`contactInfo.${field}`]) {
			setErrors(prev => ({
				...prev,
				[`contactInfo.${field}`]: ''
			}))
		}
	}

	// Wing management functions (for villas)
	const handleWingChange = (index, field, value) => {
		setFormData(prev => ({
			...prev,
			wings: prev.wings.map((wing, i) => 
				i === index ? { ...wing, [field]: value } : wing
			)
		}))
		// Clear error when user starts typing
		if (errors[`wings.${index}.${field}`]) {
			setErrors(prev => ({
				...prev,
				[`wings.${index}.${field}`]: ''
			}))
		}
	}

	const addWing = () => {
		setFormData(prev => ({
			...prev,
			wings: [...prev.wings, { name: '', apartmentPrefix: '', apartmentsPerFloor: 1 }]
		}))
	}

	const removeWing = (index) => {
		setFormData(prev => ({
			...prev,
			wings: prev.wings.filter((_, i) => i !== index)
		}))
	}

	// Flat management functions (for flats)
	const handleFlatChange = (index, field, value) => {
		setFormData(prev => ({
			...prev,
			flats: prev.flats.map((flat, i) => 
				i === index ? { ...flat, [field]: value } : flat
			)
		}))
		// Clear error when user starts typing
		if (errors[`flats.${index}.${field}`]) {
			setErrors(prev => ({
				...prev,
				[`flats.${index}.${field}`]: ''
			}))
		}
	}

	const addFlat = () => {
		setFormData(prev => ({
			...prev,
			flats: [...prev.flats, { name: '', flatPrefix: '', numberOfFloors: 1, roomsPerFloor: 1 }]
		}))
	}

	const removeFlat = (index) => {
		setFormData(prev => ({
			...prev,
			flats: prev.flats.filter((_, i) => i !== index)
		}))
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		
		// Validation
		const newErrors = {}
		
		// Validate based on housing type
		if (apartment?.housingType === 'villa') {
			// Validate wings for villas
			if (formData.wings.length === 0 || formData.wings.some(w => !w.name.trim() || !w.apartmentPrefix.trim() || !w.apartmentsPerFloor)) {
				newErrors.wings = 'At least one wing with name, villa prefix, and villas per floor is required'
			}
			
			// Validate individual wing fields
			formData.wings.forEach((wing, index) => {
				if (!wing.name.trim()) {
					newErrors[`wings.${index}.name`] = 'Wing name is required'
				}
				if (!wing.apartmentPrefix.trim()) {
					newErrors[`wings.${index}.apartmentPrefix`] = 'Apartment prefix is required'
				}
				if (!wing.apartmentsPerFloor || wing.apartmentsPerFloor < 1) {
					newErrors[`wings.${index}.apartmentsPerFloor`] = 'Number of apartments per floor must be at least 1'
				}
			})
		} else if (apartment?.housingType === 'flat') {
			// Validate flats
			if (formData.flats.length === 0 || formData.flats.some(f => !f.name.trim() || !f.flatPrefix.trim() || !f.numberOfFloors || !f.roomsPerFloor)) {
				newErrors.flats = 'At least one flat with name, flat prefix, floors, and rooms per floor is required'
			}
			
			// Validate individual flat fields
			formData.flats.forEach((flat, index) => {
				if (!flat.name.trim()) {
					newErrors[`flats.${index}.name`] = 'Flat name is required'
				}
				if (!flat.flatPrefix.trim()) {
					newErrors[`flats.${index}.flatPrefix`] = 'Flat prefix is required'
				}
				if (!flat.numberOfFloors || flat.numberOfFloors < 1) {
					newErrors[`flats.${index}.numberOfFloors`] = 'Number of floors must be at least 1'
				}
				if (!flat.roomsPerFloor || flat.roomsPerFloor < 1) {
					newErrors[`flats.${index}.roomsPerFloor`] = 'Number of rooms per floor must be at least 1'
				}
			})
		}
		
		// Common validations
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			return
		}

		// Prepare data based on housing type
		const enrollmentData = {
			contactInfo: formData.contactInfo,
			additionalInfo: formData.additionalInfo
		}

		if (apartment?.housingType === 'villa') {
			enrollmentData.wings = formData.wings.filter(wing => wing.name.trim() && wing.apartmentPrefix.trim() && wing.apartmentsPerFloor)
			enrollmentData.totalUnits = formData.wings.reduce((total, wing) => total + (wing.apartmentsPerFloor || 0), 0)
		} else if (apartment?.housingType === 'flat') {
			enrollmentData.flats = formData.flats.filter(flat => flat.name.trim() && flat.flatPrefix.trim() && flat.numberOfFloors && flat.roomsPerFloor)
			enrollmentData.totalUnits = formData.flats.reduce((total, flat) => 
				total + (flat.numberOfFloors * flat.roomsPerFloor), 0)
		}

		completeEnrollmentMutation.mutate(enrollmentData)
	}

	if (isLoading) {
		return (
			<AuthenticatedLayout>
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">Loading...</p>
					</div>
				</div>
			</AuthenticatedLayout>
		)
	}

	return (
		<AuthenticatedLayout>
			<div className="flex items-center justify-center min-h-screen px-4 py-8">
				<Card className="w-full max-w-2xl shadow-medium">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl font-bold text-center">Complete Your Society Setup</CardTitle>
						<CardDescription className="text-center">
							Please provide additional information to complete your society enrollment
						</CardDescription>
					</CardHeader>
					<CardContent>
						{/* Society Info Display */}
						<div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
							<h3 className="font-semibold text-foreground mb-2">Society Information</h3>
							<div className="grid md:grid-cols-2 gap-4 text-sm">
								<div>
									<p><span className="font-medium">Name:</span> {apartment?.name}</p>
									<p><span className="font-medium">Type:</span> {apartment?.housingType?.charAt(0).toUpperCase() + apartment?.housingType?.slice(1)}</p>
								</div>
								<div>
									<p><span className="font-medium">Address:</span> {apartment?.address}</p>
								</div>
							</div>
						</div>

						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Housing Type Specific Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-foreground border-b pb-2">
									{apartment?.housingType === 'villa' ? 'Wing Information (Villas are single-floor structures)' : 'Flat Information'}
								</h3>
								
								{apartment?.housingType === 'villa' ? (
									// Apartment Wings Section
									<div className="space-y-4">
										<div className="space-y-3">
											{formData.wings.map((wing, index) => (
												<div key={index} className="p-4 border border-input rounded-lg space-y-3">
													<div className="flex items-center justify-between">
														<h4 className="font-medium">Wing {index + 1}</h4>
														{formData.wings.length > 1 && (
															<Button
																type="button"
																variant="outline"
																size="sm"
																onClick={() => removeWing(index)}
																className="text-red-600 hover:text-red-700"
															>
																Remove Wing
															</Button>
														)}
													</div>
													
													<div className="grid md:grid-cols-2 gap-4">
														<div className="space-y-2">
															<Label htmlFor={`wing-name-${index}`}>Wing Name</Label>
															<Input
																id={`wing-name-${index}`}
																placeholder="e.g., Wing A, North Wing"
																value={wing.name}
																onChange={(e) => handleWingChange(index, 'name', e.target.value)}
																className={errors[`wings.${index}.name`] ? 'border-red-500' : ''}
															/>
															{errors[`wings.${index}.name`] && (
																<p className="text-sm text-red-600">{errors[`wings.${index}.name`]}</p>
															)}
														</div>
														
														<div className="space-y-2">
															<Label htmlFor={`wing-prefix-${index}`}>Apartment Prefix</Label>
															<Input
																id={`wing-prefix-${index}`}
																placeholder="e.g., A, B"
																value={wing.apartmentPrefix}
																onChange={(e) => handleWingChange(index, 'apartmentPrefix', e.target.value)}
																className={errors[`wings.${index}.apartmentPrefix`] ? 'border-red-500' : ''}
															/>
															{errors[`wings.${index}.apartmentPrefix`] && (
																<p className="text-sm text-red-600">{errors[`wings.${index}.apartmentPrefix`]}</p>
															)}
														</div>
													</div>
													
													<div className="grid md:grid-cols-2 gap-4">
														<div className="space-y-2">
															<Label htmlFor={`wing-apartments-per-floor-${index}`}>Number of Apartments</Label>
															<Input
																id={`wing-apartments-per-floor-${index}`}
																type="number"
																min="1"
																placeholder="e.g., 10"
																value={wing.apartmentsPerFloor}
																onChange={(e) => handleWingChange(index, 'apartmentsPerFloor', parseInt(e.target.value))}
																className={errors[`wings.${index}.apartmentsPerFloor`] ? 'border-red-500' : ''}
															/>
															{errors[`wings.${index}.apartmentsPerFloor`] && (
																<p className="text-sm text-red-600">{errors[`wings.${index}.apartmentsPerFloor`]}</p>
															)}
														</div>
													</div>
												</div>
											))}
											
											<Button
												type="button"
												variant="outline"
												onClick={addWing}
												className="w-full"
											>
												+ Add Wing
											</Button>
											
											{errors.wings && (
												<p className="text-sm text-red-600">{errors.wings}</p>
											)}
										</div>
									</div>
								) : (
									// Flat Information Section
									<div className="space-y-4">
										<div className="space-y-3">
											{formData.flats.map((flat, index) => (
												<div key={index} className="p-4 border border-input rounded-lg space-y-3">
													<div className="flex items-center justify-between">
														<h4 className="font-medium">Flat {index + 1}</h4>
														{formData.flats.length > 1 && (
															<Button
																type="button"
																variant="outline"
																size="sm"
																onClick={() => removeFlat(index)}
																className="text-red-600 hover:text-red-700"
															>
																Remove Flat
															</Button>
														)}
													</div>
													
													<div className="grid md:grid-cols-2 gap-4">
														<div className="space-y-2">
															<Label htmlFor={`flat-name-${index}`}>Flat Name</Label>
															<Input
																id={`flat-name-${index}`}
																placeholder="e.g., Building A, Block B"
																value={flat.name}
																onChange={(e) => handleFlatChange(index, 'name', e.target.value)}
																className={errors[`flats.${index}.name`] ? 'border-red-500' : ''}
															/>
															{errors[`flats.${index}.name`] && (
																<p className="text-sm text-red-600">{errors[`flats.${index}.name`]}</p>
															)}
														</div>
														
														<div className="space-y-2">
															<Label htmlFor={`flat-prefix-${index}`}>Flat Prefix</Label>
															<Input
																id={`flat-prefix-${index}`}
																placeholder="e.g., A, B"
																value={flat.flatPrefix}
																onChange={(e) => handleFlatChange(index, 'flatPrefix', e.target.value)}
																className={errors[`flats.${index}.flatPrefix`] ? 'border-red-500' : ''}
															/>
															{errors[`flats.${index}.flatPrefix`] && (
																<p className="text-sm text-red-600">{errors[`flats.${index}.flatPrefix`]}</p>
															)}
														</div>
													</div>
													
													<div className="grid md:grid-cols-2 gap-4">
														<div className="space-y-2">
															<Label htmlFor={`flat-floors-${index}`}>Number of Floors</Label>
															<Input
																id={`flat-floors-${index}`}
																type="number"
																min="1"
																placeholder="e.g., 5"
																value={flat.numberOfFloors}
																onChange={(e) => handleFlatChange(index, 'numberOfFloors', parseInt(e.target.value))}
																className={errors[`flats.${index}.numberOfFloors`] ? 'border-red-500' : ''}
															/>
															{errors[`flats.${index}.numberOfFloors`] && (
																<p className="text-sm text-red-600">{errors[`flats.${index}.numberOfFloors`]}</p>
															)}
														</div>
														
														<div className="space-y-2">
															<Label htmlFor={`flat-rooms-${index}`}>Rooms per Floor</Label>
															<Input
																id={`flat-rooms-${index}`}
																type="number"
																min="1"
																placeholder="e.g., 4"
																value={flat.roomsPerFloor}
																onChange={(e) => handleFlatChange(index, 'roomsPerFloor', parseInt(e.target.value))}
																className={errors[`flats.${index}.roomsPerFloor`] ? 'border-red-500' : ''}
															/>
															{errors[`flats.${index}.roomsPerFloor`] && (
																<p className="text-sm text-red-600">{errors[`flats.${index}.roomsPerFloor`]}</p>
															)}
														</div>
													</div>
												</div>
											))}
											
											<Button
												type="button"
												variant="outline"
												onClick={addFlat}
												className="w-full"
											>
												+ Add Flat
											</Button>
											
											{errors.flats && (
												<p className="text-sm text-red-600">{errors.flats}</p>
											)}
										</div>
									</div>
								)}
							</div>

							{/* Contact Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-foreground border-b pb-2">Contact Information</h3>
								
								<div className="grid md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="phone">Phone Number</Label>
										<Input
											id="phone"
											type="tel"
											placeholder="Enter contact phone number"
											value={formData.contactInfo.phone}
											onChange={(e) => handleContactChange('phone', e.target.value)}
										/>
									</div>
									
									<div className="space-y-2">
										<Label htmlFor="contactEmail">Contact Email</Label>
										<Input
											id="contactEmail"
											type="email"
											placeholder="Enter contact email"
											value={formData.contactInfo.email}
											onChange={(e) => handleContactChange('email', e.target.value)}
										/>
									</div>
								</div>
							</div>

							{/* Additional Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-foreground border-b pb-2">Additional Information</h3>
								
								<div className="space-y-2">
									<Label htmlFor="additionalInfo">Additional Details (Optional)</Label>
									<textarea
										id="additionalInfo"
										name="additionalInfo"
										rows="4"
										placeholder="Any additional information about your society..."
										value={formData.additionalInfo}
										onChange={handleChange}
										className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
									/>
								</div>
							</div>

							{/* Summary Section */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-foreground border-b pb-2">Summary</h3>
								
								<div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
									<div className="grid md:grid-cols-2 gap-4">
										<div>
											<p className="font-medium text-foreground">Total Units:</p>
											<p className="text-2xl font-bold text-primary">
												{apartment?.housingType === 'villa' 
													? formData.wings.reduce((total, wing) => total + (wing.apartmentsPerFloor || 0), 0)
													: formData.flats.reduce((total, flat) => 
														total + (parseInt(flat.numberOfFloors || 0) * parseInt(flat.roomsPerFloor || 0)), 0)
												}
											</p>
										</div>
										<div>
											<p className="font-medium text-foreground">Housing Type:</p>
											<p className="text-lg text-muted-foreground capitalize">
												{apartment?.housingType}
											</p>
										</div>
									</div>
									
									{apartment?.housingType === 'villa' && formData.wings.length > 0 && (
										<div className="mt-4">
											<p className="font-medium text-foreground mb-2">Wings Breakdown:</p>
											<div className="space-y-1">
												{formData.wings.map((wing, index) => (
													<p key={index} className="text-sm text-muted-foreground">
														{wing.name || `Wing ${index + 1}`}: {wing.apartmentsPerFloor || 0} villas
													</p>
												))}
											</div>
										</div>
									)}
									
									{apartment?.housingType === 'flat' && formData.flats.length > 0 && (
										<div className="mt-4">
											<p className="font-medium text-foreground mb-2">Flats Breakdown:</p>
											<div className="space-y-1">
												{formData.flats.map((flat, index) => (
													<p key={index} className="text-sm text-muted-foreground">
														{flat.name || `Flat ${index + 1}`}: {flat.numberOfFloors || 0} floors × {flat.roomsPerFloor || 0} rooms = {(parseInt(flat.numberOfFloors || 0) * parseInt(flat.roomsPerFloor || 0))} units
													</p>
												))}
											</div>
										</div>
									)}
								</div>
							</div>

							{errors.submit && (
								<div className="p-3 bg-red-50 border border-red-200 rounded-md">
									<p className="text-sm text-red-600">{errors.submit}</p>
								</div>
							)}

							<Button 
								type="submit" 
								variant="cta" 
								className="w-full h-11 text-base font-medium" 
								disabled={completeEnrollmentMutation.isPending}
							>
								{completeEnrollmentMutation.isPending ? (
									<div className="flex items-center space-x-2">
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
										<span>Completing enrollment...</span>
									</div>
								) : (
									'Complete Enrollment'
								)}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</AuthenticatedLayout>
	)
}
