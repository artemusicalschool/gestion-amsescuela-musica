
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Student, StudentStatus, Transaction, ClassModality } from '../types';
import { Users, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

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

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users className="text-indigo-600" />} 
          title="Alumnos Activos" 
          value={activeStudents.length} 
          subtitle={`${inactiveStudents.length} inactivos`}
          color="indigo"
        />
        <StatCard 
          icon={<AlertTriangle className="text-rose-600" />} 
          title="Alertas Ausencia" 
          value={criticalAbsences.length} 
          subtitle="2+ faltas consecutivas"
          color="rose"
        />
        <StatCard 
          icon={<DollarSign className="text-emerald-600" />} 
          title="Deuda Total" 
          value={`$${totalDebt.toLocaleString()}`} 
          subtitle="Pendiente de cobro"
          color="emerald"
        />
        <StatCard 
          icon={<TrendingUp className="text-amber-600" />} 
          title="Balance del Mes" 
          value={`$${(income - expenses).toLocaleString()}`} 
          subtitle={`Ing: $${income.toLocaleString()}`}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            Distribución por Modalidad
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modalityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {modalityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {modalityData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-slate-600 truncate">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-6">Actividad Reciente</h3>
          <div className="space-y-4">
            {criticalAbsences.length > 0 ? (
              criticalAbsences.map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 bg-rose-50 rounded-xl border border-rose-100">
                  <div>
                    <p className="font-semibold text-rose-900">{s.firstName} {s.lastName}</p>
                    <p className="text-xs text-rose-600">{s.consecutiveAbsences} inasistencias consecutivas</p>
                  </div>
                  <button className="text-xs bg-rose-600 text-white px-3 py-1.5 rounded-lg hover:bg-rose-700 transition-colors">
                    Contactar
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                No hay alertas críticas en este momento.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string | number, subtitle: string, color: string }> = ({ icon, title, value, subtitle, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl bg-${color}-50`}>{icon}</div>
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</div>
    </div>
    <div className="text-2xl font-bold mb-1">{value}</div>
    <div className="text-sm text-slate-500">{subtitle}</div>
  </div>
);

export default Dashboard;
