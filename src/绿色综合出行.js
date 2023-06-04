// 当前出行模式id记录, 全局、将在navigation.js中用到
var tripModeBtnId = 'walk-time';

//侧边栏点击出现拓展栏
var buttons = document.getElementsByClassName("button");
var extendedBars = document.getElementsByClassName("extendedBar");
var activeIndex = 0;


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
var leafletMap = L.map('mainmap').setView([30.224085, 120.155070], 11);

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
        geoTIFFLayer = L.imageOverlay('http://localhost:8080/geoserver/yandanyang/wms?service=WMS&version=1.1.0&request=GetMap&layers=yandanyang%3Acombined_data&bbox=782835.0%2C3323595.0%2C850545.0%2C3372675.0&width=768&height=556&srs=EPSG%3A32650&styles=&format=image%2Fpng', [[30.010719932787183, 119.93219337258866], [30.43523957235633, 120.6493862990089]]).addTo(leafletMap);
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
            leafletMap.removeLayer(geoTIFFLayer);
            geoTIFFLayer = null;
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

var mainmap = document.getElementById('mainmap');
var mapNavigation = document.getElementById('mapNavigation');

function openAmap(){
    if(mainmap.style.display == "block"){
        mainmap.style.display = "none";
    }
    if(mapNavigation.style.display == "none"){
        mapNavigation.style.display = "block";
    }
}

function openglmap(){
    if(mapNavigation.style.display == "block"){
    mapNavigation.style.display = "none";
    }
    if(mainmap.style.display == "none"){
        mainmap.style.display = "block";
    }
}

const Btn1 = document.getElementById("button1");
const Btn2 = document.getElementById("button2");
const Btn3 = document.getElementById("button3");

Btn1.addEventListener('click',() =>{
        openAmap();
});
Btn2.addEventListener('click',() =>{
         openAmap();
});
Btn3.addEventListener('click',() =>{
    openglmap();
});


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

const sb_button = document.querySelector("#search-button");
        sb_button.addEventListener("click", (e) => {
        e.preventDefault;
        sb_button.classList.add("animate");
        setTimeout(() => {
        sb_button.classList.remove("animate");
        }, 600);
});

// 拓展栏2
const searchBox3 = document.getElementById("search-box3");
const addButton1 = document.getElementById("add-button1");
const deleteButton1 = document.getElementById("delete-button1");

let counter = 1;

addButton1.addEventListener("click", () => {
    if (counter <= 5) { // 最多5个中间点
        const input = document.createElement("input");
        input.id = `pass-search-text${counter++}`;
        input.type = "text";
        input.placeholder = "请输入中间点";
        input.style.fontSize = "14px"; // 设置placeholder文本字号为14像素
        input.style.border = "none";
        input.style.outline = "2px solid rgba(35, 146, 34, 0.5)";
        input.classList.add("searchtext");
        searchBox3.insertBefore(input, searchBox3.lastChild.previousSibling);
        addButton1.value = counter - 1; // add-button1的value记录存在的中间输入框
    }
});

deleteButton1.addEventListener("click", () => {
    const inputs = searchBox3.querySelectorAll("input[type=text]");
    if (inputs.length > 2) {
        searchBox3.removeChild(inputs[inputs.length - 2]);
        counter--;
        addButton1.value = counter - 1;
    }
});

function openTab2(event, tabName) {
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
}

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

