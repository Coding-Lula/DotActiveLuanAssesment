app.factory('StoreService', ['$http', '$q', function($http, $q) {
    var API_BASE_URL = 'http://localhost:5154/api/stores';

    return {
        getStores: function() {
            var deferred = $q.defer();

            $http.get(API_BASE_URL)
                .then(function(response) {
                    deferred.resolve(response.data);
                }, function(error) {
                    deferred.reject(error.data.message || 'Failed to fetch store records.');
                });

            return deferred.promise;
        }
    };
}]);