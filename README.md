# Vibra

Sesli kanallar, 4K 60 FPS ekran paylaşımı, dosya paylaşımı ve kayıt koduyla açılan hesaplarla çalışan sohbet uygulaması.
**Hiç bağımlılık yok**: `npm install` gerekmez, sadece Node.js 22.5 veya üstü yeterli.

## Çalıştırma

```bash
node server.js
# ya da: npm start
```

Sonra tarayıcıdan http://localhost:3000 adresini aç. Mikrofon ve ekran paylaşımı `localhost` veya HTTPS üzerinde çalışır.

## Kayıt kodu

Hesap açmak için tek bir **sabit kayıt kodu** gerekir: `12345678` (e-posta yok). Giriş kullanıcı adı + şifre ile yapılır.
Kodu değiştirmek için sunucuyu `REG_CODE` ile başlat (internete açıyorsan mutlaka değiştir, 8 haneli sayı kolay tahmin edilir):

```bash
REG_CODE=gizli-kodum node server.js
```

Eski (e-postalı) bir veritabanın varsa ilk açılışta otomatik dönüştürülür.

## Profil özelleştirme

Sol alttaki kullanıcı alanına (ya da ⚙ → Profilimi Özelleştir) tıkla: avatar yükle (PNG/JPEG/WebP/GIF, GIF hareketli kalır), ana renk, gradyan afiş, durum yazısı ve "Hakkında" metni. Canlı önizleme var. Üye listesinde, mesajlarda veya ses kanalında birinin avatarına/adına tıklayınca profil kartı açılır.

## Diğer ayarlar

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `PORT` | 3000 | Dinlenen port |
| `HOST` | 0.0.0.0 | Dinlenen adres (sadece kendin için `127.0.0.1`) |
| `MAX_UPLOAD_MB` | 100 | Dosya yükleme sınırı |
| `DATA_DIR` | ./data | Veritabanı (SQLite) ve yüklenen dosyalar |
| `SSL_CERT`, `SSL_KEY` | yok | HTTPS için sertifika ve anahtar dosyaları |

## Neler var

- Kayıt koduyla hesap oluşturma, giriş/çıkış, profil özelleştirme (avatar, afiş, renk, durum, hakkında) (şifreler scrypt ile saklanır)
- Sunucu oluşturma, davet koduyla katılma, metin ve ses kanalı oluşturma
- Anlık mesajlaşma, "yazıyor..." göstergesi, çevrimiçi listesi, okunmamış sayaçları, mesaj silme, emoji
- Dosya yükleme: butonla, sürükle-bırak veya yapıştırarak (100 MB). Görsel/video/ses önizlenir, diğerleri indirme kartı olur
- Sesli kanallar (WebRTC), sustur / sağırlaştır, konuşan kişinin yeşil halkası
- 🎴 **3D Okey masası**: Ses kanalındayken **3D Dünya → Ev** içinde sağdaki masaya yürü, bir sandalyenin yanında **E** ile otur. Oturunca "Botlarla doldurulsun mu?" diye sorar: **🤖 Botlarla Başlat** eksik koltukları botlarla doldurup oyunu hemen başlatır (botlar masada oturan karakterlerdir), ya da arkadaşlarını bekleyip 4 kişi olunca **Başlat**'a basarsın. Bota ait koltuğa bir insan oturursa bot çıkar; oyun sırasında biri kalkarsa yerine bot geçer, masada hiç insan kalmazsa botlar silinir. Gerçek okey kuralları: 106 taş, gösterge + okey (joker), sahte okey, 14/15 taş dağıtımı, desteden ya da soldaki oyuncunun attığı taştan çekme, per/seri (12-13-1 dahil) kontrolü **sunucuda** yapılır, **Bitir** ile el doğrulanır. Taşları sürükleyerek dizebilirsin, çift tık = at, 🎨 Seri Diz / 🔢 Per Diz ile sırala. Rafta geçerli per/seriler yeşil çerçevelenir, el hazırsa kırmızı parlayan taş atılacak taştır ve Bitir yanar. Kısayollar: C deste, V soldan, Enter at, G/H diz. El bitince herkesin taşları masada açılır. Oyun sırasında biri kalkarsa el iptal olur. Sesli sohbet masadayken de açık kalır.
- Ekran paylaşımı: 4K·60 FPS (varsayılan), 1440p·60, 1080p·60, 720p·30. Sistem sesi dahil (tarayıcı destekliyorsa). Yayın sırasında kalite değiştirilebilir

