// navigation.js
// 定位、搜索提示、导航功能
// 使用mapbox API 和 高德API
// sk.eyJ1IjoibWFwYm94LXhzIiwiYSI6ImNsaTYwY21jdTFsZ20zdmxwaG1zOTNya2sifQ.n74HN7FMkiR3LQ3FqrvbNQ

// 判断变量
var isSearching = 0; // 点击了搜索？
var startPosition, endPosition; // 两点出行，开始、结束坐标
// var tripModeBtnId; // 在绿色综合出行.js声明
var nowPosition;    // 您所在的位置
var searchPosition;  // 右上角搜索框搜索结果所在位置

// 导入高德底图至单独的容器
var gdmap = new AMap.Map('mapNavigation', {
    resizeEnable: true, //是否监控地图容器尺寸变化
    zoom: 11, //初始化地图层级
    center: [120.155070, 30.274085], //初始化地图中心点
    // viewMode: '3D',
});

// 右上角搜索框添加回车事件,移动到对应位置
let searchMarker = new AMap.Marker({
    zIndex: 200,
});

document.getElementById('search-box').addEventListener('keydown', async () => {
    if (event.keyCode === 13) { // 输入回车
        let tempInput = document.getElementById('search-box');
        let tempUrl = "https://restapi.amap.com/v3/assistant/inputtips?output=json&city=杭州&keywords=" + tempInput.value + "&key=f1dbdde4f534703472073cece6811628";
        // let startUrl = "https://restapi.amap.com/v3/place/text?keywords=" + startInput.value + "&city=杭州&offset=20&page=1&key=f1dbdde4f534703472073cece6811628&extensions=all";
        searchPosition = await getPosition(tempUrl, tempInput);
        if(searchPosition == 0){
            alert("地点查找失败！");
            return 0;
        }
        gdmap.setZoomAndCenter(17, searchPosition);
        // 注意，其他地图也应调整到相应位置！！！！！！
        // 注意，其他地图也应调整到相应位置！！！！！！
        // 注意，其他地图也应调整到相应位置！！！！！！

        // 添加标记
        searchMarker.setPosition(searchPosition);
        searchMarker.setTitle(tempInput.value);
        searchMarker.setAnimation('AMAP_ANIMATION_DROP');
        gdmap.add(searchMarker);
    }
})

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
    geolocation.getCurrentPosition(function (status, result) {
        if (status == 'complete') {
            onComplete(result)
        } else {
            onError(result)
        }
    });
    // AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
    // AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
});
function onComplete(data) {
    nowPosition = [data.position.lng, data.position.lat];
    searchMarker.setPosition(nowPosition);
    gdmap.add(searchMarker);
}
//解析定位错误信息
function onError(data) {
    alert('定位失败!');
}

// 逆地理编码，经纬度->位置
function getAddressName(url){
    const promise = new Promise((resolve, reject) => {
        axios.get(url)
            .then(res => {
                console.log(res);
                if (res.data.status == 1) {
                    resolve(res.data.regeocode.pois[0].name);
                }
                else {
                    resolve(0);
                }
            })
            .catch(err => {
                console.log(err);
            });
    }
    );
    return promise;
}

// 为searchMarker添加点击事件，点击则创建路线
searchMarker.on('click', async function(){
    let url = "https://restapi.amap.com/v3/geocode/regeo?output=json&location="+nowPosition[0]+","+nowPosition[1]+"&key=f1dbdde4f534703472073cece6811628&radius=1000&extensions=all"
    let tempName = await getAddressName(url);
    if(tempName==0) {
        alert('识别您所在的位置失败！'); 
        return 0;
    }
    document.getElementById('search-text1').value = tempName;
    document.getElementById('search-text2').value = document.getElementById('search-box').value;
    searchClear();
    if(nowPosition&&searchPosition){
        isSearching = 1;
        gdmap.clearMap();
        startPosition = nowPosition;
        endPosition = searchPosition;
        getRoute(startPosition, endPosition, getStratery());
        gdmap.remove(searchMarker);
    }
})

