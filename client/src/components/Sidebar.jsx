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
		<div className={`bg-[rgb(30,59,39)] text-white h-screen flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
			{/* Header */}
			<div className="p-4 border-b border-[rgb(51,65,85)]">
				<div className="flex items-center justify-between">
					{!isCollapsed && (
						<div className="flex items-center gap-2">
							<div className="h-8 w-8 relative">
								<svg viewBox="0 0 24 24" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
									<rect x="3" y="8" width="18" height="13" rx="1" fill="#ffffff" className="drop-shadow-sm" />
									<rect x="5" y="10" width="3" height="3" fill="#1e293b" />
									<rect x="10" y="10" width="3" height="3" fill="#1e293b" />
									<rect x="15" y="10" width="3" height="3" fill="#1e293b" />
									<rect x="5" y="15" width="3" height="3" fill="#1e293b" />
									<rect x="10" y="15" width="3" height="3" fill="#1e293b" />
									<rect x="15" y="15" width="3" height="3" fill="#1e293b" />
									<path d="M2 8L12 2L22 8" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
									<path d="M6 4L8 2M8 2L10 4M8 2V6" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
									<path d="M18 4L16 2M16 2L14 4M16 2V6" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</div>
							<div className="flex flex-col">
								<span className="font-bold text-lg leading-tight">SocietySync</span>
								<span className="text-xs text-[rgb(203,213,225)] leading-tight">Smart Community</span>
							</div>
						</div>
					)}
					{/* Only show collapse button on desktop */}
					<div className="hidden lg:block">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsCollapsed(!isCollapsed)}
							className="text-[rgb(203,213,225)] hover:text-white hover:bg-[rgb(51,65,85)]"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						</Button>
					</div>
					{/* Mobile close button */}
					<div className="lg:hidden">
						<Button
							variant="ghost"
							size="sm"
							onClick={onMobileClose}
							className="text-[rgb(203,213,225)] hover:text-white hover:bg-[rgb(51,65,85)]"
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
									? 'bg-[rgb(37,99,235)] text-white hover:bg-[rgb(29,78,216)]'
									: 'text-[rgb(203,213,225)] hover:text-white hover:bg-[rgb(51,65,85)]'
							}`}
						>
							{item.icon}
							{!isCollapsed && <span>{item.label}</span>}
						</Button>
					)
				})}
			</nav>

			{/* User Profile & Logout */}
			<div className="p-4 border-t border-[rgb(51,65,85)] space-y-2">
				{/* Profile */}
				<Button
					variant="ghost"
					onClick={() => handleNavigation(`/${user?.role}/profile`)}
					className="w-full justify-start gap-3 h-12 text-[rgb(203,213,225)] hover:text-white hover:bg-[rgb(51,65,85)]"
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
					className="w-full justify-start gap-3 h-12 text-[rgb(248,113,113)] hover:text-[rgb(252,165,165)] hover:bg-[rgb(127,29,29)]/20"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
					</svg>
					{!isCollapsed && <span>Logout</span>}
				</Button>

				{/* User Info */}
				{!isCollapsed && (
					<div className="pt-2 border-t border-[rgb(51,65,85)]">
						<div className="text-sm text-[rgb(148,163,184)]">
							<div className="font-medium text-[rgb(226,232,240)]">{user?.name}</div>
							<div className="text-xs capitalize">{user?.role}</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
