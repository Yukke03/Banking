import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Card, CardContent, Typography, Box } from '@mui/material'; // MUI components
import './adminDashboard.css';

const Header = () => (
  <header className="header">
    <h1>Admin Dashboard</h1>
    <nav>
      <a href="/home">Home</a>
      <a href="/settings">Settings</a>
      <a href="/logout">Logout</a>
    </nav>
  </header>
);

const Footer = () => (
  <footer className="footer">
    <p>&copy; {new Date().getFullYear()} Bank Of Barcelona. All Rights Reserved.</p>
    <p>
      <a href="#">Privacy Policy</a>
      <a href="#">Terms of Service</a>
    </p>
  </footer>
);

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [buttonClicked, setButtonClicked] = useState({}); // Track button clicks
  const [loans, setLoans] = useState([]); // State to hold loan details


  const projectId = 'bank-of-barcelona-3da98'; // Replace with your Firestore project ID
  const apiKey = 'AIzaSyA8Ku0g-O7AzM1Ho4HSWoNJXx2z1prtFdM'; // Replace with your Firestore API key

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users?key=${apiKey}`
      );
      const userList = response.data.documents.map((doc) => {
        const userId = doc.name.split('/').pop(); // Extracting document ID
        return {
          id: userId,
          password: doc.fields.password || { stringValue: 'N/A' },
          firstName: doc.fields.firstName || { stringValue: 'N/A' },
          lastName: doc.fields.lastName || { stringValue: 'N/A' },
          email: doc.fields.email || { stringValue: 'N/A' },
          phoneNumber: doc.fields.phoneNumber || { stringValue: 'N/A' },
          aadharCard: doc.fields.aadharCard || { stringValue: 'N/A' },
          aadharImageUrl: doc.fields.aadharImageUrl || { stringValue: 'N/A' },
          panCard: doc.fields.panCard || { stringValue: 'N/A' },
          panImageUrl: doc.fields.panImageUrl || { stringValue: 'N/A' },
          dateOfBirth: doc.fields.dateOfBirth || { stringValue: 'N/A' },
          createdAt: doc.fields.createdAt || { timestampValue: new Date().toISOString() },
          status: doc.fields.status || { stringValue: 'Pending' }, // Add status field
        };
      });
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Generate 10-digit account number
  const generateAccountNumber = () => Math.floor(Math.random() * 9000000000) + 1000000000;

// Function to accept a user and add to the customers collection
const acceptUser = async (user) => {
    const accountNumber = generateAccountNumber(); // Generate a 10-digit account number
  
    try {
      // Add the user to the customers collection with a default account balance
      const response = await axios.post(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/customers?key=${apiKey}`,
        {
          fields: {
            firstName: { stringValue: user.firstName.stringValue },
            lastName: { stringValue: user.lastName.stringValue },
            password: { stringValue: user.password.stringValue },
            email: { stringValue: user.email.stringValue },
            phoneNumber: { stringValue: user.phoneNumber.stringValue },
            aadharCard: { stringValue: user.aadharCard.stringValue },
            aadharImageUrl: { stringValue: user.aadharImageUrl.stringValue },
            panCard: { stringValue: user.panCard.stringValue },
            panImageUrl: { stringValue: user.panImageUrl.stringValue },
            dateOfBirth: { stringValue: user.dateOfBirth.stringValue },
            createdAt: { timestampValue: new Date().toISOString() },
            accountNumber: { stringValue: accountNumber.toString() },
            accountBalance: { integerValue: "100000" }, // Default balance of 100000
          },
        }
      );
  
      // Extract the document ID from the response and use it as the customerId
      const documentId = response.data.name.split("/").pop();
  
      // Fetch the existing document to retain all other fields
      const customerResponse = await axios.get(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/customers/${documentId}?key=${apiKey}`
      );
  
      const customerData = customerResponse.data.fields;
  
      // Patch the document with customerId while retaining all other fields
      await axios.patch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/customers/${documentId}?key=${apiKey}`,
        {
          fields: {
            ...customerData, // Spread all the existing fields to retain them
            customerId: { stringValue: documentId }, // Add customerId
          },
        }
      );
  
      alert("User accepted successfully!");
    } catch (error) {
      console.error("Error adding user:", error);
    }
  
    // Delete the user from the users collection
    await axios.delete(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${user.id}?key=${apiKey}`
    );
  
    // Refresh the user list
    fetchUsers();
  };
  

  // Reject user
  const rejectUser = async (userId) => {
    try {
      await axios.delete(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}?key=${apiKey}`
      );
      fetchUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  // Hold user
  const holdUser = async (userId) => {
    try {
      const userResponse = await axios.get(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}?key=${apiKey}`
      );
      const user = userResponse.data.fields;

      await axios.patch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}?key=${apiKey}`,
        {
          fields: {
            ...user, // Keep all other fields unchanged
            status: { stringValue: 'Hold' },
          },
        }
      );
      fetchUsers();
    } catch (error) {
      console.error('Error holding user:', error);
    }
  };

  const handleButtonClick = (action, user) => {
    if (!buttonClicked[action]) {
      setButtonClicked((prev) => ({ ...prev, [action]: true }));

      if (action === 'accept') acceptUser(user);
      else if (action === 'reject') rejectUser(user.id);
      else if (action === 'hold') holdUser(user.id);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

// Fetch loan details from Firestore
const fetchLoans = async () => {
    try {
      const response = await axios.get(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/LoanDetails?key=${apiKey}`
      );
      const loanList = response.data.documents.map((doc) => {
        const loanId = doc.name.split('/').pop();
        return {
          loanAccountNumber: doc.fields.loanAccountNumber || { stringValue: 'N/A' },
          customerId: doc.fields.customerId || { stringValue: 'N/A' },
          loanAmount: doc.fields.loanAmount || { integerValue: 0 },
          status: doc.fields.status || { stringValue: 'Pending' },
          firstName: doc.fields.firstName || { stringValue: 'N/A' },
          lastName: doc.fields.lastName || { stringValue: 'N/A' },
          loanType: doc.fields.loanType || { stringValue: 'N/A' },

        };
      });
      setLoans(loanList);
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };



 // Accept a loan
 const acceptLoan = async (loan) => {
    try {
      // Fetch the customer details
      const customerResponse = await axios.get(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/customers/${loan.customerId.stringValue}?key=${apiKey}`
      );
      const customer = customerResponse.data.fields;
      const updatedBalance = parseInt(customer.accountBalance.integerValue) + parseInt(loan.loanAmount.integerValue);

      // Update the customer balance
      await axios.patch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/customers/${loan.customerId.stringValue}?key=${apiKey}`,
        {
          fields: {
            ...customer,
            accountBalance: { integerValue: updatedBalance.toString() },
          },
        }
      );

      // Construct the document ID for LoanDetails
      const loanDocumentId = `${loan.customerId.stringValue}_${loan.loanAccountNumber.stringValue}`;

      // Approve loan by updating status without losing other fields
      await axios.patch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/LoanDetails/${loanDocumentId}?key=${apiKey}`,
        {
          fields: {
            ...loan,  // Retain all existing fields from the loan document
            status: { stringValue: 'Approved' }, // Update only status
          },
        }
      );

      alert('Loan approved and account balance updated.');
      fetchLoans(); // Refresh loan data after the update
    } catch (error) {
      console.error('Error accepting loan:', error);
    }
  };

  // Reject a loan
  const rejectLoan = async (loan) => {

    try {
      // Construct the document ID for LoanDetails
      const loanDocumentId = `${loan.customerId.stringValue}_${loan.loanAccountNumber.stringValue}`;

      // Update status to 'Rejected' instead of deleting
      await axios.patch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/LoanDetails/${loanDocumentId}?key=${apiKey}`,
        {
          fields: {
            ...loan,  // Retain all existing fields from the loan document
            status: { stringValue: 'Rejected' }, // Update only status
          },
        }
      );

      alert('Loan rejected.');
      fetchLoans(); // Refresh loan data after the update
    } catch (error) {
      console.error('Error rejecting loan:', error);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      <div className="user-container">
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user.id} className="user-card">
              <h3>
                {user.firstName.stringValue} {user.lastName.stringValue}
              </h3>
              <p>Email: {user.email.stringValue}</p>
              <p>Phone Number: {user.phoneNumber.stringValue}</p>
              <p>Aadhar Card: {user.aadharCard.stringValue}</p>
              <img
                src={user.aadharImageUrl.stringValue}
                alt="Aadhar"
                style={{ width: '150px', height: 'auto' }}
              />
              <p>PAN Card: {user.panCard.stringValue}</p>
              <img
                src={user.panImageUrl.stringValue}
                alt="PAN"
                style={{ width: '150px', height: 'auto' }}
              />
              <p>Date of Birth: {user.dateOfBirth.stringValue}</p>
              <p>Created At: {new Date(user.createdAt.timestampValue).toLocaleString()}</p>
              <p>Status: {user.status.stringValue}</p>
              <div className="action-buttons">
                <button onClick={() => acceptUser(user)}>Accept</button>
                <button onClick={() => rejectUser(user.id)}>Reject</button>
                <button onClick={() => holdUser(user.id)}>Hold</button>
              </div>
            </div>
          ))
        ) : (
          <p>No users found</p>
        )}
      </div>
      <div className="loan-container" style={{ marginTop: '40px' }}>
      <Typography variant="h4">Loan Approvals</Typography>
      {loans.length > 0 ? (
        loans.map((loan) => {
          const isProcessed = loan.status.stringValue === 'Approved' || loan.status.stringValue === 'Rejected';

          return (
            <Card key={`${loan.customerId.stringValue}_${loan.loanAccountNumber.stringValue}`} className="loan-card" sx={{ marginBottom: 2 }}>
              <CardContent>
                <Typography variant="h6">Customer ID: {loan.customerId.stringValue}</Typography>
                <Typography>Loan Amount: {loan.loanAmount.integerValue}</Typography>
                <Typography>Loan Type: {loan.loanType.stringValue}</Typography>
                <Typography>Status: {loan.status.stringValue}</Typography>
                <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                  <Button 
                    variant="contained" 
                    color="success" 
                    onClick={() => acceptLoan(loan)} 
                    disabled={isProcessed} // Disable if already processed
                  >
                    Accept
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error" 
                    onClick={() => rejectLoan(loan)} 
                    disabled={isProcessed} // Disable if already processed
                  >
                    Reject
                  </Button>
                </Box>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <Typography>No loan requests found</Typography>
      )}
    </div>
      <a className="back-button" href="/admin/login" >
        Back to Login
      </a>
      <Footer />
    </div>
  );
};

export default AdminDashboard;

