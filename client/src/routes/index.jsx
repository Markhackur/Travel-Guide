import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/common/ProtectedRoute";

// Layout
import EnhancedLayout from "../routes/EnhancedLayout";

// Auth pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Traveller pages
import TravellerDashboard from "../pages/traveller/Dashboard";
import ExploreAttractions from "../pages/traveller/ExploreAttractions";
import MyBookings from "../pages/traveller/MyBookings";
import MyItineraries from "../pages/traveller/MyItineraries";
import AIPlanner from "../pages/traveller/AIPlanner";

// Guide pages
import GuideDashboard from "../pages/guide/Dashboard";
import GuideBookings from "../pages/guide/Bookings";
import GuideAvailability from "../pages/guide/Availability";

// Common
import Profile from "../pages/Profile"; 

const AppRoutes = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <EnhancedLayout />
            </ProtectedRoute>
          }
        >
          {/* ✅ Traveller */}
          <Route path="dashboard" element={<TravellerDashboard />} />
          <Route path="explore" element={<ExploreAttractions />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="itineraries" element={<MyItineraries />} />
          <Route path="ai-planner" element={<AIPlanner />} />

          {/* ✅ Guide */}
          <Route path="guide/dashboard" element={<GuideDashboard />} />
          <Route path="guide/bookings" element={<GuideBookings />} />
          <Route path="guide/availability" element={<GuideAvailability />} />

          {/* ✅ Common */}
          <Route path="profile" element={<Profile />} />

          {/* Default */}
          <Route index element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;
