import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import logoYacarin from '../assets/img/logo2.png'; // Reutilizamos tu logo

export const PrivateLayout = () => {
  const navigate = useNavigate();

  // Función para cerrar sesión de forma segura
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario_id');
    navigate('/login');
  };

  const rol = localStorage.getItem('rol');
  
  // Protección de Ruta: Solo administradores pueden ver este layout
  if (rol !== 'ADMINISTRADOR') {
    return <Navigate to={rol === 'EMPLEADO' ? '/empleado' : '/'} replace />;
  }

  // Clases dinámicas para los enlaces de navegación (activo vs inactivo)
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-[var(--radius-suave)] font-medium transition-all duration-200 ${
      isActive 
        ? 'bg-[var(--color-yacar-azul)] text-white shadow-md' 
        : 'text-gray-600 hover:bg-[var(--color-yacar-surface)] hover:text-[var(--color-yacar-azul-vivo)]'
    }`;

  return (
    <div className="min-h-screen flex bg-[var(--color-yacar-crema)] font-[var(--font-cuerpo)]">
      
      {/* =======================
          SIDEBAR (Barra Lateral)
          ======================= */}
      <aside className="w-64 bg-white border-r border-[var(--color-yacar-surface)] flex flex-col shadow-sm hidden md:flex">
        {/* Branding */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-[var(--color-yacar-surface)]">
          <img src={logoYacarin} alt="Yacarín" className="w-10 h-10 object-contain" />
          <div>
            <h2 className="font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)] leading-none">Yacarín</h2>
            <span className="text-xs text-gray-400">ERP Administrativo</span>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-2">
          <NavLink to="/admin" end className={navLinkClass}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Dashboard
          </NavLink>

          <NavLink to="/admin/productos" className={navLinkClass}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Productos
          </NavLink>

          <NavLink to="/admin/disenos" className={navLinkClass}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Diseños
          </NavLink>

          
          <NavLink to="/admin/bodega" className={navLinkClass}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            Bodega & Almacén
          </NavLink>

          <NavLink to="/admin/proveedores" className={navLinkClass}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            Proveedores
          </NavLink>

          <NavLink to="/admin/produccion" className={navLinkClass}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Producción 
          </NavLink>

          <NavLink to="/admin/seguimiento" className={navLinkClass}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            Órdenes de Trabajo
          </NavLink>

          <NavLink to="/admin/empleados" className={navLinkClass}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Personal y RRHH
          </NavLink>



          <NavLink to="/admin/nomina" className={navLinkClass}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Nómina a Destajo
          </NavLink>

          <NavLink to="/admin/clientes" className={navLinkClass}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Clientes
          </NavLink>

          <NavLink to="/admin/pedidos" className={navLinkClass}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Pedidos (Ventas)
          </NavLink>

          
        </nav>
      </aside>

      {/* =======================
          ÁREA PRINCIPAL
          ======================= */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* TOPBAR (Cabecera Superior) */}
        <header className="h-20 bg-white border-b border-[var(--color-yacar-surface)] flex items-center justify-between px-8 shadow-sm">
          {/* Título dinámico o bienvenida */}
          <h1 className="text-xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">
            Panel de Control
          </h1>

          {/* Menú de Usuario y Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 border-r border-gray-200 pr-4">
              <div className="w-9 h-9 rounded-full bg-[var(--color-yacar-surface)] border border-[var(--color-yacar-azul)] flex items-center justify-center text-[var(--color-yacar-azul-vivo)] font-bold">
                A
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-bold text-[var(--color-yacar-texto)] leading-tight">Admin Yacarín</p>
                <p className="text-xs text-gray-500">Superusuario</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-[var(--color-yacar-rosa)] transition-colors p-2 rounded-full hover:bg-[var(--color-yacar-rosa)]/10"
              title="Cerrar Sesión"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>
        </header>

        {/* CONTENEDOR DINÁMICO (Aquí se renderiza Bodega.tsx, etc.) */}
        <div className="flex-1 overflow-auto p-8 relative">
          <Outlet /> {/* 🔌 EL ENCHUFE MÁGICO */}
        </div>
      </main>
    </div>
  );
};