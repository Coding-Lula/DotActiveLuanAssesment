app.controller('DashboardController', [
    '$scope',
    '$http',
    '$location',
    function ($scope, $http, $location) {
       
        $scope.username = localStorage.getItem('username') || 'Manager';
        $scope.userRole = localStorage.getItem('userRole') || 'User';

        $scope.stores = [];
        $scope.visibleStores = [];

        $scope.divisions = [];
        $scope.provinces = [];

        $scope.searchQuery = '';
        $scope.selectedDivision = '';
        $scope.selectedProvince = '';
        $scope.selectedStatus = '';

        $scope.sortColumn = 'storeCode';
        $scope.reverseSort = false;

        $scope.isLoading = true;
        $scope.errorMessage = '';

        $scope.metrics = {
            stores: 0,
            overduePlanograms: 0,
            overdueStores: 0,
            onTimeStores: 0
        };

        function readField(record, apiKey, normalisedKey) {
            return record[apiKey] !== undefined &&
                   record[apiKey] !== null
                ? record[apiKey]
                : record[normalisedKey];
        }

        function normaliseStore(record) {
            var rawOverdue = Number(
                readField(
                    record,
                    'iOverduePlanograms',
                    'overduePlanograms'
                )
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
                .map(function (record) {
                    return record[key];
                })
                .filter(function (value, index, values) {
                    return value && values.indexOf(value) === index;
                })
                .sort(function (a, b) {
                    return a.localeCompare(b);
                });
        }

        $scope.refreshView = function () {
            var query = ($scope.searchQuery || '')
                .trim()
                .toLowerCase();

            // These records match search, division, and province.
            // Summary pills intentionally ignore the status filter.
            var matchingStores = $scope.stores.filter(function (store) {
                var matchesSearch =
                    !query ||
                    store.storeCode.toLowerCase().includes(query) ||
                    store.storeName.toLowerCase().includes(query);

                var matchesDivision =
                    !$scope.selectedDivision ||
                    store.division === $scope.selectedDivision;

                var matchesProvince =
                    !$scope.selectedProvince ||
                    store.province === $scope.selectedProvince;

                return matchesSearch &&
                       matchesDivision &&
                       matchesProvince;
            });

            var overdueStores = matchingStores.filter(function (store) {
                return store.overduePlanograms > 0;
            });

            $scope.metrics = {
                stores: matchingStores.length,

                overduePlanograms: matchingStores.reduce(
                    function (total, store) {
                        return total + store.overduePlanograms;
                    },
                    0
                ),

                overdueStores: overdueStores.length,

                onTimeStores:
                    matchingStores.length - overdueStores.length
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

        $scope.sortBy = function (column) {
            if ($scope.sortColumn === column) {
                $scope.reverseSort = !$scope.reverseSort;
            } else {
                $scope.sortColumn = column;
                $scope.reverseSort = false;
            }
        };

        $scope.sortIcon = function (column) {
            if ($scope.sortColumn !== column) {
                return 'bi-arrow-down-up';
            }

            return $scope.reverseSort
                ? 'bi-arrow-down'
                : 'bi-arrow-up';
        };

        $scope.sortState = function (column) {
            if ($scope.sortColumn !== column) {
                return 'none';
            }

            return $scope.reverseSort
                ? 'descending'
                : 'ascending';
        };

        $scope.loadStores = function () {
            $scope.isLoading = true;
            $scope.errorMessage = '';

            var token = localStorage.getItem('token');

            return $http.get('http://localhost:5154/api/stores', {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }).then(function (response) {
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

                $scope.divisions = uniqueValues(
                    $scope.stores,
                    'division'
                );

                $scope.provinces = uniqueValues(
                    $scope.stores,
                    'province'
                );

                $scope.refreshView();

            }, function (error) {
                console.error('Failed to fetch stores', error);

                $scope.stores = [];
                $scope.divisions = [];
                $scope.provinces = [];
                $scope.refreshView();

                if (error.status === 401) {
                    $location.path('/login');
                    return;
                }

                $scope.errorMessage =
                    'We could not load your stores. Please try again.';

            }).finally(function () {
                $scope.isLoading = false;
            });
        };

        $scope.logout = function () {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('userRole');

            $location.path('/login');
        };

        // <-- ADD THIS LINE HERE TO KICK OFF THE DATA LOAD ON STARTUP -->
        $scope.loadStores();
    }
]);