# Tagoring API Server

Backend API server for the Tagoring job application platform. Built with Node.js, Express, MongoDB, and Firebase Admin SDK.

## Features

- 🔐 Firebase Admin SDK for authentication
- 📊 MongoDB for data persistence
- 🤖 Telegram integration for admin notifications
- 🌐 RESTful API endpoints
- 👥 User management
- 📄 Job application handling
- 📈 Analytics and statistics

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: Firebase Admin SDK
- **Notifications**: Telegram Bot API

## Prerequisites

- Node.js 18+
- MongoDB database (MongoDB Atlas recommended)
- Firebase project with Admin SDK
- Telegram Bot (optional, for notifications)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/TingTagora/tagoring-server.git
   cd tagoring-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your configuration in the `.env` file:
   - `MONGODB_URI` - Your MongoDB connection string
   - `PORT` - Server port (default: 5000)
   - `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
   - `TELEGRAM_CHAT_ID` - Your Telegram chat ID
   - `FIREBASE_PROJECT_ID` - Your Firebase project ID

4. **Start the server**
   ```bash
   npm start
   ```

   For development:
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /` - Health check
- `/api/jobs` - Job management
- `/api/applications` - Application handling
- `/api/users` - User management
- `/api/admin` - Admin statistics
- `/api/admin-auth` - Admin authentication

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `PORT` | Server port | No (default: 5000) |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | No |
| `TELEGRAM_CHAT_ID` | Telegram chat ID | No |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |

## Deployment

This server is designed to be deployed on Render as a private service.

### Render Deployment Steps:
1. Push code to GitHub
2. Create new "Private Service" on Render
3. Connect GitHub repository
4. Set environment variables
5. Deploy

## Security

- Environment variables are used for all sensitive configuration
- Firebase Admin SDK provides secure authentication
- CORS is configured for frontend access
- Input validation and error handling implemented

## License

This project is private and proprietary.

## Contact

For questions or support, contact: tingtagora@gmail.com
