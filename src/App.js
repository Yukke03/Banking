// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage';          // Home Page Component
import SignUp from './SignUp';              // Sign Up Page Component
import AdminLogin from './components/AdminLogin';  // Admin Login Component
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login'; // Admin Dashboard Component
import Profile from'./components/Profile';
import TransferFunds from './components/Transferfunds';
import Loan from './components/Loan';
import OutsideBankTransfer from './components/OutsideBankTransfer';

function App() {
    const apiKey = "AIzaSyA8Ku0g-O7AzM1Ho4HSWoNJXx2z1prtFdM";  // Replace with your actual API key
    const projectId = "bank-of-barcelona-3da98"; // Replace with your actual Project ID

    return (
        <Router>
            <div>
                {/* Define Routes for Home, SignUp, AdminLogin, and AdminDashboard */}
                <Routes>
                    <Route path="/" element={<HomePage />} />  {/* Home Page */}
                    <Route path="/signup" element={<SignUp />} />  {/* Sign Up Page */}
                    <Route path="/admin/login" element={<AdminLogin />} /> {/* Admin Login Page */}
                    <Route path="/signin" element={<Login />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/transfer-funds" element={<TransferFunds />} />
                    <Route path="/apply-loan" element={<Loan />} />
                    <Route path="/OutsideBankTransfer" element={<OutsideBankTransfer />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard apiKey={apiKey} projectId={projectId} />} /> {/* Admin Dashboard */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
