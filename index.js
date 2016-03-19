"use strict";

var app = require('koa')();
var router = require('koa-router')();
var serve = require('koa-static');
var bodyParser = require('koa-bodyparser');
var logger = require('koa-logger');
var request = require('koa-request');
var _ = require("lodash");

var Firebase = require("firebase");
var firebaseRef = new Firebase("https://nebulis-instagram.firebaseio.com/");

app.use(logger());
app.use(serve(`${__dirname}/public`));
app.use(bodyParser());

let infos = null;
const client_secret = process.env.CLIENT_SECRET;


router.post('/user', function *(next) {
  var id = yield firebaseRef.push({name : this.request.body.name, count: 0, instagram:true, time: new Date().getTime()});
  var data = yield firebaseRef.child(id.key()).once("value");
  this.status = 201;
  this.body = {
    [id.key()] : data.val()
  };
});

router.get('/user', function *(next) {
  var ref = yield firebaseRef.once("value");
  this.status = 200;
  this.body = ref.val();
});

router.put('/user/:id', function *(next) {
  var ref = firebaseRef.child(this.params.id);
  yield ref.update(this.request.body);
  ref = yield ref.once("value");
  this.status = 200;this.body = {
    [ref.key()] : ref.val()
  };
});

app
  .use(router.routes());


router.get("/instagram/followers", function*(next) {
  if(!infos) {
    this.status = 403;
    return;
  }

  var options = {
    url : `https://api.instagram.com/v1/users/self/followed-by?access_token=${infos.access_token}`
  };
  console.log(options.url);

  var response = yield request(options); //Yay, HTTP requests with no callbacks!
  this.body = JSON.parse(response.body);
});

router.post("/login", function*(next) {
  // if already logged, data are stored in infos. just send it back
  if(infos) {
    this.body = infos;
    return;
  }

  // if not logged, code must be provided
  if(!this.request.body.code) {
    this.status = 403;
    return;
  }

  var options = {
    headers: {'content-type' : 'application/x-www-form-urlencoded'},
    method : 'POST',
    url: `https://api.instagram.com/oauth/access_token`,
    body : `client_id=1abd6d7d14cc46d3a65b2c218724f643&client_secret=${client_secret}&grant_type=authorization_code&redirect_uri=http://localhost:3000/&code=${this.request.body.code}`
  };

  var response = yield request(options); //Yay, HTTP requests with no callbacks!
  const tmpInfos = JSON.parse(response.body);
  if(!tmpInfos.code) { // save response only if login is ok
    infos = tmpInfos;
  } else {
    console.log(tmpInfos.code);
    this.status = 403;
    this.body = tmpInfos;
    return;
  }
  console.log(infos);

  this.body = infos;
});



app.listen(process.env.PORT || 3000);