// 根据所选交通和距离计算碳排放
// 参考：
//  国家发展改革委气候司《省级温室气体清单编制指南》(2011)
//  https://zhuanlan.zhihu.com/p/495928970
//  https://zhuanlan.zhihu.com/p/476574322
//  https://zhuanlan.zhihu.com/p/414476308
//  https://zhuanlan.zhihu.com/p/55394854

// carbonCalc(tripMode, distance)将返回减碳量，默认单位为kg
// tripMode指出行方式
// distance指出行距离，单位为公里
// unit指返回值的单位，默认为kg, 还可以设置为g
function carbonCalc(tripMode, distance, unit = 'kg') {
    let carbonEmission = 0; // 碳排放
    // 私家车/汽油车
    if (tripMode == 'car') carbonEmission = (0.192-0.192) * distance;
    // 公交车
    else if (tripMode == 'bus') carbonEmission = (0.192-0.105) * distance;
    // 电力驱动公交车
    else if (tripMode == 'electricBus') carbonEmission = (0.192-0.09) * distance;
    // 地铁
    else if (tripMode == 'subway') carbonEmission = (0.192-0.064) * distance;
    // 电动汽车
    else if (tripMode == 'electricCar') carbonEmission = (0.192-0.053) * distance;
    // 自行车
    else if (tripMode == 'bicycle') carbonEmission = (0.192-0.0015) * distance;
    // 步行
    else if (tripMode == 'walk') carbonEmission = (0.192-0.0005) * distance;
    if (unit == 'g') carbonEmission = carbonEmission * 1000;
    return carbonEmission;
}

// 一次出行中有多种交通方式
// tripMode为数组，依次存放交通方式，字符串类型数组
// distance为数组，依次存放与tripMode对应的距离，数字类型数组，单位为公里
// unit指返回值的单位，默认为kg, 还可以设置为g
function carbonCalcMul(tripMode, distance, unit = 'kg') {
    let carbonEmission = 0; // 碳排放
    for (let i = 0; i < tripMode.length; i++) {
        carbonEmission += carbonCalc(tripMode[i], distance[i], unit);
    }
    return carbonEmission;
}