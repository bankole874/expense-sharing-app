import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
    const [expenses, setExpenses] = useState([]);
    const [users, setUsers] = useState([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState('');
    const [splitAmong, setSplitAmong] = useState([]);

    useEffect(() => {
        axios.get('/api/expenses')
            .then(response => setExpenses(response.data))
            .catch(error => console.log(error));

        axios.get('/api/users')
            .then(response => setUsers(response.data))
            .catch(error => console.log(error));
    }, []);

    const addExpense = () => {
        const newExpense = {
            description,
            amount: parseFloat(amount),
            paidBy,
            splitAmong
        };

        axios.post('/api/expenses', newExpense)
            .then(response => setExpenses([...expenses, response.data]))
            .catch(error => console.log(error));

        setDescription('');
        setAmount('');
        setPaidBy('');
        setSplitAmong([]);
    };

    return (
        <div className="App">
            <h1>Expense Sharing App</h1>
            <div>
                <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                />
                <select
                    value={paidBy}
                    onChange={e => setPaidBy(e.target.value)}
                >
                    <option value="">Paid By</option>
                    {users.map(user => (
                        <option key={user._id} value={user._id}>{user.name}</option>
                    ))}
                </select>
                <select
                    multiple
                    value={splitAmong}
                    onChange={e => setSplitAmong([...e.target.selectedOptions].map(option => option.value))}
                >
                    {users.map(user => (
                        <option key={user._id} value={user._id}>{user.name}</option>
                    ))}
                </select>
                <button onClick={addExpense}>Add Expense</button>
            </div>
            <div>
                <h2>Expenses</h2>
                <ul>
                    {expenses.map(expense => (
                        <li key={expense._id}>
                            {expense.description} - ${expense.amount} - Paid by {expense.paidBy.name} - Split among {expense.splitAmong.map(user => user.name).join(', ')}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default App;

