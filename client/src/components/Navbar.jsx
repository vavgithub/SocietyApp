import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { Logo } from './Logo'

export function Navbar() {
	const { isAuthenticated, user, logout } = useAuth()

	const handleLogout = async () => {
		try {
			await logout()
		} catch (error) {
			console.error('Logout failed:', error)
		}
	}

	const getDashboardLink = () => {
		if (!user) return '/login'
		
		switch (user.role) {
			case 'admin':
				return '/admin'
			case 'tenant':
				return '/tenant'
			case 'guard':
				return '/guard'
			default:
				return '/login'
		}
	}

	const getDashboardName = () => {
		if (!user) return 'Dashboard'
		
		switch (user.role) {
			case 'admin':
				return 'Admin Dashboard'
			case 'tenant':
				return 'Tenant Dashboard'
			case 'guard':
				return 'Guard Dashboard'
			default:
				return 'Dashboard'
		}
	}

	return (
		<nav className="border-b border-border bg-foreground backdrop-blur-sm sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo - Always links to home */}
					<a href="/" className="flex items-center">
						<Logo />
					</a>

					{/* Navigation Actions */}
					<div className="flex items-center space-x-4">
						{isAuthenticated ? (
							<>
								{/* User Info */}
								<div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
									<span>Welcome,</span>
									<span className="font-medium text-foreground">{user?.name}</span>
								</div>

								{/* Dashboard Link */}
								<Button variant="outline" asChild>
									<a href={getDashboardLink()}>{getDashboardName()}</a>
								</Button>

								{/* Logout Button */}
								<Button 
									variant="outline" 
									onClick={handleLogout}
									className="text-[rgb(239,68,68)] border-[rgb(254,202,202)] hover:bg-[rgb(254,242,242)] hover:text-[rgb(185,28,28)]"
								>
									Logout
								</Button>
							</>
						) : (
							<>
								{/* Public Navigation */}
								<Button variant="outline" asChild>
									<a href="/login">Login</a>
								</Button>
								<Button variant="cta" asChild>
									<a href="/enroll">Get Started</a>
								</Button>
							</>
						)}
					</div>
				</div>
			</div>
		</nav>
	)
}
