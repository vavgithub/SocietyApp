import React from 'react'
import { cn } from '../../lib/utils'

export function DropdownMenu({ children, className, ...props }) {
	return (
		<div className={cn("relative", className)} {...props}>
			{children}
		</div>
	)
}

export function DropdownMenuTrigger({ children, className, ...props }) {
	return (
		<button
			type="button"
			className={cn(
				"flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				className
			)}
			{...props}
		>
			{children}
		</button>
	)
}

export function DropdownMenuContent({ children, className, ...props }) {
	return (
		<div
			className={cn(
				"absolute top-full z-50 mt-1 w-full rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md ",
				className
			)}
			{...props}
		>
			{children}
		</div>
	)
}

export function DropdownMenuItem({ children, className, onClick, ...props }) {
	return (
		<button
			type="button"
			className={cn(
				"relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
				className
			)}
			onClick={onClick}
			{...props}
		>
			{children}
		</button>
	)
}

export function DropdownMenuSeparator({ className, ...props }) {
	return (
		<div
			className={cn("-mx-1 my-1 h-px bg-border", className)}
			{...props}
		/>
	)
}