const sb_button2 = document.querySelector("#search-button2");
        sb_button2.addEventListener("click", (e) => {
        e.preventDefault;
        sb_button2.classList.add("animate");
        setTimeout(() => {
        sb_button2.classList.remove("animate");
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
    var highlightedSubline = 'highlighted-subline-layer'; // 新的高亮线路图层ID

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
                // 创建一个新的高亮线路图层
                map.addLayer({
                    id: highlightedSubline,
                    type: 'line',
                    source: 'subline-source',
                    paint: {
                        'line-color': 'rgb(0, 255, 0)', // 设置高亮颜色
                        'line-width': 5
                    },
                    filter: ['==', 'name', feature3.properties.name] // 设置过滤器，仅显示选中的线路
                });

                // 调整地图视图以包含高亮的线路
                var bounds = new mapboxgl.LngLatBounds();
                feature3.geometry.coordinates.forEach(function (coord) {
                    bounds.extend(coord);
                });
                map.fitBounds(bounds, {
                    padding: 20
                });
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
            map.removeLayer(highlightedSubline);
            isLayerVisible3 = false;
        }
    });
    var sublineInput = document.getElementById('subline-input');
    var highlightButton2 = document.getElementById('highlight-button2');

    highlightButton2.addEventListener('click', function () {
        var sublineName = sublineInput.value;
        // 移除之前创建的高亮线路图层（如果有）
        if (map.getLayer(highlightedSubline)) {
            map.removeLayer(highlightedSubline);
        }
        // 创建一个新的高亮线路图层
        map.addLayer({
            id: highlightedSubline,
            type: 'line',
            source: 'subline-source',
            paint: {
                'line-color': 'rgb(0, 255, 0)', // 设置高亮颜色
                'line-width': 5
            },
            filter: ['==', 'name', sublineName] // 设置过滤器，仅显示选中的线路
        });

        // 获取符合条件的线路要素
        var features = map.querySourceFeatures('subline-source', {
            filter: ['==', 'name', sublineName]
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
// 加载公交路线
map.on('style.load', function () {

    map.addSource('busline-source', {
        type: 'geojson',
        data: 'data/busline.geojson',
        lineMetrics: true
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
    var animatedBusline = 'animated-busline-layer'; // 光亮流动线路图层ID

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
                id: 'animated-busline-layer',
                type: 'line',
                source: 'busline-source',
                paint: {
                    'line-color': 'rgb(255, 0, 0)', // 设置高亮颜色
                    'line-width': 3,
                    'line-gradient': [
                        'interpolate',
                        ['linear'],
                        ['line-progress'],
                        0, 'rgba(255, 0, 0, 0)',
                        0.1, 'rgba(255, 0, 0, 0.7)',
                        0.3, 'rgba(255, 246, 143, 0.7)',
                        0.5, 'rgba(0, 245, 255, 0.7)',
                        0.7, 'rgba(0, 255, 255, 0.7)',
                        0.9, 'rgba(0, 0, 255, 0.7)',
                        1, 'rgba(255, 0, 255, 0.7)'
                    ]
                },
            });
            map.addLayer({
                id: 'buspoint-layer',
                type: 'circle',
                source: 'buspoint-source',
                paint: {
                    'circle-color': 'rgba(222,184,135,0.7)',
                    'circle-radius': 2
                }
            });

            // 创建光亮流动动画
            animateBusline();
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
            map.removeLayer(animatedBusline);
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

    function animateBusline() {
        var startOffset = 0;
        var endOffset = 1;
        var duration = 10000; // 动画持续时间（毫秒）
        var startTime = performance.now();

        function animate() {
            var elapsedTime = performance.now() - startTime;
            var t = elapsedTime / duration; // 计算动画的进度百分比

            if (t > 1) {
                // 动画完成后移除光亮流动线路图层
                map.removeLayer(animatedBusline);
            } else {
                // 更新光亮流动线路图层的偏移量
                var offset = startOffset + (endOffset - startOffset) * t;
                map.setPaintProperty(animatedBusline, 'line-gradient', [
                    'interpolate',
                    ['linear'],
                    ['line-progress'],
                    0,
                    'rgba(0, 255, 0, 0)', // 初始位置为透明
                    offset - 0.002,
                    'rgba(255, 0, 255, 0.8)', // 中间位置
                    offset - 0.001,
                    'rgba(255, 255, 0, 0.8)', // 中间位置
                    offset,
                    'rgba(218, 112, 214, 0.8)', // 中间位置
                    offset + 0.001,
                    'rgba(0, 255, 255, 0.8)', // 中间位置
                    offset + 0.002,
                    'rgba(124, 252, 0, 0.8)', // 中间位置
                    1,
                    'rgba(0, 255, 0, 1)' // 结束位置为透明
                ]);
                requestAnimationFrame(animate);
            }
        }

        // 开始动画
        animate();
    }
})

// 加载杭州道路
map.on('style.load', function () {

    map.addSource('hzline-source', {
        type: 'geojson',
        data: 'data/hzline_updated.geojson'
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
                    'line-color': ['get', '颜色'], // 使用'颜色'列作为线的颜色
                    'line-width': 1
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

var chuxing1 = document.getElementById('chuxing1');
var historyPanel = document.getElementById('history');
var historyCount = 0;
var searchSta = document.getElementById('search-text1');
var searchEnd = document.getElementById('search-text2');
let docLink = document.createElement('b');
docLink.innerHTML = ' > '
chuxing1.addEventListener('click', function () {
    let historyDocDiv = document.createElement('div');
    let historyDoc = document.createElement('div');
    let historyDocSta = document.createElement('b');
    let historyDocEnd = document.createElement('b');
    let historyMode = document.createElement('b');
    let historyDist = document.createElement('b');
    let historyCarb = document.createElement('b');
    // id
    historyDocDiv.id = "historyDocDiv"+historyCount;
    historyDoc.id = "historyDoc" + historyCount;
    historyDocSta.id = "historyDocSta" + historyCount;
    historyDocEnd.id = "historyDocEnd" + historyCount;
    historyMode.id = "historyMode" + historyCount;
    historyDist.id = "historyDist" + historyCount;
    historyCarb.id = "historyCarb" + historyCount;
    // class
    historyDocDiv.classList.add("docDiv");
    historyDoc.classList.add("document");
    historyDocSta.classList.add("docSta");
    historyDocEnd.classList.add("docEnd");
    historyMode.classList.add("docMode");
    historyDist.classList.add("docList");
    historyCarb.classList.add("docCarb");
    historyDocSta.innerHTML = searchSta.value;
    historyDocEnd.innerHTML = searchEnd.value;
    let strategy = getStratery();
    if(strategy=='walking-LeastTime') strategy='步行-最短时间';
    else if(strategy=='walking-MostComfort') strategy='步行-最舒适';
    else if(strategy=='riding-LeastTime') strategy='骑行-最短时间';
    else if(strategy=='riding-MostComfort') strategy='骑行-最舒适';
    else if(strategy=='transfer-LeastTime') strategy='公交-最短时间';
    else if(strategy=='transfer-LeastWalk') strategy='公交-最少步行';
    else if(strategy=='transfer-LeastTransit') strategy='公交-最少换乘';
    else if(strategy=='transfer-MostComfort') strategy='公交-最舒适';
    historyMode.innerHTML = strategy;
    historyDist.innerHTML = disNow;
    historyCarb.innerHTML = carbRedNow.toFixed(2);
    historyDocDiv.appendChild(historyDoc);
    historyDoc.appendChild(historyDocSta);
    historyDoc.appendChild(docLink);
    historyDoc.appendChild(historyDocEnd);
    historyDocDiv.appendChild(historyMode);
    historyDocDiv.appendChild(historyDist);
    historyDocDiv.appendChild(historyCarb);
    historyPanel.appendChild(historyDocDiv);
    historyCount++;
});

var favoritePanel = document.getElementById('favorites');
var favoriteCount = 0;

var shoucang1 = document.getElementById('shoucang1');
shoucang1.addEventListener('click', function () {
    let favoriteDocDiv = document.createElement('div');
    let favoriteDoc = document.createElement('div');
    let favoriteDocSta = document.createElement('b');
    let favoriteDocEnd = document.createElement('b');
    let favoriteMode = document.createElement('b');
    let favoriteDist = document.createElement('b');
    let favoriteCarb = document.createElement('b');
    // id
    favoriteDocDiv.id = "favoriteDocDiv"+favoriteCount;
    favoriteDoc.id = "favoriteDoc" + favoriteCount;
    favoriteDocSta.id = "favoriteDocSta" + favoriteCount;
    favoriteDocEnd.id = "favoriteDocEnd" + favoriteCount;
    favoriteMode.id = "favoriteMode" + favoriteCount;
    favoriteDist.id = "favoriteDist" + favoriteCount;
    favoriteCarb.id = "favoriteCarb" + favoriteCount;
    // class
    favoriteDocDiv.classList.add("docDiv");
    favoriteDoc.classList.add("document");
    favoriteDocSta.classList.add("docSta");
    favoriteDocEnd.classList.add("docEnd");
    favoriteMode.classList.add("docMode");
    favoriteDist.classList.add("docList");
    favoriteCarb.classList.add("docCarb");
    favoriteDocSta.innerHTML = searchSta.value;
    favoriteDocEnd.innerHTML = searchEnd.value;
    let strategy = getStratery();
    if(strategy=='walking-LeastTime') strategy='步行-最短时间';
    else if(strategy=='walking-MostComfort') strategy='步行-最舒适';
    else if(strategy=='riding-LeastTime') strategy='骑行-最短时间';
    else if(strategy=='riding-MostComfort') strategy='骑行-最舒适';
    else if(strategy=='transfer-LeastTime') strategy='公交-最短时间';
    else if(strategy=='transfer-LeastWalk') strategy='公交-最少步行';
    else if(strategy=='transfer-LeastTransit') strategy='公交-最少换乘';
    else if(strategy=='transfer-MostComfort') strategy='公交-最舒适';
    favoriteMode.innerHTML = strategy;
    favoriteDist.innerHTML = disNow;
    favoriteCarb.innerHTML = carbRedNow.toFixed(2);
    favoriteDocDiv.appendChild(favoriteDoc);
    favoriteDoc.appendChild(favoriteDocSta);
    favoriteDoc.appendChild(docLink);
    favoriteDoc.appendChild(favoriteDocEnd);
    favoriteDocDiv.appendChild(favoriteMode);
    favoriteDocDiv.appendChild(favoriteDist);
    favoriteDocDiv.appendChild(favoriteCarb);
    favoritePanel.appendChild(favoriteDocDiv);
    favoriteCount++;
});