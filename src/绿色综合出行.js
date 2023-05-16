// 初始化
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2ZGM3NTYzZC1hMjg5LTRlMWUtOWQ4MS1kZDVjZDMzNzQ2ZTUiLCJpZCI6MTMxODA2LCJpYXQiOjE2ODA0OTIxMjF9.jN94zRm4EpoKwnrdBXokrEDYpgBkqqer-5laqkA4KPg';
var viewer = new Cesium.Viewer('cesiumContainer', {
    selectionIndicator: false,
    animation: false, //是否显示动画控件
    baseLayerPicker: false, //是否显示图层选择控件
    geocoder: false, //是否显示地名查找控件
    timeline: false, //是否显示时间线控件
    sceneModePicker: true, //是否显示投影方式控件
    navigationHelpButton: false, //是否显示帮助信息控件
    infoBox: false, //是否显示点击要素之后显示的信息
    homeButton: false,
    fullscreenButton: true
});
viewer._cesiumWidget._creditContainer.style.display = "none";

//加载高德地图
var layers = viewer.imageryLayers;    //加载高德地图影像地图
layers.removeAll();
layers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
    url: "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
    minimumLevel: 3,
    maximumLevel: 18
}));
layers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({    //加载高德地图街道信息
    url: "http://webst02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8",
    minimumLevel: 3,
    maximumLevel: 18
}));

//初始化镜头在杭州市
viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(120.153576, 30.287459, 10000),
    duration: 0,
});



//侧边栏点击出现拓展栏
var buttons = document.getElementsByClassName("button");
var extendedBars = document.getElementsByClassName("extendedBar");
var activeIndex = 0;

function init() {
    buttons[activeIndex].classList.add("active");
    buttons[activeIndex].src = "assets/出行导航_blue.png";
    extendedBars[activeIndex].style.display = "block";
}

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

function extendedBarclose(activeIndex){
    switch(activeIndex){
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
            buttons[activeIndex].src = "assets/拓展功能_white.png";
            extendedBars[activeIndex].style.display = "none";
            break;
        case 3:
            buttons[activeIndex].classList.remove("active");
            buttons[activeIndex].src = "assets/个人中心_white.png";
            extendedBars[activeIndex].style.display = "none";
            break;
    }
}

function extendedBaropen(activeIndex){
    switch(activeIndex){
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
            buttons[activeIndex].src = "assets/拓展功能_blue.png";
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



// 第一行拓展栏
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



// 第二行拓展栏
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



// 拓展面板
// 工具箱 
function toolPanelOpen(event, toolButton, toolPanelId) {
    let buttonClick = document.getElementById(toolButton); // 点击的按钮
    let toolPanel = document.getElementById(toolPanelId); // 按钮对应的的工具面板
    if (toolPanel.style.display == "block") { // 如果原来恰好是其打开，将其关闭
        toolPanel.style.display = "none";
        buttonClick.style.backgroundColor = "#f5f4f4";
    } else {   // 如果原来该扩展栏未打开，将其打开，将其他关闭
        let toolPanels = document.getElementsByClassName('toolPanel');
        let toolButtons = document.getElementsByClassName('toolBtn');
        for (let i = 0; i < toolPanels.length; i++) {
            toolPanels[i].style.display = "none";
            toolButtons[i].style.backgroundColor = "#f5f4f4";
        }
        toolPanel.style.display = "block";
        buttonClick.style.backgroundColor = "#9595957a";
    }
}
// 缓冲区工具
function bufferInputOpen(event, bufferButton, bufferInputId) {
    let buttonClick = document.getElementById(bufferButton); // 点击的按钮
    let bufferInput = document.getElementById(bufferInputId); // 按钮对应的的工具面板
    if (bufferButton == "bufferBtn3") {
        document.getElementById("buffer").style.height = "300px";
    } else {
        document.getElementById("buffer").style.height = "240px";
    }
    if (bufferInput.style.display == "block") { // 如果原来恰好是其打开，将其关闭
        bufferInput.style.display = "none";
        buttonClick.style.backgroundColor = "#f5f4f4";
    } else {   // 如果原来该扩展栏未打开，将其打开，将其他关闭
        let bufferInputs = document.getElementsByClassName('bufferInput');
        let bufferButtons = document.getElementsByClassName('bufferBtn');
        for (let i = 0; i < bufferInputs.length; i++) {
            bufferInputs[i].style.display = "none";
            bufferButtons[i].style.backgroundColor = "#f5f4f4";
        }
        bufferInput.style.display = "block";
        buttonClick.style.backgroundColor = "#9595957a";
    }
}



// 个人中心
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