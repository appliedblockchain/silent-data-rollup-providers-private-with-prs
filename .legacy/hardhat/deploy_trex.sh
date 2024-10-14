set -e

SILENT_DATA_ROLLUP_TOKEN=$1
echo "Using the following SILENT_DATA_ROLLUP_TOKEN: $SILENT_DATA_ROLLUP_TOKEN"

if [ -z "$SILENT_DATA_ROLLUP_TOKEN" ]; then
  echo "Arguments not supplied, execute as: ./deploy_trex.sh <SILENT_DATA_ROLLUP_TOKEN>"
  exit 1
fi

cd solidity

npm install
npm run build
npm link
cd ..

cd ERC-3643

npm uninstall @onchain-id/solidity
npm install js-sha3
npm install

cd ..
cp hardhat-sdr-t-rex/hardhat.config.ts.template hardhat-sdr-t-rex/hardhat.config.ts

# Handle sed compatibility between macOS and Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s@{token}@$SILENT_DATA_ROLLUP_TOKEN@g" hardhat-sdr-t-rex/hardhat.config.ts
else
  sed -i "s@{token}@$SILENT_DATA_ROLLUP_TOKEN@g" hardhat-sdr-t-rex/hardhat.config.ts
fi

cp hardhat-sdr-t-rex/deploy.js ERC-3643/deploy.js

cd hardhat-sdr
rm -rf ./dist
npm install
npm run build
npm link
cd ..

cd ERC-3643
npm install hardhat@2.22.3

cp ../hardhat-sdr-t-rex/hardhat.config.ts hardhat.config.ts
echo '<<<Deploying to the SDR network...'
npm link @onchain-id/solidity @nomicfoundation/hardhat-sdr

npx hardhat run deploy.js --network sdr
echo 'Success.'