// 搜索框输入提示 - 高德API - 配额每日100
// AMap.plugin('AMap.Autocomplete', function () {
//     // 实例化Autocomplete
//     var autoOptions = {
//         city: '杭州',       //city 限定城市，默认全国
//         citylimit: false,   // 是否强制限制在设置的城市内搜索,默认值为：false
//         input: 'search-box', // 可选参数，用来指定一个input输入框，设定之后，在input输入文字将自动生成下拉选择列表。
//     }
//     var autoOptions1 = {
//         //city 限定城市，默认全国
//         city: '杭州',
//         input: 'search-text1',
//     }
//     var autoOptions2 = {
//         //city 限定城市，默认全国
//         city: '杭州',
//         input: 'search-text2',
//     }
//     var autoComplete = new AMap.Autocomplete(autoOptions);
//     var autoComplete1 = new AMap.Autocomplete(autoOptions1);
//     var autoComplete2 = new AMap.Autocomplete(autoOptions2);
//     autoComplete.search(keyword, function (status, result) {
//         // 搜索成功时，result即是对应的匹配数据
//     })
//     autoComplete1.search(keyword, function (status, result) {
//         // 搜索成功时，result即是对应的匹配数据
//     })
//     autoComplete2.search(keyword, function (status, result) {
//         // 搜索成功时，result即是对应的匹配数据
//     })
// })

// 导航
var walkOption = {
    // map: gdmap,
    panel: "routeContent",  // 结果列表的HTML容器id或容器元素，提供此参数后，结果列表将在此容器中进行展示。可选参数
    // hideMarkers: false,    // 是否隐藏起始点图标
    // isOutline: true,        // 路线是否描边
    // outlineColor: "black",  // 描边颜色 
    autoFitView: true,      // 自动移动视野使路线在窗口中央
}
var rideOption = {
    // map: gdmap,
    panel: "routeContent",  // 结果列表的HTML容器id或容器元素，提供此参数后，结果列表将在此容器中进行展示。可选参数
    // hideMarkers: false,    // 是否隐藏起始点图标
    // isOutline: true,        // 路线是否描边
    // outlineColor: "black",  // 描边颜色 
    autoFitView: true,      // 自动移动视野使路线在窗口中央
}
var transferOption = {
    // map: gdmap,
    panel: "routeContent",  // 结果列表的HTML容器id或容器元素，提供此参数后，结果列表将在此容器中进行展示。可选参数
    city: '杭州',
    // hideMarkers: false,    // 是否隐藏起始点图标
    // isOutline: true,        // 路线是否描边
    // outlineColor: "black",  // 描边颜色 
    autoFitView: true,      // 自动移动视野使路线在窗口中央
}


var walking = new AMap.Walking(walkOption);
var riding = new AMap.Riding(rideOption);
var transfer = new AMap.Transfer(transferOption);

var walkingMul = new AMap.Walking({ panel: "routeContentMul" })

function searchClear() {
    walking.clear();
    riding.clear();
    transfer.clear();
}

// url搜索，返回位置数据
function getPosition(url, inputBox) {
    const promise = new Promise((resolve, reject) => {
        let position;
        axios.get(url)
            .then(res => {
                if (res.data.count != 0) {
                    let i = 0;
                    while (position == null && i < parseInt(res.data.count)) {
                        position = res.data.tips[i].location;
                        i++;
                    }
                    if (position == '') {
                        resolve(0);
                    }
                    position = position.split(',').map(Number); // 字符串划分转数组 -> 数组内字符串转数字，此时为“[经度，维度]”形式
                    inputBox.value = res.data.tips[0].name;
                    resolve(position);
                }
                else {
                    resolve(0);
                }
            })
            .catch(err => {
                console.log(err);
            });
    }
    );
    return promise;
}

// 路线规划 - 各按钮
function getRoteForModeBtn(startPosition, endPosition, strategy) {
    if (this.strategy)
        searchClear(); // 清楚之前的搜索结果
    gdmap.clearMap(); // 清除之前的路线
    getRoute(startPosition, endPosition, strategy);
}

document.getElementById('walk').addEventListener('click', (e) => { if (isSearching && e.target.id != tripModeBtnId.split('-')[0]) getRoteForModeBtn(startPosition, endPosition, 'walking-LeastTime'); }, true);
document.getElementById('ride').addEventListener('click', (e) => { if (isSearching && e.target.id != tripModeBtnId.split('-')[0]) getRoteForModeBtn(startPosition, endPosition, 'riding-LeastTime'); }, true);
document.getElementById('transfer').addEventListener('click', (e) => { if (isSearching && e.target.id != tripModeBtnId.split('-')[0]) getRoteForModeBtn(startPosition, endPosition, 'transfer-LeastWalk'); }, true);

