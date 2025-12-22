import React, { useState } from 'react';
import { Plus, X, Copy, Edit2, Check } from "lucide-react";

export const ScenarioTabs = ({ scenarios, activeId, onSwitch, onAdd, onDelete, onRename }) => {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const startEditing = (id, currentName) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveEdit = () => {
    if (editName.trim()) {
      onRename(editingId, editName);
    }
    setEditingId(null);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
      {Object.keys(scenarios).map(id => {
        const isActive = id === activeId;
        return (
          <div 
            key={id}
            onClick={() => !editingId && onSwitch(id)}
            className={`
              relative group flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all border
              ${isActive 
                ? 'bg-emerald-600/20 border-emerald-500/50 text-white shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]' 
                : 'bg-slate-900/50 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
            `}
          >
            {editingId === id ? (
              <div className="flex items-center gap-1">
                 <input 
                    autoFocus
                    className="bg-black/50 text-white text-xs px-1 py-0.5 rounded outline-none border border-emerald-500/50 w-24"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    onBlur={saveEdit}
                 />
                 <button onClick={saveEdit}><Check size={12} className="text-emerald-400"/></button>
              </div>
            ) : (
              <>
                 <span className="text-xs font-bold whitespace-nowrap">{scenarios[id].scenarioName || "Untitled"}</span>
                 
                 {/* Quick Actions (Hover) */}
                 {isActive && (
                    <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/10">
                        <button 
                            onClick={(e) => { e.stopPropagation(); startEditing(id, scenarios[id].scenarioName); }} 
                            className="text-slate-400 hover:text-white"
                            title="Rename"
                        >
                            <Edit2 size={10} />
                        </button>
                        {Object.keys(scenarios).length > 1 && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); if(confirm('Delete this scenario?')) onDelete(id); }} 
                                className="text-slate-400 hover:text-rose-400"
                                title="Delete"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                 )}
              </>
            )}
          </div>
        );
      })}

      <button 
        onClick={onAdd}
        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-dashed border-slate-700 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/50 transition-all text-xs font-bold uppercase tracking-wide whitespace-nowrap"
      >
        <Plus size={14} /> New Plan
      </button>
    </div>
  );
};