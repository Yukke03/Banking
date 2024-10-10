import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Grid,
    Paper,
    Modal,
    Box,
} from '@mui/material';
import { 
    AccountBalance, 
    Savings, 
    MonetizationOn, 
    Phone, 
    Email 
} from '@mui/icons-material';

const HomePage = () => {
    const [openAbout, setOpenAbout] = useState(false);
    const [openCustomerCare, setOpenCustomerCare] = useState(false);

    const handleOpenAbout = () => setOpenAbout(true);
    const handleCloseAbout = () => setOpenAbout(false);
    
    const handleOpenCustomerCare = () => setOpenCustomerCare(true);
    const handleCloseCustomerCare = () => setOpenCustomerCare(false);

    // URL for images
    const bannerImageUrl = 'https://i.postimg.cc/v8pbR1C6/Black-Simple-Beautiful-Nature-Email-Header-1.png'; // Replace with your banner image URL
    const bankLogoUrl = 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/800px-FC_Barcelona_%28crest%29.svg.png'; // Replace with your bank logo URL
    const savingsImageUrl = 'https://ternary.co.za/wp-content/uploads/2018/07/180601-F-XX123-0001.jpg';
    const loansImageUrl = 'https://www.advisoryexcellence.com/wp-content/uploads/2022/02/CASH-LOAN-PHOTO.jpg';
    const onlineBankingImageUrl = 'https://th.bing.com/th/id/OIP.XP5o7JysYc-Ofdfj5_oynQHaGX?w=800&h=688&rs=1&pid=ImgDetMain';

    return (
        <div>
            {/* Header */}
            <AppBar position="static" style={{ backgroundColor: '#003366' }}>
                <Toolbar>
                    <img src={bankLogoUrl} alt="Bank Logo" style={{ height: '30px', marginRight: '10px' }} />
                    <Typography variant="h5" style={{ flexGrow: 1 }}>
                        Bank Of Barcelona
                    </Typography>
                    <Button color="inherit" href="/signin">Log In</Button>
                    <Button color="inherit" href="/signup">User Sign Up</Button>
                    <Button color="inherit" href="/admin/login">Admin Login</Button>
                    <Button color="inherit" onClick={handleOpenAbout}>About Us</Button>
                    <Button color="inherit" onClick={handleOpenCustomerCare}>Customer Care</Button>
                </Toolbar>
            </AppBar>

            {/* Banner */}
            <div style={{
                backgroundImage: `url(${bannerImageUrl})`,
                width: 'auto',
                height: '200px',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textAlign: 'center',
                marginBottom: '20px',
            }}>
            </div>

            {/* Welcome Quote */}
            <Typography
                variant="h4"
                style={{
                    margin: '20px 0',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '2.5rem', // Bigger font size
                    color: '#003366',   // Color matching the theme
                }}
            >
                Welcome to BoB - Visca Barca
            </Typography>

            {/* Main Content */}
            <Container style={{ marginTop: '20px' }}>
                <Typography variant="h4" gutterBottom>
                    Our Mission
                </Typography>
                <Typography variant="body1" paragraph>
                    At Bank Of Barcelona, we aim to empower our clients with innovative financial solutions and exceptional customer service. We strive to create lasting relationships based on trust and reliability.
                </Typography>

                <Typography variant="h5" gutterBottom>
                    Our Services
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Paper style={{ padding: '20px', textAlign: 'center' }}>
                            <img src={savingsImageUrl} alt="Savings Accounts" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                            <Typography variant="h6" style={{ marginTop: '10px' }}><Savings /> Savings Accounts</Typography>
                            <Typography variant="body2">Open a savings account with competitive interest rates and flexible terms.</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper style={{ padding: '20px', textAlign: 'center' }}>
                            <img src={loansImageUrl} alt="Loans" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                            <Typography variant="h6" style={{ marginTop: '10px' }}><MonetizationOn /> Loans</Typography>
                            <Typography variant="body2">Flexible loan options for personal, home, and business needs.</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper style={{ padding: '20px', textAlign: 'center' }}>
                            <img src={onlineBankingImageUrl} alt="Online Banking" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                            <Typography variant="h6" style={{ marginTop: '10px' }}><AccountBalance /> Online Banking</Typography>
                            <Typography variant="body2">Manage your accounts, transfer funds, and pay bills securely from anywhere.</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* About Us Modal */}
            <Modal open={openAbout} onClose={handleCloseAbout}>
                <Box sx={{ padding: 4, backgroundColor: 'white', borderRadius: 2, width: 400, margin: 'auto', marginTop: '100px' }}>
                    <Typography variant="h6" gutterBottom>About Us</Typography>
                    <Typography variant="body2">
                        Bank Of Barcelona is dedicated to enhancing the financial well-being of our clients through innovative solutions and superior service.
                        We strive to be your trusted financial partner in every step of your journey.
                    </Typography>
                </Box>
            </Modal>

            {/* Customer Care Modal */}
            <Modal open={openCustomerCare} onClose={handleCloseCustomerCare}>
                <Box sx={{ padding: 4, backgroundColor: 'white', borderRadius: 2, width: 400, margin: 'auto', marginTop: '100px' }}>
                    <Typography variant="h6" gutterBottom>Customer Care</Typography>
                    <Typography variant="body2">
                        For assistance, please contact our customer service team:
                        <br />
                        <Phone /> 1-800-123-4567
                        <br />
                        <Email /> support@bankofbarcelona.com
                    </Typography>
                </Box>
            </Modal>

            {/* Footer */}
            <footer style={{ marginTop: '20px', padding: '15px', textAlign: 'center', background: 'grey' }}>
                <Typography variant="body2">
                    © {new Date().getFullYear()} Bank Of Barcelona. All Rights Reserved.
                </Typography>
                <Typography variant="body2">
                    Follow Us:
                    <br />
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a> | 
                    <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a> | 
                    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
                </Typography>
            </footer>
        </div>
    );
};

export default HomePage;
