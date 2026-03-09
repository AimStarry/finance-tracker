import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SubscriptionService } from '../../shared/services/subscription.service';
import { Subscription } from '../../shared/models/models';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatTooltipModule, MatSnackBarModule
  ],
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit {
  subscriptions: Subscription[] = [];
  showForm = false;
  editId: number | null = null;

  form = this.fb.group({
    merchant_name:     ['', Validators.required],
    amount:            [null as number | null, [Validators.required, Validators.min(0.01)]],
    billing_cycle:     ['monthly', Validators.required],
    next_billing_date: ['', Validators.required],
    notes:             [''],
  });

  constructor(
    private svc: SubscriptionService,
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {}

  ngOnInit() { this.load(); }

  load() { this.svc.getAll().subscribe(s => this.subscriptions = s); }

  get active()   { return this.subscriptions.filter(s => s.is_active); }
  get inactive() { return this.subscriptions.filter(s => !s.is_active); }

  get monthlyTotal() {
    return this.active.reduce((sum, s) => {
      const mult = s.billing_cycle === 'yearly' ? 1/12
                 : s.billing_cycle === 'quarterly' ? 1/3
                 : s.billing_cycle === 'weekly' ? 4 : 1;
      return sum + (s.amount * mult);
    }, 0);
  }

  getDaysLeft(s: Subscription): number {
    if (!s.next_billing_date) return 0;
    const diff = new Date(s.next_billing_date).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  onSubmit() {
    if (this.form.invalid) return;
    const data = this.form.value as any;
    const req = this.editId ? this.svc.update(this.editId, data) : this.svc.create(data);
    req.subscribe({
      next: () => { this.snack.open('Saved!', '', { duration: 2500 }); this.cancelForm(); this.load(); },
      error: (e) => this.snack.open(e?.error?.error || 'Error saving', '', { duration: 3000 }),
    });
  }

  startEdit(s: Subscription) {
    this.editId = s.subscription_id;
    this.form.patchValue({
      merchant_name:     s.merchant_name ?? s.name ?? '',
      amount:            s.amount,
      billing_cycle:     s.billing_cycle,
      next_billing_date: s.next_billing_date?.split('T')[0] ?? '',
      notes:             s.notes ?? '',
    });
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelForm() {
    this.showForm = false;
    this.editId = null;
    this.form.reset({ billing_cycle: 'monthly' });
  }

  pause(s: Subscription)      { this.svc.update(s.subscription_id, { is_active: false }).subscribe(() => this.load()); }
  reactivate(s: Subscription) { this.svc.update(s.subscription_id, { is_active: true  }).subscribe(() => this.load()); }

  delete(id: number) {
    if (!confirm('Delete this subscription?')) return;
    this.svc.delete(id).subscribe(() => { this.snack.open('Deleted', '', { duration: 2000 }); this.load(); });
  }
}
