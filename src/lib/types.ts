
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
  isAdmin: boolean;  
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
// API fields are expected to be snake_case.
// Frontend components will often use a camelCase version, handled by mapping functions.
export interface Shipment {
  // Fields expected directly from API (snake_case)
  id: number; 
  user_id?: number;
  shipment_id_str: string; // CRITICAL: This is the key identifier from the API

  sender_name: string;
  sender_address_street: string;
  sender_address_city: string;
  sender_address_state: string;
  sender_address_pincode: string;
  sender_address_country: string;
  sender_phone: string;

  receiver_name: string;
  receiver_address_street: string;
  receiver_address_city: string;
  receiver_address_state: string;
  receiver_address_pincode: string;
  receiver_address_country: string;
  receiver_phone: string;

  package_weight_kg: number;
  package_width_cm: number;
  package_height_cm: number;
  package_length_cm: number;

  pickup_date: string; // YYYY-MM-DD string
  service_type: ServiceType;
  booking_date: string; // ISO8601 Timestamp string from API
  status: TrackingStage;

  price_without_tax: number;
  tax_amount_18_percent: number;
  total_with_tax_18_percent: number;

  tracking_history: TrackingStep[];
  last_updated_at?: string; // ISO8601 Timestamp string from API
  
  // Frontend camelCase representation (populated by mapping)
  // These are primarily for convenience in frontend components if preferred.
  // The direct snake_case fields above are what the API provides.
  userId?: number;
  shipmentIdStr: string; // This will hold the value of shipment_id_str

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
  bookingDate: string; // ISO8601 Timestamp string
  // status is already camelCase (TrackingStage)

  priceWithoutTax: number;
  taxAmount18Percent: number;
  totalWithTax18Percent: number;
  
  // trackingHistory is already an array of TrackingStep

  // Admin table helper fields (populated client-side if needed, or derived from above)
  customerName?: string; // Typically sender_name
  orderNumber?: string;  // Typically shipment_id_str
  description?: string;  // Derived
}


// API response for login - NO TOKEN
export interface LoginResponse {
  user: User; 
}

// API response for creating shipment
export interface CreateShipmentResponse {
    shipment_id_str: string; 
    message: string;
    data: Shipment; // Full shipment object as created on backend (snake_case)
}

// API response for admin listing shipments
export interface AdminShipmentsResponse {
    shipments: Shipment[]; // Array of full shipment objects (snake_case)
    totalPages: number;
    currentPage: number;
    totalCount: number;
}

// API response for updating shipment status
export interface UpdateShipmentStatusResponse {
    message: string;
    updatedShipment: Shipment; // Full updated shipment object (snake_case)
}

// For frontend display, derived from Shipment data
export interface DisplayInvoice {
  id: string; // Will be shipment_id_str
  shipmentIdStr: string; // Explicitly shipment_id_str
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
