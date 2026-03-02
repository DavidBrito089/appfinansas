import { Filter, Calendar, DollarSign, TrendingUp, TrendingDown, Clock, X, ChevronDown } from 'lucide-react';

export default function TransactionFilters({ filters, onFilterChange, onClearFilters, isExpanded, onToggle }) {

    const hasActiveFilters = filters.dateFrom || filters.dateTo || filters.type !== 'all' || filters.amountMin || filters.amountMax;

    const handleChange = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const typeOptions = [
        { value: 'all', label: 'Todos', icon: null },
        { value: 'expense', label: 'Gastos', icon: TrendingDown, color: 'text-red-400' },
        { value: 'income', label: 'Ingresos', icon: TrendingUp, color: 'text-emerald-400' },
        { value: 'debt', label: 'Préstamos', icon: Clock, color: 'text-amber-400' },
        { value: 'debt_pending', label: 'Deudas Pendientes', icon: Clock, color: 'text-amber-400' },
        { value: 'debt_paid', label: 'Deudas Pagadas', icon: Clock, color: 'text-emerald-400' },
    ];

    return (
        <div className="glass-card rounded-xl lg:rounded-[2rem] p-3 lg:p-6 border border-white/5 shadow-2xl animate-slide-up stagger-2 h-full">
            {/* Header */}
            <div
                className="flex items-center justify-between cursor-pointer group"
                onClick={onToggle}
            >
                <div className="flex items-center gap-2 lg:gap-4">
                    <div className={`w-9 h-9 lg:w-12 lg:h-12 rounded-xl lg:rounded-[1.2rem] flex items-center justify-center shadow-xl transition-all duration-500 group-hover:scale-110 border border-white/10 ${hasActiveFilters ? 'bg-gradient-to-br from-primary-500 to-accent-600' : 'bg-white/5'}`}>
                        <Filter className={`w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-500 ${hasActiveFilters ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div>
                        <h3 className="font-black text-white text-sm lg:text-lg tracking-tight">
                            <span className="lg:hidden">Filtrar</span>
                            <span className="hidden lg:inline">Filtrar Transacciones</span>
                        </h3>
                        <div className="hidden lg:flex items-center gap-2 mt-0.5">
                            {hasActiveFilters ? (
                                <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">
                                    Filtros activos
                                </span>
                            ) : (
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    Sin filtros aplicados
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 lg:gap-2">
                    {hasActiveFilters && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClearFilters();
                            }}
                            className="hidden lg:block px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
                        >
                            Limpiar
                        </button>
                    )}
                    <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-white/5 flex items-center justify-center transition-all duration-500 border border-transparent group-hover:border-white/10 group-hover:bg-white/10 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={16} className="lg:w-5 lg:h-5 text-gray-500" />
                    </div>
                </div>
            </div>

            {/* Filter Controls */}
            <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.16, 1, 0.3, 1)] ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-8' : 'grid-rows-[0fr] opacity-0 mt-0 overflow-hidden'}`}>
                <div className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Date From */}
                        <div className="space-y-2 group/input">
                            <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">
                                Desde
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-600 group-focus-within/input:text-primary-400 transition-colors">
                                    <Calendar size={18} />
                                </div>
                                <input
                                    type="date"
                                    value={filters.dateFrom || ''}
                                    onChange={(e) => handleChange('dateFrom', e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white focus:outline-none focus:border-primary-500/50 focus:bg-white/[0.08] transition-all text-sm font-bold [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        {/* Date To */}
                        <div className="space-y-2 group/input">
                            <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">
                                Hasta
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-600 group-focus-within/input:text-primary-400 transition-colors">
                                    <Calendar size={18} />
                                </div>
                                <input
                                    type="date"
                                    value={filters.dateTo || ''}
                                    onChange={(e) => handleChange('dateTo', e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white focus:outline-none focus:border-primary-500/50 focus:bg-white/[0.08] transition-all text-sm font-bold [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        {/* Amount Min */}
                        <div className="space-y-2 group/input">
                            <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">
                                Monto Mínimo
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-600 group-focus-within/input:text-primary-400 transition-colors">
                                    <DollarSign size={18} />
                                </div>
                                <input
                                    type="number"
                                    value={filters.amountMin || ''}
                                    onChange={(e) => handleChange('amountMin', e.target.value)}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-gray-600 focus:outline-none focus:border-primary-500/50 focus:bg-white/[0.08] transition-all text-sm font-black tracking-tighter"
                                />
                            </div>
                        </div>

                        {/* Amount Max */}
                        <div className="space-y-2 group/input">
                            <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">
                                Monto Máximo
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-600 group-focus-within/input:text-primary-400 transition-colors">
                                    <DollarSign size={18} />
                                </div>
                                <input
                                    type="number"
                                    value={filters.amountMax || ''}
                                    onChange={(e) => handleChange('amountMax', e.target.value)}
                                    placeholder="∞"
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-gray-600 focus:outline-none focus:border-primary-500/50 focus:bg-white/[0.08] transition-all text-sm font-black tracking-tighter"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Transaction Type Filter */}
                    <div className="mt-6 space-y-3">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] px-1">Tipo de Transacción</p>
                        <div className="flex flex-wrap gap-2">
                            {typeOptions.map((option) => {
                                const isActive = filters.type === option.value;
                                const IconComponent = option.icon;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => handleChange('type', option.value)}
                                        className={`
                                            px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300
                                            flex items-center gap-2
                                            ${isActive
                                                ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20'
                                                : 'bg-white/[0.03] text-gray-500 hover:bg-white/[0.06] hover:text-white border border-white/5'
                                            }
                                        `}
                                    >
                                        {IconComponent && <IconComponent size={14} className={isActive ? 'text-white' : option.color} />}
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
