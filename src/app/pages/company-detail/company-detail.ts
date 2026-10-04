import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Client, Company, Technology } from '../../model/models';
import { ConstellationBackgroundComponent } from '../../components/constellation-background/constellation-background';
import { slugify } from '../../utils/slugify';

@Component({
  selector: 'app-company-detail',
  imports: [NgOptimizedImage, RouterLink, ConstellationBackgroundComponent],
  templateUrl: './company-detail.html',
  styleUrls: ['./company-detail.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly company = signal<Company | null>(null);
  readonly technologies = signal<Technology[]>([]);
  readonly clients = computed(() => this.company()?.clients.slice().reverse() ?? []);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    const companyName = this.route.snapshot.paramMap.get('companyName');
    if (!companyName) {
      this.error.set('Company not found.');
      this.loading.set(false);
      return;
    }

    const companiesUrl = new URL('app/assets/data/companies.json', document.baseURI).href;
    const technologiesUrl = new URL('app/assets/data/technologies.json', document.baseURI).href;

    try {
      const [companiesResponse, technologiesResponse] = await Promise.all([
        fetch(companiesUrl),
        fetch(technologiesUrl),
      ]);

      if (!companiesResponse.ok) {
        throw new Error(`Unable to load companies data (${companiesResponse.status}).`);
      }
      if (!technologiesResponse.ok) {
        throw new Error(`Unable to load technologies data (${technologiesResponse.status}).`);
      }

      const [companies, technologies] = (await Promise.all([
        companiesResponse.json(),
        technologiesResponse.json(),
      ])) as [Company[], Technology[]];
      const selectedCompany = companies.find(
        (company) => slugify(company.name) === slugify(companyName),
      );

      if (!selectedCompany) {
        this.error.set(`Company "${companyName}" was not found.`);
        return;
      }

      this.company.set(selectedCompany);
      this.technologies.set(technologies);
    } catch (error) {
      console.error('Unable to load company details:', error);
      this.error.set('Unable to load company details. Please try again later.');
    } finally {
      this.loading.set(false);
    }
  }

  technologiesFor(client: Client): Technology[] {
    const technologyById = new Map(this.technologies().map((technology) => [technology.id, technology]));
    return client.technologies
      .map((technologyId) => technologyById.get(technologyId))
      .filter((technology): technology is Technology => technology !== undefined)
      .sort((first, second) => first.order - second.order);
  }
}
