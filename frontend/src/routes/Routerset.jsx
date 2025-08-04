import React from 'react'
import { Routes, Route } from "react-router-dom";
import { Dashboard } from '../pages/dashboard/Dashboard.jsx';
import LoginForm from '../pages/login/Login.jsx';
import SignupForm from '../pages/signup/Signup.jsx';
import LandingPage from '../pages/landingPage/LandingPage.jsx';

export const Routerset = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm/>}/>
      <Route path="/signup" element={<SignupForm/>}/>
      <Route path="/" element={<LandingPage/>}/>
      <Route path="/dashboard" element={<Dashboard/>}/>
    </Routes>
  );
}
