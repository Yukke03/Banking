import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Paper, Grid, TextField } from '@mui/material';
import axios from 'axios';

const Profile = () => {
  const [customerData, setCustomerData] = useState(null);
  const [documentId, setDocumentId] = useState(null); // Store the document ID
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Fetch customer data based on the logged-in user's customerId
    const fetchCustomerData = async () => {
      try {
        const customerId = localStorage.getItem('customerId'); // Fetch the customer ID from localStorage
        const response = await axios.get(
          `https://firestore.googleapis.com/v1/projects/bank-of-barcelona-3da98/databases/(default)/documents/customers?key=AIzaSyA8Ku0g-O7AzM1Ho4HSWoNJXx2z1prtFdM`
        );

        // Find the customer document with the matching customerId
        const customerDocument = response.data.documents.find(doc => {
          const fields = doc.fields;
          return fields.customerId && fields.customerId.stringValue === customerId;
        });

        if (customerDocument) {
          const data = customerDocument.fields;
          setDocumentId(customerDocument.name.split('/').pop()); // Extract document ID from the document's name
          
          // Set customer data and editable states
         
          setCustomerData(data);
          setEmail(data.email.stringValue);
          setFirstName(data.firstName.stringValue);
          setLastName(data.lastName.stringValue);
          setDateOfBirth(data.dateOfBirth.stringValue);
        } else {
          setError('Customer not found.');
        }
      } catch (error) {
        console.error(error);
        setError('Failed to fetch customer data.');
      }
    };

    fetchCustomerData();
  }, []);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    try {
        if (!documentId) {
            setError('Document ID not found.');
            return;
        }
        
        // Fetch the existing document to retain all fields
        const documentSnapshot = await axios.get(
            `https://firestore.googleapis.com/v1/projects/bank-of-barcelona-3da98/databases/(default)/documents/customers/${documentId}?key=AIzaSyA8Ku0g-O7AzM1Ho4HSWoNJXx2z1prtFdM`
        );

        const existingData = documentSnapshot.data.fields;

        // Prepare the updated data, keeping existing fields
        const updatedData = {
            aadharCard: existingData.aadharCard ? existingData.aadharCard.stringValue : "",
            aadharImageUrl: existingData.aadharImageUrl ? existingData.aadharImageUrl.stringValue : "",
            accountBalance: existingData.accountBalance ? existingData.accountBalance.integerValue : 0,
            accountNumber: existingData.accountNumber ? existingData.accountNumber.stringValue : "",
            createdAt: existingData.createdAt ? existingData.createdAt.timestampValue : "",
            customerId: existingData.customerId ? existingData.customerId.stringValue : "",
            dateOfBirth: dateOfBirth || existingData.dateOfBirth.stringValue,
            email: email || existingData.email.stringValue,
            firstName: firstName || existingData.firstName.stringValue,
            lastName: lastName || existingData.lastName.stringValue,
            panCard: existingData.panCard ? existingData.panCard.stringValue : "",
            panImageUrl: existingData.panImageUrl ? existingData.panImageUrl.stringValue : "",
            password: password ? { stringValue: password } : existingData.password,
            phoneNumber: existingData.phoneNumber ? existingData.phoneNumber.stringValue : "",
        };

        
        // Prepare the request body
        const requestBody = {
            fields: {
                aadharCard: { stringValue: updatedData.aadharCard },
                aadharImageUrl: { stringValue: updatedData.aadharImageUrl },
                accountBalance: { integerValue: updatedData.accountBalance },
                accountNumber: { stringValue: updatedData.accountNumber },
                createdAt: { timestampValue: updatedData.createdAt },
                customerId: { stringValue: updatedData.customerId },
                dateOfBirth: { stringValue: updatedData.dateOfBirth },
                email: { stringValue: updatedData.email },
                firstName: { stringValue: updatedData.firstName },
                lastName: { stringValue: updatedData.lastName },
                panCard: { stringValue: updatedData.panCard },
                panImageUrl: { stringValue: updatedData.panImageUrl },
                password: updatedData.password ? { stringValue: updatedData.password.stringValue } : existingData.password,
                phoneNumber: { stringValue: updatedData.phoneNumber },
            },
        };

        // Send the PUT request with all fields, including updates
        await axios.patch(
            `https://firestore.googleapis.com/v1/projects/bank-of-barcelona-3da98/databases/(default)/documents/customers/${documentId}`,
            requestBody
        );

        // After a successful save, update the local state
        setCustomerData((prevData) => ({
            ...prevData,
            ...updatedData,
        }));

        setEditing(false);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        setError('Failed to update customer data.');
    }
};

const ClearSessionButton = () => {
    const handleLogout = () => {
      // Clear session data
      localStorage.removeItem('customerId'); // Remove customer ID
      localStorage.removeItem('encryptedPassword'); // Remove encrypted password
      localStorage.removeItem('token'); // Remove authentication token
  
      // Redirect to the home page
      window.location.href = '/'; // Redirect to the home page
    };
}
  

     
  if (!customerData) {
    return (
      <Container component="main" maxWidth="md">
        <Paper elevation={3} style={{ padding: '20px', marginTop: '50px' }}>
          <Typography variant="h5" align="center" gutterBottom>
            Customer Profile
          </Typography>
          {error && <Typography color="error">{error}</Typography>}
          <Typography>Loading...</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} style={{ padding: '20px', marginTop: '50px' }}>
        <Typography variant="h5" align="center" gutterBottom>
          Customer Profile
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">First Name: </Typography>
            {editing ? (
              <TextField
                variant="outlined"
                fullWidth
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            ) : (
              <Typography>{customerData.firstName?.stringValue}</Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Last Name: </Typography>
            {editing ? (
              <TextField
                variant="outlined"
                fullWidth
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            ) : (
              <Typography>{customerData.lastName?.stringValue}</Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Email: </Typography>
            {editing ? (
              <TextField
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            ) : (
              <Typography>{customerData.email?.stringValue}</Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Date of Birth: </Typography>
            {editing ? (
              <TextField
                variant="outlined"
                fullWidth
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            ) : (
              <Typography>{customerData.dateOfBirth?.stringValue}</Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Account Number: </Typography>
            <Typography>{customerData.accountNumber?.stringValue}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Account Balance: </Typography>
            <Typography>{customerData.accountBalance?.integerValue}</Typography> {/* Ensure correct data type */}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Password: </Typography>
            {editing ? (
              <TextField
                variant="outlined"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            ) : (
              <Typography>********</Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            {editing ? (
              <Button variant="contained" color="primary" onClick={handleSave}>
                Save Changes
              </Button>
            ) : (
              <Button variant="contained" color="secondary" onClick={handleEdit}>
                Edit Profile
              </Button>
            )}
            <a href="/apply-loan">
              <Button variant="outlined" style={{ marginLeft: '10px' }}>
                Apply for a Loan
              </Button>
            </a>
            <a href="/transfer-funds">
              <Button variant="outlined" style={{ marginLeft: '10px' }}>
                Fund Transfer
              </Button>
            </a>
            <a href="/">
              <Button variant="outlined" style={{ marginLeft: '10px' }}>
                Go to Home Page
              </Button>
            </a>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile;
