import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { AuthenticatedLayout } from '../components/AuthenticatedLayout'
import { visitorAPI } from '../lib/api'
import { useQuery } from '@tanstack/react-query'

export function MyVisitors() {
	const { user } = useAuth()

	// Fetch my visitors data
	const { data: myVisitors, isLoading } = useQuery({
		queryKey: ['visitors', 'my-visitors'],
		queryFn: visitorAPI.getMyVisitors,
		refetchOnWindowFocus: true, // Refetch when window gains focus
		refetchOnMount: 'always', 
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

	return (
		<AuthenticatedLayout>
			<div className="p-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground">My Visitors</h1>
					<p className="text-muted-foreground mt-2">
						View all visitors who have come to your villa/flat.
					</p>
				</div>

				{/* Visitors List */}
				<Card className="shadow-medium">
					<CardHeader>
						<CardTitle>Visitor History</CardTitle>
						<CardDescription>
							All visitors who have checked in to your villa/flat
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="text-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
								<p className="text-muted-foreground">Loading your visitors...</p>
							</div>
						) : myVisitors?.visitors?.length > 0 ? (
							<div className="space-y-6">
								{myVisitors.visitors.map((visitor) => (
									<div key={visitor._id} className="border rounded-lg p-6">
										<div className="flex items-start flex-col md:flex-row space-x-4">
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
															? 'bg-[rgb(220,252,231)] text-[rgb(22,101,52)]'
															: 'bg-[rgb(254,226,226)] text-[rgb(153,27,27)]'
													}`}>
														{visitor.status === 'checked-in' ? 'Currently Inside' : 'Checked Out'}
													</div>
												</div>
												
												<div className="grid md:grid-cols-2 gap-4 text-sm">
													<div>
														<p className="text-muted-foreground">
															<span className="font-medium text-foreground">Phone:</span> {visitor.phoneNumber}
														</p>
														<p className="text-muted-foreground">
															<span className="font-medium text-foreground">Purpose:</span> {visitor.purpose}
														</p>
														<p className="text-muted-foreground">
															<span className="font-medium text-foreground">Registered by:</span> {visitor.registeredBy?.name || 'Unknown'}
														</p>
														<p className="text-muted-foreground">
															<span className="font-medium text-foreground">Visiting:</span> {visitor.visitingApartment}
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
								<h3 className="text-lg font-medium text-foreground mb-2">No visitors yet</h3>
								<p className="text-muted-foreground">
									When visitors check in to your apartment/flat, they will appear here.
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</AuthenticatedLayout>
	)
}
