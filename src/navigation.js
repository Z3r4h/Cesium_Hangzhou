// navigation.js
// 定位、搜索提示、导航功能
// 使用高德API
// div.mapNavigation

// 判断变量
var isSearching = 0; // 点击了搜索按钮？
var isSearchingMul = 0; // 多点出行搜索按钮
var startPosition, endPosition; // 两点出行，开始、结束坐标
// var tripModeBtnId; // 在绿色综合出行.js声明
var nowPosition;    // 您所在的位置
var searchPosition;  // 右上角搜索框搜索结果所在位置
let routeContentDiv = document.getElementById('routeContentDiv');
var msgHintDiv = document.getElementById('msgHint');
let overLayer = [];

// 当前路线距离
var disNow;
// 当前路线减碳量
var carbRedNow;

// 导入高德底图至单独的容器
var gdmap = new AMap.Map('mapNavigation', {
    resizeEnable: true, //是否监控地图容器尺寸变化
    zoom: 11, //初始化地图层级
    center: [120.155070, 30.274085], //初始化地图中心点
    // viewMode: '3D',
});

var hiddenMap = new AMap.Map('mapNavigationNone', {});

// 右上角搜索框添加回车事件,移动到对应位置
let searchMarker = new AMap.Marker({
    zIndex: 200,
});

// 消息提示框
// message是需要提示的消息
// isSuccuss是布尔值，true代表操作成功的提示
var timer;
function msgHint(message, isSuccess) {
    clearTimeout(timer); // 清除之前还未执行完的消息
    if (isSuccess) {
        msgHintDiv.style.backgroundColor = '#3dac8fda';
    } else {
        msgHintDiv.style.backgroundColor = '#f76b44de';
    }
    msgHintDiv.innerHTML = message;
    msgHintDiv.style.display = 'block';
    timer = setTimeout(() => {
        msgHintDiv.style.display = 'none';
    }, 1500)
}

