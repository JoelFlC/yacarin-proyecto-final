import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Button } from '../components/Button';
import { useStore } from '../store/useStore'; 
import { Link, useNavigate } from 'react-router-dom';

export const Perfil = () => {
    // Asumimos que tienes una forma de obtener el ID del usuario actual.
    // Puede venir del Zustand, del JWT decodificado o de un fetch inicial.
    // Para este ejemplo, simularemos que lo obtenemos de una función auxiliar o estado.
    const clienteId = localStorage.getItem('usuario_id') || ''; 
    const isAuthenticated = !!localStorage.getItem('access_token');
    const navigate = useNavigate();
    const { esMayorista } = useStore();

    const [isLoading, setIsLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
    
    const [nit, setNit] = useState('');
    const [razonSocial, setRazonSocial] = useState('');

    // Estado para Direcciones y Usuario
    const [userData, setUserData] = useState<any>(null);
    const [direcciones, setDirecciones] = useState<any[]>([]);
    const [isAddingDireccion, setIsAddingDireccion] = useState(false);
    const [nuevaDireccion, setNuevaDireccion] = useState({ departamento: 'La Paz', zona: '', calle_numero: '' });

    const cargarDatos = async () => {
        try {
            const [resDir, resUser] = await Promise.all([
                api.get('/direccion-envio'),
                api.get(`/usuarios/${clienteId}`)
            ]);
            setDirecciones(resDir.data);
            setUserData(resUser.data);
        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    };

    useEffect(() => {
        if (isAuthenticated && clienteId) {
            cargarDatos();
        }
    }, [isAuthenticated, clienteId]);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error(e);
        }
        localStorage.removeItem('access_token');
        localStorage.removeItem('rol');
        localStorage.removeItem('usuario_id');
        navigate('/login');
    };

    const handleSolicitarB2B = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clienteId) {
        setMensaje({ texto: 'Falta tu ID de usuario. Vuelve a iniciar sesión por favor.', tipo: 'error' });
        return;
        }

        setIsLoading(true);
        setMensaje({ texto: '', tipo: '' });

        try {
        // Endpoint PATCH hacia el ID del cliente para actualizar su facturación
        await api.patch(`/clientes/${clienteId}`, { 
            nit, 
            razon_social: razonSocial 
        });
        
        setMensaje({ 
            texto: '¡Datos enviados exitosamente! Nuestro administrador revisará tu solicitud para activar los precios de mayorista.', 
            tipo: 'success' 
        });
        setNit('');
        setRazonSocial('');
        } catch (error: any) {
        setMensaje({ 
            texto: error.response?.data?.message || 'Ocurrió un error al enviar tu solicitud.', 
            tipo: 'error' 
        });
        } finally {
        setIsLoading(false);
        }
    };

    const handleAgregarDireccion = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await api.post('/direccion-envio', nuevaDireccion);
            setMensaje({ texto: 'Dirección agregada correctamente.', tipo: 'success' });
            setIsAddingDireccion(false);
            setNuevaDireccion({ departamento: 'La Paz', zona: '', calle_numero: '' });
            cargarDatos();
        } catch (error: any) {
            setMensaje({ texto: error.response?.data?.message || 'Error al agregar dirección.', tipo: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-in">
                <div className="w-24 h-24 bg-[var(--color-yacar-surface)] rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🔒</span>
                </div>
                <h1 className="text-3xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)] mb-4">Acceso Restringido</h1>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">Para ver la información de tu perfil y solicitar acceso a precios mayoristas, necesitas iniciar sesión.</p>
                <Link to="/login" className="inline-flex items-center gap-2 font-bold text-white bg-[var(--color-yacar-azul-vivo)] px-8 py-3 rounded-full hover:opacity-90 transition-opacity shadow-sm">
                    Ingresar a mi cuenta
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">
                Mi Cuenta
            </h1>
            <button 
                onClick={handleLogout}
                className="text-sm font-bold text-[var(--color-yacar-rosa)] hover:text-red-700 bg-[var(--color-yacar-rosa)]/10 hover:bg-[var(--color-yacar-rosa)]/20 px-4 py-2 rounded-full transition-colors flex items-center gap-2"
            >
                Cerrar Sesión
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* PANEL DE INFORMACIÓN ACTUAL */}
            <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-[var(--color-yacar-surface)] shadow-sm h-fit">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[var(--color-yacar-azul)]/20">
                <span className="text-3xl">👤</span>
            </div>
            
            {userData ? (
                <>
                    <h2 className="text-center text-xl font-bold text-[var(--color-yacar-texto)] mb-1">
                        {userData.nombre} {userData.apPat}
                    </h2>
                    <p className="text-center text-sm text-gray-500 mb-4">{userData.email}</p>
                </>
            ) : (
                <h2 className="text-center text-xl font-bold text-[var(--color-yacar-texto)] mb-4">Cargando...</h2>
            )}

            <div className="text-center mb-6">
                {esMayorista ? (
                <span className="bg-[var(--color-yacar-dorado)]/10 text-[var(--color-yacar-dorado)] font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                    Cliente Mayorista B2B
                </span>
                ) : (
                <span className="bg-[var(--color-yacar-azul)]/10 text-[var(--color-yacar-azul-vivo)] font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                    Cliente Minorista
                </span>
                )}
            </div>
            
            {userData?.celular && (
                <div className="mb-4 text-center">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Teléfono</p>
                    <p className="text-sm text-gray-700">{userData.celular}</p>
                </div>
            )}
            
            <p className="text-sm text-gray-500 text-center mt-4 pt-4 border-t border-gray-100">
                Desde aquí puedes gestionar tu cuenta y acceder a beneficios exclusivos para comerciantes.
            </p>
            </div>

            {/* PANEL DE SOLICITUD B2B */}
            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-[var(--color-yacar-surface)] shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-yacar-surface)]">
                <div className="w-10 h-10 bg-[var(--color-yacar-dorado)]/10 rounded-lg flex items-center justify-center text-[var(--color-yacar-dorado)]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                <h2 className="text-lg font-bold text-[var(--color-yacar-texto)]">Solicitar Ascenso a Mayorista</h2>
                <p className="text-xs text-gray-500 mt-1">Registra los datos de tu comercio en La Paz o El Alto para acceder a descuentos exclusivos por docena.</p>
                </div>
            </div>

            {mensaje.texto && (
                <div className={`mb-6 p-4 rounded-md text-sm font-medium ${mensaje.tipo === 'success' ? 'bg-[var(--color-yacar-verde)]/10 text-[var(--color-yacar-verde)]' : 'bg-[var(--color-yacar-rosa)]/10 text-[var(--color-yacar-rosa)]'}`}>
                {mensaje.texto}
                </div>
            )}

            {!esMayorista ? (
                <form onSubmit={handleSolicitarB2B} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Número de NIT</label>
                    <input 
                        type="text" 
                        value={nit} 
                        onChange={(e) => setNit(e.target.value)} 
                        required 
                        placeholder="Ej: 1234567015"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[var(--color-yacar-dorado)] font-mono text-sm"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Razón Social del Negocio</label>
                    <input 
                        type="text" 
                        value={razonSocial} 
                        onChange={(e) => setRazonSocial(e.target.value)} 
                        required 
                        placeholder="Ej: Boutique Infantil Yacarín"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[var(--color-yacar-dorado)] text-sm"
                    />
                    </div>
                </div>
                
                <div className="pt-4">
                    <Button type="submit" variant="intense-gold" className="w-full sm:w-auto px-8 py-3" isLoading={isLoading}>
                    Enviar Datos de Facturación
                    </Button>
                </div>
                </form>
            ) : (
                <div className="py-8 text-center text-gray-500">
                <span className="text-4xl block mb-4">✅</span>
                <p className="font-bold text-[var(--color-yacar-texto)]">¡Tu cuenta ya es Mayorista!</p>
                <p className="text-sm mt-1">Los descuentos por docena ya se están aplicando automáticamente en tu carrito de compras.</p>
                </div>
            )}
            </div>
            
            {/* PANEL DE DIRECCIONES */}
            <div className="md:col-span-3 bg-white p-6 rounded-2xl border border-[var(--color-yacar-surface)] shadow-sm mt-4">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-yacar-surface)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--color-yacar-azul)]/10 rounded-lg flex items-center justify-center text-[var(--color-yacar-azul-vivo)]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[var(--color-yacar-texto)]">Mis Direcciones de Envío</h2>
                            <p className="text-xs text-gray-500 mt-1">Gestiona tus lugares de entrega frecuentes.</p>
                        </div>
                    </div>
                    {!isAddingDireccion && (
                        <Button onClick={() => setIsAddingDireccion(true)} size="small" variant="intense-blue">+ Nueva Dirección</Button>
                    )}
                </div>

                {isAddingDireccion && (
                    <form onSubmit={handleAgregarDireccion} className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                        <h3 className="font-bold text-sm mb-4">Agregar Dirección</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Departamento</label>
                                <select value={nuevaDireccion.departamento} onChange={(e) => setNuevaDireccion({...nuevaDireccion, departamento: e.target.value})} className="w-full px-3 py-2 rounded border border-gray-200 text-sm bg-white" required>
                                    <option value="La Paz">La Paz</option>
                                    <option value="El Alto">El Alto</option>
                                    <option value="Cochabamba">Cochabamba</option>
                                    <option value="Santa Cruz">Santa Cruz</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Zona / Barrio</label>
                                <input type="text" value={nuevaDireccion.zona} onChange={(e) => setNuevaDireccion({...nuevaDireccion, zona: e.target.value})} className="w-full px-3 py-2 rounded border border-gray-200 text-sm" required placeholder="Ej: Obrajes" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Calle y Número</label>
                                <input type="text" value={nuevaDireccion.calle_numero} onChange={(e) => setNuevaDireccion({...nuevaDireccion, calle_numero: e.target.value})} className="w-full px-3 py-2 rounded border border-gray-200 text-sm" required placeholder="Ej: Av. Hernando Siles #123" />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="secondary" size="small" onClick={() => setIsAddingDireccion(false)}>Cancelar</Button>
                            <Button type="submit" variant="intense-blue" size="small" isLoading={isLoading}>Guardar</Button>
                        </div>
                    </form>
                )}

                {direcciones.length === 0 && !isAddingDireccion ? (
                    <p className="text-sm text-gray-500 text-center py-4">No tienes direcciones registradas.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {direcciones.map(dir => (
                            <div key={dir.id} className="p-4 border border-[var(--color-yacar-surface)] rounded-lg hover:shadow-sm transition-shadow">
                                <p className="font-bold text-[var(--color-yacar-azul-vivo)] mb-1">{dir.departamento}</p>
                                <p className="text-sm font-medium text-gray-800">Zona: {dir.zona}</p>
                                <p className="text-sm text-gray-600">{dir.calle_numero}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
        </div>
    );
};