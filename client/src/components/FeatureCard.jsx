import React from 'react'
import { Card, CardContent } from './ui/card'

export function FeatureCard({ icon, title, description, className = "" }) {
	return (
		<Card className={`border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 ${className}`}>
			<CardContent className="p-6">
				<div className="flex items-start space-x-4">
					<div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
						{icon}
					</div>
					<div className="flex-1">
						<h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
						<p className="text-muted-foreground leading-relaxed">{description}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
