export type Operator = '+' | '-' | '×' | '÷';

export type CalculatorState = {
  display: string;
  previous: number | null;
  operator: Operator | null;
  waitingForOperand: boolean;
};

export const initialState: CalculatorState = {
  display: '0',
  previous: null,
  operator: null,
  waitingForOperand: false,
};

const MAX_DIGITS = 12;

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return 'Error';
  }

  const rounded = Number.parseFloat(value.toPrecision(12));
  let text = String(rounded);

  if (text.includes('e')) {
    return text;
  }

  if (text.replace('-', '').replace('.', '').length > MAX_DIGITS) {
    return rounded.toExponential(6);
  }

  return text;
}

function toNumber(display: string): number {
  if (display === 'Error') {
    return 0;
  }
  return Number.parseFloat(display);
}

function compute(left: number, right: number, operator: Operator): number {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '×':
      return left * right;
    case '÷':
      return right === 0 ? Number.NaN : left / right;
  }
}

export function inputDigit(
  state: CalculatorState,
  digit: string,
): CalculatorState {
  if (state.display === 'Error' || state.waitingForOperand) {
    return {
      ...state,
      display: digit,
      waitingForOperand: false,
    };
  }

  if (state.display === '0') {
    return { ...state, display: digit };
  }

  const next = state.display + digit;
  const digits = next.replace('-', '').replace('.', '');
  if (digits.length > MAX_DIGITS) {
    return state;
  }

  return { ...state, display: next };
}

export function inputDecimal(state: CalculatorState): CalculatorState {
  if (state.display === 'Error' || state.waitingForOperand) {
    return {
      ...state,
      display: '0.',
      waitingForOperand: false,
    };
  }

  if (state.display.includes('.')) {
    return state;
  }

  return { ...state, display: `${state.display}.` };
}

export function clearAll(): CalculatorState {
  return initialState;
}

export function toggleSign(state: CalculatorState): CalculatorState {
  if (state.display === 'Error' || state.display === '0') {
    return state;
  }

  if (state.display.startsWith('-')) {
    return { ...state, display: state.display.slice(1) };
  }

  return { ...state, display: `-${state.display}` };
}

export function inputPercent(state: CalculatorState): CalculatorState {
  if (state.display === 'Error') {
    return state;
  }

  return {
    ...state,
    display: formatNumber(toNumber(state.display) / 100),
  };
}

export function setOperator(
  state: CalculatorState,
  operator: Operator,
): CalculatorState {
  if (state.display === 'Error') {
    return { ...initialState, operator, waitingForOperand: true };
  }

  const current = toNumber(state.display);

  if (state.previous !== null && state.operator && !state.waitingForOperand) {
    const result = compute(state.previous, current, state.operator);
    return {
      display: formatNumber(result),
      previous: Number.isFinite(result) ? result : null,
      operator,
      waitingForOperand: true,
    };
  }

  return {
    ...state,
    previous: current,
    operator,
    waitingForOperand: true,
  };
}

export function evaluate(state: CalculatorState): CalculatorState {
  if (
    state.display === 'Error' ||
    state.previous === null ||
    state.operator === null
  ) {
    return state;
  }

  const result = compute(
    state.previous,
    toNumber(state.display),
    state.operator,
  );

  return {
    display: formatNumber(result),
    previous: null,
    operator: null,
    waitingForOperand: true,
  };
}
