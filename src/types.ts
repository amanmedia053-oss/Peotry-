export type Language = 'ps' | 'dr' | 'en';

export type Category = 'لارښود' | 'ارواپوهنه' | 'شعرونه' | 'ستړي آهونه';

export interface Poem {
  id: string;
  category: Category;
  text: string;
  title?: string;
}

export type ListDesign = 'simple' | 'card' | 'gradient' | 'minimal' | 'image';

export type AppColor = 'green' | 'blue' | 'purple' | 'red' | 'orange' | 'teal' | 'pink' | 'gold' | 'gray' | 'black';

export interface AppState {
  language: Language;
  themeColor: AppColor;
  isDarkMode: boolean;
  favorites: string[];
  pinned: string[];
  history: string[];
  onboardingComplete: boolean;
  listDesign: ListDesign;
}

export const translations = {
  ps: {
    appName: "پښتو شعرونه",
    home: "کور",
    guide: "لارښود",
    psychology: "ارواپوهنه",
    poetry: "شعرونه",
    sadSighs: "ستړي آهونه",
    favorites: "خوښې ليکنې",
    pinned: "سنجاق شوې ليکنې",
    history: "لوستل شوې ليکنې",
    swipeReading: "Swipe Reading",
    changeColor: "د اپ رنګ بدلول",
    changeLanguage: "ژبه بدلول",
    privacyPolicy: "Privacy Policy",
    aboutApp: "About App",
    dailyWriting: "د ورځې ځانګړې ليکنه",
    categories: "اصلي کټګورۍ",
    copy: "کاپي",
    share: "شريکول",
    whatsapp: "واټساپ",
    facebook: "فېسبوک",
    other: "نور",
    favorite: "خوښه",
    pin: "سنجاق",
    exitTitle: "ايا غواړئ له اپ څخه ووځئ؟",
    yes: "هو",
    no: "نه",
    settings: "ترتيبات",
    onboarding1: "د اپ پېژندنه",
    onboarding2: "د شعرونو او ليکنو لوستل",
    onboarding3: "Favorites او Pin فيچر",
    onboarding4: "Swipe Reading System",
    next: "بل",
    skip: "تېرېدل",
    start: "پيل",
    developer: "کاريال جوړوونکی",
    design: "ډيزاين",
    listDesign: "د ليست ډيزاين",
    darkMode: "توره بڼه",
    search: "پلټنه..."
  },
  dr: {
    appName: "اشعار پشتو",
    home: "خانه",
    guide: "رهنما",
    psychology: "روانشناسی",
    poetry: "اشعار",
    sadSighs: "آه های خسته",
    favorites: "نوشته های مورد علاقه",
    pinned: "نوشته های سنجاق شده",
    history: "تاریخچه خواندن",
    swipeReading: "Swipe Reading",
    changeColor: "تغییر رنگ اپلیکیشن",
    changeLanguage: "تغییر زبان",
    privacyPolicy: "Privacy Policy",
    aboutApp: "About App",
    dailyWriting: "نوشته ویژه روز",
    categories: "دسته بندی های اصلی",
    copy: "کاپی",
    share: "اشتراک گذاری",
    whatsapp: "واتساپ",
    facebook: "فیسبوک",
    other: "دیگر",
    favorite: "علاقه",
    pin: "سنجاق",
    exitTitle: "آیا می خواهید از برنامه خارج شوید؟",
    yes: "بله",
    no: "نخیر",
    settings: "تنظیمات",
    onboarding1: "معرفی برنامه",
    onboarding2: "خواندن اشعار و نوشته ها",
    onboarding3: "ویژگی Favorites و Pin",
    onboarding4: "سیستم Swipe Reading",
    next: "بعدی",
    skip: "رد کردن",
    start: "شروع",
    developer: "توسعه دهنده",
    design: "دیزاین",
    listDesign: "دیزاین لیست",
    darkMode: "حالت تاریک",
    search: "جستجو..."
  },
  en: {
    appName: "Pashto Poetry",
    home: "Home",
    guide: "Guide",
    psychology: "Psychology",
    poetry: "Poetry",
    sadSighs: "Sad Sighs",
    favorites: "Favorites",
    pinned: "Pinned",
    history: "Reading History",
    swipeReading: "Swipe Reading",
    changeColor: "Change App Color",
    changeLanguage: "Change Language",
    privacyPolicy: "Privacy Policy",
    aboutApp: "About App",
    dailyWriting: "Daily Special Writing",
    categories: "Main Categories",
    copy: "Copy",
    share: "Share",
    whatsapp: "WhatsApp",
    facebook: "Facebook",
    other: "Other",
    favorite: "Favorite",
    pin: "Pin",
    exitTitle: "Do you want to exit the app?",
    yes: "Yes",
    no: "No",
    settings: "Settings",
    onboarding1: "App Introduction",
    onboarding2: "Reading Poetry and Writings",
    onboarding3: "Favorites and Pin Feature",
    onboarding4: "Swipe Reading System",
    next: "Next",
    skip: "Skip",
    start: "Start",
    developer: "Developer",
    design: "Design",
    listDesign: "List Design",
    darkMode: "Dark Mode",
    search: "Search..."
  }
};
