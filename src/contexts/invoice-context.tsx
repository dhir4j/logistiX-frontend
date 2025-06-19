
"use client";

import type { Shipment, AddressDetail, DisplayInvoice } from '@/lib/types';
import React, { createContext, useState, ReactNode, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import { parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface InvoiceContextType {
  displayInvoices: DisplayInvoice[]; 
  isLoading: boolean;
  fetchUserShipmentsForInvoices: () => Promise<void>;
  getDisplayInvoiceById: (shipmentIdStr: string) => Promise<DisplayInvoice | undefined>;
}

export const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

// Helper function to map API snake_case to frontend camelCase for Shipment
const mapApiShipmentToFrontend = (apiShipment: any): Shipment => ({
  id: apiShipment.id,
  userId: apiShipment.user_id,
  shipmentIdStr: apiShipment.shipment_id_str,
  senderName: apiShipment.sender_name,
  senderAddressStreet: apiShipment.sender_address_street,
  senderAddressCity: apiShipment.sender_address_city,
  senderAddressState: apiShipment.sender_address_state,
  senderAddressPincode: apiShipment.sender_address_pincode,
  senderAddressCountry: apiShipment.sender_address_country,
  senderPhone: apiShipment.sender_phone,
  receiverName: apiShipment.receiver_name,
  receiverAddressStreet: apiShipment.receiver_address_street,
  receiverAddressCity: apiShipment.receiver_address_city,
  receiverAddressState: apiShipment.receiver_address_state,
  receiverAddressPincode: apiShipment.receiver_address_pincode,
  receiverAddressCountry: apiShipment.receiver_address_country,
  receiverPhone: apiShipment.receiver_phone,
  packageWeightKg: parseFloat(apiShipment.package_weight_kg),
  packageWidthCm: parseFloat(apiShipment.package_width_cm),
  packageHeightCm: parseFloat(apiShipment.package_height_cm),
  packageLengthCm: parseFloat(apiShipment.package_length_cm),
  pickupDate: apiShipment.pickup_date,
  serviceType: apiShipment.service_type,
  bookingDate: apiShipment.booking_date,
  status: apiShipment.status,
  priceWithoutTax: parseFloat(apiShipment.price_without_tax),
  taxAmount18Percent: parseFloat(apiShipment.tax_amount_18_percent),
  totalWithTax18Percent: parseFloat(apiShipment.total_with_tax_18_percent),
  trackingHistory: apiShipment.tracking_history || [],
  lastUpdatedAt: apiShipment.last_updated_at,
});

const transformShipmentToDisplayInvoice = (shipment: Shipment): DisplayInvoice => {
  const senderAddr: AddressDetail = {
    street: shipment.senderAddressStreet,
    city: shipment.senderAddressCity,
    state: shipment.senderAddressState,
    pincode: shipment.senderAddressPincode,
    country: shipment.senderAddressCountry,
  };
  const receiverAddr: AddressDetail = {
    street: shipment.receiverAddressStreet,
    city: shipment.receiverAddressCity,
    state: shipment.receiverAddressState,
    pincode: shipment.receiverAddressPincode,
    country: shipment.receiverAddressCountry,
  };

  return {
    id: shipment.shipmentIdStr, 
    shipmentIdStr: shipment.shipmentIdStr,
    invoiceDate: shipment.bookingDate ? parseISO(shipment.bookingDate) : new Date(),
    dueDate: shipment.bookingDate ? parseISO(shipment.bookingDate) : new Date(), 
    senderDetails: {
      name: shipment.senderName,
      address: senderAddr,
      phone: shipment.senderPhone,
    },
    receiverDetails: {
      name: shipment.receiverName,
      address: receiverAddr,
      phone: shipment.receiverPhone,
    },
    items: [{
      description: `${shipment.serviceType} Shipping (${shipment.packageWeightKg}kg) for ${shipment.shipmentIdStr}`,
      quantity: 1,
      unitPrice: shipment.priceWithoutTax,
      total: shipment.priceWithoutTax,
    }],
    subtotal: shipment.priceWithoutTax,
    taxRate: 0.18, 
    taxAmount: shipment.taxAmount18Percent,
    grandTotal: shipment.totalWithTax18Percent,
    status: "Paid", // Assuming all booked shipments are "Paid" for invoice display purposes
    serviceType: shipment.serviceType,
    packageWeight: shipment.packageWeightKg,
  };
};


export const InvoiceProvider = ({ children }: { children: ReactNode }) => {
  const [displayInvoices, setDisplayInvoices] = useState<DisplayInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated, logoutUser } = useAuth(); // Removed token
  const { toast } = useToast();

  const handleApiError = useCallback((error: any, operation: string) => {
    console.error(`API error during ${operation}:`, error);
    // No automatic logout for 422.
    toast({
      title: `Error ${operation}`,
      description: error?.data?.error || error.message || "An unexpected error occurred.",
      variant: "destructive",
    });
  }, [toast, logoutUser]);

  const fetchUserShipmentsForInvoices = useCallback(async () => {
    // if (!isAuthenticated || !token) { // Check isAuthenticated
    if (!isAuthenticated || !user) { // Check if user object exists
      setDisplayInvoices([]);
      return;
    }
    setIsLoading(true);
    try {
      const shipmentsDataFromApi = await apiClient<any[]>('/api/shipments'); 
      const shipmentsData: Shipment[] = shipmentsDataFromApi.map(mapApiShipmentToFrontend);
      const transformedInvoices = shipmentsData.map(transformShipmentToDisplayInvoice);
      setDisplayInvoices(transformedInvoices);
    } catch (error: any) {
      handleApiError(error, 'fetching shipments for invoices');
      setDisplayInvoices([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, handleApiError]); // Removed token from deps

  const getDisplayInvoiceById = useCallback(async (shipmentIdStr: string): Promise<DisplayInvoice | undefined> => {
    // if (!isAuthenticated || !token) return undefined; // Check isAuthenticated
    if (!isAuthenticated) return undefined; // Endpoint is open, but conceptually tied to user context
    setIsLoading(true);
    try {
      const shipmentFromApi = await apiClient<any>(`/api/shipments/${shipmentIdStr}`);
      const shipment: Shipment = mapApiShipmentToFrontend(shipmentFromApi);
      return transformShipmentToDisplayInvoice(shipment);
    } catch (error: any) {
      handleApiError(error, `fetching shipment ${shipmentIdStr} for invoice`);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, handleApiError]); // Removed token from deps


  return (
    <InvoiceContext.Provider value={{ displayInvoices, isLoading, fetchUserShipmentsForInvoices, getDisplayInvoiceById }}>
      {children}
    </InvoiceContext.Provider>
  );
};