document.getElementById('walk-time').addEventListener('click', (e) => { if (isSearching && e.target.id != tripModeBtnId) getRoteForModeBtn(startPosition, endPosition, 'walking-LeastTime'); }, true);
document.getElementById('ride-time').addEventListener('click', (e) => { if (isSearching && e.target.id != tripModeBtnId) getRoteForModeBtn(startPosition, endPosition, 'riding-LeastTime'); }, true);
document.getElementById('transfer-time').addEventListener('click', (e) => { if (isSearching && e.target.id != tripModeBtnId) getRoteForModeBtn(startPosition, endPosition, 'transfer-LeastWalk'); }, true);
document.getElementById('transfer-walk').addEventListener('click', (e) => { if (isSearching && e.target.id != tripModeBtnId) getRoteForModeBtn(startPosition, endPosition, 'transfer-LeastTime'); }, true);
document.getElementById('transfer-transit').addEventListener('click', (e) => { if (isSearching && e.target.id != tripModeBtnId) getRoteForModeBtn(startPosition, endPosition, 'transfer-LeastTransfer'); }, true);
document.getElementById('transfer-comfort').addEventListener('click', (e) => { if (isSearching && e.target.id != tripModeBtnId) getRoteForModeBtn(startPosition, endPosition, 'transfer-MostComfort'); }, true);


// 导航 - 路线规划
async function routePlan(startId, endId, strategy = 'walking-LeastTime') {
    isSearching = 1;
    let startInput = document.getElementById(startId);
    let endInput = document.getElementById(endId);
    searchClear(); // 清楚之前的搜索结果
    gdmap.clearMap(); // 清除之前的路线

    // city设置为杭州
    // 使用第二种方式检索，返回值请参考高德api开发文档
    let startUrl = "https://restapi.amap.com/v3/assistant/inputtips?output=json&city=杭州&keywords=" + startInput.value + "&key=f1dbdde4f534703472073cece6811628";
    // let startUrl = "https://restapi.amap.com/v3/place/text?keywords=" + startInput.value + "&city=杭州&offset=20&page=1&key=f1dbdde4f534703472073cece6811628&extensions=all";
    startPosition = await getPosition(startUrl, startInput);
    if (startPosition == 0) { // getPosition()返回值为0
        alert("输入的开始地点无法识别！");
        isSearching = 0;
        return 0;
    }

    // city设置为杭州
    let endUrl = "https://restapi.amap.com/v3/assistant/inputtips?output=json&city=杭州&keywords=" + endInput.value + "&key=f1dbdde4f534703472073cece6811628";
    // let endUrl = "https://restapi.amap.com/v3/place/text?keywords=" + endInput.value + "&city=杭州&offset=20&page=1&key=f1dbdde4f534703472073cece6811628&extensions=all";
    endPosition = await getPosition(endUrl, endInput);
    if (endPosition == 0) {
        alert("输入的结束地点无法识别！");
        isSearching = 0;
        return 0;
    }

    strategy = getStratery();

    getRoute(startPosition, endPosition, strategy);

};

// 根据现在点亮的按钮判断出行模式
function getStratery() {
    let strategy = null;
    if (tripModeBtnId == 'walk-time') strategy = 'walking-LeastTime';
    else if (tripModeBtnId == 'walk-comfort') strategy = 'walking-MostComfort';
    else if (tripModeBtnId == 'ride-time') strategy = 'riding-LeastTime';
    else if (tripModeBtnId == 'ride-comfort') strategy = 'riding-MostComfort';
    else if (tripModeBtnId == 'transfer-time') strategy = 'transfer-LeastTime';
    else if (tripModeBtnId == 'transfer-walk') strategy = 'transfer-LeastWalk';
    else if (tripModeBtnId == 'transfer-transit') strategy = 'transfer-LeastTransfer';
    else if (tripModeBtnId == 'transfer-comfort') strategy = 'transfer-MostComfort';
    else strategy = null;
    return strategy;
}

