import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { pool } from '../index.js';
import bcrypt from 'bcryptjs';

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, async (username, password, done) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
      const user = rows[0];
      const validPassword = await bcrypt.compare(password, user.password);
      if (validPassword) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password' });
      }
    } else {
      return done(null, false, { message: 'No user with that username' });
    }
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err);
  }
});
