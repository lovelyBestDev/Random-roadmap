const initialData = {
    'buildingSize': 300,
    'buildingScale': 1,
    'buildingKind': 6,
    'roadWidth': 20,
    'totalBuildingCnt': 100,
    'initialBuildingCnt': 4,
    'wide': 10000
}

let cameraOffset = { x: window.innerWidth/2, y: window.innerHeight/2 }
let cameraOffset_pre = { x: window.innerWidth/2, y: window.innerHeight/2 }
let cameraZoom = 1
let MAX_ZOOM = 5
let MIN_ZOOM = 0.3
let SCROLL_SENSITIVITY = 0.0005

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth
canvas.height = window.innerHeight

let totalLineInfo = [];

// var images = [];
var buildingPosArr = []
var buildingSideArr = []
var movingPoint = []


window.addEventListener("load", function() {
    init();

    for(var i = 0; i < initialData.totalBuildingCnt; i+=Math.floor(initialData.totalBuildingCnt/10)) {
        getTotalLineInfo(i)
    }

    for(var i = 4; i < totalLineInfo.length; i++) {
        movingPoint.push({
            'position': {
                'x': totalLineInfo[i].from.x,
                'y': totalLineInfo[i].from.y,
            },
            'speed': {
                'x': (totalLineInfo[i].to.x - totalLineInfo[i].from.x) / 2000,
                'y': ((totalLineInfo[i].to.y - totalLineInfo[i].from.y) / 2000) ,
            }
        })
    }

    this.setInterval(() => {
        for(var i = 0; i < movingPoint.length; i++) {
            movingPoint[i].position.x += movingPoint[i].speed.x;
            movingPoint[i].position.y += movingPoint[i].speed.y;

            if(Math.abs(movingPoint[i].position.x - totalLineInfo[i+4].to.x) < 30) {
                movingPoint[i].speed.x = -movingPoint[i].speed.x;
                movingPoint[i].speed.y = -movingPoint[i].speed.y;
            }
        }

        draw()
    }, 10)
})


function init() {    
    for(var i = 0; i < initialData.totalBuildingCnt; i++) {
        var randomPosition = {
            'x': 0,
            'y': 0
        };
        while(true) {
            if (i < initialData.initialBuildingCnt) {
                randomPosition = {
                    'x': Math.random() * (this.window.innerWidth - initialData.buildingSize) + initialData.buildingSize / 2,
                    'y': Math.random() * (this.window.innerHeight - initialData.buildingSize) + initialData.buildingSize / 2
                }
            } else {
                randomPosition = {
                    'x': Math.random() * initialData.wide - initialData.wide/2,
                    'y': Math.random() * initialData.wide - initialData.wide/2
                }
            }
    
            if (checkingRandomPositionAvailable(randomPosition)) {
                break;
            }
        }
        buildingPosArr.push({x: randomPosition.x, y: randomPosition.y})
        buildingSideArr.push({
            't': true,
            'l': true,
            'r': true,
            'd': true
        })
    }

    totalLineInfo.push({
        'from': {
            'x': initialData.wide,
            'y': initialData.wide
        },
        'to': {
            'x': -initialData.wide,
            'y': initialData.wide
        }
    })
    totalLineInfo.push({
        'from': {
            'x': -initialData.wide,
            'y': initialData.wide
        },
        'to': {
            'x': -initialData.wide,
            'y': -initialData.wide
        }
    })
    totalLineInfo.push({
        'from': {
            'x': -initialData.wide,
            'y': -initialData.wide
        },
        'to': {
            'x': initialData.wide,
            'y': -initialData.wide
        }
    })
    totalLineInfo.push({
        'from': {
            'x': initialData.wide,
            'y': -initialData.wide
        },
        'to': {
            'x': initialData.wide,
            'y': initialData.wide
        }
    })
}


function checkingRandomPositionAvailable(obj) {
    for(var i = 0; i < buildingPosArr.length; i++) {
        if(Math.abs(buildingPosArr[i].x - obj.x) + Math.abs(buildingPosArr[i].y - obj.y) < 2 * initialData.buildingSize) {
            return false;
        }
    }
    return true;
}


