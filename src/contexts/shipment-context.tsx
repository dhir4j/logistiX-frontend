
"use client";

import type { Shipment, CreateShipmentResponse, ServiceType, AddShipmentPayload } from '@/lib/types';
import React, { createContext, useState, ReactNode, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface ShipmentContextType {
  shipments: Shipment[]; 
  isLoading: boolean;
  fetchUserShipments: () => Promise<void>;
  getShipmentById: (shipment_id_str: string) => Promise<Shipment | undefined>; 
  addShipment: (shipmentData: AddShipmentPayload) => Promise<CreateShipmentResponse>;
}

export const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);

export const mapApiShipmentToFrontend = (apiShipment: any): Shipment => {
  if (!apiShipment) {
    console.error("mapApiShipmentToFrontend received null or undefined apiShipment");
    return {
        id: -1, 
        shipment_id_str: 'ERROR_INVALID_INPUT',
        sender_name: '', sender_address_street: '', sender_address_city: '', sender_address_state: '', sender_address_pincode: '', sender_address_country: '', sender_phone: '',
        receiver_name: '', receiver_address_street: '', receiver_address_city: '', receiver_address_state: '', receiver_address_pincode: '', receiver_address_country: '', receiver_phone: '',
        package_weight_kg: 0, package_width_cm: 0, package_height_cm: 0, package_length_cm: 0,
        pickup_date: new Date().toISOString(), service_type: 'Standard', booking_date: new Date().toISOString(), status: 'Booked',
        price_without_tax: 0, tax_amount_18_percent: 0, total_with_tax_18_percent: 0,
        tracking_history: [],
        
        shipmentIdStr: 'ERROR_INVALID_INPUT',
        senderName: '', senderAddressStreet: '', senderAddressCity: '', senderAddressState: '', senderAddressPincode: '', senderAddressCountry: '', senderPhone: '',
        receiverName: '', receiverAddressStreet: '', receiverAddressCity: '', receiverAddressState: '', receiverAddressPincode: '', receiverAddressCountry: '', receiverPhone: '',
        packageWeightKg: 0, packageWidthCm: 0, packageHeightCm: 0, packageLengthCm: 0,
        pickupDate: new Date().toISOString(), serviceType: 'Standard', bookingDate: new Date().toISOString(),
        priceWithoutTax: 0, taxAmount18Percent: 0, totalWithTax18Percent: 0,
        trackingHistory: [],
    } as Shipment;
  }

  const senderStreet = apiShipment.sender_address_street || apiShipment.sender_address_line1 || '';
  const receiverStreet = apiShipment.receiver_address_street || apiShipment.receiver_address_line1 || '';

  const mapped: Shipment = {
    // Snake_case fields from API
    id: apiShipment.id,
    user_id: apiShipment.user_id,
    user_email: apiShipment.user_email || '',
    shipment_id_str: apiShipment.shipment_id_str || 'UNKNOWN_ID', 
    sender_name: apiShipment.sender_name || '',
    sender_address_street: senderStreet,
    sender_address_city: apiShipment.sender_address_city || '',
    sender_address_state: apiShipment.sender_address_state || '',
    sender_address_pincode: apiShipment.sender_address_pincode || '',
    sender_address_country: apiShipment.sender_address_country || '',
    sender_phone: apiShipment.sender_phone || '',
    receiver_name: apiShipment.receiver_name || '',
    receiver_address_street: receiverStreet,
    receiver_address_city: apiShipment.receiver_address_city || '',
    receiver_address_state: apiShipment.receiver_address_state || '',
    receiver_address_pincode: apiShipment.receiver_address_pincode || '',
    receiver_address_country: apiShipment.receiver_address_country || '',
    receiver_phone: apiShipment.receiver_phone || '',
    package_weight_kg: parseFloat(apiShipment.package_weight_kg || 0),
    package_width_cm: parseFloat(apiShipment.package_width_cm || 0),
    package_height_cm: parseFloat(apiShipment.package_height_cm || 0),
    package_length_cm: parseFloat(apiShipment.package_length_cm || 0),
    pickup_date: apiShipment.pickup_date || new Date().toISOString(),
    service_type: apiShipment.service_type || 'Standard',
    booking_date: apiShipment.booking_date || new Date().toISOString(),
    status: apiShipment.status || 'Booked',
    price_without_tax: parseFloat(apiShipment.price_without_tax || 0),
    tax_amount_18_percent: parseFloat(apiShipment.tax_amount_18_percent || 0),
    total_with_tax_18_percent: parseFloat(apiShipment.total_with_tax_18_percent || 0),
    tracking_history: apiShipment.tracking_history || [],
    last_updated_at: apiShipment.last_updated_at,

    // Frontend camelCase representation
    userId: apiShipment.user_id,
    userEmail: apiShipment.user_email || '',
    shipmentIdStr: apiShipment.shipment_id_str || 'UNKNOWN_ID', 
    senderName: apiShipment.sender_name || '',
    senderAddressStreet: senderStreet,
    senderAddressLine1: apiShipment.sender_address_line1 || (apiShipment.sender_address_street ? apiShipment.sender_address_street.split(',')[0]?.trim() : ''),
    senderAddressLine2: apiShipment.sender_address_line2 || (apiShipment.sender_address_street ? apiShipment.sender_address_street.split(',').slice(1).join(',').trim() : undefined),
    senderAddressCity: apiShipment.sender_address_city || '',
    senderAddressState: apiShipment.sender_address_state || '',
    senderAddressPincode: apiShipment.sender_address_pincode || '',
    senderAddressCountry: apiShipment.sender_address_country || '',
    senderPhone: apiShipment.sender_phone || '',
    receiverName: apiShipment.receiver_name || '',
    receiverAddressStreet: receiverStreet,
    receiverAddressLine1: apiShipment.receiver_address_line1 || (apiShipment.receiver_address_street ? apiShipment.receiver_address_street.split(',')[0]?.trim() : ''),
    receiverAddressLine2: apiShipment.receiver_address_line2 || (apiShipment.receiver_address_street ? apiShipment.receiver_address_street.split(',').slice(1).join(',').trim() : undefined),
    receiverAddressCity: apiShipment.receiver_address_city || '',
    receiverAddressState: apiShipment.receiver_address_state || '',
    receiverAddressPincode: apiShipment.receiver_address_pincode || '',
    receiverAddressCountry: apiShipment.receiver_address_country || '',
    receiverPhone: apiShipment.receiver_phone || '',
    packageWeightKg: parseFloat(apiShipment.package_weight_kg || 0),
    packageWidthCm: parseFloat(apiShipment.package_width_cm || 0),
    packageHeightCm: parseFloat(apiShipment.package_height_cm || 0),
    packageLengthCm: parseFloat(apiShipment.package_length_cm || 0),
    pickupDate: apiShipment.pickup_date || new Date().toISOString(),
    serviceType: apiShipment.service_type || 'Standard',
    bookingDate: apiShipment.booking_date || new Date().toISOString(),
    priceWithoutTax: parseFloat(apiShipment.price_without_tax || 0),
    taxAmount18Percent: parseFloat(apiShipment.tax_amount_18_percent || 0),
    totalWithTax18Percent: parseFloat(apiShipment.total_with_tax_18_percent || 0),
    trackingHistory: apiShipment.tracking_history || [],
    lastUpdatedAt: apiShipment.last_updated_at,
  };
  return mapped;
};


