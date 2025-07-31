import { API_BASE_URL } from '../apiConfig';
import { Section } from '../types';

const SECTIONS_URL = `${API_BASE_URL}/sections`;

export async function getSections(): Promise<Section[]> {
  const res = await fetch(SECTIONS_URL, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to fetch sections');
  return res.json();
}

export async function getSectionById(id: string): Promise<Section> {
  const res = await fetch(`${SECTIONS_URL}/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to fetch section');
  return res.json();
}

export async function createSection(section: Omit<Section, 'id'>): Promise<Section> {
  const res = await fetch(SECTIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(section)
  });
  if (!res.ok) throw new Error('Failed to create section');
  return res.json();
}

export async function updateSection(id: string, section: Partial<Section>): Promise<Section> {
  const res = await fetch(`${SECTIONS_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(section)
  });
  if (!res.ok) throw new Error('Failed to update section');
  return res.json();
}

export async function deleteSection(id: string): Promise<void> {
  const res = await fetch(`${SECTIONS_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to delete section');
} 