import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { useSettings } from '@/hooks/useSettings';
import type { AIModel } from '@/contexts/SettingsContext';

const AI_MODELS = [
  { id: 'gemini-flash' as AIModel, name: 'Gemini Flash', desc: 'سريع ومتوازن - الافتراضي' },
  { id: 'gemini-pro' as AIModel, name: 'Gemini Pro', desc: 'الأقوى للمهام المعقدة' },
  { id: 'gpt-5-mini' as AIModel, name: 'GPT-5 Mini', desc: 'متوازن وسريع' },
  { id: 'gpt-5' as AIModel, name: 'GPT-5', desc: 'الأقوى من OpenAI' },
];

const FONT_SIZES = [
  { id: 'small' as const, name: 'صغير', size: 14 },
  { id: 'medium' as const, name: 'متوسط', size: 16 },
  { id: 'large' as const, name: 'كبير', size: 18 },
];

const MAX_IMAGE_SIZES = [
  { value: 3, label: '3 MB' },
  { value: 5, label: '5 MB' },
  { value: 10, label: '10 MB' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, resetSettings } = useSettings();
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showImageSizePicker, setShowImageSizePicker] = useState(false);

  const handleReset = () => {
    Alert.alert(
      'إعادة تعيين الإعدادات',
      'هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إعادة تعيين',
          style: 'destructive',
          onPress: () => {
            resetSettings();
            Alert.alert('تم', 'تم إعادة تعيين الإعدادات بنجاح');
          },
        },
      ]
    );
  };

  const currentModel = AI_MODELS.find(m => m.id === settings.aiModel);
  const currentFontSize = FONT_SIZES.find(f => f.id === settings.fontSize);
  const currentImageSize = MAX_IMAGE_SIZES.find(s => s.value === settings.maxImageSize);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]} edges={['top']}>
      <LinearGradient colors={['#1a1a1a', '#0a0a0a']} style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialIcons name="settings" size={32} color={theme.colors.primary} />
          <Text style={styles.title}>الإعدادات</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* AI Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات الذكاء الاصطناعي</Text>
          
          <Pressable
            style={styles.settingRow}
            onPress={() => setShowModelPicker(!showModelPicker)}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>نموذج الذكاء الاصطناعي</Text>
              <Text style={styles.settingValue}>{currentModel?.name}</Text>
            </View>
            <MaterialIcons
              name={showModelPicker ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={24}
              color={theme.colors.textSecondary}
            />
          </Pressable>

          {showModelPicker && (
            <View style={styles.picker}>
              {AI_MODELS.map((model) => (
                <Pressable
                  key={model.id}
                  style={[
                    styles.pickerItem,
                    settings.aiModel === model.id && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    updateSettings({ aiModel: model.id });
                    setShowModelPicker(false);
                  }}
                >
                  <View>
                    <Text
                      style={[
                        styles.pickerItemText,
                        settings.aiModel === model.id && styles.pickerItemTextActive,
                      ]}
                    >
                      {model.name}
                    </Text>
                    <Text style={styles.pickerItemDesc}>{model.desc}</Text>
                  </View>
                  {settings.aiModel === model.id && (
                    <MaterialIcons name="check" size={24} color={theme.colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Display Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات العرض</Text>
          
          <Pressable
            style={styles.settingRow}
            onPress={() => setShowFontPicker(!showFontPicker)}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>حجم الخط</Text>
              <Text style={styles.settingValue}>{currentFontSize?.name}</Text>
            </View>
            <MaterialIcons
              name={showFontPicker ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={24}
              color={theme.colors.textSecondary}
            />
          </Pressable>

          {showFontPicker && (
            <View style={styles.picker}>
              {FONT_SIZES.map((size) => (
                <Pressable
                  key={size.id}
                  style={[
                    styles.pickerItem,
                    settings.fontSize === size.id && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    updateSettings({ fontSize: size.id });
                    setShowFontPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      { fontSize: size.size },
                      settings.fontSize === size.id && styles.pickerItemTextActive,
                    ]}
                  >
                    {size.name}
                  </Text>
                  {settings.fontSize === size.id && (
                    <MaterialIcons name="check" size={24} color={theme.colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>إظهار التوقيت</Text>
              <Text style={styles.settingDesc}>عرض وقت إنشاء وتعديل الملاحظات</Text>
            </View>
            <Switch
              value={settings.showTimestamps}
              onValueChange={(value) => updateSettings({ showTimestamps: value })}
              trackColor={{ false: '#333', true: theme.colors.primaryDark }}
              thumbColor={settings.showTimestamps ? theme.colors.primary : '#666'}
            />
          </View>
        </View>

        {/* Media Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات الوسائط</Text>
          
          <Pressable
            style={styles.settingRow}
            onPress={() => setShowImageSizePicker(!showImageSizePicker)}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>الحد الأقصى لحجم الصورة</Text>
              <Text style={styles.settingValue}>{currentImageSize?.label}</Text>
            </View>
            <MaterialIcons
              name={showImageSizePicker ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={24}
              color={theme.colors.textSecondary}
            />
          </Pressable>

          {showImageSizePicker && (
            <View style={styles.picker}>
              {MAX_IMAGE_SIZES.map((size) => (
                <Pressable
                  key={size.value}
                  style={[
                    styles.pickerItem,
                    settings.maxImageSize === size.value && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    updateSettings({ maxImageSize: size.value });
                    setShowImageSizePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      settings.maxImageSize === size.value && styles.pickerItemTextActive,
                    ]}
                  >
                    {size.label}
                  </Text>
                  {settings.maxImageSize === size.value && (
                    <MaterialIcons name="check" size={24} color={theme.colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات عامة</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>الحفظ التلقائي</Text>
              <Text style={styles.settingDesc}>حفظ التغييرات تلقائياً أثناء الكتابة</Text>
            </View>
            <Switch
              value={settings.autoSave}
              onValueChange={(value) => updateSettings({ autoSave: value })}
              trackColor={{ false: '#333', true: theme.colors.primaryDark }}
              thumbColor={settings.autoSave ? theme.colors.primary : '#666'}
            />
          </View>
        </View>

        {/* Reset Button */}
        <Pressable
          style={({ pressed }) => [styles.resetButton, pressed && styles.resetButtonPressed]}
          onPress={handleReset}
        >
          <MaterialIcons name="restore" size={20} color={theme.colors.error} />
          <Text style={styles.resetButtonText}>إعادة تعيين جميع الإعدادات</Text>
        </Pressable>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>تطبيق الملاحظات الذكي</Text>
          <Text style={styles.appInfoVersion}>الإصدار 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  content: {
    flex: 1,
  },
  
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 100,
  },
  
  section: {
    marginBottom: theme.spacing.xl,
  },
  
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  
  settingInfo: {
    flex: 1,
  },
  
  settingLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: 4,
  },
  
  settingValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
  },
  
  settingDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  picker: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
  },
  
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  pickerItemActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  
  pickerItemText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  
  pickerItemTextActive: {
    color: theme.colors.primary,
  },
  
  pickerItemDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
    marginTop: theme.spacing.xl,
  },
  
  resetButtonPressed: {
    opacity: 0.7,
  },
  
  resetButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.error,
  },
  
  appInfo: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  
  appInfoText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  
  appInfoVersion: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTertiary,
    marginTop: 4,
  },
});
