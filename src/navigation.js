// navigation.js
// 定位、搜索提示、导航功能
// 使用mapbox API 和 高德API
// sk.eyJ1IjoibWFwYm94LXhzIiwiYSI6ImNsaTYwY21jdTFsZ20zdmxwaG1zOTNya2sifQ.n74HN7FMkiR3LQ3FqrvbNQ

// 定位用户的位置 
// Add geolocate control to the map.
map.addControl(
    new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        showUserHeading: true
    })
);

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
// create a function to make a directions request
var start, end;

async function getRoute(end) {
    // make a directions request using cycling profile
    // an arbitrary start will always be the same
    // only the end or destination will change
    const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${'pk.eyJ1IjoiemVyNGgiLCJhIjoiY2xoeGI0dG03MHMydDNxbnRmNHBubmozayJ9.ln24sT_GoKRsF15MQyVNuQ'}`,
        { method: 'GET' }
    );
    console.log(query);
    const json = await query.json();
    const data = json.routes[0];
    const route = data.geometry.coordinates;
    const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: route
        }
    };
    // if the route already exists on the map, we'll reset it using setData
    if (map.getSource('route')) {
        map.getSource('route').setData(geojson);
    }
    // otherwise, we'll make a new request
    else {
        map.addLayer({
            id: 'route',
            type: 'line',
            source: {
                type: 'geojson',
                data: geojson
            },
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#3887be',
                'line-width': 5,
                'line-opacity': 0.75
            }
        });
    }
    // add turn instructions here at the end
}

//监听鼠标点击事件，弹出经纬度 -- 将会删除
map.on('click', e => {
    const { lng, lat } = e.lngLat
    console.log(lng, lat)
})

// 输入起终点给出导航路线
// 从两个输入框读入起终点
// startId：输入框-起点，end-Id：输入框-终点
function routePlan(startId, endId) {
    let startInput = document.getElementById(startId);
    let endInput = document.getElementById(endId);
    let startPosition, endPosition;

    // city设置为杭州
    let startUrl = "https://restapi.amap.com/v3/place/text?keywords=" + startInput.value + "&city=杭州&offset=20&page=1&key=f1dbdde4f534703472073cece6811628&extensions=all";
    axios.get(startUrl)
        .then(res => {
            if (res.data.count != 0) {
                startPosition = res.data.pois[0].location.split(',');
                startPosition = startPosition.map(Number);
                startInput.value = res.data.pois[0].name;
                start = startPosition;
                console.log(start);
                map.on('load', () => {
                    // make an initial directions request that
                    // starts and ends at the same location
                    getRoute(start);

                    // Add starting point to the map
                    map.addLayer({
                        id: 'point',
                        type: 'circle',
                        source: {
                            type: 'geojson',
                            data: {
                                type: 'FeatureCollection',
                                features: [
                                    {
                                        type: 'Feature',
                                        properties: {},
                                        geometry: {
                                            type: 'Point',
                                            coordinates: start
                                        }
                                    }
                                ]
                            }
                        },
                        paint: {
                            'circle-radius': 10,
                            'circle-color': '#3887be'
                        }
                    });
                    // this is where the code from the next step will go
                });

                // city设置为杭州
                let endUrl = "https://restapi.amap.com/v3/place/text?keywords=" + endInput.value + "&city=杭州&offset=20&page=1&key=f1dbdde4f534703472073cece6811628&extensions=all";
                axios.get(endUrl)
                    .then(res => {
                        if (res.data.count != 0) {
                            endPosition = res.data.pois[0].location.split(',');
                            endPosition = endPosition.map(Number);
                            endInput.value = res.data.pois[0].name;
                            getRoute(endPosition);
                        }
                        else {
                            alert("输入的结束地点无法识别");
                            return 0;
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    })
            } else {
                alert("输入的起始地点无法识别");
                return 0;
            }
        })
        .catch(err => {
            console.log(err);
        })
}