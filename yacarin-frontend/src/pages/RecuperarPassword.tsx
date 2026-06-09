import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/Button';

export const RecuperarPassword = () => {
    const navigate = useNavigate();
    
    // Paso 1 = Solicitar Correo | Paso 2 = Ingresar Token y Nueva Clave
    const [paso, setPaso] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

    // Estados del formulario
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [nuevaPassword, setNuevaPassword] = useState('');

    // Paso A: Solicitar código al correo
    const handleSolicitarCodigo = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMensaje({ texto: '', tipo: '' });

        try {
        await api.post('/auth/olvide-password', { email });
        setPaso(2);
        setMensaje({ texto: 'Te hemos enviado un código de recuperación a tu correo.', tipo: 'success' });
        } catch (error: any) {
        setMensaje({ 
            texto: error.response?.data?.message || 'No pudimos encontrar una cuenta con ese correo.', 
            tipo: 'error' 
        });
        } finally {
        setIsLoading(false);
        }
    };

    // Paso B: Restablecer la contraseña
    const handleRestablecer = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMensaje({ texto: '', tipo: '' });

        try {
        await api.post('/auth/reset-password', { 
            token, 
            nuevaPassword 
        });
        
        setMensaje({ texto: '¡Contraseña actualizada con éxito! Redirigiendo al login...', tipo: 'success' });
        setTimeout(() => navigate('/login'), 2000);
        
        } catch (error: any) {
        setMensaje({ 
            texto: error.response?.data?.message || 'El código es inválido o ha expirado.', 
            tipo: 'error' 
        });
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="max-w-md w-full bg-white p-8 rounded-[var(--radius-suave)] shadow-sm border border-[var(--color-yacar-surface)]">
            
            <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">
                Recuperar Acceso
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
                {paso === 1 ? 'Ingresa tu correo y te enviaremos las instrucciones.' : 'Ingresa el código que recibiste y tu nueva clave.'}
            </p>
            </div>

            {mensaje.texto && (
            <div className={`mb-6 p-4 rounded-md text-sm font-medium ${mensaje.tipo === 'success' ? 'bg-[var(--color-yacar-verde)]/10 text-[var(--color-yacar-verde)] border border-[var(--color-yacar-verde)]/20' : 'bg-[var(--color-yacar-rosa)]/10 text-[var(--color-yacar-rosa)] border border-[var(--color-yacar-rosa)]/20'}`}>
                {mensaje.texto}
            </div>
            )}

            {paso === 1 ? (
            <form onSubmit={handleSolicitarCodigo} className="space-y-6">
                <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="ejemplo@correo.com"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[var(--color-yacar-azul)]"
                />
                </div>
                <Button type="submit" variant="intense-blue" className="w-full py-3" isLoading={isLoading}>
                Enviar Código
                </Button>
            </form>
            ) : (
            <form onSubmit={handleRestablecer} className="space-y-6">
                <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Código de Recuperación</label>
                <input 
                    type="text" 
                    value={token} 
                    onChange={(e) => setToken(e.target.value)} 
                    required 
                    placeholder="Pega el código aquí"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[var(--color-yacar-azul)] font-mono text-sm"
                />
                </div>
                <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nueva Contraseña</label>
                <input 
                    type="password" 
                    value={nuevaPassword} 
                    onChange={(e) => setNuevaPassword(e.target.value)} 
                    required 
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[var(--color-yacar-azul)]"
                />
                </div>
                <Button type="submit" variant="intense-blue" className="w-full py-3" isLoading={isLoading}>
                Actualizar Contraseña
                </Button>
            </form>
            )}

            <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <Link to="/login" className="text-sm font-bold text-[var(--color-yacar-azul-vivo)] hover:underline">
                Volver al inicio de sesión
            </Link>
            </div>
        </div>
        </div>
    );
};