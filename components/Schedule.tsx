
import React from 'react';
import { DAYS_OF_WEEK, HOURS } from '../constants';
import { Clock, Users, Music } from 'lucide-react';

const Schedule: React.FC = () => {
  // Clear hardcoded mock events to start with an empty schedule
  const events: any[] = [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Grilla de Horarios</h2>
          <p className="text-slate-500">Cronograma semanal de clases y ensambles.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 border-r border-slate-200 w-24">
                   <Clock size={16} className="mx-auto text-slate-400" />
                </th>
                {DAYS_OF_WEEK.map(day => (
                  <th key={day} className="p-4 text-sm font-bold text-slate-700 border-r border-slate-200 uppercase tracking-widest">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map(hour => (
                <tr key={hour} className="border-b border-slate-100 hover:bg-slate-50 transition-colors h-24">
                  <td className="p-4 text-xs font-bold text-slate-400 text-center border-r border-slate-200 bg-slate-50/50">
                    {hour}
                  </td>
                  {DAYS_OF_WEEK.map(day => {
                    const event = events.find(e => e.day === day && e.time === hour);
                    return (
                      <td key={`${day}-${hour}`} className="p-2 border-r border-slate-200 align-top min-w-[150px]">
                        {event && (
                          <div className={`p-3 rounded-xl shadow-sm border h-full flex flex-col justify-between ${
                            event.mod === 'Ensamble' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                          }`}>
                            <div>
                              <p className="text-[10px] font-bold uppercase opacity-60 mb-1">{event.mod}</p>
                              <p className="text-sm font-bold leading-tight">{event.student}</p>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-semibold mt-2 opacity-80">
                              <Music size={10} /> {event.instrument}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
