import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  TextField,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

const OutsideBankTransfer = () => {
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const customerId = localStorage.getItem('customerId'); // Fetch customerId from local storage
  const API_URL = 'https://firestore.googleapis.com/v1/projects/bank-of-barcelona-3da98/databases/(default)/documents/customers';
  const receiverUrl = `https://firestore.googleapis.com/v1/projects/bank-common-db/databases/(default)/documents/common_db/${ifscCode}`;

  // Fetch customer details (balance) using customerId
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/${customerId}`);
        const customerData = response.data.fields;
        setBalance(customerData.accountBalance.integerValue); // Fetch balance from the fields
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError('Failed to fetch customer details.');
      }
    };

    if (customerId) {
      fetchCustomerDetails();
    } else {
      setError('Customer ID not found.');
    }
  }, [customerId]);

  // Handle transfer submission
  const handleTransfer = async () => {
    if (!accountNumber || !ifscCode || !amount) {
      setError('Please fill out all fields.');
      return;
    }

    if (amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    if (balance < amount) {
      setError('Insufficient balance.');
      return;
    }

    try {
      // Validate IFSC and Account Number in the second API (common_db)
      const ifscResponse = await axios.get(receiverUrl);
      const ifscData = ifscResponse.data.fields;

      // Check if the account number exists in the array
      const accountNumbers = ifscData.accountNumber?.arrayValue?.values?.map(
        (acc) => acc.mapValue.fields.accountNumber.stringValue
      );

      if (!accountNumbers || !accountNumbers.includes(accountNumber)) {
        setError('Invalid account number for the given IFSC code.');
        return;
      }

      // Find the correct account to update by checking account number
      const accountToUpdate = ifscData.accountNumber?.arrayValue?.values?.find(
        (acc) => acc.mapValue.fields.accountNumber.stringValue === accountNumber
      );

      // Create the new transaction object
      const newTransaction = {
        mapValue: {
          fields: {
            creditAmount: {
              integerValue: amount, // The amount being credited to the receiver
            },
            senderAccountNumber: {
              stringValue: customerId, // The sender's account number
            },
          },
        },
      };

      // Update the account's transaction history by appending the new transaction
      const updatedAccountNumberField = [
        ...accountToUpdate.mapValue.fields.transactions?.arrayValue?.values || [],
        newTransaction,
      ];

      // Prepare the patch data to update the receiver's account transactions
      const receiverPatchData = {
        fields: {
          accountNumber: {
            arrayValue: {
              values: ifscData.accountNumber.arrayValue.values.map((acc) => {
                if (acc.mapValue.fields.accountNumber.stringValue === accountNumber) {
                  return {
                    mapValue: {
                      fields: {
                        ...acc.mapValue.fields,
                        transactions: {
                          arrayValue: {
                            values: updatedAccountNumberField,
                          },
                        },
                      },
                    },
                  };
                }
                return acc;
              }),
            },
          },
        },
      };

      // Update the sender's balance in the main API
      await axios.patch(`${API_URL}/${customerId}`, {
        fields: {
          accountBalance: { integerValue: balance - amount },
        },
      });

      // Patch the receiver's document in the `common_db` to add the transaction details
      await axios.patch(receiverUrl, receiverPatchData);

      alert(`₹${amount} successfully transferred to Account ${accountNumber} via IFSC ${ifscCode}`);
      setIsButtonDisabled(true); // Disable the button after successful transfer
    } catch (error) {
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
        backgroundColor: '#f0f4f7',
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
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Outside Bank Transfer
        </Typography>

        {/* Loading Indicator */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Account Number Field */}
            <FormControl fullWidth sx={{ marginBottom: '1.5rem' }}>
              <TextField
                label="Account Number"
                variant="outlined"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
              />
            </FormControl>

            {/* IFSC Code Field */}
            <FormControl fullWidth sx={{ marginBottom: '1.5rem' }}>
              <TextField
                label="IFSC Code"
                variant="outlined"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                required
              />
            </FormControl>

            {/* Amount Field */}
            <FormControl fullWidth sx={{ marginBottom: '1.5rem' }}>
              <TextField
                label="Amount (₹)"
                variant="outlined"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </FormControl>

            {/* Error Message */}
            {error && (
              <Typography color="error" align="center" sx={{ marginBottom: '1rem' }}>
                {error}
              </Typography>
            )}

            {/* Transfer Button */}
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleTransfer}
              disabled={isButtonDisabled || loading}
            >
              Transfer Funds
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default OutsideBankTransfer;
