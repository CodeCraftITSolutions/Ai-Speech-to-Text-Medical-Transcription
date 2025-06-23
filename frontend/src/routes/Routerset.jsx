import React from 'react'
import { Routes, Route } from "react-router";
import Home from '../pages/home/Home.jsx';

export const Routerset = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />}>
        {/* <Route index element={<Home />} />
        <Route path="settings" element={<Settings />} /> */}
      </Route>
    </Routes>
  );
}
