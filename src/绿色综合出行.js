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
map.addControl(new MapboxLanguage({defaultLanguage: 'zh'}));


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

var aqiLayer = null;
var pm25Layer = null;
var pm10Layer = null;
// 找到切换按钮
var MapButton = document.getElementById('button3');
var NavigationButton = document.getElementById('button1');

// 添加点击事件处理程序
MapButton.addEventListener('click', function() {
    // 切换底图
    if (!leafletMap.hasLayer(mapboxLayer)) {
        leafletMap.addLayer(mapboxLayer);
    } 
});
NavigationButton.addEventListener('click', function() {
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
});


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
function openTab(event, tabName) {
    //获取tab content的所有元素并隐藏它们
    var tabContents = document.getElementsByClassName("tabcontent");
    for (var i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
    }

    //使用tab button获取所有元素，并删除类active
    var tabButtons = document.getElementsByClassName("tablinks");
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    //显示当前选项卡，并向打开该选项卡的按钮添加一个active类
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.classList.add("active");
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



// 拓展栏2
const searchBox3 = document.getElementById("search-box3");
const addButton1 = document.getElementById("add-button1");
const deleteButton1 = document.getElementById("delete-button1");

let counter = 1;

addButton1.addEventListener("click", () => {
    const input = document.createElement("input");
    input.id = `searchtext${counter++}`;
    input.type = "text";
    input.placeholder = "请输入中间点";
    input.classList.add("searchtext");
    searchBox3.insertBefore(input, searchBox3.lastChild.previousSibling);
});

deleteButton1.addEventListener("click", () => {
    const inputs = searchBox3.querySelectorAll("input[type=text]");
    if (inputs.length > 2) {
        searchBox3.removeChild(inputs[inputs.length - 2]);
        counter--;
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