import {
  clearAll,
  evaluate,
  initialState,
  inputDecimal,
  inputDigit,
  inputPercent,
  setOperator,
  toggleSign,
} from '../src/calculator';

function pressDigits(value: string) {
  return value
    .split('')
    .reduce((state, digit) => inputDigit(state, digit), initialState);
}

test('adds two numbers', () => {
  let state = pressDigits('12');
  state = setOperator(state, '+');
  state = inputDigit(state, '3');
  state = evaluate(state);
  expect(state.display).toBe('15');
});

test('divides and reports error on divide by zero', () => {
  let state = pressDigits('8');
  state = setOperator(state, '÷');
  state = inputDigit(state, '0');
  state = evaluate(state);
  expect(state.display).toBe('Error');
});

test('chains operators without pressing equals', () => {
  let state = pressDigits('5');
  state = setOperator(state, '+');
  state = pressDigitsFrom(state, '5');
  state = setOperator(state, '×');
  expect(state.display).toBe('10');
  state = pressDigitsFrom(state, '2');
  state = evaluate(state);
  expect(state.display).toBe('20');
});

test('supports decimal, percent, sign, and clear', () => {
  let state = inputDecimal(initialState);
  state = inputDigit(state, '5');
  expect(state.display).toBe('0.5');

  state = inputPercent(state);
  expect(state.display).toBe('0.005');

  state = toggleSign(state);
  expect(state.display).toBe('-0.005');

  state = clearAll();
  expect(state).toEqual(initialState);
});

function pressDigitsFrom(
  start: ReturnType<typeof inputDigit>,
  value: string,
) {
  return value.split('').reduce((state, digit) => inputDigit(state, digit), start);
}
