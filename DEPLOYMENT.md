# SocietyApp Deployment Guide for Render

## Overview
This guide will help you deploy your SocietyApp to Render, a cloud platform that supports both static sites and web services.

## Prerequisites
- Render account
- MongoDB Atlas account (for production database)
- Cloudinary account (for image uploads)
- Gmail account (for OTP emails)

## Required Environment Variables

### Backend (Server) Environment Variables
Create these in your Render service environment variables:

```bash
# Server Configuration
PORT=4000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/societysync

# JWT & Security
JWT_SECRET=your-super-secure-jwt-secret-key-here
INVITE_SECRET=your-invite-secret-key-here

# Frontend URL (your Render frontend URL)
FRONTEND_URL=https://your-app-name.onrender.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

### Frontend (Client) Environment Variables
Create a `.env` file in the `client` directory:

```bash
# API URL (your Render backend URL)
VITE_API_URL=https://your-backend-service.onrender.com/api
```

## Deployment Steps

### 1. Deploy Backend (Server)

1. **Create a new Web Service on Render:**
   - Connect your GitHub repository
   - Set the **Root Directory** to `server`
   - Set the **Build Command** to: `npm install`
   - Set the **Start Command** to: `npm start`

2. **Configure Environment Variables:**
   - Add all the backend environment variables listed above
   - Make sure to use your actual MongoDB Atlas connection string
   - Use a strong JWT_SECRET (you can generate one with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)

3. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically build and deploy your backend

### 2. Deploy Frontend (Client)

1. **Create a new Static Site on Render:**
   - Connect your GitHub repository
   - Set the **Root Directory** to `client`
   - Set the **Build Command** to: `npm install && npm run build`
   - Set the **Publish Directory** to: `dist`

2. **Configure Environment Variables:**
   - Add the frontend environment variable with your backend URL

3. **Deploy:**
   - Click "Create Static Site"
   - Render will build and deploy your frontend

## Database Setup

### MongoDB Atlas Configuration
1. Create a MongoDB Atlas cluster
2. Create a database user with read/write permissions
3. Get your connection string
4. Add it to your backend environment variables

### Initial Data Migration
If you have existing data, you can migrate it using MongoDB Compass or the mongo shell.

## Email Setup

### Gmail App Password
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password for your application
3. Use this password in the `EMAIL_PASSWORD` environment variable

## Cloudinary Setup

1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Add them to your backend environment variables

## Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Test OTP functionality
- [ ] Test file uploads (visitor photos)
- [ ] Test all user roles (Admin, Guard, Tenant)
- [ ] Test visitor management
- [ ] Test announcement system
- [ ] Verify mobile responsiveness
- [ ] Check all API endpoints

## Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure `FRONTEND_URL` is correctly set in backend environment variables
   - Check that the frontend URL matches exactly (including https://)

2. **Database Connection Issues:**
   - Verify MongoDB Atlas connection string
   - Check network access settings in MongoDB Atlas
   - Ensure database user has correct permissions

3. **File Upload Issues:**
   - Verify Cloudinary credentials
   - Check that all Cloudinary environment variables are set

4. **Email Issues:**
   - Verify Gmail credentials
   - Check that 2FA is enabled and app password is used
   - Ensure Gmail account allows "less secure app access" or use app passwords

### Logs and Debugging
- Check Render logs for both frontend and backend services
- Use `console.log` statements (they'll appear in Render logs)
- Monitor MongoDB Atlas for connection issues

## Security Considerations

1. **Environment Variables:**
   - Never commit `.env` files to version control
   - Use strong, unique secrets for JWT_SECRET and INVITE_SECRET
   - Rotate secrets periodically

2. **Database Security:**
   - Use MongoDB Atlas with proper network access controls
   - Regularly backup your database
   - Monitor for unusual access patterns

3. **API Security:**
   - All sensitive endpoints are protected with JWT authentication
   - Role-based access control is implemented
   - Input validation is in place

## Performance Optimization

1. **Database:**
   - Add indexes for frequently queried fields
   - Monitor query performance
   - Consider connection pooling

2. **Frontend:**
   - Images are optimized through Cloudinary
   - React Query provides caching
   - Mobile-first responsive design

## Monitoring and Maintenance

1. **Regular Tasks:**
   - Monitor Render service health
   - Check MongoDB Atlas metrics
   - Review Cloudinary usage
   - Monitor email delivery rates

2. **Updates:**
   - Keep dependencies updated
   - Monitor for security vulnerabilities
   - Test thoroughly before deploying updates

## Support

If you encounter issues during deployment:
1. Check Render documentation
2. Review application logs
3. Verify all environment variables are set correctly
4. Test locally with production environment variables

Your SocietyApp is now ready for production deployment on Render! 🚀
