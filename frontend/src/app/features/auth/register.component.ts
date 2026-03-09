import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  full_name = '';
  email     = '';
  password  = '';
  error     = '';
  loading   = false;

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    this.error = '';
    this.loading = true;
    this.auth.register(this.email, this.password, this.full_name).subscribe({
      next:  () => this.router.navigate(['/dashboard']),
      error: (e) => { this.error = e?.error?.error || 'Registration failed'; this.loading = false; },
    });
  }
}
