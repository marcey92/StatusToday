/******************************************************************************
 * weatherCharts.js
 * Author @ Marcel Riederer
 * 
 * Creates charts from JCMB_2015
 *  Uses temp, rain, solar and humidity data
 * 
 * Logic:
 *  User can filter by Months of the Year
 *  User can filter by Days of the Week
 *  User can choose to compare rain, temp, solar, and humidity on one graph
 * 
 * Funny Business:
 *  totalPieRainChart works as a simple work around for filtering 
 *      totalRainChart, and minTempND, avgTempND & maxTempND
 *  by months of the year.
 *  totalPieRainChart is not displayed.
 * 
 *****************************************************************************/


/**** Charts  ****/
var tempChart = dc.lineChart('#temp-chart', 'month');
var solarChart = dc.lineChart('#solar-chart', 'month');
var humidityChart = dc.lineChart('#humidity-chart', 'month');
var rainChart = dc.lineChart('#rain-chart', 'month');
var monthCompareChart = dc.compositeChart('#month-compare-chart', 'month-compare');
var totalRainChart = dc.rowChart('#day-rain-chart', 'day');
var minTempBox = dc.numberDisplay("#min-temp-box", 'day');
var avgTempBox = dc.numberDisplay("#avg-temp-box", 'day');
var maxTempBox = dc.numberDisplay("#max-temp-box", 'day');
// NOT Displayed
var totalPieRainChart = dc.pieChart('#month-rain', 'day');


