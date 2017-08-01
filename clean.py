# remove mins that dont fit data
#

import csv
from collections import defaultdict
import re


#reader = csv.DictReader(open('JCMB_2015.csv', 'r'),  delimiter=',')
#writer = csv.writer(open('JCMB_2015_clean.csv', 'w'), delimiter=',', quotechar='"', quoting=csv.QUOTE_NONE )
date_pattern = re.compile("[0-9]{2}\/[0-9]{2}\/[0-9]{4} [0-9]{2}:[0-9]{2}")

reader = open('JCMB_2015.csv', 'r')
writer = open('JCMB_2015_clean.csv', 'w')
writer.write(reader.readline())

write = False
after_date_time = ''

for row in reader:
    if write:
        date_midnight = row.split(',')[0][:-5] + '00:00'
        missing_line = ','.join([date_midnight] + after_date_time)
        writer.write(missing_line)
        write = False
    if(date_pattern.match(row.split(',')[0])):
        writer.write(row)
    else:
        write = True
        after_date_time = row.split(',')[1:]

reader.close()
writer.close()
