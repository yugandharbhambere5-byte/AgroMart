const https = require('https');
const fs = require('fs');
const path = require('path');

const videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-drone-shot-of-a-combine-harvester-in-a-wheat-field-34220-large.mp4';
const outputPath = path.join(__dirname, 'public', 'videos', 'agromart-hero-vegetarian.mp4');

// Ensure directory exists
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

console.log('Downloading video from:', videoUrl);
console.log('Saving to:', outputPath);

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://mixkit.co/',
    'Accept': 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5',
    'Accept-Language': 'en-US,en;q=0.9'
  }
};

const file = fs.createWriteStream(outputPath);

https.get(videoUrl, options, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to download: Status Code ${response.statusCode}`);
    response.resume();
    return;
  }

  response.pipe(file);

  file.on('finish', () => {
    file.close();
    console.log('Download complete successfully!');
  });
}).on('error', (err) => {
  fs.unlink(outputPath, () => {}); // Delete the file on error
  console.error('Error during download:', err.message);
});
