export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  enabled: boolean;
  roles: Role[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Role {
  id: number;
  name: string;
}

export enum RoleName {
  ADMIN = 'ADMIN',
  LIBRARIAN = 'LIBRARIAN',
  USER = 'USER'
}