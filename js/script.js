const globalData = {
    'buildingSize': 245,
    'buildingScale': 1,
    'buildingKind': 6,
    'roadWidth': 10,
    'totalBuildingCnt': 300,
    'initialBuildingCnt': 4,
    'wide': 2000,
    'tileCnt': 250
}

let cameraOffset = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
let cameraOffset_pre = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
let cameraZoom = 1
let MAX_ZOOM = 5
let MIN_ZOOM = 0.03
let SCROLL_SENSITIVITY = 0.0005

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth
canvas.height = window.innerHeight

let totalLineInfo = [];
let totalPointInfo = [];

let drawPointsArr = []

let buildingPosArr = []
let buildingSideArr = []
let movingPoint = []

let borderNum = -1;

let scale_info;

window.addEventListener("load", function () {
    totalPointInfo = getTotalPointInfo()
    scale_info = 2 * globalData.wide / totalPointInfo.length

    for (var i = 0; i < totalPointInfo.length; i++) {
        for (var j = 0; j < totalPointInfo[i].length; j++) {
            if (totalPointInfo[i][j] != 0) {
                drawPointsArr.push({
                    'x': i * scale_info + globalData.roadWidth / 2,
                    'y': j * scale_info + globalData.roadWidth / 2
                })
            }
        }
    }

    init();

    this.setInterval(() => {
        draw()
    }, 20)
})


function init() {
    // for (var i = 0; i < globalData.totalBuildingCnt; i++) {
    //     var randomPosition = {
    //         'x': 0,
    //         'y': 0
    //     };
    //     while (true) {
    //         // if (i < globalData.initialBuildingCnt) {
    //         //     randomPosition = {
    //         //         'x': Math.random() * (this.window.innerWidth - globalData.buildingSize) + globalData.buildingSize / 2,
    //         //         'y': Math.random() * (this.window.innerHeight - globalData.buildingSize) + globalData.buildingSize / 2
    //         //     }
    //         // } else {
    //             randomPosition = {
    //                 'x': Math.random() * 2 * (globalData.wide - globalData.buildingSize) - (globalData.wide - globalData.buildingSize),
    //                 'y': Math.random() * 2 * (globalData.wide - globalData.buildingSize) - (globalData.wide - globalData.buildingSize)
    //             }
    //         // }

    //         if (checkingRandomPositionAvailable(randomPosition)) {
    //             break;
    //         }
    //     }
    //     buildingPosArr.push({ x: randomPosition.x, y: randomPosition.y })
    //     buildingSideArr.push({
    //         't': true,
    //         'l': true,
    //         'r': true,
    //         'd': true
    //     })
    // }


    for (var i = -globalData.wide + 1; i <= globalData.wide; i += globalData.wide / globalData.tileCnt) {
        totalLineInfo.push({
            'from': {
                'x': i,
                'y': -globalData.wide
            },
            'to': {
                'x': i,
                'y': globalData.wide
            }
        })

        totalLineInfo.push({
            'from': {
                'x': -globalData.wide,
                'y': i
            },
            'to': {
                'x': globalData.wide,
                'y': i
            }
        })
    }
    borderNum = totalLineInfo.length

    // getBuildingPositionInfo()
}


// function checkingRandomPositionAvailable(obj) {
//     for (var i = 0; i < buildingPosArr.length; i++) {
//         if (Math.abs(buildingPosArr[i].x - obj.x) + Math.abs(buildingPosArr[i].y - obj.y) < 2 * globalData.buildingSize) {
//             return false;
//         }
//     }
//     return true;
// }


function getBuildingPositionInfo() {
    var minDistance_building = 2 * Math.pow(globalData.buildingSize, 2)
    var minDistance_road = 2 * Math.pow((2 * Math.sqrt(3) * globalData.roadWidth), 2)

    var wide = globalData.wide - globalData.buildingSize
    for (var i = 0; i < globalData.totalBuildingCnt; i++) {
        var temp;
        var cnt = 0
        while (true) {
            temp = {
                'x': Math.random() * 2 * wide - wide,
                'y': Math.random() * 2 * wide - wide,
            }
            if (checkingDelBuildings(temp) && checkingAcrossBuildingAndLine(temp)) {
                break;
            }
            cnt++;
            if (cnt == 1000) {
                break;
            }
        }
        if (cnt < 1000) {
            buildingPosArr.push({ ...temp })
        }

    }

    function checkingDelBuildings(position) {
        for (var i = 0; i < buildingPosArr.length; i++) {
            if (Math.pow((buildingPosArr[i].x - position.x), 2) + Math.pow((buildingPosArr[i].y - position.y), 2) < minDistance_building) {
                return false;
            }
        }
        return true;
    }

    function checkingAcrossBuildingAndLine(position) {
        for (var i = 0; i < globalData.buildingSize; i++) {
            for (var k = 0; k < drawPointsArr.length; k++) {
                var temp = {
                    'x': position.x + i,
                    'y': position.y
                }
                var temp_1 = {
                    'x': position.x + i,
                    'y': position.y + (globalData.buildingSize - 1)
                }
                var temp_2 = {
                    'x': position.x,
                    'y': position.y + i
                }
                var temp_3 = {
                    'x': position.x + (globalData.buildingSize - 1),
                    'y': position.y + i
                }
                if (distanceBetTwoPoints(drawPointsArr[k], temp) < minDistance_road
                    || distanceBetTwoPoints(drawPointsArr[k], temp_1) < minDistance_road
                    || distanceBetTwoPoints(drawPointsArr[k], temp_2) < minDistance_road
                    || distanceBetTwoPoints(drawPointsArr[k], temp_3) < minDistance_road) {
                    return false
                }
            }
        }
        return true;
    }

    function distanceBetTwoPoints(point1, point2) {
        return Math.pow((point1.x - point2.x), 2) + Math.pow((point1.y - point2.y), 2)
    }
}


