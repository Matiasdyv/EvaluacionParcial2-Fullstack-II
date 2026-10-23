// Escribe un monto en pesos chilenos con punto de miles: 25000 -> $25.000
export const formatearPesos = (monto) =>
  '$' + String(Math.round(monto)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

// Convierte AAAA-MM-DD en DD/MM/AAAA.
export const formatearFecha = (fechaISO) => fechaISO.split('-').reverse().join('/')
