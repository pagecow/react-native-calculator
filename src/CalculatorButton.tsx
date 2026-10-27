import { Pressable, StyleSheet, Text } from 'react-native';

type ButtonVariant = 'number' | 'operator' | 'utility' | 'equals';

type CalculatorButtonProps = {
  label: string;
  variant?: ButtonVariant;
  flex?: number;
  onPress: () => void;
};

const variantStyles: Record<
  ButtonVariant,
  { background: string; color: string }
> = {
  number: { background: '#333333', color: '#ffffff' },
  operator: { background: '#ff9f0a', color: '#ffffff' },
  utility: { background: '#a5a5a5', color: '#000000' },
  equals: { background: '#ff9f0a', color: '#ffffff' },
};

export function CalculatorButton({
  label,
  variant = 'number',
  flex = 1,
  onPress,
}: CalculatorButtonProps) {
  const colors = variantStyles[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.background, flex },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.label, { color: colors.color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    margin: 6,
    borderRadius: 40,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: 32,
    fontWeight: '500',
  },
});
