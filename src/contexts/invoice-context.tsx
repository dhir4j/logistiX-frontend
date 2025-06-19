
"use client";

import type { Invoice } from '@/lib/types';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface InvoiceContextType {
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  getInvoiceById: (id: string) => Invoice | undefined;
  isLoading: boolean;
}

export const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

const STORAGE_KEY_INVOICES = 'shedloadoverseas_invoices';

export const InvoiceProvider = ({ children }: { children: ReactNode }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedInvoices = localStorage.getItem(STORAGE_KEY_INVOICES);
      if (storedInvoices) {
        const parsedInvoices = JSON.parse(storedInvoices).map((inv: Invoice) => ({
          ...inv,
          invoiceDate: new Date(inv.invoiceDate),
          dueDate: new Date(inv.dueDate),
        }));
        setInvoices(parsedInvoices);
      }
    } catch (error) {
      console.error("Failed to load invoices from localStorage", error);
      localStorage.removeItem(STORAGE_KEY_INVOICES);
    }
    setIsLoading(false);
  }, []);

  const updateLocalStorage = (updatedInvoices: Invoice[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(updatedInvoices));
    } catch (error) {
      console.error("Failed to save invoices to localStorage", error);
    }
  };

  const addInvoice = useCallback((invoice: Invoice) => {
    setInvoices(prevInvoices => {
      const newInvoices = [invoice, ...prevInvoices];
      updateLocalStorage(newInvoices);
      return newInvoices;
    });
  }, []);

  const getInvoiceById = useCallback((id: string) => {
    return invoices.find(inv => inv.id === id);
  }, [invoices]);

  return (
    <InvoiceContext.Provider value={{ invoices, addInvoice, getInvoiceById, isLoading }}>
      {children}
    </InvoiceContext.Provider>
  );
};
