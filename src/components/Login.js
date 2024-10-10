import React, { useState } from 'react';
import { Button, TextField, Typography, Container, Paper, Box, ThemeProvider, createTheme } from '@mui/material';
import axios from 'axios';
import CryptoJS from 'crypto-js'; // Library for encryption
import { styled } from '@mui/system'; // For styled components

// Create a theme with primary colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      dark: '#115293',
    },
    error: {
      main: '#f44336',
    },
  },
});

// Styled Paper component with animation
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '40px 30px', // Increased padding for a more spacious look
  backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white for a softer look
  borderRadius: '20px',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)', // Soft shadow for depth
  transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Animation for hover effect
  '&:hover': {
    transform: 'translateY(-5px)', // Lift effect on hover
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)', // Deeper shadow on hover
  },
}));

// Styled TextField with animation
const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: '20px',
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.primary.main,
      transition: 'border-color 0.3s', // Animation for border color
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.dark,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.dark, // Change border color when focused
    },
  },
}));

// Styled Button
const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  transition: 'background-color 0.3s, transform 0.2s', // Smooth transition
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.05)', // Scale effect on hover
  },
}));

// Styled Error Message
const StyledError = styled(Typography)(({ theme }) => ({
  marginTop: '10px',
  fontWeight: 'bold',
  color: theme.palette.error.main,
}));

// Main Container with Background Image
const BackgroundContainer = styled('div')({
  backgroundImage: `url('https://i.postimg.cc/v8pbR1C6/Black-Simple-Beautiful-Nature-Email-Header-1.png')`, // Replace with your background image path or URL
  backgroundSize: 'contain', // Cover the entire container
  backgroundPosition: 'center', // Center the background image
  height: '100vh', // Full height of the viewport
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const Login = () => {
  const [customerId, setCustomerId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    try {
      // Step 1: Fetch all customer documents
      const usersResponse = await axios.get(
        `https://firestore.googleapis.com/v1/projects/bank-of-barcelona-3da98/databases/(default)/documents/customers?key=AIzaSyA8Ku0g-O7AzM1Ho4HSWoNJXx2z1prtFdM`
      );

      // Step 2: Find the customer record with the matching customerId
      const customers = usersResponse.data.documents;
      const userDoc = customers.find(doc => doc.fields.customerId.stringValue === customerId);

      if (!userDoc) {
        setError('Customer ID not found.');
        return;
      }

      // Store customerId in local storage
      localStorage.setItem('customerId', customerId); // Store customer ID

      // Step 3: Extract the email from the user record
      const email = userDoc.fields.email.stringValue; // Adjust based on your Firestore document structure

      // Step 4: Validate the credentials using Firebase Authentication
      const authResponse = await axios.post(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyA8Ku0g-O7AzM1Ho4HSWoNJXx2z1prtFdM',
        {
          email: email,
          password: password,
          returnSecureToken: true,
        }
      );

      // Check if the response contains an idToken
      if (authResponse.data.idToken) {
        // Encrypt password and store in local storage
        const encryptedPassword = CryptoJS.AES.encrypt(password, 'your-secret-key').toString();
        localStorage.setItem('encryptedPassword', encryptedPassword);

        // Store the token in local storage (if needed for further API requests)
        localStorage.setItem('token', authResponse.data.idToken);

        // Redirect to dashboard or home page after successful login
        window.location.href = '/profile'; // Redirect to your dashboard or home page
      }
    } catch (error) {
      // Handle error (e.g., show error message)
      console.error(error); // Log error for debugging
      setError('Invalid customer ID or password.'); // Customize based on error type
    }
  };

  return (
    <BackgroundContainer>
      <Container component="main" maxWidth="xs">
        <StyledPaper elevation={6}>
          <Typography variant="h4" align="center" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom>
            Please log in to your account
          </Typography>
          <form onSubmit={handleLogin}>
            <StyledTextField
              variant="outlined"
              required
              fullWidth
              label="Customer ID"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            />
            <StyledTextField
              variant="outlined"
              required
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <StyledError>{error}</StyledError>}
            <StyledButton 
              type="submit" 
              fullWidth 
              variant="contained"
            >
              Log In
            </StyledButton>
            <Box mt={2} style={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Don't have an account? 
                <Button 
                  onClick={() => (window.location.href = '/signup')} 
                  color="primary"
                  style={{ textTransform: 'none', marginLeft: '5px' }} 
                >
                  Sign Up
                </Button>
              </Typography>
            </Box>
          </form>
        </StyledPaper>
      </Container>
    </BackgroundContainer>
  );
};

// Wrap the Login component in the ThemeProvider
const App = () => (
  <ThemeProvider theme={theme}>
    <Login />
  </ThemeProvider>
);

export default App;
