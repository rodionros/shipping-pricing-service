export interface CartDTO {
    weight_kg: number;
    width_cm: number;
    height_cm: number;
    length_cm: number;
    amount: number;
}

export interface AddressDTO {
    city: string;
    postal_code: string;
    street: string;
    country: string;
}

export interface ShippingRequestDTO {
    cart: CartDTO;
    address: AddressDTO;
}

export interface DeliveryOptionDTO {
    provider: string;
    service_name: string;
    price: number;
    currency: string;
    estimated_days_min: number;
    estimated_days_max: number;
}

export interface ShippingResponseDTO {
    requestId: string;
    currency: string;
    options: DeliveryOptionDTO[];
    unavailableProviders: { provider: string; reason: string }[];
}