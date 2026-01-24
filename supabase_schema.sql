-- ExpenseTracker Pro - Supabase Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Expense Sheets Table
CREATE TABLE IF NOT EXISTS expense_sheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sheet_id UUID NOT NULL REFERENCES expense_sheets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  category TEXT NOT NULL CHECK (category IN ('Comida', 'Transporte', 'Alojamiento', 'Ocio', 'Otros')),
  type TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('income', 'expense', 'debt')),
  is_paid BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expense_sheets_user_id ON expense_sheets(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_sheet_id ON expenses(sheet_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- Row Level Security (RLS)
ALTER TABLE expense_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Policies for expense_sheets
CREATE POLICY "Users can view their own sheets" ON expense_sheets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sheets" ON expense_sheets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sheets" ON expense_sheets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sheets" ON expense_sheets
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for expenses (via sheet ownership)
CREATE POLICY "Users can view expenses in their sheets" ON expenses
  FOR SELECT USING (
    sheet_id IN (SELECT id FROM expense_sheets WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create expenses in their sheets" ON expenses
  FOR INSERT WITH CHECK (
    sheet_id IN (SELECT id FROM expense_sheets WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update expenses in their sheets" ON expenses
  FOR UPDATE USING (
    sheet_id IN (SELECT id FROM expense_sheets WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete expenses in their sheets" ON expenses
  FOR DELETE USING (
    sheet_id IN (SELECT id FROM expense_sheets WHERE user_id = auth.uid())
  );

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_expense_sheets_updated_at
  BEFORE UPDATE ON expense_sheets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
