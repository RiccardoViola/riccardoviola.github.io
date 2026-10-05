import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Company } from '../../model/models';
import { ConstellationBackgroundComponent } from '../../components/constellation-background/constellation-background';
import { slugify } from '../../utils/slugify';
import { formatDate as formatIsoDate } from '../../utils/format-date';

@Component({
  selector: 'app-home',
  imports: [NgOptimizedImage, ConstellationBackgroundComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private changeDetector = inject(ChangeDetectorRef);

  companies: Company[] = [];
  showCompaniesSection = false;
  private shouldScrollToCompanies = false;

  async ngOnInit(): Promise<void> {
    this.route.fragment.subscribe((fragment) => {
      if (fragment === 'companies-section') {
        this.shouldScrollToCompanies = true;
        this.showCompaniesSection = true;
        if (this.companies.length > 0) {
          this.scrollToCompanies();
        }
      }
    });

    const companiesUrl = new URL('app/assets/data/companies.json', document.baseURI).href;

    try {
      const response = await fetch(companiesUrl);
      if (!response.ok) {
        console.warn(
          'Unable to load companies data:',
          response.status,
          response.statusText,
          companiesUrl,
        );
        return;
      }

      this.companies = (await response.json()) as Company[];
      this.changeDetector.markForCheck();
      if (this.shouldScrollToCompanies) {
        this.scrollToCompanies();
      }
    } catch (error) {
      console.error('Error loading companies data from', companiesUrl, error);
    }
  }

  scrollToCompanies(): void {
    this.showCompaniesSection = true;
    setTimeout(() => {
      this.changeDetector.detectChanges();
      const el = document.getElementById('companies-section');
      if (el) {
        window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top);
      }
    }, 50);
  }

  isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  formatDate(value: string): string {
    return formatIsoDate(value);
  }

  goToSkills(): void {
    this.router.navigate(['/skills']);
  }

  goToCompany(name: string): void {
    this.router.navigate([`/${slugify(name)}`]);
  }
}
