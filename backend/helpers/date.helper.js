/**
 * Calcula la diferencia en días entre la fecha actual y una fecha dada.
 */
const getDaysDiff = (date) => {
    if (!date) return null;
    const now = new Date();
    const past = new Date(date);
    const diffTime = Math.abs(now - past);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

module.exports = { getDaysDiff };
