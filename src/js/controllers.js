/**
 * Created by jayaram on 4/12/16.
 */

var mControllers = angular.module('mControllers', ['ui.bootstrap', 'dynamicTable', 'mServices', 'ui.bootstrap-slider']);

mControllers.controller('TabController', function($scope, $http, measurementAPI, $q) {

    //Data Management
    $scope.data = {
        dataProviders: []
    };

    //selection context
    $scope.current = {
        dataSources: {},
        dataSourceObj: {},
        dataAnnotations: {},
        dataQueries: {},
        dataMeasurements: {}
    };

    //Final Measurement Selection List
    $scope.selection = {
        measurements: []
    };

    $scope.initMeasurement = function() {

        //Query builder
        $scope.qBuilder = {
            dataSource: "Choose a data source",
            filterField: "Choose an annotation field",
            filterOperator: "",
            filterValue: "",
            filtMinVal: 1,
            filtMaxVal: 10,
            filterNegate: false
        };

        $scope.fqBuilder = [];
        $scope.pageSize = 40;
        $scope.offset = 0;
        $scope.totalRecords = 0;

        //query helper fields
        $scope.qField = {
            stats: null,
            sFilter: null,
            dataAnnotations: null,
            minRange: null,
            maxRange: null,
            dValues: null,
            sliderVal: []
        };

        //UI Toggle form fields
        $scope.qDataSourceSel = false;
        $scope.qDataFieldSel = false;
        $scope.qDataQueries = false;
        $scope.qDataFilterSel = false;
    };

    $scope.qDataSource = function(srcIdx) {

        $scope.current.dataSourceObj = $scope.current.dataSources[srcIdx];
        $scope.qBuilder.dataSource = $scope.current.dataSources[srcIdx].name;
        $scope.qDataSourceSel = true;

        $scope.loadContent('dataSourceSel');
    };
    
    $scope.qDataField = function(da) {
        $scope.qDataFieldSel = true;
        $scope.qBuilder.filterField = da.field;
        $scope.qField.stats = da.stats;
        $scope.qField.sFilter = da.filter;
        $scope.qField.dValues = da.stats.distinctValues;
        //$scope.qField.slider = 10;
        //$scope.qField.minRange = da.stats;
        //$scope.qField.maxRange = 100;
    };


    $scope.qFilterSelect = function(filter) {

        $scope.qDataFilterSel = true;

/*        if(filter.name == 'range') {
            $scope.qField.minRange = 10;
            $scope.qField.maxRange = 100;
        }*/
    };

    $scope.applyFilter = function(query) {

        var filtVal = "";

        if(query.filterOperator.name == 'range') {
            var values = $scope.qField.sliderVal;
            filtVal = values[0] + "," + values[1];
        }
        else {
            filtVal = query.filterValue;
        }

        $scope.fqBuilder.push({filterField: query.filterField, filterName: query.filterOperator.name, filterValue: filtVal, negate: query.filterNegate});

        $scope.qDataFieldSel = false;
        $scope.qDataFilterSel = false;

        var current_ds = $scope.qBuilder.dataSource;

        $scope.qBuilder = {
            dataSource: current_ds,
            filterField: "Choose an annotation field",
            filterOperator: "",
            filterValue: "",
            filtMinVal: 1,
            filtMaxVal: 10
        };

        $scope.qField = {
            stats: {},
            sFilter: {},
            dataAnnotations: {},
            minRange: 0,
            maxRange: 0,
            dValues: []
        };

        $scope.data.dataMeasurements = {};
        $scope.loadContent('dataMeasurements');
    };

    $scope.removeFilter = function(index) {
        $scope.fqBuilder.splice(index, 1);

        $scope.data.dataMeasurements = {};
        $scope.loadContent('dataMeasurements');
    };

    $scope.tabs = [
        { title:'Data Provider', id:'dataProviders', minSelection: 1, templateURL: 'src/templates/_dataProviders.html', selectionType: 'single'},
        { title:'Measurements', id:'dataSources', minSelection: 1, templateURL: 'src/templates/_dataMeasurements.html', selectionType: 'multiple'}
    ];

    $scope.addDataProvider = function(url) {
        $http.get(url + '/dataProviders').then(function(resp) {
            $scope.data.dataProviders.push({'url': url, 'status': 'AVAILABLE', 'providerType': resp.data.dataProviders.serverName });
        }, function(error) {
            $scope.data.dataProviders.push({'url': url, 'status': 'FAIL'});
        });
    };

    $scope.loadDataProviders = function() {
        $scope.addDataProvider('http://localhost:5000');
        //$scope.addDataProvider('http://localhost:5100');
        $scope.addDataProvider('http://localhost:5050');
    };

    $scope.loadContent = function(id) {

        switch(id) {
            case 'dataSources':
                measurementAPI.getDataSources($scope.getSelectedDataProvider())
                    .then(function(response) {
                        $scope.current.dataSources = response[0].data.dataSources;
                    }, function(error) {
                        console.log(error);
                    });
                break;
            case 'dataSourceSel':
                // make requests to both annotations and first x measurements

                $q.all([
                    measurementAPI.getDataAnnotations($scope.getSelectedDataProvider()[0], $scope.current.dataSourceObj),
                    measurementAPI.getMeasurements($scope.getSelectedDataProvider()[0], $scope.current.dataSourceObj, $scope.fqBuilder, $scope.pageSize, $scope.offset)
                ])
                    .then(function(response) {
                        $scope.current.dataAnnotations = response[0][0].data.dataAnnotations;
                        //$scope.current.dataQueries = response[1][0].data.queries;
                        $scope.current.dataMeasurements = response[1][0].data.dataMeasurements;
                        $scope.totalRecords = response[1][0].data.totalCount;

                        $scope.syncMeasurements();

                        measurementAPI.getDataQueries($scope.getSelectedDataProvider()[0], $scope.current.dataSourceObj)
                            .then(function(response) {
                                $scope.current.dataQueries = response[0].data.queries;

                                if($scope.current.dataQueries.length > 0) {
                                    $scope.qDataQueries = true;
                                }
                            }, function(error) {
                               console.log(error)
                            });
                        
                    }, function(error) {
                        console.log("error mode");
                        console.log(error);
                        
                    });
                break;
            case 'dataMeasurements':
                measurementAPI.getMeasurements($scope.getSelectedDataProvider()[0], $scope.current.dataSourceObj, $scope.fqBuilder, $scope.pageSize, $scope.offset)
                    .then(function(response) {
                        $scope.current.dataMeasurements = response[0].data.dataMeasurements;
                        $scope.totalRecords = response[0].data.totalCount;
                        $scope.syncMeasurements();
                    }, function(error) {
                        console.log(error);
                    });
        }
    };

    $scope.setDataProviderSel = function(provider) {
        $scope.initMeasurement();
    };


    $scope.setMeasurementSel = function(measurement) {
        if(measurement.selected) {
            $scope.selection.measurements.push({
                'dataProvider': $scope.getSelectedDataProvider()[0],
                'dataSource': $scope.current.dataSourceObj,
                'dataMeasurement':measurement
            });
        }
        else {
            //refactor
            $scope.selection.measurements.forEach(function(m, idx) {
                if(m.dataProvider.providerType == $scope.getSelectedDataProvider()[0].providerType &&
                    m.dataSource.name == $scope.current.dataSourceObj.name &&
                    m.dataMeasurement.name == measurement.name)  {
                    $scope.selection.measurements.splice(idx, 1);
                }
            });
        }
    };

    $scope.removeMeasurement = function(index) {
        var tmp = $scope.selection.measurements[index];
        $scope.selection.measurements.splice(index, 1);
        var idx = $scope.current.dataMeasurements.indexOf(tmp.dataMeasurement);
        if (idx != -1) {
            $scope.current.dataMeasurements[idx].selected = false;
        }
    };

    $scope.syncMeasurements = function() {

        //refactor

        $scope.selection.measurements.forEach(function(m) {
            $scope.current.dataMeasurements.forEach(function(n) {
                if(m.dataMeasurement.name == n.name) {
                    n.selected = true;
                }
            });
        });

/*        $scope.current.dataMeasurements.forEach(function(n) {
            n.selected = true;
            var idx = tmpM.find(n);
            if(idx === -1) {
                n.selected = false;
            }
        });*/
    };

    $scope.setDataQuery = function(dq) {

        $scope.fqBuilder = [];

        dq.filters.forEach(function(filt) {
            $scope.fqBuilder.push({'filterField': filt.filterField, 'filterName': filt.filterName, 'filterValue': filt.filterValue});
        });

        $scope.data.dataMeasurements = {};
        $scope.loadContent('dataMeasurements');

    };

    $scope.getSelectedDataProvider = function() {

        var daProv = [];

        $scope.data.dataProviders.forEach(function(dp) {
            if (dp.selected) {
                daProv.push(dp);
            }
        });

        return daProv;
    };

    $scope.loadMore = function() {

        if($scope.current.dataMeasurements.length < $scope.totalRecords) {
            measurementAPI.getMeasurements($scope.getSelectedDataProvider()[0], $scope.current.dataSourceObj, $scope.fqBuilder, $scope.pageSize, $scope.current.dataMeasurements.length)
                .then(function(response) {
                    $scope.current.dataMeasurements = $scope.current.dataMeasurements.concat(response[0].data.dataMeasurements);
                    $scope.syncMeasurements();
                }, function(error) {
                    console.log(error);
                });
        }
    };

    $scope.loadDataProviders();
});