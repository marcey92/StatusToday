
// Charts

var tempChart = dc.lineChart('#temp-chart', 'month');
var solarChart = dc.lineChart('#solar-chart', 'month');
var humidityChart = dc.lineChart('#humidity-chart', 'month');
var rainChart = dc.lineChart('#rain-chart', 'month');

var monthCompareChart = dc.compositeChart('#month-compare-chart', 'month');

var totalRainChart = dc.rowChart('#day-rain-chart', 'day');
var chanceRain = dc.pieChart('#chance-of-rain', 'day')
var totalPieRainChart = dc.pieChart('#month-rain', 'day');

var tempND    = dc.numberDisplay("#avg-temp-box", 'day');


// Load Data
d3.csv('data/JCMB_2015_hour.csv', function(data){
    var dateFormat = d3.time.format('%d/%m/%Y %H');
    var numberFormat = d3.format('.2f');

    data.forEach(function (d){
        d.dd = dateFormat.parse(d['date-time']);
        d.hour = d3.time.hour(d.dd);
        d.day = d3.time.day(d.dd);
        d.month = d3.time.month(d.dd);
        d.atmos = +d['atmospheric pressure (mBar)'];
        d.rain = +d['rainfall (mm)'];
        d.windSpeed = +d['wind speed (m/s)'];
        d.windDirection = +d['wind direction (degrees)'];
        d.temp = +d['surface temperature (C)'];
        d.humidity = +d['relative humidity (%)'];
        d.solar = +d['solar flux (Kw/m2)'];
        d.battery = +d['battery (V)'];
    });

    console.log(data[0]);
    console.log(data[data.length-1]);

    // PLAN:
    // ALL DAY DIMENSION!
    // rainfall (mm)	
    // wind speed (m/s)	
    // surface temperature (C)	
    // relative humidity (%)	
    // solar flux (Kw/m2)	

    // Crossfilter 
    var ndx = crossfilter(data);
    var all = ndx.groupAll();

    var dayDimension = ndx.dimension(function (d){
       return d.day; 
    });

    var monthDimension = ndx.dimension(function (d){
       return d.month.getMonth();
    });

    var rainTotalGroup = monthDimension.group().reduceSum(function (d) {
        return d.rain;
    });

    // day of week
    var dayOfWeek = ndx.dimension(function (d) {
        var day = d.dd.getDay();
        var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return day + '.' + name[day];
    });
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

    // rain or not
    var rainOrNot = ndx.dimension(function (d) {
        return d.rain > 0 ? 'Rain' : 'No Rain';
    });
    var rainOrNotGroup = rainOrNot.group();

    // mean temp for number
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
          function () { return {n:0,total:0}; }
    );

    var average = function (d){
        return d.n ? d.total / d.n : 0;
    };


    
    // avg rainfall (mm)	
    var avgRain = dayDimension.group().reduce(
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

    // wind speed (m/s)	
    var avgWindSpeed = dayDimension.group().reduce(
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
    var avgTemp = dayDimension.group().reduce(
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
    var avgHumidity = dayDimension.group().reduce(
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
    var avgSolar = dayDimension.group().reduce(
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


    //---Charts---

    //Charts -- temp
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
        .brushOn(true)
        .renderHorizontalGridLines(true)
        .group(avgTemp, 'Temp')
        .valueAccessor(function (d) {
            return d.value.avg;
         })
         .yAxisLabel("Celcius")
        .xAxis().tickValues([]);


    //Charts -- Solar
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

        .group(avgSolar, 'Solar')
        .valueAccessor(function (d) {
           return d.value.avg;
        })
        .yAxisLabel("Kw/m2")
        .ordinalColors(["orange"])
        .xAxis().tickValues([]);

    //Charts -- Humidity
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

        .group(avgHumidity, 'Humidity')
        .valueAccessor(function (d) {
        return d.value.avg;
        })
        .yAxisLabel("%")
        .ordinalColors(["green"])
        .xAxis().tickValues([]);

    //Charts -- rain
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
        .group(avgRain, 'Rain')
        .valueAccessor(function (d) {
            return d.value.avg;
         })
         .yAxisLabel("mm")
         .ordinalColors(["red"])
         .xAxis().tickValues([]);


    //Chars - serface temperature and voltage
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

    //Charts - total rain
    totalRainChart 
        .width(400)
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

    totalPieRainChart
        .width(100)
        .height(100)
        .radius(250)
        .dimension(monthDimension)
        .group(rainTotalGroup);

    chanceRain
        .width(200)
        .height(200)
        .radius(100)
        .dimension(rainOrNot)
        .group(rainOrNotGroup);

    tempND
        .formatNumber(d3.format(".3s"))
        .valueAccessor(average)
        .group(meanTemp);

        
        

    dc.renderAll('month');
    dc.renderAll('day');


    var solarCompare = dc.lineChart(monthCompareChart)
                    .group(avgSolar, "Solar")
                    .valueAccessor(function (d) {
                        return d.value.avg;
                    })
                    .ordinalColors(["orange"])
                    .useRightYAxis(true);

    var tempCompare = dc.lineChart(monthCompareChart)
                    .group(avgTemp, "Temp")
                    .valueAccessor(function (d) {
                        return d.value.avg;
                    });

    var humidCompare = dc.lineChart(monthCompareChart)
                    .group(avgHumidity, "Humid")
                    .valueAccessor(function (d) {
                        return d.value.avg;
                    })
                    .ordinalColors(['green']);

     var rainCompare = dc.lineChart(monthCompareChart)
                    .group(avgRain, "Rain")
                    .valueAccessor(function (d) {
                        return d.value.avg;
                    })
                    .ordinalColors(['red'])
                    .useRightYAxis(true);
        
    var compareShowing = {'solar':false,
                          'temp': false,
                          'humid':false,
                          'rain': false};

    var compareCharts = new Set();
    
    //Chark Clicks
    $("#temp-box").click(function(){        
        if (compareShowing.temp){
            //remove from set
            compareCharts.delete(tempCompare);
            compareShowing.temp = false;
        }
        else{
            //add to set
            compareCharts.add(tempCompare);
            compareShowing.temp = true;
        }
        console.log(compareCharts);
        monthCompareChart.compose(Array.from(compareCharts))
        dc.renderAll();
    });

    $("#solar-box").click(function(){
        console.log('solar');        
        if (compareShowing.solar){
            //remove from set
            compareCharts.delete(solarCompare);
            compareShowing.solar = false;
        }
        else{
            //add to set
            compareCharts.add(solarCompare);
            compareShowing.solar = true;
        }
        console.log(compareCharts);
        monthCompareChart.compose(Array.from(compareCharts))
        dc.renderAll();
    });

    $("#humidity-box").click(function(){
        console.log('humid');        
        if (compareShowing.humid){
            //remove from set
            compareCharts.delete(humidCompare);
            compareShowing.humid = false;
        }
        else{
            //add to set
            compareCharts.add(humidCompare);
            compareShowing.humid = true;
        }
        console.log(compareCharts);
        monthCompareChart.compose(Array.from(compareCharts))
        dc.renderAll();
    });

    $("#rain-box").click(function(){
        console.log('rain');        
        if (compareShowing.rain){
            //remove from set
            compareCharts.delete(rainCompare);
            compareShowing.rain = false;
        }
        else{
            //add to set
            compareCharts.add(rainCompare);
            compareShowing.rain = true;
        }
        console.log(compareCharts);
        monthCompareChart.compose(Array.from(compareCharts))
        dc.renderAll('month');
    });
    
    


});//d3.csv


   //Month Clicks
    $('#reset-button').click(function(){
        monthScale(null);
        monthRangeScale(new Date(2015, 01, 1), new Date(2015, 10, 1));
    });
    $('#january-button').click(function(){
        monthScale(0);
        monthRangeScale(new Date(2015, 00, 1), new Date(2015, 01, 1));
    });
    $('#febuary-button').click(function(){
        monthScale(1);
        monthRangeScale(new Date(2015, 01, 1), new Date(2015, 02, 1));
    });
    $('#march-button').click(function(){
        monthScale(2);
        monthRangeScale(new Date(2015, 02, 1), new Date(2015, 03, 1));
    });
    $('#april-button').click(function(){
        monthScale(3);
        monthRangeScale(new Date(2015, 03, 1), new Date(2015, 04, 1));
    });
    $('#may-button').click(function(){
        monthScale(4);
        monthRangeScale(new Date(2015, 04, 1), new Date(2015, 05, 1));
    });
    $('#june-button').click(function(){
        monthScale(5);
        monthRangeScale(new Date(2015, 05, 1), new Date(2015, 06, 1));
    });
    $('#july-button').click(function(){
        monthScale(6);
        monthRangeScale(new Date(2015, 06, 1), new Date(2015, 07, 1));
    });
    $('#august-button').click(function(){
        monthScale(7);
        monthRangeScale(new Date(2015, 07, 1), new Date(2015, 08, 1));
    });
    $('#september-button').click(function(){
        monthScale(8);
        monthRangeScale(new Date(2015, 08, 1), new Date(2015, 09, 1));
    });
    

    function monthRangeScale(from, to){
        for (i = 0; i < 2; i++) { 
            tempChart.x(d3.time.scale().domain([from, to]));
            solarChart.x(d3.time.scale().domain([from, to]));
            humidityChart.x(d3.time.scale().domain([from, to]));
            rainChart.x(d3.time.scale().domain([from, to]));
            monthCompareChart.x(d3.time.scale().domain([from, to]));
            dc.redrawAll('month');
            dc.redrawAll('month');
        }
    }

    function monthScale(month){
        totalPieRainChart.filter(null);
        totalPieRainChart.filter(month);
        dc.redrawAll('day')
    }

    //Day Clicks
    $('#day-reset-button').click(function(){
        totalRainChart.filter(null);
        dc.redrawAll('day');
    });
    $('#sunday-button').click(function(){
        totalRainChart.filter(null);
        totalRainChart.filter('0.Sun');
        dc.redrawAll('day');
    });
    $('#monday-button').click(function(){
        totalRainChart.filter(null);
        totalRainChart.filter('1.Mon');
        dc.redrawAll('day');
    });
    $('#tuesday-button').click(function(){
        totalRainChart.filter(null);
        totalRainChart.filter('2.Tue');
        dc.redrawAll('day');
    });
    $('#wednesday-button').click(function(){
        totalRainChart.filter(null);
        totalRainChart.filter('3.Wed');
        dc.redrawAll('day');
    });
    $('#thursday-button').click(function(){
        totalRainChart.filter(null);
        totalRainChart.filter('4.Thu');
        dc.redrawAll('day');
    });
    $('#friday-button').click(function(){
        totalRainChart.filter(null);
        totalRainChart.filter('5.Fri');
        dc.redrawAll('day');
    });
    $('#saturday-button').click(function(){
        totalRainChart.filter(null);
        totalRainChart.filter('6.Sat');
        dc.redrawAll('day');
    });



