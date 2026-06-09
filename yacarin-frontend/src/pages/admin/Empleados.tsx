import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';

type EmpleadoType = {
    id?: string; // 💡 Lo hacemos opcional porque el backend a veces no lo envía
    empleado_id?: string; // Posible nombre alternativo del backend
    especialidades?: {
        corte: boolean;
        costura: boolean;
        empaque: boolean;
        tejeduria: boolean;
    };
    usuario: {
        id: string; // Este ID SIEMPRE existe
        nombre: string;
        apPat: string;
        apMat: string;
        email: string;
        celular: string;
        activo: boolean;
    };
    };

    export const Empleados = () => {
    const [empleados, setEmpleados] = useState<EmpleadoType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [empleadoAEditar, setEmpleadoAEditar] = useState<EmpleadoType | null>(null);
    
    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'success' });

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nombre: '',
        apPat: '',
        apMat: '',
        celular: ''
    });
    
    const [especialidades, setEspecialidades] = useState({
        corte: false,
        costura: false,
        empaque: false,
        tejeduria: false
    });

    const mostrarNotificacion = (mensaje: string, tipo: 'success' | 'error' = 'success') => {
        setNotificacion({ visible: true, mensaje, tipo });
        setTimeout(() => setNotificacion({ visible: false, mensaje: '', tipo: 'success' }), 3500);
    };

    const cargarEmpleados = async () => {
        try {
        setIsLoading(true);
        const res = await api.get('/empleados');
        setEmpleados(res.data);
        } catch (error) {
        console.error("Error cargando empleados:", error);
        mostrarNotificacion("Error al intentar obtener la lista de personal.", 'error');
        } finally {
        setIsLoading(false);
        }
    };

    useEffect(() => {
        cargarEmpleados();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEspecialidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setEspecialidades(prev => ({ ...prev, [name]: checked }));
    };

    const abrirModalEdicion = (emp: EmpleadoType) => {
        setEmpleadoAEditar(emp);
        setFormData({
        email: emp.usuario.email,
        password: '', 
        nombre: emp.usuario.nombre,
        apPat: emp.usuario.apPat,
        apMat: emp.usuario.apMat || '',
        celular: emp.usuario.celular
        });
        setEspecialidades(emp.especialidades || { corte: false, costura: false, empaque: false, tejeduria: false });
        setIsModalOpen(true);
    };

    const abrirModalCreacion = () => {
        setEmpleadoAEditar(null);
        setFormData({ email: '', password: '', nombre: '', apPat: '', apMat: '', celular: '' });
        setEspecialidades({ corte: false, costura: false, empaque: false, tejeduria: false });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
        if (empleadoAEditar) {
            // 💡 1. MODO EDICIÓN: Armamos un Payload ESTRICTO solo con los campos permitidos
            const personalPayload: any = {
            nombre: formData.nombre,
            apPat: formData.apPat,
            celular: formData.celular
            };
            
            // Evitamos enviar strings vacíos que rompan validaciones
            if (formData.apMat.trim() !== '') personalPayload.apMat = formData.apMat;
            if (formData.password.trim() !== '') personalPayload.password = formData.password;

            // 💡 2. Buscamos el ID del empleado. Si es undefined, usamos el del usuario (1-to-1 fallback)
            const idEmpleado = empleadoAEditar.id || empleadoAEditar.empleado_id || empleadoAEditar.usuario.id;

            // Mandamos ambas peticiones en paralelo
            await Promise.all([
            api.patch(`/usuarios/${empleadoAEditar.usuario.id}`, personalPayload),
            api.patch(`/empleados/${idEmpleado}`, { especialidades })
            ]);
            mostrarNotificacion("Datos y especialidades actualizados correctamente.");
        } else {
            // MODO CREACIÓN
            await api.post('/usuarios/empleados', { ...formData, especialidades });
            mostrarNotificacion("Empleado contratado y registrado con éxito.");
        }
        
        setIsModalOpen(false);
        cargarEmpleados();
        } catch (error: any) {
        console.error(error.response);
        mostrarNotificacion(error.response?.data?.message || "Error de validación al procesar la solicitud.", 'error');
        } finally {
        setIsSubmitting(false);
        }
    };

    const handleDarDeBaja = async (id: string, nombre: string) => {
        if (!window.confirm(`¿Estás seguro de dar de baja a ${nombre}?`)) return;
        try {
        await api.delete(`/usuarios/${id}`);
        mostrarNotificacion(`${nombre} ha sido inhabilitado exitosamente.`);
        cargarEmpleados();
        } catch (error: any) {
        mostrarNotificacion("Error al intentar dar de baja.", 'error');
        }
    };

    const handleReactivar = async (id: string, nombre: string) => {
        if (!window.confirm(`¿Deseas reactivar el acceso de ${nombre}?`)) return;
        try {
        await api.patch(`/usuarios/${id}`, { activo: true });
        mostrarNotificacion(`${nombre} ha sido reactivado y ya puede acceder al sistema.`);
        cargarEmpleados();
        } catch (error: any) {
        // Magia para leer el Array de errores de class-validator
        const msjBackend = error.response?.data?.message;
        const errorReal = Array.isArray(msjBackend) ? msjBackend[0] : msjBackend;
        
        console.error("Detalle del rechazo del backend:", error.response?.data);
        mostrarNotificacion(errorReal || "Error de validación al reactivar.", 'error');
        }
    };

    return (
        <div className="animate-fade-in relative">
        
        {notificacion.visible && (
            <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-[var(--radius-suave)] shadow-lg animate-fade-in flex items-center gap-3 ${
            notificacion.tipo === 'success' ? 'bg-[var(--color-yacar-verde)] text-white' : 'bg-[var(--color-yacar-rosa)] text-white'
            }`}>
            <p className="font-bold">{notificacion.mensaje}</p>
            </div>
        )}

        {isModalOpen && (
            <div className="fixed inset-0 bg-[var(--color-yacar-texto)]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[var(--radius-suave)] shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-[var(--color-yacar-surface)] flex justify-between items-center bg-[var(--color-yacar-crema)]/30">
                <h2 className="text-xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">
                    {empleadoAEditar ? 'Editar Datos del Operario' : 'Contratar Operario'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[var(--color-yacar-rosa)] transition-colors">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nombre</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required className="w-full px-3 py-2 rounded border border-gray-200 outline-none text-sm" />
                    </div>
                    <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Apellido Paterno</label>
                    <input type="text" name="apPat" value={formData.apPat} onChange={handleInputChange} required className="w-full px-3 py-2 rounded border border-gray-200 outline-none text-sm" />
                    </div>
                    <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Apellido Materno</label>
                    <input type="text" name="apMat" value={formData.apMat} onChange={handleInputChange} className="w-full px-3 py-2 rounded border border-gray-200 outline-none text-sm" />
                    </div>
                    <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Celular</label>
                    <input type="text" name="celular" value={formData.celular} onChange={handleInputChange} required className="w-full px-3 py-2 rounded border border-gray-200 outline-none text-sm" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required readOnly={!!empleadoAEditar} className={`w-full px-3 py-2 rounded border border-gray-200 outline-none text-sm ${empleadoAEditar ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`} />
                    </div>
                    <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                        {empleadoAEditar ? 'Nueva Contraseña (Opcional)' : 'Contraseña Inicial'}
                    </label>
                    <input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        required={!empleadoAEditar} 
                        minLength={6} 
                        placeholder={empleadoAEditar ? 'Dejar en blanco para no cambiar' : ''}
                        className="w-full px-3 py-2 rounded border border-gray-200 outline-none text-sm" 
                    />
                    </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-yacar-surface)]">
                    <label className="block text-sm font-bold text-[var(--color-yacar-texto)] mb-3">Especialidades de Manufactura</label>
                    <div className="grid grid-cols-2 gap-3">
                    {Object.keys(especialidades).map((esp) => (
                        <label key={esp} className="flex items-center gap-2 text-sm capitalize bg-gray-50 p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors">
                        <input 
                            type="checkbox" 
                            name={esp} 
                            checked={especialidades[esp as keyof typeof especialidades]} 
                            onChange={handleEspecialidadChange}
                            className="w-4 h-4 text-[var(--color-yacar-azul)]"
                        />
                        {esp}
                        </label>
                    ))}
                    </div>
                </div>

                <div className="pt-6 flex gap-3">
                    <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancelar</Button>
                    <Button type="submit" variant="intense-blue" className="flex-1" isLoading={isSubmitting}>
                    {empleadoAEditar ? 'Guardar Cambios' : 'Registrar Empleado'}
                    </Button>
                </div>
                </form>
            </div>
            </div>
        )}

        <div className="flex justify-between items-center mb-8">
            <div>
            <h1 className="text-3xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">Gestión de Personal</h1>
            <p className="text-gray-500 text-sm mt-1">Controla a los operarios del taller y sus especialidades.</p>
            </div>
            <Button onClick={abrirModalCreacion} variant="intense-blue">
            + Nuevo Operario
            </Button>
        </div>

        <div className="bg-white rounded-[var(--radius-suave)] shadow-sm border border-[var(--color-yacar-surface)] overflow-hidden">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-[var(--color-yacar-surface)]/50 border-b border-[var(--color-yacar-surface)]">
                <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Operario</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Contacto</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Especialidades</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm text-center">Estado</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm text-right">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8">Cargando personal...</td></tr>
                ) : empleados.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8">No hay empleados registrados.</td></tr>
                ) : (
                empleados.map((emp) => (
                    // 💡 3. CORRECCIÓN: Usamos emp.usuario.id como llave segura para React
                    <tr key={emp.usuario?.id || Math.random()} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                        <p className="font-bold text-gray-800">{emp.usuario?.nombre} {emp.usuario?.apPat} {emp.usuario?.apMat}</p>
                        <p className="text-xs text-gray-500">{emp.usuario?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">Cel: {emp.usuario?.celular}</td>
                    <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                        {emp.especialidades && Object.entries(emp.especialidades).map(([key, value]) => 
                            value && <span key={key} className="text-[10px] bg-[var(--color-yacar-azul)]/10 text-[var(--color-yacar-azul-vivo)] px-2 py-0.5 rounded-full capitalize border border-[var(--color-yacar-azul)]/20">{key}</span>
                        )}
                        </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                        {emp.usuario?.activo ? (
                        <div className="flex justify-center" title="Activo">
                            <svg className="w-6 h-6 text-[var(--color-yacar-verde)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        ) : (
                        <div className="flex justify-center" title="Inactivo">
                            <svg className="w-6 h-6 text-[var(--color-yacar-rosa)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        )}
                    </td>
                    
                    <td className="px-6 py-4">
                        <div className="flex justify-end gap-3 items-center">
                        
                        <button onClick={() => abrirModalEdicion(emp)} className="p-2 text-gray-400 hover:text-[var(--color-yacar-azul-vivo)] hover:bg-[var(--color-yacar-azul)]/10 rounded-full transition-colors" title="Editar Operario">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        
                        {emp.usuario?.activo ? (
                            <button onClick={() => handleDarDeBaja(emp.usuario.id, emp.usuario.nombre)} className="p-2 text-gray-400 hover:text-[var(--color-yacar-rosa)] hover:bg-[var(--color-yacar-rosa)]/10 rounded-full transition-colors" title="Dar de Baja">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        ) : (
                            <button onClick={() => handleReactivar(emp.usuario.id, emp.usuario.nombre)} className="p-2 text-gray-400 hover:text-[var(--color-yacar-verde)] hover:bg-[var(--color-yacar-verde)]/10 rounded-full transition-colors" title="Reactivar Acceso">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            </button>
                        )}
                        
                        </div>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
        </div>
    );
};