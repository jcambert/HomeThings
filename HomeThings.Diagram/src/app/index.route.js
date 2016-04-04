(function() {
  'use strict';

  angular
    .module('homeThingsDiagram')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'main'
      })
      .state('diagram',{
          url:'/diagram',
          templateUrl:'app/diagram/diagram.html',
          controller:'DiagramController'
      })
      ;

    $urlRouterProvider.otherwise('/diagram');
  }

})();
