export interface ApiaryLocation {
  latitude?: number;
  longitude?: number;
  locationName?: string;
}

export interface Apiary {
  id: string;
  name: string;
  number: string;
  hiveCount: number;
  honeyCollected?: number; // Optional, will be 0 by default
  kilosCollected?: number;
  location?: ApiaryLocation;
  createdAt?: string;
  // For backward compatibility
  latitude?: number;
  longitude?: number;
  locationName?: string;
}

export interface SelectedApiary extends Apiary {
  honeyCollected: number; // Required for selected apiaries
  kilosCollected: number;
  batchId?: string;
  batchNumber?: string;
}