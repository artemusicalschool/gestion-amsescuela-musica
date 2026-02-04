
import React, { useState } from 'react';
import { Teacher, AttendanceRecord, ClassCategory, ClassType, ClassDuration, EnsambleType } from '../types';
import { INSTRUMENTS } from '../constants';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Music, 
  Trash2, 
  Edit3, 
  UserPlus, 
  Briefcase, 
  X, 
  DollarSign,
  ShieldCheck,
  ChevronDown,
  UserCheck,
  Award,
  Layers,
  Clock,
  Users as UsersIcon
} from 'lucide-react';

interface Props {
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  attendance: AttendanceRecord[];
  onAddClick: () => void;
}

const TeacherManagement: React.FC<Props> = ({ teachers, setTeachers, attendance }) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);

  const deleteTeacher = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${name}?\n\nEsta acción es permanente.`)) {
      setTeachers(prev => prev.filter(t => t.id !== id));
      if (selectedTeacherId === id) setSelectedTeacherId('');
    }
  };

  const handleSaveTeacher = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Capturar todos los honorarios específicos
    const rates: Record<string, number> = {};
    formData.forEach((value, key) => {
      if (key.startsWith('rate_')) {
        rates[key.replace('rate_', '')] = parseFloat(value as string) || 0;
      }
    });

    const teacherData: Partial<Teacher> = {
      name: formData.get('name') as string,
      instrument: formData.get('instrument') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      rates,
      status: 'activo'
    };

    if (editingTeacher) {
      setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? { ...t, ...teacherData } as Teacher : t));
    } else {
      const newTeacher: Teacher = {
        id: Math.random().toString(36).substr(2, 9),
        ...teacherData as Omit<Teacher, 'id'>
      };
      setTeachers(prev => [...prev, newTeacher]);
      setSelectedTeacherId(newTeacher.id);
    }

    setShowModal(false);
    setEditingTeacher(null);
  };

  const teacherClasses = selectedTeacher ? attendance.filter(a => a.teacherId === selectedTeacher.id && a.status === 'present').length : 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl font-display font-black text-ams-dark tracking-tighter">Cuerpo Docente</h2>
          <p className="text-ams-brown/40 font-bold uppercase text-[10px] tracking-[0.4em] mt-3 flex items-center gap-2">
            <Briefcase size={14} className="text-ams-orange" /> ADMINISTRACIÓN DE TALENTO AMS
          </p>
        </div>
        <button 
          onClick={() => { setEditingTeacher(null); setShowModal(true); }}
          className="btn-main group flex items-center gap-3 bg-ams-orange text-white px-10 py-5 rounded-4xl font-bold text-sm uppercase tracking-widest shadow-orange-glow border border-white/20 active:scale-95 transition-all"
        >
          <UserPlus size={20} className="group-hover:rotate-12 transition-transform" /> Registrar Profesor
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="glass p-8 rounded-[3rem] shadow-soft border border-white/60">
          <label className="block text-[11px] font-black text-ams-brown/40 uppercase tracking-[0.3em] mb-4 pl-4">Seleccione un profesor para gestionar</label>
          <div className="relative">
            <select 
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full bg-ams-cream/50 border-none rounded-[2rem] px-8 py-6 font-display font-black text-ams-dark text-xl ring-2 ring-ams-peach/40 focus:ring-ams-orange outline-none appearance-none transition-all shadow-inner cursor-pointer"
            >
              <option value="" disabled>— Seleccionar de la lista —</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name.toUpperCase()} — {t.instrument}</option>
              ))}
            </select>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-ams-orange">
              <ChevronDown size={28} />
            </div>
          </div>
        </div>

        {selectedTeacher ? (
          <div className="animate-in slide-in-from-top-4 fade-in duration-500">
            <div className="bg-white rounded-[4rem] shadow-2xl border border-ams-peach overflow-hidden group">
              <div className="p-12">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="w-32 h-32 rounded-[3rem] bg-ams-dark text-white flex items-center justify-center text-5xl font-display font-black shadow-2xl shadow-ams-dark/20 rotate-3 group-hover:rotate-0 transition-transform">
                      {selectedTeacher.name[0]}
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-4xl font-display font-black text-ams-dark tracking-tighter leading-none">{selectedTeacher.name}</h3>
                      <div className="flex items-center justify-center sm:justify-start gap-3 text-ams-orange mt-4">
                        <Award size={20} className="font-bold" />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">{selectedTeacher.instrument}</span>
                      </div>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-ams-cream rounded-full border border-ams-peach/30">
                          <Phone size={14} className="text-ams-brown/40" />
                          <span className="text-[10px] font-bold text-ams-brown">{selectedTeacher.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-ams-cream rounded-full border border-ams-peach/30">
                          <Mail size={14} className="text-ams-brown/40" />
                          <span className="text-[10px] font-bold text-ams-brown">{selectedTeacher.email || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 w-full lg:w-auto">
                    <button 
                      onClick={() => { setEditingTeacher(selectedTeacher); setShowModal(true); }} 
                      className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-white border-2 border-ams-peach text-ams-brown px-8 py-4 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-ams-peach/20 transition-all shadow-sm"
                    >
                      <Edit3 size={18} /> Editar Perfil
                    </button>
                    <button 
                      onClick={() => deleteTeacher(selectedTeacher.id, selectedTeacher.name)} 
                      className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-rose-50 border-2 border-rose-100 text-rose-500 px-8 py-4 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 size={18} /> Dar de Baja
                    </button>
                  </div>
                </div>

                <div className="mt-16 space-y-12">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-px bg-ams-peach"></div>
                      <h4 className="text-[11px] font-black text-ams-brown/40 uppercase tracking-[0.3em]">Honorarios Académicos</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                      <SummaryRateSection title="🎸 Combos Mensuales" teacher={selectedTeacher} category={ClassCategory.COMBO} />
                      <SummaryRateSection title="🎵 Clases Sueltas" teacher={selectedTeacher} category={ClassCategory.SUELTA} />
                      <SummaryRateSection title="🤝 Ensambles" teacher={selectedTeacher} category={ClassCategory.ENSAMBLE} single />
                      <SummaryRateSection title="🎹 Práctica" teacher={selectedTeacher} category={ClassCategory.PRACTICA} single />
                    </div>
                </div>
              </div>

              <div className="bg-ams-cream/50 p-6 flex items-center justify-center gap-3 border-t border-ams-peach/20">
                <ShieldCheck size={18} className="text-ams-orange/40" />
                <p className="text-[9px] font-bold text-ams-brown/40 uppercase tracking-[0.1em]">Configuración de liquidación dinámica habilitada</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-32 text-center glass rounded-[4rem] border-2 border-dashed border-ams-peach/50 flex flex-col items-center">
            <div className="w-24 h-24 rounded-[2rem] bg-ams-peach/10 flex items-center justify-center text-ams-orange mb-8 opacity-40">
              <Briefcase size={48} />
            </div>
            <h3 className="text-xl font-display font-black text-ams-brown/30 uppercase tracking-widest">Seleccione un profesor para ver su ficha</h3>
            <p className="text-xs font-bold text-ams-brown/20 uppercase tracking-widest mt-4">Gestione honorarios específicos por cada modalidad de clase</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-ams-dark/60 backdrop-blur-xl flex items-center justify-center z-[130] p-4 overflow-hidden" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-[3.5rem] w-full max-w-4xl h-fit max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/50" onClick={e => e.stopPropagation()}>
            <div className="bg-ams-dark p-12 text-white relative shrink-0">
              <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 p-3 bg-white/10 rounded-2xl text-white/40 hover:text-white transition-all hover:rotate-90"><X size={32} /></button>
              <h3 className="text-5xl font-display font-black tracking-tighter uppercase">{editingTeacher ? 'Actualizar Ficha' : 'Nuevo Profesor'}</h3>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] mt-3">CONFIGURACIÓN DE TALENTO Y HONORARIOS AMS</p>
            </div>
            
            <form onSubmit={handleSaveTeacher} className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup label="Nombre Completo" name="name" required defaultValue={editingTeacher?.name} placeholder="Ej: Dr. Roberto Gómez" />
                <div className="flex flex-col space-y-4">
                  <label className="block text-[11px] font-black text-ams-brown/40 uppercase tracking-widest pl-4">Especialidad</label>
                  <select name="instrument" required defaultValue={editingTeacher?.instrument} className="w-full bg-ams-cream/40 border-none rounded-[2rem] px-8 py-6 font-bold text-ams-dark ring-1 ring-ams-peach/40 focus:ring-2 focus:ring-ams-orange outline-none transition-all shadow-inner">
                    {INSTRUMENTS.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-10">
                <div className="flex items-center gap-4 text-ams-orange">
                  <div className="w-10 h-1 rounded-full bg-ams-orange"></div>
                  <span className="text-[12px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                    <DollarSign size={16} /> Esquema de Pagos por Clase Dictada
                  </span>
                </div>

                <div className="space-y-8">
                  {/* Combos */}
                  <RateEditorSection 
                    title="🎸 Combos Mensuales" 
                    prefix="COMBO"
                    teacher={editingTeacher}
                    hasType 
                  />
                  
                  {/* Clases Sueltas */}
                  <RateEditorSection 
                    title="🎵 Clases Sueltas" 
                    prefix="SUELTA"
                    teacher={editingTeacher}
                    hasType 
                  />

                  {/* Ensambles */}
                  <div className="bg-ams-cream/30 p-8 rounded-[2.5rem] border border-ams-peach/20 space-y-6">
                    <h5 className="text-[11px] font-black text-ams-brown/40 uppercase tracking-widest flex items-center gap-3">
                      <Layers size={16} className="text-ams-orange" /> Honorarios Ensambles
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.values(EnsambleType).map(eType => (
                        <div key={eType} className="space-y-2">
                          <label className="text-[9px] font-black text-ams-brown/40 uppercase pl-2">{eType}</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ams-orange font-black text-xs">$</span>
                            <input 
                              type="number" 
                              name={`rate_ENSAMBLE_${eType}`} 
                              defaultValue={editingTeacher?.rates[`ENSAMBLE_${eType}`] || 0}
                              className="w-full bg-white border-none rounded-2xl pl-8 pr-4 py-4 text-xs font-black text-ams-dark ring-1 ring-ams-peach/40 focus:ring-2 focus:ring-ams-orange outline-none transition-all"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Práctica */}
                  <div className="bg-ams-cream/30 p-8 rounded-[2.5rem] border border-ams-peach/20 space-y-6">
                    <h5 className="text-[11px] font-black text-ams-brown/40 uppercase tracking-widest flex items-center gap-3">
                      <Clock size={16} className="text-ams-orange" /> Honorarios Práctica
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {Object.values(ClassDuration).map(dur => (
                        <div key={dur} className="space-y-2">
                          <label className="text-[9px] font-black text-ams-brown/40 uppercase pl-2">{dur}</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ams-orange font-black text-xs">$</span>
                            <input 
                              type="number" 
                              name={`rate_PRACTICA_${dur}`} 
                              defaultValue={editingTeacher?.rates[`PRACTICA_${dur}`] || 0}
                              className="w-full bg-white border-none rounded-2xl pl-8 pr-4 py-4 text-xs font-black text-ams-dark ring-1 ring-ams-peach/40 focus:ring-2 focus:ring-ams-orange outline-none transition-all"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-ams-peach/20 flex gap-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-8 py-6 rounded-3xl font-black text-ams-brown/40 bg-ams-cream/50 hover:bg-ams-cream transition-all text-[11px] uppercase tracking-widest">Descartar</button>
                <button type="submit" className="flex-1 bg-ams-dark text-white px-8 py-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] shadow-dark-glow border border-white/10">
                  {editingTeacher ? 'Confirmar Cambios' : 'Registrar Profesor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryRateSection: React.FC<{ title: string, teacher: Teacher, category: ClassCategory, single?: boolean }> = ({ title, teacher, category, single }) => {
  const prefix = category === ClassCategory.COMBO ? 'COMBO' : category === ClassCategory.SUELTA ? 'SUELTA' : category === ClassCategory.ENSAMBLE ? 'ENSAMBLE' : 'PRACTICA';
  
  return (
    <div className="space-y-4">
      <h5 className="text-[10px] font-black text-ams-orange uppercase tracking-widest pl-2">{title}</h5>
      <div className="space-y-2">
        {category === ClassCategory.COMBO || category === ClassCategory.SUELTA ? (
          <>
            {Object.values(ClassType).map(type => (
              <div key={type} className="flex items-center gap-2">
                <span className="text-[8px] font-black text-ams-brown/30 uppercase min-w-[60px]">{type}</span>
                <div className="flex-1 grid grid-cols-3 gap-2">
                  {Object.values(ClassDuration).map(dur => (
                    <div key={dur} className="bg-ams-cream/40 p-3 rounded-xl border border-ams-peach/30 text-center">
                      <p className="text-[7px] font-bold text-ams-brown/40 uppercase mb-1">{dur}</p>
                      <p className="text-xs font-black text-ams-dark">${(teacher.rates[`${prefix}_${type.toUpperCase()}_${dur}`] || 0).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : category === ClassCategory.ENSAMBLE ? (
          <div className="grid grid-cols-2 gap-2">
            {Object.values(EnsambleType).map(eType => (
              <div key={eType} className="bg-ams-cream/40 p-4 rounded-xl border border-ams-peach/30 flex justify-between items-center">
                <span className="text-[8px] font-black text-ams-brown/40 uppercase">{eType}</span>
                <span className="text-xs font-black text-ams-dark">${(teacher.rates[`ENSAMBLE_${eType}`] || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {Object.values(ClassDuration).map(dur => (
              <div key={dur} className="bg-ams-cream/40 p-4 rounded-xl border border-ams-peach/30 text-center">
                <p className="text-[7px] font-bold text-ams-brown/40 uppercase mb-1">{dur}</p>
                <p className="text-xs font-black text-ams-dark">${(teacher.rates[`PRACTICA_${dur}`] || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const RateEditorSection: React.FC<{ title: string, prefix: string, teacher: Teacher | null, hasType?: boolean }> = ({ title, prefix, teacher, hasType }) => (
  <div className="bg-ams-cream/30 p-8 rounded-[2.5rem] border border-ams-peach/20 space-y-6">
    <h5 className="text-[11px] font-black text-ams-brown/40 uppercase tracking-widest flex items-center gap-3">
      {prefix === 'COMBO' ? <Layers size={16} className="text-ams-orange" /> : <Clock size={16} className="text-ams-orange" />} {title}
    </h5>
    
    <div className="space-y-6">
      {Object.values(ClassType).map(type => (
        <div key={type} className="space-y-4">
          <div className="flex items-center gap-3 pl-2">
            <UsersIcon size={12} className="text-ams-brown/20" />
            <span className="text-[9px] font-black text-ams-brown/30 uppercase tracking-widest">Modalidad {type}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(ClassDuration).map(dur => (
              <div key={dur} className="space-y-2">
                <label className="text-[9px] font-black text-ams-brown/40 uppercase pl-2">{dur}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ams-orange font-black text-xs">$</span>
                  <input 
                    type="number" 
                    name={`rate_${prefix}_${type.toUpperCase()}_${dur}`} 
                    defaultValue={teacher?.rates[`${prefix}_${type.toUpperCase()}_${dur}`] || 0}
                    className="w-full bg-white border-none rounded-2xl pl-8 pr-4 py-4 text-xs font-black text-ams-dark ring-1 ring-ams-peach/40 focus:ring-2 focus:ring-ams-orange outline-none transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const InputGroup: React.FC<{ label: string, name: string, type?: string, required?: boolean, defaultValue?: any, placeholder?: string }> = ({ label, name, type = 'text', required, defaultValue, placeholder }) => (
  <div className="space-y-4">
    <label className="block text-[11px] font-black text-ams-brown/40 uppercase tracking-widest pl-4">{label}</label>
    <input 
      type={type} 
      name={name} 
      defaultValue={defaultValue} 
      placeholder={placeholder} 
      required={required} 
      className="w-full bg-ams-cream/40 border-none rounded-[2rem] px-8 py-6 text-base font-bold text-ams-dark ring-1 ring-ams-peach/40 focus:ring-2 focus:ring-ams-orange outline-none transition-all shadow-inner" 
    />
  </div>
);

export default TeacherManagement;