function getTotalPointInfo() {
    var len = 1000

    var pointInfo = new Array(len)
    for (var i = 0; i < len; i++) {
        pointInfo[i] = new Array(len)
        for (var j = 0; j < len; j++) {
            pointInfo[i][j] = 0
        }
    }

    var borderPoints = [];
    borderPoints.push({
        'x': 0,
        'y': 0
    })
    borderPoints.push({
        'x': 0,
        'y': len - 1
    })
    borderPoints.push({
        'x': len - 1,
        'y': 0
    })
    borderPoints.push({
        'x': len - 1,
        'y': 0
    })
    var breakingPoints = [];

    var maxHV = 30;
    var minMovingLength = 50;
    var minBetBorderPoints = 2 * Math.pow(40, 2);
    var minBetMovingPointAndBreakPoint = 2 * Math.pow(10, 2);
    var checkingUpTiles = 20
    var side;

    for (var index = 0; index < maxHV; index++) {
        side = Math.floor(Math.random() + 0.5)
        var cnt = 0
        var randomValue;
        while (true) {
            randomValue = Math.floor(Math.random() * len)
            var point = {
                'x': randomValue,
                'y': (len - 1) * side
            }
            if (checkingBorderPoint(point)) {
                break;
            }
            cnt++;
            if (cnt >= len) {
                break;
            }
        }
        if (cnt < len) {
            pointInfo[randomValue][(len - 1) * side] = 1;
            borderPoints.push({
                'x': randomValue,
                'y': (len - 1) * side
            })

            drawOneLine(borderPoints[borderPoints.length - 1])
        }

        while (true) {
            randomValue = Math.floor(Math.random() * 1000)
            var point = {
                'x': (len - 1) * side,
                'y': randomValue
            }
            if (checkingBorderPoint(point)) {
                break;
            }
            cnt++;
            if (cnt >= 1000) {
                break;
            }
        }
        if (cnt < 1000) {
            pointInfo[(len - 1) * side][randomValue] = 1;
            borderPoints.push({
                'x': (len - 1) * side,
                'y': randomValue
            })

            drawOneLine(borderPoints[borderPoints.length - 1])
        }
    }

    function drawOneLine(startPoint) {
        var initialDir = {
            'x': 0,
            'y': 0
        };
        if (startPoint.x % (len - 1) == 0) {
            initialDir.x = -1
            if (startPoint.x == 0) {
                initialDir.x = 1
            }
        }
        if (startPoint.y % (len - 1) == 0) {
            initialDir.y = -1
            if (startPoint.y == 0) {
                initialDir.y = 1
            }
        }

        var temp_dir = { ...initialDir };
        var currentPoint = { ...startPoint };
        var breakingFlag;
        var checkBreaking = false;
        var movingCnt = 0;


        while (true) {
            currentPoint.x += temp_dir.x;
            currentPoint.y += temp_dir.y;

            if (!checkingUpPoints(currentPoint, temp_dir)) {
                while (true) {
                    if (pointInfo[currentPoint.x][currentPoint.y] == 1) {
                        break;
                    } else {
                        pointInfo[currentPoint.x][currentPoint.y] = 1;
                    }
                    currentPoint.x += temp_dir.x;
                    currentPoint.y += temp_dir.y;
                }
                breakingPoints.push({ ...currentPoint })
                break;
            }

            var t = checkingDelCurrentAndBreakingPoint(currentPoint)
            if (t != -1) {
                var xy_temp = Math.abs(currentPoint.x - breakingPoints[t].x) < Math.abs(currentPoint.y - breakingPoints[t].y) ? 1 : 2

                var newBreakingPoint = {
                    'x': (xy_temp == 2) ? currentPoint.x : breakingPoints[t].x,
                    'y': (xy_temp == 1) ? currentPoint.y : breakingPoints[t].y
                }

                var delX = breakingPoints[t].x - newBreakingPoint.x;
                var delY = breakingPoints[t].y - newBreakingPoint.y;

                for (var i = 0; i < Math.abs(delX) + Math.abs(delY); i++) {
                    var temp_x = newBreakingPoint.x + ((delX != 0) ? (i * (delX / Math.abs(delX))) : 0);
                    var temp_y = newBreakingPoint.y + ((delY != 0) ? (i * (delY / Math.abs(delY))) : 0);

                    pointInfo[temp_x][temp_y] = 1
                }

                delX = currentPoint.x - newBreakingPoint.x;
                delY = currentPoint.y - newBreakingPoint.y;

                for (var i = 0; i < Math.abs(delX) + Math.abs(delY); i++) {
                    var temp_x = newBreakingPoint.x + ((delX != 0) ? (i * delX / Math.abs(delX)) : 0)
                    var temp_y = newBreakingPoint.y + ((delY != 0) ? (i * delY / Math.abs(delY)) : 0)
                    pointInfo[temp_x][temp_y] = 1
                }

                breakingPoints.push({ ...newBreakingPoint })
                break;
            }


            if (pointInfo[currentPoint.x][currentPoint.y] == 1) {
                breakingPoints.push({ ...currentPoint })
                movingCnt = 0
            }


            if (movingCnt > minMovingLength) {
                breakingFlag = Math.floor(100 * Math.random() / 4)
                if (breakingFlag == 0) {
                    if (!checkBreaking) {
                        checkBreaking = true;
                        temp_dir.x = (initialDir.x == 0) ? ((Math.random() - 0.5) > 0 ? 1 : -1) : 0;
                        temp_dir.y = (initialDir.y == 0) ? ((Math.random() - 0.5) > 0 ? 1 : -1) : 0
                    } else {
                        checkBreaking = false;
                        temp_dir = { ...initialDir };
                    }
                    breakingPoints.push({ ...currentPoint })
                    movingCnt = 0;
                }
            }

            pointInfo[currentPoint.x][currentPoint.y] = 1;
            movingCnt++;

            if (checkingEndPoint(currentPoint)) {
                break;
            }
        }
    }

    // addCircleRoadOnEmptySpace();

    var ttt = 100;
    for (var i = ttt; i < pointInfo.length - ttt; i++) {
        for (var j = ttt; j < pointInfo[i].length - ttt; j++) {
            var temp = {
                'x': i,
                'y': j
            }
            if (checkingSpace(temp, ttt)) {
                var rand = 3 * Math.random()
                if (rand < 1) {
                    var r = Math.floor(Math.random() * Math.floor(ttt / 6) + Math.floor(ttt / 4))
                    var X = i + Math.floor(ttt / 2)
                    var Y = j + Math.floor(ttt / 2)
                    pointInfo[X][Y] = r + 50

                    {
                        // rand = 2 * Math.random()
                        // if(rand < 1) {
                            var temp = r - 6;
                            while(true) {
                                if(X + temp >= len) {
                                    break
                                }
                                if(pointInfo[X + temp][Y] == 0) {
                                    pointInfo[X + temp][Y] = 1
                                } else {
                                    breakingPoints.push({
                                        'x': X + temp,
                                        'y': Y
                                    })
                                    break;
                                }
                                temp++;
                            }
                        // }
                            
                        // rand = 2 * Math.random()
                        // if(rand < 1) {
                            temp = r - 6;
                            while(true) {
                                if(Y + temp >= len) {
                                    break
                                }
                                if(pointInfo[X][Y + temp] == 0) {
                                    pointInfo[X][Y + temp] = 1
                                } else {
                                    breakingPoints.push({
                                        'x': X,
                                        'y': Y + temp
                                    })
                                    break;
                                }
                                temp++;
                            }
                        // }
                            
                        // rand = 2 * Math.random()
                        // if(rand < 1) {
                            temp = -r + 6;
                            while(true) {
                                if(X + temp < 0) {
                                    break
                                }
                                if(pointInfo[X + temp][Y] == 0) {
                                    pointInfo[X + temp][Y] = 1
                                } else {
                                    breakingPoints.push({
                                        'x': X + temp,
                                        'y': Y
                                    })
                                    break;
                                }
                                temp--;
                            }
                        // }

                        // rand = 2 * Math.random()
                        // if(rand < 1) {
                            temp = -r + 6;
                            while(true) {
                                if(Y + temp < 0) {
                                    break
                                }
                                if(pointInfo[X][Y + temp] == 0) {
                                    pointInfo[X][Y + temp] = 1
                                } else {
                                    breakingPoints.push({
                                        'x': X,
                                        'y': Y + temp
                                    })
                                    break;
                                }
                                temp--;
                            }
                        // }

                        fillSpace({
                            'x': X,
                            'y': Y
                        }, r)
                    }
                }
            }
        }
    }

    for (var i = 0; i < breakingPoints.length; i++) {
        if (breakingPoints[i].x > 3 && breakingPoints[i].x < len - 4
            && breakingPoints[i].y > 3 && breakingPoints[i].y < len - 4) {
            pointInfo[breakingPoints[i].x][breakingPoints[i].y] = setBreakingPointValue(breakingPoints[i])
        }
    }
    for (var i = 0; i < breakingPoints.length; i++) {
        for (var j = 1; j < 3; j++) {
            if (breakingPoints[i].x >= j && breakingPoints[i].x < len - j
                && breakingPoints[i].y >= j && breakingPoints[i].y < len - j) {
                pointInfo[breakingPoints[i].x - j][breakingPoints[i].y] = pointInfo[breakingPoints[i].x - j][breakingPoints[i].y] == 1 ? 0 : pointInfo[breakingPoints[i].x - j][breakingPoints[i].y]
                pointInfo[breakingPoints[i].x][breakingPoints[i].y - j] = pointInfo[breakingPoints[i].x][breakingPoints[i].y - j] == 1 ? 0 : pointInfo[breakingPoints[i].x][breakingPoints[i].y - j]
                pointInfo[breakingPoints[i].x + j][breakingPoints[i].y] = pointInfo[breakingPoints[i].x + j][breakingPoints[i].y] == 1 ? 0 : pointInfo[breakingPoints[i].x + j][breakingPoints[i].y]
                pointInfo[breakingPoints[i].x][breakingPoints[i].y + j] = pointInfo[breakingPoints[i].x][breakingPoints[i].y + j] == 1 ? 0 : pointInfo[breakingPoints[i].x][breakingPoints[i].y + j]
            }
        }
    }

    return pointInfo;

    // function addCircleRoadOnEmptySpace() {

    // }

    function fillSpace(point, r) {
        for (var i = -r + 1; i < r; i++) {
            for (var j = -r + 1; j < r; j++) {
                if(i != 0 && j != 0) {
                    pointInfo[point.x + i][point.y + j] = -1

                }
            }
        }
        return true;
    }

    function checkingSpace(point, wide) {
        for (var i = 0; i < wide; i++) {
            for (var j = 0; j < wide; j++) {
                if (pointInfo[point.x + i][point.y + j] != 0) {
                    return false;
                }
            }
        }
        return true;
    }

    function setBreakingPointValue(point) {
        var temp_value = 1;
        if (pointInfo[point.x - 1][point.y] == 1 && pointInfo[point.x][point.y - 1] == 1) {
            temp_value *= 2;
        }
        if (pointInfo[point.x][point.y - 1] == 1 && pointInfo[point.x + 1][point.y] == 1) {
            temp_value *= 3;
        }
        if (pointInfo[point.x + 1][point.y] == 1 && pointInfo[point.x][point.y + 1] == 1) {
            temp_value *= 5;
        }
        if (pointInfo[point.x][point.y + 1] == 1 && pointInfo[point.x - 1][point.y] == 1) {
            temp_value *= 7;
        }
        return temp_value;
    }

    function checkingUpPoints(point, dir) {
        for (var i = 0; i < checkingUpTiles; i++) {
            if (point.x + i * dir.x < 0 || point.x + i * dir.x >= len ||
                point.y + i * dir.y < 0 || point.y + i * dir.y >= len) {
                break;
            }
            if (pointInfo[point.x + i * dir.x][point.y + i * dir.y] == 1) {
                return false;
            }
        }
        return true;
    }

    function checkingEndPoint(point) {
        if (point.x % (len - 1) == 0 || point.y % (len - 1) == 0) {
            borderPoints.push({ ...point })
            return true;
        }
        return false;
    }

    function checkingDelCurrentAndBreakingPoint(point) {
        for (var i = 0; i < breakingPoints.length - 1; i++) {
            if (Math.pow((breakingPoints[i].x - point.x), 2) + Math.pow((breakingPoints[i].y - point.y), 2) <= minBetMovingPointAndBreakPoint) {
                return i;
            }
        }
        return -1;
    }

    function checkingBorderPoint(point) {
        for (var i = 0; i < borderPoints.length; i++) {
            if (Math.pow((borderPoints[i].x - point.x), 2) + Math.pow((borderPoints[i].y - point.y), 2) <= minBetBorderPoints) {
                return false;
            }
        }
        return true;
    }
}

