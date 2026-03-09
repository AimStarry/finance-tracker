import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Subscription } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private url = `${environment.apiUrl}/subscriptions`;
  constructor(private http: HttpClient) {}

  getAll()                               { return this.http.get<Subscription[]>(this.url); }
  create(data: Partial<Subscription>)    { return this.http.post<Subscription>(this.url, data); }
  update(id: number, data: Partial<Subscription>) { return this.http.put<Subscription>(`${this.url}/${id}`, data); }
  delete(id: number)                     { return this.http.delete<{ message: string }>(`${this.url}/${id}`); }
}
