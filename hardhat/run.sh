#!/bin/bash

set -e

ACCOUNT_PRIVATE_KEY=$1
SILENT_DATA_ROLLUP_TOKEN=$2
echo "Using the following ACCOUNT_PRIVATE_KEY: $ACCOUNT_PRIVATE_KEY"
echo "Using the following SILENT_DATA_ROLLUP_TOKEN: $SILENT_DATA_ROLLUP_TOKEN"

if [ -z "$ACCOUNT_PRIVATE_KEY" ] || [ -z "$SILENT_DATA_ROLLUP_TOKEN" ]; then
  echo "Arguments not supplied, excute as: ./run.sh <ACCOUNT_PRIVATE_KEY> <SILENT_DATA_ROLLUP_TOKEN>"
  exit 1
fi

cd hardhat-sdr
rm -rf ./dist
npm i
npm run build
npm link
cd ..

cd hardhat-sdr-usage
npm i
npm link @nomicfoundation/hardhat-sdr
cp hardhat.config.template.js hardhat.config.js
sed -i "s@{token}@$SILENT_DATA_ROLLUP_TOKEN@g" ./hardhat.config.js
sed -i "s@{any_ethereum_wallet_private_key}@$ACCOUNT_PRIVATE_KEY@g" ./hardhat.config.js

npx hardhat compile
npx hardhat run scripts/deploy.js --network sdr
cd ..

echo 'Success.'
