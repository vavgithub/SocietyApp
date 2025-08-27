import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { AuthenticatedLayout } from '../components/AuthenticatedLayout'
import { guardAPI, announcementAPI, visitorAPI } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

export function GuardDashboard() {
	const { user } = useAuth()
	const navigate = useNavigate()
	const [society, setSociety] = useState(null)
	const [loading, setLoading] = useState(true)
	const [upcomingAnnouncements, setUpcomingAnnouncements] = useState([])
	const [showAllAnnouncements, setShowAllAnnouncements] = useState(false)

	// Fetch visitor statistics
	const { data: visitorStats, isLoading: visitorStatsLoading } = useQuery({
		queryKey: ['visitors', 'stats'],
		queryFn: visitorAPI.getStats
	})

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [societyResponse, announcementResponse] = await Promise.all([
					guardAPI.getSociety(),
					announcementAPI.getUpcoming()
				])
				setSociety(societyResponse.society)
				// Sort announcements by due date in ascending order
				const sortedAnnouncements = announcementResponse.announcements?.sort((a, b) => 
					new Date(a.dueDate) - new Date(b.dueDate)
				) || []
				setUpcomingAnnouncements(sortedAnnouncements)
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
				<div className="space-y-2">
					<h1 className="text-2xl sm:text-3xl font-bold text-foreground">Guard Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome back, {user?.name}. Monitor security and manage visitors.
					</p>
				</div>

				{/* Upcoming Announcements */}
				{upcomingAnnouncements.length > 0 && (
					<div className="p-4 sm:p-6 bg-card border border-destructive-foreground/60 rounded-lg">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold text-foreground text-lg">📢 Upcoming Announcements</h3>
								<Button
									variant="outline"
									size="sm"
									onClick={() => navigate('/guard/announcements')}
									className="text-destructive-foreground border-border hover:bg-accent"
								>
									View All
								</Button>
							</div>
							
							<div className="space-y-3">
								{upcomingAnnouncements.slice(0, showAllAnnouncements ? upcomingAnnouncements.length : 2).map((announcement, index) => (
									<div key={announcement._id} className="p-3 bg-background border border-border rounded-md">
										<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
											<div className="flex-1 space-y-2">
												<div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
													<h4 className="font-medium text-destructive-foreground text-sm sm:text-base">{announcement.title}</h4>
													<span className="px-2 py-1 text-xs rounded-full bg-destructive-foreground/10 text-destructive-foreground self-start sm:self-auto">
														Due: {formatDate(announcement.dueDate)}
													</span>
												</div>
												<p className="text-sm text-muted-foreground">{announcement.description}</p>
												<div className="text-xs text-muted-foreground">
													Posted by: {announcement.createdBy?.name || 'Unknown'} • {formatDate(announcement.createdAt)}
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
							
							{upcomingAnnouncements.length > 2 && (
								<div className="flex justify-center">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setShowAllAnnouncements(!showAllAnnouncements)}
										className="text-muted-foreground hover:text-foreground"
									>
										{showAllAnnouncements ? 'Show Less' : `Show ${upcomingAnnouncements.length - 2} More`}
									</Button>
								</div>
							)}
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

				{/* Dashboard Content */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
					<Card className="shadow-medium">
						<CardHeader>
							<CardTitle>Today's Visitors</CardTitle>
							<CardDescription>Visitor entries for today</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-2xl sm:text-3xl font-bold text-primary">
								{visitorStatsLoading ? '...' : visitorStats?.todayVisitors || 0}
							</div>
							<p className="text-sm text-muted-foreground mt-2">Total visitors today</p>
						</CardContent>
					</Card>

					<Card className="shadow-medium">
						<CardHeader>
							<CardTitle>Currently Inside</CardTitle>
							<CardDescription>Visitors currently in the society</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-2xl sm:text-3xl font-bold text-primary">
								{visitorStatsLoading ? '...' : visitorStats?.currentlyInside || 0}
							</div>
							<p className="text-sm text-muted-foreground mt-2">Visitors inside</p>
						</CardContent>
					</Card>

					<Card className="shadow-medium">
						<CardHeader>
							<CardTitle>This Week</CardTitle>
							<CardDescription>Total visitors this week</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-2xl sm:text-3xl font-bold text-[rgb(37,99,235)]">
								{visitorStatsLoading ? '...' : visitorStats?.weeklyVisitors || 0}
							</div>
							<p className="text-sm text-muted-foreground mt-2">Weekly total</p>
						</CardContent>
					</Card>
				</div>

				{/* Society Information */}
				{society && !loading && (
					<Card className="shadow-medium">
						<CardHeader>
							<CardTitle>Society Information</CardTitle>
							<CardDescription>Details about the society you're guarding</CardDescription>
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

				{/* Quick Actions */}
				<Card className="shadow-medium">
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
						<CardDescription>Common tasks and actions</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Button
								onClick={() => navigate('/guard/visitors')}
								className="h-16 text-left justify-start p-4"
								variant="outline"
							>
								<div className="flex items-center space-x-3">
									<svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
									</svg>
									<div>
										<div className="font-semibold">Add Visitor</div>
										<div className="text-sm text-muted-foreground">Register new visitor entry</div>
									</div>
								</div>
							</Button>

							<Button
								onClick={() => navigate('/guard/announcements')}
								className="h-16 text-left justify-start p-4"
								variant="outline"
							>
								<div className="flex items-center space-x-3">
									<svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
									</svg>
									<div>
										<div className="font-semibold">Post Announcement</div>
										<div className="text-sm text-muted-foreground">Create new announcement</div>
									</div>
								</div>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</AuthenticatedLayout>
	)
}