## Bilmen gerekenler

- **Ses/ekran mimarisi:** Kullanıcılar birbirine doğrudan bağlanır (mesh). Ekran paylaşan kişi her izleyiciye ayrı yayın gönderir; 4K 60 FPS için izleyici başına yaklaşık 45 Mbps yükleme gerekir. Küçük gruplar için uygundur; kalabalık kanallar için LiveKit gibi bir SFU gerekir.
- **Farklı ağlardaki kullanıcılar:** Sadece genel STUN sunucuları kullanılır. Bazı ağlarda (kurumsal, simetrik NAT) bağlantı kurulamaz; bunun için bir TURN sunucusu (örn. coturn) eklemek gerekir (`public/app.js` içindeki `ICE`).
- **Gerçek 4K:** Yakalama çözünürlüğü ekranınla sınırlıdır; tarayıcı ve işlemci gerekirse otomatik düşürür.
- **İnternete açarken:** Mikrofon/ekran paylaşımı için HTTPS şart. Önüne Caddy/nginx koyabilir veya `SSL_CERT`/`SSL_KEY` verebilirsin.

## Henüz yok

Özel mesajlar, arkadaş listesi, roller/yetkiler, mesaj düzenleme ve tepkiler, kamera, mobil uygulama.

## 3D Dünya (sesli sohbetin içinde)

Bir ses kanalına katıl → alttaki **🏕️ 3D Dünya** butonu. İçinde:
- **Kamp ateşi lobisi:** ateş, kıvılcımlar, ateşböcekleri, yıldızlı gece; kütüklerde 12 oturma yeri.
- **Ev (TV odası):** ışıktaki portaldan girilir; kanepe/puflar ve TV. TV'nin yanında **E** (ya da üstteki **📺 TV** butonu) ile kumanda açılır: **link yapıştır** (YouTube, Vimeo, Twitch, doğrudan .mp4/.webm…) ya da **ekranını TV'ye yansıt** (veya kanaldaki başka birinin paylaşımını seç). Herkes aynı şeyi izler: oynat/duraklat/10 sn ileri-geri senkron, TV'ye yaklaştıkça ses artar, kumandadan **Tam ekran** yapılabilir. Bazı siteler gömülmeye izin vermez (YouTube/Vimeo/Twitch ve doğrudan video linkleri sorunsuz).
- Karakterlerin üstünde isim etiketi, konuşurken yeşil parlama. Yürüme, zıplama, oturma, emote (👋💃🦘👏).
- Ses efektleri: katılma/ayrılma, mute/deaf, mesaj, ekran paylaşımı, adım, oturma, TV, kapı, ateş çıtırtısı (yaklaştıkça artar).
- **Karakter editörü:** ⚙ → Karakterimi Düzenle (yüz, saç, üst, alt, ayakkabı, şapka, gözlük + 3D önizleme).
- three.js ilk açılışta cdnjs'ten yüklenir (internet gerekir).

- **Ormanda dövüş:** Orman çok daha geniş (yüzlerce ağaç, çadırlar, meşaleler, geniş kamp alanı). Ormanda kurt, yaban domuzu, ayı ve geyikler dolaşır. **F** (ya da 👊 butonu) ile yumruk at, **Shift** ile koş. Ateşin 11 birim çevresi güvenli bölgedir; hayvanlar giremez ve ateşin yanında canın hızlı dolar. Hayvanlar her oyuncuda yerel çalışır (herkes kendi ormanını görür), yumruk animasyonu diğerlerine yansır.
- **Oturma/kalkma:** Koltuğa yürüyerek süzülüp yumuşakça oturur, kalkarken önce doğrulur sonra yürür.
- **Okey masası:** Ahşap dokulu masa, desenli keçe, altın işlemeler, sandalyeler, çay bardakları (buharlı), sarkıt lamba, halı, pencereler ve tablolar. El bitince kazananın üstünde konfeti patlar.
- **Efektler:** Parıltılı ateş (kor, duman, ışık havuzu), yuvarlak kıvılcım/ateşböceği, ay halesi, çimen/kaya, vuruş kıvılcımları, vuruş izi, adım tozu, vinyet ve ACES ton eşleme.
