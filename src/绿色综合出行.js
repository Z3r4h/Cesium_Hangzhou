// 当前出行模式id记录, 全局、将在navigation.js中用到
var tripModeBtnId = 'walk-time';

//侧边栏点击出现拓展栏
var buttons = document.getElementsByClassName("button");
var extendedBars = document.getElementsByClassName("extendedBar");
var activeIndex = 0;

function init() {
    buttons[activeIndex].classList.add("active");
    buttons[activeIndex].src = "assets/出行导航_blue.png";
    extendedBars[activeIndex].style.display = "block";
}

//拓展栏1
function changeButton(index) {
    if (index !== activeIndex + 1) {
        extendedBarclose(activeIndex);
        activeIndex = index - 1;
        extendedBaropen(activeIndex);
    }
    else {
        if (extendedBars[activeIndex].style.display === "block") {
            extendedBarclose(activeIndex);
        } else {
            extendedBaropen(activeIndex);
        }
    }
}

function extendedBarclose(activeIndex) {
    switch (activeIndex) {
        case 0:
            buttons[activeIndex].classList.remove("active");
            buttons[activeIndex].src = "assets/出行导航_white.png";
            extendedBars[activeIndex].style.display = "none";
            break;
        case 1:
            buttons[activeIndex].classList.remove("active");
            buttons[activeIndex].src = "assets/城市设施_white.png";
            extendedBars[activeIndex].style.display = "none";
            break;
        case 2:
            buttons[activeIndex].classList.remove("active");
            buttons[activeIndex].src = "assets/绿色地图_white.png";
            extendedBars[activeIndex].style.display = "none";
            break;
        case 3:
            buttons[activeIndex].classList.remove("active");
            buttons[activeIndex].src = "assets/个人中心_white.png";
            extendedBars[activeIndex].style.display = "none";
            break;
    }
}

function extendedBaropen(activeIndex) {
    switch (activeIndex) {
        case 0:
            buttons[activeIndex].classList.add("active");
            buttons[activeIndex].src = "assets/出行导航_blue.png";
            extendedBars[activeIndex].style.display = "block";
            break;
        case 1:
            buttons[activeIndex].classList.add("active");
            buttons[activeIndex].src = "assets/城市设施_blue.png";
            extendedBars[activeIndex].style.display = "block";
            break;
        case 2:
            buttons[activeIndex].classList.add("active");
            buttons[activeIndex].src = "assets/绿色地图_blue.png";
            extendedBars[activeIndex].style.display = "block";
            break;
        case 3:
            buttons[activeIndex].classList.add("active");
            buttons[activeIndex].src = "assets/个人中心_blue.png";
            extendedBars[activeIndex].style.display = "block";
            break;
    }
}
init();

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94LXhzIiwiYSI6ImNsaTVvcXByMDFmZTMzZm8zOGtsbXUwN2IifQ.qQmT-APr8yb1gPDAxR2P0A';
var map = new mapboxgl.Map({
    container: 'mainmap',
    style: 'mapbox://styles/mapbox/streets-v10',
    center: [120.155070, 30.274085], // starting position
    zoom: 11
});

// 设置语言
mapboxgl.setRTLTextPlugin('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.1.0/mapbox-gl-rtl-text.js');
map.addControl(new MapboxLanguage({ defaultLanguage: 'zh' }));


// 创建Leaflet地图对象
var leafletMap = L.map('mainmap').setView([30.274085, 120.155070], 11);

// 定义Mapbox底图URL
var mapboxUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiemVyNGgiLCJhIjoiY2xoeGI0dG03MHMydDNxbnRmNHBubmozayJ9.ln24sT_GoKRsF15MQyVNuQ';

