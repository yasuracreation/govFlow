import { API_BASE_URL } from '../apiConfig';
import { Office } from '../types';

const OFFICES_URL = `${API_BASE_URL}/offices`;

export async function getOffices(): Promise<Office[]> {
  const res = await fetch(OFFICES_URL, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to fetch offices');
  return res.json();
}

export async function getOfficeById(id: string): Promise<Office> {
  const res = await fetch(`${OFFICES_URL}/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to fetch office');
  return res.json();
}

export async function createOffice(office: Omit<Office, 'id'>): Promise<Office> {
  const res = await fetch(OFFICES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(office)
  });
  if (!res.ok) throw new Error('Failed to create office');
  return res.json();
}

export async function updateOffice(id: string, office: Partial<Office>): Promise<Office> {
  const res = await fetch(`${OFFICES_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(office)
  });
  if (!res.ok) throw new Error('Failed to update office');
  return res.json();
}

export async function deleteOffice(id: string): Promise<void> {
  const res = await fetch(`${OFFICES_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to delete office');
} 