# 🍽️ Restaurant Management System API

A professional RESTful API built with **Node.js**, **Express.js**, and **MongoDB** for managing restaurant operations. The system provides authentication, menu management, table management, reservations, orders, inventory tracking, reporting, and health monitoring.

---

## ✨ Features

- 🔐 JWT Authentication & Authorization
- 👤 User Management
- 🍔 Menu Management
- 🪑 Table Management
- 📅 Reservation System
- 🛒 Order Management
- 📦 Inventory Management
- 📊 Reports API
- ❤️ Health Check Endpoint
- ✅ Request Validation using Zod
- 🚨 Centralized Error Handling
- 🍪 Cookie Authentication Support

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Zod Validation
- bcrypt.js
- Cookie Parser
- CORS

---

## 📁 Project Structure

```
src/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── health.controller.js
│   ├── inventory.controller.js
│   ├── menu.controller.js
│   ├── order.controller.js
│   ├── report.controller.js
│   ├── reservation.controller.js
│   ├── table.controller.js
│   └── user.controller.js
│
├── middleware/
│   ├── admin.middleware.js
│   ├── auth.middleware.js
│   └── validate.middleware.js
│
├── models/
│   ├── inventoryItem.model.js
│   ├── menuItem.model.js
│   ├── order.model.js
│   ├── reservation.model.js
│   ├── table.model.js
│   └── user.model.js
│
├── routes/
│
├── utils/
│
├── validations/
│
├── app.js
└── server.js
```

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/abmdevx/restaurant-api.git
```

```bash
cd code-alpha-restaurant-api
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file using the provided `.env.example`.

Example:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

JWT_EXPIRES_IN=7d
```

---

## 4. Start Development Server

```bash
npm run dev
```

Production

```bash
npm start
```

---

# 📌 API Modules

| Module | Description |
|---------|-------------|
| Authentication | User login & registration |
| Users | Manage system users |
| Menu | Create and manage menu items |
| Tables | Restaurant table management |
| Reservations | Customer reservations |
| Orders | Place and manage orders |
| Inventory | Inventory stock management |
| Reports | Restaurant analytics and reports |
| Health | API status check |

---

# 🔐 Authentication

The API uses **JSON Web Tokens (JWT)** for authentication.

Protected routes require a valid JWT.

Admin-only routes are secured using authorization middleware.

---

# ✅ Validation

All incoming requests are validated using **Zod**, ensuring:

- Required fields
- Correct data types
- Cleaner API responses
- Better error handling

---

# 📊 Error Handling

The project includes:

- Custom API Error class
- Async error wrapper
- Standardized API responses
- Centralized error handling middleware

---

# 📦 Available Scripts

```bash
npm run dev
```

Runs the server with Nodemon.

```bash
npm start
```

Runs the production server.

---

# 📚 Dependencies

Main packages used:

- Express.js
- Mongoose
- JWT
- bcryptjs
- Zod
- Cookie Parser
- CORS
- dotenv

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push the branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 👨‍💻 Author

**Abdullah Butt**

GitHub:
https://github.com/abdullahbutt09

---

# 📄 License

This project is developed for educational and learning purposes. You are free to use, modify, and extend it for personal or academic projects.