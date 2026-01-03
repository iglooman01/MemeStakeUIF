import { db } from './db';
import { airdropParticipants } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bsc } from 'viem/chains';

// BSC Mainnet Airdrop Contract (to be deployed)
const AIRDROP_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

const AIRDROP_ABI = [
  {
    inputs: [
      {
        internalType: "address[]",
        name: "users",
        type: "address[]",
      },
      {
        internalType: "address[]",
        name: "referrers",
        type: "address[]",
      },
    ],
    name: "allowAirdrop",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

interface EligibleParticipant {
  walletAddress: string;
  referredBy: string | null;
}

async function getEligibleParticipants(limit: number = 100): Promise<EligibleParticipant[]> {
  try {
    const participants = await db
      .select({
        walletAddress: airdropParticipants.walletAddress,
        referredBy: airdropParticipants.referredBy,
      })
      .from(airdropParticipants)
      .where(
        and(
          eq(airdropParticipants.emailVerified, true),
          eq(airdropParticipants.telegramGroupCompleted, true),
          eq(airdropParticipants.telegramChannelCompleted, true),
          eq(airdropParticipants.twitterCompleted, true),
          eq(airdropParticipants.youtubeCompleted, true),
          eq(airdropParticipants.exported, false)
        )
      )
      .limit(limit);

    return participants;
  } catch (error) {
    console.error('Error fetching eligible participants:', error);
    return [];
  }
}

async function getSponsorAddress(referredBy: string | null): Promise<string> {
  if (!referredBy) {
    return '0x0000000000000000000000000000000000000000'; // Zero address if no referrer
  }

  // referred_by now stores wallet addresses directly
  return referredBy;
}

async function exportBatchToSmartContract(batch: EligibleParticipant[]): Promise<boolean> {
  try {
    let privateKey = process.env.ADMIN_PRIVATE_KEY;
    
    if (!privateKey) {
      console.error('❌ ADMIN_PRIVATE_KEY not configured');
      return false;
    }

    // Ensure private key starts with 0x
    if (!privateKey.startsWith('0x')) {
      privateKey = `0x${privateKey}`;
    }

    // Prepare arrays for smart contract
    const userAddresses: `0x${string}`[] = [];
    const referrerAddresses: `0x${string}`[] = [];

    for (const participant of batch) {
      userAddresses.push(participant.walletAddress as `0x${string}`);
      
      // Get sponsor address from referral code
      const sponsorAddress = await getSponsorAddress(participant.referredBy);
      referrerAddresses.push(sponsorAddress as `0x${string}`);
    }

    console.log(`📤 Exporting ${userAddresses.length} participants to smart contract...`);
    console.log(`👥 Users array (${userAddresses.length}):`, userAddresses);
    console.log(`👤 Referrers array (${referrerAddresses.length}):`, referrerAddresses);

    // Create wallet client
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    console.log(`📝 Admin wallet address (from ADMIN_PRIVATE_KEY): ${account.address}`);
    const walletClient = createWalletClient({
      account,
      chain: bsc,
      transport: http('https://bsc-dataseed.binance.org/'),
    });

    // Create public client for gas estimation
    const publicClient = createPublicClient({
      chain: bsc,
      transport: http('https://bsc-dataseed.binance.org/'),
    });

    // Estimate gas first
    try {
      const gasEstimate = await publicClient.estimateContractGas({
        address: AIRDROP_CONTRACT_ADDRESS as `0x${string}`,
        abi: AIRDROP_ABI,
        functionName: 'allowAirdrop',
        args: [userAddresses, referrerAddresses],
        account: account.address,
      });
      console.log(`⛽ Estimated gas: ${gasEstimate}`);
    } catch (gasError: any) {
      console.error('❌ Gas estimation failed:', gasError.message);
      // Continue anyway, might still work
    }

    // Execute allowAirdrop transaction with explicit gas
    const hash = await walletClient.writeContract({
      address: AIRDROP_CONTRACT_ADDRESS as `0x${string}`,
      abi: AIRDROP_ABI,
      functionName: 'allowAirdrop',
      args: [userAddresses, referrerAddresses],
      gas: BigInt(500000), // Set explicit gas limit
    });

    console.log(`⏳ Transaction submitted: ${hash}`);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === 'success') {
      console.log(`✅ Transaction confirmed: ${hash}`);
      return true;
    } else {
      console.error(`❌ Transaction failed: ${hash}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error exporting batch to smart contract:', error);
    return false;
  }
}

async function markParticipantsAsExported(walletAddresses: string[]): Promise<void> {
  try {
    for (const walletAddress of walletAddresses) {
      await db
        .update(airdropParticipants)
        .set({ exported: true })
        .where(eq(airdropParticipants.walletAddress, walletAddress));
    }
    console.log(`✅ Marked ${walletAddresses.length} participants as exported`);
  } catch (error) {
    console.error('Error marking participants as exported:', error);
  }
}

export async function runAirdropExportScheduler(): Promise<void> {
  console.log('🔄 Starting airdrop export scheduler...');

  try {
    // Get eligible participants in batches of 100
    const participants = await getEligibleParticipants(100);

    if (participants.length === 0) {
      console.log('✅ No participants to export');
      return;
    }

    console.log(`📊 Found ${participants.length} eligible participants`);

    // Export to smart contract
    const success = await exportBatchToSmartContract(participants);

    if (success) {
      // Mark as exported in database
      const walletAddresses = participants.map(p => p.walletAddress);
      await markParticipantsAsExported(walletAddresses);
      console.log(`🎉 Successfully exported ${participants.length} participants`);
    } else {
      console.log('⚠️ Export failed, will retry in next cycle');
    }
  } catch (error) {
    console.error('❌ Scheduler error:', error);
  }
}

// Run scheduler every 30 seconds
export function startAirdropExportScheduler(): void {
  console.log('🚀 Airdrop export scheduler started (runs every 30 seconds)');
  
  // Run immediately on start
  runAirdropExportScheduler();
  
  // Then run every 30 seconds
  setInterval(runAirdropExportScheduler, 30 * 1000);
}
