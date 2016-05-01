(function (window,  _) {
    'use strict';
    var angular = window.angular;
    console.dir(window);
    if (angular == undefined) throw "angular must be declared before homethings-utils";
    if (window.$ == undefined) throw "jquery must be declared before homethings-utils";
    var util = angular.module('homethingsUtil', []);
    util.constant('$', window.$);
    util.constant('_', _);
    util.service('Hub', ['$', '$rootScope', '$log', function ($, $rootScope, $log) {
        //This will allow same connection to be used for all Hubs
        //It also keeps connection as singleton.
        var globalConnections = [];

        function initNewConnection(options) {
            var connection = null;
            if (options && options.rootPath) {
                connection = $.hubConnection(options.rootPath, { useDefaultPath: false });
            } else {
                connection = $.hubConnection();
            }

            connection.logging = (options && options.logging ? true : false);
            return connection;
        }

        function getConnection(options) {
            var useSharedConnection = !(options && options.useSharedConnection === false);
            if (useSharedConnection) {
                return typeof globalConnections[options.rootPath] === 'undefined' ?
                globalConnections[options.rootPath] = initNewConnection(options) :
                globalConnections[options.rootPath];
            }
            else {
                return initNewConnection(options);
            }
        }

        return function (hubName, options) {
            var Hub = this;
            Hub.connected = false;
            Hub.connection = getConnection(options);
            Hub.proxy = Hub.connection.createHubProxy(hubName);

            Hub.on = function (event, fn) {
                Hub.proxy.on(event, fn);
            };

            Hub.on('', function () { console.log('ADDTHING'); });
            Hub.invoke = function (method, args) {
                //if(Hub.connected)
                return Hub.proxy.invoke.apply(Hub.proxy, arguments)
            };
            Hub.disconnect = function () {
                Hub.connection.stop();
            };
            Hub.connect = function () {
                var startOptions = {};
                if (options.transport) startOptions.transport = options.transport;
                if (options.jsonp) startOptions.jsonp = options.jsonp;
                if (angular.isDefined(options.withCredentials)) startOptions.withCredentials = options.withCredentials;
                return Hub.connection.start(startOptions);
            };

            if (options && options.listeners) {
                Object.getOwnPropertyNames(options.listeners)
                .filter(function (propName) {
                    return typeof options.listeners[propName] === 'function';
                })
                    .forEach(function (propName) {
                        Hub.on(propName, options.listeners[propName]);
                    });
            }
            if (options && options.methods) {
                angular.forEach(options.methods, function (method) {
                    Hub[method] = function () {
                        var args = $.makeArray(arguments);
                        args.unshift(method);
                        return Hub.invoke.apply(Hub, args);
                    };
                });
            }
            if (options && options.queryParams) {
                Hub.connection.qs = options.queryParams;
            }
            if (options && options.errorHandler) {
                Hub.connection.error(options.errorHandler);
            }
            if (options && options.stateChanged) {
                Hub.connection.stateChanged(options.stateChanged);
            }

            //Adding additional property of promise allows to access it in rest of the application.
            if (options.autoConnect === undefined || options.autoConnect) {
                Hub.promise = Hub.connect();
            }
            $log.log(Hub);
            return Hub;
        };


    }]);

})(window,  _);