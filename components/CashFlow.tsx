
import React, { useState } from 'react';
import { Transaction, Student } from '../types';
import { Plus, ArrowUpCircle, ArrowDownCircle, Search, Calendar, Filter, DollarSign, Trash2, AlertCircle, XCircle } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

const CashFlow: React.FC<Props> = ({ transactions, setTransactions, setStudents }) => {
  const [showModal, setShowModal] = useState(false);
  
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: formData.get('date') as string,
      type: formData.get('type') as 'income' | 'expense',
      amount: parseFloat(formData.get('amount') as string),
      category: formData.get('category') as string,
      description: formData.get('description') as string,
    };
    setTransactions(prev => [newTx, ...prev]);
    setShowModal(false);
  };

  const deleteTransaction = (e: React.MouseEvent, tx: Transaction) => {
    e.stopPropagation();
    const isStudentPayment = tx.metadata?.studentId;
    const confirmMessage = isStudentPayment 
      ? `⚠️ ¿Anular este cobro de $${tx.amount.toLocaleString()}? \n\nSe ELIMINARÁ de la caja y se RESTAURARÁ la deuda al alumno.`
      : `¿Eliminar este registro de $${tx.amount.toLocaleString()} de la caja?`;

    if (confirm(confirmMessage)) {
      setTransactions(prev => prev.filter(t => t.id !== tx.id));

      if (isStudentPayment) {
        setStudents(prev => prev.map(s => {
          if (s.id === tx.metadata?.studentId) {
            return { ...s, debt: s.debt + tx.amount };
          }
          return s;
        }));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-ams-dark tracking-tight">Caja Diaria</h2>
          <p className="text-ams-brown/70 font-medium uppercase text-[10px] tracking-widest font-black">Control financiero centralizado</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-ams-orange text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:scale-105 shadow-xl shadow-ams-orange/20 transition-all text-xs uppercase tracking-widest"
        >
          <Plus size={20} /> Nuevo Movimiento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatBox icon={<ArrowUpCircle size={24} />} label="Ingresos Totales" value={totalIncome} color="emerald" />
        <StatBox icon={<ArrowDownCircle size={24} />} label="Egresos Totales" value={totalExpense} color="rose" />
        <div className="bg-ams-dark p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 rotate-12 group-hover:scale-110 transition-transform"><DollarSign size={120} /></div>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 relative z-10">Balance Neto Actual</p>
          <p className="text-4xl font-black text-white relative z-10">${(totalIncome - totalExpense).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-ams-peach overflow-hidden">
        <div className="p-6 border-b border-ams-peach flex items-center justify-between bg-ams-peach/5">
          <h3 className="font-black text-ams-dark text-sm uppercase tracking-widest">Historial de Movimientos</h3>
          <div className="flex gap-2">
            <button className="p-2.5 bg-white border border-ams-peach rounded-xl text-ams-brown hover:bg-ams-peach/20 transition-all"><Filter size={18}/></button>
            <button className="p-2.5 bg-white border border-ams-peach rounded-xl text-ams-brown hover:bg-ams-peach/20 transition-all"><Calendar size={18}/></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase text-ams-brown/40 font-black border-b border-ams-peach bg-ams-peach/5">
                <th className="px-8 py-5">Fecha</th>
                <th className="px-8 py-5">Categoría</th>
                <th className="px-8 py-5">Descripción</th>
                <th className="px-8 py-5">Monto</th>
                <th className="px-8 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ams-peach/30">
              {transactions.length > 0 ? transactions.map(t => (
                <tr key={t.id} className="hover:bg-ams-peach/5 transition-colors group">
                  <td className="px-8 py-5 text-xs font-bold text-ams-brown">{t.date}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      t.type === 'income' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {t.category}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-ams-dark italic">"{t.description}"</td>
                  <td className={`px-8 py-5 font-black text-lg ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={(e) => deleteTransaction(e, t)} 
                      className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      title="Anular/Eliminar registro"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <AlertCircle size={48} className="mx-auto text-ams-peach mb-4 opacity-50" />
                    <p className="text-ams-brown/30 font-bold italic">No hay movimientos registrados en la caja.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-ams-dark/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-ams-dark">Nuevo Movimiento</h3>
              <button onClick={() => setShowModal(false)} className="text-ams-brown/30 hover:text-ams-dark"><XCircle size={32}/></button>
            </div>
            <form onSubmit={handleAddTransaction} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-ams-brown/50 uppercase tracking-widest mb-3">Tipo de Flujo</label>
                  <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" name="type" value="income" defaultChecked className="hidden peer" />
                      <div className="py-4 text-center border-2 border-ams-peach rounded-2xl peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 transition-all font-black uppercase text-xs">Ingreso 📈</div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" name="type" value="expense" className="hidden peer" />
                      <div className="py-4 text-center border-2 border-ams-peach rounded-2xl peer-checked:border-rose-500 peer-checked:bg-rose-50 peer-checked:text-rose-700 transition-all font-black uppercase text-xs">Egreso 📉</div>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-ams-brown/50 uppercase tracking-widest mb-2">Fecha</label>
                  <input type="date" name="date" required className="w-full bg-[#FDF6F2] border-none rounded-2xl px-5 py-4 font-bold text-ams-dark ring-1 ring-ams-peach" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-ams-brown/50 uppercase tracking-widest mb-2">Monto ($)</label>
                  <input type="number" name="amount" required className="w-full bg-[#FDF6F2] border-none rounded-2xl px-5 py-4 font-bold text-ams-dark ring-1 ring-ams-peach" placeholder="0.00" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-ams-brown/50 uppercase tracking-widest mb-2">Categoría</label>
                  <input type="text" name="category" required className="w-full bg-[#FDF6F2] border-none rounded-2xl px-5 py-4 font-bold text-ams-dark ring-1 ring-ams-peach" placeholder="Ej: Varios, Insumos, Alquiler..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-ams-brown/50 uppercase tracking-widest mb-2">Descripción</label>
                  <input type="text" name="description" required className="w-full bg-[#FDF6F2] border-none rounded-2xl px-5 py-4 font-bold text-ams-dark ring-1 ring-ams-peach" placeholder="Detalle el movimiento" />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 text-ams-brown font-black bg-ams-peach/30 rounded-2xl text-[10px] uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="flex-1 bg-ams-orange text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-ams-orange/20 hover:scale-[1.02] transition-all">Guardar en Caja</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox: React.FC<{ icon: React.ReactNode, label: string, value: number, color: 'emerald' | 'rose' }> = ({ icon, label, value, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-ams-peach shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-5">
      <div className={`p-4 rounded-3xl ${color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} shadow-inner`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-ams-brown/40 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className={`text-3xl font-black ${color === 'emerald' ? 'text-emerald-700' : 'text-rose-700'}`}>${value.toLocaleString()}</p>
      </div>
    </div>
  </div>
);

export default CashFlow;
