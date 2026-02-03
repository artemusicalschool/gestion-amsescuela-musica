
import React, { useState } from 'react';
import { Student, StudentStatus, Teacher, AttendanceRecord, ClassModality } from '../types';
import { Check, X, Calendar as CalendarIcon, User, Music, Info, AlertCircle } from 'lucide-react';

interface Props {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  teachers: Teacher[];
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
}

const AttendanceTracker: React.FC<Props> = ({ students, setStudents, teachers, attendance, setAttendance }) => {
  // Handle case where teachers list might be empty initially
  const [selectedTeacher, setSelectedTeacher] = useState<string>(teachers.length > 0 ? teachers[0].id : '');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  const activeStudents = students.filter(s => s.status === StudentStatus.ACTIVE);

  const toggleAttendance = (studentId: string, status: 'present' | 'absent', modality: ClassModality) => {
    if (!selectedTeacher) {
      alert("Por favor, seleccione o registre un profesor primero.");
      return;
    }

    // Check if record exists for today/student/modality
    const exists = attendance.find(a => a.studentId === studentId && a.date === currentDate && a.modality === modality);
    
    if (exists) {
      setAttendance(attendance.map(a => a.id === exists.id ? { ...a, status } : a));
    } else {
      const newRecord: AttendanceRecord = {
        id: Math.random().toString(36).substr(2, 9),
        studentId,
        teacherId: selectedTeacher,
        date: currentDate,
        status,
        modality
      };
      setAttendance([...attendance, newRecord]);
    }

    // Update consecutive absences in students list
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        // This is a simplified logic for consecutive absences across modalities
        const newConsecutive = status === 'absent' ? s.consecutiveAbsences + 1 : 0;
        return { ...s, consecutiveAbsences: newConsecutive };
      }
      return s;
    }));
  };

  if (teachers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
        <AlertCircle size={48} className="text-slate-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-800">No hay profesores registrados</h3>
        <p className="text-slate-500 max-w-xs text-center mt-2">Para tomar asistencia, primero debe registrar al menos un profesor en el sistema.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-semibold text-slate-500 flex items-center gap-2">
            <User size={16} /> Profesor / Encargado
          </label>
          <select 
            value={selectedTeacher} 
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500"
          >
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.instrument})</option>)}
          </select>
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-sm font-semibold text-slate-500 flex items-center gap-2">
            <CalendarIcon size={16} /> Fecha de Clase
          </label>
          <input 
            type="date" 
            value={currentDate} 
            onChange={(e) => setCurrentDate(e.target.value)}
            className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-center gap-3">
          <Info className="text-indigo-600" />
          <p className="text-xs text-indigo-800 font-medium">
            El sistema alertará automáticamente si un alumno falta a 2 clases seguidas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeStudents.length > 0 ? activeStudents.map(student => {
          const isCritical = student.consecutiveAbsences >= 2;

          return (
            <div key={student.id} className={`bg-white p-5 rounded-2xl shadow-sm border ${isCritical ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200'} transition-all hover:shadow-md`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${isCritical ? 'bg-rose-500' : 'bg-indigo-500'}`}>
                    {student.firstName[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{student.firstName} {student.lastName}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Music size={12} /> {student.instrument}
                    </p>
                  </div>
                </div>
                {isCritical && (
                  <span className="bg-rose-100 text-rose-600 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                    ALERTA AUSENCIA
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Marcar Presencia por Modalidad</p>
                <div className="space-y-2">
                  {student.modalities.map(mod => {
                    const modRecord = attendance.find(a => a.studentId === student.id && a.date === currentDate && a.modality === mod);
                    return (
                      <div key={mod} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-xs font-semibold text-slate-600">{mod}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => toggleAttendance(student.id, 'present', mod)}
                            className={`p-1.5 rounded-md transition-all ${modRecord?.status === 'present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-white text-slate-400 hover:bg-emerald-50'}`}
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            onClick={() => toggleAttendance(student.id, 'absent', mod)}
                            className={`p-1.5 rounded-md transition-all ${modRecord?.status === 'absent' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-white text-slate-400 hover:bg-rose-50'}`}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-12 text-center text-slate-400">
            No hay alumnos activos registrados para tomar asistencia.
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTracker;
