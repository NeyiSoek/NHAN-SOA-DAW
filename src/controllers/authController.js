import bcrypt from 'bcryptjs';
import passport from 'passport';
import { pool } from '../index.js';

// Renderizar el formulario de registro
export const renderSignupForm = (req, res) => {
  res.render('auth/signup');
};

// Manejar el registro de usuarios
export const signup = async (req, res) => {
  const { username, password, fullname, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await pool.query('INSERT INTO users (username, password, fullname, role) VALUES (?, ?, ?, ?)', [username, hashedPassword, fullname, role]);
  req.flash('success_msg', 'You are now registered and can log in');
  res.redirect('/auth/signin');
};

// Renderizar el formulario de inicio de sesión
export const renderSigninForm = (req, res) => {
  res.render('auth/signin');
};

// Manejar el inicio de sesión de usuarios
export const signin = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('error_msg', info.message);
      return res.redirect('/auth/signin');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      if (user.role === 'vendedor') {
        return res.redirect('/auth/profile');
      } else {
        return res.redirect('/client/products');
      }
    });
  })(req, res, next);
};

// Cerrar sesión de usuario
export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/auth/signin');
  });
};

// Renderizar la vista de perfil
export const renderProfile = (req, res) => {
  res.render('profile', { user: req.user });
};
