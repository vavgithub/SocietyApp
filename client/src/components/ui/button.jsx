import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
	'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground shadow hover:opacity-90',
				cta:
					'bg-[rgb(22,163,74)] text-white shadow hover:bg-[rgb(21,128,61)] hover:opacity-90',
				secondary:
					'bg-secondary text-secondary-foreground hover:opacity-90',
				outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-9 px-4 py-2',
				sm: 'h-8 rounded-md px-3',
				lg: 'h-10 rounded-md px-8',
				icon: 'h-9 w-9',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
)

export function Button({ className, variant, size, asChild, ...props }) {
	return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
}


