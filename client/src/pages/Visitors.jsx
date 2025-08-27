import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { AuthenticatedLayout } from '../components/AuthenticatedLayout'
import { visitorAPI } from '../lib/api'
import { useQuery } from '@tanstack/react-query'

export function Visitors() {
	const { user } = useAuth()
	const [searchTerm, setSearchTerm] = useState('')
	const [statusFilter, setStatusFilter] = useState('all')

	// Fetch all visitors data
	const { data: allVisitors, isLoading } = useQuery({
		queryKey: ['visitors', 'all'],
		queryFn: visitorAPI.getAll
	})

	const formatDateTime = (dateString) => {
		return new Date(dateString).toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	// Filter visitors based on search term and status
	const filteredVisitors = allVisitors?.visitors?.filter(visitor => {
		const matchesSearch = visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			visitor.visitingApartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
			visitor.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
			visitor.phoneNumber.includes(searchTerm)
		
		const matchesStatus = statusFilter === 'all' || visitor.status === statusFilter
		
		return matchesSearch && matchesStatus
	}) || []

	return (
		<AuthenticatedLayout>
			<div className="p-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground">All Visitors</h1>
					<p className="text-muted-foreground mt-2">
						View and manage all visitors in {user?.apartmentName || 'your society'}.
					</p>
				</div>

				{/* Search and Filter */}
				<Card className="mb-8 shadow-medium">
					<CardHeader>
						<CardTitle>Search & Filter</CardTitle>
						<CardDescription>Find specific visitors or filter by status</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col md:flex-row gap-4">
							<div className="flex-1">
								<Input
									placeholder="Search by name, apartment, purpose, or phone..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>
							<div className="flex gap-2">
								<Button
									variant={statusFilter === 'all' ? 'default' : 'outline'}
									onClick={() => setStatusFilter('all')}
								>
									All
								</Button>
								<Button
									variant={statusFilter === 'checked-in' ? 'default' : 'outline'}
									onClick={() => setStatusFilter('checked-in')}
								>
									Active
								</Button>
								<Button
									variant={statusFilter === 'checked-out' ? 'default' : 'outline'}
									onClick={() => setStatusFilter('checked-out')}
									className="bg-destructive hover:bg-destructive/40 text-destructive-foreground"
								>
									Checked Out
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Visitors List */}
				<Card className="shadow-medium">
					<CardHeader>
						<CardTitle>Visitor Records</CardTitle>
						<CardDescription>
							{filteredVisitors.length} visitor{filteredVisitors.length !== 1 ? 's' : ''} found
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="text-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
								<p className="text-muted-foreground">Loading visitors...</p>
							</div>
						) : filteredVisitors.length > 0 ? (
							<div className="space-y-6">
								{filteredVisitors.map((visitor) => (
									<div key={visitor._id} className="border rounded-lg p-6">
										<div className="flex flex-col md:flex-row gap-4 md:gap-0 items-start space-x-4">
											{/* Visitor Photo */}
											{visitor.photo && (
												<div className="flex-shrink-0">
													<img
														src={visitor.photo}
														alt={visitor.name}
														className="w-16 h-16 rounded-full object-cover border-2 border-[rgb(226,232,240)]"
													/>
												</div>
											)}
											
											{/* Visitor Details */}
											<div className="flex-1 min-w-0">
												<div className="flex items-center justify-between mb-2">
													<h3 className="text-lg font-semibold text-foreground">
														{visitor.name}
													</h3>
													<div className={`px-3 py-1 text-sm rounded-full ${
														visitor.status === 'checked-in'
															? 'bg-secondary text-secondary-foreground'
															: 'bg-destructive text-destructive-foreground'
													}`}>
														{visitor.status === 'checked-in' ? 'Currently Inside' : 'Checked Out'}
													</div>
												</div>
												
												<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
													<div>
														<p className="text-muted-foreground">
															<span className="font-medium text-foreground">Phone:</span> {visitor.phoneNumber}
														</p>
														<p className="text-muted-foreground">
															<span className="font-medium text-foreground">Visiting:</span> {visitor.visitingApartment}
														</p>
														<p className="text-muted-foreground">
															<span className="font-medium text-foreground">Purpose:</span> {visitor.purpose}
														</p>
													</div>
													<div>
														<p className="text-muted-foreground">
															<span className="font-medium text-foreground">Check-in:</span> {formatDateTime(visitor.checkInDateTime)}
														</p>
														{visitor.checkOutDateTime && (
															<p className="text-muted-foreground">
																<span className="font-medium text-foreground">Check-out:</span> {formatDateTime(visitor.checkOutDateTime)}
															</p>
														)}
														<p className="text-muted-foreground">
															<span className="font-medium text-foreground">Date:</span> {new Date(visitor.checkInDateTime).toLocaleDateString()}
														</p>
													</div>
													<div>
														<p className="text-muted-foreground">
															<span className="font-medium text-foreground">Registered by:</span> {visitor.registeredBy?.name || 'Unknown'}
														</p>
														<p className="text-muted-foreground">
															<span className="font-medium text-foreground">Duration:</span> {
																visitor.checkOutDateTime 
																	? `${Math.round((new Date(visitor.checkOutDateTime) - new Date(visitor.checkInDateTime)) / (1000 * 60))} minutes`
																	: 'Still inside'
															}
														</p>
													</div>
												</div>

												{/* ID Card Photo */}
												{visitor.idCardPhoto && (
													<div className="mt-4">
														<p className="text-sm font-medium text-foreground mb-2">ID Card:</p>
														<img
															src={visitor.idCardPhoto}
															alt="ID Card"
															className="w-32 h-20 object-cover rounded border"
														/>
													</div>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-12">
								<div className="w-16 h-16 mx-auto mb-4 bg-[rgb(249,250,251)] rounded-full flex items-center justify-center">
									<svg className="w-8 h-8 text-[rgb(156,163,175)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
									</svg>
								</div>
								<h3 className="text-lg font-medium text-foreground mb-2">
									{searchTerm || statusFilter !== 'all' ? 'No matching visitors' : 'No visitors yet'}
								</h3>
								<p className="text-muted-foreground">
									{searchTerm || statusFilter !== 'all' 
										? 'Try adjusting your search or filter criteria.'
										: 'When visitors check in, they will appear here.'
									}
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</AuthenticatedLayout>
	)
}
