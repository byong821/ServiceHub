# ServiceHub

**A Student Services Marketplace for Campus Communities**

## 👥 Authors

**Eric Fu** - [GitHub](https://github.com/ericfu4)  
**Brandan Yong** - [GitHub](https://github.com/byong821)

---

## 🎓 Class Information

**Course:** CS5610 - Web Development  
**Institution:** Northeastern University  
**Semester:** Fall 2024  

Class Link: https://johnguerra.co/classes/webDevelopment_online_fall_2025/

---

## 🎯 Project Objective

ServiceHub is a full-stack web application designed to connect students on campus who need services with students who can provide them. The platform enables students to:

- **Browse and search** for student-provided services across multiple categories
- **Filter services** by category, school location, and price range
- **Create listings** to offer their own skills and services
- **Leave reviews** and ratings for completed services
- **Manage their listings** through a personalized profile dashboard

The goal is to create a trusted, student-only marketplace that makes it easy to find help with tutoring, moving, tech support, photography, and more - all within the campus community.

**Live Demo:** https://servicehub-06p9.onrender.com

---

## 📸 Screenshots

### Home Page - Browse Services
![Home Page](https://via.placeholder.com/800x500/4CAF50/FFFFFF?text=Home+Page+Screenshot)
<!-- Replace with actual screenshot: /screenshots/home.png -->

### Service Detail Page
![Service Detail](https://via.placeholder.com/800x500/4CAF50/FFFFFF?text=Service+Detail+Screenshot)
<!-- Replace with actual screenshot: /screenshots/service-detail.png -->

### My Listings Dashboard
![My Listings](https://via.placeholder.com/800x500/4CAF50/FFFFFF?text=My+Listings+Screenshot)
<!-- Replace with actual screenshot: /screenshots/profile.png -->

---

## 🛠️ Technology Stack

**Frontend:**
- React 18
- React Router v6
- Native Fetch API
- CSS3 with custom styling

**Backend:**
- Node.js
- Express.js
- MongoDB with native driver
- Express Session for authentication

**Deployment:**
- Frontend & Backend: Render
- Database: MongoDB Atlas

---

## ✨ Features

- ✅ User authentication (register, login, logout)
- ✅ Create and manage service listings
- ✅ Browse services with search functionality
- ✅ Filter by category, school, and price range
- ✅ View detailed service information with provider contact
- ✅ Leave reviews and ratings (authenticated users only)
- ✅ Star ratings display on service cards
- ✅ Responsive design for mobile and desktop
- ✅ Session-based authentication with secure cookies
- ✅ Input validation and error handling

---

## 📦 Project Structure
```
ServiceHub/
├── backend/
│   ├── models/           # Database models (users, services, reviews)
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   ├── utils/            # Database connection, indexing
│   ├── seed/             # Database seeding scripts
│   └── server.js         # Express server entry point
├── frontend/
│   ├── public/           # Static assets
│   └── src/
│       ├── components/   # Reusable React components
│       ├── pages/        # Page components
│       ├── context/      # Auth context
│       ├── services/     # API service layer
│       └── App.js        # Main app component
└── README.md
```

---

## 🚀 Instructions to Build and Run Locally

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or Atlas account)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/byong821/ServiceHub.git
cd ServiceHub
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your configuration:
# MONGODB_URI=mongodb://localhost:27017/servicehub
# SESSION_SECRET=your-secret-key-here
# PORT=5001

# Seed the database with sample data
node seed/index.js

# Start the backend server
npm start
```

Backend will run on `http://localhost:5001`

### 3. Frontend Setup

Open a **new terminal window:**
```bash
cd frontend

# Install dependencies
npm install

# Create environment file (optional for local dev)
echo "REACT_APP_API_URL=" > .env

# Start the React development server
npm start
```

Frontend will run on `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

### 5. Test Accounts (After Seeding)

The seed creates 400 test users. You can:
- Register a new account, OR
- Login with any seeded user (password is `password123` for all seeded accounts)

---

## 📄 License

MIT License - see LICENSE file for details

---
