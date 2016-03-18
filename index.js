var app = require('koa')();
var router = require('koa-router')();
var serve = require('koa-static');
var bodyParser = require('koa-bodyparser');
var logger = require('koa-logger');
var _ = require("lodash");

var Firebase = require("firebase");
var firebaseRef = new Firebase("https://nebulis-instagram.firebaseio.com/");


app.use(logger());
app.use(serve(`${__dirname}/public`));
app.use(bodyParser());

router.post('/user', function *(next) {
  var id = yield firebaseRef.push({name : this.request.body.name, count: 0});
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

app.listen(process.env.PORT || 3000);