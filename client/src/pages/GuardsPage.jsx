import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { AuthenticatedLayout } from '../components/AuthenticatedLayout'
import { InviteForm } from '../components/InviteForm'
import { showSuccessToast, showErrorToast } from '../lib/toast'

export function GuardsPage() {
	const { user } = useAuth()
	const queryClient = useQueryClient()

	// Fetch guards data (users with role 'guard')
	const { data: guards, isLoading: guardsLoading } = useQuery({
		queryKey: ['guards'],
		queryFn: async () => {
			const users = await adminAPI.getUsers()
			return users.filter(user => user.role === 'guard')
		},
	})

	// Update user status mutation
	const updateUserStatusMutation = useMutation({
		mutationFn: ({ userId, isActive }) => adminAPI.updateUserStatus(userId, isActive),
		onSuccess: () => {
			queryClient.invalidateQueries(['guards'])
			showSuccessToast('Guard status updated successfully!')
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.message || 'Failed to update guard status'
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
			<div className="p-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground">Guard Management</h1>
					<p className="text-muted-foreground mt-2">
						Manage security guards in your society and generate invite links
					</p>
				</div>

				{/* Invite Management */}
				<div className="mb-8">
					<InviteForm role="guard" />
				</div>

				{/* Guards List */}
				<Card className="shadow-medium">
					<CardHeader>
						<CardTitle>Registered Guards</CardTitle>
						<CardDescription>Manage existing security guards in your society</CardDescription>
					</CardHeader>
					<CardContent>
						{guardsLoading ? (
							<div className="flex items-center space-x-2">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
								<span>Loading guards...</span>
							</div>
						) : guards && guards.length > 0 ? (
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b border-primary/10">
											<th className="text-left py-3 px-4 font-semibold">Name</th>
											<th className="text-left py-3 px-4 font-semibold">Email</th>
											<th className="text-left py-3 px-4 font-semibold">Status</th>
											<th className="text-left py-3 px-4 font-semibold">Actions</th>
										</tr>
									</thead>
									<tbody>
										{guards.map((guard) => (
											<tr key={guard._id} className="border-b border-primary/10">
												<td className="py-3 px-4">{guard.name}</td>
												<td className="py-3 px-4">{guard.email}</td>
												<td className="py-3 px-4">
																					<span className={`px-2 py-1 rounded-full text-xs font-medium ${
									guard.isActive 
										? 'bg-secondary text-secondary-foreground'
										: 'bg-[rgb(254,226,226)] text-[rgb(153,27,27)]'
								}`}>
									{guard.isActive ? 'Active' : 'Inactive'}
								</span>
												</td>
												<td className="py-3 px-4">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleToggleUserStatus(guard._id, guard.isActive)}
														disabled={updateUserStatusMutation.isPending}
													>
														{guard.isActive ? 'Deactivate' : 'Activate'}
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<div className="text-center py-8">
								<p className="text-muted-foreground">No guards registered yet.</p>
								<p className="text-sm text-muted-foreground mt-2">Generate an invite link to add your first security guard.</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</AuthenticatedLayout>
	)
}
