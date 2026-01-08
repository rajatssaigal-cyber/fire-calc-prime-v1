import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, LogOut, User, Cloud } from 'lucide-react';

export const AuthButton = () => {
    const { user, login, logout } = useAuth();

    if (user) {
        return (
            <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
                {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-6 h-6 rounded-full ml-1" />
                ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center ml-1">
                        <User size={12} className="text-slate-400"/>
                    </div>
                )}
                <div className="hidden md:flex flex-col items-start mr-2">
                    <span className="text-[9px] text-emerald-400 font-bold leading-none flex items-center gap-1">
                        <Cloud size={8}/> Synced
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 leading-none">{user.displayName?.split(' ')[0]}</span>
                </div>
                <button 
                    onClick={logout} 
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-white/5 rounded-md transition-colors"
                    title="Logout"
                >
                    <LogOut size={14}/>
                </button>
            </div>
        );
    }

    return (
        <button 
            onClick={login}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-lg shadow-indigo-500/20"
        >
            <LogIn size={14} />
            <span className="hidden md:inline">Login / Save</span>
            <span className="md:hidden">Login</span>
        </button>
    );
};
