import { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Menu, X, LogOut, Loader2, Plus, TrendingUp, TrendingDown, Wallet, Clock, BarChart3, Receipt } from 'lucide-react';
import { formatCurrency } from './utils/supabaseStorage';
import Sidebar from './components/Sidebar';
import ExpenseDashboard from './components/ExpenseDashboard';
import ExpenseForm from './components/ExpenseForm';
import ExpenseTable from './components/ExpenseTable';
import TransactionFilters from './components/TransactionFilters';
import SuccessAnimation from './components/SuccessAnimation';
import AuthScreen from './components/AuthScreen';
import { onAuthStateChange, signOut, getCurrentUser } from './lib/supabase';
import {
    getSheets,
    createSheet,
    deleteSheet,
    getExpenses,
    addExpense,
    deleteExpense,
    updateExpense
} from './utils/supabaseStorage';

export default function App() {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [sheets, setSheets] = useState([]);
    const [activeSheetId, setActiveSheetId] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showMobileForm, setShowMobileForm] = useState(false);
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        type: 'all',
        amountMin: '',
        amountMax: ''
    });
    const [activeView, setActiveView] = useState('transactions'); // 'transactions' or 'dashboard'
    const [expandedPanel, setExpandedPanel] = useState(null); // null, 'form', or 'filters'
    const [isScrolled, setIsScrolled] = useState(false); // Scroll state for dynamic header background
    const [showSuccess, setShowSuccess] = useState(false); // Success animation state

    // Listen for auth state changes
    useEffect(() => {
        const checkUser = async () => {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            setAuthLoading(false);
        };

        checkUser();

        const { data: { subscription } } = onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            setAuthLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Load sheets when user is authenticated
    useEffect(() => {
        if (user) {
            loadSheets();
        } else {
            setSheets([]);
            setActiveSheetId(null);
            setExpenses([]);
        }
    }, [user]);

    // Load expenses when active sheet changes and save to localStorage
    useEffect(() => {
        if (activeSheetId) {
            loadExpenses(activeSheetId);
            localStorage.setItem('activeSheetId', activeSheetId);
        } else {
            setExpenses([]);
        }
    }, [activeSheetId]);

    const loadSheets = async () => {
        setLoading(true);
        const data = await getSheets(user.id);
        setSheets(data);

        // Try to restore saved sheet ID, otherwise use first sheet
        const savedSheetId = localStorage.getItem('activeSheetId');
        const validSavedSheet = data.find(s => s.id === savedSheetId);

        if (validSavedSheet) {
            setActiveSheetId(savedSheetId);
        } else if (data.length > 0 && !activeSheetId) {
            setActiveSheetId(data[0].id);
        }
        setLoading(false);
    };

    const loadExpenses = async (sheetId) => {
        const data = await getExpenses(sheetId);
        setExpenses(data);
    };

    // Get current active sheet
    const activeSheet = useMemo(() => {
        return sheets.find(s => s.id === activeSheetId) || null;
    }, [sheets, activeSheetId]);

    // Calculate income, expenses, debts, and balance
    const { totalIncome, totalExpenses, totalPendingDebts, balance } = useMemo(() => {
        const incomes = expenses.filter(exp => exp.type === 'income');
        const expensesOnly = expenses.filter(exp => exp.type === 'expense');
        const pendingDebts = expenses.filter(exp => exp.type === 'debt' && !exp.is_paid);
        const paidDebts = expenses.filter(exp => exp.type === 'debt' && exp.is_paid);

        const totalIncome = incomes.reduce((sum, exp) => sum + exp.amount, 0) +
            paidDebts.reduce((sum, exp) => sum + exp.amount, 0);
        const totalExpenses = expensesOnly.reduce((sum, exp) => sum + exp.amount, 0);
        const totalPendingDebts = pendingDebts.reduce((sum, exp) => sum + exp.amount, 0);
        const balance = totalIncome - totalExpenses;

        return { totalIncome, totalExpenses, totalPendingDebts, balance };
    }, [expenses]);

    // Apply filters to expenses
    const filteredExpenses = useMemo(() => {
        return expenses.filter(expense => {
            // Date filter
            if (filters.dateFrom && expense.date < filters.dateFrom) return false;
            if (filters.dateTo && expense.date > filters.dateTo) return false;

            // Type filter
            if (filters.type !== 'all') {
                if (filters.type === 'debt_pending' && !(expense.type === 'debt' && !expense.is_paid)) return false;
                if (filters.type === 'debt_paid' && !(expense.type === 'debt' && expense.is_paid)) return false;
                if (filters.type !== 'debt_pending' && filters.type !== 'debt_paid' && expense.type !== filters.type) return false;
            }

            // Amount filter
            if (filters.amountMin && expense.amount < parseFloat(filters.amountMin)) return false;
            if (filters.amountMax && expense.amount > parseFloat(filters.amountMax)) return false;

            return true;
        });
    }, [expenses, filters]);

    const clearFilters = () => {
        setFilters({
            dateFrom: '',
            dateTo: '',
            type: 'all',
            amountMin: '',
            amountMax: ''
        });
    };

    // Create new sheet
    const handleCreateSheet = async (title) => {
        console.log('Creating sheet with title:', title);
        const newSheet = await createSheet(user.id, title);
        console.log('New sheet created:', newSheet);
        if (newSheet) {
            setSheets(prev => [newSheet, ...prev]);
            setActiveSheetId(newSheet.id);
            // Explicitly load expenses for the new sheet (should be empty)
            setExpenses([]);
        } else {
            console.error('Failed to create sheet - check Supabase tables');
            alert('Error al crear la hoja. Verifica que las tablas existen en Supabase.');
        }
    };

    // Delete sheet
    const handleDeleteSheet = async (sheetId) => {
        const success = await deleteSheet(sheetId);
        if (success) {
            setSheets(prev => {
                const filtered = prev.filter(s => s.id !== sheetId);
                if (sheetId === activeSheetId && filtered.length > 0) {
                    setActiveSheetId(filtered[0].id);
                } else if (filtered.length === 0) {
                    setActiveSheetId(null);
                }
                return filtered;
            });
        }
    };

    // Add expense
    const handleAddExpense = async (expenseData) => {
        if (!activeSheetId) return;

        const newExpense = await addExpense(activeSheetId, expenseData);
        if (newExpense) {
            setExpenses(prev => [newExpense, ...prev]);
            setShowSuccess(true);
        }
    };

    // Delete expense
    const handleDeleteExpense = async (expenseId) => {
        const success = await deleteExpense(expenseId);
        if (success) {
            setExpenses(prev => prev.filter(e => e.id !== expenseId));
        }
    };

    // Update expense (for notes)
    const handleUpdateExpense = async (expenseId, updates) => {
        const updated = await updateExpense(expenseId, updates);
        if (updated) {
            setExpenses(prev => prev.map(e => e.id === expenseId ? updated : e));
        }
    };

    // Mark debt as paid (converts to income)
    const handleMarkDebtPaid = async (debt) => {
        const updated = await updateExpense(debt.id, { is_paid: true });
        if (updated) {
            setExpenses(prev => prev.map(e => e.id === debt.id ? updated : e));
        }
    };

    // Revert paid debt back to pending
    const handleRevertDebt = async (debt) => {
        const updated = await updateExpense(debt.id, { is_paid: false });
        if (updated) {
            setExpenses(prev => prev.map(e => e.id === debt.id ? updated : e));
        }
    };

    // Handle logout
    const handleLogout = async () => {
        await signOut();
        setUser(null);
    };

    // Show loading spinner
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Cargando...</p>
                </div>
            </div>
        );
    }

    // Show auth screen if not logged in
    if (!user) {
        return <AuthScreen onAuthSuccess={setUser} />;
    }



    return (
        <div className="flex h-screen overflow-y-auto lg:overflow-hidden">
            {/* Mobile Menu Toggle */}
            {/* Mobile Menu Toggle - Hidden on mobile, moved to sticky header */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="hidden lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl glass-card text-white"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logout Button */}
            {/* Logout Button - Hidden on mobile, moved to sticky header */}
            <button
                onClick={handleLogout}
                className="hidden lg:flex fixed top-4 right-4 z-50 p-3 rounded-xl glass-card text-white hover:text-red-400 transition-colors items-center gap-2"
                title="Cerrar sesión"
            >
                <LogOut size={20} />
                <span className="hidden lg:inline text-sm">{user.email}</span>
            </button>

            {/* Sidebar */}
            <div className={`
        fixed lg:relative z-40 transition-transform duration-300
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <Sidebar
                    sheets={sheets}
                    activeSheetId={activeSheetId}
                    onSelectSheet={(id) => {
                        setActiveSheetId(id);
                        setIsMobileMenuOpen(false);
                    }}
                    onCreateSheet={handleCreateSheet}
                    onDeleteSheet={handleDeleteSheet}
                />
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <main
                className="flex-1 p-4 lg:p-6 lg:pt-6 pb-28 lg:pb-6 overflow-y-auto lg:overflow-hidden"
                onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 10)}
            >
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                    </div>
                ) : activeSheet ? (
                    <div className="max-w-6xl mx-auto animate-fade-in lg:h-full lg:flex lg:flex-col">
                        {/* Sticky Mobile Header - Shows sheet title centered with integrated buttons */}
                        <div
                            className={`lg:hidden sticky -top-4 z-20 -mx-4 px-4 pt-2 pb-3 backdrop-blur-md border-b border-white/5 flex items-center justify-between gap-4 transition-colors duration-300 ${isScrolled ? '' : 'bg-transparent border-transparent'}`}
                            style={isScrolled ? { backgroundColor: 'rgb(12 10 29 / 0.95)' } : {}}
                        >
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 -ml-2 rounded-xl text-white hover:bg-white/10 transition-colors"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>

                            <h1 className="text-base font-black text-white text-center truncate flex-1 leading-tight">
                                {activeSheet.title}
                            </h1>

                            <button
                                onClick={handleLogout}
                                className="p-2 -mr-2 rounded-xl text-white hover:text-red-400 hover:bg-white/10 transition-colors"
                                title="Cerrar sesión"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>

                        {/* Desktop Page Header - Hidden on mobile */}
                        <div className="hidden lg:block mb-6 pl-12 lg:pl-0">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-xl">
                                    <LayoutDashboard className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-bold text-white">
                                        {activeSheet.title}
                                    </h1>
                                    <p className="text-sm text-gray-400">
                                        Creada el {new Date(activeSheet.created_at).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* View Navigation Tabs */}
                        <div className="glass-card rounded-[2rem] p-2 mb-4 lg:mb-8 border border-white/5 shadow-2xl animate-slide-up flex gap-2">
                            <button
                                onClick={() => setActiveView('transactions')}
                                className={`flex-1 flex items-center justify-center gap-2 lg:gap-3 px-4 lg:px-6 py-3 lg:py-4 rounded-[1.5rem] font-black text-xs lg:text-sm uppercase tracking-widest transition-all duration-300 ${activeView === 'transactions'
                                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-xl shadow-primary-500/20'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Receipt size={18} />
                                <span className="hidden sm:inline">Transacciones</span>
                                <span className="sm:hidden">Trans.</span>
                            </button>
                            <button
                                onClick={() => setActiveView('dashboard')}
                                className={`flex-1 flex items-center justify-center gap-2 lg:gap-3 px-4 lg:px-6 py-3 lg:py-4 rounded-[1.5rem] font-black text-xs lg:text-sm uppercase tracking-widest transition-all duration-300 ${activeView === 'dashboard'
                                    ? 'bg-gradient-to-r from-accent-600 to-accent-500 text-white shadow-xl shadow-accent-500/20'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <BarChart3 size={18} />
                                <span>Dashboard</span>
                            </button>
                        </div>

                        {/* Conditional Content based on Active View */}
                        {activeView === 'transactions' ? (
                            <>
                                {/* Summary Stat Cards */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
                                    <div className="stat-card-income glass-card rounded-2xl lg:rounded-[1.5rem] p-4 lg:p-5 transition-all duration-300 animate-slide-in stagger-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                                                <TrendingUp size={16} className="text-emerald-400" />
                                            </div>
                                            <span className="text-[9px] lg:text-[10px] font-black text-emerald-400/70 uppercase tracking-widest">Ingresos</span>
                                        </div>
                                        <p className="text-lg lg:text-2xl font-black text-white tracking-tighter">{formatCurrency(totalIncome)}</p>
                                    </div>
                                    <div className="stat-card-expense glass-card rounded-2xl lg:rounded-[1.5rem] p-4 lg:p-5 transition-all duration-300 animate-slide-in stagger-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-red-500/15 flex items-center justify-center">
                                                <TrendingDown size={16} className="text-red-400" />
                                            </div>
                                            <span className="text-[9px] lg:text-[10px] font-black text-red-400/70 uppercase tracking-widest">Gastos</span>
                                        </div>
                                        <p className="text-lg lg:text-2xl font-black text-white tracking-tighter">{formatCurrency(totalExpenses)}</p>
                                    </div>
                                    <div className="stat-card-debt glass-card rounded-2xl lg:rounded-[1.5rem] p-4 lg:p-5 transition-all duration-300 animate-slide-in stagger-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
                                                <Clock size={16} className="text-amber-400" />
                                            </div>
                                            <span className="text-[9px] lg:text-[10px] font-black text-amber-400/70 uppercase tracking-widest">Por Cobrar</span>
                                        </div>
                                        <p className="text-lg lg:text-2xl font-black text-white tracking-tighter">{formatCurrency(totalPendingDebts)}</p>
                                    </div>
                                    <div className="stat-card-balance glass-card rounded-2xl lg:rounded-[1.5rem] p-4 lg:p-5 transition-all duration-300 animate-slide-in stagger-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-primary-500/15 flex items-center justify-center">
                                                <Wallet size={16} className="text-primary-400" />
                                            </div>
                                            <span className="text-[9px] lg:text-[10px] font-black text-primary-400/70 uppercase tracking-widest">Balance</span>
                                        </div>
                                        <p className={`text-lg lg:text-2xl font-black tracking-tighter ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
                                        </p>
                                    </div>
                                </div>

                                {/* Sticky Form/Filter Controls on Mobile */}
                                <div
                                    className={`lg:static sticky top-8 z-10 -mx-4 px-4 lg:mx-0 lg:px-0 py-3 lg:py-0 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border-b border-white/5 lg:border-0 transition-colors duration-300 ${isScrolled ? '' : 'bg-transparent border-transparent'}`}
                                    style={isScrolled ? { backgroundColor: 'rgb(12 10 29 / 0.95)' } : {}}
                                >
                                    <div className="grid grid-cols-2 gap-2 lg:gap-6">
                                        {/* Expense Form */}
                                        <div className={`${expandedPanel === 'filters' ? 'hidden lg:block' : expandedPanel === 'form' ? 'col-span-2 lg:col-span-1' : ''} transition-all duration-300`}>
                                            <ExpenseForm
                                                onAddExpense={handleAddExpense}
                                                isExpanded={expandedPanel === 'form'}
                                                onToggle={() => setExpandedPanel(expandedPanel === 'form' ? null : 'form')}
                                            />
                                        </div>

                                        {/* Transaction Filters */}
                                        <div className={`${expandedPanel === 'form' ? 'hidden lg:block' : expandedPanel === 'filters' ? 'col-span-2 lg:col-span-1' : ''} transition-all duration-300`}>
                                            <TransactionFilters
                                                filters={filters}
                                                onFilterChange={setFilters}
                                                onClearFilters={clearFilters}
                                                isExpanded={expandedPanel === 'filters'}
                                                onToggle={() => setExpandedPanel(expandedPanel === 'filters' ? null : 'filters')}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Expense Table - Scrollable Container */}
                                <div className="flex-1 min-h-0 overflow-hidden">
                                    <ExpenseTable
                                        expenses={filteredExpenses}
                                        onDeleteExpense={handleDeleteExpense}
                                        onUpdateExpense={handleUpdateExpense}
                                        onMarkDebtPaid={handleMarkDebtPaid}
                                        onRevertDebt={handleRevertDebt}
                                        totalIncome={totalIncome}
                                        totalExpenses={totalExpenses}
                                        totalPendingDebts={totalPendingDebts}
                                        balance={balance}
                                    />
                                </div>
                            </>
                        ) : (
                            /* Dashboard Analytics */
                            <ExpenseDashboard expenses={expenses} />
                        )}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center max-w-md mx-auto p-8">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                                <LayoutDashboard className="w-12 h-12 text-primary-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">
                                ¡Bienvenido, {user.email?.split('@')[0]}!
                            </h2>
                            <p className="text-gray-400 mb-6">
                                Comienza creando tu primera hoja de gastos para empezar a rastrear y analizar tus finanzas de forma profesional.
                            </p>
                            <button
                                onClick={() => handleCreateSheet('Mi Primera Hoja')}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-primary-500/25"
                            >
                                Crear Primera Hoja
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Mobile Fixed Bottom Bar */}
            {user && activeSheet && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-white/10 px-4 py-3 pb-safe">
                    <div className="flex items-center justify-between gap-3">
                        {/* Balance Display */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Wallet size={16} className="text-primary-400" />
                                <span className="text-xs text-gray-400">Balance</span>
                            </div>
                            <p className={`text-lg font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
                            </p>
                        </div>

                        {/* Mini Stats */}
                        <div className="flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1">
                                <TrendingUp size={12} className="text-emerald-400" />
                                <span className="text-emerald-400 font-medium">{formatCurrency(totalIncome)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <TrendingDown size={12} className="text-red-400" />
                                <span className="text-red-400 font-medium">{formatCurrency(totalExpenses)}</span>
                            </div>
                            {totalPendingDebts > 0 && (
                                <div className="flex items-center gap-1">
                                    <Clock size={12} className="text-amber-400" />
                                    <span className="text-amber-400 font-medium">{formatCurrency(totalPendingDebts)}</span>
                                </div>
                            )}
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={() => setShowMobileForm(true)}
                            className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30 hover:scale-105 transition-transform"
                        >
                            <Plus size={24} className="text-white" />
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile Add Transaction Modal */}
            {showMobileForm && (
                <div className="lg:hidden fixed inset-0 z-[60] flex items-end">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowMobileForm(false)}
                    />
                    <div className="relative w-full glass-card rounded-t-3xl p-6 pb-8 animate-slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Nueva Transacción</h3>
                            <button
                                onClick={() => setShowMobileForm(false)}
                                className="p-2 rounded-lg hover:bg-white/10 text-gray-400"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <ExpenseForm
                            isExpanded={true}
                            onAddExpense={(expense) => {
                                handleAddExpense(expense);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Success Animation Overlay */}
            {showSuccess && (
                <SuccessAnimation
                    onComplete={() => {
                        setShowSuccess(false);
                        setShowMobileForm(false);
                    }}
                />
            )}
        </div>
    );
}