/**** Load Data ****/
d3.csv('data/JCMB_2015_hour.csv', function(data){
    var dateFormat = d3.time.format('%d/%m/%Y %H');
    var numberFormat = d3.format('.2f');

    data.forEach(function (d){
        d.dd = dateFormat.parse(d['date-time']);
        d.hour = d3.time.hour(d.dd);
        d.day = d3.time.day(d.dd);
        d.month = d3.time.month(d.dd);
        d.rain = +d['rainfall (mm)'];
        d.temp = +d['surface temperature (C)'];
        d.humidity = +d['relative humidity (%)'];
        d.solar = +d['solar flux (Kw/m2)'];
    });

/**** CrossFilter  *****/
    var ndx = crossfilter(data);
    var all = ndx.groupAll();

    //Dimensions
    var dayDimension = ndx.dimension(function (d){return d.day;});
    var monthDimension = ndx.dimension(function (d){return d.month.getMonth();});
    var dayOfWeek = ndx.dimension(function (d) {
        var day = d.dd.getDay();
        var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return day + '.' + name[day];
    });
    //Used for filtering not displaying
    var rainTotalGroup = monthDimension.group().reduceSum(function (d) {return d.rain;});

    /* Groups */	
    // rain (mm)
    var rainGroup = dayDimension.group().reduce(
        function (p, v) {
            ++p.days;
            p.total += v.rain;
            p.avg = Math.round((p.total / p.days)*100)/100;
            return p;
        },
        function (p, v) {
            --p.days;
            p.total -= v.rain;
            p.avg = p.days ? Math.round((p.total / p.days)*100)/100 : 0;
            return p;
        },
        function () {
            return {days: 0, total: 0, avg: 0};
        }
    );
    // rain (mm) day of week
    var dayOfWeekRainGroup = dayOfWeek.group().reduce(
        function (p, v) {
            ++p.days;
            p.total += v.rain;
            return p;
        },
        function (p, v) {
            --p.days;
            p.total -= v.rain;
            return p;
        },
        function () {
            return {days: 0, total: 0, avg: 0};
        }
    );
    // wind speed (m/s)	
    var windGroup = dayDimension.group().reduce(
        function (p, v) {
            ++p.days;
            p.total += v.windSpeed;
            p.avg = Math.round((p.total / p.days)*100)/100;
            return p;
        },
        function (p, v) {
            --p.days;
            p.total -= v.windSpeed;
            p.avg = p.days ? Math.round((p.total / p.days)*100)/100 : 0;
            return p;
        },
        function () {
            return {days: 0, total: 0, avg: 0};
        }
    );
    // surface temperature (C)
    var tempGroup = dayDimension.group().reduce(
        function (p, v) {
            ++p.days;
            p.total += v.temp;
            p.avg = Math.round((p.total / p.days)*100)/100;
            return p;
        },
        function (p, v) {
            --p.days;
            p.total -= v.temp;
            p.avg = p.days ? Math.round((p.total / p.days)*100)/100 : 0;
            return p;
        },
        function () {
            return {days: 0, total: 0, avg: 0};
        }
    );
    // relative humidity (%)
    var humidityGroup = dayDimension.group().reduce(
        function (p, v) {
            ++p.days;
            p.total += v.humidity;
            p.avg = Math.round((p.total / p.days)*100)/100;
            return p;
        },
        function (p, v) {
            --p.days;
            p.total -= v.humidity;
            p.avg = p.days ? Math.round((p.total / p.days)*100)/100 : 0;
            return p;
        },
        function () {
            return {days: 0, total: 0, avg: 0};
        }
    );
    // solar flux (Kw/m2)
    var solarGroup = dayDimension.group().reduce(
        function (p, v) {
            ++p.days;
            p.total += v.solar;
            p.avg = Math.round((p.total / p.days)*100)/100;
            return p;
        },
        function (p, v) {
            --p.days;
            p.total -= v.solar;
            p.avg = p.days ? Math.round((p.total / p.days)*100)/100 : 0;
            return p;
        },
        function () {
            return {days: 0, total: 0, avg: 0};
        }
    );	
    // Mean temperature for number box
    var meanTemp = ndx.groupAll().reduce(
          function (p, v) {
              ++p.n;
              p.total += v.temp;
              return p;
          },
          function (p, v) {
              --p.n;
              p.total -= v.temp;
              return p;
          },
          function () { return {n:0,total:0, min:100000, max:-1000000}; }
    );
    //Min temperature for number box
    var minTempGroup = ndx.groupAll();
    var reducer = reductio().min('temp');
    reducer(minTempGroup);
    //Max temperatire for number box
    var maxTempGroup = ndx.groupAll();
    reducer = reductio().max('temp');
    reducer(maxTempGroup)
    
    /**** Build Charts ****/

    //Month Temperature
    tempChart
        .width(300)
        .height(200)
        .margins({top: 30, right: 50, bottom: 5, left: 40})
        .dimension(dayDimension)
        .transitionDuration(1000)
        .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 10, 2)]))
        .round(d3.time.day.round)
        .xUnits(d3.time.day)
        .elasticY(true)
        .mouseZoomable(false)
        .renderHorizontalGridLines(true)
        .group(tempGroup, 'Temp')
        .valueAccessor(function (d) {return d.value.avg;})
         .yAxisLabel("Celcius")
        .xAxis().tickValues([]);

    //Month Solar
    solarChart
        .width(300)
        .height(200)
        .margins({top: 30, right: 50, bottom: 5, left: 40})
        .dimension(dayDimension)
        .transitionDuration(1000)
        .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 10, 2)]))
        .round(d3.time.day.round)
        .xUnits(d3.time.day)
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .group(solarGroup, 'Solar')
        .valueAccessor(function (d) {return d.value.avg;})
        .yAxisLabel("Kw/m2")
        .ordinalColors(["orange"])
        .xAxis().tickValues([]);

    //Month Humidity
    humidityChart
        .width(300)
        .height(200)
        .margins({top: 30, right: 50, bottom: 5, left: 40})
        .dimension(dayDimension)
        .transitionDuration(1000)
        .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 10, 2)]))
        .round(d3.time.day.round)
        .xUnits(d3.time.day)
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .group(humidityGroup, 'Humidity')
        .valueAccessor(function (d) {return d.value.avg;})
        .yAxisLabel("%")
        .ordinalColors(["green"])
        .xAxis().tickValues([]);

    //Month Rain
    rainChart
        .width(300)
        .height(200)
        .margins({top: 30, right: 50, bottom: 5, left: 40})
        .dimension(dayDimension)
        .transitionDuration(1000)
        .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 10, 2)]))
        .round(d3.time.day.round)
        .xUnits(d3.time.day)
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .group(rainGroup, 'Rain')
        .valueAccessor(function (d) {return d.value.avg;})
        .yAxisLabel("mm")
        .ordinalColors(["red"])
        .xAxis().tickValues([])

    //Temp, Solar, Humidity and Rain Comparator Chart
    monthCompareChart
        .width(650)
        .height(250)
        .margins({top: 30, right: 50, bottom: 20, left: 40})
        .dimension(dayDimension)
        .transitionDuration(1000)
        .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 10, 2)]))
        .round(d3.time.day.round)
        .xUnits(d3.time.day)
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
        .brushOn(false);

    //Day of Week Total Rain
    totalRainChart 
        .width(650)
        .height(180)
        .margins({top: 20, left: 10, right: 10, bottom: 20})
        .dimension(dayOfWeek)
        .group(dayOfWeekRainGroup, 'Rain')
        .valueAccessor(function (d){
            return d.value.total;   
        })
        .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
        .label(function (d) {
            return d.key.split('.')[1];
        })
        .title(function (d) {
            return d.value;
        })
        .xAxis().ticks(10);

    //Avg Temperature Box
    avgTempBox
        .formatNumber(d3.format(".1f"))
        .valueAccessor(function (d){return d.n ? d.total / d.n : 0;})
        .group(meanTemp);
    //Min Temperature Box
    minTempBox
        .formatNumber(d3.format(".1f"))
        .valueAccessor(function (d){return d.min;})
        .group(minTempGroup);
    //Max Temperature Box
    maxTempBox
        .formatNumber(d3.format(".1f"))
        .valueAccessor(function (d){return d.max;})
        .group(maxTempGroup);

    // Used as filter NOT diplayed
    totalPieRainChart
        .width(100)
        .height(100)
        .radius(250)
        .dimension(monthDimension)
        .group(rainTotalGroup);

    dc.renderAll('month');
    dc.renderAll('month-compare');
    dc.renderAll('day');

    /********************************************************
    * monthCompareChart is able to display:
    *   tempChart, rainChart, solarChart and humidityChart
    *  together on a larger chart.
    *********************************************************/

    // Solar lineChart objects to add and remove from monthCompareChart 
    var solarCompareChart = dc.lineChart(monthCompareChart)
                    .group(solarGroup, "Solar")
                    .valueAccessor(function (d) {return d.value.avg;})
                    .ordinalColors(["orange"])
                    .useRightYAxis(true);
    // Temperature lineChart objects to add and remove from monthCompareChart 
    var tempCompareChart = dc.lineChart(monthCompareChart)
                    .group(tempGroup, "Temp")
                    .valueAccessor(function (d) {return d.value.avg;})
                    .yAxisLabel("Celcius");
    // Humidity lineChart objects to add and remove from monthCompareChart 
    var humidCompareChart = dc.lineChart(monthCompareChart)
                    .group(humidityGroup, "Humid")
                    .valueAccessor(function (d) {return d.value.avg;})
                    .ordinalColors(['green'])
                    .yAxisLabel("%");;
    //  Rain lineChart objects to add and remove from monthCompareChart 
     var rainCompare = dc.lineChart(monthCompareChart)
                    .group(rainGroup, "Rain")
                    .valueAccessor(function (d) {return d.value.avg;})
                    .ordinalColors(['red'])
                    .useRightYAxis(true)
                    .yAxisLabel("mm");;
        
    //  Which lineChart is currently being shown
    var compareChartsShowing = {'solar':false,
                          'temp': false,
                          'humid':false,
                          'rain': false};
    // To store diplayed line Charts                        
    var compareChartSet = new Set();
    
    // Method to add and remove charts from monthCompareChart
    var chartClick = function (chartName, chart){
         //remove from set
        if (compareChartsShowing[chartName]){
            compareChartSet.delete(chart);
            compareChartsShowing[chartName] = false;
        }
        else{
            //add to set
            compareChartSet.add(chart);
            compareChartsShowing[chartName] = true;
        }
        monthCompareChart.compose(Array.from(compareChartSet))
        dc.renderAll('month-compare');
        dc.redrawAll('month-compare');
    }

    /**** User Chart Clicks ****/
    $("#temp-box").click(function(){chartClick('temp', tempCompareChart);});
    $("#solar-box").click(function(){chartClick('solar', solarCompareChart);});
    $("#humidity-box").click(function(){chartClick('humid', humidCompareChart);});
    $("#rain-box").click(function(){chartClick('rain', rainCompare);});
    
});//d3.csv

    /**** User Click Logic ****/
    
    //Changes scale of x axis on temp, solar, humid, rain and monthCompareChart
    function scaleMonthByRange(from, to){
        for (i = 0; i < 2; i++) { 
            tempChart.x(d3.time.scale().domain([from, to]));
            solarChart.x(d3.time.scale().domain([from, to]));
            humidityChart.x(d3.time.scale().domain([from, to]));
            rainChart.x(d3.time.scale().domain([from, to]));
            monthCompareChart.x(d3.time.scale().domain([from, to]));
            dc.redrawAll('month');
            dc.redrawAll('month-compare');
            dc.redrawAll('month-compare');
        }
    }
    // Applies filter to totalPieRainChart to change data used for
    // totalRainChart & temperature boxes
    function scaleMonthByMonth(month){
        // totalPieRainChart NOT displayed
        totalPieRainChart.filter(null);
        totalPieRainChart.filter(month);
        dc.redrawAll('day');
    }

   //Month Button Clicks
    $('#reset-button').click(function(){
        scaleMonthByMonth(null);
        scaleMonthByRange(new Date(2015, 01, 1), new Date(2015, 10, 1));
    });
    $('#january-button').click(function(){
        scaleMonthByMonth(0);
        scaleMonthByRange(new Date(2015, 00, 1), new Date(2015, 01, 1));
    });
    $('#febuary-button').click(function(){
        scaleMonthByMonth(1);
        scaleMonthByRange(new Date(2015, 01, 1), new Date(2015, 02, 1));
    });
    $('#march-button').click(function(){
        scaleMonthByMonth(2);
        scaleMonthByRange(new Date(2015, 02, 1), new Date(2015, 03, 1));
    });
    $('#april-button').click(function(){
        scaleMonthByMonth(3);
        scaleMonthByRange(new Date(2015, 03, 1), new Date(2015, 04, 1));
    });
    $('#may-button').click(function(){
        scaleMonthByMonth(4);
        scaleMonthByRange(new Date(2015, 04, 1), new Date(2015, 05, 1));
    });
    $('#june-button').click(function(){
        scaleMonthByMonth(5);
        scaleMonthByRange(new Date(2015, 05, 1), new Date(2015, 06, 1));
    });
    $('#july-button').click(function(){
        scaleMonthByMonth(6);
        scaleMonthByRange(new Date(2015, 06, 1), new Date(2015, 07, 1));
    });
    $('#august-button').click(function(){
        scaleMonthByMonth(7);
        scaleMonthByRange(new Date(2015, 07, 1), new Date(2015, 08, 1));
    });
    $('#september-button').click(function(){
        scaleMonthByMonth(8);
        scaleMonthByRange(new Date(2015, 08, 1), new Date(2015, 09, 1));
    });
    
    var dayScale = function (day){
        totalRainChart.filter(null);
        totalRainChart.filter(day);
        dc.redrawAll('day');
        dc.redrawAll('month');
        dc.redrawAll('month-compare');
    };

    //Day Clicks
    $('#day-reset-button').click(function(){
        dayScale(null);
    });
    $('#sunday-button').click(function(){
        dayScale('0.Sun');

    });
    $('#monday-button').click(function(){
        dayScale('1.Mon');
    });
    $('#tuesday-button').click(function(){
        dayScale('2.Tue');
    });
    $('#wednesday-button').click(function(){
        dayScale('3.Wed');
    });
    $('#thursday-button').click(function(){
        dayScale('4.Thu');
    });
    $('#friday-button').click(function(){
        dayScale('5.Fri');
    });
    $('#saturday-button').click(function(){
        dayScale('6.Sat');
    });



