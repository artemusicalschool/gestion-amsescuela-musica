
import React from 'react';
import { Teacher, AttendanceRecord, ClassCategory } from '../types';
import { DollarSign, UserCheck, Calendar, Briefcase, Calculator } from 'lucide-react';

interface Props {
  teachers: Teacher[];
  attendance: AttendanceRecord[];
}

const TeacherSalaries: React.FC<Props> = ({ teachers, attendance }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-ams-dark tracking-tight">Liquidación de Haberes</h2>
          <p className="text-ams-brown/70 font-medium uppercase text-[10px] tracking-widest font-black">Cálculo automático de sueldos según clases dictadas</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-ams-peach shadow-sm flex items-center gap-4">
          <Calculator className="text-ams-orange" size={24} />
          <div>
            <p className="text-[8px] font-black text-ams-brown/40 uppercase tracking-widest">Total Staff a Liquidar</p>
            <p className="text-lg font-black text-ams-dark">
              ${teachers.reduce((acc, t) => {
                const presentClasses = attendance.filter(a => a.teacherId === t.id && a.status === 'present');
                return acc + presentClasses.reduce((sum, a) => sum + (t.rates[a.modality as ClassCategory] || 0), 0);
              }, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {teachers.map(teacher => {
          const teacherAttendance = attendance.filter(a => a.teacherId === teacher.id && a.status === 'present');
          const totalEarned = teacherAttendance.reduce((acc, a) => {
            const rate = teacher.rates[a.modality as ClassCategory] || 0;
            return acc + rate;
          }, 0);

          return (
            <div key={teacher.id} className="bg-white rounded-[3rem] shadow-sm border border-ams-peach p-10 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
                <Briefcase size={120} />
              </div>

              <div className="flex items-center gap-6 mb-10">
                <div className="w-20 h-20 rounded-[2rem] bg-ams-dark text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-ams-dark/20 rotate-3">
                  {teacher.name[0]}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-ams-dark">{teacher.name}</h3>
                  <div className="flex items-center gap-2 text-ams-orange font-black text-[10px] uppercase tracking-widest">
                    <UserCheck size={14} /> {teacher.instrument}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                {Object.values(ClassCategory).map(cat => (
                  <div key={cat} className="bg-[#FDF6F2] p-4 rounded-2xl border border-ams-peach/50">
                    <p className="text-[8px] font-black text-ams-brown/40 uppercase tracking-tighter mb-1 truncate">{cat}</p>
                    <p className="text-sm font-black text-ams-dark">${teacher.rates[cat]?.toLocaleString() || '0'}</p>
                  </div>
                ))}
              </div>

              <div className="bg-ams-dark rounded-[2.5rem] p-8 text-white flex items-center justify-between shadow-2xl shadow-ams-dark/30">
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total a Liquidar</p>
                  <p className="text-4xl font-black tracking-tighter">${totalEarned.toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-[10px] font-black text-white/40 uppercase mb-1">{teacherAttendance.length} Clases Dictadas</p>
                  <button className="bg-ams-orange text-white p-4 rounded-2xl hover:scale-110 transition-transform shadow-lg shadow-ams-orange/20">
                    <DollarSign size={24} />
                  </button>
                </div>
              </div>

              <div className="mt-10">
                <div className="flex items-center justify-between border-b border-ams-peach pb-4 mb-4">
                  <h4 className="text-[10px] font-black text-ams-brown/40 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} /> Detalle de Asistencia Presente
                  </h4>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-3 custom-scrollbar">
                  {teacherAttendance.length > 0 ? [...teacherAttendance].reverse().map(a => (
                    <div key={a.id} className="flex justify-between items-center bg-ams-peach/5 p-4 rounded-2xl border border-ams-peach/20 hover:bg-ams-peach/10 transition-colors">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-ams-dark uppercase">{a.date}</span>
                         <span className="text-[8px] font-bold text-ams-brown/50 italic tracking-wider">Verificado por sistema</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px] font-black text-ams-orange uppercase">{a.modality}</span>
                        <span className="block text-xs font-black text-ams-dark">${(teacher.rates[a.modality as ClassCategory] || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="py-8 text-center bg-[#FDF6F2] rounded-3xl border border-dashed border-ams-peach">
                      <p className="text-xs text-ams-brown/40 font-bold italic">No se registran clases dictadas en este período.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherSalaries;
