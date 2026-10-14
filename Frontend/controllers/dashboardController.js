app.controller('DashboardController', ['$scope', '$http', '$location', function ($scope, $http, $location) {
    $scope.stores = [];
    $scope.username = localStorage.getItem('username') || 'Manager';
    $scope.userRole = localStorage.getItem('user_role') || '';
    $scope.isLoading = true;

    // Sorting state
    $scope.sortColumn = 'sStoreCode';
    $scope.reverseSort = false;

    // Fetch stores authorized for this user's role
    function loadStores() {
        $http.get('https://localhost:5001/api/stores')
            .then(function (response) {
                $scope.stores = response.data;
                $scope.isLoading = false;
            }, function (error) {
                console.error('Error fetching stores', error);
                $scope.isLoading = false;
            });
    }

    loadStores();

    // Column sorting handler
    $scope.sortBy = function (column) {
        if ($scope.sortColumn === column) {
            $scope.reverseSort = !$scope.reverseSort;
        } else {
            $scope.sortColumn = column;
            $scope.reverseSort = false;
        }
    };

    // Logout handler
    $scope.logout = function () {
        localStorage.clear();
        $location.path('/login');
    };
}]);