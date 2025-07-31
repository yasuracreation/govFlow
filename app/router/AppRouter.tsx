import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '../hooks/useAuth.tsx'; // Updated import path
import Header from '@/components/layout/Header.tsx';
import Sidebar from '@/components/layout/Sidebar.tsx';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import IntakePage from '@/pages/IntakePage';
import TaskQueuePage from '@/pages/TaskQueuePage';
import TaskDetailPage from '@/pages/TaskDetailPage';
import RequestDetailPage from '@/pages/RequestDetailPage';
import CommandCenterPage from '@/pages/CommandCenterPage';
import FileUploadTestPage from '@/pages/FileUploadTestPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminUserManagementPage from '@/pages/admin/AdminUserManagementPage';
import AdminOfficeManagementPage from '@/pages/admin/AdminOfficeManagementPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';
import AdminTemplateManagementPage from '@/pages/admin/AdminTemplateManagementPage';
import AdminWorkflowManagementPage from '@/pages/admin/AdminWorkflowManagementPage';
import AdminSectionManagementPage from '@/pages/admin/AdminSectionManagementPage';
import AdminSubjectManagementPage from '@/pages/admin/AdminSubjectManagementPage';
import NotFoundPage from '@/pages/NotFoundPage';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />; // Or a dedicated "Access Denied" page
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AppRouter: React.FC = () => {
  const { user, loading } = useAuth();
  
  if (loading) { // Show full page loader while loading
      return <div className="flex justify-center items-center h-screen"><div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Dashboard - All authenticated users */}
        <Route element={<ProtectedRoute allowedRoles={['FRONT_DESK', 'OFFICER', 'SECTION_HEAD', 'DEPARTMENT_HEAD', 'ADMIN']} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* New Request Creation - Available to all users except admin */}
        <Route element={<ProtectedRoute allowedRoles={['FRONT_DESK', 'OFFICER', 'SECTION_HEAD', 'DEPARTMENT_HEAD']} />}>
          <Route path="/intake/new" element={<IntakePage />} />
        </Route>

        {/* Officers and Section Heads - Task Management */}
        <Route element={<ProtectedRoute allowedRoles={['OFFICER', 'SECTION_HEAD']} />}>
          <Route path="/tasks" element={<TaskQueuePage />} />
          <Route path="/tasks/:serviceRequestId" element={<TaskDetailPage />} />
        </Route>

        {/* Department Head - Command Center */}
        <Route element={<ProtectedRoute allowedRoles={['DEPARTMENT_HEAD']} />}>
          <Route path="/command-center" element={<CommandCenterPage />} />
          <Route path="/command-center/:serviceRequestId" element={<RequestDetailPage />} />
        </Route>

        {/* Admin - All Admin Functions */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/workflows" element={<AdminWorkflowManagementPage />} />
          <Route path="/admin/users" element={<AdminUserManagementPage />} />
          <Route path="/admin/offices" element={<AdminOfficeManagementPage />} />
          <Route path="/admin/templates" element={<AdminTemplateManagementPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/sections" element={<AdminSectionManagementPage />} />
          <Route path="/admin/subjects" element={<AdminSubjectManagementPage />} />
        </Route>
        
        {/* Test Route - Remove in production */}
        <Route path="/test-upload" element={<FileUploadTestPage />} />
        
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  );
};

export default AppRouter;