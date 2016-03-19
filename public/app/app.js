"use strict";

class AppController {
  constructor($http) {
    this.$http = $http;
    this.users = {};
    $http.get("/user").then(response => {
      this.users = _.map(response.data, (user, id) => {
        user.id = id;
        return user;
      });
      console.log(_.size(this.users));
    })
  }
  save(event) {
    if(event.keyCode === 13 && this.name && !this.loading) {
      this.loading = true;
      this.$http.post("/user", {name : this.name})
        .then(response => {
          var newUser = _.map(response.data, (user, id) => {
            user.id = id;
            return user;
          });
          this.users.push(newUser[0]);
          this.loading = false;
          this.name = "";
        });
    }
  }

  update(id, updatedValues) {
    this.$http.put("/user/"+id, updatedValues)
      .then(response => {
        var newUser = _.map(response.data, (user, id) => {
          user.id = id;
          return user;
        });
        _.remove(this.users, user => user.id === id);
        this.users.push(newUser[0]);
      });
  }

  delete(id) {
    this.$http.delete("/user/"+id)
      .then(response => {
        _.remove(this.users, user => user.id === id);
      });
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
        .orderBy('time', 'desc')
        .value();
    }
  });