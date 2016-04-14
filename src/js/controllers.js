/**
 * Created by jayaram on 4/12/16.
 */

var mControllers = angular.module('mControllers', ['ui.bootstrap', 'dynamicTable', 'mServices']);

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
        dataMeasurements: {}
    };

    //Query builder
    $scope.qBuilder = {
        dataSource: "Choose a data source",
        filterField: "Choose an annotation field",
        filterOperator: "",
        filterValue: "",
        filtMinVal: 1,
        filtMaxVal: 10
    };

    $scope.fqBuilder = [];
    $scope.pageSize = 10;
    $scope.offset = 0;
    $scope.totalRecords = 0;

    //query helper fields
    $scope.qField = {
        stats: null,
        sFilter: null,
        dataAnnotations: null,
        minRange: null,
        maxRange: null,
        dValues: null
    };

    //UI Toggle form fields
    $scope.qDataSourceSel = false;
    $scope.qDataFieldSel = false;

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
        //$scope.qField.minRange = 10;
        //$scope.qField.maxRange = 100;
    };

    $scope.applyFilter = function(query) {

        var filtVal = "";

        if(query.filterOperator.name == 'range') {
            filtVal = qBuilder.filtMinVal + "," + qBuilder.filtMaxVal;
        }
        else {
            filtVal = query.filterValue;
        }

        $scope.fqBuilder.push({filterField: query.filterField, filterOperator: query.filterOperator.name, filterValue: filtVal});

        $scope.qDataFieldSel = false;

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
            $scope.data.dataProviders.push({'url': url, 'status': 'AVAILABLE', 'providerType': resp.data.dataProviders[0].serverName });
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
        console.log("Loading selected Tab data");

        switch(id) {
            case 'dataSources':
                measurementAPI.getDataSources($scope.getSelectedDataProvider())
                    .then(function(response) {
                        console.log(response);
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
                        console.log(response);
                        $scope.current.dataAnnotations = response[0][0].data.dataAnnotations;
                        $scope.current.dataMeasurements = response[1][0].data.dataMeasurements;
                        
                    }, function(error) {
                        console.log(error);
                        
                    });
                break;
            case 'dataMeasurements':
                measurementAPI.getMeasurements($scope.getSelectedDataProvider()[0], $scope.current.dataSourceObj, $scope.fqBuilder, $scope.pageSize, $scope.offset)
                    .then(function(response) {
                        console.log(response);
                        $scope.current.dataMeasurements = response[0].data.dataMeasurements;
                    }, function(error) {
                        conosle.log(error);
                    });
            default:
                console.log("nothing to be done on this tab");
                break;
        }
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

    $scope.loadDataProviders();
});