// 创建Leaflet地图图层，并添加到地图上
var mapboxLayer = L.tileLayer(mapboxUrl, {
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
});
var geoTIFFLayer = null;
var aqiLayer = null;
var pm25Layer = null;
var pm10Layer = null;
// 找到切换按钮
var greenbutton = document.getElementById('greenbutton');
greenbutton.addEventListener("click", function () {
    if (!leafletMap.hasLayer(mapboxLayer)) {
        addleaflet();
        geoTIFFLayer = L.imageOverlay('http://localhost:8080/geoserver/yandanyang/wms?service=WMS&version=1.1.0&request=GetMap&layers=yandanyang%3Acombined_data&bbox=782835.0%2C3323595.0%2C850545.0%2C3372675.0&width=768&height=556&srs=EPSG%3A32650&styles=&format=image%2Fpng',  [[30.010719932787183, 119.93219337258866], [30.43523957235633,120.6493862990089]]).addTo(leafletMap);
    }
    else {
        closeleaflet();
        leafletMap.removeLayer(geoTIFFLayer);
        geoTIFFLayer = null;
    }
});
var MapButton = document.getElementById('AQI_button');
MapButton.addEventListener("click", function () {
    if (!leafletMap.hasLayer(mapboxLayer)) {
        addleaflet();
    }
    else {
        closeleaflet();
    }
});

var glbuttons = document.querySelectorAll('.glbutton');
glbuttons.forEach((glbutton) => {
    glbutton.addEventListener("click", function () {
        if (leafletMap.hasLayer(mapboxLayer)) {
            closeleaflet();
        }
    });
});


// 添加点击事件处理程序
function addleaflet() {
    // 切换底图
    if (!leafletMap.hasLayer(mapboxLayer)) {
        leafletMap.addLayer(mapboxLayer);
    }
};
function closeleaflet() {
    // 切换底图
    if (leafletMap.hasLayer(mapboxLayer)) {
        if (pm25Layer) {
            leafletMap.removeLayer(pm25Layer);
            pm25Layer = null;
        }
        if (pm10Layer) {
            leafletMap.removeLayer(pm10Layer);
            pm10Layer = null;
        }
        if (aqiLayer) {
            leafletMap.removeLayer(aqiLayer);
            aqiLayer = null;
        }
        leafletMap.removeLayer(mapboxLayer);
    }
};


function showAQIMap() {
    if (pm25Layer) {
        leafletMap.removeLayer(pm25Layer);
        pm25Layer = null;
    }
    if (pm10Layer) {
        leafletMap.removeLayer(pm10Layer);
        pm10Layer = null;
    }

    if (!aqiLayer) {
        aqiLayer = L.tileLayer('https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=15ab69d90cd615d9f3223b88c89426e8aca534ed').addTo(leafletMap);
    }
}

function showPM25Map() {
    if (aqiLayer) {
        leafletMap.removeLayer(aqiLayer);
        aqiLayer = null;
    }
    if (pm10Layer) {
        leafletMap.removeLayer(pm10Layer);
        pm10Layer = null;
    }

    if (!pm25Layer) {
        pm25Layer = L.tileLayer('https://tiles.waqi.info/tiles/usepa-pm25/{z}/{x}/{y}.png?token=15ab69d90cd615d9f3223b88c89426e8aca534ed').addTo(leafletMap);
    }
}

function showPM10Map() {
    if (aqiLayer) {
        leafletMap.removeLayer(aqiLayer);
        aqiLayer = null;
    }
    if (pm25Layer) {
        leafletMap.removeLayer(pm25Layer);
        pm25Layer = null;
    }

    if (!pm10Layer) {
        pm10Layer = L.tileLayer('https://tiles.waqi.info/tiles/usepa-pm10/{z}/{x}/{y}.png?token=15ab69d90cd615d9f3223b88c89426e8aca534ed').addTo(leafletMap);
    }
}
// 拓展栏1

//nav切换
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content');

navItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        contentSections.forEach((section, sectionIndex) => {
            if (sectionIndex === index || (index === 2 && (sectionIndex === 2 || sectionIndex === 3))) {
                section.style.display = 'flex';
            } else {
                section.style.display = 'none';
            }
        });
    });
});

