
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  Calendar, 
  Wallet, 
  TrendingUp, 
  Plus,
  Search,
  CheckCircle,
  XCircle,
  DollarSign,
  Settings,
  Briefcase,
  DownloadCloud,
  FileUp,
  AlertTriangle,
  CreditCard
} from 'lucide-react';
import { 
  Student, 
  StudentStatus, 
  AttendanceRecord, 
  Transaction,
  Teacher,
  SchoolSettings
} from './types';
import { INITIAL_STUDENTS, INITIAL_TEACHERS } from './constants';
import Dashboard from './components/Dashboard';
import StudentManagement from './components/StudentManagement';
import AttendanceTracker from './components/AttendanceTracker';
import CashFlow from './components/CashFlow';
import Schedule from './components/Schedule';
import TeacherSalaries from './components/TeacherSalaries';
import TeacherManagement from './components/TeacherManagement';
import PaymentManagement from './components/PaymentManagement';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingBackup, setPendingBackup] = useState<any>(null);
  const [lastSaved, setLastSaved] = useState<string>('');
  
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('ams_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('ams_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('ams_attendance');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ams_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(() => {
    const saved = localStorage.getItem('school_settings');
    return saved ? JSON.parse(saved) : { name: 'AMS School', logoUrl: null };
  });

  useEffect(() => { 
    localStorage.setItem('ams_students', JSON.stringify(students)); 
    setLastSaved(new Date().toLocaleTimeString());
  }, [students]);

  useEffect(() => { 
    localStorage.setItem('ams_teachers', JSON.stringify(teachers)); 
    setLastSaved(new Date().toLocaleTimeString());
  }, [teachers]);

  useEffect(() => { 
    localStorage.setItem('ams_attendance', JSON.stringify(attendance)); 
    setLastSaved(new Date().toLocaleTimeString());
  }, [attendance]);

  useEffect(() => { 
    localStorage.setItem('ams_transactions', JSON.stringify(transactions)); 
    setLastSaved(new Date().toLocaleTimeString());
  }, [transactions]);

  useEffect(() => { 
    localStorage.setItem('school_settings', JSON.stringify(schoolSettings)); 
  }, [schoolSettings]);

  const exportAllData = () => {
    const data = { students, teachers, attendance, transactions, schoolSettings, version: "1.1", exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AMS_Backup_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    a.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonContent = event.target?.result as string;
        const data = JSON.parse(jsonContent);
        if (data.students) setPendingBackup(data);
        else alert('Archivo de respaldo inválido.');
      } catch (err) { alert('Error al leer el archivo de respaldo.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const applyBackup = () => {
    if (!pendingBackup) return;
    if (confirm('¿Restaurar respaldo? Se borrarán todos los datos actuales del navegador.')) {
      setStudents(pendingBackup.students || []);
      setTeachers(pendingBackup.teachers || []);
      setAttendance(pendingBackup.attendance || []);
      setTransactions(pendingBackup.transactions || []);
      if (pendingBackup.schoolSettings) setSchoolSettings(pendingBackup.schoolSettings);
      setPendingBackup(null);
      setShowSettings(false);
      alert("¡Datos restaurados correctamente!");
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard students={students} transactions={transactions} />;
      case 'students': return <StudentManagement students={students} setStudents={setStudents} setTransactions={setTransactions} transactions={transactions} teachers={teachers} onCloudSync={() => {}} isSyncing={false} />;
      case 'payments': return <PaymentManagement students={students} setStudents={setStudents} setTransactions={setTransactions} />;
      case 'attendance': return <AttendanceTracker students={students} setStudents={setStudents} attendance={attendance} setAttendance={setAttendance} teachers={teachers} />;
      case 'schedule': return <Schedule />;
      case 'cashflow': return <CashFlow transactions={transactions} setTransactions={setTransactions} setStudents={setStudents} />;
      case 'teachers-list': return <TeacherManagement teachers={teachers} setTeachers={setTeachers} attendance={attendance} onAddClick={() => setShowAddTeacher(true)} />;
      case 'teachers': return <TeacherSalaries attendance={attendance} teachers={teachers} />;
      default: return <Dashboard students={students} transactions={transactions} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#FDF6F2] overflow-hidden font-sans text-ams-dark">
      <aside className="w-72 bg-ams-dark text-white flex flex-col shadow-2xl z-20 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex flex-col items-center text-center bg-white/5">
          {schoolSettings.logoUrl ? (
            <img src={schoolSettings.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-4 rounded-3xl shadow-lg bg-white p-2" />
          ) : (
            <div className="w-16 h-16 bg-ams-orange rounded-3xl flex items-center justify-center mb-4 shadow-xl shadow-ams-orange/20 rotate-3">
              <TrendingUp size={32} className="text-white" />
            </div>
          )}
          <h1 className="text-xl font-black tracking-tighter uppercase">{schoolSettings.name}</h1>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Users size={20}/>} label="Base de Alumnos" active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
          <NavItem icon={<CreditCard size={20}/>} label="Planes y Pagos" active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />
          <NavItem icon={<CheckCircle size={20}/>} label="Asistencia" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />
          <NavItem icon={<Calendar size={20}/>} label="Horarios" active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} />
          <NavItem icon={<Wallet size={20}/>} label="Caja Diaria" active={activeTab === 'cashflow'} onClick={() => setActiveTab('cashflow')} />
          <div className="pt-8 pb-4"><p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] pl-4">Staff</p></div>
          <NavItem icon={<Briefcase size={20}/>} label="Profesores" active={activeTab === 'teachers-list'} onClick={() => setActiveTab('teachers-list')} />
          <NavItem icon={<DollarSign size={20}/>} label="Liquidación" active={activeTab === 'teachers'} onClick={() => setActiveTab('teachers')} />
          <button onClick={() => setShowSettings(true)} className="flex items-center gap-5 px-6 py-4 w-full rounded-2xl transition-all duration-300 text-white/30 hover:bg-white/5 hover:text-white font-black text-sm">
            <Settings size={20} /><span className="opacity-70">Ajustes</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-ams-peach/50 flex items-center justify-between px-10 shadow-sm z-10">
          <div className="flex items-center gap-5 bg-ams-peach/10 px-6 py-2.5 rounded-full w-[450px] border border-ams-peach/30 transition-all focus-within:ring-2 focus-within:ring-ams-orange focus-within:bg-white">
            <Search size={18} className="text-ams-orange" />
            <input type="text" placeholder="Buscar..." className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-ams-brown/40 font-bold" />
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden lg:flex flex-col items-end">
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[9px] font-black text-emerald-700 uppercase tracking-tighter">Memoria Local: Activa</span>
                </div>
                <p className="text-[8px] text-ams-brown/40 font-bold uppercase mt-1">Sincronizado: {lastSaved}</p>
             </div>
             <button onClick={() => { if (activeTab === 'teachers-list' || activeTab === 'teachers') setShowAddTeacher(true); else setActiveTab('students'); }} className="bg-ams-orange text-white p-3 rounded-2xl shadow-lg shadow-ams-orange/20 hover:scale-110 transition-transform">
               <Plus size={24} />
             </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[#FDF6F2]">{renderContent()}</section>
      </main>

      {showSettings && (
        <div className="fixed inset-0 bg-ams-dark/60 backdrop-blur-md flex items-center justify-center z-[100] p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="bg-ams-dark p-10 text-white relative">
              <button onClick={() => setShowSettings(false)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"><XCircle size={32} /></button>
              <h3 className="text-3xl font-black">Ajustes del Sistema</h3>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2">Personalización y Respaldo</p>
            </div>
            <div className="p-10 space-y-8">
              <div>
                <label className="block text-[10px] font-black text-ams-brown/50 uppercase tracking-widest mb-2">Nombre de la Escuela</label>
                <input 
                  type="text" 
                  value={schoolSettings.name} 
                  onChange={(e) => setSchoolSettings({...schoolSettings, name: e.target.value})} 
                  className="w-full bg-[#FDF6F2] border-none rounded-2xl px-5 py-4 font-black text-ams-dark ring-1 ring-ams-peach focus:ring-2 focus:ring-ams-orange outline-none" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-ams-brown/50 uppercase tracking-widest mb-2">Respaldo de Datos (Local)</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button onClick={exportAllData} className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-200 transition-all">
                    <DownloadCloud size={16} /> Bajar .JSON
                  </button>
                  <label className="flex items-center justify-center gap-2 bg-ams-peach/20 text-ams-brown border-2 border-dashed border-ams-peach py-4 rounded-2xl font-black text-[10px] uppercase cursor-pointer hover:bg-ams-peach/40 transition-all">
                    <FileUp size={16} /> Subir .JSON
                    <input type="file" className="hidden" accept=".json" onChange={handleFileSelect} />
                  </label>
                </div>
                <p className="text-[9px] text-ams-brown/40 mt-3 font-medium italic">Recomendamos bajar un respaldo .json al final de cada semana para seguridad extra.</p>
              </div>

              {pendingBackup && (
                <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-200 space-y-4">
                  <div className="flex items-center gap-3 text-indigo-700 font-black text-xs uppercase tracking-widest">
                    <AlertTriangle size={20} /> Backup Detectado
                  </div>
                  <button onClick={applyBackup} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20">
                    Restaurar Ahora
                  </button>
                </div>
              )}

              <button onClick={() => setShowSettings(false)} className="w-full bg-ams-dark text-white py-5 rounded-[1.5rem] font-black shadow-xl hover:bg-black transition-all text-xs uppercase tracking-widest">Guardar y Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-5 px-6 py-4 w-full rounded-2xl transition-all duration-300 group ${active ? 'bg-ams-orange text-white shadow-xl translate-x-2' : 'text-white/30 hover:bg-white/5 hover:text-white'}`}>
    <div className={`${active ? 'scale-125' : 'group-hover:scale-110'} transition-transform duration-300`}>{icon}</div>
    <span className={`text-sm font-black tracking-wide ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
  </button>
);

export default App;
