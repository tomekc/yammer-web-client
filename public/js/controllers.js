'use strict';

/* Controllers */

function AppCtrl($scope, $http) {
  $http({method: 'GET', url: '/api/name'}).
  success(function(data, status, headers, config) {
    $scope.name = data.name;
  }).
  error(function(data, status, headers, config) {
    $scope.name = 'Error!'
  });
}


function FeedController($scope, $http) {
    $scope.foo = 'bar';

    var token = window.location.hash.split('=');
    console.log(token);

    if (token[0] === '#access_token') {
        $http.get('/api/feed?token='+token[1]).success(function (data,status,header) {
            $scope.feed = data.updates;
        });
    } else {
        $http.get('/api/feed').success(function (data,status,header) {
            $scope.feed = data.updates;
        });
    }


}

function LoginCtrl($scope, $http) {

}

function MyCtrl1() {



}
MyCtrl1.$inject = [];


function MyCtrl2() {
}
MyCtrl2.$inject = [];
