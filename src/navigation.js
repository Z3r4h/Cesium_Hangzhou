// navigation.js
// 定位、搜索提示、导航功能
// 使用高德API
// div.mapNavigation

// 导入高德底图至单独的容器
var gdmap = new AMap.Map('mapNavigation', {
    resizeEnable: true, //是否监控地图容器尺寸变化
    zoom: 11, //初始化地图层级
    center: [120.155070, 30.274085], //初始化地图中心点
    // viewMode: '3D',
});

// 定位到当前位置
gdmap.plugin('AMap.Geolocation', function () {
    geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,//是否使用高精度定位，默认:true
        timeout: 10000,          //超过10秒后停止定位，默认：无穷大
        maximumAge: 0,           //定位结果缓存0毫秒，默认：0
        convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
        showButton: true,        //显示定位按钮，默认：true
        buttonDom: '<svg class="icon" aria-hidden="true"><use xlink:href="#icon-dingwei"></use></svg>', // 自定义定位按钮的内容
        buttonPosition: 'RT',    //定位按钮停靠位置，默认：'LB'，左下角
        buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
        showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
        showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
        panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
        zoomToAccuracy: true,     //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        useNative: true,
    });
    gdmap.addControl(geolocation);
    geolocation.getCurrentPosition();
    AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
    AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
})

// 搜索框输入提示 - 高德API - 配额每日100
AMap.plugin('AMap.Autocomplete', function () {
    // 实例化Autocomplete
    var autoOptions = {
        city: '杭州',       //city 限定城市，默认全国
        citylimit: false,   // 是否强制限制在设置的城市内搜索,默认值为：false
        input: 'search-box', // 可选参数，用来指定一个input输入框，设定之后，在input输入文字将自动生成下拉选择列表。
    }
    var autoOptions1 = {
        //city 限定城市，默认全国
        city: '杭州',
        input: 'search-text1',
    }
    var autoOptions2 = {
        //city 限定城市，默认全国
        city: '杭州',
        input: 'search-text2',
    }
    var autoComplete = new AMap.Autocomplete(autoOptions);
    var autoComplete1 = new AMap.Autocomplete(autoOptions1);
    var autoComplete2 = new AMap.Autocomplete(autoOptions2);
    autoComplete.search(keyword, function (status, result) {
        // 搜索成功时，result即是对应的匹配数据
    })
    autoComplete1.search(keyword, function (status, result) {
        // 搜索成功时，result即是对应的匹配数据
    })
    autoComplete2.search(keyword, function (status, result) {
        // 搜索成功时，result即是对应的匹配数据
    })
})

// 导航
var walkOption = {
    // map: gdmap,
    panel: "shortestTime",  // 结果列表的HTML容器id或容器元素，提供此参数后，结果列表将在此容器中进行展示。可选参数
    // hideMarkers: false,    // 是否隐藏起始点图标
    // isOutline: true,        // 路线是否描边
    // outlineColor: "black",  // 描边颜色 
    autoFitView: true,      // 自动移动视野使路线在窗口中央
}
var rideOption = {
    // map: gdmap,
    panel: "shortestTime",  // 结果列表的HTML容器id或容器元素，提供此参数后，结果列表将在此容器中进行展示。可选参数
    // hideMarkers: false,    // 是否隐藏起始点图标
    // isOutline: true,        // 路线是否描边
    // outlineColor: "black",  // 描边颜色 
    autoFitView: true,      // 自动移动视野使路线在窗口中央
}
var transferOption = {
    // map: gdmap,
    panel: "shortestTime",  // 结果列表的HTML容器id或容器元素，提供此参数后，结果列表将在此容器中进行展示。可选参数
    city: '杭州',
    // hideMarkers: false,    // 是否隐藏起始点图标
    // isOutline: true,        // 路线是否描边
    // outlineColor: "black",  // 描边颜色 
    autoFitView: true,      // 自动移动视野使路线在窗口中央
}


var walking = new AMap.Walking(walkOption);
var riding = new AMap.Riding(rideOption);
var transfer = new AMap.Transfer(transferOption);

