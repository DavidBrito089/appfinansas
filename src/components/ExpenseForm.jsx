import { useState } from 'react';
import { Plus, Calendar, MapPin, Tag, DollarSign, FileText, TrendingUp, TrendingDown, UserCheck } from 'lucide-react';
import { CATEGORY_LIST } from '../utils/categories';

export default function ExpenseForm({ onAddExpense, isExpanded, onToggle }) {
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
        category: 'Otros',
        type: 'expense' // 'expense', 'income', or 'debt'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.amount || parseFloat(formData.amount) <= 0) {
            return;
        }

        const newExpense = {
            title: formData.title.trim(),
            amount: parseFloat(formData.amount),
            date: formData.date,
            location: formData.location.trim(),
            category: formData.category,
            type: formData.type,
            is_paid: false // For debts, tracks if paid back
        };

        onAddExpense(newExpense);

        // Reset form
        setFormData({
            title: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            location: '',
            category: 'Otros',
            type: 'expense'
        });
    };

    const getTypeStyles = () => {
        switch (formData.type) {
            case 'income':
                return 'bg-gradient-to-br from-emerald-500 to-emerald-600';
            case 'debt':
                return 'bg-gradient-to-br from-amber-500 to-amber-600';
            default:
                return 'bg-gradient-to-br from-red-500 to-red-600';
        }
    };

    const getButtonStyles = () => {
        switch (formData.type) {
            case 'income':
                return 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-emerald-500/25';
            case 'debt':
                return 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 hover:shadow-amber-500/25';
            default:
                return 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 hover:shadow-red-500/25';
        }
    };

    const getPlaceholders = () => {
        switch (formData.type) {
            case 'income':
                return { title: 'Ej: Salario mensual', location: 'Ej: Empresa ABC' };
            case 'debt':
                return { title: 'Ej: Préstamo a Juan', location: 'Ej: Nombre de quien debe' };
            default:
                return { title: 'Ej: Cena en restaurante', location: 'Ej: Ciudad de México' };
        }
    };

    const getButtonLabel = () => {
        switch (formData.type) {
            case 'income':
                return 'Agregar Ingreso';
            case 'debt':
                return 'Agregar Deuda';
            default:
                return 'Agregar Gasto';
        }
    };

    const placeholders = getPlaceholders();

    return (
        <div className="glass-card rounded-xl lg:rounded-[2rem] p-3 lg:p-6 border border-white/5 shadow-2xl animate-slide-up stagger-4 h-full">
            {/* Header */}
            <div
                className="flex items-center justify-between cursor-pointer group"
                onClick={onToggle}
            >
                <div className="flex items-center gap-2 lg:gap-4">
                    <div className={`w-9 h-9 lg:w-12 lg:h-12 rounded-xl lg:rounded-[1.2rem] flex items-center justify-center shadow-xl transition-all duration-500 group-hover:scale-110 border border-white/10 ${getTypeStyles()}`}>
                        <Plus className={`w-5 h-5 lg:w-6 lg:h-6 text-white transition-transform duration-500 ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                    <div>
                        <h3 className="font-black text-white text-sm lg:text-lg tracking-tight">
                            <span className="lg:hidden">Nueva Trans.</span>
                            <span className="hidden lg:inline">Nueva Transacción</span>
                        </h3>
                        <div className="hidden lg:flex items-center gap-2 mt-0.5">
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${formData.type === 'income' ? 'bg-emerald-500' : formData.type === 'debt' ? 'bg-amber-500' : 'bg-red-500'}`} />
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                Pulsa para {isExpanded ? 'cerrar' : 'expandir'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-white/5 flex items-center justify-center transition-all duration-500 border border-transparent group-hover:border-white/10 group-hover:bg-white/10 ${isExpanded ? 'rotate-180 shadow-inner' : ''}`}>
                    <Plus size={16} className={`lg:w-5 lg:h-5 text-gray-500 transition-all duration-500 ${isExpanded ? 'rotate-45 text-primary-400' : ''}`} />
                </div>
            </div>

            {/* Form */}
            <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.16, 1, 0.3, 1)] ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-8' : 'grid-rows-[0fr] opacity-0 mt-0 overflow-hidden'}`}>
                <div className="overflow-hidden">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Transaction Type Toggle */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-gray-650 uppercase tracking-[0.2em] px-1">Tipo de Operación</p>
                            <div className="flex bg-white/[0.03] rounded-2xl p-1.5 border border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                                    className={`flex-1 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 ${formData.type === 'expense'
                                        ? 'bg-red-500 text-white shadow-xl shadow-red-500/20 active:scale-95'
                                        : 'text-gray-600 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <TrendingDown size={14} />
                                    Gasto
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                                    className={`flex-1 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 ${formData.type === 'income'
                                        ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 active:scale-95'
                                        : 'text-gray-600 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <TrendingUp size={14} />
                                    Ingreso
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, type: 'debt' }))}
                                    className={`flex-1 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 ${formData.type === 'debt'
                                        ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20 active:scale-95'
                                        : 'text-gray-600 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <UserCheck size={14} />
                                    Préstamo
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Title */}
                            <div className="space-y-2 group/input">
                                <label className="block text-[10px] font-black text-gray-650 uppercase tracking-widest px-1">
                                    {formData.type === 'debt' ? 'Destinatario / Concepto' : 'Descripción'}
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-600 group-focus-within/input:text-primary-400 transition-colors">
                                        <FileText size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder={placeholders.title}
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-white placeholder-gray-700 focus:outline-none focus:border-primary-500/50 focus:bg-white/[0.06] transition-all text-sm font-bold tracking-tight"
                                    />
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="space-y-2 group/input">
                                <label className="block text-[10px] font-black text-gray-650 uppercase tracking-widest px-1">Monto de la operación</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-600 group-focus-within/input:text-primary-400 transition-colors">
                                        <DollarSign size={18} />
                                    </div>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        min="0.01"
                                        step="0.01"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-white placeholder-gray-700 focus:outline-none focus:border-primary-500/50 focus:bg-white/[0.06] transition-all text-sm font-black tracking-tighter"
                                    />
                                </div>
                            </div>

                            {/* Date */}
                            <div className="space-y-2 group/input">
                                <label className="block text-[10px] font-black text-gray-650 uppercase tracking-widest px-1">Fecha de registro</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-600 group-focus-within/input:text-primary-400 transition-colors">
                                        <Calendar size={18} />
                                    </div>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-white focus:outline-none focus:border-primary-500/50 focus:bg-white/[0.06] transition-all text-sm font-bold [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            {/* Location / Debtor */}
                            <div className="space-y-2 group/input">
                                <label className="block text-[10px] font-black text-gray-650 uppercase tracking-widest px-1">
                                    {formData.type === 'debt' ? 'Deudor' : 'Ubicación'}
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-600 group-focus-within/input:text-primary-400 transition-colors">
                                        {formData.type === 'debt' ? (
                                            <UserCheck size={18} />
                                        ) : (
                                            <MapPin size={18} />
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder={placeholders.location}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-white placeholder-gray-700 focus:outline-none focus:border-primary-500/50 focus:bg-white/[0.06] transition-all text-sm font-bold tracking-tight"
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div className="space-y-2 group/input">
                                <label className="block text-[10px] font-black text-gray-650 uppercase tracking-widest px-1">Categoría</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-600 group-focus-within/input:text-primary-400 transition-colors pointer-events-none">
                                        <Tag size={18} />
                                    </div>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-white focus:outline-none focus:border-primary-500/50 focus:bg-white/[0.06] transition-all text-sm font-bold appearance-none cursor-pointer"
                                    >
                                        {CATEGORY_LIST.map(cat => (
                                            <option key={cat} value={cat} className="bg-gray-900 font-bold">
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                                        <TrendingDown size={14} className="rotate-[270deg]" />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    className={`
                                        w-full h-[54px] rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white
                                        transition-all duration-300 shadow-2xl flex items-center justify-center gap-3
                                        hover:scale-[1.02] active:scale-[0.98] border border-white/10
                                        ${getButtonStyles()}
                                    `}
                                >
                                    <Plus size={20} className="transition-transform group-hover:rotate-90" />
                                    <span>{getButtonLabel()}</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
