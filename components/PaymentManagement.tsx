
import React, { useState, useMemo } from 'react';
import { Student, ClassCategory, ClassType, ClassDuration, EnsambleType, Transaction, Enrollment } from '../types';
import { PRICING_TABLE } from '../constants';
import { 
  CreditCard, 
  Music, 
  User, 
  Tag, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Clock,
  History,
  Banknote
} from 'lucide-react';

interface Props {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const PaymentManagement: React.FC<Props> = ({ students, setStudents, setTransactions }) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [category, setCategory] = useState<ClassCategory>(ClassCategory.COMBO);
  const [classType, setClassType] = useState<ClassType>(ClassType.INDIVIDUAL);
  const [duration, setDuration] = useState<ClassDuration>(ClassDuration.MIN_45);
  const [ensambleType, setEnsambleType] = useState<EnsambleType>(EnsambleType.ADICIONAL);
  const [earlyPay, setEarlyPay] = useState(false);
  const [includeRegistration, setIncludeRegistration] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [markAsPaidNow, setMarkAsPaidNow] = useState(false);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const currentPrice = useMemo(() => {
    let price = 0;
    if (category === ClassCategory.COMBO) {
      price = PRICING_TABLE.COMBOS[classType === ClassType.INDIVIDUAL ? 'INDIVIDUAL' : 'DUPLA'][duration];
      if (earlyPay) price = price * 0.9;
    } else if (category === ClassCategory.SUELTA) {
      price = PRICING_TABLE.SUELTAS[classType === ClassType.INDIVIDUAL ? 'INDIVIDUAL' : 'DUPLA'][duration];
    } else if (category === ClassCategory.ENSAMBLE) {
      switch (ensambleType) {
        case EnsambleType.ADICIONAL: price = earlyPay ? PRICING_TABLE.ENSAMBLES.ADICIONAL_EP : PRICING_TABLE.ENSAMBLES.ADICIONAL; break;
        case EnsambleType.UNICA: price = earlyPay ? PRICING_TABLE.ENSAMBLES.UNICA_EP : PRICING_TABLE.ENSAMBLES.UNICA; break;
        case EnsambleType.ADICIONAL_SUELTA: price = PRICING_TABLE.ENSAMBLES.ADICIONAL_SUELTA; break;
        case EnsambleType.UNICA_SUELTA: price = PRICING_TABLE.ENSAMBLES.UNICA_SUELTA; break;
      }
    } else if (category === ClassCategory.PRACTICA) {
      price = PRICING_TABLE.PRACTICA[duration];
    }
    return Math.round(price);
  }, [category, classType, duration, ensambleType, earlyPay]);

  const totalToCharge = includeRegistration ? currentPrice + PRICING_TABLE.INSCRIPCION.INDIVIDUAL : currentPrice;

  const handleCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    const enrollmentId = Math.random().toString(36).substr(2, 9);
    const newEnrollment: Enrollment = { 
      id: enrollmentId,
      category, 
      type: classType, 
      duration, 
      ensambleType, 
      price: totalToCharge,
      date: new Date().toISOString()
    };

    // 1. Cargamos el plan al alumno y actualizamos deuda
    setStudents(prev => prev.map(s => s.id === selectedStudentId ? { 
      ...s, 
      debt: markAsPaidNow ? s.debt : s.debt + totalToCharge, // Si paga ahora, la deuda no sube o se netea
      enrollments: [...s.enrollments, newEnrollment]
    } : s));

