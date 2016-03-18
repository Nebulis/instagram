"use strict";

class AppController {
  constructor($http) {
    this.$http = $http;
    this.users = {};
    $http.get("/user").then(response => {
      this.users = response.data
    })
  }
  save(event) {
    if(event.keyCode === 13 && this.name) {
      this.loading = true;
      this.$http.post("/user", {name : this.name})
        .then(response => {
          _.assign(this.users, response.data);
          this.loading = false;
          this.name = "";
        });
    }
  }

  update(id, updatedValues) {
    this.$http.put("/user/"+id, updatedValues)
      .then(response => {
        _.assign(this.users, response.data);
      });
  }
}

angular.module('app', [])
  .controller('AppController', AppController)
  .filter("myfilter", function() {
    return function(users, val) {
      if(!val)
        return users;
      return _.filter(users, function(user) {
        return user.name.indexOf(val) !== -1;
      })
    }
  });