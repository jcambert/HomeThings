(function(angular) {
  'use strict';
  
  var diagram=angular.module('diagram',[]);
  diagram.constant('$', window.jQuery);
  
  diagram.controller('DiagramController',['$scope','$compile',function($scope,$compile){
      $scope.addShape = function(){
          alert('add shape');
         var elt = $compile("<shape></shape>")($scope);
          angular.element('#viewport').append(elt);
      }
  }]);
  
  diagram.directive('paperContainer',[function(){
    return {
        restrict:'E',
        replace:true,
        transclude:true,
        template:'<div class="paper-container" ng-transclude></div>'
    };
  }]);
  
  diagram.directive('paperScroller',[function(){
      return{
          restrict:'E',
          replace:true,
          transclude:true,
          template:'<div class="paper-scroller" ng-transclude></div>'
      };
  }]);
  
  
  diagram.directive('paper',[function(){
      return{
          restrict:'E',
          replace:true,
          transclude:true,
          template:'<div class="paper" ng-transclude></div>'
      };
  }]);
  
  diagram.directive('drawingZone',['$log','$',function($log,$){
      return{
          restrict:'E',
          replace:true,
          transclude:true,
          template:'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="v-2" width="1000" height="1000" ><g id="viewport" class="viewport" ng-transclude></g></svg>',
          controller:['$scope',function($scope){}],
          link:function(scope,element,attrs){
              $log.log();
              $(element).children('#viewport').children(  ).each(function(idx){
                  $log.log(this)
                 $(this).draggable() .bind('mousedown', function(event, ui){
                        // bring target to front
                        $(event.target.parentElement).append( event.target );
                    })
                    .bind('drag', function(event, ui){
                        // update coordinates manually, since top/left style props don't work on SVG
                        this.setAttribute('x', ui.position.left);
                        this.setAttribute('y', ui.position.top);
                    });
                   
              });
          }
          
      };
  }]);
  
  diagram.directive('shape',function(){
      return{
          restrict:'E',
          replace:true,
          //require:'^drawingZone',
          templateNamespace:'svg',
          templateUrl: 'app/diagram/simpleshape.html',
          link:function(scope,element,attrs){
              var el = (attrs.targetId != null) ? angular.element(document.getElementById(attrs.targetId)) : element;
          }
      };
  });
  
  diagram.service('util',[function () {
      this.uuid = function() {

            // credit: http://stackoverflow.com/posts/2117523/revisions

            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16|0;
                var v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        };
  }]);
 })(angular,window);