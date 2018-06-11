const { exec } = require('child_process');

const fileName = process.argv[2] || '';
const numberOfThumbs = process.argv[3] || 0;

const createThumb = function(fileName, time, x) {
    const thumbFileName = `${fileName}_${x}.jpg`;
    const cmd = `ffmpeg -ss ${time} -i ${fileName} -vf select="eq(pict_type\\,I)" -vframes 1 ${thumbFileName}`;
    exec(cmd, (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          return;
        }

        // the *entire* stdout and stderr (buffered)
        //console.log(`stdout: ${stdout}`);
        //console.log(`stderr: ${stderr}`);
        console.log(`Created thumb ${thumbFileName}`);
    });
}

exec('ffprobe -v quiet -of json -show_format ' + fileName, (err, stdout, stderr) => {
  if (err) {
    // node couldn't execute the command
    return;
  }
  // the *entire* stdout and stderr (buffered)
  //console.log(`stdout: ${stdout}`);
  //console.log(`stderr: ${stderr}`);

  const inputStats = JSON.parse(stdout);
  const duration = Math.floor(inputStats.format.duration);
  //console.log(`Input duration is ${duration} seconds.`);
  //console.log(`Will create ${numberOfThumbs} thumbs.`);

  let time;
  for(let x = 1; x <= numberOfThumbs; x++) {
      time = parseInt( (x - 0.5) * duration / numberOfThumbs );
      //console.log('time', time);
      createThumb(fileName, time, x);
  }
});