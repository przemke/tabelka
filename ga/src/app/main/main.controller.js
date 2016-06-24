(function() {
  'use strict';

  angular
    .module('ga')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($scope, $http, $log) {
    $scope.pattern = "";
    $scope.activePage = 0;

    $scope.getNumber = function(number) {
      return new Array(number);
    };

    $scope.filterRecords = function(input, sortMethod) {
      $http.get('http://localhost:8080/api/people', {
        params: {
          pattern: input.toLowerCase(),
          sort: sortMethod
        }
      }).then(function(data) {
        $scope.people = data.data.people;
        $scope.pages = data.data.pageCount;
        $scope.activePage = 0;
        $log.log(data);
      }, function(data) {
        $log.log('error: ' + data);
      });
    };

    $scope.getPage = function(selectedPage) {
      //zamiana stron, kliknięcie na aktywną stronę pomijane
      if (selectedPage -1 != $scope.activePage) {
        $http.get('http://localhost:8080/api/page', {
          params: {
            page: selectedPage
          }
        }).then(function(data) {
          $scope.people = data.data;
          $log.log(data);
          $scope.activePage = selectedPage - 1;
        }, function(data) {
          $log.log('error: ' + data);
        });
      }
    };

    $scope.filterRecords($scope.pattern, 'byLastName');
  }
})();
