(function (window, _) {
    'use strict';
    if (window.angular == undefined) throw "angular must be declared before homethings";
    if (window.$ == undefined) throw "jquery must be declared before homethings";

    var angular = window.angular;
    var app = window.app = angular.module('homeThingsApplication', ['homethingsUtil','ngAnimate', 'ngCookies', 'ngTable', 'ngResource', 'ui.bootstrap', 'ui.router', 'pascalprecht.translate', 'toggle-switch','ngBlockly']);
    
    app.constant('$', window.$);
    app.constant('_', _);
 
    app.constant('HubName', 'HomeThings');

    app.constant('LOCALES', {
        'locales': {
            // 'ru_RU': 'Русский',
            'fr_FR': 'Francais'
        },
        'preferredLocale': 'fr_FR'
    });

    app.constant('EndPoints', (function () {
        var partial_dir = 'http://192.168.0.11:8888/api/';// 'http://192.168.0.11:8081/api/';

        return {
            BASE_DIR: partial_dir,
            THINGS: partial_dir + 'things',
            SETTINGS: partial_dir + 'settings',
            INPUTS: partial_dir + 'inputs'
        }
    })());

    app.constant('Partials', (function () {
        var partial_dir = 'partials/';
        var ext = '.partial.html';
        return {
            BASE_DIR: partial_dir,
            DASHBOARD: partial_dir + 'dashboard'+ext,
            HOME: partial_dir + 'home'+ext,
            ADD_THING: partial_dir + 'add.things'+ext,
            UPDATE_SETTINGS: partial_dir + 'settings' + ext,
            THINGS: partial_dir + 'things' + ext,
            INPUTS: partial_dir + 'inputs' + ext,
            OUTPUTS: partial_dir + 'outputs' + ext,
            BLOCKLY: partial_dir + 'blockly'+ext
        }
    })());

    app.config(['$stateProvider', '$urlRouterProvider', '$logProvider', '$translateProvider','Partials','blocklyProvider','EndPoints', function ($stateProvider, $urlRouterProvider, $log, $translateProvider,$partials,$blockly,$endPoints) {
        $log.debugEnabled(true);

        /* Translation*/
        $translateProvider.useMissingTranslationHandlerLog();
        $translateProvider.useStaticFilesLoader({
            //prefix: 'resources/locale-',// path to translations files
            prefix: 'Locale/locale-',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('fr_FR');
        $translateProvider.useLocalStorage();
        /* End Translation */

        /* Route */
        $urlRouterProvider.otherwise("/things");
        $stateProvider
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: $partials.HOME
            })
            .state('things', {
                url: '/things',
                templateUrl: $partials.THINGS
            })
            .state('inputs', {
                url: '/inputs',
                templateUrl: $partials.INPUTS
            })
            .state('outputs', {
                url: '/outputs',
                templateUrl: $partials.OUTPUTS
            })
            .state('blockly', {
                url: '/blockly',
                templateUrl: $partials.BLOCKLY
            })
        ;
        /* End Reoute */

        /* Blockly */
        $blockly.setOptions({
            path: "../blockly/",
            trashcan: true,
            //toolbox:  document.getElementById('blocklyToolbox'),
            grid:
             {
                 spacing: 20,
                 length: 3,
                 colour: '#ccc',
                 snap: true
             },
            zoom:
             {
                 controls: true,
                 wheel: true,
                 startScale: 1.0,
                 maxScale: 3,
                 minScale: 0.3,
                 scaleSpeed: 1.2
             },
        });
        $blockly.setEndPoint($endPoints.BASE_DIR);
        /* End Blockly */
        console.info('HommeThings application is configured');
    }]);

    app.run(['$log', function ($log) {
        $log.log('HomeThings application is running');
        
    }]);


  
    app.service('Things', ['$rootScope', 'Hub','HubName', '$timeout', '$log', function ($rootScope, Hub,HubName, $timeout, $log) {
        //declaring the hub connection
        var hub = new Hub(HubName, {
            useSharedConnection:true,
            //client side methods
           /* listeners: {
                'lockEmployee': function (id) {
                    var employee = find(id);
                    employee.Locked = true;
                    $rootScope.$apply();
                },
                'unlockEmployee': function (id) {
                    var employee = find(id);
                    employee.Locked = false;
                    $rootScope.$apply();
                }
            },*/

            //server side methods
           // methods: ['deleteThing'],

            //query params sent on initial connection
           /* queryParams: {
                'token': 'exampletoken'
            },*/

            //handle connection error
            errorHandler: function (error) {
                console.error(error);
            },

            //specify a non default root
            //rootPath: '/api

            stateChanged: function (state) {
                switch (state.newState) {
                    case $.signalR.connectionState.connecting:
                        $log.log(HubName + ' connecting');
                        //your code here
                        break;
                    case $.signalR.connectionState.connected:
                        $log.log(HubName + ' connected');
                        this.connected = true;
                        //your code here
                        break;
                    case $.signalR.connectionState.reconnecting:
                        $log.log(HubName + ' reconnecting');
                        //your code here
                        break;
                    case $.signalR.connectionState.disconnected:
                        $log.log(HubName + ' disconnecting');
                        //your code here
                        connected = false;
                        break;
                }
            }
        });

        
        /*var edit = function (employee) {
            hub.lock(employee.Id); //Calling a server method
        };
        var done = function (employee) {
            hub.unlock(employee.Id); //Calling a server method
        }*/
        var hubStart = function (init) {
            return hub.connect().done(init);
        };

        var updateStatus = function () {
            hub.invoke('UpdateStatus');
        };

        var isConnected = function () {
            return hub.connected;
        }
        return {
            on: hub.on,
            start: hubStart,
            updateStatus: updateStatus,
            isConnected:isConnected
            /*editEmployee: edit,
            doneWithEmployee: done*/
        };
    }]);

    app.service('ThingsApi', ['$resource', 'EndPoints', function ($resource, $end) {
        return $resource($end.THINGS + '/:action/:id/', { id: '@_id' }, {
            update: {
                method: 'PUT'
            },
            first: {
                method: 'GET',
                params: {
                    action: 'First'
                }
            },
            last: {
                method: 'GET',
                params: {
                    action: 'Last'
                }
            },
            next: {
                method: 'GET',
                params: {
                    action: 'Next',
                }
            },
            previous: {
                method: 'GET',
                params: {
                    action: 'Previous',
                }
            },
            delete:{
                method:'DELETE'
            },
            get: {
                method: 'GET',

            }
        });
    }]);

    app.service('SettingsApi', ['$resource', 'EndPoints', function ($resource, $end) {
        return $resource($end.SETTINGS + '/:action/:id/', { id: '@_id' }, {
            update: {
                method: 'PUT'
            },
           
            delete: {
                method: 'DELETE'
            },
            get: {
                method: 'GET',
            }
        });
    }]);

    app.service('InputApi', ['$resource', 'EndPoints', function ($resource, $end) {
        return $resource($end.INPUTS+ '/:action/:id/', { id: '@_id' }, {
            update: {
                method: 'PUT'
            },

            delete: {
                method: 'DELETE'
            },
            get: {
                method: 'GET',
            }
        });
    }]);

    app.directive('dashboard', ['Partials', function ($partials) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: $partials.DASHBOARD
        }
    }]);
    app.directive('wSidebar', ['$log', '$timeout', function ($log, $timeout) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            $scope: {

            },
            controller: function ($scope) { },
            template: '<div id="sidebar-menu" class="main_menu_side hidden-print main_menu"><w-menu-section ng-repeat="section in menuSections" ng-transclude><h3>{{section.title}}</h3>' +
            '<ul class="nav side-menu"><li ng-repeat="menu in section.menus"><a tooltip-placement="right" uib-tooltip="{{menu.tooltip | translate}}"><i class="fa fa-{{menu.icon}}"></i>{{menu.text}}<span class="fa fa-chevron-down"></span></a><w-menu-item ></w-menu-item></li></ul></w-menu-section></div>',
            link: function ($scope, $element, $attrs) {
                $timeout(function () {

                    $element.find('li ul').slideUp();
                    $element.find('li').removeClass('active');

                    $element.find('li').on('click touchstart', function () {
                        var link = $('a', this).attr('href');

                        if (link) {
                            window.location.href = link;
                        } else {
                            if ($(this).is('.active')) {
                                $(this).removeClass('active');
                                $('ul', this).slideUp();
                            } else {
                                $('#sidebar-menu li').removeClass('active');
                                $('#sidebar-menu li ul').slideUp();

                                $(this).addClass('active');
                                $('ul', this).slideDown();
                            }
                        }
                    });

                    $log.log('Sidebar Menu is ready');
                });

            }
        };
    }]);

    app.directive('wMenuSection', [function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            require: '^wSidebarMenu',
            controller: function ($scope) { },
            template: '<div class="menu_section" ng-transclude></div>'
        };
    }]);

    app.directive('wMenuItem', [function () {
        return {
            restrict: 'E',
            replace: true,
            require: '^wMenuSection',
            controller: function ($scope) {

            },
            template: '<ul class="nav" ng-class="{\'child_menu\': menu.childs && menu.childs.length>0}"><li ng-repeat="child in menu.childs"><w-menu-subitem "></w-menu-subitem></li></ul>',


        };
    }]);

    app.directive('wMenuSubitem', ['$log', '$compile', function ($log, $compile) {
        return {
            restrict: 'E',
            replace: true,
            require: '^wMenuItem',

            link: function ($scope, $element, $attrs) {
                var elt = angular.element('<a uib-tooltip="{{child.tooltip| translate}}" tooltip-placement="right">{{child.text | translate}}<span ng-if="child.label" class="label label-{{child.label.variation}} pull-right">{{child.label.text}}</span></a>');
                if (angular.isDefined($scope.child.state) && $scope.child.state !== "")
                    elt.attr('ui-sref', $scope.child.state);
                if (angular.isDefined($scope.child.link) && $scope.child.link !== "")
                    elt.attr('ng-href', $scope.child.link);


                var c = $compile(elt)($scope);

                $element.replaceWith(c);
            }

        };
    }]);

    app.directive('wSidebarFooter', [function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template: '<div class="sidebar-footer hidden-small" ng-transclude></div>',
            controller: function ($scope) { },
            link: function ($scope, $element, $attrs) { }
        };
    }]);

    app.directive('wSidebarFooterItem', ['$compile', function ($compile) {
        return {
            restrict: 'E',
            replace: true,
            require: '^wSidebarFooter',
            scope: {
                title: '@',
                icon: '@'
            },
            controller: function ($scope) { },
            link: function ($scope, $element, $attrs) {
                var elt = angular.element('<a tooltip-placement="top" uib-tooltip="{{ title | translate }}"><span class="glyphicon glyphicon-{{icon}}" aria-hidden="true"></span></a>');
                $scope.title = $attrs.title;
                $scope.icon = $attrs.icon;
                var c = $compile(elt)($scope);
                $element.replaceWith(c);
            }

        };
    }]);


    app.directive('wTopbar', [function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template: '<div class="top_nav"><div class="nav_menu"><nav class="" role="navigation"><div class="nav toggle"><w-fa-bars  tooltip-placement="right" uib-tooltip="{{\'toggle-menu-tooltip\' | translate}}"></w-fa-bars></div><ul class="nav navbar-nav navbar-right" ng-transclude></ul></nav></div></div>',
        };
    }]);

    app.directive('wFaBars', ['$log', '$document', function ($log, $document) {
        return {
            restrict: 'E',
            replace: true,
            template: '<a id="menu_toggle"><i class="fa fa-bars"></i></a>',
            link: function ($scope, $element, $attrs) {
                $element.on('click', function () {
                    var body = $document.find("body");

                    if (body.hasClass('nav-md')) {
                        body.removeClass('nav-md').addClass('nav-sm');
                        body.find('.left_col').removeClass('scroll-view').removeAttr('style');
                        body.find('.sidebar-footer').hide();

                        if (body.find('#sidebar-menu li').hasClass('active')) {
                            body.find('#sidebar-menu li.active').addClass('active-sm').removeClass('active');
                        }
                    } else {
                        body.removeClass('nav-sm').addClass('nav-md');
                        body.find('.sidebar-footer').show();

                        if (body.find('#sidebar-menu li').hasClass('active-sm')) {
                            body.find('#sidebar-menu li.active-sm').addClass('active').removeClass('active-sm');
                        }
                    }
                })


            }
        }
    }]);

    app.directive('wTopbarDropdown', [function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template: '<li class="" uib-dropdown ng-transclude></li>'
        };
    }]);

    app.directive('divider', ['$log', function ($log) {
        return {
            restrict: 'A',
            replace: true,
            link: function ($scope, $element, $attrs) {
                $log.log($element);
                var elt = angular.element('<li class="divider"></li>');
                $element.after(elt);

            }
        };
    }]);

    app.directive('wTopbarDropdownHeader', [function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template: '<a uib-dropdown-toggle ng-transclude></a>'
        }
    }]);

    app.directive('wTopbarDropdownItems', [function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template: '<ul class="animated fadeInDown pull-right" uib-dropdown-menu ng-transclude ></ul>'

        };
    }]);

    app.directive('wTopbarDropdownItem', [function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template: '<li ng-transclude></li>'
        };
    }]);

    app.directive('wPanel', [function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template: '<div class="x_panel" ng-transclude></div>'
        };
    }])

    app.directive('wPanelHeader', ['$compile', function ($compile) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                title: '@',
                smallTitle: '@'
            },
            template: '<div class="x_title" ng-transclude></div>',
            link: function ($scope, $element, $attrs) {
                if (angular.isDefined($attrs.title)) {
                    $scope.title = $attrs.title;
                    var elt = angular.element('<h2>{{title}}<small ng-if="smallTitle">{{smallTitle}}</small></h2>');
                    var c = $compile(elt)($scope);
                    $element.prepend(c);
                }
                $element.append('<div class="clearfix"></div>');
            }
        }
    }]);

    app.directive('wPanelToolbox', [function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template: '<ul class="nav navbar-right panel_toolbox" ng-transclude></ul>'
        };
    }]);

    app.directive('wPanelToolboxChevron', [function () {
        return {
            restrict: 'E',
            replace: true,
            template: '<li><a class="collapse-link"><i class="fa fa-chevron-up"></i></a></li>',
            link: function ($scope, $element, $attrs) {
                $element.find('a').click(function () {
                    var x_panel = $(this).closest('div.x_panel');
                    var button = $(this).find('i');
                    var content = x_panel.find('div.x_content');
                    content.slideToggle(200);
                    (x_panel.hasClass('fixed_height_390') ? x_panel.toggleClass('').toggleClass('fixed_height_390') : '');
                    (x_panel.hasClass('fixed_height_320') ? x_panel.toggleClass('').toggleClass('fixed_height_320') : '');
                    button.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                    setTimeout(function () {
                        x_panel.resize();
                    }, 50);
                });
            }
        };
    }]);

    app.directive('wPanelToolboxClose', [function () {
        return {
            restrict: 'E',
            replace: true,
            template: '<li><a class="close-link"><i class="fa fa-close"></i></a></li>',
            link: function ($scope, $element, $attrs) {
                $element.find('a').click(function () {
                    var content = $(this).closest('div.x_panel');
                    content.remove();
                });
            }
        };
    }]);

    app.directive('wPanelToolboxTool', ['$compile', function ($compile) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template: '<li class="" uib-dropdown ><a uib-dropdown-toggle  ><i class="fa fa-wrench"></i></a><ul class="animated fadeInDown " uib-dropdown-menu ng-transclude></ul></li>',

        };
    }]);

    app.directive('wPanelToolboxToolItem', [function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template: '<li ng-transclude></li>'
        };
    }]);

    app.directive('wPanelContent', [function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template: '<div class="x_content" ng-transclude></div>'
        };
    }]);

    app.directive('wNavigationBar', [function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            templateUrl: 'partials/wNavigationBar.html'
        }
    }]);

    app.directive('wNavigationButton', [function () {
        return {
            restrict: 'E',
            replace: true,
            template: '<button class="btn btn-default " type="button"  aria-haspopup="true" aria-expanded="false"> <i class="fa "></i></button>',
            link: function ($scope, $element, $attrs) {
                if (angular.isDefined($attrs.icon))
                    $element.find('i').addClass('fa-' + $attrs.icon);
            }
        };
    }]);

    app.directive('wSearchBox', [function () {
        return {
            restrict: 'E',
            replace: true,
            require: '?ngModel',
            scope: {
                model: '=ngModel',
                fields: '=',
                //operators:'=operators'
            },
            templateUrl: function (element, attr) {
                return attr.templateUrl || 'partials/angular-advanced-searchbox.html';
            },
            controller: ['$log', '$scope', function ($log, $scope) {
                $log.log($scope.fields);
                $scope.lines = [];
                $scope.operators = [
                 {
                     label: 'Egal',
                     value: 'eq'
                 },
                 {
                     label: 'Commence par',
                     value: 'sw'
                 }, {
                     label: 'Different de',
                     value: 'neq'
                 }, {
                     label: 'Superieur',
                     value: 'gt'
                 }, {
                     label: 'Superieur ou egal',
                     value: 'gte'
                 }, {
                     label: 'Inferieur',
                     value: 'lt'
                 }, {
                     label: 'Inferieur ou egal',
                     value: 'lte'
                 }

                ];

                $scope.opened = false;
                $scope.dt = new Date();
                $scope.add = function () {
                    var line = { opened: true, value: new Date() };
                    $scope.lines.push(line);

                };
                $scope.remove = function (index) {
                    $scope.lines.splice(index, 1);
                };
                $scope.openDatePicker = function (index) {
                    $scope.lines[index].opened = true;
                    $log.log($scope.lines);
                    $scope.opened = true;
                };
                $scope.dateOptions = {
                    dateDisabled: disabled,
                    formatYear: 'yy',
                    maxDate: new Date(2020, 5, 22),
                    minDate: new Date(),
                    startingDay: 1
                };
                $scope.birthDate = new Date();

                // Disable weekend selection
                function disabled(data) {
                    var date = data.date,
                    mode = data.mode;
                    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
                }


            }]
        }
    }]);

    app.directive('customDatepicker', function ($compile, $timeout) {
        return {
            replace: true,
            templateUrl: 'partials/custom-datepicker.html',
            scope: {
                ngModel: '=',
                dateOptions: '@',
                dateDisabled: '@',
                opened: '=',
                min: '@',
                max: '@',
                popup: '@',
                options: '@',
                name: '@',
                id: '@'
            },
            link: function ($scope, $element, $attrs, $controller) {

            }
        };
    });

    app.directive('shortcut',['$', function ($) {
        return {
            restrict: 'E',
            replace: true,
            scope: true,
            link: function postLink(scope, iElement, iAttrs) {
                $(document).on('keypress', function (e) {
                    scope.$apply(scope.keyPressed(e));
                });
            }
        };
    }]);

    app.controller('mainCtrl', ['$scope','$interval', '$uibModal', 'ThingsApi','Things','SettingsApi', 'Partials', '$log', function ($scope,$interval, $uibModal,$thingsapi,$thingshub,$settingsapi, $partials, $log) {
        var autorefresh = undefined;

        $scope.appTitle = "Home Things";
        $scope.appIcon = 'pagelines';
        $scope.user = { photo: 'resources/photo.jpg', firstname: "Jean-Christophe", lastname: "Ambert", fullname: 'Ambert Jean-Christophe' };
        $scope.menuSections = [{
            title: 'GENERAL',
            menus: [
                 {
                     icon: 'home',
                     text: 'Accueil',
                     childs: [
                         {
                             id: 0,
                             text: 'dashboard',
                             state: 'dashboard'
                         },
                         {
                             id: 1,
                             text: 'temp',
                             link: 'home'
                         },
                     ]
                 },
                {
                    icon: 'building-o',
                    text: 'Parametrages',
                    tooltip: 'settings-tooltip',
                    childs: [
                        {
                            id: 0,
                            text: 'things',
                            state: 'things',
                            //tooltip:'Tous les articles'

                        },
                        {
                            id: 1,
                            text: 'inputs',
                            state: 'inputs'
                        },
                        {
                            id: 2,
                            text: 'outputs',
                            state: 'outputs'
                        },
                         {
                             id: 3,
                             text: 'blockly',
                             state: 'blockly'
                         },
                    ]
                }
            ]
        },
        ];

        $scope.animationsEnabled = true;

        $settingsapi.query().$promise.then(function (result) {
            $scope.settings = result[0];
            $log.log('Settings:'); $log.log($scope.settings);
            $scope.$watch('settings.automaticRefreshTime', function change(newValue, oldValue) {
                $log.log('refresh time changed');
                restartAutoRefresh();
            });
            $scope.$watch('settings.manualRefreshMode', function change(newValue, oldValue) {
                $log.log('manual refresh mode changed');
                restartAutoRefresh();
            });
        });

        function restartAutoRefresh() {
            stopAutoRefresh();
            startAutoRefresh();
        }
        function startAutoRefresh() {
            if (!$scope.settings.manualRefreshMode) {
                autorefresh = $interval(function () { $thingshub.updateStatus(); }, $scope.settings.automaticRefreshTime);
                $log.log('start auto refresh');
            }
        }

        function stopAutoRefresh() {
            if (angular.isDefined(autorefresh)) {
                $interval.cancel(autorefresh);
                autorefresh = undefined;
                $log.log('stop auto refresh');
            }
        }
        $scope.wantAddThing = function (size) {
            size = size | 'lg';
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: $partials.ADD_THING,
                controller: 'addThingController',
                size: size,
                /*resolve: {
                    items: function () {
                        return $scope.items;
                    }
                }*/
            });

            modalInstance.result.then(function (item) {
                //var selected = selectedItem;
                $log.log('Want add thing with id:'+item.id)
                $thingsapi.save(item);
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });

           
            $log.log($thingshub);
        };

        $scope.modifySettings = function (size) {
            size = size | 'lg';
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: $partials.UPDATE_SETTINGS,
                controller: 'modifySettingController',
                size: size,
                resolve: {
                    settings: function () {
                        return $scope.settings;
                    }
                }
            });

            modalInstance.result.then(function (item) {
                //var selected = selectedItem;
                $log.log('Want add thing with id:' + item.id)
                $scope.settings.automaticRefreshTime = item.automaticRefreshTime;
                $scope.settings.manualRefreshMode = item.manualRefreshMode;
                $settingsapi.update($scope.settings);
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });


            $log.log($thingshub);
        };

        

        $scope.update = function () {
            $log.log('Try to update manually from main controller')
            $thingshub.updateStatus();
        }
        $thingshub.start(function () {
            //Call the server side method for every 5 seconds
           /* setInterval(function () {
                if ($scope.manualMode) return;
                console.log('try update periodically from main controller');
                $thingshub.updateStatus();
            }, $scope.settings.automaticRefreshTime);*/
            startAutoRefresh();
        });
       /* $scope.keyPressed = function (e) {
            $log.log(e);
        }*/
    }]);

    app.controller('thingsController', ['$scope', 'ThingsApi', 'Things', 'NgTableParams','_', '$log', function ($scope, $thingsapi, $thingshub, NgTableParams,_,  $log) {

        $scope.tableParams = new NgTableParams({}, {
            getData: function (params) {
                // ajax request to api
                return $thingsapi.query().$promise.then(function (data) {
                    $log.log(data);
                    //params.total(data.inlineCount); // recal. page nav controls
                    return data;//.results;
                });
            }
        });

        $scope.delete = function (id) {
            $log.log('want delete things by id:' + id);
            $thingsapi.delete({ id: id });/*.$promise.then(function () {
                $log.log('Things deleted on server');
                $scope.tableParams.reload();
                $log.log('reload things table');
            });*/
        };

        $thingshub.on('RemoveThing', function (id) {
            $log.log('Things deleted on server');
            $scope.tableParams.reload();
            $log.log('reload things table');
        });

        $thingshub.on('AddThing', function (id) {
            $log.log('Things added on server');
            $scope.tableParams.reload();
            $log.log('reload things table');
        });

        $thingshub.on('UpdateStatusResult', function (result) {
            $log.log('Things Update Result');
            //$log.log(result);
            //$log.log($scope);
            _.forEach(result, function (r) {
                var index = _.findIndex($scope.tableParams.data, function (o) {return o.id == r.Id });
                //$log.log(index);
                //$log.log($scope.tableParams.data);
                $log.log(r);
                $scope.tableParams.data[index].state = Number(r.State);
                $scope.tableParams.data[index].mode = Number(r.Mode);
               // $log.log($scope.tableParams.data[index]);

            });

            $scope.$apply();
        })
       

    }]);
    app.controller('inputsController', ['$scope', '$log', 'NgTableParams', 'InputApi', function ($scope, $log, NgTableParams, $inputapi) {

        $scope.tableParams = new NgTableParams({}, {
            getData: function (params) {
                // ajax request to api
                return $inputapi.query().$promise.then(function (data) {
                    $log.log(data);
                    //params.total(data.inlineCount); // recal. page nav controls
                    return data;//.results;
                });
            }
        });
    }]);

    /* MODAL CONTROLERS*/
    app.controller('addThingController', ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
        $scope.item = {};
        

        $scope.ok = function () {
            $uibModalInstance.close($scope.item);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }]);

    app.controller('modifySettingController', ['$scope', '$uibModalInstance','settings', function ($scope, $uibModalInstance,settings) {
        $scope.settings = angular.copy(settings);


        $scope.ok = function () {
            $uibModalInstance.close($scope.settings);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }]);

    /* /MODAL CONTROLERS*/
    

    

})(window, _);