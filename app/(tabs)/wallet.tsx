import 'react-native-get-random-values';
import { Stack } from 'expo-router';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useCallback, useState } from 'react';
import { Text, TouchableOpacity, View, Alert, Platform, Linking, StyleSheet, Image } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import phantomIcon from '../../assets/images/Phantom.png';

const SOLANA_NETWORK = 'devnet';
const ENDPOINT = new Connection('https://api.devnet.solana.com');

export default function WalletScreen() {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  
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
      const result = await transact(async (wallet) => {
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
      await transact(async (wallet) => {
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

  const openPhantomApp = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('phantom://');
    } else {
      connectWallet();
    }
  }, []);

  const downloadPhantom = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/us/app/phantom-solana-wallet/id1598432977');
    } else {
      Linking.openURL('https://play.google.com/store/apps/details?id=app.phantom');
    }
  }, []);

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

        {connected && (
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
}); 