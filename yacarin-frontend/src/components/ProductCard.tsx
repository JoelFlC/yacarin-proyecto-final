import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { useStore } from '../store/useStore';

export interface ProductoType {
    id: string;
    nombre_comercial: string;
    talla: string;
    precio_base_usd: number;
    precio_base_bs: number; 
    descuento_mayorista?: number; 
    stock_actual: number;
    imagen_url?: string;
    diseno?: {
        id: string;
        nombre_patron: string;
        color_primario: string;
        descripcion_tecnica?: string; 
    };
}

interface ProductCardProps {
    producto: ProductoType;
    esMayorista: boolean; 
}

    export const ProductCard: React.FC<ProductCardProps> = ({ producto, esMayorista }) => {
    const { agregarAlCarrito, tipoCambioBs } = useStore();
    const [agregadoExito, setAgregadoExito] = useState(false);

    const baseUsd = Number(producto.precio_base_usd) || 0;
    const baseBs = Number(producto.precio_base_bs) || (baseUsd * tipoCambioBs) || 0; 

    const descuentoFijoUsd = Number(producto.descuento_mayorista) || 0;
    const aplicaDescuento = esMayorista && descuentoFijoUsd > 0;
    
    const precioFinalUsd = aplicaDescuento ? baseUsd - descuentoFijoUsd : baseUsd;
    const descuentoEnBs = descuentoFijoUsd * tipoCambioBs;
    const precioUnitarioBs = aplicaDescuento ? baseBs - descuentoEnBs : baseBs;

    const sinStock = producto.stock_actual <= 0;

    const handleAgregarRapido = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Evita que React Router abra el enlace del detalle
        if (sinStock) return;

        agregarAlCarrito({
        producto_id: producto.id,
        nombre: producto.nombre_comercial,
        talla: producto.talla,
        precio_unitario: esMayorista ? precioFinalUsd : precioUnitarioBs,
        cantidad: esMayorista ? 12 : 1,
        imagen_url: producto.imagen_url,
        stock_maximo: producto.stock_actual
    });

        setAgregadoExito(true);
        setTimeout(() => setAgregadoExito(false), 2000);
    };

    return (
        <div className="group relative bg-white rounded-[var(--radius-suave)] p-4 shadow-[0_4px_20px_rgb(95,168,211,0.08)] border border-[var(--color-yacar-surface)] hover:shadow-[0_8px_30px_rgb(95,168,211,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
        
        <Link to={`/producto/${producto.id}`}>
            <div className="relative mb-4 pt-2 px-2 cursor-pointer">
            <div className="absolute top-2 left-4 w-[90%] h-[90%] bg-[var(--color-yacar-azul)]/20 rounded-[var(--radius-suave)] transition-transform duration-300 group-hover:translate-y-2 group-hover:translate-x-2"></div>
            
            <div className="relative z-10 w-full aspect-square bg-[var(--color-yacar-surface)] rounded-[var(--radius-suave)] overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                {producto.imagen_url ? (
                <img src={producto.imagen_url} alt={producto.nombre_comercial} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                <span className="text-6xl">🍼</span> 
                )}
                
                {sinStock && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                    <span className="bg-[var(--color-yacar-rosa)] text-white px-3 py-1 rounded-[var(--radius-pildora)] text-sm font-bold font-[var(--font-titulos)]">Agotado</span>
                </div>
                )}
            </div>
            </div>
        </Link>

        <div className="flex-grow flex flex-col">
            <div className="flex justify-between items-start mb-1">
            <Link to={`/producto/${producto.id}`}>
                <h3 className="font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)] text-lg leading-tight hover:text-[var(--color-yacar-azul-vivo)] transition-colors cursor-pointer">
                {producto.nombre_comercial}
                </h3>
            </Link>
            <span className="text-xs bg-[var(--color-yacar-surface)] text-[var(--color-yacar-azul-vivo)] px-2 py-1 rounded-md font-medium whitespace-nowrap ml-2">
                Talla {producto.talla}
            </span>
            </div>
            
            {producto.diseno && (
            <p className="text-xs text-gray-500 mb-2">Patrón: {producto.diseno.nombre_patron}</p>
            )}

            <div className="mt-auto pt-2">
            {aplicaDescuento && (
                <span className="text-xs text-gray-400 line-through">Normal: ${baseUsd.toFixed(2)} USD</span>
            )}
            <div className="flex items-end gap-2 mb-3">
                <span className={`text-xl font-bold ${aplicaDescuento ? 'text-[var(--color-yacar-verde)]' : 'text-[var(--color-yacar-texto)]'}`}>
                {aplicaDescuento ? `$${precioFinalUsd.toFixed(2)} USD` : `Bs. ${precioUnitarioBs.toFixed(2)}`}
                </span>
                {!aplicaDescuento && (
                <span className="text-sm text-gray-400 mb-0.5">(${baseUsd.toFixed(2)} USD)</span>
                )}
            </div>

            <Button 
                className={`w-full text-sm py-2 transition-all duration-300 ${agregadoExito ? '!bg-[var(--color-yacar-verde)] scale-105' : ''}`} 
                variant="intense-blue" 
                disabled={sinStock}
                onClick={handleAgregarRapido}
            >
                {sinStock ? 'No disponible' : agregadoExito ? '¡Añadido! ✓' : 'Añadir al carrito'}
            </Button>
            </div>
        </div>
        </div>
    );
};