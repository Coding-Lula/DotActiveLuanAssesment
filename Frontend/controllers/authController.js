app.controller('AuthController', ['$scope', '$http', '$location', function ($scope, $http, $location) {
    $scope.credentials = { username: '', password: '' };
    $scope.errorMessage = '';
    $scope.isLoading = false;

    $scope.login = function () {
        $scope.isLoading = true;
        $scope.errorMessage = '';

        $http.post('https://localhost:5001/api/auth/login', $scope.credentials)
            .then(function (response) {
                $scope.isLoading = false;
                localStorage.setItem('jwt_token', response.data.token);
                localStorage.setItem('user_role', response.data.role);
                localStorage.setItem('username', response.data.username);
                $location.path('/dashboard');
            }, function (error) {
                $scope.isLoading = false;
                $scope.errorMessage = error.data.message || 'Invalid username or password. Please try again.';
            });
    };
}]);