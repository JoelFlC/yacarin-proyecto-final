import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';

type ProveedorType = {
  id: string;
  nombre_empresa: string;
  telefono: string;
  activo: boolean;
};

export const Proveedores = () => {
  const [proveedores, setProveedores] = useState<ProveedorType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proveedorAEditar, setProveedorAEditar] = useState<ProveedorType | null>(null);
  
  const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'success' });

  const [formData, setFormData] = useState({
    nombre_empresa: '',
    telefono: ''
  });

  const mostrarNotificacion = (mensaje: string, tipo: 'success' | 'error' = 'success') => {
    setNotificacion({ visible: true, mensaje, tipo });
    setTimeout(() => setNotificacion({ visible: false, mensaje: '', tipo: 'success' }), 3500);
  };

  const cargarProveedores = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/proveedores'); 
      setProveedores(res.data);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
      mostrarNotificacion("Error al intentar obtener los proveedores.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const abrirModalCreacion = () => {
    setProveedorAEditar(null);
    setFormData({ nombre_empresa: '', telefono: '' });
    setIsModalOpen(true);
  };

  const abrirModalEdicion = (prov: ProveedorType) => {
    setProveedorAEditar(prov);
    setFormData({
      nombre_empresa: prov.nombre_empresa,
      telefono: prov.telefono
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      nombre_empresa: formData.nombre_empresa,
      telefono: formData.telefono
    };

    try {
      if (proveedorAEditar) {
        await api.patch(`/proveedores/${proveedorAEditar.id}`, payload);
        mostrarNotificacion("Proveedor actualizado correctamente.");
      } else {
        await api.post('/proveedores', payload);
        mostrarNotificacion("Nuevo proveedor registrado con éxito.");
      }
      setIsModalOpen(false);
      cargarProveedores();
    } catch (error: any) {
      const msjBackend = error.response?.data?.message;
      const errorReal = Array.isArray(msjBackend) ? msjBackend[0] : msjBackend;
      mostrarNotificacion(errorReal || "Error al procesar el proveedor.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEliminar = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de dar de baja a "${nombre}"?`)) return;
    try {
      await api.delete(`/proveedores/${id}`);
      mostrarNotificacion(`${nombre} ha sido inhabilitado.`);
      cargarProveedores();
    } catch (error: any) {
      mostrarNotificacion("Hubo un error al intentar eliminar el proveedor.", 'error');
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
          <div className="bg-white rounded-[var(--radius-suave)] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-[var(--color-yacar-surface)] flex justify-between items-center bg-[var(--color-yacar-crema)]/30">
              <h2 className="text-xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">
                {proveedorAEditar ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[var(--color-yacar-rosa)] transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre o Razón Social</label>
                <input type="text" name="nombre_empresa" value={formData.nombre_empresa} onChange={handleInputChange} required placeholder="Ej: Importadora Telas del Sur" className="w-full px-3 py-2 rounded border border-gray-200 outline-none text-sm focus:border-[var(--color-yacar-azul)]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono o Celular</label>
                <input type="text" name="telefono" value={formData.telefono} onChange={handleInputChange} required placeholder="Ej: 71234567" className="w-full px-3 py-2 rounded border border-gray-200 outline-none text-sm focus:border-[var(--color-yacar-azul)]" />
              </div>

              <div className="pt-6 flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancelar</Button>
                <Button type="submit" variant="intense-blue" className="flex-1" isLoading={isSubmitting}>
                  {proveedorAEditar ? 'Guardar Cambios' : 'Registrar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">Proveedores</h1>
          <p className="text-gray-500 text-sm mt-1">Catálogo de empresas abastecedoras de insumos.</p>
        </div>
        <Button onClick={abrirModalCreacion} variant="intense-blue">
          + Registrar Proveedor
        </Button>
      </div>

      <div className="bg-white rounded-[var(--radius-suave)] shadow-sm border border-[var(--color-yacar-surface)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-yacar-surface)]/50 border-b border-[var(--color-yacar-surface)]">
              <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Empresa</th>
              <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Teléfono</th>
              <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm text-center">Estado</th>
              <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="text-center py-8">Cargando proveedores...</td></tr>
            ) : proveedores.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8">No hay proveedores registrados.</td></tr>
            ) : (
              proveedores.map((prov) => (
                <tr key={prov.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${!prov.activo ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{prov.nombre_empresa}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">
                    {prov.telefono}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {prov.activo ? (
                      <span className="text-xs bg-[var(--color-yacar-verde)]/10 text-[var(--color-yacar-verde)] px-2 py-1 rounded-full font-bold border border-[var(--color-yacar-verde)]/20">ACTIVO</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-bold border border-gray-200">INACTIVO</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2 items-center">
                      {prov.activo && (
                        <>
                          <button onClick={() => abrirModalEdicion(prov)} className="p-2 text-gray-400 hover:text-[var(--color-yacar-azul-vivo)] hover:bg-[var(--color-yacar-azul)]/10 rounded-full transition-colors" title="Editar Proveedor">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                          </button>
                          
                          <button onClick={() => handleEliminar(prov.id, prov.nombre_empresa)} className="p-2 text-gray-400 hover:text-[var(--color-yacar-rosa)] hover:bg-[var(--color-yacar-rosa)]/10 rounded-full transition-colors" title="Eliminar Proveedor">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </>
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