function getTotalLineInfo(num) {

    var A = 1 / Math.sqrt(3)
    var B = (buildingPosArr[num].y + initialData.buildingSize * 2 / 3) - A * (buildingPosArr[num].x + (initialData.buildingSize - initialData.roadWidth) / 2)

    var buildingPos_temp = []
    var subLineObj = []
    for(var i = 0; i < buildingPosArr.length; i++) {
        if (i != num) {
            var top_right = A * (buildingPosArr[i].x + initialData.buildingSize / 2 - initialData.roadWidth) + B - (buildingPosArr[i].y + initialData.buildingSize / 3 + initialData.roadWidth)
            var down_left = A * buildingPosArr[i].x + B - (buildingPosArr[i].y + initialData.buildingSize * 2 / 3 - initialData.roadWidth)

            var top_right_1 = A * (buildingPosArr[i].x + initialData.buildingSize - initialData.roadWidth) + B - (buildingPosArr[i].y + initialData.buildingSize * 2 / 3 + initialData.roadWidth)
            var down_left_1 = A * (buildingPosArr[i].x + initialData.buildingSize / 2 + initialData.roadWidth) + B - (buildingPosArr[i].y + initialData.buildingSize - initialData.roadWidth)
            if(top_right * down_left < 0 || top_right_1 * down_left_1 < 0) {
                buildingPos_temp.push(i)
            }
            else {
                var C = -1 / Math.sqrt(3)
                var D = (buildingPosArr[i].y + initialData.buildingSize * 2 / 3) - C * (buildingPosArr[i].x + (initialData.buildingSize - initialData.roadWidth) / 2)

                var temp = {
                    'index': i,
                    'acrossX': (D - B) / (A - C),
                    'acrossY': (D - B) / (A - C) * A + B
                }

                if(buildingPosArr[num].x > buildingPosArr[i].x) {
                    if (buildingSideArr[i].t == true) {
                        buildingSideArr[i].t = false;
                        subLineObj.push(temp)
                    }
                } else {
                    if (buildingSideArr[i].d == true) {
                        buildingSideArr[i].d = false;
                        subLineObj.push(temp)
                    }
                }
            }
        }
    }
    
    var endPos1 = -1;  var endPos1Del = 100000;
    var endPos2 = -1;  var endPos2Del = 100000;
    for(var i = 0; i < buildingPos_temp.length; i++) {
        if(buildingPosArr[buildingPos_temp[i]].x > buildingPosArr[num].x && endPos1Del > buildingPosArr[buildingPos_temp[i]].x - buildingPosArr[num].x) {
            var top_right = A * (buildingPosArr[i].x + initialData.buildingSize / 2 - initialData.roadWidth) + B - (buildingPosArr[i].y + initialData.buildingSize / 3 + initialData.roadWidth)
            var down_left = A * buildingPosArr[i].x + B - (buildingPosArr[i].y + initialData.buildingSize * 2 / 3 - initialData.roadWidth)
            if (top_right * down_left < 0) {
                if(buildingSideArr[i].l == true){
                    endPos1Del = buildingPosArr[buildingPos_temp[i]].x - buildingPosArr[num].x
                    endPos1 = buildingPos_temp[i]
                }
            }
        }
        if(buildingPosArr[buildingPos_temp[i]].x < buildingPosArr[num].x && endPos2Del >  buildingPosArr[num].x - buildingPosArr[buildingPos_temp[i]].x) {
            var top_right = A * (buildingPosArr[i].x + initialData.buildingSize - initialData.roadWidth) + B - (buildingPosArr[i].y + initialData.buildingSize * 2 / 3 + initialData.roadWidth)
            var down_left = A * (buildingPosArr[i].x + initialData.buildingSize / 2 + initialData.roadWidth) + B - (buildingPosArr[i].y + initialData.buildingSize - initialData.roadWidth)
            if(top_right * down_left < 0) {
                if(buildingSideArr[i].r == true){
                    endPos2Del = buildingPosArr[num].x - buildingPosArr[buildingPos_temp[i]].x
                    endPos2 = buildingPos_temp[i]
                }
            }
        }
    }

    var startPosition = {
        'x': initialData.wide + initialData.roadWidth / 2,
        'y': (initialData.wide + initialData.roadWidth / 2) * A + B
    }
    if(endPos1 != -1) {
        startPosition = {
            'x': buildingPosArr[endPos1].x + (initialData.buildingSize - initialData.roadWidth) / 2,
            'y': (buildingPosArr[endPos1].x + (initialData.buildingSize - initialData.roadWidth) / 2) * A + B,
        }
    }
   

    var endPosition = {
        'x': -(initialData.wide + initialData.roadWidth / 2),
        'y': -(initialData.wide + initialData.roadWidth / 2) * A + B
    }
    if(endPos2 != -1) {
        endPosition = {
            'x': buildingPosArr[endPos2].x + (initialData.buildingSize - initialData.roadWidth) / 2,
            'y': (buildingPosArr[endPos2].x + (initialData.buildingSize - initialData.roadWidth) / 2) * A + B
        }
    }
    
    
    if(buildingSideArr[num].r == true) {
        totalLineInfo.push({
            'from': {
                'x': startPosition.x,
                'y': startPosition.y
            },
            'to': {
                'x': buildingPosArr[num].x + (initialData.buildingSize - initialData.roadWidth) / 2,
                'y': (buildingPosArr[num].x + (initialData.buildingSize - initialData.roadWidth) / 2) * A + B
            }
        })
        buildingSideArr[num].r = false;
    }
    if(buildingSideArr[num].l == true) {
        totalLineInfo.push({
            'from': {
                'x': endPosition.x,
                'y': endPosition.y
            },
            'to': {
                'x': buildingPosArr[num].x + (initialData.buildingSize - initialData.roadWidth) / 2,
                'y': (buildingPosArr[num].x + (initialData.buildingSize - initialData.roadWidth) / 2) * A + B
            }
        })
        buildingSideArr[num].l = false;
    }

    for(var i = 0; i <subLineObj.length; i++) {
        if(
            (subLineObj[i].acrossX < startPosition.x && subLineObj[i].acrossX > buildingPosArr[num].x + (initialData.buildingSize - initialData.roadWidth) / 2)
              || (subLineObj[i].acrossX > endPosition.x && subLineObj[i].acrossX < buildingPosArr[num].x + (initialData.buildingSize - initialData.roadWidth) / 2)
        ) {
            totalLineInfo.push({
                'from': {
                    'x': subLineObj[i].acrossX,
                    'y': subLineObj[i].acrossY
                },
                'to': {
                    'x': buildingPosArr[subLineObj[i].index].x + (initialData.buildingSize - initialData.roadWidth) / 2,
                    'y': buildingPosArr[subLineObj[i].index].y + initialData.buildingSize * 2 / 3
                }
            })
        }
    }
}


