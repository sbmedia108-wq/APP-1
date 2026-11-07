import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import { colors, radius, shadow, space, STATUS_META, type } from '@/theme';
import type { QuoteStatus } from '@/lib/types';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const Icon = (p: { name: IconName; size?: number; color?: string }) => <MaterialCommunityIcons name={p.name} size={p.size ?? 20} color={p.color ?? colors.text} />;

export const tap = () => {
  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

export function Card({ children, style, onPress }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  if (onPress)
    return (
      <Pressable onPress={() => { tap(); onPress(); }} style={({ pressed }) => [s.card, style, pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }]}>
        {children}
      </Pressable>
    );
  return <View style={[s.card, style]}>{children}</View>;
}

type BtnVariant = 'primary' | 'dark' | 'ghost' | 'whatsapp' | 'danger';

export function Button({ title, onPress, icon, variant = 'primary', loading, disabled, style, small }: { title: string; onPress: () => void; icon?: IconName; variant?: BtnVariant; loading?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle>; small?: boolean }) {
  const v = {
    primary: { bg: colors.amber, fg: colors.ink, border: colors.amber },
    dark: { bg: colors.ink, fg: colors.white, border: colors.ink },
    ghost: { bg: colors.card, fg: colors.text, border: colors.line },
    whatsapp: { bg: colors.whatsapp, fg: colors.white, border: colors.whatsapp },
    danger: { bg: colors.card, fg: colors.red, border: colors.line },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={() => { tap(); onPress(); }}
      style={({ pressed }) => [s.btn, small && s.btnSmall, { backgroundColor: v.bg, borderColor: v.border, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 }, style]}
    >
      {loading ? <ActivityIndicator color={v.fg} /> : icon ? <Icon name={icon} size={small ? 16 : 20} color={v.fg} /> : null}
      <Text style={[s.btnText, small && { fontSize: 14 }, { color: v.fg }]}>{title}</Text>
    </Pressable>
  );
}

export function StatusPill({ status }: { status: QuoteStatus }) {
  const m = STATUS_META[status];
  return (
    <View style={[s.pill, { backgroundColor: m.bg }]}>
      <View style={[s.dot, { backgroundColor: m.fg }]} />
      <Text style={[s.pillText, { color: m.fg }]}>{m.label}</Text>
    </View>
  );
}

export function Label({ children, style }: { children: ReactNode; style?: StyleProp<any> }) {
  return <Text style={[type.label, { color: colors.faint }, style]}>{children}</Text>;
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={s.sectionHead}>
      <Text style={[type.h2, { color: colors.text }]}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text style={{ color: colors.amberDeep, fontWeight: '700' }}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Field({ label, style, ...rest }: TextInputProps & { label: string }) {
  return (
    <View style={[{ gap: 6 }, style as StyleProp<ViewStyle>]}>
      <Label>{label}</Label>
      <TextInput placeholderTextColor={colors.faint} {...rest} style={[s.input, rest.multiline && { minHeight: 88, textAlignVertical: 'top' }]} />
    </View>
  );
}

export function Chip({ label, active, onPress, icon, onDark }: { label: string; active?: boolean; onPress: () => void; icon?: IconName; onDark?: boolean }) {
  const on = onDark ? { bg: colors.amber, fg: colors.ink } : { bg: colors.ink, fg: colors.white };
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: !!active }} onPress={() => { tap(); onPress(); }} style={[s.chip, active && { backgroundColor: on.bg, borderColor: on.bg }]}>
      {icon ? <Icon name={icon} size={15} color={active ? on.fg : colors.muted} /> : null}
      <Text style={[s.chipText, active && { color: on.fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Empty({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  return (
    <View style={{ alignItems: 'center', padding: space(10), gap: 8 }}>
      <View style={s.emptyIcon}>
        <Icon name={icon} size={28} color={colors.amberDeep} />
      </View>
      <Text style={[type.h3, { color: colors.text }]}>{title}</Text>
      <Text style={{ color: colors.muted, textAlign: 'center', lineHeight: 20 }}>{body}</Text>
    </View>
  );
}

export const s = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: space(4), borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, ...shadow },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 54, paddingHorizontal: space(5), borderRadius: radius.md, borderWidth: 1 },
  btnSmall: { height: 40, paddingHorizontal: space(3.5), borderRadius: radius.sm },
  btnText: { fontSize: 16, fontWeight: '700', letterSpacing: -0.1 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 12, fontWeight: '700' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: space(7), marginBottom: space(3) },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.text },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 36, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.muted },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: colors.amberSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
});
