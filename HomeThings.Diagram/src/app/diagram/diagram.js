(function(angular) {
  'use strict';
  
  
  var diagram=angular.module('diagram',[]);
  diagram.constant('$', window.jQuery);
  
  diagram.controller('DiagramController',['$scope','$compile',function($scope,$compile){
      $scope.addShape = function(){
          //alert('add shape');
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
          template:'<div class="paper" ng-transclude></div>',
          controller:['$scope','$log',function($scope,$log){
              $scope.selected=undefined;
              this.selected = function(element){
                  $log.log('element selected');
                  $log.log(element);
                  $scope.selected = element;
                  $scope.$apply();
              }
              
              $scope.$watch('selected',function(newVal,oldVal){
                  if(newVal!=oldVal){
                        $scope.$broadcast('selectedChanged',{"val":newVal});
                        $log.log('broadcast');
                  }
              })
          }],
          link:function($scope,$element,$attrs){
              
          }
      };
  }]);
  
  diagram.directive('drawingZone',['$log','$',function($log,$){
      return{
          restrict:'E',
          replace:true,
          transclude:true,
          require:'^paper',
          template:'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="v-2" width="1000" height="1000" ><g id="viewport" class="viewport" ng-transclude></g></svg>',
          controller:['$scope','$log',function($scope,$log){
              
          }],
          link:function(scope,element,attrs,parentCtrl){
              
          }
          
      };
  }]);
  
  diagram.directive('transformZone',['util','$log','$',function($util,$log,$){
      return {
        restrict:'E',
        replace:true,
        templateUrl:'app/diagram/transformzone.directive.html',
        require:'^paper',
        controller:['$scope',function($scope){
            
        }],
        link:function($scope,$element,$attrs,parentCtrl){
            $scope.selected = undefined;
            $scope.$parent.$watch('selected',function(){
                $log.log('selected has changed');
                $log.log($scope.$parent.selected);
                $scope.selected=$scope.$parent.selected;
                
                var transformAttr = $($scope.selected).attr('transform') || '';
                var transform= $util.parseTransformString( transformAttr);
                
                
                $log.log(transform);
                
            });
            
            $scope.hasSelected = function(){
                return $scope.selected!=undefined;
            }
        }  
      };
  }])
  
  diagram.directive('shape',['$log',function($log){
      return{
          restrict:'E',
          replace:true,
          require:'^drawingZone',
          templateNamespace:'svg',
          templateUrl: 'app/diagram/simpleshape.html',
          link:function(scope,element,attrs,parentCtrl){
              $log.log(attrs);
              if(attrs['draggable'])
                element.on('mousedown',function(event){
                    parentCtrl.selected(element);
                });
              var el = (attrs.targetId != null) ? angular.element(document.getElementById(attrs.targetId)) : element;
          }
      };
  }]);
  
  diagram.directive('draggable',['util','$document','$log',function($util,$document,$log){
      return{
          restrict:'A',
          require:'^paper',
          controller:['$scope',function($scope){}],
          link:function($scope,$element,$attrs,parentCtrl){
                var transformAttr = $attrs['transform'] || '';
                var transform= $util.parseTransformString( transformAttr);
                
                var startX = 0, startY = 0, x = transform.translate.tx, y = transform.translate.ty;
                
                $element.on('mousedown', function(event) {
                    // Prevent default dragging of selected content
                    event.preventDefault();
                    startX = event.pageX - x;
                    startY = event.pageY - y;
                    $document.on('mousemove', mousemove);
                    $document.on('mouseup', mouseup);
                    
                    parentCtrl.selected($element);
                });
                
                
                function mousemove(event) {
                    y = event.pageY - startY;
                    x = event.pageX - startX;
                    $element.css({
                        transform: 'translate('+x+'px,'+y+'px)',
                        WebkitTransform: 'translate('+x+'px,'+y+'px)'
                    });
                    //console.log($element.css('transform'));
                }

                function mouseup() {
                    $document.off('mousemove', mousemove);
                    $document.off('mouseup', mouseup);
                }
          }
      };
    
  }]);
  
  
  diagram.directive('rotable',[function(){
      return function($scope,$element,$attrs){
          
      }
      
  }]);
  
  diagram.directive('scalable',[function(){
      return function($scope,$element,$attrs){
          
      }
  }]);
  
  diagram.service('util',[function () {
      this.uuid = function() {

            // credit: http://stackoverflow.com/posts/2117523/revisions

            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16|0;
                var v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        };
        
        
       this.parseTransformString =function (transform) {
            var translate,
                rotate,
                scale;

            if (transform) {

                var separator = /[ ,]+/;

                var translateMatch = transform.match(/translate\((.*)\)/);
                if (translateMatch) {
                    translate = translateMatch[1].split(separator);
                }
                var rotateMatch = transform.match(/rotate\((.*)\)/);
                if (rotateMatch) {
                    rotate = rotateMatch[1].split(separator);
                }
                var scaleMatch = transform.match(/scale\((.*)\)/);
                if (scaleMatch) {
                    scale = scaleMatch[1].split(separator);
                }
            }

            var sx = (scale && scale[0]) ? parseFloat(scale[0]) : 1;

            return {
                translate: {
                    tx: (translate && translate[0]) ? parseInt(translate[0], 10) : 0,
                    ty: (translate && translate[1]) ? parseInt(translate[1], 10) : 0
                },
                rotate: {
                    angle: (rotate && rotate[0]) ? parseInt(rotate[0], 10) : 0,
                    cx: (rotate && rotate[1]) ? parseInt(rotate[1], 10) : undefined,
                    cy: (rotate && rotate[2]) ? parseInt(rotate[2], 10) : undefined
                },
                scale: {
                    sx: sx,
                    sy: (scale && scale[1]) ? parseFloat(scale[1]) : sx
                }
            };
        }
  }]);
 })(angular,window);