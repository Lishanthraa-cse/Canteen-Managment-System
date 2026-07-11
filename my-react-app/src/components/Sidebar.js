import React, { useState } from 'react';
import { Menu, Bell, Settings, User, Lock, Moon } from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`h-screen bg-white dark:bg-gray-900 shadow-md transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-16'
      } relative`}
    >
      {/* Toggle Button */}
      <div className="p-4">
        <button
          onClick={toggleSidebar}
          className="text-gray-800 dark:text-white text-2xl focus:outline-none"
        >
          <Menu />
        </button>
      </div>

      {/* Sidebar Content - Show only if open */}
      {isOpen && (
        <div className="px-4 space-y-4">
          <div className="text-xl font-bold text-gray-700 dark:text-white">Admin Panel</div>

          <input
            type="text"
            placeholder="Search..."
            className="w-full px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white"
          />

          <ul className="space-y-2 text-gray-700 dark:text-white">
            <li className="flex items-center gap-3 hover:text-green-600 cursor-pointer">
              <User size={20} />
              <span>Users</span>
            </li>
            <li className="flex items-center gap-3 hover:text-green-600 cursor-pointer">
              <Bell size={20} />
              <span>Notifications</span>
            </li>
            <li className="flex items-center gap-3 hover:text-green-600 cursor-pointer">
              <Settings size={20} />
              <span>Settings</span>
            </li>
            <li className="flex items-center gap-3 hover:text-green-600 cursor-pointer">
              <Lock size={20} />
              <span>Security</span>
            </li>
          </ul>

          {/* Dark Mode Icon */}
          <div className="absolute bottom-4 left-4">
            <Moon className="text-gray-800 dark:text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
