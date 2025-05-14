export interface Aircraft {
  id: string;
  organization_id: string;
  registration: string;
  type: string;
  model: string;
  manufacturer?: string | null;
  year_manufactured?: number | null;
  total_hours: number;
  last_maintenance_date?: string | null;
  next_maintenance_date?: string | null;
  status: string;
  hourly_rate?: number | null;
  capacity?: number | null;
  created_at: string;
  updated_at: string;
  current_tach: number;
  current_hobbs: number;
  record_tacho: boolean;
  record_hobbs: boolean;
}

export interface AircraftChargeRate {
  id: string;
  aircraft_id: string;
  flight_type_id: string;
  rate_per_hour: number;
  charge_hobbs: boolean;
  charge_tacho: boolean;
  charge_airswitch: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface AircraftEquipment {
  id: string;
  aircraft_id: string;
  name: string;
  description?: string | null;
  due_at_hours?: number | null;
  due_at_date?: string | null;
  last_completed_hours?: number | null;
  last_completed_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AircraftTechLog {
  id: string;
  aircraft_id: string;
  entry_type: string;
  description: string;
  tach?: number | null;
  hobbs?: number | null;
  created_by?: string | null;
  created_at: string;
}

export interface FlightType {
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AircraftWithDetails extends Aircraft {
  charge_rates: AircraftChargeRate[];
  equipment: AircraftEquipment[];
  tech_log: AircraftTechLog[];
  flight_types: FlightType[];
} 