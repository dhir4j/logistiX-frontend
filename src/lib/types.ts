
// Matches API structure for Address
export interface AddressDetail {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

// Matches API structure for User from /api/auth/login response
export interface User {
  id: number; 
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean; // Directly from API user object
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

// This interface should represent the structure of shipment data as returned by your API.
// If your API returns snake_case, you might have an intermediate mapping step
// or define this interface with snake_case and map to camelCase in your frontend logic/contexts.
// For now, assuming frontend prefers camelCase and mapping happens in context/component.
export interface Shipment {
  id: number; 
  userId?: number; 
  shipmentIdStr: string; 

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

  pickupDate: string; // YYYY-MM-DD string
  serviceType: ServiceType;
  bookingDate: string; // ISO8601 Timestamp string from API
  status: TrackingStage;

  priceWithoutTax: number;
  taxAmount18Percent: number;
  totalWithTax18Percent: number;

  trackingHistory: TrackingStep[];
  lastUpdatedAt?: string; // ISO8601 Timestamp string from API
  
  // Fields used in AdminOrdersTable, ensure they are mapped if API names differ
  customerName?: string; // Often senderName
  orderNumber?: string; // Often shipmentIdStr
  description?: string; // e.g., "Service Type (Weight) to City"

  // Raw fields from API if they are snake_case
  shipment_id_str?: string;
  sender_name?: string;
  sender_address_street?: string;
  sender_address_city?: string;
  sender_address_state?: string;
  sender_address_pincode?: string;
  sender_address_country?: string;
  sender_phone?: string;
  receiver_name?: string;
  receiver_address_street?: string;
  receiver_address_city?: string;
  receiver_address_state?: string;
  receiver_address_pincode?: string;
  receiver_address_country?: string;
  receiver_phone?: string;
  package_weight_kg?: number;
  package_width_cm?: number;
  package_height_cm?: number;
  package_length_cm?: number;
  pickup_date?: string;
  service_type?: ServiceType;
  booking_date?: string;
  price_without_tax?: number;
  tax_amount_18_percent?: number;
  total_with_tax_18_percent?: number;
  tracking_history?: TrackingStep[];
  last_updated_at?: string;
  user_id?: number;
}


// API response for login
export interface LoginResponse {
  accessToken: string;
  user: User; // User object now includes isAdmin
}

// API response for creating shipment
export interface CreateShipmentResponse {
    shipmentIdStr: string; // API might return shipment_id_str
    message: string;
    data: Shipment; // Full shipment object as created on backend
}

// API response for admin listing shipments
export interface AdminShipmentsResponse {
    shipments: Shipment[]; // Array of full shipment objects
    totalPages: number;
    currentPage: number;
    totalCount: number;
}

// API response for updating shipment status
export interface UpdateShipmentStatusResponse {
    message: string;
    updatedShipment: Shipment; // Full updated shipment object
}

// Redefining Invoice for frontend display purposes, derived from Shipment data
// This type remains useful for structuring data specifically for the invoice UI.
export interface DisplayInvoice {
  id: string; 
  shipmentIdStr: string;
  invoiceDate: Date; 
  dueDate: Date; 

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
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number; 
    total: number; 
  }>;
  subtotal: number; 
  taxRate: number; // Always 0.18
  taxAmount: number; 
  grandTotal: number; 
  status: "Paid" | "Pending"; 
  serviceType: ServiceType;
  packageWeight: number;
}
