import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Merchant, Category } from '../models/models';

@Injectable({ providedIn: 'root' })
export class MerchantService {
  private url = `${environment.apiUrl}/merchants`;
  constructor(private http: HttpClient) {}

  getAll()                         { return this.http.get<Merchant[]>(this.url); }
  getCategories()                  { return this.http.get<Category[]>(`${this.url}/categories`); }
  create(data: Partial<Merchant>)  { return this.http.post<Merchant>(this.url, data); }
}