// 传入url, 获得路线
function getRoute(startPosition, endPosition, strategy) {
    // 步行导航
    if (strategy === 'walking-LeastTime') {
        walking.search(startPosition, endPosition, function (status, result) {
            // result即是对应的步行路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_WalkingResult
            if (status === 'complete') {
                if (result.routes && result.routes.length) {
                    let carbonReduction = carbonCalc('walk', result.routes[0].distance / 1000); // 减碳量
                    document.getElementById("carbonReduction").innerHTML = '减碳' + carbonReduction.toFixed(2) + '千克';
                    drawRoute(result.routes[0], gdmap);
                    log.success('绘制步行路线完成');
                }
            } else {
                alert('步行路线数据查询失败' + result);
            }
        });
    }
    // 骑行
    else if (strategy === 'riding-LeastTime') {
        riding.search(startPosition, endPosition, function (status, result) {
            // result即是对应的步行路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_WalkingResult
            if (status === 'complete') {
                if (result.routes && result.routes.length) {
                    let carbonReduction = carbonCalc('ride', result.routes[0].distance / 1000); // 减碳量
                    document.getElementById("carbonReduction").innerHTML = '减碳' + carbonReduction.toFixed(2) + '千克';
                    drawRoute(result.routes[0], gdmap);
                    log.success('绘制骑行路线完成')
                } else {
                    alert('骑行路线数据查询失败' + result)
                }
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
                let tripDis = [result.plans[0].walking_distance / 1000,
                result.plans[0].transit_distance / 1000,
                result.plans[0].taxi_distance / 1000,
                result.plans[0].railway_distance / 1000];
                carbonReduction = carbonCalcMul(tripMode, tripDis);
                document.getElementById("carbonReduction").innerHTML = '减碳' + carbonReduction.toFixed(2) + '千克';
                drawRouteTransfer(result.plans[0], gdmap);
                log.success('绘制公共交通路线完成')
            } else {
                alert('公共交通路线数据查询失败' + result)
            }
        });
    }
}

// 路线绘制 - 步行和骑行
// route表示传入路线数据
// map表示需要绘制在其上的地图
// num表示第几条路线，默认为1
// all表示总路线，默认为1
function drawRoute(route, map, num = 1, all = 1) {
    var path;
    if (route.steps) path = parseRouteToPathWalk(route);
    else path = parseRouteToPathRide(route)
    if (num == 1) {
        var startMarker = new AMap.Marker({
            position: path[0],
            icon: './assets/start.png',
            offset: new AMap.Pixel(-15, -30),
            map: map,
        });
    }

    if (num > 1) {
        var passMarker = new AMap.Marker({
            position: path[0],
            // icon: './assets/pass.png',
            offset: new AMap.Pixel(-15, -40),
            map: map,
        });
        passMarker.setContent("<div style='width: 35px; height: 45px; background-color: rgba(0,0,0,0);'>"+
            "<img src='./assets/pass.png'  style='z-index:1'/>" + "<div style='width: 20px; height: 10px; display: inline-block; z-index:1;position:relative;'></div>"+ 
            "<div style='width: 12px; height: 12px; display: inline-block; border-radius: 50%; background-color: #d78319; color:white;z-index: 100; top: 0px; font-size: 3px;text-align:center;position:absolute;'>"+(num-1)+"</div>"+
        "</div>"
        );
    }

    if (num == all) {
        var endMarker = new AMap.Marker({
            position: path[path.length - 1],
            icon: './assets/end.png',
            offset: new AMap.Pixel(-15, -30),
            map: map,
        });
    }

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
    if (startMarker) map.setFitView([startMarker, startMarker, routeLine]);
}

