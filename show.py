# -*- coding:utf-8 -*- 
import json
import time
import matplotlib.pyplot as plt

def showPie(label, size, title):
    fig1, ax = plt.subplots()
    label = [str(v)+'('+str(size[i])+')' for i,v in enumerate(label)]
    ax.pie(size, labels=label, autopct='%1.1f%%', startangle=90)
    ax.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle.
    ax.set_title(title)
    plt.show()

def showBar(size, title):
    width = 5
    x = [i*width for i in range(0,24)]
    xticks = [i+width/2 for i in x]
    xlabels = [str(i) for i in range(0,24)]

    fig1, ax = plt.subplots()
    rects = ax.bar(x, size, width)
    ax.set_title(title)
    ax.set_xticks(xticks)
    ax.set_xticklabels(xlabels)

    #显示具体高度
    for rect in rects:
        height = rect.get_height()
        ax.text(rect.get_x() + rect.get_width()/2., 1.05*height,
            '%d' % int(height),
            ha='center', va='bottom')
    plt.show()

base_dir = '.'
year = '2017'
date = raw_input("输入日期(MMDD):")
type = raw_input("输入查询类型(1-ip,2-browser,3-api):")
if type == '1':
    with open(base_dir+'/'+year+date+'/ip.js') as file_to_read:
        file_json = json.loads(file_to_read.read())
        ips = []; counts = []
        for ip,count in file_json.items():
            ips.append(ip)
            counts.append(count)
        showPie(ips, counts, year+date)
elif type == '2':
    with open(base_dir+'/'+year+date+'/browser.js') as file_to_read:
        file_json = json.loads(file_to_read.read())
        browsers = []; counts = []
        for browser,count in file_json.items():
            browsers.append(browser)
            counts.append(count)
        showPie(browsers, counts, year+date)
else:
    with open(base_dir+'/'+year+date+'/api.js') as file_to_read:
        file_json = json.loads(file_to_read.read())
        api_str = ','.join(['"'+api+'"' for api in file_json.keys()])
        print api_str
        api = raw_input("输入需要查询的api:")
        count = file_json[api]['count']
        timestamps = file_json[api]['timestamp']
        times = [time.strftime("%H", time.localtime(int(timestamp/1000))) for timestamp in timestamps]
        times_count = [0 for i in range(0, 24)]
        for key in times:
            times_count[int(key)] += 1
        showBar(times_count, year+date+':'+api)