function openSubButton(event, subBtnId, titleContent) {
    // 使用tab button获取所有元素，并删除类active
    var tabButtons = document.getElementsByClassName("sub-button");
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    // 为当前选项卡的第一个子选项加上active类
    document.getElementById(subBtnId).classList.add('active');

    // 更换标题
    document.getElementById("routeContentDiv").firstElementChild.innerHTML = titleContent;

    // 更换出行模式
    tripModeBtnId = subBtnId;
}

function openTab(event, subBtnId, titleContent) {
    //获取tab content的所有元素并隐藏它们
    // var tabContents = document.getElementsByClassName("tabcontent");
    // for (var i = 0; i < tabContents.length; i++) {
    //     tabContents[i].style.display = "none";
    // }

    //使用tab button获取所有元素，并删除类active
    var tabButtons = document.getElementsByClassName("sub-button");
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    //显示当前选项卡，并向打开该选项卡的按钮添加一个active类
    // document.getElementById(tabName).style.display = "block";
    event.currentTarget.classList.add("active");

    // 更换标题
    document.getElementById("routeContentDiv").firstElementChild.innerHTML = titleContent;

    // 更换出行模式
    tripModeBtnId = subBtnId;
}

const filterBtn1 = document.getElementById("filterBtn1");
const filterBoxContent1 = document.getElementById("filterBoxContent1");
const cancelBtn1 = document.getElementById("cancelBtn1");
const confirmBtn1 = document.getElementById("confirmBtn1");

filterBtn1.addEventListener('click', () => {
    filterBoxContent1.style.display = 'block';
});

cancelBtn1.addEventListener('click', () => {
    filterBoxContent1.style.display = 'none';
});

confirmBtn1.addEventListener('click', () => {
    const weather = document.querySelector('input[name="weather"]:checked');
    const avoid = document.querySelector('input[name="avoid"]');
    const interests = document.querySelectorAll('.interest');

    console.log('天气：', weather ? weather.value : '');
    console.log('避让地点：', avoid ? avoid.value : '');
    interests.forEach((interest) => {
        if (interest.querySelector('input[type="radio"]').checked) {
            console.log('兴趣优先级：', interest.querySelector('.value').textContent);
        }
    });
    filterBoxContent1.style.display = 'none';
});
//search-button、筛选
const sb_button = document.querySelector("#search-button");

sb_button.addEventListener("click", (e) => {
    e.preventDefault;
    sb_button.classList.add("animate");
    setTimeout(() => {
        sb_button.classList.remove("animate");
    }, 600);
});
const sb_button2 = document.querySelector("#filterBtn1");

sb_button2.addEventListener("click", (e) => {
    e.preventDefault;
    sb_button2.classList.add("animate");
    setTimeout(() => {
        sb_button2.classList.remove("animate");
    }, 600);
});


// 拓展栏2
const searchBox3 = document.getElementById("search-box3");
const addButton1 = document.getElementById("add-button1");
const deleteButton1 = document.getElementById("delete-button1");

let counter = 1;

addButton1.addEventListener("click", () => {
    const input = document.createElement("input");
    input.id = `pass-search-text${counter++}`;
    input.type = "text";
    input.placeholder = "请输入中间点";
    input.classList.add("searchtext");
    searchBox3.insertBefore(input, searchBox3.lastChild.previousSibling);
    addButton1.value = counter - 1; // add-button1的value记录存在的中间输入框
});

deleteButton1.addEventListener("click", () => {
    const inputs = searchBox3.querySelectorAll("input[type=text]");
    if (inputs.length > 2) {
        searchBox3.removeChild(inputs[inputs.length - 2]);
        counter--;
        addButton1.value = counter - 1;
    }
});

