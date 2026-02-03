
export enum ClassCategory {
  COMBO = 'Combo (Mes)',
  SUELTA = 'Clase Suelta',
  ENSAMBLE = 'Ensamble',
  PRACTICA = 'Práctica'
}

export enum EnsambleType {
  ADICIONAL = 'Adicional',
  UNICA = 'Única Actividad',
  ADICIONAL_SUELTA = 'Adicional Suelta',
  UNICA_SUELTA = 'Única Act. Suelta'
}

export const ClassModality = ClassCategory;
export type ClassModality = ClassCategory;

export enum ClassType {
  INDIVIDUAL = 'Individual',
  DUPLA = 'Dupla'
}

export enum ClassDuration {
  MIN_30 = '30 min',
  MIN_45 = '45 min',
  MIN_60 = '60 min'
}

export enum StudentStatus {
  ACTIVE = 'Activo',
  INACTIVE = 'Inactivo'
}

export interface Enrollment {
  id: string;
  category: ClassCategory;
  type?: ClassType;
  duration?: ClassDuration;
  ensambleType?: EnsambleType;
  price: number;
  date: string; // ISO string para ordenamiento
}

export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  metadata?: {
    studentId?: string;
    method?: string;
  };
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  instrument: string;
  teacherId?: string; // Campo para el profesor asignado
  phone: string;
  email: string;
  status: StudentStatus;
  enrollments: Enrollment[];
  modalities: ClassModality[];
  notes: string;
  debt: number;
  consecutiveAbsences: number;
  fatherName?: string;
  fatherPhone?: string;
  motherName?: string;
  motherPhone?: string;
  responsibleName?: string;
  responsiblePhone?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  status: 'present' | 'absent';
  modality: string;
}

export interface Teacher {
  id: string;
  name: string;
  instrument: string;
  rates: {
    [key in ClassCategory]: number;
  };
  phone?: string;
  email?: string;
  status?: 'activo' | 'inactivo';
}

export interface SchoolSettings {
  name: string;
  logoUrl: string | null;
}
