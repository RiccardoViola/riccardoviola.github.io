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

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    this.resizeListener = resize;
    resize();
    window.addEventListener('resize', resize);

    const count = 55;
    const maxDistance = 120;
    const stars: Star[] = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      r: 0.8 + Math.random() * 1.4,
      a: 0.25 + Math.random() * 0.35,
    }));

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

      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const distance = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
          if (distance < maxDistance) {
            context.beginPath();
            context.moveTo(stars[i].x, stars[i].y);
            context.lineTo(stars[j].x, stars[j].y);
            context.strokeStyle = `rgba(64,155,100,${0.1 * (1 - distance / maxDistance)})`;
            context.lineWidth = 0.5;
            context.stroke();
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
