/**
 * Created by Administrator on 2017/8/23.
 */

var map;
var busStationIcon = L.icon({
    iconUrl: 'img/busstation_marker.png',
    iconSize: [10, 10]
});
var busStationFocusIcon = L.icon({
    iconUrl: 'img/busstation_marker_focus.png',
    iconSize: [10, 10]
});
var startMarkerIcon = L.icon({
    iconUrl: 'img/startmarker.png',
    iconSize: [20, 20]
});
var endMarkerIcon = L.icon({
    iconUrl: 'img/endmarker.png',
    iconSize: [20, 20]
});
var infoWindow = L.popup();

var busutil;

var hasBusNo = false;
var curItemNo = window.localStorage.getItem("curItemNo");
if (curItemNo == null) {
    curItemNo = 0;
    window.localStorage.setItem("curItemNo", curItemNo);
}
var busNo = window.localStorage.getItem("busNo");
if (busNo != null) {
    hasBusNo = true;
}
var hasStationName = false;
var stationName = window.localStorage.getItem("stationName");
if (stationName != null) {
    hasStationName = true;
}

var pointsArr = [];
var markerArr = [];
var busStationArr = [];

//反向功能的curItemNo
var reverseItemNo;

$(document).ready(function () {

    function ReverseControl() {
        var reverseControl = L.Control.extend({
            options: {
                position: 'bottomright'
            },
            onAdd: function (map) {
                var img = document.createElement("img");
                img.style.cursor = 'pointer';
                img.src = 'img/reversebutton.png';
                img.width = 40;
                img.height = 40;
                L.DomEvent.on(img, 'click', function () {
                    curItemNo = reverseItemNo;
                    localStorage.setItem('curItemNo', curItemNo);
                    busutil.getBusList(busNo);
                });
                return img;
            }
        });
        return new reverseControl();
    }

    var myReverseControl = new ReverseControl();
    map.addControl(myReverseControl);

    //对面板进行声明
    $("#mypanel").trigger("updatelayout");
    $("#mypanel01").trigger("updatelayout");

    // busutil = new BMap.BusLineSearch("杭州", {
    //     renderOptions: {panel: "itemResult"},
    //     onGetBusListComplete: function (buslist) {
    //         //为反向功能存储值
    //         var busNoName = buslist.getBusListItem(curItemNo).name;
    //         var index01 = busNoName.indexOf('(');
    //         var index02 = busNoName.indexOf('-');
    //         var curName = busNoName.substring(0,index01);
    //         var name01 = busNoName.substring(index01+1, index02);
    //         var name02 = busNoName.substring(index02+1,busNoName.length-1);
    //         if(name01==name02){
    //             reverseItemNo = curItemNo;
    //         }else{
    //             if(curItemNo>0){
    //                 var prev = buslist.getBusListItem(curItemNo-1).name;
    //                 var prevIndex = prev.indexOf('(');
    //                 var prevName = prev.substring(0,prevIndex);
    //                 if(prevName == curName){
    //                     reverseItemNo = curItemNo-1;
    //                 }else{
    //                     if(buslist.getBusListItem(curItemNo+1)!=undefined){
    //                         var next = buslist.getBusListItem(curItemNo+1).name;
    //                         var nextIndex = next.indexOf('(');
    //                         var nextName = next.substring(0,nextIndex);
    //                         if(nextName == curName){
    //                             reverseItemNo = parseInt(curItemNo) + 1;
    //                         }
    //                     }else{
    //                         //应该不可能发生
    //                     }
    //                 }
    //             }else{
    //                 reverseItemNo = parseInt(curItemNo) + 1;
    //             }
    //         }
    //         var lineNameList = buslist.KA;
    //         var html = [];
    //         for (var i in lineNameList) {
    //             html.push('<li><a href="javascript:void(0)" onclick="subgo(' + i + ' )">' + lineNameList[i].name +
    //                 '</a></li>');
    //         }
    //         var l_result = document.getElementById("l-result");
    //         l_result.innerHTML = '<ul>' + html.join('') + '</ul>';
    //         busutil.getBusLine(buslist.getBusListItem(curItemNo));
    //     },
    //     onGetBusLineComplete: function (busline) {
    //         var polyline = new BMap.Polyline(busline.getPath(), {
    //             strokeColor: "#3333FF",
    //             strokeWeight: 5,
    //             strokeOpacity: 0.7
    //         });
    //         map.clearOverlays();
    //         map.addOverlay(polyline);
    //         showPolyline(busline);
    //     },
    //     onBusLineHtmlSet: function () {
    //         //选中颜色为blue 其他颜色为green
    //         $("#l-result ul li a").each(function (index,element) {
    //             if(index!=curItemNo){
    //                 $(element).css("color", "green");
    //             }else{
    //                 $(element).css("color", "blue");
    //             }
    //         });
    //     }
    // });

    if (hasBusNo && hasStationName) {
        /*window.localStorage.setItem("curItemNo", curItemNo);
        window.localStorage.setItem("busNo", busNo);*/
        busutil.getBusList(busNo);
        hasBusNo = false;
        hasStationName = false;
    }

    $("#query").click(function () {
        map.eachLayer(function (layer) {
            if (layer instanceof L.Polyline) {
                map.removeLayer(layer);
            }
        });
        busNo = $('#keyword').val();
        busutil.getBusList(busNo);
        localStorage.setItem("busNo", busNo);
        curItemNo = 0;
        $("#keyword").val("");

        pointsArr = [];
        markerArr = [];
        busStationArr = [];

        $("#mypanel01").panel("close");
        $("#mypanel").panel("open");
    })
});

