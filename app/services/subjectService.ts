import { API_BASE_URL } from '../apiConfig';
import { Subject } from '../types';

const SUBJECTS_URL = `${API_BASE_URL}/subjects`;

export async function getSubjects(): Promise<Subject[]> {
  const res = await fetch(SUBJECTS_URL, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to fetch subjects');
  return res.json();
}

export async function getSubjectById(id: string): Promise<Subject> {
  const res = await fetch(`${SUBJECTS_URL}/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to fetch subject');
  return res.json();
}

export async function createSubject(subject: Omit<Subject, 'id'>): Promise<Subject> {
  const res = await fetch(SUBJECTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(subject)
  });
  if (!res.ok) throw new Error('Failed to create subject');
  return res.json();
}

export async function updateSubject(id: string, subject: Partial<Subject>): Promise<Subject> {
  const res = await fetch(`${SUBJECTS_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(subject)
  });
  if (!res.ok) throw new Error('Failed to update subject');
  return res.json();
}

export async function deleteSubject(id: string): Promise<void> {
  const res = await fetch(`${SUBJECTS_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to delete subject');
}

export async function fetchSubjectsByUserId(userId: string): Promise<Subject[]> {
  const res = await fetch(`${SUBJECTS_URL}?userId=${userId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to fetch subjects for user');
  return res.json();
} 