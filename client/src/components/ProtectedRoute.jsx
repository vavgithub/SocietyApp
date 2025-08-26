import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '../lib/api'
import { Button } from './ui/button'

export function ProtectedRoute({ children, allowedRoles = [] }) {
	const { user, isAuthenticated, isLoading } = useAuth()
	const location = useLocation()

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p>Loading...</p>
				</div>
			</div>
		)
	}

	if (!isAuthenticated) {
		// Redirect to login with return URL
		return <Navigate to="/login" state={{ from: location }} replace />
	}

	// Check role-based access
	if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center space-y-4">
					<h1 className="text-2xl font-semibold text-destructive">Access Denied</h1>
					<p className="text-muted-foreground">
						You don't have permission to access this page.
					</p>
					<p className="text-sm text-muted-foreground">
						Required role: {allowedRoles.join(' or ')}
					</p>
					<p className="text-sm text-muted-foreground">
						Your role: {user.role}
					</p>
					<Button onClick={() => window.history.back()}>Go Back</Button>
				</div>
			</div>
		)
	}

	return children
}

// Component to check enrollment completion for admin routes
export function AdminEnrollmentCheck({ children }) {
	const { user , isLoading } = useAuth()
	
	// Only check enrollment for admin users
	if (user?.role !== 'admin') {
		return children
	}


	// Show loading while checking enrollment
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Checking enrollment status...</p>
				</div>
			</div>
		)
	}

	// If enrollment is not complete, redirect to complete enrollment page
	if (user.apartmentId && !user.apartmentId.isEnrollmentComplete) {
		return <Navigate to="/complete-enrollment" replace />
	}

	return children
}

// Convenience components for specific roles
export function AdminRoute({ children }) {
	return (
		<ProtectedRoute allowedRoles={['admin']}>
			<AdminEnrollmentCheck>
				{children}
			</AdminEnrollmentCheck>
		</ProtectedRoute>
	)
}

// Admin route without enrollment check (for complete-enrollment page)
export function AdminRouteWithoutEnrollmentCheck({ children }) {
	return <ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>
}

export function TenantRoute({ children }) {
	return <ProtectedRoute allowedRoles={['tenant']}>{children}</ProtectedRoute>
}

export function GuardRoute({ children }) {
	return <ProtectedRoute allowedRoles={['guard']}>{children}</ProtectedRoute>
}

export function AdminOrTenantRoute({ children }) {
	return <ProtectedRoute allowedRoles={['admin', 'tenant']}>{children}</ProtectedRoute>
}
