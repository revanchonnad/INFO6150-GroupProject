import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    Alert,
    Box,
    Button,
    Divider,
} from '@mui/material';
import { styled } from '@mui/system';

const ListAllAds = () => {
    const [ads, setAds] = useState([]); // Initialize as an empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAds = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('No authentication token found.');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:5001/api/advertiser/ads', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const adsData = response.data?.ads || [];
                setAds(adsData);
                setError(null); // Clear any previous errors
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to fetch ads.');
                console.error('Error fetching ads:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAds();
    }, []);

    // Custom styles for the cards and layout
    const StyledCard = styled(Card)(({ theme }) => ({
        borderRadius: '15px',
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
        background: 'linear-gradient(to top left, #00c6ff, #0072ff)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
        },
        padding: '20px',
        color: '#fff',
    }));

    // Function to handle Accept and Deny actions for re-quoted prices
    const handleQuoteAction = async (adId, action) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found.');
                return;
            }

            const response = await axios.post(
                `http://localhost:5001/api/advertiser/ads/quote-action`,
                { adId, action }, // action will be either 'accept' or 'deny'
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Refresh ads data after action
            setAds((prevAds) =>
                prevAds.map((ad) =>
                    ad._id === adId
                        ? { ...ad, status: action === 'accept' ? 'Accepted' : 'Denied' }
                        : ad
                )
            );
        } catch (error) {
            console.error('Error handling quote action:', error);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ marginTop: '50px', padding: 3 }}>
            <Typography
                variant="h3"
                sx={{
                    fontWeight: 'bold',
                    color: '#0072ff',
                    textAlign: 'center',
                    fontFamily: 'Poppins, sans-serif',
                    marginBottom: '40px',
                }}
            >
                Ads Listings
            </Typography>

            {/* Show loading spinner */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                    <CircularProgress size={80} color="secondary" />
                </Box>
            )}

            {/* Show error message */}
            {error && (
                <Alert severity="error" sx={{ marginTop: '20px', fontSize: '1rem', padding: '10px 20px' }}>
                    {error}
                </Alert>
            )}

            {/* Show list of ads */}
            {!loading && !error && ads.length === 0 && (
                <Typography variant="h6" sx={{ marginTop: '40px', textAlign: 'center', color: '#7D8B8C' }}>
                    No ads found. Please check back later.
                </Typography>
            )}

            <Grid container spacing={4}>
                {ads.map((ad) => (
                    <Grid item xs={12} sm={6} md={4} key={ad._id}>
                        <StyledCard>
                            <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 'bold',
                                        marginBottom: '15px',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    {ad.title}
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: '1rem',
                                        lineHeight: '1.6',
                                        color: '#f1f1f1',
                                        marginBottom: '20px',
                                    }}
                                >
                                    {ad.description}
                                </Typography>

                                <Typography
                                    sx={{
                                        fontWeight: '600',
                                        color: '#e0e0e0',
                                        marginBottom: '10px',
                                    }}
                                >
                                    <strong>Start Date:</strong> {new Date(ad.startDate).toLocaleDateString()}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontWeight: '600',
                                        color: '#e0e0e0',
                                        marginBottom: '10px',
                                    }}
                                >
                                    <strong>End Date:</strong> {new Date(ad.endDate).toLocaleDateString()}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontWeight: '600',
                                        color: '#e0e0e0',
                                        marginBottom: '10px',
                                    }}
                                >
                                    <strong>Budget:</strong> ${ad.budget}
                                </Typography>

                                <Typography
                                    sx={{
                                        fontWeight: 'bold',
                                        color:
                                            ad.status === 'Approved'
                                                ? '#4caf50'
                                                : ad.status === 'Rejected'
                                                ? '#f44336'
                                                : '#ff9800',
                                    }}
                                >
                                    <strong>Status:</strong> {ad.status}
                                </Typography>

                                {/* Admin Requoted Price */}
                                {ad.adminPrice && (
                                    <Typography
                                        sx={{
                                            fontWeight: 'bold',
                                            color: '#ffeb3b',
                                            marginTop: '20px',
                                        }}
                                    >
                                        <strong>Admin Requoted Price:</strong> ${ad.adminPrice}
                                    </Typography>
                                )}

                                {/* Accept or Deny Buttons for Admin */}
                                {ad.status === 'Pending Approval' && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                                        
                                        <Button
                                            sx={{
                                                backgroundColor: '#F44336',
                                                color: '#fff',
                                                '&:hover': {
                                                    backgroundColor: '#D32F2F',
                                                },
                                                padding: '10px 20px',
                                                fontWeight: '600',
                                            }}
                                            onClick={() => handleQuoteAction(ad._id, 'deny')}
                                        >
                                            Deny
                                        </Button>
                                    </Box>
                                )}

                                {/* Additional Information */}
                                <Divider sx={{ marginTop: '20px', backgroundColor: '#fff' }} />
                                <Typography
                                    sx={{
                                        color: '#f1f1f1',
                                        fontWeight: 'bold',
                                        marginTop: '20px',
                                    }}
                                >
                                    Last updated: {new Date(ad.createdAt).toLocaleDateString()}
                                </Typography>
                            </CardContent>
                        </StyledCard>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default ListAllAds;
