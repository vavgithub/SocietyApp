import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { AuthenticatedLayout } from '../components/AuthenticatedLayout'
import { tenantAPI, announcementAPI, visitorAPI } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

export function TenantDashboard() {
	const { user } = useAuth()
	const navigate = useNavigate()
	const [society, setSociety] = useState(null)
	const [loading, setLoading] = useState(true)
	const [latestAnnouncement, setLatestAnnouncement] = useState(null)

	// Fetch my visitors data
	const { data: myVisitors, isLoading: myVisitorsLoading } = useQuery({
		queryKey: ['visitors', 'my-visitors'],
		queryFn: visitorAPI.getMyVisitors,
		refetchOnWindowFocus: true // Refetch when window gains focus
	})

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [societyResponse, announcementResponse] = await Promise.all([
					tenantAPI.getSociety(),
					announcementAPI.getLatestUpcoming()
				])
				setSociety(societyResponse.society)
				setLatestAnnouncement(announcementResponse.announcement)
			} catch (error) {
				console.error('Error fetching data:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [])

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	return (
		<AuthenticatedLayout>
			<div className="space-y-6">
				{/* Header */}
				<div className="space-y-4">
					<div className="space-y-2">
						<h1 className="text-2xl sm:text-3xl font-bold text-foreground">Tenant Dashboard</h1>
						<p className="text-muted-foreground">
							Welcome back, {user?.name}. Here's what's happening in your society.
						</p>
					</div>
					{/* Tenant's Apartment Information */}
					{(user?.apartmentNumber || user?.flatNumber || user?.flatName) && (
						<div className="p-3 sm:p-4 bg-[rgb(240,249,255)] border border-[rgb(186,230,253)] rounded-lg">
							<div className="flex items-center space-x-2">
								<span className="text-[rgb(14,116,144)] font-medium text-sm sm:text-base">🏠 Your Villa/Flat:</span>
								<span className="text-[rgb(14,116,144)] text-sm sm:text-base">
									{user.apartmentNumber || user.flatNumber || user.flatName}
								</span>
							</div>
						</div>
					)}
				</div>

				{/* Announcement Banner */}
				{latestAnnouncement && (
					<div className="p-4 sm:p-6 bg-[rgb(254,242,242)] border border-[rgb(254,202,202)] rounded-lg">
						<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
							<div className="flex-1 space-y-3">
								<div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
									<h3 className="font-semibold text-[rgb(153,27,27)] text-base sm:text-lg">📢 {latestAnnouncement.title}</h3>
									<span className="px-2 py-1 text-xs rounded-full bg-[rgb(254,226,226)] text-[rgb(153,27,27)] self-start sm:self-auto">
										Due: {formatDate(latestAnnouncement.dueDate)}
									</span>
								</div>
								<p className="text-sm text-[rgb(153,27,27)]">{latestAnnouncement.description}</p>
								<div className="text-xs text-[rgb(153,27,27)] opacity-75">
									Posted by: {latestAnnouncement.createdBy?.name || 'Unknown'} • {formatDate(latestAnnouncement.createdAt)}
								</div>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => navigate('/tenant/announcements')}
								className="text-[rgb(153,27,27)] border-[rgb(254,202,202)] hover:bg-[rgb(254,226,226)] self-start sm:self-auto"
							>
								View More
							</Button>
						</div>
					</div>
				)}

				{/* Loading State */}
				{loading && (
					<div className="flex items-center justify-center py-12">
						<div className="text-center space-y-4">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
							<p className="text-muted-foreground">Loading dashboard...</p>
						</div>
					</div>
				)}

				{/* Society Information */}
				{society && !loading && (
					<Card className="shadow-medium">
						<CardHeader>
							<CardTitle>Society Information</CardTitle>
							<CardDescription>Details about your society</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
								<div className="space-y-1">
									<h3 className="font-semibold text-foreground text-sm sm:text-base">Society Name</h3>
									<p className="text-muted-foreground text-sm sm:text-base">{society.name}</p>
								</div>
								<div className="space-y-1">
									<h3 className="font-semibold text-foreground text-sm sm:text-base">Type</h3>
									<p className="text-muted-foreground text-sm sm:text-base capitalize">{society.housingType}</p>
								</div>
								<div className="space-y-1 sm:col-span-2 lg:col-span-1">
									<h3 className="font-semibold text-foreground text-sm sm:text-base">Address</h3>
									<p className="text-muted-foreground text-sm sm:text-base">{society.address}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Recent Visitors */}
				<Card className="shadow-medium">
					<CardHeader>
						<CardTitle>Recent Visitors</CardTitle>
						<CardDescription>Your recent visitors</CardDescription>
					</CardHeader>
					<CardContent>
						{myVisitorsLoading ? (
							<div className="flex items-center justify-center py-8">
								<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
							</div>
						) : myVisitors && myVisitors.visitors && myVisitors.visitors.length > 0 ? (
							<div className="space-y-4">
								{myVisitors.visitors.slice(0, 3).map((visitor) => (
									<div key={visitor._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
										<div className="flex items-center space-x-3">
											<div className="w-10 h-10 bg-[rgb(37,99,235)] rounded-full flex items-center justify-center">
												<span className="text-white font-semibold text-sm">
													{visitor.name.charAt(0).toUpperCase()}
												</span>
											</div>
											<div>
												<p className="font-medium text-sm sm:text-base">{visitor.name}</p>
												<p className="text-xs text-muted-foreground">
													{formatDate(visitor.checkInDateTime)}
												</p>
											</div>
										</div>
										<div className="text-right">
											<p className="text-xs text-muted-foreground">Purpose</p>
											<p className="text-sm font-medium">{visitor.purpose}</p>
										</div>
									</div>
								))}
								{myVisitors.visitors.length > 3 && (
									<div className="text-center pt-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => navigate('/tenant/visitors')}
											className="text-primary"
										>
											View All Visitors
										</Button>
									</div>
								)}
							</div>
						) : (
							<div className="text-center py-8">
								<p className="text-muted-foreground">No visitors yet</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</AuthenticatedLayout>
	)
}
