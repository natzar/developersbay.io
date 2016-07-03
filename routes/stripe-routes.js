'use strict';

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('XXXXX');

// middleware
var StripeWebhook = require('stripe-webhook-middleware'),
isAuthenticated = require('./../middleware/auth').isAuthenticated,
isUnauthenticated = require('./../middleware/auth').isUnauthenticated,
setRender = require('middleware-responder').setRender,
setRedirect = require('middleware-responder').setRedirect,
stripeEvents = require('./../middleware/stripe-events'),
secrets = require('./../config/secrets');

// controllers
var users = require('./../controllers/users-controller'),
main = require('./../controllers/main-controller'),
dashboard = require('./../controllers/dashboard-controller'),
passwords = require('./../controllers/passwords-controller'),
registrations = require('./../controllers/registrations-controller'),
sessions = require('./../controllers/sessions-controller');
var Developer = require("../models/developer.js");
var stripeWebhook = new StripeWebhook({
  stripeApiKey: secrets.stripeOptions.apiKey,
  respond: true
});

module.exports = function (app, passport) {

 app.get('/',
    setRedirect({auth: '/dashboard'}),
    isUnauthenticated,
    setRender('app.ejs'),
    main.getHome);

 app.get('/login',
    setRedirect({auth: '/dashboard'}),
    isUnauthenticated,
    setRender('login'),
    main.getHome);
	
  // sessions
  app.post('/login',
    setRedirect({auth: '/dashboard', success: '/dashboard', failure: '/login'}),
    isUnauthenticated,
    sessions.postLogin);
  app.get('/logout',
    setRedirect({auth: '/', success: '/'}),
    isAuthenticated,
    sessions.logout);

  // registrations
  app.get('/signup',
    setRedirect({auth: '/dashboard'}),
    isUnauthenticated,
    setRender('signup'),
    registrations.getSignup);
  app.post('/signup',
    setRedirect({auth: '/dashboard', success: '/billing', failure: '/signup'}),
    isUnauthenticated,
    registrations.postSignup);

  // forgot password
  app.get('/forgot',
    setRedirect({auth: '/dashboard'}),
    isUnauthenticated,
    setRender('forgot'),
    passwords.getForgotPassword);
  app.post('/forgot',
    setRedirect({auth: '/dashboard', success: '/forgot', failure: '/forgot'}),
    isUnauthenticated,
    passwords.postForgotPassword);

  // reset tokens
  app.get('/reset/:token',
    setRedirect({auth: '/dashboard', failure: '/forgot'}),
    isUnauthenticated,
    setRender('reset'),
    passwords.getToken);
  app.post('/reset/:token',
    setRedirect({auth: '/dashboard', success: '/dashboard', failure: 'back'}),
    isUnauthenticated,
    passwords.postToken);

  app.get('/dashboard',
    setRender('dashboard/index'),
    setRedirect({auth: '/'}),
    isAuthenticated,
    dashboard.getDefault);
  app.get('/billing',
    setRender('dashboard/billing'),
    setRedirect({auth: '/'}),
    isAuthenticated,
    dashboard.getBilling);
  app.get('/profile',
    setRender('dashboard/profile'),
    setRedirect({auth: '/'}),
    isAuthenticated,
    dashboard.getProfile);

  // user api stuff
  app.post('/user',
    setRedirect({auth: '/', success: '/profile', failure: '/profile'}),
    isAuthenticated,
    users.postProfile);
  app.post('/user/billing',
    setRedirect({auth: '/', success: '/billing', failure: '/billing'}),
    isAuthenticated,
    users.postBilling);
  app.post('/user/plan',
    setRedirect({auth: '/', success: '/billing', failure: '/billing'}),
    isAuthenticated,
    users.postPlan);
  app.post('/user/password',
    setRedirect({auth: '/', success: '/profile', failure: '/profile'}),
    isAuthenticated,
    passwords.postNewPassword);
  app.post('/user/delete',
    setRedirect({auth: '/', success: '/'}),
    isAuthenticated,
    users.deleteAccount);

  app.post('/sendmessage',function(req,res){	
	var message = {
    "html": req.body.from+" // "+req.body.message,
    "text":req.body.from+" // "+req.body.message,
    "subject": "Contacto a Developer Developersbay",
    "from_email": "web@developersbay.io",
    "from_name":"DevelopersBay",
    "to": [{
            "email": "betolopezayesa@gmail.com",
            "name": "Beto",
            "type": "to"
        }],
    "headers": {
        "Reply-To": req.body.from,
    },
    "important": false
};
var async = true;
var ip_pool = "Main Pool";

mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
    res.json(result);
}, function(e) {
    // Mandrill returns the error as an object with name and message keys
    res.json({error:'A mandrill error occurred: ' + e.name + ' - ' + e.message});
    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
});
});


// STATIC

	app.get('/termsandconditions',function(req,res){
		res.render('static/termsandconditions');
	});
	app.get('/changelog',function(req,res){
		res.render('static/changelog');
	});
	app.get('/roadmap',function(req,res){
		res.render('static/roadmap');
	});

// API urls
	app.get('/api',isAuthenticated, function(req, res) {
		res.json({'error':'No method'});
	});

	app.get('/api/developers',isAuthenticated, function(req, res) {
		 if(req.query['filter']){
        	var XFilter = new RegExp(req.query['filter'],"i");        
			Developer.find({$or:[ {name:XFilter}, {skills:XFilter}, {description:XFilter} ]},function(err,developers){
				if (err) return console.error(err);
				res.json({developers: developers});
			});
  		} else {
    		Developer.find({},function(err,developers){
				if (err) return console.error(err);
				var aux = [];
				developers.forEach(function(dev){
					dev.email = 'PRIVATE';
					aux.push(dev);
				});
				developers = aux;
				res.json({developers: developers});
		});
  		}
	});
	app.get('/api/developers/:id_developer',isAuthenticated, function(req, res) {
		Developer.findOne({_id: req.params.id_developer},function(err,developers){
				if (err) return console.error(err);
				developers.email = 'PRIVATE';
				res.json({developers: developers});
		});
	});

	app.put('/api/developers/:id_developer',isAuthenticated, function(req, res) {
		Developer.update({_id:req.params.id_developer},req.body.developer,function(err){
        if(err){
			console.log("some error happened when update");         
		}else{
			Developer.findOne({_id:req.params.id_developer}, function(err, developer) { 
				res.json({developers: developer});
			});
         }
    	});
    });

	app.post('/api/developers',isAuthenticated,function(req,res){
		aux = new Developer(req.body.developer);
		aux.save();
		res.json(req.body);
	});
	
  // use this url to receive stripe webhook events
  app.post('/events',
    stripeWebhook.middleware,
    stripeEvents
  );
};