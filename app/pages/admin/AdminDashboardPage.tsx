import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Users, Building, Workflow, Settings, TrendingUp, AlertTriangle, BookCopy } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('admin.dashboard.totalUsers'),
      value: '156',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: t('admin.dashboard.totalOffices'),
      value: '24',
      icon: Building,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+2',
      changeType: 'positive'
    },
    {
      title: t('admin.dashboard.activeWorkflows'),
      value: '89',
      icon: Workflow,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Pending Approvals',
      value: '12',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '-3',
      changeType: 'negative'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'user_created',
      message: 'New user "John Doe" created',
      time: '2 hours ago',
      user: 'Admin'
    },
    {
      id: 2,
      type: 'workflow_updated',
      message: 'Business registration workflow updated',
      time: '4 hours ago',
      user: 'Admin'
    },
    {
      id: 3,
      type: 'office_created',
      message: 'New office "Gampaha DS" added',
      time: '6 hours ago',
      user: 'Admin'
    },
    {
      id: 4,
      type: 'system_alert',
      message: 'System backup completed successfully',
      time: '8 hours ago',
      user: 'System'
    }
  ];

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'Add, edit, or remove system users',
      icon: Users,
      href: '/admin/users',
      color: 'text-blue-600'
    },
    {
      title: 'Manage Offices',
      description: 'Configure office locations and settings',
      icon: Building,
      href: '/admin/offices',
      color: 'text-green-600'
    },
    {
      title: 'Workflow Management',
      description: 'Create and configure service workflows',
      icon: Workflow,
      href: '/admin/workflows',
      color: 'text-purple-600'
    },
    {
      title: 'Manage Subjects',
      description: 'Define subjects like Land Registry, Business Registration, etc.',
      icon: BookCopy,
      href: '/admin/subjects',
      color: 'text-teal-600'
    },
    {
      title: 'Manage Sections',
      description: 'Configure workflow sections, permissions, and users',
      icon: Settings,
      href: '/admin/sections',
      color: 'text-orange-600'
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences and branding',
      icon: Settings,
      href: '/admin/settings',
      color: 'text-gray-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('admin.dashboard.title')}
        </h1>
        <p className="text-gray-600">
          {t('admin.dashboard.systemOverview')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('admin.dashboard.recentActivity')}
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">
                    {activity.time} • {activity.user}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="secondary"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => window.location.href = action.href}
                >
                  <Icon className={`h-5 w-5 mr-3 ${action.color}`} />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{action.title}</div>
                    <div className="text-sm text-gray-500">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* System Health */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-900">System Status</p>
            <p className="text-xs text-green-600">All systems operational</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">99.9%</div>
            <p className="text-sm font-medium text-blue-900">Uptime</p>
            <p className="text-xs text-blue-600">Last 30 days</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-yellow-900">Alerts</p>
            <p className="text-xs text-yellow-600">2 pending notifications</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;