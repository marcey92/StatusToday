# TO aggregate csv averaging into hours and days for examining
# 01/01/2015 00:01

import csv
from collections import defaultdict
from collections import OrderedDict


hourly = OrderedDict()
daily = []

reader = csv.DictReader(open('JCMB_2015_clean.csv', 'r'),  delimiter=',')

hour_before = ' 01/01/2015 00'
for row in reader:
    # collect by hour
    date_hour = row['date-time'][:-3]
    row.pop('date-time')

    for key, val in row.iteritems():
        row[key] = float(val)

    if hourly.has_key(date_hour):
        for attrib, val in row.iteritems():
            hourly[date_hour][attrib] += float(val)
    else:
        hourly[date_hour] = row

writer = csv.DictWriter(open('JCMB_2015_hour.csv','w'),reader.fieldnames)
writer.writeheader()
for hour, attribs in hourly.iteritems():
    for attrib, val in attribs.iteritems():
        attribs[attrib] = val/60 # mins in an hour
        if attrib == 'wind direction (degrees)' or attrib == 'rainfall (mm)' or attrib == 'relative humidity (%)':
            attribs[attrib] = str("%.1f" % attribs[attrib])
        if attrib == 'atmospheric pressure (mBar)':
            attribs[attrib] = str("%.0f" % attribs[attrib])
        if attrib == 'solar flux (Kw/m2)':
            attribs[attrib] = str("%.7f" % attribs[attrib])
        if attrib == 'wind speed (m/s)' or attrib == 'surface temperature (C)' or attrib == 'battery (V)':
            attribs[attrib] = str("%.2f" % attribs[attrib])
    attribs['date-time'] = hour
    writer.writerow(attribs)


