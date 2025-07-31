import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import Card from '../components/common/Card.tsx';
import DashboardStats from '../components/dashboard/DashboardStats.tsx';
import { UserRole, TaskSummary, Subject } from '../types.ts';
import { fetchTasksByUserId } from '../services/taskService.ts';
import { fetchSubjectsByUserId } from '../services/subjectService.ts';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Users, 
  TrendingUp,
  Activity,
  Calendar,
  MapPin
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    if (user) {
      fetchTasksByUserId(user.id).then(setTasks).catch(console.error);
      fetchSubjectsByUserId(user.id).then(setSubjects).catch(console.error);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="ml-4 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Not logged in</h1>
          <p className="text-gray-600">Please log in to access the dashboard.</p>
          <button 
            onClick={() => window.location.hash = '/login'} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Check if user role is valid by checking against enum keys
  const validRoles = Object.keys(UserRole);
  if (!validRoles.includes(user.role)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Unknown role: {user.role}</h1>
          <p className="text-gray-600 mb-4">The user role is not recognized by the system.</p>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-w-2xl">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';
    else greeting = 'Good evening';

    return `${greeting}, ${user.name}`;
  };

  const getRoleDescription = () => {
    switch (user.role) {
      case UserRole.FRONT_DESK:
        return 'Manage citizen service requests and intake processes';
      case UserRole.OFFICER:
        return 'Process assigned tasks and workflow steps';
      case UserRole.SECTION_HEAD:
        return 'Oversee section operations and approve tasks';
      case UserRole.DEPARTMENT_HEAD:
        return 'Monitor department performance and handle escalations';
      case UserRole.ADMIN:
        return 'Manage system configuration and user access';
      default:
        return 'Welcome to GovFlow';
    }
  };

  const getQuickActions = () => {
    switch (user.role) {
      case UserRole.FRONT_DESK:
        return [
          { title: 'New Request', icon: <FileText size={20} />, href: '/intake/new', color: 'bg-blue-500' },
          { title: 'View Queue', icon: <Clock size={20} />, href: '/dashboard', color: 'bg-yellow-500' },
          { title: 'Recent Activity', icon: <Activity size={20} />, href: '/dashboard', color: 'bg-green-500' }
        ];
      case UserRole.OFFICER:
        return [
          { title: 'New Request', icon: <FileText size={20} />, href: '/intake/new', color: 'bg-blue-500' },
          { title: 'My Tasks', icon: <FileText size={20} />, href: '/tasks', color: 'bg-green-500' },
          { title: 'In Progress', icon: <Clock size={20} />, href: '/tasks', color: 'bg-yellow-500' }
        ];
      case UserRole.SECTION_HEAD:
        return [
          { title: 'New Request', icon: <FileText size={20} />, href: '/intake/new', color: 'bg-blue-500' },
          { title: 'Section Tasks', icon: <FileText size={20} />, href: '/tasks', color: 'bg-green-500' },
          { title: 'Pending Approvals', icon: <Clock size={20} />, href: '/tasks', color: 'bg-yellow-500' }
        ];
      case UserRole.DEPARTMENT_HEAD:
        return [
          { title: 'New Request', icon: <FileText size={20} />, href: '/intake/new', color: 'bg-blue-500' },
          { title: 'Command Center', icon: <Activity size={20} />, href: '/command-center', color: 'bg-green-500' },
          { title: 'Department Stats', icon: <TrendingUp size={20} />, href: '/command-center', color: 'bg-purple-500' }
        ];
      case UserRole.ADMIN:
        return [
          { title: 'User Management', icon: <Users size={20} />, href: '/admin/users', color: 'bg-blue-500' },
          { title: 'System Settings', icon: <Activity size={20} />, href: '/admin/settings', color: 'bg-green-500' },
          { title: 'Workflow Management', icon: <FileText size={20} />, href: '/admin/workflows', color: 'bg-purple-500' }
        ];
      default:
        return [];
    }
  };

  const getRecentActivity = () => {
    const activities = [
      {
        id: '1',
        type: 'task_completed',
        title: 'Land transfer request completed',
        description: 'Request #LR001 has been successfully processed',
        timestamp: '2 hours ago',
        user: 'Nimala Perera'
      },
      {
        id: '2',
        type: 'task_assigned',
        title: 'New task assigned',
        description: 'Business permit application assigned to your section',
        timestamp: '4 hours ago',
        user: 'System'
      },
      {
        id: '3',
        type: 'approval_required',
        title: 'Approval required',
        description: 'Document verification requires your approval',
        timestamp: '6 hours ago',
        user: 'Sunil Bandara'
      }
    ];

    return activities;
  };

  return (
    <div className="space-y-6">

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{getWelcomeMessage()}</h1>
          <p className="text-blue-100 text-lg">{getRoleDescription()}</p>
          <div className="mt-4 flex items-center text-sm">
            <Calendar size={16} className="mr-2" />
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>

        {/* Statistics */}
        <DashboardStats />

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getQuickActions().map((action, index) => (
              <button
                key={index}
                onClick={() => window.location.hash = action.href}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                  {React.cloneElement(action.icon, { className: 'text-white' })}
                </div>
                <span className="font-medium text-gray-900">{action.title}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* User's Tasks */}
        <Card title="My Tasks">
          <ul className="divide-y divide-gray-200">
            {tasks.length > 0 ? tasks.map(task => (
              <li key={task.id} className="py-3">
                <p className="font-medium">{task.subjectName}</p>
                <p className="text-sm text-gray-500">{task.currentStepName} - {task.status}</p>
              </li>
            )) : <p>No tasks assigned to you.</p>}
          </ul>
        </Card>

        {/* User's Subjects */}
        <Card title="My Subjects">
          <ul className="divide-y divide-gray-200">
            {subjects.length > 0 ? subjects.map(subject => (
              <li key={subject.id} className="py-3">
                <p className="font-medium">{subject.name}</p>
              </li>
            )) : <p>No subjects assigned to you.</p>}
          </ul>
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Activity">
          <ul className="divide-y divide-gray-200">
            {getRecentActivity().map((activity) => (
              <li key={activity.id} className="py-4">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">{activity.title}</h3>
                      <p className="text-sm text-gray-500">{activity.timestamp}</p>
                    </div>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* System Status (Admin only) */}
        {user.role === UserRole.ADMIN && (
          <Card title="System Status">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">System Status</p>
                  <p className="text-sm text-green-600">All systems operational</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">Database</p>
                  <p className="text-sm text-blue-600">Connected and healthy</p>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
};

export default DashboardPage; 