// function getTotalLineInfo_2() {
//     var len = 1000

//     var pointInfo = new Array(len)
//     for (var i = 0; i < len; i++) {
//         pointInfo[i] = new Array(len)
//         for (var j = 0; j < len; j++) {
//             pointInfo[i][j] = 0
//             if(i * j == 0 || i == len - 1 || j == len - 1) {
//                 pointInfo[i][j] = 1
//             }
//         }
//     }

//     var onceMovingLength = 40;
//     var cnt = len / onceMovingLength;

//     var xyRandom = Math.random()
//     var startPoint = {
//         // 'x': (xyRandom > 0.5) ? (onceMovingLength * Math.floor(Math.random() * (cnt - 1) + 1) - 1) : 0,
//         // 'y': (xyRandom > 0.5) ? 0 : (onceMovingLength * Math.floor(Math.random() * (cnt - 1) + 1) - 1),
//         'x': 399,
//         'y': 599,
//     };
//     var startDir = {
//         // 'x': (startPoint.x == 0) ? 1 : 0, 
//         // 'y': (startPoint.y == 0) ? 1 : 0
//         'x': 1, 
//         'y': 0
//     };

//     main(startPoint, startDir)

//     function main(point, dir) {
//         // var move = Math.floor((Math.random() * onceMovingLength / 2) + onceMovingLength / 2)
//         // if(!drawParallelRoad(point, dir, move)) {
//         //     return;
//         // }
//         if(!drawParallelRoad(point, dir, onceMovingLength)) {
//             return;
//         }
//         point.x += onceMovingLength * dir.x;
//         point.y += onceMovingLength * dir.y;

