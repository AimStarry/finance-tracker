import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TransactionService, TransactionFilter } from '../../shared/services/transaction.service';
import { MerchantService } from '../../shared/services/merchant.service';
import { Transaction, Pagination, Category } from '../../shared/models/models';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatTableModule,
    MatTooltipModule, MatSnackBarModule, MatCheckboxModule
  ],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  categories: Category[] = [];
  pagination: Pagination | null = null;
  filter: TransactionFilter & { page: number } = { page: 1, limit: 20 };
  showForm = false;
  editId: number | null = null;
  columns = ['date', 'merchant', 'type', 'amount', 'actions'];

  form = this.fb.group({
    merchant_name:    [''],
    category_id:      [null as number | null],
    amount:           [null as number | null, [Validators.required, Validators.min(0.01)]],
    transaction_type: ['expense', Validators.required],
    transaction_date: [new Date().toISOString().split('T')[0], Validators.required],
    payment_method:   [''],
    notes:            [''],
    is_recurring:     [false],
  });

  constructor(
    private svc: TransactionService,
    private merchantSvc: MerchantService,
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadTransactions();
    this.merchantSvc.getCategories().subscribe(c => this.categories = c);
  }

  loadTransactions() {
    this.svc.getAll(this.filter).subscribe(res => {
      this.transactions = res.data;
      this.pagination = res.pagination;
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const data = this.form.value as any;
    const req = this.editId ? this.svc.update(this.editId, data) : this.svc.create(data);
    req.subscribe({
      next: () => { this.snack.open('Transaction saved!', '', { duration: 2500 }); this.cancelForm(); this.loadTransactions(); },
      error: (e) => this.snack.open(e?.error?.error || 'Error saving transaction', '', { duration: 3000 }),
    });
  }

  startEdit(t: Transaction) {
    this.editId = t.transaction_id;
    this.form.patchValue({
      merchant_name:    t.merchant_name ?? '',
      category_id:      t.category_id ?? null,
      amount:           t.amount,
      transaction_type: t.transaction_type,
      transaction_date: t.transaction_date.split('T')[0],
      payment_method:   t.payment_method ?? '',
      notes:            t.notes ?? '',
      is_recurring:     t.is_recurring,
    });
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelForm() {
    this.showForm = false;
    this.editId = null;
    this.form.reset({
      transaction_type: 'expense',
      transaction_date: new Date().toISOString().split('T')[0],
      is_recurring: false
    });
  }

  delete(id: number) {
    if (!confirm('Delete this transaction?')) return;
    this.svc.delete(id).subscribe(() => { this.snack.open('Deleted', '', { duration: 2000 }); this.loadTransactions(); });
  }

  prevPage() { if (this.filter.page > 1) { this.filter.page--; this.loadTransactions(); } }
  nextPage() { if (this.pagination && this.filter.page < this.pagination.pages) { this.filter.page++; this.loadTransactions(); } }
}
