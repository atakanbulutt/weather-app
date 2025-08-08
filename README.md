# 🌤️ Hava Durumu Uygulaması (Weather App)

Modern, responsive ve kullanıcı dostu bir hava durumu uygulaması. React, TypeScript ve OpenWeatherMap API kullanılarak geliştirilmiştir.

## ✨ Özellikler

### 🌍 Temel Özellikler
- **Gerçek Zamanlı Hava Durumu**: Mevcut hava durumu bilgileri
- **5 Günlük Tahmin**: Detaylı hava durumu tahmini
- **Konum Tabanlı Arama**: GPS konumunuzu kullanarak otomatik hava durumu
- **Şehir Arama**: Dünya genelinde şehir arama özelliği
- **Responsive Tasarım**: Mobil, tablet ve masaüstü uyumlu

### 🎨 Kullanıcı Deneyimi
- **Açık/Koyu Tema**: Otomatik tema değiştirme
- **Çoklu Dil Desteği**: Türkçe ve İngilizce
- **Birim Seçenekleri**: Celsius ve Fahrenheit
- **Animasyonlar**: Framer Motion ile akıcı geçişler
- **Offline Desteği**: LocalStorage ile veri saklama

### 🔧 Teknik Özellikler
- **React Query**: Gelişmiş veri yönetimi ve cache
- **TypeScript**: Tip güvenliği
- **Context API**: Durum yönetimi
- **React Router**: Sayfa yönlendirme
- **i18next**: Uluslararasılaştırma

## 🚀 Kurulum

### Gereksinimler
- Node.js (v16 veya üzeri)
- npm veya yarn

### Adım Adım Kurulum

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd weather-app
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Uygulamayı başlatın**
```bash
npm start
```

Uygulama `http://localhost:3000` adresinde açılacaktır.

## 📱 Kullanım

### Ana Sayfa
- **Arama Çubuğu**: Şehir adı girerek hava durumu arayın
- **Konum Butonu**: GPS konumunuzu kullanarak hava durumu alın
- **Hava Durumu Kartı**: Mevcut hava durumu bilgileri
- **Tahmin Kartı**: 5 günlük hava durumu tahmini

### Dashboard
- Kayıtlı şehirlerinizi görüntüleyin
- Yeni şehir ekleyin
- Şehirleri kaldırın

### Ayarlar
- **Tema**: Açık/Koyu tema seçimi
- **Dil**: Türkçe/İngilizce dil seçimi
- **Birim**: Celsius/Fahrenheit sıcaklık birimi

## 🛠️ Teknik Detaylar

### Proje Yapısı
```
src/
├── components/          # UI bileşenleri
│   ├── Forecast.tsx    # Hava durumu tahmini
│   ├── SearchBar.tsx   # Arama çubuğu
│   ├── Settings.tsx    # Ayarlar bileşeni
│   └── WeatherDisplay.tsx # Hava durumu gösterimi
├── contexts/           # React Context'leri
│   ├── LanguageContext.tsx
│   ├── ThemeContext.tsx
│   └── UnitContext.tsx
├── hooks/              # Custom React hooks
│   └── useWeather.ts   # Hava durumu veri yönetimi
├── i18n/               # Uluslararasılaştırma
│   └── translations.ts
├── pages/              # Sayfa bileşenleri
│   ├── DashboardPage.tsx
│   ├── HomePage.tsx
│   └── SettingsPage.tsx
├── services/           # API servisleri
│   └── weatherService.ts
├── styles/             # CSS stilleri
│   └── global.css
└── types/              # TypeScript tip tanımları
    └── weather.ts
```

### API Entegrasyonu
- **OpenWeatherMap API**: Hava durumu verileri
- **Geolocation API**: Kullanıcı konumu
- **React Query**: Veri fetching ve cache yönetimi

### Veri Yönetimi
- **LocalStorage**: Kullanıcı tercihleri ve hava durumu verileri
- **React Query Cache**: API verilerinin önbelleklenmesi
- **Context API**: Uygulama durumu yönetimi

## 🎯 Özellik Detayları

### Hava Durumu Bilgileri
- Sıcaklık (mevcut, hissedilen, min/max)
- Nem oranı
- Rüzgar hızı ve yönü
- Basınç
- Görüş mesafesi
- Güneş doğuşu/batışı saatleri
- Hava durumu açıklaması

### Tahmin Özellikleri
- 5 günlük detaylı tahmin
- Saatlik hava durumu değişimi
- Yağış olasılığı
- Sıcaklık grafikleri

### Kullanıcı Tercihleri
- Tema tercihi (açık/koyu)
- Dil seçimi (Türkçe/İngilizce)
- Sıcaklık birimi (Celsius/Fahrenheit)
- Otomatik konum izni

## 🔧 Geliştirme

### Mevcut Scriptler
```bash
npm start          # Geliştirme sunucusunu başlat
npm run build      # Production build oluştur
npm test           # Testleri çalıştır
npm run lint       # ESLint kontrolü
npm run lint:fix   # ESLint düzeltmeleri
npm run format     # Prettier formatlama
```

### Yeni Özellik Ekleme
1. Yeni bileşen oluşturun (`src/components/`)
2. Tip tanımlarını ekleyin (`src/types/`)
3. Çevirileri ekleyin (`src/i18n/translations.ts`)
4. Stil dosyalarını güncelleyin (`src/styles/`)

## 🌐 API Konfigürasyonu

### OpenWeatherMap API
- **Base URL**: `https://api.openweathermap.org/data/2.5`
- **API Key**: `src/constants/api.ts` dosyasında tanımlı
- **Endpoints**:
  - `/weather`: Mevcut hava durumu
  - `/forecast`: 5 günlük tahmin

### API Limitleri
- Ücretsiz plan: 1000 istek/gün
- Rate limiting: 60 istek/dakika

## 📱 Mobil Optimizasyon

### Responsive Tasarım
- **Mobile First**: Mobil öncelikli tasarım
- **Touch Friendly**: Dokunmatik ekran optimizasyonu
- **Performance**: Hızlı yükleme ve akıcı animasyonlar

### PWA Özellikleri
- Offline çalışma desteği
- App-like deneyim
- Push notification hazırlığı

## 🧪 Test

### Test Stratejisi
- **Unit Tests**: Bileşen testleri
- **Integration Tests**: API entegrasyon testleri
- **E2E Tests**: Kullanıcı senaryoları

### Test Çalıştırma
```bash
npm test           # Tüm testleri çalıştır
npm test -- --watch # Watch modunda test
npm test -- --coverage # Coverage raporu
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deployment Seçenekleri
- **Vercel**: Otomatik deployment
- **Netlify**: Static site hosting
- **GitHub Pages**: Ücretsiz hosting
- **Firebase Hosting**: Google Cloud hosting

## 🤝 Katkıda Bulunma

### Geliştirme Süreci
1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

### Kod Standartları
- **ESLint**: Kod kalitesi kontrolü
- **Prettier**: Kod formatlama
- **TypeScript**: Tip güvenliği
- **Conventional Commits**: Commit mesaj standartları

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 🙏 Teşekkürler

- **OpenWeatherMap**: Hava durumu API'si
- **React Team**: Harika framework
- **Framer Motion**: Animasyon kütüphanesi
- **React Query**: Veri yönetimi

## 📞 İletişim

- **GitHub**: [Proje Sayfası]
- **Email**: [İletişim Email'i]
- **Issues**: [GitHub Issues]

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
