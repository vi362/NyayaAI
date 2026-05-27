import React, {
  useState,
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import SpeechToText from 'react-native-voice';
import Icon from 'react-native-vector-icons/FontAwesome';

const Query = () => {
  const [query, setQuery] =
    useState('');

  const [response, setResponse] =
    useState({
      response:
        'Response will appear here...',
    });

  const [isListening, setIsListening] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  // Android Emulator URL
  const API_BASE_URL =
    'http://10.0.2.2:8000';

  // ----------------------
  // Voice Recognition
  // ----------------------
  const handleMicClick =
    async () => {
      try {
        if (
          isListening
        ) {
          await SpeechToText.stopListening();
          setIsListening(
            false
          );
        } else {
          await SpeechToText.startListening();
          setIsListening(
            true
          );
        }
      } catch (err) {
        console.error(
          err
        );

        setIsListening(
          false
        );
      }
    };

  // ----------------------
  // Submit Query
  // ----------------------
  const handleQuerySubmit =
    async () => {
      if (
        !query.trim()
      ) {
        setError(
          'Please enter a query'
        );
        return;
      }

      setIsLoading(
        true
      );

      setError('');

      try {
        const res =
          await fetch(
            `${API_BASE_URL}/encode/`,
            {
              method:
                'POST',

              headers:
                {
                  'Content-Type':
                    'application/json',
                },

              body: JSON.stringify(
                {
                  query,
                }
              ),
            }
          );

        if (
          !res.ok
        ) {
          throw new Error(
            `HTTP ${res.status}`
          );
        }

        const data =
          await res.json();

        setResponse(
          data
        );

        // Save response
        await AsyncStorage.setItem(
          'nyaya_response',
          JSON.stringify(
            data
          )
        );
      } catch (err) {
        console.error(
          err
        );

        setError(
          'Failed to fetch response from backend'
        );

        setResponse(
          {
            response:
              'Response will appear here...',
          }
        );

        await AsyncStorage.removeItem(
          'nyaya_response'
        );
      } finally {
        setIsLoading(
          false
        );
      }
    };

  // ----------------------
  // Clear Everything
  // ----------------------
  const handleClear =
    async () => {
      setQuery('');
      setError('');
      setIsLoading(
        false
      );

      const reset =
        {
          response:
            'Response will appear here...',
        };

      setResponse(
        reset
      );

      await AsyncStorage.removeItem(
        'nyaya_response'
      );
    };

  // ----------------------
  // Markdown Formatter
  // ----------------------
  const formatResponse =
    (text) => {
      if (!text)
        return null;

      return text
        .split('\n')
        .filter(
          (
            line
          ) =>
            line.trim() !==
            ''
        )
        .map(
          (
            line,
            index
          ) => {
            // remove *
            line =
              line.replace(
                /^\s*\*\s*/,
                ''
              );

            const parts =
              line.split(
                /\*\*(.*?)\*\*/g
              );

            return (
              <Text
                key={
                  index
                }
                style={
                  styles.responseText
                }
              >
                {parts.map(
                  (
                    part,
                    i
                  ) =>
                    i %
                      2 ===
                    1 ? (
                      <Text
                        key={
                          i
                        }
                        style={
                          styles.boldText
                        }
                      >
                        {
                          part
                        }
                      </Text>
                    ) : (
                      part
                    )
                )}
              </Text>
            );
          }
        );
    };

  return (
    <View
      style={
        styles.container
      }
    >
      <ScrollView>
        <View
          style={
            styles.responseBox
          }
        >
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#007bff"
            />
          ) : error ? (
            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>
          ) : (
            formatResponse(
              response?.response
            )
          )}
        </View>

        <View
          style={
            styles.inputContainer
          }
        >
          <TextInput
            style={
              styles.input
            }
            value={
              query
            }
            onChangeText={
              setQuery
            }
            placeholder="Ask your legal question..."
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            onPress={
              handleMicClick
            }
          >
            <Icon
              name="microphone"
              size={24}
              color={
                isListening
                  ? '#007bff'
                  : '#555'
              }
            />
          </TouchableOpacity>
        </View>

        <View
          style={
            styles.buttonContainer
          }
        >
          <TouchableOpacity
            onPress={
              handleQuerySubmit
            }
            style={
              styles.submitButton
            }
          >
            <Text
              style={
                styles.buttonText
              }
            >
              {isLoading
                ? 'Loading...'
                : 'Submit Query'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={
              handleClear
            }
            style={
              styles.clearButton
            }
          >
            <Text
              style={
                styles.buttonText
              }
            >
              Clear
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor:
        '#f5f5f5',
    },

    responseBox: {
      backgroundColor:
        '#fff',
      borderRadius: 10,
      padding: 15,
      minHeight: 250,
      marginBottom: 20,
    },

    responseText: {
      fontSize: 16,
      color: '#333',
      lineHeight: 28,
      marginBottom: 10,
    },

    boldText: {
      fontWeight:
        'bold',
    },

    errorText: {
      color: 'red',
      fontSize: 16,
    },

    inputContainer: {
      flexDirection:
        'row',
      alignItems:
        'center',
      backgroundColor:
        '#fff',
      borderRadius: 10,
      paddingHorizontal: 15,
      marginBottom: 20,
    },

    input: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 12,
    },

    buttonContainer: {
      flexDirection:
        'row',
      justifyContent:
        'center',
      gap: 15,
    },

    submitButton: {
      backgroundColor:
        '#007bff',
      padding: 15,
      borderRadius: 10,
      minWidth: 150,
      alignItems:
        'center',
    },

    clearButton: {
      backgroundColor:
        '#dc3545',
      padding: 15,
      borderRadius: 10,
      minWidth: 120,
      alignItems:
        'center',
    },

    buttonText: {
      color: '#fff',
      fontWeight:
        'bold',
      fontSize: 16,
    },
  });

export default Query;