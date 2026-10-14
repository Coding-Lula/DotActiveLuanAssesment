var app = angular.module('dotActivApp', ['ngRoute']);

app.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
    $routeProvider
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'AuthController'
        })
        .when('/dashboard', {
            templateUrl: 'views/dashboard.html',
            controller: 'DashboardController'
        })
        .otherwise({
            redirectTo: '/login'
        });

    // Register HTTP Interceptor for JWT Bearer injection
    $httpProvider.interceptors.push(['$q', '$location', function ($q, $location) {
        return {
            'request': function (config) {
                var token = localStorage.getItem('jwt_token');
                if (token) {
                    config.headers['Authorization'] = 'Bearer ' + token;
                }
                return config;
            },
            'responseError': function (rejection) {
                if (rejection.status === 401) {
                    localStorage.removeItem('jwt_token');
                    $location.path('/login');
                }
                return $q.reject(rejection);
            }
        };
    }]);
}]);