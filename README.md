
# Status Today Task


### My Use Case

Your company ground is able to lease it's land January to September for speciel events. Unfortunalty due to it's location, a remote valley with a unique climate, national weather data is unabel to predict the local climate. This makes pricing the ground difficult.
A weather machine has been set up and has monitored the weather over the last year. The manager wants to stager the price of the lease by month and by the day of the week: better weather meaning a higher price.
This dashboard allows you to view the most relevent data to make your decisions on when the price could be high or low to maximse customers and profit.


## Dimensions used

Used Day, Month, and Day of the Week for dimensions for the charts which averaged and summed the values when filtering.

The minimum and maximum temperature are computed using reductio.js on the crossfilter groups and are displayed in the boxes. This allows filtering to work on the min and max. 

## Data used

Used Rain, Surface Temperature, Humidity and Solar. Battery and Atmospheric pressure varied very little. I felt wind and wind direction would bloat the dashboard.

## To Run

I've just been running it with

    python -m SimpleHTTPServer 8000

and accessing

    http://localhost:8000/index.html




