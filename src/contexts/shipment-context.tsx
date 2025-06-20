
"use client";

import type { Shipment, CreateShipmentResponse, ServiceType, AddShipmentPayload } from '@/lib/types'; // Added AddShipmentPayload
import React, { createContext, useState, ReactNode, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface ShipmentContextType {
  shipments: Shipment[]; 
  isLoading: boolean;
  fetchUserShipments: () => Promise<void>;
  getShipmentById: (shipment_id_str: string) => Promise<Shipment | undefined>; 
  addShipment: (shipmentData: AddShipmentPayload) => Promise<CreateShipmentResponse>; // Use AddShipmentPayload
}

export const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);

export const mapApiShipmentToFrontend = (apiShipment: any): Shipment => {
  if (!apiShipment.shipment_id_str) {
    console.warn("API Shipment object is missing 'shipment_id_str':", apiShipment);
  }
  return {
    // Snake_case fields from API (expected in API responses)
    id: apiShipment.id,
    user_id: apiShipment.user_id,
    shipment_id_str: apiShipment.shipment_id_str || 'UNKNOWN_ID', 
    sender_name: apiShipment.sender_name,
    sender_address_street: apiShipment.sender_address_street,
    sender_address_city: apiShipment.sender_address_city,
    sender_address_state: apiShipment.sender_address_state,
    sender_address_pincode: apiShipment.sender_address_pincode,
    sender_address_country: apiShipment.sender_address_country,
    sender_phone: apiShipment.sender_phone,
    receiver_name: apiShipment.receiver_name,
    receiver_address_street: apiShipment.receiver_address_street,
    receiver_address_city: apiShipment.receiver_address_city,
    receiver_address_state: apiShipment.receiver_address_state,
    receiver_address_pincode: apiShipment.receiver_address_pincode,
    receiver_address_country: apiShipment.receiver_address_country,
    receiver_phone: apiShipment.receiver_phone,
    package_weight_kg: parseFloat(apiShipment.package_weight_kg),
    package_width_cm: parseFloat(apiShipment.package_width_cm),
    package_height_cm: parseFloat(apiShipment.package_height_cm),
    package_length_cm: parseFloat(apiShipment.package_length_cm),
    pickup_date: apiShipment.pickup_date,
    service_type: apiShipment.service_type,
    booking_date: apiShipment.booking_date,
    status: apiShipment.status,
    price_without_tax: parseFloat(apiShipment.price_without_tax),
    tax_amount_18_percent: parseFloat(apiShipment.tax_amount_18_percent),
    total_with_tax_18_percent: parseFloat(apiShipment.total_with_tax_18_percent),
    tracking_history: apiShipment.tracking_history || [],
    last_updated_at: apiShipment.last_updated_at,

    // Frontend camelCase representation (populated by mapping)
    userId: apiShipment.user_id,
    shipmentIdStr: apiShipment.shipment_id_str || 'UNKNOWN_ID', 
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
    priceWithoutTax: parseFloat(apiShipment.price_without_tax),
    taxAmount18Percent: parseFloat(apiShipment.tax_amount_18_percent),
    totalWithTax18Percent: parseFloat(apiShipment.total_with_tax_18_percent),
    trackingHistory: apiShipment.tracking_history || [], // Ensure trackingHistory is also populated
    lastUpdatedAt: apiShipment.last_updated_at,
  };
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
    } else {
        toast({
          title: `Error ${operation}`,
          description: errorMessage,
          variant: "destructive",
        });
    }
  }, [toast, logoutUser]);

  const fetchUserShipments = useCallback(async () => {
    if (!isAuthenticated || !user) { 
      setShipments([]);
      return;
    }
    setIsLoading(true);
    try {
      const dataFromApi = await apiClient<any[]>('/api/shipments'); 
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
    } catch (error: any) {
      handleApiError(error, `fetching shipment ${shipment_id_str}`);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, handleApiError, toast]);

  const addShipment = useCallback(async (
    shipmentData: AddShipmentPayload 
  ): Promise<CreateShipmentResponse> => {
    if (!user) throw new Error("User context not available for booking shipment.");
    
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
  }, [user, fetchUserShipments, handleApiError]); 

  return (
    <ShipmentContext.Provider value={{ shipments, isLoading, fetchUserShipments, getShipmentById, addShipment }}>
      {children}
    </ShipmentContext.Provider>
  );
};
