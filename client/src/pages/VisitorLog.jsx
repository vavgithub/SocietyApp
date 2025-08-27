import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../components/ui/modal'
import { Select } from '../components/ui/select'
import { AuthenticatedLayout } from '../components/AuthenticatedLayout'
import { visitorAPI, guardAPI } from '../lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { showSuccessToast, showErrorToast } from '../lib/toast'

export function VisitorLog() {
	const { user } = useAuth()
	const queryClient = useQueryClient()
	const [isAddingVisitor, setIsAddingVisitor] = useState(false)
	const [formData, setFormData] = useState({
		name: '',
		phoneNumber: '',
		visitingApartment: '',
		checkInDateTime: '',
		purpose: ''
	})
	const [photoFile, setPhotoFile] = useState(null)
	const [idCardFile, setIdCardFile] = useState(null)

	// Helper function to get current local datetime in the format required by datetime-local input
	const getCurrentLocalDateTime = () => {
		const now = new Date()
		// Format for datetime-local input (this represents local time to the user)
		const localDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
		return localDateTime.toISOString().slice(0, 16)
	}

	// Helper function to convert datetime-local value to UTC ISO string for server
	const convertLocalDateTimeToUTC = (localDateTimeString) => {
		if (!localDateTimeString) return ''
		// datetime-local value is in user's local timezone, convert to UTC
		const localDate = new Date(localDateTimeString)
		return localDate.toISOString()
	}

	// Initialize check-in datetime with current local time when adding a visitor
	useEffect(() => {
		if (isAddingVisitor && !formData.checkInDateTime) {
			setFormData(prev => ({
				...prev,
				checkInDateTime: getCurrentLocalDateTime()
			}))
		}
	}, [isAddingVisitor, formData.checkInDateTime])

	// Fetch visitors data
	const { data: todayVisitors, isLoading: todayLoading } = useQuery({
		queryKey: ['visitors', 'today'],
		queryFn: visitorAPI.getToday
	})

	const { data: activeVisitors, isLoading: activeLoading } = useQuery({
		queryKey: ['visitors', 'active'],
		queryFn: visitorAPI.getActive
	})

	const { data: stats, isLoading: statsLoading } = useQuery({
		queryKey: ['visitors', 'stats'],
		queryFn: visitorAPI.getStats
	})

	// Fetch occupied units for visitor form
	const { data: occupiedUnits, isLoading: unitsLoading } = useQuery({
		queryKey: ['occupied-units'],
		queryFn: guardAPI.getOccupiedUnits
	})

	// Mutations
	const createVisitorMutation = useMutation({
		mutationFn: visitorAPI.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['visitors'] })
			setIsAddingVisitor(false)
			// Reset form with current datetime
			setFormData({
				name: '',
				phoneNumber: '',
				visitingApartment: '',
				checkInDateTime: getCurrentLocalDateTime(),
				purpose: ''
			})
			setPhotoFile(null)
			setIdCardFile(null)
			showSuccessToast('Visitor added successfully!')
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.message || 'Failed to add visitor'
			showErrorToast(errorMessage)
		}
	})

	const checkoutMutation = useMutation({
		mutationFn: ({ id, checkOutDateTime }) => visitorAPI.checkout(id, checkOutDateTime),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['visitors'] })
			showSuccessToast('Visitor checked out successfully!')
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.message || 'Failed to checkout visitor'
			showErrorToast(errorMessage)
		}
	})

	const handleSubmit = async (e) => {
		e.preventDefault()
		
		if (!photoFile) {
			showErrorToast('Please select a visitor photo')
			return
		}

		if (!idCardFile) {
			showErrorToast('Please select an ID card photo')
			return
		}

		const formDataToSend = new FormData()
		formDataToSend.append('name', formData.name)
		formDataToSend.append('phoneNumber', formData.phoneNumber)
		formDataToSend.append('visitingApartment', formData.visitingApartment)
		// Convert local datetime to UTC before sending to server
		formDataToSend.append('checkInDateTime', convertLocalDateTimeToUTC(formData.checkInDateTime))
		formDataToSend.append('purpose', formData.purpose)
		formDataToSend.append('photo', photoFile)
		formDataToSend.append('idCardPhoto', idCardFile)

		createVisitorMutation.mutate(formDataToSend)
	}

	const handleCheckout = (visitorId) => {
		const checkOutDateTime = new Date().toISOString()
		checkoutMutation.mutate({ id: visitorId, checkOutDateTime })
	}

	const formatDateTime = (dateString) => {
		return new Date(dateString).toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	return (
		<AuthenticatedLayout>
			<div className="p-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground">Visitor Log</h1>
					<p className="text-muted-foreground mt-2">
						Manage visitor entries and check-ins for {user?.apartmentName || 'your society'}.
					</p>
				</div>

				{/* Statistics Cards */}
				<div className="grid md:grid-cols-3 gap-6 mb-8">
					<Card className="shadow-medium">
						<CardHeader>
							<CardTitle>Today's Visitors</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-primary">
								{statsLoading ? '...' : stats?.todayVisitors || 0}
							</div>
						</CardContent>
					</Card>

					<Card className="shadow-medium">
						<CardHeader>
							<CardTitle>Active Visitors</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-primary">
								{statsLoading ? '...' : stats?.activeVisitors || 0}
							</div>
						</CardContent>
					</Card>

					<Card className="shadow-medium">
						<CardHeader>
							<CardTitle>Total Visitors</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-primary">
								{statsLoading ? '...' : stats?.totalVisitors || 0}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Add Visitor Button */}
				<div className="mb-6">
					<Button
						onClick={() => setIsAddingVisitor(true)}
					>
						+ Add New Visitor
					</Button>
				</div>



				{/* Active Visitors */}
				<Card className="mb-8 shadow-medium">
					<CardHeader>
						<CardTitle>Currently Checked In</CardTitle>
						<CardDescription>Visitors who are currently inside the premises</CardDescription>
					</CardHeader>
					<CardContent>
						{activeLoading ? (
							<div className="text-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
								<p className="text-muted-foreground">Loading active visitors...</p>
							</div>
						) : activeVisitors?.visitors?.length > 0 ? (
							<div className="space-y-4">
								{activeVisitors.visitors.map((visitor) => (
									<div key={visitor._id} className="border rounded-lg p-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-4">
												{visitor.photo && (
													<img
														src={visitor.photo}
														alt={visitor.name}
														className="w-12 h-12 rounded-full object-cover"
													/>
												)}
												<div>
													<h4 className="font-semibold">{visitor.name}</h4>
													<p className="text-sm text-muted-foreground">
														Phone: {visitor.phoneNumber}
													</p>
													<p className="text-sm text-muted-foreground">
														Visiting: {visitor.visitingApartment}
													</p>
													<p className="text-sm text-muted-foreground">
														Purpose: {visitor.purpose}
													</p>
													<p className="text-sm text-muted-foreground">
														Check-in: {formatDateTime(visitor.checkInDateTime)}
													</p>
												</div>
											</div>
											<Button
												onClick={() => handleCheckout(visitor._id)}
												disabled={checkoutMutation.isPending}
												variant="outline"
												className="text-destructive-foreground border-destructive-foreground/60 hover:bg-destructive-foreground/10"
											>
												{checkoutMutation.isPending ? 'Checking out...' : 'Check Out'}
											</Button>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-8">
								<p className="text-muted-foreground">No active visitors</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Today's Visitors */}
				<Card className="shadow-medium">
					<CardHeader>
						<CardTitle>Today's Visitors</CardTitle>
						<CardDescription>All visitors who checked in today</CardDescription>
					</CardHeader>
					<CardContent>
						{todayLoading ? (
							<div className="text-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
								<p className="text-muted-foreground">Loading today's visitors...</p>
							</div>
						) : todayVisitors?.visitors?.length > 0 ? (
							<div className="space-y-4">
								{todayVisitors.visitors.map((visitor) => (
									<div key={visitor._id} className="border rounded-lg p-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-4">
												{visitor.photo && (
													<img
														src={visitor.photo}
														alt={visitor.name}
														className="w-12 h-12 rounded-full object-cover"
													/>
												)}
												<div>
													<h4 className="font-semibold">{visitor.name}</h4>
													<p className="text-sm text-muted-foreground">
														Phone: {visitor.phoneNumber}
													</p>
													<p className="text-sm text-muted-foreground">
														Visiting: {visitor.visitingApartment}
													</p>
													<p className="text-sm text-muted-foreground">
														Purpose: {visitor.purpose}
													</p>
													<p className="text-sm text-muted-foreground">
														Check-in: {formatDateTime(visitor.checkInDateTime)}
													</p>
													{visitor.checkOutDateTime && (
														<p className="text-sm text-muted-foreground">
															Check-out: {formatDateTime(visitor.checkOutDateTime)}
														</p>
													)}
												</div>
											</div>
											<div className="flex flex-col items-end space-y-2">
												<div className={`px-2 py-1 text-xs rounded ${
													visitor.status === 'checked-in'
														? 'bg-secondary text-secondary-foreground'
														: 'bg-destructive text-destructive-foreground'
												}`}>
													{visitor.status === 'checked-in' ? 'Active' : 'Checked Out'}
												</div>
												{visitor.status === 'checked-in' && (
													<Button
														onClick={() => handleCheckout(visitor._id)}
														disabled={checkoutMutation.isPending}
														variant="outline"
														size="sm"
														className="text-destructive-foreground border-destructive-foreground/60 hover:bg-[rgb(254,226,226)]"
													>
														Check Out
													</Button>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-8">
								<p className="text-muted-foreground">No visitors today</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Add Visitor Modal */}
			<Modal 
				isOpen={isAddingVisitor} 
				onClose={() => setIsAddingVisitor(false)}
				className="max-w-2xl"
			>
				<ModalHeader>
					<div>
						<h2 className="text-lg font-semibold text-foreground">Add New Visitor</h2>
						<p className="text-sm text-muted-foreground">Enter visitor details and check them in</p>
					</div>
				</ModalHeader>
				
				<ModalContent>
					<form id="visitor-form" onSubmit={handleSubmit} className="space-y-4">
						<div className="grid md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="name">Visitor Name *</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									required
								/>
							</div>
							<div>
								<Label htmlFor="phoneNumber">Phone Number *</Label>
								<Input
									id="phoneNumber"
									type="tel"
									value={formData.phoneNumber}
									onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
									required
								/>
							</div>
						</div>

						<div className="grid md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="photo">Visitor Photo *</Label>
								<Input
									id="photo"
									type="file"
									accept="image/*"
									onChange={(e) => setPhotoFile(e.target.files[0])}
									required
								/>
								{photoFile && (
									<p className="text-sm text-muted-foreground mt-1">
										Selected: {photoFile.name}
									</p>
								)}
							</div>
							<div>
								<Label htmlFor="idCardPhoto">ID Card Photo *</Label>
								<Input
									id="idCardPhoto"
									type="file"
									accept="image/*"
									onChange={(e) => setIdCardFile(e.target.files[0])}
									required
								/>
								{idCardFile && (
									<p className="text-sm text-muted-foreground mt-1">
										Selected: {idCardFile.name}
									</p>
								)}
							</div>
						</div>

						<div className="grid md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="visitingApartment">Visiting Villa/Flat *</Label>
								{unitsLoading ? (
									<div className="mt-2 p-3 bg-muted border rounded-lg">
										<div className="animate-pulse flex space-x-4">
											<div className="flex-1 space-y-2 py-1">
												<div className="h-4 bg-border rounded"></div>
											</div>
										</div>
									</div>
								) : occupiedUnits?.occupiedUnits?.length > 0 ? (
									<Select
										id="visitingApartment"
										options={[
											{ value: "", label: "Select an apartment/flat" },
											...occupiedUnits.occupiedUnits
										]}
										value={formData.visitingApartment}
										onChange={(value) => setFormData({ ...formData, visitingApartment: value })}
										placeholder="Select an apartment/flat"
									/>
								) : (
									<div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
										<p className="text-sm text-destructive">
											No occupied apartments/flats found. Please ensure tenants have registered first.
										</p>
									</div>
								)}
							</div>
							<div>
								<Label htmlFor="checkInDateTime">Check-in Date & Time (Local) *</Label>
								<div className="flex gap-2">
									<Input
										id="checkInDateTime"
										type="datetime-local"
										value={formData.checkInDateTime}
										onChange={(e) => setFormData({ ...formData, checkInDateTime: e.target.value })}
										className="flex-1"
										required
									/>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => setFormData({ ...formData, checkInDateTime: getCurrentLocalDateTime() })}
										className="px-3 whitespace-nowrap"
									>
										Now
									</Button>
								</div>
								<p className="text-xs text-muted-foreground mt-1">
									Enter the time in your local timezone. It will be automatically converted to UTC for storage.
								</p>
							</div>
						</div>

						<div>
							<Label htmlFor="purpose">Purpose of Visit *</Label>
							<Input
								id="purpose"
								placeholder="e.g., Meeting, Delivery, Maintenance, etc."
								value={formData.purpose}
								onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
								required
							/>
						</div>
					</form>
				</ModalContent>

				<ModalFooter>
					<Button 
						type="button" 
						variant="outline"
						onClick={() => setIsAddingVisitor(false)}
					>
						Cancel
					</Button>
					<Button 
						type="submit" 
						form="visitor-form"
						disabled={createVisitorMutation.isPending}
					>
						{createVisitorMutation.isPending ? (
							<div className="flex items-center space-x-2">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								<span>Adding...</span>
							</div>
						) : (
							'Add Visitor'
						)}
					</Button>
				</ModalFooter>
			</Modal>
		</AuthenticatedLayout>
	)
}
