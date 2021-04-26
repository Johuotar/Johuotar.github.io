// Audio player script - Click anywhere on the waveform visualizer to play music from that point
var canvasWidth = 800
var audioEle = document.getElementById("audio")
var canvas = document.getElementById("progress").getContext('2d')
var control = document.getElementById('audioControl')

audioEle.addEventListener('loadedmetadata', function() {
  var duration = audioEle.duration
  var currentTime = audioEle.currentTime
  document.getElementById("duration").innerHTML = convertElapsedTime(duration)
  document.getElementById("current-time").innerHTML = convertElapsedTime(currentTime)
  canvas.fillRect(0, 0, canvasWidth, 50);
});

//Play button
function togglePlaying() {
  var play = control.innerHTML === 'Play'
  var method
  if (play) {
    control.innerHTML = 'Pause'
    method = 'play'
  } else {
    control.innerHTML = 'Play'
    method = 'pause'
  }
  audioEle[method]()
}

function updateBar() {
  var currentTime = audioEle.currentTime
  var duration = audioEle.duration
  if (currentTime === duration) {
    control.innerHTML = "Play"
  }
  document.getElementById("current-time").innerHTML = convertElapsedTime(currentTime)
  var percentage = currentTime / duration
  var progress = (canvasWidth * percentage)
  canvas.fillStyle = '#C0C0C0'
  canvas.fillRect(0, 4, canvasWidth, 5)
  canvas.fillStyle = '#bb3f3f'
  canvas.fillRect(0, 5, progress, 2.5)
}

function convertElapsedTime(inputSeconds) {
  var seconds = Math.floor(inputSeconds % 60)
  if (seconds < 10) {
    seconds = "0" + seconds
  }
  var minutes = Math.floor(inputSeconds / 60)
  return minutes + ":" + seconds
}

// Find out where user clicked on canvas progress bar
document.getElementById('progress').addEventListener('mousedown', function(e) {
  // Get the target
  const target = e.target;
  // Get the bounding rectangle of target
  const rect = target.getBoundingClientRect();
  // Get Mouse position
  const xPos = e.clientX - rect.left;
  let time = xPos / canvasWidth * audioEle.duration; // calculate time at clicked position
  audioEle.currentTime = time; // Sets the audioelements current time to the new value
});

/*
Set up AudioContext: Represents audio-processing graph, controls execution of the audio processing. Everything happens inside a context.
Chrome, Safari and Opera use the webkitAudioContext.
*/
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

//Get data from url, begin drawing it
const drawAudio = url => {
  fetch(url)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(audioBuffer => draw(filterData(audioBuffer)));
};

//Handle the AudioBuffer data. returns an array of floating point numbers
const filterData = audioBuffer => {
  const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
  const samples = 150; // Amount of the vertical lines in the progress bar.
  const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
  const filteredData = [];
  for (let i = 0; i < samples; i++) {
    let blockStart = blockSize * i; // the location of the first sample in the block
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum = sum + Math.abs(rawData[blockStart + j]); // find the sum of all the samples in the block
    }
    filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
  }
  // .map = Create new array populated with the results of calling a provided function on every element in the array
  let multiplier = 2
  return filteredData.map(n => n * multiplier);
};

// Draw the audio into the canvas.
const draw = normalizedData => {
  // set up the canvas
  const canvas = document.querySelector("canvas");
  const dpr = window.devicePixelRatio || 1;
  const padding = 0;
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = (canvas.offsetHeight + padding * 2) * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.translate(0, canvas.offsetHeight - 10 + padding); // set Y = 0 to be in the middle of the canvas

  // draw the line segments
  const width = canvas.offsetWidth / normalizedData.length;
  for (let i = 0; i < normalizedData.length; i++) {
    
    const x = width * i;
    let height = normalizedData[i] * canvas.offsetHeight - padding;
    if (height < 0) {
        height = 0;
    } else if (height > canvas.offsetHeight - 10) {
        height = height > canvas.offsetHeight - 10;
    }
    drawLineSegment(ctx, x, height);
  }
};

// ctx = canvas context, x = x coord of beginning of line, height = height of line
const drawLineSegment = (ctx, x, height) => {
  ctx.lineWidth = 2.5; // how thick the line is
  ctx.strokeStyle = "#black"; // what color our line is
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, -height*1.5);
  ctx.stroke();
};

//drawAudio('https://johuotar.github.io/audioplayer/Bassstreet.Wav');
drawAudio('https://github.com/Johuotar/Johuotar.github.io/raw/master/audioplayer/Bassstreet.wav');
