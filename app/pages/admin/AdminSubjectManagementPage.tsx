import React, { useState, useEffect } from 'react';
import { Subject } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { PlusCircle, Edit, Trash2, X } from 'lucide-react';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Textarea from '@/components/common/Textarea';
import CustomAlert from '../../components/common/CustomAlert';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../../services/subjectService';

const AdminSubjectManagementPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string; show: boolean } | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const fetchedSubjects = await getSubjects();
        setSubjects(fetchedSubjects);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        setAlert({ type: 'error', message: 'Failed to load subjects. Please try again.', show: true });
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const openModal = (subject: Subject | null = null) => {
    setCurrentSubject(subject);
    setSubjectName(subject ? subject.name : '');
    setSubjectDescription(subject ? subject.description || '' : '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentSubject(null);
    setSubjectName('');
    setSubjectDescription('');
  };

  const handleSave = async () => {
    if (!subjectName.trim()) {
      setAlert({ type: 'error', message: 'Subject name is required.', show: true });
      return;
    }

    try {
      if (currentSubject) {
        // Edit existing subject
        const updatedSubject = await updateSubject(currentSubject.id, {
          name: subjectName,
          description: subjectDescription
        });
        setSubjects(prev => prev.map(s => s.id === currentSubject.id ? updatedSubject : s));
        setAlert({ type: 'success', message: 'Subject updated successfully!', show: true });
      } else {
        // Add new subject
        const newSubject = await createSubject({
          name: subjectName,
          description: subjectDescription
        });
        setSubjects(prev => [...prev, newSubject]);
        setAlert({ type: 'success', message: 'Subject created successfully!', show: true });
      }
      closeModal();
    } catch (error) {
      console.error('Error saving subject:', error);
      setAlert({ type: 'error', message: 'Failed to save subject. Please try again.', show: true });
    }
  };

  const handleDelete = async (subjectId: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await deleteSubject(subjectId);
        setSubjects(prev => prev.filter(s => s.id !== subjectId));
        setAlert({ type: 'success', message: 'Subject deleted successfully!', show: true });
      } catch (error) {
        console.error('Error deleting subject:', error);
        setAlert({ type: 'error', message: 'Failed to delete subject. Please try again.', show: true });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {alert && (
        <CustomAlert
          type={alert.type}
          message={alert.message}
          show={alert.show}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Subjects</h1>
          <Button onClick={() => openModal()} variant="primary" className="flex items-center">
            <PlusCircle className="mr-2 h-5 w-5" /> Add Subject
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <tr key={subject.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openModal(subject)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(subject.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    No subjects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{currentSubject ? 'Edit Subject' : 'Add New Subject'}</h2>
            <div className="space-y-4">
              <Input
                label="Subject Name"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g., Land Registration"
                required
              />
              <Textarea
                label="Description"
                value={subjectDescription}
                onChange={(e) => setSubjectDescription(e.target.value)}
                placeholder="A brief description of the subject."
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button onClick={closeModal} variant="secondary">
                <X className="mr-2 h-5 w-5" /> Cancel
              </Button>
              <Button onClick={handleSave} variant="primary">
                Save Subject
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminSubjectManagementPage; 