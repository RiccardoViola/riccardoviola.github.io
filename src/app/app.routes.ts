import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { SkillsComponent } from './pages/skills/skills';
import { ProjectDetailComponent } from './pages/project-detail/project-detail';

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
    path: ':nomeProgetto',
    component: ProjectDetailComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
