import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  AppState,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import logoImage from '../../assets/images/logo.png';
import { supabase } from '../../utils/supabase';

const Login = () => {
  const router = useRouter();

  // Tells Supabase Auth to continuously refresh the session automatically if
  // the app is in the foreground.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signInWithEmail = useCallback(async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert(error.message);
    } else {
      router.replace('../(tabs)/social');
    }
    setLoading(false);
  }, [email, password, router]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 20,
        justifyContent: 'center',
      }}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <Image
        source={logoImage}
        style={{
          width: 270,
          height: 270,
          alignSelf: 'center',
          marginBottom: 30,
          resizeMode: 'contain',
        }}
      />

      <TextInput
        placeholder="email"
        placeholderTextColor="#999999"
        value={email}
        onChangeText={setEmail}
        style={{
          backgroundColor: '#F0F0F0',
          padding: 15,
          borderRadius: 25,
          marginBottom: 15,
          color: '#333333',
          fontFamily: 'InriaSans-Regular',
        }}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="password"
        placeholderTextColor="#999999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          backgroundColor: '#F0F0F0',
          padding: 15,
          borderRadius: 25,
          marginBottom: 25,
          color: '#333333',
          fontFamily: 'InriaSans-Regular',
        }}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={{
          backgroundColor: '#4CD964',
          padding: 15,
          borderRadius: 25,
          alignItems: 'center',
          marginBottom: 20,
        }}
        onPress={signInWithEmail}
        disabled={loading}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 16,
            fontFamily: 'InriaSans-Bold',
          }}
        >
          login
        </Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <Text
          style={{
            color: '#666666',
            fontFamily: 'InriaSans-Regular',
          }}
        >
          {"don't have an account? "}
        </Text>
        <TouchableOpacity onPress={() => router.push('./signup')}>
          <Text
            style={{
              color: '#4CD964',
              fontFamily: 'InriaSans-Bold',
            }}
          >
            sign up!
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;
