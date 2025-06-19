
"use client";

import type { Shipment, CreateShipmentResponse, ServiceType } from '@/lib/types';
import React, { createContext, useState, ReactNode, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface ShipmentContextType {
  shipments: Shipment[]; // Will store mapped (camelCase) shipments
  isLoading: boolean;
  fetchUserShipments: () => Promise<void>;
  getShipmentById: (shipment_id_str: string) => Promise<Shipment | undefined>; // Param is snake_case
  addShipment: (shipmentData: { 
        sender_name: string;
        sender_address_street: string;
        sender_address_city: string;
        sender_address_state: string;
        sender_address_pincode: string;
        sender_address_country: string;
        sender_phone: string;
        receiver_name: string;
        receiver_address_street: string;
        receiver_address_city: string;
        receiver_address_state: string;
        receiver_address_pincode: string;
        receiver_address_country: string;
        receiver_phone: string;
        package_weight_kg: number;
        package_width_cm: number;
        package_height_cm: number;
        package_length_cm: number;
        pickup_date: string; 
        service_type: ServiceType;
    }) => Promise<CreateShipmentResponse>;
}

export const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);

// Helper function to map API snake_case to frontend camelCase for Shipment
// Ensures that the critical shipmentIdStr (from shipment_id_str) is always mapped.
export const mapApiShipmentToFrontend = (apiShipment: any): Shipment => {
  if (!apiShipment.shipment_id_str) {
    console.warn("API Shipment object is missing 'shipment_id_str':", apiShipment);
  }
  return {
    // Raw snake_case fields from API
    id: apiShipment.id,
    user_id: apiShipment.user_id,
    shipment_id_str: apiShipment.shipment_id_str || 'UNKNOWN_ID', // Fallback for safety
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

    // Corresponding camelCase fields for frontend use
    userId: apiShipment.user_id,
    shipmentIdStr: apiShipment.shipment_id_str || 'UNKNOWN_ID', // Fallback for safety
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
    // status is already camelCase
    priceWithoutTax: parseFloat(apiShipment.price_without_tax),
    taxAmount18Percent: parseFloat(apiShipment.tax_amount_18_percent),
    totalWithTax18Percent: parseFloat(apiShipment.total_with_tax_18_percent),
    // trackingHistory is already camelCase array
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
      // API returns array of snake_case shipments
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
    if (!isAuthenticated) { // Endpoint is open, but this function is contextually for authenticated users
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
      // API returns snake_case shipment
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
    // Expects snake_case keys as per API spec for request body
    shipmentData: { 
        sender_name: string;
        sender_address_street: string;
        sender_address_city: string;
        sender_address_state: string;
        sender_address_pincode: string;
        sender_address_country: string;
        sender_phone: string;
        receiver_name: string;
        receiver_address_street: string;
        receiver_address_city: string;
        receiver_address_state: string;
        receiver_address_pincode: string;
        receiver_address_country: string;
        receiver_phone: string;
        package_weight_kg: number;
        package_width_cm: number;
        package_height_cm: number;
        package_length_cm: number;
        pickup_date: string; 
        service_type: ServiceType;
    }
  ): Promise<CreateShipmentResponse> => {
    if (!user) throw new Error("User context not available for booking shipment.");
    
    setIsLoading(true);
    try {
      // API request body uses snake_case
      const response = await apiClient<CreateShipmentResponse>('/api/shipments', {
        method: 'POST',
        body: JSON.stringify(shipmentData), // Pass snake_case data directly
      });
      // The response.data should be a snake_case shipment object.
      // fetchUserShipments will re-fetch and map, or we can map response.data and add to local state.
      await fetchUserShipments(); 
      return response; // response.shipment_id_str and response.data are snake_case
    } catch (error: any) {
      handleApiError(error, 'adding shipment');
      throw error; 
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchUserShipments, handleApiError, isAuthenticated]);

  return (
    <ShipmentContext.Provider value={{ shipments, isLoading, fetchUserShipments, getShipmentById, addShipment }}>
      {children}
    </ShipmentContext.Provider>
  );
};
