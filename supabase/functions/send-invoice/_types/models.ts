
export interface Destination {
  id: string;
  name: string;
  description: string;
  location: string;
  price: number;
  image_url?: string;
  rating?: number;
  duration_recommended?: string;
  additional_costs?: Record<string, number>;
}
