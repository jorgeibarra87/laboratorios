// components/ExamenesTable.jsx
import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import LabTable from './LabTable';

const ExamenesTable = () => {
    const [filter, setFilter] = useState('actuales');

    return (
        <div className="p-6">
            {/* Tabs */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-1">
                    <button
                        onClick={() => setFilter('actuales')}
                        className={`px-6 py-2 rounded-l text-sm font-medium ${filter === 'actuales' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Actuales
                    </button>
                    <button
                        onClick={() => setFilter('pendientes')}
                        className={`px-6 py-2 text-sm font-medium ${filter === 'pendientes' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Pendientes
                    </button>
                    <button
                        onClick={() => setFilter('tomadas')}
                        className={`px-6 py-2 rounded-r text-sm font-medium flex items-center ${filter === 'tomadas' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Tomadas
                        {filter === 'tomadas' && <CheckCircle2 className="w-4 h-4 ml-1" />}
                    </button>
                </div>
            </div>

            {/* Título */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    🧪 SOLICITUDES DE LABORATORIO - {filter.toUpperCase()}
                </h2>
            </div>

            {/* Tablas */}
            <LabTable priority="urgentes" title="URGENTES" headerColor="bg-red-600" filter={filter} />
            <LabTable priority="prioritario" title="PRIORITARIAS" headerColor="bg-yellow-500" filter={filter} />
            <LabTable priority="rutinario" title="RUTINARIAS" headerColor="bg-green-600" filter={filter} />
        </div>
    );
};

export default ExamenesTable;
