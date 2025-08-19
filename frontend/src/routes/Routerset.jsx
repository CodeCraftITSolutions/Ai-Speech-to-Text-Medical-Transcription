import React from 'react'
import { Routes, Route } from "react-router-dom";
import LoginForm from "../pages/login/Login.jsx";
import SignupForm from "../pages/signup/Signup.jsx";
import LandingPage from "../pages/landingPage/LandingPage.jsx";
import DashboardLayout from "../layout/DashboardLayout.jsx"
import { Home } from '../pages/home/Home.jsx';
import { NewTranscription } from '../pages/newtranscription/NewTranscription.jsx';
import { History } from '../pages/history/History.jsx';
import { Review } from '../pages/review/Review.jsx';
import { Admin } from '../pages/admin/Admin.jsx';
import { Settings } from '../pages/settings/Settings.jsx';

export const Routerset = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignupForm />} />
      <Route path="/" element={<LandingPage />} />
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Home />} /> {/* default dashboard page */}
        <Route path="new-transcription" element={<NewTranscription />} />
        <Route path="history" element={<History/>} />
        <Route path="review" element={<Review />} />
        <Route path="admin" element={<Admin/>} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};
