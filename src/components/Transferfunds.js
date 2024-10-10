import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Grid,
  Paper,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const TransferFunds = () => {
  const [transferType, setTransferType] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode] = useState('Yukke0703'); // Read-only for within the bank
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [balance, setBalance] = useState(0); // Sender's balance
  const [senderAccountNumber, setSenderAccountNumber] = useState('');
  const API_URL = 'https://firestore.googleapis.com/v1/projects/bank-of-barcelona-3da98/databases/(default)/documents/customers';
  const customerId = localStorage.getItem('customerId'); // Retrieve customerId from localStorage
  const navigate = useNavigate(); // Initialize useNavigate hook
  

  // Fetch sender's account details using customerId (which is the document ID)
  const fetchSenderAccountDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/${customerId}?key=AIzaSyA8Ku0g-O7AzM1Ho4HSWoNJXx2z1prtFdM`);
      const accountDetails = response.data.fields;

      setSenderAccountNumber(accountDetails.accountNumber.stringValue);
      setBalance(accountDetails.accountBalance.integerValue); // Set sender's balance
    } catch (err) {
      console.error('Error fetching sender account details:', err);
      setError('Failed to fetch sender account details.');
    }
  };

  useEffect(() => {
    fetchSenderAccountDetails();
  }, [customerId]);

  // Handle the change in transfer type
  const handleTransferTypeChange = (e) => {
    const selectedType = e.target.value;
    setTransferType(selectedType); // Update state to retain selection

    // If the selected type is "outside", navigate to the outside bank transfer page
    if (selectedType === 'outside') {
      navigate('/OutsideBankTransfer');
    }
  };

// Handle the fund transfer submission
const handleTransfer = async () => {
    if (!transferType) {
        setError('Please select a transfer type.');
        return;
    }
    if (!accountNumber || !amount) {
        setError('Please fill out all required fields.');
        return;
    }
    if(accountNumber===senderAccountNumber){
      setError("Account Number same. You can't send money to same account which you are currently accessing");
      return;
    }
    if (amount <= 0) {
        setError('Please enter a valid amount.');
        return;
    }
    if (balance <= 0) {
        setError('Your account balance is zero. Cannot send money.');
        return;
    }
    if (parseInt(amount) > balance) {
        setError('Insufficient balance to complete the transfer.');
        return;
    }

    try {
        console.log('Fetching all customers...');
        // Fetch all customers to find both the sender and receiver
        const response = await axios.get(`${API_URL}?key=AIzaSyA8Ku0g-O7AzM1Ho4HSWoNJXx2z1prtFdM`);
        const customers = response.data.documents;

        console.log('Customers fetched:', customers);

        // Find the sender's account by matching the current logged-in customer's ID (customerId)
        const senderDoc = customers.find(doc => {
            return doc.name.split('/').pop() === customerId; // Match the logged-in user's customerId
        });

        if (!senderDoc) {
            setError('Sender account not found.');
            return;
        }

        console.log('Sender document:', senderDoc);

        // Initialize receiverDoc as undefined
        let receiverDoc;

        // Iterate through all documents to find the receiver's account number
        for (const doc of customers) {
            const receiverAccountNumber = doc.fields.accountNumber?.stringValue; // Access as string
            console.log('Checking receiver account:', receiverAccountNumber, 'against input:', accountNumber);

            // Compare account numbers
            if (receiverAccountNumber === accountNumber) {
                receiverDoc = doc; // Assign the found receiver document
                break; // Exit the loop once found
            }
        }

        if (!receiverDoc) {
            console.log('Receiver account not found with account number:', accountNumber);
            setError('Receiver account not found.');
            return;
        }

        console.log('Receiver document found:', receiverDoc);

        // Get sender's and receiver's current balances
        const senderBalance = parseInt(senderDoc.fields.accountBalance?.integerValue, 10); // Ensure it's an integer
        const receiverBalance = parseInt(receiverDoc.fields.accountBalance?.integerValue, 10); // Ensure it's an integer

        console.log('Sender balance:', senderBalance);
        console.log('Receiver balance:', receiverBalance);

        // Calculate new balances
        const newReceiverBalance = receiverBalance + parseInt(amount); // Ensure amount is treated as integer
        const newSenderBalance = senderBalance - parseInt(amount); // Ensure amount is treated as integer

        // Debugging: Log the new balances
        console.log('New Receiver Balance:', newReceiverBalance);
        console.log('New Sender Balance:', newSenderBalance);

        // Prepare the patch for sender
        const senderPatchData = {
            fields: {
                ...senderDoc.fields, // Spread the existing fields to retain them
                accountBalance: {
                    integerValue: newSenderBalance, // Update only accountBalance
                },
            },
        };

        // Prepare the patch for receiver
        const receiverPatchData = {
            fields: {
                ...receiverDoc.fields, // Spread the existing fields to retain them
                accountBalance: {
                    integerValue: newReceiverBalance, // Update only accountBalance
                },
            },
        };

        console.log('Patching sender balance:', senderPatchData);
        await axios.patch(`${API_URL}/${customerId}?key=AIzaSyA8Ku0g-O7AzM1Ho4HSWoNJXx2z1prtFdM`, senderPatchData);

        const receiverDocId = receiverDoc.name.split('/').pop(); // Extract document ID
        console.log('Patching receiver balance for doc ID:', receiverDocId, receiverPatchData);
        await axios.patch(`${API_URL}/${receiverDocId}?key=AIzaSyA8Ku0g-O7AzM1Ho4HSWoNJXx2z1prtFdM`, receiverPatchData);

        alert(`Successfully transferred ₹${amount} to Account ${accountNumber}`);
        setIsButtonDisabled(true); // Disable button after the transfer
        setBalance(newSenderBalance); // Update local balance
    } catch (err) {
        console.error('Error during transfer:', err);
        setError('Transfer failed. Please try again.');
    }
};


  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#e0f7fa',
        padding: '1rem',
      }}
    >
      <Paper
        elevation={5}
        sx={{
          padding: '2rem',
          width: '400px',
          borderRadius: '10px',
          backgroundColor: '#ffffff',
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Typography variant="h4" align="center" gutterBottom color="#00796b">
          Transfer Funds
        </Typography>

        <FormControl fullWidth sx={{ marginBottom: '1rem' }}>
          <InputLabel id="transfer-type-label">Transfer Type</InputLabel>
          <Select
            labelId="transfer-type-label"
            value={transferType}
            label="Transfer Type"
            onChange={handleTransferTypeChange} // Handle transfer type change and navigate
          >
            <MenuItem value="within">Within Bank</MenuItem>
            <MenuItem value="outside">Outside Bank</MenuItem>
          </Select>
        </FormControl>

        {transferType && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Account Number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                variant="outlined"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#00796b',
                    },
                    '&:hover fieldset': {
                      borderColor: '#004d40',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#004d40',
                    },
                  },
                }}
              />
            </Grid>
            {transferType === 'within' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="IFSC Code"
                  value={ifscCode}
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#00796b',
                      },
                      '&:hover fieldset': {
                        borderColor: '#004d40',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#004d40',
                      },
                    },
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                variant="outlined"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#00796b',
                    },
                    '&:hover fieldset': {
                      borderColor: '#004d40',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#004d40',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        )}

        {error && (
          <Typography variant="body2" color="error" align="center">
            {error}
          </Typography>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: '1rem' }}
          onClick={handleTransfer}
          disabled={isButtonDisabled}
        >
          Transfer
        </Button>
      </Paper>
    </Box>
  );
};

export default TransferFunds;