/*function openTab2(event, tabName) {
    //获取tab content的所有元素并隐藏它们
    var tabContents2 = document.getElementsByClassName("tabcontent2");
    for (var i = 0; i < tabContents2.length; i++) {
        tabContents2[i].style.display = "none";
    }

    //使用tab button获取所有元素，并删除类active
    var tabButtons2 = document.getElementsByClassName("tablinks2");
    for (var i = 0; i < tabButtons2.length; i++) {
        tabButtons2[i].classList.remove("active");
    }

    //显示当前选项卡，并向打开该选项卡的按钮添加一个active类
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.classList.add("active");
}*/

//nav切换
const nav2Items = document.querySelectorAll('.nav2-item');
const content2Sections = document.querySelectorAll('.content2');

nav2Items.forEach((item, index) => {
    item.addEventListener('click', () => {
        content2Sections.forEach((section, sectionIndex) => {
            if (sectionIndex === index || (index === 2 && (sectionIndex === 2 || sectionIndex === 3))) {
                section.style.display = 'flex';
            } else {
                section.style.display = 'none';
            }
        });
    });
});

function openSubButton(event, subBtnId, titleContent) {
    // 使用tab button获取所有元素，并删除类active
    var tabButtons = document.getElementsByClassName("sub-button");
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    // 为当前选项卡的第一个子选项加上active类
    document.getElementById(subBtnId).classList.add('active');

    // 更换标题
    document.getElementById("routeContentDiv").firstElementChild.innerHTML = titleContent;

    // 更换出行模式
    tripModeBtnId = subBtnId;
}

function openTab(event, subBtnId, titleContent) {
    //获取tab content的所有元素并隐藏它们
    // var tabContents = document.getElementsByClassName("tabcontent");
    // for (var i = 0; i < tabContents.length; i++) {
    //     tabContents[i].style.display = "none";
    // }

    //使用tab button获取所有元素，并删除类active
    var tabButtons = document.getElementsByClassName("sub-button");
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    //显示当前选项卡，并向打开该选项卡的按钮添加一个active类
    // document.getElementById(tabName).style.display = "block";
    event.currentTarget.classList.add("active");

    // 更换标题
    document.getElementById("routeContentDiv").firstElementChild.innerHTML = titleContent;

    // 更换出行模式
    tripModeBtnId = subBtnId;
}

const filterBtn2 = document.getElementById("filterBtn2");
const filterBoxContent2 = document.getElementById("filterBoxContent2");
const cancelBtn2 = document.getElementById("cancelBtn2");
const confirmBtn2 = document.getElementById("confirmBtn2");

filterBtn2.addEventListener('click', () => {
    filterBoxContent2.style.display = 'block';
});

cancelBtn2.addEventListener('click', () => {
    filterBoxContent2.style.display = 'none';
});

confirmBtn2.addEventListener('click', () => {
    const weather = document.querySelector('input[name="weather"]:checked');
    const avoid = document.querySelector('input[name="avoid"]');
    const interests = document.querySelectorAll('.interest');

    console.log('天气：', weather ? weather.value : '');
    console.log('避让地点：', avoid ? avoid.value : '');
    interests.forEach((interest) => {
        if (interest.querySelector('input[type="radio"]').checked) {
            console.log('兴趣优先级：', interest.querySelector('.value').textContent);
        }
    });
    filterBoxContent2.style.display = 'none';
});

//search-button、筛选
const sb_button3 = document.querySelector("#search-button2");

sb_button3.addEventListener("click", (e) => {
    e.preventDefault;
    sb_button3.classList.add("animate");
    setTimeout(() => {
        sb_button3.classList.remove("animate");
    }, 600);
});
const sb_button4 = document.querySelector("#filterBtn2");

sb_button4.addEventListener("click", (e) => {
    e.preventDefault;
    sb_button4.classList.add("animate");
    setTimeout(() => {
        sb_button4.classList.remove("animate");
    }, 600);
});

