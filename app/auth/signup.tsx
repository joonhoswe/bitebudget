import { Stack, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import logoImage from '../../assets/images/logo.png';
import { supabase } from '../../utils/supabase';

const SignUp = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signUpWithEmail = useCallback(async () => {
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match!');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: name },
      },
    });

    if (error) {
      Alert.alert(error.message);
    } else {
      Alert.alert('Registration Successful');
    }
    setLoading(false);
  }, [email, password, confirmPassword, name]);

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
        placeholder="name"
        placeholderTextColor="#999999"
        value={name}
        onChangeText={setName}
        style={{
          backgroundColor: '#F0F0F0',
          padding: 15,
          borderRadius: 25,
          marginBottom: 15,
          color: '#333333',
          fontFamily: 'InriaSans-Regular',
        }}
        autoCapitalize="words"
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
          marginBottom: 15,
          color: '#333333',
          fontFamily: 'InriaSans-Regular',
        }}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="confirm password"
        placeholderTextColor="#999999"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
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
        onPress={signUpWithEmail}
        disabled={loading}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 16,
            fontFamily: 'InriaSans-Bold',
          }}
        >
          sign up
        </Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <Text
          style={{
            color: '#666666',
            fontFamily: 'InriaSans-Regular',
          }}
        >
          already have an account?{' '}
        </Text>
        <TouchableOpacity onPress={() => router.push('./login')}>
          <Text
            style={{
              color: '#4CD964',
              fontFamily: 'InriaSans-Bold',
            }}
          >
            login!
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignUp;
