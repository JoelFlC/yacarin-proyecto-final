import React from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import logoYacarin from '../assets/img/logo1.png';

export const PublicLayout = () => {
  // HOOKS AL INICIO: Extraemos la longitud del carrito de forma segura
  const carrito = useStore(state => state.carrito);
  const cantidadEnCarrito = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  const location = useLocation(); // Fuerza re-render al cambiar de ruta

  // Verificamos si existe un token válido para saber si está autenticado
  const token = localStorage.getItem('access_token');
  const isAuthenticated = !!token && token !== 'undefined' && token !== 'null';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `font-medium font-[var(--font-cuerpo)] transition-colors duration-200 ${
      isActive 
        ? 'text-[var(--color-yacar-azul-vivo)] border-b-2 border-[var(--color-yacar-azul-vivo)] pb-1' 
        : 'text-gray-600 hover:text-[var(--color-yacar-azul)]'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-yacar-crema)]">
      
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[var(--color-yacar-surface)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-[var(--color-yacar-surface)] rounded-full flex items-center justify-center overflow-hidden border border-white shadow-inner group-hover:scale-105 transition-transform">
                <img src={logoYacarin} alt="Logo Yacarín" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)] leading-none tracking-tight">
                  Yacarín
                </h1>
                <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
                  Cariño que abraza
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex gap-8">
              <NavLink to="/" className={linkClass}>Inicio</NavLink>
              <NavLink to="/catalogo" className={linkClass}>Catálogo</NavLink>
            </nav>

            <div className="flex items-center gap-4">
              
              {/* ÍCONO DE CARRITO CONECTADO */}
              <Link to="/checkout" className="relative p-2 text-gray-500 hover:text-[var(--color-yacar-azul-vivo)] transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                
                {/* CONDICIONAL RENDER SEGURO */}
                {cantidadEnCarrito > 0 && (
                  <span className="absolute top-0 right-0 bg-[var(--color-yacar-rosa)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cantidadEnCarrito}
                  </span>
                )}
              </Link>

              <span className="w-px h-6 bg-gray-200 hidden sm:block"></span>

              {isAuthenticated ? (
                <Link to="/perfil" className="hidden sm:flex items-center justify-center w-10 h-10 bg-[var(--color-yacar-azul-vivo)] text-white rounded-full hover:opacity-90 transition-opacity shadow-sm">
                  <span className="text-xl leading-none">👤</span>
                </Link>
              ) : (
                <Link to="/login" className="hidden sm:flex items-center gap-2 text-sm font-bold text-white bg-[var(--color-yacar-azul-vivo)] px-4 py-2 rounded-[var(--radius-pildora)] hover:opacity-90 transition-opacity shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                  Ingresar
                </Link>
              )}
            </div>

            
            
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet /> 
      </main>

      <footer className="bg-white border-t border-[var(--color-yacar-surface)] py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 font-[var(--font-cuerpo)]">
          <p>© {new Date().getFullYear()} Yacarín - Ropa de Bebé. Todos los derechos reservados.</p>
        </div>
      </footer>
      
    </div>
  );
};