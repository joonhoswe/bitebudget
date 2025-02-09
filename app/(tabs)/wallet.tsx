import React from 'react';
import 'react-native-get-random-values';
import { Stack } from 'expo-router';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useCallback, useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, Alert, Platform, StyleSheet, Image, FlatList, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import phantomIcon from '../../assets/images/Phantom.png';
import * as Linking from 'expo-linking';

const SOLANA_NETWORK = 'devnet';
const ENDPOINT = new Connection('https://api.devnet.solana.com');

// Add new interfaces
interface NFT {
  mintAddress: string;
  title: string;
  price: number;
  image: string;
  collectionName: string;
}

interface MagicEdenListing {
  pdaAddress: string;
  auctionHouse: string;
  tokenMint: string;
  tokenAddress: string;
  seller: string;
  sellerReferral: string;
  tokenSize: number;
  price: number;
}

const MAGIC_EDEN_API_BASE = 'https://api-mainnet.magiceden.dev/v2';

export default function WalletScreen() {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [userNfts, setUserNfts] = useState<NFT[]>([]);
  
  const connectWallet = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        // For iOS, we'll use a different approach or show a message
        Alert.alert(
          'iOS Wallet Connection',
          'Please use Phantom or another Solana wallet app.',
          [
            {
              text: 'Open Phantom',
              onPress: () => {
                Linking.openURL('phantom://');
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
        return;
      }

      // Android implementation
      const { transact } = require('@solana-mobile/mobile-wallet-adapter-protocol-web3js');
      const result = await transact(async (wallet: { 
        authorize: (options: { cluster: string, identity: any }) => Promise<{ accounts: { address: string }[] }> 
      }) => {
        const { accounts } = await wallet.authorize({
          cluster: SOLANA_NETWORK,
          identity: {
            name: 'BiteBudget',
            uri: 'https://bitebudget.app',
            icon: 'https://bitebudget.app/icon.png',
          },
        });
        
        if (accounts.length > 0) {
          setPublicKey(accounts[0].address);
          setConnected(true);
          return accounts[0].address;
        }
      });
      
      if (!result) {
        throw new Error('No account selected');
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      Alert.alert('Error', 'Failed to connect wallet. Please try again.');
    }
  }, []);

  const sendTransaction = useCallback(async () => {
    if (!publicKey) return;

    try {
      const { transact } = require('@solana-mobile/mobile-wallet-adapter-protocol-web3js');
      await transact(async (wallet: any) => {
        // Create transaction
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: new PublicKey(publicKey),
            toPubkey: new PublicKey(publicKey), // Replace with recipient address
            lamports: 1000, // 0.000001 SOL
          })
        );

        // Get latest blockhash
        const { blockhash } = await ENDPOINT.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = new PublicKey(publicKey);

        // Convert transaction to base64
        const serializedTransaction = transaction.serialize({
          requireAllSignatures: false,
          verifySignatures: false
        });
        const base64Transaction = serializedTransaction.toString('base64');

        // Sign and send transaction
        const signatures = await wallet.signAndSendTransactions({
          payloads: [base64Transaction]
        });

        if (signatures && signatures.length > 0) {
          Alert.alert('Success', 'Transaction sent successfully!');
        }
      });
    } catch (err) {
      console.error('Error sending transaction:', err);
      Alert.alert('Error', 'Failed to send transaction. Please try again.');
    }
  }, [publicKey]);

  // Move fetchUserNFTs before handleDeepLink
  const fetchUserNFTs = useCallback(async () => {
    if (!publicKey) return;
    
    try {
      const response = await fetch(
        `${MAGIC_EDEN_API_BASE}/wallets/${publicKey}/tokens`
      );
      const userNFTData = await response.json();
      setUserNfts(userNFTData);
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
    }
  }, [publicKey]);

  // Add URL listener for deep linking
  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Handle deep linking when app is opened from background
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Add deep link handler
  const handleDeepLink = useCallback(async ({ url }: { url: string }) => {
    if (!url) return;

    // Parse the URL
    const { path, queryParams } = Linking.parse(url);

    // Check if this is a return from Phantom
    if (path?.includes('phantom-login')) {
      // Extract data from URL parameters
      const params = queryParams as { 
        public_key?: string; 
        signature?: string;
        session?: string;
      };
      
      if (params.public_key) {
        setPublicKey(params.public_key);
        setConnected(true);
        // Fetch user's NFTs after successful connection
        fetchUserNFTs();
        
        // Show success message
        Alert.alert('Success', 'Wallet connected successfully!');
      }
    }
  }, [fetchUserNFTs]);

  // Modify the openPhantomApp function
  const openPhantomApp = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        // Create deep link URL for your app
        const redirectUrl = Linking.createURL('phantom-login');
        
        // Create the Phantom URL with required parameters
        const phantomUrl = `https://phantom.app/ul/v1/connect?app_url=${encodeURIComponent(redirectUrl)}&dapp_encryption_public_key=your_encryption_key`;
        
        const canOpenPhantom = await Linking.canOpenURL('phantom://');
        if (canOpenPhantom) {
          await Linking.openURL(phantomUrl);
        } else {
          Alert.alert('Error', 'Phantom wallet is not installed');
          downloadPhantom();
        }
      } else {
        // Existing Android implementation
        connectWallet();
      }
    } catch (error) {
      console.error('Error opening Phantom:', error);
      Alert.alert('Error', 'Failed to open Phantom wallet');
    }
  }, []);

  const downloadPhantom = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/us/app/phantom-solana-wallet/id1598432977');
    } else {
      Linking.openURL('https://play.google.com/store/apps/details?id=app.phantom');
    }
  }, []);

  // Add NFT fetching function
  const fetchNFTs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${MAGIC_EDEN_API_BASE}/collections/bitebudget/listings`);
      const listings = await response.json() as MagicEdenListing[];
      
      const nftData = await Promise.all(listings.map(async (listing) => {
        const metadataResponse = await fetch(
          `${MAGIC_EDEN_API_BASE}/tokens/${listing.tokenMint}`
        );
        const metadata = await metadataResponse.json();
        
        return {
          mintAddress: listing.tokenMint,
          title: metadata.name,
          price: listing.price,
          image: metadata.image,
          collectionName: metadata.collection
        };
      }));

      setNfts(nftData);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      Alert.alert('Error', 'Failed to load NFTs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNFTs();
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      fetchUserNFTs();
    }
  }, [connected, publicKey]);

  // Add purchase NFT function
  const purchaseNFT = useCallback(async (nft: NFT) => {
    if (!publicKey) {
      Alert.alert('Error', 'Please connect your wallet first');
      return;
    }

    try {
      if (Platform.OS === 'ios') {
        // For iOS, create a deep link to Phantom for the purchase
        const redirectUrl = Linking.createURL('phantom-purchase');
        
        // Create transaction data
        const transactionData = {
          to: nft.mintAddress,
          amount: nft.price,
          splToken: 'SOL',
          reference: `purchase_${nft.mintAddress}`,
        };

        // Create Phantom payment URL
        const phantomUrl = `https://phantom.app/ul/v1/transfer?` +
          `app_url=${encodeURIComponent(redirectUrl)}` +
          `&recipient=${encodeURIComponent(transactionData.to)}` +
          `&amount=${transactionData.amount}` +
          `&splToken=${transactionData.splToken}` +
          `&reference=${transactionData.reference}`;

        await Linking.openURL(phantomUrl);
      } else {
        // Existing Android implementation
        const { transact } = require('@solana-mobile/mobile-wallet-adapter-protocol-web3js');
        await transact(async (wallet: any) => {
          const response = await fetch(
            `${MAGIC_EDEN_API_BASE}/tokens/${nft.mintAddress}/listings`
          );
          const listings = await response.json();
          if (!listings.length) {
            throw new Error('NFT listing not found');
          }

          const purchaseResponse = await fetch(
            `${MAGIC_EDEN_API_BASE}/instructions/buy`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                buyerAddress: publicKey,
                sellerAddress: listings[0].seller,
                auctionHouseAddress: listings[0].auctionHouse,
                tokenMint: nft.mintAddress,
                price: nft.price,
              }),
            }
          );

          const { txData } = await purchaseResponse.json();
          const signatures = await wallet.signAndSendTransactions({
            payloads: [txData]
          });

          if (signatures?.length > 0) {
            Alert.alert('Success', 'NFT purchased successfully!');
            fetchUserNFTs();
          }
        });
      }
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      Alert.alert('Error', 'Failed to purchase NFT');
    }
  }, [publicKey, fetchUserNFTs]);

  // Add NFT rendering components
  const renderNFTItem = ({ item }: { item: NFT }) => (
    <View style={styles.nftCard}>
      <Image 
        source={{ uri: item.image }} 
        style={styles.nftImage}
      />
      <Text style={styles.nftTitle}>{item.title}</Text>
      <Text style={styles.nftPrice}>{item.price} SOL</Text>
      <TouchableOpacity
        style={styles.buyButton}
        onPress={() => purchaseNFT(item)}
      >
        <Text style={styles.buyButtonText}>Buy Now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderUserNFTItem = ({ item }: { item: NFT }) => (
    <View style={styles.nftCard}>
      <Image 
        source={{ uri: item.image }} 
        style={styles.nftImage}
      />
      <Text style={styles.nftTitle}>{item.title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.content}>
        <View>
          <Text style={styles.title}>Blockchain</Text>
          
          <Text style={styles.description}>
            Take control of your financial future with blockchain. Using Solana (SOL) and Phantom Wallet, you'll gain hands-on experience with Web3 transactions, managing digital assets, and engaging with decentralized finance—all in one place.
          </Text>
        </View>

        {!connected ? (
          <View style={styles.walletSection}>
            <Text style={styles.connectTitle}>Connect a wallet</Text>

            <TouchableOpacity
              onPress={openPhantomApp}
              style={styles.phantomButton}
            >
              <Image 
                source={phantomIcon}
                style={styles.phantomIcon}
              />
              <Text style={styles.buttonText}>Log Into Phantom</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>Or</Text>

            <TouchableOpacity
              onPress={downloadPhantom}
              style={styles.phantomButton}
            >
              <Image 
                source={phantomIcon}
                style={styles.phantomIcon}
              />
              <Text style={styles.buttonText}>Download Phantom</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.connectedSection}>
              <Text style={styles.connectedText}>
                Connected: {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
              </Text>
              
              <TouchableOpacity
                onPress={sendTransaction}
                style={styles.sendButton}
              >
                <Text style={styles.buttonText}>Send Transaction</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  if (publicKey) {
                    await Clipboard.setStringAsync(publicKey);
                    Alert.alert('Copied', 'Address copied to clipboard');
                  }
                }}
                style={styles.copyButton}
              >
                <Text style={styles.copyButtonText}>Copy Address</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.nftContainer}>
              <Text style={styles.sectionTitle}>Available NFTs</Text>
              {loading ? (
                <ActivityIndicator size="large" color="#534BB1" />
              ) : (
                <FlatList
                  data={nfts}
                  renderItem={renderNFTItem}
                  keyExtractor={(item) => item.mintAddress}
                  horizontal={false}
                  numColumns={2}
                  contentContainerStyle={styles.nftGrid}
                />
              )}

              <Text style={styles.sectionTitle}>Your NFTs</Text>
              <FlatList
                data={userNfts}
                renderItem={renderUserNFTItem}
                keyExtractor={(item) => item.mintAddress}
                horizontal={true}
                contentContainerStyle={styles.userNftList}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 140,
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    fontFamily: 'InriaSans-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'InriaSans-Regular',
    textAlign: 'center',
    marginBottom: 0,
    paddingHorizontal: 20,
    color: '#666666',
    lineHeight: 24,
  },
  walletSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 200,
  },
  connectTitle: {
    fontSize: 24,
    fontFamily: 'InriaSans-Bold',
    marginBottom: 20,
  },
  phantomButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#534BB1',
  },
  buttonText: {
    color: '#534BB1',
    fontFamily: 'InriaSans-Bold',
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  phantomIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  orText: {
    fontFamily: 'InriaSans-Regular',
    fontSize: 16,
    marginVertical: 10,
    color: '#666666',
  },
  connectedSection: {
    width: '100%',
    marginTop: 20,
  },
  connectedText: {
    fontFamily: 'InriaSans-Regular',
    marginBottom: 10,
  },
  sendButton: {
    backgroundColor: '#534BB1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  copyButton: {
    backgroundColor: '#F0F0F0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  copyButtonText: {
    color: '#666666',
    fontFamily: 'InriaSans-Regular',
  },
  nftContainer: {
    flex: 1,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'InriaSans-Bold',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  nftGrid: {
    padding: 8,
  },
  nftCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nftImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  nftTitle: {
    fontSize: 16,
    fontFamily: 'InriaSans-Regular',
    marginBottom: 4,
  },
  nftPrice: {
    fontSize: 18,
    fontFamily: 'InriaSans-Bold',
    color: '#534BB1',
    marginBottom: 8,
  },
  buyButton: {
    backgroundColor: '#534BB1',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontFamily: 'InriaSans-Bold',
    fontSize: 14,
  },
  userNftList: {
    padding: 16,
  },
}); 