// controllers/index.js

var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.render('index');
});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

router.get('/about', function (req, res) {
    res.render('about');
});

router.get('/profile', function (req, res) {
    if (req.isAuthenticated()) {
        res.render('profile');
    }else{
        res.redirect('/login');
    }
});
module.exports = router;