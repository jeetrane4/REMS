# Real Estate Management System (REMS)

A full-stack **Real Estate Management System** that connects **buyers, sellers, agents, and admins** through a modern property listing platform.

The system allows users to browse properties, book visits, manage listings, track transactions, and monitor activity through dashboards.

This project was developed as a **full-stack web application** using modern web development technologies.

---

# Features

### User Authentication

* User Registration & Login
* JWT Authentication
* Role-based access (Admin, Seller, Buyer, Agent)

### Property Management

* Add new property listings
* Upload property images
* Property search and filtering
* Property details page

### Booking System

* Book property visits
* Track booking status
* View bookings dashboard

### Saved Properties

* Save favorite properties
* View saved listings

### Transactions & Payments

* Track property transactions
* Payment records
* Transaction dashboard

### Dashboard

* Buyer dashboard
* Seller dashboard
* Admin analytics
* Property statistics

### Notifications

* Booking updates
* System alerts

---

# Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript (Vanilla JS)

### Backend

* Node.js
* Express.js
* REST API Architecture

### Database

* MySQL

### Tools

* Git & GitHub
* VS Code
* Postman
* MySQL Workbench

---

# Project Structure

```
REMS
│
├── Backend
│   ├── controllers
│   ├── routes
│   ├── middleware
│   ├── services
│   ├── config
│   └── server.js
│
├── Frontend
│   ├── css
│   ├── js
│   ├── images
│   └── html pages
│
├── Database.sql
└── README.md
```

---

# ⚙️ Installation & Setup

### Clone Repository

```
git clone https://github.com/jeetrane4/REMS.git
```

---

### Install Backend Dependencies

```
cd Backend
npm install
```

---

### Configure Environment Variables

Create `.env` file inside Backend:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=rems
JWT_SECRET=your_secret_key
```

---

### Import Database

Open MySQL and run:

```
Database.sql
```

---

### Start Backend Server

```
node server.js
```

Server runs on:

```
http://localhost:5000
```

---

### Run Frontend

Open:

```
Frontend/index.html
```

or use **Live Server extension**.

---

# API Endpoints (Examples)

### Authentication

```
POST /api/auth/register
POST /api/auth/login
```

### Properties

```
GET /api/properties
POST /api/properties
GET /api/properties/:id
```

### Bookings

```
POST /api/bookings
GET /api/bookings
```

### Dashboard

```
GET /api/dashboard
```


# 📌 Future Improvements

* Property map search
* Advanced filtering
* Payment gateway integration
* Chat between buyer and seller
* Mobile responsive improvements
