import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';

// 💡 CONTRATO REAL BASADO EN POSTMAN
type DisenoType = {
    id: string;
    nombre_patron: string;
    descripcion_tecnica: string;
    color_primario: string;
    color_secundario: string;
    activo: boolean;
};

    export const Disenos = () => {
    const [disenos, setDisenos] = useState<DisenoType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [disenoAEditar, setDisenoAEditar] = useState<DisenoType | null>(null);
    
    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'success' });

    // 💡 FORMULARIO ALINEADO A LA BASE DE DATOS
    const [formData, setFormData] = useState({
        nombre_patron: '',
        descripcion_tecnica: '',
        color_primario: '',
        color_secundario: ''
    });

    const mostrarNotificacion = (mensaje: string, tipo: 'success' | 'error' = 'success') => {
        setNotificacion({ visible: true, mensaje, tipo });
        setTimeout(() => setNotificacion({ visible: false, mensaje: '', tipo: 'success' }), 3500);
    };

    const cargarDisenos = async () => {
        try {
        setIsLoading(true);
        const res = await api.get('/disenos');
        setDisenos(res.data);
        } catch (error) {
        mostrarNotificacion("Error al cargar las colecciones de diseño.", 'error');
        } finally {
        setIsLoading(false);
        }
    };

    useEffect(() => { cargarDisenos(); }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const abrirModalCreacion = () => {
        setDisenoAEditar(null);
        setFormData({ nombre_patron: '', descripcion_tecnica: '', color_primario: '', color_secundario: '' });
        setIsModalOpen(true);
    };

    const abrirModalEdicion = (diseno: DisenoType) => {
        setDisenoAEditar(diseno);
        setFormData({
        nombre_patron: diseno.nombre_patron,
        descripcion_tecnica: diseno.descripcion_tecnica || '',
        color_primario: diseno.color_primario || '',
        color_secundario: diseno.color_secundario || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
        if (disenoAEditar) {
            await api.patch(`/disenos/${disenoAEditar.id}`, formData);
            mostrarNotificacion("Diseño maestro actualizado correctamente.");
        } else {
            await api.post('/disenos', formData);
            mostrarNotificacion("Nueva colección creada con éxito.");
        }
        setIsModalOpen(false);
        cargarDisenos();
        } catch (error: any) {
        mostrarNotificacion(error.response?.data?.message || "Error al procesar el diseño.", 'error');
        } finally {
        setIsSubmitting(false);
        }
    };

    const handleEliminar = async (id: string, nombre: string) => {
        if (!window.confirm(`¿Estás seguro de inhabilitar "${nombre}"?`)) return;
        try {
        await api.delete(`/disenos/${id}`);
        mostrarNotificacion("Diseño inhabilitado correctamente.");
        cargarDisenos();
        } catch (error) {
        mostrarNotificacion("Error al intentar dar de baja.", 'error');
        }
    };

    const handleReactivar = async (id: string, nombre: string) => {
        if (!window.confirm(`¿Deseas reactivar "${nombre}"?`)) return;
        try {
        await api.patch(`/disenos/${id}`, { activo: true });
        mostrarNotificacion("Colección reactivada con éxito.");
        cargarDisenos();
        } catch (error) {
        mostrarNotificacion("Error al intentar reactivar.", 'error');
        }
    };

    return (
        <div className="animate-fade-in relative max-w-7xl mx-auto">
        {notificacion.visible && (
            <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-[var(--radius-suave)] shadow-lg flex items-center gap-3 text-white ${notificacion.tipo === 'success' ? 'bg-[var(--color-yacar-verde)]' : 'bg-[var(--color-yacar-rosa)]'}`}>
            <p className="font-bold">{notificacion.mensaje}</p>
            </div>
        )}

        {isModalOpen && (
            <div className="fixed inset-0 bg-[var(--color-yacar-texto)]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[var(--radius-suave)] shadow-2xl w-full max-w-xl p-6">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--color-yacar-surface)]">
                <h2 className="text-xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">
                    {disenoAEditar ? 'Editar Colección' : 'Nueva Colección'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[var(--color-yacar-rosa)]">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del Patrón / Colección</label>
                    <input type="text" name="nombre_patron" value={formData.nombre_patron} onChange={handleInputChange} required placeholder="Ej: Ajuar Clásico Yacarín" className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-[var(--color-yacar-azul)] text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Color Primario</label>
                    <input type="text" name="color_primario" value={formData.color_primario} onChange={handleInputChange} placeholder="Ej: Blanco" className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-[var(--color-yacar-azul)] text-sm" />
                    </div>
                    <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Color Secundario</label>
                    <input type="text" name="color_secundario" value={formData.color_secundario} onChange={handleInputChange} placeholder="Ej: Celeste Pastel" className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-[var(--color-yacar-azul)] text-sm" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Descripción Técnica</label>
                    <textarea name="descripcion_tecnica" value={formData.descripcion_tecnica} onChange={handleInputChange} required placeholder="Detalles de la confección..." className="w-full px-3 py-2 border border-gray-200 rounded outline-none focus:border-[var(--color-yacar-azul)] resize-none text-sm" rows={3} />
                </div>
                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancelar</Button>
                    <Button type="submit" variant="intense-blue" className="flex-1" isLoading={isSubmitting}>Guardar Diseño</Button>
                </div>
                </form>
            </div>
            </div>
        )}

        <div className="flex justify-between items-center mb-8">
            <div>
            <h1 className="text-3xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">Diseños y Colecciones</h1>
            <p className="text-gray-500 text-sm mt-1">Administra los patrones maestros de costura y sus paletas de color.</p>
            </div>
            <Button onClick={abrirModalCreacion} variant="intense-blue">+ Nuevo Diseño</Button>
        </div>

        <div className="bg-white rounded-[var(--radius-suave)] shadow-sm border border-[var(--color-yacar-surface)] overflow-hidden">
            <table className="w-full text-left border-collapse">
            <thead className="bg-[var(--color-yacar-surface)]/50 border-b border-[var(--color-yacar-surface)]">
                <tr>
                <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Colección / Patrón</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Colores</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm text-center">Estado</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm text-right">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? <tr><td colSpan={4} className="text-center py-8">Cargando...</td></tr> : 
                disenos.length === 0 ? <tr><td colSpan={4} className="text-center py-8">No hay diseños registrados.</td></tr> :
                disenos.map(d => (
                <tr key={d.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${!d.activo ? 'opacity-50 grayscale' : ''}`}>
                    <td className="px-6 py-4">
                    <p className="font-bold text-gray-800 text-sm leading-tight">{d.nombre_patron}</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs mt-1">{d.descripcion_tecnica}</p>
                    </td>
                    <td className="px-6 py-4">
                    <span className="text-xs font-medium text-gray-600">
                        {d.color_primario || 'N/A'} {d.color_secundario && `/ ${d.color_secundario}`}
                    </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                    {d.activo ? (
                        <div className="flex justify-center" title="Activo"><svg className="w-6 h-6 text-[var(--color-yacar-verde)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                    ) : (
                        <div className="flex justify-center" title="Inactivo"><svg className="w-6 h-6 text-[var(--color-yacar-rosa)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                    )}
                    </td>
                    <td className="px-6 py-4">
                    <div className="flex justify-end gap-2 items-center">
                        <button onClick={() => abrirModalEdicion(d)} className="p-2 text-gray-400 hover:text-[var(--color-yacar-azul-vivo)] hover:bg-[var(--color-yacar-azul)]/10 rounded-full transition-colors" title="Editar Diseño">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        {d.activo ? (
                        <button onClick={() => handleEliminar(d.id, d.nombre_patron)} className="p-2 text-gray-400 hover:text-[var(--color-yacar-rosa)] hover:bg-[var(--color-yacar-rosa)]/10 rounded-full transition-colors" title="Dar de Baja">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                        ) : (
                        <button onClick={() => handleReactivar(d.id, d.nombre_patron)} className="p-2 text-gray-400 hover:text-[var(--color-yacar-verde)] hover:bg-[var(--color-yacar-verde)]/10 rounded-full transition-colors" title="Reactivar">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        </button>
                        )}
                    </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>
    );
};