const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

var scanningAllowed = false;
var style = 1;
var pastEmotions = new Array();
var historyX = 0;
var historyY = 0;

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  // variables for the painting and lines
  var counterUntilThirtyEmotions = 0;
  var xCoordinateImg = -60;
  var yCoordinateImg = 0;
  var xCoordinateLine = 0;
  var yCoordinateLine = 58;
  var c = document.getElementById("myCanvas");
  var ctx = c.getContext("2d");
  var emotionsCounter = [0,0,0,0,0,0,0];
  ctx.beginPath();
  ctx.strokeStyle = "white";
  ctx.rect(0, 0, 900, 600);
  ctx.fillStyle = "white";
  ctx.fill();
  var c2 = document.getElementById("historyCanvas");
  var ctx2 = c2.getContext("2d");
  var emotionsCounter = [0,0,0,0,0,0,0];
  ctx2.beginPath();
  ctx2.strokeStyle = "white";
  ctx2.rect(0, 0, 150, 600);
  ctx2.fillStyle = "white";
  ctx2.fill();
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    // reading the detection
    var biggestName = 0;
    var biggest = 0;
    if(detections.length != 0 && scanningAllowed){
      var color = '#000000';
      if(detections[0].expressions.angry > biggest){
        biggest = detections[0].expressions.angry;
        biggestName = 0;
        color = '#e41871';
      }
      if(detections[0].expressions.disgusted > biggest){
        biggest = detections[0].expressions.disgusted;
        biggestName = 1;
        color = '#7d67a5';
      }
      if(detections[0].expressions.fearful > biggest){
        biggest = detections[0].expressions.fearful;
        biggestName = 2;
        color = '#850f63';
      }
      if(detections[0].expressions.happy > biggest){
        biggest = detections[0].expressions.happy;
        biggestName = 3;
        color = '#e56178';
      }
      if(detections[0].expressions.neutral > biggest){
        biggest = detections[0].expressions.neutral;
        biggestName = 4;
        color = '#5fb68b';
      }
      if(detections[0].expressions.sad > biggest){
        biggest = detections[0].expressions.sad;
        biggestName = 5;
        color = '#15ad7c';
      }
      if(detections[0].expressions.surprised > biggest){
        biggest = detections[0].expressions.surprised;
        biggestName = 6;
        color = '#1d8b9a';
      }
      emotionsCounter[biggestName]++;
      //draw line
      ctx.beginPath();
      ctx.moveTo(xCoordinateLine, yCoordinateLine);
      ctx.lineTo(xCoordinateLine + 3, yCoordinateLine);
      ctx.lineWidth = 4;
      ctx.strokeStyle = color;
      ctx.stroke();
      xCoordinateLine += 3;
      counterUntilThirtyEmotions++;
      // drawing comes in here
      if(counterUntilThirtyEmotions == 20) {
        var mostUsedEmotion = 0;
        var whichPicture = 0;
        for (var i = 0; i < 7; i++){
          if(mostUsedEmotion < emotionsCounter[i]){
            mostUsedEmotion = emotionsCounter[i];
            whichPicture = i;
          }
        }
        pastEmotions.push(whichPicture);
        console.log(pastEmotions);
        // choosing image
        var img = new Image();
        img.src = pictureName(whichPicture, style);
        // printing it
        img.onload = function(){
          ctx.drawImage(img, xCoordinateImg, yCoordinateImg, 60, 56);
        }
        counterUntilThirtyEmotions = 0;
        xCoordinateImg += 60;
        emotionsCounter = [0,0,0,0,0,0,0];
        if(xCoordinateImg == 900) {
          xCoordinateImg = 0;
          yCoordinateImg += 60;
        }
      }
      if(xCoordinateLine == 900) {
        xCoordinateLine = 0;
        yCoordinateLine += 60;
      }
      console.log(xCoordinateLine);
      console.log(yCoordinateLine);
      if(yCoordinateLine > 600){
        saveCanvas();
        // set the canvas to white again
        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.rect(0, 0, 900, 600);
        ctx.fillStyle = "white";
        ctx.fill();
        // restart past emotions, x and y for img and line.
        pastEmotions = new Array();
        xCoordinateImg = -60;
        yCoordinateImg = 0;
        xCoordinateLine = 0;
        yCoordinateLine = 58;
      }
    }

    // this is what we see on the camera as soon as the reading starts
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 300)
})

