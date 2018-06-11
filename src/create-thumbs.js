const { exec } = require('child_process');
const path = require('path');

const fileName = process.argv[2] || '';
const numberOfThumbs = process.argv[3] || 0;

const pad = function (num, size) {
  var s = "00" + num;
  return s.substr(s.length - size);
}

const createThumb = function(fileName, time, x) {
    const thumbFileName = `${fileName}_${pad(x, 2)}.jpg`;
    const cmd = `ffmpeg -ss ${time} -i ${fileName} -vf select="eq(pict_type\\,I)" -vframes 1 ${thumbFileName}`;
    exec(cmd, (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          throw err;
          return;
        }
        console.log(`Created thumb ${thumbFileName}`);
    });
}

exec('ffprobe -v quiet -of json -show_format ' + fileName, (err, stdout, stderr) => {
  if (err) {
    // node couldn't execute the command
    throw err;
    return;
  }

  const inputStats = JSON.parse(stdout);
  const duration = Math.floor(inputStats.format.duration);

  let time;
  for(let x = 1; x <= numberOfThumbs; x++) {
      time = parseInt( (x - 0.5) * duration / numberOfThumbs );
      createThumb(fileName, time, x);
  }
});