
"use client";

import type { Shipment, AddressDetail, DisplayInvoice } from '@/lib/types';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth'; // Corrected import path
import { parseISO } from 'date-fns';

interface InvoiceContextType {
  // "Invoices" are now derived from Shipments
  displayInvoices: DisplayInvoice[]; 
  isLoading: boolean;
  fetchUserShipmentsForInvoices: () => Promise<void>;
  getDisplayInvoiceById: (shipmentIdStr: string) => Promise<DisplayInvoice | undefined>;
}

export const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

// Helper to transform Shipment to DisplayInvoice
const transformShipmentToDisplayInvoice = (shipment: Shipment): DisplayInvoice => {
  const senderAddr: AddressDetail = {
    street: shipment.sender_address_street,
    city: shipment.sender_address_city,
    state: shipment.sender_address_state,
    pincode: shipment.sender_address_pincode,
    country: shipment.sender_address_country,
  };
  const receiverAddr: AddressDetail = {
    street: shipment.receiver_address_street,
    city: shipment.receiver_address_city,
    state: shipment.receiver_address_state,
    pincode: shipment.receiver_address_pincode,
    country: shipment.receiver_address_country,
  };

  return {
    id: shipment.shipmentIdStr, // Use shipmentIdStr for DisplayInvoice id
    shipmentIdStr: shipment.shipmentIdStr,
    invoiceDate: shipment.booking_date ? parseISO(shipment.booking_date) : new Date(),
    dueDate: shipment.booking_date ? parseISO(shipment.booking_date) : new Date(), // Or some other logic
    senderDetails: {
      name: shipment.sender_name,
      address: senderAddr,
      phone: shipment.sender_phone,
    },
    receiverDetails: {
      name: shipment.receiver_name,
      address: receiverAddr,
      phone: shipment.receiver_phone,
    },
    items: [{
      description: `${shipment.service_type} Shipping (${shipment.package_weight_kg}kg) for ${shipment.shipmentIdStr}`,
      quantity: 1,
      unitPrice: shipment.price_without_tax,
      total: shipment.price_without_tax,
    }],
    subtotal: shipment.price_without_tax,
    taxRate: 0.18, // Hardcoded as per backend logic
    taxAmount: shipment.tax_amount_18_percent,
    grandTotal: shipment.total_with_tax_18_percent,
    status: "Paid", // Assuming all API booked shipments are considered paid for invoice
    serviceType: shipment.service_type,
    packageWeight: shipment.package_weight_kg,
  };
};


export const InvoiceProvider = ({ children }: { children: ReactNode }) => {
  const [displayInvoices, setDisplayInvoices] = useState<DisplayInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { token, isAuthenticated } = useAuth();

  const fetchUserShipmentsForInvoices = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setDisplayInvoices([]);
      return;
    }
    setIsLoading(true);
    try {
      // This endpoint returns shipments, which we will transform
      const shipmentsData = await apiClient<Shipment[]>('/api/shipments'); 
      const transformedInvoices = shipmentsData.map(transformShipmentToDisplayInvoice);
      setDisplayInvoices(transformedInvoices);
    } catch (error) {
      console.error("Failed to fetch user shipments for invoices", error);
      setDisplayInvoices([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  const getDisplayInvoiceById = useCallback(async (shipmentIdStr: string): Promise<DisplayInvoice | undefined> => {
    if (!isAuthenticated || !token) return undefined;
    setIsLoading(true);
    try {
      const shipment = await apiClient<Shipment>(`/api/shipments/${shipmentIdStr}`);
      return transformShipmentToDisplayInvoice(shipment);
    } catch (error) {
      console.error(`Failed to fetch shipment ${shipmentIdStr} for invoice display`, error);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);


  return (
    <InvoiceContext.Provider value={{ displayInvoices, isLoading, fetchUserShipmentsForInvoices, getDisplayInvoiceById }}>
      {children}
    </InvoiceContext.Provider>
  );
};