    // 2. Si se marca como pagado ahora, generamos la transacción de ingreso
    if (markAsPaidNow) {
      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        amount: totalToCharge,
        category: 'Cuota Alumno',
        description: `Pago inmediato: ${selectedStudent?.firstName} (${category})`,
        metadata: { studentId: selectedStudentId, method: paymentMethod }
      };
      setTransactions(prev => [newTx, ...prev]);
    }

    alert(`Plan "${category}" cargado correctamente a ${selectedStudent?.firstName}.`);
    resetForm();
  };

  const resetForm = () => {
    setSelectedStudentId(''); setCategory(ClassCategory.COMBO); setEarlyPay(false); setIncludeRegistration(false); setMarkAsPaidNow(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-ams-dark tracking-tight">Gestión de Planes</h2>
          <p className="text-ams-brown/70 font-medium uppercase text-[10px] tracking-widest font-black">Carga Mensual y Planificación Académica</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleCharge} className="bg-white rounded-[3rem] p-10 shadow-sm border border-ams-peach space-y-10">
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-[10px] font-black text-ams-brown/40 uppercase tracking-widest"><User size={16} className="text-ams-orange" /> Seleccionar Alumno de la Base</label>
              <select 
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-[#FDF6F2] border-none rounded-2xl px-6 py-5 font-black text-ams-dark ring-1 ring-ams-peach focus:ring-2 focus:ring-ams-orange transition-all outline-none"
              >
                <option value="">Buscar alumno...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.instrument})</option>)}
              </select>
            </div>

            <div className="bg-[#FDF6F2] p-8 rounded-[2.5rem] border-2 border-ams-peach space-y-8">
              <div className="flex items-center gap-3 font-black text-ams-dark uppercase text-xs tracking-widest"><Music size={18} className="text-ams-orange" /> Configuración del Plan</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-ams-brown/40 uppercase mb-3">Categoría de Actividad</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(ClassCategory).map(cat => (
                      <button 
                        key={cat} type="button" onClick={() => setCategory(cat)}
                        className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${category === cat ? 'bg-ams-orange text-white border-ams-orange shadow-lg' : 'bg-white text-ams-brown/60 border-ams-peach hover:bg-ams-peach/20'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {category === ClassCategory.ENSAMBLE ? (
                  <div>
                    <label className="block text-[10px] font-black text-ams-brown/40 uppercase mb-3">Tipo de Ensamble</label>
                    <select value={ensambleType} onChange={(e) => setEnsambleType(e.target.value as EnsambleType)} className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs font-black text-ams-dark ring-1 ring-ams-peach outline-none">
                      {Object.values(EnsambleType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-ams-brown/40 uppercase mb-3">Modalidad</label>
                      <select value={classType} onChange={(e) => setClassType(e.target.value as ClassType)} className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs font-black text-ams-dark ring-1 ring-ams-peach outline-none">
                        {Object.values(ClassType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-ams-brown/40 uppercase mb-3">Duración</label>
                      <select value={duration} onChange={(e) => setDuration(e.target.value as ClassDuration)} className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs font-black text-ams-dark ring-1 ring-ams-peach outline-none">
                        {Object.values(ClassDuration).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-3 cursor-pointer group bg-white px-4 py-3 rounded-2xl border border-ams-peach hover:border-ams-orange transition-all">
                  <input type="checkbox" checked={includeRegistration} onChange={(e) => setIncludeRegistration(e.target.checked)} className="w-5 h-5 accent-ams-orange" />
                  <span className="text-[10px] font-black text-ams-dark uppercase tracking-widest">Cobrar Inscripción (+$55.000)</span>
                </label>

                {(category === ClassCategory.COMBO || (category === ClassCategory.ENSAMBLE && (ensambleType === EnsambleType.ADICIONAL || ensambleType === EnsambleType.UNICA))) && (
                  <label className="flex items-center gap-3 cursor-pointer group bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-200 hover:border-emerald-500 transition-all">
                    <input type="checkbox" checked={earlyPay} onChange={(e) => setEarlyPay(e.target.checked)} className="w-5 h-5 accent-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1"><Tag size={12}/> Pago Temprano (EP)</span>
                  </label>
                )}
              </div>
            </div>

            {/* OPCIÓN DE PAGO INMEDIATO */}
            <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border-2 border-emerald-100 space-y-6">
              <label className="flex items-center gap-4 cursor-pointer">
                <input type="checkbox" checked={markAsPaidNow} onChange={(e) => setMarkAsPaidNow(e.target.checked)} className="w-6 h-6 accent-emerald-600" />
                <span className="text-sm font-black text-emerald-900 uppercase tracking-widest">¿Se paga en este momento?</span>
              </label>

              {markAsPaidNow && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] font-black text-emerald-700/50 uppercase mb-3">Medio de Pago</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full bg-white border-none rounded-xl px-6 py-4 font-black text-emerald-900 ring-2 ring-emerald-200 outline-none">
                    <option value="Efectivo">Efectivo 💵</option>
                    <option value="Transferencia">Transferencia 🏦</option>
                    <option value="Mercado Pago">Mercado Pago 📲</option>
                  </select>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={!selectedStudentId}
              className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 ${selectedStudentId ? 'bg-ams-dark text-white hover:scale-[1.02] shadow-ams-dark/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              {markAsPaidNow ? 'Confirmar Cargo y Pago' : 'Confirmar Cargo Mensual'} <ArrowRight size={18} />
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-ams-orange p-10 rounded-[3rem] text-white shadow-xl shadow-ams-orange/20 relative overflow-hidden">
            <CreditCard className="absolute -right-4 -bottom-4 opacity-10 rotate-12" size={120} />
            <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.3em] mb-2">Monto a Facturar</p>
            <h4 className="text-5xl font-black tracking-tighter">${totalToCharge.toLocaleString()}</h4>
            <div className="mt-8 pt-8 border-t border-white/20 space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase opacity-80">
                <span>Cuota Académica</span>
                <span>${currentPrice.toLocaleString()}</span>
              </div>
              {includeRegistration && (
                <div className="flex justify-between text-[10px] font-black uppercase opacity-80">
                  <span>Matrícula</span>
                  <span>$55.000</span>
                </div>
              )}
            </div>
          </div>

          {selectedStudent && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-ams-peach shadow-sm">
              <h5 className="text-[10px] font-black text-ams-brown/40 uppercase tracking-widest mb-6 flex items-center gap-2"><History size={16}/> Resumen de Alumno</h5>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-black text-ams-dark">{selectedStudent.firstName} {selectedStudent.lastName}</p>
                  <p className="text-[10px] text-ams-orange font-black uppercase tracking-widest">{selectedStudent.instrument}</p>
                </div>
                <div className={`p-4 rounded-2xl border flex justify-between items-center ${selectedStudent.debt > 0 ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                  <span className="text-[10px] font-black uppercase">Balance Actual</span>
                  <span className="text-xl font-black">${selectedStudent.debt.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;