function draw() {
    ctx.translate( -cameraOffset_pre.x, -cameraOffset_pre.y )
    ctx.translate( -window.innerWidth / 2 + cameraOffset.x, -window.innerHeight / 2 + cameraOffset.y )

    ctx.clearRect(-initialData.wide, -initialData.wide, 2 * initialData.wide, 2 * initialData.wide)
    
    ctx.strokeStyle = "grey";
    ctx.lineWidth = cameraZoom * initialData.roadWidth;
    ctx.beginPath();

    for(var i = 0; i < totalLineInfo.length; i++) {
        ctx.moveTo(cameraZoom * totalLineInfo[i].from.x, cameraZoom * totalLineInfo[i].from.y)
        ctx.lineTo(cameraZoom * totalLineInfo[i].to.x, cameraZoom * totalLineInfo[i].to.y)
    }
    ctx.stroke();



    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    for(var i = 0; i < movingPoint.length; i++) {
        ctx.beginPath();
        ctx.arc(cameraZoom * movingPoint[i].position.x, cameraZoom * movingPoint[i].position.y, cameraZoom * 5, 0, Math.PI * 2); 
        ctx.fill();
    }

    // ctx.lineWidth = cameraZoom * initialData.roadWidth / 2;
    // ctx.beginPath();
    // for(var i = 0; i < totalLineInfo.length; i++) {
    //     ctx.arc(cameraZoom * totalLineInfo[i].from.x, cameraZoom * totalLineInfo[i].from.y, 5, 0, Math.PI * 2, true); // Outer circle
    // }
    // ctx.strokeStyle = 'red';
    // ctx.stroke();
    

    for(var i = 0; i < initialData.totalBuildingCnt; i++){
        ctx.drawImage(document.getElementById('source_' + (i % 4 + 1)), cameraZoom * buildingPosArr[i].x, cameraZoom * buildingPosArr[i].y, cameraZoom * initialData.buildingSize, cameraZoom * initialData.buildingSize);
    }

    cameraOffset_pre.x = -window.innerWidth / 2 + cameraOffset.x
    cameraOffset_pre.y = -window.innerHeight / 2 + cameraOffset.y
    
    ctx.clearRect(-(initialData.wide + initialData.roadWidth) * cameraZoom, -2 * initialData.wide * cameraZoom, 2 * (initialData.wide + initialData.roadWidth) * cameraZoom, initialData.wide * cameraZoom)
    ctx.clearRect(-(initialData.wide + initialData.roadWidth) * cameraZoom, initialData.wide * cameraZoom, 2 * (initialData.wide + initialData.roadWidth) * cameraZoom, initialData.wide * cameraZoom)

}



