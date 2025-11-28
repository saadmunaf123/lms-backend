const express = require('express');
const {
  providerSignup,
  providerLogin,
  getAllProviders,
  getProviderById,
  deleteProvider,
  getMyProfile
} = require('../controllers/providerAuthController');

const router = express.Router();
const { protect } = require('../authMiddleware');

// Public routes
router.post('/signup', providerSignup);
router.post('/login', providerLogin);
router.get('/all', getAllProviders);

// Protected provider self-profile
router.get("/me", protect, getMyProfile);

// Dynamic routes (should come last)
router.get('/:id', getProviderById);
router.delete('/delete/:id', deleteProvider);

module.exports = router;
