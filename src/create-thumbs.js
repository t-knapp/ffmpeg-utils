const { exec } = require('child_process');
const path = require('path');
var fs = require('fs');

const fileName = process.argv[2] || '';
const numberOfThumbs = process.argv[3] || 0;

const pad = function (num, size) {
  var s = "00" + num;
  return s.substr(s.length - size);
}

/*
 * @See: https://superuser.com/a/821680
 * @See: https://stackoverflow.com/a/14551281
 */
const createThumb = function(fileName, time, x) {
  return new Promise((resolve, reject) => {
    const thumbFileName = `${fileName}_${pad(x, 2)}.jpg`;
    const cmd = `ffmpeg -ss ${time} -i ${fileName} -vf select="eq(pict_type\\,I)" -vframes 1 ${thumbFileName}`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        // node couldn't execute the command
        reject(err);
      }
      resolve({thumbFilePath: thumbFileName});
    });
  });
}

const buildInfoObject = function(ffprobeStats, thumbnails) {
  const info = {
    videoFileName: path.basename(ffprobeStats.format.filename),
    size: parseInt(ffprobeStats.format.size),
    duration: Math.floor(ffprobeStats.format.duration),
    thumbnails: thumbnails.map((thumb) => {
      return path.basename(thumb.thumbFilePath);
    })
  }
  return info;
}

exec('ffprobe -v quiet -of json -show_format ' + fileName, (err, stdout, stderr) => {
  if (err) {
    // node couldn't execute the command
    throw err;
    return;
  }

  const inputStats = JSON.parse(stdout);
  const duration = Math.floor(inputStats.format.duration);

  const promises = [];
  let time;
  for(let x = 1; x <= numberOfThumbs; x++) {
      time = parseInt( (x - 0.5) * duration / numberOfThumbs );
      promises.push(createThumb(fileName, time, x));
  }

  Promise.all(promises).then((results) => {
    const infoObject = buildInfoObject(inputStats, results);
    fs.writeFile(fileName + '.stats.json', JSON.stringify(infoObject), 'utf8', (err) => {
      if(err)
        throw err;
      else
        console.log(`Done. ${fileName}.stats.json`);
    });
  });
});
