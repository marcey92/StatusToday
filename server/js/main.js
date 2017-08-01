
// Charts
var atmosChart = dc.lineChart('#atmos-chart');
var rainChart = dc.lineChart('#rain-chart');
var windChart = dc.lineChart('#wind-chart');
var windDirectionChart = dc.lineChart('#direction-chart');
var tempChart = dc.lineChart('#temp-chart');
var humidityChart = dc.lineChart('#humidity-chart');
var solarChart = dc.lineChart('#solar-chart');
var batteryChart = dc.lineChart('#battery-chart');

var tempSolarChart = dc.compositeChart('#temp-solar-chart');

var solarHumidityChart = dc.compositeChart('#solar-humidity-chart');


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
    // atmospheric pressure (mBar)	
    // rainfall (mm)	
    // wind speed (m/s)	
    // wind direction (degrees)	
    // surface temperature (C)	
    // relative humidity (%)	
    // solar flux (Kw/m2)	
    // battery (V)

    // Crossfilter 
    var ndx = crossfilter(data);
    var all = ndx.groupAll();

    var hourDimension = ndx.dimension(function (d){
       return d.hour;
    });

    var dayDimension = ndx.dimension(function (d){
       return d.day; 
    });

    var monthlyDimension = ndx.dimension(function (d){
        return d.month;
    });


    // atmospheric pressure (mBar)	
    var avgAtmosPressure = dayDimension.group().reduce(
        function (p, v) {
            ++p.days;
            p.total += v.atmos;
            p.avg = Math.round((p.total / p.days)*100)/100;
            return p;
        },
        function (p, v) {
            --p.days;
            p.total -= v.atmos;
            p.avg = p.days ? Math.round((p.total / p.days)*100)/100 : 0;
            return p;
        },
        function () {
            return {days: 0, total: 0, avg: 0};
        }
    );

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

    // wind direction (degrees)	

    var avgWindDirectionHour = hourDimension.group().reduce(
        function (p, v) {
            ++p.days;
            p.total += v.windDirection;
            p.avg = Math.round((p.total / p.days)*100)/100;
            return p;
        },
        function (p, v) {
            --p.days;
            p.total -= v.windDirection;
            p.avg = p.days ? Math.round((p.total / p.days)*100)/100 : 0;
            return p;
        },
        function () {
            return {days: 0, total: 0, avg: 0};
        }
    );

    var avgWindDirection = dayDimension.group().reduce(
        function (p, v) {
            ++p.days;
            p.total += v.windDirection;
            p.avg = Math.round((p.total / p.days)*100)/100;
            return p;
        },
        function (p, v) {
            --p.days;
            p.total -= v.windDirection;
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
    // battery (V)
    var avgBattery = dayDimension.group().reduce(
        function (p, v) {
            ++p.days;
            p.total += v.battery;
            p.avg = Math.round((p.total / p.days)*100)/100;
            return p;
        },
        function (p, v) {
            --p.days;
            p.total -= v.battery;
            p.avg = p.days ? Math.round((p.total / p.days)*100)/100 : 0;
            return p;
        },
        function () {
            return {days: 0, total: 0, avg: 0};
        }
    );

    // temp & solar

    var dim  = ndx.dimension(dc.pluck('date-time')),
        grp1 = dim.group().reduceSum(dc.pluck('surface temperature (C)')),
        grp2 = dim.group().reduceSum(dc.pluck('solar flux (Kw/m2)'));

    //---Charts---
    //Charts -- atmospheric pressure
    atmosChart.renderArea(false)
        .width(800)
        .height(200)
        .margins({top: 30, right: 10, bottom: 20, left: 10})
        .dimension(dayDimension)
        .transitionDuration(1000)
        .mouseZoomable(true)
        
        .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 10, 2)]))
        .round(d3.time.day.round)
        .xUnits(d3.time.day)
        .elasticY(true)
        .renderHorizontalGridLines(false)

        .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
        .brushOn(false)

         .group(avgAtmosPressure, 'Atmos')
         .valueAccessor(function (d) {
            return d.value.avg;
         })
         .yAxisLabel("mBar")

    //Charts -- rain
    rainChart.renderArea(false)
        .width(800)
        .height(200)
        .margins({top: 30, right: 50, bottom: 20, left: 40})
        .dimension(dayDimension)
        .transitionDuration(1000)
        .mouseZoomable(true)
        
        .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 10, 2)]))
        .round(d3.time.day.round)
        .xUnits(d3.time.day)
        .elasticY(true)
        .renderHorizontalGridLines(false)

        .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
        .brushOn(false)

         .group(avgRain, 'Rain')
         .valueAccessor(function (d) {
            return d.value.avg;
         })
         .yAxisLabel("mm")

    //Charts -- wind
    windChart.renderArea(false)
        .width(800)
        .height(200)
        .margins({top: 30, right: 50, bottom: 20, left: 40})
        .dimension(dayDimension)
        .transitionDuration(1000)
        .mouseZoomable(true)
        
        .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 10, 2)]))
        .round(d3.time.day.round)
        .xUnits(d3.time.day)
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)

        .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
        .brushOn(true)

        .group(avgWindSpeed, 'Wind')
        .valueAccessor(function (d) {
            return d.value.avg;
         })
         .yAxisLabel("m/s")

    //Charts -- wind direction
    windDirectionChart.renderArea(false)
        .width(800)
        .height(200)
        .margins({top: 30, right: 50, bottom: 20, left: 40})
        .dimension(dayDimension)
        .transitionDuration(1000)
        .mouseZoomable(true)
        
        .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 10, 1)]))
        .round(d3.time.day.round)
        .xUnits(d3.time.day)
        .elasticY(true)
        .renderHorizontalGridLines(false)

        .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
        .brushOn(false)

         .group(avgWindDirection, 'Wind Direction')
         .valueAccessor(function (d) {
            return d.value.avg;
         })
         .yAxisLabel("Degrees")
    
         .evadeDomainFilter(true)
         
    //Charts -- temp
    tempChart.renderArea(false)
        .width(800)
        .height(200)
        .margins({top: 30, right: 50, bottom: 20, left: 40})
        .dimension(dayDimension)
        .transitionDuration(1000)
        .mouseZoomable(true)
        
        .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 10, 2)]))
        .round(d3.time.day.round)
        .xUnits(d3.time.day)
        .elasticY(true)
        .renderHorizontalGridLines(false)

        .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
        .brushOn(false)

         .group(avgTemp, 'Temp')
         .valueAccessor(function (d) {
            return d.value.avg;
         })
         .yAxisLabel("C")

    //Charts -- humidity
    humidityChart.renderArea(false)
        .width(800)
        .height(200)
        .margins({top: 30, right: 50, bottom: 20, left: 40})
        .dimension(dayDimension)
        .transitionDuration(1000)
        .mouseZoomable(true)
        
        .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 10, 2)]))
        .round(d3.time.day.round)
        .xUnits(d3.time.day)
        .elasticY(true)
        .renderHorizontalGridLines(false)

        .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
        .brushOn(false)

         .group(avgHumidity, 'Humidity')
         .valueAccessor(function (d) {
            return d.value.avg;
         })
         .yAxisLabel("%")

    //Charts -- Solar
    solarChart.renderArea(false)
        .width(800)
        .height(200)
        .margins({top: 30, right: 50, bottom: 20, left: 40})
        .dimension(dayDimension)
        .transitionDuration(1000)
        .mouseZoomable(true)
        
        .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 10, 2)]))
        .round(d3.time.day.round)
        .xUnits(d3.time.day)
        .elasticY(true)
        .renderHorizontalGridLines(false)

        .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
        .brushOn(false)

         .group(avgSolar, 'Solar')
         .valueAccessor(function (d) {
            return d.value.avg;
         })
         .yAxisLabel("Kw/m2")

    //Charts -- Battery
    batteryChart.renderArea(false)
        .width(800)
        .height(200)
        .margins({top: 30, right: 50, bottom: 20, left: 40})
        .dimension(dayDimension)
        .transitionDuration(1000)
        .mouseZoomable(true)
        
        .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 10, 2)]))
        .round(d3.time.day.round)
        .xUnits(d3.time.day)
        .elasticY(true)
        .renderHorizontalGridLines(false)

        .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
        .brushOn(false)

         .group(avgBattery, 'Battery')
         .valueAccessor(function (d) {
            return d.value.avg;
         })
         .yAxisLabel("V")

    //Chars - serface temperature and voltage

    tempSolarChart
        .width(800)
        .height(200)
        .margins({top: 30, right: 50, bottom: 20, left: 40})
        .dimension(dayDimension)
        .transitionDuration(1000)
        .mouseZoomable(true)
        
        .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 10, 2)]))
        .round(d3.time.day.round)
        .xUnits(d3.time.day)
        .elasticY(true)
        .renderHorizontalGridLines(false)

        .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
        .brushOn(true)
        .compose([
            dc.lineChart(tempSolarChart)
                    .renderArea(false)
                    .group(avgTemp, "Monthly Index Average")
                    .valueAccessor(function (d) {
                        return d.value.avg;
                    }),
            dc.lineChart(tempSolarChart)
                    .renderArea(false)
                    .group(avgSolar, "Monthly Index Move")
                    .valueAccessor(function (d) {
                        return d.value.avg;
                    })
                    .title(function (d) {
                        var value = d.value.avg ? d.value.avg : d.value;
                        if (isNaN(value)) value = 0;
                        return dateFormat(d.key) + "\n" + numberFormat(value);
                    })
                    .ordinalColors(["orange"])
                    .useRightYAxis(true)
                    .y(d3.scale.linear().range([0.4, 0]))
        ])

    solarHumidityChart
        .width(800)
        .height(200)
        .margins({top: 30, right: 50, bottom: 20, left: 40})
        .dimension(dayDimension)
        .transitionDuration(1000)
        .mouseZoomable(true)
        
        .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 10, 2)]))
        .round(d3.time.day.round)
        .xUnits(d3.time.day)
        .elasticY(true)
        .renderHorizontalGridLines(false)

        .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
        .brushOn(true)
        .compose([
            dc.lineChart(solarHumidityChart)
                    .renderArea(false)
                    .group(avgHumidity, "Monthly Index Average")
                    .valueAccessor(function (d) {
                        return d.value.avg;
                    }),
            dc.lineChart(solarHumidityChart)
                    .renderArea(false)
                    .group(avgSolar, "Monthly Index Move")
                    .valueAccessor(function (d) {
                        return d.value.avg;
                    })
                    .title(function (d) {
                        var value = d.value.avg ? d.value.avg : d.value;
                        if (isNaN(value)) value = 0;
                        return dateFormat(d.key) + "\n" + numberFormat(value);
                    })
                    .ordinalColors(["orange"])
                    .useRightYAxis(true)
        ])

        dc.renderAll();   



});//d3.csv





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