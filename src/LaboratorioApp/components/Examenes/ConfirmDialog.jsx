// components/common/ConfirmDialog.jsx
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Sí, continuar", cancelText = "Cancelar" }) => {
    if (!isOpen) return null;

    return (
        <div className='absolute inset-0 bg-primary-blue-backwround bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
            <div className='bg-white p-6 rounded-lg flex flex-col gap-4 max-w-md w-full mx-4 shadow-2xl'>
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-orange-500" />
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                        aria-label="Cerrar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Mensaje */}
                <div className="py-2">
                    <p className="text-gray-600 leading-relaxed">{message}</p>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-2 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;