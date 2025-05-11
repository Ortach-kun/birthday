# Nisa'nın Doğum Günü Oyunu

Nisa'nın doğum gününü kutlamak için hazırlanmış interaktif bir web oyunu. Balonları patlatarak puanları topla ve Nisa'nın doğum gününü kutla!

## Oyun Özellikleri

- Farklı tipte balonlar (normal, altın, bomba, kalp)
- Puan sistemi ve ilerleme çubuğu
- Kombo sistemi
- Powerup'lar
- Mobil uyumlu tasarım
- Tam ekran kutlama
- Ses efektleri

## Vercel'e Deploy Etme

Bu projeyi Vercel'e kolayca deploy edebilirsiniz:

1. [Vercel](https://vercel.com)'de bir hesap oluşturun veya mevcut hesabınızla giriş yapın
2. Bu projeyi GitHub, GitLab veya Bitbucket'a push edin
3. Vercel'de "New Project" tuşuna basın
4. Repo'nuzu seçin ve "Import" tuşuna basın
5. Ayarları olduğu gibi bırakın (Vercel otomatik olarak statik site yapılandırmasını algılayacaktır)
6. "Deploy" tuşuna basın

Alternatif olarak, Vercel CLI kullanarak deploy edebilirsiniz:

```bash
# Vercel CLI'yı yükleyin
npm install -g vercel

# Projenin olduğu dizine gidin
cd nisa-birthday-game

# Deploy edin
vercel
```

## Yerel Olarak Çalıştırma

Projeyi yerel olarak çalıştırmak için basit bir HTTP sunucusu kullanabilirsiniz:

```bash
# Python kullanarak
python -m http.server 8000

# Veya Node.js kullanarak (önce http-server yükleyin)
npm install -g http-server
http-server
```

Ardından tarayıcınızda `http://localhost:8000` adresine giderek oyunu oynayabilirsiniz.

## Özelleştirme

- `script.js` dosyasında hedef yaşı ve diğer oyun parametrelerini değiştirebilirsiniz
- `styles.css` dosyasında renkleri ve görünümü değiştirebilirsiniz
- `index.html` dosyasında metinleri ve içeriği değiştirebilirsiniz

## Lisans

Bu proje özel kullanım için hazırlanmıştır.

## Nasıl Oynanır

1. Oyunu başlatmak için "Oyuna Başla" düğmesine tıklayın.
2. Yukarı doğru uçan balonları patlayıncaya kadar tıklayın.
3. Toplamda 10 balon patlatmanız gerekiyor.
4. 10 balonu patlattığınızda, ekranda Nisa'nın doğum günü için bir kutlama görüntülenecektir.
5. "Tekrar Oyna" düğmesine tıklayarak oyunu yeniden oynayabilirsiniz.

## Nasıl Kullanılır

1. Tüm dosyaları bir web sunucusuna yükleyin veya yerel olarak açın.
2. Mobil telefon veya tablet gibi dokunmatik ekranlı cihazlarda en iyi şekilde çalışır.
3. İndeks.html dosyasını bir web tarayıcısında açın.

## İyi Eğlenceler ve İyi ki Doğdun Nisa! 🎂 🎉 