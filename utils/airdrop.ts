import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

export async function airdropOnLowBalance(
  connection: Connection,
  keypair: Keypair,
  forceAirdrop: boolean = false
): Promise<number> {
  // get the current balance
  let balance = await connection.getBalance(keypair.publicKey);
  console.log(`Current balance: ${balance}`);

  // define the low balance threshold before airdrop
  const MIN_BALANCE_TO_AIRDROP = LAMPORTS_PER_SOL / 2; // current: 0.5 SOL

  // check the balance of the two account, airdrop when low
  if (forceAirdrop === true || balance < MIN_BALANCE_TO_AIRDROP) {
    console.log(
      `Requestiong airdrop of 1 SOL to ${keypair.publicKey.toBase58()}...`
    );
    const sig = await connection.requestAirdrop(
      keypair.publicKey,
      LAMPORTS_PER_SOL
    );
    console.log(`Tx signature: ${sig}`);

    // fetch the new balance
    const newBalance = await connection.getBalance(keypair.publicKey);
    console.log(`New Balance: ${newBalance}`);
  } else {
    console.log(`Balance of: ${balance / LAMPORTS_PER_SOL} SOL`);
  }

  return balance;
}
