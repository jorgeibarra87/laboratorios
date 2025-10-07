import { AlignJustify, CalendarRangeIcon } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => (
    <header className="bg-white shadow p-4 flex justify-between items-center">
        <Link to="/">
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-1"><AlignJustify /></h1>
        </Link>
        <button className="text-sm text-red-600 hover:underline">Logout</button>
    </header>
);

export default Header;