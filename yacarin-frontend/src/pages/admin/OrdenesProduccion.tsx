import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';

type OrdenProduccionType = {
    id: string;
    cantidad_fabricar: number;
    estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA';
    producto: {
        id: string;
        nombre_comercial: string;
        talla: string;
    };
    fecha_creacion?: string;
    };

    export const OrdenesProduccion = () => {
    const [ordenes, setOrdenes] = useState<OrdenProduccionType[]>([]);
    const [productos, setProductos] = useState<any[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [errorText, setErrorText] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formProductoId, setFormProductoId] = useState('');
    const [formCantidad, setFormCantidad] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 💡 NUEVO: Estado para notificaciones elegantes (Toasts)
    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'success' });

    const mostrarNotificacion = (mensaje: string, tipo: 'success' | 'error' = 'success') => {
        setNotificacion({ visible: true, mensaje, tipo });
        setTimeout(() => setNotificacion({ visible: false, mensaje: '', tipo: 'success' }), 3500);
    };

    const cargarDatos = async () => {
        try {
        setIsLoading(true);
        setErrorText('');
        const [ordenesRes, productosRes] = await Promise.all([
            api.get('/orden-produccion'),
            api.get('/productos')
        ]);
        setOrdenes(ordenesRes.data);
        setProductos(productosRes.data);
        } catch (error) {
        console.error("Error al cargar datos:", error);
        setErrorText('Hubo un problema al conectar con el servidor.');
        } finally {
        setIsLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // Función POST (Modificada para usar la nueva notificación)
    const handleCrearOrden = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formProductoId || !formCantidad) return;

        setIsSubmitting(true);
        try {
        await api.post('/orden-produccion', {
            producto_id: formProductoId,
            cantidad_fabricar: Number(formCantidad)
        });
        
        setIsModalOpen(false);
        setFormProductoId('');
        setFormCantidad('');
        cargarDatos();
        
        mostrarNotificacion("Orden iniciada. Materiales descontados de bodega.");
        } catch (error: any) {
        console.error("Error al crear la orden:", error);
        mostrarNotificacion(error.response?.data?.message || "Error al crear la orden. Verifica el stock.", 'error');
        } finally {
        setIsSubmitting(false);
        }
    };

    const handleCompletarOrden = async (id: string) => {
        try {
        // Consumimos el endpoint PATCH tal como dicta el contrato
        await api.patch(`/orden-produccion/${id}/completar`);
        
        mostrarNotificacion("¡Orden completada! El stock ya está disponible en la tienda.");
        cargarDatos(); // Recargamos la tabla para ver el estado COMPLETADA
        
        } catch (error: any) {
        console.error("Error al completar la orden:", error);
        mostrarNotificacion(error.response?.data?.message || "Hubo un error al intentar completar la orden.", 'error');
        }
    };

    const handleDownloadPDF = async () => {
        try {
            mostrarNotificacion("Generando reporte PDF...", "success");
            const response = await api.get(`/orden-produccion/reporte/pdf`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Reporte_Produccion.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error("Error al descargar PDF:", error);
            mostrarNotificacion("Error al generar el reporte PDF.", "error");
        }
    };

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
        case 'PENDIENTE':
            return <span className="bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold">PENDIENTE</span>;
        case 'EN_PROCESO':
            return <span className="bg-[var(--color-yacar-azul)]/10 text-[var(--color-yacar-azul-vivo)] border border-[var(--color-yacar-azul)]/20 px-3 py-1 rounded-full text-xs font-bold">EN PROCESO ⚙️</span>;
        case 'COMPLETADA':
            return <span className="bg-[var(--color-yacar-verde)]/10 text-[var(--color-yacar-verde)] border border-[var(--color-yacar-verde)]/20 px-3 py-1 rounded-full text-xs font-bold">COMPLETADA ✓</span>;
        default:
            return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{estado}</span>;
        }
    };

    return (
        <div className="animate-fade-in relative">
        
        {/* 💡 NUEVO: Componente visual de Notificación (Toast) */}
        {notificacion.visible && (
            <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-[var(--radius-suave)] shadow-lg transform transition-all duration-300 animate-fade-in flex items-center gap-3 ${
            notificacion.tipo === 'success' ? 'bg-[var(--color-yacar-verde)] text-white' : 'bg-[var(--color-yacar-rosa)] text-white'
            }`}>
            {notificacion.tipo === 'success' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            )}
            <p className="font-bold font-[var(--font-cuerpo)]">{notificacion.mensaje}</p>
            </div>
        )}

        {/* MODAL FLOTANTE PARA NUEVA ORDEN */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-[var(--color-yacar-texto)]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-[var(--radius-suave)] shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-[var(--color-yacar-surface)] flex justify-between items-center bg-[var(--color-yacar-crema)]/30">
                <h2 className="text-xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">Emitir Orden</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[var(--color-yacar-rosa)] transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                </div>
                
                <form onSubmit={handleCrearOrden} className="p-6 space-y-5">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ajuar a Fabricar</label>
                    <select 
                    value={formProductoId}
                    onChange={(e) => setFormProductoId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[var(--color-yacar-surface)]/50 border border-gray-200 focus:border-[var(--color-yacar-azul)] focus:bg-white outline-none text-sm"
                    required
                    >
                    <option value="">-- Seleccionar producto --</option>
                    {productos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre_comercial} (Talla: {p.talla})</option>
                    ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Cantidad (Unidades)</label>
                    <input 
                    type="number"
                    min="1"
                    value={formCantidad}
                    onChange={(e) => setFormCantidad(e.target.value)}
                    placeholder="Ej: 50"
                    className="w-full px-4 py-3 rounded-lg bg-[var(--color-yacar-surface)]/50 border border-gray-200 focus:border-[var(--color-yacar-azul)] focus:bg-white outline-none text-sm"
                    required
                    />
                </div>

                <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors">
                    Cancelar
                    </button>
                    <Button type="submit" variant="intense-blue" className="flex-1" isLoading={isSubmitting}>
                    Iniciar Producción
                    </Button>
                </div>
                </form>
            </div>
            </div>
        )}

        {/* Cabecera del Módulo */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
            <h1 className="text-3xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">
                Seguimiento de Producción
            </h1>
            <p className="text-gray-500 font-[var(--font-cuerpo)] text-sm mt-1">
                Gestión de manufactura y control de estado de los ajuares en el taller.
            </p>
            </div>
            
            <div className="flex gap-2">
                <Button 
                variant="secondary" 
                className="flex items-center gap-2 shadow-sm bg-[var(--color-yacar-texto)] text-white hover:bg-[var(--color-yacar-texto)]/90 border-transparent"
                onClick={handleDownloadPDF}
                >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Exportar a PDF
                </Button>
                
                <Button 
                variant="intense-blue" 
                className="flex items-center gap-2 shadow-sm"
                onClick={() => setIsModalOpen(true)}
                >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Nueva Orden de Trabajo
                </Button>
            </div>
        </div>

        {errorText && (
            <div className="mb-6 p-4 bg-[var(--color-yacar-rosa)]/10 border border-[var(--color-yacar-rosa)] text-[var(--color-yacar-rosa)] rounded-md text-sm font-medium">
            ⚠️ {errorText}
            </div>
        )}

        {/* Tabla de Órdenes */}
        <div className="bg-white rounded-[var(--radius-suave)] shadow-sm border border-[var(--color-yacar-surface)] overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-[var(--color-yacar-surface)]/50 border-b border-[var(--color-yacar-surface)]">
                    <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">ID Orden</th>
                    <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Ajuar a Fabricar</th>
                    <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Cantidad</th>
                    <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Estado</th>
                    <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm text-right">Acción</th>
                </tr>
                </thead>
                <tbody>
                {isLoading ? (
                    <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-4 border-[var(--color-yacar-surface)] border-t-[var(--color-yacar-azul-vivo)] rounded-full animate-spin"></div>
                        Cargando órdenes del taller...
                        </div>
                    </td>
                    </tr>
                ) : ordenes.length === 0 ? (
                    <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-500">
                        <span className="text-3xl block mb-2">🏭</span>
                        No hay órdenes de producción activas en este momento.
                    </td>
                    </tr>
                ) : (
                    ordenes.map((orden) => (
                    <tr key={orden.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-xs font-mono text-gray-400">
                        {orden.id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4">
                        <p className="font-bold text-[var(--color-yacar-texto)] text-sm">{orden.producto?.nombre_comercial || 'Producto Desconocido'}</p>
                        <p className="text-xs text-gray-500">Talla: {orden.producto?.talla || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700">
                        {orden.cantidad_fabricar} und.
                        </td>
                        <td className="px-6 py-4">
                        {getEstadoBadge(orden.estado)}
                        </td>
                        <td className="px-6 py-4 text-right">
                        <button 
                            onClick={() => handleCompletarOrden(orden.id)}
                            disabled={orden.estado === 'COMPLETADA'}
                            className={`text-sm font-bold transition-colors ${
                            orden.estado === 'COMPLETADA' 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-[var(--color-yacar-azul-vivo)] hover:text-[var(--color-yacar-verde)] underline decoration-2 underline-offset-4'
                            }`}
                        >
                            {orden.estado === 'COMPLETADA' ? 'Finalizada' : 'Completar Orden'}
                        </button>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
            </div>
        </div>
        </div>
    );
};