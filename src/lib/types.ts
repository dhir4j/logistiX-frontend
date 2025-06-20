
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
  sender_address_street: string; // Will be mapped from sender_address_line1 from creation if needed
  sender_address_city: string;
  sender_address_state: string;
  sender_address_pincode: string;
  sender_address_country: string;
  sender_phone: string;
  receiver_name: string;
  receiver_address_street: string; // Will be mapped from receiver_address_line1 from creation if needed
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
  // For GET /api/shipments/{id} or GET /api/shipments, the backend might still return these older fields.
  // The mapping function handles this.
  userId?: number;
  shipmentIdStr: string; 
  senderName: string;
  senderAddressStreet: string; // This might be sender_address_line1 from GET
  senderAddressLine1?: string; // For consistency with new payload if needed
  senderAddressLine2?: string; // For consistency with new payload if needed
  senderAddressCity: string;
  senderAddressState: string;
  senderAddressPincode: string;
  senderAddressCountry: string;
  senderPhone: string;
  receiverName: string;
  receiverAddressStreet: string; // This might be receiver_address_line1 from GET
  receiverAddressLine1?: string; // For consistency with new payload if needed
  receiverAddressLine2?: string; // For consistency with new payload if needed
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
  trackingHistory: TrackingStep[];
  lastUpdatedAt?: string;

  customerName?: string; 
  orderNumber?: string;  
  description?: string;  
}


// API response for login - NO TOKEN
export interface LoginResponse {
  user: User; 
}

// API response for creating shipment (snake_case)
// This should now match the backend's response for a *created* shipment,
// which might be different from what we send.
export interface CreateShipmentResponse {
    shipment_id_str: string; 
    message: string;
    data: Shipment; // The full shipment object as returned by the backend after creation
}

// API response for admin listing shipments (snake_case)
export interface AdminShipmentsResponse {
    shipments: Shipment[]; 
    totalPages: number;
    currentPage: number;
    totalCount: number;
}

// API response for updating shipment status (snake_case)
export interface UpdateShipmentStatusResponse {
    message: string;
    updatedShipment: Partial<Shipment>; 
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
  mode: string; 
  weight_kg: number;
  price_per_kg: string; 
  rounded_weight: number;
  total_price: string; // Can be string like "₹2,510.00" or number
  error?: string;
}

export interface InternationalPriceRequest {
  country: string;
  weight: number;
}

export interface InternationalPriceResponse {
  country: string;
  zone: string;
  mode: string; 
  weight_kg: number;
  base_0_5kg: number | string; 
  per_0_5kg_addl: number | string; 
  addl_halfkg_units: number;
  total_price: number | string; // Can be "₹116912.76" or number
  formatted_total: string; 
  error?: string;
}

export type PriceApiResponse = DomesticPriceResponse | InternationalPriceResponse;

// Payload for creating a shipment (POST /api/shipments)
// This now matches the new backend specification.
export interface AddShipmentPayload {
    sender_name: string;
    sender_address_city: string;
    sender_address_line1: string;
    sender_address_line2?: string; // Optional
    sender_pincode: string;
    sender_phone: string;

    receiver_name: string;
    receiver_address_city: string;
    receiver_address_line1: string;
    receiver_address_line2?: string; // Optional
    receiver_pincode: string;
    receiver_phone: string;

    package_weight_kg: number;
    service_type: ServiceType; // "Express" or "Standard"
    // user_id is optional, backend defaults to 1
}