function ReverseControl() {
    // 默认停靠位置和偏移量
    this.defaultAnchor = BMAP_ANCHOR_BOTTOM_RIGHT;
    this.defaultOffset = new BMap.Size(0, 40);
}

/*document.getElementById('query').onclick = function () {
 map.clearOverlays();
 busNo = document.getElementById('keyword').value;
 busutil.getBusList(busNo);
 $("#keyword").val("");
 };*/

//初始化地图
// initMap = function () {
//     var mapOpts = { minZoom: 11, maxZoom: 17, enableHighResolution: true };
//     map = new BMap.Map('map', mapOpts);
//     map.centerAndZoom("杭州");
// };

//初始化地图控件
// initControl = function () {
//     var navOpts = { anchor: BMAP_ANCHOR_BOTTOM_RIGHT, offset: new BMap.Size(50, 40), type: BMAP_NAVIGATION_CONTROL_ZOOM };
//     var nav = new BMap.NavigationControl(navOpts);
//     map.addControl(nav);

//     /*    var scale = new BMap.ScaleControl();
//      map.addControl(scale);*/

//     var overOpts = {
//         anchor: BMAP_ANCHOR_TOP_LEFT,
//         offset: new BMap.Size(10, 10),
//         size: new BMap.Size(100, 100),
//         isOpen: false
//     };
//     var over = new BMap.OverviewMapControl(overOpts);
//     map.addControl(over);

//     /*    var mapTypeC = new BMap.MapTypeControl();
//      map.addControl(mapTypeC);*/
// };

function locateTo() {
    map.locate({
        setView: true,
        maxZoom: 16
    });
}

function locateStop(lat, lng) {
    map.setView([lat, lng], 16);
}

function busStopOnClick(e) {
    var busNo = localStorage.getItem("busNo");
    var stationName = localStorage.getItem("stationName");
    busutil.getBusLine(busNo);
    infoWindow.setLatLng(e.latlng);
    map.openPopup(infoWindow);
}

// function subgo(itemNo) {
//     curItemNo = itemNo;
//     window.localStorage.setItem("curItemNo", curItemNo);
//     busutil.getBusList(busNo);
// }

// function showPolyline(busline) {
//     for (var i = 0; i < busline.getNumBusStations(); i++) {
//         var busStation = busline.getBusStation(i);
//         pointsArr[i] = busStation.position;
//         busStationArr[i] = busStation.name;
//         if (i == 0) {
//             addCircle(i, busline, busStation, startMarkerIcon);
//         } else if (i == busline.getNumBusStations() - 1) {
//             addCircle(i, busline, busStation, endMarkerIcon);
//         } else {
//             if (busStation.name == stationName) {
//                 addCircle(i, busline, busStation, busStationFocusIcon);
//             } else {
//                 addCircle(i, busline, busStation, busStationIcon);
//             }
//         }
//     }
//     map.setViewport(pointsArr);
//     busStationArr.forEach(function (value, index) {
//         if (value == stationName) {
//             var event = new CustomEvent("click");
//             markerArr[index].dispatchEvent(event);
//         }
//     });
// }

// function addCircle(index, busline, busStation, icon) {
//     var marker = new BMap.Marker(busStation.position, { icon: icon });
//     markerArr[index] = marker;
//     marker.setTitle(busStation.name);
//     marker.addEventListener("click", function () {
//         infoWindow.setTitle(busStation.name + " (" + busline.name + ")");
//         //前台给后端SL_ID（StopLine 公交线路站点表的主键
//         //后台返回给前端两个信息 最近一辆公交正在开往--站，据此--分钟--米
//         //如果有第二辆公交的信息，那么也进行显示
//         $.ajax({
//             // 写后台地址
//             url: 'http://www.baidu.com',
//             //                data: {"SL_id":sl_id},
//             type: 'get',
//             datatype: 'json',
//             async: 'false',
//             success: function (json) {
//                 json = "{\"station\":[{\"id\":1,\"nextstop\":\"龙井路\",\"stopcount\":\"2\",\"time\":\"3分钟\"," +
//                     "\"distance\":\" " + strDis01 + "\"},{\"id\":2,\"nextstop\":\"浙江大学\",\"stopcount\":\"5\"," +
//                     "\"time\":\"15分钟\"," +
//                     "\"distance\":\" " + strDis02 + "\"}],\"status\":1}"
//                 stationName = busStation.name;
//                 window.localStorage.setItem('stationName', stationName);
//                 var busInfoList = json.station;
//                 var infoArr = [];
//                 for (var i in busInfoList) {
//                     infoArr[i] = "最近第" + (parseInt(i) + 1) + "辆公交车正在开往" + busInfoList[i].nextstop + "，距本站" +
//                         busInfoList[i].stopcount +
//                         "站，" + busInfoList[i].distance + "，需要" + busInfoList[i].time;

//                 }
//                 markerArr.forEach(function (value, index) {
//                     if (value.getIcon() == busStationFocusIcon) {
//                         value.setIcon(busStationIcon);
//                         return false;
//                     }
//                 });

//                 if (marker.getIcon() == busStationIcon) {
//                     marker.setIcon(busStationFocusIcon);
//                 }
//                 infoWindow.setContent(infoArr[0] + "</br>" + infoArr[1]);
//                 marker.openInfoWindow(infoWindow);
//             }
//         });
//     });
//     map.addOverlay(marker);
// }