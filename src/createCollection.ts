import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createAccount,
  createMint,
  mintTo,
} from "@solana/spl-token";
import {
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV3Instruction,
  createSetCollectionSizeInstruction,
} from "@metaplex-foundation/mpl-token-metadata";
import { loadWalletKey } from "../utils";
import { COLLECTION_FILE, KEY_PAIR_FILE, RPC_URL } from "./constant";

// creates a metaplex collection NFT
export const initCollection = async (
  connection: Connection,
  payer: Keypair
) => {
  const cmintKey = loadWalletKey(COLLECTION_FILE);
  const collectionMint = await createMint(
    connection,
    payer,
    payer.publicKey,
    payer.publicKey,
    0,
    cmintKey,
    { commitment: "finalized" },
    TOKEN_PROGRAM_ID
  );
  const collectionTokenAccount = await createAccount(
    connection,
    payer,
    collectionMint,
    payer.publicKey,
    undefined,
    { commitment: "finalized" },
    TOKEN_PROGRAM_ID
  );
  await mintTo(
    connection,
    payer,
    collectionMint,
    collectionTokenAccount,
    payer,
    1,
    [],
    { commitment: "finalized" }
  );

  const [collectionMetadataAccount, _b] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata", "utf8"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      collectionMint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  const collectionMetadataIx = createCreateMetadataAccountV3Instruction(
    {
      metadata: collectionMetadataAccount,
      mint: collectionMint,
      mintAuthority: payer.publicKey,
      payer: payer.publicKey,
      updateAuthority: payer.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        data: {
          name: "cNFT Collection by Minh bear",
          symbol: "CNFT-Bear",
          uri: "https://plqckbvyltonicpfb6ucm47v2l5rafru2xwe6quaozofm3y4uifa.arweave.net/euAlBrhc3NQJ5Q-oJnP10vsQFjTV7E9CgHZcVm8cogo/",
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        },
        isMutable: true,
        collectionDetails: null,
      },
    },
    TOKEN_METADATA_PROGRAM_ID
  );

  const [collectionMasterEditionAccount, _b2] =
    PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata", "utf8"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        collectionMint.toBuffer(),
        Buffer.from("edition", "utf8"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

  const collectionMasterEditionIX = createCreateMasterEditionV3Instruction(
    {
      edition: collectionMasterEditionAccount,
      mint: collectionMint,
      mintAuthority: payer.publicKey,
      payer: payer.publicKey,
      updateAuthority: payer.publicKey,
      metadata: collectionMetadataAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
    {
      createMasterEditionArgs: {
        maxSupply: 0,
      },
    },
    TOKEN_METADATA_PROGRAM_ID
  );

  const sizeCollectionIX = createSetCollectionSizeInstruction(
    {
      collectionMetadata: collectionMetadataAccount,
      collectionAuthority: payer.publicKey,
      collectionMint: collectionMint,
    },
    {
      setCollectionSizeArgs: { size: 10000 },
    },
    TOKEN_METADATA_PROGRAM_ID
  );

  let tx = new Transaction()
    .add(collectionMetadataIx)
    .add(collectionMasterEditionIX)
    .add(sizeCollectionIX);

  try {
    await sendAndConfirmTransaction(connection, tx, [payer], {
      commitment: "confirmed",
    });
    console.log(
      "Successfull created NFT collection with collection address: " +
        collectionMint.toBase58()
    );
    return {
      collectionMint,
      collectionMetadataAccount,
      collectionMasterEditionAccount,
    };
  } catch (e) {
    console.error("Failed to init collection: ", e);
    throw e;
  }
};

async function main() {
  const keypair = loadWalletKey(KEY_PAIR_FILE)
  const connection = new Connection(RPC_URL)

  await initCollection(connection, keypair)
}

main()
