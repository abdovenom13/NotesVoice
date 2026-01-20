import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { useSettings } from '@/hooks/useSettings';
import { useSecurity } from '@/hooks/useSecurity';
import { useTranslation } from '@/hooks/useTranslation';
import { dataService } from '@/services/dataService';
import { useAlert } from '@/template';
import type { AIModel } from '@/contexts/SettingsContext';
import type { SecurityMethod } from '@/contexts/SecurityContext';

const AI_MODELS = [
  { id: 'gemini-flash' as AIModel, name: 'Gemini 3 Flash', desc: 'سريع ومتوازن - الافتراضي' },
  { id: 'gemini-flash-lite' as AIModel, name: 'Gemini 2.5 Flash Lite', desc: 'الأسرع والأرخص' },
  { id: 'gemini-pro' as AIModel, name: 'Gemini 3 Pro', desc: 'الأقوى للمهام المعقدة' },
  { id: 'gpt-5' as AIModel, name: 'GPT-5.1', desc: 'الأقوى من OpenAI' },
  { id: 'gpt-5-mini' as AIModel, name: 'GPT-5 Mini', desc: 'متوازن وسريع' },
  { id: 'gpt-5-nano' as AIModel, name: 'GPT-5 Nano', desc: 'الأسرع من GPT-5' },
  { id: 'gemini-flash-image' as AIModel, name: 'Gemini Flash Image', desc: 'توليد وتعديل الصور' },
  { id: 'gemini-pro-image' as AIModel, name: 'Gemini Pro Image', desc: 'توليد صور احترافية' },
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
  { value: 20, label: '20 MB' },
  { value: 50, label: '50 MB' },
];

