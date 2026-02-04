
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Student, StudentStatus, Transaction, ClassModality } from '../types';
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  ArrowUpRight, 
  DownloadCloud, 
  FileUp, 
  Database,
  ShieldCheck
} from 'lucide-react';

interface Props {
  students: Student[];
  transactions: Transaction[];
}

const Dashboard: React.FC<Props> = ({ students, transactions }) => {
  const activeStudents = students.filter(s => s.status === StudentStatus.ACTIVE);
  const inactiveStudents = students.filter(s => s.status === StudentStatus.INACTIVE);
  const totalDebt = activeStudents.reduce((acc, s) => acc + s.debt, 0);
  const criticalAbsences = activeStudents.filter(s => s.consecutiveAbsences >= 2);

  const modalityData = Object.values(ClassModality).map(mod => ({
    name: mod,
    value: activeStudents.filter(s => s.modalities.includes(mod)).length
  })).filter(d => d.value > 0);

  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  const COLORS = ['#FF824D', '#818CF8', '#FB7185', '#34D399', '#FBBF24'];

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

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Grid de Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users className="text-indigo-600" size={22} />} 
          title="Comunidad" 
          value={activeStudents.length} 
          subtitle={`${inactiveStudents.length} inactivos`}
          color="indigo"
          glow="rgba(99, 102, 241, 0.15)"
        />
        <StatCard 
          icon={<AlertTriangle className="text-rose-600" size={22} />} 
          title="Alertas" 
          value={criticalAbsences.length} 
          subtitle="Ausencias críticas"
          color="rose"
          isAlert={criticalAbsences.length > 0}
          glow="rgba(244, 63, 94, 0.15)"
        />
        <StatCard 
          icon={<DollarSign className="text-emerald-600" size={22} />} 
          title="Balance Cobros" 
          value={`$${totalDebt.toLocaleString()}`} 
          subtitle="Total pendiente"
          color="emerald"
          glow="rgba(16, 185, 129, 0.15)"
        />
        <StatCard 
          icon={<TrendingUp className="text-ams-orange" size={22} />} 
          title="Flujo Caja" 
          value={`$${(income - expenses).toLocaleString()}`} 
          subtitle="Neto mensual"
          color="amber"
          glow="rgba(255, 130, 77, 0.15)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 glass p-8 md:p-10 rounded-[3.5rem] shadow-soft border border-white/50 card-ams">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-display font-black flex items-center gap-4 tracking-tighter">
               <div className="w-12 h-12 rounded-2xl bg-ams-orange/10 flex items-center justify-center text-ams-orange"><TrendingUp size={22}/></div>
               Análisis de Modalidad
            </h3>
            <span className="text-[9px] font-black uppercase tracking-widest text-ams-brown/30 bg-ams-peach/10 px-4 py-2 rounded-full border border-ams-peach/20">Tiempo Real</span>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modalityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={110}
                  outerRadius={140}
                  paddingAngle={12}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1200}
                >
                  {modalityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', 
                    padding: '16px',
                    fontFamily: 'Plus Jakarta Sans',
                    fontWeight: '800',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {modalityData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2.5 px-4 py-2.5 bg-white/40 rounded-2xl border border-white/60 shadow-sm transition-all hover:bg-white cursor-default">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[9px] font-black text-ams-brown/50 uppercase tracking-widest">{d.name}</span>
                <span className="ml-1.5 font-display font-black text-ams-dark text-sm">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          {/* Tarjeta de Bajas */}
          <div className="glass p-8 md:p-10 rounded-[3.5rem] shadow-soft border border-white/50 card-ams">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-display font-black flex items-center gap-4 tracking-tighter">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center"><AlertTriangle size={22}/></div>
                Ausentismo
              </h3>
              {criticalAbsences.length > 0 && <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>}
            </div>
            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
              {criticalAbsences.length > 0 ? (
                criticalAbsences.map(s => (
                  <div key={s.id} className="group p-5 bg-white/60 rounded-[2rem] border border-rose-100 hover:bg-ams-dark hover:border-ams-dark transition-all duration-400 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center font-display font-black text-lg shadow-lg group-hover:bg-white group-hover:text-ams-dark transition-all">{s.firstName[0]}</div>
                      <div>
                        <p className="font-black text-ams-dark text-base group-hover:text-white transition-colors">{s.firstName} {s.lastName}</p>
                        <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest group-hover:text-rose-300 transition-colors">{s.consecutiveAbsences} clases ausente</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-emerald-50/20 rounded-[2.5rem] border-2 border-dashed border-emerald-100 flex flex-col items-center">
                  <CheckCircle size={32} className="text-emerald-400 mb-4" />
                  <p className="text-emerald-700 font-black text-[9px] uppercase tracking-[0.2em]">Asistencia Perfecta</p>
                </div>
              )}
            </div>
          </div>

          {/* CENTRO DE DATOS: BACKUP / RESTAURAR */}
          <div className="glass p-8 md:p-10 rounded-[3.5rem] shadow-soft border border-white/50 card-ams bg-ams-dark/5 relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 text-ams-orange/5 rotate-12 pointer-events-none">
              <Database size={160} />
            </div>
            
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 rounded-2xl bg-ams-dark text-white flex items-center justify-center shadow-lg"><Database size={22}/></div>
               <div>
                 <h3 className="text-2xl font-display font-black tracking-tighter">Centro de Datos</h3>
                 <p className="text-[10px] font-black text-ams-brown/40 uppercase tracking-widest">Mantenimiento de Sistema</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              <button 
                onClick={handleExportBackup}
                className="flex flex-col items-center justify-center gap-4 bg-white p-6 rounded-[2.5rem] border border-ams-peach/40 hover:border-ams-orange hover:shadow-xl hover:shadow-ams-orange/10 transition-all group"
              >
                <div className="p-4 bg-ams-orange/10 text-ams-orange rounded-2xl group-hover:bg-ams-orange group-hover:text-white transition-all shadow-inner">
                  <DownloadCloud size={24} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-ams-brown/60 group-hover:text-ams-dark">Backup</span>
              </button>

              <label className="flex flex-col items-center justify-center gap-4 bg-white p-6 rounded-[2.5rem] border border-ams-peach/40 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all group cursor-pointer">
                <input type="file" className="hidden" accept=".json" onChange={handleImportBackup} />
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                  <FileUp size={24} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-ams-brown/60 group-hover:text-ams-dark">Restaurar</span>
              </label>
            </div>

            <div className="mt-8 flex items-center gap-3 bg-white/60 p-4 rounded-2xl border border-white/80">
              <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
              <p className="text-[9px] font-bold text-ams-brown/50 leading-tight">
                Se recomienda realizar un backup semanal para garantizar la integridad de sus registros académicos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string | number, subtitle: string, color: string, isAlert?: boolean, glow: string }> = ({ icon, title, value, subtitle, color, isAlert, glow }) => (
  <div className={`glass p-7 rounded-[2.5rem] border border-white/60 card-ams group relative overflow-hidden ${isAlert ? 'ring-2 ring-rose-500/30' : ''}`} style={{ boxShadow: `0 10px 30px -10px ${glow}` }}>
    <div className="flex items-center justify-between mb-6 relative z-10">
      <div className={`p-3.5 rounded-2xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>{icon}</div>
      <div className="text-[9px] font-black text-ams-brown/25 uppercase tracking-[0.3em]">{title}</div>
    </div>
    
    <div className="relative z-10">
      <div className="text-3xl font-display font-black text-ams-dark mb-1 tracking-tighter group-hover:translate-x-1 transition-transform">{value}</div>
      <div className="text-[9px] font-bold text-ams-brown/40 uppercase tracking-widest">{subtitle}</div>
    </div>
  </div>
);

export default Dashboard;
