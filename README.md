# PharmaCare 

A full stack pharmacy management platform built using the MERN stack.

## About the Project

PharmaCare is a project that I built to solve a common problem, making it easier for customers to connect with nearby pharmacies while giving chemists a simple platform to manage their inventory and orders. The application provides separate dashboards for customers, chemists, and administrators, each with features tailored to their responsibilities.

While building this project, my goal wasn't just to create another CRUD application. I built this project to simulate a production ready pharmacy management platform, I focused on implementing secure authentication, role based authorization, real-time communication, cloud storage, online payments, and AI integration while keeping the code modular and maintainable.

The project follows a scalable MERN architecture with separate frontend and backend applications, making it easier to maintain and extend in the future.


##  Demo

**Live Website:** *(Link)*


## Tech Stack

# Frontend

* React 18
* Vite
* Tailwind CSS
* React Router
* Framer Motion
* Axios
* React Hook Form
* TanStack Query
* React Hot Toast
* Context API
* Socket.IO Client
* Recharts

# Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Refresh Tokens
* bcrypt
* Socket.IO
* Nodemailer
* Multer
* Cloudinary
* Express Validator
* Helmet
* Express Rate Limit
* Express Mongo Sanitize

# Third Party Services

* Google Gemini API
* Cloudinary
* Razorpay
* MongoDB Atlas


##  Features

# Authentication & Security

* Customer registration
* Chemist registration
* Email OTP verification
* Secure login system
* JWT Access & Refresh Tokens
* Remember Me functionality
* Forgot Password
* Reset Password
* Role Based Access Control (Customer, Chemist, Admin)
* Password hashing using bcrypt
* Rate limiting
* Helmet security
* MongoDB sanitization

---

# Customer Features

* Search medicines
* Medicine details page
* Wishlist
* Shopping cart
* Nearby pharmacy search
* Google Maps integration
* Place medicine orders
* Cancel pending orders
* Reorder previous orders
* Order history
* Order tracking timeline
* Download PDF invoices
* Review and rate medicines
* Recently viewed medicines
* Favorite pharmacies


# Chemist Features

* Dedicated chemist dashboard
* Inventory management
* Add medicines
* Edit medicines
* Delete medicines
* Upload medicine images
* Accept or reject orders
* Update order status
* Customer management
* Dashboard analytics
* Weekly sales chart
* Low stock monitoring


# Admin Features

* Admin dashboard
* View platform statistics
* Manage users
* Verify chemists
* Activate/Deactivate accounts


# AI Features

* AI Medical Assistant powered by Google Gemini
* Medicine information
* General health guidance
* First aid suggestions
* Voice input
* Text to Speech responses
* Available throughout the application


# Payment Features

* Cash on Delivery
* Razorpay Online Payments
* Secure payment verification
* Payment signature validation


# Real Time Features

* Live order notifications
* Socket.IO integration
* Notification center
* Instant order status updates



# Additional Features

* Dark Mode
* Responsive Design
* Protected Routes
* Image Uploads
* Cloud Storage
* Dashboard Analytics
* Pagination
* Search & Filters


## Project Structure


PharmaCare
│
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── utils
│   │   ├── validators
│   │   └── services
│   └── server.js
│
└── frontend
    ├── src
    │   ├── api
    │   ├── components
    │   ├── context
    │   ├── hooks
    │   ├── layouts
    │   ├── pages
    │   ├── routes
    │   └── utils
```


```

##Getting Started

# Clone the Repository

bash
git clone <repository-url>
cd PharmaCare


# Backend Setup

bash
cd backend
npm install


reate a .env file inside the backend directory and add the following environment variables:

MONGO_URI
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
SMTP_HOST
SMTP_PORT
SMTP_EMAIL
SMTP_PASSWORD
GEMINI_API_KEY
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
CLIENT_URL

Start the backend server:

npm run dev

Backend runs on:

http://localhost:5000

---

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```



# Security Implementations

* JWT Authentication
* Refresh Token Rotation
* HTTP only Cookies
* Password Hashing (bcrypt)
* Input Validation
* Express Validator
* Helmet
* Rate Limiting
* MongoDB Query Sanitization
* Protected API Routes
* Role-Based Authorization



# 📈 What I Learned

Building PharmaCare helped me gain practical experience with full stack development beyond basic CRUD operations. Through this project, I learned how to:

* Design a scalable MERN application structure.
* Implement secure authentication using JWT access and refresh tokens.
* Work with role based authorization.
* Integrate third party services like Cloudinary, Razorpay, and Google Gemini.
* Build REST APIs following clean architecture.
* Handle real time communication using Socket.IO.
* Manage application state efficiently on the frontend.
* Deploy a full stack application using modern cloud platforms.

This project also improved my understanding of writing modular backend code, organizing large React applications, and building features that resemble real production systems.


# Contact

If you'd like to discuss the project or have any suggestions, feel free to connect with me.

**LinkedIn:** *(Link)*

