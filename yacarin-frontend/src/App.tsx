import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { PublicLayout } from './layouts/PublicLayout';
import { PrivateLayout } from './layouts/PrivateLayout';

import { Bodega } from './pages/admin/Bodega'; 
import { Produccion } from './pages/admin/Produccion';
import { OrdenesProduccion } from './pages/admin/OrdenesProduccion';
import { Empleados } from './pages/admin/Empleados';
import { RegistroProduccion } from './pages/admin/RegistroProduccion';
import { Productos } from './pages/admin/Productos';
import { Disenos } from './pages/admin/Disenos';
import { Dashboard } from './pages/admin/Dashboard';
import { Clientes } from './pages/admin/Clientes';


import { Login } from './pages/Login';
import { Catalogo } from './pages/Catalogo';
import { DetalleProducto } from './pages/DetalleProducto';
import { Checkout } from './pages/Checkout';
import { Tarifas } from './pages/admin/Tarifas';
import { Home } from './pages/Home';
import { RecuperarPassword } from './pages/RecuperarPassword';
import { Perfil } from './pages/Perfil';
import { Registro } from './pages/Registro';
import { EmpleadoDashboard } from './pages/EmpleadoDashboard';









const NotFound = () => <h1 className="text-2xl text-[var(--color-yacar-rosa)]">Error 404: Página no encontrada</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/*  1. RUTAS PÚBLICAS CON NAVBAR (E-commerce Comercial)*/}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/producto/:id" element={<DetalleProducto />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>

        {/* 2. RUTAS DE AUTENTICACIÓN Y ROLES ESPECIALES */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperarpassword" element={<RecuperarPassword />} />
        <Route path="/empleado" element={<EmpleadoDashboard />} />

        {/*  3. RUTAS PRIVADAS DEL ERP (Con Sidebar de Administración)*/}
        <Route path="/admin" element={<PrivateLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="bodega" element={<Bodega />} />
          <Route path="produccion" element={<Produccion />} />
          <Route path="seguimiento" element={<OrdenesProduccion />} />
          <Route path="tarifas" element={<Tarifas />} />
          <Route path="empleados" element={<Empleados />} />
          <Route path="nomina" element={<RegistroProduccion />} />
          <Route path="productos" element={<Productos />} />
          <Route path="disenos" element={<Disenos />} />
          <Route path="clientes" element={<Clientes />} />
        </Route>

        {/* 4. CONTROL DE ERRORES (Ruta comodín)*/}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;