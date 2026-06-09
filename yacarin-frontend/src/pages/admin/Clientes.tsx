import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';

type ClienteType = {
    id: string; 
    tipo_cliente: 'MINORISTA' | 'MAYORISTA';
    nit?: string;
    razon_social?: string;
    usuario: {
        id: string; 
        nombre: string;
        apPat: string;
        apMat?: string;
        email: string;
        celular: string;
        activo: boolean;
    };
};

    export const Clientes = () => {
    const [clientes, setClientes] = useState<ClienteType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clienteAEditar, setClienteAEditar] = useState<ClienteType | null>(null);
    
    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'success' });

    const [formData, setFormData] = useState({
        nombre: '',
        apPat: '',
        celular: '',
        nit: '',
        razon_social: ''
    });

    const mostrarNotificacion = (mensaje: string, tipo: 'success' | 'error' = 'success') => {
        setNotificacion({ visible: true, mensaje, tipo });
        setTimeout(() => setNotificacion({ visible: false, mensaje: '', tipo: 'success' }), 3500);
    };

    const cargarClientes = async () => {
        try {
        setIsLoading(true);
        const res = await api.get('/clientes');
        setClientes(res.data);
        } catch (error) {
        mostrarNotificacion("Error al conectar con la base de datos de clientes.", 'error');
        } finally {
        setIsLoading(false);
        }
    };

    useEffect(() => { cargarClientes(); }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const abrirModalEdicion = (cliente: ClienteType) => {
        setClienteAEditar(cliente);
        setFormData({
        nombre: cliente.usuario.nombre,
        apPat: cliente.usuario.apPat,
        celular: cliente.usuario.celular,
        nit: cliente.nit || '',
        razon_social: cliente.razon_social || ''
        });
        setIsModalOpen(true);
    };

    // 💡 EDICIÓN BLINDADA: Filtramos campos vacíos para no hacer enojar al backend
    const handleEditar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clienteAEditar) return;
        setIsSubmitting(true);
        
        try {
        const payloadUsuario: any = {};
        if (formData.nombre.trim()) payloadUsuario.nombre = formData.nombre;
        if (formData.apPat.trim()) payloadUsuario.apPat = formData.apPat;
        if (formData.celular.trim()) payloadUsuario.celular = formData.celular;
        
        const payloadCliente: any = {};
        if (formData.nit.trim()) payloadCliente.nit = formData.nit;
        if (formData.razon_social.trim()) payloadCliente.razon_social = formData.razon_social;

        const promesas = [];
        
        // Solo enviamos PATCH a /usuarios si hay datos que actualizar
        if (Object.keys(payloadUsuario).length > 0) {
            promesas.push(api.patch(`/usuarios/${clienteAEditar.usuario.id}`, payloadUsuario));
        }
        
        // Solo enviamos PATCH a /clientes si hay datos que actualizar
        if (Object.keys(payloadCliente).length > 0) {
            promesas.push(api.patch(`/clientes/${clienteAEditar.usuario.id}`, payloadCliente));
        }

        if (promesas.length > 0) {
            await Promise.all(promesas);
            mostrarNotificacion("Datos actualizados correctamente.");
        }
        
        setIsModalOpen(false);
        cargarClientes();
        } catch (error: any) {
        // 💡 Capturador Avanzado: Lee exactamente de qué se queja el backend
        const msjBackend = error.response?.data?.message;
        const errorReal = Array.isArray(msjBackend) ? msjBackend[0] : msjBackend;
        mostrarNotificacion(errorReal || "Error de validación al guardar cambios.", 'error');
        } finally {
        setIsSubmitting(false);
        }
    };

    const handleAprobarB2B = async (idUsuario: string, nombre: string) => {
        if (!window.confirm(`¿Ascender a "${nombre}" a la categoría MAYORISTA? Esto activará descuentos en su cuenta.`)) return;
        try {
        await api.patch(`/clientes/${idUsuario}/aprobar-b2b`);
        mostrarNotificacion(`${nombre} ha sido aprobado como B2B.`);
        cargarClientes();
        } catch (error) {
        mostrarNotificacion("Error al intentar procesar la aprobación B2B.", 'error');
        }
    };

    const handleRechazarB2B = async (idUsuario: string, nombre: string) => {
        if (!window.confirm(`¿Estás seguro de rechazar la solicitud B2B de "${nombre}"? Se borrarán sus datos de facturación.`)) return;
        try {
        await api.patch(`/clientes/${idUsuario}/rechazar-b2b`);
        mostrarNotificacion(`Solicitud B2B de ${nombre} rechazada.`);
        cargarClientes();
        } catch (error) {
        mostrarNotificacion("Error al intentar rechazar la solicitud B2B.", 'error');
        }
    };

    const handleBloquear = async (idUsuario: string, nombre: string) => {
        if (!window.confirm(`¿Estás seguro de inhabilitar temporalmente a "${nombre}"?`)) return;
        try {
        await api.delete(`/usuarios/${idUsuario}`);
        mostrarNotificacion("La cuenta del cliente ha sido bloqueada.");
        cargarClientes();
        } catch (error) {
        mostrarNotificacion("Error al intentar suspender la cuenta.", 'error');
        }
    };

    const handleReactivar = async (idUsuario: string, nombre: string) => {
        if (!window.confirm(`¿Deseas levantar el bloqueo y devolver el acceso a "${nombre}"?`)) return;
        try {
        await api.patch(`/usuarios/${idUsuario}`, { activo: true });
        mostrarNotificacion("Acceso reactivado con éxito.");
        cargarClientes();
        } catch (error) {
        mostrarNotificacion("Error al reactivar cuenta.", 'error');
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
            <div className="bg-white rounded-[var(--radius-suave)] shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--color-yacar-surface)]">
                <h2 className="text-xl font-bold text-[var(--color-yacar-texto)]">Corrección de Datos</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[var(--color-yacar-rosa)]">✕</button>
                </div>
                <form onSubmit={handleEditar} className="space-y-6">
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-bold text-[var(--color-yacar-azul)] mb-4">Perfil de Usuario</h3>
                    <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Nombre</label>
                        <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded outline-none focus:border-[var(--color-yacar-azul)] text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Apellido Paterno</label>
                        <input type="text" name="apPat" value={formData.apPat} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded outline-none focus:border-[var(--color-yacar-azul)] text-sm" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono / Celular</label>
                        <input type="text" name="celular" value={formData.celular} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded outline-none focus:border-[var(--color-yacar-azul)] text-sm" />
                    </div>
                    </div>
                </div>

                <div className="bg-[var(--color-yacar-dorado)]/5 p-4 rounded-lg border border-[var(--color-yacar-dorado)]/20">
                    <h3 className="text-sm font-bold text-[var(--color-yacar-dorado)] mb-4">Información de Facturación</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Número de NIT</label>
                        <input type="text" name="nit" value={formData.nit} onChange={handleInputChange} className="w-full px-3 py-2 border rounded outline-none focus:border-[var(--color-yacar-dorado)] font-mono text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Razón Social</label>
                        <input type="text" name="razon_social" value={formData.razon_social} onChange={handleInputChange} className="w-full px-3 py-2 border rounded outline-none focus:border-[var(--color-yacar-dorado)] text-sm" />
                    </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-[var(--color-yacar-surface)]">
                    <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancelar</Button>
                    <Button type="submit" variant="intense-blue" className="flex-1" isLoading={isSubmitting}>Guardar Cambios</Button>
                </div>
                </form>
            </div>
            </div>
        )}

        <div className="flex justify-between items-center mb-8">
            <div>
            <h1 className="text-3xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">Cartera de Clientes</h1>
            <p className="text-gray-500 text-sm mt-1">Gestión integral de usuarios B2C, B2B y aprobaciones comerciales.</p>
            </div>
        </div>

        {clientes.filter(cli => cli.tipo_cliente === 'MINORISTA' && cli.nit).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[var(--color-yacar-dorado)] mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Solicitudes B2B Pendientes
            </h2>
            <div className="bg-[var(--color-yacar-dorado)]/5 rounded-[var(--radius-suave)] border border-[var(--color-yacar-dorado)]/20 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientes.filter(cli => cli.tipo_cliente === 'MINORISTA' && cli.nit).map(cli => (
                  <div key={cli.id} className="bg-white p-4 rounded-lg border border-[var(--color-yacar-dorado)]/20 shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="font-bold text-gray-800">{cli.usuario?.nombre} {cli.usuario?.apPat}</p>
                      <p className="text-xs text-gray-500 mb-2">{cli.usuario?.email}</p>
                      <div className="text-sm">
                        <span className="font-semibold">NIT:</span> <span className="font-mono">{cli.nit}</span><br />
                        <span className="font-semibold">Razón Social:</span> {cli.razon_social}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button onClick={() => handleAprobarB2B(cli.usuario.id, cli.usuario.nombre)} className="flex-1 bg-[var(--color-yacar-verde)] hover:bg-green-600 text-white text-xs font-bold py-2 rounded transition-colors">
                        Aprobar
                      </button>
                      <button onClick={() => handleRechazarB2B(cli.usuario.id, cli.usuario.nombre)} className="flex-1 bg-[var(--color-yacar-rosa)]/10 hover:bg-[var(--color-yacar-rosa)] text-[var(--color-yacar-rosa)] hover:text-white text-xs font-bold py-2 rounded transition-colors">
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[var(--radius-suave)] shadow-sm border border-[var(--color-yacar-surface)] overflow-hidden">
            <table className="w-full text-left border-collapse">
            <thead className="bg-[var(--color-yacar-surface)]/50 border-b border-[var(--color-yacar-surface)]">
                <tr>
                <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Cliente</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Segmento</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Facturación</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm text-center">Estado</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm text-right">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? <tr><td colSpan={5} className="text-center py-8">Cargando base de datos...</td></tr> : 
                clientes.length === 0 ? <tr><td colSpan={5} className="text-center py-8">No hay clientes.</td></tr> :
                clientes.map(cli => (
                <tr key={cli.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${!cli.usuario?.activo ? 'opacity-50 grayscale' : ''}`}>
                    
                    <td className="px-6 py-4">
                    <p className="font-bold text-gray-800 leading-tight">
                        {cli.usuario?.nombre} {cli.usuario?.apPat} {cli.usuario?.apMat}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{cli.usuario?.email} • Cel: {cli.usuario?.celular}</p>
                    </td>
                    
                    <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider ${
                        cli.tipo_cliente === 'MAYORISTA' 
                        ? 'bg-[var(--color-yacar-dorado)]/10 text-[var(--color-yacar-dorado)] border border-[var(--color-yacar-dorado)]/20' 
                        : 'bg-[var(--color-yacar-azul)]/10 text-[var(--color-yacar-azul-vivo)] border border-[var(--color-yacar-azul)]/20'
                    }`}>
                        {cli.tipo_cliente}
                    </span>
                    </td>
                    
                    <td className="px-6 py-4">
                    {cli.nit ? (
                        <div>
                        <p className="font-bold text-gray-700 text-sm">NIT: <span className="font-mono">{cli.nit}</span></p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]" title={cli.razon_social}>{cli.razon_social}</p>
                        </div>
                    ) : (
                        <span className="text-xs text-gray-400 italic">Consumidor Final (Sin Datos)</span>
                    )}
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                    {cli.usuario?.activo ? (
                        <div className="flex justify-center" title="Cuenta Activa">
                        <svg className="w-6 h-6 text-[var(--color-yacar-verde)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                    ) : (
                        <div className="flex justify-center" title="Cuenta Suspendida">
                        <svg className="w-6 h-6 text-[var(--color-yacar-rosa)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                    )}
                    </td>
                    
                    <td className="px-6 py-4">
                    <div className="flex justify-end gap-2 items-center">
                        
                        {cli.tipo_cliente === 'MINORISTA' && cli.nit && cli.usuario?.activo && (
                          <div className="flex gap-1 mr-2">
                            <button 
                                onClick={() => handleAprobarB2B(cli.usuario.id, cli.usuario.nombre)} 
                                className="text-[10px] uppercase font-bold text-white bg-[var(--color-yacar-verde)] hover:bg-green-600 px-3 py-1.5 rounded shadow-sm transition-colors"
                                title="Aprobar Solicitud B2B"
                            >
                                ✓ Aprobar
                            </button>
                            <button 
                                onClick={() => handleRechazarB2B(cli.usuario.id, cli.usuario.nombre)} 
                                className="text-[10px] uppercase font-bold text-[var(--color-yacar-rosa)] bg-[var(--color-yacar-rosa)]/10 hover:bg-[var(--color-yacar-rosa)] hover:text-white px-3 py-1.5 rounded shadow-sm transition-colors"
                                title="Rechazar Solicitud B2B"
                            >
                                ✕ Rechazar
                            </button>
                          </div>
                        )}
                        
                        <button onClick={() => abrirModalEdicion(cli)} className="p-2 text-gray-400 hover:text-[var(--color-yacar-azul-vivo)] hover:bg-[var(--color-yacar-azul)]/10 rounded-full transition-colors" title="Corregir Datos">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        
                        {cli.usuario?.activo ? (
                        <button onClick={() => handleBloquear(cli.usuario.id, cli.usuario.nombre)} className="p-2 text-gray-400 hover:text-[var(--color-yacar-rosa)] hover:bg-[var(--color-yacar-rosa)]/10 rounded-full transition-colors" title="Suspender Cuenta">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                        </button>
                        ) : (
                        <button onClick={() => handleReactivar(cli.usuario.id, cli.usuario.nombre)} className="p-2 text-gray-400 hover:text-[var(--color-yacar-verde)] hover:bg-[var(--color-yacar-verde)]/10 rounded-full transition-colors" title="Devolver Acceso">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
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