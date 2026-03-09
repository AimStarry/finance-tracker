import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DashboardSummary, BurnRate, SpendingTrend, CategorySpending } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private url = `${environment.apiUrl}/analytics`;
  constructor(private http: HttpClient) {}

  getSummary()     { return this.http.get<DashboardSummary>(`${this.url}/summary`); }
  getBurnRate()    { return this.http.get<BurnRate>(`${this.url}/burn-rate`); }
  getTrends()      { return this.http.get<SpendingTrend[]>(`${this.url}/trends`); }
  getByCategory()  { return this.http.get<CategorySpending[]>(`${this.url}/by-category`); }
}
