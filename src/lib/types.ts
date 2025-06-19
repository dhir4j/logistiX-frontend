export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
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

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string; // Invoice ID, e.g., INV-RS123456
  shipmentId: string;
  invoiceDate: Date;
  dueDate: Date; // For simulation, can be same as invoiceDate
  senderDetails: {
    name: string;
    address: string;
    phone: string;
  };
  receiverDetails: {
    name: string;
    address: string;
    phone: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // e.g., 0.05 for 5%
  taxAmount: number;
  grandTotal: number;
  status: "Paid" | "Pending"; // For simulation, will default to "Paid"
  serviceType: ServiceType;
  packageWeight: number;
}
