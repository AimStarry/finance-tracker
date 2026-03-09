const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');

const authController         = require('../controllers/authController');
const transactionController  = require('../controllers/transactionController');
const budgetController       = require('../controllers/budgetController');
const subscriptionController = require('../controllers/subscriptionController');
const analyticsController    = require('../controllers/analyticsController');
const merchantController     = require('../controllers/merchantController');

// Auth
router.post('/auth/register', authController.register);
router.post('/auth/login',    authController.login);
router.get ('/auth/me',       auth, authController.getMe);

// Transactions
router.get   ('/transactions',     auth, transactionController.getAll);
router.get   ('/transactions/:id', auth, transactionController.getOne);
router.post  ('/transactions',     auth, transactionController.create);
router.put   ('/transactions/:id', auth, transactionController.update);
router.delete('/transactions/:id', auth, transactionController.remove);

// Budgets
router.get   ('/budgets',     auth, budgetController.getAll);
router.post  ('/budgets',     auth, budgetController.create);
router.put   ('/budgets/:id', auth, budgetController.update);
router.delete('/budgets/:id', auth, budgetController.remove);

// Subscriptions
router.get   ('/subscriptions',     auth, subscriptionController.getAll);
router.post  ('/subscriptions',     auth, subscriptionController.create);
router.put   ('/subscriptions/:id', auth, subscriptionController.update);
router.delete('/subscriptions/:id', auth, subscriptionController.remove);

// Analytics
router.get('/analytics/summary',     auth, analyticsController.getSummary);
router.get('/analytics/burn-rate',   auth, analyticsController.getBurnRate);
router.get('/analytics/trends',      auth, analyticsController.getTrends);
router.get('/analytics/by-category', auth, analyticsController.getByCategory);

// Merchants & Categories (lookup data)
router.get ('/merchants',            auth, merchantController.getAll);
router.get ('/merchants/categories', auth, merchantController.getCategories);
router.post('/merchants',            auth, merchantController.create);

module.exports = router;
