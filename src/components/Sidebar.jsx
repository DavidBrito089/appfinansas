import { useState } from 'react';
import {
    Plus,
    Trash2,
    FileSpreadsheet,
    ChevronLeft,
    ChevronRight,
    Wallet
} from 'lucide-react';

export default function Sidebar({
    sheets,
    activeSheetId,
    onSelectSheet,
    onCreateSheet,
    onDeleteSheet
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newSheetTitle, setNewSheetTitle] = useState('');

    const handleCreateSheet = (e) => {
        e.preventDefault();
        if (newSheetTitle.trim()) {
            onCreateSheet(newSheetTitle.trim());
            setNewSheetTitle('');
            setIsCreating(false);
        }
    };

    const handleDeleteSheet = (e, sheetId) => {
        e.stopPropagation();
        if (window.confirm('¿Estás seguro de eliminar esta hoja de gastos?')) {
            onDeleteSheet(sheetId);
        }
    };

    return (
        <aside
            className={`
        h-screen glass-card flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16, 1, 0.3, 1)]
        ${isCollapsed ? 'w-20' : 'w-72'} border-r border-white-[0.05]
      `}
        >
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 animate-fade-in group/logo cursor-default">
                            <div className="w-11 h-11 rounded-[1.2rem] bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-xl animate-float border border-white/10 group-hover/logo:scale-110 transition-transform duration-300">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="font-black text-white text-lg tracking-tight">ExpenseTracker</h1>
                                <p className="text-[10px] text-primary-400 font-bold uppercase tracking-[0.2em]">Pro Edition</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 text-gray-500 hover:text-white border border-transparent hover:border-white/10 ${isCollapsed ? 'mx-auto' : ''}`}
                    >
                        {isCollapsed ? <ChevronRight size={22} className="animate-float" /> : <ChevronLeft size={22} />}
                    </button>
                </div>
            </div>

            {/* Create New Sheet Button */}
            <div className={`p-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
                {!isCollapsed ? (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="w-full flex items-center gap-3 px-5 py-4 rounded-[1.2rem] bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold transition-all duration-300 shadow-xl hover:shadow-primary-500/40 hover:scale-[1.03] active:scale-[0.98] border border-white/10 group"
                    >
                        <div className="p-1 rounded-lg bg-white/20 group-hover:rotate-90 transition-transform duration-300">
                            <Plus size={20} />
                        </div>
                        <span className="tracking-wide">Nueva Hoja</span>
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            setIsCollapsed(false);
                            setIsCreating(true);
                        }}
                        className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-300"
                    >
                        <Plus size={24} />
                    </button>
                )}
            </div>

            {/* Create Sheet Form */}
            {isCreating && !isCollapsed && (
                <div className="px-4 pb-4">
                    <div className="glass rounded-[1.2rem] p-4 border-glow animate-fade-in">
                        <form onSubmit={handleCreateSheet} className="space-y-3">
                            <input
                                type="text"
                                value={newSheetTitle}
                                onChange={(e) => setNewSheetTitle(e.target.value)}
                                placeholder="Nombre de la hoja..."
                                autoFocus
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:bg-white/[0.08] transition-all text-sm font-medium"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-accent-600 hover:bg-accent-500 text-white text-xs font-bold transition-all hover:scale-105 active:scale-95"
                                >
                                    Crear
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreating(false);
                                        setNewSheetTitle('');
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-medium transition-all"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Sheets List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                {!isCollapsed && sheets.length > 0 && (
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.25em] mb-4 px-2">
                        Hojas de Gastos
                    </p>
                )}
                <div className="space-y-2">
                    {sheets.map((sheet, index) => (
                        <div
                            key={sheet.id}
                            onClick={() => onSelectSheet(sheet.id)}
                            className={`
                group relative flex items-center gap-3 px-4 py-4 rounded-[1.2rem] cursor-pointer transition-all duration-300
                ${activeSheetId === sheet.id
                                    ? 'bg-white/[0.08] border border-white/10 shadow-xl border-glow'
                                    : 'hover:bg-white/[0.04] border border-transparent'
                                }
                animate-slide-in
              `}
                            style={{ animationDelay: `${index * 80}ms` }}
                        >
                            {/* Selection Indicator */}
                            {activeSheetId === sheet.id && (
                                <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-primary-400 to-accent-400 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
                            )}

                            <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300
                ${activeSheetId === sheet.id
                                    ? 'bg-gradient-to-br from-primary-500/40 to-accent-600/40 text-white shadow-inner'
                                    : 'bg-white/5 text-gray-500 group-hover:text-primary-400 group-hover:bg-white/10'
                                }
              `}>
                                <FileSpreadsheet size={20} className={activeSheetId === sheet.id ? 'animate-pulse-glow' : ''} />
                            </div>

                            {!isCollapsed && (
                                <>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold truncate tracking-tight transition-colors duration-300 ${activeSheetId === sheet.id ? 'text-white' : 'text-gray-400 group-hover:text-white'
                                            }`}>
                                            {sheet.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className={`w-1 h-1 rounded-full ${activeSheetId === sheet.id ? 'bg-primary-500' : 'bg-gray-700'}`} />
                                            <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wider">
                                                {new Date(sheet.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => handleDeleteSheet(e, sheet.id)}
                                        className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all duration-300 hover:scale-110"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </>
                            )}

                            {/* Tooltip for collapsed mode */}
                            {isCollapsed && (
                                <div className="absolute left-20 px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-50 shadow-2xl border border-white/10">
                                    {sheet.title}
                                </div>
                            )}
                        </div>
                    ))}

                    {sheets.length === 0 && !isCollapsed && (
                        <div className="text-center py-10 animate-fade-in">
                            <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                <FileSpreadsheet className="w-8 h-8 text-gray-700" />
                            </div>
                            <p className="text-sm font-bold text-gray-500 tracking-tight">Sin hojas de gastos</p>
                            <p className="text-xs text-gray-600 mt-1">Crea una nueva hoja para comenzar</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            {!isCollapsed && (
                <div className="p-6 border-t border-white/5">
                    <div className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-400 transition-colors cursor-default group">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
                            System Active
                        </p>
                    </div>
                </div>
            )}
        </aside>
    );
}
