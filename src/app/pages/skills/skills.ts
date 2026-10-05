import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConstellationBackgroundComponent } from '../../components/constellation-background/constellation-background';
import { Company, Technology } from '../../model/models';
import {
  approximateDurationMonthsFromDays,
  calendarDurationMonths,
  dateRangeInDays,
} from '../../utils/format-date';

interface SkillMetric {
  id: number;
  name: string;
  trackedMonths: number;
  share: number;
}

interface DayRange {
  start: number;
  end: number;
}

interface SkillCategory {
  name: string;
  color: string;
  technologies: SkillMetric[];
}

@Component({
  selector: 'app-skills',
  imports: [RouterLink, ConstellationBackgroundComponent],
  templateUrl: './skills.html',
  styleUrls: ['./skills.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsComponent implements OnInit {
  readonly categories = signal<SkillCategory[]>([]);
  readonly technologyCount = signal(0);
  readonly workExperienceMonths = signal(0);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
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

      this.setSkillMetrics(companies, technologies);
    } catch (error) {
      console.error('Unable to load skills data:', error);
      this.error.set('Unable to load skills data. Please try again later.');
    } finally {
      this.loading.set(false);
    }
  }

  formatDuration(months: number): string {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    const parts = [
      years > 0 ? `${years} ${years === 1 ? 'year' : 'years'}` : '',
      remainingMonths > 0 ? `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}` : '',
    ].filter(Boolean);

    return parts.join(' ') || 'Less than a month';
  }

  private setSkillMetrics(companies: Company[], technologies: Technology[]): void {
    const technologyById = new Map(technologies.map((technology) => [technology.id, technology]));
    const rangesByTechnology = new Map<number, DayRange[]>();
    const clientRanges: DayRange[] = [];
    const projectStartDates: string[] = [];
    const today = Math.floor(Date.now() / 86_400_000);

    for (const company of companies) {
      for (const client of company.clients) {
        const range = dateRangeInDays(client.startDate, client.endDate);
        if (!range) {
          throw new Error(`Invalid working period for client "${client.id}".`);
        }
        clientRanges.push(range);
        projectStartDates.push(client.startDate);

        if (range.start > today) {
          continue;
        }
        const activeRange = { start: range.start, end: Math.min(range.end + 1, today + 1) };

        for (const technologyId of new Set(client.technologies)) {
          if (!technologyById.has(technologyId)) {
            throw new Error(`Technology ID "${technologyId}" is missing from the catalogue.`);
          }

          const ranges = rangesByTechnology.get(technologyId) ?? [];
          ranges.push(activeRange);
          rangesByTechnology.set(technologyId, ranges);
        }
      }
    }

    const firstProjectStart = clientRanges.reduce(
      (earliest, range) => Math.min(earliest, range.start),
      Number.POSITIVE_INFINITY,
    );
    if (!Number.isFinite(firstProjectStart)) {
      throw new Error('No client project dates are available.');
    }

    const workExperienceDays = today + 1 - firstProjectStart;
    if (workExperienceDays <= 0) {
      throw new Error('The first client project must start before today.');
    }
    const firstProjectStartDate = projectStartDates.sort()[0];
    const experienceMonths = calendarDurationMonths(firstProjectStartDate, 'Now');
    if (experienceMonths === null) {
      throw new Error('Unable to calculate total work experience.');
    }
    this.workExperienceMonths.set(experienceMonths);

    const trackedDaysByTechnology = new Map<number, number>();
    for (const [technologyId, ranges] of rangesByTechnology) {
      trackedDaysByTechnology.set(technologyId, this.getCoveredDays(ranges));
    }

    const technologiesByCategory = new Map<string, Array<Technology & { trackedMonths: number }>>();
    for (const technology of technologies) {
      const trackedDays = trackedDaysByTechnology.get(technology.id);
      if (!trackedDays) {
        continue;
      }
      const trackedMonths = approximateDurationMonthsFromDays(trackedDays);

      const categoryName = technology.type.replace('SourceControl', 'Source Control');
      const categoryTechnologies = technologiesByCategory.get(categoryName) ?? [];
      categoryTechnologies.push({ ...technology, trackedMonths });
      technologiesByCategory.set(categoryName, categoryTechnologies);
    }

    const palette = ['#52b788', '#74c69d', '#4ea8de', '#f4a261', '#c77dff', '#f28482'];
    let categoryIndex = 0;
    const categories = [...technologiesByCategory.entries()].map(([name, categoryTechnologies]) => {
      const color = palette[categoryIndex++ % palette.length];

      return {
        name,
        color,
        technologies: categoryTechnologies
          .sort((first, second) => first.order - second.order)
          .map((technology) => ({
            id: technology.id,
            name: technology.name,
            trackedMonths: technology.trackedMonths,
            share: Math.round(
              ((trackedDaysByTechnology.get(technology.id) ?? 0) / workExperienceDays) * 100,
            ),
          })),
      };
    });

    this.categories.set(categories);
    this.technologyCount.set(trackedDaysByTechnology.size);
  }

  private getCoveredDays(ranges: DayRange[]): number {
    const sortedRanges = [...ranges].sort((first, second) => first.start - second.start);
    let coveredDays = 0;
    let currentRange: DayRange | null = null;

    for (const range of sortedRanges) {
      if (!currentRange) {
        currentRange = { ...range };
        continue;
      }

      if (range.start <= currentRange.end) {
        currentRange.end = Math.max(currentRange.end, range.end);
        continue;
      }

      coveredDays += currentRange.end - currentRange.start;
      currentRange = { ...range };
    }

    return currentRange ? coveredDays + currentRange.end - currentRange.start : 0;
  }
}
