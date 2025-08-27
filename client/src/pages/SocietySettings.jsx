import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { AuthenticatedLayout } from '../components/AuthenticatedLayout'
import { adminAPI } from '../lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { showSuccessToast, showErrorToast } from '../lib/toast'

export function SocietySettings() {
	const { user } = useAuth()
	const queryClient = useQueryClient()
	const [isEditing, setIsEditing] = useState(false)
	const [formData, setFormData] = useState({
		name: '',
		address: '',
		enrollmentData: {
			wings: [],
			flats: [],
			contactInfo: {
				phone: '',
				email: ''
			},
			additionalInfo: ''
		}
	})

	// Fetch apartment data
	const { data: apartment, isLoading } = useQuery({
		queryKey: ['apartment'],
		queryFn: adminAPI.getApartment
	})

	// Update apartment mutation
	const updateMutation = useMutation({
		mutationFn: adminAPI.updateApartment,
		onSuccess: () => {
			queryClient.invalidateQueries(['apartment'])
			setIsEditing(false)
			showSuccessToast('Society settings updated successfully!')
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.message || 'Failed to update society settings'
			showErrorToast(errorMessage)
		}
	})

	// Initialize form data when apartment data loads
	useEffect(() => {
		if (apartment) {
			setFormData({
				name: apartment.name || '',
				address: apartment.address || '',
				enrollmentData: {
					wings: apartment.enrollmentData?.wings || [],
					flats: apartment.enrollmentData?.flats || [],
					contactInfo: apartment.enrollmentData?.contactInfo || { phone: '', email: '' },
					additionalInfo: apartment.enrollmentData?.additionalInfo || ''
				}
			})
		}
	}, [apartment])

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value
		}))
	}

	const handleContactChange = (field, value) => {
		setFormData(prev => ({
			...prev,
			enrollmentData: {
				...prev.enrollmentData,
				contactInfo: {
					...prev.enrollmentData.contactInfo,
					[field]: value
				}
			}
		}))
	}

	const handleWingChange = (index, field, value) => {
		setFormData(prev => ({
			...prev,
			enrollmentData: {
				...prev.enrollmentData,
				wings: prev.enrollmentData.wings.map((wing, i) => 
					i === index ? { ...wing, [field]: value } : wing
				)
			}
		}))
	}

	const handleFlatChange = (index, field, value) => {
		setFormData(prev => ({
			...prev,
			enrollmentData: {
				...prev.enrollmentData,
				flats: prev.enrollmentData.flats.map((flat, i) => 
					i === index ? { ...flat, [field]: value } : flat
				)
			}
		}))
	}

	const addWing = () => {
		setFormData(prev => ({
			...prev,
			enrollmentData: {
				...prev.enrollmentData,
				wings: [...prev.enrollmentData.wings, {
					name: '',
					apartmentPrefix: '',
					apartmentsPerFloor: 1
				}]
			}
		}))
	}

	const removeWing = (index) => {
		setFormData(prev => ({
			...prev,
			enrollmentData: {
				...prev.enrollmentData,
				wings: prev.enrollmentData.wings.filter((_, i) => i !== index)
			}
		}))
	}

	const addFlat = () => {
		setFormData(prev => ({
			...prev,
			enrollmentData: {
				...prev.enrollmentData,
				flats: [...prev.enrollmentData.flats, {
					name: '',
					flatPrefix: '',
					numberOfFloors: 1,
					roomsPerFloor: 1
				}]
			}
		}))
	}

	const removeFlat = (index) => {
		setFormData(prev => ({
			...prev,
			enrollmentData: {
				...prev.enrollmentData,
				flats: prev.enrollmentData.flats.filter((_, i) => i !== index)
			}
		}))
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		updateMutation.mutate(formData)
	}

	if (isLoading) {
		return (
			<AuthenticatedLayout>
				<div className="p-8">
					<div className="text-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">Loading society information...</p>
					</div>
				</div>
			</AuthenticatedLayout>
		)
	}

	return (
		<AuthenticatedLayout>
			<div className="p-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground">Society Settings</h1>
					<p className="text-muted-foreground mt-2">
						Manage your society information and configuration.
					</p>
				</div>

				<Card className="shadow-medium">
					<CardHeader>
						<CardTitle>Society Information</CardTitle>
						<CardDescription>
							Update your society details, wings, and flat configurations
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Basic Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-foreground ">Basic Information</h3>
								
								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<Label htmlFor="name">Society Name</Label>
										<Input
											id="name"
											name="name"
											value={formData.name}
											onChange={handleChange}
											disabled={!isEditing}
										/>
									</div>
									<div>
										<Label htmlFor="address">Address</Label>
										<Input
											id="address"
											name="address"
											value={formData.address}
											onChange={handleChange}
											disabled={!isEditing}
										/>
									</div>
								</div>

								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<Label htmlFor="phone">Contact Phone</Label>
										<Input
											id="phone"
											value={formData.enrollmentData.contactInfo.phone}
											onChange={(e) => handleContactChange('phone', e.target.value)}
											disabled={!isEditing}
										/>
									</div>
									<div>
										<Label htmlFor="email">Contact Email</Label>
										<Input
											id="email"
											type="email"
											value={formData.enrollmentData.contactInfo.email}
											onChange={(e) => handleContactChange('email', e.target.value)}
											disabled={!isEditing}
										/>
									</div>
								</div>

								<div>
									<Label htmlFor="additionalInfo">Additional Information</Label>
									<Input
										id="additionalInfo"
										value={formData.enrollmentData.additionalInfo}
										onChange={(e) => setFormData(prev => ({
											...prev,
											enrollmentData: {
												...prev.enrollmentData,
												additionalInfo: e.target.value
											}
										}))}
										disabled={!isEditing}
									/>
								</div>
							</div>

							{/* Wings Configuration (for Apartments) */}
															{apartment?.housingType === 'villa' && (
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<h3 className="text-lg font-semibold text-foreground  ">Wings Configuration (Apartments are like villas - single floor)</h3>
										{isEditing && (
											<Button type="button" onClick={addWing} variant="outline" size="sm">
												+ Add Wing
											</Button>
										)}
									</div>
									
									{formData.enrollmentData.wings.map((wing, index) => (
										<div key={index} className="border rounded-lg p-4 space-y-4">
											<div className="flex items-center justify-between">
												<h4 className="font-medium">Wing {index + 1}</h4>
												{isEditing && formData.enrollmentData.wings.length > 1 && (
													<Button
														type="button"
														onClick={() => removeWing(index)}
														variant="outline"
														size="sm"
														className="text-[rgb(239,68,68)]"
													>
														Remove
													</Button>
												)}
											</div>
											
											<div className="grid md:grid-cols-2 gap-4">
												<div>
													<Label>Wing Name</Label>
													<Input
														value={wing.name}
														onChange={(e) => handleWingChange(index, 'name', e.target.value)}
														disabled={!isEditing}
														placeholder="e.g., A Wing, B Wing"
													/>
												</div>
												<div>
													<Label>Apartment Prefix</Label>
													<Input
														value={wing.apartmentPrefix}
														onChange={(e) => handleWingChange(index, 'apartmentPrefix', e.target.value)}
														disabled={!isEditing}
														placeholder="e.g., A, B"
													/>
												</div>
											</div>
											
											<div>
												<Label>Number of Apartments</Label>
												<Input
													type="number"
													min="1"
													value={wing.apartmentsPerFloor}
													onChange={(e) => handleWingChange(index, 'apartmentsPerFloor', parseInt(e.target.value))}
													disabled={!isEditing}
													placeholder="e.g., 10"
												/>
											</div>
										</div>
									))}
								</div>
							)}

							{/* Flats Configuration (for Flats) */}
							{apartment?.housingType === 'flat' && (
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<h3 className="text-lg font-semibold text-foreground">Flats Configuration</h3>
										{isEditing && (
											<Button type="button" onClick={addFlat} variant="outline" size="sm">
												+ Add Flat
											</Button>
										)}
									</div>
									
									{formData.enrollmentData.flats.map((flat, index) => (
										<div key={index} className="border border-border rounded-lg p-4 space-y-4">
											<div className="flex items-center justify-between">
												<h4 className="font-medium">Flat {index + 1}</h4>
												{isEditing && formData.enrollmentData.flats.length > 1 && (
													<Button
														type="button"
														onClick={() => removeFlat(index)}
														variant="outline"
														size="sm"
														className="text-[rgb(239,68,68)]"
													>
														Remove
													</Button>
												)}
											</div>
											
											<div className="grid md:grid-cols-2 gap-4">
												<div>
													<Label>Flat Name</Label>
													<Input
														value={flat.name}
														onChange={(e) => handleFlatChange(index, 'name', e.target.value)}
														disabled={!isEditing}
														placeholder="e.g., Building A, Block B"
													/>
												</div>
												<div>
													<Label>Flat Prefix</Label>
													<Input
														value={flat.flatPrefix}
														onChange={(e) => handleFlatChange(index, 'flatPrefix', e.target.value)}
														disabled={!isEditing}
														placeholder="e.g., A, B"
													/>
												</div>
											</div>
											
											<div className="grid md:grid-cols-2 gap-4">
												<div>
													<Label>Number of Floors</Label>
													<Input
														type="number"
														min="1"
														value={flat.numberOfFloors}
														onChange={(e) => handleFlatChange(index, 'numberOfFloors', parseInt(e.target.value))}
														disabled={!isEditing}
													/>
												</div>
												<div>
													<Label>Rooms per Floor</Label>
													<Input
														type="number"
														min="1"
														value={flat.roomsPerFloor}
														onChange={(e) => handleFlatChange(index, 'roomsPerFloor', parseInt(e.target.value))}
														disabled={!isEditing}
													/>
												</div>
											</div>
										</div>
									))}
								</div>
							)}

							{/* Action Buttons */}
							<div className="flex  gap-4 pt-4">
								{!isEditing ? (
									<Button
										type="button"
										onClick={(e) => {
											e.preventDefault()
											e.stopPropagation()
											setIsEditing(true)
										}}
										className="bg-primary hover:bg-primary/90"
									>
										Edit Society
									</Button>
								) : (
									<>
										<Button
											type="submit"
											disabled={updateMutation.isPending}
										>
											{updateMutation.isPending ? 'Saving...' : 'Save Changes'}
										</Button>
										<Button
											type="button"
											onClick={(e) => {
												e.preventDefault()
												e.stopPropagation()
												setIsEditing(false)
												// Reset form data to original values
												if (apartment) {
													setFormData({
														name: apartment.name || '',
														address: apartment.address || '',
														enrollmentData: {
															wings: apartment.enrollmentData?.wings || [],
															flats: apartment.enrollmentData?.flats || [],
															contactInfo: apartment.enrollmentData?.contactInfo || { phone: '', email: '' },
															additionalInfo: apartment.enrollmentData?.additionalInfo || ''
														}
													})
												}
											}}
											variant="outline"
										>
											Cancel
										</Button>
									</>
								)}
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</AuthenticatedLayout>
	)
}
