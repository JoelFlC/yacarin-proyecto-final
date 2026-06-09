import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    // Supported variants (include all used in the switch)
    variant?: 'primary' | 'secondary' | 'intense-orange' | 'intense-blue' | 'intense-coral' | 'intense-gold';
    isLoading?: boolean;
    }

    export const Button: React.FC<ButtonProps> = ({ 
    children, 
    variant = 'primary', 
    isLoading, 
    className = '', // 1. EXTRAEMOS className AQUÍ
    ...props 
    }) => {
    const baseClasses = "relative px-6 py-3 font-bold font-[var(--font-cuerpo)] rounded-[var(--radius-pildora)] transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed";
    
    let colorClasses = "";
    switch (variant) {
        case 'primary':
            colorClasses = "bg-[var(--color-yacar-azul)] text-white hover:bg-blue-400";
            break;
        case 'secondary':
            colorClasses = "bg-[var(--color-yacar-rosa)] text-white hover:bg-pink-400";
            break;
        case 'intense-blue':
            // El azul profundo para acciones principales
            colorClasses = "bg-[var(--color-yacar-azul-vivo)] text-white hover:opacity-90 shadow-md shadow-[var(--color-yacar-azul-vivo)]/30";
            break;
        case 'intense-coral':
            // El coral vibrante, excelente contraste con el fondo crema
            colorClasses = "bg-[var(--color-yacar-coral)] text-white hover:opacity-90 shadow-md shadow-[var(--color-yacar-coral)]/30";
            break;
        case 'intense-gold':
            // Un tono cálido y fuerte derivado de los cremas
            colorClasses = "bg-[var(--color-yacar-dorado)] text-white hover:opacity-90 shadow-md shadow-[var(--color-yacar-dorado)]/30";
            break;
    }

    const stitchClasses = "before:absolute before:inset-1 before:border before:border-dashed before:border-white/50 before:rounded-[var(--radius-pildora)] before:pointer-events-none";

    return (
        <button 
        // 2. COMBINAMOS LAS CLASES DE FORMA SEGURA
        className={`${baseClasses} ${colorClasses} ${stitchClasses} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
        >
        {isLoading ? (
            <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Procesando...
            </span>
        ) : (
            children
        )}
        </button>
    );
};