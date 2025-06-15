export interface User {
  id: string;
  email: string;
}

export type ServiceType = "Standard" | "Express";

export interface Shipment {
  id: string;
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  receiverName: string;
  receiverAddress: string;
  receiverPhone: string;
  packageWeight: number;
  packageWidth: number;
  packageHeight: number;
  packageLength: number;
  pickupDate: Date;
  serviceType: ServiceType;
  bookingDate: Date;
  status: TrackingStage;
}

export type TrackingStage = "Booked" | "In Transit" | "Out for Delivery" | "Delivered" | "Cancelled";

export interface TrackingStep {
  stage: TrackingStage;
  date: string;
  location: string;
  activity: string;
  status: "completed" | "current" | "pending";
}
