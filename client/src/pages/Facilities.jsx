import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../lib/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { AuthenticatedLayout } from '../components/AuthenticatedLayout'

export function Facilities() {
	const { user } = useAuth()
	const queryClient = useQueryClient()
	
	const [isAddingFacility, setIsAddingFacility] = useState(false)
	const [editingFacility, setEditingFacility] = useState(null)
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		location: '',
		capacity: '',
		maintenanceContact: ''
	})
	const [errors, setErrors] = useState({})

	// Fetch facilities data
	const { data: facilities, isLoading } = useQuery({
		queryKey: ['facilities'],
		queryFn: adminAPI.getFacilities,
	})

	// Add facility mutation
	const addFacilityMutation = useMutation({
		mutationFn: adminAPI.addFacility,
		onSuccess: () => {
			queryClient.invalidateQueries(['facilities'])
			setIsAddingFacility(false)
			resetForm()
		},
		onError: (error) => {
			setErrors({ submit: error.response?.data?.message || 'Failed to add facility' })
		}
	})

	// Update facility mutation
	const updateFacilityMutation = useMutation({
		mutationFn: adminAPI.updateFacility,
		onSuccess: () => {
			queryClient.invalidateQueries(['facilities'])
			setEditingFacility(null)
			resetForm()
		},
		onError: (error) => {
			setErrors({ submit: error.response?.data?.message || 'Failed to update facility' })
		}
	})

	// Toggle facility status mutation
	const toggleStatusMutation = useMutation({
		mutationFn: adminAPI.toggleFacilityStatus,
		onSuccess: () => {
			queryClient.invalidateQueries(['facilities'])
		},
		onError: (error) => {
			console.error('Failed to toggle facility status:', error)
		}
	})

	const resetForm = () => {
		setFormData({
			name: '',
			description: '',
			location: '',
			capacity: '',
			maintenanceContact: ''
		})
		setErrors({})
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

	const handleSubmit = async (e) => {
		e.preventDefault()
		
		// Validation
		const newErrors = {}
		if (!formData.name.trim()) newErrors.name = 'Facility name is required'
		if (!formData.description.trim()) newErrors.description = 'Description is required'
		if (!formData.location.trim()) newErrors.location = 'Location is required'
		
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			return
		}

		if (editingFacility) {
			updateFacilityMutation.mutate({
				id: editingFacility._id,
				...formData
			})
		} else {
			addFacilityMutation.mutate(formData)
		}
	}

	const handleEdit = (facility) => {
		setEditingFacility(facility)
		setFormData({
			name: facility.name,
			description: facility.description,
			location: facility.location,
			capacity: facility.capacity || '',
			maintenanceContact: facility.maintenanceContact || ''
		})
		setIsAddingFacility(true)
	}

	const handleCancel = () => {
		setIsAddingFacility(false)
		setEditingFacility(null)
		resetForm()
	}

	const handleToggleStatus = (facilityId, currentStatus) => {
		toggleStatusMutation.mutate({ id: facilityId, isActive: !currentStatus })
	}

	if (isLoading) {
		return (
			<AuthenticatedLayout>
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">Loading facilities...</p>
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
					<h1 className="text-3xl font-bold text-foreground">Facilities Management</h1>
					<p className="text-muted-foreground mt-2">
						Manage your society's facilities and amenities
					</p>
				</div>

				<div className="grid lg:grid-cols-3 gap-8">
					{/* Facilities List */}
					<div className="lg:col-span-2">
						<Card className="shadow-medium">
							<CardHeader>
								<div className="flex flex-col md:flex-row gap-4 md:gap-0 md:items-center justify-between">
									<div>
										<CardTitle>Facilities</CardTitle>
										<CardDescription>Manage your society's facilities and their status</CardDescription>
									</div>
									<Button 
										onClick={() => setIsAddingFacility(true)}
										disabled={isAddingFacility}
									>
										+ Add Facility
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								{!facilities || facilities.length === 0 ? (
									<div className="text-center py-8">
										<p className="text-muted-foreground">No facilities added yet.</p>
										<p className="text-sm text-muted-foreground mt-2">Add your first facility to get started.</p>
									</div>
								) : (
									<div className="space-y-4">
										{facilities.map((facility) => (
											<div key={facility._id} className="p-4 border border-input rounded-lg">
												<div className="flex items-center justify-between">
													<div className="flex-1">
														<div className="flex items-center space-x-3">
															<h3 className="font-semibold text-foreground">{facility.name}</h3>
															<span className={`px-2 py-1 text-xs rounded-full ${
																facility.isActive 
																	? 'bg-[rgb(220,252,231)] text-[rgb(22,101,52)]' 
																	: 'bg-[rgb(254,226,226)] text-[rgb(153,27,27)]'
															}`}>
																{facility.isActive ? 'Active' : 'Inactive'}
															</span>
														</div>
														<p className="text-sm text-muted-foreground mt-1">{facility.description}</p>
														<div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
															<span>📍 {facility.location}</span>
															{facility.capacity && <span>👥 Capacity: {facility.capacity}</span>}
														</div>
													</div>
													<div className="flex items-center space-x-2">
														<Button
															variant="outline"
															size="sm"
															onClick={() => handleEdit(facility)}
														>
															Edit
														</Button>
														<Button
															variant={facility.isActive ? "destructive" : "default"}
															size="sm"
															onClick={() => handleToggleStatus(facility._id, facility.isActive)}
															disabled={toggleStatusMutation.isPending}
														>
															{facility.isActive ? 'Deactivate' : 'Activate'}
														</Button>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Add/Edit Facility Form */}
					{isAddingFacility && (
						<div className="lg:col-span-1">
							<Card className="shadow-medium">
								<CardHeader>
									<CardTitle>
										{editingFacility ? 'Edit Facility' : 'Add New Facility'}
									</CardTitle>
									<CardDescription>
										{editingFacility ? 'Update facility information' : 'Add a new facility to your society'}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<form onSubmit={handleSubmit} className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="name">Facility Name *</Label>
											<Input
												id="name"
												name="name"
												placeholder="e.g., Swimming Pool, Gym, Garden"
												value={formData.name}
												onChange={handleChange}
												className={errors.name ? 'border-[rgb(239,68,68)]' : ''}
											/>
											{errors.name && (
												<p className="text-sm text-[rgb(239,68,68)]">{errors.name}</p>
											)}
										</div>

										<div className="space-y-2">
											<Label htmlFor="description">Description *</Label>
											<textarea
												id="description"
												name="description"
												rows="3"
												placeholder="Describe the facility and its features..."
												value={formData.description}
												onChange={handleChange}
												className={`w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
													errors.description ? 'border-[rgb(239,68,68)]' : ''
												}`}
											/>
											{errors.description && (
												<p className="text-sm text-[rgb(239,68,68)]">{errors.description}</p>
											)}
										</div>

										<div className="space-y-2">
											<Label htmlFor="location">Location *</Label>
											<Input
												id="location"
												name="location"
												placeholder="e.g., Ground Floor, Block A"
												value={formData.location}
												onChange={handleChange}
												className={errors.location ? 'border-[rgb(239,68,68)]' : ''}
											/>
											{errors.location && (
												<p className="text-sm text-[rgb(239,68,68)]">{errors.location}</p>
											)}
										</div>

										<div className="space-y-2">
											<Label htmlFor="capacity">Capacity (Optional)</Label>
											<Input
												id="capacity"
												name="capacity"
												placeholder="e.g., 50 people, 20 vehicles"
												value={formData.capacity}
												onChange={handleChange}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="maintenanceContact">Maintenance Contact (Optional)</Label>
											<Input
												id="maintenanceContact"
												name="maintenanceContact"
												placeholder="e.g., John Doe - 9876543210"
												value={formData.maintenanceContact}
												onChange={handleChange}
											/>
										</div>

										{errors.submit && (
																			<div className="p-3 bg-[rgb(254,242,242)] border border-[rgb(254,202,202)] rounded-md">
									<p className="text-sm text-[rgb(239,68,68)]">{errors.submit}</p>
								</div>
										)}

										<div className="flex space-x-2">
											<Button 
												type="submit" 
												variant="cta" 
												className="flex-1"
												disabled={addFacilityMutation.isPending || updateFacilityMutation.isPending}
											>
												{addFacilityMutation.isPending || updateFacilityMutation.isPending ? (
													<div className="flex items-center space-x-2">
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
														<span>Saving...</span>
													</div>
												) : (
													editingFacility ? 'Update Facility' : 'Add Facility'
												)}
											</Button>
											<Button 
												type="button" 
												variant="outline"
												onClick={handleCancel}
											>
												Cancel
											</Button>
										</div>
									</form>
								</CardContent>
							</Card>
						</div>
					)}
				</div>
			</div>
		</AuthenticatedLayout>
	)
}
