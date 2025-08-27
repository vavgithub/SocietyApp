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
			<div className={`${sizeClasses[size]} flex justify-center items-center relative invert `}>
				{/* Building icon */}
				<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
					width="34" height="30" viewBox="0 0 300.000000 260.000000"
					preserveAspectRatio="xMidYMid meet">
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
				<span className="font-bold text-xl text-primary leading-tight">SocietySync</span>
				<span className="text-xs text-muted-foreground leading-tight">Smart Community Management</span>
			</div>
		</div>
	)
}