// 拓展栏3
// 工具箱 
function toolPanelOpen(event, toolButton, toolPanelId) {
    let buttonClick = document.getElementById(toolButton); // 点击的按钮
    let toolPanel = document.getElementById(toolPanelId); // 按钮对应的的工具面板
    if (toolPanel.style.display == "block") { // 如果原来恰好是其打开，将其关闭
        toolPanel.style.display = "none";
        buttonClick.style.backgroundColor = null;
    } else {   // 如果原来该扩展栏未打开，将其打开，将其他关闭
        let toolPanels = document.getElementsByClassName('toolPanel');
        let toolButtons = document.getElementsByClassName('toolBtn');
        for (let i = 0; i < toolPanels.length; i++) {
            toolPanels[i].style.display = "none";
            toolButtons[i].style.backgroundColor = "#f5f4f4";
        }
        toolPanel.style.display = "block";
        buttonClick.style.backgroundColor = null;
    }
}


// 加载地铁路线
map.on('style.load', function () {

    map.addSource('subline-source', {
        type: 'geojson',
        data: 'data/subline.geojson'
    });
    map.addSource('subpoint-source', {
        type: 'geojson',
        data: 'data/subpoint.geojson'
    });
    var toggleButton3 = document.getElementById('toggleButton3');
    var isLayerVisible3 = false;
    var subline = 'subline-layer';
    var subpoint = 'subpoint-layer';

    // 监听按钮点击事件
    toggleButton3.addEventListener('click', function () {
        leafletMap.removeLayer(mapboxLayer);
        if (!isLayerVisible3) {
            map.addLayer({
                id: 'subline-layer',
                type: 'line',
                source: 'subline-source',
                paint: {
                    'line-color': 'rgb(218,112,214)',
                    'line-width': 3
                }
            });
            map.addLayer({
                id: 'subpoint-layer',
                type: 'circle',
                source: 'subpoint-source',
                paint: {
                    'circle-color': 'rgb(255,0,0)',
                    'circle-radius': 5
                }
            });
            isLayerVisible3 = true;

            // 创建一个弹出框
            var popup3 = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });

            // 添加鼠标移动事件，显示弹出框
            map.on('mousemove', 'subline-layer', function (e3) {
                // 获取当前鼠标所在位置的要素
                var feature3 = e3.features[0];
                // 设置弹出框的内容和位置
                popup3.setLngLat(e3.lngLat)
                    .setHTML('<div class="popup-content">' + feature3.properties.name + '</div>')
                    .addTo(map);
            });
            map.on('mousemove', 'subpoint-layer', function (e3) {
                var feature4 = e3.features[0];
                popup3.setLngLat(e3.lngLat)
                    .setHTML('<div class="popup-content">' + feature4.properties.name + '</div>')
                    .addTo(map);
            });

            // 添加鼠标移出事件，隐藏弹出框
            map.on('mouseleave', 'subline-layer', function () {
                popup3.remove();
            });
            map.on('mouseleave', 'subpoint-layer', function () {
                popup3.remove();
            });

            // 添加点击事件，显示线路信息
            map.on('click', 'subline-layer', function (e3) {
                // 获取被点击的要素
                var feature3 = e3.features[0];
                // 显示线路信息
                alert(feature3.properties.name);
            });
            map.on('click', 'subpoint-layer', function (e3) {
                var feature4 = e3.features[0];
                alert(feature4.properties.name);
            });

            map.on('mouseenter', 'subline-layer', function () {
                map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', 'subline-layer', function () {
                map.getCanvas().style.cursor = '';
            });

            map.on('mouseenter', 'subpoint-layer', function () {
                map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', 'subpoint-layer', function () {
                map.getCanvas().style.cursor = '';
            });
        }
        else {
            // 移除图层
            map.removeLayer(subline);
            map.removeLayer(subpoint);
            isLayerVisible3 = false;
        }
    });
})


