
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
  addShipment: (shipmentData: Omit<Shipment, 'id' | 'shipmentIdStr' | 'userId' | 'bookingDate' | 'status' | 'trackingHistory' | 'priceWithoutTax' | 'taxAmount18Percent' | 'totalWithTax18Percent' | 'customerName' | 'orderNumber' | 'description'>) => Promise<CreateShipmentResponse>;
}

export const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);

export const ShipmentProvider = ({ children }: { children: ReactNode }) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
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

  const fetchUserShipments = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setShipments([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await apiClient<Shipment[]>('/api/shipments');
      setShipments(data.map(s => ({
        ...s,
        bookingDate: s.booking_date, 
        pickupDate: s.pickup_date, 
        // Ensure all snake_case fields from API are mapped to camelCase if needed by frontend types
        // For example, if types.ts uses camelCase but API sends snake_case:
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
        serviceType: s.service_type,
        priceWithoutTax: s.price_without_tax,
        taxAmount18Percent: s.tax_amount_18_percent,
        totalWithTax18Percent: s.total_with_tax_18_percent,
        trackingHistory: s.tracking_history || [],
      })));
    } catch (error: any) {
      handleApiError(error, 'fetching user shipments');
      setShipments([]); 
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, handleApiError]);


  const getShipmentById = useCallback(async (shipmentIdStr: string): Promise<Shipment | undefined> => {
    if (!isAuthenticated || !token) return undefined;
    setIsLoading(true);
    try {
      const data = await apiClient<Shipment>(`/api/shipments/${shipmentIdStr}`);
      // Map snake_case to camelCase from API response
      return {
        ...data,
        bookingDate: data.booking_date,
        pickupDate: data.pickup_date,
        shipmentIdStr: data.shipment_id_str,
        senderName: data.sender_name,
        senderAddressStreet: data.sender_address_street,
        senderAddressCity: data.sender_address_city,
        senderAddressState: data.sender_address_state,
        senderAddressPincode: data.sender_address_pincode,
        senderAddressCountry: data.sender_address_country,
        senderPhone: data.sender_phone,
        receiverName: data.receiver_name,
        receiverAddressStreet: data.receiver_address_street,
        receiverAddressCity: data.receiver_address_city,
        receiverAddressState: data.receiver_address_state,
        receiverAddressPincode: data.receiver_address_pincode,
        receiverAddressCountry: data.receiver_address_country,
        receiverPhone: data.receiver_phone,
        packageWeightKg: data.package_weight_kg,
        packageWidthCm: data.package_width_cm,
        packageHeightCm: data.package_height_cm,
        packageLengthCm: data.package_length_cm,
        serviceType: data.service_type,
        priceWithoutTax: data.price_without_tax,
        taxAmount18Percent: data.tax_amount_18_percent,
        totalWithTax18Percent: data.total_with_tax_18_percent,
        trackingHistory: data.tracking_history || [],
      };
    } catch (error: any) {
      handleApiError(error, `fetching shipment ${shipmentIdStr}`);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, handleApiError]);

  const addShipment = useCallback(async (
    shipmentData: { // This structure should match the form data before it's transformed for the API
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
        pickupDate: string; // YYYY-MM-DD
        serviceType: ServiceType;
    }
  ): Promise<CreateShipmentResponse> => {
    if (!isAuthenticated || !token) throw new Error("User not authenticated");
    setIsLoading(true);
    try {
      // API expects snake_case for address fields and others in the body
      const apiRequestBody = {
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
        pickup_date: shipmentData.pickupDate, // Already in YYYY-MM-DD
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
      throw error; // Re-throw for the form to handle
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, fetchUserShipments, handleApiError]);

  return (
    <ShipmentContext.Provider value={{ shipments, isLoading, fetchUserShipments, getShipmentById, addShipment }}>
      {children}
    </ShipmentContext.Provider>
  );
};
