import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';

type ProductoAdminType = {
    id: string;
    nombre_comercial: string;
    talla: string;
    precio_base_usd: number;
    precio_base_bs?: number;
    descuento_mayorista: number;
    stock_actual: number;
    imagen_url?: string;
    activo: boolean;
    diseno?: { id: string; nombre_patron?: string; }; // 💡 Alineado
};

    export const Productos = () => {
    const [productos, setProductos] = useState<ProductoAdminType[]>([]);
    const [disenos, setDisenos] = useState<any[]>([]); 
    const [materiales, setMateriales] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [productoAEditar, setProductoAEditar] = useState<ProductoAdminType | null>(null);
    
    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'success' });

    const [formData, setFormData] = useState({
        nombre_comercial: '', talla: 'RN', precio_base_usd: '', descuento_mayorista: '', diseno_id: ''
    });
    const [imagenFile, setImagenFile] = useState<File | null>(null);
    const [imagenPreviaUrl, setImagenPreviaUrl] = useState<string>('');

    // Estado para Receta y Precios
    const [receta, setReceta] = useState<{ material_id: string, cantidad: number, nombre: string, costo: number }[]>([]);
    const [materialSeleccionado, setMaterialSeleccionado] = useState('');
    const [cantidadMaterial, setCantidadMaterial] = useState('');
    const [margenGanancia, setMargenGanancia] = useState(30);

    const costoTotalMateriales = receta.reduce((acc, r) => acc + (r.cantidad * r.costo), 0);
    const precioSugerido = costoTotalMateriales * (1 + (margenGanancia / 100));

    const mostrarNotificacion = (mensaje: string, tipo: 'success' | 'error' = 'success') => {
        setNotificacion({ visible: true, mensaje, tipo });
        setTimeout(() => setNotificacion({ visible: false, mensaje: '', tipo: 'success' }), 3500);
    };

    const cargarDatosMaestros = async () => {
        try {
        setIsLoading(true);
        const [prodRes, disenosRes, matRes] = await Promise.all([ 
            api.get('/productos'), 
            api.get('/disenos'),
            api.get('/materiales')
        ]);
        setProductos(prodRes.data);
        setDisenos(disenosRes.data.filter((d: any) => d.activo));
        setMateriales(matRes.data.filter((m: any) => m.activo));
        } catch (error) {
        mostrarNotificacion("Error al cargar datos del servidor.", 'error');
        } finally {
        setIsLoading(false);
        }
    };

    useEffect(() => { cargarDatosMaestros(); }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const abrirModalCreacion = () => {
        setProductoAEditar(null);
        setFormData({ nombre_comercial: '', talla: 'RN', precio_base_usd: '', descuento_mayorista: '0', diseno_id: '' });
        setImagenFile(null);
        setImagenPreviaUrl('');
        setReceta([]);
        setMargenGanancia(30);
        setIsModalOpen(true);
    };

    const abrirModalEdicion = async (prod: ProductoAdminType) => {
        setProductoAEditar(prod);
        setFormData({
        nombre_comercial: prod.nombre_comercial,
        talla: prod.talla,
        precio_base_usd: prod.precio_base_usd.toString(),
        descuento_mayorista: prod.descuento_mayorista.toString(),
        diseno_id: prod.diseno?.id || '' 
        });
        setImagenFile(null);
        setImagenPreviaUrl(prod.imagen_url || '');
        setMargenGanancia(30);
        
        try {
            const res = await api.get(`/receta-material/producto/${prod.id}`);
            const recetaCargada = res.data.map((r: any) => ({
                material_id: r.material.id,
                cantidad: Number(r.cantidad_requerida),
                nombre: r.material.nombre,
                costo: Number(r.material.costo_base_usd),
                unidad: r.material.unidad_medida || ''
            }));
            setReceta(recetaCargada);
        } catch (error) {
            console.error("No se pudo cargar la receta", error);
            setReceta([]);
        }

        setIsModalOpen(true);
    };

    const handleAgregarMaterial = () => {
        if (!materialSeleccionado || !cantidadMaterial || Number(cantidadMaterial) <= 0) return;
        const mat = materiales.find(m => m.id === materialSeleccionado);
        if (!mat) return;

        const existe = receta.find(r => r.material_id === materialSeleccionado);
        if (existe) {
            setReceta(receta.map(r => r.material_id === materialSeleccionado ? { ...r, cantidad: r.cantidad + Number(cantidadMaterial) } : r));
        } else {
            setReceta([...receta, { material_id: mat.id, nombre: mat.nombre, costo: Number(mat.costo_base_usd), cantidad: Number(cantidadMaterial), unidad: mat.unidad_medida }]);
        }
        setMaterialSeleccionado('');
        setCantidadMaterial('');
    };

    const handleRemoverMaterial = (id: string) => {
        setReceta(receta.filter(r => r.material_id !== id));
    };

    const aplicarSugerencia = () => {
        setFormData(prev => ({ ...prev, precio_base_usd: precioSugerido.toFixed(2) }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImagenFile(file);
            setImagenPreviaUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // 💡 PAYLOAD ESTRICTO CON FORMDATA
        const payload = new FormData();
        payload.append('nombre_comercial', formData.nombre_comercial);
        payload.append('talla', formData.talla);
        payload.append('precio_base_usd', formData.precio_base_usd.toString());
        payload.append('descuento_mayorista', formData.descuento_mayorista.toString());
        
        if (formData.diseno_id) payload.append('diseno_id', formData.diseno_id);
        if (imagenFile) payload.append('imagen', imagenFile);

        const recetaFormateada = receta.map(r => ({ material_id: r.material_id, cantidad_requerida: r.cantidad }));
        payload.append('receta_json', JSON.stringify(recetaFormateada));

        try {
        if (productoAEditar) {
            await api.patch(`/productos/${productoAEditar.id}`, payload);
            mostrarNotificacion("Producto comercial actualizado.");
        } else {
            await api.post('/productos', payload);
            mostrarNotificacion("Producto agregado al catálogo.");
        }
        setIsModalOpen(false);
        cargarDatosMaestros();
        } catch (error: any) {
        const msjBackend = error.response?.data?.message;
        mostrarNotificacion(Array.isArray(msjBackend) ? msjBackend[0] : (msjBackend || "Error de validación."), 'error');
        } finally {
        setIsSubmitting(false);
        }
    };

    const handleEliminar = async (id: string, nombre: string) => {
        if (!window.confirm(`¿Seguro de inhabilitar "${nombre}"?`)) return;
        try {
        await api.delete(`/productos/${id}`);
        mostrarNotificacion("Ajuar ocultado de la tienda.");
        cargarDatosMaestros();
        } catch (e) { mostrarNotificacion("Error al eliminar", 'error'); }
    };

    const handleReactivar = async (id: string, nombre: string) => {
        if (!window.confirm(`¿Volver a publicar "${nombre}"?`)) return;
        try {
        await api.patch(`/productos/${id}`, { activo: true });
        mostrarNotificacion("Producto nuevamente visible.");
        cargarDatosMaestros();
        } catch (e) { mostrarNotificacion("Error al reactivar", 'error'); }
    };

    return (
        <div className="animate-fade-in relative max-w-7xl mx-auto">
        {notificacion.visible && (
            <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-[var(--radius-suave)] shadow-lg text-white flex items-center gap-3 ${notificacion.tipo === 'success' ? 'bg-[var(--color-yacar-verde)]' : 'bg-[var(--color-yacar-rosa)]'}`}>
            <p className="font-bold">{notificacion.mensaje}</p>
            </div>
        )}

        {isModalOpen && (
            <div className="fixed inset-0 bg-[var(--color-yacar-texto)]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[var(--radius-suave)] w-full max-w-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-[var(--color-yacar-surface)] flex justify-between items-center bg-[var(--color-yacar-crema)]/30">
                <h2 className="text-xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">
                    {productoAEditar ? 'Editar Ajuar Comercial' : 'Crear Nuevo Ajuar'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[var(--color-yacar-rosa)] transition-colors">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-bold text-[var(--color-yacar-azul)] mb-4">Datos Comerciales y Vínculos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Comercial</label>
                        <input type="text" name="nombre_comercial" value={formData.nombre_comercial} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded outline-none text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Talla</label>
                        <select name="talla" value={formData.talla} onChange={handleInputChange} className="w-full px-3 py-2 border rounded outline-none bg-white text-sm">
                        <option value="RN">Recién Nacido (RN)</option>
                        <option value="0-3M">0 a 3 Meses</option>
                        <option value="3-6M">3 a 6 Meses</option>
                        <option value="6-9M">6 a 9 Meses</option>
                        <option value="9-12M">9 a 12 Meses</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-[var(--color-yacar-azul)] mb-1">Vincular a Diseño (Colección)</label>
                        {/* 💡 LECTURA CORRECTA DE d.nombre_patron */}
                        <select name="diseno_id" value={formData.diseno_id} onChange={handleInputChange} required className="w-full px-3 py-2 border border-[var(--color-yacar-azul)]/50 rounded outline-none bg-white text-sm">
                        <option value="">-- Selecciona el patrón base --</option>
                        {disenos.map(d => (
                            <option key={d.id} value={d.id}>{d.nombre_patron} ({d.color_primario})</option>
                        ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Imagen del Producto</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full px-3 py-2 border rounded outline-none text-sm bg-white" />
                        {imagenPreviaUrl && (
                            <div className="mt-2 flex items-center gap-4">
                                <img src={imagenPreviaUrl} alt="Vista previa" className="h-16 w-16 object-cover rounded-md border" />
                                <span className="text-xs text-gray-500">Vista previa de la imagen seleccionada</span>
                            </div>
                        )}
                    </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-bold text-[var(--color-yacar-rosa)] mb-4">Receta de Materiales (Fórmula)</h3>
                    <div className="flex gap-2 items-end mb-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-700 mb-1">Material</label>
                            <select value={materialSeleccionado} onChange={e => setMaterialSeleccionado(e.target.value)} className="w-full px-3 py-2 border rounded outline-none text-sm bg-white">
                                <option value="">- Seleccione material -</option>
                                {materiales.map(m => <option key={m.id} value={m.id}>{m.nombre} (Costo: ${Number(m.costo_base_usd).toFixed(2)} / {m.unidad_medida})</option>)}
                            </select>
                        </div>
                        <div className="w-24">
                            <label className="block text-xs font-bold text-gray-700 mb-1">Cantidad</label>
                            <input type="number" step="0.01" value={cantidadMaterial} onChange={e => setCantidadMaterial(e.target.value)} className="w-full px-3 py-2 border rounded outline-none text-sm" placeholder="Ej: 0.5" />
                        </div>
                        <button type="button" onClick={handleAgregarMaterial} className="bg-[var(--color-yacar-rosa)] hover:bg-[var(--color-yacar-rosa-oscuro)] text-white font-bold py-2 px-4 rounded text-sm transition-colors">
                            Añadir
                        </button>
                    </div>
                    {receta.length > 0 ? (
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white text-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        <th className="px-3 py-2 font-bold">Material</th>
                                        <th className="px-3 py-2 font-bold text-center">Cant.</th>
                                        <th className="px-3 py-2 font-bold text-right">Subtotal</th>
                                        <th className="px-3 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {receta.map(r => (
                                        <tr key={r.material_id} className="border-b last:border-b-0">
                                            <td className="px-3 py-2">{r.nombre}</td>
                                            <td className="px-3 py-2 text-center">{r.cantidad} {(r as any).unidad}</td>
                                            <td className="px-3 py-2 text-right font-mono">${(r.cantidad * r.costo).toFixed(2)}</td>
                                            <td className="px-3 py-2 text-right">
                                                <button type="button" onClick={() => handleRemoverMaterial(r.material_id)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-xs text-center text-gray-500">Agrega materiales para construir el producto.</p>
                    )}
                </div>

                <div className="bg-[var(--color-yacar-verde)]/10 p-4 rounded-lg border border-[var(--color-yacar-verde)]/30">
                    <h3 className="text-sm font-bold text-[var(--color-yacar-verde)] mb-4">Finanzas Inteligentes</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4 items-center">
                        <div className="bg-white p-3 rounded shadow-sm text-center">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Costo Materiales</p>
                            <p className="text-lg font-mono font-bold text-gray-800">${costoTotalMateriales.toFixed(2)}</p>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 text-center">Margen de Ganancia (%)</label>
                            <div className="flex items-center justify-center gap-2">
                                <button type="button" onClick={() => setMargenGanancia(m => Math.max(0, m - 5))} className="bg-white border w-8 h-8 rounded flex items-center justify-center font-bold text-gray-600">-</button>
                                <span className="font-bold text-lg text-[var(--color-yacar-verde)] w-12 text-center">{margenGanancia}%</span>
                                <button type="button" onClick={() => setMargenGanancia(m => m + 5)} className="bg-white border w-8 h-8 rounded flex items-center justify-center font-bold text-gray-600">+</button>
                            </div>
                        </div>

                        <div className="bg-white p-3 rounded shadow-sm text-center border-l-4 border-[var(--color-yacar-verde)]">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Sugerencia (PVP)</p>
                            <p className="text-xl font-mono font-bold text-[var(--color-yacar-verde)]">${precioSugerido.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Precio Retail Final (USD)</label>
                        <div className="flex gap-2">
                            <input type="number" step="0.01" name="precio_base_usd" value={formData.precio_base_usd} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded outline-none text-sm font-mono font-bold text-blue-700" />
                            <button type="button" onClick={aplicarSugerencia} className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold px-3 py-1 rounded transition-colors whitespace-nowrap">
                                ← Aplicar Sugerencia
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Desc. Mayorista (USD)</label>
                        <input type="number" step="0.01" name="descuento_mayorista" value={formData.descuento_mayorista} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded outline-none text-sm" />
                    </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">Cancelar</Button>
                    <Button type="submit" variant="intense-blue" className="flex-1" isLoading={isSubmitting}>Guardar Producto</Button>
                </div>
                </form>
            </div>
            </div>
        )}

        <div className="flex justify-between items-center mb-8">
            <div>
            <h1 className="text-3xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">Gestión de Catálogo</h1>
            <p className="text-gray-500 text-sm mt-1">Administra los productos visibles en la tienda e-commerce.</p>
            </div>
            <Button onClick={abrirModalCreacion} variant="intense-blue">+ Nuevo Producto</Button>
        </div>

        <div className="bg-white rounded-[var(--radius-suave)] shadow-sm border border-[var(--color-yacar-surface)] overflow-hidden">
            <table className="w-full text-left border-collapse">
            <thead className="bg-[var(--color-yacar-surface)]/50 border-b border-[var(--color-yacar-surface)]">
                <tr>
                <th className="px-6 py-4 font-semibold text-sm">Imagen</th>
                <th className="px-6 py-4 font-semibold text-sm">Producto</th>
                <th className="px-6 py-4 font-semibold text-sm">Precios (USD/Bs)</th>
                <th className="px-6 py-4 font-semibold text-sm text-center">Stock</th>
                <th className="px-6 py-4 font-semibold text-sm text-center">Estado</th>
                <th className="px-6 py-4 font-semibold text-sm text-right">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? <tr><td colSpan={6} className="text-center py-8">Cargando...</td></tr> : 
                productos.length === 0 ? <tr><td colSpan={6} className="text-center py-8">No hay productos.</td></tr> : 
                productos.map(prod => (
                <tr key={prod.id} className={`border-b hover:bg-gray-50 transition-colors ${!prod.activo ? 'opacity-50 grayscale' : ''}`}>
                    <td className="px-6 py-4">
                    <div className="w-10 h-10 rounded-md bg-gray-100 border overflow-hidden flex items-center justify-center">
                        {prod.imagen_url ? <img src={prod.imagen_url} alt="Prod" className="w-full h-full object-cover" /> : <span className="text-xs">👕</span>}
                    </div>
                    </td>
                    <td className="px-6 py-4">
                    <p className="font-bold text-gray-800 text-sm">{prod.nombre_comercial}</p>
                    <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full font-bold">Talla {prod.talla}</span>
                    </td>
                    <td className="px-6 py-4">
                    <span className="text-sm font-bold block">${Number(prod.precio_base_usd).toFixed(2)} USD</span>
                    {prod.precio_base_bs && <span className="text-xs text-gray-500">Bs. {Number(prod.precio_base_bs).toFixed(2)}</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${prod.stock_actual > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{prod.stock_actual}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                    {prod.activo ? (
                        <div className="flex justify-center" title="Activo"><svg className="w-6 h-6 text-[var(--color-yacar-verde)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                    ) : (
                        <div className="flex justify-center" title="Inactivo"><svg className="w-6 h-6 text-[var(--color-yacar-rosa)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                    )}
                    </td>
                    <td className="px-6 py-4">
                    <div className="flex justify-end gap-2 items-center">
                        <button onClick={() => abrirModalEdicion(prod)} className="p-2 text-gray-400 hover:text-[var(--color-yacar-azul-vivo)] hover:bg-[var(--color-yacar-azul)]/10 rounded-full transition-colors" title="Editar">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        {prod.activo ? (
                        <button onClick={() => handleEliminar(prod.id, prod.nombre_comercial)} className="p-2 text-gray-400 hover:text-[var(--color-yacar-rosa)] hover:bg-[var(--color-yacar-rosa)]/10 rounded-full transition-colors" title="Ocultar">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                        ) : (
                        <button onClick={() => handleReactivar(prod.id, prod.nombre_comercial)} className="p-2 text-gray-400 hover:text-[var(--color-yacar-verde)] hover:bg-[var(--color-yacar-verde)]/10 rounded-full transition-colors" title="Reactivar">
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