//         var newDir = {
//             'x': (dir.x != 0) ? 0 : ((Math.random() - 0.5 > 0) ? 1 : -1),
//             'y': (dir.y != 0) ? 0 : ((Math.random() - 0.5 > 0) ? 1 : -1)
//         }

//         if(Math.random() * 25 < 2) {
//             main(point, newDir)
//             main(point, dir)
//         // } else if(Math.random() * 3 < 1) {
//         //     main(point, newDir)
//         } else if(Math.random() * 15 < 2){
//             main(point, newDir)
//         } else {
//             main(point, dir)
//         }
//     }

//     function drawParallelRoad(point, dir, move) {
//         var temp_point = {...point}
//         for(var i = 0; i < move; i++) {
//             pointInfo[temp_point.x][temp_point.y] = 1
//             temp_point.x += dir.x
//             temp_point.y += dir.y
//             if(temp_point.x * temp_point.y == 0 || temp_point.x == len - 1 || temp_point.y == len - 1) {
//                 return false;
//             }
//         }
//         return true;
//     }

//     function checkingEndPoint(point) {
//         if(point.x * point.y == 0 || point.x == len - 1 || point.y == len - 1) {
//             return true;
//         }
//         return false;
//     }

//     draw();

//     function draw() {
//         ctx.fillStyle = '#777777'
//         for (var i = 0; i < len; i++) {
//             for (var j = 0; j < len; j++) {
//                 if(pointInfo[i][j] == 1) {
//                     ctx.beginPath();
//                     ctx.arc(i, j, 0.5, 0 * Math.PI, 2 * Math.PI);
//                     ctx.fill();
//                 }
//                 if(i > 1 && j > 1 && i < len - 2 && j < len - 2) {
//                     if(pointInfo[i][j] +
//                         pointInfo[i + 1][j] +
//                         pointInfo[i - 1][j] +
//                         pointInfo[i][j + 1] +
//                         pointInfo[i][j - 1] >= 4 ) {
//                             ctx.beginPath();
//                             ctx.arc(i, j, 5, 0 * Math.PI, 2 * Math.PI);
//                             ctx.fill();
//                         }
//                 }
//             }
//         }
//     }

