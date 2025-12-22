import React from 'react';
import { Calendar, Plus, Repeat, Trash2 } from "lucide-react";
import { Card } from '../ui/Card'; // Make sure Card exists!
import { SmartInput } from '../ui/SmartInput';

export const LifeEventsList = ({ state, addEvent, updateEvent, toggleEventType, removeEvent }) => (
  <Card className="p-5">
      <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
             <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <Calendar className="w-4 h-4 text-emerald-400" />
             </div>
             <h2 className="text-base font-bold text-zinc-100">Life Events</h2>
          </div>
          <button onClick={addEvent} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-lg shadow-emerald-500/20">
              <Plus size={14}/> Add Event
          </button>
      </div>
      <div className="space-y-3">
          {state.lifeEvents.map(ev => (
             <div key={ev.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                <div className="md:col-span-5">
                    <label className="text-[9px] uppercase text-zinc-500 font-bold ml-1 mb-1 block">Goal Name</label>
                    <input value={ev.name} onChange={e=>updateEvent(ev.id,'name',e.target.value)} className="w-full bg-transparent outline-none text-sm text-white font-medium placeholder-zinc-600" placeholder="e.g. Wedding"/>
                </div>
                <div className="md:col-span-1">
                    <label className="text-[9px] uppercase text-zinc-500 font-bold ml-1 mb-1 block">Rpt</label>
                    <button 
                        onClick={()=>toggleEventType(ev.id)} 
                        className={`p-1.5 rounded-md transition-colors ${ev.type === 'recurring' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                        title={ev.type === 'recurring' ? "Recurring Expense" : "One-time Expense"}
                    >
                        <Repeat size={14} />
                    </button>
                </div>
                <div className="md:col-span-2">
                     {ev.type === 'recurring' ? (
                         <div className="flex gap-1">
                             <div className="flex-1">
                                <label className="text-[9px] uppercase text-zinc-500 font-bold ml-1 mb-1 block">Start</label>
                                <SmartInput value={ev.age} onChange={v=>updateEvent(ev.id,'age',v)} className="h-8 text-xs px-1"/>
                             </div>
                             <div className="flex-1">
                                <label className="text-[9px] uppercase text-zinc-500 font-bold ml-1 mb-1 block">End</label>
                                <SmartInput value={ev.endAge} onChange={v=>updateEvent(ev.id,'endAge',v)} placeholder="Death" className="h-8 text-xs px-1"/>
                             </div>
                         </div>
                     ) : (
                         <div>
                             <label className="text-[9px] uppercase text-zinc-500 font-bold ml-1 mb-1 block">Age</label>
                             <SmartInput value={ev.age} onChange={v=>updateEvent(ev.id,'age',v)} className="h-8 text-xs"/>
                         </div>
                     )}
                </div>
                <div className="md:col-span-3">
                     <label className="text-[9px] uppercase text-zinc-500 font-bold ml-1 mb-1 block">Cost ({ev.type === 'recurring' ? 'Yearly' : 'Total'})</label>
                     <SmartInput value={ev.cost} onChange={v=>updateEvent(ev.id,'cost',v)} prefix="₹" className="h-8 text-xs"/>
                </div>
                <div className="md:col-span-1 flex justify-end items-end pb-1">
                     <button onClick={()=>removeEvent(ev.id)} className="p-2 text-zinc-600 hover:text-red-400 bg-transparent hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                </div>
             </div>
          ))}
          {state.lifeEvents.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
                 <p className="text-xs text-zinc-500">No events added. Enjoy the smooth ride!</p>
              </div>
          )}
      </div>
  </Card>
);
