import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Budget } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private url = `${environment.apiUrl}/budgets`;
  constructor(private http: HttpClient) {}

  getAll()                          { return this.http.get<Budget[]>(this.url); }
  create(data: Partial<Budget>)     { return this.http.post<Budget>(this.url, data); }
  update(id: number, data: Partial<Budget>) { return this.http.put<Budget>(`${this.url}/${id}`, data); }
  delete(id: number)                { return this.http.delete<{ message: string }>(`${this.url}/${id}`); }
}
