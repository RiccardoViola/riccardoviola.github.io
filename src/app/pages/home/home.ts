import { Component, inject, OnInit, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Company } from '../../model/models';

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
}

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private router = inject(Router);
  private zone = inject(NgZone);
  private animFrameId = 0;

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

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => this.initConstellation());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animFrameId);
  }

  private initConstellation(): void {
    const canvas = document.getElementById('constellation-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 55;
    const MAX_DIST = 120;
    const stars: Star[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      r: 0.8 + Math.random() * 1.4,
      a: 0.25 + Math.random() * 0.35,
    }));

    const draw = () => {
      const W = canvas.width,
        H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // move
      stars.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0 || s.x > W) s.vx *= -1;
        if (s.y < 0 || s.y > H) s.vy *= -1;
      });

      // connections
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const d = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
          if (d < MAX_DIST) {
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(64,155,100,${0.1 * (1 - d / MAX_DIST)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // dots
      stars.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100,200,130,${s.a})`;
        ctx.fill();
      });

      this.animFrameId = requestAnimationFrame(draw);
    };

    draw();
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

  goToProject(slug: string): void {
    this.router.navigate([`/${slug}`]);
  }
}
