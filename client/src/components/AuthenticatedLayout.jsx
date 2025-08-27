import React, { useState } from 'react'
import { Sidebar } from './Sidebar'

export function AuthenticatedLayout({ children }) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	return (
		<div className="flex h-screen bg-background">
			{/* Mobile menu overlay */}
			{isMobileMenuOpen && (
				<div 
					className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}

			{/* Sidebar - hidden on mobile, shown on desktop */}
			<div className="hidden lg:block">
				<Sidebar />
			</div>

			{/* Mobile sidebar */}
			<div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${
				isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
			}`}>
				<Sidebar onMobileClose={() => setIsMobileMenuOpen(false)} />
			</div>

			{/* Main content */}
			<main className="flex-1 overflow-auto">
				{/* Mobile header */}
				<div className="lg:hidden bg-card border-b border-border px-4 py-3 flex items-center justify-between">
					<button
						onClick={() => setIsMobileMenuOpen(true)}
						className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>
					<div className="flex items-center gap-2">
						<div className="h-8 w-8 relative">
							<svg viewBox="0 0 24 24" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
								<rect x="3" y="8" width="18" height="13" rx="1" fill="#1e3a2e" className="drop-shadow-sm" />
								<rect x="5" y="10" width="3" height="3" fill="#ffffff" />
								<rect x="10" y="10" width="3" height="3" fill="#ffffff" />
								<rect x="15" y="10" width="3" height="3" fill="#ffffff" />
								<rect x="5" y="15" width="3" height="3" fill="#ffffff" />
								<rect x="10" y="15" width="3" height="3" fill="#ffffff" />
								<rect x="15" y="15" width="3" height="3" fill="#ffffff" />
								<path d="M2 8L12 2L22 8" stroke="#1e3a2e" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
								<path d="M6 4L8 2M8 2L10 4M8 2V6" stroke="#1e3a2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
								<path d="M18 4L16 2M16 2L14 4M16 2V6" stroke="#1e3a2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</div>
						<span className="font-bold text-lg text-foreground">SocietySync</span>
					</div>
					<div className="w-10" /> {/* Spacer for centering */}
				</div>

				{/* Content with responsive padding */}
				<div className="p-4 sm:p-6 lg:p-8">
					{children}
				</div>
			</main>
		</div>
	)
}
