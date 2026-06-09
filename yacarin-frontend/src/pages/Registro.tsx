import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { api } from '../services/api';
import { Button } from '../components/Button';

export const Registro = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [captchaVal, setCaptchaVal] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nombre: '',
        apPat: '',
        apMat: '',
        celular: '',
        email: '',
        password: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Lógica para medir la fuerza de la contraseña
    const getPasswordStrength = (pass: string) => {
        if (!pass) return { score: 0, label: '', color: 'bg-gray-200' };
        let score = 0;
        if (pass.length >= 6) score += 1;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;

        if (score <= 2) return { score, label: 'Débil', color: 'bg-red-400', width: 'w-1/3' };
        if (score <= 4) return { score, label: 'Intermedio', color: 'bg-yellow-400', width: 'w-2/3' };
        return { score, label: 'Fuerte', color: 'bg-green-500', width: 'w-full' };
    };

    const strength = getPasswordStrength(formData.password);

    const handleRegistro = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (strength.score < 3) {
            setErrorText('La contraseña es demasiado débil. Usa una combinación más segura (mínimo nivel Intermedio).');
            return;
        }

        if (!captchaVal) {
            setErrorText('Por favor, completa el CAPTCHA de seguridad.');
            return;
        }
        
        setIsLoading(true);
        setErrorText('');

        try {
        await api.post('/auth/register', formData);
        alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
        navigate('/login');
        } catch (error: any) {
        setErrorText(error.response?.data?.message || 'Error al intentar registrar la cuenta.');
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="max-w-xl w-full bg-white p-8 rounded-[var(--radius-suave)] shadow-sm border border-[var(--color-yacar-surface)]">
            
            <div className="text-center mb-8">
            <span className="text-4xl mb-4 inline-block">🧸</span>
            <h2 className="text-3xl font-bold text-[var(--color-yacar-texto)] font-[var(--font-titulos)]">
                Únete a Yacarín
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
                Crea tu cuenta para comprar nuestros ajuares infantiles.
            </p>
            </div>

            {errorText && (
            <div className="mb-6 p-4 rounded-md text-sm font-medium bg-[var(--color-yacar-rosa)]/10 text-[var(--color-yacar-rosa)] border border-[var(--color-yacar-rosa)]/20">
                ⚠️ {errorText}
            </div>
            )}

            <form onSubmit={handleRegistro} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre(s)</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[var(--color-yacar-azul)] text-sm" />
                </div>
                <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Apellido Paterno</label>
                <input type="text" name="apPat" value={formData.apPat} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[var(--color-yacar-azul)] text-sm" />
                </div>
                <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Apellido Materno</label>
                <input type="text" name="apMat" value={formData.apMat} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[var(--color-yacar-azul)] text-sm" />
                </div>
                <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Celular</label>
                <input type="text" name="celular" value={formData.celular} onChange={handleInputChange} required placeholder="Ej: 78912345" className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[var(--color-yacar-azul)] text-sm" />
                </div>
                <div className="sm:col-span-2 pt-4 border-t border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[var(--color-yacar-azul)] text-sm" />
                </div>
                <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña Segura</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required minLength={6} placeholder="Mínimo 6 caracteres" className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-[var(--color-yacar-azul)] text-sm" />
                
                {/* Indicador de Fuerza de Contraseña */}
                {formData.password && (
                    <div className="mt-2">
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`}></div>
                        </div>
                        <p className={`text-xs mt-1 font-semibold ${strength.color.replace('bg-', 'text-')}`}>
                            Seguridad: {strength.label}
                        </p>
                    </div>
                )}
                </div>

                {/* CAPTCHA */}
                <div className="sm:col-span-2 flex justify-center mt-2">
                    <ReCAPTCHA
                        sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                        onChange={(val) => setCaptchaVal(val)}
                    />
                </div>
            </div>
            
            <div className="pt-4">
                <Button type="submit" variant="intense-blue" className="w-full py-4 text-lg" isLoading={isLoading}>
                Crear mi cuenta
                </Button>
            </div>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-bold text-[var(--color-yacar-azul-vivo)] hover:underline">
                Inicia sesión aquí
            </Link>
            </div>
        </div>
        </div>
    );
};