# ADMIN PANEL — Mühasibatlıq: "Gündəlik Jurnal" tabı (BAS-71, Mərhələ 1)

*Linear:* [BAS-71](https://linear.app/basedaz/issue/BAS-71)
*Yeni səhifə:* /accounting — sol menyuda *"Mühasibatlıq"*
*Backend:* hazırdır (19 test keçir), deploy gözləyir. Spec: repo-dakı ACCOUNTING.md.

Bu tab BasedAz-Muhasibatliq-Sistemi-v2.xlsx faylının *"Gündəlik Jurnal"* vərəqini əvəz edir. İndiyə qədər Mənsurə hər axşam 17:30-da panelə baxıb rəqəmləri əl ilə Excel-ə köçürürdü. Artıq backend özü hesablayır.

> ℹ️ Bu *Mərhələ 1*-dir. Gider, refund və panel xarici gəlir sütunları hələ 0 qayıdır (Mərhələ 2-də model əlavə olunacaq). Cədvəldə göstər, amma boz + "tezliklə" tooltip ilə.

---

## Endpoint-lər

Baza: https://api.based.az/api/bck-admin/accounting/
Auth: admin token. İcazə kodları: *accounting.view* (oxu), *accounting.edit* (parametrləri dəyiş).

| Metod | Endpoint | Təyinat |
|---|---|---|
| GET | /daily/?date_from=&date_to= | Gündəlik jurnal |
| GET | /settings/ | Maliyyə parametrləri |
| PATCH | /settings/ | Parametrləri dəyiş (accounting.edit) |

---

## GET /daily/ — xəta halları (DİQQƏT)

Parametrlər backend-də serializer ilə yoxlanır. *Yanlış tarix səssizcə default aralığa qayıtmır — 400 qaytarır.* UI mütləq bu halı tutmalıdır, yoxsa istifadəçi boş/ağ ekran görəcək.

Cavab formatı DRF-in standart sahə-səviyyəli formatıdır: *açar = sahə adı, dəyər = mətn massivi*.

| Hal | Status | Cavab gövdəsi (real) |
|---|---|---|
| Parametrsiz | 200 | son 30 gün |
| ?date_to=2026-13-45 | 400 | {"date_to": ["Date dəyəri səhvdir. Əvəzinə bu formatlardan birini işlədin: YYYY-MM-DD."]} |
| ?date_from=2026-08-20&date_to=2026-08-10 | 400 | {"date_from": ["date_from date_to-dan sonra ola bilməz."]} |
| Aralıq > 366 gün | 400 | {"date_to": ["Aralıq 366 gündən çox ola bilməz."]} |

Xəta mətnləri *artıq Azərbaycan dilindədir* — birbaşa göstərin, öz tərcümənizi yazmayın. Tarix seçicinin altında sahəyə uyğun qırmızı mətn kimi göstərin.

| Parametr | Format | Default |
|---|---|---|
| date_from | YYYY-MM-DD | date_to − 29 gün |
| date_to | YYYY-MM-DD | bugün |

---

## GET /daily/ — cavab

Aralıqdakı *hər gün* qayıdır — satış olmayan günlər sıfır sətir kimi. Cədvəldə boşluq olmayacaq, "data yoxdur" ekranı göstərməyin.

jsonc
{
  "date_from": "2026-07-26",
  "date_to": "2026-08-24",
  "settings": {
    "epoint_commission_percent": "0.00",
    "kapital_commission_percent": "0.00",
    "average_cost_percent": "0.00",
    "refund_alert_percent": "3.00",
    "cost_price_coverage": { "total": 722, "filled": 0 }
  },
  "snapshot": {
    "pending_orders": 12,
    "kapital_pending": 6,
    "zero_stock_options": 150,
    "open_support": 4,
    "critical_stock_threshold": 3
  },
  "rows": [ /* aşağıdakı sahələr */ ],
  "totals": { /* eyni sahələr, aralıq üzrə cəm */ }
}


*Bütün pul və faiz sahələri string-dir* ("612.40", "0.00"), number deyil — JSON float yuvarlaqlaşmasının qarşısını almaq üçün. Göstərməzdən əvvəl parseFloat edin. *Cəmləri özünüz hesablamayın*, totals obyektindən götürün.

> Müqayisə edərkən də parseFloat işlədin (parseFloat(x) === 0), sətir müqayisəsi (x === "0.00") yox — format gələcəkdə dəyişə bilər.

### Sətir sahələri (Excel sütun sırası ilə)

| JSON açarı | Excel sütunu | Tip | Qeyd |
|---|---|---|---|
| date | Tarix | string | YYYY-MM-DD. Gün adını frontend hesablasın |
| order_count | Sifariş sayı | number | |
| panel_sales | Panel satışı ₼ | string | |
| external_income | Əlavə gəlir ₼ | string | *Mərhələ 2* — "0.00" |
| total_income | ÜMUMİ GƏLİR ₼ | string | Bütün hesabatlar bu rəqəmə baxır |
| average_order_value | Orta çek ₼ | string | |
| epoint_card | EPoint — kartdan ₼ | string | |
| epoint_topup | EPoint — top-up ₼ | string | Balans yükləmələri |
| kapital_card | Kapital — uğurlu ₼ | string | Kapital sifarişləri + Kapital top-up-ları |
| balance_spent | Balansdan ödəniş ₼ | string | ⚠️ *yalnız məlumat* — aşağıya bax |
| card_inflow | Karta gələn cəmi ₼ | string | |
| commission | Komissiya ₼ | string | |
| net_inflow | Xalis daxilolma ₼ | string | |
| refund_count | Refund say | number | *Mərhələ 2* — 0 |
| refund_amount | Refund ₼ | string | *Mərhələ 2* — "0.00" |
| refund_percent | Refund % | string | |
| operating_expense | GİDER — əməliyyat ₼ | string | *Mərhələ 2* — "0.00" |
| cost_of_goods | Maya dəyəri ₼ | string | |
| profit | MƏNFƏƏT ₼ | string | Mənfi ola bilər |
| margin_percent | Marja % | string | |
| ad_spend | Reklam xərci ₼ | string | Mövcud AdSpendDaily-dən |
| roas | ROAS | string \| *null* | Reklam xərci 0-dırsa null — "—" göstər, 0 yox |
| note | Qeyd / səbəb | null | *Mərhələ 2* |

---

## Vacib: bu 3 qaydanı UI-da pozma

Excel faylının özü panelin 3 tələsini sadalayır. Backend hər üçünü düzgün həll edir — *frontend onları geri qaytarmasın.*

1. *balance_spent bank daxilolması DEYİL.* Müştəri balansdan ödəyəndə pul artıq əvvəllər top-up kimi gəlib; onu card_inflow-a əlavə etmək ikiqat sayımdır. Cədvəldə *boz/kursiv* göstər, başlığa "(məlumat)" yaz.
2. *Tarix ödəniş tarixidir.* Backend payed_at üzrə qruplaşdırır. 1 ay əvvəl yaradılmış sifariş bugünkü satışdır. UI-da "sifariş tarixi" kimi adlandırma.
3. *snapshot gündəlik deyil.* pending_orders, kapital_pending, zero_stock_options, open_support — *indiki an*dır, tarixi yoxdur. Cədvəl sətirlərinə YAZMA; cədvəlin üstündə 4 kart kimi göstər.

---

## Xəbərdarlıq blokları

- *Maya dəyəri boşdur.* cost_price_coverage.filled === 0 və parseFloat(average_cost_percent) === 0 olarsa sarı banner:
  > "Maya dəyəri parametri boşdur — mənfəət və marja sütunları 0 göstərir. Parametrlərdən «Orta maya dəyəri %» yazın və ya məhsul variantlarına maya dəyəri əlavə edin."

  Prod-da hazırda *722 variantdan 0-ında* maya dəyəri var → bu banner ilk gün mütləq görünəcək.
- *Komissiya boşdur.* parseFloat(epoint_commission_percent) === 0 → banner: "Komissiya faizi yazılmayıb — «Xalis daxilolma» rəqəmi komissiyasızdır."
- *Refund həddi.* Sətirdə refund_percent > refund_alert_percent → xana qırmızı.
- *Mənfi mənfəət.* profit < 0 → xana qırmızı.
- *Stok bitib.* snapshot.zero_stock_options > 0 → kart sarı/qırmızı.

---

## GET | PATCH /settings/

jsonc
{
  "epoint_commission_percent": "0.00",
  "kapital_commission_percent": "0.00",
  "average_cost_percent": "0.00",
  "critical_stock_threshold": 3,
  "refund_alert_percent": "3.00",
  "opening_bank_balance": "0.00",
  "updated_at": "2026-08-24T18:00:00Z"
}


| Sahə | İzah |
|---|---|
| epoint_commission_percent | EPoint müqaviləsindən. Paneldə heç yerdə göstərilmir, əl ilə yazılır |
| kapital_commission_percent | Kapital Bank müqaviləsindən |
| average_cost_percent | cost_price boş olan variantlar üçün ehtiyat maya təxmini (satışın %-i) |
| critical_stock_threshold | Bundan aşağı qalan stok "bitmək üzrə" |
| refund_alert_percent | Günlük refund faizi bunu keçsə xəbərdarlıq |
| opening_bank_balance | Mərhələ 2-də (Bank və Pul Axını) istifadə olunacaq |

PATCH üçün accounting.edit lazımdır. İcazəsi olmayan moderator üçün formu *read-only* göstər, 403 gözləmə.

---

## Nə etməli — checklist

- [ ] Sol menyuya *"Mühasibatlıq"* bəndi, /accounting route.
- [ ] Tarix aralığı seçici (default: son 30 gün) + "Son 7 gün" / "Bu ay" / "Keçən ay" qısayolları.
- [ ] *Aralıq validasiyası UI-da da:* seçici 366 gündən böyük aralığa icazə verməsin, date_from > date_to olmasın. Backend yenə də yoxlayır — amma istifadəçi xətanı seçim anında görsün.
- [ ] *400 cavabını göstər:* sahə adına görə (date_from / date_to) mesajı həmin inputun altında qırmızı yaz. Ağ ekran və ya ümumi "xəta baş verdi" toast-ı kifayət deyil.
- [ ] 4 snapshot kartı: Gözləyən sifariş, Kapital «Gözləyir», Stoku bitmiş variant, Açıq dəstək.
- [ ] Əsas cədvəl — sütun sırası yuxarıdakı kimi, *üfüqi scroll* (overflow-x: auto), tarix sütunu sticky.
- [ ] Cədvəlin altında totals sətri (sticky footer).
- [ ] Mərhələ 2 sütunlarını boz + tooltip "Mərhələ 2-də aktivləşəcək".
- [ ] Parametrlər üçün modal və ya /accounting/settings alt-səhifəsi.
- [ ] Xəbərdarlıq bannerləri və xana rəngləri (yuxarıdakı bölmə).
- [ ] CSV export düyməsi — Mənsurə keçid dövründə hələ Excel-lə işləyəcək.

---

## Qəbul kriteriyaları

1. Son 30 gün açılır, hər gün üçün bir sətir var (satışsız günlər daxil).
2. Tarix inputuna əl ilə yanlış dəyər yazılanda (2026-13-45) backend-in mesajı inputun altında görünür — cədvəl köhnə data ilə qalmır.
3. date_from > date_to seçmək mümkün deyil; olsa da 400 mesajı düzgün sahədə görünür.
4. balance_spent card_inflow-a əlavə edilmir və vizual olaraq fərqlənir.
5. Komissiya 0 olanda banner görünür; parametr yazılandan sonra net_inflow dəyişir.
6. roas null olanda "—" görünür, 0 yox.
7. Snapshot rəqəmləri cədvəl sətirlərində DEYİL, yuxarıdakı kartlarda.
8. accounting.edit icazəsi olmayan moderator parametrləri görür, dəyişə bilmir.

---

## Mərhələ 2 (indi deyil, planlaşdırma üçün)

Expense (Giderlər), Refund (Refund Jurnalı), ExternalIncome (panel xarici gəlir) modelləri + CRUD. Onlar gələndə bu cədvəlin boz sütunları real rəqəmə dönür və Excel-in qalan vərəqləri (Borclar, Bank və Pul Axını, Vergi, Aylıq İcmal, Həftəlik Hesabat) *yeni saxlama olmadan* həmin üç modelin üzərindən hesablanacaq.

---

> *Digər açıq admin taskı:* BAS-70 (chat axtarış bug-ı) promptu docs/frontend/BAS-70-chat-search.md-dədir.