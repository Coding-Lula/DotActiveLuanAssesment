// Frontend/controllers/dashboardController.js
app.controller('DashboardController', [
    '$scope',
    '$http',
    '$location',
    function ($scope, $http, $location) {

        // --- Session state -------------------------------------------------
        // Keep these keys consistent with authController.js.
        // Recommended: 'jwt_token' for the token (matches the interceptor in app.js).
        $scope.username = localStorage.getItem('username') || 'Manager';
        $scope.userRole = localStorage.getItem('userRole') || 'User';

        // --- Data ----------------------------------------------------------
        $scope.stores = [];
        $scope.visibleStores = [];

        $scope.divisions = [];
        $scope.provinces = [];

        // --- Filter / sort state ------------------------------------------
        $scope.searchQuery = '';
        $scope.selectedDivision = '';
        $scope.selectedProvince = '';
        $scope.selectedStatus = '';

        $scope.sortColumn = 'storeCode';
        $scope.reverseSort = false;

        // --- UI state ------------------------------------------------------
        $scope.isLoading = true;
        $scope.errorMessage = '';

        $scope.metrics = {
            stores: 0,
            overduePlanograms: 0,
            overdueStores: 0,
            onTimeStores: 0
        };

        // --- Helpers -------------------------------------------------------
        function readField(record, apiKey, normalisedKey) {
            return record[apiKey] !== undefined && record[apiKey] !== null
                ? record[apiKey]
                : record[normalisedKey];
        }

        function normaliseStore(record) {
            var rawOverdue = Number(
                readField(record, 'iOverduePlanograms', 'overduePlanograms')
            );

            return {
                storeCode: String(
                    readField(record, 'sStoreCode', 'storeCode') || ''
                ),
                storeName: String(
                    readField(record, 'sStoreName', 'storeName') || ''
                ),
                division: String(
                    readField(record, 'sDivision', 'division') || ''
                ),
                province: String(
                    readField(record, 'sProvince', 'province') || ''
                ),
                overduePlanograms: Number.isFinite(rawOverdue)
                    ? Math.max(0, Math.floor(rawOverdue))
                    : 0
            };
        }

        function uniqueValues(records, key) {
            return records
                .map(function (record) { return record[key]; })
                .filter(function (value, index, values) {
                    return value && values.indexOf(value) === index;
                })
                .sort(function (a, b) { return a.localeCompare(b); });
        }

        // --- Derived view --------------------------------------------------
        $scope.refreshView = function () {
            var query = ($scope.searchQuery || '').trim().toLowerCase();

            // Matching stores honour search + division + province.
            // Summary pills intentionally ignore the status filter so that
            // switching status doesn't change the totals.
            var matchingStores = $scope.stores.filter(function (store) {
                var matchesSearch =
                    !query ||
                    store.storeCode.toLowerCase().indexOf(query) !== -1 ||
                    store.storeName.toLowerCase().indexOf(query) !== -1;

                var matchesDivision =
                    !$scope.selectedDivision ||
                    store.division === $scope.selectedDivision;

                var matchesProvince =
                    !$scope.selectedProvince ||
                    store.province === $scope.selectedProvince;

                return matchesSearch && matchesDivision && matchesProvince;
            });

            var overdueStores = matchingStores.filter(function (store) {
                return store.overduePlanograms > 0;
            });

            $scope.metrics = {
                stores: matchingStores.length,
                overduePlanograms: matchingStores.reduce(function (total, store) {
                    return total + store.overduePlanograms;
                }, 0),
                overdueStores: overdueStores.length,
                onTimeStores: matchingStores.length - overdueStores.length
            };

            $scope.visibleStores = matchingStores.filter(function (store) {
                if ($scope.selectedStatus === 'overdue') {
                    return store.overduePlanograms > 0;
                }
                if ($scope.selectedStatus === 'onTime') {
                    return store.overduePlanograms === 0;
                }
                return true;
            });
        };

        $scope.setStatus = function (status) {
            $scope.selectedStatus = status;
            $scope.refreshView();
        };

        $scope.hasFilters = function () {
            return Boolean(
                $scope.searchQuery ||
                $scope.selectedDivision ||
                $scope.selectedProvince ||
                $scope.selectedStatus
            );
        };

        $scope.clearFilters = function () {
            $scope.searchQuery = '';
            $scope.selectedDivision = '';
            $scope.selectedProvince = '';
            $scope.selectedStatus = '';
            $scope.refreshView();
        };

        // --- Sorting -------------------------------------------------------
        $scope.sortBy = function (column) {
            if ($scope.sortColumn === column) {
                $scope.reverseSort = !$scope.reverseSort;
            } else {
                $scope.sortColumn = column;
                $scope.reverseSort = false;
            }
        };

        $scope.sortIcon = function (column) {
            if ($scope.sortColumn !== column) return 'bi-arrow-down-up';
            return $scope.reverseSort ? 'bi-arrow-down' : 'bi-arrow-up';
        };

        $scope.sortState = function (column) {
            if ($scope.sortColumn !== column) return 'none';
            return $scope.reverseSort ? 'descending' : 'ascending';
        };

        // --- Data loading --------------------------------------------------
        // NOTE: We do NOT attach an Authorization header here.
        // The $http interceptor in app.js injects 'Bearer <jwt_token>'
        // on every outgoing request, so this stays DRY.
        $scope.loadStores = function () {
            $scope.isLoading = true;
            $scope.errorMessage = '';

            return $http.get('http://localhost:5154/api/stores')
                .then(function (response) {
                    if (!Array.isArray(response.data)) {
                        $scope.stores = [];
                        $scope.divisions = [];
                        $scope.provinces = [];
                        $scope.refreshView();
                        $scope.errorMessage =
                            'The server returned an unexpected store response.';
                        return;
                    }

                    $scope.stores = response.data.map(normaliseStore);
                    $scope.divisions = uniqueValues($scope.stores, 'division');
                    $scope.provinces = uniqueValues($scope.stores, 'province');
                    $scope.refreshView();
                })
                .catch(function (error) {
                    console.error('Failed to fetch stores', error);

                    $scope.stores = [];
                    $scope.divisions = [];
                    $scope.provinces = [];
                    $scope.refreshView();

                    // 401/403 -> session is gone, bounce to login.
                    if (error.status === 401 || error.status === 403) {
                        localStorage.removeItem('jwt_token');
                        $location.path('/login');
                        return;
                    }

                    $scope.errorMessage =
                        'We could not load your stores. Please try again.';
                })
                .finally(function () {
                    $scope.isLoading = false;
                });
        };

        // --- Logout --------------------------------------------------------
        $scope.logout = function () {
            // Clear every key that authController might have written.
            localStorage.removeItem('jwt_token'); // canonical
            localStorage.removeItem('token');     // legacy — safe to remove
            localStorage.removeItem('username');
            localStorage.removeItem('userRole');

            $location.path('/login');
        };

        // --- Bootstrap -----------------------------------------------------
        $scope.loadStores();
    }
]);