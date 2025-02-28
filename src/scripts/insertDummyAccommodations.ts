
import { supabase } from "@/integrations/supabase/client";

export const insertDummyAccommodations = async () => {
  // Check if accommodations exist already
  const { data: existingAccommodations } = await supabase
    .from('accommodations')
    .select('id')
    .limit(1);
  
  // If accommodations already exist, don't insert more
  if (existingAccommodations && existingAccommodations.length > 0) {
    console.log('Accommodations already exist, skipping dummy data insertion');
    return;
  }
  
  // Sample accommodation data
  const accommodations = [
    {
      name: "Luxury Mountain Resort",
      description: "Experience the ultimate luxury in our mountain resort with stunning panoramic views, premium amenities, and exceptional service.",
      accommodation_type: "resort",
      room_type: "suite",
      location: "Nyanga Mountains",
      image_url: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
      additional_images: [
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1025&q=80",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
      ],
      address: "123 Mountain View Road",
      city: "Nyanga",
      state: "Manicaland",
      country: "Zimbabwe",
      postal_code: "10101",
      price_per_night: 350,
      cleaning_fee: 50,
      service_fee: 25,
      tax_rate: 8.5,
      min_nights: 2,
      max_nights: 14,
      max_guests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      amenities: ["wifi", "pool", "spa", "breakfast", "restaurant", "parking", "gym", "air_conditioning"],
      policies: {
        cancellation: "Full refund if cancelled 7 days before check-in, 50% refund if cancelled 3-7 days before check-in.",
        house_rules: "No smoking. No pets. No parties."
      },
      check_in_time: "14:00:00",
      check_out_time: "11:00:00",
      is_available: true,
      rating: 4.8,
      host_name: "Victoria Luxury Resorts",
      host_response_rate: 98,
      host_response_time: "within an hour"
    },
    {
      name: "Victoria Falls Safari Lodge",
      description: "Immerse yourself in the heart of Africa with breathtaking views of the wildlife-rich waterhole at Victoria Falls Safari Lodge. Each room offers private balconies overlooking the national park.",
      accommodation_type: "hotel",
      room_type: "deluxe",
      location: "Victoria Falls",
      image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      additional_images: [
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
      ],
      address: "471 Squire Cummings Road",
      city: "Victoria Falls",
      state: "Matabeleland North",
      country: "Zimbabwe",
      postal_code: "ZW-2020",
      price_per_night: 275,
      cleaning_fee: 40,
      service_fee: 30,
      tax_rate: 8.5,
      min_nights: 1,
      max_nights: 21,
      max_guests: 3,
      bedrooms: 1,
      beds: 2,
      bathrooms: 1,
      amenities: ["wifi", "pool", "breakfast", "restaurant", "bar", "airport_shuttle", "air_conditioning", "balcony"],
      policies: {
        cancellation: "Full refund if cancelled 14 days before check-in, 50% refund if cancelled 7-14 days before check-in.",
        house_rules: "No smoking in rooms. Children welcome."
      },
      check_in_time: "15:00:00",
      check_out_time: "10:00:00",
      is_available: true,
      rating: 4.7,
      host_name: "Safari Lodges Zimbabwe",
      host_response_rate: 95,
      host_response_time: "within a day"
    },
    {
      name: "Harare Boutique BnB",
      description: "A cozy, stylish boutique bed and breakfast in the heart of Harare. Enjoy personalized service, beautiful gardens, and comfortable rooms with modern amenities.",
      accommodation_type: "bnb",
      room_type: "standard",
      location: "Harare",
      image_url: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      additional_images: [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80",
        "https://images.unsplash.com/photo-1576675784201-0e142b423952?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1172&q=80"
      ],
      address: "25 Avondale Road",
      city: "Harare",
      state: "Harare Province",
      country: "Zimbabwe",
      postal_code: "ZW-00263",
      price_per_night: 120,
      cleaning_fee: 25,
      service_fee: 15,
      tax_rate: 7.5,
      min_nights: 1,
      max_nights: 30,
      max_guests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      amenities: ["wifi", "breakfast", "garden", "parking", "air_conditioning", "workspace", "laundry"],
      policies: {
        cancellation: "Full refund if cancelled 3 days before check-in.",
        house_rules: "Quiet hours after 10 PM. No outside guests after 9 PM."
      },
      check_in_time: "14:00:00",
      check_out_time: "11:00:00",
      is_available: true,
      rating: 4.9,
      host_name: "Grace M.",
      host_response_rate: 100,
      host_response_time: "within an hour"
    }
  ];
  
  // Insert accommodations into database
  const { error } = await supabase
    .from('accommodations')
    .insert(accommodations);
  
  if (error) {
    console.error("Error inserting dummy accommodations:", error);
  } else {
    console.log("Successfully inserted dummy accommodations");
  }
};
