import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export const Home = () => {
    const [productosDestacados, setProductosDestacados] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const cargarDestacados = async () => {
        try {
            const res = await api.get('/productos');
            // Filtramos los activos y tomamos solo los primeros 3 para exhibición
            const activos = res.data.filter((p: any) => p.activo).slice(0, 3);
            setProductosDestacados(activos);
        } catch (error) {
            console.error("Error cargando destacados", error);
        } finally {
            setIsLoading(false);
        }
        };
        cargarDestacados();
    }, []);

    return (
        <div className="animate-fade-in pb-12">
        {/* HERO SECTION */}
        <section className="relative bg-[var(--color-yacar-crema)]/30 overflow-hidden border-b border-[var(--color-yacar-surface)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
            <span className="text-5xl mb-6 inline-block animate-bounce">🧸</span>
            <h1 className="text-4xl md:text-6xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)] mb-6 tracking-tight">
                Confort y ternura para <br className="hidden md:block" />
                <span className="text-[var(--color-yacar-azul-vivo)]">los más pequeños</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-[var(--font-cuerpo)] mb-10">
                Descubre nuestra colección de ajuares y prendas diseñadas con amor, telas hipoalergénicas y el mayor cuidado para la piel de tu bebé.
            </p>
            <div className="flex justify-center gap-4">
                <Link to="/catalogo" className="px-8 py-4 bg-[var(--color-yacar-azul)] hover:bg-[var(--color-yacar-azul-vivo)] text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Ver Colección Completa
                </Link>
                <Link to="/registro" className="px-8 py-4 bg-white hover:bg-gray-50 text-[var(--color-yacar-azul)] font-bold rounded-full transition-all border border-gray-200 shadow-sm">
                Crear Cuenta
                </Link>
            </div>
            </div>
        </section>

        {/* BENEFICIOS / VALORES */}
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-6">
                <div className="w-16 h-16 mx-auto bg-[var(--color-yacar-verde)]/10 text-[var(--color-yacar-verde)] rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-[var(--color-yacar-texto)] mb-2">Calidad Premium</h3>
                <p className="text-gray-500 text-sm">Telas seleccionadas para garantizar suavidad y durabilidad tras cada lavado.</p>
                </div>
                <div className="p-6">
                <div className="w-16 h-16 mx-auto bg-[var(--color-yacar-dorado)]/10 text-[var(--color-yacar-dorado)] rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-[var(--color-yacar-texto)] mb-2">Precios de Fábrica</h3>
                <p className="text-gray-500 text-sm">Somos fabricantes. Opciones de venta por menor y excelentes descuentos para mayoristas.</p>
                </div>
                <div className="p-6">
                <div className="w-16 h-16 mx-auto bg-[var(--color-yacar-rosa)]/10 text-[var(--color-yacar-rosa)] rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-[var(--color-yacar-texto)] mb-2">Hecho con Amor</h3>
                <p className="text-gray-500 text-sm">Confección nacional con atención al detalle en cada costura y acabado.</p>
                </div>
            </div>
            </div>
        </section>

        {/* DESTACADOS DINÁMICOS */}
        <section className="py-16 bg-gray-50 border-t border-[var(--color-yacar-surface)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10">
                <div>
                <h2 className="text-3xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">Lo más nuevo</h2>
                <p className="text-gray-500 mt-2">Nuestros ajuares recién salidos del taller.</p>
                </div>
                <Link to="/catalogo" className="text-[var(--color-yacar-azul-vivo)] font-bold hover:underline hidden sm:block">
                Ver todo →
                </Link>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Cargando colección...</div>
            ) : productosDestacados.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Estamos preparando nuevas prendas...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {productosDestacados.map(prod => (
                    <div key={prod.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all">
                    <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                        {prod.imagen_url ? (
                        <img src={prod.imagen_url} alt={prod.nombre_comercial} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🍼</div>
                        )}
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                        Talla {prod.talla}
                        </div>
                    </div>
                    <div className="p-5 text-center">
                        <h3 className="font-bold text-lg text-[var(--color-yacar-texto)] mb-1">{prod.nombre_comercial}</h3>
                        <p className="text-[var(--color-yacar-azul-vivo)] font-bold text-xl">${Number(prod.precio_base_usd).toFixed(2)}</p>
                    </div>
                    </div>
                ))}
                </div>
            )}
            
            <div className="mt-8 text-center sm:hidden">
                <Link to="/catalogo" className="text-[var(--color-yacar-azul-vivo)] font-bold hover:underline">
                Ver todo el catálogo →
                </Link>
            </div>
            </div>
        </section>
        </div>
    );
};