import { API_BASE_URL } from '../apiConfig';
import { DocumentTemplate } from '../types';

const TEMPLATES_URL = `${API_BASE_URL}/templates`;

export async function getTemplates(): Promise<DocumentTemplate[]> {
  const res = await fetch(TEMPLATES_URL, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
}

export async function getTemplateById(id: string): Promise<DocumentTemplate> {
  const res = await fetch(`${TEMPLATES_URL}/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to fetch template');
  return res.json();
}

export async function createTemplate(template: Omit<DocumentTemplate, 'id'>): Promise<DocumentTemplate> {
  const res = await fetch(TEMPLATES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(template)
  });
  if (!res.ok) throw new Error('Failed to create template');
  return res.json();
}

export async function updateTemplate(id: string, template: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
  const res = await fetch(`${TEMPLATES_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(template)
  });
  if (!res.ok) throw new Error('Failed to update template');
  return res.json();
}

export async function deleteTemplate(id: string): Promise<void> {
  const res = await fetch(`${TEMPLATES_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to delete template');
} 