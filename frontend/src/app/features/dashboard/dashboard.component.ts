import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ChartComponent } from '../../shared/components/chart.component';
import { AnalyticsService } from '../../shared/services/analytics.service';
import { SubscriptionService } from '../../shared/services/subscription.service';
import { DashboardSummary, BurnRate, SpendingTrend, CategorySpending, Subscription } from '../../shared/models/models';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule, ChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  summary: DashboardSummary | null = null;
  burnRate: BurnRate | null = null;
  upcomingSubs: Subscription[] = [];

  trendData: ChartData = { labels: [], datasets: [] };
  trendOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } }
  };

  categoryData: ChartData = { labels: [], datasets: [] };
  pieOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'right' } }
  };

  readonly colors = ['#4c7273','#86b9b0','#042630','#d0d6d6','#1a6b62','#041421','#6fa8a0','#2a4a4b'];

  constructor(private analytics: AnalyticsService, private subService: SubscriptionService) {}

  ngOnInit() {
    forkJoin({
      summary:    this.analytics.getSummary(),
      burnRate:   this.analytics.getBurnRate(),
      trends:     this.analytics.getTrends(),
      categories: this.analytics.getByCategory(),
      subs:       this.subService.getAll(),
    }).subscribe(({ summary, burnRate, trends, categories, subs }) => {
      this.summary      = summary;
      this.burnRate     = burnRate;
      this.upcomingSubs = subs.filter(s => s.is_active).slice(0, 5);
      this.buildTrendChart(trends);
      this.buildCategoryChart(categories);
    });
  }

  buildTrendChart(trends: SpendingTrend[]) {
    this.trendData = {
      labels: trends.map((t: SpendingTrend) => t.month),
      datasets: [
        { label: 'Income',   data: trends.map((t: SpendingTrend) => t.income),
          borderColor: '#86b9b0', backgroundColor: 'rgba(134,185,176,0.12)', tension: 0.4, fill: true },
        { label: 'Expenses', data: trends.map((t: SpendingTrend) => t.expenses),
          borderColor: '#e05c5c', backgroundColor: 'rgba(224,92,92,0.10)', tension: 0.4, fill: true },
      ]
    };
  }

  buildCategoryChart(categories: CategorySpending[]) {
    this.categoryData = {
      labels: categories.map((c: CategorySpending) => c.name),
      datasets: [{
        data: categories.map((c: CategorySpending) => c.total),
        backgroundColor: categories.map((_: any, i: number) => this.colors[i % this.colors.length])
      }]
    };
  }

  getSpentPercent(): number {
    if (!this.burnRate || this.burnRate.monthly_income === 0) return 0;
    return Math.min((this.burnRate.spent_so_far / this.burnRate.monthly_income) * 100, 100);
  }

  hasTrendData()    { return (this.trendData.datasets[0]?.data?.length ?? 0) > 0; }
  hasCategoryData() { return (this.categoryData.labels?.length ?? 0) > 0; }
}
