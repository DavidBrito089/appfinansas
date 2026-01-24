import { supabase } from '../lib/supabase';

/**
 * Supabase storage utilities for expense management
 */

// ============ EXPENSE SHEETS ============

/**
 * Get all expense sheets for the current user
 */
export const getSheets = async (userId) => {
    const { data, error } = await supabase
        .from('expense_sheets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching sheets:', error);
        return [];
    }
    return data || [];
};

/**
 * Create a new expense sheet
 */
export const createSheet = async (userId, title) => {
    const { data, error } = await supabase
        .from('expense_sheets')
        .insert({
            user_id: userId,
            title,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating sheet:', error);
        return null;
    }
    return data;
};

/**
 * Delete an expense sheet
 */
export const deleteSheet = async (sheetId) => {
    // First delete all expenses in the sheet
    await supabase
        .from('expenses')
        .delete()
        .eq('sheet_id', sheetId);

    // Then delete the sheet
    const { error } = await supabase
        .from('expense_sheets')
        .delete()
        .eq('id', sheetId);

    if (error) {
        console.error('Error deleting sheet:', error);
        return false;
    }
    return true;
};

// ============ EXPENSES ============

/**
 * Get all expenses for a sheet
 */
export const getExpenses = async (sheetId) => {
    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('sheet_id', sheetId)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching expenses:', error);
        return [];
    }
    return data || [];
};

/**
 * Add an expense to a sheet
 */
export const addExpense = async (sheetId, expense) => {
    const { data, error } = await supabase
        .from('expenses')
        .insert({
            sheet_id: sheetId,
            title: expense.title,
            amount: expense.amount,
            date: expense.date,
            location: expense.location,
            category: expense.category,
            type: expense.type || 'expense',
            is_paid: expense.is_paid || false,
            notes: expense.notes || null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding expense:', error);
        return null;
    }
    return data;
};

/**
 * Update an expense (for adding notes)
 */
export const updateExpense = async (expenseId, updates) => {
    const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', expenseId)
        .select()
        .single();

    if (error) {
        console.error('Error updating expense:', error);
        return null;
    }
    return data;
};

/**
 * Delete an expense
 */
export const deleteExpense = async (expenseId) => {
    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

    if (error) {
        console.error('Error deleting expense:', error);
        return false;
    }
    return true;
};

// ============ FORMATTING HELPERS ============

/**
 * Format currency in USD
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date);
};
