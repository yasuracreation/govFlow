import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { UserRole, User, Subject } from '@/types';
import UserForm from '../../components/admin/UserForm';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/userService';
import { getSubjects } from '../../services/subjectService';

const AdminUserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUsersAndSubjects = async () => {
      try {
        const [usersFromApi, subjectsFromApi] = await Promise.all([
          getUsers(),
          getSubjects()
        ]);
        // Map backend users to frontend User type
        const mappedUsers = usersFromApi.map((u: any) => ({
          id: u.id,
          name: u.name,
          role: u.role,
          employeeId: u.employeeId || '',
          nic: u.nic || '',
          officeId: u.officeId || '',
          officeName: u.officeName || '',
          subjectIds: u.subjectIds || [],
          // Fallbacks for UI fields
          email: u.email || '',
          status: u.status || 'active',
          lastLogin: u.lastLogin || '',
        }));
        setUsers(mappedUsers);
        setSubjects(subjectsFromApi);
      } catch (error) {
        setUsers([]);
        setSubjects([]);
      }
    };
    fetchUsersAndSubjects();
  }, []);

  const refreshUsers = async () => {
    try {
      const usersFromApi = await getUsers();
      setUsers(usersFromApi);
    } catch {
      setUsers([]);
    }
  };

  const roles = [
    { value: UserRole.FRONT_DESK, label: t('roles.frontDesk') },
    { value: UserRole.OFFICER, label: t('roles.officer') },
    { value: UserRole.SECTION_HEAD, label: t('roles.sectionHead') },
    { value: UserRole.DEPARTMENT_HEAD, label: t('roles.departmentHead') },
    { value: UserRole.ADMIN, label: t('roles.admin') }
  ];

  const offices = [
    { value: 'colombo', label: 'Colombo DS' },
    { value: 'gampaha', label: 'Gampaha DS' },
    { value: 'kalutara', label: 'Kalutara DS' },
    { value: 'ratnapura', label: 'Ratnapura DS' }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateNew = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, userData);
      } else {
        await createUser(userData);
      }
      setIsFormOpen(false);
      setEditingUser(null);
      await refreshUsers();
    } catch (error) {
      alert('Failed to save user.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        await refreshUsers();
      } catch {
        alert('Failed to delete user.');
      }
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'text-red-600 bg-red-100';
      case UserRole.DEPARTMENT_HEAD: return 'text-purple-600 bg-purple-100';
      case UserRole.SECTION_HEAD: return 'text-blue-600 bg-blue-100';
      case UserRole.OFFICER: return 'text-green-600 bg-green-100';
      case UserRole.FRONT_DESK: return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'text-green-600 bg-green-100' 
      : 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('admin.users.title')}
          </h1>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.users.createUser')}
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, employee ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.employeeId')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.role')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.office')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.employeeId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {roles.find(r => r.value === user.role)?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.officeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {user.subjectIds && user.subjectIds.length > 0
                        ? user.subjectIds.map(id => {
                            const subject = subjects.find(s => s.id === id);
                            return subject ? <span key={id} className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs">{subject.name}</span> : null;
                          })
                        : <span className="text-xs text-gray-400">N/A</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastLogin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-900">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900 ml-2">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {isFormOpen && (
        <UserForm
          user={editingUser}
          onSave={handleSaveUser}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingUser(null);
          }}
          roles={roles}
          offices={offices}
          subjects={subjects}
        />
      )}
    </div>
  );
};

export default AdminUserManagementPage;
