import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// In-memory storage for OTPs with automatic cleanup
const otpStore = new Map()

// Email transporter configuration
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD
	}
})

// Generate a 6-digit OTP
function generateOTP() {
	return Math.floor(100000 + Math.random() * 900000).toString()
}

// Store OTP with expiry time
function storeOTP(email, otp, purpose) {
	const key = `${email}:${purpose}`
	const expiryTime = Date.now() + 60000 // 1 minute from now
	
	otpStore.set(key, {
		otp,
		expiryTime,
		attempts: 0
	})
	
	return key
}

// Verify OTP
function verifyOTP(email, otp, purpose) {
	const key = `${email}:${purpose}`
	const otpData = otpStore.get(key)
	
	if (!otpData) {
		return { valid: false, message: 'OTP expired or not found' }
	}
	
	// Check if OTP has expired
	if (Date.now() > otpData.expiryTime) {
		otpStore.delete(key)
		return { valid: false, message: 'OTP has expired' }
	}
	
	// Check if too many attempts
	if (otpData.attempts >= 3) {
		otpStore.delete(key)
		return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' }
	}
	
	// Increment attempts
	otpData.attempts++
	
	// Verify OTP
	if (otpData.otp === otp) {
		otpStore.delete(key) // Remove OTP after successful verification
		return { valid: true, message: 'OTP verified successfully' }
	} else {
		return { valid: false, message: 'Invalid OTP' }
	}
}

// Send invite email
async function sendInviteEmail(email, inviteLink, role, apartmentName) {
	const subject = 'SocietySync - You\'ve Been Invited to Join!'
	
	const roleText = role === 'tenant' ? 'Tenant' : 'Security Guard'
	
	const html = `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<div style="background: linear-gradient(135deg, #0a6802 0%, #16a34a 100%); padding: 20px; text-align: center;">
				<h1 style="color: white; margin: 0; font-size: 24px;">SocietySync</h1>
				<p style="color: white; margin: 5px 0 0 0; font-size: 14px;">Smart Community Management</p>
			</div>
			
			<div style="padding: 30px; background: #f9fafb;">
				<h2 style="color: #1f2937; margin-bottom: 20px;">You've Been Invited!</h2>
				
				<p style="color: #6b7280; line-height: 1.6; margin-bottom: 25px;">
					You have been invited to join <strong>${apartmentName}</strong> as a <strong>${roleText}</strong> 
					on SocietySync - the smart community management platform.
				</p>
				
				<div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
					<p style="color: #6b7280; margin-bottom: 15px;">Click the button below to accept your invitation:</p>
					<a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #0a6802 0%, #16a34a 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
						Accept Invitation
					</a>
				</div>
				
				<p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
					<strong>Important:</strong>
					<ul style="color: #6b7280; font-size: 14px; margin: 10px 0;">
						<li>This invitation link will expire in 15 minutes</li>
						<li>If you didn't expect this invitation, please ignore this email</li>
					</ul>
				</p>
				
				<div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
					<p style="color: #9ca3af; font-size: 12px; margin: 0;">
						This is an automated message from SocietySync. Please do not reply to this email.
					</p>
				</div>
			</div>
		</div>
	`
	
	try {
		await transporter.sendMail({
			from: process.env.EMAIL_USER,
			to: email,
			subject: subject,
			html: html
		})
		
		return { success: true, message: 'Invite email sent successfully' }
	} catch (error) {
		console.error('Error sending invite email:', error)
		return { success: false, message: 'Failed to send invite email' }
	}
}

// Send OTP via email
async function sendOTP(email, otp, purpose) {
	const subject = purpose === 'admin-registration' 
		? 'SocietySync - Admin Registration OTP'
		: purpose === 'invite-registration'
		? 'SocietySync - Invitation Registration OTP'
		: 'SocietySync - OTP Verification'
	
	const html = `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<div style="background: linear-gradient(135deg, #0a6802 0%, #16a34a 100%); padding: 20px; text-align: center;">
				<h1 style="color: white; margin: 0; font-size: 24px;">SocietySync</h1>
				<p style="color: white; margin: 5px 0 0 0; font-size: 14px;">Smart Community Management</p>
			</div>
			
			<div style="padding: 30px; background: #f9fafb;">
				<h2 style="color: #1f2937; margin-bottom: 20px;">Email Verification Required</h2>
				
				<p style="color: #6b7280; line-height: 1.6; margin-bottom: 25px;">
					Thank you for registering with SocietySync! To complete your registration, 
					please enter the following verification code:
				</p>
				
				<div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
					<div style="font-size: 32px; font-weight: bold; color: #0a6802; letter-spacing: 8px; font-family: 'Courier New', monospace;">
						${otp}
					</div>
				</div>
				
				<p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
					<strong>Important:</strong>
				</p>
				<ul style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
					<li>This OTP is valid for 1 minute only</li>
					<li>Do not share this OTP with anyone</li>
					<li>If you didn't request this, please ignore this email</li>
				</ul>
				
				<div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin-top: 20px;">
					<p style="color: #92400e; margin: 0; font-size: 14px;">
						<strong>Security Notice:</strong> SocietySync will never ask for your password or personal information via email.
					</p>
				</div>
			</div>
			
			<div style="background: #f3f4f6; padding: 20px; text-align: center;">
				<p style="color: #6b7280; font-size: 12px; margin: 0;">
					© 2024 SocietySync. All rights reserved.
				</p>
			</div>
		</div>
	`
	
	try {
		await transporter.sendMail({
			from: process.env.EMAIL_USER,
			to: email,
			subject: subject,
			html: html
		})
		
		console.log(`OTP sent successfully to ${email}`)
		return { success: true, message: 'OTP sent successfully' }
	} catch (error) {
		console.error('Error sending OTP email:', error)
		return { success: false, message: 'Failed to send OTP email' }
	}
}

// Cleanup expired OTPs (run periodically)
function cleanupExpiredOTPs() {
	const now = Date.now()
	for (const [key, otpData] of otpStore.entries()) {
		if (now > otpData.expiryTime) {
			otpStore.delete(key)
			console.log(`Cleaned up expired OTP for key: ${key}`)
		}
	}
}


export {
	generateOTP,
	storeOTP,
	verifyOTP,
	sendOTP,
	sendInviteEmail,
	cleanupExpiredOTPs
}
