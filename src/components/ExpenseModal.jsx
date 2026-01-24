import { useState } from 'react';
import { X, StickyNote, Save, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/supabaseStorage';
import { getCategoryStyle } from '../utils/categories';

export default function ExpenseModal({ expense, onClose, onSaveNotes }) {
    const [notes, setNotes] = useState(expense.notes || '');
    const [saving, setSaving] = useState(false);

    const categoryStyle = getCategoryStyle(expense.category);

    const handleSave = async () => {
        setSaving(true);
        await onSaveNotes(expense.id, notes);
        setSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg glass-card rounded-3xl p-6 animate-fade-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-1">{expense.title}</h2>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>{formatDate(expense.date)}</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${categoryStyle.bgColor} ${categoryStyle.textColor}`}>
                            {expense.category}
                        </span>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="glass rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Monto</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(expense.amount)}</p>
                    </div>
                    <div className="glass rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Lugar</p>
                        <p className="text-lg font-medium text-white truncate">
                            {expense.location || 'Sin especificar'}
                        </p>
                    </div>
                </div>

                {/* Notes Section */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                        <StickyNote size={16} />
                        Notas
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Añade notas adicionales sobre este gasto..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Guardar Notas
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
