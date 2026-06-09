import React, { useState } from 'react';
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

    const handleLogout = () => {
        localStorage.removeItem('access_token');
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
            <h2 className="text-center text-xl font-bold text-[var(--color-yacar-texto)] mb-1">Tu Perfil</h2>
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
            <p className="text-sm text-gray-500 text-center mb-4">
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

        </div>
        </div>
    );
};