// 路线规划函数
function routePlan(startId, endId, strategy = 'walking') {
    let startInput = document.getElementById(startId);
    let endInput = document.getElementById(endId);
    let startPosition, endPosition;
    gdmap.clearMap(); // 清除之前的路线

    // city设置为杭州
    let startUrl = "https://restapi.amap.com/v3/assistant/inputtips?output=json&city=杭州&keywords=" + startInput.value + "&key=f1dbdde4f534703472073cece6811628";
    // let startUrl = "https://restapi.amap.com/v3/place/text?keywords=" + startInput.value + "&city=杭州&offset=20&page=1&key=f1dbdde4f534703472073cece6811628&extensions=all";
    // 如果用上面第二种方式，需要将下面的tips改为pois
    axios.get(startUrl)
        .then(res => {
            if (res.data.count != 0) {
                let i = 0;
                while (startPosition == null && i < parseInt(res.data.count)) {
                    startPosition = res.data.tips[i].location;
                    i++;
                }
                if (startPosition == '') {
                    alert("输入的开始地点无法识别");
                    return 0;
                }
                startPosition = startPosition.split(',').map(Number); // 字符串划分转数组 -> 数组内字符串转数字，此时为“[经度，维度]”形式
                startInput.value = res.data.tips[0].name;
            }
            else {
                alert("输入的开始地点无法识别");
                return 0;
            }

            // city设置为杭州
            let endUrl = "https://restapi.amap.com/v3/assistant/inputtips?output=json&city=杭州&keywords=" + endInput.value + "&key=f1dbdde4f534703472073cece6811628";
            // let endUrl = "https://restapi.amap.com/v3/place/text?keywords=" + endInput.value + "&city=杭州&offset=20&page=1&key=f1dbdde4f534703472073cece6811628&extensions=all";
            axios.get(endUrl)
                .then(res => {
                    let i = 0;
                    if (res.data.count != 0) {
                        while (endPosition == null && i < parseInt(res.data.count)) {
                            endPosition = res.data.tips[i].location;
                            i++;
                        }
                        if (endPosition == '') {
                            alert("输入的结束地点无法识别");
                            return 0;
                        }
                        endPosition = endPosition.split(',').map(Number);
                        endInput.value = res.data.tips[0].name;
                    }
                    else {
                        alert("输入的结束地点无法识别");
                        return 0;
                    }
                    // 步行导航
                    if (strategy === 'walking') {
                        walking.search(startPosition, endPosition, function (status, result) {
                            // result即是对应的步行路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_WalkingResult
                            if (status === 'complete') {
                                if (result.routes && result.routes.length) {
                                    let carbonReduction = carbonCalc('walk', result.routes[0].distance / 1000); // 减碳量
                                    document.getElementById("carbonReduction-walk").innerHTML = '减碳' + carbonReduction.toFixed(2) + '千克';
                                    drawRoute(result.routes[0], gdmap);
                                    log.success('绘制步行路线完成');
                                }
                            } else {
                                log.error('步行路线数据查询失败' + result);
                            }
                        });
                    }
                    // 骑行
                    // 注意，这里还是carbonReduction-walk,需要改成ride
                    // 注意，这里还是carbonReduction-walk
                    // 注意，这里还是carbonReduction-walk
                    else if (strategy === 'riding') {
                        walking.search(startPosition, endPosition, function (status, result) {
                            // result即是对应的步行路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_WalkingResult
                            if (status === 'complete' && result.routes.length) {
                                let carbonReduction = carbonCalc('ride', result.routes[0].distance / 1000); // 减碳量
                                document.getElementById("carbonReduction-walk").innerHTML = '减碳' + carbonReduction.toFixed(2) + '千克';
                                drawRoute(result.routes[0], gdmap);
                                log.success('绘制步行路线完成')
                            } else {
                                log.error('步行路线数据查询失败' + result)
                            }
                        });
                    }
                    // 公交
                    else {
                        if (strategy === 'transfer-LeastTime') transfer.setPolicy(AMap.TransferPolicy.LEAST_TIME); // 最少时间
                        else if (strategy === 'transfer-LeastTransfer') transfer.setPolicy(AMap.TransferPolicy.LEAST_TRANSFER); // 最少换乘
                        else if (strategy === 'transfer-LeastWalk') transfer.setPolicy(AMap.TransferPolicy.LEAST_WALK); // 最少步行
                        else if (strategy === 'transfer-MostComfort') transfer.setPolicy(AMap.TransferPolicy.MOST_COMFORT); // 最舒适
                        else return 0;
                        transfer.search(startPosition, endPosition, function (status, result) {
                            if (status === 'complete' && result.plans && result.plans.length) {
                                let tripMode = ["walk", "bus", "car", "subway"];
                                let tripDis = [result.plans[0].walking_distance/1000, 
                                                result.plans[0].transit_distance/1000,
                                                result.plans[0].taxi_distance/1000,
                                                result.plans[0].railway_distance/1000];
                                carbonReduction = carbonCalcMul(tripMode, tripDis);
                                document.getElementById("carbonReduction-walk").innerHTML = '减碳' + carbonReduction.toFixed(2) + '千克';
                                drawRouteTransfer(result.plans[0], gdmap);
                                log.success('绘制公共交通路线完成')
                            } else {
                                log.error('公共交通路线数据查询失败' + result)
                            }
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err);
        });
};

// 路线绘制 - 步行和骑行
// route表示传入路线数据
// map表示需要绘制在其上的地图
function drawRoute(route, map) {
    var path = parseRouteToPath(route);
    var startMarker = new AMap.Marker({
        position: path[0],
        icon: './assets/start.png',
        offset: new AMap.Pixel(-15, -30),
        map: map,
    });

    var endMarker = new AMap.Marker({
        position: path[path.length - 1],
        icon: './assets/end.png',
        offset: new AMap.Pixel(-15, -30),
        map: map,
    });

    var routeLine = new AMap.Polyline({
        path: path,
        isOutline: true,
        outlineColor: 'black',
        borderWeight: 2,
        strokeWeight: 5,
        strokeColor: '#5becff',
        lineJoin: 'round',
    });
    routeLine.setMap(map);

    // 调整视野达到最佳显示区域
    map.setFitView([startMarker, endMarker, routeLine]);
}

// 解析WalkRoute对象，构造成AMap.Polyline的path参数需要的格式
// WalkRoute对象的结构文档 https://lbs.amap.com/api/javascript-api/reference/route-search#m_WalkRoute
function parseRouteToPath(route) {
    var path = [];
    for (var i = 0, l = route.steps.length; i < l; i++) {
        var step = route.steps[i]

        for (var j = 0, n = step.path.length; j < n; j++) {
            path.push(step.path[j])
        }
    }
    return path;
}

// 路线绘制 - 公共交通
function drawRouteTransfer(route, map) {
    var startMarker = new AMap.Marker({
        position: route.segments[0].transit.origin,
        icon: './assets/start.png',
        offset: new AMap.Pixel(-15, -30),
        map: map
    })

    var endMarker = new AMap.Marker({
        position: route.segments[route.segments.length - 1].transit.destination,
        icon: './assets/end.png',
        offset: new AMap.Pixel(-15, -30),
        map: map
    })

    var routeLines = []

    for (var i = 0, l = route.segments.length; i < l; i++) {
        var segment = route.segments[i]
        var line = null

        // 绘制步行路线
        if (segment.transit_mode === 'WALK') {
            line = new AMap.Polyline({
                path: segment.transit.path,
                isOutline: true,
                outlineColor: '#ecc45f',
                borderWeight: 1,
                strokeWeight: 5,
                strokeColor: '#388b68',
                lineJoin: 'round',
                strokeStyle: 'dashed'
            })
            line.setMap(map)
            routeLines.push(line)
        }
        // 绘制公交和地铁路线
        else if (segment.transit_mode === 'SUBWAY' || segment.transit_mode === 'BUS') {
            line = new AMap.Polyline({
                path: segment.transit.path,
                isOutline: true,
                outlineColor: 'black',
                borderWeight: 2,
                strokeWeight: 5,
                strokeColor: '#5becff',
                lineJoin: 'round',
                strokeStyle: 'solid'
            })

            line.setMap(map)
            routeLines.push(line)
        } else {
            line = new AMap.Polyline({
                path: segment.transit.path,
                isOutline: true,
                outlineColor: 'black',
                borderWeight: 2,
                strokeWeight: 5,
                strokeColor: '#5becff',
                lineJoin: 'round',
                strokeStyle: 'solid'
            })

            line.setMap(map)
            routeLines.push(line)
        }
    }

    // 调整视野达到最佳显示区域
    map.setFitView([startMarker, endMarker].concat(routeLines))
}