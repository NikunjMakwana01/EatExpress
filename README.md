# 🍽️ Eat Express

A full-stack restaurant web application that allows users to browse menus, place orders, and reserve tables with secure online payments.

---

## 🚀 Features

### 👤 User Features

* 🔐 Authentication (Login / Register)
* 🍔 Browse food menu with categories & filters
* 🛒 Add to cart & place orders
* 💳 Secure checkout with Razorpay
* 📅 Table reservation system
* 📦 Order history & tracking
* 📧 Email confirmation (orders & reservations)

### 🛠️ Admin Features

* 📊 Dashboard overview
* 🍽️ Manage food items & categories
* 📦 Manage orders (Pending, Confirmed, Preparing, Delivered)
* 📅 Manage reservations
* 👥 User management

---

## 🧑‍💻 Tech Stack

### Frontend

* React.js
* Tailwind CSS
* React Router
* Axios

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### Other Integrations

* Razorpay (Payments)
* Nodemailer (Emails)
* JWT Authentication
---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/eat-express.git
cd eat-express
```

---

### 2️⃣ Install dependencies

#### Backend

```bash
cd server
npm install
```

#### Frontend

```bash
cd client
npm install
```

---

### 3️⃣ Environment Variables

Create a `.env` file in the **server** folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

### 4️⃣ Run the application

#### Backend

```bash
npm run dev
```

#### Frontend

```bash
npm start
```

---

## 💳 Payment Flow (Razorpay)

1. User creates reservation/order
2. Backend generates Razorpay order
3. Frontend opens Razorpay checkout
4. Payment verification on backend
5. Confirmation email sent to user

---

## 📧 Email System

* Uses Nodemailer with SMTP
* Sends:

  * Order confirmation
  * Reservation receipt
* Supports HTML email templates

---

## 🌐 Deployment

### Frontend

* Vercel

### Backend

* Render

### Database

* MongoDB Atlas

---

## 💡 Future Improvements

* ⭐ Reviews & Ratings
* 📍 Live order tracking (maps)
* 🔔 Push notifications
* 🧾 PDF invoice generation
* 📱 PWA / Mobile App

---

## 👨‍💻 Author

**Nikunj Makwana**

