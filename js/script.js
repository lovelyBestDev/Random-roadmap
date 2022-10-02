const globalData = {
    'buildingSize': 155,
    'roadWidth': 20,
    'totalBuildingCnt': 3000,
    'initialBuildingCnt': 4,
    'wide': 20000,
    'tileCnt': 500
}

let cameraOffset = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
let cameraOffset_pre = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
let cameraZoom = 1
let MAX_ZOOM = 5
let MIN_ZOOM = 0.1
let SCROLL_SENSITIVITY = 0.0001

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth
canvas.height = window.innerHeight

let totalLineInfo = [];
let totalPointInfo = [];
let drawPointsArr = []
let buildingPosArr = []
let movingPoints = []

let scale_info;

let count = 0

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
    }, 30)
})


class CMovingPointer {
    constructor(x, y, dirX, dirY) {
        this.posX = x;
        this.posY = y;
        this.speedX = dirX;
        this.speedY = dirY;
        this.maxValue = 999
        this.minValue = 0
    }

    moving() {
        this.posX += this.speedX;
        this.posY += this.speedY;

        if (this.posX == this.minValue || this.posX == this.maxValue
            || this.posY == this.minValue || this.posY == this.maxValue) {
            this.speedX = -this.speedX
            this.speedY = -this.speedY
        }
    }

    changeDirection(newX, newY) {
        this.speedX = newX;
        this.speedY = newY;
    }
}


