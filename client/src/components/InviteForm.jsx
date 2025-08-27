import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Select } from './ui/select'
import { adminAPI, inviteAPI } from '../lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { showSuccessToast , showErrorToast } from '../lib/toast'

export function InviteForm({ role = 'tenant' }) {
	const queryClient = useQueryClient()
	const [formData, setFormData] = useState({
		email: '',
		role: role,
		apartmentNumber: '',
		flatNumber: '',
		flatName: ''
	})
	const [showSuccess, setShowSuccess] = useState(false)
	const [inviteLink, setInviteLink] = useState('')
	const [sentEmail, setSentEmail] = useState('')

	// Fetch available units for tenant invites
	const { data: availableUnits, isLoading: unitsLoading } = useQuery({
		queryKey: ['available-units'],
		queryFn: adminAPI.getAvailableUnits,
		enabled: role === 'tenant'
	})

	// Generate invite mutation
	const generateInviteMutation = useMutation({
		mutationFn: inviteAPI.generateInvite,
		onSuccess: (data) => {
			setInviteLink(data.inviteLink)
			setSentEmail(formData.email) // Store the email before resetting form
			showSuccessToast('Invite sent successfully to the provided email!')
			setShowSuccess(true)
			setFormData({
				email: '',
				role: role,
				apartmentNumber: '',
				flatNumber: '',
				flatName: ''
			})
		},
		onError: (error) => {
			console.log(error)
			showErrorToast(error.response?.data?.message || 'Failed to send invite')
		}
	})

	const handleSubmit = (e) => {
		e.preventDefault()
		
		const inviteData = {
			email: formData.email,
			role: formData.role
		}

		// Add apartment/flat information for tenants
		if (formData.role === 'tenant') {
			if (formData.apartmentNumber) {
				inviteData.apartmentNumber = formData.apartmentNumber
			}
			if (formData.flatNumber) {
				inviteData.flatNumber = formData.flatNumber
			}
			if (formData.flatName) {
				inviteData.flatName = formData.flatName
			}
		}

		generateInviteMutation.mutate(inviteData)
	}

	const copyToClipboard = () => {
		navigator.clipboard.writeText(inviteLink)
		showSuccessToast('Invite URL copied to clipboard!')
	}

	const getTitle = () => {
		return role === 'tenant' ? 'Send Tenant Invite' : 'Send Guard Invite'
	}

	const getDescription = () => {
		return role === 'tenant' 
			? 'Send invite emails to new tenants' 
			: 'Send invite emails to new security guards'
	}

	const getButtonText = () => {
		return role === 'tenant' ? 'Send Tenant Invite' : 'Send Guard Invite'
	}

	if (showSuccess) {
		return (
			<Card className="shadow-medium">
				<CardHeader>
					<CardTitle className="text-primary">Invite Sent Successfully!</CardTitle>
					<CardDescription>
						The invite link has been sent to the provided email address. The recipient will receive a joining link that expires in 15 minutes.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="p-3 bg-secondary border border-border rounded-lg">
						<p className="text-sm font-medium text-secondary-foreground">
							✅ Invite email sent to {sentEmail}
						</p>
					</div>
					<div className="flex flex-col md:flex-row gap-2">
						<Button
							onClick={copyToClipboard}
							variant="outline"
							className="flex-1"
						>
							Copy Link
						</Button>
						<Button
							onClick={() => setShowSuccess(false)}
							className="flex-1"
						>
							Send Another Invite
						</Button>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className="shadow-medium">
			<CardHeader>
				<CardTitle>{getTitle()}</CardTitle>
				<CardDescription>
					{getDescription()}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="email">Email Address</Label>
						<Input
							id="email"
							type="email"
							placeholder="Enter email address"
							value={formData.email}
							onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
							required
						/>
					</div>

					{/* Villa/Flat selection for tenants */}
					{role === 'tenant' && (
						<div>
							<Label>Villa/Flat Assignment</Label>
							{unitsLoading ? (
								<div className="mt-2 p-3 bg-muted border rounded-lg">
									<div className="animate-pulse flex space-x-4">
										<div className="flex-1 space-y-2 py-1">
											<div className="h-4 bg-border rounded"></div>
											<div className="h-4 bg-border rounded w-5/6"></div>
										</div>
									</div>
								</div>
							) : availableUnits?.availableUnits?.length > 0 ? (
								<div className="mt-2">
									<Select
										options={[
											{ value: "", label: "Select a villa/flat" },
											...availableUnits.availableUnits
										]}
										value={formData.apartmentNumber || formData.flatNumber || ''}
										onChange={(value) => {
											const selected = availableUnits.availableUnits.find(unit => unit.value === value)
											if (selected) {
												setFormData(prev => ({
													...prev,
													apartmentNumber: selected.value,
													flatNumber: selected.value,
													flatName: selected.flatName || ''
												}))
											}
										}}
										placeholder="Select a villa/flat"
									/>
									<p className="text-xs text-muted-foreground mt-1">
										Choose the villa or flat number for this tenant
									</p>
								</div>
							) : (
								<div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
									<p className="text-sm text-[rgb(153,27,27)]">
										No available villas/flats found. Please complete society enrollment first.
									</p>
								</div>
							)}
						</div>
					)}

					<Button
						type="submit"
						disabled={generateInviteMutation.isPending || (role === 'tenant' && !formData.apartmentNumber && !formData.flatNumber)}
						className="w-full"
					>
						{generateInviteMutation.isPending ? 'Generating...' : getButtonText()}
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
