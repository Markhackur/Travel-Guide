# Tourist Guide Platform - Frontend

A modern, responsive React frontend for the Tourist Guide Platform with beautiful UI/UX design.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend server running on `http://localhost:4000`

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
client/
├── src/
│   ├── api/              # API integration
│   ├── components/       # Reusable components
│   │   ├── common/      # Common UI components
│   │   └── layout/       # Layout components
│   ├── context/         # React Context (Auth)
│   ├── pages/           # Page components
│   │   ├── auth/        # Authentication pages
│   │   ├── traveller/   # Traveller pages
│   │   └── guide/       # Guide pages
│   ├── routes/          # Routing configuration
│   ├── styles/          # Global styles
│   └── utils/          # Utility functions
├── public/             # Static assets
└── package.json
```

## 🎨 Features

### Authentication
- ✅ Login/Register pages with beautiful design
- ✅ JWT token management
- ✅ Protected routes
- ✅ Role-based access control

### Traveller Features
- ✅ Dashboard with statistics
- ✅ Explore attractions
- ✅ Manage bookings
- ✅ Create and manage itineraries
- ✅ AI-powered trip planner

### Guide Features
- ✅ Guide dashboard
- ✅ Manage bookings
- ✅ Set availability
- ✅ View earnings and statistics

### UI/UX
- ✅ Modern, responsive design
- ✅ Smooth animations (Framer Motion)
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling
- ✅ Mobile-first approach

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **React Icons** - Icons
- **Date-fns** - Date formatting

## 📝 Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_APP_NAME=TouristGuide
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔐 Authentication Flow

1. User registers/logs in
2. JWT token stored in localStorage
3. Token included in API requests via axios interceptor
4. Protected routes check authentication
5. Role-based routing enforced

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

## 🎨 Design System

- **Primary Color**: `#3B82F6` (Blue)
- **Secondary Color**: `#10B981` (Emerald)
- **Accent Color**: `#8B5CF6` (Violet)
- **Font**: Inter
- **Border Radius**: 12px (cards), 8px (buttons)

## 🚧 Development Notes

- All API calls use axios interceptors for error handling
- Toast notifications for user feedback
- Loading states for async operations
- Form validation with React Hook Form
- Protected routes with role checking

## 📚 API Integration

All API calls are centralized in `src/api/`:
- `auth.js` - Authentication endpoints
- `index.js` - All API functions
- `axios.js` - Axios configuration with interceptors

## 🐛 Troubleshooting

### Port already in use
Change port in `vite.config.js`:
```js
server: {
  port: 3001, // Change to available port
}
```

### API connection issues
- Ensure backend is running on `http://localhost:4000`
- Check `VITE_API_BASE_URL` in `.env`
- Check CORS settings in backend

## 📄 License

MIT





