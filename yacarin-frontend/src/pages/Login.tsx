import React, { useState, useRef } from 'react';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { Button } from '../components/Button';
import { PasswordStrength } from '../components/PasswordStrength';
import { api } from '../services/api';

// Asegúrate de tener la imagen de tu logo guardada en esta ruta exacta
import logoYacarin from '../assets/img/logo2.png'; 

// Esquema de validación con Zod
const loginSchema = z.object({
  email: z.string().email('Debe ser un correo válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const Login = () => {
  const navigate = useNavigate();
  
  // Estados de los campos
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados de retroalimentación
  const [errorText, setErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaVal, setCaptchaVal] = useState<string | null>(null);

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');


    if (!captchaVal) {
      setErrorText('Por favor, completa el CAPTCHA de seguridad.');
      return;
    }

    setIsLoading(true);

    try {
      loginSchema.parse({ email, password });

      const response = await api.post('/auth/login', { 
        email, 
        password,
      });
      
      // 4. Guardamos el token, rol, e id y redirigimos dinámicamente
      const { access_token, rol, usuario_id, nombre_completo } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('rol', rol);
      localStorage.setItem('usuario_id', usuario_id);
      localStorage.setItem('nombre_completo', nombre_completo || 'Usuario');

      if (rol === 'ADMINISTRADOR') {
        navigate('/admin');
      } else if (rol === 'EMPLEADO') {
        navigate('/empleado');
      } else {
        navigate('/');
      }

    } catch (error: any) {
      // Manejo de todos los posibles errores
      if (error instanceof z.ZodError) {
        setErrorText(error.issues[0]?.message || 'Por favor, verifica los campos.');
      } else if (error.response) {
        setErrorText(error.response.data.message || 'Credenciales incorrectas');
      } else {
        setErrorText('Error de conexión con el servidor');
      }
      
      // Si el login falla, reseteamos el Captcha por seguridad
      recaptchaRef.current?.reset();
      setCaptchaVal(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[var(--color-yacar-crema)] overflow-hidden">
      
      {/* PATRÓN DE FONDO: Tejido de lana (Opacidad muy sutil) */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 0L16 8L8 16L0 8L8 0ZM8 4L4 8L8 12L12 8L8 4Z' fill='%232C3E50' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Contenedor Principal (Tonal Layering con sombras tintadas) */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white rounded-[var(--radius-suave)] shadow-[0_8px_30px_rgb(95,168,211,0.12)] border border-[var(--color-yacar-surface)] overflow-hidden">
        
        {/* BURBUJAS DECORATIVAS (Blobs en las esquinas) */}
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-[var(--color-yacar-surface)] rounded-full opacity-60 pointer-events-none"></div>
        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-[var(--color-yacar-surface)] rounded-full opacity-60 pointer-events-none"></div>

        <div className="relative z-10">
          
          {/* Logo Yacarín importado dinámicamente */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-[var(--color-yacar-surface)] rounded-[var(--radius-suave)] flex items-center justify-center shadow-inner border border-white overflow-hidden">
              <img src={logoYacarin} alt="Logo Yacarín" className="w-full h-full object-cover" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-[var(--color-yacar-texto)] font-[var(--font-titulos)] mb-1">
            Bienvenido a Yacarín
          </h2>
          <p className="text-center text-sm text-gray-500 mb-6 font-[var(--font-cuerpo)]">
            Cariño que abraza
          </p>

          {/* Renderizado de Errores */}
          {errorText && (
            <div className="mb-4 p-3 bg-[var(--color-yacar-rosa)]/20 border border-[var(--color-yacar-rosa)] text-[var(--color-yacar-rosa)] rounded-md text-sm font-medium text-center transition-all">
              {errorText}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Input Correo */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-yacar-texto)] mb-1">Correo Electrónico</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-[var(--radius-suave)] bg-[var(--color-yacar-surface)]/50 border border-transparent focus:bg-white focus:border-[var(--color-yacar-azul)] focus:ring-2 focus:ring-[var(--color-yacar-azul)]/20 outline-none transition-all text-sm"
                placeholder="ingresa@correo.com"
              />
            </div>
            
            {/* Input Contraseña con funcionalidad de visualizar/ocultar */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-yacar-texto)] mb-1">Contraseña</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-[var(--radius-suave)] bg-[var(--color-yacar-surface)]/50 border border-transparent focus:bg-white focus:border-[var(--color-yacar-azul)] focus:ring-2 focus:ring-[var(--color-yacar-azul)]/20 outline-none transition-all text-sm pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--color-yacar-azul)] transition-colors p-1 cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l3.536 3.536" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Opciones de cuenta */}
            <div className="flex items-center justify-between mt-2 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[var(--color-yacar-azul)] focus:ring-[var(--color-yacar-azul)]" />
                <span className="text-sm text-gray-600 font-[var(--font-cuerpo)]">Recordarme</span>
              </label>
              <Link to="/RecuperarPassword" className="text-sm font-medium text-[var(--color-yacar-azul)] hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
            </div>

            {/* CAPTCHA */}
            <div className="flex justify-center mt-4">
                <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                    onChange={(val) => setCaptchaVal(val)}
                />
            </div>

            {/* Botón de envío con variante intense-blue */}
            <Button type="submit" variant="intense-blue" className="w-full py-4 text-lg mt-4" isLoading={isLoading}>
              Iniciar Sesión
            </Button>
          </form>

          {/* Enlace de Registro */}
          <div className="mt-6 text-center text-sm text-gray-600">
            ¿No tienes una cuenta aún?{' '}
            <Link to="/registro" className="font-bold text-[var(--color-yacar-azul)] hover:underline">
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};