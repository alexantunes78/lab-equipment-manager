export type UserRole = 'admin' | 'super-user' | 'user';

export interface User {
  id: number;
  username: string;
  password: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
}

export const initialUsers: User[] = [
  {
    id: 1,
    username: "admin",
    password: "password123",
    role: "admin",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    username: "super",
    password: "password456",
    role: "super-user",
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    username: "user",
    password: "password789",
    role: "user",
    createdAt: new Date().toISOString()
  }
];

export const rolePermissions = {
  admin: {
    canManageUsers: true,
    canImportData: true,
    canAddEquipment: true,
    canEditEquipment: true,
    canDeleteEquipment: true,
    canFilterSort: true,
    canViewEquipment: true
  },
  'super-user': {
    canManageUsers: false,
    canImportData: false,
    canAddEquipment: true,
    canEditEquipment: true,
    canDeleteEquipment: true,
    canFilterSort: true,
    canViewEquipment: true
  },
  user: {
    canManageUsers: false,
    canImportData: false,
    canAddEquipment: false,
    canEditEquipment: false,
    canDeleteEquipment: false,
    canFilterSort: true,
    canViewEquipment: true
  }
};