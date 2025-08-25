import React from 'react'

export function Logo({ className = "", size = "default" }) {
	const sizeClasses = {
		small: "h-8 w-8",
		default: "h-10 w-10",
		large: "h-12 w-12",
		xl: "h-16 w-16"
	}

	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<div className={`${sizeClasses[size]} relative`}>
				{/* Building icon */}
				<svg
					viewBox="0 0 24 24"
					fill="none"
					className="w-full h-full"
					xmlns="http://www.w3.org/2000/svg"
				>
					{/* Main building */}
					<rect
						x="3"
						y="8"
						width="18"
						height="13"
						rx="1"
						fill="#0a6802"
						className="drop-shadow-sm"
					/>
					{/* Windows */}
					<rect x="5" y="10" width="2" height="2" fill="white" rx="0.2" />
					<rect x="9" y="10" width="2" height="2" fill="white" rx="0.2" />
					<rect x="13" y="10" width="2" height="2" fill="white" rx="0.2" />
					<rect x="17" y="10" width="2" height="2" fill="white" rx="0.2" />
					<rect x="5" y="14" width="2" height="2" fill="white" rx="0.2" />
					<rect x="9" y="14" width="2" height="2" fill="white" rx="0.2" />
					<rect x="13" y="14" width="2" height="2" fill="white" rx="0.2" />
					<rect x="17" y="14" width="2" height="2" fill="white" rx="0.2" />
					<rect x="5" y="18" width="2" height="2" fill="white" rx="0.2" />
					<rect x="9" y="18" width="2" height="2" fill="white" rx="0.2" />
					<rect x="13" y="18" width="2" height="2" fill="white" rx="0.2" />
					<rect x="17" y="18" width="2" height="2" fill="white" rx="0.2" />
					{/* Door */}
					<rect x="10" y="16" width="4" height="5" fill="white" rx="0.5" />
					{/* Roof */}
					<path
						d="M2 8L12 2L22 8"
						stroke="#0a6802"
						strokeWidth="2"
						fill="none"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					{/* Sync arrows */}
					<path
						d="M6 4L8 2M8 2L10 4M8 2V6"
						stroke="#0a6802"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M18 4L16 2M16 2L14 4M16 2V6"
						stroke="#0a6802"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</div>
			<div className="flex flex-col">
				<span className="font-bold text-xl text-primary leading-tight">SocietySync</span>
				<span className="text-xs text-muted-foreground leading-tight">Smart Community Management</span>
			</div>
		</div>
	)
}
