import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import {
  NetworkName,
} from "@appliedblockchain/silentdatarollup-core";
import {
  createCustomRpcServer,
  RequestData,
} from "@appliedblockchain/silentdatarollup-core/tests/utils/mocked-custom-grpc";
import { createWalletClient, type WalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { generatePrivateKey } from "viem/accounts";
import { mainnet } from "viem/chains";
import { sdt } from "../src/transport";
import type { Server } from "http";

describe("silentDataTransport", () => {
  let customRpcServer: Server;
  let getNextRequest: (method: string) => Promise<RequestData>;
  let customRpcUrl: string;
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  const NETWORK = NetworkName.TESTNET;

  beforeAll(async () => {
    ({ customRpcServer, getNextRequest, customRpcUrl } = 
      await createCustomRpcServer());
  });

  afterAll((done) => {
    customRpcServer.close(done);
  });

  test("should initialize transport", () => {
    const transport = sdt({
      rpcUrl: customRpcUrl,
      network: NETWORK,
    });

    const client = createWalletClient({
      account,
      chain: mainnet,
      transport,
    });

    expect(client).toBeDefined();
  });

  // More tests will be added here...
}); 