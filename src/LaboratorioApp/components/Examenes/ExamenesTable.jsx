// ExamenesTable.jsx
import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import PriorityTable from './PrioridadTable';

const ExamenesTable = () => {
    const [filtroActual, setFiltroActual] = useState('actuales');

    return (
        <div className="p-6">
            {/* Header con pestañas */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-1">
                    <button
                        onClick={() => setFiltroActual('actuales')}
                        className={`px-6 py-2 rounded-l text-sm font-medium ${filtroActual === 'actuales' ?
                            'bg-blue-600 text-white' :
                            'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Actuales
                    </button>
                    <button
                        onClick={() => setFiltroActual('pendientes')}
                        className={`px-6 py-2 text-sm font-medium ${filtroActual === 'pendientes'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Pendientes
                    </button>
                    <button
                        onClick={() => setFiltroActual('tomadas')}
                        className={`px-6 py-2 rounded-r text-sm font-medium flex items-center ${filtroActual === 'tomadas' ?
                            'bg-green-600 text-white' :
                            'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Tomadas
                        {filtroActual === 'tomadas' && <CheckCircle2 className="w-4 h-4 ml-1" />}
                    </button>
                </div>
            </div>

            {/* Título */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center">
                    <span className="text-green-600 mr-2">🧪</span>
                    SOLICITUDES DE LABORATORIO - {filtroActual.toUpperCase()}
                </h2>
            </div>

            {/* Tablas independientes por prioridad */}
            <PriorityTable
                prioridad="urgentes"
                titulo="URGENTES"
                colorHeader="bg-red-600"
                filtroActual={filtroActual}
            />
            <PriorityTable
                prioridad="prioritario"
                titulo="PRIORITARIAS"
                colorHeader="bg-yellow-500"
                filtroActual={filtroActual}
            />
            <PriorityTable
                prioridad="rutinario"
                titulo="RUTINARIAS"
                colorHeader="bg-green-600"
                filtroActual={filtroActual}
            />
        </div>
    );
};

export default ExamenesTable;
