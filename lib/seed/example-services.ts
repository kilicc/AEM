// Örnek teknik servis form şablonları
// Bu formlar admin tarafından seçilebilir

export const exampleServiceTemplates = [
  {
    name: 'Elektrik Trafo Bakım',
    description: 'Elektrik trafo bakım ve kontrol işlemleri için teknik servis formu',
    form_template: {
      title: 'ELEKTRİK TRAFO BAKIM TEKNİK SERVİS FORMU',
      sections: [
        {
          title: 'MÜŞTERİ BİLGİLERİ',
          fields: [
            { type: 'text', name: 'musteri_adi', label: 'Müşteri Adı', autoFill: 'customer.name', required: true },
            { type: 'text', name: 'musteri_telefon', label: 'Telefon', autoFill: 'customer.phone', required: true },
            { type: 'text', name: 'musteri_adres', label: 'Adres', autoFill: 'customer.address', required: true },
            { type: 'text', name: 'musteri_il', label: 'İl', autoFill: 'customer.city' },
            { type: 'text', name: 'musteri_ilce', label: 'İlçe', autoFill: 'customer.district' },
          ]
        },
        {
          title: 'TRAFO BİLGİLERİ',
          fields: [
            { type: 'text', name: 'trafo_gucu', label: 'Trafo Gücü (kVA)', required: true },
            { type: 'text', name: 'trafo_marka', label: 'Marka/Model', required: true },
            { type: 'text', name: 'trafo_seri_no', label: 'Seri No' },
            { type: 'text', name: 'trafo_uretim_yili', label: 'Üretim Yılı' },
            { type: 'text', name: 'trafo_konum', label: 'Konum Bilgisi', required: true },
          ]
        },
        {
          title: 'BAKIM İŞLEMLERİ',
          fields: [
            { type: 'checkbox', name: 'gorsel_kontrol', label: 'Görsel Kontrol Yapıldı' },
            { type: 'checkbox', name: 'temizlik', label: 'Temizlik Yapıldı' },
            { type: 'checkbox', name: 'yag_analizi', label: 'Yağ Analizi Yapıldı' },
            { type: 'checkbox', name: 'izolasyon_olcumu', label: 'İzolasyon Ölçümü Yapıldı' },
            { type: 'checkbox', name: 'baglanti_kontrolu', label: 'Bağlantı Kontrolü Yapıldı' },
            { type: 'checkbox', name: 'koruyucu_cihaz_kontrolu', label: 'Koruyucu Cihaz Kontrolü Yapıldı' },
            { type: 'textarea', name: 'yapilan_islemler', label: 'Yapılan İşlemler Detayı', required: true, rows: 5 },
            { type: 'textarea', name: 'tespit_edilen_arizalar', label: 'Tespit Edilen Arızalar', rows: 4 },
            { type: 'textarea', name: 'oneriler', label: 'Öneriler', rows: 3 },
          ]
        },
        {
          title: 'ÖLÇÜMLER',
          fields: [
            { type: 'number', name: 'gerilim_prim', label: 'Primer Gerilim (V)', unit: 'V' },
            { type: 'number', name: 'gerilim_sek', label: 'Sekonder Gerilim (V)', unit: 'V' },
            { type: 'number', name: 'akim_prim', label: 'Primer Akım (A)', unit: 'A' },
            { type: 'number', name: 'akim_sek', label: 'Sekonder Akım (A)', unit: 'A' },
            { type: 'number', name: 'sogutma_sicaklik', label: 'Soğutma Sıcaklığı (°C)', unit: '°C' },
            { type: 'number', name: 'izolasyon_direnci', label: 'İzolasyon Direnci (MΩ)', unit: 'MΩ' },
          ]
        },
        {
          title: 'MALZEME KULLANIMI',
          fields: [
            { type: 'info', name: 'malzeme_bilgisi', label: 'Kullanılan malzemeler depodan seçilecektir' }
          ]
        },
        {
          title: 'FOTOĞRAFLAR',
          fields: [
            { type: 'info', name: 'foto_bilgisi', label: 'Öncesi ve sonrası fotoğraflar yüklenecektir' }
          ]
        },
        {
          title: 'İMZALAR',
          fields: [
            { type: 'signature', name: 'calisan_imza', label: 'Çalışan İmzası', required: true },
            { type: 'signature', name: 'musteri_imza', label: 'Müşteri İmzası', required: true },
          ]
        }
      ]
    }
  },
  {
    name: 'Klima Bakım ve Onarım',
    description: 'Klima cihazları için bakım ve onarım teknik servis formu',
    form_template: {
      title: 'KLİMA BAKIM VE ONARIM TEKNİK SERVİS FORMU',
      sections: [
        {
          title: 'MÜŞTERİ BİLGİLERİ',
          fields: [
            { type: 'text', name: 'musteri_adi', label: 'Müşteri Adı', autoFill: 'customer.name', required: true },
            { type: 'text', name: 'musteri_telefon', label: 'Telefon', autoFill: 'customer.phone', required: true },
            { type: 'text', name: 'musteri_adres', label: 'Adres', autoFill: 'customer.address', required: true },
          ]
        },
        {
          title: 'KLİMA BİLGİLERİ',
          fields: [
            { type: 'text', name: 'klima_marka', label: 'Marka', required: true },
            { type: 'text', name: 'klima_model', label: 'Model', required: true },
            { type: 'text', name: 'klima_seri_no', label: 'Seri No' },
            { type: 'text', name: 'klima_kapasite', label: 'Kapasite (BTU)', required: true },
            { type: 'text', name: 'klima_tip', label: 'Tip (Split/Duvar/Tavan)', required: true },
            { type: 'text', name: 'montaj_yeri', label: 'Montaj Yeri', required: true },
          ]
        },
        {
          title: 'BAKIM İŞLEMLERİ',
          fields: [
            { type: 'checkbox', name: 'filtre_temizligi', label: 'Filtre Temizliği Yapıldı' },
            { type: 'checkbox', name: 'gaz_kontrolu', label: 'Gaz Kontrolü Yapıldı' },
            { type: 'checkbox', name: 'elektrik_kontrolu', label: 'Elektrik Bağlantı Kontrolü' },
            { type: 'checkbox', name: 'drenaj_temizligi', label: 'Drenaj Temizliği' },
            { type: 'checkbox', name: 'dis_unite_temizligi', label: 'Dış Ünite Temizliği' },
            { type: 'textarea', name: 'yapilan_islemler', label: 'Yapılan İşlemler Detayı', required: true, rows: 5 },
            { type: 'textarea', name: 'ariza_tespiti', label: 'Arıza Tespiti', rows: 4 },
          ]
        },
        {
          title: 'ÖLÇÜMLER',
          fields: [
            { type: 'number', name: 'gaz_basinci', label: 'Gaz Basıncı (PSI)', unit: 'PSI' },
            { type: 'number', name: 'calisma_akimi', label: 'Çalışma Akımı (A)', unit: 'A' },
            { type: 'number', name: 'sicaklik_ayar', label: 'Sıcaklık Ayarı (°C)', unit: '°C' },
          ]
        },
        {
          title: 'MALZEME KULLANIMI',
          fields: [
            { type: 'info', name: 'malzeme_bilgisi', label: 'Kullanılan malzemeler depodan seçilecektir' }
          ]
        },
        {
          title: 'FOTOĞRAFLAR',
          fields: [
            { type: 'info', name: 'foto_bilgisi', label: 'Öncesi ve sonrası fotoğraflar yüklenecektir' }
          ]
        },
        {
          title: 'İMZALAR',
          fields: [
            { type: 'signature', name: 'calisan_imza', label: 'Çalışan İmzası', required: true },
            { type: 'signature', name: 'musteri_imza', label: 'Müşteri İmzası', required: true },
          ]
        }
      ]
    }
  },
  {
    name: 'Elektrik Panosu Bakım',
    description: 'Elektrik pano bakım ve kontrol işlemleri için teknik servis formu',
    form_template: {
      title: 'ELEKTRİK PANOSU BAKIM TEKNİK SERVİS FORMU',
      sections: [
        {
          title: 'MÜŞTERİ BİLGİLERİ',
          fields: [
            { type: 'text', name: 'musteri_adi', label: 'Müşteri Adı', autoFill: 'customer.name', required: true },
            { type: 'text', name: 'musteri_telefon', label: 'Telefon', autoFill: 'customer.phone', required: true },
            { type: 'text', name: 'musteri_adres', label: 'Adres', autoFill: 'customer.address', required: true },
          ]
        },
        {
          title: 'PANO BİLGİLERİ',
          fields: [
            { type: 'text', name: 'pano_tip', label: 'Pano Tipi', required: true },
            { type: 'text', name: 'pano_gucu', label: 'Güç (kW)', required: true },
            { type: 'text', name: 'pano_konum', label: 'Konum', required: true },
            { type: 'text', name: 'pano_uretim_yili', label: 'Üretim Yılı' },
          ]
        },
        {
          title: 'BAKIM İŞLEMLERİ',
          fields: [
            { type: 'checkbox', name: 'gorsel_kontrol', label: 'Görsel Kontrol' },
            { type: 'checkbox', name: 'temizlik', label: 'Temizlik' },
            { type: 'checkbox', name: 'baglanti_kontrolu', label: 'Bağlantı Kontrolü' },
            { type: 'checkbox', name: 'sigorta_kontrolu', label: 'Sigorta Kontrolü' },
            { type: 'checkbox', name: 'topraklama_kontrolu', label: 'Topraklama Kontrolü' },
            { type: 'checkbox', name: 'izolasyon_olcumu', label: 'İzolasyon Ölçümü' },
            { type: 'textarea', name: 'yapilan_islemler', label: 'Yapılan İşlemler Detayı', required: true, rows: 5 },
            { type: 'textarea', name: 'tespit_edilen_arizalar', label: 'Tespit Edilen Arızalar', rows: 4 },
          ]
        },
        {
          title: 'ÖLÇÜMLER',
          fields: [
            { type: 'number', name: 'gerilim_faz1', label: 'Faz 1 Gerilim (V)', unit: 'V' },
            { type: 'number', name: 'gerilim_faz2', label: 'Faz 2 Gerilim (V)', unit: 'V' },
            { type: 'number', name: 'gerilim_faz3', label: 'Faz 3 Gerilim (V)', unit: 'V' },
            { type: 'number', name: 'topraklama_direnci', label: 'Topraklama Direnci (Ω)', unit: 'Ω' },
          ]
        },
        {
          title: 'MALZEME KULLANIMI',
          fields: [
            { type: 'info', name: 'malzeme_bilgisi', label: 'Kullanılan malzemeler depodan seçilecektir' }
          ]
        },
        {
          title: 'FOTOĞRAFLAR',
          fields: [
            { type: 'info', name: 'foto_bilgisi', label: 'Öncesi ve sonrası fotoğraflar yüklenecektir' }
          ]
        },
        {
          title: 'İMZALAR',
          fields: [
            { type: 'signature', name: 'calisan_imza', label: 'Çalışan İmzası', required: true },
            { type: 'signature', name: 'musteri_imza', label: 'Müşteri İmzası', required: true },
          ]
        }
      ]
    }
  },
  {
    name: 'Jeneratör Bakım',
    description: 'Jeneratör bakım ve kontrol işlemleri için teknik servis formu',
    form_template: {
      title: 'JENERATÖR BAKIM TEKNİK SERVİS FORMU',
      sections: [
        {
          title: 'MÜŞTERİ BİLGİLERİ',
          fields: [
            { type: 'text', name: 'musteri_adi', label: 'Müşteri Adı', autoFill: 'customer.name', required: true },
            { type: 'text', name: 'musteri_telefon', label: 'Telefon', autoFill: 'customer.phone', required: true },
            { type: 'text', name: 'musteri_adres', label: 'Adres', autoFill: 'customer.address', required: true },
          ]
        },
        {
          title: 'JENERATÖR BİLGİLERİ',
          fields: [
            { type: 'text', name: 'jenerator_marka', label: 'Marka', required: true },
            { type: 'text', name: 'jenerator_model', label: 'Model', required: true },
            { type: 'text', name: 'jenerator_gucu', label: 'Güç (kVA)', required: true },
            { type: 'text', name: 'jenerator_seri_no', label: 'Seri No' },
            { type: 'text', name: 'motor_tip', label: 'Motor Tipi', required: true },
          ]
        },
        {
          title: 'BAKIM İŞLEMLERİ',
          fields: [
            { type: 'checkbox', name: 'yag_degisimi', label: 'Yağ Değişimi' },
            { type: 'checkbox', name: 'filtre_degisimi', label: 'Filtre Değişimi' },
            { type: 'checkbox', name: 'akumulator_kontrolu', label: 'Akümülatör Kontrolü' },
            { type: 'checkbox', name: 'soğutma_sistemi', label: 'Soğutma Sistemi Kontrolü' },
            { type: 'checkbox', name: 'elektrik_kontrolu', label: 'Elektrik Kontrolü' },
            { type: 'checkbox', name: 'test_calismasi', label: 'Test Çalışması Yapıldı' },
            { type: 'textarea', name: 'yapilan_islemler', label: 'Yapılan İşlemler Detayı', required: true, rows: 5 },
            { type: 'textarea', name: 'tespit_edilen_arizalar', label: 'Tespit Edilen Arızalar', rows: 4 },
          ]
        },
        {
          title: 'ÖLÇÜMLER',
          fields: [
            { type: 'number', name: 'cikis_gerilimi', label: 'Çıkış Gerilimi (V)', unit: 'V' },
            { type: 'number', name: 'cikis_frekansi', label: 'Çıkış Frekansı (Hz)', unit: 'Hz' },
            { type: 'number', name: 'yuk_akimi', label: 'Yük Akımı (A)', unit: 'A' },
            { type: 'number', name: 'motor_sicaklik', label: 'Motor Sıcaklığı (°C)', unit: '°C' },
          ]
        },
        {
          title: 'MALZEME KULLANIMI',
          fields: [
            { type: 'info', name: 'malzeme_bilgisi', label: 'Kullanılan malzemeler depodan seçilecektir' }
          ]
        },
        {
          title: 'FOTOĞRAFLAR',
          fields: [
            { type: 'info', name: 'foto_bilgisi', label: 'Öncesi ve sonrası fotoğraflar yüklenecektir' }
          ]
        },
        {
          title: 'İMZALAR',
          fields: [
            { type: 'signature', name: 'calisan_imza', label: 'Çalışan İmzası', required: true },
            { type: 'signature', name: 'musteri_imza', label: 'Müşteri İmzası', required: true },
          ]
        }
      ]
    }
  },
  {
    name: 'Genel Teknik Servis',
    description: 'Genel amaçlı teknik servis formu',
    form_template: {
      title: 'TEKNİK SERVİS FORMU',
      sections: [
        {
          title: 'MÜŞTERİ BİLGİLERİ',
          fields: [
            { type: 'text', name: 'musteri_adi', label: 'Müşteri Adı', autoFill: 'customer.name', required: true },
            { type: 'text', name: 'musteri_telefon', label: 'Telefon', autoFill: 'customer.phone', required: true },
            { type: 'text', name: 'musteri_adres', label: 'Adres', autoFill: 'customer.address', required: true },
          ]
        },
        {
          title: 'CİHAZ BİLGİLERİ',
          fields: [
            { type: 'text', name: 'cihaz_tip', label: 'Cihaz Tipi', required: true },
            { type: 'text', name: 'cihaz_marka', label: 'Marka' },
            { type: 'text', name: 'cihaz_model', label: 'Model' },
            { type: 'text', name: 'cihaz_seri_no', label: 'Seri No' },
          ]
        },
        {
          title: 'SERVİS İŞLEMLERİ',
          fields: [
            { type: 'textarea', name: 'yapilan_islemler', label: 'Yapılan İşlemler', required: true, rows: 6 },
            { type: 'textarea', name: 'ariza_tespiti', label: 'Arıza Tespiti', rows: 4 },
            { type: 'textarea', name: 'oneriler', label: 'Öneriler', rows: 3 },
          ]
        },
        {
          title: 'MALZEME KULLANIMI',
          fields: [
            { type: 'info', name: 'malzeme_bilgisi', label: 'Kullanılan malzemeler depodan seçilecektir' }
          ]
        },
        {
          title: 'FOTOĞRAFLAR',
          fields: [
            { type: 'info', name: 'foto_bilgisi', label: 'Öncesi ve sonrası fotoğraflar yüklenecektir' }
          ]
        },
        {
          title: 'İMZALAR',
          fields: [
            { type: 'signature', name: 'calisan_imza', label: 'Çalışan İmzası', required: true },
            { type: 'signature', name: 'musteri_imza', label: 'Müşteri İmzası', required: true },
          ]
        }
      ]
    }
  }
]

