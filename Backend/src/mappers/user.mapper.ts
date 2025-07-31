import { UserVM } from '../vms/user.vm';

export interface User {
  id: string;
  name: string;
  role: string;
  email: string;
  password?: string;
}

export function toUserVM(user: User): UserVM {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
  };
} 