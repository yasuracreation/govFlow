import { User, UserRole, Office } from '../types.ts';
import { MOCK_OFFICES } from '../constants.ts';
import { API_BASE_URL } from '../apiConfig';

const MOCK_PASSWORD = 'password123'; // Assuming this is the intended password for all users

const MOCK_USERS: User[] = [
  { id: 'user1', nic: '123456789V', employeeId: 'FD001', password: MOCK_PASSWORD, name: 'Kamal Silva', role: UserRole.FRONT_DESK, officeId: 'office1', officeName: MOCK_OFFICES.find(o=>o.id === 'office1')?.name },
  { id: 'user2', nic: '987654321V', employeeId: 'OF001', password: MOCK_PASSWORD, name: 'Nimala Perera', role: UserRole.OFFICER, officeId: 'office1', officeName: MOCK_OFFICES.find(o=>o.id === 'office1')?.name },
  { id: 'user3', nic: '111222333V', employeeId: 'SH001', password: MOCK_PASSWORD, name: 'Sunil Bandara', role: UserRole.SECTION_HEAD, officeId: 'office1', officeName: MOCK_OFFICES.find(o=>o.id === 'office1')?.name },
  { id: 'user4', nic: '444555666V', employeeId: 'DH001', password: MOCK_PASSWORD, name: 'Geetha Kumari', role: UserRole.DEPARTMENT_HEAD, officeId: 'office8', officeName: MOCK_OFFICES.find(o=>o.id === 'office8')?.name },
  { id: 'user5', nic: '777888999V', employeeId: 'ADM001', password: MOCK_PASSWORD, name: 'Admin User', role: UserRole.ADMIN },
  { id: 'user6', nic: '222333444V', employeeId: 'OF002', password: MOCK_PASSWORD, name: 'Ravi Fernando', role: UserRole.OFFICER, officeId: 'office2', officeName: MOCK_OFFICES.find(o=>o.id === 'office2')?.name },
  { id: 'user7', nic: '555666777V', employeeId: 'SH002', password: MOCK_PASSWORD, name: 'Saman Jayasinghe', role: UserRole.SECTION_HEAD, officeId: 'office2', officeName: MOCK_OFFICES.find(o=>o.id === 'office2')?.name },
];

// Helper function to get users from localStorage
// const getUsersFromStorage = (): User[] => {-

//   const storedUsers = MOCK_USERS;
//   return storedUsers 
// };

const AUTH_URL = `${API_BASE_URL}/auth`;

export async function login(identifier: string, password: string): Promise<{ token: string }> {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function getMe(token: string): Promise<any> {
  const res = await fetch(`${AUTH_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch user info');
  return res.json();
}

export async function register(email: string, password: string, role: string, subject: string): Promise<any> {
  const res = await fetch(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify({ email, password, role, subject })
  });
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
}

export const mockLogout = (): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 200);
  });
};

export const getMockUserByNic = (nic: string): Promise<User | undefined> => {
   return new Promise((resolve) => {
    setTimeout(() => {
      const users = MOCK_USERS;
      const user = users.find(u => u.nic === nic);
      resolve(user);
    }, 100);
  });
};

export const getMockUserByEmployeeId = (employeeId: string): Promise<User | undefined> => {
  return new Promise((resolve) => {
   setTimeout(() => {
     const users = MOCK_USERS;
     resolve(users.find(u => u.employeeId === employeeId));
   }, 50);
 });
};

export const getMockUserById = (userId: string): Promise<User | undefined> => {
  return new Promise((resolve) => {
   setTimeout(() => {
     const users = MOCK_USERS;
     resolve(users.find(u => u.id === userId));
   }, 50);
 });
};

export const getMockUsers = (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_USERS);
    }, 300);
  });
};

const assignableUsers = MOCK_USERS.filter(user => user.subjectIds?.includes('new_request'));