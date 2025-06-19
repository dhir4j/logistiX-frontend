
"use client";

import type { Shipment, CreateShipmentResponse, ServiceType } from '@/lib/types';
import React, { createContext, useState, ReactNode, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface ShipmentContextType {
  shipments: Shipment[];
  isLoading: boolean;
  fetchUserShipments: () => Promise<void>;
  getShipmentById: (shipmentIdStr: string) => Promise<Shipment | undefined>;
  addShipment: (shipmentData: Omit<Shipment, 'id' | 'shipmentIdStr' | 'userId' | 'bookingDate' | 'status' | 'trackingHistory' | 'priceWithoutTax' | 'taxAmount18Percent' | 'totalWithTax18Percent' | 'customerName' | 'orderNumber' | 'description' | 'user_id' | 'shipment_id_str' | 'sender_name' | 'sender_address_street' | 'sender_address_city' | 'sender_address_state' | 'sender_address_pincode' | 'sender_address_country' | 'sender_phone' | 'receiver_name' | 'receiver_address_street' | 'receiver_address_city' | 'receiver_address_state' | 'receiver_address_pincode' | 'receiver_address_country' | 'receiver_phone' | 'package_weight_kg' | 'package_width_cm' | 'package_height_cm' | 'package_length_cm' | 'pickup_date' | 'service_type' | 'booking_date' | 'price_without_tax' | 'tax_amount_18_percent' | 'total_with_tax_18_percent' | 'tracking_history' | 'last_updated_at'>) => Promise<CreateShipmentResponse>;
}

export const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);

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


export const ShipmentProvider = ({ children }: { children: ReactNode }) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated, logoutUser } = useAuth(); // Removed token
  const { toast } = useToast();

  const handleApiError = useCallback((error: any, operation: string) => {
    console.error(`API error during ${operation}:`, error);
    // No automatic logout for 422, as per new requirements.
    // Toast for general errors.
    toast({
      title: `Error ${operation}`,
      description: error?.data?.error || error.message || "An unexpected error occurred.",
      variant: "destructive",
    });
  }, [toast, logoutUser]);

  const fetchUserShipments = useCallback(async () => {
    // if (!isAuthenticated || !token) { // Check isAuthenticated (user presence)
    if (!isAuthenticated || !user) { // Check if user object exists
      setShipments([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await apiClient<any[]>('/api/shipments'); // API will filter by user_id internally if needed, or this logic might change if user_id needs to be passed
      setShipments(data.map(mapApiShipmentToFrontend));
    } catch (error: any) {
      handleApiError(error, 'fetching user shipments');
      setShipments([]); 
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, handleApiError]);


  const getShipmentById = useCallback(async (shipmentIdStr: string): Promise<Shipment | undefined> => {
    // if (!isAuthenticated || !token) return undefined; // Check isAuthenticated
    if (!isAuthenticated) return undefined; // Endpoint is open, but conceptually tied to user context
    setIsLoading(true);
    try {
      const data = await apiClient<any>(`/api/shipments/${shipmentIdStr}`);
      return mapApiShipmentToFrontend(data);
    } catch (error: any) {
      handleApiError(error, `fetching shipment ${shipmentIdStr}`);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, handleApiError]);

  const addShipment = useCallback(async (
    shipmentData: { 
        senderName: string;
        senderAddressStreet: string;
        senderAddressCity: string;
        senderAddressState: string;
        senderAddressPincode: string;
        senderAddressCountry: string;
        senderPhone: string;
        receiverName: string;
        receiverAddressStreet: string;
        receiverAddressCity: string;
        receiverAddressState: string;
        receiverAddressPincode: string;
        receiverAddressCountry: string;
        receiverPhone: string;
        packageWeightKg: number;
        packageWidthCm: number;
        packageHeightCm: number;
        packageLengthCm: number;
        pickupDate: string; 
        serviceType: ServiceType;
    }
  ): Promise<CreateShipmentResponse> => {
    // if (!isAuthenticated || !token) throw new Error("User not authenticated"); // Check isAuthenticated
    // No auth check here as endpoints are open. User context is for data association.
    if (!user) throw new Error("User context not available for booking shipment."); // Ensure user context for userId
    
    setIsLoading(true);
    try {
      const apiRequestBody = {
        // user_id: user.id, // Backend should handle user association if needed implicitly or via another mechanism if not JWT
        sender_name: shipmentData.senderName,
        sender_address_street: shipmentData.senderAddressStreet,
        sender_address_city: shipmentData.senderAddressCity,
        sender_address_state: shipmentData.senderAddressState,
        sender_address_pincode: shipmentData.senderAddressPincode,
        sender_address_country: shipmentData.senderAddressCountry,
        sender_phone: shipmentData.senderPhone,
        receiver_name: shipmentData.receiverName,
        receiver_address_street: shipmentData.receiverAddressStreet,
        receiver_address_city: shipmentData.receiverAddressCity,
        receiver_address_state: shipmentData.receiverAddressState,
        receiver_address_pincode: shipmentData.receiverAddressPincode,
        receiver_address_country: shipmentData.receiverAddressCountry,
        receiver_phone: shipmentData.receiverPhone,
        package_weight_kg: shipmentData.packageWeightKg,
        package_width_cm: shipmentData.packageWidthCm,
        package_height_cm: shipmentData.packageHeightCm,
        package_length_cm: shipmentData.packageLengthCm,
        pickup_date: shipmentData.pickupDate,
        service_type: shipmentData.serviceType,
      };
      const response = await apiClient<CreateShipmentResponse>('/api/shipments', {
        method: 'POST',
        body: JSON.stringify(apiRequestBody),
      });
      await fetchUserShipments(); 
      return response;
    } catch (error: any) {
      handleApiError(error, 'adding shipment');
      throw error; 
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchUserShipments, handleApiError]); // Removed isAuthenticated, token from deps

  return (
    <ShipmentContext.Provider value={{ shipments, isLoading, fetchUserShipments, getShipmentById, addShipment }}>
      {children}
    </ShipmentContext.Provider>
  );
};