export const ShipmentProvider = ({ children }: { children: ReactNode }) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated, logoutUser } = useAuth();
  const { toast } = useToast();

  const handleApiError = useCallback((error: any, operation: string) => {
    console.error(`API error during ${operation}:`, error);
    const errorMessage = error?.data?.error || error.message || "An unexpected error occurred.";
    if (error.status === 422) { 
        toast({
            title: "Authentication Issue",
            description: "Your session may have expired or is invalid. Please log in again.",
            variant: "destructive",
        });
        logoutUser();
    } else if (error.status === 400 && operation === 'adding shipment') { 
         toast({
            title: "Booking Failed",
            description: errorMessage, 
            variant: "destructive",
        });
    } else { 
        toast({
          title: `Error ${operation}`,
          description: errorMessage,
          variant: "destructive",
        });
    }
  }, [toast, logoutUser]);

  const fetchUserShipments = useCallback(async () => {
    if (!isAuthenticated || !user?.email) { 
      setShipments([]);
      return;
    }
    setIsLoading(true);
    try {
      const dataFromApi = await apiClient<any[]>(`/api/shipments?email=${encodeURIComponent(user.email)}`); 
      setShipments(dataFromApi.map(mapApiShipmentToFrontend));
    } catch (error: any) {
      handleApiError(error, 'fetching user shipments');
      setShipments([]); 
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, handleApiError]);


  const getShipmentById = useCallback(async (shipment_id_str: string): Promise<Shipment | undefined> => {
    if (!isAuthenticated) { 
        toast({ title: "Not Authenticated", description: "Please log in to view shipment details.", variant: "destructive" });
        return undefined;
    }
    if (!shipment_id_str || shipment_id_str === 'UNKNOWN_ID' || shipment_id_str === 'undefined') {
        console.error("getShipmentById called with invalid ID:", shipment_id_str);
        toast({ title: "Invalid ID", description: "Cannot fetch shipment with an invalid ID.", variant: "destructive" });
        return undefined;
    }
    setIsLoading(true);
    try {
      const dataFromApi = await apiClient<any>(`/api/shipments/${shipment_id_str}`);
      return mapApiShipmentToFrontend(dataFromApi);
    } catch (error: any)
{
      handleApiError(error, `fetching shipment ${shipment_id_str}`);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, handleApiError, toast]);

  const addShipment = useCallback(async (
    shipmentData: AddShipmentPayload 
  ): Promise<CreateShipmentResponse> => {
    setIsLoading(true);
    try {
      const response = await apiClient<CreateShipmentResponse>('/api/shipments', {
        method: 'POST',
        body: JSON.stringify(shipmentData), 
      });
      await fetchUserShipments(); 
      return response; 
    } catch (error: any) {
      handleApiError(error, 'adding shipment');
      throw error; 
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserShipments, handleApiError]); 

  return (
    <ShipmentContext.Provider value={{ shipments, isLoading, fetchUserShipments, getShipmentById, addShipment }}>
      {children}
    </ShipmentContext.Provider>
  );
};