const LANGUAGES = [
  { id: 'ar' as const, name: 'العربية', nameEn: 'Arabic' },
  { id: 'en' as const, name: 'الإنجليزية', nameEn: 'English' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, resetSettings } = useSettings();
  const { settings: securitySettings, updateSecurityMethod, updateAutoLockDelay, isBiometricAvailable } = useSecurity();
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const [storageInfo, setStorageInfo] = useState({ used: '...', available: '...' });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showImageSizePicker, setShowImageSizePicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showSecurityPicker, setShowSecurityPicker] = useState(false);
  const [showPatternSetup, setShowPatternSetup] = useState(false);
  const [patternInput, setPatternInput] = useState<number[]>([]);
  const [confirmPattern, setConfirmPattern] = useState<number[]>([]);

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    const info = await dataService.getStorageInfo();
    setStorageInfo(info);
  };

  const handleExport = async () => {
    setIsExporting(true);
    const result = await dataService.exportData();
    setIsExporting(false);
    
    if (result.success) {
      showAlert(t('success'), t('exportSuccess'));
    } else {
      showAlert(t('error'), result.error || t('exportError'));
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    const result = await dataService.importData();
    setIsImporting(false);
    
    if (result.success && result.count !== undefined) {
      showAlert(t('success'), t('importSuccess', { count: result.count }));
      await loadStorageInfo();
    } else if (result.error) {
      showAlert(t('error'), result.error);
    }
  };

  const handleReset = () => {
    showAlert(
      t('resetSettings'),
      'هل أنت متأكد من إعادة تعيين جميع الإعدادات؟',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: 'إعادة تعيين',
          style: 'destructive',
          onPress: () => {
            resetSettings();
            showAlert(t('done'), 'تم إعادة تعيين الإعدادات بنجاح');
          },
        },
      ]
    );
  };

  const currentModel = AI_MODELS.find(m => m.id === settings.aiModel);
  const currentFontSize = FONT_SIZES.find(f => f.id === settings.fontSize);
  const currentImageSize = MAX_IMAGE_SIZES.find(s => s.value === settings.maxImageSize);
  const currentLanguage = LANGUAGES.find(l => l.id === settings.language);

  const SECURITY_METHODS = [
    { id: 'none' as SecurityMethod, name: 'بدون قفل', available: true },
    { id: 'biometric' as SecurityMethod, name: 'البصمة/الوجه', available: isBiometricAvailable },
    { id: 'pattern' as SecurityMethod, name: 'النمط', available: true },
  ];

  const currentSecurityMethod = SECURITY_METHODS.find(m => m.id === securitySettings.method);

  const handleSecurityMethodChange = async (method: SecurityMethod) => {
    if (method === 'pattern') {
      setShowSecurityPicker(false);
      setShowPatternSetup(true);
    } else {
      await updateSecurityMethod(method);
      setShowSecurityPicker(false);
      showAlert('تم', 'تم تحديث طريقة القفل');
    }
  };

  const handlePatternDot = (index: number) => {
    if (confirmPattern.length > 0) {
      if (confirmPattern.includes(index)) return;
      const newPattern = [...confirmPattern, index];
      setConfirmPattern(newPattern);
      
      if (newPattern.length >= 4) {
        verifyPatternSetup(newPattern);
      }
    } else {
      if (patternInput.includes(index)) return;
      const newPattern = [...patternInput, index];
      setPatternInput(newPattern);
      
      if (newPattern.length >= 4) {
        showAlert('تأكيد', 'الرجاء إعادة رسم النمط للتأكيد', [
          { text: 'إعادة', style: 'cancel', onPress: () => setPatternInput([]) },
        ]);
      }
    }
  };

  const verifyPatternSetup = async (confirm: number[]) => {
    if (patternInput.join('') === confirm.join('')) {
      await updateSecurityMethod('pattern', patternInput.join(''));
      setShowPatternSetup(false);
      setPatternInput([]);
      setConfirmPattern([]);
      showAlert('تم', 'تم تعيين النمط بنجاح');
    } else {
      showAlert('خطأ', 'النمطان غير متطابقين، حاول مرة أخرى');
      setPatternInput([]);
      setConfirmPattern([]);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]} edges={['top']}>
      <LinearGradient colors={['#1a1a1a', '#0a0a0a']} style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialIcons name="settings" size={32} color={theme.colors.primary} />
          <Text style={styles.title}>{t('settings')}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* AI Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('aiSettings')}</Text>
          
          <Pressable
            style={styles.settingRow}
            onPress={() => setShowModelPicker(!showModelPicker)}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('aiModel')}</Text>
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
          <Text style={styles.sectionTitle}>{t('displaySettings')}</Text>
          
          <Pressable
            style={styles.settingRow}
            onPress={() => setShowFontPicker(!showFontPicker)}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('fontSize')}</Text>
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

          <Pressable
            style={styles.settingRow}
            onPress={() => setShowLanguagePicker(!showLanguagePicker)}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('language')}</Text>
              <Text style={styles.settingValue}>{settings.language === 'ar' ? 'العربية' : 'English'}</Text>
            </View>
            <MaterialIcons
              name={showLanguagePicker ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={24}
              color={theme.colors.textSecondary}
            />
          </Pressable>

          {showLanguagePicker && (
            <View style={styles.picker}>
              {LANGUAGES.map((lang) => (
                <Pressable
                  key={lang.id}
                  style={[
                    styles.pickerItem,
                    settings.language === lang.id && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    updateSettings({ language: lang.id });
                    setShowLanguagePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      settings.language === lang.id && styles.pickerItemTextActive,
                    ]}
                  >
                    {lang.name} ({lang.nameEn})
                  </Text>
                  {settings.language === lang.id && (
                    <MaterialIcons name="check" size={24} color={theme.colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('showTimestamps')}</Text>
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
          <Text style={styles.sectionTitle}>{t('mediaSettings')}</Text>
          
          <Pressable
            style={styles.settingRow}
            onPress={() => setShowImageSizePicker(!showImageSizePicker)}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('maxImageSize')}</Text>
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

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dataSettings')}</Text>
          
          <View style={styles.storageInfo}>
            <View style={styles.storageRow}>
              <MaterialIcons name="storage" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.storageLabel}>{t('storageUsed')}:</Text>
              <Text style={styles.storageValue}>{storageInfo.used}</Text>
            </View>
            <View style={styles.storageRow}>
              <MaterialIcons name="cloud" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.storageLabel}>{t('storageAvailable')}:</Text>
              <Text style={styles.storageValue}>{storageInfo.available}</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.dataButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <MaterialIcons name="file-download" size={20} color={theme.colors.primary} />
            )}
            <Text style={styles.dataButtonText}>{t('exportData')}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.dataButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleImport}
            disabled={isImporting}
          >
            {isImporting ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <MaterialIcons name="file-upload" size={20} color={theme.colors.primary} />
            )}
            <Text style={styles.dataButtonText}>{t('importData')}</Text>
          </Pressable>
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الأمان والخصوصية</Text>
          
          <Pressable
            style={styles.settingRow}
            onPress={() => setShowSecurityPicker(!showSecurityPicker)}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>طريقة القفل</Text>
              <Text style={styles.settingValue}>{currentSecurityMethod?.name}</Text>
            </View>
            <MaterialIcons
              name={showSecurityPicker ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={24}
              color={theme.colors.textSecondary}
            />
          </Pressable>

          {showSecurityPicker && (
            <View style={styles.picker}>
              {SECURITY_METHODS.filter(m => m.available).map((method) => (
                <Pressable
                  key={method.id}
                  style={[
                    styles.pickerItem,
                    securitySettings.method === method.id && styles.pickerItemActive,
                  ]}
                  onPress={() => handleSecurityMethodChange(method.id)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      securitySettings.method === method.id && styles.pickerItemTextActive,
                    ]}
                  >
                    {method.name}
                  </Text>
                  {securitySettings.method === method.id && (
                    <MaterialIcons name="check" size={24} color={theme.colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('generalSettings')}</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{t('autoSave')}</Text>
              <Text style={styles.settingDesc}>حفظ التغييرات تلقائياً أثناء الكتابة</Text>
            </View>
            <Switch
              value={settings.autoSave}
              onValueChange={(value) => updateSettings({ autoSave: value })}
              trackColor={{ false: '#333', true: theme.colors.primaryDark }}
              thumbColor={settings.autoSave ? theme.colors.primary : '#666'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>العرض المضغوط</Text>
              <Text style={styles.settingDesc}>عرض المزيد من الملاحظات في الشاشة</Text>
            </View>
            <Switch
              value={settings.compactView}
              onValueChange={(value) => updateSettings({ compactView: value })}
              trackColor={{ false: '#333', true: theme.colors.primaryDark }}
              thumbColor={settings.compactView ? theme.colors.primary : '#666'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>التدقيق الإملائي</Text>
              <Text style={styles.settingDesc}>تفعيل التدقيق الإملائي التلقائي</Text>
            </View>
            <Switch
              value={settings.enableSpellCheck}
              onValueChange={(value) => updateSettings({ enableSpellCheck: value })}
              trackColor={{ false: '#333', true: theme.colors.primaryDark }}
              thumbColor={settings.enableSpellCheck ? theme.colors.primary : '#666'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>عداد الكلمات</Text>
              <Text style={styles.settingDesc}>إظهار عدد الكلمات في الملاحظات</Text>
            </View>
            <Switch
              value={settings.enableWordCount}
              onValueChange={(value) => updateSettings({ enableWordCount: value })}
              trackColor={{ false: '#333', true: theme.colors.primaryDark }}
              thumbColor={settings.enableWordCount ? theme.colors.primary : '#666'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>النسخ الاحتياطي التلقائي</Text>
              <Text style={styles.settingDesc}>نسخ احتياطي تلقائي للملاحظات</Text>
            </View>
            <Switch
              value={settings.enableAutoBackup}
              onValueChange={(value) => updateSettings({ enableAutoBackup: value })}
              trackColor={{ false: '#333', true: theme.colors.primaryDark }}
              thumbColor={settings.enableAutoBackup ? theme.colors.primary : '#666'}
            />
          </View>
        </View>

        {/* Reset Button */}
        <Pressable
          style={({ pressed }) => [styles.resetButton, pressed && styles.resetButtonPressed]}
          onPress={handleReset}
        >
          <MaterialIcons name="restore" size={20} color={theme.colors.error} />
          <Text style={styles.resetButtonText}>{t('resetSettings')}</Text>
        </Pressable>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Moriyumi</Text>
          <Text style={styles.appInfoVersion}>الإصدار 1.0.0</Text>
          <Text style={styles.appInfoDesc}>تطبيق ملاحظات ذكي بدون حدود</Text>
        </View>

        {/* Pattern Setup Modal */}
        <Modal
          visible={showPatternSetup}
          animationType="slide"
          transparent
          onRequestClose={() => {
            setShowPatternSetup(false);
            setPatternInput([]);
            setConfirmPattern([]);
          }}
        >
          <View style={styles.patternModal}>
            <View style={styles.patternContainer}>
              <Text style={styles.patternTitle}>
                {confirmPattern.length > 0 ? 'أعد رسم النمط' : 'ارسم نمطاً (4 نقاط على الأقل)'}
              </Text>
              
              <View style={styles.patternGrid}>
                {Array.from({ length: 9 }).map((_, index) => {
                  const currentPattern = confirmPattern.length > 0 ? confirmPattern : patternInput;
                  const isSelected = currentPattern.includes(index);
                  
                  return (
                    <Pressable
                      key={index}
                      onPress={() => handlePatternDot(index)}
                      style={styles.patternDot}
                    >
                      <View style={[
                        styles.patternDotInner,
                        isSelected && styles.patternDotSelected,
                      ]} />
                    </Pressable>
                  );
                })}
              </View>
              
              <Pressable
                onPress={() => {
                  setShowPatternSetup(false);
                  setPatternInput([]);
                  setConfirmPattern([]);
                }}
                style={styles.patternCancel}
              >
                <Text style={styles.patternCancelText}>إلغاء</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
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
  
  appInfoDesc: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  
  storageInfo: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  
  storageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  
  storageLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  
  storageValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.semibold,
  },
  
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  
  dataButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  
  buttonPressed: {
    opacity: 0.7,
  },

  patternModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },

  patternContainer: {
    alignItems: 'center',
    gap: theme.spacing.xl,
  },

  patternTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
  },

  patternGrid: {
    width: 240,
    height: 240,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  patternDot: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },

  patternDotInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },

  patternDotSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    transform: [{ scale: 1.5 }],
  },

  patternCancel: {
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },

  patternCancelText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
});