// }




function getCurveLine(start, end) {
    if (Math.abs(buildingPosArr[start].x - buildingPosArr[end].x) > globalData.buildingSize
        && Math.abs(buildingPosArr[start].y - buildingPosArr[end].y) > globalData.buildingSize) {
        totalLineInfo.push({
            'from': {
                'x': buildingPosArr[start].x,
                'y': buildingPosArr[start].y
            },
            'mid': {
                'x': buildingPosArr[start].x,
                'y': buildingPosArr[end].y
            },
            'to': {
                'x': buildingPosArr[end].x,
                'y': buildingPosArr[end].y,
            }
        })
    }
}

function convertPosition(x, y) {
    var newPosition = {
        'convertedX': Math.sqrt(3) * x - Math.sqrt(3) * y,
        'convertedY': y + x
    }

    return newPosition;
}

function draw() {
    ctx.translate(-cameraZoom * cameraOffset_pre.x, -cameraZoom * cameraOffset_pre.y)
    ctx.translate(cameraZoom * (-window.innerWidth / 2 + cameraOffset.x), cameraZoom * (-window.innerHeight / 2 + cameraOffset.y))

    ctx.clearRect(-10 * cameraZoom * globalData.wide, -10 * cameraZoom * globalData.wide, 20 * cameraZoom * globalData.wide, 20 * cameraZoom * globalData.wide)


    var temp_width = cameraZoom * globalData.wide / globalData.tileCnt

    ctx.strokeStyle = "#b2ae9d";
    ctx.lineWidth = cameraZoom / 2;
    ctx.fillStyle = "#d3ceba"
    ctx.beginPath();
    var pos = convertPosition(-globalData.wide, -globalData.wide)
    ctx.lineTo(cameraZoom * pos.convertedX, cameraZoom * pos.convertedY)
    pos = convertPosition(-globalData.wide, globalData.wide)
    ctx.lineTo(cameraZoom * pos.convertedX, cameraZoom * pos.convertedY)
    ctx.lineTo(cameraZoom * pos.convertedX, cameraZoom * pos.convertedY + temp_width / 2)
    pos = convertPosition(globalData.wide, globalData.wide)
    ctx.lineTo(cameraZoom * pos.convertedX, cameraZoom * pos.convertedY + temp_width / 2)
    pos = convertPosition(globalData.wide, -globalData.wide)
    ctx.lineTo(cameraZoom * pos.convertedX, cameraZoom * pos.convertedY + temp_width / 2)
    ctx.lineTo(cameraZoom * pos.convertedX, cameraZoom * pos.convertedY)
    ctx.fill()


    ctx.strokeStyle = "#b2ae9d";
    ctx.lineWidth = cameraZoom / 2;
    ctx.fillStyle = "#a77d53"
    ctx.beginPath();
    pos = convertPosition(-globalData.wide, globalData.wide)
    ctx.lineTo(cameraZoom * pos.convertedX, cameraZoom * pos.convertedY + temp_width / 2)
    pos = convertPosition(globalData.wide, globalData.wide)
    ctx.lineTo(cameraZoom * pos.convertedX, cameraZoom * pos.convertedY + temp_width / 2)
    pos = convertPosition(globalData.wide, -globalData.wide)
    ctx.lineTo(cameraZoom * pos.convertedX, cameraZoom * pos.convertedY + temp_width / 2)
    ctx.lineTo(cameraZoom * pos.convertedX, cameraZoom * pos.convertedY + temp_width)
    pos = convertPosition(globalData.wide, globalData.wide)
    ctx.lineTo(cameraZoom * pos.convertedX, cameraZoom * pos.convertedY + temp_width)
    pos = convertPosition(-globalData.wide, globalData.wide)
    ctx.lineTo(cameraZoom * pos.convertedX, cameraZoom * pos.convertedY + temp_width)
    ctx.fill()


    ctx.strokeStyle = "#b2ae9d";
    ctx.lineWidth = cameraZoom / 2;
    ctx.beginPath();
    // console.log(borderNum)
    for (var i = 0; i < borderNum; i++) {
        var fromPos = convertPosition(totalLineInfo[i].from.x, totalLineInfo[i].from.y)
        var toPos = convertPosition(totalLineInfo[i].to.x, totalLineInfo[i].to.y)

        ctx.moveTo(cameraZoom * fromPos.convertedX, cameraZoom * fromPos.convertedY)
        ctx.lineTo(cameraZoom * toPos.convertedX, cameraZoom * toPos.convertedY)
        if (totalLineInfo[i].to.x == globalData.wide || totalLineInfo[i].to.y == globalData.wide) {
            ctx.moveTo(cameraZoom * toPos.convertedX, cameraZoom * toPos.convertedY)
            ctx.lineTo(cameraZoom * toPos.convertedX, cameraZoom * toPos.convertedY + temp_width)
        }
    }
    ctx.lineCap = 'round';
    ctx.stroke();



    temp_width = cameraZoom * globalData.roadWidth * 2

    for (var i = 0; i < drawPointsArr.length; i++) {
        var value = totalPointInfo[(drawPointsArr[i].x - globalData.roadWidth / 2) / scale_info][(drawPointsArr[i].y - globalData.roadWidth / 2) / scale_info]
        var newPosition = convertPosition(drawPointsArr[i].x - globalData.wide, drawPointsArr[i].y - globalData.wide)
        if (value != 1 && value != 210) {
            if(value != -1) {
                if (value >= 50) {
                    ctx.lineWidth = 1.8 * temp_width;
                    ctx.strokeStyle = "grey"

                    ctx.beginPath();
                    ctx.moveTo(cameraZoom * newPosition.convertedX, cameraZoom * (newPosition.convertedY - (value - 50) * scale_info));
                    ctx.quadraticCurveTo(cameraZoom * (newPosition.convertedX + Math.sqrt(3) * (value - 50) * scale_info - 10), cameraZoom * (newPosition.convertedY - (value - 50) * scale_info + 10),
                        cameraZoom * (newPosition.convertedX + Math.sqrt(3) * (value - 50) * scale_info), cameraZoom * newPosition.convertedY);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(cameraZoom * newPosition.convertedX, cameraZoom * (newPosition.convertedY - (value - 50) * scale_info));
                    ctx.quadraticCurveTo(cameraZoom * (newPosition.convertedX - Math.sqrt(3) * (value - 50) * scale_info + 10), cameraZoom * (newPosition.convertedY - (value - 50) * scale_info + 10),
                        cameraZoom * (newPosition.convertedX - Math.sqrt(3) * (value - 50) * scale_info), cameraZoom * newPosition.convertedY);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(cameraZoom * newPosition.convertedX, cameraZoom * (newPosition.convertedY + (value - 50) * scale_info));
                    ctx.quadraticCurveTo(cameraZoom * (newPosition.convertedX - Math.sqrt(3) * (value - 50) * scale_info + 10), cameraZoom * (newPosition.convertedY + (value - 50) * scale_info - 10),
                        cameraZoom * (newPosition.convertedX - Math.sqrt(3) * (value - 50) * scale_info), cameraZoom * newPosition.convertedY);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(cameraZoom * newPosition.convertedX, cameraZoom * (newPosition.convertedY + (value - 50) * scale_info));
                    ctx.quadraticCurveTo(cameraZoom * (newPosition.convertedX + Math.sqrt(3) * (value - 50) * scale_info - 10), cameraZoom * (newPosition.convertedY + (value - 50) * scale_info - 10),
                        cameraZoom * (newPosition.convertedX + Math.sqrt(3) * (value - 50) * scale_info), cameraZoom * newPosition.convertedY);
                    ctx.stroke();

                    ctx.drawImage(document.getElementById('source_' + (i % 4 + 1)),
                        cameraZoom * (newPosition.convertedX - globalData.buildingSize / 2), cameraZoom * (newPosition.convertedY - globalData.buildingSize * 2 / 3),
                        cameraZoom * globalData.buildingSize, cameraZoom * globalData.buildingSize
                    );
                } else {
                    var temp = value;
                    var t = 2;
                    while (temp != 1) {
                        if (temp % t == 0) {
                            drawCurveRoad(newPosition, t)
                            temp /= t;
                            t = 1;
                        }
                        t++;
                    }
                }
            }
        } else {
            if (drawPointsArr[i].x > 10 && drawPointsArr[i].y > 10
                && drawPointsArr[i].x < 2 * globalData.wide - 6 && drawPointsArr[i].y < 2 * globalData.wide - 6) {
                ctx.beginPath();
                ctx.fillStyle = "grey"
                ctx.lineWidth = 1;
                ctx.lineTo(cameraZoom * newPosition.convertedX, cameraZoom * newPosition.convertedY - temp_width);
                ctx.lineTo(cameraZoom * newPosition.convertedX + temp_width * Math.sqrt(3), cameraZoom * newPosition.convertedY);
                ctx.lineTo(cameraZoom * newPosition.convertedX, cameraZoom * newPosition.convertedY + temp_width);
                ctx.lineTo(cameraZoom * newPosition.convertedX - temp_width * Math.sqrt(3), cameraZoom * newPosition.convertedY);
                ctx.fill();
            }
        }
    }

    function drawCurveRoad(point, value) {
        ctx.beginPath();
        ctx.lineWidth = 1.8 * temp_width;
        ctx.strokeStyle = "grey"
        var temp_value = 1
        switch (value) {
            case 2:
                ctx.moveTo(cameraZoom * (point.convertedX - temp_value * globalData.roadWidth * Math.sqrt(3)), cameraZoom * (point.convertedY - temp_value * globalData.roadWidth));
                ctx.bezierCurveTo(cameraZoom * (point.convertedX), cameraZoom * (point.convertedY), cameraZoom * (point.convertedX), cameraZoom * (point.convertedY),
                    cameraZoom * (point.convertedX + temp_value * globalData.roadWidth * Math.sqrt(3)), cameraZoom * (point.convertedY - temp_value * globalData.roadWidth));
                break;
            case 3:
                ctx.moveTo(cameraZoom * (point.convertedX + temp_value * globalData.roadWidth * Math.sqrt(3)), cameraZoom * (point.convertedY - temp_value * globalData.roadWidth));
                ctx.bezierCurveTo(cameraZoom * (point.convertedX), cameraZoom * (point.convertedY), cameraZoom * (point.convertedX), cameraZoom * (point.convertedY),
                    cameraZoom * (point.convertedX + temp_value * globalData.roadWidth * Math.sqrt(3)), cameraZoom * (point.convertedY + temp_value * globalData.roadWidth));
                break;
            case 5:
                ctx.moveTo(cameraZoom * (point.convertedX + temp_value * globalData.roadWidth * Math.sqrt(3)), cameraZoom * (point.convertedY + temp_value * globalData.roadWidth));
                ctx.bezierCurveTo(cameraZoom * (point.convertedX), cameraZoom * (point.convertedY), cameraZoom * (point.convertedX), cameraZoom * (point.convertedY),
                    cameraZoom * (point.convertedX - temp_value * globalData.roadWidth * Math.sqrt(3)), cameraZoom * (point.convertedY + temp_value * globalData.roadWidth));
                break;
            case 7:
                ctx.moveTo(cameraZoom * (point.convertedX - temp_value * globalData.roadWidth * Math.sqrt(3)), cameraZoom * (point.convertedY + temp_value * globalData.roadWidth));
                ctx.bezierCurveTo(cameraZoom * (point.convertedX), cameraZoom * (point.convertedY), cameraZoom * (point.convertedX), cameraZoom * (point.convertedY),
                    cameraZoom * (point.convertedX - temp_value * globalData.roadWidth * Math.sqrt(3)), cameraZoom * (point.convertedY - temp_value * globalData.roadWidth));
                break;
        }
        ctx.stroke();
    }

    // function getAroundPointsCnt(point) {
    //     var temp_x = Number((point.x - globalData.roadWidth / 2) / scale_info);
    //     var temp_y = Number((point.y - globalData.roadWidth / 2) / scale_info);
    //     // console.log(temp_x, temp_y)
    //     if(temp_x > 0 && temp_x < 999 
    //         && temp_y > 0 && temp_y < 999) {
    //             return (totalPointInfo[temp_x][temp_y] + 
    //                 totalPointInfo[temp_x - 1][temp_y] + totalPointInfo[temp_x + 1][temp_y] + 
    //                 totalPointInfo[temp_x][temp_y - 1] + totalPointInfo[temp_x][temp_y + 1])
    //         }
    //     return 0;
    // }



    // ctx.strokeStyle = "grey";
    // ctx.lineWidth = cameraZoom * globalData.roadWidth;
    // ctx.beginPath();
    // for (var i = borderNum; i < totalLineInfo.length; i++) {  
    //     var fromPos = convertPosition(totalLineInfo[i].from.x, totalLineInfo[i].from.y)
    //     var toPos = convertPosition(totalLineInfo[i].to.x, totalLineInfo[i].to.y)

    //     if (totalLineInfo[i].mid == undefined) {
    //         ctx.moveTo(cameraZoom * fromPos.convertedX, cameraZoom * fromPos.convertedY)
    //         ctx.lineTo(cameraZoom * toPos.convertedX, cameraZoom * toPos.convertedY)
    //     } else {
    //         var midPos = convertPosition(totalLineInfo[i].mid.x, totalLineInfo[i].mid.y)

    //         var tempCenter_del = {
    //             'delX': ((totalLineInfo[i].from.x > totalLineInfo[i].to.x) ? -Math.sqrt(3) : Math.sqrt(3)) * 2 * globalData.buildingSize,
    //             'delY': ((totalLineInfo[i].from.y > totalLineInfo[i].to.y) ? 1 : -1) * 2 * globalData.buildingSize,
    //         }

    //         var tempStart = convertPosition(totalLineInfo[i].mid.x, totalLineInfo[i].mid.y + tempCenter_del.delY)
    //         var tempEnd = convertPosition(totalLineInfo[i].mid.x + tempCenter_del.delX, totalLineInfo[i].mid.y)

    //         ctx.moveTo(cameraZoom * fromPos.convertedX, cameraZoom * fromPos.convertedY)
    //         ctx.lineTo(cameraZoom * tempStart.convertedX, cameraZoom * tempStart.convertedY)

    //         ctx.moveTo(cameraZoom * toPos.convertedX, cameraZoom * toPos.convertedY)
    //         ctx.lineTo(cameraZoom * tempEnd.convertedX, cameraZoom * tempEnd.convertedY)

    //         ctx.moveTo(cameraZoom * tempStart.convertedX, cameraZoom * tempStart.convertedY)
    //         ctx.bezierCurveTo(cameraZoom * midPos.convertedX, cameraZoom * midPos.convertedY,
    //             cameraZoom * midPos.convertedX, cameraZoom * midPos.convertedY,
    //             cameraZoom * tempEnd.convertedX, cameraZoom * tempEnd.convertedY);
    //     }
    // }
    // ctx.lineCap = 'round';
    // ctx.stroke();



    // ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    // ctx.lineWidth = 1;

    // for(var i = 0; i < movingPoint.length; i++) {
    //     ctx.beginPath();
    //     ctx.arc(cameraZoom * movingPoint[i].position.x, cameraZoom * movingPoint[i].position.y, cameraZoom * 5, 0, Math.PI * 2); 
    //     ctx.fill();
    // }


    // for (var i = 0; i < buildingPosArr.length; i++) {
    //     var newPosition = convertPosition(buildingPosArr[i].x, buildingPosArr[i].y)
    //     // ctx.drawImage(document.getElementById('source_' + (i % 4 + 1)),
    //     //     cameraZoom * (newPosition.convertedX - globalData.buildingSize / 2), cameraZoom * (newPosition.convertedY - globalData.buildingSize * 2 / 3),
    //     //     cameraZoom * globalData.buildingSize, cameraZoom * globalData.buildingSize
    //     // );
    //     ctx.drawImage(document.getElementById('source_' + (i % 4 + 1)),
    //         cameraZoom * newPosition.convertedX, cameraZoom * newPosition.convertedY,
    //         cameraZoom * globalData.buildingSize, cameraZoom * globalData.buildingSize
    //     );
    // }


    cameraOffset_pre.x = -window.innerWidth / 2 + cameraOffset.x
    cameraOffset_pre.y = -window.innerHeight / 2 + cameraOffset.y
}





