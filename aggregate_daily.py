# TO aggregate csv averaging into hours and days for examining
# 01/01/2015 00:01

import csv
from collections import defaultdict
from collections import OrderedDict

daily = OrderedDict()

reader = csv.DictReader(open('JCMB_2015_clean.csv', 'r'),  delimiter=',')

for row in reader:
    # collect by hour
    day = row['date-time'][:-6]
    row.pop('date-time')

    for key, val in row.iteritems():
        row[key] = float(val)

    if daily.has_key(day):
        for attrib, val in row.iteritems():
            daily[day][attrib] += float(val)
    else:
        daily[day] = row

writer = csv.DictWriter(open('JCMB_2015_day.csv','w'),reader.fieldnames)
writer.writeheader()
for day, attribs in daily.iteritems():
    for attrib, val in attribs.iteritems():
        attribs[attrib] = val/1440 # mins in a day
        if attrib == 'wind direction (degrees)' or attrib == 'rainfall (mm)' or attrib == 'relative humidity (%)':
            attribs[attrib] = str("%.1f" % attribs[attrib])
        if attrib == 'atmospheric pressure (mBar)':
            attribs[attrib] = str("%.0f" % attribs[attrib])
        if attrib == 'solar flux (Kw/m2)':
            attribs[attrib] = str("%.7f" % attribs[attrib])
        if attrib == 'wind speed (m/s)' or attrib == 'surface temperature (C)' or attrib == 'battery (V)':
            attribs[attrib] = str("%.2f" % attribs[attrib])
    attribs['date-time'] = day
    writer.writerow(attribs)


