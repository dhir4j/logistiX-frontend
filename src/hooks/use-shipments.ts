"use client";

import { useContext } from 'react';
import { ShipmentContext } from '@/contexts/shipment-context';

export const useShipments = () => {
  const context = useContext(ShipmentContext);
  if (context === undefined) {
    throw new Error('useShipments must be used within a ShipmentProvider');
  }
  return context;
};