function getEventLocation(e) {
    if (e.touches && e.touches.length == 1) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    else if (e.clientX && e.clientY) {
        return { x: e.clientX, y: e.clientY }
    }
}

let isDragging = false
let dragStart = { x: 0, y: 0 }

function onPointerDown(e) {
    isDragging = true
    dragStart.x = getEventLocation(e).x / cameraZoom - cameraOffset.x
    dragStart.y = getEventLocation(e).y / cameraZoom - cameraOffset.y
}

function onPointerUp(e) {
    isDragging = false
    initialPinchDistance = null
    lastZoom = cameraZoom

}

function onPointerMove(e) {
    if (isDragging) {
        cameraOffset.x = getEventLocation(e).x / cameraZoom - dragStart.x, (globalData.wide * cameraZoom) / 2
        cameraOffset.y = getEventLocation(e).y / cameraZoom - dragStart.y, (globalData.wide * cameraZoom) / 2
    }
}

function handleTouch(e, singleTouchHandler) {
    if (e.touches.length == 1) {
        singleTouchHandler(e)
    }
    else if (e.type == "touchmove" && e.touches.length == 2) {
        isDragging = false
        handlePinch(e)
    }
}

let initialPinchDistance = null
let lastZoom = cameraZoom

function handlePinch(e) {
    e.preventDefault()

    let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }

    // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
    let currentDistance = (touch1.x - touch2.x) ** 2 + (touch1.y - touch2.y) ** 2

    if (initialPinchDistance == null) {
        initialPinchDistance = currentDistance
    }
    else {
        adjustZoom(null, currentDistance / initialPinchDistance)
    }
}

function adjustZoom(zoomAmount, zoomFactor) {
    if (!isDragging) {
        if (zoomAmount) {
            cameraZoom += zoomAmount
        }
        else if (zoomFactor) {
            cameraZoom = zoomFactor * lastZoom
        }

        cameraZoom = Math.min(cameraZoom, MAX_ZOOM)
        cameraZoom = Math.max(cameraZoom, MIN_ZOOM)

        // draw()
    }
}

canvas.addEventListener('mousedown', onPointerDown)
canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
canvas.addEventListener('mouseup', onPointerUp)
canvas.addEventListener('touchend', (e) => handleTouch(e, onPointerUp))
canvas.addEventListener('mousemove', onPointerMove)
canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
canvas.addEventListener('wheel', (e) => adjustZoom(e.deltaY * SCROLL_SENSITIVITY))
