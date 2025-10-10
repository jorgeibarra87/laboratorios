import { AlignJustify, CalendarRangeIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = ({ onToggleSidebar, isSidebarOpen }) => (
    <header className="bg-white shadow p-4 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-4">
            <button
                onClick={onToggleSidebar}
                className="text-gray-800 hover:text-gray-600 transition-colors"
            >
                <AlignJustify />
            </button>
            <Link to="/">
                <h1 className="text-xl font-bold text-gray-800">Laboratorio App</h1>
            </Link>
        </div>
        <button className="text-sm text-red-600 hover:underline">Logout</button>
    </header>
);

export default Header;