document.getElementById('search-box').addEventListener('keydown', async () => {
    if (event.keyCode === 13) { // 输入回车
        let tempInput = document.getElementById('search-box');
        let tempUrl = "https://restapi.amap.com/v3/assistant/inputtips?output=json&city=杭州&keywords=" + tempInput.value + "&key=f1dbdde4f534703472073cece6811628";
        // let startUrl = "https://restapi.amap.com/v3/place/text?keywords=" + startInput.value + "&city=杭州&offset=20&page=1&key=f1dbdde4f534703472073cece6811628&extensions=all";
        searchPosition = await getPosition(tempUrl, tempInput);
        if (searchPosition == 0) {
            msgHint("地点查找失败!", false)
            return 0;
        }
        gdmap.setZoomAndCenter(17, searchPosition);
        // 注意，其他地图也应调整到相应位置!!!!!!
        // 注意，其他地图也应调整到相应位置!!!!!!
        // 注意，其他地图也应调整到相应位置!!!!!!

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
    msgHint("定位失败!", false);
}

// 逆地理编码，经纬度->位置
function getAddressName(url) {
    const promise = new Promise((resolve, reject) => {
        axios.get(url)
            .then(res => {
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
searchMarker.on('click', async function () {
    let url = "https://restapi.amap.com/v3/geocode/regeo?output=json&location=" + nowPosition[0] + "," + nowPosition[1] + "&key=f1dbdde4f534703472073cece6811628&radius=1000&extensions=all"
    let tempName = await getAddressName(url);
    if (tempName == 0) {
        msgHint("识别您所在的位置失败!", false);
        return 0;
    }
    document.getElementById('search-text1').value = tempName;
    document.getElementById('search-text2').value = document.getElementById('search-box').value;
    searchClear();
    if (nowPosition && searchPosition) {
        isSearching = 1;
        gdmap.clearMap();
        startPosition = nowPosition;
        endPosition = searchPosition;
        getRoute(startPosition, endPosition, getStratery());
        gdmap.remove(searchMarker);
    }
    routeContentDiv.style.display = "block";
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
var walking1 = new AMap.Walking({ panel: "routeContent", autoFitView: true });
var walking2 = new AMap.Walking({ panel: "routeContent2", autoFitView: true })
var riding = new AMap.Riding(rideOption);
var riding1 = new AMap.Riding({ panel: "routeContent", autoFitView: true });
var riding2 = new AMap.Riding({ panel: "routeContent2", autoFitView: true });
var transfer = new AMap.Transfer(transferOption);

// var walkingMul = new AMap.Walking({panel: "routeContentMul"});
// var ridingMul = new AMap.Riding({ panel: "routeContentMul" });
// var transferMul = new AMap.Transfer({ panel: "routeContentMul", city: '杭州' });
var walkingMul = new AMap.Walking();
var ridingMul = new AMap.Riding();
var transferMul = new AMap.Transfer({ city: '杭州' });

function searchClear() {
    walking.clear();
    walking1.clear();
    walking2.clear();
    riding.clear();
    riding1.clear();
    riding2.clear();
    transfer.clear();
    walkingMul.clear();
    ridingMul.clear();
    transferMul.clear();
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
                    if (position == null) {
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

// url搜索， 返回风景名胜
function getAttraction(url) {
    const promise = new Promise((resolve, reject) => {
        let position;
        axios.get(url)
            .then(res => {
                if (res.data.count != 0) {
                    let i = 0;
                    while (position == null && i < parseInt(res.data.count)) {
                        position = res.data.pois[i].location;
                        i++;
                    }
                    if (position == null) {
                        resolve(0);
                    }
                    position = position.split(',').map(Number); // 字符串划分转数组 -> 数组内字符串转数字，此时为“[经度，维度]”形式
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
    searchClear(); // 清除之前的搜索结果
    gdmap.clearMap(); // 清除之前的路线
    getRoute(startPosition, endPosition, strategy);
}

document.getElementById('walk').addEventListener('click', (e) => { if (isSearching && e.target.id != tripModeBtnId.split('-')[0]) getRoteForModeBtn(startPosition, endPosition, 'walking-LeastTime'); }, true);
document.getElementById('ride').addEventListener('click', (e) => { if (isSearching && e.target.id != tripModeBtnId.split('-')[0]) getRoteForModeBtn(startPosition, endPosition, 'riding-LeastTime'); }, true);
document.getElementById('transfer').addEventListener('click', (e) => { if (isSearching && e.target.id != tripModeBtnId.split('-')[0]) getRoteForModeBtn(startPosition, endPosition, 'transfer-LeastTime'); }, true);

document.getElementById('walk-time').addEventListener('click', (e) => { if (isSearching && e.target.id != tripModeBtnId) getRoteForModeBtn(startPosition, endPosition, 'walking-LeastTime'); }, true);
document.getElementById('walk-comfort').addEventListener('click', (e) => { if (isSearching && e.target.id != tripModeBtnId) getRoteForModeBtn(startPosition, endPosition, 'walking-MostComfort'); }, true);
document.getElementById('ride-time').addEventListener('click', (e) => { if (isSearching && e.target.id != tripModeBtnId) getRoteForModeBtn(startPosition, endPosition, 'riding-LeastTime'); }, true);
document.getElementById('ride-comfort').addEventListener('click', (e) => { if (isSearching && e.target.id != tripModeBtnId) getRoteForModeBtn(startPosition, endPosition, 'riding-MostComfort'); }, true);
document.getElementById('transfer-time').addEventListener('click', (e) => { if (isSearching && e.target.id != tripModeBtnId) getRoteForModeBtn(startPosition, endPosition, 'transfer-LeastTime'); }, true);
document.getElementById('transfer-walk').addEventListener('click', (e) => { if (isSearching && e.target.id != tripModeBtnId) getRoteForModeBtn(startPosition, endPosition, 'transfer-LeastWalk'); }, true);
document.getElementById('transfer-transit').addEventListener('click', (e) => { if (isSearching && e.target.id != tripModeBtnId) getRoteForModeBtn(startPosition, endPosition, 'transfer-LeastTransfer'); }, true);
document.getElementById('transfer-comfort').addEventListener('click', (e) => { if (isSearching && e.target.id != tripModeBtnId) getRoteForModeBtn(startPosition, endPosition, 'transfer-MostComfort'); }, true);


// 导航 - 路线规划
async function routePlan(startId, endId, strategy = 'walking-LeastTime') {
    isSearching = 1;
    let startInput = document.getElementById(startId);
    let endInput = document.getElementById(endId);
    searchClear(); // 清除之前的搜索结果
    gdmap.clearMap(); // 清除之前的路线

    // city设置为杭州
    // 如果使用第二种方式检索，返回值请参考高德api开发文档
    let startUrl = "https://restapi.amap.com/v3/assistant/inputtips?output=json&city=杭州&keywords=" + startInput.value + "&key=f1dbdde4f534703472073cece6811628";
    // let startUrl = "https://restapi.amap.com/v3/place/text?keywords=" + startInput.value + "&city=杭州&offset=20&page=1&key=f1dbdde4f534703472073cece6811628&extensions=all";
    startPosition = await getPosition(startUrl, startInput);
    if (startPosition == 0) { // getPosition()返回值为0
        msgHint("输入的开始地点无法识别!", false);
        isSearching = 0;
        return 0;
    }

    // city设置为杭州
    let endUrl = "https://restapi.amap.com/v3/assistant/inputtips?output=json&city=杭州&keywords=" + endInput.value + "&key=f1dbdde4f534703472073cece6811628";
    // let endUrl = "https://restapi.amap.com/v3/place/text?keywords=" + endInput.value + "&city=杭州&offset=20&page=1&key=f1dbdde4f534703472073cece6811628&extensions=all";
    endPosition = await getPosition(endUrl, endInput);
    if (endPosition == 0) {
        msgHint("输入的结束地点无法识别!", false);
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
async function getRoute(startPosition, endPosition, strategy) {
    // 步行导航
    if (strategy === 'walking-LeastTime') {
        routeContentDiv.style.display = "none";
        walking.search(startPosition, endPosition, function (status, result) {
            // result即是对应的步行路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_WalkingResult
            if (status === 'complete') {
                if (result.routes && result.routes.length) {
                    disNow = result.routes[0].distance;
                    let carbonReduction = carbonCalc('walk', disNow / 1000); // 减碳量
                    carbRedNow = carbonReduction;
                    document.getElementById("carbonReduction").innerHTML = '减碳' + carbonReduction.toFixed(2) + '千克';
                    drawRoute(result.routes[0], gdmap);
                    console.log('绘制步行路线完成');
                    routeContentDiv.style.display = "block";
                }
            } else {
                msgHint("步行路线数据查询失败!", false);
            }
        });
    }
    else if (strategy === 'walking-MostComfort') {
        routeContentDiv.style.display = "none";
        // 计算中间点
        let middlePosition = [(startPosition[0] + endPosition[0]) / 2, (startPosition[1] + endPosition[1]) / 2];
        // 计算起终点距离
        let sta2endDis = AMap.GeometryUtil.distance(startPosition, endPosition);
        // 半径
        let radius = sta2endDis / 2;
        // 调用高德 周边搜索API 搜索中点半径范围内是否有公园等设施
        let url = "https://restapi.amap.com/v3/place/around?key=f1dbdde4f534703472073cece6811628&location=" + middlePosition[0] + "," + middlePosition[1] + "&radius=" + radius + "&types=110000"
        let passPosition = await getAttraction(url);

        // 普通路线
        let generalCarb = await getWalking(startPosition, endPosition, 1, 1, false, walking);
        let generalDist = generalCarb / (0.192 - 0.0005); // 注意，如果carbonReduction是用g做单位，还需要除以1000

        // passPosition为0即说明范围内未找到风景名胜位置，直接使用普通路线
        // passPosition不为0即说明在范围内找到风景名胜点位置，进入绘制舒适路线
        let comfortRouteDist = 9999999; // 记录舒适路线距离
        if (passPosition != 0) {
            // 舒适路线 - 路线规划
            searchClear();
            gdmap.clearMap();
            let carbonReduction = await getWalking(startPosition, passPosition, 1, 2, true, walking1);
            if (carbonReduction == -1) {
                msgHint('规划路线失败', false);
                return 0;
            }
            let tempCarb = await getWalking(passPosition, endPosition, 2, 2, true, walking2)
            if (tempCarb == -1) {
                msgHint('规划路线失败', false);
                return 0;
            }
            carbonReduction += tempCarb;

            // 舒适路线距离
            comfortRouteDist = carbonReduction / (0.192 - 0.0005); // 注意，如果carbonReduction是用g做单位，还需要除以1000

            // 比较舒适路线距离与普通路线距离, 如果舒适路线距离过长则重新使用普通路线
            if (comfortRouteDist >= generalDist * 2) {
                searchClear();
                gdmap.clearMap();
                walking.search(startPosition, endPosition, function (status, result) {
                    // result即是对应的步行路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_WalkingResult
                    if (status === 'complete') {
                        if (result.routes && result.routes.length) {
                            document.getElementById("carbonReduction").innerHTML = '减碳' + generalCarb.toFixed(2) + '千克';
                            drawRoute(result.routes[0], gdmap);
                            console.log('绘制步行路线完成');
                            routeContentDiv.style.display = "block";
                        }
                    } else {
                        msgHint("步行路线数据查询失败!", false);
                    }
                });
            } else {
                document.getElementById("carbonReduction").innerHTML = '减碳' + carbonReduction.toFixed(2) + '千克';
                routeContentDiv.style.display = "block";
            }
        }
    }
    // 骑行
    else if (strategy === 'riding-LeastTime') {
        routeContentDiv.style.display = "none";
        riding.search(startPosition, endPosition, function (status, result) {
            // result即是对应的步行路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_WalkingResult
            if (status === 'complete') {
                if (result.routes && result.routes.length) {
                    disNow = result.routes[0].distance;
                    let carbonReduction = carbonCalc('ride', disNow / 1000); // 减碳量
                    carbRedNow = carbonReduction;
                    document.getElementById("carbonReduction").innerHTML = '减碳' + carbonReduction.toFixed(2) + '千克';
                    drawRoute(result.routes[0], gdmap);
                    console.log('绘制骑行路线完成');
                    routeContentDiv.style.display = "block";
                } else {
                    msgHint("骑行路线数据查询失败!", false);
                }
            }
        });
    }
    else if (strategy === 'riding-MostComfort') {
        routeContentDiv.style.display = "none";
        // 计算中间点
        let middlePosition = [(startPosition[0] + endPosition[0]) / 2, (startPosition[1] + endPosition[1]) / 2];
        // 计算起终点距离
        let sta2endDis = AMap.GeometryUtil.distance(startPosition, endPosition);
        // 半径
        let radius = sta2endDis / 2;
        // 调用高德 周边搜索API 搜索中点半径范围内是否有公园等设施
        let url = "https://restapi.amap.com/v3/place/around?key=f1dbdde4f534703472073cece6811628&location=" + middlePosition[0] + "," + middlePosition[1] + "&radius=" + radius + "&types=110000"
        let passPosition = await getAttraction(url);

        // 普通路线
        let generalCarb = await getRiding(startPosition, endPosition, 1, 1, false, riding);
        let generalDist = generalCarb / (0.192 - 0.0015); // 注意，如果carbonReduction是用g做单位，还需要除以1000

        // passPosition为0即说明范围内未找到风景名胜位置，直接使用普通路线
        // passPosition不为0即说明在范围内找到风景名胜点位置，进入绘制舒适路线
        let comfortRouteDist = 9999999; // 记录舒适路线距离
        if (passPosition != 0) {
            // 舒适路线 - 路线规划
            searchClear();
            gdmap.clearMap();
            let carbonReduction = await getRiding(startPosition, passPosition, 1, 2, true, riding1);
            if (carbonReduction == -1) {
                msgHint('规划路线失败', false);
                return 0;
            }
            let tempCarb = await getRiding(passPosition, endPosition, 2, 2, true, riding2)
            if (tempCarb == -1) {
                msgHint('规划路线失败', false);
                return 0;
            }
            carbonReduction += tempCarb;

            // 舒适路线距离
            comfortRouteDist = carbonReduction / (0.192 - 0.0005); // 注意，如果carbonReduction是用g做单位，还需要除以1000

            // 比较舒适路线距离与普通路线距离, 如果舒适路线距离过长则重新使用普通路线
            if (comfortRouteDist >= generalDist * 2) {
                searchClear();
                gdmap.clearMap();
                riding.search(startPosition, endPosition, function (status, result) {
                    // result即是对应的步行路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_WalkingResult
                    if (status === 'complete') {
                        if (result.routes && result.routes.length) {
                            document.getElementById("carbonReduction").innerHTML = '减碳' + generalCarb.toFixed(2) + '千克';
                            drawRoute(result.routes[0], gdmap);
                            console.log('绘制步行路线完成');
                            routeContentDiv.style.display = "block";
                        }
                    } else {
                        msgHint("步行路线数据查询失败!", false);
                    }
                });
            } else {
                document.getElementById("carbonReduction").innerHTML = '减碳' + carbonReduction.toFixed(2) + '千克';
                routeContentDiv.style.display = "block";
            }
        }
    }
    // 公交
    else {
        routeContentDiv.style.display = "none";
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
                disNow = 0;
                for(let i=0; i<4; i++){
                    disNow+=result.plans[i];
                }
                carbonReduction = carbonCalcMul(tripMode, tripDis);
                carbRedNow = carbonReduction;
                document.getElementById("carbonReduction").innerHTML = '减碳' + carbonReduction.toFixed(2) + '千克';
                drawRouteTransfer(result.plans[0], gdmap);
                console.log('绘制公共交通路线完成');
                routeContentDiv.style.display = "block";
            } else {
                msgHint("公共交通路线数据查询失败!", false);
            }
        });
    }
}

// 路线绘制 - 步行和骑行
// route表示传入路线数据
// map表示需要绘制在其上的地图
// num表示第几条路线，默认为1
// all表示总路线，默认为1
// isComfort表示是否最舒适路线绘制，默认为false
function drawRoute(route, map, num = 1, all = 1, isComfort = false) {
    var path;
    if (num === 1) overLayer.length = 0;
    if (route.steps) path = parseRouteToPathWalk(route);
    else path = parseRouteToPathRide(route)
    if (num == 1) {
        var startMarker = new AMap.Marker({
            position: path[0],
            icon: './assets/start.png',
            offset: new AMap.Pixel(-15, -30),
            map: map,
        });
        overLayer.push(startMarker);
    }

    if (num > 1 && !isComfort) {
        var passMarker = new AMap.Marker({
            position: path[0],
            // icon: './assets/pass.png',
            offset: new AMap.Pixel(-15, -40),
            map: map,
        });
        passMarker.setContent("<div style='width: 35px; height: 45px; background-color: rgba(0,0,0,0);'>" +
            "<img src='./assets/pass.png'  style='z-index:1'/>" + "<div style='width: 20px; height: 10px; display: inline-block; z-index:1;position:relative;'></div>" +
            "<div style='width: 12px; height: 12px; display: inline-block; border-radius: 50%; background-color: #d78319; color:white;z-index: 100; top: 0px; font-size: 3px;text-align:center;position:absolute;'>" + (num - 1) + "</div>" +
            "</div>"
        );
        overLayer.push(passMarker);
    }

    if (num == all) {
        var endMarker = new AMap.Marker({
            position: path[path.length - 1],
            icon: './assets/end.png',
            offset: new AMap.Pixel(-15, -30),
            map: map,
        });
        overLayer.push(endMarker);
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
    if (all === num) map.setFitView(overLayer);
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
function drawRouteTransfer(route, map, num = 1, all = 1) {
    if (num === 1) overLayer.length = 0;
    if (num == 1) {
        var startMarker = new AMap.Marker({
            position: route.segments[0].transit.origin,
            icon: './assets/start.png',
            offset: new AMap.Pixel(-15, -30),
            map: map,
        });
        overLayer.push(startMarker);
    }

    if (num > 1) {
        var passMarker = new AMap.Marker({
            position: route.segments[0].transit.origin,
            // icon: './assets/pass.png',
            offset: new AMap.Pixel(-15, -40),
            map: map,
        });
        passMarker.setContent("<div style='width: 35px; height: 45px; background-color: rgba(0,0,0,0);'>" +
            "<img src='./assets/pass.png'  style='z-index:1'/>" + "<div style='width: 20px; height: 10px; display: inline-block; z-index:1;position:relative;'></div>" +
            "<div style='width: 12px; height: 12px; display: inline-block; border-radius: 50%; background-color: #d78319; color:white;z-index: 100; top: 0px; font-size: 3px;text-align:center;position:absolute;'>" + (num - 1) + "</div>" +
            "</div>"
        );
        overLayer.push(passMarker);
    }

    if (num == all) {
        var endMarker = new AMap.Marker({
            position: route.segments[route.segments.length - 1].transit.destination,
            icon: './assets/end.png',
            offset: new AMap.Pixel(-15, -30),
            map: map,
        });
        overLayer.push(endMarker);
    }

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
    if (all === all) map.setFitView(overLayer);
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

// walkingMul/Riding/Transfer.search 方便异步调用
// num和all参数解释见函数drawRoute()
// isComfort判断是否为最舒适路线绘制
// walkingMul为绘制地图
function getWalking(startPosition, endPosition, num = 1, all = 1, isComfort = false, walking = walkingMul, map = gdmap) {
    let p = new Promise((resolve, reject) => {
        walking.search(startPosition, endPosition, function (status, result) {
            // result即是对应的步行路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_WalkingResult
            if (status === 'complete') {
                if (result.routes && result.routes.length) {
                    drawRoute(result.routes[0], map, num, all, isComfort);
                    resolve(carbonCalc('walk', result.routes[0].distance / 1000)); // 减碳量
                } else {
                    resolve(-1);
                }
            } else {
                if (isComfort || all == 1) msgHint("路线绘制失败", false);
                else msgHint("第 " + num + " 条" + "路线(步行)数据查询失败!", false);
            }
        })
    });
    return p;
}
async function getWalkingComfort(startPosition, endPosition, num = 1, all = 1, isComfort = true, walking = walkingMul, map = hiddenMap) {
    let p = new Promise(async (resolve, reject) => {
        let middlePosition = [(startPosition[0] + endPosition[0]) / 2, (startPosition[1] + endPosition[1]) / 2];
        // 计算起终点距离
        let sta2endDis = AMap.GeometryUtil.distance(startPosition, endPosition);
        // 半径
        let radius = sta2endDis / 2;
        // 调用高德 周边搜索API 搜索中点半径范围内是否有公园等设施
        let url = "https://restapi.amap.com/v3/place/around?key=f1dbdde4f534703472073cece6811628&location=" + middlePosition[0] + "," + middlePosition[1] + "&radius=" + radius + "&types=110000"
        let passPosition = await getAttraction(url);

        // 普通路线
        let generalCarb = await getWalking(startPosition, endPosition, num, all, false, riding, map);
        let generalDist = generalCarb / (0.192 - 0.0015); // 注意，如果carbonReduction是用g做单位，还需要除以1000
        
        // passPosition为0即说明范围内未找到风景名胜位置，直接使用普通路线
        // passPosition不为0即说明在范围内找到风景名胜点位置，进入绘制舒适路线
        let comfortRouteDist = 9999999; // 记录舒适路线距离
        if (passPosition != 0) {
            // 舒适路线 - 路线规划
            let carbonReduction = await getWalking(startPosition, passPosition, num, all, false, walkingMul, hiddenMap);
            if (carbonReduction == -1) {
                msgHint('规划路线失败', false);
                return 0;
            }
            let tempCarb = await getWalking(passPosition, endPosition, num+1, all+1, isComfort, walkingMul, hiddenMap)
            if (tempCarb == -1) {
                msgHint('规划路线失败', false);
                return 0;
            }
            carbonReduction += tempCarb;

            // 舒适路线距离
            comfortRouteDist = carbonReduction / (0.192 - 0.0005); // 注意，如果carbonReduction是用g做单位，还需要除以1000
        }

        // 比较舒适路线距离与普通路线距离, 如果舒适路线距离过长则重新使用普通路线
        if (comfortRouteDist >= generalDist * 2) {
            resolve(await getWalking(startPosition, endPosition, num, all, false, walkingMul, gdmap));
        } else {
            let temp1 = await getWalking(startPosition, passPosition, num, all+1, false, walkingMul, gdmap);
            let temp2 = await getWalking(passPosition, endPosition, num+1, all+1, true, walkingMul, gdmap);
            resolve(temp1+temp2);
        }
    });
    return p;
}

function getRiding(startPosition, endPosition, num, all, isComfort = false, riding = ridingMul, map = gdmap) {
    let p = new Promise((resolve, reject) => {
        riding.search(startPosition, endPosition, function (status, result) {
            // result即是对应的步行路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_WalkingResult
            if (status === 'complete') {
                if (result.routes && result.routes.length) {
                    drawRoute(result.routes[0], map, num, all, isComfort);
                    resolve(carbonCalc('ride', result.routes[0].distance / 1000)); // 减碳量
                } else {
                    resolve(-1);
                }
            } else {
                msgHint("第 " + num + " 条" + "路线(骑行)数据查询失败!", false);
            }
        })
    });
    return p;
}
async function getRidingComfort(startPosition, endPosition, num = 1, all = 1, isComfort = true, riding = ridingMul, map = hiddenMap) {
    let p = new Promise(async (resolve, reject) => {
        let middlePosition = [(startPosition[0] + endPosition[0]) / 2, (startPosition[1] + endPosition[1]) / 2];
        // 计算起终点距离
        let sta2endDis = AMap.GeometryUtil.distance(startPosition, endPosition);
        // 半径
        let radius = sta2endDis / 2;
        // 调用高德 周边搜索API 搜索中点半径范围内是否有公园等设施
        let url = "https://restapi.amap.com/v3/place/around?key=f1dbdde4f534703472073cece6811628&location=" + middlePosition[0] + "," + middlePosition[1] + "&radius=" + radius + "&types=110000"
        let passPosition = await getAttraction(url);

        // 普通路线
        let generalCarb = await getRiding(startPosition, endPosition, num, all, false, riding, map);
        let generalDist = generalCarb / (0.192 - 0.0015); // 注意，如果carbonReduction是用g做单位，还需要除以1000
        
        // passPosition为0即说明范围内未找到风景名胜位置，直接使用普通路线
        // passPosition不为0即说明在范围内找到风景名胜点位置，进入绘制舒适路线
        let comfortRouteDist = 9999999; // 记录舒适路线距离
        if (passPosition != 0) {
            // 舒适路线 - 路线规划
            let carbonReduction = await getRiding(startPosition, passPosition, num, all, false, ridingMul, hiddenMap);
            if (carbonReduction == -1) {
                msgHint('规划路线失败', false);
                return 0;
            }
            let tempCarb = await getRiding(passPosition, endPosition, num+1, all+1, isComfort, ridingMul, hiddenMap)
            if (tempCarb == -1) {
                msgHint('规划路线失败', false);
                return 0;
            }
            carbonReduction += tempCarb;

            // 舒适路线距离
            comfortRouteDist = carbonReduction / (0.192 - 0.0005); // 注意，如果carbonReduction是用g做单位，还需要除以1000
        }

        // 比较舒适路线距离与普通路线距离, 如果舒适路线距离过长则重新使用普通路线
        if (comfortRouteDist >= generalDist * 2) {
            resolve(await getRiding(startPosition, endPosition, num, all, false, ridingMul, gdmap));
        } else {
            let temp1 = await getRiding(startPosition, passPosition, num, all+1, false, ridingMul, gdmap);
            let temp2 = await getRiding(passPosition, endPosition, num+1, all+1, isComfort, ridingMul, gdmap);
            resolve(temp1+temp2);
        }
    });
    return p;
}

function getTransfer(startPosition, endPosition, num, all) {
    let p = new Promise((resolve, reject) => {
        transferMul.search(startPosition, endPosition, function (status, result) {
            // result即是对应的步行路线数据信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_WalkingResult
            if (status === 'complete') {
                if (result.plans && result.plans.length) {
                    let tripMode = ["walk", "bus", "car", "subway"];
                    let tripDis = [result.plans[0].walking_distance / 1000,
                    result.plans[0].transit_distance / 1000,
                    result.plans[0].taxi_distance / 1000,
                    result.plans[0].railway_distance / 1000];
                    drawRouteTransfer(result.plans[0], gdmap, num, all);
                    let carbonReduction = carbonCalcMul(tripMode, tripDis);
                    resolve(carbonReduction); // 减碳量
                } else {
                    resolve(-1);
                }
            } else {
                msgHint("第 " + num + " 条" + "路线(公共交通)数据查询失败!", false);
            }
        })
    });
    return p;
}


// 多点出行
let tripModesMul = []; // 每条路线的出行方式
let routePosit = [];   // 按顺序存储最终路线的经纬度
let pointName = [];    // 存放地点名
let sizeMul;  // 多点出行地点数量
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
    sizeMul = size;
    let pointIn = [];
    let pointPosit = [];  // 按输入顺序存储输入点的经纬度

    let pointDis = Array.from(Array(10), () => new Array(10)); // 二维数组，存放对应两点间的距离

    tripModesMul.length = 0; // 先清除之前的内容
    for (let i = 0; i < size - 1; i++) {
        tripModesMul.push('walk-time'); // 开始默认都是步行-最短时间
    }

    for (let i = 0; i < size; i++) {
        pointIn[i] = document.getElementById(routePointIn[i]);
    }

    // 获取对应位置坐标
    for (let i = 0; i < size; i++) {
        let url = "https://restapi.amap.com/v3/assistant/inputtips?output=json&city=杭州&keywords=" + pointIn[i].value + "&key=f1dbdde4f534703472073cece6811628";
        pointPosit[i] = await getPosition(url, pointIn[i]);
        if (pointPosit[i] == 0) {
            msgHint("输入的第" + (i + 1) + "个位置无法识别", false);
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
    // searchClear();
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
    // 排列地点名
    for (let i = 0; i < size; i++) {
        pointName.push(document.getElementById(routePointIn[routeList[i]]).value);
    }

    // 路线规划
    drawRouteMul(routePosit, tripModesMul, pointName, size);
}

// 多点出行路线规划
// routePosit指路线列表数组
// tripModesMul指出行方式数组
// pointName指地点名数组
// size是总地点数    
const contentPanel = document.getElementById('routeContentMul');
async function drawRouteMul(routePosit, tripModes, pointName, size) {
    contentPanel.innerHTML = ''; // 清除之前添加的子节点
    let carbonReduction = 0;
    for (let i = 0; i < size - 1; i++) {
        let backValue;
        // 添加节点
        let routeCount = document.createElement('h5');
        routeCount.classList.add("routeCount");
        routeCount.innerHTML = '第' + (i + 1) + '程'
        let routeSta = document.createElement('span');
        routeSta.classList.add("routeStaEnd");
        routeSta.innerHTML = pointName[i] + '&nbsp&nbsp&nbsp';
        let routeLink = document.createElement('span');
        routeLink.innerHTML = ' > ';
        let routeEnd = document.createElement('span');
        routeEnd.classList.add("routeStaEnd");
        routeEnd.innerHTML = pointName[i + 1] + '&nbsp&nbsp&nbsp<br/>';
        let selectList = document.createElement('select');
        selectList.id = "selectList" + i;
        selectList.options.add(new Option("步行-最短时间", 'walk-time'));
        selectList.options.add(new Option("步行-最舒适", 'walk-comfort'));
        selectList.options.add(new Option("骑行-最短时间", 'ride-time'));
        selectList.options.add(new Option("骑行-最舒适", 'ride-comfort'));
        selectList.options.add(new Option("公交-最短时间", 'transfer-time'));
        selectList.options.add(new Option("公交-最少步行", 'transfer-walk'));
        selectList.options.add(new Option("公交-最少换乘", 'transfer-transit'));
        selectList.options.add(new Option("公交-最舒适", 'transfer-comfort'));
        selectList.classList.add("tripModeSeelect");
        contentPanel.appendChild(routeCount);
        contentPanel.appendChild(routeSta);
        contentPanel.appendChild(routeLink);
        contentPanel.appendChild(routeEnd);
        contentPanel.appendChild(selectList);
        if (tripModes[i] === 'walk-time') backValue = await getWalking(routePosit[i], routePosit[i + 1], (i + 1), (size - 1));
        else if (tripModes[i] === 'walk-comfort') backValue = await getWalkingComfort(routePosit[i], routePosit[i + 1], (i + 1), (size - 1), true);
        else if (tripModes[i] === 'ride-time') backValue = await getRiding(routePosit[i], routePosit[i + 1], (i + 1), (size - 1));
        else if (tripModes[i] === 'ride-comfort') backValue = await getRidingComfort(routePosit[i], routePosit[i + 1], (i + 1), (size - 1), true);
        else {
            if (tripModes[i] === 'transfer-time') transferMul.setPolicy(AMap.TransferPolicy.LEAST_TIME); // 最少时间
            else if (tripModes[i] === 'transfer-transit') transferMul.setPolicy(AMap.TransferPolicy.LEAST_TRANSFER); // 最少换乘
            else if (tripModes[i] === 'transfer-walk') transferMul.setPolicy(AMap.TransferPolicy.LEAST_WALK); // 最少步行
            else if (tripModes[i] === 'transfer-comfort') transferMul.setPolicy(AMap.TransferPolicy.MOST_COMFORT); // 最舒适
            else {
                console.log('tripModes非法!');
                return 0;
            }
            backValue = await getTransfer(routePosit[i], routePosit[i + 1], (i + 1), (size - 1));
        }
        if (backValue == -1) {
            msgHint("规划路线失败!", false);
            contentPanel.innerHTML = '';
            return 0;
        } else {
            // 计算碳减排
            carbonReduction += backValue;
        }
    }
    isSearchingMul = 1;
    document.getElementById("carbonReduction-mul").innerHTML = '减碳' + carbonReduction.toFixed(2) + '千克';
}

// 重新生成路线
document.getElementById('reGenerateBtn').addEventListener('click', async function () {
    if (isSearchingMul) {
        for (let i = 0; i < sizeMul - 1; i++) {
            let selectId = "selectList" + i;
            tripModesMul[i] = document.getElementById(selectId).value;
        }

        searchClear();
        gdmap.clearMap();
        let carbonReduction = 0;
        for (let i = 0; i < sizeMul - 1; i++) {
            let backValue;
            if (tripModesMul[i] === 'walk-time') backValue = await getWalking(routePosit[i], routePosit[i + 1], (i + 1), (sizeMul - 1));
            else if (tripModesMul[i] === 'walk-comfort') backValue = await getWalkingComfort(routePosit[i], routePosit[i + 1], (i + 1), (sizeMul - 1), true);
            else if (tripModesMul[i] === 'ride-time') backValue = await getRiding(routePosit[i], routePosit[i + 1], (i + 1), (sizeMul - 1));
            else if (tripModesMul[i] === 'ride-comfort') backValue = await getRidingComfort(routePosit[i], routePosit[i + 1], (i + 1), (sizeMul - 1), true);
            else {
                if (tripModesMul[i] === 'transfer-time') transferMul.setPolicy(AMap.TransferPolicy.LEAST_TIME); // 最少时间
                else if (tripModesMul[i] === 'transfer-transit') transferMul.setPolicy(AMap.TransferPolicy.LEAST_TRANSFER); // 最少换乘
                else if (tripModesMul[i] === 'transfer-walk') transferMul.setPolicy(AMap.TransferPolicy.LEAST_WALK); // 最少步行
                else if (tripModesMul[i] === 'transfer-comfort') transferMul.setPolicy(AMap.TransferPolicy.MOST_COMFORT); // 最舒适
                else {
                    console.log('tripModes非法!');
                    return 0;
                }
                backValue = await getTransfer(routePosit[i], routePosit[i + 1], (i + 1), (sizeMul - 1));
            }
            if (backValue == -1) {
                msgHint("规划路线失败!", false);
                contentPanel.innerHTML = '';
                return 0;
            } else {
                // 计算碳减排
                carbonReduction += backValue;
            }
        }
        document.getElementById("carbonReduction-mul").innerHTML = '减碳' + carbonReduction.toFixed(2) + '千克';
    }
});