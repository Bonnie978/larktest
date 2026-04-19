import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

const Overview = React.lazy(() => import('./pages/Overview'));
const Lines = React.lazy(() => import('./pages/Lines'));
const Equipment = React.lazy(() => import('./pages/Equipment'));
const Quality = React.lazy(() => import('./pages/Quality'));
const Orders = React.lazy(() => import('./pages/Orders'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

const Loading = () => (
  <div className="flex items-center justify-center h-full text-text-secondary">
    加载中...
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/lines" element={<Lines />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/quality" element={<Quality />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
