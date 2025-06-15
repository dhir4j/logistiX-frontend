"use client";

import type { Shipment } from '@/lib/types';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface ShipmentContextType {
  shipments: Shipment[];
  addShipment: (shipment: Shipment) => void;
  getShipmentById: (id: string) => Shipment | undefined;
  isLoading: boolean;
}

export const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);

export const ShipmentProvider = ({ children }: { children: ReactNode }) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedShipments = localStorage.getItem('swifttrack_shipments');
      if (storedShipments) {
        const parsedShipments = JSON.parse(storedShipments).map((s: Shipment) => ({
          ...s,
          pickupDate: new Date(s.pickupDate),
          bookingDate: new Date(s.bookingDate),
        }));
        setShipments(parsedShipments);
      }
    } catch (error) {
      console.error("Failed to load shipments from localStorage", error);
      localStorage.removeItem('swifttrack_shipments');
    }
    setIsLoading(false);
  }, []);

  const updateLocalStorage = (updatedShipments: Shipment[]) => {
    try {
      localStorage.setItem('swifttrack_shipments', JSON.stringify(updatedShipments));
    } catch (error) {
      console.error("Failed to save shipments to localStorage", error);
    }
  };

  const addShipment = useCallback((shipment: Shipment) => {
    setShipments(prevShipments => {
      const newShipments = [shipment, ...prevShipments];
      updateLocalStorage(newShipments);
      return newShipments;
    });
  }, []);

  const getShipmentById = useCallback((id: string) => {
    return shipments.find(s => s.id === id);
  }, [shipments]);

  return (
    <ShipmentContext.Provider value={{ shipments, addShipment, getShipmentById, isLoading }}>
      {children}
    </ShipmentContext.Provider>
  );
};
