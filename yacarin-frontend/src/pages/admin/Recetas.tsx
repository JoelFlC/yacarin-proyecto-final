import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';

export const RecetasBOM = () => {
    const [productos, setProductos] = useState<any[]>([]);
    const [materiales, setMateriales] = useState<any[]>([]);
    
    const [productoSeleccionado, setProductoSeleccionado] = useState('');
    const [recetaActual, setRecetaActual] = useState<any[]>([]);
    const [isLoadingReceta, setIsLoadingReceta] = useState(false);

    // Formulario para agregar insumo
    const [formMaterialId, setFormMaterialId] = useState('');
    const [formCantidad, setFormCantidad] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: 'success' });

    const mostrarNotificacion = (mensaje: string, tipo: 'success' | 'error' = 'success') => {
        setNotificacion({ visible: true, mensaje, tipo });
        setTimeout(() => setNotificacion({ visible: false, mensaje: '', tipo: 'success' }), 3500);
    };

    useEffect(() => {
        const fetchMaestros = async () => {
        try {
            const [prodRes, matRes] = await Promise.all([ api.get('/productos'), api.get('/materiales') ]);
            setProductos(prodRes.data.filter((p: any) => p.activo));
            setMateriales(matRes.data.filter((m: any) => m.activo));
        } catch (error) {
            mostrarNotificacion("Error cargando catálogos.", 'error');
        }
        };
        fetchMaestros();
    }, []);

    const cargarReceta = async (producto_id: string) => {
        if (!producto_id) {
        setRecetaActual([]);
        return;
        }
        try {
        setIsLoadingReceta(true);
        const res = await api.get(`/receta-material/producto/${producto_id}`);
        setRecetaActual(res.data);
        } catch (error) {
        mostrarNotificacion("No se pudo cargar la receta.", 'error');
        } finally {
        setIsLoadingReceta(false);
        }
    };

    const handleProductoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setProductoSeleccionado(val);
        cargarReceta(val);
    };

    const handleAgregarInsumo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productoSeleccionado || !formMaterialId || !formCantidad) return;
        
        setIsSubmitting(true);
        try {
        await api.post('/receta-material', {
            producto_id: productoSeleccionado,
            material_id: formMaterialId,
            cantidad_requerida: Number(formCantidad)
        });
        mostrarNotificacion("Insumo agregado a la receta.");
        setFormMaterialId('');
        setFormCantidad('');
        cargarReceta(productoSeleccionado);
        } catch (error: any) {
        mostrarNotificacion(error.response?.data?.message || "Error al agregar.", 'error');
        } finally {
        setIsSubmitting(false);
        }
    };

    const handleEliminarInsumo = async (idReceta: string) => {
        try {
        await api.delete(`/receta-material/${idReceta}`);
        cargarReceta(productoSeleccionado);
        } catch (error) {
        mostrarNotificacion("Error al quitar el insumo.", 'error');
        }
    };

    return (
        <div className="animate-fade-in max-w-6xl mx-auto">
        {notificacion.visible && (
            <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-[var(--radius-suave)] shadow-lg text-white ${notificacion.tipo === 'success' ? 'bg-[var(--color-yacar-verde)]' : 'bg-[var(--color-yacar-rosa)]'}`}>
            <p className="font-bold">{notificacion.mensaje}</p>
            </div>
        )}

        <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">Lista de Materiales (BOM)</h1>
            <p className="text-gray-500 mt-1">Configura las fórmulas de insumos para la fabricación.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* PANEL IZQUIERDO: SELECCIÓN Y FORMULARIO */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl border shadow-sm h-fit">
            <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Paso 1: Selecciona el Producto</label>
                <select value={productoSeleccionado} onChange={handleProductoChange} className="w-full px-3 py-2 border rounded bg-gray-50 outline-none focus:border-[var(--color-yacar-azul)]">
                <option value="">-- Elige un ajuar --</option>
                {productos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre_comercial} (Talla {p.talla})</option>
                ))}
                </select>
            </div>

            <div className={`pt-6 border-t transition-opacity ${productoSeleccionado ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <label className="block text-sm font-bold text-[var(--color-yacar-azul)] mb-4">Paso 2: Añadir Ingrediente</label>
                <form onSubmit={handleAgregarInsumo} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Materia Prima</label>
                    <select value={formMaterialId} onChange={e => setFormMaterialId(e.target.value)} required className="w-full px-3 py-2 border rounded outline-none bg-white">
                    <option value="">-- Elegir de bodega --</option>
                    {materiales.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre} ({m.unidad_medida})</option>
                    ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Cantidad Exacta Necesaria</label>
                    <input type="number" step="0.01" min="0.01" value={formCantidad} onChange={e => setFormCantidad(e.target.value)} required placeholder="Ej: 1.5" className="w-full px-3 py-2 border rounded outline-none" />
                </div>
                <Button type="submit" variant="intense-blue" className="w-full py-2 text-sm" isLoading={isSubmitting}>Añadir a la Receta</Button>
                </form>
            </div>
            </div>

            {/* PANEL DERECHO: VISOR DE LA RECETA */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border shadow-sm min-h-[400px]">
            <h2 className="text-lg font-bold text-[var(--color-yacar-texto)] mb-4">Fórmula del Producto</h2>
            
            {!productoSeleccionado ? (
                <div className="h-64 flex items-center justify-center text-gray-400">Selecciona un producto para ver su receta.</div>
            ) : isLoadingReceta ? (
                <div className="h-64 flex items-center justify-center">Cargando...</div>
            ) : recetaActual.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-[var(--color-yacar-rosa)] font-medium">Este producto aún no tiene materiales asignados.</div>
            ) : (
                <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                    <tr>
                    <th className="px-4 py-3 font-semibold text-sm">Insumo</th>
                    <th className="px-4 py-3 font-semibold text-sm text-center">Cant. Requerida</th>
                    <th className="px-4 py-3 font-semibold text-sm text-right">Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {recetaActual.map(item => (
                    <tr key={item.id} className="border-b">
                        <td className="px-4 py-3 font-bold text-gray-700">{item.material?.nombre}</td>
                        <td className="px-4 py-3 text-center">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono font-bold text-sm">
                            {Number(item.cantidad_requerida).toFixed(2)} {item.material?.unidad_medida}
                        </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                        <button onClick={() => handleEliminarInsumo(item.id)} className="text-red-500 font-bold hover:underline text-sm">Quitar</button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            )}
            </div>
        </div>
        </div>
    );
};