document.getElementById("playButton").addEventListener("click", function(){ scanningAllowed = true });
document.getElementById("stopButton").addEventListener("click", function(){ scanningAllowed = false });

document.getElementById("downloadButton").addEventListener("click", function(){ 
  saveCanvas();
});

document.getElementById("style1").addEventListener("click", function(){ 
  if(style != 1){
    style = 1
    var x = 0;
    var y = 0;
    console.log(pastEmotions.length);
    for(var i = 0; i < pastEmotions.length; i++){// choosing image
      placePicture(x, y, i);
      x += 60;
      if(x == 900) {
        x = 0;
        y += 60;
      }
    }
  }
});
document.getElementById("style2").addEventListener("click", function(){
  if(style != 2){
    style = 2
    var x = 0;
    var y = 0;
    console.log(pastEmotions.length);
    for(var i = 0; i < pastEmotions.length; i++){// choosing image
      placePicture(x, y, i);
      x += 60;
      if(x == 900) {
        x = 0;
        y += 60;
      }
    }
  }
});
document.getElementById("style3").addEventListener("click", function(){
  if(style != 3){
    style = 3
    var x = 0;
    var y = 0;
    console.log(pastEmotions.length);
    for(var i = 0; i < pastEmotions.length; i++){// choosing image
      placePicture(x, y, i);
      x += 60;
      if(x == 900) {
        x = 0;
        y += 60;
      }
    }
  }
});

function saveCanvas(){
  var canvas = document.getElementById("myCanvas");
  var image = canvas.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream");
  var link = document.createElement('a');
  link.download = "Emotions-img.png";
  link.href = image;
  link.click();
  // place it in history pannel
  var cn = document.getElementById("historyCanvas");
  var ctx2 = cn.getContext("2d");
  ctx2.drawImage(canvas, historyX, historyY, 150, 100);
  historyY += 100;
  if(historyY == 600) historyY = 0;
  if(history != 500){
    ctx.beginPath();
    ctx.moveTo(0, historyY-1);
    ctx.lineTo(100, historyY-1);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#51b581";
    ctx.stroke();
  }
}

function placePicture(x, y, i){
  var c = document.getElementById("myCanvas");
  var ctx = c.getContext("2d");
  var img = new Image();
  console.log(pictureName(pastEmotions[i], style));
  img.src = pictureName(pastEmotions[i], style);
  // printing it
  console.log(x);
  img.onload = function(){
    ctx.drawImage(img, x, y, 60, 56);
  }
}

function pictureName(whichPicture, whichStyle){
  if(whichStyle == 1){
    if (whichPicture == 0) return '1_angry.jpg';
    else if (whichPicture == 1) return '1_disgusted.jpg';
    else if (whichPicture == 2) return '1_fearful.jpg';
    else if (whichPicture == 3) return '1_happy.jpg';
    else if (whichPicture == 4) return '1_neutral.jpg';
    else if (whichPicture == 5) return '1_sad.jpg';
    else if (whichPicture == 6) return '1_surprised.jpg';
  }
  else if(whichStyle == 2){
    if (whichPicture == 0) return '2_angry.jpg';
    else if (whichPicture == 1) return '2_disgusted.jpg';
    else if (whichPicture == 2) return '2_fearful.jpg';
    else if (whichPicture == 3) return '2_happy.jpg';
    else if (whichPicture == 4) return '2_neutral.jpg';
    else if (whichPicture == 5) return '2_sad.jpg';
    else if (whichPicture == 6) return '2_surprised.jpg';
  }
  else if(whichStyle == 3){
    if (whichPicture == 0) return '3_angry.jpg';
    else if (whichPicture == 1) return '3_disgusted.jpg';
    else if (whichPicture == 2) return '3_fearful.jpg';
    else if (whichPicture == 3) return '3_happy.jpg';
    else if (whichPicture == 4) return '3_neutral.jpg';
    else if (whichPicture == 5) return '3_sad.jpg';
    else if (whichPicture == 6) return '3_surprised.jpg';
  }
}