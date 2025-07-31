import React, { useState, useEffect } from 'react';
import { UserRole } from '@/hooks/useAuth.tsx';
import { Subject } from '@/types';
import Card from '../common/Card';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { X } from 'lucide-react';

// A local, more detailed User interface for the form
interface UserFormData {
  id?: string;
  employeeId: string;
  name: string;
  role: UserRole;
  office: string;
  email: string;
  subjectIds: string[];
}

interface User {
  id: string;
  employeeId: string;
  name: string;
  role: UserRole;
  office: string;
  email: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  subjectIds?: string[];
}

interface UserFormProps {
  user: User | null;
  onSave: (userData: Partial<User>) => void;
  onCancel: () => void;
  roles: { value: UserRole; label: string }[];
  offices: { value: string; label: string }[];
  subjects: Subject[];
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel, roles, offices, subjects }) => {
  const [formData, setFormData] = useState<UserFormData>({
    employeeId: '',
    name: '',
    email: '',
    role: UserRole.OFFICER,
    office: '',
    subjectIds: [],
  });
  const [subjectSearch, setSubjectSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        office: user.office,
        subjectIds: user.subjectIds || [],
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (subjectId: string) => {
    setFormData(prev => {
      const newSubjectIds = prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter(id => id !== subjectId)
        : [...prev.subjectIds, subjectId];
      return { ...prev, subjectIds: newSubjectIds };
    });
  };

  const handleSelectAllSubjects = () => {
    if (formData.subjectIds.length === filteredSubjects.length) {
      setFormData(prev => ({ ...prev, subjectIds: [] }));
    } else {
      setFormData(prev => ({ ...prev, subjectIds: filteredSubjects.map(s => s.id) }));
    }
  };

  const handleRemoveSubject = (subjectId: string) => {
    setFormData(prev => ({ ...prev, subjectIds: prev.subjectIds.filter(id => id !== subjectId) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation: Front Desk users cannot have subjects
    if (formData.role === UserRole.FRONT_DESK && formData.subjectIds.length > 0) {
      setError('Front Desk users cannot be assigned to any subjects.');
      return;
    }
    setError(null);
    onSave(formData);
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl p-8 max-h-[95vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-semibold mb-6">{user ? 'Edit User' : 'Create New User'}</h2>
          {error && <div className="mb-4 text-red-600 text-sm font-medium">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Employee ID"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              options={roles}
              required
            />
            <Select
              label="Office"
              name="office"
              value={formData.office}
              onChange={handleInputChange}
              options={offices}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
            <div className="flex items-center mb-2 gap-2">
              <input
                type="checkbox"
                checked={formData.subjectIds.length === filteredSubjects.length && filteredSubjects.length > 0}
                onChange={handleSelectAllSubjects}
                className="rounded text-blue-600 focus:ring-blue-500"
                disabled={formData.role === UserRole.FRONT_DESK}
              />
              <span className="text-sm">Select All</span>
              <input
                type="text"
                placeholder="Search subjects..."
                value={subjectSearch}
                onChange={e => setSubjectSearch(e.target.value)}
                className="ml-4 px-2 py-1 border border-gray-300 rounded-md text-sm w-64"
                disabled={formData.role === UserRole.FRONT_DESK}
              />
            </div>
            {formData.subjectIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.subjectIds.map(id => {
                  const subject = subjects.find(s => s.id === id);
                  if (!subject) return null;
                  return (
                    <span key={id} className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {subject.name}
                      <button type="button" className="ml-1" onClick={() => handleRemoveSubject(id)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2 border border-gray-200 rounded-md max-h-48 overflow-y-auto">
              {filteredSubjects.map(subject => (
                <label key={subject.id} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.subjectIds.includes(subject.id)}
                    onChange={() => handleSubjectChange(subject.id)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                    disabled={formData.role === UserRole.FRONT_DESK}
                  />
                  <span>{subject.name}</span>
                </label>
              ))}
              {filteredSubjects.length === 0 && (
                <span className="col-span-4 text-xs text-gray-400">No subjects found.</span>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Save User</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UserForm;
