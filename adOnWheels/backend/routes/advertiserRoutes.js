const express = require('express');
const {
    createAd,
    getAllAds,
    getAdById,
    getProposals,
    updateProposal,
} = require('../controllers/advertiserController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Protected routes
router.post('/ads', authMiddleware, roleMiddleware('Advertiser'), createAd);
router.get('/ads', authMiddleware, roleMiddleware('Advertiser'), getAllAds);
router.get('/ads/:adId', authMiddleware, roleMiddleware('Advertiser'), getAdById);
router.get('/proposals', authMiddleware, roleMiddleware('Advertiser'), getProposals);
router.patch('/proposals/:proposalId', authMiddleware, roleMiddleware('Advertiser'), updateProposal);

module.exports = router;