// 加载公交路线
map.on('style.load', function () {

    map.addSource('busline-source', {
        type: 'geojson',
        data: 'data/busline.geojson'
    });
    map.addSource('buspoint-source', {
        type: 'geojson',
        data: 'data/buspoint.geojson'
    });
    var toggleButton = document.getElementById('toggleButton');
    var isLayerVisible = false;
    var busline = 'busline-layer';
    var buspoint = 'buspoint-layer';
    var highlightedBusline = 'highlighted-busline-layer'; // 新的高亮线路图层ID

    // 监听按钮点击事件
    toggleButton.addEventListener('click', function () {
        leafletMap.removeLayer(mapboxLayer);
        if (!isLayerVisible) {
            map.addLayer({
                id: 'busline-layer',
                type: 'line',
                source: 'busline-source',
                paint: {
                    'line-color': '#137427',
                    'line-width': 2
                }
            });
            map.addLayer({
                id: 'buspoint-layer',
                type: 'circle',
                source: 'buspoint-source',
                paint: {
                    'circle-color': 'rgb(222,184,135)',
                    'circle-radius': 3
                }
            });
            isLayerVisible = true;

            // 创建一个弹出框
            var popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });

            // 添加鼠标移动事件，显示弹出框
            map.on('mousemove', 'busline-layer', function (e) {
                // 获取当前鼠标所在位置的要素
                var feature = e.features[0];
                // 设置弹出框的内容和位置
                popup.setLngLat(e.lngLat)
                    .setHTML('<div class="popup-content">' + feature.properties.name_gd + '</div>')
                    .addTo(map);
            });
            map.on('mousemove', 'buspoint-layer', function (e) {
                var feature5 = e.features[0];
                popup.setLngLat(e.lngLat)
                    .setHTML('<div class="popup-content">' + feature5.properties.name_st + '</div>')
                    .addTo(map);
            });

            // 添加鼠标移出事件，隐藏弹出框
            map.on('mouseleave', 'busline-layer', function () {
                popup.remove();
            });
            map.on('mouseleave', 'subpoint-layer', function () {
                popup.remove();
            });

            // 添加点击事件，显示公交线路信息
            map.on('click', 'busline-layer', function (e) {
                // 移除之前创建的高亮线路图层（如果有）
                if (map.getLayer(highlightedBusline)) {
                    map.removeLayer(highlightedBusline);
                }
                // 获取被点击的要素
                var feature = e.features[0];
                // 显示公交线路信息
                alert(feature.properties.name_gd);
                // 创建一个新的高亮线路图层
                map.addLayer({
                    id: highlightedBusline,
                    type: 'line',
                    source: 'busline-source',
                    paint: {
                        'line-color': 'rgb(255, 0, 0)', // 设置高亮颜色
                        'line-width': 3
                    },
                    filter: ['==', 'name_gd', feature.properties.name_gd] // 设置过滤器，仅显示选中的线路
                });
                // 调整地图视图以包含高亮的线路
                var bounds = new mapboxgl.LngLatBounds();
                feature.geometry.coordinates.forEach(function (coord) {
                    bounds.extend(coord);
                });
                map.fitBounds(bounds, {
                    padding: 20
                });
            });
            map.on('click', 'buspoint-layer', function (e) {
                var feature5 = e.features[0];
                alert(feature5.properties.name_st);
            });

            map.on('mouseenter', 'busline-layer', function () {
                map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', 'busline-layer', function () {
                map.getCanvas().style.cursor = '';
            });

            map.on('mouseenter', 'buspoint-layer', function () {
                map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', 'buspoint-layer', function () {
                map.getCanvas().style.cursor = '';
            });
        }
        else {
            // 移除图层
            map.removeLayer(busline);
            map.removeLayer(buspoint);
            map.removeLayer(highlightedBusline);
            isLayerVisible = false;
        }
    });
    var buslineInput = document.getElementById('busline-input');
    var highlightButton = document.getElementById('highlight-button');

    highlightButton.addEventListener('click', function () {
        var buslineName = buslineInput.value;
        // 移除之前创建的高亮线路图层（如果有）
        if (map.getLayer(highlightedBusline)) {
            map.removeLayer(highlightedBusline);
        }
        // 创建一个新的高亮线路图层
        map.addLayer({
            id: highlightedBusline,
            type: 'line',
            source: 'busline-source',
            paint: {
                'line-color': 'rgb(255, 0, 0)', // 设置高亮颜色
                'line-width': 3
            },
            filter: ['==', 'name', buslineName] // 设置过滤器，仅显示选中的线路
        });

        // 获取符合条件的线路要素
        var features = map.querySourceFeatures('busline-source', {
            filter: ['==', 'name', buslineName]
        });

        if (features.length > 0) {
            // 获取第一个符合条件的要素的边界框
            var bounds = new mapboxgl.LngLatBounds();
            features[0].geometry.coordinates.forEach(function (coord) {
                bounds.extend(coord);
            });

            // 调整地图视图以包含高亮的线路
            map.fitBounds(bounds, {
                padding: 20
            });
        }
    });
})



