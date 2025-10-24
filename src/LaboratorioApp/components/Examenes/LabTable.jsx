// components/LabTable.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useLabData } from '../../hook/useLabData';
import ObservacionesModal from './ObservacionesModal.jsx';

const LabTable = ({ priority, title, headerColor, filter }) => {
    const [expandedPatient, setExpandedPatient] = useState(null);
    // Estados para el modal
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState({ historia: '', name: '' });

    const {
        data,
        exams,
        loading,
        error,
        currentPage,
        totalElements,
        totalPages,
        goToPage,
        nextPage,
        prevPage,
        hasNextPage,
        hasPrevPage,
        loadPatientExams,
        markAsPending,
        refresh
    } = useLabData(priority, filter);

    const togglePatient = async (patientId) => {
        if (expandedPatient === patientId) {
            setExpandedPatient(null);
        } else {
            setExpandedPatient(patientId);
            const patient = data.find(p => p.id === patientId);
            if (patient) {
                await loadPatientExams(patient.historia);
            }
        }
    };

    // Abrir modal para marcar como pendiente;
    const handleMarkAsPending = (historia, examName) => {
        setSelectedExam({ historia, name: examName });
        setModalOpen(true);
    };

    //Confirmar marcar como pendiente
    const confirmMarkAsPending = async (observations) => {
        await markAsPending(selectedExam.historia, selectedExam.name, observations);
        setModalOpen(false);
        setSelectedExam({ historia: '', name: '' });
    };

    // Función para obtener columnas dinámicas según el filtro
    const getDateColumns = () => {
        switch (filter) {
            case 'actuales':
                return [{ key: 'fechaSolicitud', label: 'Fecha Solicitud' }];
            case 'pendientes':
                return [
                    { key: 'fechaSolicitud', label: 'Fecha Solicitud' },
                    { key: 'fechaPendiente', label: 'Fecha Pendiente' }
                ];
            case 'tomadas':
                return [
                    { key: 'fechaSolicitud', label: 'Fecha Solicitud' },
                    { key: 'fechaPendiente', label: 'Fecha Pendiente' },
                    { key: 'fechaTomado', label: 'Fecha Tomado' }
                ];
            default:
                return [{ key: 'fechaSolicitud', label: 'Fecha' }];
        }
    };

    const dateColumns = getDateColumns();

    // Función para formatear fechas
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return '-';
        }
    };

    // Componente de paginación
    const Pagination = () => {
        if (totalElements === 0) return null;

        const pages = [];
        const maxVisible = 5;
        const start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
        const end = Math.min(totalPages, start + maxVisible);

        for (let i = start; i < end; i++) {
            pages.push(i);
        }

        return (
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
                <span className="text-sm text-gray-700">
                    Mostrando {Math.min((currentPage * 10) + 1, totalElements)} a {Math.min((currentPage + 1) * 10, totalElements)} de {totalElements}
                </span>

                <div className="flex space-x-1">
                    <button onClick={() => goToPage(0)} disabled={!hasPrevPage} className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100">⟨⟨</button>
                    <button onClick={prevPage} disabled={!hasPrevPage} className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100">⟨</button>

                    {pages.map(page => (
                        <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-1 border rounded ${currentPage === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                        >
                            {page + 1}
                        </button>
                    ))}

                    <button onClick={nextPage} disabled={!hasNextPage} className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100">⟩</button>
                    <button onClick={() => goToPage(totalPages - 1)} disabled={!hasNextPage} className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100">⟩⟩</button>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="mb-8">
                <div className={`${headerColor} text-white px-4 py-2 rounded-t-lg font-bold`}>{title}</div>
                <div className="bg-white shadow-lg rounded-b-lg p-8 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-2">Cargando {title.toLowerCase()}...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mb-8">
                <div className={`${headerColor} text-white px-4 py-2 rounded-t-lg font-bold flex justify-between`}>
                    <span>{title} ({totalElements} total)</span>
                    <button onClick={refresh} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded flex items-center">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                {error ? (
                    <div className="bg-red-50 border border-red-200 rounded-b-lg p-4">
                        <p className="text-red-600">Error: {error}</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="bg-white shadow-lg rounded-b-lg p-8 text-center text-gray-500">
                        <p>No hay solicitudes {title.toLowerCase()}</p>
                    </div>
                ) : (
                    <div className="bg-white shadow-lg rounded-b-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-800 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left">Historia</th>
                                    <th className="px-4 py-3 text-left">Paciente</th>
                                    <th className="px-4 py-3 text-left">Edad</th>
                                    <th className="px-4 py-3 text-left">Ingreso</th>
                                    <th className="px-4 py-3 text-left">Exámenes</th>

                                    {/* COLUMNAS DE FECHAS DINÁMICAS */}
                                    {dateColumns.map(col => (
                                        <th key={col.key} className="px-4 py-3 text-left">{col.label}</th>
                                    ))}

                                    {filter !== 'tomadas' && <th className="px-4 py-3 text-center">Acciones</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((patient) => (
                                    <React.Fragment key={patient.id}>
                                        <tr className="hover:bg-gray-50 cursor-pointer border-l-4 border-blue-500" onClick={() => togglePatient(patient.id)}>
                                            <td className="px-4 py-3 font-medium">{patient.historia}</td>
                                            <td className="px-4 py-3 flex items-center">
                                                {expandedPatient === patient.id ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                                                {patient.paciente}
                                            </td>
                                            <td className="px-4 py-3">{patient.edad}</td>
                                            <td className="px-4 py-3 text-blue-600">{patient.ingreso}</td>
                                            <td className="px-4 py-3">{patient.cantidadExamenes || 0}</td>

                                            {/* CELDAS DE FECHAS DINÁMICAS */}
                                            {dateColumns.map(col => (
                                                <td key={col.key} className="px-4 py-3">
                                                    {formatDate(patient[col.key])}
                                                </td>
                                            ))}

                                            {filter === 'actuales' && (
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const patientExams = exams[patient.historia] || [];
                                                            const availableExams = patientExams.filter(exam => exam.status === 'available');
                                                            if (availableExams.length > 0) {
                                                                handleMarkAsPending(patient.historia, 'TODOS');
                                                            }
                                                        }}
                                                        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 px-2 py-1 rounded"
                                                        title="Marcar todos como pendiente"
                                                    >
                                                        📌
                                                    </button>
                                                </td>
                                            )}

                                            {filter === 'pendientes' && (
                                                <td className="px-4 py-3 text-center">
                                                    <button className="bg-green-100 hover:bg-green-200 text-green-600 px-2 py-1 rounded" title="Marcar como completado">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>

                                        {/* Exámenes expandibles */}
                                        {expandedPatient === patient.id && (
                                            <tr>
                                                <td colSpan="100%" className="px-0 py-0 bg-gray-50">
                                                    <div className="px-8 py-4">
                                                        <h4 className="font-semibold text-gray-700 mb-3">
                                                            Exámenes ({exams[patient.historia]?.length || 0})
                                                        </h4>

                                                        {exams[patient.historia]?.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {exams[patient.historia].map((exam, index) => (
                                                                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                                                                        <span className="font-medium">
                                                                            {exam.nombre || exam.nomServicio || 'Examen sin nombre'}
                                                                        </span>

                                                                        <div className="flex items-center space-x-2">
                                                                            {/* TEXTOS SEGÚN ESTADO */}
                                                                            {exam.status === 'completed' && (
                                                                                <span className="px-3 py-1 rounded text-xs bg-green-100 text-green-600 font-medium">
                                                                                    ✅ Tomado
                                                                                </span>
                                                                            )}

                                                                            {exam.status === 'pending' && (
                                                                                <span className="px-3 py-1 rounded text-xs bg-yellow-100 text-yellow-600 font-medium">
                                                                                    📌 Pendiente
                                                                                </span>
                                                                            )}

                                                                            {/* BOTÓN PARA MARCAR COMO PENDIENTE */}
                                                                            {filter === 'actuales' && exam.status === 'available' && (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleMarkAsPending(patient.historia, exam.nombre);
                                                                                    }}
                                                                                    className="bg-yellow-200 hover:bg-yellow-300 text-yellow-600 px-3 py-1 rounded text-sm font-medium transition-colors"
                                                                                    title="Marcar este examen como pendiente"
                                                                                >
                                                                                    📌 Marcar como Pendiente
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center text-gray-500 py-4">
                                                                <p>Cargando exámenes...</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>

                        <Pagination />
                    </div>
                )}
            </div>

            {/* Modal de observaciones */}
            <ObservacionesModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Marcar como Pendiente"
                examName={selectedExam.name}
                onConfirm={confirmMarkAsPending}
            />
        </>
    );
};

export default LabTable;