
// Matches API structure for Address
export interface AddressDetail {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

// Matches API structure for User
export interface User {
  id: number; // Assuming integer ID from PostgreSQL
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  // created_at could be added if needed by frontend
}

export type ServiceType = "Standard" | "Express";
export type TrackingStage = "Booked" | "In Transit" | "Out for Delivery" | "Delivered" | "Cancelled";

// Matches API structure for Tracking History entries
export interface TrackingStep {
  stage: TrackingStage;
  date: string; // ISO8601 Timestamp string from API
  location: string;
  activity: string;
  status?: "completed" | "current" | "pending"; // Frontend-only enrichment for UI
}

// Matches API structure for Shipment
export interface Shipment {
  id: number; // Assuming integer ID from PostgreSQL
  userId?: number; // user_id from DB
  shipmentIdStr: string; // Custom string ID like RS123456

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

  pickupDate: string; // YYYY-MM-DD string for API, was Date object
  serviceType: ServiceType;
  bookingDate: string; // ISO8601 Timestamp string from API, was Date object
  status: TrackingStage;

  priceWithoutTax: number;
  taxAmount18Percent: number;
  totalWithTax18Percent: number;

  trackingHistory: TrackingStep[];
  lastUpdatedAt?: string; // ISO8601 Timestamp string from API
  
  // For Admin Orders Table, might not come from API directly but can be derived
  customerName?: string; 
  orderNumber?: string; 
  description?: string; 
}

// API response for login
export interface LoginResponse {
  accessToken: string;
  user: User;
}

// API response for creating shipment
export interface CreateShipmentResponse {
    shipmentIdStr: string;
    message: string;
    data: Shipment;
}

// API response for admin listing shipments
export interface AdminShipmentsResponse {
    shipments: Shipment[];
    totalPages: number;
    currentPage: number;
    totalCount: number;
}

// API response for updating shipment status
export interface UpdateShipmentStatusResponse {
    message: string;
    updatedShipment: Shipment;
}

// Redefining Invoice for frontend display purposes, derived from Shipment data
export interface DisplayInvoice {
  id: string; // Use shipmentIdStr as the unique ID for display
  shipmentIdStr: string;
  invoiceDate: Date; // Parsed from shipment.bookingDate
  dueDate: Date; // Can be same as invoiceDate or calculated

  senderDetails: {
    name: string;
    address: AddressDetail; // Reconstruct AddressDetail from shipment fields
    phone: string;
  };
  receiverDetails: {
    name: string;
    address: AddressDetail; // Reconstruct AddressDetail from shipment fields
    phone: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number; // shipment.priceWithoutTax
    total: number; // shipment.priceWithoutTax
  }>;
  subtotal: number; // shipment.priceWithoutTax
  taxRate: number; // Always 0.18
  taxAmount: number; // shipment.taxAmount18Percent
  grandTotal: number; // shipment.totalWithTax18Percent
  status: "Paid" | "Pending"; // Can be hardcoded to "Paid" as per current logic
  serviceType: ServiceType;
  packageWeight: number;
}
