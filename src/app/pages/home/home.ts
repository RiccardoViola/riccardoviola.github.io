import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Project } from '../../model/models';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  private router = inject(Router);

  projects: Project[] = [];

  async ngOnInit(): Promise<void> {
    try {
      const response = await fetch('/app/data/companies.json');
      if (!response.ok) {
        return;
      }
      this.projects = (await response.json()) as Project[];
    } catch {
      // ignore load errors
    }
  }

  scrollToProjects(): void {
    const el = document.getElementById('projects-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  }

  goToSkills(): void {
    this.router.navigate(['/skills']);
  }

  goToProject(slug: string): void {
    this.router.navigate([`/${slug}`]);
  }
}
