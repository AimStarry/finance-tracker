import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { User } from '../shared/models/models';

interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem('finance_user');
    if (stored) this.currentUserSubject.next(JSON.parse(stored));
  }

  get token(): string | null      { return localStorage.getItem('finance_token'); }
  get isLoggedIn(): boolean        { return !!this.token; }

  register(email: string, password: string, full_name: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, { email, password, full_name })
      .pipe(tap(res => this.storeAuth(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap(res => this.storeAuth(res)));
  }

  logout(): void {
    localStorage.removeItem('finance_token');
    localStorage.removeItem('finance_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private storeAuth(res: AuthResponse): void {
    localStorage.setItem('finance_token', res.token);
    localStorage.setItem('finance_user', JSON.stringify(res.user));
    this.currentUserSubject.next(res.user);
  }
}
