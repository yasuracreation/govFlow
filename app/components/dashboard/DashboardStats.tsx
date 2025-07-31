import React from 'react';
import { useAuth } from '../../hooks/useAuth.tsx';
import { UserRole } from '../../types.ts';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Building,
  TrendingUp,
  Activity
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  color 
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive': return '↗';
      case 'negative': return '↘';
      default: return '→';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${getChangeColor()}`}>
              <span className="mr-1">{getChangeIcon()}</span>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const DashboardStats: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Role-based statistics
  const getStats = () => {
    switch (user.role) {
      case UserRole.FRONT_DESK:
        return [
          {
            title: 'New Requests Today',
            value: 12,
            change: '+15% from yesterday',
            changeType: 'positive' as const,
            icon: <FileText size={24} className="text-white" />,
            color: 'bg-blue-500'
          },
          {
            title: 'Pending Intake',
            value: 3,
            change: '-2 from yesterday',
            changeType: 'positive' as const,
            icon: <Clock size={24} className="text-white" />,
            color: 'bg-yellow-500'
          },
          {
            title: 'Completed Today',
            value: 8,
            change: '+20% from yesterday',
            changeType: 'positive' as const,
            icon: <CheckCircle size={24} className="text-white" />,
            color: 'bg-green-500'
          },
          {
            title: 'Average Processing Time',
            value: '2.3 days',
            change: '-0.5 days',
            changeType: 'positive' as const,
            icon: <TrendingUp size={24} className="text-white" />,
            color: 'bg-purple-500'
          }
        ];

      case UserRole.OFFICER:
        return [
          {
            title: 'Assigned Tasks',
            value: 7,
            change: '+2 from yesterday',
            changeType: 'neutral' as const,
            icon: <FileText size={24} className="text-white" />,
            color: 'bg-blue-500'
          },
          {
            title: 'In Progress',
            value: 3,
            change: 'No change',
            changeType: 'neutral' as const,
            icon: <Clock size={24} className="text-white" />,
            color: 'bg-yellow-500'
          },
          {
            title: 'Completed This Week',
            value: 15,
            change: '+3 from last week',
            changeType: 'positive' as const,
            icon: <CheckCircle size={24} className="text-white" />,
            color: 'bg-green-500'
          },
          {
            title: 'Overdue Tasks',
            value: 1,
            change: '-1 from yesterday',
            changeType: 'positive' as const,
            icon: <AlertTriangle size={24} className="text-white" />,
            color: 'bg-red-500'
          }
        ];

      case UserRole.SECTION_HEAD:
        return [
          {
            title: 'Section Tasks',
            value: 24,
            change: '+5 from yesterday',
            changeType: 'neutral' as const,
            icon: <FileText size={24} className="text-white" />,
            color: 'bg-blue-500'
          },
          {
            title: 'Pending Approvals',
            value: 6,
            change: '+2 from yesterday',
            changeType: 'negative' as const,
            icon: <Clock size={24} className="text-white" />,
            color: 'bg-yellow-500'
          },
          {
            title: 'Section Performance',
            value: '94%',
            change: '+2% from last month',
            changeType: 'positive' as const,
            icon: <TrendingUp size={24} className="text-white" />,
            color: 'bg-green-500'
          },
          {
            title: 'Team Members',
            value: 8,
            change: 'No change',
            changeType: 'neutral' as const,
            icon: <Users size={24} className="text-white" />,
            color: 'bg-purple-500'
          }
        ];

      case UserRole.DEPARTMENT_HEAD:
        return [
          {
            title: 'Total Requests',
            value: 156,
            change: '+12 from yesterday',
            changeType: 'positive' as const,
            icon: <FileText size={24} className="text-white" />,
            color: 'bg-blue-500'
          },
          {
            title: 'Pending Approvals',
            value: 8,
            change: '+3 from yesterday',
            changeType: 'negative' as const,
            icon: <Clock size={24} className="text-white" />,
            color: 'bg-yellow-500'
          },
          {
            title: 'Department Performance',
            value: '91%',
            change: '+3% from last month',
            changeType: 'positive' as const,
            icon: <TrendingUp size={24} className="text-white" />,
            color: 'bg-green-500'
          },
          {
            title: 'Active Offices',
            value: 6,
            change: 'No change',
            changeType: 'neutral' as const,
            icon: <Building size={24} className="text-white" />,
            color: 'bg-purple-500'
          }
        ];

      case UserRole.ADMIN:
        return [
          {
            title: 'Total Users',
            value: 45,
            change: '+2 this month',
            changeType: 'positive' as const,
            icon: <Users size={24} className="text-white" />,
            color: 'bg-blue-500'
          },
          {
            title: 'Active Workflows',
            value: 12,
            change: '+1 this week',
            changeType: 'positive' as const,
            icon: <Activity size={24} className="text-white" />,
            color: 'bg-green-500'
          },
          {
            title: 'System Uptime',
            value: '99.9%',
            change: '+0.1% from last month',
            changeType: 'positive' as const,
            icon: <TrendingUp size={24} className="text-white" />,
            color: 'bg-purple-500'
          },
          {
            title: 'Total Offices',
            value: 8,
            change: 'No change',
            changeType: 'neutral' as const,
            icon: <Building size={24} className="text-white" />,
            color: 'bg-yellow-500'
          }
        ];

      default:
        return [];
    }
  };

  const stats = getStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
};

export default DashboardStats; 