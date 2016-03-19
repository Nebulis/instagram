"use strict";

class AppController {
  constructor($http, $window, $location) {
    this.$http = $http;
    this.$window= $window;
    this.$location = $location;
    this.isLogged = false;

    // on login, get code from instagram
    const code = this.$location.absUrl().split("?code=")[1];
    // if code is present, this is a redirection from instagram so we need to perform login
    var promise = null;
    if(code) {
      promise = this.login(code);
    } else { // otherwise perform login
      promise = this.login();
    }
    promise.then(() => this.retrieveFollowersData())
  }

  login(code) {
    var data = {};
    if(code) {
      data.code = code;
    }
    return this.$http.post(`/login`, data).then((response) => {
      this.isLogged = true; // delete code
    })
  }

  retrieveFollowersData() {
    this.$http.get("/instagram/followers").then(response => {
      console.log(response);
    })
  }

  connect() {
    const url = this.$location.absUrl().split("?code=")[0]; // delete code part
    this.$window.location = `https://api.instagram.com/oauth/authorize/?client_id=1abd6d7d14cc46d3a65b2c218724f643&redirect_uri=${url}&response_type=code&scope=public_content+follower_list`;
  }

}

angular.module('app', ["xeditable"])
  .controller('AppController', AppController)
  .filter("myfilter", function() {
    return function(users, val) {
      if(!val)
        return users;
      return _.filter(users, function(user) {
        return user.name.indexOf(val) !== -1;
      })
    }
  })
  .filter("mysort", function() {
    return function(users) {
      return _.chain(users)
        .map(function(user, id) { // save id cause order by delete it
          user.id = id;
          return user;
        })
        .orderBy('time', 'desc')
        .mapKeys(function(value) { // use id as key
          return value.id;
        })
        .value();
    }
  });