// 加载杭州道路
map.on('style.load', function () {

    map.addSource('hzline-source', {
        type: 'geojson',
        data: 'data/hzline.geojson'
    });
    var toggleButton2 = document.getElementById('toggleButton2');
    var isLayerVisible2 = false;
    var hzline = 'hzline-layer';

    // 监听按钮点击事件
    toggleButton2.addEventListener('click', function () {
        leafletMap.removeLayer(mapboxLayer);
        if (!isLayerVisible2) {
            map.addLayer({
                id: 'hzline-layer',
                type: 'line',
                source: 'hzline-source',
                paint: {
                    'line-color': 'rgb(0,191,255)',
                    'line-width': 2
                }
            });
            isLayerVisible2 = true;

            // 创建一个弹出框
            var popup2 = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });

            // 添加鼠标移动事件，显示弹出框
            map.on('mousemove', 'hzline-layer', function (e2) {
                // 获取当前鼠标所在位置的要素
                var feature2 = e2.features[0];

                // 设置弹出框的内容和位置
                popup2.setLngLat(e2.lngLat)
                    .setHTML('<div class="popup-content">' + feature2.properties.type + '</div>')
                    .addTo(map);
            });

            // 添加鼠标移出事件，隐藏弹出框
            map.on('mouseleave', 'hzline-layer', function () {
                popup2.remove();
            });

            // 添加点击事件，显示线路信息
            map.on('click', 'hzline-layer', function (e2) {
                // 获取被点击的要素
                var feature2 = e2.features[0];

                // 显示线路信息
                alert(feature2.properties.type);
            });

            map.on('mouseenter', 'hzline-layer', function () {
                map.getCanvas().style.cursor = 'pointer';
            });

            map.on('mouseleave', 'hzline-layer', function () {
                map.getCanvas().style.cursor = '';
            });
        }
        else {
            // 移除图层
            map.removeLayer(hzline);
            isLayerVisible2 = false;
        }
    });
})



// 拓展栏4
function personalPanelOpen(event, personalBtn, personalPanelId) {
    let buttonClick = document.getElementById(personalBtn);
    let personalPanelSelected = document.getElementById(personalPanelId);
    let personalBtns = document.getElementsByClassName("personalBtn");
    let personalPanels = document.getElementsByClassName("personalPanel");
    if (personalPanelSelected.style.display == "block") {
        // do nothing
    } else {
        for (let i = 0; i < personalPanels.length; i++) {
            personalPanels[i].style.display = "none";
            personalBtns[i].style.backgroundColor = "#f5f4f4";
        }
        buttonClick.style.backgroundColor = "#ffffff";
        personalPanelSelected.style.display = "block";
    }
}