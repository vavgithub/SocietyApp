import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from './ui/button'

export function Sidebar({ onMobileClose }) {
	const { user, logout } = useAuth()
	const navigate = useNavigate()
	const location = useLocation()
	const [isCollapsed, setIsCollapsed] = useState(false)

	const handleLogout = async () => {
		try {
			await logout()
			navigate('/login')
		} catch (error) {
			console.error('Logout failed:', error)
		}
	}

	const handleNavigation = (path) => {
		navigate(path)
		// Close mobile menu if it's open
		if (onMobileClose) {
			onMobileClose()
		}
	}

	const getNavItems = () => {
		switch (user?.role) {
			case 'admin':
				return [
					{
						label: 'Dashboard',
						icon: (
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
							</svg>
						),
						path: '/admin'
					},
					{
						label: 'Tenants',
						icon: (
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
							</svg>
						),
						path: '/admin/tenants'
					},
					{
						label: 'Guards',
						icon: (
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
							</svg>
						),
						path: '/admin/guards'
					},
					{
						label: 'Announcements',
						icon: (
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
							</svg>
						),
						path: '/admin/announcements'
					},
					{
						label: 'Amenities',
						icon: (
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
							</svg>
						),
						path: '/admin/facilities'
					},
					{
						label: 'Visitors',
						icon: (
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
							</svg>
						),
						path: '/admin/visitors'
					},
					{
						label: 'Society Settings',
						icon: (
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						),
						path: '/admin/settings'
					}
				]
			case 'tenant':
				return [
					{
						label: 'Dashboard',
						icon: (
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
							</svg>
						),
						path: '/tenant'
					},
					{
						label: 'Announcements',
						icon: (
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
							</svg>
						),
						path: '/tenant/announcements'
					},
					{
						label: 'Amenities',
						icon: (
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
							</svg>
						),
						path: '/tenant/amenities'
					},
					{
						label: 'My Visitors',
						icon: (
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
							</svg>
						),
						path: '/tenant/visitors'
					}
				]
			case 'guard':
				return [
					{
						label: 'Dashboard',
						icon: (
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
							</svg>
						),
						path: '/guard'
					},
					{
						label: 'Announcements',
						icon: (
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
							</svg>
						),
						path: '/guard/announcements'
					},
					{
						label: 'Visitor Log',
						icon: (
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
							</svg>
						),
						path: '/guard/visitors'
					}
				]
			default:
				return []
		}
	}

	const navItems = getNavItems()

	return (
		<div className={`bg-card text-card-foreground h-[calc(100vh-2rem)] rounded-xl ml-4 my-4 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
			{/* Header */}
			<div className="p-4 border-b border-border">
				<div className="flex items-center justify-between">
					{!isCollapsed && (
						<div className="flex items-center gap-2">
							<div className="h-8 w-8 relative invert">
							<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
								width="32" height="28" viewBox="0 0 300.000000 260.000000"
								preserveAspectRatio="xMidYMid meet">
								<metadata>
								Created by potrace 1.10, written by Peter Selinger 2001-2011
								</metadata>
								<g transform="translate(0.000000,260.000000) scale(0.100000,-0.100000)"
								fill="#000000" stroke="none">
								<path d="M1615 2337 c-154 -89 -347 -200 -428 -246 l-147 -85 -2 -240 -3 -241
								-112 -50 -113 -50 0 -602 0 -603 -22 -4 c-13 -3 -142 -21 -288 -41 -145 -20
								-267 -38 -269 -41 -2 -2 147 -4 332 -4 l337 0 0 620 0 620 66 30 c37 16 68 30
								70 30 2 0 4 -295 4 -655 l0 -655 195 0 195 0 0 790 c0 435 -2 790 -4 790 -2 0
								-68 -29 -146 -65 -78 -36 -144 -65 -146 -65 -2 0 -4 87 -4 193 l0 194 340 196
								c187 108 343 197 345 197 3 0 4 -104 3 -232 l-3 -232 -142 -66 c-124 -57 -142
								-68 -145 -91 -2 -15 -4 -381 -4 -815 l1 -789 193 -3 192 -2 0 857 0 858 158
								73 c86 40 160 72 165 72 4 0 7 -421 7 -935 l0 -935 287 0 c157 0 284 2 282 4
								-2 2 -103 20 -224 40 -121 20 -230 39 -242 41 l-23 5 -2 959 -3 959 -200 -93
								-200 -93 -3 284 c-1 156 -6 284 -10 284 -4 0 -133 -73 -287 -163z m205 -919
								c1 -205 1 -425 1 -488 0 -63 0 -251 0 -417 l-1 -303 -105 0 -105 0 0 743 0
								743 98 46 c53 25 100 47 105 47 4 1 7 -167 7 -371z m-480 -538 l0 -680 -105 0
								-105 0 0 636 0 635 93 44 c50 24 98 44 105 44 9 1 12 -141 12 -679z"/>
								</g>
							</svg>
							</div>
							<div className="flex flex-col">
								<span className="font-bold text-lg leading-tight">SocietySync</span>
								<span className="text-xs text-muted-foreground leading-tight">Smart Community</span>
							</div>
						</div>
					)}
					{/* Only show collapse button on desktop */}
					{/* <div className="hidden lg:block">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsCollapsed(!isCollapsed)}
							className="text-muted-foreground hover:text-foreground hover:bg-accent"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						</Button>
					</div> */}
					{/* Mobile close button */}
					<div className="lg:hidden">
						<Button
							variant="ghost"
							size="sm"
							onClick={onMobileClose}
							className="text-muted-foreground hover:text-foreground hover:bg-accent"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</Button>
					</div>
				</div>
			</div>

			{/* Navigation */}
			<nav className="flex-1 p-4 space-y-2">
				{navItems.map((item) => {
					const isActive = location.pathname === item.path
					return (
						<Button
							key={item.path}
							variant="ghost"
							onClick={() => handleNavigation(item.path)}
							className={`w-full justify-start gap-3 h-12 ${
								isActive
									? 'bg-primary text-primary-foreground hover:opacity-90'
									: 'text-muted-foreground hover:text-foreground hover:bg-accent'
							}`}
						>
							{item.icon}
							{!isCollapsed && <span>{item.label}</span>}
						</Button>
					)
				})}
			</nav>

			{/* User Profile & Logout */}
			<div className="p-4 border-t border-border space-y-2">
				{/* Profile */}
				<Button
					variant="ghost"
					onClick={() => handleNavigation(`/${user?.role}/profile`)}
					className="w-full justify-start gap-3 h-12 text-muted-foreground hover:text-foreground hover:bg-accent"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
					{!isCollapsed && <span>Profile</span>}
				</Button>

				{/* Logout */}
				<Button
					variant="ghost"
					onClick={handleLogout}
					className="w-full justify-start gap-3 h-12 text-destructive-foreground hover:text-destructive-foreground/70 hover:bg-destructive/10"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
					</svg>
					{!isCollapsed && <span>Logout</span>}
				</Button>

				{/* User Info */}
				{!isCollapsed && (
					<div className="pt-2 border-t border-border">
						<div className="text-sm text-muted-foreground">
							<div className="font-medium text-foreground">{user?.name}</div>
							<div className="text-xs capitalize">{user?.role}</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
