export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    // Navigation
    notes: 'ملاحظاتي',
    chat: 'محادثة AI',
    settings: 'الإعدادات',
    
    // Notes Screen
    searchPlaceholder: 'ابحث في ملاحظاتك...',
    all: 'الكل',
    favorites: 'المفضلة',
    emptyNotes: 'ابدأ بإنشاء ملاحظتك الأولى',
    emptySearch: 'لا توجد ملاحظات تطابق البحث',
    emptyFavorites: 'لا توجد ملاحظات مفضلة بعد',
    
    // Note Detail
    titlePlaceholder: 'عنوان الملاحظة...',
    contentPlaceholder: 'ابدأ الكتابة هنا... حدد النص ثم اضغط على أزرار التنسيق',
    unsaved: 'غير محفوظ',
    saved: 'تم الحفظ',
    deleteNote: 'حذف الملاحظة',
    deleteConfirm: 'هل أنت متأكد من حذف هذه الملاحظة؟',
    cancel: 'إلغاء',
    delete: 'حذف',
    words: 'كلمة',
    characters: 'حرف',
    
    // Voice
    voiceRecording: 'تسجيل صوتي',
    listening: 'استمع...',
    recording: 'تسجيل...',
    stopRecording: 'إيقاف',
    playRecording: 'تشغيل',
    pauseRecording: 'إيقاف مؤقت',
    
    // AI
    aiProcessing: 'جاري المعالجة...',
    improve: 'تحسين النص',
    summarize: 'تلخيص',
    generateTitle: 'توليد عنوان',
    extractPoints: 'استخراج نقاط',
    toList: 'تحويل لقائمة',
    translateAr: 'ترجمة للعربية',
    translateEn: 'ترجمة للإنجليزية',
    
    // Settings
    aiSettings: 'إعدادات الذكاء الاصطناعي',
    displaySettings: 'إعدادات العرض',
    mediaSettings: 'إعدادات الوسائط',
    dataSettings: 'إعدادات البيانات',
    generalSettings: 'إعدادات عامة',
    aiModel: 'نموذج الذكاء الاصطناعي',
    fontSize: 'حجم الخط',
    showTimestamps: 'إظهار التوقيت',
    maxImageSize: 'الحد الأقصى لحجم الصورة',
    language: 'اللغة',
    autoSave: 'الحفظ التلقائي',
    exportData: 'تصدير البيانات',
    importData: 'استيراد البيانات',
    resetSettings: 'إعادة تعيين جميع الإعدادات',
    
    // Data Management
    exportSuccess: 'تم تصدير البيانات بنجاح',
    exportError: 'فشل التصدير',
    importSuccess: 'تم استيراد {{count}} ملاحظة بنجاح',
    importError: 'فشل الاستيراد',
    shareNote: 'مشاركة الملاحظة',
    shareSuccess: 'تمت المشاركة بنجاح',
    shareError: 'فشلت المشاركة',
    
    // Folders
    selectFolder: 'اختر المجلد',
    createFolder: 'إنشاء مجلد جديد',
    folderName: 'اسم المجلد',
    folderNamePlaceholder: 'اكتب اسم المجلد...',
    icon: 'الأيقونة',
    color: 'اللون',
    create: 'إنشاء',
    
    // Messages
    success: 'نجح',
    error: 'خطأ',
    warning: 'تنبيه',
    confirm: 'تأكيد',
    done: 'تم',
    
    // Storage
    storageUsed: 'المساحة المستخدمة',
    storageAvailable: 'المساحة المتاحة',
  },
  
  en: {
    // Navigation
    notes: 'My Notes',
    chat: 'AI Chat',
    settings: 'Settings',
    
    // Notes Screen
    searchPlaceholder: 'Search your notes...',
    all: 'All',
    favorites: 'Favorites',
    emptyNotes: 'Create your first note',
    emptySearch: 'No notes match your search',
    emptyFavorites: 'No favorite notes yet',
    
    // Note Detail
    titlePlaceholder: 'Note title...',
    contentPlaceholder: 'Start writing here... Select text then use formatting buttons',
    unsaved: 'Unsaved',
    saved: 'Saved',
    deleteNote: 'Delete Note',
    deleteConfirm: 'Are you sure you want to delete this note?',
    cancel: 'Cancel',
    delete: 'Delete',
    words: 'words',
    characters: 'chars',
    
    // Voice
    voiceRecording: 'Voice Recording',
    listening: 'Listening...',
    recording: 'Recording...',
    stopRecording: 'Stop',
    playRecording: 'Play',
    pauseRecording: 'Pause',
    
    // AI
    aiProcessing: 'Processing...',
    improve: 'Improve Text',
    summarize: 'Summarize',
    generateTitle: 'Generate Title',
    extractPoints: 'Extract Points',
    toList: 'Convert to List',
    translateAr: 'Translate to Arabic',
    translateEn: 'Translate to English',
    
    // Settings
    aiSettings: 'AI Settings',
    displaySettings: 'Display Settings',
    mediaSettings: 'Media Settings',
    dataSettings: 'Data Settings',
    generalSettings: 'General Settings',
    aiModel: 'AI Model',
    fontSize: 'Font Size',
    showTimestamps: 'Show Timestamps',
    maxImageSize: 'Max Image Size',
    language: 'Language',
    autoSave: 'Auto Save',
    exportData: 'Export Data',
    importData: 'Import Data',
    resetSettings: 'Reset All Settings',
    
    // Data Management
    exportSuccess: 'Data exported successfully',
    exportError: 'Export failed',
    importSuccess: 'Imported {{count}} notes successfully',
    importError: 'Import failed',
    shareNote: 'Share Note',
    shareSuccess: 'Shared successfully',
    shareError: 'Share failed',
    
    // Folders
    selectFolder: 'Select Folder',
    createFolder: 'Create New Folder',
    folderName: 'Folder Name',
    folderNamePlaceholder: 'Enter folder name...',
    icon: 'Icon',
    color: 'Color',
    create: 'Create',
    
    // Messages
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    confirm: 'Confirm',
    done: 'Done',
    
    // Storage
    storageUsed: 'Storage Used',
    storageAvailable: 'Storage Available',
  },
};

export function t(key: string, lang: Language, params?: Record<string, any>): string {
  let text = translations[lang][key as keyof typeof translations['ar']] || key;
  
  if (params) {
    Object.keys(params).forEach(param => {
      text = text.replace(`{{${param}}}`, params[param]);
    });
  }
  
  return text;
}
