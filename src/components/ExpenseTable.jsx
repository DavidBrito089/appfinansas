import { useState } from 'react';
import { Trash2, MapPin, Calendar, Receipt, StickyNote, TrendingUp, TrendingDown, UserCheck, CheckCircle, Clock, Undo2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/supabaseStorage';
import { getCategoryStyle } from '../utils/categories';
import ExpenseModal from './ExpenseModal';

export default function ExpenseTable({ expenses, onDeleteExpense, onUpdateExpense, onMarkDebtPaid, onRevertDebt, totalIncome, totalExpenses, totalPendingDebts, balance }) {
    const [selectedExpense, setSelectedExpense] = useState(null);

    const handleSaveNotes = async (expenseId, notes) => {
        await onUpdateExpense(expenseId, { notes });
    };

    const handleMarkAsPaid = async (e, expense) => {
        e.stopPropagation();
        if (window.confirm(`¿Confirmas que ${expense.location || 'la persona'} te pagó $${expense.amount}?`)) {
            await onMarkDebtPaid(expense);
        }
    };

    const handleRevertDebt = async (e, expense) => {
        e.stopPropagation();
        if (window.confirm(`¿Revertir deuda a estado pendiente? ${expense.location || 'La persona'} volverá a deberte $${expense.amount}.`)) {
            await onRevertDebt(expense);
        }
    };

    if (!expenses || expenses.length === 0) {
        return (
            <div className="glass-card rounded-2xl p-8 text-center">
                <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">Sin transacciones registradas</h3>
                <p className="text-sm text-gray-500">
                    Añade tu primer ingreso, gasto o préstamo usando el formulario de arriba
                </p>
            </div>
        );
    }

    const getTypeIcon = (expense) => {
        if (expense.type === 'debt') {
            return expense.is_paid ? (
                <CheckCircle size={16} className="text-emerald-400" />
            ) : (
                <Clock size={16} className="text-amber-400" />
            );
        }
        if (expense.type === 'income') {
            return <TrendingUp size={16} className="text-emerald-400" />;
        }
        return <TrendingDown size={16} className="text-red-400" />;
    };

    const getTypeStyle = (expense) => {
        if (expense.type === 'debt') {
            return expense.is_paid ? 'bg-emerald-500/20' : 'bg-amber-500/20';
        }
        if (expense.type === 'income') {
            return 'bg-emerald-500/20';
        }
        return 'bg-red-500/20';
    };

    const getAmountStyle = (expense) => {
        if (expense.type === 'debt') {
            return expense.is_paid ? 'text-emerald-400' : 'text-amber-400';
        }
        if (expense.type === 'income') {
            return 'text-emerald-400';
        }
        return 'text-red-400';
    };

    const getAmountPrefix = (expense) => {
        if (expense.type === 'debt') {
            return expense.is_paid ? '+' : '';
        }
        if (expense.type === 'income') {
            return '+';
        }
        return '-';
    };

    return (
        <div className="animate-slide-up stagger-3 h-full flex flex-col">
            <div className="glass-card rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl flex flex-col h-full">
                {/* Table Header */}
                <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-xl border border-white/10 group-hover:scale-110 transition-transform">
                                <Receipt className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-white text-lg tracking-tight">Historial de Transacciones</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        {expenses.length} registros cargados
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                            <Calendar size={14} className="text-primary-400" />
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                {/* Table - Scrollable */}
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-white/[0.03]">
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-600 uppercase tracking-[0.25em]">Tipo</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-600 uppercase tracking-[0.25em]">Fecha</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-600 uppercase tracking-[0.25em]">Descripción</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-600 uppercase tracking-[0.25em]">Categoría</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-600 uppercase tracking-[0.25em]">Ubicación</th>
                                <th className="px-8 py-4 text-right text-[10px] font-black text-gray-600 uppercase tracking-[0.25em]">Monto</th>
                                <th className="px-8 py-4 text-center text-[10px] font-black text-gray-600 uppercase tracking-[0.25em]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {expenses.map((expense, index) => {
                                const categoryStyle = getCategoryStyle(expense.category);
                                const isDebtPending = expense.type === 'debt' && !expense.is_paid;
                                return (
                                    <tr
                                        key={expense.id}
                                        onClick={() => setSelectedExpense(expense)}
                                        className={`
                                            group transition-all duration-300 cursor-pointer relative
                                            hover:bg-white/[0.04] animate-slide-in
                                            ${isDebtPending ? 'bg-amber-500/[0.02]' : ''}
                                        `}
                                        style={{ animationDelay: `${index * 40}ms` }}
                                    >
                                        {/* Type Icon */}
                                        <td className="px-8 py-5 relative">
                                            {/* Hover Indicator Line */}
                                            <div className="absolute left-0 top-0 w-[2px] h-full bg-primary-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />

                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${getTypeStyle(expense)}`}>
                                                {getTypeIcon(expense)}
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white tracking-tight">
                                                    {formatDate(expense.date).split(',')[0]}
                                                </span>
                                                <span className="text-[10px] font-black text-gray-650 uppercase tracking-widest mt-0.5">
                                                    {formatDate(expense.date).split(',')[1] || 'Reciente'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Title */}
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-white tracking-tight leading-tight max-w-[200px] truncate">
                                                    {expense.title}
                                                </span>
                                                {expense.notes && (
                                                    <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center animate-pulse">
                                                        <StickyNote size={12} className="text-amber-500" />
                                                    </div>
                                                )}
                                                {isDebtPending && (
                                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500 border border-amber-500/20 uppercase tracking-widest">
                                                        Pendiente
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Category Badge */}
                                        <td className="px-8 py-5">
                                            <span className={`
                                                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest
                                                ${categoryStyle.bgColor} ${categoryStyle.textColor} border ${categoryStyle.borderColor}
                                                transition-all group-hover:px-4
                                            `}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${categoryStyle.textColor.replace('text-', 'bg-')}`} />
                                                {expense.category}
                                            </span>
                                        </td>

                                        {/* Location / Debtor */}
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3 text-sm font-bold text-gray-500 tracking-tight">
                                                {expense.location ? (
                                                    <>
                                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                            {expense.type === 'debt' ? (
                                                                <UserCheck size={14} className="text-amber-400" />
                                                            ) : (
                                                                <MapPin size={14} className="text-gray-600" />
                                                            )}
                                                        </div>
                                                        <span className="truncate max-w-[150px]">{expense.location}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-800 tracking-widest text-xs">NO ASIGNADO</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Amount */}
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className={`text-lg font-black tracking-tighter ${getAmountStyle(expense)}`}>
                                                    {getAmountPrefix(expense)}{formatCurrency(expense.amount)}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">
                                                    Efectivo
                                                </span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                {isDebtPending ? (
                                                    <button
                                                        onClick={(e) => handleMarkAsPaid(e, expense)}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all duration-300 hover:scale-110 hover:rotate-6 shadow-lg shadow-emerald-500/10"
                                                        title="Marcar como pagado"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                ) : expense.type === 'debt' && expense.is_paid ? (
                                                    <button
                                                        onClick={(e) => handleRevertDebt(e, expense)}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all duration-300 hover:scale-110 hover:-rotate-6 shadow-lg shadow-amber-500/10"
                                                        title="Revertir a pendiente"
                                                    >
                                                        <Undo2 size={18} />
                                                    </button>
                                                ) : (
                                                    <div className="w-9 h-9" />
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteExpense(expense.id);
                                                    }}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-gray-600 hover:bg-red-500/20 hover:text-red-500 transition-all duration-300 hover:scale-110 hover:rotate-6 border border-white/5 hover:border-red-500/20"
                                                    title="Eliminar registro"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer with Balance */}
                <div className="px-6 lg:px-8 py-5 lg:py-6 border-t border-white/[0.04] bg-white/[0.015] relative overflow-hidden">
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <Receipt size={16} className="text-gray-600" />
                            <span className="font-bold">{expenses.length} transacciones</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest hidden sm:block">Balance</span>
                            <span className={`text-xl lg:text-2xl font-black tracking-tighter ${(balance || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {(balance || 0) >= 0 ? '+' : ''}{formatCurrency(balance || 0)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expense Modal */}
            {selectedExpense && (
                <ExpenseModal
                    expense={selectedExpense}
                    onClose={() => setSelectedExpense(null)}
                    onSaveNotes={handleSaveNotes}
                />
            )}
        </div>
    );
}
