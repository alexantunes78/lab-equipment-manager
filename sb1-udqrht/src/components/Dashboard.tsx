import React from "react";
import { Button } from "./ui/button";
import { BeakerIcon } from 'lucide-react';
import { EquipmentList } from "./EquipmentList";
import { ExcelImport } from "./ExcelImport";
import { UserManagement } from "./UserManagement";
import { Equipment } from "../types/equipment";
import { User, rolePermissions } from "../types/user";
import { ContractAlerts } from "./ContractAlerts";

interface DashboardProps {
  currentUser: User;
  equipment: Equipment[];
  setEquipment: React.Dispatch<React.SetStateAction<Equipment[]>>;
  users: User[];
  onAddUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  onDeleteUser: (id: number) => void;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
}

export function Dashboard({ 
  currentUser, 
  equipment, 
  setEquipment, 
  users,
  onAddUser,
  onDeleteUser,
  onUpdateUser,
  onLogout 
}: DashboardProps) {
  const userPermissions = rolePermissions[currentUser.role];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="container mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BeakerIcon className="h-8 w-8" />
            Lab Equipment Contract Manager
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Logged in as: <span className="font-semibold">{currentUser.username}</span> ({currentUser.role})
            </span>
            <Button variant="outline" onClick={onLogout}>Logout</Button>
          </div>
        </header>

        {(currentUser.role === 'admin' || currentUser.role === 'super-user') && (
          <ContractAlerts equipment={equipment} />
        )}

        {userPermissions.canImportData && (
          <ExcelImport onImport={(data) => setEquipment(data)} />
        )}

        {userPermissions.canManageUsers && (
          <UserManagement 
            users={users}
            onAddUser={onAddUser}
            onDeleteUser={onDeleteUser}
            onUpdateUser={onUpdateUser}
            currentUser={currentUser}
          />
        )}

        <EquipmentList 
          equipment={equipment}
          setEquipment={setEquipment}
          userPermissions={userPermissions}
        />
      </div>
    </div>
  );
}