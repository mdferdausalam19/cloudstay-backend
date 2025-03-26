# ☁️ CloudStay Backend

CloudStay's backend powers the core functionalities of property listings, bookings, and user interactions, ensuring a seamless experience for hosts and guests. Built with **Express.js** and **MongoDB**, it prioritizes **security, scalability, and performance**.

## 🌐 Live API

[CloudStay Backend](https://cloudstay-backend.vercel.app)

## 📂 Repository

[Backend Repository](https://github.com/mdferdausalam19/cloudstay-backend)

## 📊 Key Features

- **JWT Authentication**: Secure authentication with HTTP-only cookies.
- **User Roles**: Differentiated access for hosts, guests, and admins.
- **CRUD Operations**: Manage properties, bookings, and user profiles.
- **Stripe Payments**: Secure online payments for property bookings.
- **Multer for Image Uploads**: Upload and manage property images efficiently.
- **Role-Based Access Control (RBAC)**: Ensuring users can only perform authorized actions.
- **Dynamic Booking System**: Real-time booking status updates.

## ⚙️ Technologies Used

### 🛠 Backend Frameworks & Libraries

- **Express.js** - Web framework for building APIs.
- **MongoDB** - NoSQL database for storing properties and bookings.
- **JWT** - Secure authentication and authorization.
- **Cookie-Parser** - Parsing HTTP-only cookies.
- **CORS** - Enable cross-origin requests.
- **Multer** - Handle image uploads.
- **Stripe** - Payment gateway integration.

## 📁 Project Structure

```
cloudstay-backend/
├── .gitignore
├── index.js
├── package-lock.json
├── package.json
├── README.md
└── vercel.json
```

## 🌐 Endpoints

### 🔑 Authentication

| Method | Endpoint    | Description                                   |
| :----- | :---------- | :-------------------------------------------- |
| POST   | `/jwt`      | Generate JWT for user authentication          |
| GET    | `/sign-out` | Clear JWT cookie for user logout              |

### 👤 Users

| Method | Endpoint             | Description                                          | Authentication | Authorization |
| :----- | :------------------- | :--------------------------------------------------- | :------------- | :------------ |
| GET    | `/users`              | Fetch all users (Admin only)                           | JWT            | Admin         |
| GET    | `/users/:email`       | Get user data by email                                 |                |               |
| PUT    | `/users`              | Create or update user data                             |                |               |
| PATCH  | `/users/update/:email` | Update user data by email                             |                |               |

### 🏠 Rooms (Properties)

| Method | Endpoint              | Description                                        | Authentication | Authorization |
| :----- | :-------------------- | :------------------------------------------------- | :------------- | :------------ |
| GET    | `/rooms`               | Fetch all rooms, optionally filtered by category    |                |               |
| GET    | `/rooms/:id`            | Fetch a specific room by ID                           |                |               |
| POST   | `/rooms`               | Add a new room (Host only)                            | JWT            | Host          |
| GET    | `/my-listings/:email`  | Fetch all rooms for a specific host by email (Host) | JWT            | Host          |
| DELETE | `/rooms/:id`           | Delete a room by ID (Host/Admin)                     | JWT            | Host    |
| PATCH  | `/rooms/status/:id`    | Update the status of the room                        |                |               |
| PUT    | `/rooms/update/:id`    | Update a room data (Host only)                        | JWT            | Host          |

### 📅 Bookings

| Method | Endpoint          | Description                                    | Authentication |
| :----- | :---------------- | :--------------------------------------------- | :------------- |
| POST   | `/bookings`        | Create a new booking                           | JWT            |
| GET    | `/my-bookings/:email`| Fetch all bookings for a specific guest by email | JWT            |
| GET    | `/manage-bookings/:email`| Fetch all bookings for a specific host by email (Host) | JWT            | Host |
| DELETE | `/bookings/:id`     | Delete a booking by ID                         | JWT            |

### 💳 Payments

| Method | Endpoint                | Description                     | Authentication |
| :----- | :---------------------- | :------------------------------ | :------------- |
| POST   | `/create-payment-intent` | Initiate a payment using Stripe | JWT            |

### 🖼️ Image Upload

| Method | Endpoint       | Description        | Authentication |
| :----- | :------------- | :----------------- | :------------- |
| POST   | `/upload-image` | Upload an image |                 |

### 📊 Statistics

| Method | Endpoint       | Description                                  | Authentication | Authorization |
| :----- | :------------- | :------------------------------------------- | :------------- | :------------ |
| GET    | `/admin-stats`  | Get admin statistics (Admin only)            | JWT            | Admin         |
| GET    | `/host-stats`   | Get host statistics (Host only)              | JWT            | Host          |
| GET    | `/guest-stats`  | Get guest statistics                         | JWT            |               |

## 🚀 Getting Started

To run the project locally, follow these steps:

### Prerequisites

Ensure that you have **Node.js** and **npm** installed on your system.

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/mdferdausalam19/cloudstay-backend.git
   ```

2. **Navigate to the Project Directory**:

   ```bash
   cd cloudstay-backend
   ```

3. **Install Dependencies**:

   ```bash
   npm install
   ```

4. **Set Environment Variables**:

   Create a `.env` file and add the following variables:

   ```bash
   DB_USER=your_mongodb_user
   DB_PASS=your_mongodb_password
   ACCESS_TOKEN_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

5. **Run the Server**:

   ```bash
   npm start
   ```

6. **Access the API**:

   The server will run at [http://localhost:5000](http://localhost:5000).

## 📚 Resources

- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://www.mongodb.com/docs/manual)
- [Stripe API](https://stripe.com/docs/api)
- [JWT Authentication Guide](https://jwt.io)

