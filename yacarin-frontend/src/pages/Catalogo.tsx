import { useState, useEffect } from 'react';
import { ProductCard, type ProductoType } from '../components/ProductCard';
import { api } from '../services/api';
import { useStore } from '../store/useStore'; 

export const Catalogo = () => {
    const [productos, setProductos] = useState<ProductoType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    //Extraemos los datos y funciones directamente de Zustand
    const { esMayorista, setEsMayorista, tipoCambioBs, setTipoCambioBs } = useStore();

    useEffect(() => {
        const fetchData = async () => {
        try {
            const [productosRes, tipoCambioRes] = await Promise.all([
            api.get('/productos'),
            api.get('/tipo-cambio')
            ]);
            
            setProductos(productosRes.data);
            
            // Guardamos el tipo de cambio en el ESTADO GLOBAL
            const dolar = tipoCambioRes.data.find((t: any) => t.moneda === 'USD');
            if (dolar) {
            setTipoCambioBs(dolar.valor_bs);
            }
            
        } catch (error) {
            console.error("Error cargando el catálogo:", error);
        } finally {
            setIsLoading(false);
        }
        };

        fetchData();
    }, [setTipoCambioBs]); // Se añade la función a las dependencias por buenas prácticas

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* BANNER DE TIPO DE CAMBIO (Leyendo desde Zustand) */}
        <div className="w-full bg-[var(--color-yacar-surface)] border border-[var(--color-yacar-azul)]/20 rounded-md p-2 mb-6 flex justify-center items-center gap-2 text-sm text-[var(--color-yacar-texto)] shadow-sm">
            <svg className="w-5 h-5 text-[var(--color-yacar-azul-vivo)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="font-medium">Tipo de Cambio Oficial (SERECI / BCB):</span> 
            <span className="font-bold text-[var(--color-yacar-azul-vivo)]">1 USD = Bs. {tipoCambioBs}</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-[var(--color-yacar-surface)]">
            <div>
            <h1 className="text-3xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">
                Catálogo de Colección
            </h1>
            <p className="text-gray-500 font-[var(--font-cuerpo)] text-sm mt-1">
                Encuentra el ajuar perfecto para los más pequeños.
            </p>
            </div>

        </div>

        {isLoading ? (
            <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-[var(--color-yacar-surface)] border-t-[var(--color-yacar-azul-vivo)] rounded-full animate-spin"></div>
            </div>
        ) : productos.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
            <p className="text-xl mb-2">🍼</p>
            <p>No hay productos disponibles en este momento.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map((producto) => (
                <ProductCard 
                key={producto.id} 
                producto={producto} 
                esMayorista={esMayorista} // Este dato ahora viene del cerebro central
                />
            ))}
            </div>
        )}
        </div>
    );
};