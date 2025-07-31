import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Plus, Edit, Trash2, Search, MapPin } from 'lucide-react';

interface Office {
  id: string;
  name: string;
  code: string;
  address: string;
  contactNumber: string;
  email: string;
  status: 'active' | 'inactive';
  userCount: number;
  createdAt: string;
}

const AdminOfficeManagementPage: React.FC = () => {
  const [offices, setOffices] = useState<Office[]>([
    {
      id: '1',
      name: 'Colombo Divisional Secretariat',
      code: 'COL',
      address: '123 Main Street, Colombo 01',
      contactNumber: '+94 11 234 5678',
      email: 'colombo.ds@gov.lk',
      status: 'active',
      userCount: 45,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Gampaha Divisional Secretariat',
      code: 'GAM',
      address: '456 Central Road, Gampaha',
      contactNumber: '+94 33 234 5678',
      email: 'gampaha.ds@gov.lk',
      status: 'active',
      userCount: 32,
      createdAt: '2024-01-02'
    },
    {
      id: '3',
      name: 'Kalutara Divisional Secretariat',
      code: 'KAL',
      address: '789 Beach Road, Kalutara',
      contactNumber: '+94 34 234 5678',
      email: 'kalutara.ds@gov.lk',
      status: 'active',
      userCount: 28,
      createdAt: '2024-01-03'
    },
    {
      id: '4',
      name: 'Ratnapura Divisional Secretariat',
      code: 'RAT',
      address: '321 Gem City Road, Ratnapura',
      contactNumber: '+94 45 234 5678',
      email: 'ratnapura.ds@gov.lk',
      status: 'inactive',
      userCount: 0,
      createdAt: '2024-01-04'
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const { t } = useTranslation();

  const filteredOffices = offices.filter(office => {
    const matchesSearch = office.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         office.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         office.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || office.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateOffice = (officeData: Partial<Office>) => {
    const newOffice: Office = {
      id: Date.now().toString(),
      name: officeData.name || '',
      code: officeData.code || '',
      address: officeData.address || '',
      contactNumber: officeData.contactNumber || '',
      email: officeData.email || '',
      status: 'active',
      userCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setOffices(prev => [...prev, newOffice]);
    setShowCreateForm(false);
  };

  const handleUpdateOffice = (officeId: string, officeData: Partial<Office>) => {
    setOffices(prev => prev.map(office => 
      office.id === officeId ? { ...office, ...officeData } : office
    ));
    setEditingOffice(null);
  };

  const handleDeleteOffice = (officeId: string) => {
    if (window.confirm('Are you sure you want to delete this office?')) {
      setOffices(prev => prev.filter(office => office.id !== officeId));
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
            {t('admin.offices.title')}
          </h1>
          <p className="text-gray-600">Manage office locations and their settings</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.offices.createOffice')}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by office name, code, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex space-x-2">
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

      {/* Offices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffices.map((office) => (
          <Card key={office.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{office.name}</h3>
                  <p className="text-sm text-gray-500">Code: {office.code}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(office.status)}`}>
                {office.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-sm text-gray-900">{office.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="text-sm text-gray-900">{office.contactNumber}</p>
                <p className="text-sm text-gray-900">{office.email}</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">Users</p>
                  <p className="text-sm font-medium text-gray-900">{office.userCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-sm text-gray-900">{office.createdAt}</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingOffice(office)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteOffice(office.id)}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredOffices.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No offices found matching your criteria.</p>
        </Card>
      )}

      {/* Create/Edit Office Modal */}
      {(showCreateForm || editingOffice) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingOffice ? t('admin.offices.editOffice') : t('admin.offices.createOffice')}
            </h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Office Name
                </label>
                <Input
                  value={editingOffice?.name || ''}
                  onChange={(e) => editingOffice && setEditingOffice({...editingOffice, name: e.target.value})}
                  placeholder={t('admin.offices.officeNamePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Office Code
                </label>
                <Input
                  value={editingOffice?.code || ''}
                  onChange={(e) => editingOffice && setEditingOffice({...editingOffice, code: e.target.value})}
                  placeholder="e.g., COL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <Input
                  value={editingOffice?.address || ''}
                  onChange={(e) => editingOffice && setEditingOffice({...editingOffice, address: e.target.value})}
                  placeholder="Enter office address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <Input
                  value={editingOffice?.contactNumber || ''}
                  onChange={(e) => editingOffice && setEditingOffice({...editingOffice, contactNumber: e.target.value})}
                  placeholder="+94 XX XXX XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={editingOffice?.email || ''}
                  onChange={(e) => editingOffice && setEditingOffice({...editingOffice, email: e.target.value})}
                  placeholder="office@gov.lk"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingOffice(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (editingOffice) {
                      handleUpdateOffice(editingOffice.id, editingOffice);
                    } else {
                      handleCreateOffice({});
                    }
                  }}
                  className="flex-1"
                >
                  {editingOffice ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminOfficeManagementPage;
