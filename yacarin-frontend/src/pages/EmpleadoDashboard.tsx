import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import logoYacarin from '../assets/img/logo2.png';

export const EmpleadoDashboard = () => {
    const navigate = useNavigate();
    const usuarioId = localStorage.getItem('usuario_id');
    const rol = localStorage.getItem('rol');
    
    const [empleadoData, setEmpleadoData] = useState<any>(null);
    const [historial, setHistorial] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!usuarioId || rol !== 'EMPLEADO') {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [userRes, histRes] = await Promise.all([
                    api.get(`/usuarios/${usuarioId}`),
                    api.get(`/registro-produccion/empleado/${usuarioId}`)
                ]);
                setEmpleadoData(userRes.data);
                setHistorial(histRes.data);
            } catch (error) {
                console.error("Error al cargar datos del empleado:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [usuarioId, rol, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('rol');
        localStorage.removeItem('usuario_id');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[var(--color-yacar-crema)] font-[var(--font-cuerpo)] flex flex-col">
            {/* Header del Empleado */}
            <header className="h-20 bg-white border-b border-[var(--color-yacar-surface)] flex items-center justify-between px-8 shadow-sm">
                <div className="flex items-center gap-3">
                    <img src={logoYacarin} alt="Yacarín" className="w-10 h-10 object-contain" />
                    <div>
                        <h2 className="font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)] leading-none">Yacarín</h2>
                        <span className="text-xs text-gray-400">Portal del Operario</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="hidden sm:block text-right pr-4 border-r border-gray-200">
                        <p className="font-bold text-[var(--color-yacar-texto)] leading-tight">{empleadoData?.nombre || 'Operario'}</p>
                        <p className="text-xs text-gray-500">Taller de Confección</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="text-gray-400 hover:text-[var(--color-yacar-rosa)] transition-colors p-2 rounded-full hover:bg-[var(--color-yacar-rosa)]/10"
                        title="Cerrar Sesión"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    </button>
                </div>
            </header>

            {/* Contenido Principal */}
            <main className="flex-1 max-w-6xl w-full mx-auto p-8 animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">Mis Trabajos a Destajo</h1>
                    <p className="text-gray-500 mt-1">Revisa el historial de tus lotes terminados y los pagos generados.</p>
                </div>

                {isLoading ? (
                    <div className="text-center py-20 text-gray-500">Cargando tu información...</div>
                ) : (
                    <div className="bg-white rounded-[var(--radius-suave)] shadow-sm border border-[var(--color-yacar-surface)] p-6 h-full min-h-[500px] flex flex-col">
                        <div className="flex-grow">
                            {historial.length === 0 ? (
                                <div className="text-center py-20 text-gray-500">Aún no tienes trabajos registrados.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                    <tr className="bg-[var(--color-yacar-surface)]/50 border-b border-[var(--color-yacar-surface)]">
                                        <th className="px-4 py-3 font-semibold text-[var(--color-yacar-texto)] text-xs uppercase tracking-wider">Fecha</th>
                                        <th className="px-4 py-3 font-semibold text-[var(--color-yacar-texto)] text-xs uppercase tracking-wider">Orden ID</th>
                                        <th className="px-4 py-3 font-semibold text-[var(--color-yacar-texto)] text-xs uppercase tracking-wider">Operación</th>
                                        <th className="px-4 py-3 font-semibold text-[var(--color-yacar-texto)] text-xs uppercase tracking-wider text-center">Cant.</th>
                                        <th className="px-4 py-3 font-semibold text-[var(--color-yacar-texto)] text-xs uppercase tracking-wider text-right">Pago Generado</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {historial.map((reg, index) => (
                                        <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {new Date(reg.fecha_registro || Date.now()).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-xs font-mono text-gray-400">
                                            {reg.orden_id ? reg.orden_id.substring(0,8) : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-[10px] font-bold bg-[var(--color-yacar-azul)]/10 text-[var(--color-yacar-azul-vivo)] px-2 py-1 rounded">
                                            {reg.tarea_realizada || reg.tarea}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-center">
                                            {reg.cantidad_producida || reg.cantidad}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold text-[var(--color-yacar-texto)] text-right">
                                            Bs. {Number(reg.pago_generado_bs).toFixed(2)}
                                        </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                </div>
                            )}
                        </div>
                        
                        {/* Total acumulado del historial visualizado */}
                        {historial.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-[var(--color-yacar-surface)] flex justify-between items-center bg-gray-50 p-6 rounded-xl border">
                            <span className="text-sm font-bold text-gray-600 uppercase">Total Devengado a la Fecha:</span>
                            <span className="text-2xl font-bold text-[var(--color-yacar-verde)]">
                            Bs. {historial.reduce((sum, reg) => sum + Number(reg.pago_generado_bs), 0).toFixed(2)}
                            </span>
                        </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};
