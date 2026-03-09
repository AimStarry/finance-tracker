import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { ChartComponent } from '../../shared/components/chart.component';
import { AnalyticsService } from '../../shared/services/analytics.service';
import { DashboardSummary, BurnRate, SpendingTrend, CategorySpending } from '../../shared/models/models';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, MatCardModule, ChartComponent],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  summary:    DashboardSummary | null = null;
  burnRate:   BurnRate | null = null;
  categories: CategorySpending[] = [];

  readonly colors = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6'];

  get savingsRate(): number {
    if (!this.summary?.monthly_income) return 0;
    return (this.summary.monthly_savings / this.summary.monthly_income) * 100;
  }

  barData: ChartData = { labels: [], datasets: [] };
  barOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } }
  };

  doughnutData: ChartData = { labels: [], datasets: [] };
  doughnutOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'right' } }
  };

  constructor(private analytics: AnalyticsService) {}

  ngOnInit() {
    forkJoin({
      summary:    this.analytics.getSummary(),
      burnRate:   this.analytics.getBurnRate(),
      trends:     this.analytics.getTrends(),
      categories: this.analytics.getByCategory(),
    }).subscribe(({ summary, burnRate, trends, categories }) => {
      this.summary    = summary;
      this.burnRate   = burnRate;
      this.categories = categories;

      this.barData = {
        labels: trends.map((t: SpendingTrend) => t.month),
        datasets: [
          { label: 'Income',   data: trends.map((t: SpendingTrend) => t.income),   backgroundColor: 'rgba(34,197,94,0.8)' },
          { label: 'Expenses', data: trends.map((t: SpendingTrend) => t.expenses), backgroundColor: 'rgba(239,68,68,0.8)' },
        ]
      };

      this.doughnutData = {
        labels: categories.map((c: CategorySpending) => c.name),
        datasets: [{
          data: categories.map((c: CategorySpending) => c.total),
          backgroundColor: categories.map((_: any, i: number) => this.colors[i % this.colors.length])
        }]
      };
    });
  }

  hasBarData()      { return (this.barData.datasets[0]?.data?.length ?? 0) > 0; }
  hasDoughnutData() { return (this.doughnutData.labels?.length ?? 0) > 0; }
}
