import 'react-native-get-random-values';
import { Stack } from 'expo-router';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useCallback, useState } from 'react';
import { Text, TouchableOpacity, View, Alert, Platform, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';

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

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Stack.Screen
        options={{
          headerTitle: 'Wallet',
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#4CD964',
          headerTitleStyle: {
            fontFamily: 'InriaSans-Bold',
          },
        }}
      />

      <View style={{ 
        flex: 1, 
        padding: 20,
        justifyContent: 'center'
      }}>
        {!connected ? (
          <TouchableOpacity
            onPress={connectWallet}
            style={{
              backgroundColor: '#4CD964',
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Text style={{ color: 'white', fontFamily: 'InriaSans-Bold' }}>
              Connect Wallet
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: '100%' }}>
            <Text style={{ fontFamily: 'InriaSans-Regular', marginBottom: 10 }}>
              Connected: {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
            </Text>
            
            <TouchableOpacity
              onPress={sendTransaction}
              style={{
                backgroundColor: '#4CD964',
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
                marginTop: 20,
              }}
            >
              <Text style={{ color: 'white', fontFamily: 'InriaSans-Bold' }}>
                Send Transaction
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={async () => {
                if (publicKey) {
                  await Clipboard.setStringAsync(publicKey);
                  Alert.alert('Copied', 'Address copied to clipboard');
                }
              }}
              style={{
                backgroundColor: '#F0F0F0',
                padding: 16,
                borderRadius: 12,
                alignItems: 'center',
                marginTop: 10,
              }}
            >
              <Text style={{ color: '#666666', fontFamily: 'InriaSans-Regular' }}>
                Copy Address
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
} 