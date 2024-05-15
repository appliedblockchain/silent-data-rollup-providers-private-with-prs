#!/bin/bash

set -e

SILENT_DATA_ROLLUP_TOKEN=$1
echo "Using the following SILENT_DATA_ROLLUP_TOKEN: $SILENT_DATA_ROLLUP_TOKEN"

if [ -z "$SILENT_DATA_ROLLUP_TOKEN" ]; then
  echo "Arguments not supplied, excute as: ./deploy_trex.sh <SILENT_DATA_ROLLUP_TOKEN>"
  exit 1
fi

rm -rf ERC-3643
git clone https://github.com/ERC-3643/ERC-3643.git

cp hardhat-sdr-t-rex/hardhat.config.ts.template hardhat-sdr-t-rex/hardhat.config.ts
sed -i "s@{token}@$SILENT_DATA_ROLLUP_TOKEN@g" hardhat-sdr-t-rex/hardhat.config.ts

cp hardhat-sdr-t-rex/deploy.js ERC-3643/deploy.js


cd hardhat-sdr
rm -rf ./dist
npm i
npm run build
npm link
cd ..

cd ./ERC-3643
rm -rf node_modules
npm i
npm i hardhat@2.22.3
npm link @nomicfoundation/hardhat-sdr


cp ../hardhat-sdr-t-rex/hardhat.config.ts hardhat.config.ts

npx hardhat run deploy.js --network sdr
echo 'Success.'