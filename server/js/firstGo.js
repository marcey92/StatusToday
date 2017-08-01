
// Charts

var tempChart = dc.lineChart('#temp-chart');
var solarChart = dc.lineChart('#solar-chart');

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
    tempChart.renderArea(false)
        .width(600)
        .height(400)
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
    solarChart.renderArea(false)
        .width(600)
        .height(400)
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

    //Chars - serface temperature and voltage
    monthCompareChart
        .width(800)
        .height(400)
        .margins({top: 30, right: 50, bottom: 20, left: 40})
        .dimension(dayDimension)
        .transitionDuration(1000)
        
        .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 10, 2)]))
        .round(d3.time.day.round)
        .xUnits(d3.time.day)
        .elasticY(true)
        .renderHorizontalGridLines(true)

        .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
        .compose([
            dc.lineChart(monthCompareChart)
                    .group(avgTemp, "Monthly Index Average")
                    .valueAccessor(function (d) {
                        return d.value.avg;
                    }),
            dc.lineChart(monthCompareChart)
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

    dc.renderAll();

    var solarCompare = dc.lineChart(monthCompareChart)
                    .group(avgTemp, "Monthly Index Average")
                    .valueAccessor(function (d) {
                        return d.value.avg;
                    });
    var tempCompare = dc.lineChart(monthCompareChart)
                    .group(avgTemp, "Monthly Index Average")
                    .valueAccessor(function (d) {
                        return d.value.avg;
                    });

    var compareShowing = {'solar':false,
                          'temp': false};

    var compareCharts = [];

    //Month Clicks
    $("#suface-box").click(function(){
        console.log('clicked');
        monthCompareChart.compose([
                dc.lineChart(monthCompareChart)
                        .group(avgTemp, "Monthly Index Average")
                        .valueAccessor(function (d) {
                            return d.value.avg;
                        })
        ])
        dc.renderAll('monthCompareChart');
    });

    $("#solar-box").click(function(){
        console.log('clicked');
        monthCompareChart.compose([
            dc.lineChart(monthCompareChart)
                    .group(avgSolar, "Monthly Index Move")
                    .valueAccessor(function (d) {
                        return d.value.avg;
                    })
                    .ordinalColors(["orange"])
                    .useRightYAxis(false)
        ]);
        dc.renderAll('monthCompareChart');
    });


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