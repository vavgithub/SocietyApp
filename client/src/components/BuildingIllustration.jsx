import React from 'react'
import buildingIllustration from '../assets/building-illustration.webp'

export function BuildingIllustration({ className = "" }) {
	return (
		<div className={`relative rounded-full overflow-hidden ${className}`}>
			<img src={buildingIllustration} alt="Building Illustration" className="w-full h-full object-cover" />
		</div>
	)
}
