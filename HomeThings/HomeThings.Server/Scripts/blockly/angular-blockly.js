(function (window, document, Blockly, _) {
    'use strict';
    var angular = window.angular;
    if (angular == undefined) throw "Angular must be declared before angular-blockly";
    if (Blockly == undefined) throw "Blockly must be declared before angular-blockly";
    if (window.$ == undefined) throw "jquery must be declared before angular-blockly";
    if (_ == undefined) throw "Ladash must be declared before angular-blockly"
    var ab = angular.module('ngBlockly', ['xml']);

    ab.constant('$', window.$);
    ab.constant('_', _);
    ab.service('BlocklyToolboxApi', ['$resource', 'blockly', function ($resource, blockly) {
        console.dir(blockly.getApiEndPoint());
        var res = blockly.getApiEndPoint() + 'blocklytoolbox/:action/:id/';
        console.dir(res);
        return $resource(res, { id: '@_id' }, {
            update: {
                method: 'PUT'
            },

            delete: {
                method: 'DELETE'
            },
            get: {
                method: 'GET'
            },
            defaulttoolbox: {
                method: 'GET',
                params: {
                    action: 'defaulttoolbox'
                }
            }
        });
    }]);


    ab.provider("blockly", function () {
        this.options = {
            path: "assets/",
            trashcan: true,
            toolbox: ' <xml id="blocklyToolbox" style="display: none"><category></category></xml>'
        };
        this.apiEndPoint = "";
        this.scripts = ['blockly/blocks/blockly/array.js'];

        this.$get = function () {
            var localOptions = this.options;
            var localEndPoint = this.apiEndPoint;
            var localScripts = this.scripts;
            return {
                getOptions: function () {
                    return localOptions;
                },
                getApiEndPoint: function () {
                    return localEndPoint;
                },
                getScripts: function () {
                    return localScripts;
                }

            };
        };

        this.setOptions = function (options) {
            //this.options = options;
            angular.extend(this.options, options)
        };

        this.setEndPoint = function (endpoint) {
            console.dir(endpoint);
            this.apiEndPoint = endpoint;
        }

    });

    ab.service('blocklySvc', ['$', '$timeout', '$log', '$rootScope', function ($, $timeout, $log, $rootScope) {
        'use strict';
        var self = this;
        self.holdoffChanges = false;
        self.worspace = undefined;
        self.defaultToolbox = '';
        self.setWorkspace = function (workspace) {
            /*if (Blockly.getMainWorkspace() != null && Blockly.getMainWorkspace().topBlocks_.length != 0) {
                Blockly.getMainWorkspace().clear();
            }
            Blockly.Json.setWorkspace(Blockly.getMainWorkspace(), workspace);*/
            self.workspace = workspace;

            // Blockly sends an immediate change - we want to filter this out
            self.holdoffChanges = true;
            $timeout(function () {
                self.holdoffChanges = false;
            }, 500);

            self.workspace.addChangeListener(function (event) {
                switch (event.type) {
                    case Blockly.Events.CHANGE: $rootScope.$broadcast('blocklyWorkspaceChange', { event: event, workspace: self.workspace }); break;
                    case Blockly.Events.CREATE: $rootScope.$broadcast('blocklyWorkspaceCreate', { event: event, workspace: self.workspace }); break;
                    case Blockly.Events.DELETE: $rootScope.$broadcast('blocklyWorkspaceDelete', { event: event, workspace: self.workspace }); break;
                    default:

                }
                $rootScope.$broadcast('blocklyWorkspaceEvent', { event: event, workspace: self.workspace });
            });
        };

        self.clearWorkspace = function () {
            /* if (Blockly.getMainWorkspace() != null && Blockly.getMainWorkspace().topBlocks_.length != 0) {
                 Blockly.getMainWorkspace().clear();
             }*/
            if (self.workspace == undefined) return;
            self.workspace.clear();
        };

        self.getWorkspace = function () {
            //return Blockly.Json.getWorkspace(Blockly.getMainWorkspace());
            return self.workspace;
        };

        self.setToolbox = function (toolbox) {
            //return Blockly.Json.getWorkspace(Blockly.getMainWorkspace());
            //if (self.workspace == undefined) return;
            //if(toolbox)
            // $log.log(toolbox);
            self.workspace.updateToolbox(toolbox);
        };

        self.setDefaultToolbox = function (toolbox) {
            self.defaultToolbox = toolbox
        };

        self.useDefaultToolbox = function () {
            self.setToolbox(self.defaultToolbox);
        };

        self.activeToolboxCategories = function (categories) {
            var xmlDoc = $.parseXML(self.defaultToolbox),
            $xml = $(xmlDoc);
            //var $xml = $(self.defaultToolbox);
            //$log.log(self.defaultToolbox);
            //$log.log($xml);
            var $tb = $($.parseXML('<xml id="blocklyToolbox" style="display: none"></xml>'));
            var s = "";

            categories.forEach(function (category) {
                $log.log('Try active ' + category + ' toolbox');
                var cat = $xml.find('category[name="' + category + '"]');
                $log.log(cat.html());
                s += cat.html();
            });
            self.setToolbox('<xml id="blocklyToolbox" style="display: none">' + s + '</xml>');
        };


        /*self.onChange = function (callback) {
            $(Blockly.mainWorkspace.getCanvas()).bind("blocklyWorkspaceChange", function () {
                if (me.holdoffChanges === false) {
                    // Send a notification
                    callback(Blockly.Json.getWorkspace(Blockly.getMainWorkspace()));
                }
            })
        };*/
    }]);

    ab.directive('ngBlockly', ['$document', '$window', '$timeout', '$rootScope', 'blockly', 'blocklySvc', '$log', '$', function ($document, $window, $timeout, $rootScope, blockly, blocklySvc, $log, $) {
        return {
            restrict: 'E',
            replace: true,
            scope: { // Isolate scope
            },
            controller: 'blocklyCtrl',
            //template: '<div id="blocklyArea"  style="height:100%"><div id="blocklyDiv" style="height: 480px; width: 1200px;" class="ng-blockly"></div></div>',
            templateUrl: 'partials/blockly.directive.html',
            link: function ($scope, $element, attrs) {

                var options = blockly.getOptions();


                var blocklyArea = $element;
                var blocklyDiv = $element.children()[0];

                var workspace = Blockly.inject(blocklyDiv, options);

                blocklySvc.setWorkspace(workspace);

                var onresize = function (e) {

                    // Compute the absolute coordinates and dimensions of blocklyArea.
                    var element = $("#blocklyArea").parent();// blocklyArea;

                    var x = 0;
                    var y = 0;
                    //  do {
                    x += element.offsetLeft;
                    y += element.offsetTop;
                    //element = element.offsetParent;
                    // } while (element);
                    // Position blocklyDiv over blocklyArea.
                    blocklyDiv.style.left = x + 'px';
                    blocklyDiv.style.top = y + 'px';
                    blocklyDiv.style.width = element.width() + 'px';
                    blocklyDiv.style.height = element.height() + 'px';

                };
                window.addEventListener('resize', onresize, false);
                onresize();

            }

        };
    }]);

    ab.controller('blocklyCtrl', ['$scope', '$log', '$http', 'blocklySvc', 'BlocklyToolboxApi', function ($scope, $log, $http, $blockly, $api) {


        $http({
            method: 'GET',
            url: 'http://192.168.0.11:8888/resources/toolbox_demo.xml'
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            //$log.log(response.data);
            $blockly.setDefaultToolbox(response.data);
            //$blockly.activeToolboxCategories(['Core']);
            $blockly.useDefaultToolbox();
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }]);
    ab.directive('ngBlocklyCode', [function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                lang: '@',
                //code:'=',
            },
            template: '<textarea id="blocklyCode" ng-model="code"></textarea>',
            controller: ['$log', '$rootScope', '$scope', 'blocklySvc',function ($log, $rootScope, $scope, blocklySvc) {
                var self = this;
                
                $scope.code =$scope.lang;
               
                $scope.lang = $scope.lang.toLowerCase(); 
                switch ($scope.lang) {
                    case "javascript": self.generator = Blockly.JavaScript; break;
                    default:

                }
                $scope.$on('blocklyWorkspaceEvent', function (event, args) {
                    //alert('blockly workspace create');
                    //$log.log(event);
                    //$log.log(args);
                    generateCode(args.workspace);
                });

                function generateCode(workspace) {
                    $log.log('generate '+$scope.lang + ' code');
                    $scope.code = self.generator.workspaceToCode(workspace);
                    $log.log($scope.code);
                    $scope.$apply();
                }
            }]
        };
    }]);
})(window, document, Blockly, _);