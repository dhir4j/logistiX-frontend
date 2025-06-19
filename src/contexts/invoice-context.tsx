
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

const transformShipmentToDisplayInvoice = (shipment: Shipment): DisplayInvoice => {
  // Ensure all properties accessed from shipment match its actual structure (camelCase from frontend type)
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
    status: "Paid", 
    serviceType: shipment.serviceType,
    packageWeight: shipment.packageWeightKg,
  };
};


export const InvoiceProvider = ({ children }: { children: ReactNode }) => {
  const [displayInvoices, setDisplayInvoices] = useState<DisplayInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { token, isAuthenticated, logoutUser } = useAuth();
  const { toast } = useToast();

  const handleApiError = useCallback((error: any, operation: string) => {
    console.error(`API error during ${operation}:`, error);
    if (error.status === 422) {
      toast({
        title: "Authentication Error",
        description: "Your session is invalid. Please log in again.",
        variant: "destructive",
      });
      logoutUser();
    } else {
      toast({
        title: `Error ${operation}`,
        description: error?.data?.error || error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [toast, logoutUser]);

  const fetchUserShipmentsForInvoices = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setDisplayInvoices([]);
      return;
    }
    setIsLoading(true);
    try {
      const shipmentsDataFromApi = await apiClient<any[]>('/api/shipments'); 
      // Map API's snake_case to frontend's camelCase Shipment type before transforming
      const shipmentsData: Shipment[] = shipmentsDataFromApi.map(s => ({
        id: s.id,
        userId: s.user_id,
        shipmentIdStr: s.shipment_id_str,
        senderName: s.sender_name,
        senderAddressStreet: s.sender_address_street,
        senderAddressCity: s.sender_address_city,
        senderAddressState: s.sender_address_state,
        senderAddressPincode: s.sender_address_pincode,
        senderAddressCountry: s.sender_address_country,
        senderPhone: s.sender_phone,
        receiverName: s.receiver_name,
        receiverAddressStreet: s.receiver_address_street,
        receiverAddressCity: s.receiver_address_city,
        receiverAddressState: s.receiver_address_state,
        receiverAddressPincode: s.receiver_address_pincode,
        receiverAddressCountry: s.receiver_address_country,
        receiverPhone: s.receiver_phone,
        packageWeightKg: s.package_weight_kg,
        packageWidthCm: s.package_width_cm,
        packageHeightCm: s.package_height_cm,
        packageLengthCm: s.package_length_cm,
        pickupDate: s.pickup_date,
        serviceType: s.service_type,
        bookingDate: s.booking_date,
        status: s.status,
        priceWithoutTax: s.price_without_tax,
        taxAmount18Percent: s.tax_amount_18_percent,
        totalWithTax18Percent: s.total_with_tax_18_percent,
        trackingHistory: s.tracking_history || [],
        lastUpdatedAt: s.last_updated_at,
      }));
      const transformedInvoices = shipmentsData.map(transformShipmentToDisplayInvoice);
      setDisplayInvoices(transformedInvoices);
    } catch (error: any) {
      handleApiError(error, 'fetching shipments for invoices');
      setDisplayInvoices([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, handleApiError]);

  const getDisplayInvoiceById = useCallback(async (shipmentIdStr: string): Promise<DisplayInvoice | undefined> => {
    if (!isAuthenticated || !token) return undefined;
    setIsLoading(true);
    try {
      const shipmentFromApi = await apiClient<any>(`/api/shipments/${shipmentIdStr}`);
      // Map API's snake_case to frontend's camelCase Shipment type
      const shipment: Shipment = {
        id: shipmentFromApi.id,
        userId: shipmentFromApi.user_id,
        shipmentIdStr: shipmentFromApi.shipment_id_str,
        senderName: shipmentFromApi.sender_name,
        senderAddressStreet: shipmentFromApi.sender_address_street,
        senderAddressCity: shipmentFromApi.sender_address_city,
        senderAddressState: shipmentFromApi.sender_address_state,
        senderAddressPincode: shipmentFromApi.sender_address_pincode,
        senderAddressCountry: shipmentFromApi.sender_address_country,
        senderPhone: shipmentFromApi.sender_phone,
        receiverName: shipmentFromApi.receiver_name,
        receiverAddressStreet: shipmentFromApi.receiver_address_street,
        receiverAddressCity: shipmentFromApi.receiver_address_city,
        receiverAddressState: shipmentFromApi.receiver_address_state,
        receiverAddressPincode: shipmentFromApi.receiver_address_pincode,
        receiverAddressCountry: shipmentFromApi.receiver_address_country,
        receiverPhone: shipmentFromApi.receiver_phone,
        packageWeightKg: shipmentFromApi.package_weight_kg,
        packageWidthCm: shipmentFromApi.package_width_cm,
        packageHeightCm: shipmentFromApi.package_height_cm,
        packageLengthCm: shipmentFromApi.package_length_cm,
        pickupDate: shipmentFromApi.pickup_date,
        serviceType: shipmentFromApi.service_type,
        bookingDate: shipmentFromApi.booking_date,
        status: shipmentFromApi.status,
        priceWithoutTax: shipmentFromApi.price_without_tax,
        taxAmount18Percent: shipmentFromApi.tax_amount_18_percent,
        totalWithTax18Percent: shipmentFromApi.total_with_tax_18_percent,
        trackingHistory: shipmentFromApi.tracking_history || [],
        lastUpdatedAt: shipmentFromApi.last_updated_at,
      };
      return transformShipmentToDisplayInvoice(shipment);
    } catch (error: any) {
      handleApiError(error, `fetching shipment ${shipmentIdStr} for invoice`);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, handleApiError]);


  return (
    <InvoiceContext.Provider value={{ displayInvoices, isLoading, fetchUserShipmentsForInvoices, getDisplayInvoiceById }}>
      {children}
    </InvoiceContext.Provider>
  );
};
