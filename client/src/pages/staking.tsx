import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import memeStakeLogo from "@assets/ChatGPT Image Oct 9, 2025, 11_08_34 AM_1759988345567.png";
import { createPublicClient, http } from 'viem';
import { bscTestnet } from 'viem/chains';
import { CONTRACTS } from '@/config/contracts';
import { apiRequest } from '@/lib/queryClient';

export default function Staking() {
  const [location, setLocation] = useLocation();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [unstakeAmount, setUnstakeAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');
  const [tokenBalance, setTokenBalance] = useState(1250000);
  const [stakedAmount, setStakedAmount] = useState(100000);
  const [stakingStartDate] = useState(new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)); // 25 days ago
  const [rewardsToday, setRewardsToday] = useState(1000);
  const [accruedToday, setAccruedToday] = useState(0);
  const [claimableRewards, setClaimableRewards] = useState(25000);
  const [lifetimeEarned, setLifetimeEarned] = useState(28475);
  const [isApproved, setIsApproved] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState('0.0012');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [activeStakes, setActiveStakes] = useState<any[]>([]);
  const { toast } = useToast();

  const APY = 365;
  const DAILY_RATE = 1;
  const PENALTY_FREE_DAYS = 90;
  const PENALTY_PERCENTAGE = 20;

  // Verify wallet connection using sessionStorage
  useEffect(() => {
    const verifyAndCheckNetwork = async () => {
      const activeSession = sessionStorage.getItem('walletSession');
      const storedAddress = localStorage.getItem('walletAddress');
      
      if (activeSession === 'active' && storedAddress) {
        // Active session exists - restore wallet
        setWalletAddress(storedAddress);
        
        // Check network
        if (window.ethereum) {
          try {
            const BSC_TESTNET_CHAIN_ID = '0x61';
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            
            if (chainId !== BSC_TESTNET_CHAIN_ID) {
              toast({
                title: "⚠️ Wrong Network",
                description: "Please switch to BSC Testnet to use staking",
                variant: "destructive"
              });
            }
          } catch (error) {
            console.error('Network check error:', error);
          }
        }
      } else {
        // No active session - clear and redirect to home
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('walletType');
        sessionStorage.removeItem('walletSession');
        toast({
          title: "🔒 Session Expired",
          description: "Please connect your wallet to continue",
        });
        setLocation('/');
      }
    };

    verifyAndCheckNetwork();
  }, []);

  // Listen for wallet account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected wallet - redirect to home
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('walletType');
        toast({
          title: "👋 Wallet Disconnected",
          description: "You have been disconnected from your wallet",
        });
        setTimeout(() => {
          setLocation('/');
        }, 1000);
      } else if (accounts[0] !== walletAddress) {
        // User switched to a different account
        const newAddress = accounts[0];
        setWalletAddress(newAddress);
        localStorage.setItem('walletAddress', newAddress);
        
        toast({
          title: "🔄 Wallet Changed",
          description: `Switched to ${newAddress.slice(0, 6)}...${newAddress.slice(-4)}`,
        });
        
        // Refresh all data for new wallet
        fetchStakingData();
      }
    };

    const handleChainChanged = () => {
      // Reload the page when chain changes
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [walletAddress]);

  // Fetch real blockchain data
  const fetchStakingData = async () => {
    if (!walletAddress) return;

    try {
      setIsLoadingData(true);

      const publicClient = createPublicClient({
        chain: bscTestnet,
        transport: http('https://data-seed-prebsc-1-s1.binance.org:8545/')
      });

      // 1. Fetch staked amount using getActiveStakesWithId to access lastClaim
      try {
        console.log('Fetching stakes for:', walletAddress);
        const activeStakes = await publicClient.readContract({
          address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
          abi: CONTRACTS.MEMES_STAKE.abi,
          functionName: 'getActiveStakesWithId',
          args: [walletAddress as `0x${string}`]
        }) as any[];

        console.log('Active stakes response:', activeStakes);

        // Loop through array and sum up all active staked amounts
        let totalStaked = 0;
        for (const stake of activeStakes) {
          // Access amount from details object and check if active
          if (stake.details && stake.details.isActive) {
            totalStaked += Number(stake.details.amount) / 1e18;
          }
        }
        
        console.log('Total staked amount:', totalStaked);
        setStakedAmount(totalStaked);

        // Calculate Accrued Today: 1% of active stakes whose lastClaim is < 24 hours
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        
        let todayAccrued = 0;
        
        for (const stake of activeStakes) {
          if (stake.details && stake.details.isActive) {
            const lastClaimTime = Number(stake.details.lastClaimTime);
            // If lastClaim is within the last 24 hours
            if (lastClaimTime + (24 * 60 * 60) <= currentTime) {
              todayAccrued += (Number(stake.details.amount) / 1e18) * 0.01; // 1% of stake
            }
          }
        }
        
        console.log('Accrued today:', todayAccrued);
        setAccruedToday(todayAccrued);
      } catch (error) {
        console.error('Error fetching staked amount:', error);
        setStakedAmount(0);
        setAccruedToday(0);
      }

      // 2. Fetch user's MEMES token balance
      try {
        const balance = await publicClient.readContract({
          address: CONTRACTS.MEMES_TOKEN.address as `0x${string}`,
          abi: CONTRACTS.MEMES_TOKEN.abi,
          functionName: 'balanceOf',
          args: [walletAddress as `0x${string}`]
        }) as bigint;

        setTokenBalance(Number(balance) / 1e18);
      } catch (error) {
        console.error('Error fetching token balance:', error);
        setTokenBalance(0);
      }

      // 3. Fetch claimable rewards (totalRewardsByreferral + getPendingRewards)
      try {
        const [referralRewards, pendingRewards] = await Promise.all([
          publicClient.readContract({
            address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
            abi: CONTRACTS.MEMES_STAKE.abi,
            functionName: 'getTotalRewardsByReferralLevel',
            args: [walletAddress as `0x${string}`]
          }) as Promise<any>,
          publicClient.readContract({
            address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
            abi: CONTRACTS.MEMES_STAKE.abi,
            functionName: 'getPendingRewards',
            args: [walletAddress as `0x${string}`]
          }) as Promise<bigint>
        ]);

        // getTotalRewardsByReferralLevel returns an array: [totalRewardsByreferral, level1Total, level2Total, level3Total]
        const totalReferralRewards = Number(referralRewards[0] || 0) / 1e18;
        const totalPendingRewards = Number(pendingRewards) / 1e18;
        const totalClaimable = totalReferralRewards + totalPendingRewards;

        console.log('Referral rewards:', totalReferralRewards);
        console.log('Pending rewards:', totalPendingRewards);
        console.log('Total claimable:', totalClaimable);

        setClaimableRewards(totalClaimable);
      } catch (error) {
        console.error('Error fetching claimable rewards:', error);
        setClaimableRewards(0);
      }

      // 5. Fetch active stakes using getActiveStakesWithId
      try {
        const activeStakesData = await publicClient.readContract({
          address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
          abi: CONTRACTS.MEMES_STAKE.abi,
          functionName: 'getActiveStakesWithId',
          args: [walletAddress as `0x${string}`]
        }) as any[];

        setActiveStakes(activeStakesData);
      } catch (error) {
        console.error('Error fetching active stakes:', error);
        setActiveStakes([]);
      }

    } catch (error) {
      console.error('Error fetching staking data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchStakingData();
    }
  }, [walletAddress]);

  const getDaysStaked = () => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - stakingStartDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPenaltyInfo = (daysStaked: number) => {
    if (daysStaked >= PENALTY_FREE_DAYS) {
      return { hasPenalty: false, text: '✅ No Penalty', color: '#00ff88' };
    } else {
      return { hasPenalty: true, text: `⚠️ ${PENALTY_PERCENTAGE}% Penalty`, color: '#ffa500' };
    }
  };

  const handleWithdrawCapital = async (stakeId: number) => {
    if (!walletAddress) {
      toast({
        title: "❌ Wallet Not Connected",
        description: "Please connect your wallet to unstake",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUnstaking(true);

      // Check if ethereum provider is available
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask or compatible wallet not found');
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      // Prepare the withdrawCapital contract call
      const stakeIdHex = stakeId.toString(16).padStart(64, '0');
      const withdrawData = '0xd95b0a12' + stakeIdHex; // withdrawCapital(uint256) function signature

      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: accounts[0],
          to: CONTRACTS.MEMES_STAKE.address,
          data: withdrawData,
        }],
      });

      toast({
        title: "⏳ Transaction Submitted",
        description: "Withdrawing your capital...",
      });

      // Get stake amount from activeStakes
      const stake = activeStakes.find(s => Number(s.id) === stakeId);
      const stakeAmountValue = stake ? (Number(stake.details.amount) / 1e18).toString() : '0';

      // Save transaction to database
      try {
        console.log('Attempting to save capital withdraw transaction:', {
          walletAddress,
          transactionType: 'Capital Withdraw',
          amount: stakeAmountValue,
          tokenSymbol: 'MEMES',
          transactionHash: txHash
        });
        
        const response = await apiRequest('POST', '/api/transactions', {
          walletAddress: walletAddress,
          transactionType: 'Capital Withdraw',
          amount: stakeAmountValue,
          tokenSymbol: 'MEMES',
          transactionHash: txHash,
          status: 'pending'
        });
        const savedTransaction = await response.json();
        console.log('✅ Capital withdraw transaction saved to database:', savedTransaction);
      } catch (dbError) {
        console.error('❌ Error saving capital withdraw transaction:', dbError);
        toast({
          title: "⚠️ Database Save Failed",
          description: "Capital withdrawn but failed to save to history",
          variant: "destructive"
        });
      }

      // Wait for transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update transaction status to confirmed
      try {
        await apiRequest('PUT', `/api/transactions/${txHash}/status`, {
          status: 'confirmed'
        });
      } catch (dbError) {
        console.error('Error updating transaction status:', dbError);
      }

      // Refresh data after withdrawal
      await fetchStakingData();

      // Trigger dashboard refresh
      localStorage.setItem('dashboardRefresh', Date.now().toString());

      setIsUnstaking(false);
      
      toast({
        title: "🎉 Withdrawal Successful!",
        description: `Successfully withdrew capital! TX: ${txHash.slice(0, 10)}...`,
      });
    } catch (error: any) {
      console.error('Error withdrawing capital:', error);
      setIsUnstaking(false);
      
      toast({
        title: "❌ Withdrawal Failed",
        description: error.message || "Failed to withdraw capital. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsApproved(true);
      setIsProcessing(false);
      toast({
        title: "✅ Approved!",
        description: "Smart contract approved successfully. You can now stake your tokens.",
      });
    }, 2000);
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: "❌ Invalid Amount",
        description: "Please enter a valid staking amount",
        variant: "destructive"
      });
      return;
    }

    // Minimum stake: $50 worth of MEMES tokens (500,000 MEMES at $0.0001 per token)
    const MINIMUM_STAKE = 500000;
    if (parseFloat(stakeAmount) < MINIMUM_STAKE) {
      toast({
        title: "❌ Minimum Stake Required",
        description: `Minimum stake is ${MINIMUM_STAKE.toLocaleString()} $MEMES tokens ($50 worth)`,
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(stakeAmount) > tokenBalance) {
      toast({
        title: "❌ Insufficient Balance",
        description: "You don't have enough tokens to stake",
        variant: "destructive"
      });
      return;
    }

    if (!walletAddress) {
      toast({
        title: "❌ Wallet Not Connected",
        description: "Please connect your wallet to stake",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);

      // Check if ethereum provider is available
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask or compatible wallet not found');
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      // Convert amount to Wei properly (multiply by 10^18)
      const amountInWei = (BigInt(Math.floor(parseFloat(stakeAmount))) * BigInt('1000000000000000000')).toString(16);
      
      // Step 1: Check current allowance
      const allowanceData = '0xdd62ed3e' + // allowance(address,address) function signature
        accounts[0].slice(2).padStart(64, '0') + // owner address
        CONTRACTS.MEMES_STAKE.address.slice(2).padStart(64, '0'); // spender address

      const allowanceResult = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: CONTRACTS.MEMES_TOKEN.address,
          data: allowanceData
        }, 'latest']
      });

      const currentAllowance = BigInt(allowanceResult);
      const requiredAmount = BigInt(Math.floor(parseFloat(stakeAmount))) * BigInt('1000000000000000000');

      // Step 2: If allowance is insufficient, approve first
      if (currentAllowance < requiredAmount) {
        toast({
          title: "⏳ Approval Required",
          description: "Please approve the staking contract to spend your tokens",
        });

        // Approve with uint256 max for future transactions
        const approvalData = '0x095ea7b3' + // approve(address,uint256) function signature
          CONTRACTS.MEMES_STAKE.address.slice(2).padStart(64, '0') + // spender
          'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'; // max uint256

        const approveTxHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: accounts[0],
            to: CONTRACTS.MEMES_TOKEN.address,
            data: approvalData,
          }],
        });

        toast({
          title: "✅ Approval Submitted",
          description: "Waiting for approval confirmation...",
        });

        // Wait for approval confirmation
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // Step 3: Execute stake function
      const stakeData = '0xa694fc3a' + // stake(uint256) function signature
        amountInWei.padStart(64, '0'); // amount

      // Estimate gas first to catch errors early
      try {
        await window.ethereum.request({
          method: 'eth_estimateGas',
          params: [{
            from: accounts[0],
            to: CONTRACTS.MEMES_STAKE.address,
            data: stakeData,
          }]
        });
      } catch (gasError: any) {
        console.error('Gas estimation failed:', gasError);
        throw new Error(`Transaction would fail: ${gasError.message || 'Unknown error'}. Please check if the staking contract is active and you have sufficient balance.`);
      }

      const stakeTxHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: accounts[0],
          to: CONTRACTS.MEMES_STAKE.address,
          data: stakeData,
        }],
      });

      toast({
        title: "⏳ Staking Transaction Submitted",
        description: "Processing your stake...",
      });

      // Save transaction to database
      try {
        console.log('Attempting to save stake transaction:', {
          walletAddress,
          transactionType: 'Stake',
          amount: stakeAmount,
          tokenSymbol: 'MEMES',
          transactionHash: stakeTxHash
        });
        
        const response = await apiRequest('POST', '/api/transactions', {
          walletAddress: walletAddress,
          transactionType: 'Stake',
          amount: stakeAmount,
          tokenSymbol: 'MEMES',
          transactionHash: stakeTxHash,
          status: 'pending'
        });
        const savedTransaction = await response.json();
        console.log('✅ Stake transaction saved to database:', savedTransaction);
      } catch (dbError) {
        console.error('❌ Error saving stake transaction:', dbError);
        toast({
          title: "⚠️ Database Save Failed",
          description: "Transaction completed but failed to save to history",
          variant: "destructive"
        });
      }

      // Wait for transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update transaction status to confirmed
      try {
        await apiRequest('PUT', `/api/transactions/${stakeTxHash}/status`, {
          status: 'confirmed'
        });
      } catch (dbError) {
        console.error('Error updating transaction status:', dbError);
      }

      // Refresh staking data
      await fetchStakingData();

      // Trigger dashboard refresh
      localStorage.setItem('dashboardRefresh', Date.now().toString());

      setStakeAmount('');
      setIsProcessing(false);

      toast({
        title: "🎉 Staking Successful!",
        description: `Successfully staked ${parseFloat(stakeAmount).toLocaleString()} $MEMES tokens! TX: ${stakeTxHash.slice(0, 10)}...`,
      });
    } catch (error: any) {
      console.error('Error staking:', error);
      setIsProcessing(false);
      
      toast({
        title: "❌ Staking Failed",
        description: error.message || "Failed to stake tokens. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUnstake = async (isEarlyUnstake: boolean = false) => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      toast({
        title: "❌ Invalid Amount",
        description: "Please enter a valid unstaking amount",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(unstakeAmount) > stakedAmount) {
      toast({
        title: "❌ Insufficient Staked Balance",
        description: "You don't have enough staked tokens",
        variant: "destructive"
      });
      return;
    }

    const daysStaked = getDaysStaked();
    let finalAmount = parseFloat(unstakeAmount);
    let penaltyAmount = 0;

    if (isEarlyUnstake && daysStaked < PENALTY_FREE_DAYS) {
      penaltyAmount = claimableRewards;
      finalAmount = finalAmount - penaltyAmount;
      
      toast({
        title: "⚠️ Early Unstake Penalty",
        description: `Early unstake detected! All rewards (${penaltyAmount.toLocaleString()} $MEMES) deducted from principal. You will receive ${finalAmount.toLocaleString()} $MEMES.`,
        variant: "destructive"
      });
    }

    setIsProcessing(true);
    setTimeout(() => {
      setStakedAmount(prev => prev - parseFloat(unstakeAmount));
      setTokenBalance(prev => prev + finalAmount);
      setClaimableRewards(prev => isEarlyUnstake && daysStaked < PENALTY_FREE_DAYS ? 0 : prev);
      setUnstakeAmount('');
      setIsProcessing(false);
      
      if (!isEarlyUnstake || daysStaked >= PENALTY_FREE_DAYS) {
        toast({
          title: "✅ Unstaking Successful!",
          description: `Successfully unstaked ${parseFloat(unstakeAmount).toLocaleString()} $MEMES tokens`,
        });
      }
    }, 2500);
  };

  const handleClaimRewards = async () => {
    if (claimableRewards <= 0) {
      toast({
        title: "❌ No Rewards",
        description: "You don't have any rewards to claim",
        variant: "destructive"
      });
      return;
    }

    if (!walletAddress) {
      toast({
        title: "❌ Wallet Not Connected",
        description: "Please connect your wallet to claim rewards",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsClaiming(true);

      // Check reward fund balance first
      const publicClient = createPublicClient({
        chain: bscTestnet,
        transport: http('https://data-seed-prebsc-1-s1.binance.org:8545/')
      });

      const rewardFundBalance = await publicClient.readContract({
        address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
        abi: CONTRACTS.MEMES_STAKE.abi,
        functionName: 'rewardFund',
        args: []
      }) as bigint;

      const rewardFundInTokens = Number(rewardFundBalance) / 1e18;
      console.log('Reward fund balance:', rewardFundInTokens);
      console.log('Claimable rewards:', claimableRewards);

      // Check if contract has enough reward fund
      if (rewardFundInTokens < claimableRewards) {
        toast({
          title: "❌ Insufficient Reward Fund",
          description: `Contract reward fund (${rewardFundInTokens.toLocaleString()} MEMES) is less than your claimable rewards (${claimableRewards.toLocaleString()} MEMES). Please contact support.`,
          variant: "destructive"
        });
        setIsClaiming(false);
        return;
      }

      // Check if ethereum provider is available
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask or compatible wallet not found');
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      // Prepare the contract call
      const contractAddress = CONTRACTS.MEMES_STAKE.address;
      const claimRewardsData = CONTRACTS.MEMES_STAKE.abi.find(
        (item: any) => item.name === 'claimRewards' && item.type === 'function'
      );

      if (!claimRewardsData) {
        throw new Error('claimRewards function not found in ABI');
      }

      // Encode function call
      const iface = {
        encodeFunctionData: () => {
          return '0x372500ab'; // claimRewards() function signature
        }
      };

      // Fetch individual reward amounts for transaction records
      const [referralRewardsData, pendingRewardsData] = await Promise.all([
        publicClient.readContract({
          address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
          abi: CONTRACTS.MEMES_STAKE.abi,
          functionName: 'getTotalRewardsByReferralLevel',
          args: [walletAddress as `0x${string}`]
        }) as Promise<any>,
        publicClient.readContract({
          address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
          abi: CONTRACTS.MEMES_STAKE.abi,
          functionName: 'getPendingRewards',
          args: [walletAddress as `0x${string}`]
        }) as Promise<bigint>
      ]);

      const stakingRewardsAmount = (Number(pendingRewardsData) / 1e18).toString();
      const referralRewardsAmount = (Number(referralRewardsData[0] || 0) / 1e18).toString();

      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: accounts[0],
          to: contractAddress,
          data: iface.encodeFunctionData(),
        }],
      });

      toast({
        title: "⏳ Transaction Submitted",
        description: "Claiming your rewards...",
      });

      // Save TWO separate transaction records (staking rewards + referral rewards)
      try {
        console.log('Attempting to save claim transactions:', {
          walletAddress,
          stakingRewardsAmount,
          referralRewardsAmount,
          txHash
        });
        
        // 1. Save Staking Rewards transaction
        if (parseFloat(stakingRewardsAmount) > 0) {
          const stakingResponse = await apiRequest('POST', '/api/transactions', {
            walletAddress: walletAddress,
            transactionType: 'Claim Staking Rewards',
            amount: stakingRewardsAmount,
            tokenSymbol: 'MEMES',
            transactionHash: txHash,
            status: 'pending'
          });
          const stakingTx = await stakingResponse.json();
          console.log('✅ Staking rewards transaction saved:', stakingTx);
        }

        // 2. Save Referral Rewards transaction
        if (parseFloat(referralRewardsAmount) > 0) {
          const referralResponse = await apiRequest('POST', '/api/transactions', {
            walletAddress: walletAddress,
            transactionType: 'Claim Referral Rewards',
            amount: referralRewardsAmount,
            tokenSymbol: 'MEMES',
            transactionHash: txHash + '-referral', // Add suffix to make hash unique
            status: 'pending'
          });
          const referralTx = await referralResponse.json();
          console.log('✅ Referral rewards transaction saved:', referralTx);
        }
        console.log('✅ All claim transactions saved to database');
      } catch (dbError) {
        console.error('❌ Error saving claim transactions:', dbError);
        toast({
          title: "⚠️ Database Save Failed",
          description: "Rewards claimed but failed to save to history",
          variant: "destructive"
        });
      }

      // Wait for transaction confirmation (optional - could use receipt)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update transaction statuses to confirmed
      try {
        if (parseFloat(stakingRewardsAmount) > 0) {
          await apiRequest('PUT', `/api/transactions/${txHash}/status`, {
            status: 'confirmed'
          });
        }
        if (parseFloat(referralRewardsAmount) > 0) {
          await apiRequest('PUT', `/api/transactions/${txHash}-referral/status`, {
            status: 'confirmed'
          });
        }
      } catch (dbError) {
        console.error('Error updating claim transaction statuses:', dbError);
      }

      toast({
        title: "🎉 Rewards Claimed!",
        description: `Successfully claimed your rewards! TX: ${txHash.slice(0, 10)}... Refreshing page...`,
      });

      // Refresh the page to update all data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Error claiming rewards:', error);
      setIsClaiming(false);
      
      toast({
        title: "❌ Claim Failed",
        description: error.message || "Failed to claim rewards. Please try again.",
        variant: "destructive"
      });
    }
  };

  const daysStaked = getDaysStaked();
  const remainingDays = Math.max(0, PENALTY_FREE_DAYS - daysStaked);

  return (
    <div className="min-h-screen text-foreground" style={{background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 50%, #0f1421 100%)'}} data-testid="staking-page">
      
      {/* Header */}
      <header className="border-b border-border" style={{background: 'rgba(15, 10, 35, 0.8)'}} data-testid="staking-header">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={memeStakeLogo} 
                alt="MEMES STAKE Logo" 
                className="w-12 h-12 rounded-lg"
                style={{filter: 'drop-shadow(0 4px 15px rgba(255, 215, 0, 0.3))'}}
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold" style={{color: '#ffd700'}}>MEMES STAKE</span>
                <span className="text-sm text-gray-400">Staking Portal</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Wallet Address Display */}
              {walletAddress && (
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}>
                  <div className="text-xs text-gray-400">Wallet</div>
                  <div className="text-sm font-mono font-bold" style={{color: '#ffd700'}}>
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </div>
                </div>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => setLocation('/dashboard')}
                data-testid="button-back-dashboard"
              >
                ← Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        
        {/* APY Banner */}
        <Card className="p-6 glass-card text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div>
              <div className="text-4xl font-bold" style={{color: '#00ff88'}}>365% APY</div>
              <div className="text-sm text-muted-foreground">Annual Percentage Yield</div>
            </div>
            <div className="text-3xl">💎</div>
            <div>
              <div className="text-4xl font-bold" style={{color: '#ffd700'}}>1% Daily</div>
              <div className="text-sm text-muted-foreground">Daily Returns</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Earn consistent daily rewards on your staked $MEMES tokens
          </p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Staking Panel */}
          <Card className="p-6 glass-card">
            <h3 className="text-xl font-semibold mb-4">💰 Stake/Unstake</h3>
            
            {/* Tabs */}
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setActiveTab('stake')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                  activeTab === 'stake' 
                    ? 'text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
                style={{
                  background: activeTab === 'stake' ? '#ffd700' : 'rgba(255, 255, 255, 0.05)'
                }}
                data-testid="tab-stake"
              >
                Stake
              </button>
              <button
                onClick={() => setActiveTab('unstake')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                  activeTab === 'unstake' 
                    ? 'text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
                style={{
                  background: activeTab === 'unstake' ? '#ffd700' : 'rgba(255, 255, 255, 0.05)'
                }}
                data-testid="tab-unstake"
              >
                Unstake
              </button>
            </div>

            {/* Balance Display */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)'}}>
                <div className="text-xs text-muted-foreground mb-1">Wallet Balance</div>
                <div className="font-bold" style={{color: '#ffd700'}}>{tokenBalance.toLocaleString()} $MEMES</div>
              </div>
              <div className="p-3 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)'}}>
                <div className="text-xs text-muted-foreground mb-1">Staked Amount</div>
                <div className="font-bold" style={{color: '#00bfff'}}>{stakedAmount.toLocaleString()} $MEMES</div>
              </div>
            </div>

            {activeTab === 'stake' ? (
              <div className="space-y-4">
                {/* Approval Section */}
                {/*{!isApproved && (
                  <div className="p-4 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)'}}>
                    <p className="text-sm text-gray-300 mb-3">
                      First, approve the smart contract to manage your tokens
                    </p>
                    <Button 
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="w-full"
                      style={{background: '#ffd700', color: '#000'}}
                      data-testid="button-approve"
                    >
                      {isProcessing ? '⏳ Approving...' : '✅ Approve Contract'}
                    </Button>
                  </div>
                )*/}

                {/* Stake Input */}
                {//isApproved && (
                  <>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Amount to Stake</label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          placeholder="0.00"
                          className="flex-1 px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white"
                          data-testid="input-stake-amount"
                        />
                        <button
                          onClick={() => setStakeAmount(tokenBalance.toString())}
                          className="px-4 py-2 rounded-lg text-sm font-semibold"
                          style={{background: 'rgba(255, 215, 0, 0.2)', color: '#ffd700', border: '1px solid rgba(255, 215, 0, 0.3)'}}
                          data-testid="button-max-stake"
                        >
                          MAX
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Minimum stake: 500,000 $MEMES ($50 worth)</p>
                    </div>

                    <Button 
                      onClick={handleStake}
                      disabled={isProcessing || !stakeAmount}
                      className="w-full"
                      style={{background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)', color: '#000'}}
                      data-testid="button-stake"
                    >
                      {isProcessing ? '⏳ Staking...' : '💎 Stake Tokens'}
                    </Button>
                  </>
                //)
                
                }
              </div>
            ) : (
              <div className="space-y-4">
                {/* Unstaking Info Banner */}
                <div className="p-3 rounded-lg text-xs" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.2)'}}>
                  <div className="font-semibold mb-1" style={{color: '#00bfff'}}>Unstaking Rules:</div>
                  <ul className="space-y-1 text-gray-300">
                    <li>• Penalty-free after: <strong>90 days</strong></li>
                    <li>• Early unstake penalty: <strong>20% deduction</strong></li>
                    <li>• Minimum recommended lock: <strong>365 days</strong></li>
                  </ul>
                </div>

                {/* Staking Records Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 px-2 text-xs text-muted-foreground">#</th>
                        <th className="text-left py-2 px-2 text-xs text-muted-foreground">Date Staked</th>
                        <th className="text-right py-2 px-2 text-xs text-muted-foreground">Amount</th>
                        <th className="text-center py-2 px-2 text-xs text-muted-foreground">Days</th>
                        <th className="text-center py-2 px-2 text-xs text-muted-foreground">Penalty</th>
                        <th className="text-center py-2 px-2 text-xs text-muted-foreground">Action</th>
                        <th className="text-center py-2 px-2 text-xs text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingData ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-400">
                            Loading active stakes...
                          </td>
                        </tr>
                      ) : activeStakes.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-400">
                            No active stakes found
                          </td>
                        </tr>
                      ) : (
                        activeStakes.map((stake) => {
                          const stakeId = Number(stake.stakeId);
                          const stakedAmount = Number(stake.details.amount) / 1e18;
                          const startTime = Number(stake.details.startTime);
                          const dateStaked = new Date(startTime * 1000).toLocaleDateString();
                          const daysStaked = Math.floor((Date.now() / 1000 - startTime) / (24 * 60 * 60));
                          const penaltyInfo = getPenaltyInfo(daysStaked);
                          
                          return (
                            <tr 
                              key={stakeId} 
                              className="border-b border-white/5 hover:bg-white/5 transition-colors"
                              data-testid={`stake-record-${stakeId}`}
                            >
                              <td className="py-3 px-2 text-gray-400">{stakeId}</td>
                              <td className="py-3 px-2">{dateStaked}</td>
                              <td className="py-3 px-2 text-right font-bold" style={{color: '#ffd700'}}>
                                {stakedAmount.toLocaleString()} MEME
                              </td>
                              <td className="py-3 px-2 text-center font-semibold" style={{color: '#00bfff'}}>
                                {daysStaked} days
                              </td>
                              <td className="py-3 px-2 text-center">
                                <span style={{color: penaltyInfo.color, fontSize: '11px'}}>
                                  {penaltyInfo.text}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <button
                                  onClick={() => handleWithdrawCapital(stakeId)}
                                  disabled={isUnstaking}
                                  className="px-3 py-1 rounded text-xs font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{
                                    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                                    color: '#000'
                                  }}
                                  data-testid={`button-unstake-${stakeId}`}
                                >
                                  {isUnstaking ? '⏳ Unstaking...' : '🔓 Unstake'}
                                </button>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <span 
                                  className="px-2 py-1 rounded text-xs font-semibold"
                                  style={{
                                    background: 'rgba(0, 255, 136, 0.2)',
                                    color: '#00ff88',
                                    border: '1px solid rgba(0, 255, 136, 0.3)'
                                  }}
                                >
                                  Active
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>

          {/* Rewards Panel */}
          <Card className="p-6 glass-card">
            <h3 className="text-xl font-semibold mb-4">🎁 Rewards</h3>
            
            <div className="space-y-4">
              {/* Accrued Today */}
              <div className="p-4 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)'}}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">⏰ Accrued Today</span>
                  <span className="text-xs" style={{color: '#ffd700'}}>1% Daily</span>
                </div>
                <div className="text-2xl font-bold" style={{color: '#ffd700'}}>
                  {isLoadingData ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    `${accruedToday.toLocaleString()} $MEMES`
                  )}
                </div>
              </div>

              {/* Claimable Now */}
              <div className="p-4 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.2)'}}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">💰 Claimable Now</span>
                  {/*<span className="text-xs" style={{color: '#00ff88'}}>{daysStaked} days</span>*/}
                </div>
                <div className="text-2xl font-bold" style={{color: '#00ff88'}}>
                  {claimableRewards.toLocaleString()} $MEMES
                </div>
              </div>

              {/* Claim Button */}
              <Button 
                onClick={handleClaimRewards}
                disabled={isClaiming || claimableRewards <= 0}
                className="w-full"
                style={{background: 'linear-gradient(135deg, #00ff88 0%, #00cc70 100%)', color: '#000'}}
                data-testid="button-claim-rewards"
              >
                {isClaiming ? '⏳ Claiming...' : `🎁 Claim ${claimableRewards.toLocaleString()} $MEMES`}
              </Button>
            </div>
          </Card>
        </div>

        {/* Important Notice */}
        <Card className="p-4 glass-card">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1 text-sm">
              <p className="font-semibold mb-2" style={{color: '#ffd700'}}>Important Staking Rules:</p>
              <ul className="space-y-1 text-gray-300 text-xs">
                <li>• Minimum staking period: <strong>90 days</strong> for penalty-free unstake</li>
                <li>• Early unstake (before 90 days): <strong>All earned rewards will be deducted</strong> from your principal amount</li>
                <li>• Daily rewards: <strong>1% of staked amount</strong> (365% APY)</li>
                <li>• Rewards can be claimed anytime without affecting your stake</li>
                <li>• Gas fees apply to all transactions (stake, unstake, claim)</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
