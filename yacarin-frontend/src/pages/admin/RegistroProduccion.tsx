import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { Tarifas } from './Tarifas';

export const RegistroProduccion = () => {
    // Datos maestros para los selectores
    const [empleados, setEmpleados] = useState<any[]>([]);
    const [ordenes, setOrdenes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Estado del Formulario POST
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        empleado_id: '',
        orden_id: '',
        tarea_realizada: '',
        cantidad_producida: ''
    });

    // Estado para el Historial GET
    const [historialEmpleadoId, setHistorialEmpleadoId] = useState('');
    const [historial, setHistorial] = useState<any[]>([]);
    const [isLoadingHistorial, setIsLoadingHistorial] = useState(false);

    // Notificaciones y Boleta de Éxito
    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'success' });
    const [boletaGenerada, setBoletaGenerada] = useState<any | null>(null);

    // Estado del Modal de Tarifas
    const [isTarifasModalOpen, setIsTarifasModalOpen] = useState(false);

    const mostrarNotificacion = (mensaje: string, tipo: 'success' | 'error' = 'success') => {
        setNotificacion({ visible: true, mensaje, tipo });
        setTimeout(() => setNotificacion({ visible: false, mensaje: '', tipo: 'success' }), 3500);
    };

    // Carga inicial de datos maestros
    useEffect(() => {
        const cargarDatosMaestros = async () => {
        try {
            setIsLoading(true);
            // Traemos a los empleados (para saber a quién pagar) y las órdenes (para saber en qué trabajaron)
            const [empRes, ordRes] = await Promise.all([
            api.get('/empleados'),
            api.get('/orden-produccion')
            ]);
            
            // Filtramos solo a los empleados activos
            const empleadosActivos = empRes.data.filter((e: any) => e.usuario?.activo);
            setEmpleados(empleadosActivos);
            
            // Filtramos solo las órdenes que no estén completadas (PENDIENTE o EN_PROCESO)
            const ordenesActivas = ordRes.data.filter((o: any) => o.estado !== 'COMPLETADA');
            setOrdenes(ordenesActivas);
        } catch (error) {
            console.error("Error cargando datos:", error);
            mostrarNotificacion("Error al conectar con la base de datos del taller.", "error");
        } finally {
            setIsLoading(false);
        }
        };
        cargarDatosMaestros();
    }, []);

    // Buscar historial de un empleado cuando se selecciona en el panel inferior
    useEffect(() => {
        const fetchHistorial = async () => {
        if (!historialEmpleadoId) {
            setHistorial([]);
            return;
        }
        try {
            setIsLoadingHistorial(true);
            const res = await api.get(`/registro-produccion/empleado/${historialEmpleadoId}`);
            setHistorial(res.data);
        } catch (error) {
            mostrarNotificacion("Error al cargar el historial del operario.", "error");
        } finally {
            setIsLoadingHistorial(false);
        }
        };
        fetchHistorial();
    }, [historialEmpleadoId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // POST: Registrar el trabajo y calcular el destajo
    const handleRegistrarTrabajo = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setBoletaGenerada(null);

        try {
        const payload = {
            empleado_id: formData.empleado_id,
            orden_id: formData.orden_id,
            tarea_realizada: formData.tarea_realizada,
            cantidad_producida: Number(formData.cantidad_producida)
        };

        const res = await api.post('/registro-produccion', payload);
        
        // El backend nos devuelve un objeto "boleta" con el pago calculado
        setBoletaGenerada(res.data.boleta);
        mostrarNotificacion("Trabajo registrado y liquidación generada con éxito.");
        
        // Limpiamos el formulario, pero mantenemos la orden por si el mismo empleado hizo otra talla
        setFormData(prev => ({ ...prev, tarea_realizada: '', cantidad_producida: '' }));
        
        // Si el historial visible es del mismo empleado, lo actualizamos
        if (historialEmpleadoId === formData.empleado_id) {
            const historyRes = await api.get(`/registro-produccion/empleado/${historialEmpleadoId}`);
            setHistorial(historyRes.data);
        }
        
        } catch (error: any) {
        mostrarNotificacion(error.response?.data?.message || "Error al registrar el trabajo.", "error");
        } finally {
        setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in relative max-w-6xl mx-auto">
        
        {notificacion.visible && (
            <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-[var(--radius-suave)] shadow-lg animate-fade-in flex items-center gap-3 ${
            notificacion.tipo === 'success' ? 'bg-[var(--color-yacar-verde)] text-white' : 'bg-[var(--color-yacar-rosa)] text-white'
            }`}>
            <p className="font-bold">{notificacion.mensaje}</p>
            </div>
        )}

        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">Nómina a Destajo</h1>
                <p className="text-gray-500 text-sm mt-1">Registra la producción de los operarios para generar su liquidación automática.</p>
            </div>
            <Button onClick={() => setIsTarifasModalOpen(true)} variant="secondary" className="border-[var(--color-yacar-azul)] text-[var(--color-yacar-azul-vivo)] font-bold">
                ⚙️ Configurar Tarifas
            </Button>
        </div>

        {/* MODAL DE TARIFAS */}
        {isTarifasModalOpen && (
            <div className="fixed inset-0 bg-[var(--color-yacar-texto)]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-[var(--radius-suave)] w-full max-w-4xl overflow-hidden shadow-2xl relative">
                    <button 
                        onClick={() => setIsTarifasModalOpen(false)} 
                        className="absolute top-4 right-4 text-gray-400 hover:text-[var(--color-yacar-rosa)] transition-colors z-10"
                    >
                        ✕
                    </button>
                    <div className="p-8 max-h-[85vh] overflow-y-auto">
                        <Tarifas />
                    </div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLUMNA IZQUIERDA: FORMULARIO DE REGISTRO */}
            <div className="lg:col-span-1">
            <div className="bg-white rounded-[var(--radius-suave)] shadow-sm border border-[var(--color-yacar-surface)] p-6">
                <h2 className="text-lg font-bold text-[var(--color-yacar-texto)] mb-4 pb-2 border-b border-[var(--color-yacar-surface)]">
                Registrar Lote Terminado
                </h2>
                
                {isLoading ? (
                <p className="text-sm text-gray-500 text-center py-10">Cargando datos maestros...</p>
                ) : (
                <form onSubmit={handleRegistrarTrabajo} className="space-y-4">
                    <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Operario</label>
                    <select name="empleado_id" value={formData.empleado_id} onChange={handleInputChange} required className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm bg-gray-50 focus:bg-white focus:border-[var(--color-yacar-azul)]">
                        <option value="">-- Seleccionar Operario --</option>
                        {empleados.map(emp => (
                        <option key={emp.usuario.id} value={emp.usuario.id}>
                            {emp.usuario.nombre} {emp.usuario.apPat}
                        </option>
                        ))}
                    </select>
                    </div>

                    <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Orden de Producción</label>
                    <select name="orden_id" value={formData.orden_id} onChange={handleInputChange} required className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm bg-gray-50 focus:bg-white focus:border-[var(--color-yacar-azul)]">
                        <option value="">-- Seleccionar Orden --</option>
                        {ordenes.map(ord => (
                        <option key={ord.id} value={ord.id}>
                            {ord.id.substring(0,6)} - {ord.producto?.nombre_comercial} (Cant: {ord.cantidad_fabricar})
                        </option>
                        ))}
                    </select>
                    </div>

                    <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Operación Realizada</label>
                    <select name="tarea_realizada" value={formData.tarea_realizada} onChange={handleInputChange} required className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm bg-gray-50 focus:bg-white focus:border-[var(--color-yacar-azul)]">
                        <option value="">-- Seleccionar Tarea --</option>
                        <option value="CORTE">Corte de Tela</option>
                        <option value="COSTURA">Costura y Confección</option>
                        <option value="EMPAQUE">Doblado y Empaque</option>
                        <option value="TEJEDURIA">Tejeduría Industrial</option>
                    </select>
                    </div>

                    <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Cantidad Producida</label>
                    <input type="number" min="1" name="cantidad_producida" value={formData.cantidad_producida} onChange={handleInputChange} required placeholder="Ej: 50" className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm bg-gray-50 focus:bg-white focus:border-[var(--color-yacar-azul)]" />
                    </div>

                    <div className="pt-4">
                    <Button type="submit" variant="intense-blue" className="w-full" isLoading={isSubmitting}>
                        Registrar y Generar Boleta
                    </Button>
                    </div>
                </form>
                )}

                {/* FEEDBACK DE BOLETA GENERADA */}
                {boletaGenerada && (
                <div className="mt-6 p-4 bg-[var(--color-yacar-verde)]/10 border border-[var(--color-yacar-verde)]/20 rounded-lg animate-fade-in text-center">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Liquidación Generada</p>
                    <div className="text-2xl font-bold text-[var(--color-yacar-verde)] font-[var(--font-titulos)] mb-2">
                    Bs. {Number(boletaGenerada.pago_generado_bs).toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-600">Por {boletaGenerada.cantidad} unidades en {boletaGenerada.tarea}</p>
                </div>
                )}
            </div>
            </div>

            {/* COLUMNA DERECHA: HISTORIAL DEL OPERARIO */}
            <div className="lg:col-span-2">
            <div className="bg-white rounded-[var(--radius-suave)] shadow-sm border border-[var(--color-yacar-surface)] p-6 h-full min-h-[500px] flex flex-col">
                <div className="flex justify-between items-center mb-6 pb-2 border-b border-[var(--color-yacar-surface)]">
                <h2 className="text-lg font-bold text-[var(--color-yacar-texto)]">
                    Historial de Liquidaciones
                </h2>
                
                <div className="w-64">
                    <select 
                    value={historialEmpleadoId} 
                    onChange={(e) => setHistorialEmpleadoId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-gray-200 outline-none text-sm bg-gray-50"
                    >
                    <option value="">-- Ver historial de operario --</option>
                    {empleados.map(emp => (
                        <option key={emp.usuario.id} value={emp.usuario.id}>
                        {emp.usuario.nombre} {emp.usuario.apPat}
                        </option>
                    ))}
                    </select>
                </div>
                </div>

                <div className="flex-grow">
                {!historialEmpleadoId ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 pt-20">
                    <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <p>Selecciona un operario para visualizar su historial de pagos.</p>
                    </div>
                ) : isLoadingHistorial ? (
                    <div className="text-center py-20 text-gray-500">Cargando registros...</div>
                ) : historial.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">Este operario aún no tiene trabajos registrados.</div>
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
                                {reg.orden?.id ? reg.orden.id.substring(0,8) : 'N/A'}
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-[10px] font-bold bg-[var(--color-yacar-azul)]/10 text-[var(--color-yacar-azul-vivo)] px-2 py-1 rounded">
                                {reg.tarea_realizada}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-center">
                                {reg.cantidad_producida}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-[var(--color-yacar-texto)] text-right">
                                Bs. {Number(reg.total_a_pagar || 0).toFixed(2)}
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
                <div className="mt-4 pt-4 border-t border-[var(--color-yacar-surface)] flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm font-bold text-gray-600 uppercase">Total Devengado (Histórico):</span>
                    <span className="text-xl font-bold text-[var(--color-yacar-verde)]">
                    Bs. {historial.reduce((sum, reg) => sum + Number(reg.total_a_pagar || 0), 0).toFixed(2)}
                    </span>
                </div>
                )}
            </div>
            </div>
        </div>
        </div>
    );
};