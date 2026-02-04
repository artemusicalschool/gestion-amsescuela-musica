
import React from 'react';
import { Teacher, AttendanceRecord, ClassCategory, ClassType, ClassDuration, EnsambleType } from '../types';
import { DollarSign, UserCheck, Calendar, Briefcase, Calculator, Layers, AlertCircle } from 'lucide-react';

interface Props {
  teachers: Teacher[];
  attendance: AttendanceRecord[];
}

const TeacherSalaries: React.FC<Props> = ({ teachers, attendance }) => {
  // Helper para obtener el honorario exacto
  const getRateForClass = (teacher: Teacher, record: AttendanceRecord): number => {
    const { modality, classType, duration, ensambleType } = record;
    
    let rateKey = "";
    if (modality === ClassCategory.COMBO) {
      rateKey = `COMBO_${classType?.toUpperCase()}_${duration}`;
    } else if (modality === ClassCategory.SUELTA) {
      rateKey = `SUELTA_${classType?.toUpperCase()}_${duration}`;
    } else if (modality === ClassCategory.ENSAMBLE) {
      rateKey = `ENSAMBLE_${ensambleType}`;
    } else if (modality === ClassCategory.PRACTICA) {
      rateKey = `PRACTICA_${duration}`;
    }

    return teacher.rates[rateKey] || 0;
  };

  const totalSchoolLiquidation = teachers.reduce((acc, t) => {
    const presentClasses = attendance.filter(a => a.teacherId === t.id && a.status === 'present');
    return acc + presentClasses.reduce((sum, a) => sum + getRateForClass(t, a), 0);
  }, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl font-display font-black text-ams-dark tracking-tighter">Liquidación</h2>
          <p className="text-ams-brown/40 font-bold uppercase text-[10px] tracking-[0.4em] mt-3 flex items-center gap-2">
            <Calculator size={14} className="text-ams-orange" /> NÓMINA DINÁMICA DE HABERES
          </p>
        </div>
        <div className="bg-ams-dark p-8 rounded-[2.5rem] shadow-dark-glow text-white flex items-center gap-6 min-w-[300px] relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12"><DollarSign size={100} /></div>
          <div className="bg-ams-orange/20 p-4 rounded-2xl text-ams-orange">
             <Layers size={32} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-1">Monto Total a Liquidar</p>
            <p className="text-4xl font-display font-black tracking-tighter">${totalSchoolLiquidation.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {teachers.length > 0 ? teachers.map(teacher => {
          const teacherAttendance = attendance.filter(a => a.teacherId === teacher.id && a.status === 'present');
          const totalEarned = teacherAttendance.reduce((acc, a) => acc + getRateForClass(teacher, a), 0);

          return (
            <div key={teacher.id} className="bg-white rounded-[4rem] shadow-xl border border-ams-peach p-12 group transition-all hover:shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-ams-dark text-white flex items-center justify-center font-display font-black text-3xl shadow-lg group-hover:rotate-6 transition-transform">
                    {teacher.name[0]}
                  </div>
                  <div>
                    <h3 className="text-3xl font-display font-black text-ams-dark tracking-tighter leading-none">{teacher.name}</h3>
                    <div className="flex items-center gap-2 text-ams-orange mt-3">
                       <Briefcase size={16} />
                       <span className="text-[10px] font-black uppercase tracking-widest">{teacher.instrument}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right bg-ams-cream/50 px-8 py-5 rounded-[2rem] border border-ams-peach/30 min-w-[180px]">
                   <p className="text-[10px] font-black text-ams-brown/30 uppercase tracking-widest mb-1">Haberes Acumulados</p>
                   <p className="text-4xl font-display font-black text-ams-dark tracking-tighter">${totalEarned.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-ams-peach/20 pb-4">
                  <h4 className="text-[11px] font-black text-ams-brown/40 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={16} /> Registro de Clases Dictadas ({teacherAttendance.length})
                  </h4>
                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">Verificado</span>
                </div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-3 custom-scrollbar">
                  {teacherAttendance.length > 0 ? [...teacherAttendance].reverse().map(a => {
                    const rate = getRateForClass(teacher, a);
                    return (
                      <div key={a.id} className="flex justify-between items-center bg-ams-cream/30 p-5 rounded-[2rem] border border-ams-peach/20 group/item hover:bg-white hover:border-ams-orange/30 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-ams-orange shadow-sm border border-ams-peach/20">
                             <UserCheck size={18} />
                           </div>
                           <div>
                             <span className="block text-[10px] font-black text-ams-dark uppercase">{a.date}</span>
                             <span className="block text-[8px] font-bold text-ams-brown/30 uppercase tracking-tighter">
                               {a.modality} · {a.classType || a.ensambleType} · {a.duration || 'N/A'}
                             </span>
                           </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-xl font-display font-black text-ams-dark tracking-tighter">${rate.toLocaleString()}</span>
                          {rate === 0 && <span className="text-[7px] font-black text-rose-500 uppercase">Sin tarifa configurada</span>}
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="py-16 text-center bg-ams-cream/20 rounded-[3rem] border-2 border-dashed border-ams-peach/30">
                       <AlertCircle size={40} className="mx-auto text-ams-brown/20 mb-4" />
                       <p className="text-xs font-bold text-ams-brown/30 uppercase tracking-widest">No hay clases registradas para este profesor</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-ams-peach/20 flex justify-end">
                 <button className="flex items-center gap-3 bg-ams-orange text-white px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-orange-glow hover:scale-105 active:scale-95 transition-all">
                   <DollarSign size={18} /> Procesar Pago Individual
                 </button>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-32 text-center opacity-20">
             <Briefcase size={80} className="mx-auto mb-6" />
             <h3 className="text-2xl font-display font-black uppercase tracking-widest">No hay profesores para liquidar</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherSalaries;
