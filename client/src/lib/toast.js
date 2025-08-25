import toast from 'react-hot-toast'

// Global toast configuration
const toastConfig = {
	duration: 3000,
	style: {
		borderRadius: '8px',
		fontSize: '14px',
		fontWeight: '500',
	},
}

// Success toast
export const showSuccessToast = (message) => {
	toast.success(message, {
		...toastConfig,
		style: {
			...toastConfig.style,
			background: 'rgb(22, 163, 74)',
			color: 'white',
		},
	})
}

// Error toast
export const showErrorToast = (message) => {
	toast.error(message, {
		...toastConfig,
		style: {
			...toastConfig.style,
			background: 'rgb(239, 68, 68)',
			color: 'white',
		},
	})
}

// Info toast
export const showInfoToast = (message) => {
	toast(message, {
		...toastConfig,
		style: {
			...toastConfig.style,
			background: 'rgb(59, 130, 246)',
			color: 'white',
		},
	})
}

// Warning toast
export const showWarningToast = (message) => {
	toast(message, {
		...toastConfig,
		style: {
			...toastConfig.style,
			background: 'rgb(245, 158, 11)',
			color: 'white',
		},
	})
}

// Loading toast
export const showLoadingToast = (message) => {
	return toast.loading(message, {
		...toastConfig,
		style: {
			...toastConfig.style,
			background: 'rgb(107, 114, 128)',
			color: 'white',
		},
	})
}

// Dismiss specific toast
export const dismissToast = (toastId) => {
	toast.dismiss(toastId)
}

// Dismiss all toasts
export const dismissAllToasts = () => {
	toast.dismiss()
}