function init() {
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

    var maxHV = 300;
    var minMovingLength = 20;
    var minBetBorderPoints = 2 * Math.pow(10, 2);
    var minBetMovingPointAndBreakPoint = 2 * Math.pow(5, 2);
    var checkingUpTiles = 10
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
                pointInfo[newBreakingPoint.x][newBreakingPoint.y] = 1;
                break;
            }


            if (pointInfo[currentPoint.x][currentPoint.y] == 1) {
                breakingPoints.push({ ...currentPoint })
                movingCnt = 0
            }


            if (movingCnt > minMovingLength) {
                breakingFlag = Math.floor(50 * Math.random() / 4)
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



    var ttt = 45;
    for (var i = ttt; i < pointInfo.length - ttt; i++) {
        for (var j = ttt; j < pointInfo[i].length - ttt; j++) {
            var temp = {
                'x': i,
                'y': j
            }
            if (pointInfo[i][j] == 0 && checkingSpace(temp, ttt)) {
                var rand = 3 * Math.random()
                if (rand < 1) {
                    var r = Math.floor(Math.random() * Math.floor(ttt / 6) + Math.floor(ttt / 4))
                    var X = i + Math.floor(ttt / 2)
                    var Y = j + Math.floor(ttt / 2)
                    pointInfo[X][Y] = r + 1000

                    var temp_del = 4;
                    var rand_1 = Math.floor(Math.random() * 4)

                    {
                        if (rand_1 != 0 && rand_1 != 1) {
                            var temp = r - temp_del;
                            while (true) {
                                if (X + temp >= len) {
                                    break
                                }
                                if (pointInfo[X + temp][Y] == 0) {
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
                        }

                        if (rand_1 != 1) {
                            temp = r - temp_del;
                            while (true) {
                                if (Y + temp >= len) {
                                    break
                                }
                                if (pointInfo[X][Y + temp] == 0) {
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
                        }

                        if (rand_1 != 2) {
                            temp = -r + temp_del;
                            while (true) {
                                if (X + temp < 0) {
                                    break
                                }
                                if (pointInfo[X + temp][Y] == 0) {
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
                        }

                        if (rand_1 != 3) {
                            temp = -r + temp_del;
                            while (true) {
                                if (Y + temp < 0) {
                                    break
                                }
                                if (pointInfo[X][Y + temp] == 0) {
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
                        }

                        fillSpace({
                            'x': X,
                            'y': Y
                        }, r)
                    }
                }
            }
        }
    }

    for (var i = 1; i < pointInfo.length - 1; i++) {
        for (var j = 1; j < pointInfo[i].length - 1; j++) {
            if (pointInfo[i][j] == 1) {
                pointInfo[i][j] = setBreakingPointValue({
                    'x': i,
                    'y': j
                })
            }
        }
    }

    for (var i = 0; i < breakingPoints.length; i++) {
        if (breakingPoints[i].x > 3 && breakingPoints[i].x < len - 4
            && breakingPoints[i].y > 3 && breakingPoints[i].y < len - 4) {
            // pointInfo[breakingPoints[i].x][breakingPoints[i].y] = setBreakingPointValue(breakingPoints[i])
            // pointInfo[breakingPoints[i].x][breakingPoints[i].y] = 2

            var dirArr = [
                { 'x': 1, 'y': 0 },
                { 'x': -1, 'y': 0 },
                { 'x': 0, 'y': 1 },
                { 'x': 0, 'y': -1 },
            ];
            while (true) {
                var rand = Math.floor(Math.random() * 4)
                if (pointInfo[breakingPoints[i].x + dirArr[rand].x][breakingPoints[i].y + dirArr[rand].y] != 0) {
                    movingPoints.push(new CMovingPointer(breakingPoints[i].x, breakingPoints[i].y, dirArr[rand].x, dirArr[rand].y))
                    break;
                }
            }
        }
    }

    // for (var i = 0; i < breakingPoints.length; i++) {
    //     for (var j = 1; j < 3; j++) {
    //         if (breakingPoints[i].x >= j && breakingPoints[i].x < len - j
    //             && breakingPoints[i].y >= j && breakingPoints[i].y < len - j) {
    //             pointInfo[breakingPoints[i].x - j][breakingPoints[i].y] = pointInfo[breakingPoints[i].x - j][breakingPoints[i].y] == 1 ? 0 : pointInfo[breakingPoints[i].x - j][breakingPoints[i].y]
    //             pointInfo[breakingPoints[i].x][breakingPoints[i].y - j] = pointInfo[breakingPoints[i].x][breakingPoints[i].y - j] == 1 ? 0 : pointInfo[breakingPoints[i].x][breakingPoints[i].y - j]
    //             pointInfo[breakingPoints[i].x + j][breakingPoints[i].y] = pointInfo[breakingPoints[i].x + j][breakingPoints[i].y] == 1 ? 0 : pointInfo[breakingPoints[i].x + j][breakingPoints[i].y]
    //             pointInfo[breakingPoints[i].x][breakingPoints[i].y + j] = pointInfo[breakingPoints[i].x][breakingPoints[i].y + j] == 1 ? 0 : pointInfo[breakingPoints[i].x][breakingPoints[i].y + j]
    //         }
    //     }
    // }



    return pointInfo;


    function fillSpace(point, r) {
        for (var i = -r + 1; i < r; i++) {
            for (var j = -r + 1; j < r; j++) {
                if (i != 0 && j != 0) {
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
        // var temp_value = 1;
        // if (pointInfo[point.x - 1][point.y] == 1 && pointInfo[point.x][point.y - 1] == 1) {
        //     temp_value *= 2;
        // }
        // if (pointInfo[point.x][point.y - 1] == 1 && pointInfo[point.x + 1][point.y] == 1) {
        //     temp_value *= 3;
        // }
        // if (pointInfo[point.x + 1][point.y] == 1 && pointInfo[point.x][point.y + 1] == 1) {
        //     temp_value *= 5;
        // }
        // if (pointInfo[point.x][point.y + 1] == 1 && pointInfo[point.x - 1][point.y] == 1) {
        //     temp_value *= 7;
        // }
        // return temp_value;

        var temp_value = 1;
        if (pointInfo[point.x - 1][point.y] != 0 && pointInfo[point.x - 1][point.y] != -1) {
            temp_value *= 2;
        }
        if (pointInfo[point.x][point.y - 1] != 0 && pointInfo[point.x][point.y - 1] != -1) {
            temp_value *= 3;
        }
        if (pointInfo[point.x + 1][point.y] != 0 && pointInfo[point.x + 1][point.y] != -1) {
            temp_value *= 5;
        }
        if (pointInfo[point.x][point.y + 1] != 0 && pointInfo[point.x][point.y + 1] != -1) {
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


function convertPosition(x, y) {
    var newPosition = {
        'convertedX': Math.sqrt(3) * x - Math.sqrt(3) * y,
        'convertedY': y + x
    }

    return newPosition;
}

var del_X = 0;//window.innerWidth / 2;
var del_Y = 0;//window.innerHeight / 2;
var pre_cameraZoom;

function draw() {

    if(cameraOffset_pre.x != -window.innerWidth / 2 + cameraOffset.x || cameraOffset_pre.y != -window.innerHeight / 2 + cameraOffset.y) {
        del_X += cameraZoom * (-window.innerWidth / 2 + cameraOffset.x - cameraOffset_pre.x)
        del_Y += cameraZoom * (-window.innerHeight / 2 + cameraOffset.y - cameraOffset_pre.y)
    }


    if(del_X / cameraZoom > 0 && del_Y / cameraZoom > 0) {
        if((del_Y / cameraZoom + 484.5) * 1.69 + del_X / cameraZoom > 67000) {
            if(pre_cameraZoom != cameraZoom) {
                cameraZoom = pre_cameraZoom
            }
            del_X -= cameraZoom * (-window.innerWidth / 2 + cameraOffset.x - cameraOffset_pre.x)
            del_Y -= cameraZoom * (-window.innerHeight / 2 + cameraOffset.y - cameraOffset_pre.y)
            cameraOffset.x = cameraOffset_pre.x + window.innerWidth / 2
            cameraOffset.y = cameraOffset_pre.y + window.innerHeight / 2
        }
    }

    if(del_X / cameraZoom < 0 && del_Y / cameraZoom > 0) {
        if((del_Y / cameraZoom + 484.5) * 1.3 - del_X / cameraZoom > 43000) {
            if(pre_cameraZoom != cameraZoom) {
                cameraZoom = pre_cameraZoom
            }
            del_X -= cameraZoom * (-window.innerWidth / 2 + cameraOffset.x - cameraOffset_pre.x)
            del_Y -= cameraZoom * (-window.innerHeight / 2 + cameraOffset.y - cameraOffset_pre.y)
            cameraOffset.x = cameraOffset_pre.x + window.innerWidth / 2
            cameraOffset.y = cameraOffset_pre.y + window.innerHeight / 2
        }
    }

    if(del_X / cameraZoom > 0 && del_Y / cameraZoom < 0) {
        if(-(del_Y / cameraZoom + 484.5) * 2.34 + del_X / cameraZoom > 67000) {
            if(pre_cameraZoom != cameraZoom) {
                cameraZoom = pre_cameraZoom
            }
            del_X -= cameraZoom * (-window.innerWidth / 2 + cameraOffset.x - cameraOffset_pre.x)
            del_Y -= cameraZoom * (-window.innerHeight / 2 + cameraOffset.y - cameraOffset_pre.y)
            cameraOffset.x = cameraOffset_pre.x + window.innerWidth / 2
            cameraOffset.y = cameraOffset_pre.y + window.innerHeight / 2
        }
    }

    if(del_X / cameraZoom < 0 && del_Y / cameraZoom < 0) {
        if(-(del_Y / cameraZoom + 484.5) * 1.76 - del_X / cameraZoom > 32000) {
            if(pre_cameraZoom != cameraZoom) {
                cameraZoom = pre_cameraZoom
            }
            del_X -= cameraZoom * (-window.innerWidth / 2 + cameraOffset.x - cameraOffset_pre.x)
            del_Y -= cameraZoom * (-window.innerHeight / 2 + cameraOffset.y - cameraOffset_pre.y)
            cameraOffset.x = cameraOffset_pre.x + window.innerWidth / 2
            cameraOffset.y = cameraOffset_pre.y + window.innerHeight / 2
        }
    }

    // if(del_X / cameraZoom < -56000 || del_X / cameraZoom > 70000) {
    //     if(pre_cameraZoom != cameraZoom) {
    //         cameraZoom = pre_cameraZoom
    //     }
    //     del_X -= cameraZoom * (-window.innerWidth / 2 + cameraOffset.x - cameraOffset_pre.x)
    //     cameraOffset.x = cameraOffset_pre.x + window.innerWidth / 2
    // }
    // if(del_Y / cameraZoom > 40500 || del_Y / cameraZoom < -30500) {
    //     if(pre_cameraZoom != cameraZoom) {
    //         cameraZoom = pre_cameraZoom
    //     }
    //     del_Y -= cameraZoom * (-window.innerHeight / 2 + cameraOffset.y - cameraOffset_pre.y)
    //     cameraOffset.y = cameraOffset_pre.y + window.innerHeight / 2
    // }

    ctx.translate(-cameraZoom * cameraOffset_pre.x, -cameraZoom * cameraOffset_pre.y)
    ctx.translate(cameraZoom * (-window.innerWidth / 2 + cameraOffset.x), cameraZoom * (-window.innerHeight / 2 + cameraOffset.y));

    cameraOffset_pre.x = -window.innerWidth / 2 + cameraOffset.x
    cameraOffset_pre.y = -window.innerHeight / 2 + cameraOffset.y

    pre_cameraZoom = cameraZoom

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
    ctx.lineWidth = cameraZoom;
    ctx.beginPath();
    for (var i = 0; i < totalLineInfo.length; i++) {
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



    temp_width = cameraZoom * globalData.roadWidth

    for (var i = 0; i < drawPointsArr.length; i++) {
        var value = totalPointInfo[(drawPointsArr[i].x - globalData.roadWidth / 2) / scale_info][(drawPointsArr[i].y - globalData.roadWidth / 2) / scale_info]
        var newPosition = convertPosition(drawPointsArr[i].x - globalData.wide, drawPointsArr[i].y - globalData.wide)
        if (value != 1) {
            if (value != -1) {
                if (value >= 1000) {
                    var temp_value = value - 1000
                    ctx.lineWidth = 1.75 * temp_width;
                    ctx.strokeStyle = "grey"

                    ctx.beginPath();
                    ctx.moveTo(cameraZoom * newPosition.convertedX, cameraZoom * (newPosition.convertedY - temp_value * scale_info));
                    ctx.quadraticCurveTo(cameraZoom * (newPosition.convertedX + Math.sqrt(3) * temp_value * scale_info - 10), cameraZoom * (newPosition.convertedY - temp_value * scale_info + 10),
                        cameraZoom * (newPosition.convertedX + Math.sqrt(3) * temp_value * scale_info), cameraZoom * newPosition.convertedY);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(cameraZoom * newPosition.convertedX, cameraZoom * (newPosition.convertedY - temp_value * scale_info));
                    ctx.quadraticCurveTo(cameraZoom * (newPosition.convertedX - Math.sqrt(3) * temp_value * scale_info + 10), cameraZoom * (newPosition.convertedY - temp_value * scale_info + 10),
                        cameraZoom * (newPosition.convertedX - Math.sqrt(3) * temp_value * scale_info), cameraZoom * newPosition.convertedY);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(cameraZoom * newPosition.convertedX, cameraZoom * (newPosition.convertedY + temp_value * scale_info));
                    ctx.quadraticCurveTo(cameraZoom * (newPosition.convertedX - Math.sqrt(3) * temp_value * scale_info + 10), cameraZoom * (newPosition.convertedY + temp_value * scale_info - 10),
                        cameraZoom * (newPosition.convertedX - Math.sqrt(3) * temp_value * scale_info), cameraZoom * newPosition.convertedY);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(cameraZoom * newPosition.convertedX, cameraZoom * (newPosition.convertedY + temp_value * scale_info));
                    ctx.quadraticCurveTo(cameraZoom * (newPosition.convertedX + Math.sqrt(3) * temp_value * scale_info - 10), cameraZoom * (newPosition.convertedY + temp_value * scale_info - 10),
                        cameraZoom * (newPosition.convertedX + Math.sqrt(3) * temp_value * scale_info), cameraZoom * newPosition.convertedY);
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.fillStyle = "grey"
                    ctx.lineWidth = 1;
                    ctx.lineTo(cameraZoom * newPosition.convertedX, cameraZoom * newPosition.convertedY);
                    ctx.lineTo(cameraZoom * newPosition.convertedX + temp_width * Math.sqrt(3), cameraZoom * newPosition.convertedY + temp_width);
                    ctx.lineTo(cameraZoom * newPosition.convertedX, cameraZoom * newPosition.convertedY + 2 * temp_width);
                    ctx.lineTo(cameraZoom * newPosition.convertedX - temp_width * Math.sqrt(3), cameraZoom * newPosition.convertedY + temp_width);
                    ctx.fill();

                    var temp = value;
                    var t = 2;
                    while (temp != 1) {
                        if (temp % t == 0) {
                            drawCurveRoad({
                                'x': drawPointsArr[i].x,
                                'y': drawPointsArr[i].y
                            }, t)
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
                ctx.lineTo(cameraZoom * newPosition.convertedX, cameraZoom * newPosition.convertedY);
                ctx.lineTo(cameraZoom * newPosition.convertedX + temp_width * Math.sqrt(3), cameraZoom * newPosition.convertedY + temp_width);
                ctx.lineTo(cameraZoom * newPosition.convertedX, cameraZoom * newPosition.convertedY + 2 * temp_width);
                ctx.lineTo(cameraZoom * newPosition.convertedX - temp_width * Math.sqrt(3), cameraZoom * newPosition.convertedY + temp_width);
                ctx.fill();
            }
        }
    }


    ctx.fillStyle = "white"
    ctx.lineWidth = 1;
    //if(count == 0) {
        for (var i = 0; i < movingPoints.length; i++) {
            var newPosition = convertPosition(scale_info * (movingPoints[i].posX) - globalData.wide, scale_info * (movingPoints[i].posY) - globalData.wide)
    
            if (totalPointInfo[movingPoints[i].posX][movingPoints[i].posY] != 0 && totalPointInfo[movingPoints[i].posX][movingPoints[i].posY] != -1) {
                ctx.beginPath();
                ctx.arc(cameraZoom * newPosition.convertedX, cameraZoom * (newPosition.convertedY + 2 * globalData.roadWidth), cameraZoom * 6, 0, 2 * Math.PI)
                ctx.fill()
            }
            movingPoints[i].moving();
            if(movingPoints[i].posX != 0 && movingPoints[i].posX != 999 &&
                movingPoints[i].posY != 0 && movingPoints[i].posY != 999) {
                    if (totalPointInfo[movingPoints[i].posX][movingPoints[i].posY] != -1 &&
                        totalPointInfo[movingPoints[i].posX][movingPoints[i].posY] != 2 && 
                            totalPointInfo[movingPoints[i].posX][movingPoints[i].posY] != 3 && 
                            totalPointInfo[movingPoints[i].posX][movingPoints[i].posY] != 5 && 
                                totalPointInfo[movingPoints[i].posX][movingPoints[i].posY] != 7 && 
                            totalPointInfo[movingPoints[i].posX][movingPoints[i].posY] != 10 && 
                                totalPointInfo[movingPoints[i].posX][movingPoints[i].posY] != 21 && 
                                    totalPointInfo[movingPoints[i].posX][movingPoints[i].posY] < 1000) {
                                        
                        if (movingPoints[i].speedX == 0) {
                            var t = (Math.random() > 0.5 ? 1 : -1)
                            if (totalPointInfo[movingPoints[i].posX + t][movingPoints[i].posY] != 0) {
                                movingPoints[i].changeDirection(t, 0)
                            } else if (totalPointInfo[movingPoints[i].posX - t][movingPoints[i].posY] != 0) {
                                movingPoints[i].changeDirection(-t, 0)
                            } else {
                                movingPoints[i].changeDirection(-movingPoints[i].speedX, -movingPoints[i].speedY)
                            }
                        } else {
                            var t = (Math.random() > 0.5 ? 1 : -1)
                            if (totalPointInfo[movingPoints[i].posX][movingPoints[i].posY + t] != 0) {
                                movingPoints[i].changeDirection(0, t)
                            } else if (totalPointInfo[movingPoints[i].posX][movingPoints[i].posY - t] != 0) {
                                movingPoints[i].changeDirection(0, -t)
                            } else {
                                movingPoints[i].changeDirection(-movingPoints[i].speedX, -movingPoints[i].speedY)
                            }
                        }
                    }
                }
            
        }  
    //}
    



    buildingPosArr = []
    var minDistance_building = 2 * Math.pow(globalData.buildingSize, 2)

    for (var i = 0; i < drawPointsArr.length; i++) {
        var value = totalPointInfo[(drawPointsArr[i].x - globalData.roadWidth / 2) / scale_info][(drawPointsArr[i].y - globalData.roadWidth / 2) / scale_info]
        if (value != -1) {
            if (value != 1 && value != 10 && value != 21 && value < 1000) {
                var newPosition = convertPosition(drawPointsArr[i].x - globalData.wide, drawPointsArr[i].y - globalData.wide)
                if (checkingDelBuildings({
                    'x': newPosition.convertedX,
                    'y': newPosition.convertedY
                })) {
                    ctx.drawImage(document.getElementById('source_' + (i % 4 + 1)),
                        cameraZoom * (newPosition.convertedX - globalData.buildingSize / 2 + 5), cameraZoom * (newPosition.convertedY - globalData.buildingSize * 2 / 3) + temp_width,
                        cameraZoom * globalData.buildingSize, cameraZoom * globalData.buildingSize
                    );
                    buildingPosArr.push({
                        'x': newPosition.convertedX,
                        'y': newPosition.convertedY
                    })
                }
            } else if (value >= 1000) {
                var newPosition = convertPosition(drawPointsArr[i].x - globalData.wide, drawPointsArr[i].y - globalData.wide)
                var size = globalData.buildingSize;  //globalData.buildingSize * 1 + (value - 1000) / 10
                ctx.drawImage(document.getElementById('source_' + (i % 4 + 1)),
                    cameraZoom * (newPosition.convertedX - size / 2), cameraZoom * (newPosition.convertedY - size * 2 / 3) + temp_width,
                    cameraZoom * size, cameraZoom * size
                );
            }
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

    function drawCurveRoad(point, value) {
        ctx.beginPath();
        ctx.fillStyle = "grey"
        ctx.lineWidth = 1;
        ctx.strokeStyle = "grey";
        switch (value) {
            case 2:
                var newPosition = convertPosition(point.x - globalData.wide - 10, point.y - globalData.wide)
                ctx.lineTo(cameraZoom * newPosition.convertedX, cameraZoom * newPosition.convertedY);
                ctx.lineTo(cameraZoom * newPosition.convertedX + temp_width * Math.sqrt(3), cameraZoom * newPosition.convertedY + temp_width);
                ctx.lineTo(cameraZoom * newPosition.convertedX, cameraZoom * newPosition.convertedY + 2 * temp_width);
                ctx.lineTo(cameraZoom * newPosition.convertedX - temp_width * Math.sqrt(3), cameraZoom * newPosition.convertedY + temp_width);
                break;
            case 3:
                var newPosition = convertPosition(point.x - globalData.wide, point.y - globalData.wide - 10)
                ctx.lineTo(cameraZoom * newPosition.convertedX, cameraZoom * newPosition.convertedY);
                ctx.lineTo(cameraZoom * newPosition.convertedX + temp_width * Math.sqrt(3), cameraZoom * newPosition.convertedY + temp_width);
                ctx.lineTo(cameraZoom * newPosition.convertedX, cameraZoom * newPosition.convertedY + 2 * temp_width);
                ctx.lineTo(cameraZoom * newPosition.convertedX - temp_width * Math.sqrt(3), cameraZoom * newPosition.convertedY + temp_width);
                break;
            case 5:
                var newPosition = convertPosition(point.x + 10 - globalData.wide, point.y - globalData.wide)
                ctx.lineTo(cameraZoom * newPosition.convertedX, cameraZoom * newPosition.convertedY);
                ctx.lineTo(cameraZoom * newPosition.convertedX + temp_width * Math.sqrt(3), cameraZoom * newPosition.convertedY + temp_width);
                ctx.lineTo(cameraZoom * newPosition.convertedX, cameraZoom * newPosition.convertedY + 2 * temp_width);
                ctx.lineTo(cameraZoom * newPosition.convertedX - temp_width * Math.sqrt(3), cameraZoom * newPosition.convertedY + temp_width);
                break;
            case 7:
                var newPosition = convertPosition(point.x - globalData.wide, point.y - globalData.wide + 10)
                ctx.lineTo(cameraZoom * newPosition.convertedX, cameraZoom * newPosition.convertedY);
                ctx.lineTo(cameraZoom * newPosition.convertedX + temp_width * Math.sqrt(3), cameraZoom * newPosition.convertedY + temp_width);
                ctx.lineTo(cameraZoom * newPosition.convertedX, cameraZoom * newPosition.convertedY + 2 * temp_width);
                ctx.lineTo(cameraZoom * newPosition.convertedX - temp_width * Math.sqrt(3), cameraZoom * newPosition.convertedY + temp_width);
                break;
        }
        ctx.fill();
    }
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
        flag = true;
        cameraOffset.x = getEventLocation(e).x / cameraZoom - dragStart.x
        cameraOffset.y = getEventLocation(e).y / cameraZoom - dragStart.y
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