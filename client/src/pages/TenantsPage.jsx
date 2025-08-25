import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { AuthenticatedLayout } from '../components/AuthenticatedLayout'
import { InviteForm } from '../components/InviteForm'
import { showSuccessToast, showErrorToast } from '../lib/toast'

export function TenantsPage() {
	const { user } = useAuth()
	const queryClient = useQueryClient()

	// Fetch tenants data (users with role 'tenant')
	const { data: tenants, isLoading: tenantsLoading } = useQuery({
		queryKey: ['tenants'],
		queryFn: async () => {
			const users = await adminAPI.getUsers()
			return users.filter(user => user.role === 'tenant')
		},
	})

	// Update user status mutation
	const updateUserStatusMutation = useMutation({
		mutationFn: ({ userId, isActive }) => adminAPI.updateUserStatus(userId, isActive),
		onSuccess: () => {
			queryClient.invalidateQueries(['tenants'])
			showSuccessToast('Tenant status updated successfully!')
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.message || 'Failed to update tenant status'
			showErrorToast(errorMessage)
		}
	})

	const handleToggleUserStatus = async (userId, currentStatus) => {
		try {
			await updateUserStatusMutation.mutateAsync({ userId, isActive: !currentStatus })
		} catch (error) {
			console.error('Failed to update user status:', error)
		}
	}

	return (
		<AuthenticatedLayout>
			<div className="space-y-6 px-8">
				{/* Header */}
				<div className="space-y-2">
					<h1 className="text-2xl sm:text-3xl font-bold text-foreground">Tenant Management</h1>
					<p className="text-muted-foreground">
						Manage tenants in your society and generate invite links
					</p>
				</div>

				{/* Invite Management */}
				<div>
					<InviteForm role="tenant" />
				</div>

				{/* Tenants List */}
				<Card className="shadow-medium">
					<CardHeader>
						<CardTitle>Registered Tenants</CardTitle>
						<CardDescription>Manage existing tenants in your society</CardDescription>
					</CardHeader>
					<CardContent>
						{tenantsLoading ? (
							<div className="flex items-center justify-center py-8">
								<div className="flex items-center space-x-2">
									<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
									<span>Loading tenants...</span>
								</div>
							</div>
						) : tenants && tenants.length > 0 ? (
							<div className="space-y-4">
								{/* Desktop Table */}
								<div className="hidden lg:block overflow-x-auto">
									<table className="w-full">
										<thead>
											<tr className="border-b border-primary/10">
												<th className="text-left py-3 px-4 font-semibold">Name</th>
												<th className="text-left py-3 px-4 font-semibold">Email</th>
												<th className="text-left py-3 px-4 font-semibold">Villa/Flat</th>
												<th className="text-left py-3 px-4 font-semibold">Status</th>
												<th className="text-left py-3 px-4 font-semibold">Actions</th>
											</tr>
										</thead>
										<tbody>
											{tenants.map((tenant) => (
												<tr key={tenant._id} className="border-b border-primary/10">
													<td className="py-3 px-4">{tenant.name}</td>
													<td className="py-3 px-4">{tenant.email}</td>
													<td className="py-3 px-4">
														{tenant.apartmentNumber || tenant.flatNumber || tenant.flatName || 'Not assigned'}
													</td>
													<td className="py-3 px-4">
														<span className={`px-2 py-1 rounded-full text-xs font-medium ${
															tenant.isActive 
																? 'bg-[rgb(220,252,231)] text-[rgb(22,101,52)]'
																: 'bg-[rgb(254,226,226)] text-[rgb(153,27,27)]'
														}`}>
															{tenant.isActive ? 'Active' : 'Inactive'}
														</span>
													</td>
													<td className="py-3 px-4">
														<Button
															variant="outline"
															size="sm"
															onClick={() => handleToggleUserStatus(tenant._id, tenant.isActive)}
															className={tenant.isActive ? 'text-[rgb(153,27,27)]' : 'text-[rgb(22,101,52)]'}
														>
															{tenant.isActive ? 'Deactivate' : 'Activate'}
														</Button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								{/* Mobile Cards */}
								<div className="lg:hidden space-y-4">
									{tenants.map((tenant) => (
										<div key={tenant._id} className="border border-gray-200 rounded-lg p-4 space-y-3">
											<div className="flex items-center justify-between">
												<div>
													<h3 className="font-semibold text-sm sm:text-base">{tenant.name}</h3>
													<p className="text-sm text-muted-foreground">{tenant.email}</p>
												</div>
												<span className={`px-2 py-1 rounded-full text-xs font-medium ${
													tenant.isActive 
														? 'bg-[rgb(220,252,231)] text-[rgb(22,101,52)]'
														: 'bg-[rgb(254,226,226)] text-[rgb(153,27,27)]'
												}`}>
													{tenant.isActive ? 'Active' : 'Inactive'}
												</span>
											</div>
											<div className="text-sm">
												<span className="font-medium">Unit:</span>{' '}
												{tenant.apartmentNumber || tenant.flatNumber || tenant.flatName || 'Not assigned'}
											</div>
											<div className="flex justify-end">
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleToggleUserStatus(tenant._id, tenant.isActive)}
													className={tenant.isActive ? 'text-[rgb(153,27,27)]' : 'text-[rgb(22,101,52)]'}
												>
													{tenant.isActive ? 'Deactivate' : 'Activate'}
												</Button>
											</div>
										</div>
									))}
								</div>
							</div>
						) : (
							<div className="text-center py-8">
								<p className="text-muted-foreground">No tenants registered yet</p>
								<p className="text-sm text-muted-foreground mt-1">Generate an invite link to add tenants</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</AuthenticatedLayout>
	)
}
