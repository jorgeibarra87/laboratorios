// components/ObservacionesModal.jsx
import React, { useState } from 'react';
import { X, Save, CheckCircle2, ArrowLeft } from 'lucide-react';

const ObservacionesModal = ({
    isOpen,
    onClose,
    title,
    onConfirm,
    examName,
    actionType = 'pending' // 'pending', 'completed', 'revert'
}) => {
    const [observaciones, setObservaciones] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await onConfirm(observaciones);
            setObservaciones('');
            onClose();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al guardar. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setObservaciones('');
        onClose();
    };

    // Configuración según el tipo de acción
    const config = {
        pending: {
            icon: Save,
            color: 'yellow',
            buttonText: 'Marcar como Pendiente',
            placeholder: 'Escribe observaciones sobre por qué se marca como pendiente...'
        },
        completed: {
            icon: CheckCircle2,
            color: 'green',
            buttonText: 'Marcar como Tomado',
            placeholder: 'Escribe observaciones sobre la toma del examen...'
        },
        revert: {
            icon: ArrowLeft,
            color: 'yellow',
            buttonText: 'Volver a Pendiente',
            placeholder: 'Escribe la razón para revertir a pendiente...'
        }
    };

    const currentConfig = config[actionType];
    const Icon = currentConfig.icon;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={loading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                        Examen: <strong>{examName}</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observaciones (opcional)
                        </label>
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            placeholder={currentConfig.placeholder}
                            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="4"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 bg-${currentConfig.color}-600 text-white rounded-md hover:bg-${currentConfig.color}-700 disabled:opacity-50 flex items-center`}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Icon className="w-4 h-4 mr-2" />
                                    {currentConfig.buttonText}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ObservacionesModal;