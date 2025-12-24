# 🌍 Tourist Guide Platform (MERN Stack)

A **full-stack Tourist Guide web application** built using the **MERN stack** that allows tourists to explore attractions, book tours, create itineraries, connect with guides, and leave reviews — **without an admin role**.

This README is designed to **guide you step-by-step through the development flow**, so you always know what to build next.

---

## 🚀 Project Overview

The Tourist Guide Platform enables:
- Tourists to discover places, plan trips, and book guides
- Tour Guides to manage profiles, availability, and bookings
- Direct interaction between tourists and guides

---

## 🧱 Tech Stack

### Frontend
- React.js
- React Router
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- JWT Authentication

### Database
- MongoDB
- Mongoose

### Tools
- Git & GitHub
- Postman
- VS Code

---

## 👥 User Roles

### Tourist
- Browse attractions
- Book tours
- Create itineraries
- Review guides

### Guide
- Create profile
- Set availability
- Accept or reject bookings
- View reviews

---

## 🗂️ Project Structure

tourist-guide-platform/
│
├── backend/
│ ├── config/
│ │ └── db.js
│ ├── models/
│ │ ├── User.js
│ │ ├── Guide.js
│ │ ├── Booking.js
│ │ ├── Review.js
│ │ └── Itinerary.js
│ ├── routes/
│ │ ├── authRoutes.js
│ │ ├── attractionRoutes.js
│ │ ├── bookingRoutes.js
│ │ ├── guideRoutes.js
│ │ ├── reviewRoutes.js
│ │ └── itineraryRoutes.js
│ ├── controllers/
│ ├── middleware/
│ │ └── authMiddleware.js
│ ├── server.js
│ └── .env
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── services/
│ │ ├── context/
│ │ ├── App.jsx
│ │ └── main.jsx
│ └── package.json
│
└── README.md



---

## 🔄 Application Workflow

### Tourist Flow
1. Register / Login
2. View attraction listings
3. Select attraction & guide
4. Book tour
5. Create itinerary
6. Leave review after tour

### Guide Flow
1. Register as guide
2. Create guide profile
3. Set availability slots
4. Accept or reject bookings
5. View ratings & reviews

---

## 🛠️ Development Flow (Follow This Order)

### Step 1: Backend Setup
- Initialize Node project
- Setup Express server
- Connect MongoDB
- Configure environment variables

### Step 2: Authentication
- User & Guide registration
- Login with JWT
- Protected routes using middleware

### Step 3: Core Models
- User Model
- Guide Model
- Attraction Model
- Booking Model
- Review Model
- Itinerary Model

### Step 4: API Development
- Authentication APIs
- Attraction listing APIs
- Booking APIs
- Review APIs
- Itinerary APIs

### Step 5: Frontend Setup
- Create React app
- Setup routing
- Create reusable components
- Connect APIs using Axios

### Step 6: Booking & Availability Logic
- Date & time slot validation
- Prevent double bookings
- Booking status handling

### Step 7: Reviews & Ratings
- Submit reviews after completed tours
- Calculate average ratings

### Step 8: Testing & Debugging
- Test APIs with Postman
- UI testing
- Error handling

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend` folder:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key



---

## ▶️ Run the Project

### Backend

cd backend
npm install
npm run dev


### Frontend
cd frontend
npm install
npm run dev



---

## 🧪 API Testing

Use **Postman** to test:
- Authentication routes
- Booking routes
- Review submission
- Itinerary creation

---

## 📌 Future Enhancements

- Payment gateway integration
- Google Maps integration
- Real-time chat between tourist & guide
- Email notifications
- Advanced search & filters

---

## 📝 Learning Outcomes

- MERN stack architecture
- RESTful API design
- Authentication & authorization
- Full-stack workflow understanding
- Real-world project structure

---

## 🤝 Contribution

This project is built for **learning and academic purposes**.  
You are free to fork and improve it.

---

## 📄 License

This project is open-source and free to use for educational purposes.

