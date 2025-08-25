import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { AuthenticatedLayout } from '../components/AuthenticatedLayout'

export function AdminDashboard() {
	const { user } = useAuth()

	// Fetch apartment data
	const { data: apartment, isLoading: apartmentLoading } = useQuery({
		queryKey: ['apartment'],
		queryFn: adminAPI.getApartment,
	})

	// Show loading while fetching apartment data
	if (apartmentLoading) {
		return (
			<AuthenticatedLayout>
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">Loading dashboard...</p>
					</div>
				</div>
			</AuthenticatedLayout>
		)
	}

	// If no apartment data is available, show error
	if (!apartment) {
		return (
			<AuthenticatedLayout>
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<p className="text-muted-foreground">Unable to load society information</p>
					</div>
				</div>
			</AuthenticatedLayout>
		)
	}

	return (
		<AuthenticatedLayout>
			<div className="space-y-6 px-8">
				{/* Header */}
				<div className="space-y-2">
					<h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome back, {user?.name}. Here's an overview of your society.
					</p>
				</div>

				{/* Society Information */}
				<Card className="shadow-medium">
					<CardHeader>
						<CardTitle>Society Information</CardTitle>
						<CardDescription>Details about your society/villa</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
							<div className="space-y-1">
								<h3 className="font-semibold text-foreground text-sm sm:text-base">Society Name</h3>
								<p className="text-muted-foreground text-sm sm:text-base">{apartment.name}</p>
							</div>
							<div className="space-y-1">
								<h3 className="font-semibold text-foreground text-sm sm:text-base">Type</h3>
								<p className="text-muted-foreground text-sm sm:text-base capitalize">{apartment.housingType}</p>
							</div>
							<div className="space-y-1 sm:col-span-2 lg:col-span-1">
								<h3 className="font-semibold text-foreground text-sm sm:text-base">Address</h3>
								<p className="text-muted-foreground text-sm sm:text-base">{apartment.address}</p>
							</div>
							{apartment.enrollmentData && (
								<>
									<div className="space-y-1">
										<h3 className="font-semibold text-foreground text-sm sm:text-base">Total Units</h3>
										<p className="text-muted-foreground text-sm sm:text-base">{apartment.enrollmentData.totalUnits}</p>
									</div>
									<div className="space-y-1">
										<h3 className="font-semibold text-foreground text-sm sm:text-base">Contact</h3>
										<p className="text-muted-foreground text-sm sm:text-base">
											{apartment.enrollmentData.contactInfo?.phone || 'Not provided'}
										</p>
									</div>
									{apartment.enrollmentData.contactInfo?.email && (
										<div className="space-y-1 sm:col-span-2 lg:col-span-1">
											<h3 className="font-semibold text-foreground text-sm sm:text-base">Contact Email</h3>
											<p className="text-muted-foreground text-sm sm:text-base">
												{apartment.enrollmentData.contactInfo.email}
											</p>
										</div>
									)}
								</>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</AuthenticatedLayout>
	)
}
