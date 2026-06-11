import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';

// 💡 1. INTERFAZ ACTUALIZADA AL CONTRATO DEL BACKEND
type MaterialType = {
    id: string;
    nombre: string;
    unidad_medida: string; 
    costo_base_usd: number; // 💡 Corregido
    stock_actual: number;
    activo: boolean; // 💡 Agregado según el backend
};

    export const Bodega = () => {
    const [materiales, setMateriales] = useState<MaterialType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [materialAEditar, setMaterialAEditar] = useState<MaterialType | null>(null);
    
    // Estados para la Compra de Materiales
    const [proveedores, setProveedores] = useState<any[]>([]);
    const [isModalCompraOpen, setIsModalCompraOpen] = useState(false);
    const [materialAComprar, setMaterialAComprar] = useState<MaterialType | null>(null);
    const [compraData, setCompraData] = useState({ proveedor_id: '', cantidad: '', precio_compra_usd: '' });

    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'success' });

    // 💡 2. FORMULARIO LIMPIO, SOLO CON LOS CAMPOS PERMITIDOS
    const [formData, setFormData] = useState({
        nombre: '',
        unidad_medida: 'Metros',
        costo_base_usd: '',
        stock_actual: ''
    });

    const mostrarNotificacion = (mensaje: string, tipo: 'success' | 'error' = 'success') => {
        setNotificacion({ visible: true, mensaje, tipo });
        setTimeout(() => setNotificacion({ visible: false, mensaje: '', tipo: 'success' }), 3500);
    };

    const cargarMateriales = async () => {
        try {
        setIsLoading(true);
        const [resMat, resProv] = await Promise.all([
            api.get('/materiales'),
            api.get('/proveedores')
        ]); 
        setMateriales(resMat.data);
        // Filtrar solo proveedores activos
        setProveedores(resProv.data.filter((p: any) => p.activo));
        } catch (error) {
        console.error("Error cargando bodega:", error);
        mostrarNotificacion("Error al intentar obtener el inventario.", 'error');
        } finally {
        setIsLoading(false);
        }
    };

    useEffect(() => {
        cargarMateriales();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCompraChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCompraData(prev => ({ ...prev, [name]: value }));
    };

    const abrirModalCreacion = () => {
        setMaterialAEditar(null);
        setFormData({ nombre: '', unidad_medida: 'Metros', costo_base_usd: '', stock_actual: '' });
        setIsModalOpen(true);
    };

    const abrirModalEdicion = (mat: MaterialType) => {
        setMaterialAEditar(mat);
        // 💡 3. MAPEO SEGURO AL ABRIR EL MODAL
        setFormData({
        nombre: mat.nombre,
        unidad_medida: mat.unidad_medida,
        costo_base_usd: mat.costo_base_usd ? mat.costo_base_usd.toString() : '0',
        stock_actual: mat.stock_actual ? mat.stock_actual.toString() : '0'
        });
        setIsModalOpen(true);
    };

    const abrirModalCompra = (mat: MaterialType) => {
        setMaterialAComprar(mat);
        setCompraData({ proveedor_id: '', cantidad: '', precio_compra_usd: '' });
        setIsModalCompraOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // 💡 4. PAYLOAD ESTRICTO SEGÚN EL DTO DEL BACKEND
        const payload = {
        nombre: formData.nombre,
        unidad_medida: formData.unidad_medida,
        costo_base_usd: Number(formData.costo_base_usd),
        stock_actual: Number(formData.stock_actual)
        };

        try {
        if (materialAEditar) {
            // En edición, a veces no se manda el nombre si no cambió, pero lo mandamos por seguridad
            await api.patch(`/materiales/${materialAEditar.id}`, payload);
            mostrarNotificacion("Material actualizado correctamente en bodega.");
        } else {
            await api.post('/materiales', payload);
            mostrarNotificacion("Nuevo material ingresado al almacén con éxito.");
        }
        
        setIsModalOpen(false);
        cargarMateriales();
        } catch (error: any) {
        // Capturador avanzado de errores de class-validator
        const msjBackend = error.response?.data?.message;
        const errorReal = Array.isArray(msjBackend) ? msjBackend[0] : msjBackend;
        mostrarNotificacion(errorReal || "Error al procesar el material.", 'error');
        } finally {
        setIsSubmitting(false);
        }
    };

    const handleCompraSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            proveedor_id: compraData.proveedor_id,
            material_id: materialAComprar?.id,
            cantidad: Number(compraData.cantidad),
            precio_compra_usd: Number(compraData.precio_compra_usd)
        };

        try {
            await api.post('/compra-material', payload);
            mostrarNotificacion("Ingreso de material registrado correctamente.");
            setIsModalCompraOpen(false);
            cargarMateriales();
        } catch (error: any) {
            const msjBackend = error.response?.data?.message;
            const errorReal = Array.isArray(msjBackend) ? msjBackend[0] : msjBackend;
            mostrarNotificacion(errorReal || "Error al registrar la compra.", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEliminar = async (id: string, nombre: string) => {
        if (!window.confirm(`¿Estás seguro de dar de baja "${nombre}" del inventario?`)) return;
        try {
        // Tu backend hace borrado lógico (activo: false)
        await api.delete(`/materiales/${id}`);
        mostrarNotificacion(`${nombre} ha sido inhabilitado.`);
        cargarMateriales();
        } catch (error: any) {
        mostrarNotificacion("Hubo un error al intentar eliminar el material.", 'error');
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
            <div className="bg-white rounded-[var(--radius-suave)] shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-[var(--color-yacar-surface)] flex justify-between items-center bg-[var(--color-yacar-crema)]/30">
                <h2 className="text-xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">
                    {materialAEditar ? 'Editar Insumo' : 'Ingresar Nuevo Insumo'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[var(--color-yacar-rosa)] transition-colors">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del Material</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required placeholder="Ej: Tela Polar Soft Azul" className="w-full px-3 py-2 rounded border border-gray-200 outline-none text-sm focus:border-[var(--color-yacar-azul)]" />
                    </div>

                    <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Unidad de Medida</label>
                    <select name="unidad_medida" value={formData.unidad_medida} onChange={handleInputChange} required className="w-full px-3 py-2 rounded border border-gray-200 outline-none text-sm focus:border-[var(--color-yacar-azul)] bg-white">
                        <option value="Metros">Metros (Telas, Cintas)</option>
                        <option value="Conos">Conos (Hilos)</option>
                        <option value="Unidades">Unidades (Botones, Cierres)</option>
                        <option value="Kg">Kilogramos (Lana)</option>
                    </select>
                    </div>

                    <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Costo Base ($ USD)</label>
                    <input type="number" step="0.01" min="0" name="costo_base_usd" value={formData.costo_base_usd} onChange={handleInputChange} required placeholder="0.00" className={`w-full px-3 py-2 rounded border border-gray-200 outline-none text-sm focus:border-[var(--color-yacar-azul)] ${materialAEditar ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} disabled={!!materialAEditar} title={materialAEditar ? "El costo base se actualiza automáticamente al registrar compras" : ""} />
                    </div>

                    <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Stock Físico Actual</label>
                    <input type="number" step="0.01" min="0" name="stock_actual" value={formData.stock_actual} onChange={handleInputChange} required placeholder="Cantidad" className={`w-full px-3 py-2 rounded border border-gray-200 outline-none text-sm focus:border-[var(--color-yacar-azul)] ${materialAEditar ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} disabled={!!materialAEditar} title={materialAEditar ? "El stock se infla matemáticamente al registrar compras" : ""} />
                    </div>
                </div>

                <div className="pt-6 flex gap-3">
                    <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancelar</Button>
                    <Button type="submit" variant="intense-blue" className="flex-1" isLoading={isSubmitting}>
                    {materialAEditar ? 'Guardar Cambios' : 'Registrar Insumo'}
                    </Button>
                </div>
                </form>
            </div>
            </div>
        )}

        {isModalCompraOpen && materialAComprar && (
            <div className="fixed inset-0 bg-[var(--color-yacar-texto)]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-[var(--radius-suave)] shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-[var(--color-yacar-surface)] flex justify-between items-center bg-[var(--color-yacar-crema)]/30">
                        <h2 className="text-xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">
                            Comprar Material
                        </h2>
                        <button onClick={() => setIsModalCompraOpen(false)} className="text-gray-400 hover:text-[var(--color-yacar-rosa)] transition-colors">✕</button>
                    </div>
                    
                    <form onSubmit={handleCompraSubmit} className="p-6 space-y-4">
                        <div className="bg-[var(--color-yacar-azul)]/5 p-3 rounded text-sm text-[var(--color-yacar-texto)] font-medium mb-2 border border-[var(--color-yacar-azul)]/20">
                            <strong>Material a ingresar:</strong> {materialAComprar.nombre}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Proveedor</label>
                            <select name="proveedor_id" value={compraData.proveedor_id} onChange={handleCompraChange} required className="w-full px-3 py-2 rounded border border-gray-200 outline-none text-sm focus:border-[var(--color-yacar-azul)] bg-white">
                                <option value="" disabled>Seleccione un proveedor...</option>
                                {proveedores.map(prov => (
                                    <option key={prov.id} value={prov.id}>{prov.nombre_empresa}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Cantidad a ingresar ({materialAComprar.unidad_medida})</label>
                            <input type="number" step="0.01" min="0.01" name="cantidad" value={compraData.cantidad} onChange={handleCompraChange} required placeholder="Ej: 50" className="w-full px-3 py-2 rounded border border-gray-200 outline-none text-sm focus:border-[var(--color-yacar-azul)]" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Precio Compra Total ($ USD)</label>
                            <input type="number" step="0.01" min="0" name="precio_compra_usd" value={compraData.precio_compra_usd} onChange={handleCompraChange} required placeholder="Ej: 100.50" className="w-full px-3 py-2 rounded border border-gray-200 outline-none text-sm focus:border-[var(--color-yacar-azul)]" />
                            <p className="text-[10px] text-gray-400 mt-1">Se convertirá históricamente a Bs. usando el tipo de cambio oficial de hoy.</p>
                        </div>

                        <div className="pt-6 flex gap-3">
                            <Button type="button" variant="secondary" onClick={() => setIsModalCompraOpen(false)} className="flex-1">Cancelar</Button>
                            <Button type="submit" variant="intense-blue" className="flex-1 flex items-center justify-center gap-2" isLoading={isSubmitting}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                Registrar Ingreso
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        <div className="flex justify-between items-center mb-8">
            <div>
            <h1 className="text-3xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">Bodega y Almacén</h1>
            <p className="text-gray-500 text-sm mt-1">Control de inventario, materias primas y costos.</p>
            </div>
            <Button onClick={abrirModalCreacion} variant="intense-blue">
            + Ingresar Material
            </Button>
        </div>

        <div className="bg-white rounded-[var(--radius-suave)] shadow-sm border border-[var(--color-yacar-surface)] overflow-hidden">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-[var(--color-yacar-surface)]/50 border-b border-[var(--color-yacar-surface)]">
                <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Material</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Medida</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Stock Disponible</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm">Costo Un. (USD)</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm text-center">Estado</th>
                <th className="px-6 py-4 font-semibold text-[var(--color-yacar-texto)] text-sm text-right">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8">Cargando inventario...</td></tr>
                ) : materiales.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8">El almacén está vacío.</td></tr>
                ) : (
                materiales.map((mat) => (
                    <tr key={mat.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${!mat.activo ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                        <p className="font-bold text-gray-800">{mat.nombre}</p>
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-[10px] bg-[var(--color-yacar-azul)]/10 text-[var(--color-yacar-azul-vivo)] px-2 py-0.5 rounded-full uppercase border border-[var(--color-yacar-azul)]/20 font-bold">
                        {mat.unidad_medida}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${mat.stock_actual <= 10 && mat.activo ? 'text-[var(--color-yacar-rosa)]' : 'text-gray-700'}`}>
                        {Number(mat.stock_actual).toFixed(2)}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">
                        ${Number(mat.costo_base_usd).toFixed(2)}
                    </td>
                    
                    {/* ESTADO */}
                    <td className="px-6 py-4 text-center">
                        {mat.activo ? (
                        <span className="text-xs bg-[var(--color-yacar-verde)]/10 text-[var(--color-yacar-verde)] px-2 py-1 rounded-full font-bold border border-[var(--color-yacar-verde)]/20">ACTIVO</span>
                        ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-bold border border-gray-200">INACTIVO</span>
                        )}
                    </td>

                    {/* BOTONERA */}
                    <td className="px-6 py-4">
                        <div className="flex justify-end gap-2 items-center">
                        {mat.activo && (
                            <>
                            <button onClick={() => abrirModalCompra(mat)} className="p-2 text-gray-400 hover:text-[var(--color-yacar-verde)] hover:bg-[var(--color-yacar-verde)]/10 rounded-full transition-colors" title="Registrar Compra (Inflar Stock)">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            </button>

                            <button onClick={() => abrirModalEdicion(mat)} className="p-2 text-gray-400 hover:text-[var(--color-yacar-azul-vivo)] hover:bg-[var(--color-yacar-azul)]/10 rounded-full transition-colors" title="Editar Nombre/Medida">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            </button>
                            
                            <button onClick={() => handleEliminar(mat.id, mat.nombre)} className="p-2 text-gray-400 hover:text-[var(--color-yacar-rosa)] hover:bg-[var(--color-yacar-rosa)]/10 rounded-full transition-colors" title="Eliminar Material">
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