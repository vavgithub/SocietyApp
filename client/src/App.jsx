import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute, AdminRoute, AdminRouteWithoutEnrollmentCheck, TenantRoute, GuardRoute } from './components/ProtectedRoute'
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { AdminSetup } from './pages/AdminSetup'
import { Announcements } from './pages/Announcements'
import { CompleteEnrollment } from './pages/CompleteEnrollment'
import { SocietySettings } from './pages/SocietySettings'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AdminDashboard } from './pages/AdminDashboard'
import { TenantsPage } from './pages/TenantsPage'
import { GuardsPage } from './pages/GuardsPage'
import { TenantDashboard } from './pages/TenantDashboard'
import { GuardDashboard } from './pages/GuardDashboard'
import { Facilities } from './pages/Facilities'
import { VisitorLog } from './pages/VisitorLog'
import { MyVisitors } from './pages/MyVisitors'
import { Visitors } from './pages/Visitors'
import { Profile } from './pages/Profile'
import { Navbar } from './components/Navbar'
import { BuildingIllustration } from './components/BuildingIllustration'
import { FeatureCard } from './components/FeatureCard'
import { Button } from './components/ui/button'
import './index.css'
import { Toaster } from 'react-hot-toast'

// Create a client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			retry: 1,
		},
	},
})

function Home() {
	const { isAuthenticated, user, isLoading, hasCheckedAuth } = useAuth()

	// Show loading while checking authentication
	if (isLoading || !hasCheckedAuth) {
		return (
			<div className="min-h-screen flex items-center justify-center gradient-bg">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</div>
		)
	}

	// If authenticated, redirect to appropriate dashboard
	if (isAuthenticated && user) {
		switch (user.role) {
			case 'admin':
				return <Navigate to="/admin" replace />
			case 'tenant':
				return <Navigate to="/tenant" replace />
			case 'guard':
				return <Navigate to="/guard" replace />
			default:
				return <Navigate to="/login" replace />
		}
	}

	// Show landing page for unauthenticated users
	return (
			<div className="min-h-screen gradient-bg">
				{/* Navigation */}
				<Navbar />

				{/* Hero Section */}
				<section className="relative overflow-hidden">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
						<div className="grid lg:grid-cols-2 gap-12 items-center">
							<div className="space-y-8">
								<div className="space-y-4">
									<h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
										Smart Community
										<span className="text-primary block">Management</span>
									</h1>
									<p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
										Streamline your society operations with our comprehensive management platform. 
										From tenant management to security oversight, we've got you covered.
									</p>
								</div>
								
								<div className="flex flex-col sm:flex-row gap-4">
									<Button size="lg" variant="cta" className="text-lg px-8 py-3 animate-pulse-glow" asChild>
										<a href="/enroll">Get Started for Free</a>
									</Button>
									<Button size="lg" variant="outline" className="text-lg px-8 py-3" asChild>
										<a href="/login">Login to Dashboard</a>
									</Button>
								</div>

								<div className="flex items-center space-x-6 text-sm text-muted-foreground">
									<div className="flex items-center space-x-2">
										<div className="w-2 h-2 bg-primary rounded-full"></div>
										<span>Secure & Reliable</span>
									</div>
									<div className="flex items-center space-x-2">
										<div className="w-2 h-2 bg-primary rounded-full"></div>
										<span>24/7 Support</span>
									</div>
									<div className="flex items-center space-x-2">
										<div className="w-2 h-2 bg-primary rounded-full"></div>
										<span>Easy Setup</span>
									</div>
								</div>
							</div>
							
							<div className="flex justify-center lg:justify-end">
								<BuildingIllustration className="w-64 h-64 lg:w-80 lg:h-80" />
							</div>
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section className="py-20 bg-white">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-16">
							<h2 className="text-4xl font-bold text-foreground mb-4">
								Everything You Need to Manage Your Community
							</h2>
							<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
								Comprehensive tools designed specifically for society and apartment management
							</p>
						</div>

						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
							<FeatureCard
								icon={
									<svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
									</svg>
								}
								title="Tenant Management"
								description="Efficiently manage tenant registrations, profiles, and communications with our intuitive interface."
							/>
							
							<FeatureCard
								icon={
									<svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
									</svg>
								}
								title="Security Oversight"
								description="Monitor security activities, manage guard access, and maintain visitor logs for enhanced safety."
							/>
							
							<FeatureCard
								icon={
									<svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
									</svg>
								}
								title="Financial Tracking"
								description="Track maintenance fees, utility payments, and generate financial reports with ease."
							/>
							
							<FeatureCard
								icon={
									<svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
									</svg>
								}
								title="Communication Hub"
								description="Centralized communication system for announcements, notifications, and community updates."
							/>
							
							<FeatureCard
								icon={
									<svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
									</svg>
								}
								title="Maintenance Requests"
								description="Streamlined system for handling maintenance requests and tracking repair progress."
							/>
							
							<FeatureCard
								icon={
									<svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
									</svg>
								}
								title="Analytics & Reports"
								description="Comprehensive analytics and reporting tools to make data-driven decisions for your community."
							/>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-20 bg-gradient-to-br from-primary/5 to-primary/10">
					<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
						<h2 className="text-4xl font-bold text-foreground mb-6">
							Ready to Transform Your Community Management?
						</h2>
						<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
							Join thousands of societies and apartments that trust SocietySync for their management needs. 
							Get started today and experience the difference.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button size="lg" variant="cta" className="text-lg px-8 py-3" asChild>
								<a href="/enroll">Start Your Free Trial</a>
							</Button>
							<Button size="lg" variant="outline" className="text-lg px-8 py-3" asChild>
								<a href="/login">Login Now</a>
							</Button>
						</div>
					</div>
				</section>

				{/* Footer */}
				<footer className="bg-white border-t border-primary/10 py-12">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="grid md:grid-cols-4 gap-8">
							<div className="md:col-span-2">
								<div className="flex items-center gap-2">
									<div className="h-10 w-10 relative">
										<svg viewBox="0 0 24 24" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
											<rect x="3" y="8" width="18" height="13" rx="1" fill="#0a6802" className="drop-shadow-sm" />
											<rect x="5" y="10" width="3" height="3" fill="white" />
											<rect x="10" y="10" width="3" height="3" fill="white" />
											<rect x="15" y="10" width="3" height="3" fill="white" />
											<rect x="5" y="15" width="3" height="3" fill="white" />
											<rect x="10" y="15" width="3" height="3" fill="white" />
											<rect x="15" y="15" width="3" height="3" fill="white" />
											<path d="M2 8L12 2L22 8" stroke="#0a6802" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
											<path d="M6 4L8 2M8 2L10 4M8 2V6" stroke="#0a6802" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
											<path d="M18 4L16 2M16 2L14 4M16 2V6" stroke="#0a6802" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									</div>
									<div className="flex flex-col">
										<span className="font-bold text-xl text-primary leading-tight">SocietySync</span>
										<span className="text-xs text-muted-foreground leading-tight">Smart Community Management</span>
									</div>
								</div>
								<p className="mt-4 text-muted-foreground max-w-md">
									Empowering communities with smart management solutions. 
									Built for societies, apartments, and residential complexes.
								</p>
							</div>
							<div>
								<h3 className="font-semibold text-foreground mb-4">Product</h3>
								<ul className="space-y-2 text-muted-foreground">
									<li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
									<li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
									<li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
									<li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
								</ul>
							</div>
							<div>
								<h3 className="font-semibold text-foreground mb-4">Company</h3>
								<ul className="space-y-2 text-muted-foreground">
									<li><a href="#" className="hover:text-primary transition-colors">About</a></li>
									<li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
									<li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
									<li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
								</ul>
							</div>
						</div>
						<div className="border-t border-primary/10 mt-8 pt-8 text-center text-muted-foreground">
							<p>&copy; 2024 SocietySync. All rights reserved.</p>
						</div>
					</div>
				</footer>
			</div>
		)
}

