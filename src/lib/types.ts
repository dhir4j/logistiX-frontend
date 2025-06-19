
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
  firstName: string; // API sends as firstName
  lastName: string;  // API sends as lastName
  isAdmin: boolean;  // API sends as isAdmin
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

// This interface represents the structure of shipment data as returned by your API.
// API fields are expected to be snake_case and are mapped to camelCase in contexts/components.
export interface Shipment {
  id: number; 
  userId?: number; // from user_id
  shipmentIdStr: string; // from shipment_id_str

  senderName: string; // from sender_name
  senderAddressStreet: string; // from sender_address_street
  senderAddressCity: string; // from sender_address_city
  senderAddressState: string; // from sender_address_state
  senderAddressPincode: string; // from sender_address_pincode
  senderAddressCountry: string; // from sender_address_country
  senderPhone: string; // from sender_phone

  receiverName: string; // from receiver_name
  receiverAddressStreet: string; // from receiver_address_street
  receiverAddressCity: string; // from receiver_address_city
  receiverAddressState: string; // from receiver_address_state
  receiverAddressPincode: string; // from receiver_address_pincode
  receiverAddressCountry: string; // from receiver_address_country
  receiverPhone: string; // from receiver_phone

  packageWeightKg: number; // from package_weight_kg
  packageWidthCm: number; // from package_width_cm
  packageHeightCm: number; // from package_height_cm
  packageLengthCm: number; // from package_length_cm

  pickupDate: string; // from pickup_date (YYYY-MM-DD string)
  serviceType: ServiceType; // from service_type
  bookingDate: string; // from booking_date (ISO8601 Timestamp string from API)
  status: TrackingStage;

  priceWithoutTax: number; // from price_without_tax
  taxAmount18Percent: number; // from tax_amount_18_percent
  totalWithTax18Percent: number; // from total_with_tax_18_percent

  trackingHistory: TrackingStep[]; // from tracking_history
  lastUpdatedAt?: string; // from last_updated_at (ISO8601 Timestamp string from API)
  
  // Raw snake_case fields as potentially received from API before mapping
  user_id?: number;
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

  // Admin table helper fields (populated client-side if needed)
  customerName?: string;
  orderNumber?: string;
  description?: string;
}


// API response for login - NO TOKEN
export interface LoginResponse {
  // No accessToken
  user: User; // User object now includes isAdmin
}

// API response for creating shipment
export interface CreateShipmentResponse {
    shipmentIdStr: string; 
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

// For frontend display, derived from Shipment data
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
  status: "Paid" | "Pending"; // Client-side logic, assuming "Paid" after successful booking
  serviceType: ServiceType;
  packageWeight: number;
}
