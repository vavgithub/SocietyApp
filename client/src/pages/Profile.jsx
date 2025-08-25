import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { AuthenticatedLayout } from '../components/AuthenticatedLayout'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userAPI } from '../lib/api'
import { showSuccessToast, showErrorToast } from '../lib/toast'

export function Profile() {
	const { user, updateUser } = useAuth()
	const queryClient = useQueryClient()
	
	const [formData, setFormData] = useState({
		name: user?.name || '',
		phoneNumber: user?.phoneNumber || ''
	})
	
	const [isEditing, setIsEditing] = useState(false)
	const [originalData] = useState({
		name: user?.name || '',
		phoneNumber: user?.phoneNumber || ''
	})

	// Update profile mutation
	const updateProfileMutation = useMutation({
		mutationFn: (data) => userAPI.updateProfile(data),
		onSuccess: (response) => {
			// Update the user context with new data
			updateUser(response.user)
			// Invalidate user-related queries
			queryClient.invalidateQueries({ queryKey: ['user'] })
			setIsEditing(false)
			showSuccessToast('Profile updated successfully!')
		},
		onError: (error) => {
			console.error('Error updating profile:', error)
			const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.'
			showErrorToast(errorMessage)
		}
	})

	const handleSubmit = (e) => {
		e.preventDefault()
		updateProfileMutation.mutate(formData)
	}

	const handleCancel = () => {
		setFormData(originalData)
		setIsEditing(false)
	}

	const handleEdit = () => {
		setIsEditing(true)
	}

	return (
		<AuthenticatedLayout>
			<div className="p-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground">Profile</h1>
					<p className="text-muted-foreground mt-2">
						Manage your personal information and account details.
					</p>
				</div>

				<div className="max-w-2xl">
					{/* Profile Information Card */}
					<Card className="shadow-medium">
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Personal Information</CardTitle>
									<CardDescription>
										Update your personal details. Email cannot be changed.
									</CardDescription>
								</div>
								{!isEditing && (
									<Button
										onClick={handleEdit}
										variant="outline"
										className="bg-[rgb(59,130,246)] text-white hover:bg-[rgb(37,99,235)] border-[rgb(59,130,246)]"
									>
										Edit Profile
									</Button>
								)}
							</div>
						</CardHeader>
						<CardContent>
							{isEditing ? (
								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="grid md:grid-cols-2 gap-4">
										<div>
											<Label htmlFor="name">Full Name *</Label>
											<Input
												id="name"
												value={formData.name}
												onChange={(e) => setFormData({ ...formData, name: e.target.value })}
												required
												placeholder="Enter your full name"
											/>
										</div>
										<div>
											<Label htmlFor="phoneNumber">Phone Number</Label>
											<Input
												id="phoneNumber"
												type="tel"
												value={formData.phoneNumber}
												onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
												placeholder="Enter your phone number"
											/>
										</div>
									</div>

									<div>
										<Label htmlFor="email">Email Address</Label>
										<Input
											id="email"
											type="email"
											value={user?.email || ''}
											disabled
											className="bg-[rgb(249,250,251)] cursor-not-allowed"
										/>
										<p className="text-sm text-muted-foreground mt-1">
											Email address cannot be changed for security reasons.
										</p>
									</div>

									{/* Role Information (Read-only) */}
									<div>
										<Label>Role</Label>
										<div className="mt-1 p-3 bg-[rgb(249,250,251)] border rounded-md">
											<span className="capitalize font-medium text-foreground">
												{user?.role || 'Unknown'}
											</span>
										</div>
									</div>

									{/* Apartment/Flat Information (Read-only for tenants) */}
									{user?.role === 'tenant' && (user?.apartmentNumber || user?.flatNumber || user?.flatName) && (
										<div>
											<Label>Assigned Unit</Label>
											<div className="mt-1 p-3 bg-[rgb(249,250,251)] border rounded-md">
												<span className="font-medium text-foreground">
													{user.apartmentNumber || user.flatNumber || user.flatName}
												</span>
											</div>
										</div>
									)}

									{/* Action Buttons */}
									<div className="flex gap-4 pt-4">
										<Button
											type="submit"
											disabled={updateProfileMutation.isPending}
											className="bg-[rgb(22,163,74)] hover:bg-[rgb(21,128,61)]"
										>
											{updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
										</Button>
										<Button
											type="button"
											variant="outline"
											onClick={handleCancel}
											disabled={updateProfileMutation.isPending}
										>
											Cancel
										</Button>
									</div>
								</form>
							) : (
								<div className="space-y-6">
									<div className="grid md:grid-cols-2 gap-4">
										<div>
											<Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
											<p className="mt-1 text-foreground">{user?.name || 'Not provided'}</p>
										</div>
										<div>
											<Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
											<p className="mt-1 text-foreground">{user?.phoneNumber || 'Not provided'}</p>
										</div>
									</div>

									<div>
										<Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
										<p className="mt-1 text-foreground">{user?.email || 'Not provided'}</p>
									</div>

									<div>
										<Label className="text-sm font-medium text-muted-foreground">Role</Label>
										<p className="mt-1 text-foreground capitalize">{user?.role || 'Unknown'}</p>
									</div>

									{/* Apartment/Flat Information (for tenants) */}
									{user?.role === 'tenant' && (user?.apartmentNumber || user?.flatNumber || user?.flatName) && (
										<div>
											<Label className="text-sm font-medium text-muted-foreground">Assigned Unit</Label>
											<p className="mt-1 text-foreground">
												{user.apartmentNumber || user.flatNumber || user.flatName}
											</p>
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Account Information Card */}
					<Card className="shadow-medium mt-6">
						<CardHeader>
							<CardTitle>Account Information</CardTitle>
							<CardDescription>
								Additional account details and settings.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div>
									<Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
									<p className="mt-1 text-foreground">
										{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
									</p>
								</div>
								
								<div>
									<Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
									<p className="mt-1 text-foreground">
										{user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Unknown'}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</AuthenticatedLayout>
	)
}
