import { Component, inject, OnInit } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { Company } from '../../model/models';
import { ConstellationBackgroundComponent } from '../../components/constellation-background/constellation-background';
import { slugify } from '../../utils/slugify';

@Component({
  selector: 'app-home',
  imports: [NgOptimizedImage, ConstellationBackgroundComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent implements OnInit {
  private router = inject(Router);

  companies: Company[] = [];
  showCompaniesSection = false;

  async ngOnInit(): Promise<void> {
    const companiesUrl = new URL('app/assets/data/companies.json', document.baseURI).href;

    try {
      const response = await fetch(companiesUrl);
      if (!response.ok) {
        console.warn('Unable to load companies data:', response.status, response.statusText, companiesUrl);
        return;
      }

      this.companies = (await response.json()) as Company[];
    } catch (error) {
      console.error('Error loading companies data from', companiesUrl, error);
    }
  }

  scrollToCompanies(): void {
    this.showCompaniesSection = true;
    setTimeout(() => {
      const el = document.getElementById('companies-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  }

  isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  goToSkills(): void {
    this.router.navigate(['/skills']);
  }

  goToCompany(name: string): void {
    this.router.navigate([`/${slugify(name)}`]);
  }
}
