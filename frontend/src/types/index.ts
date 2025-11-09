// Car Model Types
export interface CarModel {
  id: string;
  name: string;
  startingPrice: number;
  image: string;
  features: string[];
}

// Dealer Types
export interface Dealer {
  id: string;
  name: string;
  model: string;
  color: string;
  zip: string;
  price: number;
  offer: string;
  isBestDeal: boolean;
  msrp?: number;
  otdPrice?: number;
  mpg?: number;
  phone?: string;
  address?: string;
}

// Search Session Types
export interface SearchSession {
  id: string;
  userId: string;
  model: string;
  color?: string;
  zipCode: string;
  createdAt: Date;
  status: 'pending' | 'completed' | 'failed';
}

// Call Types
export interface DealerCall {
  id: string;
  dealerId: string;
  sessionId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  initiatedAt: Date;
  completedAt?: Date;
  transcript?: string;
  followUpScheduled?: Date;
}

// Quote Types
export interface Quote {
  id: string;
  dealerId: string;
  sessionId: string;
  callId: string;
  price: number;
  otdPrice?: number;
  additionalFees?: Record<string, number>;
  receivedAt: Date;
  validUntil?: Date;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  zipCode?: string;
  phone?: string;
  createdAt: Date;
}

// UI State Types
export interface NavbarState {
  mobileMenuOpen: boolean;
}

export interface InputSectionState {
  expanded: boolean;
  searchQuery: string;
  isVoiceActive: boolean;
}
