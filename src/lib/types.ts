
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

// This interface represents the structure of shipment data.
// API fields are snake_case. Frontend uses camelCase internally via mapping.
export interface Shipment {
  // Snake_case fields from API (expected in API responses)
  id: number;
  user_id?: number;
  shipment_id_str: string;
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
  pickup_date: string;
  service_type: ServiceType;
  booking_date: string;
  status: TrackingStage;
  price_without_tax: number;
  tax_amount_18_percent: number;
  total_with_tax_18_percent: number;
  tracking_history: TrackingStep[];
  last_updated_at?: string;

  // Frontend camelCase representation (populated by mapping)
  // These can be used in frontend logic for convenience.
  // The mapping function ensures these are consistent with snake_case fields.
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
  pickupDate: string; 
  serviceType: ServiceType;
  bookingDate: string; 
  priceWithoutTax: number;
  taxAmount18Percent: number;
  totalWithTax18Percent: number;
  trackingHistory: TrackingStep[]; // Already camelCase from API structure for nested array
  lastUpdatedAt?: string;

  // Optional fields sometimes used in frontend displays or older logic
  customerName?: string; 
  orderNumber?: string;  
  description?: string;  
}


// API response for login - NO TOKEN
export interface LoginResponse {
  user: User; 
}

// API response for creating shipment (snake_case)
export interface CreateShipmentResponse {
    shipment_id_str: string; 
    message: string;
    data: Shipment; // Full shipment object as created on backend (snake_case)
}

// API response for admin listing shipments (snake_case)
export interface AdminShipmentsResponse {
    shipments: Shipment[]; // Array of snake_case shipment objects
    totalPages: number;
    currentPage: number;
    totalCount: number;
}

// API response for updating shipment status (snake_case)
export interface UpdateShipmentStatusResponse {
    message: string;
    updatedShipment: Partial<Shipment>; // Partial snake_case shipment object
}

// API response for web analytics (snake_case)
export interface WebAnalyticsResponse {
  total_orders: number;
  total_revenue: number;
  avg_revenue: number;
  total_users: number;
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
  taxRate: number; 
  taxAmount: number; 
  grandTotal: number; 
  status: "Paid" | "Pending"; 
  serviceType: ServiceType;
  packageWeight: number;
}

// New types for pricing APIs
export type ShipmentTypeOption = "Domestic" | "International";

export interface DomesticPriceRequest {
  state: string;
  mode: "express" | "standard";
  weight: number;
}

export interface DomesticPriceResponse {
  destination_state: string;
  mode: string; // "Express" or "Standard"
  weight_kg: number;
  price_per_kg: string; // e.g., "₹220"
  rounded_weight: number;
  total_price: string; // e.g., "₹660"
  error?: string;
}

export interface InternationalPriceRequest {
  country: string;
  weight: number;
}

export interface InternationalPriceResponse {
  country: string;
  zone: string;
  mode: string; // Always "Express"
  weight_kg: number;
  base_0_5kg: number;
  per_0_5kg_addl: number;
  addl_halfkg_units: number;
  total_price: number; // Numeric total price
  formatted_total: string; // e.g., "₹2,510"
  error?: string;
}

// Union type for payment step data
export type PriceApiResponse = DomesticPriceResponse | InternationalPriceResponse;
