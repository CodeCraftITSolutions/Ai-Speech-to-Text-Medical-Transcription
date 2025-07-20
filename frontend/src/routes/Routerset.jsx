import React from 'react'
import { Routes, Route } from "react-router";
import {Home} from '../pages/home/Home.jsx';
import { Dashboard } from '../pages/dashboard/Dashboard.jsx';

export const Routerset = () => {
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/dashboard" element={<Dashboard/>}/>
    </Routes>
  );
}
