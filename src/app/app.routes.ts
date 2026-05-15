import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { SkillsComponent } from './pages/skills/skills';
import { CompanyDetailComponent } from './pages/company-detail/company-detail';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'skills',
    component: SkillsComponent,
  },
  {
    path: ':companyName',
    component: CompanyDetailComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
