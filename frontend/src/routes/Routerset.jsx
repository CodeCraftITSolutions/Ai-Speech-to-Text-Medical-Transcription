import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Spin } from "antd";
import LoginForm from "../pages/login/Login.jsx";
import SignupForm from "../pages/signup/Signup.jsx";
import LandingPage from "../pages/landingPage/LandingPage.jsx";
import DashboardLayout from "../layout/DashboardLayout.jsx";
import { Home } from "../pages/home/Home.jsx";
import { NewTranscription } from "../pages/newtranscription/NewTranscription.jsx";
import { History } from "../pages/history/History.jsx";
import { Review } from "../pages/review/Review.jsx";
import { Admin } from "../pages/admin/Admin.jsx";
import { Settings } from "../pages/settings/Settings.jsx";
import { Profile } from "../pages/profile/Profile.jsx";
import ResetPassword from "../pages/resetPassword/ResetPassword.jsx";
import { useUser } from "../context/UserContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useUser();
  const location = useLocation();

  const requiresProfileCompletion = Boolean(
    user && (!user.firstName?.trim() || !user.lastName?.trim())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    requiresProfileCompletion &&
    !location.pathname.startsWith("/dashboard/settings")
  ) {
    return (
      <Navigate
        to="/dashboard/settings"
        replace
        state={{ from: location, requireProfile: true }}
      />
    );
  }

  return children;
};

export const Routerset = () => (
  <Routes>
    <Route path="/login" element={<LoginForm />} />
    <Route path="/signup" element={<SignupForm />} />
    <Route path="/forgot-password" element={<ResetPassword />} />
    <Route path="/" element={<LandingPage />} />
    <Route
      path="/dashboard"
      element={(
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      )}
    >
      <Route index element={<Home />} />
      <Route path="new-transcription" element={<NewTranscription />} />
      <Route path="history" element={<History />} />
      <Route path="review" element={<Review />} />
      <Route path="admin" element={<Admin />} />
      <Route path="profile" element={<Profile />} />
      <Route path="settings" element={<Settings />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
