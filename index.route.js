const express = require('express');
const userRoutes = require('./server/user.backup/user.route');
const ds160Routes = require('./server/ds-160/ds-160.route');
const authRoutes = require('./server/auth/auth.route');
const assetRoutes = require('./server/assets/assets.route');
const checkoutRoutes = require('./server/checkout/checkout.route');
const counterRoutes = require('./server/counter/counter.route');
const mailRoutes = require('./server/mail/mail.route');
const sandboxRoutes = require('./server/sandbox/sandbox.route');

const router = express.Router(); // eslint-disable-line new-cap

// TODO: use glob to match *.route files

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

// mount user routes at /users
router.use('/users', userRoutes);

// mount ds-160 routes at /users
router.use('/ds-160', ds160Routes);

// mount auth routes at /auth
router.use('/auth', authRoutes);

// mount assets routes at /assets
router.use('/assets', assetRoutes);

// mount counter routes at /counter
router.use('/counter', counterRoutes);

// mount mail routes at /counter
router.use('/mail', mailRoutes);

// mount sandbox routes at /sandbox
router.use('/sandbox', sandboxRoutes);

// mount checkout routes at /checkout
// router.use('/checkout', checkoutRoutes);

module.exports = router;
