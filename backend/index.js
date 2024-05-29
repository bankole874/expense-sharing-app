const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/expense-sharing', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Define schemas and models
const userSchema = new mongoose.Schema({
    name: String,
    email: String
});

const expenseSchema = new mongoose.Schema({
    description: String,
    amount: Number,
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    splitAmong: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Expense = mongoose.model('Expense', expenseSchema);

// Routes
app.get('/', (req, res) => {
    res.send('Hello World');
});

// API to add an expense
app.post('/api/expenses', async (req, res) => {
    const { description, amount, paidBy, splitAmong } = req.body;

    const expense = new Expense({
        description,
        amount,
        paidBy,
        splitAmong
    });

    try {
        await expense.save();
        res.status(201).send(expense);
    } catch (err) {
        res.status(400).send(err);
    }
});

// API to get all expenses
app.get('/api/expenses', async (req, res) => {
    try {
        const expenses = await Expense.find().populate('paidBy').populate('splitAmong');
        res.status(200).send(expenses);
    } catch (err) {
        res.status(400).send(err);
    }
});

// API to get the balance for each user
app.get('/api/users/:userId/balance', async (req, res) => {
    const { userId } = req.params;

    try {
        const userExpenses = await Expense.find({ paidBy: userId });
        const userShares = await Expense.find({ splitAmong: userId });

        const totalPaid = userExpenses.reduce((acc, expense) => acc + expense.amount, 0);
        const totalShare = userShares.reduce((acc, expense) => acc + expense.amount / expense.splitAmong.length, 0);

        const balance = totalPaid - totalShare;

        res.status(200).send({ balance });
    } catch (err) {
        res.status(400).send(err);
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

