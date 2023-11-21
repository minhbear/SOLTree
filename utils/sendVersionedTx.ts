import {
  Connection,
  Keypair,
  Signer,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

export async function sendVersionedTx(params: {
  connection: Connection;
  instructions: TransactionInstruction[];
  payer: Keypair;
  signers: Signer[];
}) {
  const { connection, instructions, payer, signers } = params;

  let latestBlockhash = await connection.getLatestBlockhash();
  const messageLegacy = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions,
  }).compileToLegacyMessage();
  const transaction = new VersionedTransaction(messageLegacy);
  transaction.sign(signers);
  return await connection.sendTransaction(transaction);
}
