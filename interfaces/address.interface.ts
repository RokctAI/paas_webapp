export interface AddressCreateData {
  title?: string;
  address?: {
    address: string;
    floor?: string;
    house?: string;
    entrance?: string;
    comment?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  active?: number | boolean;
}

export interface IAddress {
  address?: {
    address: string;
    floor?: string;
    house?: string;
    entrance?: string;
    comment?: string;
  };
  created_at: string;
  id: number;
  location: {
    latitude: number;
    longitude: number;
  };
  title: string;
  user_id: number;
  active: number | boolean;
}
