
"use client";

import type { Shipment, TrackingStage, CreateShipmentResponse, ServiceType, AddressDetail } from '@/lib/types';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';

interface ShipmentContextType {
  shipments: Shipment[];
  isLoading: boolean;
  fetchUserShipments: () => Promise<void>;
  getShipmentById: (shipmentIdStr: string) => Promise<Shipment | undefined>;
  addShipment: (shipmentData: Omit<Shipment, 'id' | 'shipmentIdStr' | 'userId' | 'bookingDate' | 'status' | 'trackingHistory' | 'priceWithoutTax' | 'taxAmount18Percent' | 'totalWithTax18Percent' | 'customerName' | 'orderNumber' | 'description'>) => Promise<CreateShipmentResponse>;
  // updateShipmentStatus is an admin action, will be handled in admin components directly
}

export const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);

export const ShipmentProvider = ({ children }: { children: ReactNode }) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Initially false, true during API calls
  const { token, isAuthenticated } = useAuth();

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
        bookingDate: s.bookingDate, // Keep as string from API or parse if needed
        pickupDate: s.pickupDate,   // Keep as string from API
      })));
    } catch (error) {
      console.error("Failed to fetch user shipments", error);
      setShipments([]); // Clear shipments on error
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);


  const getShipmentById = useCallback(async (shipmentIdStr: string): Promise<Shipment | undefined> => {
    if (!isAuthenticated || !token) return undefined;
    setIsLoading(true);
    try {
      const data = await apiClient<Shipment>(`/api/shipments/${shipmentIdStr}`);
      return {
        ...data,
        bookingDate: data.bookingDate,
        pickupDate: data.pickupDate,
      };
    } catch (error) {
      console.error(`Failed to fetch shipment ${shipmentIdStr}`, error);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

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
        pickupDate: string; // YYYY-MM-DD
        serviceType: ServiceType;
    }
  ): Promise<CreateShipmentResponse> => {
    if (!isAuthenticated || !token) throw new Error("User not authenticated");
    setIsLoading(true);
    try {
      // API expects snake_case for address fields in the body
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
        pickup_date: shipmentData.pickupDate,
        service_type: shipmentData.serviceType,
      };
      const response = await apiClient<CreateShipmentResponse>('/api/shipments', {
        method: 'POST',
        body: JSON.stringify(apiRequestBody),
      });
      // After adding, refresh the list of user shipments
      await fetchUserShipments(); 
      return response;
    } catch (error) {
      console.error("Failed to add shipment", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token, fetchUserShipments]);

  return (
    <ShipmentContext.Provider value={{ shipments, isLoading, fetchUserShipments, getShipmentById, addShipment }}>
      {children}
    </ShipmentContext.Provider>
  );
};
