import { createContext, useContext, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";

// High contrast, big, warm. Designed for older eyes and less steady hands.
export const colors = {
  bg: "#FFF9F0",
  card: "#FFFFFF",
  text: "#1A1A1A",
  muted: "#4A4A4A",
  primary: "#1F5FBF", // calm blue
  primaryText: "#FFFFFF",
  success: "#1E7B34",
  danger: "#B3261E",
  dangerBg: "#FDECEA",
  listening: "#C62828",
  border: "#D6CFC4",
  hintBg: "#EAF2FF",
};

export const ScaleContext = createContext(1.2);
export const useScale = () => useContext(ScaleContext);

export function T({
  children,
  size = 22,
  bold,
  color = colors.text,
  center,
  style,
}: {
  children: ReactNode;
  size?: number;
  bold?: boolean;
  color?: string;
  center?: boolean;
  style?: TextStyle;
}) {
  const scale = useScale();
  return (
    <Text
      style={[
        {
          fontSize: size * scale,
          lineHeight: size * scale * 1.35,
          color,
          fontWeight: bold ? "700" : "400",
          textAlign: center ? "center" : "left",
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

type Variant = "primary" | "secondary" | "success" | "danger";

export function BigButton({
  label,
  onPress,
  variant = "primary",
  icon,
  style,
  accessibilityHint,
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: string;
  style?: ViewStyle;
  accessibilityHint?: string;
  disabled?: boolean;
}) {
  const bg = {
    primary: colors.primary,
    secondary: colors.card,
    success: colors.success,
    danger: colors.danger,
  }[variant];
  const fg = variant === "secondary" ? colors.text : colors.primaryText;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
        variant === "secondary" && styles.secondary,
        style,
      ]}
    >
      <T size={24} bold color={fg} center>
        {icon ? `${icon}  ` : ""}
        {label}
      </T>
    </Pressable>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  button: {
    minHeight: 76,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
  secondary: {
    borderWidth: 3,
    borderColor: colors.border,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
});
