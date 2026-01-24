/**
 * LocalStorage utilities for expense management
 * Designed for easy migration to a real database (Supabase, etc.)
 */

const STORAGE_KEY = 'expense-sheets';

/**
 * Get all expense sheets from storage
 * @returns {Array} Array of ExpenseSheet objects
 */
export const getSheets = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return [];
    }
};

/**
 * Save all expense sheets to storage
 * @param {Array} sheets - Array of ExpenseSheet objects
 */
export const saveSheets = (sheets) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
};

/**
 * Create a new expense sheet
 * @param {string} id - UUID for the sheet
 * @param {string} title - Title of the sheet
 * @returns {Object} The newly created sheet
 */
export const createSheet = (id, title) => {
    const newSheet = {
        id,
        title,
        createdAt: new Date().toISOString(),
        expenses: []
    };

    const sheets = getSheets();
    sheets.push(newSheet);
    saveSheets(sheets);

    return newSheet;
};

/**
 * Update an existing expense sheet
 * @param {string} sheetId - ID of the sheet to update
 * @param {Object} updates - Partial sheet object with updates
 * @returns {Object|null} The updated sheet or null if not found
 */
export const updateSheet = (sheetId, updates) => {
    const sheets = getSheets();
    const index = sheets.findIndex(s => s.id === sheetId);

    if (index === -1) return null;

    sheets[index] = { ...sheets[index], ...updates };
    saveSheets(sheets);

    return sheets[index];
};

/**
 * Delete an expense sheet
 * @param {string} sheetId - ID of the sheet to delete
 * @returns {boolean} Whether the deletion was successful
 */
export const deleteSheet = (sheetId) => {
    const sheets = getSheets();
    const filteredSheets = sheets.filter(s => s.id !== sheetId);

    if (filteredSheets.length === sheets.length) return false;

    saveSheets(filteredSheets);
    return true;
};

/**
 * Add an expense to a sheet
 * @param {string} sheetId - ID of the sheet
 * @param {Object} expense - Expense object to add
 * @returns {Object|null} The updated sheet or null if not found
 */
export const addExpenseToSheet = (sheetId, expense) => {
    const sheets = getSheets();
    const index = sheets.findIndex(s => s.id === sheetId);

    if (index === -1) return null;

    sheets[index].expenses.push(expense);
    saveSheets(sheets);

    return sheets[index];
};

/**
 * Remove an expense from a sheet
 * @param {string} sheetId - ID of the sheet
 * @param {string} expenseId - ID of the expense to remove
 * @returns {Object|null} The updated sheet or null if not found
 */
export const removeExpenseFromSheet = (sheetId, expenseId) => {
    const sheets = getSheets();
    const index = sheets.findIndex(s => s.id === sheetId);

    if (index === -1) return null;

    sheets[index].expenses = sheets[index].expenses.filter(e => e.id !== expenseId);
    saveSheets(sheets);

    return sheets[index];
};

/**
 * Format currency in USD
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
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
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date);
};
