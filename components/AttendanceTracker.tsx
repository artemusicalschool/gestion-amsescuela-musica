
import React, { useState } from 'react';
import { Student, StudentStatus, Teacher, AttendanceRecord, ClassModality, ClassCategory } from '../types';
import { Check, X, Calendar as CalendarIcon, User, Music, Info, AlertCircle, Users as UsersIcon } from 'lucide-react';

interface Props {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  teachers: Teacher[];
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
}

const AttendanceTracker: React.FC<Props> = ({ students, setStudents, teachers, attendance, setAttendance }) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers.length > 0 ? teachers[0].id : '');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  const activeStudents = students.filter(s => s.status === StudentStatus.ACTIVE);

  const toggleAttendance = (studentId: string, status: 'present' | 'absent', modality: ClassModality) => {
    if (!selectedTeacherId) {
      alert("Por favor, seleccione un profesor primero.");
      return;
    }

    const student = students.find(s => s.id === studentId);
    if (!student) return;

    // Intentar encontrar el detalle del plan del alumno para esta categoría
    const plan = student.enrollments.find(e => e.category === modality);

    const exists = attendance.find(a => a.studentId === studentId && a.date === currentDate && a.modality === modality);
    
    if (exists) {
      setAttendance(attendance.map(a => a.id === exists.id ? { ...a, status } : a));
    } else {
      const newRecord: AttendanceRecord = {
        id: Math.random().toString(36).substr(2, 9),
        studentId,
        teacherId: selectedTeacherId,
        date: currentDate,
        status,
        modality,
        classType: plan?.type,
        duration: plan?.duration,
        ensambleType: plan?.ensambleType
      };
      setAttendance([...attendance, newRecord]);
    }

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const newConsecutive = status === 'absent' ? s.consecutiveAbsences + 1 : 0;
        return { ...s, consecutiveAbsences: newConsecutive };
      }
      return s;
    }));
  };

  if (teachers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 glass rounded-[4rem] border-2 border-dashed border-ams-peach/50 mt-10">
        <AlertCircle size={48} className="text-ams-orange opacity-40 mb-4" />
        <h3 className="text-xl font-display font-black text-ams-brown/30 uppercase tracking-widest">No hay profesores registrados</h3>
        <p className="text-xs font-bold text-ams-brown/20 uppercase tracking-widest mt-2 max-w-xs text-center">Para tomar asistencia, primero debe registrar al menos un profesor con sus honorarios configurados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl font-display font-black text-ams-dark tracking-tighter">Asistencia</h2>
          <p className="text-ams-brown/40 font-bold uppercase text-[10px] tracking-[0.4em] mt-3 flex items-center gap-2">
            <CalendarIcon size={14} className="text-ams-orange" /> REGISTRO DIARIO ACADÉMICO
          </p>
        </div>
      </div>

      <div className="glass p-8 rounded-[3rem] shadow-soft border border-white/60 flex flex-col md:flex-row gap-8 items-end bg-white/30">
        <div className="flex-1 space-y-3 w-full">
          <label className="text-[11px] font-black text-ams-brown/40 uppercase tracking-widest pl-4 flex items-center gap-2">
            <User size={14} className="text-ams-orange" /> Profesor a cargo
          </label>
          <select 
            value={selectedTeacherId} 
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="w-full bg-white border-none rounded-2xl px-6 py-4 font-bold text-ams-dark ring-1 ring-ams-peach focus:ring-2 focus:ring-ams-orange transition-all outline-none"
          >
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.instrument})</option>)}
          </select>
        </div>
        <div className="flex-1 space-y-3 w-full">
          <label className="text-[11px] font-black text-ams-brown/40 uppercase tracking-widest pl-4 flex items-center gap-2">
            <CalendarIcon size={14} className="text-ams-orange" /> Fecha de clase
          </label>
          <input 
            type="date" 
            value={currentDate} 
            onChange={(e) => setCurrentDate(e.target.value)}
            className="w-full bg-white border-none rounded-2xl px-6 py-4 font-bold text-ams-dark ring-1 ring-ams-peach focus:ring-2 focus:ring-ams-orange transition-all outline-none"
          />
        </div>
        <div className="bg-ams-orange/5 p-5 rounded-[2rem] border border-ams-orange/20 flex items-center gap-4 w-full md:w-fit">
          <Info className="text-ams-orange" size={24} />
          <p className="text-[10px] font-bold text-ams-brown/60 uppercase leading-tight">
            El sistema calculará el sueldo del profesor <br/> según la modalidad específica del alumno.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeStudents.length > 0 ? activeStudents.map(student => {
          const isCritical = student.consecutiveAbsences >= 2;

          return (
            <div key={student.id} className={`glass p-6 rounded-[2.5rem] border transition-all duration-300 group hover:shadow-xl ${isCritical ? 'border-rose-200 bg-rose-50/20' : 'border-white/60'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display font-black text-white shadow-lg transition-transform group-hover:rotate-6 ${isCritical ? 'bg-rose-500' : 'bg-ams-dark'}`}>
                    {student.firstName[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-ams-dark text-lg leading-tight">{student.firstName} {student.lastName}</h4>
                    <p className="text-[9px] text-ams-orange font-black uppercase tracking-widest flex items-center gap-1 mt-1">
                      <Music size={10} /> {student.instrument}
                    </p>
                  </div>
                </div>
                {isCritical && (
                  <div className="p-2 bg-rose-500 text-white rounded-xl animate-pulse shadow-lg shadow-rose-200">
                    <AlertCircle size={14} />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-[9px] text-ams-brown/30 font-black uppercase tracking-widest pl-2">Modalidades Registradas</p>
                <div className="space-y-3">
                  {student.modalities.length > 0 ? student.modalities.map(mod => {
                    const modRecord = attendance.find(a => a.studentId === student.id && a.date === currentDate && a.modality === mod);
                    const plan = student.enrollments.find(e => e.category === mod);
                    
                    return (
                      <div key={mod} className="flex items-center justify-between p-3.5 bg-white/60 rounded-2xl border border-ams-peach/30 group/item hover:bg-white transition-all shadow-sm">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-ams-dark uppercase">{mod}</span>
                          {plan && (
                            <span className="text-[8px] font-bold text-ams-brown/40 uppercase tracking-tighter">
                              {plan.type || plan.ensambleType} · {plan.duration || 'N/A'}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => toggleAttendance(student.id, 'present', mod)}
                            className={`p-2.5 rounded-xl transition-all active:scale-90 ${modRecord?.status === 'present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-ams-cream text-ams-brown/20 hover:text-emerald-500 hover:bg-emerald-50'}`}
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            onClick={() => toggleAttendance(student.id, 'absent', mod)}
                            className={`p-2.5 rounded-xl transition-all active:scale-90 ${modRecord?.status === 'absent' ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-ams-cream text-ams-brown/20 hover:text-rose-500 hover:bg-rose-50'}`}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="p-4 bg-ams-cream/50 rounded-2xl border border-dashed border-ams-peach/50 text-center">
                      <p className="text-[8px] font-black text-ams-brown/30 uppercase">Sin modalidades activas</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-20 text-center opacity-30">
            <UsersIcon size={64} className="mx-auto mb-4" />
            <p className="text-xl font-display font-black uppercase tracking-widest">No hay alumnos activos registrados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTracker;
