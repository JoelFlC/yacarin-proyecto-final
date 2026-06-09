import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/Button';
import { useStore } from '../store/useStore';
import { type ProductoType } from '../components/ProductCard';

export const DetalleProducto = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [producto, setProducto] = useState<ProductoType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [cantidad, setCantidad] = useState(1);
    const [agregadoExito, setAgregadoExito] = useState(false); // Estado para notificacion
    
    const { esMayorista, tipoCambioBs, agregarAlCarrito } = useStore();

    useEffect(() => {
        const fetchDetalle = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/productos/${id}`);
            setProducto(response.data);
        } catch (error) {
            console.error("Error cargando detalle:", error);
        } finally {
            setIsLoading(false);
        }
        };

        if (id) fetchDetalle();
    }, [id]);

    if (isLoading) {
        return (
        <div className="min-h-[60vh] flex justify-center items-center">
            <div className="w-12 h-12 border-4 border-[var(--color-yacar-surface)] border-t-[var(--color-yacar-azul-vivo)] rounded-full animate-spin"></div>
        </div>
        );
    }

    if (!producto) {
        return (
        <div className="text-center py-20 animate-fade-in">
            <p className="text-2xl mb-4">😿</p>
            <h2 className="text-xl font-bold text-gray-600">Ajuar no encontrado</h2>
            <Link to="/catalogo" className="text-[var(--color-yacar-azul-vivo)] hover:underline mt-4 inline-block font-medium">Volver al catálogo</Link>
        </div>
        );
    }

    // =======================================================
    // REGLAS DE NEGOCIO Y CALCULOS Bimonetarios
    // =======================================================

    const baseUsd = Number(producto.precio_base_usd) || 0;
    const baseBs = Number(producto.precio_base_bs) || (baseUsd * tipoCambioBs) || 0;

    const descuentoFijoUsdPorUnidad = Number(producto.descuento_mayorista) || 0;
    const aplicaDescuento = esMayorista && descuentoFijoUsdPorUnidad > 0;

    const porcentajeDescuento = aplicaDescuento 
        ? Math.round((descuentoFijoUsdPorUnidad / baseUsd) * 100) 
        : 0;

    const precioUnitarioUsd = aplicaDescuento ? baseUsd - descuentoFijoUsdPorUnidad : baseUsd;
    const descuentoEnBs = descuentoFijoUsdPorUnidad * tipoCambioBs;
    const precioUnitarioBs = aplicaDescuento ? baseBs - descuentoEnBs : baseBs;

    const unitLabel = esMayorista ? 'Docenas' : 'Unidades';
    const multiplicadorVisual = esMayorista ? 12 : 1; 
    const subtotalBs = precioUnitarioBs * cantidad * multiplicadorVisual;

    const sinStock = producto.stock_actual <= 0;

    const handleAgregarAlCarrito = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!producto) return;
        
        const nuevoItem = {
            producto_id: producto.id,
            nombre: producto.nombre_comercial,
            talla: producto.talla,
            precio_unitario: esMayorista ? precioUnitarioUsd : precioUnitarioBs,
            cantidad: esMayorista ? cantidad * 12 : cantidad, 
            imagen_url: producto.imagen_url,
            stock_maximo: producto.stock_actual
        };

        agregarAlCarrito(nuevoItem);
        
        // Notificación visual
        setAgregadoExito(true);
        setTimeout(() => setAgregadoExito(false), 2000);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-[var(--color-yacar-azul-vivo)] transition-colors mb-8 font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Regresar al catálogo
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="relative px-4 mb-8 lg:mb-0">
                <div className="absolute top-6 left-10 w-full h-full bg-[var(--color-yacar-azul)]/10 rounded-[40px] -z-10"></div>
                <div className="bg-white p-4 rounded-[40px] shadow-[0_20px_50px_rgba(95,168,211,0.15)] border-4 border-white overflow-hidden aspect-square flex items-center justify-center relative">
                    {producto.imagen_url ? (
                    <img src={producto.imagen_url} alt={producto.nombre_comercial} className="w-full h-full object-cover rounded-[30px]" />
                    ) : (
                    <span className="text-9xl">👕</span>
                    )}
                    {sinStock && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="bg-[var(--color-yacar-rosa)] text-white px-6 py-2 rounded-full text-xl font-bold shadow-lg">Agotado</span>
                    </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col">
                <div className="mb-6 pb-4 border-b border-[var(--color-yacar-surface)]">
                    <span className="inline-block bg-[var(--color-yacar-surface)] text-[var(--color-yacar-azul-vivo)] px-4 py-1 rounded-full text-sm font-bold mb-4">
                    Talla: {producto.talla}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)] mb-2 tracking-tight">
                    {producto.nombre_comercial}
                    </h1>
                </div>

                {producto.diseno?.descripcion_tecnica && (
                    <div className="mb-8 p-6 bg-[var(--color-yacar-crema)]/40 rounded-[var(--radius-suave)] border border-[var(--color-yacar-surface)]">
                    <p className="text-gray-700 leading-relaxed font-[var(--font-cuerpo)] text-base">
                        {producto.diseno.descripcion_tecnica}
                    </p>
                    
                    <div className="mt-4 flex flex-col gap-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-[var(--color-yacar-verde)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Colección: {producto.diseno.nombre_patron}
                        </div>
                        {esMayorista && (
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[var(--color-yacar-azul)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                            Compra Mínima: 1 Docena (12 unidades)
                        </div>
                        )}
                    </div>
                    </div>
                )}

                <div className="bg-white p-6 rounded-[var(--radius-suave)] border border-[var(--color-yacar-surface)] shadow-sm mb-8 relative">
                    
                    {aplicaDescuento && (
                    <div className="absolute -top-3 -right-3 bg-[#FFF3CD] text-[#856404] border border-[#FFEEBA] px-3 py-1 rounded-md text-xs font-bold font-[var(--font-titulos)] shadow-sm flex items-center gap-1">
                        VENTA POR MAYOR (-{porcentajeDescuento}%)
                    </div>
                    )}

                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-widest font-bold">Precio Unitario</p>
                    
                    <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-4xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">
                        Bs. {precioUnitarioBs.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">/ por prenda</span>
                    </div>

                    <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-700">Cantidad ({unitLabel}):</label>
                    <div className="flex items-center bg-[var(--color-yacar-surface)]/50 rounded-lg p-1 border border-[var(--color-yacar-surface)]">
                        <button onClick={() => setCantidad(prev => Math.max(1, prev - 1))} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition-all" disabled={cantidad === 1 || sinStock}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                        </button>
                        <input type="number" value={cantidad} readOnly className="w-12 text-center font-bold text-[var(--color-yacar-texto)] bg-transparent outline-none" />
                        <button onClick={() => setCantidad(prev => prev + 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition-all" disabled={sinStock}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        </button>
                    </div>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--color-yacar-surface)]">
                    <span className="text-sm font-medium text-gray-500">Subtotal estimado:</span>
                    <span className="text-xl font-bold text-[var(--color-yacar-texto)]">
                        Bs. {subtotalBs.toFixed(2)}
                    </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                        className={`flex-1 text-lg py-4 shadow-md transition-all duration-300 ${agregadoExito ? '!bg-[var(--color-yacar-verde)] scale-105' : ''}`} 
                        variant="intense-blue" 
                        disabled={sinStock}
                        onClick={handleAgregarAlCarrito}
                    >
                        {agregadoExito ? (
                            <>
                                <svg className="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                ¡Añadido con éxito!
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                Agregar al Carrito
                            </>
                        )}
                    </Button>
                </div>
                
                {esMayorista && (
                    <p className="text-xs text-center text-[var(--color-yacar-rosa)] mt-3 font-medium">
                    * Se requiere iniciar sesión comercial para confirmar pedidos al por mayor.
                    </p>
                )}
            </div>
        </div>
        </div>
    );
};