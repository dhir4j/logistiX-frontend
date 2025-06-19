
export interface AddressDetail {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

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
  senderAddress: AddressDetail;
  senderPhone: string;
  receiverName: string;
  receiverAddress: AddressDetail;
  receiverPhone: string;
  packageWeight: number;
  packageWidth: number;
  packageHeight: number;
  packageLength: number;
  pickupDate: Date;
  serviceType: ServiceType;
  bookingDate: Date;
  status: TrackingStage;
  // Added to allow admin to add notes or for other future use
  adminNotes?: string; 
  lastUpdatedAt?: Date;
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
    address: AddressDetail;
    phone: string;
  };
  receiverDetails: {
    name: string;
    address: AddressDetail;
    phone: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // e.g., 0.18 for 18%
  taxAmount: number;
  grandTotal: number;
  status: "Paid" | "Pending"; // For simulation, will default to "Paid"
  serviceType: ServiceType;
  packageWeight: number;
}

