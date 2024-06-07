export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'Not Authorized');
  res.redirect('/auth/signin');
};

export const isSeller = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'vendedor') {
    return next();
  }
  req.flash('error_msg', 'Not Authorized');
  res.redirect('/auth/signin');
};

export const isClient = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'cliente') {
    return next();
  }
  req.flash('error_msg', 'Not Authorized');
  res.redirect('/auth/signin');
};
