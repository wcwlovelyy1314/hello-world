var crypto = require('crypto');
var User = require('../models/user.js');

function checkNotLogin(req, res, next) {
	if (req.session.user) {
		req.flash('error', '已登录');
		res.redirect('back');
	}
	next();
}

function checkLogin(req, res, next) {
	if (!req.session.user) {
		req.flash('error', '未登录');
		res.redirect('/login');
	}
	next();
}
module.exports = function(app) {
	app.get('/', function(req, res) {
		res.render('index', {
			title: '主页',
			user: req.session.user,
			success: req.flash('success'),
			error: req.flash('error')
		});
	});
	app.get('/reg', checkNotLogin);
	app.get('/reg', function(req, res) {
		res.render('reg', {
			title: '注册',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error')
		});
	});

	app.post('/reg', function(req, res) {
		var name = req.body.name;
		var password = req.body.password;
		var password_re = req.body.password_re;
		var email = req.body.email;
		console.log(password, password_re);
		if (password !== password_re) {
			req.flash('error', '两次密码不一致');
			return res.redirect('/reg');
		}
		var md5 = crypto.createHash('md5');
		password = md5.update(password).digest('hex');
		var newUser　 = new User({
			name: name,
			passoword: password,
			email: email
		});
		User.get(newUser.name, function(err, user) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/reg');
			}
			if (user) {
				req.flash('error', '用户已存在');
				return res.redirect('/reg');
			}
			newUser.save(function(err, user) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/reg');
				}
				req.session.user = user;
				req.flash('success', '注册成功');
				return res.redirect('/login');
			});
		});
	});
	app.get('/login', checkNotLogin);
	app.get('/login', function(req, res, next) {
		res.render('login', {
			title: '登录',
			user: req.session.user,
			success: req.flash('success'),
			error: req.flash('error')
		});
	});
	app.post('/login', function(req, res, next) {
		var name = req.body.name;
		var password = req.body.password;
		User.get(name, function(err, user) {
			if (err) {
				req.flash('error', error);
				return res.redirct('/');
			}
			var md5 = crypto.createHash('md5');
			password = md5.update(password).digest('hex');
			if (password !== (user && user.password)) {
				req.flash('error', '用户名或密码错误');
				return res.redirect('/login');
			}
			req.session.user = user;
			req.flash('success', '登录成功');
			return res.redirect('/');
		});
	});
	app.get('/post', checkLogin);
	app.get('/post', function(req, res, next) {
		res.render('post', {
			title: '发表',
			user: req.session.user,
			success: req.flash('success'),
			error: req.flash('error')
		});
	});
	app.post('/post', function(req, res, next) {});
	app.get('/logout', checkLogin);
	app.get('/logout', function(req, res, next) {});
};