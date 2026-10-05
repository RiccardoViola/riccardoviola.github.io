export interface Company {
  name: string;
  icon: string;
  startDate: string;
  endDate: string;
  description: string;
  clients: Client[];
}

export interface Client {
  id: number;
  sector: number;
  startDate: string;
  endDate: string;
  grade: string;
  role: string;
  description: string;
  technologies: number[];
}

export interface Technology {
  id: number;
  order: number;
  name: string;
  icon: string;
  type: string;
}

export interface Sector {
  id: number;
  name: string;
  icon: string;
}
