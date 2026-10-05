import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  viewChild,
} from '@angular/core';

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
}

@Component({
  selector: 'app-constellation-background',
  template: '<canvas #canvas aria-hidden="true"></canvas>',
  styles: [
    `
      :host {
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
      }

      canvas {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConstellationBackgroundComponent implements AfterViewInit, OnDestroy {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly zone = inject(NgZone);
  private animationFrameId = 0;
  private resizeListener?: () => void;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => this.startAnimation());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  private startAnimation(): void {
    const canvas = this.canvas().nativeElement;
    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Unable to initialize the constellation background canvas.');
      return;
    }

    const maxStars = 5000;
    const minStars = 100;
    const desktopPixelsPerStar = 7_000;
    const standardPixelsPerStar = 15_000;
    const stars: Star[] = [];
    const maxDistance = 120;
    let gridColumns = 1;
    let gridRows = 1;
    let grid: number[][] = [[]];
    const desktopQuery = window.matchMedia(
      '(min-width: 1024px) and (hover: hover) and (pointer: fine)',
    );
    let isDesktop = desktopQuery.matches;
    const createStar = (): Star => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      r: isDesktop ? 1.1 + Math.random() * 1.6 : 0.8 + Math.random() * 1.4,
      a: isDesktop ? 0.45 + Math.random() * 0.4 : 0.25 + Math.random() * 0.35,
    });

    const resize = () => {
      const wasDesktop = isDesktop;
      isDesktop = desktopQuery.matches;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gridColumns = Math.max(1, Math.ceil(canvas.width / maxDistance));
      gridRows = Math.max(1, Math.ceil(canvas.height / maxDistance));
      grid = Array.from({ length: gridColumns * gridRows }, () => []);

      const starCount = Math.min(
        maxStars,
        Math.max(
          minStars,
          Math.round(
            (canvas.width * canvas.height) /
              (isDesktop ? desktopPixelsPerStar : standardPixelsPerStar),
          ),
        ),
      );

      while (stars.length > starCount) {
        stars.pop();
      }
      while (stars.length < starCount) {
        stars.push(createStar());
      }

      for (const star of stars) {
        star.x = Math.min(star.x, canvas.width);
        star.y = Math.min(star.y, canvas.height);
        if (wasDesktop !== isDesktop) {
          star.r = isDesktop ? 1.1 + Math.random() * 1.6 : 0.8 + Math.random() * 1.4;
          star.a = isDesktop ? 0.45 + Math.random() * 0.4 : 0.25 + Math.random() * 0.35;
        }
      }
    };
    this.resizeListener = resize;
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      context.clearRect(0, 0, width, height);

      for (const star of stars) {
        star.x += star.vx;
        star.y += star.vy;
        if (star.x < 0 || star.x > width) star.vx *= -1;
        if (star.y < 0 || star.y > height) star.vy *= -1;
      }

      for (const cell of grid) {
        cell.length = 0;
      }

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const column = Math.max(0, Math.min(gridColumns - 1, Math.floor(star.x / maxDistance)));
        const row = Math.max(0, Math.min(gridRows - 1, Math.floor(star.y / maxDistance)));
        const cellIndex = row * gridColumns + column;
        grid[cellIndex].push(i);
      }

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const column = Math.max(0, Math.min(gridColumns - 1, Math.floor(star.x / maxDistance)));
        const row = Math.max(0, Math.min(gridRows - 1, Math.floor(star.y / maxDistance)));
        const firstColumn = Math.max(0, column - 1);
        const lastColumn = Math.min(gridColumns - 1, column + 1);
        const firstRow = Math.max(0, row - 1);
        const lastRow = Math.min(gridRows - 1, row + 1);

        for (let neighborRow = firstRow; neighborRow <= lastRow; neighborRow++) {
          for (let neighborColumn = firstColumn; neighborColumn <= lastColumn; neighborColumn++) {
            const neighbors = grid[neighborRow * gridColumns + neighborColumn];
            for (const j of neighbors) {
              if (j <= i) {
                continue;
              }

              const neighbor = stars[j];
              const deltaX = star.x - neighbor.x;
              const deltaY = star.y - neighbor.y;
              const distanceSquared = deltaX * deltaX + deltaY * deltaY;
              if (distanceSquared < maxDistance * maxDistance) {
                const distance = Math.sqrt(distanceSquared);
                context.beginPath();
                context.moveTo(star.x, star.y);
                context.lineTo(neighbor.x, neighbor.y);
                context.strokeStyle = `rgba(64,155,100,${0.1 * (1 - distance / maxDistance)})`;
                context.lineWidth = 0.5;
                context.stroke();
              }
            }
          }
        }
      }

      for (const star of stars) {
        context.beginPath();
        context.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        context.fillStyle = `rgba(100,200,130,${star.a})`;
        context.fill();
      }

      this.animationFrameId = requestAnimationFrame(draw);
    };

    draw();
  }
}
