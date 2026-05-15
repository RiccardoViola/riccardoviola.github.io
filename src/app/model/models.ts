export interface Company {
  name: string;
  icon: string;
  startDate: Date;
  endDate: Date;
  description: string;
}

export interface Project {
  projectType: string;
  startDate: Date;
  endDate: Date;
  grade: string;
  role: string;
  description: string;
  technologies: Technology[];
}

export interface Technology {
  order: number;
  name: string;
  icon: string;
}