// 解析WalkRoute对象，构造成AMap.Polyline的path参数需要的格式
// WalkRoute对象的结构文档 https://lbs.amap.com/api/javascript-api/reference/route-search#m_WalkRoute
function parseRouteToPathWalk(route) {
    var path = [];
    for (var i = 0, l = route.steps.length; i < l; i++) {
        var step = route.steps[i]

        for (var j = 0, n = step.path.length; j < n; j++) {
            path.push(step.path[j])
        }
    }
    return path;
}
// 解析RidingRoute对象，构造成AMap.Polyline的path参数需要的格式
// RidingResult对象结构参考文档 https://lbs.amap.com/api/javascript-api/reference/route-search#m_RideRoute
function parseRouteToPathRide(route) {
    var path = []

    for (var i = 0, l = route.rides.length; i < l; i++) {
        var step = route.rides[i]

        for (var j = 0, n = step.path.length; j < n; j++) {
            path.push(step.path[j])
        }
    }

    return path
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

// 获取两个点之间的距离(步行距离), 传入起终点经纬度
function getDistance(start, end) {
    const promise = new Promise((resolve, reject) => {
        walking.search(start, end, function (status, result) {
            if (status === 'complete') {
                if (result.routes && result.routes.length) {
                    resolve(result.routes[0].distance);
                }
            } else {
                return 0;
            }
        });
    }
    );
    return promise;
}

// 全排列 - 除去第一个和最后一个元素
function arrange(arr) {
    let startEle = arr[0];
    let endEle = arr[arr.length - 1];
    arr = arr.slice(1, arr.length - 1);
    let len = arr.length
    let res = [] // 所有排列结果
    /**
     * 【全排列算法】
     * 说明：arrange用来对arr中的元素进行排列组合，将排列好的各个结果存在新数组中
     * @param tempArr：排列好的元素
     * @param leftArr：待排列元素
     */
    let arrange = (tempArr, leftArr) => {
        if (tempArr.length === len) { // 这里就是递归结束的地方
            res.push(tempArr) // 得到全排列的每个元素都是数组
            // res.push(tempArr.join('')) // 得到全排列的每个元素都是字符串
        } else {
            leftArr.forEach((item, index) => {
                let temp = [].concat(leftArr)
                temp.splice(index, 1)
                // 此时，第一个参数是当前分离出的元素所在数组；第二个参数temp是传入的leftArr去掉第一个后的结果
                arrange(tempArr.concat(item), temp) // 这里使用了递归
            })
        }
    }
    arrange([], arr);
    for (let i = 0; i < res.length; i++) {
        res[i].unshift(startEle);
        res[i].push(endEle);
    }
    return res;
}

// walkingMul.search方便异步调用
// num和all参数解释见函数drawRoute()
function getWalking(startPosition, endPosition, num, all) {
    let p = new Promise((resolve, reject) => {
        walkingMul.search(startPosition, endPosition, function (status, result) {
            // result即是对应的步行路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_WalkingResult
            if (status === 'complete') {
                if (result.routes && result.routes.length) {
                    drawRoute(result.routes[0], gdmap, num, all);
                    resolve(carbonCalc('walk', result.routes[0].distance / 1000)); // 减碳量
                } else {
                    resolve(-1);
                }
            } else {
                alert('步行路线数据查询失败' + result);
            }
        })
    });
    return p;
}


// 多点出行
// routePoint是需要经过的点的输入框对应的id数组，默认第一个和最后一个是起点和终点
async function routePlanMul() {
    // 获取输入框
    let routePointIn = [];
    routePointIn.push('search-text3');
    for (let i = 0; i < document.getElementById('add-button1').value; i++) {
        routePointIn.push('pass-search-text' + (i + 1));
    }
    routePointIn.push('search-text4');

    let size = routePointIn.length;
    let pointIn = [];
    let pointPosit = [];  // 按输入顺序存储输入点的经纬度
    let pointDis = Array.from(Array(10), () => new Array(10)); // 二维数组，存放对应两点间的距离
    let routePosit = [];  // 按顺序存储最终路线的经纬度
    for (let i = 0; i < size; i++) {
        pointIn[i] = document.getElementById(routePointIn[i]);
    }

    // 获取对应位置坐标
    for (let i = 0; i < size; i++) {
        let url = "https://restapi.amap.com/v3/assistant/inputtips?output=json&city=杭州&keywords=" + pointIn[i].value + "&key=f1dbdde4f534703472073cece6811628";
        pointPosit[i] = await getPosition(url, pointIn[i]);
        if (pointPosit[i] == 0) {
            alert("输入的第" + (i + 1) + "个位置无法识别");
            return 0;
        }
    }

    // 计算起点到除终点外各点的距离(使用步行距离)
    for (let i = 0; i < size; i++) {
        for (let j = i + 1; j < size; j++) {
            pointDis[i][j] = await getDistance(pointPosit[i], pointPosit[j]);
            pointDis[j][i] = pointDis[i][j];
        }
    }
    searchClear();
    gdmap.clearMap();

    // 获取全排列
    let list = Array.from({ length: size }, (val, i) => i); // 生成0, 1, 2...的数组
    let poiArrange = arrange(list);

    // 获取最小排列
    let routeList = []; // 存放最小排列
    let leastDis = 10000000;
    for (let i = 0; i < poiArrange.length; i++) {
        let dis = 0;
        for (let j = 0; j < size - 1; j++) {
            let p1 = poiArrange[i][j];
            let p2 = poiArrange[i][j + 1];
            dis += pointDis[p1][p2];
        }
        if (dis < leastDis) {
            leastDis = dis;
            routeList = poiArrange[i];
        }
    }
    // 排列经纬度
    for (let i = 0; i < size; i++) {
        routePosit[i] = pointPosit[routeList[i]];
    }
    // 路线规划
    let carbonReduction = 0;
    for (let i = 0; i < size - 1; i++) {
        let backValue = await getWalking(routePosit[i], routePosit[i + 1], (i + 1), (size - 1));
        if (backValue == -1) {
            alert('规划路线失败！');
            return 0;
        } else {
            carbonReduction += backValue;
        }
    }
    document.getElementById("carbonReduction-mul").innerHTML = '减碳' + carbonReduction.toFixed(2) + '千克';
}