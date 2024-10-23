import React, { useState } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LoginForm } from "./components/LoginForm";
import { Dashboard } from "./components/Dashboard";
import { User, initialUsers } from "./types/user";
import { Equipment } from "./types/equipment";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [users, setUsers] = useState<User[]>(initialUsers);

  const handleLogin = (user: User) => {
    const updatedUser = { ...user, lastLogin: new Date().toISOString() };
    setUsers(prevUsers => 
      prevUsers.map(u => u.id === user.id ? updatedUser : u)
    );
    setCurrentUser(updatedUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const handleAddUser = (newUser: Omit<User, 'id' | 'createdAt'>) => {
    const user: User = {
      id: Date.now(),
      ...newUser,
      createdAt: new Date().toISOString()
    };
    setUsers(prevUsers => [...prevUsers, user]);
  };

  const handleDeleteUser = (id: number) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prevUsers => 
      prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user)
    );
  };

  if (!isAuthenticated || !currentUser) {
    return <LoginForm onLogin={handleLogin} users={users} />;
  }

  return (
    <>
      <Dashboard 
        currentUser={currentUser}
        equipment={equipment}
        setEquipment={setEquipment}
        users={users}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
      />
      <ToastContainer />
    </>
  );
}

export default App;