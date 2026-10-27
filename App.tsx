/**
 * Basic calculator
 *
 * @format
 */

import { useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { CalculatorButton } from './src/CalculatorButton';
import {
  clearAll,
  evaluate,
  initialState,
  inputDecimal,
  inputDigit,
  inputPercent,
  setOperator,
  toggleSign,
  type CalculatorState,
  type Operator,
} from './src/calculator';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <CalculatorScreen />
    </SafeAreaProvider>
  );
}

function CalculatorScreen() {
  const [state, setState] = useState<CalculatorState>(initialState);

  const onDigit = (digit: string) => {
    setState(current => inputDigit(current, digit));
  };

  const onOperator = (operator: Operator) => {
    setState(current => setOperator(current, operator));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.display}>
        <Text
          accessibilityLabel="calculator-display"
          numberOfLines={1}
          adjustsFontSizeToFit
          style={styles.displayText}>
          {state.display}
        </Text>
      </View>

      <View style={styles.pad}>
        <View style={styles.row}>
          <CalculatorButton
            label="AC"
            variant="utility"
            onPress={() => setState(clearAll())}
          />
          <CalculatorButton
            label="+/-"
            variant="utility"
            onPress={() => setState(toggleSign)}
          />
          <CalculatorButton
            label="%"
            variant="utility"
            onPress={() => setState(inputPercent)}
          />
          <CalculatorButton
            label="÷"
            variant="operator"
            onPress={() => onOperator('÷')}
          />
        </View>
        <View style={styles.row}>
          <CalculatorButton label="7" onPress={() => onDigit('7')} />
          <CalculatorButton label="8" onPress={() => onDigit('8')} />
          <CalculatorButton label="9" onPress={() => onDigit('9')} />
          <CalculatorButton
            label="×"
            variant="operator"
            onPress={() => onOperator('×')}
          />
        </View>
        <View style={styles.row}>
          <CalculatorButton label="4" onPress={() => onDigit('4')} />
          <CalculatorButton label="5" onPress={() => onDigit('5')} />
          <CalculatorButton label="6" onPress={() => onDigit('6')} />
          <CalculatorButton
            label="-"
            variant="operator"
            onPress={() => onOperator('-')}
          />
        </View>
        <View style={styles.row}>
          <CalculatorButton label="1" onPress={() => onDigit('1')} />
          <CalculatorButton label="2" onPress={() => onDigit('2')} />
          <CalculatorButton label="3" onPress={() => onDigit('3')} />
          <CalculatorButton
            label="+"
            variant="operator"
            onPress={() => onOperator('+')}
          />
        </View>
        <View style={styles.row}>
          <CalculatorButton label="0" flex={2} onPress={() => onDigit('0')} />
          <CalculatorButton
            label="."
            onPress={() => setState(inputDecimal)}
          />
          <CalculatorButton
            label="="
            variant="equals"
            onPress={() => setState(evaluate)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  display: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  displayText: {
    color: '#ffffff',
    fontSize: 72,
    fontWeight: '300',
  },
  pad: {
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
});

export default App;
