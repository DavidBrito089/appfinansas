import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, Wallet, Clock } from 'lucide-react';
import { formatCurrency } from '../utils/supabaseStorage';
import { getCategoryStyle } from '../utils/categories';

export default function ExpenseDashboard({ expenses }) {
    // Calculate KPIs including income/expense/balance/debts
    const stats = useMemo(() => {
        if (!expenses || expenses.length === 0) {
            return {
                totalIncome: 0,
                totalExpenses: 0,
                totalPendingDebts: 0,
                balance: 0,
                topCategory: { category: null, amount: 0 },
                categoryData: []
            };
        }

        // Separate by type
        const incomes = expenses.filter(exp => exp.type === 'income');
        const expensesOnly = expenses.filter(exp => exp.type === 'expense');
        const pendingDebts = expenses.filter(exp => exp.type === 'debt' && !exp.is_paid);
        const paidDebts = expenses.filter(exp => exp.type === 'debt' && exp.is_paid);

        const totalIncome = incomes.reduce((sum, exp) => sum + exp.amount, 0) +
            paidDebts.reduce((sum, exp) => sum + exp.amount, 0);
        const totalExpenses = expensesOnly.reduce((sum, exp) => sum + exp.amount, 0);
        const totalPendingDebts = pendingDebts.reduce((sum, exp) => sum + exp.amount, 0);
        const balance = totalIncome - totalExpenses;

        // Group expenses by category (only expenses, not income or debts)
        const categoryTotals = expensesOnly.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {});

        // Find top category
        const topCategory = Object.entries(categoryTotals).reduce(
            (max, [category, amount]) => (amount > max.amount ? { category, amount } : max),
            { category: null, amount: 0 }
        );

        // Prepare chart data
        const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
            name,
            value,
            color: getCategoryStyle(name).color,
            percentage: totalExpenses > 0 ? ((value / totalExpenses) * 100).toFixed(1) : 0
        }));

        return { totalIncome, totalExpenses, totalPendingDebts, balance, topCategory, categoryData };
    }, [expenses]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="glass-card rounded-lg p-3 shadow-xl">
                    <p className="font-medium text-white">{data.name}</p>
                    <p className="text-sm text-gray-300">{formatCurrency(data.value)}</p>
                    <p className="text-xs text-gray-400">{data.percentage}% del total</p>
                </div>
            );
        }
        return null;
    };

    const CustomLegend = ({ payload }) => (
        <div className="flex flex-wrap justify-center gap-3 mt-4">
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-gray-400">{entry.value}</span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-6 mb-8 animate-fade-in">
            {/* Main Balance Card */}
            <div className="glass-card rounded-[2.5rem] p-8 bg-gradient-to-br from-primary-900/40 via-accent-900/10 to-transparent border-glow relative overflow-hidden group">
                {/* Decorative background glow */}
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-primary-600/10 blur-[100px] rounded-full group-hover:bg-primary-600/20 transition-colors duration-700" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-2xl animate-float border border-white/20">
                            <Wallet className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-550 uppercase tracking-[0.2em] mb-1">Balance Actual</p>
                            <p className={`text-5xl font-black tracking-tighter ${stats.balance >= 0 ? 'text-white' : 'text-red-400'}`}>
                                {stats.balance >= 0 ? '+' : ''}{formatCurrency(stats.balance)}
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 md:max-w-2xl">
                        <div className="glass rounded-3xl p-5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors duration-300 group/stat">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="w-5 h-5 text-emerald-400 group-hover/stat:scale-125 transition-transform" />
                                <span className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">Ingresos</span>
                            </div>
                            <p className="text-xl font-black text-white">{formatCurrency(stats.totalIncome)}</p>
                        </div>

                        <div className="glass rounded-3xl p-5 border border-red-500/20 hover:bg-red-500/10 transition-colors duration-300 group/stat">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingDown className="w-5 h-5 text-red-400 group-hover/stat:scale-125 transition-transform" />
                                <span className="text-[10px] font-black text-red-500/60 uppercase tracking-widest">Gastos</span>
                            </div>
                            <p className="text-xl font-black text-white">{formatCurrency(stats.totalExpenses)}</p>
                        </div>

                        {stats.totalPendingDebts > 0 && (
                            <div className="glass rounded-3xl p-5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors duration-300 group/stat">
                                <div className="flex items-center gap-3 mb-2">
                                    <Clock className="w-5 h-5 text-amber-400 group-hover/stat:scale-125 transition-transform" />
                                    <span className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest">Por Cobrar</span>
                                </div>
                                <p className="text-xl font-black text-white">{formatCurrency(stats.totalPendingDebts)}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* KPI Cards + Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Visual Cards */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Transaction Count Card */}
                    <div className="glass-card rounded-[2rem] p-7 group hover:scale-[1.03] transition-all duration-500 border border-white/5 hover:border-primary-500/30 animate-slide-in stagger-1">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform">
                                <DollarSign className="w-7 h-7 text-white" />
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Actividad</span>
                            </div>
                        </div>
                        <p className="text-4xl font-black text-white tracking-tighter mb-1">
                            {expenses?.length || 0}
                        </p>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-tight">Transacciones totales</p>
                    </div>

                    {/* Top Category Card */}
                    <div className="glass-card rounded-[2rem] p-7 group hover:scale-[1.03] transition-all duration-500 border border-white/5 hover:border-purple-500/30 animate-slide-in stagger-2">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-7 h-7 text-white" />
                            </div>
                            <div className="bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
                                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Categoría Top</span>
                            </div>
                        </div>
                        <p className="text-4xl font-black text-white tracking-tighter mb-1 truncate">
                            {stats.topCategory.category || '—'}
                        </p>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-tight">
                            {stats.topCategory.amount > 0
                                ? `${formatCurrency(stats.topCategory.amount)} invertidos`
                                : 'Sin gastos registrados'}
                        </p>
                    </div>
                </div>

                {/* Donut Chart */}
                <div className="lg:col-span-4 glass-card rounded-[2.5rem] p-7 border border-white/5 animate-slide-in stagger-3">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                            <PieChartIcon className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                            <h3 className="font-black text-white text-lg tracking-tight">Distribución</h3>
                            <p className="text-[10px] font-bold text-gray-650 uppercase tracking-widest">Gastos actuales</p>
                        </div>
                    </div>

                    <div className="relative h-[220px]">
                        {stats.categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={85}
                                        paddingAngle={6}
                                        dataKey="value"
                                        stroke="transparent"
                                    >
                                        {stats.categoryData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                                className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} cursor={false} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center mb-3">
                                    <DollarSign className="w-8 h-8 text-gray-800" />
                                </div>
                                <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Sin datos</p>
                            </div>
                        )}

                        {/* Center Label for Chart */}
                        {stats.categoryData.length > 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Total</p>
                                <p className="text-lg font-black text-white">{formatCurrency(stats.totalExpenses)}</p>
                            </div>
                        )}
                    </div>

                    <CustomLegend payload={stats.categoryData} />
                </div>
            </div>
        </div>
    );
}
