import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TransactionResponse, Transaction } from '../models/models';

export interface TransactionFilter {
  transaction_type?: string;
  payment_method?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  page?: number;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private url = `${environment.apiUrl}/transactions`;
  constructor(private http: HttpClient) {}

  getAll(filter: TransactionFilter = {}) {
    let params = new HttpParams();
    Object.entries(filter).forEach(([k, v]) => { if (v !== undefined && v !== '') params = params.set(k, String(v)); });
    return this.http.get<TransactionResponse>(this.url, { params });
  }

  getOne(id: number)             { return this.http.get<Transaction>(`${this.url}/${id}`); }
  create(data: Partial<Transaction>) { return this.http.post<Transaction>(this.url, data); }
  update(id: number, data: Partial<Transaction>) { return this.http.put<Transaction>(`${this.url}/${id}`, data); }
  delete(id: number)             { return this.http.delete<{ message: string }>(`${this.url}/${id}`); }
}
