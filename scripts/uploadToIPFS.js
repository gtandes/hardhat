const IPFS = require('ipfs-http-client');
const fs = require('fs');
const path = require('path');

const ipfs = IPFS.create('https://ipfs.infura.io:5001');

async function uploadFile(filePath) {
  const file = fs.readFileSync(filePath);
  const result = await ipfs.add(file);
  console.log(result.path);
  return result.path;
}

(async () => {
  const filePath = path.join(__dirname, 'example.png');
  const ipfsPath = await uploadFile(filePath);
  console.log(`File uploaded to IPFS: ${ipfsPath}`);
})();
