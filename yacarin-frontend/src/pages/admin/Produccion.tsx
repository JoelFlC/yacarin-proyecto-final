import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { type ProductoType } from '../../components/ProductCard';


type RecetaItem = {
    id: string;
    cantidad_requerida: number;
    material: {
        id: string;
        nombre: string;
        unidad_medida: string;
        costo_base_usd: string | number; 
    };
};

    export const Produccion = () => {
    // Estados para las listas desplegables
    const [productos, setProductos] = useState<ProductoType[]>([]);
    const [materiales, setMateriales] = useState<any[]>([]);
    
    // Estados para la selección actual
    const [productoSeleccionado, setProductoSeleccionado] = useState('');
    const [recetaActual, setRecetaActual] = useState<RecetaItem[]>([]);
    
    // Estados para el formulario de agregar material
    const [materialSeleccionado, setMaterialSeleccionado] = useState('');
    const [cantidad, setCantidad] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);

    // 1. Cargar Productos y Materiales al iniciar
    useEffect(() => {
        const cargarListas = async () => {
        try {
            const [resProductos, resMateriales] = await Promise.all([
            api.get('/productos'),
            api.get('/materiales')
            ]);
            setProductos(resProductos.data);
            setMateriales(resMateriales.data);
        } catch (error) {
            console.error("Error cargando catálogos base:", error);
        }
        };
        cargarListas();
    }, []);

    // 2. Cargar la receta cada vez que se selecciona un producto distinto
    useEffect(() => {
        if (!productoSeleccionado) {
        setRecetaActual([]);
        return;
        }

        const cargarReceta = async () => {
        setIsLoading(true);
        try {
            // Usamos la ruta privada exacta que pidió el backend
            const response = await api.get(`/receta-material/producto/${productoSeleccionado}`);
            setRecetaActual(response.data);
        } catch (error) {
            console.error("Error cargando la receta:", error);
            setRecetaActual([]);
        } finally {
            setIsLoading(false);
        }
        };

        cargarReceta();
    }, [productoSeleccionado]);

    // 3. Manejador para agregar un material a la receta (POST)
    const handleAgregarMaterial = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productoSeleccionado || !materialSeleccionado || !cantidad) return;

        try {
        // Aquí haríamos el POST al backend (Ajustar según la ruta exacta de tu API)
        /*
        await api.post('/receta-material', {
            producto_id: productoSeleccionado,
            material_id: materialSeleccionado,
            cantidad_requerida: Number(cantidad)
        });
        // Recargar la receta...
        */
        
        alert("Simulación: Material agregado a la receta exitosamente.");
        setMaterialSeleccionado('');
        setCantidad('');
        } catch (error) {
        console.error("Error al agregar material:", error);
        }
    };

    return (
        <div className="animate-fade-in">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">
            Fórmulas de Producción (BOM)
            </h1>
            <p className="text-gray-500 font-[var(--font-cuerpo)] text-sm mt-1">
            Diseña las recetas de fabricación asociando materiales a cada ajuar.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* PANEL IZQUIERDO: Controles y Formulario */}
            <div className="lg:col-span-1 space-y-6">
            
            {/* Selector de Producto Principal */}
            <div className="bg-white p-6 rounded-[var(--radius-suave)] shadow-sm border border-[var(--color-yacar-surface)]">
                <label className="block text-sm font-medium text-[var(--color-yacar-texto)] mb-2">
                1. Selecciona un Producto
                </label>
                <select 
                value={productoSeleccionado}
                onChange={(e) => setProductoSeleccionado(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[var(--color-yacar-surface)]/50 border border-transparent focus:bg-white focus:border-[var(--color-yacar-azul)] outline-none transition-all text-sm"
                >
                <option value="">-- Elige un Ajuar --</option>
                {productos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre_comercial} (Talla {p.talla})</option>
                ))}
                </select>
            </div>

            {/* Formulario para agregar material (Solo visible si hay un producto seleccionado) */}
            <div className={`bg-white p-6 rounded-[var(--radius-suave)] shadow-sm border border-[var(--color-yacar-surface)] transition-opacity duration-300 ${productoSeleccionado ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <h3 className="font-bold text-[var(--color-yacar-texto)] mb-4">2. Agregar Material a la Receta</h3>
                <form onSubmit={handleAgregarMaterial} className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Materia Prima</label>
                    <select 
                    value={materialSeleccionado}
                    onChange={(e) => setMaterialSeleccionado(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-[var(--color-yacar-azul)] outline-none text-sm"
                    required
                    >
                    <option value="">-- Seleccionar --</option>
                    {materiales.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre} ({m.unidad_medida})</option>
                    ))}
                    </select>
                </div>
                
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad Requerida</label>
                    <input 
                    type="number" 
                    step="0.01"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="Ej: 1.5"
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-[var(--color-yacar-azul)] outline-none text-sm"
                    required
                    />
                </div>

                <Button type="submit" className="w-full py-2 text-sm" variant="intense-blue">
                    Vincular Material
                </Button>
                </form>
            </div>
            </div>

            {/* PANEL DERECHO: Tabla de la Receta */}
            <div className="lg:col-span-2">
            <div className="bg-white rounded-[var(--radius-suave)] shadow-sm border border-[var(--color-yacar-surface)] overflow-hidden h-full">
                <div className="p-6 border-b border-[var(--color-yacar-surface)] bg-[var(--color-yacar-crema)]/30 flex justify-between items-center">
                <h3 className="font-bold text-[var(--color-yacar-texto)]">
                    Receta de Fabricación Actual
                </h3>
                {isLoading && <div className="w-5 h-5 border-2 border-[var(--color-yacar-azul)] border-t-transparent rounded-full animate-spin"></div>}
                </div>
                
                <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Material</th>
                        <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Cantidad</th>
                        <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Costo Unitario</th>
                    </tr>
                    </thead>
                    <tbody>
                    {!productoSeleccionado ? (
                        <tr>
                        <td colSpan={3} className="text-center py-16 text-gray-400">
                            Selecciona un producto a la izquierda para ver su receta.
                        </td>
                        </tr>
                    ) : recetaActual.length === 0 && !isLoading ? (
                        <tr>
                        <td colSpan={3} className="text-center py-16 text-gray-400">
                            Este producto aún no tiene materiales asignados.
                        </td>
                        </tr>
                    ) : (
                        recetaActual.map((item) => (
                        <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="px-6 py-4 font-medium text-[var(--color-yacar-texto)] text-sm">{item.material.nombre}</td>
                            <td className="px-6 py-4 text-sm text-[var(--color-yacar-azul-vivo)] font-bold">
                            {Number(item.cantidad_requerida)} <span className="text-gray-400 text-xs font-normal">{item.material.unidad_medida}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-sm">${Number(item.material.costo_base_usd).toFixed(2)} USD</td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>
                </div>
            </div>
            </div>

        </div>
        </div>
    );
};