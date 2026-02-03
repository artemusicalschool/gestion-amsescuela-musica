
import React, { useState } from 'react';
import { Teacher, AttendanceRecord, ClassCategory } from '../types';
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
  ShieldCheck
} from 'lucide-react';

interface Props {
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  attendance: AttendanceRecord[];
  onAddClick: () => void;
}

const TeacherManagement: React.FC<Props> = ({ teachers, setTeachers, attendance }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.instrument.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteTeacher = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${name}?\n\nEsta acción es permanente.`)) {
      setTeachers(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleSaveTeacher = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const rates: any = {};
    Object.values(ClassCategory).forEach(cat => {
      rates[cat] = parseFloat(formData.get(`rate_${cat}`) as string) || 0;
    });

    const teacherData: Partial<Teacher> = {
      name: formData.get('name') as string,
      instrument: formData.get('instrument') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      rates: rates as { [key in ClassCategory]: number },
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
    }

    setShowModal(false);
    setEditingTeacher(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-black text-ams-dark tracking-tight">Staff Docente</h2>
            <p className="text-ams-brown/70 font-medium uppercase text-[10px] tracking-widest font-bold">Administración de Profesores y Especialidades</p>
          </div>
          <button 
            onClick={() => { setEditingTeacher(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-ams-orange text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-ams-orange/20 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
          >
            <UserPlus size={18} />
            Agregar nuevo docente
          </button>
        </div>
        <div className="flex gap-4 bg-white p-3 rounded-2xl border border-ams-peach/50 w-full md:w-96 shadow-sm focus-within:ring-2 focus-within:ring-ams-orange transition-all">
          <Search size={20} className="text-ams-orange mt-0.5" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o instrumento..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-full font-bold placeholder:text-ams-brown/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.length > 0 ? filteredTeachers.map(teacher => {
          const teacherClasses = attendance.filter(a => a.teacherId === teacher.id && a.status === 'present').length;
          
          return (
            <div key={teacher.id} className="bg-white rounded-[2.5rem] shadow-sm border border-ams-peach overflow-hidden group hover:shadow-xl hover:shadow-ams-orange/5 transition-all">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 rounded-3xl bg-ams-orange text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-ams-orange/20 rotate-2 group-hover:rotate-0 transition-transform">
                    {teacher.name[0]}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingTeacher(teacher); setShowModal(true); }} className="p-2 text-ams-brown/30 hover:text-ams-orange transition-colors"><Edit3 size={18}/></button>
                    <button onClick={() => deleteTeacher(teacher.id, teacher.name)} className="p-2 text-ams-brown/30 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-black text-ams-dark">{teacher.name}</h3>
                  <div className="flex items-center gap-2 text-ams-orange mt-1">
                    <Music size={14} className="font-bold" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{teacher.instrument}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-ams-brown/60">
                    <div className="w-8 h-8 rounded-xl bg-ams-peach/30 flex items-center justify-center"><Phone size={14} /></div>
                    <span className="text-xs font-bold">{teacher.phone || 'Sin teléfono'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-ams-brown/60">
                    <div className="w-8 h-8 rounded-xl bg-ams-peach/30 flex items-center justify-center"><Mail size={14} /></div>
                    <span className="text-xs font-bold truncate">{teacher.email || 'Sin correo'}</span>
                  </div>
                </div>

                <div className="space-y-3">
                   <p className="text-[9px] font-black text-ams-brown/40 uppercase tracking-widest mb-1">Tarifas por Clase</p>
                   <div className="grid grid-cols-2 gap-2">
                     {Object.entries(teacher.rates).map(([mod, rate]) => (
                       <div key={mod} className="bg-ams-peach/10 px-3 py-2 rounded-xl border border-ams-peach/30 flex flex-col">
                          <span className="text-[8px] font-bold text-ams-brown/50 truncate uppercase">{mod}</span>
                          <span className="text-xs font-black text-ams-dark">${rate.toLocaleString()}</span>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
              
              <div className="bg-ams-dark p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Activo</span>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/50">{teacherClasses} clases dictadas</div>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-24 text-center">
            <div className="bg-ams-peach/20 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Briefcase size={40} className="text-ams-orange opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-ams-brown/50 italic">No se encontraron profesores registrados.</h3>
          </div>
        )}
      </div>

      {/* MODAL DE REGISTRO / EDICIÓN */}
      {showModal && (
        <div className="fixed inset-0 bg-ams-dark/60 backdrop-blur-md flex items-center justify-center z-[130] p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl my-8 overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="bg-ams-dark p-10 text-white relative">
              <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 hover:rotate-90 transition-transform"><X size={32} /></button>
              <h3 className="text-4xl font-black tracking-tight">{editingTeacher ? 'Editar Profesor' : 'Nuevo Profesor'}</h3>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-2">Configuración de Staff y Honorarios</p>
            </div>
            
            <form onSubmit={handleSaveTeacher} className="p-10 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-ams-orange font-black text-xs uppercase tracking-widest border-b border-ams-peach pb-4">
                  <UserPlus size={18} /> Información Personal
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Nombre Completo" name="name" required defaultValue={editingTeacher?.name} />
                  <div className="flex flex-col">
                    <label className="block text-[10px] font-black text-ams-brown/50 uppercase tracking-widest mb-2">Especialidad</label>
                    <select name="instrument" required defaultValue={editingTeacher?.instrument} className="w-full bg-[#FDF6F2] border-none rounded-2xl px-5 py-4 font-black text-ams-dark ring-1 ring-ams-peach outline-none focus:ring-2 focus:ring-ams-orange transition-all">
                      {INSTRUMENTS.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                    </select>
                  </div>
                  <InputGroup label="WhatsApp" name="phone" defaultValue={editingTeacher?.phone} placeholder="54911..." />
                  <InputGroup label="Email" name="email" type="email" defaultValue={editingTeacher?.email} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-emerald-600 font-black text-xs uppercase tracking-widest border-b border-ams-peach pb-4">
                  <DollarSign size={18} /> Honorarios por Clase (Liquidación)
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.values(ClassCategory).map(cat => (
                    <div key={cat} className="space-y-2">
                      <label className="block text-[8px] font-black text-ams-brown/40 uppercase tracking-tight truncate">{cat}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ams-brown/30 font-bold">$</span>
                        <input 
                          type="number" 
                          name={`rate_${cat}`} 
                          required 
                          defaultValue={editingTeacher?.rates[cat] || 0}
                          className="w-full bg-[#FDF6F2] border-none rounded-xl pl-6 pr-3 py-3 text-xs font-black text-ams-dark ring-1 ring-ams-peach focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3">
                  <ShieldCheck className="text-emerald-600 mt-1" size={16} />
                  <p className="text-[9px] font-bold text-emerald-800 leading-relaxed uppercase">
                    Estas tarifas se usarán para calcular automáticamente el sueldo del docente basado en la asistencia marcada como "Presente" en cada modalidad.
                  </p>
                </div>
              </div>

              <button type="submit" className="w-full bg-ams-orange text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all">
                {editingTeacher ? 'Actualizar Docente' : 'Guardar en el Staff'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const InputGroup: React.FC<{ label: string, name: string, type?: string, required?: boolean, defaultValue?: any, placeholder?: string }> = ({ label, name, type = 'text', required, defaultValue, placeholder }) => (
  <div>
    <label className="block text-[10px] font-black text-ams-brown/50 uppercase tracking-widest mb-2">{label}</label>
    <input 
      type={type} 
      name={name} 
      defaultValue={defaultValue} 
      placeholder={placeholder} 
      required={required} 
      className="w-full bg-[#FDF6F2] border-none rounded-2xl px-5 py-4 text-sm font-black text-ams-dark ring-1 ring-ams-peach/50 focus:ring-2 focus:ring-ams-orange outline-none transition-all" 
    />
  </div>
);

export default TeacherManagement;
