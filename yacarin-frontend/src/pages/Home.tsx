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
        <div className="animate-fade-in pb-12 bg-gray-50">
            {/* HERO SECTION (VetCare Style - 50/50 Split) */}
            <section className="relative overflow-hidden bg-white border-b border-[var(--color-yacar-surface)] pt-12 pb-20 lg:pt-24 lg:pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">

                        {/* Texto a la izquierda */}
                        <div className="lg:col-span-5 text-center lg:text-left mb-16 lg:mb-0 relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-yacar-azul)]/10 text-[var(--color-yacar-azul-vivo)] text-sm font-bold mb-6">
                                <span>✨</span> Fabricantes Directos
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--color-yacar-texto)] font-[var(--font-titulos)] leading-tight tracking-tight mb-6">
                                Cuidado experto para <br />
                                <span className="text-[var(--color-yacar-verde)]">los primeros pasos</span>
                            </h1>
                            <p className="text-lg sm:text-xl text-gray-500 font-[var(--font-cuerpo)] mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                Somos una empresa familiar dedicada a la confección y distribución al por mayor y menor de ropa de bebé de alta calidad. Brindamos amor y suavidad para quienes más lo merecen.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link to="/catalogo" className="px-8 py-4 bg-[#FF9F1C] hover:bg-[#F48C06] text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center flex items-center justify-center gap-2">
                                    Ver Catálogo
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </Link>
                                <Link to="/registro" className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-full transition-all border border-gray-200 shadow-sm text-center">
                                    Convertirse en Distribuidor
                                </Link>
                            </div>
                        </div>

                        {/* Imagen a la derecha */}
                        <div className="lg:col-span-7 relative">
                            {/* Fondo decorativo estilo VetCare */}
                            <div className="absolute inset-0 bg-[#A8DADC] rounded-[100px] transform rotate-3 scale-105 opacity-50"></div>

                            {/* Contenedor de la Imagen Principal */}
                            <div className="relative rounded-[60px] md:rounded-[100px] overflow-hidden shadow-2xl aspect-[4/3] lg:aspect-auto lg:h-[600px] bg-gray-200">
                                <img
                                    src="https://res.cloudinary.com/dw5av6bz1/image/upload/v1781395811/banner2_dsgfkg.png"
                                    alt="Ropa de bebé Yacarín"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Floating Badge estilo VetCare */}
                            <div className="absolute -bottom-6 sm:bottom-10 sm:-left-10 bg-white p-4 sm:p-5 rounded-2xl shadow-xl flex items-center gap-4 animate-fade-in-up">
                                <div className="w-12 h-12 rounded-full bg-[#1D3557] flex items-center justify-center text-white">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-[var(--color-yacar-texto)] leading-none">5k+</p>
                                    <p className="text-sm font-semibold text-gray-500 mt-1">Clientes Felices</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* SECCIÓN ZIG-ZAG (Estilo Tejido Yacar) */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

                    {/* Fila 1: Texto Izquierda, Imagen Derecha */}
                    <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                        <div className="mb-10 lg:mb-0">
                            <h4 className="text-[#A8DADC] font-bold tracking-widest uppercase text-sm mb-3">Comodidad Absoluta</h4>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1D3557] font-[var(--font-titulos)] leading-tight mb-6">
                                Tejido de Alta Densidad que abraza como mamá
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Nuestras máquinas están calibradas para crear un punto cerrado y preciso. Esto permite que la prenda retenga el calor corporal del bebé en los días fríos, manteniendo una ligereza sorprendente y una textura suave al contacto con la piel.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="aspect-[4/3] rounded-[40px] overflow-hidden shadow-xl bg-gray-100">
                                <img
                                    src="https://res.cloudinary.com/dw5av6bz1/image/upload/v1781395795/panel2_jstrc3.png"
                                    alt="Tejido de alta densidad"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Fila 2: Imagen Izquierda, Texto Derecha */}
                    <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                        <div className="order-2 lg:order-1 relative mt-10 lg:mt-0">
                            <div className="aspect-[4/3] rounded-[40px] overflow-hidden shadow-xl bg-gray-100">
                                <img
                                    src="https://res.cloudinary.com/dw5av6bz1/image/upload/v1781395795/panel1_srs6jb.png"
                                    alt="Hilos hipoalergénicos"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <h4 className="text-[#FFA69E] font-bold tracking-widest uppercase text-sm mb-3">Piel Protegida</h4>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1D3557] font-[var(--font-titulos)] leading-tight mb-6">
                                Hilos hipoalergénicos
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Sabemos que la piel de un recién nacido es sumamente delicada. Por eso, importamos lanas e hilos con certificación hipoalergénica. Cero irritaciones, cero molestias, solo pura suavidad en cada hebra tejida por nuestra familia.
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            {/* SECCIÓN CATÁLOGO (Cards Estilizadas) */}
            <section className="py-24 bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1D3557] font-[var(--font-titulos)] mb-4">Nuestro Catálogo</h2>
                    <p className="text-gray-500 mb-16 text-lg">Confecciones más solicitadas.</p>

                    {isLoading ? (
                        <div className="py-12 text-gray-500 text-xl font-medium animate-pulse">Cargando colección...</div>
                    ) : productosDestacados.length === 0 ? (
                        <div className="py-12 text-gray-500 text-xl">Estamos preparando nuevas prendas...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {productosDestacados.map(prod => (
                                <div key={prod.id} className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 group hover:-translate-y-2 transition-transform duration-300">
                                    <div className="aspect-[4/3] rounded-[24px] overflow-hidden mb-6 bg-gray-50">
                                        {prod.imagen_url ? (
                                            <img src={prod.imagen_url} alt={prod.nombre_comercial} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl">🧸</div>
                                        )}
                                    </div>
                                    <div className="text-left mb-6">
                                        <h3 className="font-extrabold text-xl text-[#1D3557] mb-2">{prod.nombre_comercial}</h3>
                                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{prod.descripcion || 'Punto clásico de lana Yacarín.'}</p>
                                        <p className="text-[#1D3557] font-black text-2xl">${Number(prod.precio_base_usd).toFixed(2)}</p>
                                    </div>
                                    <Link to="/catalogo" className="block w-full py-3 px-4 rounded-full border-2 border-gray-100 text-[#1D3557] font-bold text-sm text-center hover:bg-gray-50 transition-colors">
                                        Ver Detalles
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-16">
                        <Link to="/catalogo" className="inline-flex items-center gap-2 text-[var(--color-yacar-azul-vivo)] font-bold text-lg hover:underline group">
                            Explorar todo el catálogo
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
};