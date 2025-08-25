import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { AuthenticatedLayout } from '../components/AuthenticatedLayout'
import { visitorAPI, guardAPI } from '../lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

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
			setFormData({
				name: '',
				phoneNumber: '',
				visitingApartment: '',
				checkInDateTime: '',
				purpose: ''
			})
			setPhotoFile(null)
			setIdCardFile(null)
		}
	})

	const checkoutMutation = useMutation({
		mutationFn: ({ id, checkOutDateTime }) => visitorAPI.checkout(id, checkOutDateTime),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['visitors'] })
		}
	})

	const handleSubmit = async (e) => {
		e.preventDefault()
		
		if (!photoFile) {
			alert('Please select a visitor photo')
			return
		}

		if (!idCardFile) {
			alert('Please select an ID card photo')
			return
		}

		const formDataToSend = new FormData()
		formDataToSend.append('name', formData.name)
		formDataToSend.append('phoneNumber', formData.phoneNumber)
		formDataToSend.append('visitingApartment', formData.visitingApartment)
		formDataToSend.append('checkInDateTime', formData.checkInDateTime)
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
							<div className="text-3xl font-bold text-[rgb(22,163,74)]">
								{statsLoading ? '...' : stats?.activeVisitors || 0}
							</div>
						</CardContent>
					</Card>

					<Card className="shadow-medium">
						<CardHeader>
							<CardTitle>Total Visitors</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-[rgb(59,130,246)]">
								{statsLoading ? '...' : stats?.totalVisitors || 0}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Add Visitor Button */}
				<div className="mb-6">
					<Button
						onClick={() => setIsAddingVisitor(true)}
						className="bg-[rgb(22,163,74)] hover:bg-[rgb(21,128,61)]"
					>
						+ Add New Visitor
					</Button>
				</div>

				{/* Add Visitor Form */}
				{isAddingVisitor && (
					<Card className="mb-8 shadow-medium">
						<CardHeader>
							<CardTitle>Add New Visitor</CardTitle>
							<CardDescription>Enter visitor details and check them in</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-4">
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
											<div className="mt-2 p-3 bg-[rgb(249,250,251)] border rounded-lg">
												<div className="animate-pulse flex space-x-4">
													<div className="flex-1 space-y-2 py-1">
														<div className="h-4 bg-[rgb(229,231,235)] rounded"></div>
													</div>
												</div>
											</div>
										) : occupiedUnits?.occupiedUnits?.length > 0 ? (
											<select
												id="visitingApartment"
												className="w-full p-2 border border-input rounded-md"
												value={formData.visitingApartment}
												onChange={(e) => setFormData({ ...formData, visitingApartment: e.target.value })}
												required
											>
												<option value="">Select an apartment/flat</option>
												{occupiedUnits.occupiedUnits.map((unit) => (
													<option key={unit.value} value={unit.value}>
														{unit.label}
													</option>
												))}
											</select>
										) : (
											<div className="mt-2 p-3 bg-[rgb(254,242,242)] border border-[rgb(254,202,202)] rounded-lg">
												<p className="text-sm text-[rgb(153,27,27)]">
													No occupied apartments/flats found. Please ensure tenants have registered first.
												</p>
											</div>
										)}
									</div>
									<div>
										<Label htmlFor="checkInDateTime">Check-in Date & Time *</Label>
										<Input
											id="checkInDateTime"
											type="datetime-local"
											value={formData.checkInDateTime}
											onChange={(e) => setFormData({ ...formData, checkInDateTime: e.target.value })}
											required
										/>
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

								<div className="flex gap-4">
									<Button
										type="submit"
										disabled={createVisitorMutation.isPending}
										className="bg-[rgb(22,163,74)] hover:bg-[rgb(21,128,61)]"
									>
										{createVisitorMutation.isPending ? 'Adding...' : 'Add Visitor'}
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsAddingVisitor(false)}
									>
										Cancel
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				)}

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
												className="text-[rgb(153,27,27)] border-[rgb(254,202,202)] hover:bg-[rgb(254,226,226)]"
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
														? 'bg-[rgb(220,252,231)] text-[rgb(22,101,52)]'
														: 'bg-[rgb(254,226,226)] text-[rgb(153,27,27)]'
												}`}>
													{visitor.status === 'checked-in' ? 'Active' : 'Checked Out'}
												</div>
												{visitor.status === 'checked-in' && (
													<Button
														onClick={() => handleCheckout(visitor._id)}
														disabled={checkoutMutation.isPending}
														variant="outline"
														size="sm"
														className="text-[rgb(153,27,27)] border-[rgb(254,202,202)] hover:bg-[rgb(254,226,226)]"
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
		</AuthenticatedLayout>
	)
}