function getEventLocation(e)
{
    if (e.touches && e.touches.length == 1)
    {
        return { x:e.touches[0].clientX, y: e.touches[0].clientY }
    }
    else if (e.clientX && e.clientY)
    {
        return { x: e.clientX, y: e.clientY }        
    }
}

let isDragging = false
let dragStart = { x: 0, y: 0 }

function onPointerDown(e)
{
    isDragging = true
    dragStart.x = getEventLocation(e).x/cameraZoom - cameraOffset.x
    dragStart.y = getEventLocation(e).y/cameraZoom - cameraOffset.y
}

function onPointerUp(e)
{
    isDragging = false
    initialPinchDistance = null
    lastZoom = cameraZoom

}

function onPointerMove(e)
{
    if (isDragging)
    {
        cameraOffset.x = getEventLocation(e).x/cameraZoom - dragStart.x, (initialData.wide * cameraZoom) / 2
        cameraOffset.y = getEventLocation(e).y/cameraZoom - dragStart.y, (initialData.wide * cameraZoom) / 2

        // draw()
    }
}

function handleTouch(e, singleTouchHandler)
{
    if ( e.touches.length == 1 )
    {
        singleTouchHandler(e)
    }
    else if (e.type == "touchmove" && e.touches.length == 2)
    {
        isDragging = false
        handlePinch(e)
    }
}

let initialPinchDistance = null
let lastZoom = cameraZoom

function handlePinch(e)
{
    e.preventDefault()
    
    let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }
    
    // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
    let currentDistance = (touch1.x - touch2.x)**2 + (touch1.y - touch2.y)**2
    
    if (initialPinchDistance == null)
    {
        initialPinchDistance = currentDistance
    }
    else
    {
        adjustZoom( null, currentDistance/initialPinchDistance )
    }
}

function adjustZoom(zoomAmount, zoomFactor)
{
    if (!isDragging)
    {
        if (zoomAmount)
        {
            cameraZoom += zoomAmount
        }
        else if (zoomFactor)
        {
            cameraZoom = zoomFactor*lastZoom
        }
        
        cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
        cameraZoom = Math.max( cameraZoom, MIN_ZOOM )
        
        // draw()
    }
}

canvas.addEventListener('mousedown', onPointerDown)
canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
canvas.addEventListener('mouseup', onPointerUp)
canvas.addEventListener('touchend',  (e) => handleTouch(e, onPointerUp))
canvas.addEventListener('mousemove', onPointerMove)
canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
canvas.addEventListener( 'wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))
