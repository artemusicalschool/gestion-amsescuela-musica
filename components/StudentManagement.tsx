
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
  History,
  TrendingUp,
  Banknote,
  CheckCircle2,
  Clock,
  MessageCircle,
  Briefcase
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

const StudentManagement: React.FC<Props> = ({ students, setStudents, transactions, setTransactions, teachers }) => {
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [filter, setFilter] = useState<StudentStatus | 'ALL'>('ALL');
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const modalStudent = students.find(s => s.id === selectedStudentId) || null;

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
    };

    if (editingStudent) {
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...studentData } : s));
    } else {
      setStudents(prev => [...prev, { 
        id: Math.random().toString(36).substr(2, 9), ...studentData,
        status: StudentStatus.ACTIVE, enrollments: [], modalities: [], debt: 0, consecutiveAbsences: 0, notes: "" 
      }]);
    }
    setShowModal(false); setEditingStudent(null);
  };

  const handleDeleteStudent = (id: string, name: string) => {
    const confirmDelete = window.confirm(`¿Estás seguro de ELIMINAR permanentemente a ${name}?\n\nEsta acción quitará al alumno del listado y de la base de datos.`);
    if (confirmDelete) {
      setStudents(prev => prev.filter(student => student.id !== id));
      if (selectedStudentId === id) {
        setShowDetailsModal(false);
        setSelectedStudentId(null);
      }
    }
  };

  const deleteTransaction = (e: React.MouseEvent, txId: string, amount: number, studentId: string) => {
    e.stopPropagation();
    if (window.confirm(`⚠️ ¿Anular este pago de $${amount.toLocaleString()}?\n\nEl monto se sumará nuevamente a la deuda del alumno.`)) {
      setTransactions(prev => prev.filter(t => t.id !== txId));
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, debt: s.debt + amount } : s));
    }
  };

  const deleteEnrollment = (e: React.MouseEvent, enrollmentId: string, amount: number, studentId: string) => {
    e.stopPropagation();
    if (window.confirm(`⚠️ ¿Anular este cargo de $${amount.toLocaleString()}?\n\nSe eliminará del historial y se restará de la deuda actual.`)) {
      setStudents(prev => prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            debt: Math.max(0, s.debt - amount),
            enrollments: s.enrollments.filter(en => en.id !== enrollmentId)
          };
        }
        return s;
      }));
    }
  };

  const openWhatsApp = (phone: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-ams-dark tracking-tight">Base de Alumnos</h2>
          <p className="text-ams-brown/70 font-medium uppercase text-[10px] tracking-widest font-black">Directorio Maestro e Historial Académico</p>
        </div>
        <button onClick={() => { setEditingStudent(null); setShowModal(true); }} className="flex items-center gap-2 bg-ams-orange text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase hover:scale-105 shadow-lg shadow-ams-orange/20 transition-all">
          <Plus size={18} /> Registrar Alumno
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-ams-peach overflow-hidden">
        <div className="p-6 border-b border-ams-peach flex flex-wrap bg-ams-peach/10 gap-3 items-center">
          <div className="flex gap-2">
            <FilterButton active={filter === 'ALL'} onClick={() => setFilter('ALL')}>Todos ({students.length})</FilterButton>
            <FilterButton active={filter === StudentStatus.ACTIVE} onClick={() => setFilter(StudentStatus.ACTIVE)}>Activos</FilterButton>
            <FilterButton active={filter === StudentStatus.INACTIVE} onClick={() => setFilter(StudentStatus.INACTIVE)}>Inactivos</FilterButton>
          </div>
          <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-ams-peach/50">
            <Search size={16} className="text-ams-orange" />
            <input 
              type="text" 
              placeholder="Buscar por nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-bold outline-none border-none focus:ring-0"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase text-ams-brown/50 font-black border-b border-ams-peach bg-ams-peach/5">
                <th className="px-8 py-5">Ficha Alumno</th>
                <th className="px-6 py-5">Instrumento / Profesor</th>
                <th className="px-6 py-5">Deuda Actual</th>
                <th className="px-6 py-5">Estado Pago</th>
                <th className="px-8 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ams-peach/30">
              {filteredStudents.map(student => {
                const assignedTeacher = teachers.find(t => t.id === student.teacherId);
                return (
                  <tr 
                    key={student.id} 
                    className="hover:bg-ams-peach/5 transition-colors group cursor-pointer" 
                    onClick={() => { setSelectedStudentId(student.id); setShowDetailsModal(true); }}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-ams-dark text-white flex items-center justify-center font-black">{student.firstName[0]}</div>
                        <div>
                          <p className="font-bold text-ams-dark">{student.firstName} {student.lastName}</p>
                          <p className="text-[9px] font-black text-ams-brown/40 uppercase tracking-widest">{student.age} años</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-ams-orange uppercase tracking-widest bg-ams-peach/20 px-3 py-1.5 rounded-xl w-fit">{student.instrument}</span>
                        {assignedTeacher && (
                          <span className="text-[9px] font-bold text-ams-brown/60 flex items-center gap-1">
                            <Briefcase size={10} /> {assignedTeacher.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`font-black text-sm ${student.debt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ${student.debt.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl flex items-center gap-1 w-fit ${student.debt <= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {student.debt <= 0 ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                        {student.debt <= 0 ? 'Al Día' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                         <button onClick={() => openWhatsApp(student.phone)} className="p-2.5 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all" title="WhatsApp"><MessageCircle size={18} /></button>
                         <button onClick={() => { setSelectedStudentId(student.id); setShowDetailsModal(true); }} className="p-2.5 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all" title="Historial"><History size={18} /></button>
                         <button onClick={() => { setEditingStudent(student); setShowModal(true); }} className="p-2.5 rounded-xl text-ams-brown hover:bg-ams-peach/30 transition-all" title="Editar"><Edit3 size={18} /></button>
                         <button onClick={() => handleDeleteStudent(student.id, `${student.firstName} ${student.lastName}`)} className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-100 transition-all" title="Borrar Alumno">
                            <Trash2 size={18} />
                         </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE DETALLES E HISTORIAL */}
      {showDetailsModal && modalStudent && (
        <div className="fixed inset-0 bg-ams-dark/80 backdrop-blur-lg flex items-center justify-center z-[120] p-4" onClick={() => { setShowDetailsModal(false); setSelectedStudentId(null); }}>
          <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="bg-ams-dark p-8 text-white flex justify-between items-start">
              <div className="flex gap-6 items-center">
                <div className="w-20 h-20 rounded-[2rem] bg-ams-orange text-white flex items-center justify-center text-4xl font-black shadow-lg rotate-3">{modalStudent.firstName[0]}</div>
                <div>
                  <h3 className="text-3xl font-black">{modalStudent.firstName} {modalStudent.lastName}</h3>
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => openWhatsApp(modalStudent.phone)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all shadow-lg shadow-emerald-600/20">
                      <MessageCircle size={14}/> {modalStudent.phone}
                    </button>
                    <span className="text-[10px] font-black uppercase text-white/50 bg-white/10 px-3 py-2 rounded-full">{modalStudent.instrument}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => { setShowDetailsModal(false); setSelectedStudentId(null); }} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all"><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-ams-peach pb-4">
                  <TrendingUp className="text-ams-orange" size={20} />
                  <h4 className="text-sm font-black text-ams-dark uppercase tracking-widest">Planes Cargados</h4>
                </div>
                <div className="space-y-4">
                  {modalStudent.enrollments.length > 0 ? [...modalStudent.enrollments].reverse().map((en) => (
                    <div key={en.id} className="bg-slate-50 p-5 rounded-3xl border border-slate-100 group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-ams-brown/40 uppercase mb-1">{new Date(en.date).toLocaleDateString()}</p>
                          <p className="text-sm font-black text-ams-dark">{en.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-ams-dark">${en.price.toLocaleString()}</p>
                          <button onClick={(e) => deleteEnrollment(e, en.id, en.price, modalStudent.id)} className="text-rose-500 hover:text-rose-700 flex items-center gap-1 text-[9px] font-black uppercase justify-end mt-2">
                            <Trash2 size={12}/> Borrar
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center py-10 text-slate-400 text-xs italic">Sin cargos registrados.</p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-ams-peach pb-4">
                  <Banknote className="text-emerald-600" size={20} />
                  <h4 className="text-sm font-black text-ams-dark uppercase tracking-widest">Pagos Realizados</h4>
                </div>
                <div className="space-y-4">
                  {transactions.filter(t => t.metadata?.studentId === modalStudent.id).map((tx) => (
                    <div key={tx.id} className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100 group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-emerald-700/50 uppercase mb-1">{tx.date}</p>
                          <p className="text-sm font-black text-emerald-900">Pago Recibido</p>
                          <p className="text-[9px] text-emerald-700/60 font-bold uppercase tracking-widest">{tx.metadata?.method || 'Efectivo'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-emerald-600">+${tx.amount.toLocaleString()}</p>
                          <button onClick={(e) => deleteTransaction(e, tx.id, tx.amount, modalStudent.id)} className="text-rose-500 hover:text-rose-700 flex items-center gap-1 text-[9px] font-black uppercase justify-end mt-2">
                            <Trash2 size={12}/> Anular
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {transactions.filter(t => t.metadata?.studentId === modalStudent.id).length === 0 && (
                    <p className="text-center py-10 text-emerald-600/40 text-xs italic">Sin pagos registrados.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 bg-ams-peach/10 border-t border-ams-peach flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-ams-brown uppercase tracking-widest mb-1">Deuda Actual</p>
                <div className={`text-3xl font-black ${modalStudent.debt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ${modalStudent.debt.toLocaleString()}
                </div>
              </div>
              <button onClick={() => { setShowDetailsModal(false); setSelectedStudentId(null); }} className="bg-ams-dark text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Cerrar Historial</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDICIÓN / REGISTRO */}
      {showModal && (
        <div className="fixed inset-0 bg-ams-dark/60 backdrop-blur-md flex items-center justify-center z-[130] p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl my-8 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-ams-dark p-10 text-white relative">
              <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 hover:rotate-90 transition-transform"><X size={32} /></button>
              <h3 className="text-4xl font-black tracking-tight">{editingStudent ? 'Editar Ficha' : 'Nuevo Alumno'}</h3>
            </div>
            <form onSubmit={handleSaveStudent} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup label="Nombre" name="firstName" required defaultValue={editingStudent?.firstName} />
                <InputGroup label="Apellido" name="lastName" required defaultValue={editingStudent?.lastName} />
                <InputGroup label="Edad" name="age" type="number" required defaultValue={editingStudent?.age} />
                
                <div className="flex flex-col">
                  <label className="block text-[10px] font-black text-ams-brown/50 uppercase mb-2 tracking-widest">Instrumento</label>
                  <select name="instrument" required defaultValue={editingStudent?.instrument} className="w-full bg-[#FDF6F2] border-none rounded-2xl px-5 py-4 font-black text-ams-dark ring-1 ring-ams-peach outline-none focus:ring-2 focus:ring-ams-orange transition-all">
                    {INSTRUMENTS.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="block text-[10px] font-black text-ams-brown/50 uppercase mb-2 tracking-widest">Asignar Profesor</label>
                  <select name="teacherId" defaultValue={editingStudent?.teacherId || ""} className="w-full bg-[#FDF6F2] border-none rounded-2xl px-5 py-4 font-black text-ams-dark ring-1 ring-ams-peach outline-none focus:ring-2 focus:ring-ams-orange transition-all">
                    <option value="">Sin profesor asignado</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name} ({teacher.instrument})</option>
                    ))}
                  </select>
                </div>

                <InputGroup label="WhatsApp" name="phone" required defaultValue={editingStudent?.phone || '54911'} placeholder="54911..." />
                <InputGroup label="Email" name="email" type="email" defaultValue={editingStudent?.email} />
              </div>

              <div className={`bg-indigo-50/50 rounded-[2.5rem] border-2 border-indigo-100 transition-all overflow-hidden ${showExtraFields ? 'p-8' : 'p-4'}`}>
                 <button type="button" onClick={() => setShowExtraFields(!showExtraFields)} className="w-full flex items-center justify-between text-indigo-900 font-black uppercase text-xs tracking-widest">
                   <div className="flex items-center gap-3"><Users className="text-indigo-600" /> Datos de Familia</div>
                   {showExtraFields ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                 </button>
                 {showExtraFields && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 animate-in slide-in-from-top duration-300">
                      <InputGroup label="Padre" name="fatherName" defaultValue={editingStudent?.fatherName} />
                      <InputGroup label="Tel Padre" name="fatherPhone" defaultValue={editingStudent?.fatherPhone || '54911'} />
                      <InputGroup label="Madre" name="motherName" defaultValue={editingStudent?.motherName} />
                      <InputGroup label="Tel Madre" name="motherPhone" defaultValue={editingStudent?.motherPhone || '54911'} />
                   </div>
                 )}
              </div>

              <button type="submit" className="w-full bg-ams-orange text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:scale-[1.02] transition-all">
                {editingStudent ? 'Actualizar Ficha' : 'Guardar Alumno'}
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
    <input type={type} name={name} defaultValue={defaultValue} placeholder={placeholder} required={required} className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-black text-ams-dark ring-1 ring-ams-peach/50 focus:ring-2 focus:ring-ams-orange outline-none transition-all shadow-sm" />
  </div>
);

const FilterButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-ams-orange text-white shadow-md' : 'text-ams-brown/50 hover:bg-ams-peach hover:text-ams-brown'}`}>{children}</button>
);

export default StudentManagement;
