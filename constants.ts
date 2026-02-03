
import { ClassCategory, ClassType, ClassDuration } from './types';

export const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

export const INSTRUMENTS = [
  'Piano',
  'Batería',
  'Guitarra',
  'Bajo',
  'Ukelele',
  'Producción Musical',
  'Grabación',
  'Ensamble',
  'Canto'
];

export const PRICING_TABLE = {
  INSCRIPCION: {
    INDIVIDUAL: 55000,
    FAMILIAR: 70900
  },
  COMBOS: {
    INDIVIDUAL: { '30 min': 104750, '45 min': 130660, '60 min': 162400 },
    DUPLA: { '30 min': 87175, '45 min': 103100, '60 min': 129400 }
  },
  SUELTAS: {
    INDIVIDUAL: { '30 min': 29500, '45 min': 36100, '60 min': 44500 },
    DUPLA: { '30 min': 23900, '45 min': 29300, '60 min': 35700 }
  },
  ENSAMBLES: {
    ADICIONAL: 77800,
    ADICIONAL_EP: 71100,
    UNICA: 102690,
    UNICA_EP: 93650,
    ADICIONAL_SUELTA: 22600,
    UNICA_SUELTA: 28800
  },
  PRACTICA: {
    '30 min': 20000,
    '45 min': 25000,
    '60 min': 30000
  }
};

export const INITIAL_STUDENTS = [];
export const INITIAL_TEACHERS = [];
