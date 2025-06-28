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
export type TrackingStage = "Pending Payment" | "Booked" | "In Transit" | "Out for Delivery" | "Delivered" | "Cancelled";

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
  user_email?: string;
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
  userId?: number;
  userEmail?: string;
  shipmentIdStr: string; 
  senderName: string;
  senderAddressStreet: string; 
  senderAddressLine1?: string; 
  senderAddressLine2?: string; 
  senderAddressCity: string;
  senderAddressState: string;
  senderAddressPincode: string;
  senderAddressCountry: string;
  senderPhone: string;
  receiverName: string;
  receiverAddressStreet: string; 
  receiverAddressLine1?: string; 
  receiverAddressLine2?: string; 
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
export interface CreateShipmentResponse {
    shipment_id_str: string; 
    message: string;
    data: Shipment; 
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
  total_price: number; 
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
  rounded_weight: number;
  price_per_kg: string;
  total_price: number; 
  error?: string;
}

export type PriceApiResponse = DomesticPriceResponse | InternationalPriceResponse;

// Payload for creating a shipment (POST /api/shipments)
// Matches the backend specification from the user.
export interface AddShipmentPayload {
    sender_name: string;
    sender_address_street: string; // Combined from line1 and line2
    sender_address_city: string;
    sender_address_state: string;
    sender_address_pincode: string;
    sender_address_country: string;
    sender_phone: string;

    receiver_name: string;
    receiver_address_street: string; // Combined from line1 and line2
    receiver_address_city: string;
    receiver_address_state: string;
    receiver_address_pincode: string;
    receiver_address_country: string;
    receiver_phone: string;

    package_weight_kg: number;
    package_width_cm: number;
    package_height_cm: number;
    package_length_cm: number;
    pickup_date: string; // Formatted as "yyyy-MM-dd"
    service_type: ServiceType; // "Express" or "Standard"
    
    final_total_price_with_tax: number;
    user_email: string;
}

// New types for payment flow
export interface SubmitUtrPayload {
  shipment_id_str: string;
  utr: string;
  amount: number;
}

export interface SubmitUtrResponse {
  message: string;
  payment_id: number;
  status: string; // e.g., "Pending"
}

export type PaymentStatus = "Pending" | "Approved" | "Rejected";

export interface UserPayment {
    id: number;
    shipment_id_str: string;
    utr: string;
    amount: number;
    status: PaymentStatus;
    created_at: string; // ISO Date string
}

// Type for admin view of payments
export interface AdminPayment {
  id: number;
  order_id: string;
  first_name: string;
  last_name: string;
  amount: number;
  utr: string;
  status: PaymentStatus;
  created_at: string; // ISO String
}

export type AdminPaymentsResponse = AdminPayment[];

export interface UpdatePaymentStatusResponse {
    message: string;
}

// For /api/admin/users list
export interface AdminUserListItem {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string; // ISO date string
  shipment_count: number;
}

export interface AdminUsersResponse {
  users: AdminUserListItem[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

// For /api/admin/users/<id> details
export interface UserShipmentSummary {
    id: number;
    shipment_id_str: string;
    receiver_name: string;
    booking_date: string; // ISO Date string
    status: TrackingStage;
    total_with_tax_18_percent: number;
}

export interface AdminUserDetailsResponse {
    user: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        created_at: string; // ISO Date string
    };
    shipments: UserShipmentSummary[];
    payments: UserPayment[];
}
