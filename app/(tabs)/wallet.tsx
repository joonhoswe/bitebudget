import React from 'react';
import 'react-native-get-random-values';
import { Stack } from 'expo-router';
import { Connection, PublicKey, Transaction, SystemProgram, Keypair } from '@solana/web3.js';
import { useCallback, useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, Alert, Platform, StyleSheet, Image, FlatList, ActivityIndicator, Modal, SafeAreaView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import phantomIcon from '../../assets/images/Phantom.png';
import * as Linking from 'expo-linking';
import { Buffer } from 'buffer';
import * as Crypto from 'expo-crypto';
import { MaterialIcons } from '@expo/vector-icons';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import * as ed2curve from 'ed2curve';

const SOLANA_NETWORK = 'devnet';
const ENDPOINT = new Connection('https://api.devnet.solana.com');
const APP_SCHEME = __DEV__ ? 'exp' : 'bitebudget';
const HOST = __DEV__ ? '10.52.104.144:8081' : null; // Replace with your dev machine's IP
const PHANTOM_CONNECT_URL = 'https://phantom.app/ul/v1/connect';

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

let dappKeyPair: Keypair | null = null;

const generateNonce = () => {
  // Use 24 bytes (nacl.box requires a 24-byte nonce)
  const randomBytes = Crypto.getRandomBytes(24);
  return Buffer.from(randomBytes).toString('base64');
};

const decryptPayload = (
  data: string,
  nonce: string,
  phantomEncryptionPublicKey: string,
  dappSecretKey: Uint8Array
): { public_key: string } | null => {
  try {
    // Convert inputs to Uint8Array
    const messageBytes = bs58.decode(data);
    const nonceBytes = bs58.decode(nonce);
    const phantomPublicKeyBytes = bs58.decode(phantomEncryptionPublicKey);

    // Convert Ed25519 secret key to X25519
    const convertedSecretKey = ed2curve.convertSecretKey(dappSecretKey);
    if (!convertedSecretKey) {
      throw new Error('Secret key conversion failed');
    }

    console.log('Debug lengths:', {
      messageLength: messageBytes.length,
      nonceLength: nonceBytes.length,
      phantomKeyLength: phantomPublicKeyBytes.length,
      secretKeyLength: convertedSecretKey.length,
      versionByte: messageBytes[0]
    });

    // Generate shared secret using the converted secret key
    const sharedSecretDapp = nacl.box.before(
      phantomPublicKeyBytes,
      convertedSecretKey
    );

    // Determine whether to remove the version byte based on its value
    const cipherText = 
      messageBytes[0] === 1 ? messageBytes.subarray(1) : messageBytes;

    // Attempt decryption with the determined ciphertext
    const decryptedBytes = nacl.box.open.after(
      cipherText,
      nonceBytes,
      sharedSecretDapp
    );

    if (!decryptedBytes) {
      throw new Error('Failed to decrypt message');
    }

    const decryptedString = Buffer.from(decryptedBytes).toString('utf8');
    console.log('Decrypted data:', decryptedString);

    const parsed = JSON.parse(decryptedString);
    if (!parsed.public_key) {
      throw new Error('Missing public key in decrypted data');
    }

    return parsed;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

const SuccessModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <MaterialIcons name="check-circle" size={50} color="#4CAF50" />
        <Text style={styles.modalText}>Wallet Connected Successfully</Text>
        <TouchableOpacity onPress={onClose} style={styles.modalButton}>
          <Text style={styles.modalButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  connectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  phantomLogo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  phantomButton: {
    backgroundColor: '#534BB1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  downloadButton: {
    backgroundColor: '#534BB1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  walletContainer: {
    flex: 1,
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    marginVertical: 15,
    fontSize: 16,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#534BB1',
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
  },
  nftItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  nftImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  nftInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  nftTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  nftPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  purchaseButton: {
    backgroundColor: '#534BB1',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    width: 100,
  },
});

const fetchNFTs = async () => {
  try {
    const response = await fetch(`${MAGIC_EDEN_API_BASE}/collections/popular`);
    if (!response.ok) {
      throw new Error('Failed to fetch NFTs');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
};

const connectWallet = async () => {
  try {
    // Android-specific wallet connection logic here
    Alert.alert('Info', 'Android wallet connection not implemented yet');
  } catch (error) {
    console.error('Error connecting wallet:', error);
    Alert.alert('Error', 'Failed to connect wallet');
  }
};

export default function WalletScreen() {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [userNfts, setUserNfts] = useState<NFT[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  
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

  // Move fetchUserNFTs after the state declarations
  const fetchUserNFTs = useCallback(async () => {
    if (!publicKey) return;
    
    try {
      const response = await fetch(
        `${MAGIC_EDEN_API_BASE}/wallets/${publicKey}/tokens`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch user NFTs');
      }
      
      const userNFTData = await response.json();
      setUserNfts(userNFTData);
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      setUserNfts([]); // Set empty array on error
    }
  }, [publicKey]);

  // Move fetchNFTs definition before handleDeepLink
  const fetchNFTs = useCallback(async () => {
    try {
      const response = await fetch(`${MAGIC_EDEN_API_BASE}/collections/okay_bears/listings?limit=20`);
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      
      const listings = await response.json() as MagicEdenListing[];
      
      const nftData = await Promise.all(listings.map(async (listing) => {
        const metadataResponse = await fetch(
          `${MAGIC_EDEN_API_BASE}/tokens/${listing.tokenMint}`
        );
        if (!metadataResponse.ok) {
          throw new Error(`Failed to fetch metadata for ${listing.tokenMint}`);
        }
        
        const metadata = await metadataResponse.json();
        
        return {
          mintAddress: listing.tokenMint,
          title: metadata.name || 'Unnamed NFT',
          price: listing.price,
          image: metadata.image || 'https://via.placeholder.com/150',
          collectionName: 'Okay Bears'
        };
      }));

      setNfts(nftData);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setNfts([]);
    }
  }, []);

  // Then define handleDeepLink after fetchNFTs
  const handleDeepLink = useCallback(async ({ url }: { url: string }) => {
    if (!url) return;
    console.log('Received deep link:', url);

    try {
      const parsedUrl = Linking.parse(url);
      console.log('Parsed URL:', parsedUrl);

      if (parsedUrl.path?.includes('wallet')) {
        const { data, nonce, phantom_encryption_public_key } = parsedUrl.queryParams || {};
        
        if (!data || !nonce || !phantom_encryption_public_key) {
          throw new Error('Missing required parameters');
        }

        if (!dappKeyPair) {
          throw new Error('No dapp keypair found');
        }

        console.log('Decrypting with keypair:', {
          publicKey: dappKeyPair.publicKey.toString(),
          secretKeyLength: dappKeyPair.secretKey.length
        });

        const decryptedData = decryptPayload(
          data as string,
          nonce as string,
          phantom_encryption_public_key as string,
          dappKeyPair.secretKey
        );

        if (!decryptedData || !decryptedData.public_key) {
          throw new Error('Failed to decrypt wallet data');
        }

        setPublicKey(decryptedData.public_key);
        setConnected(true);
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Deep link handling error:', error);
      Alert.alert('Error', 'Failed to connect wallet. Please try again.');
    }
  }, []);

  // Add URL listener for deep linking
  useEffect(() => {
    // Handle deep linking when app is already running
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
  }, [handleDeepLink]);

  // Modify the openPhantomApp function
  const openPhantomApp = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        // Generate new keypair
        dappKeyPair = Keypair.generate();

        // Convert Ed25519 public key to X25519 format for Phantom
        const convertedPublicKey = ed2curve.convertPublicKey(dappKeyPair.publicKey.toBytes());
        if (!convertedPublicKey) {
          throw new Error('Public key conversion failed');
        }
        const dappPublicKey = bs58.encode(convertedPublicKey);

        const nonce = generateNonce();
        const redirectUrl = __DEV__
          ? `exp://${HOST}/--/wallet`
          : `${APP_SCHEME}://wallet`;

        // Encode the nonce into base58
        const encodedNonce = bs58.encode(Buffer.from(nonce, 'base64'));

        const phantomUrl = `${PHANTOM_CONNECT_URL}?` +
          `app_url=${encodeURIComponent('https://bitebudget.app')}` +
          `&dapp_encryption_public_key=${encodeURIComponent(dappPublicKey)}` +
          `&redirect_link=${encodeURIComponent(redirectUrl)}` +
          `&nonce=${encodeURIComponent(encodedNonce)}` +
          `&cluster=${SOLANA_NETWORK}`;

        console.log('Opening Phantom with URL:', phantomUrl);
        await Linking.openURL(phantomUrl);
      } else {
        connectWallet();
      }
    } catch (error) {
      console.error('Error opening Phantom:', error);
      Alert.alert('Error', 'Failed to open Phantom wallet');
    }
  }, [connectWallet]);

  const downloadPhantom = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/us/app/phantom-solana-wallet/id1598432977');
    } else {
      Linking.openURL('https://play.google.com/store/apps/details?id=app.phantom');
    }
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      setLoading(true);
      Promise.all([fetchNFTs(), fetchUserNFTs()])
        .finally(() => setLoading(false));
    }
  }, [connected, publicKey, fetchNFTs, fetchUserNFTs]);

  // Update the purchaseNFT function
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
          `&splToken=${transactionData.splToken}`;

        await Linking.openURL(phantomUrl);
      } else {
        // Android implementation
        connectWallet();
      }
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      Alert.alert('Error', 'Failed to purchase NFT. Please try again.');
    }
  }, [publicKey, connectWallet]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Wallet' }} />
      <View style={styles.connectContainer}>
        <Image 
          source={phantomIcon} 
          style={styles.phantomLogo}
          resizeMode="contain"
        />
        <TouchableOpacity 
          onPress={openPhantomApp} 
          style={styles.phantomButton}
        >
          <Text style={styles.buttonText}>Connect with Phantom</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={downloadPhantom} 
          style={styles.downloadButton}
        >
          <Text style={styles.buttonText}>Download Phantom</Text>
        </TouchableOpacity>
      </View>
      <SuccessModal visible={showSuccess} onClose={() => setShowSuccess(false)} />
    </SafeAreaView>
  );
}