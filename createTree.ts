import {
  createCreateTreeInstruction,
  PROGRAM_ID as BUMBBLEGUM_PROGRAM_ID,
} from "@metaplex-foundation/mpl-bubblegum";
import { airdropOnLowBalance, loadWalletKey, sendVersionedTx } from "./utils";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
  ValidDepthSizePair,
  getConcurrentMerkleTreeAccountSize,
} from "@solana/spl-account-compression";

const KEY_PAIR_FILE = "CNFTsLH7Qr2p4sKfooQVqUqcAohXroFNcxRXci48KQTQ.json";
const RPC_URL = "https://api.devnet.solana.com";
const MERKLE_TREE_FILE = "tZP2e1LRfo1FRFBotu1zd9QnmKzmH5pxQRat6Zub7bZ.json";

async function createTree() {
  const keypair = loadWalletKey(KEY_PAIR_FILE);
  const merkleTree = loadWalletKey(MERKLE_TREE_FILE);
  const connection = new Connection(RPC_URL);

  // Airdrop
  await airdropOnLowBalance(connection, keypair);

  const [treeAuthority, _bump] = PublicKey.findProgramAddressSync(
    [merkleTree.publicKey.toBuffer()],
    BUMBBLEGUM_PROGRAM_ID
  );

  const depthSizePair: ValidDepthSizePair = {
    maxDepth: 14,
    maxBufferSize: 64,
  };

  const space = getConcurrentMerkleTreeAccountSize(
    depthSizePair.maxDepth,
    depthSizePair.maxBufferSize
  );
  const createAccountIx = SystemProgram.createAccount({
    fromPubkey: keypair.publicKey,
    newAccountPubkey: merkleTree.publicKey,
    lamports: await connection.getMinimumBalanceForRentExemption(space),
    space,
    programId: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  });

  const createTreeIx = createCreateTreeInstruction(
    {
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      logWrapper: SPL_NOOP_PROGRAM_ID,
      merkleTree: merkleTree.publicKey,
      treeAuthority,
      payer: keypair.publicKey,
      treeCreator: keypair.publicKey,
      systemProgram: SystemProgram.programId,
    },
    {
      maxDepth: depthSizePair.maxDepth,
      maxBufferSize: depthSizePair.maxBufferSize,
      public: false,
    }
  );

  const sx = await sendVersionedTx({
    connection,
    instructions: [createAccountIx, createTreeIx],
    payer: keypair,
    signers: [keypair, merkleTree],
  });
  console.log("🚀 ~ file: createTree.ts:73 ~ createTree ~ sx:", sx);
}

createTree();
