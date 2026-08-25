import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { GISMapPage } from './pages/GISMapPage';
import { HabitationsPage } from './pages/HabitationsPage';
import { HabitationDetailPage } from './pages/HabitationDetailPage';
import { HazardsPage } from './pages/HazardsPage';
import { RelocationEnginePage } from './pages/RelocationEnginePage';
import { SafeSitesPage } from './pages/SafeSitesPage';
import { CarryingCapacityPage } from './pages/CarryingCapacityPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { DataIngestionPage } from './pages/DataIngestionPage';
import { ExpertValidationPage } from './pages/ExpertValidationPage';
import { AdminPage } from './pages/AdminPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing & Auth Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Dashboard Command Center Routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/map" element={<GISMapPage />} />
                <Route path="/habitations" element={<HabitationsPage />} />
                <Route path="/habitations/:id" element={<HabitationDetailPage />} />
                <Route path="/hazards" element={<HazardsPage />} />
                <Route path="/relocation" element={<RelocationEnginePage />} />
                <Route path="/sites" element={<SafeSitesPage />} />
                <Route path="/capacity" element={<CarryingCapacityPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/data" element={<DataIngestionPage />} />
                <Route path="/validation" element={<ExpertValidationPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
