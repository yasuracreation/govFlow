import React, { useState, useEffect } from 'react';
import { Section } from '../../types';

const DEFAULT_PERMISSIONS = {
  canApprove: true,
  canFillData: true,
  canUploadDocuments: true,
  canAssign: true,
};

const MOCK_USERS = [
  { id: 'user1', name: 'Officer A' },
  { id: 'user2', name: 'Officer B' },
  { id: 'user3', name: 'Section Head X' },
  { id: 'user4', name: 'Section Head Y' },
];

const MOCK_SERVICES = [
  { id: 'service1', name: 'Birth Certificate' },
  { id: 'service2', name: 'Marriage Certificate' },
  { id: 'service3', name: 'Death Certificate' },
];

const AdminSectionManagementPage: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('govflow_sections');
    if (stored) {
      try {
        setSections(JSON.parse(stored));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('govflow_sections', JSON.stringify(sections));
  }, [sections]);

  const handleSave = () => {
    if (!editingSection?.name.trim()) return;
    setSections(prev => {
      const exists = prev.find(s => s.id === editingSection.id);
      if (exists) {
        return prev.map(s => s.id === editingSection.id ? editingSection : s);
      } else {
        return [...prev, editingSection];
      }
    });
    setShowModal(false);
    setEditingSection(null);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this section?')) return;
    setSections(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Section Management</h1>
        <button
          onClick={() => {
            setEditingSection({
              id: `section-${Date.now()}`,
              name: '',
              description: '',
              permissions: { ...DEFAULT_PERMISSIONS },
              services: [],
              users: [],
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Section
        </button>
      </div>
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {sections.map(section => (
              <tr key={section.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{section.name}</td>
                <td className="px-4 py-2 text-gray-700">{section.description}</td>
                <td className="px-4 py-2 text-xs">
                  {Object.entries(section.permissions).map(([k, v]) => v && (
                    <span key={k} className="inline-block bg-blue-100 text-blue-700 rounded px-2 py-1 mr-1 mb-1">{k.replace('can', '')}</span>
                  ))}
                </td>
                <td className="px-4 py-2 text-xs">
                  {section.services.map(sid => MOCK_SERVICES.find(s => s.id === sid)?.name).filter(Boolean).join(', ')}
                </td>
                <td className="px-4 py-2 text-xs">
                  {section.users.map(uid => MOCK_USERS.find(u => u.id === uid)?.name).filter(Boolean).join(', ')}
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => {
                      setEditingSection(section);
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-2"
                  >Edit</button>
                  <button
                    onClick={() => handleDelete(section.id)}
                    className="text-red-600 hover:text-red-900"
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && editingSection && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">{editingSection.id.startsWith('section-') ? 'Add Section' : 'Edit Section'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingSection.name}
                  onChange={e => setEditingSection(s => s ? { ...s, name: e.target.value } : s)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingSection.description}
                  onChange={e => setEditingSection(s => s ? { ...s, description: e.target.value } : s)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                <div className="flex flex-wrap gap-4">
                  {Object.keys(DEFAULT_PERMISSIONS).map(key => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={!!editingSection.permissions[key as keyof typeof DEFAULT_PERMISSIONS]}
                        onChange={e => setEditingSection(s => s ? {
                          ...s,
                          permissions: {
                            ...s.permissions,
                            [key]: e.target.checked
                          }
                        } : s)}
                      />
                      <span className="text-sm">{key.replace('can', '')}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
                <select
                  multiple
                  value={editingSection.services}
                  onChange={e => {
                    const options = Array.from(e.target.selectedOptions).map(o => o.value);
                    setEditingSection(s => s ? { ...s, services: options } : s);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {MOCK_SERVICES.map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Users</label>
                <select
                  multiple
                  value={editingSection.users}
                  onChange={e => {
                    const options = Array.from(e.target.selectedOptions).map(o => o.value);
                    setEditingSection(s => s ? { ...s, users: options } : s);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {MOCK_USERS.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => { setShowModal(false); setEditingSection(null); }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >Cancel</button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSectionManagementPage; 