function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/register" element={<RegisterPage />} />
			<Route path="/enroll" element={<AdminSetup />} />
			<Route
				path="/complete-enrollment"
				element={
					<AdminRouteWithoutEnrollmentCheck>
						<CompleteEnrollment />
					</AdminRouteWithoutEnrollmentCheck>
				}
			/>
			<Route
				path="/admin"
				element={
					<AdminRoute>
						<AdminDashboard />
					</AdminRoute>
				}
			/>
			<Route
				path="/admin/tenants"
				element={
					<AdminRoute>
						<TenantsPage />
					</AdminRoute>
				}
			/>
			<Route
				path="/admin/guards"
				element={
					<AdminRoute>
						<GuardsPage />
					</AdminRoute>
				}
			/>
			<Route
				path="/admin/announcements"
				element={
					<AdminRoute>
						<Announcements />
					</AdminRoute>
				}
			/>
			<Route
				path="/tenant/announcements"
				element={
					<TenantRoute>
						<Announcements />
					</TenantRoute>
				}
			/>
			<Route
				path="/guard/announcements"
				element={
					<GuardRoute>
						<Announcements />
					</GuardRoute>
				}
			/>
			<Route
				path="/admin/facilities"
				element={
					<AdminRoute>
						<Facilities />
					</AdminRoute>
				}
			/>
			<Route
				path="/admin/settings"
				element={
					<AdminRoute>
						<SocietySettings />
					</AdminRoute>
				}
			/>
			<Route
				path="/tenant"
				element={
					<TenantRoute>
						<TenantDashboard />
					</TenantRoute>
				}
			/>

			<Route
				path="/tenant/amenities"
				element={
					<TenantRoute>
						<TenantDashboard />
					</TenantRoute>
				}
			/>
			<Route
				path="/guard"
				element={
					<GuardRoute>
						<GuardDashboard />
					</GuardRoute>
				}
			/>
			<Route
				path="/guard/visitors"
				element={
					<GuardRoute>
						<VisitorLog />
					</GuardRoute>
				}
			/>
			<Route
				path="/admin/visitors"
				element={
					<AdminRoute>
						<Visitors />
					</AdminRoute>
				}
			/>
			<Route
				path="/tenant/visitors"
				element={
					<TenantRoute>
						<MyVisitors />
					</TenantRoute>
				}
			/>
			<Route
				path="/admin/profile"
				element={
					<AdminRoute>
						<Profile />
					</AdminRoute>
				}
			/>
			<Route
				path="/tenant/profile"
				element={
					<TenantRoute>
						<Profile />
					</TenantRoute>
				}
			/>
			<Route
				path="/guard/profile"
				element={
					<GuardRoute>
						<Profile />
					</GuardRoute>
				}
			/>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	)
}

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<BrowserRouter>
					<AppRoutes />
					<PWAUpdatePrompt />
					<PWAInstallPrompt />
					<Toaster 
						position="top-right"
						toastOptions={{
							duration: 3000,
							style: {
								borderRadius: '8px',
								fontSize: '14px',
								fontWeight: '500',
							},
						}}
					/>
				</BrowserRouter>
			</AuthProvider>
		</QueryClientProvider>
	)
}
