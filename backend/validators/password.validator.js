/**
 * Validador de contraseñas con las siguientes reglas:
 * - Mínimo 10 caracteres
 * - Al menos una letra
 * - Al menos un número
 * - Al menos un carácter especial
 * - No permite comillas simples ni dobles
 */
const validatePassword = (password) => {
    if (password.length < 10) return { valid: false, message: 'La contraseña debe tener al menos 10 caracteres' };

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasQuotes = /['"]/.test(password);

    if (!hasUpper) return { valid: false, message: 'La contraseña debe tener al menos una letra mayúscula' };
    if (!hasLower) return { valid: false, message: 'La contraseña debe tener al menos una letra minúscula' };
    if (!hasNumber) return { valid: false, message: 'La contraseña debe tener al menos un número' };
    if (!hasSpecial) return { valid: false, message: 'La contraseña debe tener al menos un carácter especial' };
    if (hasQuotes) return { valid: false, message: 'La contraseña no puede contener comillas simples o dobles' };

    return { valid: true };
};

module.exports = { validatePassword };
