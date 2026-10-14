app.factory('AuthService', ['$http', '$q', function($http, $q) {
    var API_BASE_URL = 'http://localhost:5154/api/auth';

    return {
        login: function(credentials) {
            var deferred = $q.defer();

            $http.post(API_BASE_URL + '/login', credentials)
                .then(function(response) {
                    // Store JWT token and session metadata on successful login
                    localStorage.setItem('jwt_token', response.data.token);
                    localStorage.setItem('user_role', response.data.role);
                    localStorage.setItem('username', response.data.username);
                    deferred.resolve(response.data);
                }, function(error) {
                    deferred.reject(error.data.message || 'Invalid username or password.');
                });

            return deferred.promise;
        },

        logout: function() {
            localStorage.clear();
        },

        isLoggedIn: function() {
            return !!localStorage.getItem('jwt_token');
        },

        getCurrentUser: function() {
            return {
                username: localStorage.getItem('username'),
                role: localStorage.getItem('user_role')
            };
        }
    };
}]);