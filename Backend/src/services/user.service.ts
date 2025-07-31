import users from '../data/mockUsers.json';
import { User } from '../mappers/user.mapper';

export class UserService {
  private users: User[] = users as User[];

  getAll(): User[] {
    return this.users;
  }

  getById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }
} 