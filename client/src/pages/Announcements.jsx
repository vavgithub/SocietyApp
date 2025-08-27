import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { announcementAPI } from '../lib/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../components/ui/modal'
import { AuthenticatedLayout } from '../components/AuthenticatedLayout'
import { showSuccessToast, showErrorToast } from '../lib/toast'

export function Announcements() {
	const { user } = useAuth()
	const queryClient = useQueryClient()
	
	const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false)
	const [editingAnnouncement, setEditingAnnouncement] = useState(null)
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		dueDate: ''
	})
	const [errors, setErrors] = useState({})

	// Fetch announcements data
	const { data: announcementsData, isLoading } = useQuery({
		queryKey: ['announcements'],
		queryFn: announcementAPI.getAll,
	})

	// Create announcement mutation
	const createAnnouncementMutation = useMutation({
		mutationFn: announcementAPI.create,
		onSuccess: () => {
			queryClient.invalidateQueries(['announcements'])
			setIsAddingAnnouncement(false)
			resetForm()
			showSuccessToast('Announcement created successfully!')
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.message || 'Failed to create announcement'
			setErrors({ submit: errorMessage })
			showErrorToast(errorMessage)
		}
	})

	// Update announcement mutation
	const updateAnnouncementMutation = useMutation({
		mutationFn: ({ id, data }) => announcementAPI.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries(['announcements'])
			setEditingAnnouncement(null)
			resetForm()
			showSuccessToast('Announcement updated successfully!')
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.message || 'Failed to update announcement'
			setErrors({ submit: errorMessage })
			showErrorToast(errorMessage)
		}
	})

	// Delete announcement mutation
	const deleteAnnouncementMutation = useMutation({
		mutationFn: announcementAPI.delete,
		onSuccess: () => {
			queryClient.invalidateQueries(['announcements'])
			showSuccessToast('Announcement deleted successfully!')
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.message || 'Failed to delete announcement'
			console.error('Failed to delete announcement:', error)
			showErrorToast(errorMessage)
		}
	})

	// Toggle announcement status mutation
	const toggleStatusMutation = useMutation({
		mutationFn: ({ id, isActive }) => announcementAPI.toggleStatus(id, isActive),
		onSuccess: () => {
			queryClient.invalidateQueries(['announcements'])
			showSuccessToast('Announcement status updated successfully!')
		},
		onError: (error) => {
			const errorMessage = error.response?.data?.message || 'Failed to toggle announcement status'
			console.error('Failed to toggle announcement status:', error)
			showErrorToast(errorMessage)
		}
	})

	const resetForm = () => {
		setFormData({
			title: '',
			description: '',
			dueDate: ''
		})
		setErrors({})
	}

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value
		}))
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors(prev => ({
				...prev,
				[name]: ''
			}))
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		
		// Validation
		const newErrors = {}
		if (!formData.title.trim()) newErrors.title = 'Title is required'
		if (!formData.description.trim()) newErrors.description = 'Description is required'
		if (!formData.dueDate) newErrors.dueDate = 'Due date is required'
		
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			return
		}

		if (editingAnnouncement) {
			updateAnnouncementMutation.mutate({
				id: editingAnnouncement._id,
				data: formData
			})
		} else {
			createAnnouncementMutation.mutate(formData)
		}
	}

	const handleEdit = (announcement) => {
		setEditingAnnouncement(announcement)
		// Convert date to datetime-local format (YYYY-MM-DDTHH:MM)
		const dueDate = new Date(announcement.dueDate)
		const formattedDate = dueDate.toISOString().slice(0, 16)
		setFormData({
			title: announcement.title,
			description: announcement.description,
			dueDate: formattedDate
		})
		setIsAddingAnnouncement(true)
	}

	const handleCancel = () => {
		setIsAddingAnnouncement(false)
		setEditingAnnouncement(null)
		resetForm()
	}

	const handleDelete = (announcementId) => {
		if (window.confirm('Are you sure you want to delete this announcement?')) {
			deleteAnnouncementMutation.mutate(announcementId)
		}
	}

	const handleToggleStatus = (announcementId, currentStatus) => {
		toggleStatusMutation.mutate({ id: announcementId, isActive: !currentStatus })
	}

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	const isPastDue = (dueDate) => {
		return new Date(dueDate) < new Date()
	}

	const canManageAnnouncements = user?.role === 'admin' || user?.role === 'guard'

	if (isLoading) {
		return (
			<AuthenticatedLayout>
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">Loading announcements...</p>
					</div>
				</div>
			</AuthenticatedLayout>
		)
	}

	return (
		<AuthenticatedLayout>
			<div className="p-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground">Announcements</h1>
					<p className="text-muted-foreground mt-2">
						{canManageAnnouncements 
							? 'Manage and create announcements for your society'
							: 'View announcements from your society'
						}
					</p>
				</div>

				<div className="flex flex-col gap-8">
					{/* Announcements List */}
					<div className="lg:col-span-2">
						<Card className="shadow-medium">
							<CardHeader>
								<div className="flex flex-col md:flex-row gap-4 md:gap-0 md:items-center justify-between">
									<div>
										<CardTitle>Announcements</CardTitle>
										<CardDescription>
											{canManageAnnouncements 
												? 'Manage your society announcements'
												: 'View all announcements'
											}
										</CardDescription>
									</div>
									{canManageAnnouncements && (
										<Button 
											onClick={() => setIsAddingAnnouncement(true)}
											disabled={isAddingAnnouncement}
										>
											+ New Announcement
										</Button>
									)}
								</div>
							</CardHeader>
							<CardContent>
								{!announcementsData?.announcements || announcementsData.announcements.length === 0 ? (
									<div className="text-center py-8">
										<p className="text-muted-foreground">No announcements yet.</p>
										{canManageAnnouncements && (
											<p className="text-sm text-muted-foreground mt-2">Create your first announcement to get started.</p>
										)}
									</div>
								) : (
									<div className="space-y-4">
										{announcementsData.announcements.map((announcement) => (
											<div key={announcement._id} className="p-4 border border-input rounded-lg">
												<div className="flex flex-col md:flex-row gap-4 md:gap-0 items-start justify-between">
													<div className="flex-1">
														<div className="flex items-center space-x-3 mb-2">
															<h3 className="font-semibold text-foreground">{announcement.title}</h3>
															<div className={`px-2 py-1 text-xs rounded-full ${
																isPastDue(announcement.dueDate)
																	? 'bg-[rgb(254,226,226)] text-[rgb(153,27,27)]'
																	: 'bg-secondary text-secondary-foreground'
															}`}>
																{isPastDue(announcement.dueDate) ? 'Past Due' : 'Active'}
															</div>
															{!announcement.isActive && (
																<div className="px-2 py-1 text-xs rounded-full bg-[rgb(254,243,199)] text-[rgb(146,64,14)]">
																	Inactive
																</div>
															)}
														</div>
														<p className="text-sm text-muted-foreground mb-2">{announcement.description}</p>
														<div className="flex items-center space-x-4 text-xs text-muted-foreground">
															<span>📅 Due: {formatDate(announcement.dueDate)}</span>
															<span>👤 By: {announcement.createdBy?.name || 'Unknown'}</span>
															<span>📅 Created: {formatDate(announcement.createdAt)}</span>
														</div>
													</div>
													{canManageAnnouncements && (
														<div className="flex items-center space-x-2">
															<Button
																variant="outline"
																size="sm"
																onClick={() => handleEdit(announcement)}
															>
																Edit
															</Button>
															<Button
																variant={announcement.isActive ? "destructive" : "default"}
																size="sm"
																onClick={() => handleToggleStatus(announcement._id, announcement.isActive)}
																disabled={toggleStatusMutation.isPending}
															>
																{announcement.isActive ? 'Deactivate' : 'Activate'}
															</Button>
															<Button
																variant="destructive"
																size="sm"
																onClick={() => handleDelete(announcement._id)}
																disabled={deleteAnnouncementMutation.isPending}
															>
																Delete
															</Button>
														</div>
													)}
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</div>


				</div>
			</div>

			{/* Add/Edit Announcement Modal */}
			<Modal 
				isOpen={isAddingAnnouncement && canManageAnnouncements} 
				onClose={handleCancel}
				className="max-w-lg"
			>
				<ModalHeader>
					<div>
						<h2 className="text-lg font-semibold text-foreground">
							{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
						</h2>
						<p className="text-sm text-muted-foreground">
							{editingAnnouncement ? 'Update announcement information' : 'Create a new announcement for your society'}
						</p>
					</div>
				</ModalHeader>
				
				<ModalContent>
					<form id="announcement-form" onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">Title *</Label>
							<Input
								id="title"
								name="title"
								placeholder="Enter announcement title"
								value={formData.title}
								onChange={handleChange}
								className={errors.title ? 'border-destructive' : ''}
							/>
							{errors.title && (
								<p className="text-sm text-destructive">{errors.title}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description *</Label>
							<textarea
								id="description"
								name="description"
								rows="4"
								placeholder="Enter announcement details..."
								value={formData.description}
								onChange={handleChange}
								className={`w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring resize-none bg-background text-foreground ${
									errors.description ? 'border-destructive' : ''
								}`}
							/>
							{errors.description && (
								<p className="text-sm text-destructive">{errors.description}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="dueDate">Due Date *</Label>
							<Input
								id="dueDate"
								name="dueDate"
								type="datetime-local"
								value={formData.dueDate}
								onChange={handleChange}
								className={errors.dueDate ? 'border-destructive' : ''}
							/>
							{errors.dueDate && (
								<p className="text-sm text-destructive">{errors.dueDate}</p>
							)}
						</div>

						{errors.submit && (
							<div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
								<p className="text-sm text-destructive">{errors.submit}</p>
							</div>
						)}
					</form>
				</ModalContent>

				<ModalFooter>
					<Button 
						type="button" 
						variant="outline"
						onClick={handleCancel}
					>
						Cancel
					</Button>
					<Button 
						type="submit" 
						form="announcement-form"
						variant="default"
						disabled={createAnnouncementMutation.isPending || updateAnnouncementMutation.isPending}
					>
						{createAnnouncementMutation.isPending || updateAnnouncementMutation.isPending ? (
							<div className="flex items-center space-x-2">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								<span>Saving...</span>
							</div>
						) : (
							editingAnnouncement ? 'Update Announcement' : 'Create Announcement'
						)}
					</Button>
				</ModalFooter>
			</Modal>
		</AuthenticatedLayout>
	)
}
