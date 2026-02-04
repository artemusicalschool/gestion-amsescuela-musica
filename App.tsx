
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
  CreditCard,
  Menu,
  ImageIcon,
  Upload,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  ChevronRight,
  Percent,
  RefreshCw
} from 'lucide-react';
import { 
  Student, 
  StudentStatus, 
  AttendanceRecord, 
  Transaction,
  Teacher,
  SchoolSettings
} from './types';
import { INITIAL_STUDENTS, INITIAL_TEACHERS, PRICING_TABLE as DEFAULT_PRICING } from './constants';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('ams_auth_status') === 'true';
  });
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);
  
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
  
  const [pricing, setPricing] = useState(() => {
    const saved = localStorage.getItem('ams_pricing');
    return saved ? JSON.parse(saved) : DEFAULT_PRICING;
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [percentageAdjust, setPercentageAdjust] = useState<number>(0);
  
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(() => {
    const saved = localStorage.getItem('school_settings');
    return saved ? JSON.parse(saved) : { name: 'AMS School', logoUrl: null };
  });

  useEffect(() => { 
    localStorage.setItem('ams_students', JSON.stringify(students)); 
    setLastSaved(new Date().toLocaleTimeString());
  }, [students]);

  useEffect(() => { localStorage.setItem('ams_teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem('ams_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('ams_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('school_settings', JSON.stringify(schoolSettings)); }, [schoolSettings]);
  useEffect(() => { localStorage.setItem('ams_pricing', JSON.stringify(pricing)); }, [pricing]);
  useEffect(() => { localStorage.setItem('ams_auth_status', isAuthenticated.toString()); }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword === '29242924') {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      setLoginPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowSettings(false);
    setLoginPassword('');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolSettings({ ...schoolSettings, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Add handleExportBackup and handleImportBackup to resolve missing names
  const handleExportBackup = () => {
    const backupData = {
      students: localStorage.getItem('ams_students'),
      teachers: localStorage.getItem('ams_teachers'),
      attendance: localStorage.getItem('ams_attendance'),
      transactions: localStorage.getItem('ams_transactions'),
      settings: localStorage.getItem('school_settings'),
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AMS_BACKUP_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm("¿Está seguro de restaurar este backup? Esta acción sobrescribirá todos los datos actuales de la academia.")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result as string);
        if (data.students) localStorage.setItem('ams_students', data.students);
        if (data.teachers) localStorage.setItem('ams_teachers', data.teachers);
        if (data.attendance) localStorage.setItem('ams_attendance', data.attendance);
        if (data.transactions) localStorage.setItem('ams_transactions', data.transactions);
        if (data.settings) localStorage.setItem('school_settings', data.settings);
        
        alert("¡Restauración exitosa! La página se reiniciará ahora.");
        window.location.reload();
      } catch (err) {
        alert("Error: El archivo de backup no es válido o está dañado.");
      }
    };
    reader.readAsText(file);
  };

  const applyPercentageAdjustment = () => {
    if (percentageAdjust === 0) return;
    const factor = 1 + (percentageAdjust / 100);
    const newPricing = JSON.parse(JSON.stringify(pricing));

    // Ajustar Combos
    Object.keys(newPricing.COMBOS).forEach(type => {
      Object.keys(newPricing.COMBOS[type]).forEach(dur => {
        newPricing.COMBOS[type][dur] = Math.round(newPricing.COMBOS[type][dur] * factor);
      });
    });

    // Ajustar Sueltas
    Object.keys(newPricing.SUELTAS).forEach(type => {
      Object.keys(newPricing.SUELTAS[type]).forEach(dur => {
        newPricing.SUELTAS[type][dur] = Math.round(newPricing.SUELTAS[type][dur] * factor);
      });
    });

    // Ajustar Ensambles
    Object.keys(newPricing.ENSAMBLES).forEach(key => {
      newPricing.ENSAMBLES[key] = Math.round(newPricing.ENSAMBLES[key] * factor);
    });

    // Ajustar Práctica
    Object.keys(newPricing.PRACTICA).forEach(dur => {
      newPricing.PRACTICA[dur] = Math.round(newPricing.PRACTICA[dur] * factor);
    });

    // Ajustar Inscripción
    Object.keys(newPricing.INSCRIPCION).forEach(type => {
      newPricing.INSCRIPCION[type] = Math.round(newPricing.INSCRIPCION[type] * factor);
    });

    setPricing(newPricing);
    setPercentageAdjust(0);
    alert(`Se ha aplicado un ajuste del ${percentageAdjust}% a todos los precios.`);
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard students={students} transactions={transactions} />;
      case 'students': return <StudentManagement students={students} setStudents={setStudents} setTransactions={setTransactions} transactions={transactions} teachers={teachers} onCloudSync={() => {}} isSyncing={false} />;
      case 'payments': return <PaymentManagement students={students} setStudents={setStudents} setTransactions={setTransactions} pricingTable={pricing} />;
      case 'attendance': return <AttendanceTracker students={students} setStudents={setStudents} attendance={attendance} setAttendance={setAttendance} teachers={teachers} />;
      case 'schedule': return <Schedule />;
      case 'cashflow': return <CashFlow transactions={transactions} setTransactions={setTransactions} setStudents={setStudents} />;
      case 'teachers-list': return <TeacherManagement teachers={teachers} setTeachers={setTeachers} attendance={attendance} onAddClick={() => {}} />;
      case 'teachers': return <TeacherSalaries attendance={attendance} teachers={teachers} />;
      default: return <Dashboard students={students} transactions={transactions} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-ams-cream flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-ams-orange/10 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-15%] left-[-10%] w-[60vw] h-[60vw] bg-ams-dark/10 blur-[180px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-lg glass rounded-[4rem] shadow-2xl p-12 lg:p-16 border border-white relative z-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="flex flex-col items-center mb-14 text-center">
            <div className="w-28 h-28 bg-ams-orange rounded-[3rem] flex items-center justify-center shadow-orange-glow mb-8 overflow-hidden group hover:rotate-6 transition-transform">
              {schoolSettings.logoUrl ? (
                <img src={schoolSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <TrendingUp size={48} className="text-white" />
              )}
            </div>
            <h1 className="text-5xl font-display font-black text-ams-dark tracking-tighter uppercase leading-none">{schoolSettings.name}</h1>
            <p className="text-[11px] font-black text-ams-brown/40 uppercase tracking-[0.5em] mt-4 flex items-center gap-3">
               <div className="w-4 h-px bg-ams-brown/20"></div> SISTEMA DE GESTIÓN <div className="w-4 h-px bg-ams-brown/20"></div>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-5">
              <label className="block text-[11px] font-black text-ams-brown/40 uppercase tracking-widest pl-6 flex items-center gap-3">
                <Lock size={16} className="text-ams-orange" /> Credencial de Acceso
              </label>
              <div className="relative group">
                <input 
                  autoFocus
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (loginError) setLoginError(false);
                  }}
                  placeholder="••••••••"
                  className={`w-full bg-ams-cream/50 border-none rounded-[2.5rem] px-8 py-7 font-bold text-ams-dark ring-2 transition-all outline-none text-center text-2xl tracking-[0.4em] ${loginError ? 'ring-rose-500 animate-shake' : 'ring-ams-peach/40 focus:ring-ams-orange focus:bg-white focus:shadow-2xl focus:shadow-ams-orange/10'}`}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-ams-brown/20 hover:text-ams-orange transition-colors"
                >
                  {showPassword ? <EyeOff size={28} /> : <Eye size={28} />}
                </button>
              </div>
              {loginError && (
                <p className="text-center text-[11px] font-black text-rose-500 uppercase tracking-widest animate-bounce mt-4">Acceso Denegado. Clave incorrecta.</p>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full bg-ams-dark text-white py-8 rounded-[3rem] font-black text-sm uppercase tracking-[0.5em] shadow-dark-glow hover:bg-black hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-5 group"
            >
              Iniciar Sesión <ChevronRight size={22} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </form>

          <p className="mt-16 text-center text-[10px] font-black text-ams-brown/20 uppercase tracking-widest leading-relaxed">
            ACCESO RESTRINGIDO A PERSONAL AUTORIZADO<br/>
            &copy; {new Date().getFullYear()} AMS CLOUD SECURITY
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-ams-cream overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 z-50 lg:relative lg:flex glass-dark m-4 lg:m-6 rounded-5xl text-white flex-col shadow-2xl transition-all duration-500 border border-white/10 ${isSidebarOpen ? 'w-80 translate-x-0' : 'w-24 lg:w-24 -translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 flex flex-col items-center text-center shrink-0">
          <div className={`transition-all duration-500 bg-ams-orange rounded-4xl flex items-center justify-center shadow-2xl shadow-ams-orange/40 hover:rotate-6 cursor-pointer overflow-hidden ${isSidebarOpen ? 'w-20 h-20 mb-4' : 'w-10 h-10'}`}>
            {schoolSettings.logoUrl ? (
              <img src={schoolSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <TrendingUp size={isSidebarOpen ? 32 : 18} className="text-white" />
            )}
          </div>
          {isSidebarOpen && (
            <>
              <h1 className="text-xl font-display font-extrabold tracking-tight">{schoolSettings.name}</h1>
              <p className="text-white/30 text-[9px] uppercase font-bold tracking-[0.2em] mt-2">Control de Academia</p>
            </>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="pb-4 pt-2">
            {isSidebarOpen ? <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] pl-6">Navegación</p> : <div className="h-px bg-white/10 mx-4"></div>}
          </div>
          <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} isOpen={isSidebarOpen} />
          <NavItem icon={<Users size={20}/>} label="Alumnos" active={activeTab === 'students'} onClick={() => setActiveTab('students')} isOpen={isSidebarOpen} />
          
          <div className="relative group/nav">
            <NavItem icon={<CreditCard size={20}/>} label="Facturar" active={activeTab === 'payments'} onClick={() => setActiveTab('payments'} isOpen={isSidebarOpen} />
            {isSidebarOpen && (
              <button 
                onClick={() => setShowPriceModal(true)}
                className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-ams-orange p-2 rounded-xl text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover/nav:opacity-100 transition-all shadow-lg"
              >
                ⚙️ Ajustar Precios
              </button>
            )}
          </div>

          <NavItem icon={<CheckCircle size={20}/>} label="Asistencia" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} isOpen={isSidebarOpen} />
          
          <div className="pt-8 pb-4">
            {isSidebarOpen ? <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] pl-6">Administración</p> : <div className="h-px bg-white/10 mx-4"></div>}
          </div>
          <NavItem icon={<Wallet size={20}/>} label="Caja" active={activeTab === 'cashflow'} onClick={() => setActiveTab('cashflow')} isOpen={isSidebarOpen} />
          <NavItem icon={<Briefcase size={20}/>} label="Profesores" active={activeTab === 'teachers-list'} onClick={() => setActiveTab('teachers-list')} isOpen={isSidebarOpen} />
          <NavItem icon={<DollarSign size={20}/>} label="Sueldos" active={activeTab === 'teachers'} onClick={() => setActiveTab('teachers')} isOpen={isSidebarOpen} />
        </nav>
        
        <div className="p-6 shrink-0">
           <button onClick={() => setShowSettings(true)} className={`flex items-center gap-4 py-4 rounded-3xl transition-all duration-300 text-white/40 hover:bg-white/5 hover:text-white group ${isSidebarOpen ? 'px-8 w-full' : 'px-0 justify-center w-full'}`}>
            <Settings size={20} className="group-hover:rotate-90 transition-transform" />
            {isSidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Configuración</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-24 px-6 md:px-12 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-white rounded-2xl shadow-sm border border-ams-peach/30 text-ams-orange hover:bg-ams-orange hover:text-white transition-all">
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-4 glass px-6 py-2.5 rounded-full border border-ams-peach/20 shadow-soft focus-within:ring-2 focus-within:ring-ams-orange focus-within:bg-white transition-all w-64 xl:w-96">
              <Search size={18} className="text-ams-orange opacity-60" />
              <input type="text" placeholder="Buscar alumnos..." className="bg-transparent border-none focus:ring-0 text-xs w-full placeholder:text-ams-brown/40 font-semibold" />
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  Sincronizado
                </span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white border border-ams-peach/30 flex items-center justify-center text-ams-brown hover:bg-ams-peach transition-all cursor-pointer shadow-sm">
                 <Calendar size={18} />
               </div>
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-ams-dark text-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-ams-orange transition-all font-display font-bold uppercase">
                 AMS
               </div>
             </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto px-6 md:px-12 pb-12 custom-scrollbar scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
            {renderContent()}
          </div>
        </section>
      </main>

      {/* MODAL DE PRECIOS DINÁMICOS */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-ams-dark/60 backdrop-blur-xl flex items-center justify-center z-[150] p-4 lg:p-8" onClick={() => setShowPriceModal(false)}>
          <div className="bg-white rounded-[3.5rem] w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/50" onClick={e => e.stopPropagation()}>
            <div className="bg-ams-dark p-10 text-white shrink-0">
               <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-display font-black tracking-tighter">Gestión de Tarifas</h3>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Configura los valores de cada modalidad</p>
                  </div>
                  <button onClick={() => setShowPriceModal(false)} className="bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-all text-white/40 hover:text-white">
                    <XCircle size={28} />
                  </button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
               {/* Ajuste Global */}
               <div className="bg-ams-orange/5 border border-ams-orange/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 shadow-inner">
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-ams-dark flex items-center gap-3">
                       <Percent size={20} className="text-ams-orange" /> Ajuste Masivo de Precios
                    </h4>
                    <p className="text-[10px] font-bold text-ams-brown/50 uppercase tracking-widest mt-2">Aumenta o disminuye todos los valores por un porcentaje (%)</p>
                  </div>
                  <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-ams-peach/50 shadow-sm">
                    <input 
                      type="number" 
                      value={percentageAdjust}
                      onChange={(e) => setPercentageAdjust(Number(e.target.value))}
                      className="w-24 bg-ams-cream/50 border-none rounded-xl px-4 py-2 font-black text-center text-ams-dark focus:ring-0"
                      placeholder="%"
                    />
                    <button 
                      onClick={applyPercentageAdjustment}
                      className="bg-ams-orange text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-orange-glow"
                    >
                      Aplicar Ajuste
                    </button>
                  </div>
               </div>

               {/* Tablas de Precios */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Combos */}
                  <PriceCategorySection title="🎸 Combos Mensuales" data={pricing.COMBOS} onChange={(type, dur, val) => {
                    const next = {...pricing};
                    next.COMBOS[type][dur] = val;
                    setPricing(next);
                  }} />

                  {/* Sueltas */}
                  <PriceCategorySection title="🎵 Clases Sueltas" data={pricing.SUELTAS} onChange={(type, dur, val) => {
                    const next = {...pricing};
                    next.SUELTAS[type][dur] = val;
                    setPricing(next);
                  }} />

                  {/* Ensambles */}
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-ams-brown/40 uppercase tracking-[0.3em] flex items-center gap-2">
                       <div className="w-8 h-px bg-ams-peach"></div> Ensambles
                    </h4>
                    <div className="space-y-3">
                      {Object.keys(pricing.ENSAMBLES).map(key => (
                        <div key={key} className="flex items-center justify-between bg-ams-cream/30 p-4 rounded-2xl border border-ams-peach/30 group hover:border-ams-orange transition-all">
                          <span className="text-[10px] font-black text-ams-dark uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                          <div className="relative w-32">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-ams-orange">$</span>
                            <input 
                              type="number" 
                              value={pricing.ENSAMBLES[key]} 
                              onChange={(e) => {
                                const next = {...pricing};
                                next.ENSAMBLES[key] = Number(e.target.value);
                                setPricing(next);
                              }}
                              className="w-full bg-white border-none rounded-xl pl-6 pr-3 py-2 text-xs font-black text-ams-dark ring-1 ring-ams-peach/50 focus:ring-2 focus:ring-ams-orange outline-none transition-all"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Práctica e Inscripción */}
                  <div className="space-y-8">
                     <div className="space-y-6">
                        <h4 className="text-[11px] font-black text-ams-brown/40 uppercase tracking-[0.3em] flex items-center gap-2">
                          <div className="w-8 h-px bg-ams-peach"></div> Práctica
                        </h4>
                        <div className="space-y-3">
                          {Object.keys(pricing.PRACTICA).map(dur => (
                            <div key={dur} className="flex items-center justify-between bg-ams-cream/30 p-4 rounded-2xl border border-ams-peach/30">
                              <span className="text-[10px] font-black text-ams-dark uppercase tracking-widest">{dur}</span>
                              <div className="relative w-32">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-ams-orange">$</span>
                                <input 
                                  type="number" 
                                  value={pricing.PRACTICA[dur]} 
                                  onChange={(e) => {
                                    const next = {...pricing};
                                    next.PRACTICA[dur] = Number(e.target.value);
                                    setPricing(next);
                                  }}
                                  className="w-full bg-white border-none rounded-xl pl-6 pr-3 py-2 text-xs font-black text-ams-dark ring-1 ring-ams-peach/50 focus:ring-2 focus:ring-ams-orange outline-none transition-all"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-10 bg-ams-cream/50 border-t border-ams-peach/20 shrink-0">
                <button 
                  onClick={() => setShowPriceModal(false)} 
                  className="w-full bg-ams-dark text-white py-7 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-dark-glow hover:bg-black transition-all flex items-center justify-center gap-3"
                >
                  <CheckCircle size={20} /> Guardar Cambios de Tarifas
                </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-ams-dark/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4 lg:p-8" onClick={() => setShowSettings(false)}>
          <div className="bg-white/95 backdrop-blur-3xl rounded-[3.5rem] w-full max-w-2xl h-fit max-h-[90vh] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/40 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="bg-ams-dark p-10 text-white relative shrink-0">
               <div className="absolute top-0 right-0 w-32 h-32 bg-ams-orange/10 blur-3xl -mr-10 -mt-10 rounded-full"></div>
               <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-4xl font-display font-black tracking-tighter">Panel de Gestión</h3>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-3">AMS Cloud Control v1.2.5</p>
                  </div>
                  <button onClick={() => setShowSettings(false)} className="bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-all text-white/40 hover:text-white">
                    <XCircle size={28} />
                  </button>
               </div>
            </div>

            <div className="p-10 space-y-10 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="block text-[11px] font-black text-ams-brown/40 uppercase tracking-widest pl-2 flex items-center gap-2">
                    <CheckCircle size={14} className="text-ams-orange" /> Nombre de la Academia
                  </label>
                  <input 
                    type="text" 
                    value={schoolSettings.name} 
                    onChange={(e) => setSchoolSettings({...schoolSettings, name: e.target.value})} 
                    className="w-full bg-ams-cream/50 border-none rounded-[2rem] px-8 py-6 font-bold text-ams-dark ring-1 ring-ams-peach/50 focus:ring-2 focus:ring-ams-orange outline-none transition-all shadow-inner" 
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-[11px] font-black text-ams-brown/40 uppercase tracking-widest pl-2 flex items-center gap-2">
                    <ImageIcon size={14} className="text-ams-orange" /> Logo Institucional
                  </label>
                  <div className="flex items-center gap-8 p-8 bg-ams-cream/50 rounded-[2.5rem] border border-ams-peach/50 ring-1 ring-ams-peach/20">
                    <div className="w-24 h-24 rounded-3xl bg-ams-dark flex items-center justify-center overflow-hidden border border-white/10 shrink-0 shadow-lg">
                      {schoolSettings.logoUrl ? (
                        <img src={schoolSettings.logoUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={32} className="text-white/20" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <label className="cursor-pointer flex items-center justify-center gap-3 bg-ams-dark text-white py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-ams-orange transition-all shadow-md">
                        <Upload size={18} /> Cargar Nuevo Logo
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      </label>
                      <button 
                        onClick={() => setSchoolSettings({ ...schoolSettings, logoUrl: null })}
                        className="w-full text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-700 transition-colors py-2"
                      >
                        Restablecer a por defecto
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleExportBackup}
                  className="flex flex-col items-center justify-center gap-4 bg-white p-8 rounded-[2.5rem] border border-ams-peach/50 text-ams-brown hover:border-ams-orange transition-all group"
                >
                  <div className="p-4 bg-ams-cream rounded-2xl group-hover:bg-ams-orange/10 group-hover:text-ams-orange transition-colors"><DownloadCloud size={24} /></div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Descargar Respaldo</span>
                </button>
                <label className="flex flex-col items-center justify-center gap-4 bg-white p-8 rounded-[2.5rem] border border-ams-peach/50 text-ams-brown hover:border-ams-orange transition-all group cursor-pointer">
                  <input type="file" className="hidden" accept=".json" onChange={handleImportBackup} />
                  <div className="p-4 bg-ams-cream rounded-2xl group-hover:bg-ams-orange/10 group-hover:text-ams-orange transition-colors"><FileUp size={24} /></div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Restaurar Datos</span>
                </label>
              </div>
            </div>

            <div className="p-10 bg-ams-cream/50 border-t border-ams-peach/20 space-y-4 shrink-0">
               <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 bg-rose-500/10 text-rose-600 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all border border-rose-200 shadow-sm"
                >
                  <LogOut size={20} /> Cerrar Sesión Segura
                </button>
                <button 
                  onClick={() => setShowSettings(false)} 
                  className="w-full bg-ams-dark text-white py-7 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-dark-glow hover:bg-black transition-all flex items-center justify-center gap-3"
                >
                  <CheckCircle size={20} /> Guardar y Aplicar Cambios
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PriceCategorySection: React.FC<{ title: string, data: any, onChange: (type: string, dur: string, val: number) => void }> = ({ title, data, onChange }) => (
  <div className="space-y-6">
    <h4 className="text-[11px] font-black text-ams-brown/40 uppercase tracking-[0.3em] flex items-center gap-2">
      <div className="w-8 h-px bg-ams-peach"></div> {title}
    </h4>
    <div className="space-y-4">
      {Object.keys(data).map(type => (
        <div key={type} className="space-y-2">
          <p className="text-[9px] font-black text-ams-orange uppercase tracking-widest ml-4 mb-2">{type}</p>
          <div className="space-y-2">
            {Object.keys(data[type]).map(dur => (
              <div key={dur} className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-ams-peach/30 shadow-sm group hover:border-ams-orange/50 transition-all">
                <span className="text-[10px] font-black text-ams-brown uppercase tracking-widest pl-2">{dur}</span>
                <div className="relative w-28">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-ams-orange">$</span>
                  <input 
                    type="number" 
                    value={data[type][dur]} 
                    onChange={(e) => onChange(type, dur, Number(e.target.value))}
                    className="w-full bg-ams-cream/30 border-none rounded-xl pl-6 pr-3 py-1.5 text-xs font-black text-ams-dark ring-1 ring-ams-peach/30 focus:ring-2 focus:ring-ams-orange outline-none transition-all"
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

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void, isOpen: boolean }> = ({ icon, label, active, onClick, isOpen }) => (
  <button onClick={onClick} className={`flex items-center gap-4 py-4 rounded-3xl transition-all duration-500 group relative ${active ? 'bg-ams-orange text-white shadow-2xl shadow-ams-orange/30 scale-[1.05] z-10' : 'text-white/20 hover:bg-white/5 hover:text-white/60'} ${isOpen ? 'px-8 w-full' : 'px-0 justify-center w-full'}`}>
    <div className={`transition-transform duration-500 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</div>
    {isOpen && <span className="text-xs font-bold tracking-wider">{label}</span>}
    {active && isOpen && <div className="absolute right-6 w-1.5 h-1.5 bg-white rounded-full"></div>}
  </button>
);

export default App;
