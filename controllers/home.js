exports.getHomePage = (req, res, next) => {
    res.render('home', {
      path: '/home',
      title:'Home'
    });
  };