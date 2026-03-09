import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BudgetService } from '../../shared/services/budget.service';
import { MerchantService } from '../../shared/services/merchant.service';
import { Budget, Category } from '../../shared/models/models';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressBarModule, MatSnackBarModule
  ],
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.scss']
})
export class BudgetsComponent implements OnInit {
  budgets: Budget[] = [];
  categories: Category[] = [];
  showForm = false;
  editId: number | null = null;

  form = this.fb.group({
    name:            [''],
    category_id:     [null as number | null, Validators.required],
    monthly_limit:   [null as number | null, [Validators.required, Validators.min(1)]],
    start_month:     [new Date().toISOString().split('T')[0], Validators.required],
    end_month:       [''],
    alert_threshold: [80],
  });

  constructor(
    private svc: BudgetService,
    private merchantSvc: MerchantService,
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.load();
    this.merchantSvc.getCategories().subscribe(c => this.categories = c);
  }

  load() { this.svc.getAll().subscribe(b => this.budgets = b); }

  onSubmit() {
    if (this.form.invalid) return;
    const raw = this.form.value;
    const data: any = {
      name:            raw.name || null,
      category_id:     raw.category_id,
      monthly_limit:   raw.monthly_limit,
      start_month:     raw.start_month,
      end_month:       raw.end_month || null,
      alert_threshold: raw.alert_threshold || 80,
    };
    const req = this.editId ? this.svc.update(this.editId, data) : this.svc.create(data);
    req.subscribe({
      next: () => { this.snack.open('Budget saved!', '', { duration: 2500 }); this.cancelForm(); this.load(); },
      error: (e) => this.snack.open(e?.error?.error || 'Error saving budget', '', { duration: 3000 }),
    });
  }

  startEdit(b: Budget) {
    this.editId = b.budget_id;
    this.form.patchValue({
      name:            b.name ?? '',
      category_id:     b.category_id,
      monthly_limit:   b.monthly_limit,
      start_month:     b.start_month?.split('T')[0] ?? '',
      end_month:       b.end_month?.split('T')[0] ?? '',
      alert_threshold: b.alert_threshold ?? 80,
    });
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelForm() {
    this.showForm = false;
    this.editId = null;
    this.form.reset({ start_month: new Date().toISOString().split('T')[0], alert_threshold: 80 });
  }

  delete(id: number) {
    if (!confirm('Delete this budget?')) return;
    this.svc.delete(id).subscribe(() => { this.snack.open('Deleted', '', { duration: 2000 }); this.load(); });
  }

  getPercent(b: Budget): number {
    if (!b.monthly_limit) return 0;
    return Math.min((b.spent / b.monthly_limit) * 100, 110);
  }
}
