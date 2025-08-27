import React from 'react'
import { cn } from '../../lib/utils'

export function Modal({ isOpen, onClose, children, className }) {
	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div 
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>
			
			{/* Modal Content */}
			<div className={cn(
				"relative bg-card border border-border rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto",
				className
			)}>
				{children}
			</div>
		</div>
	)
}

export function ModalHeader({ children, className }) {
	return (
		<div className={cn("flex items-center justify-between p-6 border-b border-border", className)}>
			{children}
		</div>
	)
}

export function ModalContent({ children, className }) {
	return (
		<div className={cn("p-6", className)}>
			{children}
		</div>
	)
}

export function ModalFooter({ children, className }) {
	return (
		<div className={cn("flex items-center justify-end gap-2 p-6 border-t border-border", className)}>
			{children}
		</div>
	)
}
