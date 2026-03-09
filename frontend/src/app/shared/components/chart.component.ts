import {
  Component, Input, OnChanges, OnDestroy,
  ElementRef, ViewChild, AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Chart, ChartType, ChartData, ChartOptions,
  LineController, BarController, DoughnutController,
  LineElement, BarElement, ArcElement, PointElement,
  CategoryScale, LinearScale, Legend, Tooltip, Filler
} from 'chart.js';

Chart.register(
  LineController, BarController, DoughnutController,
  LineElement, BarElement, ArcElement, PointElement,
  CategoryScale, LinearScale, Legend, Tooltip, Filler
);

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  template: `<canvas #canvas></canvas>`,
  styles: [`canvas { max-height: 280px; }`]
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() type: ChartType = 'line';
  @Input() data: ChartData = { labels: [], datasets: [] };
  @Input() options: ChartOptions = {};

  private chart: Chart | null = null;

  ngAfterViewInit() { this.createChart(); }

  ngOnChanges() {
    if (this.chart) {
      this.chart.data = this.data;
      this.chart.update();
    }
  }

  ngOnDestroy() { this.chart?.destroy(); }

  private createChart() {
    if (!this.canvasRef) return;
    this.chart?.destroy();
    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: this.type,
      data: this.data,
      options: this.options
    });
  }
}
