
export interface Destination {
  id: string;
  name: string;
  description: string | null;
  location: string;
  price: number;
  image_url: string | null;
  additional_images: string[] | null;
  activities: string[] | null;
  best_time_to_visit: string | null;
  duration_recommended: string | null;
  difficulty_level: string | null;
  amenities: string[] | null;
  what_to_bring: string[] | null;
  highlights: string[] | null;
  additional_costs: Record<string, any> | null;
  weather_info: string | null;
  getting_there: string | null;
  created_at: string;
  updated_at: string;
  categories: string[] | null;
  is_featured: boolean | null;
}

export interface Booking {
  id: string;
  user_id: string;
  event_id: string | null;
  destination_id: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  booking_date: string;
  number_of_people: number;
  total_price: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  preferred_date: string | null;
  booking_details: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  payment_proof_url: string | null;
  payment_proof_uploaded_at: string | null;
  confirmation_date: string | null;
  cancellation_date: string | null;
}

export interface Profile {
  id: string;
  role: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
}

export interface Review {
  id: string;
  user_id: string;
  destination_id: string;
  rating: number;
  comment: string | null;
  images?: string[] | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  };
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: 'default' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingWithRelations extends Booking {
  destinations?: {
    name: string;
    image_url: string | null;
  } | null;
  events?: {
    title: string;
    image_url: string | null;
  } | null;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  location: string | null;
  price: number;
  image_url: string | null;
  capacity: number | null;
  ticket_types: Record<string, any>[] | null;
  max_tickets_per_type: Record<string, any> | null;
  available_tickets_per_type: Record<string, any> | null;
  event_type: string | null;
  venue_details: Record<string, any> | null;
  booking_deadline: string | null;
  cancellation_policy: string | null;
  created_at: string;
  updated_at: string;
  program_url: string | null;
  program_name: string | null;
  program_type: string | null;
  duration: string | null;
  activities: string[] | null;
}
