
"use client";

import type { Shipment, AddressDetail, DisplayInvoice } from '@/lib/types';
import React, { createContext, useState, ReactNode, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import { parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { mapApiShipmentToFrontend } from './shipment-context'; // Import the mapper

interface InvoiceContextType {
  displayInvoices: DisplayInvoice[]; 
  isLoading: boolean;
  fetchUserShipmentsForInvoices: () => Promise<void>;
  getDisplayInvoiceByShipmentId: (shipment_id_str: string) => Promise<DisplayInvoice | undefined>; // Param is snake_case
}

export const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

const transformShipmentToDisplayInvoice = (mappedShipment: Shipment): DisplayInvoice => {
  // mappedShipment is already in camelCase (or with snake_case fallbacks) due to mapApiShipmentToFrontend
  const senderAddr: AddressDetail = {
    street: mappedShipment.senderAddressStreet || mappedShipment.sender_address_street,
    city: mappedShipment.senderAddressCity || mappedShipment.sender_address_city,
    state: mappedShipment.senderAddressState || mappedShipment.sender_address_state,
    pincode: mappedShipment.senderAddressPincode || mappedShipment.sender_address_pincode,
    country: mappedShipment.senderAddressCountry || mappedShipment.sender_address_country,
  };
  const receiverAddr: AddressDetail = {
    street: mappedShipment.receiverAddressStreet || mappedShipment.receiver_address_street,
    city: mappedShipment.receiverAddressCity || mappedShipment.receiver_address_city,
    state: mappedShipment.receiverAddressState || mappedShipment.receiver_address_state,
    pincode: mappedShipment.receiverAddressPincode || mappedShipment.receiver_address_pincode,
    country: mappedShipment.receiverAddressCountry || mappedShipment.receiver_address_country,
  };

  const bookingDate = mappedShipment.bookingDate || mappedShipment.booking_date;
  const shipmentId = mappedShipment.shipmentIdStr || mappedShipment.shipment_id_str; // Use mapped shipmentIdStr

  // Determine invoice status based on shipment status
  const invoiceStatus = mappedShipment.status === 'Pending Payment' ? 'Pending' : 'Paid';

  return {
    id: shipmentId, 
    shipmentIdStr: shipmentId,
    invoiceDate: bookingDate ? parseISO(bookingDate) : new Date(),
    dueDate: bookingDate ? parseISO(bookingDate) : new Date(), 
    senderDetails: {
      name: mappedShipment.senderName || mappedShipment.sender_name,
      address: senderAddr,
      phone: mappedShipment.senderPhone || mappedShipment.sender_phone,
    },
    receiverDetails: {
      name: mappedShipment.receiverName || mappedShipment.receiver_name,
      address: receiverAddr,
      phone: mappedShipment.receiverPhone || mappedShipment.receiver_phone,
    },
    items: [{
      description: `${mappedShipment.serviceType || mappedShipment.service_type} Shipping (${mappedShipment.packageWeightKg || mappedShipment.package_weight_kg}kg) for ${shipmentId}`,
      quantity: 1,
      unitPrice: mappedShipment.priceWithoutTax || mappedShipment.price_without_tax,
      total: mappedShipment.priceWithoutTax || mappedShipment.price_without_tax,
    }],
    subtotal: mappedShipment.priceWithoutTax || mappedShipment.price_without_tax,
    taxRate: 0.18, 
    taxAmount: mappedShipment.taxAmount18Percent || mappedShipment.tax_amount_18_percent,
    grandTotal: mappedShipment.totalWithTax18Percent || mappedShipment.total_with_tax_18_percent,
    status: invoiceStatus, // Use the dynamically determined status
    serviceType: mappedShipment.serviceType || mappedShipment.service_type,
    packageWeight: mappedShipment.packageWeightKg || mappedShipment.package_weight_kg,
  };
};


export const InvoiceProvider = ({ children }: { children: ReactNode }) => {
  const [displayInvoices, setDisplayInvoices] = useState<DisplayInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated, logoutUser } = useAuth();
  const { toast } = useToast();

  const handleApiError = useCallback((error: any, operation: string) => {
    console.error(`API error during ${operation}:`, error);
    const errorMessage = error?.data?.error || error.message || "An unexpected error occurred.";
    if (error.status === 422) {
        toast({
            title: "Authentication Issue",
            description: "Your session may have expired. Please log in again.",
            variant: "destructive",
        });
        logoutUser();
    } else {
        toast({
            title: `Error ${operation}`,
            description: errorMessage,
            variant: "destructive",
        });
    }
  }, [toast, logoutUser]);

  const fetchUserShipmentsForInvoices = useCallback(async () => {
    if (!isAuthenticated || !user?.email) { 
      setDisplayInvoices([]);
      return;
    }
    setIsLoading(true);
    try {
      // API returns array of snake_case shipments
      const shipmentsDataFromApi = await apiClient<any[]>(`/api/shipments?email=${encodeURIComponent(user.email)}`); 
      // Map to frontend camelCase (or hybrid) Shipment objects
      const mappedShipmentsData: Shipment[] = shipmentsDataFromApi.map(mapApiShipmentToFrontend);
      // Transform these mapped shipments into DisplayInvoice objects
      const transformedInvoices = mappedShipmentsData.map(transformShipmentToDisplayInvoice);
      setDisplayInvoices(transformedInvoices);
    } catch (error: any) {
      handleApiError(error, 'fetching shipments for invoices');
      setDisplayInvoices([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, handleApiError]);

  const getDisplayInvoiceByShipmentId = useCallback(async (shipment_id_str: string): Promise<DisplayInvoice | undefined> => {
    if (!isAuthenticated) {
        toast({ title: "Not Authenticated", description: "Please log in to view invoice details.", variant: "destructive" });
        return undefined;
    }
    if (!shipment_id_str || shipment_id_str === 'UNKNOWN_ID' || shipment_id_str === 'undefined') {
        console.error("getDisplayInvoiceByShipmentId called with invalid ID:", shipment_id_str);
        toast({ title: "Invalid ID", description: "Cannot fetch invoice with an invalid ID.", variant: "destructive" });
        return undefined;
    }
    setIsLoading(true);
    try {
      // API returns snake_case shipment
      const shipmentFromApi = await apiClient<any>(`/api/shipments/${shipment_id_str}`);
      // Map to frontend camelCase (or hybrid) Shipment object
      const mappedShipment: Shipment = mapApiShipmentToFrontend(shipmentFromApi);
      return transformShipmentToDisplayInvoice(mappedShipment);
    } catch (error: any) {
      handleApiError(error, `fetching shipment ${shipment_id_str} for invoice`);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, handleApiError, toast]);


  return (
    <InvoiceContext.Provider value={{ displayInvoices, isLoading, fetchUserShipmentsForInvoices, getDisplayInvoiceByShipmentId: getDisplayInvoiceByShipmentId }}>
      {children}
    </InvoiceContext.Provider>
  );
};
