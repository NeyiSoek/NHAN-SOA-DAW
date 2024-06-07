import { Router } from 'express';
import { renderSignupForm, signup, renderSigninForm, signin, logout } from '../controllers/authController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/signup', renderSignupForm);
router.post('/signup', signup);

router.get('/signin', renderSigninForm);
router.post('/signin', signin);

router.get('/logout', logout);

router.get('/profile', isAuthenticated, (req, res) => {
  res.render('profile', { user: req.user });
});

export default router;
