import React, { useState, useRef, useEffect } from 'react'
import { cn } from '../../lib/utils'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './dropdown-menu'


export function Select({ 
	options = [], 
	value, 
	onChange, 
	placeholder = "Select an option",
	disabled = false,
	className,
	...props 
}) {
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef(null)

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false)
			}
		}

		// Use mousedown for better control
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	// Close dropdown on escape key
	useEffect(() => {
		const handleEscape = (event) => {
			if (event.key === 'Escape') {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener('keydown', handleEscape)
			return () => {
				document.removeEventListener('keydown', handleEscape)
			}
		}
	}, [isOpen])

	const handleSelect = (optionValue) => {
		onChange(optionValue)
		setIsOpen(false)
	}

	const selectedOption = options.find(option => option.value === value)
	const displayText = selectedOption ? selectedOption.label : placeholder

	return (
		<DropdownMenu ref={dropdownRef} className={cn("w-full", className)} {...props}>
			<DropdownMenuTrigger
				onClick={(e) => {
					e.preventDefault()
					e.stopPropagation()
					if (!disabled) {
						setIsOpen(!isOpen)
					}
				}}
				disabled={disabled}
				className={cn(
					"w-full",
					disabled && "opacity-50 cursor-not-allowed"
				)}
			>
				<span className={cn(
					"flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis",
					!selectedOption && "text-muted-foreground"
				)}>
					{displayText}
				</span>
				<svg
					className={cn(
						"h-4 w-4 transition-transform duration-200",
						isOpen && "rotate-180"
					)}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</DropdownMenuTrigger>
			
			{isOpen && (
				<DropdownMenuContent className="w-full min-w-[8rem] max-h-60 overflow-auto">
					{options.map((option) => (
						<DropdownMenuItem
							key={option.value}
							onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()
								handleSelect(option.value)
							}}
							className={cn(
								"cursor-pointer",
								value === option.value && "bg-accent text-accent-foreground"
							)}
						>
							{option.label}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			)}
		</DropdownMenu>
	)
}
