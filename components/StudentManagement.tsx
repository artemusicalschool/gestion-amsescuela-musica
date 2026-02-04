
import React, { useState } from 'react';
import { Student, StudentStatus, Transaction, Teacher } from '../types';
import { INSTRUMENTS } from '../constants';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Users,
  ChevronDown,
  ChevronUp,
  Search,
  MessageCircle,
  Briefcase,
  ShieldCheck,
  UserPlus,
  Phone,
  User,
  Heart,
  PlusCircle,
  Contact,
  // Fix: Added missing AlertCircle import from lucide-react
  AlertCircle
} from 'lucide-react';

interface Props {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  transactions: Transaction[];
  teachers: Teacher[];
  onCloudSync: () => void;
  isSyncing: boolean;
}

const StudentManagement: React.FC<Props> = ({ students, setStudents, teachers }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [filter, setFilter] = useState<StudentStatus | 'ALL'>('ALL');
  const [showFamilySection, setShowFamilySection] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(s => {
    const matchesFilter = filter === 'ALL' || s.status === filter;
    const matchesSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSaveStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const studentData = {
      firstName: formData.get('firstName') as string, 
      lastName: formData.get('lastName') as string, 
      age: parseInt(formData.get('age') as string), 
      instrument: formData.get('instrument') as string, 
      teacherId: formData.get('teacherId') as string,
      phone: formData.get('phone') as string, 
      email: formData.get('email') as string,
      fatherName: formData.get('fatherName') as string,
      fatherPhone: formData.get('fatherPhone') as string,
      motherName: formData.get('motherName') as string,
      motherPhone: formData.get('motherPhone') as string,
      responsibleName: formData.get('responsibleName') as string,
      responsiblePhone: formData.get('responsiblePhone') as string,
      notes: formData.get('notes') as string,
    };

    if (editingStudent) {
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...studentData } : s));
    } else {
      setStudents(prev => [...prev, { 
        id: Math.random().toString(36).substr(2, 9), ...studentData,
        status: StudentStatus.ACTIVE, enrollments: [], modalities: [], debt: 0, consecutiveAbsences: 0
      } as Student]);
    }
    setShowModal(false); setEditingStudent(null);
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${name}?`)) {
      setStudents(prev => prev.filter(student => student.id !== id));
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h2 className="text-5xl font-display font-black text-ams-dark tracking-tighter">Estudiantes</h2>
          <p className="text-ams-brown/40 font-bold uppercase text-[10px] tracking-[0.4em] mt-3 flex items-center gap-2">
            <Users size={14} className="text-ams-orange" /> DIRECTORIO ACADÉMICO AMS
          </p>
        </div>
        <button 
          onClick={() => { setEditingStudent(null); setShowModal(true); setShowFamilySection(false); }} 
          className="btn-main group flex items-center gap-3 bg-ams-orange text-white px-10 py-5 rounded-4xl font-bold text-sm uppercase tracking-widest shadow-orange-glow border border-white/20 active:scale-95 transition-all"
        >
          <UserPlus size={20} className="group-hover:rotate-12 transition-transform" /> Registrar Alumno
        </button>
      </div>

      <div className="glass rounded-[3.5rem] overflow-hidden shadow-soft border border-white/60">
        <div className="p-6 md:p-8 border-b border-ams-peach/20 flex flex-wrap gap-6 items-center justify-between bg-white/30">
          <div className="flex gap-2 bg-white/60 p-1.5 rounded-full border border-ams-peach/10 shadow-inner">
            <FilterButton active={filter === 'ALL'} onClick={() => setFilter('ALL')}>Todos ({students.length})</FilterButton>
            <FilterButton active={filter === StudentStatus.ACTIVE} onClick={() => setFilter(StudentStatus.ACTIVE)}>Activos</FilterButton>
            <FilterButton active={filter === StudentStatus.INACTIVE} onClick={() => setFilter(StudentStatus.INACTIVE)}>Inactivos</FilterButton>
          </div>
          <div className="flex-1 max-w-lg flex items-center gap-4 bg-white/80 px-8 py-3.5 rounded-full border border-ams-peach/30 focus-within:ring-2 focus-within:ring-ams-orange/40 focus-within:bg-white transition-all shadow-inner">
            <Search size={20} className="text-ams-orange opacity-60" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, apellido o ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm font-bold outline-none border-none bg-transparent placeholder:text-ams-brown/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="text-[10px] uppercase text-ams-brown/40 font-black tracking-[0.25em] bg-ams-peach/5 border-b border-ams-peach/10">
                <th className="px-10 py-6">Alumno</th>
                <th className="px-6 py-6">Especialidad</th>
                <th className="px-6 py-6">Profesor</th>
                <th className="px-6 py-6">Balance</th>
                <th className="px-10 py-6 text-right">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ams-peach/10">
              {filteredStudents.map(student => {
                const teacher = teachers.find(t => t.id === student.teacherId);
                return (
                  <tr key={student.id} className="hover:bg-white/50 transition-all duration-300 group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-ams-dark text-white flex items-center justify-center font-display font-black text-xl shadow-lg group-hover:rotate-3 transition-transform">{student.firstName[0]}</div>
                        <div>
                          <p className="font-bold text-ams-dark text-lg tracking-tight group-hover:text-ams-orange transition-colors">{student.firstName} {student.lastName}</p>
                          <p className="text-[9px] font-bold text-ams-brown/30 uppercase tracking-[0.2em]">ID: {student.id.substring(0,5).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-[9px] font-black text-ams-orange uppercase tracking-widest bg-ams-orange/5 px-3 py-1.5 rounded-xl border border-ams-orange/10">{student.instrument}</span>
                    </td>
                    <td className="px-6 py-6">
                      {teacher ? (
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-ams-peach/20 flex items-center justify-center text-ams-brown"><Briefcase size={14}/></div>
                          <span className="text-xs font-bold text-ams-brown/70">{teacher.name}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-ams-brown/20 italic">No asignado</span>
                      )}
                    </td>
                    <td className="px-6 py-6">
                      <span className={`font-display font-black text-xl tracking-tighter ${student.debt > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        ${student.debt.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-2.5 opacity-40 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => window.open(`https://wa.me/${student.phone}`)} className="p-3 rounded-2xl text-emerald-600 bg-white border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-90"><MessageCircle size={18} /></button>
                         <button onClick={() => { setEditingStudent(student); setShowModal(true); setShowFamilySection(false); }} className="p-3 rounded-2xl text-ams-brown bg-white border border-ams-peach/50 hover:bg-ams-dark hover:text-white transition-all shadow-sm active:scale-90"><Edit3 size={18} /></button>
                         <button onClick={() => handleDeleteStudent(student.id, student.firstName)} className="p-3 rounded-2xl text-rose-400 bg-white border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REDISEÑADO: MÁS ESPACIOSO Y EQUILIBRADO */}
      {showModal && (
        <div className="fixed inset-0 bg-ams-dark/60 backdrop-blur-xl flex items-center justify-center z-[130] p-4 lg:p-12 overflow-hidden" onClick={() => setShowModal(false)}>
          <div className="bg-white/95 backdrop-blur-3xl rounded-[3.5rem] w-full max-w-5xl h-fit max-h-[95vh] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] animate-in zoom-in-95 slide-in-from-top-6 duration-500 border border-white/50 flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="bg-ams-dark p-10 text-white relative flex items-center justify-between shrink-0">
               <div className="absolute top-0 right-0 w-64 h-64 bg-ams-orange/10 blur-[90px] rounded-full pointer-events-none"></div>
               <div className="flex items-center gap-8">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-ams-orange flex items-center justify-center shadow-orange-glow">
                    <UserPlus size={36} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-display font-black tracking-tighter leading-none uppercase">{editingStudent ? 'Actualizar Perfil' : 'Registro de Alumno'}</h3>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] mt-3 flex items-center gap-3">
                      <ShieldCheck size={16} className="text-ams-orange" /> GESTIÓN ACADÉMICA AMS
                    </p>
                  </div>
               </div>
               <button onClick={() => setShowModal(false)} className="bg-white/10 p-5 rounded-3xl hover:bg-white/20 hover:scale-110 active:scale-90 transition-all text-white/40 hover:text-white">
                  <X size={32} />
               </button>
            </div>
            
            <form onSubmit={handleSaveStudent} className="p-10 lg:p-14 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                
                {/* Datos Principales */}
                <div className="md:col-span-2 flex items-center gap-4 text-ams-orange mb-2">
                  <div className="w-10 h-1 rounded-full bg-ams-orange"></div>
                  <span className="text-[12px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                    <User size={16} /> Información del Estudiante
                  </span>
                </div>
                
                <InputGroup label="Nombre(s)" name="firstName" required defaultValue={editingStudent?.firstName} placeholder="Ej: Julián" />
                <InputGroup label="Apellido(s)" name="lastName" required defaultValue={editingStudent?.lastName} placeholder="Ej: Sosa" />
                <InputGroup label="Edad" name="age" type="number" required defaultValue={editingStudent?.age} placeholder="Ej: 21" />
                
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-ams-brown/40 uppercase tracking-widest pl-4">Instrumento de Estudio</label>
                  <select name="instrument" required defaultValue={editingStudent?.instrument} className="w-full bg-ams-cream/40 border-none rounded-[2rem] px-8 py-6 font-bold text-ams-dark ring-1 ring-ams-peach/40 focus:ring-2 focus:ring-ams-orange outline-none transition-all shadow-inner text-base">
                    {INSTRUMENTS.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black text-ams-brown/40 uppercase tracking-widest pl-4">Profesor</label>
                  <select name="teacherId" defaultValue={editingStudent?.teacherId || ""} className="w-full bg-ams-cream/40 border-none rounded-[2rem] px-8 py-6 font-bold text-ams-dark ring-1 ring-ams-peach/40 focus:ring-2 focus:ring-ams-orange outline-none transition-all shadow-inner text-base">
                    <option value="">Seleccionar Profesor...</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name} ({teacher.instrument})</option>
                    ))}
                  </select>
                </div>

                <InputGroup label="WhatsApp Alumno" name="phone" required defaultValue={editingStudent?.phone} placeholder="Ej: 54911..." />
                
                <div className="md:col-span-2">
                   <InputGroup label="Correo Electrónico Personal" name="email" type="email" defaultValue={editingStudent?.email} placeholder="alumno@academia-ams.com" />
                </div>

                {/* DESPLEGABLE DE FAMILIARES: MEJORADO */}
                <div className="md:col-span-2 mt-6">
                   <button 
                    type="button" 
                    onClick={() => setShowFamilySection(!showFamilySection)}
                    className={`w-full flex items-center justify-between p-8 rounded-[2.5rem] border-2 border-dashed transition-all duration-300 group ${showFamilySection ? 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-xl shadow-indigo-100/50' : 'bg-white border-ams-peach/30 text-ams-brown/40 hover:border-ams-orange hover:text-ams-orange shadow-sm'}`}
                   >
                     <div className="flex items-center gap-6">
                       <div className={`p-4 rounded-[1.5rem] transition-all ${showFamilySection ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-ams-peach/10 text-ams-brown/30 group-hover:text-ams-orange group-hover:bg-ams-orange/10'}`}>
                        <Contact size={24} />
                       </div>
                       <div className="text-left">
                        <span className="block text-[11px] font-black uppercase tracking-widest">Contactos de Familia y Emergencia</span>
                        <span className="block text-[9px] font-bold opacity-60 uppercase tracking-tighter mt-1">{showFamilySection ? 'Pulse para minimizar sección' : 'Expandir para registrar Padres, Tutores o Responsables adicionales'}</span>
                       </div>
                     </div>
                     <div className={`transition-transform duration-500 ${showFamilySection ? 'rotate-180' : ''}`}>
                      <ChevronDown size={28} />
                     </div>
                   </button>

                   {showFamilySection && (
                     <div className="mt-10 space-y-10 animate-in slide-in-from-top-6 duration-500">
                        {/* Padre / Tutor Principal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 bg-ams-peach/5 rounded-[3rem] border border-ams-peach/20 relative">
                           <div className="absolute -top-4 left-10 bg-ams-orange text-white px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-ams-orange/20">Contacto de Cobro</div>
                           <InputGroup label="Nombre Padre / Tutor 1" name="fatherName" defaultValue={editingStudent?.fatherName} placeholder="Nombre completo" />
                           <InputGroup label="WhatsApp Tutor" name="fatherPhone" defaultValue={editingStudent?.fatherPhone} placeholder="Ej: 54911..." />
                        </div>

                        {/* Otros Contactos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="p-10 bg-white rounded-[3rem] border border-indigo-100 shadow-soft space-y-6">
                              <div className="flex items-center gap-3 text-indigo-400 mb-2">
                                <Heart size={18} />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] border-b border-indigo-50 pb-2 w-full">Madre / Tutor Secundario</p>
                              </div>
                              <InputGroup label="Nombre Completo" name="motherName" defaultValue={editingStudent?.motherName} compact />
                              <InputGroup label="WhatsApp" name="motherPhone" defaultValue={editingStudent?.motherPhone} compact />
                           </div>
                           <div className="p-10 bg-white rounded-[3rem] border border-rose-100 shadow-soft space-y-6">
                              <div className="flex items-center gap-3 text-rose-400 mb-2">
                                <AlertCircle size={18} />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] border-b border-rose-50 pb-2 w-full">Contacto de Emergencia</p>
                              </div>
                              <InputGroup label="Referencia / Nombre" name="responsibleName" defaultValue={editingStudent?.responsibleName} compact />
                              <InputGroup label="WhatsApp Urgencia" name="responsiblePhone" defaultValue={editingStudent?.responsiblePhone} compact />
                           </div>
                        </div>
                     </div>
                   )}
                </div>

                <div className="md:col-span-2 space-y-4 mt-6">
                  <label className="text-[11px] font-black text-ams-brown/40 uppercase tracking-widest pl-4 flex items-center gap-2">Notas Médicas o Curriculares</label>
                  <textarea name="notes" defaultValue={editingStudent?.notes} rows={3} className="w-full bg-ams-cream/40 border-none rounded-[2rem] px-8 py-6 text-base font-bold text-ams-dark ring-1 ring-ams-peach/40 focus:ring-2 focus:ring-ams-orange outline-none transition-all shadow-inner resize-none min-h-[120px]" placeholder="Ej: El alumno tiene conocimientos previos de teoría, posee asma, etc..." />
                </div>
              </div>

              {/* Acciones Finales */}
              <div className="mt-16 pt-12 border-t border-ams-peach/20 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-[1.5rem] bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner"><ShieldCheck size={28}/></div>
                   <div>
                     <p className="text-[11px] font-black text-ams-brown/40 uppercase tracking-widest leading-relaxed">Registro Encriptado</p>
                     <p className="text-[9px] font-bold text-ams-brown/30 uppercase tracking-tighter">La información será guardada en la base de datos local y sincronizada.</p>
                   </div>
                </div>
                <div className="flex gap-6 w-full md:w-auto">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 md:flex-none px-12 py-6 rounded-3xl font-black text-ams-brown/40 bg-ams-peach/10 hover:bg-ams-peach/20 transition-all text-[11px] uppercase tracking-[0.2em]">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 md:flex-none btn-main bg-ams-dark text-white px-20 py-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] shadow-dark-glow border border-white/10 active:scale-95 transition-all">
                    {editingStudent ? 'Actualizar Ficha' : 'Finalizar Alta'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// COMPONENTE DE GRUPO DE ENTRADA: MÁS ROBUSTO Y EQUILIBRADO
const InputGroup: React.FC<{ label: string, name: string, type?: string, required?: boolean, defaultValue?: any, placeholder?: string, compact?: boolean }> = ({ label, name, type = 'text', required, defaultValue, placeholder, compact }) => (
  <div className="space-y-4">
    <label className={`block font-black text-ams-brown/40 uppercase tracking-widest ${compact ? 'text-[9px] pl-2' : 'text-[11px] pl-4'}`}>{label}</label>
    <input 
      type={type} name={name} defaultValue={defaultValue} placeholder={placeholder} required={required} 
      className={`w-full bg-ams-cream/40 border-none rounded-[2rem] font-bold text-ams-dark ring-1 ring-ams-peach/40 focus:ring-2 focus:ring-ams-orange outline-none transition-all shadow-inner placeholder:text-ams-brown/20 ${compact ? 'px-7 py-5 text-sm' : 'px-8 py-6 text-base'}`} 
    />
  </div>
);

const FilterButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${active ? 'bg-ams-orange text-white shadow-lg scale-[1.03] border border-white/20' : 'text-ams-brown/40 hover:bg-white hover:text-ams-brown/70'}`}>{children}</button>
);

export default StudentManagement;
