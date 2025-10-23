// components/Common/ObservacionesModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

const ObservacionesModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Observaciones",
    placeholder = "Ingrese observaciones (opcional)..."
}) => {
    const [observaciones, setObservaciones] = useState('');

    const handleConfirm = () => {
        onConfirm(observaciones);
        setObservaciones('');
        onClose();
    };

    const handleCancel = () => {
        setObservaciones('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {title}
                    </h3>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    <textarea
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        placeholder={placeholder}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        autoFocus
                    />
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ObservacionesModal;