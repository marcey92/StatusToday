
// Charts

var tempChart = dc.lineChart('#temp-chart');
var solarChart = dc.lineChart('#solar-chart');
var humidityChart = dc.lineChart('#humidity-chart');
var rainChart = dc.lineChart('#rain-chart');

var monthCompareChart = dc.compositeChart('#month-compare-chart');

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

    // rainfall (mm)	
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
        .height(300)
        .margins({top: 30, right: 50, bottom: 20, left: 40})
        .dimension(dayDimension)
        .transitionDuration(1000)

        .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 10, 2)]))
        .round(d3.time.day.round)
        .xUnits(d3.time.day)
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .group(avgTemp, 'Temp')
        .valueAccessor(function (d) {
            return d.value.avg;
         })
         .yAxisLabel("Celcius")

    //Charts -- Solar
    solarChart
        .width(300)
        .height(300)
        .margins({top: 30, right: 50, bottom: 20, left: 40})
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

    //Charts -- Humidity
    humidityChart
        .width(300)
        .height(300)
        .margins({top: 30, right: 50, bottom: 20, left: 40})
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

    //Charts -- rain
    rainChart
        .width(300)
        .height(300)
        .margins({top: 30, right: 50, bottom: 20, left: 40})
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
         .yAxisLabel("%")
         .ordinalColors(["red"])

    //Chars - serface temperature and voltage
    monthCompareChart
        .width(800)
        .height(300)
        .margins({top: 30, right: 50, bottom: 20, left: 40})
        .dimension(dayDimension)
        .transitionDuration(1000)
        
        .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 10, 2)]))
        .round(d3.time.day.round)
        .xUnits(d3.time.day)
        .elasticY(true)
        .renderHorizontalGridLines(true)

        .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))

    dc.renderAll();

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
  
    //Month Clicks
    $('#august-button').click(function(){
        console.log('here');
        // focus some other chart to the range selected by user on this chart
        tempChart.x(d3.time.scale().domain([new Date(2015, 08, 1), new Date(2015, 09, 1)]));
        tempChart.rescale();
        tempChart.redraw();
    });

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
        dc.renderAll();
    });
    
    


});//d3.csv


   //Month Clicks
    $('#reset-button').click(function(){
        monthScale(new Date(2015, 01, 1), new Date(2015, 10, 1));
    });
    $('#january-button').click(function(){
        monthScale(new Date(2015, 01, 1), new Date(2015, 02, 1));
    });
    $('#febuary-button').click(function(){
        monthScale(new Date(2015, 02, 1), new Date(2015, 03, 1));
    });
    $('#march-button').click(function(){
        monthScale(new Date(2015, 03, 1), new Date(2015, 04, 1));
    });
    $('#april-button').click(function(){
        monthScale(new Date(2015, 04, 1), new Date(2015, 05, 1));
    });
    $('#may-button').click(function(){
        monthScale(new Date(2015, 05, 1), new Date(2015, 06, 1));
    });
    $('#june-button').click(function(){
        monthScale(new Date(2015, 06, 1), new Date(2015, 07, 1));
    });
    $('#july-button').click(function(){
        monthScale(new Date(2015, 07, 1), new Date(2015, 08, 1));
    });
    $('#august-button').click(function(){
        monthScale(new Date(2015, 08, 1), new Date(2015, 09, 1));
    });
    $('#september-button').click(function(){
        monthScale(new Date(2015, 09, 1), new Date(2015, 10, 1));
    });
    

    function monthScale(from, to){
        tempChart.x(d3.time.scale().domain([from, to]));
        solarChart.x(d3.time.scale().domain([from, to]));
        humidityChart.x(d3.time.scale().domain([from, to]));
        rainChart.x(d3.time.scale().domain([from, to]));
        monthCompareChart.x(d3.time.scale().domain([from, to]));
        tempChart.rescale();
        tempChart.redraw();
        solarChart.rescale();
        solarChart.redraw();
        humidityChart.rescale();
        humidityChart.redraw();
        rainChart.rescale();
        rainChart.redraw();
        monthCompareChart.rescale();
        monthCompareChart.redraw();
    }

    








    // // var indexAvgMonthGroup = monthlyDimension.group().reduce(
    // //     function (p, v){
    // //         ++p.day;
    // //         p.total
    // //     }
    // // )

    // // May come back too -  will need min power to max
    // // var monthlyPerformanceGroup = monthlyDimension.group().reduce(
    // //  
    // // );

    // // Create chart

    // // solarPowerChart /* dc.barChart(#solar-power) */
    // //     .width(420)
    // //     .height(180)
    // //     .margins({top:10, right:50, bottom: 30, left:40})
    // //     .dimensions(monthlyDimension)
    // //     .group(monthlyDimension.group())
    // //     .elasticY(true);

    // // Bar chart that matches area chart - or something
    // solarPowerChart.width(990)
    //     .height(100)
    //     .margins({top: 0, right: 50, bottom: 20, left: 40})
    //     .dimension(monthlyDimension)
    //     .group(avgPowerMonth)
    //     .centerBar(true)
    //     .gap(1)
    //     .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 10, 2)]))
    //     .round(d3.time.month.round)
    //     .alwaysUseRounding(true)
    //     .xUnits(d3.time.months);