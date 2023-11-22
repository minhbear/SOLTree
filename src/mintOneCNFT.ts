import { PROGRAM_ID as BUMBBLEGUM_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum";
import { Connection, PublicKey } from "@solana/web3.js";
import { airdropOnLowBalance, loadWalletKey } from "../utils";
import { KEY_PAIR_FILE, MERKLE_TREE_FILE, RPC_URL } from "./constant";

async function mintOneCNFT() {
  const keypair = loadWalletKey(KEY_PAIR_FILE);
  const merkleTree = loadWalletKey(MERKLE_TREE_FILE);
  const connection = new Connection(RPC_URL);

  // Airdrop
  await airdropOnLowBalance(connection, keypair);

  const [treeAuthority, _bump] = PublicKey.findProgramAddressSync(
    [merkleTree.publicKey.toBuffer()],
    BUMBBLEGUM_PROGRAM_ID
  );

}
