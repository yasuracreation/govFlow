import { API_BASE_URL } from '../apiConfig';
import { TaskSummary } from '../types';

const TASKS_URL = `${API_BASE_URL}/tasks`;

export async function getTasks(): Promise<TaskSummary[]> {
  const res = await fetch(TASKS_URL, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function getTaskById(id: string): Promise<TaskSummary> {
  const res = await fetch(`${TASKS_URL}/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to fetch task');
  return res.json();
}

export async function createTask(task: Omit<TaskSummary, 'id'>): Promise<TaskSummary> {
  const res = await fetch(TASKS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(task)
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function updateTask(id: string, task: Partial<TaskSummary>): Promise<TaskSummary> {
  const res = await fetch(`${TASKS_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(task)
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${TASKS_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to delete task');
}

export async function fetchTasksByUserId(userId: string): Promise<TaskSummary[]> {
  const res = await fetch(`${TASKS_URL}?userId=${userId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to fetch tasks for user');
  return res.json();
} 