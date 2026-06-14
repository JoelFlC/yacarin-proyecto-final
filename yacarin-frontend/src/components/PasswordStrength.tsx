import React from 'react';

interface PasswordStrengthProps {
    password: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
    // Función para calcular la fuerza (0 a 4)
    const calculateStrength = (pass: string) => {
        let strength = 0;
        if (pass.length >= 8) strength += 1;
        if (/[A-Z]/.test(pass)) strength += 1;
        if (/[0-9]/.test(pass)) strength += 1;
        if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
        return strength;
    };

    const strength = calculateStrength(password);


    const getStrengthColor = () => {
        switch (strength) {
        case 0:
        case 1:
            return 'bg-[var(--color-yacar-rosa)]'; 
        case 2:
        case 3:
            return 'bg-[var(--color-yacar-amarillo)]';
        case 4:
            return 'bg-[var(--color-yacar-verde)]'; 
        default:
            return 'bg-gray-200';
        }
    };


    const getStrengthText = () => {
        if (password.length === 0) return 'Ingresa una contraseña';
        if (strength <= 1) return 'Débil: Agrega números y mayúsculas';
        if (strength <= 3) return 'Buena: Faltan símbolos especiales';
        return 'Constraseña segura';
    };

    return (
        <div className="mt-2">

        <div className="flex gap-1 h-1.5 mb-1">
            {[...Array(4)].map((_, index) => (
            <div
                key={index}
                className={`flex-1 rounded-[var(--radius-pildora)] transition-colors duration-300 ${
                index < strength ? getStrengthColor() : 'bg-gray-200'
                }`}
            />
            ))}
        </div>

        <p className="text-xs text-gray-500 font-[var(--font-cuerpo)]">
            {getStrengthText()}
        </p>
        </div>
    );
};