import { API_BASE_URL } from '../apiConfig';
import { User } from '../types';

const USERS_URL = `${API_BASE_URL}/users`;

export async function getUsers(): Promise<User[]> {
  const res = await fetch(USERS_URL, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function getUserById(id: string): Promise<User> {
  const res = await fetch(`${USERS_URL}/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function updateUserRole(id: string, role: string, subject: string): Promise<User> {
  const res = await fetch(`${USERS_URL}/${id}/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ role, subject })
  });
  if (!res.ok) throw new Error('Failed to update user role');
  return res.json();
}

export async function createUser(user: Partial<User>): Promise<User> {
  const res = await fetch(USERS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(user)
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
}

export async function updateUser(id: string, user: Partial<User>): Promise<User> {
  const res = await fetch(`${USERS_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(user)
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${USERS_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to delete user');
} 