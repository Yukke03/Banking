import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Loan.css'; // Import CSS for styling
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Container, AppBar, Toolbar, Typography, Box } from '@mui/material';

function Loan() {
  const [userData, setUserData] = useState(null);
  const [loanAmount, setLoanAmount] = useState('');
  const [loanType, setLoanType] = useState('');
  const [message, setMessage] = useState('');
  const [loanDetails, setLoanDetails] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false); // For submit button
  const [isApplyDisabled, setIsApplyDisabled] = useState(false); // For apply button

  // Retrieve customerId from localStorage
  const customerId = localStorage.getItem('customerId');

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`https://firestore.googleapis.com/v1/projects/bank-of-barcelona-3da98/databases/(default)/documents/customers/${customerId}`);
        setUserData(response.data.fields);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, [customerId]);

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        // Fetch all loans for the customer from the LoanDetails collection
        const response = await axios.get(`https://firestore.googleapis.com/v1/projects/bank-of-barcelona-3da98/databases/(default)/documents/LoanDetails?key=AIzaSyA8Ku0g-O7AzM1Ho4HSWoNJXx2z1prtFdM`);
  
        // Extracting loans from the response
        const loansArray = response.data.documents || [];
  
        // Filtering loans for the specified customerId and with status = "Approved"
        const approvedLoans = loansArray
          .filter((loan) => {
            // Extract customerId and loan account number from the document ID
            const loanIdParts = loan.name.split('/').pop().split('_'); // Extracting customerId_loanAccountNumber
            const loanStatus = loan.fields.status?.stringValue; // Assuming status is stored as a stringValue
  
            // Check if the loan belongs to the given customerId and has "Approved" status
            return loanIdParts[0] === customerId && loanStatus === "Approved";
          })
          .map((loan) => {
            // Extract loanAccountNumber again for mapping
            const loanIdParts = loan.name.split('/').pop().split('_');
            return {
              loanType: loan.fields.loanType?.stringValue || "N/A",
              loanAmount: loan.fields.loanAmount?.integerValue || 0,
              loanAccountNumber: loanIdParts[1] || "N/A" // Get loanAccountNumber from the document ID
            }; // Mapping to get necessary fields
          });
  
        setLoanDetails(approvedLoans);
      } catch (error) {
        setLoanDetails([]);
        console.error('Error fetching loan details:', error);
      }
    };
  
    fetchLoanDetails();
  }, [customerId]);
  
  
  // Generate a random 6-digit loan account number
  const generateLoanAccountNumber = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const applyForLoan = async () => {
    if (loanAmount && loanType) {
      setIsSubmitDisabled(true); // Disable submit button after click

      const loanAccountNumber = generateLoanAccountNumber(); // Generate loan account number
      const documentId = `${customerId}_${loanAccountNumber}`; // Create document ID with customerId and loan account number

      try {
        const loanDetails = {
          customerId,
          firstName: userData.firstName.stringValue,
          lastName: userData.lastName.stringValue,
          loanAmount: loanAmount,
          loanType: loanType,
          loanAccountNumber: loanAccountNumber, // Store loan account number
          status: 'pending', // Set loan status to pending
        };

        // Store loan application in LoanDetails collection with generated document ID
        await axios.post(`https://firestore.googleapis.com/v1/projects/bank-of-barcelona-3da98/databases/(default)/documents/LoanDetails?documentId=${documentId}`, {
          fields: {
            customerId: { stringValue: loanDetails.customerId },
            firstName: { stringValue: loanDetails.firstName },
            lastName: { stringValue: loanDetails.lastName },
            loanAmount: { integerValue: loanDetails.loanAmount },
            loanType: { stringValue: loanDetails.loanType },
            loanAccountNumber: { stringValue: loanAccountNumber }, // Add loan account number to Firestore
            status: { stringValue: loanDetails.status },
          }
        });

        setMessage('Loan application submitted successfully! Waiting for admin approval.');
        setModalOpen(false); // Close the modal after submission
        setLoanAmount(''); // Reset loan amount
        setLoanType(''); // Reset loan type
      } catch (error) {
        console.error('Error applying for loan:', error);
        setMessage('Failed to submit loan application.');
      }
    } else {
      setMessage('Please enter loan amount and select loan type.');
    }
  };

  const handleLoanAmountChange = (e) => {
    setLoanAmount(e.target.value);
    setAmountError('');
  };

  return (
    <div className="loan-page">
      {/* Header */}
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Loan Application Portal
          </Typography>
        </Toolbar>
      </AppBar>

      <Container>
        <Box my={4}>
          {/* User Info */}
          <div className="user-info">
            {userData ? (
              <>
                <h2>User Details</h2>
                <p><strong>Customer ID:</strong> {customerId}</p>
                <p><strong>Name:</strong> {userData.firstName.stringValue} {userData.lastName.stringValue}</p>
              </>
            ) : (
              <p>Loading user data...</p>
            )}
          </div>

          {/* Go Back to Profile Page */}
          <Button variant="contained" color="secondary" href="/profile" disabled={isApplyDisabled} onClick={() => setIsApplyDisabled(true)}>Back to Profile</Button>

          {/* Apply Loan Button */}
          <Button variant="contained" color="primary" onClick={() => setModalOpen(true)} disabled={isApplyDisabled}>Apply for Loan</Button>

          {/* Modal for Loan Application */}
          {modalOpen && (
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={() => setModalOpen(false)}>&times;</span>
                <h3>Loan Application Form</h3>

                {/* Loan Type Selection */}
                <FormControl fullWidth margin="normal">
                  <InputLabel>Select Loan Type</InputLabel>
                  <Select
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value)}
                  >
                    <MenuItem value="Home Loan">Home Loan</MenuItem>
                    <MenuItem value="Educational Loan">Educational Loan</MenuItem>
                    <MenuItem value="Personal Loan">Personal Loan</MenuItem>
                    <MenuItem value="Vehicle Loan">Vehicle Loan</MenuItem>
                  </Select>
                </FormControl>

                {/* Loan Amount Input */}
                <TextField
                  label="Enter Loan Amount"
                  type="number"
                  value={loanAmount}
                  onChange={handleLoanAmountChange}
                  fullWidth
                  margin="normal"
                />
                {amountError && <p className="error-message">{amountError}</p>}

                {/* Submit Button */}
                <Button variant="contained" color="secondary" onClick={applyForLoan} disabled={isSubmitDisabled}>Submit Application</Button>
                {message && <p className="message">{message}</p>}
              </div>
            </div>
          )}

          {/* Display Existing Loans */}
          <div className="existing-loans">
            <h2>Your Approved Loans</h2>
            {loanDetails.length > 0 ? (
              <ul>
                {loanDetails.map((loan, index) => (
                  <li key={index}>
                    {loan.loanType}: ₹{loan.loanAmount} - Account Number: {loan.loanAccountNumber} - Status: Approved
                  </li>
                ))}
              </ul>
            ) : (
              <p>No approved loans found.</p>
            )}
          </div>
        </Box>
      </Container>

      {/* Footer */}
      <footer className="footer">
        <Typography variant="body2" color="textSecondary" align="center">
          &copy; {new Date().getFullYear()} Bank of Barcelona
        </Typography>
      </footer>
    </div>
  );
}

export default Loan;
