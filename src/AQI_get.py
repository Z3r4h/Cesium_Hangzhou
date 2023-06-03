import requests

def get_station_data(keyword, token):
    url = f"https://api.waqi.info/search/?keyword={keyword}&token={token}"

    try:
        response = requests.get(url)
        response.raise_for_status()  # 检查响应是否成功

        data = response.json()
        if data["status"] == "ok":
            return data["data"]
        else:
            print("API请求失败:", data["message"])
    except requests.exceptions.RequestException as e:
        print("请求错误:", e)

    return None

# 设置API令牌和关键词
token = "15ab69d90cd615d9f3223b88c89426e8aca534ed"  # 替换为你的API令牌
keyword = "杭州"

# 获取杭州市内每个测量站的数据
station_data = get_station_data(keyword, token)
if station_data:
    for station in station_data:
        uid = station["uid"]
        aqi = station["aqi"]
        name = station["station"]["name"]
        geo = station["station"]["geo"]

        print("监测站ID:", uid)
        print("监测站名称:", name)
        print("实时空气质量指数:", aqi)
        print("监测站地理坐标：",geo)
        print("---")


import csv

# 设置CSV文件路径
csv_file_path = "D:/GitHub/杭州市绿色生活出行系统/src/result/aqi_data.csv"

# 将AQI数据写入CSV文件
with open(csv_file_path, 'w', newline='') as csvfile:
    fieldnames = ['UID', 'NAME', 'AQI', 'geometry']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for station in station_data:
        uid = station["uid"]
        aqi = station["aqi"]
        name = station["station"]["name"]
        geo = station["station"]["geo"]

        writer.writerow({'UID': uid, 'NAME': name, 'AQI': aqi, 'geometry': geo})


