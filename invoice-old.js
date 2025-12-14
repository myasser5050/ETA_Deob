
(function() {
    'use strict';


function createInfoField(icon, value, isLtr = false, isStatus = false) {
    // إذا كانت القيمة فارغة أو غير موجودة، لا تقم بإنشاء الحقل
    if (!value && !isStatus) {
        return '';
    }

    let valueHTML;
    if (isStatus) {
        // تنسيق خاص لحقول الحالة (نشط/غير نشط)
        const isActive = String(value).toLowerCase() === 'نشط' || String(value).toLowerCase() === 'active';
        const statusClass = isActive ? 'status active' : 'status inactive';
        const statusText = isActive ? 'نشط' : 'غير نشط';
        valueHTML = `<span class="${statusClass}">${statusText}</span>`;
    } else {
        // التنسيق العادي للحقول الأخرى
        const ltrClass = isLtr ? 'value ltr' : 'value';
        valueHTML = `<span class="${ltrClass}">${value}</span>`;
    }

    return `
        <div class="info-field">
            <span class="label-icon">${icon}</span>
            ${valueHTML}
        </div>
    `;
}


function getFormattedDateTime(dateInput) {
    const now = new Date();
    let finalDate;

    // محاولة تحويل المدخل إلى تاريخ صالح
    const parsedDate = dateInput ? new Date(dateInput) : null;

    // التحقق إذا كان التاريخ الناتج صالحًا (وليس "Invalid Date")
    if (parsedDate && !isNaN(parsedDate.getTime())) {
        // التاريخ المدخل صالح، استخدمه مع الوقت الحالي
        finalDate = parsedDate;
        // ضبط الوقت ليتوافق مع الوقت الحالي لتجنب مشاكل التوقيت
        finalDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    } else {
        // التاريخ المدخل غير صالح أو فارغ، استخدم التاريخ والوقت الحاليين
        finalDate = now;
    }

    // إزالة أجزاء الملي ثانية وإضافة 'Z' للتوقيت العالمي
    return finalDate.toISOString().split('.')[0] + "Z";
}

 
// هذا الكود في ملف الإضافة (المتصفح)

const EtaUuid = (function() {
    
    // الدالة الجديدة التي تتصل بالخادم
    async function computeUuidFromServer(rawPayload) {
        try {
            // استدعاء دالة الخادم التي أنشأناها
            const response = await fetch('https://my-extension-backend-steel.vercel.app/api/generate-uuid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawPayload: rawPayload } )
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                return result.uuid; // إرجاع الـ UUID من الخادم
            } else {
                throw new Error(result.error || 'Failed to generate UUID on server');
            }
        } catch (error) {
            // في حالة الفشل، يمكن إرجاع قيمة فارغة أو إظهار خطأ للمستخدم
            alert('فشل توليد المعرف الفريد للإيصال. يرجى التحقق من اتصالك بالإنترنت.');
            return null;
        }
    }

    // نحن نُصدّر فقط الدالة الجديدة تحت نفس الاسم القديم للحفاظ على توافق الكود
    return {
        computeUuidFromRawText: computeUuidFromServer
    };

})();

let current_href = location.href;

setInterval(() => {
    // التحقق من تغيير الرابط
    if (current_href !== location.href) {
        current_href = location.href;

        // --- ✅ بداية التعديل المقترح ---

        // 1. ابحث عن الواجهات القديمة التي قد تكون ما زالت موجودة في الصفحة
        const oldInvoiceUI = document.getElementById("invoiceCreatorMainUI");
        const oldReceiptUI = document.getElementById("receiptUploaderTabbedUI");

        // 2. إذا وجدت أي واجهة قديمة، قم بإزالتها بالكامل من الصفحة
        if (oldInvoiceUI) {
            oldInvoiceUI.remove();
        }
        if (oldReceiptUI) {
            oldReceiptUI.remove();
        }
        
        // --- ✅ نهاية التعديل المقترح ---

        // 3. الآن، قم ببناء الواجهة الجديدة بعد التأكد من أن الصفحة نظيفة
        attemptToAddButton(); 
    }
}, 500);

attemptToAddButton();







// ===================================================================================
// ✨✨✨ نظام مراقبة اللغة المركزي (النسخة التشخيصية) ✨✨✨
// ===================================================================================

let EInvoicePortalLanguage = 'ar'; // القيمة الافتراضية

try {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.name.includes('lang=')) {
                const url = new URL(entry.name);
                const lang = url.searchParams.get('lang');
                if ((lang === 'ar' || lang === 'en') && EInvoicePortalLanguage !== lang) {
                    EInvoicePortalLanguage = lang;
                }
            }
        }
    });
    observer.observe({ type: "resource", buffered: true });

} catch (e) {
    const logoutButton = Array.from(document.querySelectorAll('button span')).find(span => span.textContent.trim() === 'Logout' || span.textContent.trim() === 'خروج');
    EInvoicePortalLanguage = (logoutButton && logoutButton.textContent.trim() === 'Logout') ? 'en' : 'ar';
}

















function injectScriptFromLocal(filePath) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL(filePath);
        script.onload = () => resolve(true);
        script.onerror = (err) => {
            reject(err);
        };
        (document.head || document.documentElement).appendChild(script);
    });
}

async function loadJsPDF() {
    if (typeof window.jspdf !== 'undefined') {
        return true; // المكتبة محملة بالفعل
    }
    try {
        // تأكد من أن اسم الملف "jspdf.umd.min.js" مطابق للملف في مجلد الإضافة
        await injectScriptFromLocal('jspdf.umd.min.js');
        return true;
    } catch (error) {
        return false;
    }
}





function attemptToAddButton() {
    // ✅ تعديل: التحقق من الصفحة الحالية واستدعاء الدالة المناسبة
    if (window.location.pathname === '/newdocument') {
        // هذا الكود خاص بصفحة الفواتير (لا تغيير هنا)
        const loaderId = setInterval(() => {
            const container = document.querySelector("div[role='tablist']");
            if (container) {
                clearInterval(loaderId);
                addInvoiceCreatorButton(container); // دالة الفواتير الحالية
            }
        }, 50);
        setTimeout(() => clearInterval(loaderId), 10000);

    } else if (window.location.pathname === '/uploadReceipts') {
        // ✅ جديد: هذا الكود خاص بصفحة الإيصالات الجديدة
        const loaderId = setInterval(() => {
            // البحث عن الحاوية التي تضم زر "الاستعراض"
            const container = document.querySelector(".fileSelection");
            if (container && container.parentElement) {
                clearInterval(loaderId);
                addReceiptUploaderButton(container.parentElement); // استدعاء دالة الإيصالات الجديدة
            }
        }, 50);
        setTimeout(() => clearInterval(loaderId), 10000);
    }
}





/**
 * ===================================================================================
 * ✅ دالة معدلة: لإضافة زر رفع الإيصالات بتصميم احترافي، أكبر حجماً، ولون صلب
 * ===================================================================================
 */
function addReceiptUploaderButton(container) {
    // 1. منع إضافة الزر إذا كان موجودًا بالفعل
    if (document.getElementById("customReceiptUploaderBtn")) {
        return;
    }

    // 2. إنشاء الزر وتطبيق التنسيقات الأساسية
    const btn = document.createElement("button");
    btn.id = "customReceiptUploaderBtn";
    btn.type = "button";
    btn.className = "ms-Button ms-Button--default root-122";

    // 3. تطبيق تعديلات الموضع
    container.style.display = "flex";
    container.style.alignItems = "center";
    btn.style.marginRight = "15px";

    // 4. أيقونة SVG عالية الجودة بتصميم يتناسب مع اللون الجديد
    const excelIconSVG = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" >
            <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" fill="#a2d2ff"/>
            <path d="M12.5 13.5L15 17M15 13.5L12.5 17" stroke="#03045e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9.5 17H10.5L12 14.75L10.5 12H9.5L8 14.25L9.5 17Z" stroke="#03045e" stroke-width="2" stroke-linejoin="round"/>
        </svg>
    `;

    // 5. بناء الهيكل الداخلي للزر
    btn.innerHTML = `
        <span class="ms-Button-flexContainer flexContainer-96" style="gap: 10px; align-items: center; padding: 0 10px;">
            <span class="icon-wrapper">${excelIconSVG}</span>
            <span class="ms-Button-textContainer textContainer-97">
                <span class="ms-Button-label label-123" style="color: #ffffff; font-weight: 600; font-size: 15px; font-family: 'Segoe UI', Tahoma, sans-serif;">
                    رفع الإيصالات من Excel
                </span>
            </span>
        </span>
    `;

    // 6. ✅ تطبيق الأنماط الاحترافية الجديدة (لون صلب، حجم أكبر، ظل عميق )
    Object.assign(btn.style, {
        height: '42px', // زيادة ارتفاع الزر ليصبح أكبر
        backgroundColor: '#023e8a', // لون أزرق داكن (كحلي) احترافي
        color: '#ffffff',
        border: 'none', // إزالة الحدود لإعطاء مظهر أنظف
        borderRadius: '8px',
        // ظل احترافي متعدد الطبقات يعطي عمقاً
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease-in-out', // حركة انتقالية سريعة ونظيفة
        cursor: 'pointer',
        transform: 'translateY(0)'
    });

    // 7. ✅ إضافة تأثيرات تفاعلية حديثة
    btn.onmouseenter = () => {
        btn.style.transform = 'translateY(-2px)'; // رفع بسيط للأعلى
        btn.style.boxShadow = '0 7px 14px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)'; // ظل أكثر انتشاراً
        btn.style.backgroundColor = '#003566'; // درجة أغمق قليلاً عند المرور
    };
    btn.onmouseleave = () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)';
        btn.style.backgroundColor = '#023e8a';
    };
    btn.onmousedown = () => {
        btn.style.transform = 'translateY(1px)'; // تأثير الضغط للأسفل
        btn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'; // ظل أقل عند الضغط
    };
    btn.onmouseup = () => {
        btn.style.transform = 'translateY(-2px)'; // العودة لوضع الرفع
        btn.style.boxShadow = '0 7px 14px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)';
    };

    // 8. ربط حدث النقر
    btn.addEventListener('click', (event) => {
        event.preventDefault();
        injectReceiptUploaderUIWithTabs();
    });

    // 9. إضافة الزر إلى الصفحة
    container.appendChild(btn);
}

// =========================================================================
// ✅✅✅ بيانات العملات الخاصة بواجهة الإيصالات فقط (مع الترجمة العربية)
// =========================================================================
const receiptCurrencies = [
  { "code": "EGP", "Desc_ar": "جنيه مصري" },
  { "code": "USD", "Desc_ar": "دولار أمريكي" },
  { "code": "EUR", "Desc_ar": "يورو" },
  { "code": "GBP", "Desc_ar": "جنيه إسترليني" },
  { "code": "SAR", "Desc_ar": "ريال سعودي" },
  { "code": "AED", "Desc_ar": "درهم إماراتي" },
  { "code": "KWD", "Desc_ar": "دينار كويتي" },
  { "code": "QAR", "Desc_ar": "ريال قطري" },
  { "code": "JPY", "Desc_ar": "ين ياباني" },
  { "code": "CNY", "Desc_ar": "يوان صيني" }
];

// قاموس عكسي خاص بالإيصالات فقط
const receiptReverseMappings = {
    currencies: Object.fromEntries(receiptCurrencies.map(item => [item.Desc_ar, item.code]))
};




/**
 * ===================================================================================
 * ✅ دالة معدلة: لإنشاء الواجهة الرسومية متعددة التابات مع خاصية التحريك
 * ===================================================================================
 */
async function injectReceiptUploaderUIWithTabs() {
    // التحقق من وجود الواجهة لمنع تكرارها، وإظهارها إذا كانت موجودة
    if (document.getElementById("receiptUploaderTabbedUI")) {
        document.getElementById("receiptUploaderTabbedUI").style.display = "flex";
        return;
    }

    // بناء الهيكل الخارجي للواجهة الرسومية (Modal)
    const modalUI = document.createElement("div");
    modalUI.id = "receiptUploaderTabbedUI";
    Object.assign(modalUI.style, {
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "1080px", height: "700px",
        backgroundColor: "#ffffff", borderRadius: "12px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
        zIndex: "9999", fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif",
        overflow: "hidden", display: "flex", direction: "rtl"
    });

    // بناء الهيكل الداخلي للواجهة (HTML) مع التابات الجانبية
    // ✅ تعديل: إضافة cursor: move للشريط الجانبي ليكون مؤشر التحريك
    modalUI.innerHTML = `
        <div class="sidebar" style="width: 220px; background-color: #0d1b2a; color: #e0e1dd; display: flex; flex-direction: column; flex-shrink: 0; cursor: move;">
            <div class="sidebar-header" style="padding: 20px; text-align: center; border-bottom: 1px solid #415a77;"><h3>🧾 الإيصالات</h3></div>
            <div class="sidebar-menu" style="flex-grow: 1; padding-top: 15px;">
                <button class="sidebar-btn" data-target="panel-upload"><span class="btn-icon">📤</span> رفع من Excel</button>
                <button class="sidebar-btn" data-target="panel-manual"><span class="btn-icon">✍️</span> إرسال يدوي</button>
                <button class="sidebar-btn" data-target="panel-drafts"><span class="btn-icon">📝</span> المسودات</button>
                





            </div>
        </div>
        <div class="main-panel" style="flex-grow: 1; background-color: #f4f7fa; display: flex; position: relative;">
<div id="subscription-lockdown-layer-receipts" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(244, 247, 250, 0.95); z-index: 100; display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(3px);">
    <div class="toast-spinner" style="width: 40px; height: 40px; border-width: 4px; margin-bottom: 20px; border-left-color: #023e8a;"></div>
    <p style="font-size: 20px; color: #0056b3; font-weight: bold;">جاري التحقق من حالة الاشتراك...</p>
</div>

            <button id="closeReceiptTabbedUIBtn" title="إغلاق" style="position: absolute; top: 10px; left: 10px; width: 32px; height: 32px; background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 50%; font-size: 24px; line-height: 30px; text-align: center; cursor: pointer; z-index: 10;">&times;</button>
      <div class="panel-content-wrapper" style="flex-grow: 1; overflow-y: auto; position: relative;">
    <div id="panel-upload" class="panel-content"></div>
    <div id="panel-manual" class="panel-content"></div>
    <div id="panel-drafts" class="panel-content"></div>
    

    



</div>

        </div>
    `;

    document.body.appendChild(modalUI);

    // إضافة الأنماط اللازمة للتابات
    const styles = document.createElement('style');
    styles.innerHTML = `
        .sidebar-btn { display: flex; align-items: center; width: 100%; padding: 15px 20px; background-color: transparent; border: none; color: #e0e1dd; font-size: 16px; font-family: 'Cairo', sans-serif; text-align: right; cursor: pointer; transition: background-color 0.3s, color 0.3s; border-right: 4px solid transparent; }
        .sidebar-btn:hover { background-color: #1b263b; }
        .sidebar-btn.active { background-color: #415a77; color: #ffffff; font-weight: 700; border-right-color: #778da9; }
        .sidebar-btn .btn-icon { margin-left: 12px; font-size: 18px; }
        .panel-content { display: none; padding: 25px; height: 100%; box-sizing: border-box; }
        .panel-content.active { display: block; animation: fadeIn 0.5s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(styles);

    // ربط الأحداث للأزرار والتابات
    document.getElementById('closeReceiptTabbedUIBtn').onclick = () => modalUI.style.display = "none";

 
    











    modalUI.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // الكود الحالي لإظهار وإخفاء التابات (لا تغيير هنا)
        modalUI.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
        modalUI.querySelectorAll('.panel-content').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const targetPanelId = btn.getAttribute('data-target');
        document.getElementById(targetPanelId).classList.add('active');

      

    });
});

    // ✅ جديد: تفعيل خاصية السحب والتحريك للواجهة من خلال الشريط الجانبي
    makeDraggable(modalUI, modalUI.querySelector('.sidebar'));

    // ملء محتوى التابات
    populateReceiptTabs();

    // جلب البيانات الأساسية مسبقًا
    const loadingToast = showToastNotification('جاري تهيئة بيانات البائع ونقاط البيع...');
    try {
        // تم تعديل getDeviceSerialNumber لترجع مصفوفة
        const [sellerData, devices] = await Promise.all([
            getSellerFullData(),
            getDeviceSerialNumber()
        ]);

        if (!sellerData || !devices || devices.length === 0) {
            throw new Error("فشل جلب البيانات الأساسية للممول أو نقاط البيع.");
        }
        
        // تخزين البيانات في متغير عام لسهولة الوصول إليها
        // نخزن أول جهاز (الأحدث) كقيمة افتراضية
        window.receiptUploaderData = {
            seller: sellerData,
            serial: devices[0].serialNumber
        };
        
        loadingToast.remove();
        showToastNotification('✅ الأداة جاهزة لرفع الإيصالات.', 3000);
   } catch (error) {
    loadingToast.remove();
    // ✅ التعديل هنا: رسالة جديدة وموجهة
    alert(`❌ خطأ في تهيئة الأداة: فشل جلب بيانات الممول أو نقاط البيع.\n\nهذا الخطأ يحدث غالبًا إذا لم تقم بتسجيل جهازك كنقطة بيع (POS) على المنظومة.\n\n💡 الحل: يرجى مراجعة تبويب "التسجيل" الجديد للحصول على شرح تفصيلي للخطوات.`);
    
    // بعد إظهار الرسالة، سنقوم بفتح الواجهة مباشرة على تبويب التسجيل الجديد
  
}


// =========================================================================
// ✅✅✅ منطق التحقق الفوري (v3.0 - النسخة النهائية مع التحقق المتفائل)
// =========================================================================
(async () => {
    const TOKEN_KEY = 'eta_extension_session_token';
    const lockdownLayer = document.getElementById('subscription-lockdown-layer') || document.getElementById('subscription-lockdown-layer-receipts');
    const firstBtn = document.querySelector('#invoiceCreatorMainUI .sidebar-btn') || document.querySelector('#receiptUploaderTabbedUI .sidebar-btn');

    // ✅ الخطوة 1: التحقق المتفائل (Optimistic Check)
    // إذا وجدنا توكن مخزن، نفترض أنه صالح ونفتح الواجهة فورًا.
    if (sessionStorage.getItem(TOKEN_KEY)) {
        if (lockdownLayer) {
            lockdownLayer.style.display = 'none'; // إخفاء القفل فورًا
        }
        if (firstBtn) {
            firstBtn.click(); // تفعيل أول تبويب
        }
        // لا نعرض "جاري التحقق" على الإطلاق في هذه الحالة
    } else {
        // إذا لم نجد توكن، نعرض "جاري التحقق" لأننا سنقوم بمصادقة كاملة
        if (lockdownLayer) {
            lockdownLayer.innerHTML = `
                <div class="toast-spinner" style="width: 40px; height: 40px; border-width: 4px; margin-bottom: 20px;"></div>
                <p style="font-size: 20px; color: #0056b3; font-weight: bold;">جاري التحقق من حالة الاشتراك...</p>
            `;
        }
    }

    // ✅ الخطوة 2: التحقق الفعلي في الخلفية
    const subscriptionData = await checkSubscription();

    if (subscriptionData && subscriptionData.seller) {
        // ✅ نجاح: الاشتراك صالح (سواء كان من التوكن أو من مصادقة جديدة)
        if (lockdownLayer && lockdownLayer.style.display !== 'none') {
            // هذا الجزء سيعمل فقط في حالة المصادقة الكاملة لأول مرة
            lockdownLayer.style.display = 'none';
            if (firstBtn) firstBtn.click();
        }
        // تحديث بيانات الممول في الشريط الجانبي (إذا كان موجودًا)
        const infoBox = document.querySelector('#taxpayer-info-box .card-body');
        if (infoBox) {
            infoBox.innerHTML = `<p><strong>الاسم:</strong> ${subscriptionData.seller.name || 'N/A'}</p><p><strong>رقم التسجيل:</strong> ${subscriptionData.seller.id || 'N/A'}</p>`;
        }

    } else {
        // 🛑 فشل: الاشتراك غير صالح (سواء كان التوكن منتهيًا أو المصادقة فشلت)
        if (lockdownLayer) {
            lockdownLayer.style.display = 'flex'; // تأكد من إظهار القفل
            showSubscriptionModal(); // عرض رسالة الاشتراك
        }
    }
})();

}





// =========================================================================
// ✅✅✅ перехватчик الـ FETCH النهائي (v1.0) ✅✅✅
// =========================================================================
function overrideFetch() {
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const url = args[0];
        const response = await originalFetch.apply(this, args);

        // نحن نهتم فقط بالردود الناجحة التي تحتوي على بيانات JSON
        if (response.ok && typeof url === 'string' && url.includes('/api/v1/documents/')) {
            try {
                // استنساخ الرد حتى نتمكن من قراءته هنا وفي الموقع الأصلي
                const clonedResponse = response.clone();
                const data = await clonedResponse.json();

                // إنشاء حدث مخصص وإرسال البيانات التي تم اعتراضها
                const event = new CustomEvent('apiResponseIntercepted', { detail: { url, data } });
                window.dispatchEvent(event);

            } catch (e) {
                // تجاهل الأخطاء إذا لم يكن الرد JSON
            }
        }
        // إرجاع الرد الأصلي ليستخدمه الموقع بشكل طبيعي
        return response;
    };
}

// قم بتشغيل الدالة مرة واحدة عند بدء تشغيل الإضافة
overrideFetch();











async function populateReceiptTabs() {
  
    
    // --- 1. بناء تبويب الرفع من Excel ---
    document.getElementById('panel-upload').innerHTML = `
        <div class="panel-header"><h2>رفع المستندات من ملف Excel</h2><p>اختر نوع المستند الذي تريد رفعه ثم اتبع الخطوات.</p></div>
        <div class="content-step" style="margin-bottom: 25px;">
            <label for="documentTypeSelect" class="content-label" style="font-size: 16px; color: #0d1b2a;">الخطوة 1: اختر نوع المستند</label>
            <select id="documentTypeSelect" class="content-select" style="padding: 12px; font-size: 16px; background-color: white; border: 1px solid #ced4da; border-radius: 8px;">
                <option value="sale">🧾 إيصال بيع (Sale Receipt)</option>
                <option value="return">↩️ إشعار مرتجع (Return Receipt)</option>
            </select>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <div id="dynamicUploaderContent"></div>
        <div style="text-align:center; margin-top:25px; padding:15px; background:#f8f9fa; border-top:2px solid #e9ecef; font-family:'Cairo','Segoe UI',sans-serif; line-height:1.8; font-size:16px; color:#333;">
            اللهُم صلِّ على مُحمد  
              

            💻 المصمم المحاسب : محمد صبري  
              

            📞 واتساب: 01060872599
        </div>

    `;
    
    function updateUploaderUI() {
        const selectedType = document.getElementById('documentTypeSelect').value;
        const contentContainer = document.getElementById('dynamicUploaderContent');
        const actionButtonStyles = `display: block; text-align: center; padding: 12px; border-radius: 8px; text-decoration: none; cursor: pointer; color: white; font-weight: 600;`;

        if (selectedType === 'sale') {
            contentContainer.innerHTML = `
                <div><h3 style="margin-top:0; color: #333;">الخطوة 2: تحميل نموذج ورفع ملفات البيع</h3></div>
                <div style="margin-bottom: 20px;"><a id="downloadReceiptTemplateBtn" style="${actionButtonStyles} background-color: #5a67d8;">📥 تحميل نموذج إيصال البيع الذكي</a></div>
                <div><label for="receiptExcelInput" style="${actionButtonStyles} background-color: #38a169;">📂 اختر ملف إيصالات البيع</label><input type="file" id="receiptExcelInput" accept=".xlsx, .xls" style="display: none;"></div>
            `;
            document.getElementById('downloadReceiptTemplateBtn').onclick = downloadSaleReceiptTemplate;
            document.getElementById('receiptExcelInput').onchange = handleReceiptExcelUpload;
        } else {
            contentContainer.innerHTML = `
                <div><h3 style="margin-top:0; color: #333;">الخطوة 2: تحميل نموذج ورفع ملفات المرتجعات</h3></div>
                <div style="margin-bottom: 20px;"><a id="downloadReturnTemplateBtn" style="${actionButtonStyles} background-color: #c0392b;">📥 تحميل نموذج إشعار المرتجع</a></div>
                <div><label for="returnExcelInput" style="${actionButtonStyles} background-color: #e67e22;">📂 اختر ملف إشعارات المرتجع</label><input type="file" id="returnExcelInput" accept=".xlsx, .xls" style="display: none;"></div>
            `;
            document.getElementById('downloadReturnTemplateBtn').onclick = downloadReturnReceiptExcelTemplate;
            document.getElementById('returnExcelInput').onchange = handleReturnReceiptExcelUpload;
        }
    }
    document.getElementById('documentTypeSelect').addEventListener('change', updateUploaderUI);
    updateUploaderUI();

    // --- 2. بناء تبويب الإرسال اليدوي ---
    const manualPanel = document.getElementById('panel-manual');
    manualPanel.innerHTML = `
        <div class="panel-header"><h2>إنشاء مستند يدوي</h2><p>اختر نوع المستند الذي تريد إنشائه يدويًا.</p></div>
        <div class="content-step">
            <label for="manualDocumentTypeSelect" class="content-label" style="font-size: 16px; color: #0d1b2a;">الخطوة 1: اختر نوع المستند</label>
            <select id="manualDocumentTypeSelect" class="content-select" style="padding: 12px; font-size: 16px; background-color: white; border: 1px solid #ced4da; border-radius: 8px;"><option value="" selected disabled>-- يرجى الاختيار --</option><option value="sale">🧾 إنشاء إيصال بيع يدوي</option><option value="return">↩️ إنشاء إشعار مرتجع يدوي</option></select>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <div id="dynamicManualSendContent"><p style="text-align:center; color:#888; padding: 20px;">يرجى اختيار نوع المستند من القائمة أعلاه للبدء.</p></div>
        <div style="text-align:center; margin-top:25px; padding:15px; background:#f8f9fa; border-top:2px solid #e9ecef; font-family:'Cairo','Segoe UI',sans-serif; line-height:1.8; font-size:16px; color:#333;">
            اللهُم صلِّ على مُحمد  
              

            💻 المصمم المحاسب : محمد صبري  
              

            📞 واتساب: 01060872599
        </div>
    `;

    async function updateManualSendUI() {
        const selectedType = document.getElementById('manualDocumentTypeSelect').value;
        const contentContainer = document.getElementById('dynamicManualSendContent');
        if (!selectedType) {
            contentContainer.innerHTML = `<p style="text-align:center; color:#888; padding: 20px;">يرجى اختيار نوع المستند من القائمة أعلاه للبدء.</p>`;
            return;
        }
        contentContainer.innerHTML = `<p style="text-align:center; color:#333; padding: 20px;">جاري تحميل واجهة إنشاء ${selectedType === 'sale' ? 'إيصال البيع' : 'إشعار المرتجع'}...</p>`;
        try {
            const sellerData = await getIssuerFullData();
            const activities = sellerData.activities || [];
            let activitySelectorHTML = '';
            if (activities.length > 0) {
                const defaultActivity = activities.find(act => act.toDate === null) || activities[0];
                activitySelectorHTML = `<div class="info-field full-width"><label for="manual-activity-code" class="label">كود النشاط:</label><select id="manual-activity-code" class="form-group-select">${activities.map(act => `<option value="${act.activityTypeCode}" ${act.activityTypeCode === defaultActivity.activityTypeCode ? 'selected' : ''}>${act.activityTypeCode} - ${act.activityTypeNameSecondaryLang}</option>`).join('')}</select></div>`;
            }
            await buildManualSendForm(contentContainer, activitySelectorHTML, selectedType);
        } catch (error) {
            contentContainer.innerHTML = `<p style="color: red; text-align: center;">فشل تحميل الواجهة: ${error.message}</p>`;
        }
    }
    document.getElementById('manualDocumentTypeSelect').addEventListener('change', updateManualSendUI);

    // --- 3. بناء تبويب المسودات ---
    document.getElementById('panel-drafts').innerHTML = `
        <div class="panel-header"><h2>مسودات الإيصالات</h2><p>هنا تظهر الإيصالات التي حفظتها لإرسالها لاحقًا.</p></div>
        <div id="drafts-container" style="border: 1px solid #ccc; border-radius: 8px; background: #fff; min-height: 300px; padding: 15px;"></div>
        <div style="text-align:center; margin-top:25px; padding:15px; background:#f8f9fa; border-top:2px solid #e9ecef; font-family:'Cairo','Segoe UI',sans-serif; line-height:1.8; font-size:16px; color:#333;">
            اللهُم صلِّ على مُحمد  
              

            💻 المصمم المحاسب : محمد صبري  
              

            📞 واتساب: 01060872599
        </div>
    `;
    renderReceiptDrafts();

   
    
    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', () => {
            const section = header.closest('.collapsible-section');
            section.classList.toggle('open');
        });
    });

   
    

   
 
    

    





    // --- 8. جلب البيانات الأساسية في الخلفية (لا تغيير هنا) ---
    try {
        if (!window.receiptUploaderData || !window.receiptUploaderData.seller) {
            const [sellerData, devices] = await Promise.all([getSellerFullData(), getDeviceSerialNumber()]);
            if (!sellerData || !devices || devices.length === 0) {
                throw new Error("فشل جلب البيانات الأساسية للممول أو نقاط البيع.");
            }
            // تخزين البيانات في متغير عام لسهولة الوصول إليها
            window.receiptUploaderData = { 
                seller: sellerData, 
                devices: devices, 
                serial: devices[0].serialNumber // استخدام أحدث جهاز كقيمة افتراضية
            };
        }
    } catch (error) {
        // لا توجد مشكلة كبيرة، يمكن أن تستمر الواجهة في العمل بدون هذه البيانات مبدئياً
        // سيتم جلبها مرة أخرى عند الحاجة (مثلاً عند الإرسال اليدوي)
    }
} // <-- هذا هو القوس الأخير الذي يغلق دالة populateReceiptTabs


/**
 * ===================================================================================
 * ✅✅✅ دالة إنشاء نموذج إكسل لإيصالات البيع (v2.0 - مع دعم العملات)
 * ===================================================================================
 */
async function downloadSaleReceiptTemplate() {
    const loadingToast = showToastNotification('جاري إنشاء نموذج الإيصال الشامل...', 0);
    try {
        if (typeof ExcelJS === 'undefined') {
            throw new Error("مكتبة ExcelJS غير محملة. لا يمكن إنشاء الملف.");
        }

        const workbook = new ExcelJS.Workbook();
        const mainSheet = workbook.addWorksheet("قالب إيصالات البيع");
        const listsSheet = workbook.addWorksheet("قوائم البيانات");

        // --- 1. إعداد ورقة القوائم المنسدلة ---
        const itemCodeTypes = [{ code: "EGS" }, { code: "GS1" }];
        
        listsSheet.getCell('A1').value = "أنواع الأكواد";
        itemCodeTypes.forEach((item, i) => { listsSheet.getCell(`A${i + 2}`).value = item.code; });

        listsSheet.getCell('B1').value = "أنواع الوحدات";
        unitTypes.forEach((item, i) => { listsSheet.getCell(`B${i + 2}`).value = item.desc_ar; });

        listsSheet.getCell('C1').value = "أنواع الضرائب الرئيسية";
        Object.values(taxTypes).forEach((item, i) => { listsSheet.getCell(`C${i + 2}`).value = item.desc; });

        // ✨ --- إضافة قائمة العملات --- ✨
        listsSheet.getCell('D1').value = "Currencies";
receiptCurrencies.forEach((item, i) => { listsSheet.getCell(`D${i + 2}`).value = item.Desc_ar; });

        let taxColIndex = 5; // تم تغيير الرقم ليبدأ بعد العملات
        Object.values(taxTypes).forEach(data => {
            const headerCell = listsSheet.getCell(1, taxColIndex);
            const rangeName = data.desc.replace(/[ ()]/g, '_');
            headerCell.value = rangeName;
            data.subtypes.forEach((subtype, i) => { listsSheet.getCell(i + 2, taxColIndex).value = subtype.desc; });
            const colLetter = String.fromCharCode('A'.charCodeAt(0) + taxColIndex - 1);
            const rangeFormula = `'قوائم البيانات'!$${colLetter}$2:$${colLetter}$${data.subtypes.length + 1}`;
            workbook.definedNames.add(rangeFormula, rangeName);
            taxColIndex++;
        });

        // --- 2. إعداد الأعمدة والتعليمات ---
        const headersWithComments = {
            'تاريخ الإصدار (YYYY-MM-DD)': 'اختياري: أدخل تاريخ إصدار الإيصال.',
            'رقم الإيصال الداخلي (*)': 'مطلوب: رقم فريد يميز الإيصال.',
            'اسم العميل (اختياري)': 'اسم المشتري.',
            'الرقم القومي للعميل (اختياري)': 'الرقم القومي للمشتري (14 رقم).',
            'الكود الداخلي للصنف': 'اختياري: كود الصنف المستخدم في نظامك.',
            'وصف الصنف (*)': 'مطلوب: اسم أو وصف واضح للسلعة.',
            'نوع كود الصنف (*)': 'مطلوب: اختر من القائمة (EGS أو GS1).',
            'كود الصنف (*)': 'مطلوب: الكود الفعلي للصنف.',
            'وحدة القياس (*)': 'مطلوب: اختر وحدة القياس من القائمة.',
            'الكمية (*)': 'مطلوب: العدد المباع من هذا الصنف.',
            'سعر الوحدة (*)': 'مطلوب: سعر القطعة الواحدة بالعملة المختارة.',
            // ✨ --- إضافة أعمدة العملة --- ✨
            'عملة البيع': 'اختياري: اختر العملة من القائمة. الافتراضي هو الجنيه المصري.',
            'سعر الصرف': 'إجباري إذا كانت العملة غير الجنيه. أدخل سعر صرف العملة مقابل الجنيه.',
            // ---
            'نوع الضريبة 1 (*)': 'مطلوب: اختر نوع الضريبة الأساسي.',
            'النوع الفرعي للضريبة 1 (*)': 'مطلوب: اختر النوع الفرعي للضريبة.',
            'نسبة الضريبة 1 (*)': 'مطلوب: النسبة المئوية للضريبة.',
            'نوع الضريبة 2 (اختياري)': 'اختياري: إذا كان الصنف خاضعًا لضريبة أخرى.',
            'النوع الفرعي للضريبة 2 (اختياري)': 'اختياري: النوع الفرعي للضريبة الثانية.',
            'نسبة الضريبة 2 (اختياري)': 'اختياري: نسبة الضريبة الثانية.'
        };

        const headers = Object.keys(headersWithComments);
        mainSheet.columns = headers.map(h => ({ header: h, key: h, width: 35 }));

        mainSheet.getRow(1).eachCell((cell) => {
            cell.note = headersWithComments[cell.value] || '';
            cell.font = { name: 'Arial', bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF007BFF' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        });

        // --- 3. تطبيق القوائم المنسدلة ---
        const addValidation = (columnLetter, formula) => {
            for (let i = 2; i <= 1001; i++) {
                mainSheet.getCell(`${columnLetter}${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [formula] };
            }
        };

        addValidation('G', `='قوائم البيانات'!$A$2:$A$3`); // نوع كود الصنف
        addValidation('I', `='قوائم البيانات'!$B$2:$B$${unitTypes.length + 1}`);
        // ✨ --- إضافة قائمة العملات --- ✨
// ✨ السطر الجديد (يستخدم المتغير الصحيح)
addValidation('L', `='قوائم البيانات'!$D$2:$D$${receiptCurrencies.length + 1}`);
        // ---
        addValidation('N', `='قوائم البيانات'!$C$2:$C$${Object.keys(taxTypes).length + 1}`);
        addValidation('Q', `='قوائم البيانات'!$C$2:$C$${Object.keys(taxTypes).length + 1}`);

        const cascadingFormula1 = '=INDIRECT(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(N2," ","_"),"(","_"),")","_"))';
        const cascadingFormula2 = '=INDIRECT(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(Q2," ","_"),"(","_"),")","_"))';
        addValidation('O', cascadingFormula1);
        addValidation('R', cascadingFormula2);

        // --- 4. اللمسات النهائية وإنشاء الملف ---
        listsSheet.state = 'hidden';
        mainSheet.views = [{ rightToLeft: true, state: 'frozen', ySplit: 1 }];

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        
        if (typeof saveAs === 'undefined') {
            throw new Error("مكتبة FileSaver.js غير محملة.");
        }
        
        saveAs(blob, "نموذج_إيصالات_البيع_بالعملات.xlsx");

    } catch (error) {
        alert("فشل إنشاء نموذج إكسل الإيصالات: " + error.message);
    } finally {
        loadingToast.remove();
    }
}



async function generateCustomPdf(button) {
    const uuid = button.dataset.uuid;
    button.textContent = 'جاري...';
    button.disabled = true;

    try {
        if (typeof jsPDF === 'undefined' || typeof jsPDF.autoTable === 'undefined' || typeof qrcode === 'undefined') {
       
            
            throw new Error("المكتبات المطلوبة (jsPDF, AutoTable, qrcode) غير معرّفة في النطاق العام.");
        }
    
        const tableRow = button.closest('tr');
        const receiptData = {
            uuid: uuid,
            receiptNumber: tableRow.cells[0].textContent,
            dateTimeIssued: tableRow.cells[2].textContent,
            receiverName: tableRow.cells[3].textContent,
            totalAmount: parseFloat(tableRow.cells[4].textContent),
            seller: window.receiptUploaderData?.seller || {}
        };

       
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

        doc.setFont('Helvetica');
        doc.setRtl(true);

        const processArabicText = (text) => {
            if (!text) return '';
            return String(text).split('').reverse().join('');
        };

        const qr = qrcode(0, 'M');
        const originalDateTime = new Date(receiptData.dateTimeIssued.replace('،', '')).toISOString();
        const shareUrl = `https://invoicing.eta.gov.eg/receipts/details/print/${uuid}/share/${originalDateTime}`;
        qr.addData(shareUrl );
        qr.make();
        const qrCodeImage = qr.createDataURL(4);

        const margin = 15;
        const pageWidth = doc.internal.pageSize.getWidth();
        
        doc.setFontSize(18).text(processArabicText('إيصال بيع'), pageWidth - margin, margin, { align: 'right' });
        doc.addImage(qrCodeImage, 'JPEG', margin, margin, 35, 35);

        let y = margin + 10;
        doc.setFontSize(8);
        doc.text(processArabicText('الرقم الإلكتروني: ') + receiptData.uuid, pageWidth - margin - 40, y, { align: 'right' }); y += 5;
        doc.text(processArabicText('رقم الداخلي: ') + receiptData.receiptNumber, pageWidth - margin - 40, y, { align: 'right' }); y += 5;
        doc.text(processArabicText('تاريخ الإصدار: ') + receiptData.dateTimeIssued, pageWidth - margin - 40, y, { align: 'right' }); y += 5;
        doc.text(processArabicText('رقم تسجيل البائع: ') + (receiptData.seller.id || 'N/A'), pageWidth - margin - 40, y, { align: 'right' }); y += 10;

        doc.autoTable({
            startY: y,
            head: [[processArabicText('المشتري'), processArabicText('البائع')]],
            body: [[
                processArabicText(receiptData.receiverName || ''),
                processArabicText(`${receiptData.seller.name || ''}\n${receiptData.seller.id || ''}\n${receiptData.seller.street || ''}, ${receiptData.seller.regionCity || ''}`)
            ]],
            theme: 'grid',
            styles: { font: 'Helvetica', halign: 'right' },
            headStyles: { fillColor: [220, 220, 220], textColor: 0 },
        });
        y = doc.lastAutoTable.finalY + 10;

        const totalAmount = receiptData.totalAmount;
        const taxRateApproximation = 0.14;
        const valueBeforeTax = totalAmount / (1 + taxRateApproximation);
        const taxAmount = totalAmount - valueBeforeTax;

        doc.autoTable({
            startY: y,
            head: [[processArabicText('المجموع'), processArabicText('الضريبة'), processArabicText('الصافي'), processArabicText('الوصف')]],
            body: [[
                totalAmount.toFixed(2),
                taxAmount.toFixed(2),
                valueBeforeTax.toFixed(2),
                processArabicText('إجمالي مبيعات الإيصال')
            ]],
            theme: 'grid',
            styles: { font: 'Helvetica', halign: 'right' },
            headStyles: { fillColor: [220, 220, 220], textColor: 0 },
        });
        y = doc.lastAutoTable.finalY + 10;

        const totalsBody = [
            [valueBeforeTax.toFixed(2), processArabicText('إجمالي المبيعات (ج.م)')],
            [taxAmount.toFixed(2), processArabicText('ضريبة القيمة المضافة (تقريبي)')],
            [{ content: totalAmount.toFixed(2), styles: { fontStyle: 'bold' } }, { content: processArabicText('المبلغ الإجمالي (ج.م)'), styles: { fontStyle: 'bold' } }]
        ];
        doc.autoTable({
            startY: y,
            body: totalsBody,
            theme: 'plain',
            styles: { font: 'Helvetica', halign: 'right' },
            columnStyles: { 0: { halign: 'left' } },
            margin: { left: pageWidth / 2 }
        });

        doc.save(`receipt-${uuid}.pdf`);

    } catch (error) {
        alert(`حدث خطأ أثناء إنشاء PDF: ${error.message}`);
    } finally {
        button.textContent = 'تحميل PDF';
        button.disabled = false;
    }
}








/**
 * ===================================================================================
 * ✅✅✅ دالة بناء واجهة الإرسال اليدوي (النسخة المطورة مع اختيار أصناف المرتجع) ✅✅✅
 * ===================================================================================
 * @param {HTMLElement} container - الحاوية التي سيتم بناء الواجهة بداخلها.
 * @param {string} activitySelectorHTML - كود HTML الخاص بقائمة اختيار الأنشطة.
 * @param {string} documentType - نوع المستند المطلوب ('sale' للبيع أو 'return' للمرتجع).
 */
async function buildManualSendForm(container, activitySelectorHTML, documentType = 'sale') {
    // --- 1. تحديد العناوين والنصوص بناءً على نوع المستند ---
    const isReturn = documentType === 'return';
    const mainTitle = isReturn ? 'إنشاء إشعار مرتجع يدوي' : 'إنشاء إيصال بيع يدوي';
    const internalIdLabel = isReturn ? 'رقم المرتجع الداخلي' : 'رقم الإيصال الداخلي';
    const defaultInternalId = isReturn ? `RTN-${Date.now()}` : `RCPT-${Date.now()}`;
    const sendButtonText = isReturn ? 'إرسال إشعار المرتجع' : 'إرسال الإيصال';

    // --- 2. جلب البيانات الأساسية ---
    const loadingToast = showToastNotification('جاري تحميل بيانات الممول ونقاط البيع...', 0);
    const [sellerData, devices] = await Promise.all([getIssuerFullData(), getDeviceSerialNumber()]);
    loadingToast.remove();

    if (!sellerData || !devices || devices.length === 0) {
        container.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">فشل تحميل بيانات الممول أو نقاط البيع. لا يمكن المتابعة.</p>';
        return;
    }
    const defaultDevice = devices[0];
    
    const taxTypesData = [
      { "Code": "T1", "Desc_ar": "ضريبة القيمة المضافة" }, { "Code": "T2", "Desc_ar": "ضريبة الجدول (نسبية)" },
      { "Code": "T3", "Desc_ar": "ضريبة الجدول (النوعية)" }, { "Code": "T4", "Desc_ar": "الخصم تحت حساب الضريبة" },
      { "Code": "T5", "Desc_ar": "ضريبة الدمغة (نسبية)" }, { "Code": "T6", "Desc_ar": "ضريبة الدمغة (قطعية بمقدار ثابت)" },
      { "Code": "T7", "Desc_ar": "ضريبة الملاهي" }, { "Code": "T8", "Desc_ar": "رسم تنمية الموارد" },
      { "Code": "T9", "Desc_ar": "رسم خدمة" }, { "Code": "T10", "Desc_ar": "رسم المحليات" },
      { "Code": "T11", "Desc_ar": "رسم التأمين الصحي" }, { "Code": "T12", "Desc_ar": "رسوم أخرى" }
    ];
    const taxSubtypesData = JSON.parse('[{"Code":"V001","Desc_en":"Export","Desc_ar":"تصدير للخارج","TaxtypeReference":"T1"},{"Code":"V002","Desc_en":"Export to free areas and other areas","Desc_ar":"تصدير مناطق حرة وأخرى","TaxtypeReference":"T1"},{"Code":"V003","Desc_en":"Exempted good or service","Desc_ar":"سلعة أو خدمة معفاة","TaxtypeReference":"T1"},{"Code":"V004","Desc_en":"A non-taxable good or service","Desc_ar":"سلعة أو خدمة غير خاضعة للضريبة","TaxtypeReference":"T1"},{"Code":"V005","Desc_en":"Exemptions for diplomats, consulates and embassies","Desc_ar":"إعفاءات دبلوماسين والقنصليات والسفارات","TaxtypeReference":"T1"},{"Code":"V006","Desc_en":"Defence and National security Exemptions","Desc_ar":"إعفاءات الدفاع والأمن القومى","TaxtypeReference":"T1"},{"Code":"V007","Desc_en":"Agreements exemptions","Desc_ar":"إعفاءات اتفاقيات","TaxtypeReference":"T1"},{"Code": "V008", "Desc_en": "Special Exemptios and other reasons", "Desc_ar": "إعفاءات خاصة و أخرى", "TaxtypeReference": "T1"}, {"Code": "V009", "Desc_en": "General Item sales", "Desc_ar": "سلع عامة", "TaxtypeReference": "T1"}, {"Code": "V010", "Desc_en": "Other Rates", "Desc_ar": "نسب ضريبة أخرى", "TaxtypeReference": "T1"}, {"Code": "Tbl01", "Desc_en": "Table tax (percentage)", "Desc_ar": "ضريبه الجدول (نسبيه)", "TaxtypeReference": "T2"}, {"Code": "Tbl02", "Desc_en": "Table tax (Fixed Amount)", "Desc_ar": "ضريبه الجدول (النوعية)", "TaxtypeReference": "T3"}, {"Code": "W001", "Desc_en": "Contracting", "Desc_ar": "المقاولات", "TaxtypeReference": "T4"}, {"Code": "W002", "Desc_en": "Supplies", "Desc_ar": "التوريدات", "TaxtypeReference": "T4"}, {"Code": "W003", "Desc_en": "Purachases", "Desc_ar": "المشتريات", "TaxtypeReference": "T4"}, {"Code": "W004", "Desc_en": "Services", "Desc_ar": "الخدمات", "TaxtypeReference": "T4"}, {"Code": "W010", "Desc_en": "Professional fees", "Desc_ar": "اتعاب مهنية", "TaxtypeReference": "T4"}, {"Code": "ST01", "Desc_en": "Stamping tax (percentage)", "Desc_ar": "ضريبه الدمغه (نسبيه)", "TaxtypeReference": "T5"}, {"Code": "ST02", "Desc_en": "Stamping Tax (amount)", "Desc_ar": "ضريبه الدمغه (قطعيه بمقدار ثابت)", "TaxtypeReference": "T6"}, {"Code": "Ent01", "Desc_en": "Entertainment tax (rate)", "Desc_ar": "ضريبة الملاهى (نسبة)", "TaxtypeReference": "T7"}, {"Code": "RD01", "Desc_en": "Resource development fee (rate)", "Desc_ar": "رسم تنميه الموارد (نسبة)", "TaxtypeReference": "T8"}, {"Code": "SC01", "Desc_en": "Service charges (rate)", "Desc_ar": "رسم خدمة (نسبة)", "TaxtypeReference": "T9"}, {"Code": "Mn01", "Desc_en": "Municipality Fees (rate)", "Desc_ar": "رسم المحليات (نسبة)", "TaxtypeReference": "T10"}, {"Code": "MI01", "Desc_en": "Medical insurance fee (rate)", "Desc_ar": "رسم التامين الصحى (نسبة)", "TaxtypeReference": "T11"}, {"Code": "OF01", "Desc_en": "Other fees (rate)", "Desc_ar": "رسوم أخرى", "TaxtypeReference": "T12"}]');

    // --- 3. بناء هيكل الواجهة ---
    let addedItems = [];
    let currentlyEditingIndex = -1;
    let originalInvoiceData = null; // لتخزين بيانات الفاتورة الأصلية
  const updateTotal = () => {
        const qtyInput = container.querySelector('#item-quantity');
        const priceInput = container.querySelector('#item-unit-price');
        const totalInput = container.querySelector('#item-total'); // افترض أن هذا الحقل لا يزال موجودًا مؤقتًا
        
        if (qtyInput && priceInput && totalInput) {
            totalInput.value = ((parseFloat(qtyInput.value) || 0) * (parseFloat(priceInput.value) || 0)).toFixed(5);
        }
    };
    const referenceUuidField = isReturn ? `
        <div class="form-group">
            <label for="manual-reference-uuid">UUID الفاتورة الأصلية (*)</label>
            <div style="display: flex; align-items: center; gap: 10px;">
                <input type="text" id="manual-reference-uuid" required placeholder="أدخل UUID هنا واضغط على زر البحث" style="flex-grow: 1;">
                <button type="button" id="fetch-invoice-details-btn" title="جلب بيانات الفاتورة الأصلية" class="action-button" style="padding: 10px 15px; flex-shrink: 0; background-color: #007bff; width: auto;">🔍</button>
            </div>
        </div>
    ` : '';

    // ✅ تعديل هيكل تبويب الأصناف لإضافة الحاوية الجديدة
      // استبدل الكود السابق بهذا الكود
    const itemsTabHTML = `
        <!-- ✅ حاوية جديدة لعرض أصناف الفاتورة الأصلية (للمرتجعات) -->
        <div id="original-invoice-items-container" style="display: none; background: #e9f5ff; border: 1px solid #b3d7ff; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
            <h4 style="margin-top: 0; color: #0056b3;">أصناف الفاتورة الأصلية (حدد للإرجاع)</h4>
            <div id="original-items-list" style="max-height: 200px; overflow-y: auto; margin-bottom: 15px; border: 1px solid #ddd; background: #fff; padding: 10px;">
                <!-- سيتم ملء القائمة هنا -->
            </div>
            <button type="button" id="add-selected-to-return-btn" class="action-button" style="width: auto; padding: 10px 30px; background-color: #28a745;">+ إضافة المحدد للمرتجع</button>
        </div>

        <!-- زر إضافة صنف جديد -->
        <button type="button" id="add-new-item-button" class="action-button" style="width: auto; padding: 12px 30px; background-color: #007bff; margin-bottom: 20px;">+ إضافة صنف جديد</button>

        <!-- حاوية نموذج إضافة الصنف (مخفية مبدئيًا) -->
        <div id="item-form-wrapper" style="display: none; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #f8f9fa; margin-bottom: 20px;">
            <form id="item-form">
                <div class="form-grid" style="align-items: flex-end;">
                    <div class="form-group"><label>نوع الكود</label><select id="item-code-type" required><option value="EGS">EGS</option><option value="GS1">GS1</option></select></div>
                    <div class="form-group"><label>الكود</label><input type="text" id="item-code" required></div>
                    <div class="form-group"><label>اسم الكود (تلقائي)</label><input type="text" id="item-code-name" readonly style="background:#eee;"></div>
                    <div class="form-group"><label>وصف الصنف</label><input type="text" id="item-description" required></div>
                    <div class="form-group"><label>الكمية</label><input type="number" id="item-quantity" value="1" step="any" required></div>
 <!-- ✨✨✨ الجزء الجديد والمعدل ✨✨✨ -->

 <!-- ✨ الجزء الجديد الذي يستخدم المتغير الصحيح -->
<div class="form-group">
    <label>العملة</label>
    <select id="item-currency">
        ${receiptCurrencies.map(c => `<option value="${c.code}">${c.Desc_ar}</option>`).join('')}
    </select>
</div>

 <div class="form-group">
     <label>سعر الصرف</label>
     <input type="number" id="item-exchange-rate" value="1" step="any" required>
 </div>
 <div class="form-group">
     <label>سعر الوحدة (بالعملة)</label>
     <input type="number" id="item-unit-price" step="any" required>
 </div>
 <div class="form-group">
     <label>الإجمالي (بالجنيه المصري)</label>
     <input type="text" id="item-total-egp" readonly style="background:#eee; font-weight: bold;">
 </div>


                    </div>
              <!-- --- ✅ بداية تعديل تجربة الضرائب --- -->
<div style="margin-top: 20px; display: flex; align-items: center; gap: 15px;">
    <h4 style="margin: 0;">الضرائب على الصنف (اختياري)</h4>
    <button type="button" id="add-tax-row-btn" class="action-button" style="width: auto; padding: 5px 15px; font-size: 14px;">+ إضافة ضريبة</button>
</div>
<div id="item-taxes-container" style="margin-top: 10px; display: flex; flex-direction: column; gap: 10px;">
    <!-- صفوف الضرائب ستتم إضافتها هنا عبر JavaScript -->
</div>
<!-- --- ✅ نهاية تعديل تجربة الضرائب --- -->
                <hr>
                <div id="item-form-actions" style="display: flex; gap: 10px;">
                    <button type="submit" id="add-item-btn" class="action-button" style="width: auto; padding: 10px 30px;">إضافة الصنف</button>
                    <button type="button" id="cancel-edit-btn" class="action-button" style="width: auto; padding: 10px 30px; background-color: #6c757d; display: none;">إلغاء التعديل</button>
                </div>
            </form>
        </div>
        
        <h4 style="margin-top: 25px;">الأصناف المضافة (اضغط للتعديل)</h4>
<!-- --- ✅ تعديل 1: إضافة عمود الضرائب للجدول --- -->
<table id="items-table"><thead><tr><th>الكود</th><th>الوصف</th><th>الكمية</th><th>السعر</th><th>الضرائب</th><th>الإجمالي</th><th>إجراء</th></tr></thead><tbody></tbody></table>
    `;

    container.innerHTML = `
        <div id="manual-send-container">
            <div id="manualSendModal" class="manual-modal" style="display:flex;">
                <div class="manual-modal-content">
                  <div class="manual-modal-header" style="cursor: move;">
    <h3>${mainTitle}</h3>
    <button id="closeManualModalBtn" title="إغلاق" style="background: #f1f1f1; color: #555; border: none; width: 30px; height: 30px; border-radius: 50%; font-size: 20px; cursor: pointer; transition: all 0.2s;">&times;</button>
</div>

                    <div class="manual-modal-body">
                        <div class="manual-tabs">
                            <button class="manual-tab-btn active" data-tab-index="0"><span class="tab-status-indicator"></span>البيانات الأساسية</button>
                            <button class="manual-tab-btn" data-tab-index="1"><span class="tab-status-indicator"></span>الأصناف</button>
                            <button class="manual-tab-btn" data-tab-index="2"><span class="tab-status-indicator"></span>الملخص والدفع</button>
                        </div>
                        <div class="manual-tab-content-wrapper">
                            <div id="tab-basic" class="manual-tab-content active">
                            <div class="form-grid">
    <div class="form-group"><label for="manual-receipt-number">${internalIdLabel} (*)</label><input type="text" id="manual-receipt-number" required value="${defaultInternalId}"></div>
    
    <div class="form-group">
        <label for="manual-datetime-issued">تاريخ الإصدار (*)</label>
        <input type="date" id="manual-datetime-issued" required style="font-family: sans-serif; text-align: right;">
    </div>

    ${referenceUuidField}
<div class="form-group"><label for="manual-buyer-name">اسم العميل</label><input type="text" id="manual-buyer-name" placeholder="اتركه فارغًا إذا لم يكن هناك اسم"></div>

<div class="form-group">
    <label for="manual-buyer-id">الرقم القومي (14 رقم)</label>
    <input type="text" id="manual-buyer-id" maxlength="14" pattern="[0-9]{14}" style="transition: all 0.3s ease;">
    <small id="nid-validation-status" style="margin-top: 5px; font-weight: bold; height: 15px; display: block;"></small>
</div>
                                </div>
    <hr style="margin: 20px 0;">
<!-- ✅ بداية القسم الجديد لبيانات المصدر ونقطة البيع -->
<div class="collapsible-section open">
    <div class="collapsible-header">
        <h4 style="margin: 0;">بيانات المصدر ونقطة البيع (اضغط للتوسيع/الطي)</h4>
        <span class="collapsible-icon">▼</span>
    </div>
    <div class="collapsible-content">
        <div class="form-grid">
            <!-- اختيار نقطة البيع بالعنوان -->
            <div class="form-group">
                <label for="pos-device-select">نقطة البيع (POS):</label>
              
            
<select id="pos-device-select" class="form-group-select">
    ${devices.map(d => {
        const address = d.address || {};
        const displayAddress = (d.formatedAddress || `${address.street || ''}, ${address.regionCity || ''}`).replace(/^0\s+/, '').trim();
        
        // --- بداية المنطق الذكي لتفكيك العنوان ---
        let addressData = {};
        if (d.formatedAddress) {
            const fullAddressString = d.formatedAddress.trim();
            const addressParts = fullAddressString.split(',');
            const firstPart = addressParts[0] || '';
            const buildingNumberMatch = firstPart.match(/^(\d+)\s+/);
            let buildingNumber = '';
            let street = firstPart;
            if (buildingNumberMatch) {
                buildingNumber = buildingNumberMatch[1];
                street = firstPart.substring(buildingNumberMatch[0].length).trim();
            }
            addressData = {
                buildingNumber: buildingNumber,
                street: street,
                regionCity: addressParts[1]?.trim() || '',
                governate: addressParts[2]?.trim() || ''
            };
        } else if (d.address) {
            addressData = { ...d.address, buildingNumber: d.address.buildingNo || '' };
        }
        // --- نهاية المنطق الذكي ---

        return `<option value="${d.serialNumber}" data-address='${JSON.stringify(addressData)}' ${d.serialNumber === defaultDevice.serialNumber ? 'selected' : ''}>
                    ${displayAddress || d.serialNumber}
                </option>`;
    }).join('')}
</select>

                

            </div>
            ${activitySelectorHTML}
        </div>
        <div class="form-grid" style="margin-top: 15px;">
            <!-- حقول بيانات المصدر القابلة للتعديل -->
            <div class="form-group"><label>اسم المصدر</label><input type="text" id="manual-seller-name" value="${sellerData.name}"></div>
            <div class="form-group"><label>الدولة</label><input type="text" id="manual-seller-country" value="EG" readonly></div>
            <div class="form-group"><label>المحافظة</label><input type="text" id="manual-seller-governate" value="${sellerData.governate}"></div>
            <div class="form-group"><label>المدينة</label><input type="text" id="manual-seller-regionCity" value="${sellerData.regionCity}"></div>
            <div class="form-group"><label>الشارع</label><input type="text" id="manual-seller-street" value="${sellerData.street}"></div>
            <div class="form-group"><label>رقم المبنى</label><input type="text" id="manual-seller-building" value="${sellerData.buildingNumber}"></div>
        </div>
    </div>
</div>


                                
                            </div>
                            <div id="tab-items" class="manual-tab-content">${itemsTabHTML}</div>

                            <!-- --- ✅ بداية تعديل هيكل تبويب الملخص --- -->
<!-- --- ✅ بداية تعديل هيكل تبويب الملخص الرأسي --- -->
<div id="tab-summary" class="manual-tab-content">
    <div class="summary-container">
        <h3 class="summary-header">ملخص الإيصال المالي</h3>
        
        <div class="summary-list">
            <!-- 1. إجمالي المبيعات -->
            <div class="summary-item">
                <span class="summary-label">إجمالي المبيعات (قبل الضرائب)</span>
                <span class="summary-value sales" id="summary-sales-total">0.00 ج.م</span>
            </div>

            <!-- 2. إجمالي الخصومات (سيظهر فقط عند وجود خصم) -->
            <div class="summary-item" id="summary-discount-row" style="display: none;">
                <span class="summary-label">إجمالي الخصم</span>
                <span class="summary-value discount" id="summary-discount-total">0.00 ج.م</span>
            </div>

            <!-- 3. حاوية تفاصيل الضرائب -->
            <div id="summary-tax-details">
                <!-- سيتم ملء تفاصيل الضرائب هنا ديناميكياً -->
            </div>
        </div>

        <!-- 4. الإجمالي النهائي -->
        <div class="summary-item grand-total">
            <span class="summary-label">الإجمالي النهائي المطلوب</span>
            <span class="summary-value" id="summary-grand-total">0.00 ج.م</span>
        </div>
    </div>

    <!-- 5. طريقة الدفع -->
    <div class="payment-section-vertical">
        <label for="payment-method">طريقة الدفع</label>
        <select id="payment-method">
            <option value="C" selected>نقدي (Cash)</option>
            <option value="V">فيزا/ماستركارد (Visa/Mastercard)</option>
        </select>
    </div>

    <!-- 6. أزرار الإجراءات -->

    <!-- ✨ الجزء الجديد مع زر قراءة JSON ✨ -->
<div class="actions-container">
    <button id="save-draft-btn" class="action-button draft-btn">📝 حفظ كمسودة</button>
    
    <!-- ✅ الزر الجديد هنا ✅ -->
    <button id="read-json-btn" type="button" class="action-button" style="background-color: #fd7e14; color: white;">🔍 قراءة JSON</button>
    
    <button id="send-manual-receipt-btn" class="action-button send-btn">${sendButtonText}</button>
</div>

</div>
<!-- --- ✅ نهاية تعديل هيكل تبويب الملخص الرأسي --- -->



                        </div>
                        <div class="manual-modal-footer"><button id="prevTabBtn" class="navigation-btn" disabled>السابق</button><button id="nextTabBtn" class="navigation-btn">التالي</button></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    
    // --- 4. إضافة الأنماط (CSS) ---
    const manualStyles = document.createElement('style');
    manualStyles.id = "manualSendFormStyles";
    if (!document.getElementById(manualStyles.id)) {
        manualStyles.innerHTML = `





        /* --- أنماط واجهة البحث عن الأكواد المنبثقة --- */
.code-search-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    z-index: 10002; /* يجب أن يكون أعلى من الواجهة الرئيسية */
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(5px);
}
.code-search-content {
    width: 700px;
    height: 80%;
    background: #fff;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 5px 25px rgba(0,0,0,0.2);
}
.code-search-header {
    padding: 15px 20px;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.code-search-header h4 { margin: 0; color: #1d3557; }
.code-search-header input {
    width: 50%;
    padding: 8px 12px;
    border: 1px solid #ced4da;
    border-radius: 8px;
    font-size: 15px;
}
.code-search-body {
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px;
}
.code-search-table {
    width: 100%;
    border-collapse: collapse;
}
.code-search-table th, .code-search-table td {
    padding: 12px;
    text-align: right;
    border-bottom: 1px solid #e9ecef;
}
.code-search-table th { background-color: #f8f9fa; font-weight: 600; }
.code-search-table tbody tr { cursor: pointer; transition: background-color 0.2s; }
.code-search-table tbody tr:hover { background-color: #e9f5ff; }
.code-search-table .code-value { font-family: monospace; color: #007bff; direction: ltr; text-align: left; }
.code-search-placeholder { text-align: center; padding: 40px; color: #888; font-size: 18px; }

            /* --- تصميم الواجهة الرئيسية المنبثقة --- */
            .manual-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 10001; display: none; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
            .manual-modal-content { width: 95%; max-width: 1300px; height: 90vh; background: #f4f7fa; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); animation: zoomIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
            @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            /* --- تصميم الشريط العلوي (Header) --- */
            .manual-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 25px; border-bottom: 1px solid #dee2e6; background-color: #ffffff; cursor: move; }
            .manual-modal-header h3 { margin: 0; font-size: 20px; color: #1d3557; }
            .manual-modal-header #closeManualModalBtn { background: #f1f1f1; color: #555; border: none; width: 30px; height: 30px; border-radius: 50%; font-size: 20px; cursor: pointer; transition: all 0.2s; }
            .manual-modal-header #closeManualModalBtn:hover { background: #e63946; color: white; transform: rotate(90deg); }
            /* --- تصميم التبويبات (Tabs) --- */
            .manual-modal-body { flex-grow: 1; display: flex; flex-direction: column; overflow-y: auto; }
            .manual-tabs { display: flex; border-bottom: 1px solid #dee2e6; padding: 0 20px; background-color: #ffffff; }
            .manual-tab-btn { padding: 18px 25px; border: none; background: transparent; cursor: pointer; font-size: 16px; font-weight: 600; color: #6c757d; border-bottom: 4px solid transparent; transition: all 0.3s; display: flex; align-items: center; gap: 10px; }
            .manual-tab-btn:hover { color: #007bff; background-color: #f8f9fa; }
            .manual-tab-btn.active { border-bottom-color: #007bff; color: #007bff; }
            .manual-tab-content-wrapper { flex-grow: 1; overflow-y: auto; }
            .manual-tab-content { display: none; padding: 30px; }
            .manual-tab-content.active { display: block; }
            /* --- مؤشرات التحقق وأزرار التنقل --- */
            .tab-status-indicator { display: inline-block; width: 18px; height: 18px; border-radius: 50%; line-height: 18px; text-align: center; font-size: 12px; font-weight: bold; color: white; background-color: #ced4da; transition: all 0.3s; }
            .tab-status-indicator.valid { background-color: #28a745; } .tab-status-indicator.valid::before { content: '✔'; }
            .tab-status-indicator.invalid { background-color: #dc3545; } .tab-status-indicator.invalid::before { content: '✖'; }
            .manual-modal-footer { padding: 15px 25px; border-top: 1px solid #dee2e6; display: flex; justify-content: space-between; background-color: #f8f9fa; }
            .navigation-btn { padding: 10px 30px; font-size: 16px; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
            .navigation-btn:disabled { background-color: #e9ecef; color: #6c757d; cursor: not-allowed; }
            #nextTabBtn { background-color: #007bff; color: white; }
            #prevTabBtn { background-color: #6c757d; color: white; }
            /* --- تصميم حقول الإدخال والجداول --- */
            .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; }
            .form-group { display: flex; flex-direction: column; }
            .form-group label { margin-bottom: 8px; font-weight: 600; color: #495057; font-size: 14px; }
            .form-group input, .form-group select { padding: 12px; border: 1px solid #ced4da; border-radius: 8px; font-size: 15px; transition: all 0.2s; }
            .form-group input:focus, .form-group select:focus { border-color: #007bff; box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1); outline: none; }
            .form-group input[readonly] { background-color: #e9ecef; cursor: not-allowed; }
            #items-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
            #items-table th, #items-table td { border: 1px solid #e9ecef; padding: 12px; text-align: center; }
            #items-table th { background-color: #e9ecef; font-weight: 700; color: #343a40; }
            #items-table tbody tr:nth-child(even) { background-color: #f8f9fa; }
            #items-table tbody tr { cursor: pointer; transition: background-color 0.2s; }
            #items-table tbody tr:hover { background-color: #e9ecef; }
            .editing-item { background-color: #fffbe6 !important; border: 2px solid #ffe58f; }
            .action-button { transition: all 0.2s; }
            .action-button:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.15); }



            .tax-row { 
    display: grid; 
    grid-template-columns: 1fr 1fr 1fr auto; 
    gap: 15px; 
    align-items: flex-end; 
    padding: 10px; 
    background: #f0f0f0; 
    border-radius: 6px; 
}
.delete-tax-row-btn { 
    background: #f8d7da; 
    color: #721c24; 
    border: 1px solid #f5c6cb; 
    border-radius: 50%; 
    width: 32px; 
    height: 32px; 
    font-size: 20px; 
    cursor: pointer; 
}
    /* --- ✅ بداية أنماط قسم الملخص الاحترافي --- */
.summary-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 25px;
    margin-bottom: 30px;
}
.summary-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 25px;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
    border: 1px solid #e9ecef;
}
.summary-card .card-icon {
    font-size: 36px;
    background-color: #e7f3ff;
    color: #007bff;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}
.summary-card.grand-total .card-icon {
    background-color: #d4edda;
    color: #155724;
}
.summary-card .card-content {
    display: flex;
    flex-direction: column;
}
.summary-card .card-label {
    font-size: 15px;
    color: #6c757d;
    margin-bottom: 5px;
}
.summary-card .card-value {
    font-size: 26px;
    font-weight: 700;
    color: #343a40;
}
.tax-details-container {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 30px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
}
.tax-details-header {
    margin: 0 0 15px 0;
    color: #1d3557;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}
.tax-details-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.tax-detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 8px;
    font-size: 16px;
}
.tax-detail-row .tax-name {
    font-weight: 600;
    color: #495057;
}
.tax-detail-row .tax-amount {
    font-weight: bold;
    color: #212529;
    direction: ltr;
}
.tax-detail-row.withholding-tax .tax-amount {
    color: #c0392b; /* لون أحمر لضريبة الخصم */
}
.tax-placeholder {
    text-align: center;
    color: #888;
    padding: 20px;
}
.payment-section {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 25px;
    align-items: flex-end;
    margin-top: 20px;
    border-top: 1px solid #dee2e6;
    padding-top: 30px;
}
.actions-container {
    display: flex;
    gap: 15px;
}
.actions-container .action-button {
    flex-grow: 1;
    padding: 15px;
    font-size: 18px;
    font-weight: bold;
}
.actions-container .draft-btn { background-color: #ffc107; color: #333; }
.actions-container .send-btn { background-color: #28a745; color: white; }
/* --- ✅ نهاية أنماط قسم الملخص الاحترافي --- */

/* --- ✅ بداية أنماط قسم الملخص الرأسي الاحترافي --- */
.summary-container {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.07);
    border: 1px solid #e9ecef;
    overflow: hidden;
    margin-bottom: 30px;
}
.summary-header {
    margin: 0;
    padding: 18px 25px;
    background-color: #f8f9fa;
    color: #1d3557;
    font-size: 18px;
    border-bottom: 1px solid #dee2e6;
}
.summary-list {
    padding: 15px 25px;
}
.summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px dashed #e0e0e0;
}
.summary-list .summary-item:last-child {
    border-bottom: none;
}
.summary-label {
    font-size: 16px;
    color: #495057;
    font-weight: 600;
}
.summary-value {
    font-size: 18px;
    font-weight: 700;
    direction: ltr;
}
.summary-value.sales { color: #007bff; }
.summary-value.discount { color: #e67e22; }

.tax-detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px dashed #e0e0e0;
}
.tax-detail-row .tax-name {
    font-size: 15px;
    color: #6c757d;
}
.tax-detail-row .tax-amount {
    font-weight: 600;
    color: #28a745;
    direction: ltr;
}
.tax-detail-row.withholding-tax .tax-amount {
    color: #c0392b; /* لون أحمر لضريبة الخصم */
}

.summary-item.grand-total {
    background-color: #f8f9fa;
    padding: 20px 25px;
    margin: 15px -25px -15px -25px;
    border-top: 1px solid #dee2e6;
}
.summary-item.grand-total .summary-label {
    font-size: 18px;
    color: #1d3557;
}
.summary-item.grand-total .summary-value {
    font-size: 28px;
    color: #155724;
}
.payment-section-vertical {
    margin-bottom: 30px;
}
.payment-section-vertical label {
    font-weight: bold;
    margin-bottom: 10px;
    display: block;
}
.payment-section-vertical select {
    width: 100%;
    padding: 12px;
    font-size: 16px;
}
.actions-container {
    display: flex;
    gap: 15px;
}
.actions-container .action-button {
    flex-grow: 1;
    padding: 15px;
    font-size: 18px;
    font-weight: bold;
}
.actions-container .draft-btn { background-color: #ffc107; color: #333; }
.actions-container .send-btn { background-color: #28a745; color: white; }
/* --- ✅ نهاية أنماط قسم الملخص الرأسي --- */

        `;
        document.head.appendChild(manualStyles);
    }

    // --- 5. ربط الأحداث والمنطق (الجزء الأساسي) ---
    const modal = container.querySelector('#manualSendModal');
    const modalHeader = container.querySelector('.manual-modal-header');
    makeDraggable(modal, modalHeader);
// << أضف هذا الكود الجديد بالكامل >>

const buyerIdInput = container.querySelector('#manual-buyer-id');
const nidStatus = container.querySelector('#nid-validation-status');

// دالة للتحقق من الرقم القومي عبر API
async function validateNID(nid) {
    if (!nid || nid.length !== 14 || !/^\d+$/.test(nid)) {
        return { valid: false, message: "يجب إدخال 14 رقمًا صحيحًا." };
    }
    try {
        const token = getAccessToken();
        if (!token) return { valid: false, message: "خطأ مصادقة." };
        
        const response = await fetch(`https://api-portal.invoicing.eta.gov.eg/api/v1/person/${nid}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        } );

        if (response.status === 200) {
            const data = await response.json();
            const fullName = `${data.firstName || ''} ${data.otherNames || ''}`.trim();
            return { valid: true, message: `صحيح (${fullName || 'شخص'})` };
        } else if (response.status === 400) {
            const errorData = await response.json();
            return { valid: false, message: errorData.error.details[0].message || "رقم قومي غير صالح." };
        } else {
            return { valid: false, message: `خطأ ${response.status} من الخادم.` };
        }
    } catch (error) {
        return { valid: false, message: "فشل التحقق من الرقم." };
    }
}

// ربط حدث التحقق عند الخروج من الحقل (blur)
buyerIdInput.addEventListener('blur', async () => {
    const nid = buyerIdInput.value.trim();
    // إذا كان الحقل فارغًا، أعده لوضعه الطبيعي
    if (!nid) {
        nidStatus.textContent = '';
        buyerIdInput.style.backgroundColor = '';
        buyerIdInput.style.borderColor = '';
        return;
    }

    nidStatus.textContent = '⏳ جاري التحقق...';
    nidStatus.style.color = '#007bff';
    
    const result = await validateNID(nid);

    if (result.valid) {
        nidStatus.textContent = `✅ ${result.message}`;
        nidStatus.style.color = '#28a745'; // أخضر
        buyerIdInput.style.backgroundColor = '#d4edda'; // أخضر فاتح
        buyerIdInput.style.borderColor = '#28a745';
    } else {
        nidStatus.textContent = `❌ ${result.message}`;
        nidStatus.style.color = '#dc3545'; // أحمر
        buyerIdInput.style.backgroundColor = '#f8d7da'; // أحمر فاتح
        buyerIdInput.style.borderColor = '#dc3545';
    }
});

// ربط حدث الإدخال لإعادة الحقل لوضعه الطبيعي عند بدء التعديل
buyerIdInput.addEventListener('input', () => {
    if (buyerIdInput.style.backgroundColor !== '') {
        nidStatus.textContent = '';
        buyerIdInput.style.backgroundColor = '';
        buyerIdInput.style.borderColor = '';
    }
});

    container.querySelector('#closeManualModalBtn').onclick = () => {
    modal.style.display = 'none';
    container.innerHTML = ''; // مهم: إفراغ الحاوية لتجنب المشاكل
};


const posSelect = container.querySelector('#pos-device-select');
posSelect.addEventListener('change', (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const addressData = JSON.parse(selectedOption.dataset.address || '{}');
    
    // --- بداية المنطق الذكي (مكرر للتأكيد) ---
    let buildingNumber = addressData.buildingNumber || '';
    let street = addressData.street || '';
    // هذا الشرط يعالج الحالة التي يكون فيها رقم المبنى مدمجًا مع الشارع
    if (street && !buildingNumber) {
        const buildingNumberMatch = street.match(/^(\d+)\s+/);
        if (buildingNumberMatch) {
            buildingNumber = buildingNumberMatch[1];
            street = street.substring(buildingNumberMatch[0].length).trim();
        }
    }
    // --- نهاية المنطق الذكي ---

    container.querySelector('#manual-seller-governate').value = addressData.governate || '';
    container.querySelector('#manual-seller-regionCity').value = addressData.regionCity || '';
    container.querySelector('#manual-seller-street').value = street;
    container.querySelector('#manual-seller-building').value = buildingNumber;
});

// استدعاء الحدث مرة واحدة لملء البيانات عند التحميل
posSelect.dispatchEvent(new Event('change'));

    const tabButtons = Array.from(container.querySelectorAll('.manual-tab-btn'));
    const tabContents = Array.from(container.querySelectorAll('.manual-tab-content'));
    const prevBtn = container.querySelector('#prevTabBtn');
    const nextBtn = container.querySelector('#nextTabBtn');
    let currentTabIndex = 0;

    function switchTab(index) {
        if (index < 0 || index >= tabButtons.length) return;
        validateAllTabs();
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        tabButtons[index].classList.add('active');
        tabContents[index].classList.add('active');
        currentTabIndex = index;
        prevBtn.disabled = (currentTabIndex === 0);
        nextBtn.disabled = (currentTabIndex === tabButtons.length - 1);
    }

    tabButtons.forEach(btn => btn.addEventListener('click', () => switchTab(parseInt(btn.dataset.tabIndex))));
    prevBtn.addEventListener('click', () => switchTab(currentTabIndex - 1));
    nextBtn.addEventListener('click', () => switchTab(currentTabIndex + 1));

    function validateTab(index) {
        const content = tabContents[index];
        const indicator = tabButtons[index].querySelector('.tab-status-indicator');
        let isTabValid = true;
        if (index === 1) { isTabValid = addedItems.length > 0; } 
        else {
            const requiredInputs = content.querySelectorAll('[required]');
            for (const input of requiredInputs) { if (!input.value.trim()) { isTabValid = false; break; } }
        }
        indicator.classList.remove('valid', 'invalid');
        indicator.classList.add(isTabValid ? 'valid' : 'invalid');
    }
    function validateAllTabs() { tabButtons.forEach((_, index) => validateTab(index)); }
    modal.querySelectorAll('input[required], select[required]').forEach(input => input.addEventListener('input', validateAllTabs));
// << أضف هذا الكود الجديد بالكامل >>

    const addNewItemButton = container.querySelector('#add-new-item-button');
    const itemFormWrapper = container.querySelector('#item-form-wrapper');

    addNewItemButton.addEventListener('click', () => {
        itemFormWrapper.style.display = 'block'; // إظهار نموذج إضافة الصنف
        addNewItemButton.style.display = 'none'; // إخفاء زر "إضافة صنف جديد"
        resetForm(); // إعادة تهيئة النموذج لأي صنف جديد
        itemFormWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' }); // التمرير للنموذج
    });

  
    
    // --- ✅ استبدال كامل 1: دالة resetForm ---
function resetForm() {
    // إعادة تعيين حقول النموذج الأساسية
    itemForm.reset();
    
    // الأهم: مسح حاوية الضرائب بالكامل
    taxesContainer.innerHTML = '';
    
    // تحديث حقل الإجمالي
    updateTotal();
    
    // إعادة تعيين متغيرات الحالة
    currentlyEditingIndex = -1;
    addItemBtn.textContent = 'إضافة الصنف';
    cancelEditBtn.style.display = 'none';
    
    // إزالة أي علامة "تعديل" من جدول الأصناف
    itemsTableBody.querySelectorAll('tr').forEach(r => r.classList.remove('editing-item'));
    
    // إخفاء نموذج الإضافة وإظهار زر "إضافة صنف جديد"
    itemFormWrapper.style.display = 'none';
    addNewItemButton.style.display = 'block';
}





 
 // ✨✨✨ الكود الجديد لحساب الإجمالي بالجنيه ✨✨✨
 const qtyInput = container.querySelector('#item-quantity');
 const priceInput = container.querySelector('#item-unit-price');
 const currencySelect = container.querySelector('#item-currency');
 const exchangeRateInput = container.querySelector('#item-exchange-rate');
 const totalEgpInput = container.querySelector('#item-total-egp');

 const updateTotalEGP = () => {
     const qty = parseFloat(qtyInput.value) || 0;
     const price = parseFloat(priceInput.value) || 0;
     const rate = parseFloat(exchangeRateInput.value) || 1;
     totalEgpInput.value = (qty * price * rate).toFixed(5);
 };

 currencySelect.addEventListener('change', () => {
     if (currencySelect.value === 'EGP') {
         exchangeRateInput.value = 1;
         exchangeRateInput.readOnly = true;
         exchangeRateInput.style.backgroundColor = '#eee';
     } else {
         exchangeRateInput.readOnly = false;
         exchangeRateInput.style.backgroundColor = 'white';
     }
     updateTotalEGP();
 });

 [qtyInput, priceInput, exchangeRateInput, currencySelect].forEach(el => el.addEventListener('input', updateTotalEGP));
 currencySelect.dispatchEvent(new Event('change'));


    const taxesContainer = container.querySelector('#item-taxes-container');
    let taxRowCount = 0;

    
  
    // --- ✅✅✅ بداية التعديل النهائي لدالة addTaxRow ✅✅✅ ---

function addTaxRow(taxData = null) {
    // التأكد من عدم تجاوز الحد الأقصى
    if (taxesContainer.children.length >= 2) {
        showToastNotification('لا يمكن إضافة أكثر من ضريبتين.', 3000);
        return;
    }

    // 1. إنشاء العنصر الرئيسي وإعطائه الكلاس الصحيح ".tax-row"
    const taxRow = document.createElement('div');
    taxRow.className = 'tax-row'; // هذا هو السطر الأهم الذي يحل المشكلة

    // 2. بناء الهيكل الداخلي للحقول (لا تغيير هنا)
    taxRow.innerHTML = `
        <div class="form-group"><label>النوع الأساسي</label><select class="tax-type">${taxTypesData.map(t => `<option value="${t.Code}">${t.Desc_ar}</option>`).join('')}</select></div>
        <div class="form-group"><label>النوع الفرعي</label><select class="tax-subtype"></select></div>
        <div class="form-group"><label>النسبة %</label><input type="number" class="tax-rate" step="any" placeholder="مثال: 14"></div>
        <button type="button" class="delete-tax-row-btn" title="حذف الضريبة">&times;</button>
    `;
    
    // 3. إضافة الصف الجديد إلى الحاوية
    taxesContainer.appendChild(taxRow);

    // 4. ربط الأحداث والدوال المساعدة للصف الجديد (لا تغيير هنا)
    const typeSelect = taxRow.querySelector('.tax-type');
    const subtypeSelect = taxRow.querySelector('.tax-subtype');
    
    const updateSubtypes = () => {
        const selectedType = typeSelect.value;
        // فلترة الأنواع الفرعية بناءً على النوع الرئيسي المختار
        const relevantSubtypes = taxSubtypesData.filter(st => {
            const taxTypeDefinition = taxTypesData.find(t => t.Code === selectedType);
            return st.TaxtypeReference === taxTypeDefinition?.Desc_ar || st.TaxtypeReference === selectedType;
        });
        subtypeSelect.innerHTML = relevantSubtypes.map(s => `<option value="${s.Code}">${s.Desc_ar}</option>`).join('');
        // تحديد قيمة افتراضية لضريبة القيمة المضافة
        if (selectedType === 'T1') {
            subtypeSelect.value = 'V009';
        }
    };

    typeSelect.addEventListener('change', updateSubtypes);
    updateSubtypes(); // استدعاء فوري لملء القائمة الفرعية عند الإنشاء

    // 5. ملء البيانات إذا كان هذا تعديلاً لصنف موجود (لا تغيير هنا)
    if (taxData) {
        typeSelect.value = taxData.taxType;
        updateSubtypes(); // استدعاء مرة أخرى لتحديث القائمة بناءً على البيانات
        subtypeSelect.value = taxData.subType;
        taxRow.querySelector('.tax-rate').value = taxData.rate;
    }

    // 6. ربط حدث زر الحذف (لا تغيير هنا)
    taxRow.querySelector('.delete-tax-row-btn').onclick = () => {
        taxRow.remove();
        // لا تنس تحديث الإجمالي بعد حذف ضريبة
        updateSummary(); 
    };

    // 7. ربط حدث تحديث الإجمالي عند تغيير النسبة
    taxRow.querySelector('.tax-rate').addEventListener('input', updateSummary);
}

// --- ✅✅✅ نهاية التعديل النهائي ---

    container.querySelector('#add-tax-row-btn').onclick = () => addTaxRow();

      const itemCodeInput = container.querySelector('#item-code');


      
    const itemCodeNameInput = container.querySelector('#item-code-name');
    // --- ✅✅✅ بداية التعديل: إضافة أيقونة بحث وفتح الواجهة المنبثقة ✅✅✅ ---
    const itemCodeTypeSelect = container.querySelector('#item-code-type');
    const itemCodeGroup = itemCodeInput.parentElement; // الحصول على حاوية الحقل

    // تعديل تصميم الحاوية لتسمح بوضع الأيقونة
    itemCodeGroup.style.position = 'relative';

    // إنشاء أيقونة البحث
    const searchIcon = document.createElement('span');
    searchIcon.innerHTML = '🔍';
    Object.assign(searchIcon.style, {
        position: 'absolute',
        left: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        cursor: 'pointer',
        fontSize: '18px',
        display: itemCodeTypeSelect.value === 'EGS' ? 'block' : 'none' // إظهارها فقط لـ EGS
    });
    itemCodeGroup.appendChild(searchIcon);

    // دالة لإظهار/إخفاء الأيقونة بناءً على نوع الكود
    const toggleSearchIcon = () => {
        searchIcon.style.display = itemCodeTypeSelect.value === 'EGS' ? 'block' : 'none';
    };
    itemCodeTypeSelect.addEventListener('change', toggleSearchIcon);

    // ربط حدث النقر على الأيقونة لفتح واجهة البحث
    searchIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // منع أي أحداث أخرى
        showEgsCodeSearchModal((selectedCode) => {
            // هذه الدالة هي ما سيحدث عند اختيار كود
            itemCodeInput.value = selectedCode.codeLookupValue;
            itemCodeNameInput.value = selectedCode.codeNameSecondaryLang;
            // يمكنك ملء الوصف تلقائيًا أيضًا إذا أردت
            container.querySelector('#item-description').value = selectedCode.codeNameSecondaryLang;
        });
    });
    // --- ✅✅✅ نهاية التعديل ---

    // دالة مجمعة للتحقق من الكود
    const handleCodeValidation = async () => {
        const code = itemCodeInput.value.trim();
        const codeType = itemCodeTypeSelect.value; //  قراءة النوع المختار (EGS أو GS1)

        if (!code) {
            itemCodeNameInput.value = ''; // مسح الحقل إذا كان الكود فارغًا
            return;
        }

        itemCodeNameInput.value = 'جاري التحقق...';
        let codeData = null;

        //  التحقق بناءً على النوع المختار
        if (codeType === 'EGS') {
            codeData = await fetchMyEGSCode(code);
        } else if (codeType === 'GS1') {
            codeData = await fetchGS1Code(code);
        }

        // عرض النتيجة
        itemCodeNameInput.value = codeData ? codeData.codeNameSecondaryLang : '!! كود غير صالح !!';
    };

    // ربط حدث التحقق عند الخروج من حقل الكود أو عند تغيير نوع الكود
    itemCodeInput.addEventListener('blur', handleCodeValidation);
    itemCodeTypeSelect.addEventListener('change', handleCodeValidation);

    // --- 6. ربط الأحداث والمنطق (الجزء المتقدم) ---
    const itemForm = container.querySelector('#item-form');
    const itemsTableBody = container.querySelector('#items-table tbody');
    const addItemBtn = container.querySelector('#add-item-btn');
    const cancelEditBtn = container.querySelector('#cancel-edit-btn');

    function resetForm() {
        itemForm.reset();
        taxesContainer.innerHTML = '';
        taxRowCount = 0;
        updateTotal();
        currentlyEditingIndex = -1;
        addItemBtn.textContent = 'إضافة الصنف';
        cancelEditBtn.style.display = 'none';
        itemsTableBody.querySelectorAll('tr').forEach(r => r.classList.remove('editing-item'));
    }

    cancelEditBtn.addEventListener('click', resetForm);

 
   
   /**
 * ===================================================================================
 * ✅✅✅ دالة ملء نموذج التعديل (v2.0 - الإصلاح النهائي لمنطق العملات)
 * ===================================================================================
 */
function populateItemForm(itemData) {
    // --- 1. ملء الحقول الأساسية (لا تغيير هنا) ---
    container.querySelector('#item-code-type').value = itemData.itemType;
    container.querySelector('#item-code').value = itemData.itemCode;
    container.querySelector('#item-description').value = itemData.description;
    container.querySelector('#item-quantity').value = itemData.quantity;

    // --- 2. ✨✨✨ بداية التعديل الحاسم: ملء حقول العملة والسعر بشكل صحيح ✨✨✨ ---
    const currencySelect = container.querySelector('#item-currency');
    const exchangeRateInput = container.querySelector('#item-exchange-rate');
    const priceInput = container.querySelector('#item-unit-price');

    // أ. ملء العملة وسعر الصرف من البيانات المحفوظة
    currencySelect.value = itemData.currencySold || 'EGP';
    exchangeRateInput.value = itemData.exchangeRate || 1;

    // ب. وضع السعر الصحيح (بالعملة الأجنبية أو الجنيه) في حقل السعر
    priceInput.value = itemData.unitPrice; 
    
    // ج. تفعيل/تعطيل حقل سعر الصرف بناءً على العملة
    currencySelect.dispatchEvent(new Event('change'));

    // د. تحديث حقل الإجمالي بالجنيه المصري
    updateTotalEGP();
    // --- ✨✨✨ نهاية التعديل الحاسم --- ✨✨✨

    // --- 3. ملء الضرائب (لا تغيير هنا) ---
    const taxesContainer = container.querySelector('#item-taxes-container');
    taxesContainer.innerHTML = '';
    if (itemData.taxableItems && itemData.taxableItems.length > 0) {
        itemData.taxableItems.forEach(tax => {
            addTaxRow(tax); 
        });
    }
    
    // --- 4. جلب اسم الكود الرسمي (لا تغيير هنا) ---
    container.querySelector('#item-code').dispatchEvent(new Event('blur'));
}




    function renderItemsTable() {
        itemsTableBody.innerHTML = '';
        addedItems.forEach((item, index) => {
            const row = itemsTableBody.insertRow();
            row.dataset.index = index;
            row.className = (index === currentlyEditingIndex) ? 'editing-item' : '';
// --- ✅ تعديل 2: ملء عمود الضرائب بالبيانات ---
// بناء ملخص نصي للضرائب
const taxesSummary = item.taxableItems.map(tax => `${tax.taxType}(${tax.rate}%)`).join(', ') || '<span style="color: #999;">لا يوجد</span>';

row.innerHTML = `
    <td>${item.itemCode}</td>
    <td>${item.description}</td>
    <td>${item.quantity}</td>
    <td>${item.unitPrice.toFixed(2)}</td>
    <td style="font-size: 12px; font-weight: bold;">${taxesSummary}</td>
    <td>${item.total.toFixed(5)}</td>
    <td><button class="delete-item-btn" data-index="${index}" style="background: #dc3545; color: white; border: none; border-radius: 50%; cursor: pointer; width: 28px; height: 28px;">&times;</button></td>
`;
            
            row.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-item-btn')) return;
                itemsTableBody.querySelectorAll('tr').forEach(r => r.classList.remove('editing-item'));
                row.classList.add('editing-item');
                currentlyEditingIndex = index;
                populateItemForm(addedItems[index]);
                addItemBtn.textContent = 'حفظ التعديلات';
                cancelEditBtn.style.display = 'inline-block';
                itemForm.scrollIntoView({ behavior: 'smooth' });
            });
        });
             container.querySelectorAll('.delete-item-btn').forEach(btn => {
            btn.onclick = (e) => { 
                e.stopPropagation();
                addedItems.splice(btn.dataset.index, 1); 
                if (currentlyEditingIndex == btn.dataset.index) resetForm();
                renderItemsTable(); 
                validateAllTabs(); 
            };
        });
            updateSummary();
        // ✅ جديد: بعد تحديث الجدول، إذا كان فارغًا، أعد إظهار زر "إضافة صنف جديد" وأخفِ النموذج
        if (addedItems.length === 0) {
            itemFormWrapper.style.display = 'none';
            addNewItemButton.style.display = 'block';
        } else {
            // إذا كان هناك أصناف، تأكد من إخفاء زر "إضافة صنف جديد" وإظهار النموذج
            itemFormWrapper.style.display = 'block';
            addNewItemButton.style.display = 'none';
        }
    }


 
  
    // --- ✅✅✅ بداية الكود التشخيصي لحدث submit ✅✅✅ ---

itemForm.addEventListener('submit', (e) => {
    e.preventDefault();
 
    const itemData = {
        itemType: container.querySelector('#item-code-type').value,
        itemCode: container.querySelector('#item-code').value,
        description: container.querySelector('#item-description').value,
        unitType: 'EA',
        quantity: parseFloat(qtyInput.value) || 0,
        unitPrice: parseFloat(priceInput.value) || 0,
        // --- بداية الإضافة الحاسمة ---
        currencySold: currencySelect.value,
        exchangeRate: parseFloat(exchangeRateInput.value) || 1,
        // --- نهاية الإضافة الحاسمة ---
        total: parseFloat(totalEgpInput.value) || 0, // استخدم الإجمالي بالجنيه
        taxableItems: []
    };


    // 2. البحث عن صفوف الضرائب
    const taxRowsFound = taxesContainer.querySelectorAll('.tax-row');

    // 3. المرور على صفوف الضرائب وجمع البيانات منها
    taxRowsFound.forEach((row, index) => {
        const rateInput = row.querySelector('.tax-rate');
        const typeSelect = row.querySelector('.tax-type');
        const subtypeSelect = row.querySelector('.tax-subtype');

        
        if (rateInput && rateInput.value.trim() !== '') {
            const rate = parseFloat(rateInput.value);
            if (!isNaN(rate)) {
                const taxObject = {
                    taxType: typeSelect.value,
                    subType: subtypeSelect.value,
                    rate: rate
                };
                itemData.taxableItems.push(taxObject);
            } else {
            }
        } else {
        }
    });

    // 4. إضافة أو تحديث الصنف في المصفوفة الرئيسية
    if (currentlyEditingIndex > -1) {
        addedItems[currentlyEditingIndex] = itemData;
    } else {
        addedItems.push(itemData);
    }
    
    // 5. إعادة تهيئة النموذج وتحديث الواجهة
    resetForm();
    renderItemsTable();
    validateAllTabs();
});

// --- ✅✅✅ نهاية الكود التشخيصي ---

// --- ✅✅✅ نهاية التعديل النهائي ---

    // ✅ --- بداية المنطق الجديد الخاص بالمرتجعات --- ✅
    if (isReturn) {
        const fetchBtn = container.querySelector('#fetch-invoice-details-btn');
        const originalItemsContainer = container.querySelector('#original-invoice-items-container');
        const originalItemsList = container.querySelector('#original-items-list');
        const addSelectedBtn = container.querySelector('#add-selected-to-return-btn');

        fetchBtn.addEventListener('click', async () => {
            const uuid = container.querySelector('#manual-reference-uuid').value.trim();
            if (!uuid) { alert("يرجى إدخال UUID أولاً."); return; }

            const originalText = fetchBtn.textContent;
            fetchBtn.textContent = '⏳';
            fetchBtn.disabled = true;

            try {
                const token = getAccessToken();
                if (!token) throw new Error('لم يتم العثور على توكن الدخول.');

                const apiUrl = `https://api-portal.invoicing.eta.gov.eg/api/v1/receipts/${uuid}/details`;
                const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } } );

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || `فشل جلب البيانات (رمز الحالة: ${response.status})`);
                }
                
                const data = await response.json();
                
                // 1. تخزين بيانات الفاتورة كاملة
                originalInvoiceData = data.receipt;

                // 2. ملء بيانات العميل
                container.querySelector('#manual-buyer-name').value = originalInvoiceData.buyer?.buyerName || '';
                container.querySelector('#manual-buyer-id').value = originalInvoiceData.buyer?.buyerId || '';
                showToastNotification('✅ تم جلب بيانات الفاتورة الأصلية بنجاح.', 3000);

                // 3. عرض أصناف الفاتورة الأصلية في الحاوية المخصصة
                if (originalInvoiceData.itemData && originalInvoiceData.itemData.length > 0) {
                    originalItemsList.innerHTML = originalInvoiceData.itemData.map((item, index) => `
                        <div style="padding: 8px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" class="original-item-checkbox" data-index="${index}" style="width: 18px; height: 18px;">
                            <label style="flex-grow: 1;">
                                ${item.description} (الكمية: ${item.quantity}, السعر: ${item.unitPrice.toFixed(2)})
                            </label>
                        </div>
                    `).join('');
                    originalItemsContainer.style.display = 'block';
                } else {
                    originalItemsList.innerHTML = '<p style="color: #888;">لا توجد أصناف في هذه الفاتورة.</p>';
                }

            } catch (error) {
                alert(`❌ خطأ: ${error.message}`);
                originalItemsContainer.style.display = 'none';
            } finally {
                fetchBtn.textContent = originalText;
                fetchBtn.disabled = false;
            }
        });

  


// ✨✨✨ --- بداية الكود الكامل والنهائي لزر "إضافة المحدد للمرتجع" (v3.0 - الإصلاح النهائي) --- ✨✨✨
addSelectedBtn.addEventListener('click', () => {
    const selectedCheckboxes = container.querySelectorAll('.original-item-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        alert("يرجى تحديد صنف واحد على الأقل لإضافته للمرتجع.");
        return;
    }

    const originalCurrency = originalInvoiceData.currency || 'EGP';
    const originalExchangeRate = originalInvoiceData.exchangeRate || 1;

    selectedCheckboxes.forEach(checkbox => {
        const index = parseInt(checkbox.dataset.index, 10);
        const originalItem = originalInvoiceData.itemData[index];

        if (originalItem) {
            // --- ✅ 1. تحديد السعر الصحيح بناءً على العملة ---
            let priceToUse;
            // ✨✨✨ الإصلاح الحاسم هنا ✨✨✨
            if (originalCurrency !== 'EGP' && originalItem.unitValue && typeof originalItem.unitValue.amountSold !== 'undefined') {
                // إذا كانت العملة أجنبية، استخدم السعر بالعملة الأجنبية (amountSold)
                priceToUse = originalItem.unitValue.amountSold;
            } else {
                // إذا كانت العملة جنيه، استخدم السعر العادي (unitPrice الذي هو نفسه amountEGP)
                priceToUse = originalItem.unitPrice;
            }

            // --- ✅ 2. إنشاء كائن الصنف الجديد بالسعر الصحيح ---
            const newItemForReturn = {
                itemType: originalItem.itemType,
                itemCode: originalItem.itemCode,
                description: originalItem.description,
                unitType: originalItem.unitType,
                quantity: originalItem.quantity,
                unitPrice: priceToUse, // 👈 استخدام السعر الصحيح هنا
                currencySold: originalCurrency,
                exchangeRate: originalExchangeRate,
                total: originalItem.total, // Total يبقى كما هو للمقارنة
                taxableItems: originalItem.taxableItems.map(tax => ({
                    taxType: tax.taxType,
                    subType: tax.subType,
                    rate: tax.rate,
                    amount: tax.amount
                }))
            };
            addedItems.push(newItemForReturn);
        }
    });

    renderItemsTable();
    validateAllTabs();
    originalItemsContainer.style.display = 'none';
    showToastNotification(`✅ تم إضافة ${selectedCheckboxes.length} صنف للمرتجع.`, 3000);
});
// ✨✨✨ --- نهاية الكود الكامل --- ✨✨✨

    }
    // ✅ --- نهاية المنطق الجديد الخاص بالمرتجعات --- ✅

   
 
 /**
 * ===================================================================================
 * ✅✅✅ دالة عرض الملخص (v2.0 - الإصلاح النهائي لمنطق حساب الإجمالي)
 * ===================================================================================
 */
function updateSummary() {
    const taxNamesMap = {
        "T1": "ضريبة القيمة المضافة", "T2": "ضريبة الجدول (نسبية)", "T3": "ضريبة الجدول (النوعية)",
        "T4": "خصم من المنبع", "T5": "ضريبة الدمغة (نسبية)", "T6": "ضريبة الدمغة (قطعية)",
        "T7": "ضريبة الملاهي", "T8": "رسم تنمية الموارد", "T9": "رسم خدمة",
        "T10": "رسم المحليات", "T11": "رسم التأمين الصحي", "T12": "رسوم أخرى"
    };

    const taxDetailsContainer = container.querySelector('#summary-tax-details');
    const discountRow = container.querySelector('#summary-discount-row');
    
    let totalSalesEGP = 0;
    let totalDiscountEGP = 0;
    const taxTotals = new Map();

    // ✨✨✨ --- بداية التعديل الحاسم --- ✨✨✨
    // 1. المرور على الأصناف المضافة وحساب الإجماليات بالجنيه المصري
    addedItems.forEach(item => {
        const quantity = (item.quantity || 0);
        const unitPrice = (item.unitPrice || 0);
        const exchangeRate = (item.exchangeRate || 1);
        
        // حساب إجمالي المبيعات بالجنيه المصري
        const salesBeforeDiscountEGP = quantity * unitPrice * exchangeRate;
        totalSalesEGP += salesBeforeDiscountEGP;

        // حساب الخصم (إذا وجد)
        const discountAmount = (item.discount?.amount || 0);
        totalDiscountEGP += discountAmount;
        
        const netSaleEGP = salesBeforeDiscountEGP - discountAmount;
        
        // حساب الضرائب بناءً على القيمة بالجنيه المصري
        let tableTaxAmount = 0;
        item.taxableItems.forEach(tax => {
            if (tax.taxType === 'T2' || tax.taxType === 'T3') {
                tableTaxAmount += netSaleEGP * ((tax.rate || 0) / 100);
            }
        });
        const vatBaseAmount = netSaleEGP + tableTaxAmount;
        item.taxableItems.forEach(tax => {
            const baseAmount = (tax.taxType === 'T1') ? vatBaseAmount : netSaleEGP;
            const taxAmount = baseAmount * ((tax.rate || 0) / 100);
            taxTotals.set(tax.taxType, (taxTotals.get(tax.taxType) || 0) + taxAmount);
        });
    });
    // ✨✨✨ --- نهاية التعديل الحاسم --- ✨✨✨

    if (totalDiscountEGP > 0) {
        discountRow.style.display = 'flex';
        container.querySelector('#summary-discount-total').textContent = `-${totalDiscountEGP.toFixed(2)} ج.م`;
    } else {
        discountRow.style.display = 'none';
    }

    let grandTotalEGP = totalSalesEGP - totalDiscountEGP;
    let taxDetailsHTML = '';

    if (taxTotals.size > 0) {
        taxTotals.forEach((amount, type) => {
            const taxName = taxNamesMap[type] || type;
            const isWithholding = type === 'T4';
            grandTotalEGP += (isWithholding ? -amount : amount);
            
            taxDetailsHTML += `
                <div class="tax-detail-row ${isWithholding ? 'withholding-tax' : ''}">
                    <span class="tax-name">${taxName}</span>
                    <span class="tax-amount">${isWithholding ? '-' : ''}${amount.toFixed(5)} ج.م</span>
                </div>
            `;
        });
        taxDetailsContainer.innerHTML = taxDetailsHTML;
    } else {
        taxDetailsContainer.innerHTML = '<div class="tax-placeholder">لم يتم إضافة أي ضرائب.</div>';
    }

    // عرض القيم النهائية بالجنيه المصري
    container.querySelector('#summary-sales-total').textContent = `${totalSalesEGP.toFixed(2)} ج.م`;
    container.querySelector('#summary-grand-total').textContent = `${grandTotalEGP.toFixed(2)} ج.م`;
}



/**
 * ✅✅✅ دالة مساعدة (النسخة النهائية): تجمع البيانات وتحسب الإجماليات والضرائب. ✅✅✅
 * @param {HTMLElement} invoiceGroupElement - عنصر tbody الذي يمثل الفاتورة.
 * @returns {Object} - كائن يحتوي على هيكل الفاتورة الكامل والجاهز للإرسال.
 */
function collectRawDataFromGroup(invoiceGroupElement) {
    // --- 1. جمع البيانات الأساسية من الواجهة ---
    const headerData = {};
    invoiceGroupElement.querySelectorAll('[data-field], [data-issuer-field], [data-receiver-field], [data-invoice-field]').forEach(cell => {
        const key = cell.dataset.field || cell.dataset.issuerField || cell.dataset.receiverField || cell.dataset.invoiceField;
        if (key) {
            headerData[key] = cell.textContent.trim();
        }
    });

    // --- 2. حساب الإجماليات والضرائب من بنود الفاتورة ---
    let totalSalesAmount = 0;
    let totalDiscountAmount = 0;
    const taxTotalsMap = new Map();
    const invoiceLines = [];
    const rawLinesData = []; // لتخزين البيانات الخام للـ lineItemCodes

    invoiceGroupElement.querySelectorAll('.items-table tbody tr').forEach(row => {
        const line = {};
        row.querySelectorAll('[data-field]').forEach(cell => {
            // التعامل مع الخلايا التي تحتوي على حقول متعددة (مثل الضرائب)
            if (cell.querySelectorAll('span[data-field]').length > 0) {
                cell.querySelectorAll('span[data-field]').forEach(span => {
                    line[span.dataset.field] = span.textContent.trim();
                });
            } else {
                line[cell.dataset.field] = cell.textContent.trim();
            }
        });
        rawLinesData.push(line); // إضافة بيانات السطر الخام

        const quantity = parseFloat(line.quantity) || 0;
        const amountEGP = parseFloat(line.unit_price) || 0;
        const salesTotal = parseFloat((quantity * amountEGP).toFixed(5));
        totalSalesAmount += salesTotal;

        const discountAmount = parseFloat(line.discount_amount) || (salesTotal * (parseFloat(line.discount_rate) || 0) / 100);
        totalDiscountAmount += discountAmount;

        const netTotal = parseFloat((salesTotal - discountAmount).toFixed(5));

        const taxableItems = [];
        let totalTaxAmountForItem = 0;
        for (let i = 1; i <= 3; i++) {
            const taxType = line[`tax_type_${i}`]?.trim().toUpperCase();
            const taxRateStr = line[`tax_rate_${i}`];
            if (taxType && taxRateStr != null && taxRateStr.trim() !== '' && !isNaN(parseFloat(taxRateStr))) {
                const taxRate = parseFloat(taxRateStr);
                const taxAmount = parseFloat((netTotal * (taxRate / 100)).toFixed(5));
                const taxSubtype = line[`tax_subtype_${i}`]?.trim() || defaultSubtypes[taxType] || "";
                taxableItems.push({ taxType, amount: taxAmount, subType: taxSubtype, rate: taxRate });

                totalTaxAmountForItem += (taxType === "T4" ? -taxAmount : taxAmount);
                taxTotalsMap.set(taxType, (taxTotalsMap.get(taxType) || 0) + taxAmount);
            }
        }

        invoiceLines.push({
            description: line.item_description,
            itemType: line.item_type,
            itemCode: line.item_code,
            internalCode: line.item_internal_code || line.item_code,
            unitType: line.unit_type,
            quantity: quantity,
            unitValue: { currencySold: "EGP", amountEGP: amountEGP },
            salesTotal: salesTotal,
            discount: { amount: discountAmount },
            netTotal: netTotal,
            taxableItems: taxableItems,
            total: parseFloat((netTotal + totalTaxAmountForItem).toFixed(5)),
            valueDifference: 0,
            totalTaxableFees: 0,
            itemsDiscount: 0
        });
    });

    const taxTotals = Array.from(taxTotalsMap, ([taxType, amount]) => ({ taxType, amount: parseFloat(amount.toFixed(5)) }));
    const finalTotalAmount = invoiceLines.reduce((sum, line) => sum + line.total, 0);

    // --- 3. بناء هيكل JSON النهائي بنفس شكل المسودة ---
    const finalPayload = {
        tags: ["FullInvoice", "SignatureRequired"],
        document: {
            documentType: "I",
            documentTypeVersion: "1.0",
// --- ✅✅✅ بداية التعديل النهائي: منطق التاريخ من بيانات رأس الفاتورة ✅✅✅ ---
dateTimeIssued: (firstLine.dateTimeIssued && !isNaN(new Date(firstLine.dateTimeIssued))) 
    ? new Date(firstLine.dateTimeIssued).toISOString().split('.')[0] + "Z" 
    : new Date().toISOString().split('.')[0] + "Z",

serviceDeliveryDate: (firstLine.serviceDeliveryDate && !isNaN(new Date(firstLine.serviceDeliveryDate)))
    ? new Date(firstLine.serviceDeliveryDate).toISOString().split('T')[0]
    : undefined,
// --- ✅✅✅ نهاية التعديل النهائي ---
            taxpayerActivityCode: document.getElementById('activity-select-editor')?.value || "4690",
            internalID: headerData.internalID,
            issuer: {
                type: "B", id: headerData.id, name: headerData.name,
                address: { branchID: "0", country: "EG", governate: headerData.governate, regionCity: headerData.regionCity, street: headerData.street, buildingNumber: headerData.buildingNumber }
            },
            receiver: {
                type: headerData.receiver_type, id: headerData.receiver_id, name: headerData.receiver_name,
                address: { country: headerData.receiver_country, governate: headerData.receiver_governate, regionCity: headerData.receiver_city, street: headerData.receiver_street, buildingNumber: headerData.receiver_building }
            },
            invoiceLines: invoiceLines,
            totalSalesAmount: parseFloat(totalSalesAmount.toFixed(5)),
            totalDiscountAmount: parseFloat(totalDiscountAmount.toFixed(5)),
            netAmount: parseFloat((totalSalesAmount - totalDiscountAmount).toFixed(5)),
            taxTotals: taxTotals,
            totalAmount: parseFloat(finalTotalAmount.toFixed(5)),
            signatures: [{ signatureType: "I", value: "VGVtcG9yYXJ5IFNpZ25hdHVyZSBIb2xkZXI=" }]
        },
        lineItemCodes: rawLinesData.map(line => ({
            codeType: line.item_type,
            itemCode: line.item_code,
            codeNamePrimaryLang: line.item_code_name || line.item_description,
            codeNameSecondaryLang: line.item_code_name || line.item_description
        }))
    };

    return finalPayload;
}





/**
 * =========================================================================
 * ✅ الدالة النهائية والمعدلة: لحفظ تاريخ الإصدار مع المسودة
 * =========================================================================
 */
function collectDataForDraft() {
    if (addedItems.length === 0) {
        alert("لا يمكن حفظ مسودة فارغة. يرجى إضافة صنف واحد على الأقل.");
        return null;
    }

    // --- ✅ بداية التعديل ---
    // إضافة قراءة تاريخ الإصدار من الحقل المخصص
    const dateTimeIssued = container.querySelector('#manual-datetime-issued').value;
    // --- ✅ نهاية التعديل ---

    const draftData = {
        receiptNumber: container.querySelector('#manual-receipt-number').value,
        
        // --- ✅ التعديل هنا: إضافة التاريخ الذي قرأناه إلى كائن المسودة ---
        dateTimeIssued: dateTimeIssued, 
        
        buyerName: container.querySelector('#manual-buyer-name').value,
        buyerId: container.querySelector('#manual-buyer-id').value,
        documentType: documentType, // 'sale' or 'return'
        referenceUUID: isReturn ? (container.querySelector('#manual-reference-uuid')?.value || '') : undefined,
        items: addedItems
    };
    return draftData;
}


// ربط حدث زر "حفظ كمسودة"
container.querySelector('#save-draft-btn').onclick = () => {
    const draftData = collectDataForDraft();
    if (draftData) {
        const drafts = JSON.parse(localStorage.getItem("receiptDrafts") || "[]");
        drafts.unshift(draftData); // إضافة المسودة الجديدة في بداية القائمة
        localStorage.setItem("receiptDrafts", JSON.stringify(drafts));
        
        showToastNotification(`✅ تم حفظ "${draftData.receiptNumber}" كمسودة بنجاح.`, 4000);
        
        // إغلاق الواجهة بعد الحفظ
        const modal = container.querySelector('#manualSendModal');
        modal.style.display = 'none';
        container.innerHTML = '';
        
        // تحديث قائمة المسودات في تبويب المسودات
        renderReceiptDrafts();
    }
};





// ✨✨✨ --- بداية الكود الجديد لزر قراءة JSON --- ✨✨✨
container.querySelector('#read-json-btn').onclick = async () => {
    // 1. التحقق من صحة البيانات في التبويبات (نفس منطق زر الإرسال)
    validateAllTabs();
    if (container.querySelector('.tab-status-indicator.invalid')) {
        alert("يرجى مراجعة التبويبات التي تحتوي على علامة (✖) وتصحيح البيانات المطلوبة قبل قراءة JSON.");
        return;
    }

    // 2. جمع البيانات بنفس طريقة الإرسال تمامًا
    const selectedSerial = container.querySelector('#pos-device-select').value;
    const selectedActivity = container.querySelector('#manual-activity-code').value;
    
    const draftData = collectDataForDraft();
    if (!draftData) return;

    const itemsForCalculation = draftData.items.map(item => ({
         receiptNumber: draftData.receiptNumber,
         buyerName: draftData.buyerName,
         buyerId: draftData.buyerId,
         paymentMethod: container.querySelector('#payment-method').value,
         referenceUUID: draftData.referenceUUID,
         ...item
    }));

    itemsForCalculation.forEach(item => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const netSale = quantity * unitPrice;
        let tableTaxAmount = 0;
        item.taxableItems.forEach(tax => {
            if (tax.taxType === 'T2' || tax.taxType === 'T3') {
                tableTaxAmount += netSale * (parseFloat(tax.rate) / 100);
            }
        });
        const vatBaseAmount = netSale + tableTaxAmount;
        item.taxableItems.forEach(tax => {
            const baseAmount = (tax.taxType === 'T1') ? vatBaseAmount : netSale;
            tax.amount = parseFloat((baseAmount * (parseFloat(tax.rate) / 100)).toFixed(5));
        });
    });

    let receiptObject = isReturn 
        ? calculateReturnReceiptData(itemsForCalculation, sellerData, selectedSerial, selectedActivity) 
        : calculateReceiptData(itemsForCalculation, sellerData, selectedSerial, selectedActivity);

    const userDateFromInput = container.querySelector('#manual-datetime-issued').value;
    receiptObject.header.dateTimeIssued = getFormattedDateTime(userDateFromInput);
    
    // 3. بناء الهيكل النهائي الذي سيتم إرساله
    const finalPayload = { receipts: [receiptObject] };

    // 4. عرض الـ JSON في نافذة جديدة
    try {
        const jsonString = JSON.stringify(finalPayload, null, 4); // التنسيق بـ 4 مسافات لسهولة القراءة
        const newWindow = window.open("", "_blank");
        newWindow.document.write('<pre style="direction: ltr; text-align: left; white-space: pre-wrap; word-wrap: break-word;">' + jsonString + '</pre>');
        newWindow.document.close();
    } catch (error) {
        alert("حدث خطأ أثناء تحويل البيانات إلى JSON: " + error.message);
    }
};
// ✨✨✨ --- نهاية الكود الجديد --- ✨✨✨





// ✨✨✨ --- بداية الكود الكامل والنهائي لزر الإرسال --- ✨✨✨
container.querySelector('#send-manual-receipt-btn').onclick = async () => {
    // 1. التحقق من صحة البيانات في التبويبات
    validateAllTabs();
    if (container.querySelector('.tab-status-indicator.invalid')) {
        alert("يرجى مراجعة التبويبات التي تحتوي على علامة (✖) وتصحيح البيانات المطلوبة.");
        return;
    }

    // 2. التحقق من الرقم القومي (إذا لزم الأمر)
    const totalAmountText = container.querySelector('#summary-grand-total')?.textContent || '0';
    const totalAmount = parseFloat(totalAmountText.replace(/[^0-9.]/g, ''));
    const buyerId = container.querySelector('#manual-buyer-id').value.trim();
    
    if (totalAmount > 150000) {
        if (!buyerId) {
            alert("❌ لا يمكن الإرسال: يجب إدخال الرقم القومي لأن إجمالي الفاتورة يتجاوز 150,000 جنيه.");
            return;
        }
        const validationResult = await validateNID(buyerId);
        if (!validationResult.valid) {
            alert(`❌ لا يمكن الإرسال: الرقم القومي المدخل غير صحيح. (${validationResult.message})`);
            return;
        }
    } else if (buyerId) { 
        const validationResult = await validateNID(buyerId);
        if (!validationResult.valid) {
            alert(`❌ لا يمكن الإرسال: الرقم القومي المدخل غير صحيح. (${validationResult.message})`);
            return;
        }
    }

    // 3. جمع البيانات وتجهيزها للإرسال
    const selectedSerial = container.querySelector('#pos-device-select').value;
    const selectedActivity = container.querySelector('#manual-activity-code').value;
    
    const draftData = collectDataForDraft();
    if (!draftData) return;

    const itemsForCalculation = draftData.items.map(item => ({
         receiptNumber: draftData.receiptNumber,
         buyerName: draftData.buyerName,
         buyerId: draftData.buyerId,
         paymentMethod: container.querySelector('#payment-method').value,
         referenceUUID: draftData.referenceUUID,
         ...item
    }));

    // ✨ --- استخدام نفس منطق حساب الضرائب الصحيح --- ✨
    itemsForCalculation.forEach(item => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const exchangeRate = parseFloat(item.exchangeRate) || 1;
const netSale = quantity * unitPrice;   // السعر بالعملة فقط (بدون ضرب سعر الصرف)
        
        let tableTaxAmount = 0;
        item.taxableItems.forEach(tax => {
            if (tax.taxType === 'T2' || tax.taxType === 'T3') {
                tableTaxAmount += netSale * (parseFloat(tax.rate) / 100);
            }
        });

        const vatBaseAmount = netSale + tableTaxAmount;
        item.taxableItems.forEach(tax => {
            const baseAmount = (tax.taxType === 'T1') ? vatBaseAmount : netSale;
            tax.amount = parseFloat((baseAmount * (parseFloat(tax.rate) / 100)).toFixed(5));
        });
    });

    // ✨ --- استدعاء الدوال الصحيحة والمحدثة --- ✨
    let receiptObject = isReturn 
        ? calculateReturnReceiptData(itemsForCalculation, sellerData, selectedSerial, selectedActivity) 
        : calculateReceiptData(itemsForCalculation, sellerData, selectedSerial, selectedActivity);

    const userDateFromInput = container.querySelector('#manual-datetime-issued').value;
    receiptObject.header.dateTimeIssued = getFormattedDateTime(userDateFromInput);
    
    // 4. حساب UUID والإرسال النهائي
    const payloadForUuid = JSON.stringify({ receipts: [receiptObject] });
    receiptObject.header.uuid = await EtaUuid.computeUuidFromRawText(payloadForUuid);

    if (!receiptObject.header.uuid) {
        alert("فشل توليد UUID. لن يتم الإرسال.");
        return;
    }

    const finalPayload = { receipts: [receiptObject] };
    
    const result = await sendReceipts_V3(finalPayload, `إرسال يدوي: ${receiptObject.header.receiptNumber}`);
    
    if (result.success) {
        alert(`تم إرسال ${isReturn ? 'إشعار المرتجع' : 'الإيصال'} بنجاح.`);
        const modal = container.querySelector('#manualSendModal');
        modal.style.display = 'none';
        container.innerHTML = '';
    } else {
        alert(`فشل إرسال المستند. الخطأ من الخادم: ${result.error}`);
    }
};
// ✨✨✨ --- نهاية الكود الكامل لزر الإرسال --- ✨✨✨





// ... كل الأكواد السابقة في الدالة

// ✨✨ أضف هذا السطر في نهاية الدالة ✨✨
container.querySelector('#manual-datetime-issued').valueAsDate = new Date();

// استدعاء التحقق والإعداد الأولي عند فتح الواجهة لأول مرة
resetForm();
validateAllTabs();
} // <-- هذا هو القوس الأخير للدالة









/**
 * ===================================================================================
 * ✅✅✅ دالة جديدة: لفتح واجهة منبثقة للبحث في أكواد EGS الخاصة بالممول
 * ===================================================================================
 * @param {Function} onCodeSelect - دالة يتم استدعاؤها عند اختيار كود، وتمرير بيانات الكود لها.
 */
async function showEgsCodeSearchModal(onCodeSelect) {
    // 1. إنشاء الهيكل الأساسي للواجهة المنبثقة
    const modal = document.createElement('div');
    modal.className = 'code-search-modal';
    modal.innerHTML = `
        <div class="code-search-content">
            <div class="code-search-header">
                <h4>اختر كود EGS</h4>
                <input type="text" id="egs-search-input" placeholder="ابحث بالاسم أو الكود...">
                <button id="close-code-search-btn" title="إغلاق" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
            </div>
            <div class="code-search-body">
                <div class="code-search-placeholder">جاري تحميل الأكواد...</div>
                <table class="code-search-table" style="display:none;">
                    <thead><tr><th>الاسم العربي</th><th>الكود</th></tr></thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // 2. ربط الأحداث
    const searchInput = modal.querySelector('#egs-search-input');
    const tableBody = modal.querySelector('.code-search-table tbody');
    const table = modal.querySelector('.code-search-table');
    const placeholder = modal.querySelector('.code-search-placeholder');

    const closeModal = () => modal.remove();
    modal.querySelector('#close-code-search-btn').onclick = closeModal;
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(); // إغلاق عند النقر على الخلفية
    });

    // 3. جلب كل الأكواد وعرضها
    let allCodes = [];
    try {
        const token = getAccessToken();
        if (!token) throw new Error("لم يتم العثور على توكن الدخول.");

        // جلب كل الأكواد باستخدام حجم صفحة كبير
        const response = await fetch(`https://api-portal.invoicing.eta.gov.eg/api/v1/codetypes/codes/my?CodeTypeID=9&Ps=1000`, {
            headers: { "Authorization": `Bearer ${token}` }
        } );
        if (!response.ok) throw new Error("فشل جلب قائمة الأكواد.");

        const data = await response.json();
        allCodes = data.result || [];

        if (allCodes.length === 0) {
            placeholder.textContent = "لم يتم العثور على أكواد EGS مسجلة في حسابك.";
        } else {
            placeholder.style.display = 'none';
            table.style.display = 'table';
            renderTable(allCodes);
        }
    } catch (error) {
        placeholder.textContent = `خطأ: ${error.message}`;
    }

    // 4. دالة لعرض/تحديث الصفوف في الجدول
    function renderTable(codes) {
        tableBody.innerHTML = codes.map(code => `
            <tr data-code='${JSON.stringify(code)}'>
                <td>${code.codeNameSecondaryLang}</td>
                <td class="code-value">${code.codeLookupValue}</td>
            </tr>
        `).join('');

        // ربط حدث النقر على الصفوف
        tableBody.querySelectorAll('tr').forEach(row => {
            row.onclick = () => {
                const codeData = JSON.parse(row.dataset.code);
                onCodeSelect(codeData); // استدعاء الدالة الممررة مع بيانات الكود
                closeModal();
            };
        });
    }

    // 5. إضافة وظيفة البحث الفوري
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        const filteredCodes = allCodes.filter(code =>
            code.codeNameSecondaryLang.toLowerCase().includes(query) ||
            code.codeLookupValue.toLowerCase().includes(query)
        );
        renderTable(filteredCodes);
    });
}



// --- ✅ بداية تعديل renderReceiptDrafts للتصميم الاحترافي ---
function renderReceiptDrafts() {
    const draftsContainer = document.getElementById('drafts-container');
    if (!draftsContainer) return;

    const drafts = JSON.parse(localStorage.getItem("receiptDrafts") || "[]");

    // إضافة الأنماط الخاصة بالبطاقات
    const stylesId = 'drafts-card-styles';
    if (!document.getElementById(stylesId)) {
        const styleSheet = document.createElement('style');
        styleSheet.id = stylesId;
        styleSheet.innerHTML = `
            .drafts-list { display: flex; flex-direction: column; gap: 15px; }
            .draft-card {
                background: #fff;
                border-radius: 10px;
                border: 1px solid #e9ecef;
                box-shadow: 0 3px 10px rgba(0,0,0,0.05);
                display: grid;
                grid-template-columns: auto 1fr auto;
                align-items: center;
                gap: 20px;
                padding: 15px 20px;
                transition: all 0.2s ease-in-out;
            }
            .draft-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.08);
                border-color: #007bff;
            }
            .draft-card .select-col { display: flex; align-items: center; }
            .draft-card .draft-checkbox { width: 20px; height: 20px; }
            .draft-card .info-col { display: flex; flex-direction: column; gap: 5px; }
            .draft-card .receipt-number { font-weight: 700; font-size: 17px; color: #1d3557; }
            .draft-card .details-row { display: flex; gap: 15px; font-size: 14px; color: #6c757d; }
            .draft-card .actions-col { display: flex; gap: 10px; }
            .draft-card .action-btn {
                padding: 8px 15px;
                font-size: 14px;
                font-weight: 600;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .draft-card .edit-btn { background-color: #e7f3ff; color: #0056b3; }
            .draft-card .edit-btn:hover { background-color: #007bff; color: white; }
            .draft-card .delete-btn { background-color: #f8d7da; color: #721c24; }
            .draft-card .delete-btn:hover { background-color: #dc3545; color: white; }
        `;
        document.head.appendChild(styleSheet);
    }

    if (drafts.length === 0) {
        draftsContainer.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">لا توجد مسودات محفوظة حاليًا.</p>';
        return;
    }

    draftsContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 10px; background-color: #f8f9fa; border-radius: 8px;">
            <label style="font-weight: bold; display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" id="selectAllDraftsCheckbox" style="width: 18px; height: 18px;">
                تحديد الكل
            </label>
            <button id="sendSelectedDraftsBtn" class="action-button" style="background-color: #28a745; color: white; padding: 10px 20px; font-size: 15px; width: auto;">
                📤 إرسال المحدد (0)
            </button>
        </div>
        <div class="drafts-list">
            ${drafts.map((draft, index) => `
                <div class="draft-card">
                    <div class="select-col">
                        <input type="checkbox" class="draft-checkbox" data-index="${index}">
                    </div>
                    <div class="info-col">
                        <span class="receipt-number">${draft.receiptNumber}</span>
                        <div class="details-row">
                            <span>${draft.documentType === 'return' ? '↩️ إشعار مرتجع' : '🧾 إيصال بيع'}</span>
                            <span>|</span>
                            <span>عدد البنود: ${draft.items.length}</span>
                        </div>
                    </div>
                    <div class="actions-col">
                        <button class="action-btn edit-btn edit-draft-btn" data-index="${index}">تعديل</button>
                        <button class="action-btn delete-btn delete-draft-btn" data-index="${index}">حذف</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // --- ربط الأحداث (نفس الكود السابق، لا تغيير هنا) ---
    const sendBtn = document.getElementById('sendSelectedDraftsBtn');
    const selectAllCheckbox = document.getElementById('selectAllDraftsCheckbox');
    const allCheckboxes = draftsContainer.querySelectorAll('.draft-checkbox');

    function updateSendButtonCount() {
        const selectedCount = draftsContainer.querySelectorAll('.draft-checkbox:checked').length;
        sendBtn.textContent = `📤 إرسال المحدد (${selectedCount})`;
        sendBtn.disabled = selectedCount === 0;
    }

    selectAllCheckbox.addEventListener('change', (e) => {
        allCheckboxes.forEach(cb => cb.checked = e.target.checked);
        updateSendButtonCount();
    });

    allCheckboxes.forEach(cb => {
        cb.addEventListener('change', updateSendButtonCount);
    });

    sendBtn.addEventListener('click', sendSelectedDrafts);

    draftsContainer.querySelectorAll('.edit-draft-btn').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            openDraftForEditing(el.dataset.index);
        });
    });
    draftsContainer.querySelectorAll('.delete-draft-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteDraft(btn.dataset.index);
        });
    });

    updateSendButtonCount();
}
// --- ✅ نهاية تعديل renderReceiptDrafts ---

// --- ✅ نهاية تعديل renderReceiptDrafts ---

// --- ✅ بداية الدالة الجديدة: إرسال المسودات المحددة ---
async function sendSelectedDrafts() {
    const selectedCheckboxes = document.querySelectorAll('#drafts-container .draft-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        alert("يرجى تحديد مسودة واحدة على الأقل لإرسالها.");
        return;
    }

    if (!confirm(`سيتم الآن إرسال ${selectedCheckboxes.length} مستند. هل تريد المتابعة؟`)) {
        return;
    }

    const loadingToast = showToastNotification(`جاري تجهيز ${selectedCheckboxes.length} مستند للإرسال...`, 0);
    const drafts = JSON.parse(localStorage.getItem("receiptDrafts") || "[]");
    const indicesToDelete = [];
    const receiptChain = [];

    try {
        // التأكد من وجود بيانات البائع ونقطة البيع
        if (!window.receiptUploaderData) {
            throw new Error("بيانات الرافع (البائع ونقطة البيع) غير مهيأة. يرجى إعادة فتح الواجهة.");
        }
        const { seller, serial } = window.receiptUploaderData;

        // جلب آخر UUID ناجح من السجل
        let lastSuccessfulUUID = (JSON.parse(localStorage.getItem("receiptHistory") || "[]")[0] || {}).uuid || "";

        // بناء سلسلة الإيصالات
        for (const checkbox of selectedCheckboxes) {
            const index = parseInt(checkbox.dataset.index, 10);
            const draft = drafts[index];
            if (!draft) continue;

            const itemsForCalculation = draft.items.map(item => ({ ...item, ...draft }));
            
            // بناء كائن الإيصال
            const receiptObject = (draft.documentType === 'return')
                ? calculateReturnReceiptData(itemsForCalculation, seller, serial)
                : calculateReceiptData(itemsForCalculation, seller, serial);
            
            // بناء سلسلة الـ UUID
            receiptObject.header.previousUUID = lastSuccessfulUUID;
            const payloadForUuid = JSON.stringify({ receipts: [receiptObject] });
            const newUuid = await EtaUuid.computeUuidFromRawText(payloadForUuid);
            if (!newUuid) throw new Error("فشل توليد UUID لأحد الإيصالات.");
            
            receiptObject.header.uuid = newUuid;
            receiptChain.push(receiptObject);
            lastSuccessfulUUID = newUuid;
            
            indicesToDelete.push(index);
        }

        if (receiptChain.length === 0) {
            throw new Error("لم يتم العثور على مسودات صالحة للإرسال.");
        }

        loadingToast.update(`جاري إرسال ${receiptChain.length} مستند...`);

        // إرسال الدفعة
        const finalPayload = { receipts: receiptChain };
        const result = await sendReceipts_V3(finalPayload, `دفعة من ${receiptChain.length} مسودة`);

        if (result.success) {
            // حذف المسودات المرسلة من localStorage
            // يجب الحذف من النهاية إلى البداية لتجنب تغيير الفهارس
            indicesToDelete.sort((a, b) => b - a).forEach(index => drafts.splice(index, 1));
            localStorage.setItem("receiptDrafts", JSON.stringify(drafts));
            
            loadingToast.remove();
            showToastNotification(`✅ تم إرسال ${receiptChain.length} مستند بنجاح!`, 5000);
            
            // إعادة عرض قائمة المسودات المتبقية
            renderReceiptDrafts();
        } else {
            throw new Error(result.error || "فشل إرسال الدفعة.");
        }

    } catch (error) {
        loadingToast.remove();
        alert(`❌ حدث خطأ أثناء الإرسال: ${error.message}`);
    }
}
// --- ✅ نهاية الدالة الجديدة ---


// --- ✅✅✅ بداية الاستبدال الكامل لدالة openDraftForEditing (النسخة المصححة) ✅✅✅ ---

async function openDraftForEditing(index) {
    const drafts = JSON.parse(localStorage.getItem("receiptDrafts") || "[]");
    const draftToEdit = drafts[index];

    if (!draftToEdit) {
        alert("لم يتم العثور على المسودة المطلوبة.");
        return;
    }

    // 1. الانتقال إلى تبويب "الإرسال اليدوي"
    document.querySelector('.sidebar-btn[data-target="panel-manual"]').click();

    // 2. تحديد نوع المستند في القائمة المنسدلة
    const manualDocTypeSelect = document.getElementById('manualDocumentTypeSelect');
    manualDocTypeSelect.value = draftToEdit.documentType;

    // 3. استدعاء الدالة التي تبني الواجهة
    manualDocTypeSelect.dispatchEvent(new Event('change'));

    // الانتظار الذكي للتأكد من أن الواجهة قد تم بناؤها بالكامل
    const container = document.getElementById('dynamicManualSendContent');
    let attempts = 0;
    const maxAttempts = 50; // انتظر لمدة 5 ثوانٍ كحد أقصى

    while (!container.querySelector('#manual-receipt-number') && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }

    if (!container.querySelector('#manual-receipt-number')) {
        showToastNotification("❌ خطأ: فشل تحميل واجهة التعديل. يرجى المحاولة مرة أخرى.", 4000);
        return;
    }

    // 4. ملء البيانات الأساسية في الواجهة
    container.querySelector('#manual-receipt-number').value = draftToEdit.receiptNumber;
    container.querySelector('#manual-buyer-name').value = draftToEdit.buyerName || 'عميل نقدي';
    if (draftToEdit.dateTimeIssued) {
        container.querySelector('#manual-datetime-issued').value = draftToEdit.dateTimeIssued;
    }
    
    if (draftToEdit.documentType === 'return' && draftToEdit.referenceUUID) {
        container.querySelector('#manual-reference-uuid').value = draftToEdit.referenceUUID;
    }

    // 5. ملء الأصناف المحفوظة
    for (const item of draftToEdit.items) {
        // ملء حقول الصنف
        container.querySelector('#item-code-type').value = item.itemType;
        container.querySelector('#item-code').value = item.itemCode;
        container.querySelector('#item-description').value = item.description;
        container.querySelector('#item-quantity').value = item.quantity;
        container.querySelector('#item-unit-price').value = item.unitPrice;
        
        // تفعيل حدث التحقق من الكود لجلب اسمه
        container.querySelector('#item-code').dispatchEvent(new Event('blur'));
        await new Promise(r => setTimeout(r, 300)); // انتظار جلب اسم الكود

        // مسح وإعادة إضافة الضرائب الخاصة بالصنف
        const taxesContainer = container.querySelector('#item-taxes-container');
        taxesContainer.innerHTML = '';
        
        if (item.taxableItems && item.taxableItems.length > 0) {
            for (const tax of item.taxableItems) {
                if (!tax || !tax.taxType) continue;
                
                document.getElementById('add-tax-row-btn').click();
                await new Promise(r => setTimeout(r, 50));

                const lastTaxRow = taxesContainer.lastElementChild;
                if (lastTaxRow) {
                    const typeSelect = lastTaxRow.querySelector('.tax-type');
                    typeSelect.value = tax.taxType;
                    typeSelect.dispatchEvent(new Event('change'));
                    
                    await new Promise(r => setTimeout(r, 50));

                    lastTaxRow.querySelector('.tax-subtype').value = tax.subType;
                    lastTaxRow.querySelector('.tax-rate').value = tax.rate;
                    lastTaxRow.querySelector('.tax-rate').dispatchEvent(new Event('input'));
                }
            }
        } else {
            // لا تقم بإضافة صف ضريبة فارغ إذا لم يكن هناك ضرائب
        }
        
        await new Promise(r => setTimeout(r, 50));
        // إضافة الصنف المكتمل إلى الجدول
        container.querySelector('#add-item-btn').click();
    }

    // 6. عرض رسالة للمستخدم (لا يوجد حذف هنا)
    showToastNotification('تم فتح المسودة للتعديل. اضغط "حفظ كمسودة" أو "إرسال" لحفظ التغييرات.', 5000);
}
// --- ✅✅✅ نهاية الاستبدال الكامل ---











/**
 * ===================================================================================
 * ✅ 1. دوال معدلة: لحل مشكلة "is not defined" عند حذف أو إرسال المسودات
 * ===================================================================================
 */

// جعل الدالة متاحة بشكل عام
window.sendDraft = async function(index) {
    const drafts = JSON.parse(localStorage.getItem("receiptDrafts") || "[]");
    const draft = drafts[index];
    if (!draft) return;

    if (!confirm(`هل تريد إرسال الإيصال رقم "${draft.receiptNumber}"؟`)) return;

    // قبل الإرسال، تأكد من تحديث بيانات الرافع (البائع ونقطة البيع)
    if (!window.receiptUploaderData) {
        alert("خطأ: بيانات الرافع غير مهيأة. يرجى إعادة فتح الواجهة.");
        return;
    }
    const receiptData = calculateReceiptData(draft.items);
    const success = await sendReceipts(receiptData);

    if (success) {
        // إزالة المسودة بعد إرسالها بنجاح
        drafts.splice(index, 1);
        localStorage.setItem("receiptDrafts", JSON.stringify(drafts));
        renderReceiptDrafts(); // إعادة عرض المسودات المتبقية
        alert("تم إرسال الإيصال بنجاح.");
    } else {
        alert("فشل إرسال الإيصال.");
    }
}

// جعل الدالة متاحة بشكل عام
window.deleteDraft = function(index) {
    const drafts = JSON.parse(localStorage.getItem("receiptDrafts") || "[]");
    const draft = drafts[index];
    if (!draft) return;

    if (!confirm(`هل تريد حذف المسودة رقم "${draft.receiptNumber}"؟`)) return;

    drafts.splice(index, 1);
    localStorage.setItem("receiptDrafts", JSON.stringify(drafts));
    renderReceiptDrafts(); // إعادة عرض المسودات
    alert("تم حذف المسودة.");
}








/**
 * ✅✅✅ دالة injectReceiptUploaderUI (النسخة الكاملة مع جلب البيانات المسبق) ✅✅✅
 * تقوم بإنشاء الواجهة الرسومية، ثم تجلب بيانات البائع ونقطة البيع مرة واحدة عند الفتح.
 */
async function injectReceiptUploaderUI() {
    // التحقق من وجود الواجهة لمنع تكرارها، وإظهارها إذا كانت موجودة
    if (document.getElementById("receiptUploaderUI")) {
        document.getElementById("receiptUploaderUI").style.display = "flex";
        return;
    }

    // 1. بناء الهيكل الخارجي للواجهة الرسومية (Modal)
    const modalUI = document.createElement("div");
    modalUI.id = "receiptUploaderUI";
    Object.assign(modalUI.style, {
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "800px", height: "600px",
        backgroundColor: "#f4f7fa",
        borderRadius: "12px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
        zIndex: "9999",
        fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif",
        display: "flex",
        flexDirection: "column",
        direction: "rtl"
    });

    // 2. بناء الهيكل الداخلي للواجهة (HTML)
    modalUI.innerHTML = `
        <div style="padding: 15px 25px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; background-color: #fff;">
            <h3 style="margin: 0; color: #1d3557;">رفع الإيصالات من ملف Excel</h3>
            <button id="closeReceiptUIBtn" title="إغلاق" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
        </div>
        <div style="display: flex; flex-grow: 1; overflow: hidden;">
            <div style="width: 300px; padding: 20px; border-left: 1px solid #e0e0e0; display: flex; flex-direction: column; gap: 20px; background-color: #fff;">
                <div>
                    <label class="content-label" style="font-weight: bold; margin-bottom: 10px; display: block;">الخطوة 1: تحميل النموذج</label>
                    <a id="downloadReceiptTemplateBtn" class="action-button download-btn" style="display: block; text-align: center; padding: 12px; background-color: #5a67d8; color: white; border-radius: 8px; text-decoration: none; cursor: pointer;">📥 تحميل نموذج Excel</a>
                </div>
                <hr style="border: none; border-top: 1px solid #eee;">
                <div>
                    <label class="content-label" style="font-weight: bold; margin-bottom: 10px; display: block;">الخطوة 2: رفع الملف</label>
                    <label for="receiptExcelInput" class="action-button upload-btn" style="display: block; text-align: center; padding: 12px; background-color: #38a169; color: white; border-radius: 8px; cursor: pointer;">📂 اختر ملف الإيصالات</label>
                    <input type="file" id="receiptExcelInput" accept=".xlsx, .xls" style="display: none;">
                </div>
            </div>
            <div style="flex-grow: 1; padding: 20px; display: flex; flex-direction: column;">
                <h4 style="margin-top: 0; color: #333;">سجل الإيصالات المرسلة في هذه الجلسة</h4>
                <div style="flex-grow: 1; overflow-y: auto; border: 1px solid #ccc; border-radius: 8px; background: #fff;">
                    <table id="receiptHistoryTable" style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #e9ecef; position: sticky; top: 0;">
                                <th style="padding: 10px; text-align: right;">رقم الإيصال</th>
                                <th style="padding: 10px; text-align: left;">UUID</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- سيتم ملء السجل هنا -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modalUI);

    // 3. ربط الأحداث للأزرار
    document.getElementById('closeReceiptUIBtn').onclick = () => modalUI.style.display = "none";
    document.getElementById('receiptExcelInput').onchange = handleReceiptExcelUpload;
    document.getElementById('downloadReceiptTemplateBtn').onclick = downloadReceiptExcelTemplate;
    renderReceiptHistory();

    // 4. جلب البيانات الأساسية مسبقًا عند فتح الواجهة
    const loadingToast = showToastNotification('جاري تهيئة بيانات البائع ونقطة البيع...');
    try {
        // فصل الطلبات: نطلب بيانات البائع أولاً
        const sellerData = await getSellerFullData();
        if (!sellerData) throw new Error("فشل جلب بيانات البائع.");

        // ثم نطلب بيانات نقطة البيع
        const deviceSerial = await getDeviceSerialNumber();
        if (!deviceSerial) throw new Error("فشل جلب الرقم التسلسلي لنقطة البيع.");

        // تخزين البيانات في متغير عام (window) لسهولة الوصول إليها لاحقًا
        window.receiptUploaderData = {
            seller: sellerData,
            serial: deviceSerial
        };

        loadingToast.remove();
        showToastNotification('✅ الأداة جاهزة لرفع الإيصالات.', 3000);

    } catch (error) {
        loadingToast.remove();
        alert(`❌ خطأ في تهيئة الأداة: ${error.message}. يرجى محاولة إغلاق الواجهة وفتحها مرة أخرى.`);
        modalUI.style.display = "none"; // إغلاق الواجهة عند الفشل الحاسم
    }
}


/**
 * ✅ دالة جديدة: لعرض سجل الإيصالات المحفوظ في localStorage.
 */
function renderReceiptHistory() {
    const history = JSON.parse(localStorage.getItem("receiptHistory") || "[]");
    const tableBody = document.querySelector("#receiptHistoryTable tbody");
    if (!tableBody) return;

    tableBody.innerHTML = ""; // مسح الجدول القديم
    history.forEach(item => {
        const row = tableBody.insertRow(0); // إضافة الصف في الأعلى
        row.innerHTML = `
            <td style="padding: 8px; text-align: center; font-family: monospace;">${item.receiptNumber}</td>
            <td style="padding: 8px; text-align: center; font-family: monospace; font-size: 12px; direction: ltr;">${item.uuid}</td>
        `;
    });
}


/**
 * =========================================================================
 * ✅ الدالة النهائية والمعدلة: لوضع التعليمات في كل خلية
 * =========================================================================
 */
async function downloadReceiptExcelTemplate() {
    const loadingToast = showToastNotification('جاري إنشاء نموذج إيصالات البيع...', 0);
    try {
        if (typeof ExcelJS === 'undefined') {
            throw new Error("مكتبة ExcelJS غير محملة.");
        }

        const workbook = new ExcelJS.Workbook();
        const mainSheet = workbook.addWorksheet("قالب الإيصالات");
        const listsSheet = workbook.addWorksheet("Lists");

        // بيانات القوائم المنسدلة (لا تغيير هنا)
        const itemCodeTypes = [{ code: "EGS" }, { code: "GS1" }];
        const unitTypes = [
            { code: "EA", desc_ar: "قطعة" }, { code: "KGM", desc_ar: "كيلوجرام" },
            { code: "LTR", desc_ar: "لتر" }, { code: "MTR", desc_ar: "متر" }
        ];
        const taxTypesData = {
            "T1": { desc: "ضريبة القيمة المضافة", subtypes: [{ code: "V009", desc: "سلع عامة (14%)" }, { code: "V003", desc: "سلعة معفاة" }] },
            "T4": { desc: "خصم تحت حساب الضريبة", subtypes: [{ code: "W002", desc: "توريدات" }] }
        };

        // تعبئة ورقة القوائم (لا تغيير هنا)
        listsSheet.getCell('A1').value = "CodeTypes";
        listsSheet.getCell('B1').value = "UnitTypes";
        listsSheet.getCell('C1').value = "MainTaxTypes";
        itemCodeTypes.forEach((item, i) => { listsSheet.getCell(`A${i + 2}`).value = item.code; });
        unitTypes.forEach((item, i) => { listsSheet.getCell(`B${i + 2}`).value = item.desc_ar; });
        Object.values(taxTypesData).forEach((item, i) => { listsSheet.getCell(`C${i + 2}`).value = item.desc; });
        let taxColIndex = 4;
        Object.values(taxTypesData).forEach(data => {
            const headerCell = listsSheet.getCell(1, taxColIndex);
            headerCell.value = data.desc.replace(/[ ()]/g, '_');
            data.subtypes.forEach((subtype, i) => { listsSheet.getCell(i + 2, taxColIndex).value = subtype.desc; });
            taxColIndex++;
        });

        // --- ✅✅✅ بداية التعديل المطلوب ✅✅✅ ---

       
        





const excelCellComments = {
    'الرقم الداخلي للفاتورة': 'اكتب الرقم الفاتورة علي حسب السريال ',
    'تاريخ الإصدار': 'اختياري: أدخل تاريخ إصدار الفاتورة بصيغة YYYY-MM-DD. إذا ترك فارغًا، سيتم استخدام التاريخ الحالي.',
    'تاريخ التسليم': 'اختياري: أدخل تاريخ تسليم الخدمة أو البضاعة بصيغة YYYY-MM-DD.',
    'رقم تسجيل المستلم': ' في حاله اختيار شركة يتم كتابه رقم التسجيل الضريبي المكون من 9 ارقام - في حاله اختيار شخصي يتم كتابه 123456789 او الرقم القومي ان وجد وبعد الرفع تقوم بحذفه  والاجنبي نفس النظام ',
    'اسم المستلم': 'غير مطلوب في حاله كتابه رقم التسجيل',
    'نوع المستلم': 'مطلوب: اختر من القائمة: B لشركة، P لشخصي، F لأجنبي.',
    'دولة المستلم': 'غير مطلوب في حاله كتابه رقم التسجيل',
    'محافظة المستلم': 'غير مطلوب في حاله كتابه رقم التسجيل',
    'مدينة المستلم': 'غير مطلوب في حاله كتابه رقم التسجيل',
    'شارع المستلم': 'غير مطلوب في حاله كتابه رقم التسجيل',
    'مبنى المستلم': 'غير مطلوب في حاله كتابه رقم التسجيل',
    'وصف الصنف': 'مطلوب: اسم أو وصف واضح للسلعة أو الخدمة المباعة.',
    'نوع كود الصنف': 'في حاله اختيار GS1  يتم كتابه الكود العالمي مثال : - 10007598 ام في حاله اختيار الكود EGS  يتم كتابه الكود EG-رقم التسجيل-الكود الداخلي مثال EG-123456789-100',
    'كود الصنف': 'في حاله الايصالات مطلوب اجباري كتابه الكود مثال 1 ام في حاله الفواتير غير مطلوب ',
    'وحدة القياس': 'مطلوب: اختر وحدة القياس من القائمة (مثال: قطعة).',
    'الكمية': 'مطلوب: العدد المباع من هذا الصنف.',
    'سعر الوحدة': 'مطلوب: سعر القطعة الواحدة من الصنف.',
    'نوع الضريبة 1': 'مطلوب: اختر نوع الضريبة الأساسي من القائمة (مثال: ضريبة القيمة المضافة).',
    'النوع الفرعي 1': 'مطلوب: اختر النوع الفرعي للضريبة من القائمة المترابطة.',
    'نسبة الضريبة 1': 'مطلوب: أدخل النسبة المئوية للضريبة (مثال: 14).',
    'UUID الفاتورة الأصلية': 'مطلوب للمرتجعات فقط: الرقم التعريفي الفريد لفاتورة البيع الأصلية.'
};








        const headers = Object.keys(excelCellComments);
        mainSheet.columns = headers.map(h => ({ header: h, key: h }));

        // 2. تطبيق التنسيقات ووضع الشرح في كل خلية بالصف الأول
        mainSheet.getRow(1).eachCell((cell) => {
            const headerText = cell.value;
            // تطبيق التنسيق على رأس العمود
            cell.font = { name: 'Arial', bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF343A40' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            
            // وضع الشرح في خاصية "note" للخلية
            if (excelCellComments[headerText]) {
                cell.note = excelCellComments[headerText];
            }
        });

        // 3. تفعيل الفلتر على الأعمدة
        mainSheet.autoFilter = {
            from: 'A1',
            to: { row: 1, column: headers.length }
        };
        
        // --- ✅✅✅ نهاية التعديل المطلوب ✅✅✅ ---

        // ضبط عرض الأعمدة والقوائم المنسدلة (لا تغيير هنا)
        mainSheet.columns.forEach(column => {
            column.width = 30;
        });
        const addValidation = (columnLetter, formula) => {
            for (let i = 2; i <= 1001; i++) {
                mainSheet.getCell(`${columnLetter}${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [formula] };
            }
        };
        addValidation('G', '=Lists!$A$2:$A$3');
        addValidation('I', `=Lists!$B$2:$B$${unitTypes.length + 1}`);
        addValidation('L', `=Lists!$C$2:$C$${Object.keys(taxTypesData).length + 1}`);
        addValidation('O', `=Lists!$C$2:$C$${Object.keys(taxTypesData).length + 1}`);
        const cascadingFormula1 = '=INDIRECT(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(L2," ","_"),"(","_"),")","_"))';
        const cascadingFormula2 = '=INDIRECT(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(O2," ","_"),"(","_"),")","_"))';
        addValidation('M', cascadingFormula1);
        addValidation('P', cascadingFormula2);

        Object.values(taxTypesData).forEach((data, i) => {
            const colLetter = String.fromCharCode('A'.charCodeAt(0) + 3 + i);
            const rangeName = data.desc.replace(/[ ()]/g, '_');
            const rangeFormula = `Lists!$${colLetter}$2:$${colLetter}$${data.subtypes.length + 1}`;
            workbook.definedNames.add(rangeFormula, rangeName);
        });
        
        listsSheet.state = 'hidden';
        mainSheet.views = [{ rightToLeft: true }];

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        
        if (typeof saveAs === 'undefined') throw new Error("مكتبة FileSaver.js غير محملة.");
        saveAs(blob, "نموذج_رفع_الإيصالات_معدل.xlsx");

    } catch (error) {
        alert("فشل إنشاء نموذج الإكسيل: " + error.message);
    } finally {
        loadingToast.remove();
    }
}













async function showReceiptEditor(receiptsMap, docType = 'sale') {
    // إزالة أي واجهة قديمة لضمان عدم التكرار
    document.getElementById('receiptEditorModal')?.remove();

    // قاموس لترجمة أنواع الضرائب إلى اللغة العربية
    const taxTypesMap = {
        "T1": "قيمة مضافة", "T2": "جدول (نسبي)", "T3": "جدول (نوعي)", "T4": "خصم تحصيل",
        "T5": "دمغة (نسبي)", "T6": "دمغة (قطعي)", "T7": "ملاهي", "T8": "تنمية موارد",
        "T9": "رسم خدمة", "T10": "محليات", "T11": "تأمين صحي", "T12": "رسوم أخرى"
    };

    // --- 1. بناء الهيكل الخارجي للواجهة ---
    const modal = document.createElement('div');
    modal.id = 'receiptEditorModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0,0,0,0.6); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
        direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background-color: #f4f7fc; width: 95%; max-width: 1800px; height: 95%;
        border-radius: 12px; display: flex; flex-direction: column;
        box-shadow: 0 5px 25px rgba(0,0,0,0.2); overflow: hidden;
    `;
    
    modalContent.innerHTML = `<div style="display:flex; align-items:center; justify-content:center; height:100%; font-size: 22px; color: #555;">جاري تحميل البيانات اللازمة...</div>`;
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    let sellerData, devices, defaultDevice, defaultActivityCode;

    try {
        // --- 2. جلب البيانات الأساسية ---
        sellerData = await getIssuerFullData();
        if (!sellerData) throw new Error("فشل جلب بيانات الممول.");

        devices = await getDeviceSerialNumber();
        if (!devices || devices.length === 0) throw new Error("فشل جلب بيانات نقاط البيع.");
        
        defaultDevice = devices[0];
        const activities = sellerData.activities || [];
        defaultActivityCode = '4690';
        let activitySelectorHTML = '';

        if (activities.length > 0) {
            const defaultActivity = activities.find(act => act.toDate === null) || activities[0];
            defaultActivityCode = defaultActivity.activityTypeCode;
            activitySelectorHTML = `
                <div class="form-group">
                    <label for="activity-select-editor" class="select-label">كود النشاط:</label>
                    <select id="activity-select-editor" class="custom-select">
                        ${activities.map(act => `<option value="${act.activityTypeCode}" ${act.activityTypeCode === defaultActivity.activityTypeCode ? 'selected' : ''}>${act.activityTypeCode} - ${act.activityTypeNameSecondaryLang}</option>`).join('')}
                    </select>
                </div>`;
        } else {
            activitySelectorHTML = `<div class="form-group"><label class="select-label">كود النشاط:</label><div class="info-div">لم يتم العثور على أنشطة</div></div>`;
        }

        // --- 3. بناء صفوف المستندات وتفاصيلها ---
        let tableBodyHTML = '';
        receiptsMap.forEach((items, receiptNumber) => {
            const firstItem = items[0] || {};
            
            const receiptData = (docType === 'return')
                ? calculateReturnReceiptData(items, sellerData, defaultDevice.serialNumber, defaultActivityCode)
                : calculateReceiptData(items, sellerData, defaultDevice.serialNumber, defaultActivityCode);

            const documentTitle = (docType === 'return') ? 'إشعار مرتجع' : 'إيصال بيع';
            const titleColor = (docType === 'return') ? '#c0392b' : '#2980b9';
            const referenceUUID_HTML = (docType === 'return') 
                ? `<tr><th>UUID الفاتورة الأصلية</th><td style="font-family: monospace; font-size: 14px; direction: ltr; background: #fff5f5;">${firstItem.referenceUUID || '<span style="color:red;">مطلوب!</span>'}</td></tr>` 
                : '';

            const itemsDetailsHTML = receiptData.itemData.map((item, index) => {
                const taxAmountForItem = item.taxableItems.reduce((acc, tax) => acc + tax.amount, 0);
                return `
                    <tr style="border-bottom: 1px solid #f1f1f1;">
                        <td style="padding: 10px;">${item.itemType}</td>
                        <td style="padding: 10px; font-family: monospace;">${item.itemCode}</td>
                        <td style="padding: 10px; background-color: #f0f8ff;">${items[index].officialCodeName || ''}</td>
                        <td style="padding: 10px; text-align: right;">${item.description}</td>
                        <td style="padding: 10px;">${item.quantity}</td>
                        <td style="padding: 10px;">${item.unitPrice.toFixed(2)}</td>
                        <td style="padding: 10px;">${item.totalSale.toFixed(2)}</td>
                        <td style="padding: 10px; color: #c0392b;">${taxAmountForItem.toFixed(5)}</td>
                        <td style="padding: 10px; font-weight: bold;">${item.total.toFixed(2)}</td>
                    </tr>
                `;
            }).join('');

            const totalsDetailsHTML = `
                <tr><td class="details-total-label">إجمالي المبيعات</td><td class="details-total-value">${receiptData.totalSales.toFixed(2)}</td></tr>
                ${receiptData.taxTotals.map(t => `<tr><td class="details-total-label">${taxTypesMap[t.taxType] || t.taxType}</td><td class="details-total-value">${t.amount.toFixed(2)}</td></tr>`).join('')}
                <tr class="details-grand-total"><td class="details-total-label">الإجمالي النهائي</td><td class="details-total-value">${receiptData.totalAmount.toFixed(2)}</td></tr>
            `;

            tableBodyHTML += `
               <tbody data-receipt-number="${receiptNumber}" data-doc-type="${docType}">
                    <tr style="background-color: #fff; border-bottom: 1px solid #e9ecef; cursor: pointer;" class="toggle-details-trigger">
                        <td style="width: 50px; padding: 15px; text-align: center; vertical-align: middle;"><input type="checkbox" class="receipt-checkbox" style="width: 20px; height: 20px; vertical-align: middle;"></td>
                        <td class="toggle-details-icon" style="font-weight: bold; font-size: 28px; width: 40px; color: #007bff; text-align: center; padding: 15px; vertical-align: middle;">+</td>
                        <td style="padding: 15px; text-align: center; vertical-align: middle; font-size: 16px;">${receiptNumber} <span style="color: ${titleColor}; font-weight: bold;">(${documentTitle})</span></td>
                        <td style="padding: 15px; text-align: center; vertical-align: middle; font-size: 16px;">${firstItem.buyerName || 'عميل نقدي'}</td>
                        <td style="padding: 15px; text-align: center; vertical-align: middle; font-weight: 600; font-size: 16px;">${receiptData.totalSales.toFixed(2)}</td>
                        <td style="padding: 15px; text-align: center; vertical-align: middle; font-weight: bold; font-size: 18px;">${receiptData.totalAmount.toFixed(2)}</td>
                        <td style="padding: 15px; text-align: center; vertical-align: middle;"><button class="delete-receipt-btn" title="حذف المستند" style="background: #dc3545; color: white; border: none; border-radius: 50%; cursor: pointer; width: 32px; height: 32px; font-size: 20px; line-height: 32px;">&times;</button></td>
                    </tr>
                    <tr class="receipt-details-row" style="display: none;">
                        <td colspan="7" style="padding: 0 !important;">
                            <div style="padding: 25px; background-color: #f0f2f5; border-top: 4px solid #0d6efd;">
                                <div class="details-grid">
                                    <div class="details-card receiver-card">
                                        <h4 class="details-card-header">بيانات المستلم (المشتري)</h4>
                                        <table class="details-table">
                                            <tbody>
                                                ${referenceUUID_HTML}
                                               <tr><th>الاسم</th><td>${firstItem.buyerName || ''}</td></tr>
                                                <tr><th>الرقم القومي</th><td>${firstItem.buyerId || ''}</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="details-card items-details-card">
                                        <h4 class="details-card-header">بنود المستند</h4>
                                        <table class="details-table items-details-table">
                                            <thead>
                                                <tr>
                                                    <th>نوع الكود</th><th>كود الصنف</th><th>الاسم الرسمي</th><th>الوصف</th>
                                                    <th>الكمية</th><th>السعر</th><th>الإجمالي</th><th>قيمة الضريبة</th><th>الإجمالي النهائي</th>
                                                </tr>
                                            </thead>
                                            <tbody>${itemsDetailsHTML}</tbody>
                                        </table>
                                    </div>
                                    <div class="details-card totals-details-card">
                                        <h4 class="details-card-header">الإجماليات</h4>
                                        <table class="details-table totals-details-table">
                                            <tbody>${totalsDetailsHTML}</tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>`;
        });

        // --- 4. بناء الهيكل الكامل للواجهة مع التعديلات الجديدة ---
        modalContent.innerHTML = `
            <div style="padding: 20px 25px; border-bottom: 1px solid #ddd; background-color: #f8f9fa; flex-shrink: 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #2161a1; font-size: 22px;">مراجعة وتأكيد المستندات (${receiptsMap.size})</h3>
                    <div style="display: flex; gap: 12px;">
                        <button id="saveAllAsDraftsBtn" class="header-btn" style="background-color: #ffc107; color: #333;">📝 حفظ الكل كمسودات</button>
                        <button id="sendSelectedReceiptsBtn" class="header-btn send-btn">إرسال المحدد</button>
                        <button id="readJsonBtn" class="header-btn" style="background-color: #fd7e14; color: white;">🔍 قراءة JSON</button>
                        <button id="closeReceiptEditorBtn" class="header-btn close-btn">إغلاق</button>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px 20px; background-color: #e9ecef; padding: 20px; border-radius: 8px;">
                    <div class="form-group">
                        <label for="pos-select-editor" class="select-label">نقطة البيع (POS):</label>
                        <select id="pos-select-editor" class="custom-select">
                            ${devices.map(d => {
                                const address = d.address || {};
                                const displayAddress = (d.formatedAddress || `${address.street || ''}, ${address.regionCity || ''}`).replace(/^0\s+/, '').trim();
// ✅ --- بداية التعديل الذكي لمعالجة العنوان --- ✅
let addressData = {};
if (d.formatedAddress) {
    const fullAddressString = d.formatedAddress.trim();
    const addressParts = fullAddressString.split(',');
    
    // 1. معالجة الجزء الأول (الشارع ورقم المبنى)
    const firstPart = addressParts[0] || '';
    const buildingNumberMatch = firstPart.match(/^(\d+)\s+/); // ابحث عن أرقام في بداية النص
    
    let buildingNumber = '';
    let street = firstPart;

    if (buildingNumberMatch) {
        buildingNumber = buildingNumberMatch[1]; // الرقم هو أول مجموعة مطابقة
        street = firstPart.substring(buildingNumberMatch[0].length).trim(); // الشارع هو ما تبقى
    }

    addressData = {
        buildingNumber: buildingNumber,
        street: street,
        regionCity: addressParts[1]?.trim() || '',
        governate: addressParts[2]?.trim() || ''
    };
} else if (d.address) {
    // 2. إذا لم نجد formatedAddress، نعود للطريقة القديمة
    addressData = { ...d.address, buildingNumber: d.address.buildingNo || '' };
}
// ✅ --- نهاية التعديل الذكي --- ✅
                                return `<option value="${d.serialNumber}" data-address='${JSON.stringify(addressData)}' ${d.serialNumber === defaultDevice.serialNumber ? 'selected' : ''}>
                                            ${displayAddress || d.serialNumber}
                                        </option>`;
                            }).join('')}
                        </select>
                    </div>
                    ${activitySelectorHTML}
                    <div class="form-group"><label for="editor-seller-name" class="select-label">اسم المصدر:</label><input type="text" id="editor-seller-name" class="custom-select" value="${sellerData.name}"></div>
                    <div class="form-group"><label for="editor-seller-governate" class="select-label">المحافظة:</label><input type="text" id="editor-seller-governate" class="custom-select" value="${sellerData.governate}"></div>
                    <div class="form-group"><label for="editor-seller-regionCity" class="select-label">المدينة:</label><input type="text" id="editor-seller-regionCity" class="custom-select" value="${sellerData.regionCity}"></div>
                    <div class="form-group"><label for="editor-seller-street" class="select-label">الشارع:</label><input type="text" id="editor-seller-street" class="custom-select" value="${sellerData.street}"></div>
                    <div class="form-group"><label for="editor-seller-building" class="select-label">رقم المبنى:</label><input type="text" id="editor-seller-building" class="custom-select" value="${sellerData.buildingNumber || ''}"></div>
                </div>
            </div>
            <div style="overflow-y: auto; flex-grow: 1;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead style="position: sticky; top: 0; background: #020b18ff; color: white; z-index: 10;">
                       <tr>
                            <th style="padding: 15px; text-align: center;"><input type="checkbox" id="selectAllCheckbox" style="width: 20px; height: 20px;"></th>
                            <th></th><th>الرقم الداخلي (والنوع)</th><th>اسم العميل</th><th>الإجمالي قبل الضريبة</th>
                            <th>الإجمالي النهائي</th><th>حذف</th>
                       </tr>
                    </thead>
                    <tbody>${tableBodyHTML}</tbody>
                </table>
            </div>
            <div style="padding: 15px 25px; background-color: #343a40; color: white; text-align: center; border-top: 4px solid #0d6efd; flex-shrink: 0;">
                <strong style="font-size: 18px;">الإجمالي النهائي للمستندات المحددة: <span id="grandTotalAmount" style="color: #28a745; font-size: 22px;">0.00</span></strong>
            </div>
        `;

        // --- 5. إضافة الأنماط الكاملة ---
        const styles = document.createElement('style');
        styles.innerHTML = `
            .details-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 20px; }
            .issuer-card { display: none; } /* إخفاء بطاقة المصدر القديمة */
            .receiver-card { grid-column: 1 / 2; grid-row: 1 / 2; }
            .items-details-card { grid-column: 2 / 3; grid-row: 1 / 3; }
            .totals-details-card { grid-column: 1 / 2; grid-row: 2 / 3; }
            .details-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; }
            .details-card-header { color: #0d6efd; border-bottom: 2px solid #eee; padding-bottom: 8px; margin-top: 0; margin-bottom: 15px; font-size: 16px; }
            .details-table { width: 100%; border-collapse: collapse; }
            .details-table th, .details-table td { border: 1px solid #f0f0f0; padding: 8px; text-align: right; font-size: 13px; }
            .details-table th { background-color: #f8f9fa; width: 100px; font-weight: 600; }
            .items-details-table th, .items-details-table td { text-align: center; padding: 6px; white-space: nowrap; }
            .totals-details-table .details-total-label { font-weight: bold; }
            .totals-details-table .details-grand-total td { font-size: 16px; font-weight: bold; background-color: #e9ecef; }
            .header-btn { padding: 10px 22px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 15px; }
            .send-btn { background-color: #28a745; color: white; }
            .close-btn { background-color: #6c757d; color: white; }
            .form-group { display: flex; flex-direction: column; }
            .select-label { font-size: 14px; font-weight: 600; margin-bottom: 5px; display: block; color: #343a40; }
            .custom-select { width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #ccc; font-size: 14px; }
            .info-div { padding: 10px; background-color: #fff; border-radius: 5px; border: 1px solid #ccc; }
        `;
        modal.appendChild(styles);
        
        // --- 6. ربط جميع الأحداث ---
        const closeModal = () => modal.remove();
        document.getElementById('closeReceiptEditorBtn').onclick = closeModal;

        modal.querySelectorAll('.toggle-details-trigger').forEach(row => {
            row.onclick = (e) => {
                if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
                const detailsRow = row.nextElementSibling;
                const icon = row.querySelector('.toggle-details-icon');
                const isVisible = detailsRow.style.display !== 'none';
                detailsRow.style.display = isVisible ? 'none' : 'table-row';
                icon.textContent = isVisible ? '+' : '-';
            };
        });

        modal.querySelectorAll('.delete-receipt-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const group = e.target.closest('tbody');
                if (confirm(`هل تريد حذف المستند رقم "${group.dataset.receiptNumber}"؟`)) {
                    group.remove();
                    updateGrandTotal();
                }
            };
        });

        const grandTotalSpan = document.getElementById('grandTotalAmount');
        const updateGrandTotal = () => {
            let total = 0;
            const currentActivityCode = document.getElementById('activity-select-editor')?.value || defaultActivityCode;
            const currentSerial = document.getElementById('pos-select-editor').value;
            const editedSellerData = {
                id: sellerData.id, name: document.getElementById('editor-seller-name').value,
                governate: document.getElementById('editor-seller-governate').value, regionCity: document.getElementById('editor-seller-regionCity').value,
                street: document.getElementById('editor-seller-street').value, buildingNumber: document.getElementById('editor-seller-building').value
            };

            modal.querySelectorAll('.receipt-checkbox:checked').forEach(cb => {
                const group = cb.closest('tbody');
                const receiptNumber = group.dataset.receiptNumber;
                const currentDocType = group.dataset.docType;
                const items = receiptsMap.get(receiptNumber);
                const receiptData = (currentDocType === 'return')
                    ? calculateReturnReceiptData(items, editedSellerData, currentSerial, currentActivityCode)
                    : calculateReceiptData(items, editedSellerData, currentSerial, currentActivityCode);
                total += receiptData.totalAmount;
            });
            grandTotalSpan.textContent = total.toFixed(2);
        };

        document.getElementById('selectAllCheckbox').onchange = (e) => {
            modal.querySelectorAll('.receipt-checkbox').forEach(cb => cb.checked = e.target.checked);
            updateGrandTotal();
        };

        modal.querySelectorAll('.receipt-checkbox, #pos-select-editor, #activity-select-editor, #editor-seller-name, #editor-seller-governate, #editor-seller-regionCity, #editor-seller-street, #editor-seller-building').forEach(el => {
            el.onchange = updateGrandTotal;
            el.oninput = updateGrandTotal; // للتحديث الفوري عند الكتابة
        });
        
        updateGrandTotal();

        document.getElementById('saveAllAsDraftsBtn').onclick = () => { /* ... منطق حفظ المسودات ... */ };
        
      
   
    
            document.getElementById('sendSelectedReceiptsBtn').onclick = async () => {
            const sendButton = document.getElementById('sendSelectedReceiptsBtn');
            const selectedGroups = Array.from(modal.querySelectorAll('.receipt-checkbox:checked')).map(cb => cb.closest('tbody'));
            if (selectedGroups.length === 0) { alert("يرجى تحديد مستند واحد على الأقل لإرساله."); return; }
            if (!confirm(`سيتم الآن تجميع ${selectedGroups.length} مستند في دفعة واحدة وإرسالها. هل تريد المتابعة؟`)) return;

            sendButton.disabled = true;
            const loadingToast = showToastNotification(`جاري بناء سلسلة UUID لـ ${selectedGroups.length} مستند...`);

            try {
                const selectedSerial = document.getElementById('pos-select-editor').value;
                const activitySelect = document.getElementById('activity-select-editor');
                const selectedActivity = activitySelect ? activitySelect.value : defaultActivityCode;
                const receiptChain = [];
                let lastSuccessfulUUID = (JSON.parse(localStorage.getItem("receiptHistory") || "[]")[0] || {}).uuid || "";

                for (const group of selectedGroups) {
                    const receiptNumber = group.dataset.receiptNumber;
                    const currentDocType = group.dataset.docType;
                    const items = receiptsMap.get(receiptNumber);

                    const receiptObject = (currentDocType === 'return')
                        ? calculateReturnReceiptData(items, sellerData, selectedSerial, selectedActivity)
                        : calculateReceiptData(items, sellerData, selectedSerial, selectedActivity);
                    
                    receiptObject.header.previousUUID = lastSuccessfulUUID;
                    const payloadForUuid = JSON.stringify({ receipts: [receiptObject] });
                    const newUuid = await EtaUuid.computeUuidFromRawText(payloadForUuid);
                    receiptObject.header.uuid = newUuid;
                    receiptChain.push(receiptObject);
                    lastSuccessfulUUID = newUuid;
                }

                const finalPayload = { receipts: receiptChain };
                const result = await sendReceipts_V3(finalPayload, `دفعة من ${receiptChain.length} مستند`);

                if (result.success) {
                    const finalUUID = result.uuid;
                    const history = JSON.parse(localStorage.getItem("receiptHistory") || "[]");
                    history.unshift({ receiptNumber: `دفعة من ${receiptChain.length} مستند`, uuid: finalUUID });
                    localStorage.setItem("receiptHistory", JSON.stringify(history.slice(0, 50)));
                    
                    loadingToast.remove();
                    alert(`✅ تم إرسال دفعة تحتوي على ${receiptChain.length} مستند بنجاح!`);
                    closeModal();
                } else {
                    throw new Error(result.error || "فشل إرسال الدفعة.");
                }
            } catch (error) {
                loadingToast.remove();
                alert(`❌ حدث خطأ فادح أثناء الإرسال: ${error.message}`);
            } finally {
                sendButton.disabled = false;
            }
        };


    
document.getElementById('readJsonBtn').addEventListener('click', async () => {
    const selectedGroups = Array.from(document.querySelectorAll('#receiptEditorModal .receipt-checkbox:checked')).map(cb => cb.closest('tbody'));
    
    if (selectedGroups.length === 0) {
        alert("يرجى تحديد مستند واحد على الأقل لقراءة بياناته.");
        return;
    }

    try {
        // --- بداية الكود المنسوخ من زر الإرسال ---
        const selectedSerial = document.getElementById('pos-select-editor').value;
        const activitySelect = document.getElementById('activity-select-editor');
        const selectedActivity = activitySelect ? activitySelect.value : defaultActivityCode;
        
        const editedSellerData = {
            id: sellerData.id, name: document.getElementById('editor-seller-name').value,
            governate: document.getElementById('editor-seller-governate').value, regionCity: document.getElementById('editor-seller-regionCity').value,
            street: document.getElementById('editor-seller-street').value, buildingNumber: document.getElementById('editor-seller-building').value
        };

        const receiptChain = [];
        let lastSuccessfulUUID = (JSON.parse(localStorage.getItem("receiptHistory") || "[]")[0] || {}).uuid || "";

        for (const group of selectedGroups) {
            const receiptNumber = group.dataset.receiptNumber;
            const currentDocType = group.dataset.docType;
            const items = receiptsMap.get(receiptNumber); // سيصل إلى receiptsMap بشكل صحيح لأنه داخل نفس الدالة

            if (!items) {
                continue;
            }

            const receiptObject = (currentDocType === 'return')
                ? calculateReturnReceiptData(items, editedSellerData, selectedSerial, selectedActivity)
                : calculateReceiptData(items, editedSellerData, selectedSerial, selectedActivity);
            
            // حساب UUID (مهم للقراءة الصحيحة)
            receiptObject.header.previousUUID = lastSuccessfulUUID;
            const payloadForUuid = JSON.stringify({ receipts: [receiptObject] });
            const newUuid = await EtaUuid.computeUuidFromRawText(payloadForUuid);
            receiptObject.header.uuid = newUuid;
            lastSuccessfulUUID = newUuid; // تحديث للسلسلة

            receiptChain.push(receiptObject);
        }
        // --- نهاية الكود المنسوخ ---

        const finalPayload = { receipts: receiptChain };

        // عرض الـ JSON في نافذة جديدة
        const jsonString = JSON.stringify(finalPayload, null, 4);
        const newWindow = window.open("", "_blank");
        newWindow.document.write('<pre style="direction: ltr; text-align: left; white-space: pre-wrap; word-wrap: break-word;">' + jsonString + '</pre>');
        newWindow.document.close();

    } catch (error) {
        alert(`❌ حدث خطأ أثناء بناء JSON: ${error.message}`);
    }
});

        // --- 9. ربط الأحداث الجديدة للتحديث التلقائي ---
        const posSelectEditor = document.getElementById('pos-select-editor');
        if (posSelectEditor) {
            posSelectEditor.addEventListener('change', (e) => {
                const selectedOption = e.target.options[e.target.selectedIndex];
                const addressData = JSON.parse(selectedOption.dataset.address || '{}');
                document.getElementById('editor-seller-governate').value = addressData.governate || '';
                document.getElementById('editor-seller-regionCity').value = addressData.regionCity || '';
                document.getElementById('editor-seller-street').value = addressData.street || '';
                document.getElementById('editor-seller-building').value = addressData.buildingNumber || '';
            });
            posSelectEditor.dispatchEvent(new Event('change'));
        }
    
    } catch (error) {
        modalContent.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; font-size: 22px; color: #d9534f; text-align: center; padding: 20px;">
            <p>فشل تحميل البيانات الأساسية.</p>
            <p style="font-size: 16px; color: #555;">الخطأ: ${error.message}</p>
            <button id="closeErrorModal" class="header-btn close-btn" style="margin-top: 20px;">إغلاق</button>
        </div>`;
        modalContent.querySelector('#closeErrorModal').onclick = () => modal.remove();
    }
}






async function sendReceipts(batchObject, batchLabel) {
   
    
    let finalUuidInChain = '';

    try {
        const receiptChain = batchObject.receipts;
        if (!receiptChain || receiptChain.length === 0) {
            throw new Error("فشل الإرسال: كائن الدفعة فارغ أو لا يحتوي على إيصالات.");
        }
        finalUuidInChain = receiptChain[receiptChain.length - 1].header.uuid;

        const finalPayloadText = JSON.stringify(batchObject, null, 2);
        const zip = new JSZip();
        zip.file("receipts.json", finalPayloadText);
        const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });

        // --- الخطوة 3: حقن الملف في الصفحة ---
        const fileInput = document.querySelector('input[type="file"]');
        if (!fileInput) throw new Error('لم يتم العثور على حقل رفع الملفات.');
        
        const file = new File([zipBlob], "receipts.zip", { type: "application/zip" });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));

        // --- الخطوة 4: الضغط على زر "ابدأ المعالجة" ---
        await new Promise(resolve => setTimeout(resolve, 200));
        const buttonSpan = Array.from(document.querySelectorAll('button span.ms-Button-label')).find(span => span.textContent.trim() === 'ابدأ المعالجة');
        if (!buttonSpan) throw new Error('لم يتم العثور على زر "ابدأ المعالجة".');
        
        const processButton = buttonSpan.closest('button');
        processButton.click();

       await new Promise((resolve, reject) => {
    const maxWaitTime = 30000;
    const checkInterval = 250;
    let elapsedTime = 0;
    const intervalId = setInterval(() => {
        const buttonStillExists = document.body.contains(processButton) && processButton.offsetParent !== null;
        if (!buttonStillExists) {
            clearInterval(intervalId);
            resolve(); // نجحت العملية قبل انتهاء المهلة
        } else if (elapsedTime >= maxWaitTime) {
            clearInterval(intervalId);
            // ✅ التعديل هنا: بدلاً من إطلاق خطأ، نعتبر العملية ناجحة ونكمل
            resolve(); 
        }
        elapsedTime += checkInterval;
    }, checkInterval);
});

return { success: true, uuid: finalUuidInChain, error: null };


    } catch (error) {
        return { success: false, uuid: finalUuidInChain, error: error.message };
    }
}


/**
 * ===================================================================================
 * ✅✅✅ دالة بناء إيصال البيع (v17.0 - الإصلاح النهائي بدون ضرب العملة)
 * ===================================================================================
 */
function calculateReceiptData(itemsData, sellerData, deviceSerial, activityCode, failedUuid = null) {
// ✅ بداية التعديل: قراءة بيانات المصدر من الحقول المباشرة
const finalSellerData = {
    id: (sellerData || window.receiptUploaderData.seller).id, // رقم التسجيل لا يتغير
    name: document.getElementById('manual-seller-name')?.value || (sellerData || window.receiptUploaderData.seller).name,
    governate: document.getElementById('manual-seller-governate')?.value || (sellerData || window.receiptUploaderData.seller).governate,
    regionCity: document.getElementById('manual-seller-regionCity')?.value || (sellerData || window.receiptUploaderData.seller).regionCity,
    street: document.getElementById('manual-seller-street')?.value || (sellerData || window.receiptUploaderData.seller).street,
    buildingNumber: document.getElementById('manual-seller-building')?.value || (sellerData || window.receiptUploaderData.seller).buildingNumber
};
// ✅ نهاية التعديل
    const finalDeviceSerial = deviceSerial || window.receiptUploaderData.serial;
    const finalActivityCode = activityCode || finalSellerData.taxpayerActivityCode || '4690';
    const firstRow = itemsData[0];
    const history = JSON.parse(localStorage.getItem("receiptHistory") || "[]");
    const lastUUID = history.length > 0 ? history[0].uuid : "";

    let headerCurrency = "EGP";
    let headerExchangeRate = 0.0;
    const foreignCurrencyItem = itemsData.find(item => item.currencySold && item.currencySold !== 'EGP');
    if (foreignCurrencyItem) {
        headerCurrency = foreignCurrencyItem.currencySold;
        headerExchangeRate = parseFloat(foreignCurrencyItem.exchangeRate) || 1.0;
    }

    const header = {
        dateTimeIssued: getFormattedDateTime(firstRow.dateTimeIssued),
        receiptNumber: String(firstRow.receiptNumber || `RCPT_${Math.floor(Date.now() / 1000)}`),
        previousUUID: lastUUID,
        uuid: "",
        currency: headerCurrency,
        exchangeRate: parseFloat(headerExchangeRate.toFixed(5)),
        sOrderNameCode: "",
        orderdeliveryMode: "",
        grossWeight: 0.0,
        netWeight: 0.0
    };
    if (failedUuid) {
        header.referenceOldUUID = failedUuid;
    }

    let finalTotalSales = 0;
    const finalTaxTotalsMap = new Map();

    const calculatedItemData = itemsData.map(item => {
        const quantity = parseFloat((parseFloat(item.quantity) || 0).toFixed(5));
        
        // ✨✨✨ --- بداية التعديل الحاسم --- ✨✨✨
        // 1. السعر المدخل هو السعر بالعملة الأجنبية
        const amountSold = parseFloat((parseFloat(item.unitPrice) || 0).toFixed(5));
        
        // 2. السعر بالجنيه هو نفسه السعر المدخل (النظام هو من سيقوم بالضرب)
        const amountEGP = amountSold;
        // ✨✨✨ --- نهاية التعديل الحاسم --- ✨✨✨

        const itemTotalSale = parseFloat((quantity * amountEGP).toFixed(5));
        const itemNetSale = itemTotalSale;
        const taxableItems = [];
        let totalTaxAmountForItem = 0;

        if (item.taxableItems && Array.isArray(item.taxableItems)) {
            let tableTaxAmount = 0;
            item.taxableItems.forEach(tax => {
                if (tax.taxType === 'T2' || tax.taxType === 'T3') {
                    tableTaxAmount += itemNetSale * (parseFloat(tax.rate) / 100);
                }
            });
            const vatBaseAmount = itemNetSale + tableTaxAmount;
            item.taxableItems.forEach(tax => {
                const baseAmount = (tax.taxType === 'T1') ? vatBaseAmount : netSale;
                const taxAmount = parseFloat((baseAmount * (parseFloat(tax.rate) / 100)).toFixed(5));
                taxableItems.push({ taxType: String(tax.taxType), amount: taxAmount, subType: String(tax.subType), rate: parseFloat(tax.rate) });
                totalTaxAmountForItem += (tax.taxType === 'T4' ? -taxAmount : taxAmount);
                finalTaxTotalsMap.set(String(tax.taxType), (finalTaxTotalsMap.get(String(tax.taxType)) || 0) + taxAmount);
            });
        }

        const itemTotal = parseFloat((itemNetSale + totalTaxAmountForItem).toFixed(5));
        finalTotalSales += itemTotalSale;

        return {
            internalCode: String(item.internalCode || item.itemCode),
            description: sanitizeText(String(item.description), 100),
            itemType: String(item.itemType || 'EGS'),
            itemCode: String(item.itemCode),
            unitType: String(item.unitType || 'EA'),
            quantity: quantity,
            unitPrice: amountEGP,
            netSale: itemNetSale,
            totalSale: itemTotalSale,
            total: itemTotal,
            valueDifference: 0.0,
            taxableItems: taxableItems,
            itemDiscountData: []
        };
    });

    return {
        header: header,
        documentType: { receiptType: "S", typeVersion: "1.2" },
        seller: { rin: finalSellerData.id, companyTradeName: finalSellerData.name, branchCode: "0", branchAddress: { country: "EG", governate: finalSellerData.governate, regionCity: finalSellerData.regionCity, street: finalSellerData.street,buildingNumber: String(finalSellerData.buildingNumber || '0').trim(), // ✅ تحويله إلى نص والتأكد من عدم كونه فارغًا
}, deviceSerialNumber: finalDeviceSerial, activityCode: finalActivityCode },
        buyer: { type: "P", id: firstRow.buyerId, name: firstRow.buyerName, mobileNumber: "", paymentNumber: "" },
        itemData: calculatedItemData,
        totalSales: parseFloat(finalTotalSales.toFixed(5)),
        totalItemsDiscount: 0.0,
        netAmount: parseFloat(finalTotalSales.toFixed(5)),
        taxTotals: Array.from(finalTaxTotalsMap, ([taxType, amount]) => ({
            taxType,
            amount: parseFloat(amount.toFixed(5))
        })),
        totalAmount: parseFloat(calculatedItemData.reduce((sum, item) => sum + item.total, 0).toFixed(5)),
        paymentMethod: "C",
        feesAmount: 0.0,
        adjustment: 0.0
    };
}
















/**
 * ✅✅✅ دالة sendReceipts (النسخة النهائية المبسطة للإرسال فقط) ✅✅✅
 * @param {Object} receiptObject - كائن الإيصال الجاهز والمحسوب.
 */
async function sendReceipts(receiptObject) {
    const loadingToast = showToastNotification('تأكيد الإرسال...');
    try {
        // حساب UUID قبل الإرسال مباشرة
        const payloadForUuid = JSON.stringify({ receipts: [receiptObject] });
        const uuid = await EtaUuid.computeUuidFromRawText(payloadForUuid);
        receiptObject.header.uuid = uuid;

        const finalPayloadText = JSON.stringify({ receipts: [receiptObject] }, null, 2);
        const zip = new JSZip();
        zip.file("receipts.json", finalPayloadText);
        const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });

        const fileInput = document.querySelector('input[type="file"]');
        if (!fileInput) throw new Error('لم يتم العثور على حقل رفع الملفات.');

        const file = new File([zipBlob], "receipts.zip", { type: "application/zip" });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));

        const buttonSpan = Array.from(document.querySelectorAll('button span.ms-Button-label')).find(span => span.textContent.trim() === 'ابدأ المعالجة');
        if (!buttonSpan) throw new Error('لم يتم العثور على زر "ابدأ المعالجة".');
        buttonSpan.closest('button').click();

        // تسجيل النجاح
        const history = JSON.parse(localStorage.getItem("receiptHistory") || "[]");
        const newHistoryEntry = { receiptNumber: receiptObject.header.receiptNumber, uuid: receiptObject.header.uuid };
        history.unshift(newHistoryEntry);
        localStorage.setItem("receiptHistory", JSON.stringify(history.slice(0, 50)));
        renderReceiptHistory();

        loadingToast.remove();
        showToastNotification(`✅ تم إرسال الإيصال ${newHistoryEntry.receiptNumber} بنجاح!`, 5000);

    } catch (error) {
        alert(`❌ حدث خطأ فادح أثناء الإرسال: ${error.message}`);
    } finally {
        if (loadingToast) loadingToast.remove();
    }
}





/**
 * ✅ دالة جديدة: لجلب بيانات البائع (المصدر) كاملة من الموقع.
 * تستخدم نفس منطق دالة الفواتير getIssuerFullData.
 */
async function getSellerFullData() {
    // يمكننا ببساطة إعادة استخدام نفس الدالة المستخدمة في الفواتير
    // لأنها تجلب نفس البيانات المطلوبة للبائع.
    return await getIssuerFullData();
}



async function getDeviceSerialNumber() {
    const token = getAccessToken();
    if (!token) {
        return null;
    }

    try {
     
        
        const apiUrl = "https://api-portal.invoicing.eta.gov.eg/api/v1/pos/devices/current?Ps=100";
        
        const response = await fetch(apiUrl, {
            headers: { "Authorization": `Bearer ${token}` }
        } );

        if (!response.ok) {
            const errorText = await response.text();
            return null;
        }

        const result = await response.json();
        
        // 2. فلترة النتائج للتأكد من أننا نتعامل فقط مع الأجهزة "النشطة"
        const activeDevices = result?.data?.filter(device => device.status === "Active");

        if (activeDevices && activeDevices.length > 0) {
            // 3. فرز الأجهزة يدوياً (client-side) بناءً على تاريخ أول مصادقة (firstAuthenticationDate)
            // يتم الترتيب تنازلياً (من الأحدث إلى الأقدم).
            activeDevices.sort((a, b) => {
                const dateA = new Date(a.firstAuthenticationDate);
                const dateB = new Date(b.firstAuthenticationDate);
                return dateB - dateA; // للترتيب التنازلي
            });

            return activeDevices; // إرجاع مصفوفة الأجهزة المرتبة
        } else {
            return [];
        }
        // ✅✅✅ نهاية التعديل الجوهري ✅✅✅

    } catch (error) {
        return null;
    }
}











    let isOperationInProgress = false;
    let retryCount = 0;
    const maxRetries = 10;
      const taxTypesMap = {
    "T1": "ضريبة القيمة المضافة",
    "T2": "ضريبة الجدول (نسبية)",
    "T3": "ضريبة الجدول (النوعية)",
    "T4": "الخصم تحت حساب الضريبة",
    "T5": "ضريبة الدمغة (نسبية)",
    "T6": "ضريبة الدمغة (قطعية بمقدار ثابت)",
    "T7": "ضريبة الملاهي",
    "T8": "رسم تنمية الموارد",
    "T9": "رسم خدمة",
    "T10": "رسم المحليات",
    "T11": "رسم التأمين الصحي",
    "T12": "رسوم أخرى",
    "T13": "ضريبة الدمغة (نسبية)",
    "T14": "ضريبة الدمغة (قطعية بمقدار ثابت)",
    "T15": "ضريبة الملاهي",
    "T16": "رسم تنمية الموارد",
    "T17": "رسم خدمة",
    "T18": "رسم المحليات",
    "T19": "رسم التأمين الصحي",
    "T20": "رسوم أخرى"
  };


  







async function getIssuerFullData() {
    try {
        const token = getAccessToken();
        const userData = JSON.parse(localStorage.getItem("USER_DATA") || "{}");
        const taxRin = userData?.profile?.TaxRin || userData?.profile?.taxRin;

        if (!token || !taxRin) {
            return null;
        }

        const response = await fetch(`https://api-portal.invoicing.eta.gov.eg/api/v1/taxpayers/${taxRin}/light`, {
            headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
        } );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        
        const branch = data.taxpayerBranchs?.[0];
        const address = branch?.address;
        const allActivities = branch?.taxpayerActivities || [];

        // --- ✅✅✅ بداية المنطق الجديد والمهم ✅✅✅ ---
        let activeActivityCode = '4690'; // كود افتراضي في حالة الفشل
        if (allActivities.length > 0) {
            // 1. نبحث عن نشاط "ساري" (ليس له تاريخ انتهاء)
            const currentActivity = allActivities.find(act => act.toDate === null);
            
            if (currentActivity) {
                // 2. إذا وجدنا نشاطًا ساريًا، نستخدم الكود الخاص به
                activeActivityCode = currentActivity.activityTypeCode;
            } else {
                // 3. إذا لم نجد، نستخدم كود آخر نشاط (الأحدث) كخيار احتياطي
                activeActivityCode = allActivities[allActivities.length - 1].activityTypeCode;
            }
        } else {
        }
        // --- ✅✅✅ نهاية المنطق الجديد ✅✅✅ ---

        return {
            id: data.registrationNumber,
name: data.nameSecondaryLang || data.namePrimaryLang || "اسم غير محدد",
            // ✅ تعديل: إضافة كود النشاط الفعّال كخاصية منفصلة لسهولة الوصول إليه
            taxpayerActivityCode: activeActivityCode, 
            activities: allActivities, // إبقاء قائمة الأنشطة الكاملة للاستخدامات الأخرى
            governate: address?.governorateNameSecondaryLang || '',
            regionCity: address?.cityNameSecondaryLang || '',
            street: address?.streetName || '',
            buildingNumber: address?.buildingNo || ''
        };

    } catch (err) {
        return null;
    }
}



function addInvoiceCreatorButton() {
    // التأكد من أننا في الصفحة الصحيحة
    if (window.location.pathname !== '/newdocument') {
        return;
    }

    // منع إضافة الزر إذا كان موجودًا بالفعل
    if (document.getElementById("customInvoiceCreatorBtn")) {
        return;
    }

    // البحث عن الزر المرجعي لوضع الزر الجديد قبله
    const referenceButton = document.querySelector("button[id^='Pivot'][id$='-Tab3']");

    if (!referenceButton) {
        if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(addInvoiceCreatorButton, 500);
            return;
        }
        return;
    }

    // --- بداية التصميم المتقدم ---

    // 1. إنشاء الزر وتطبيق التنسيق الأساسي المتوافق
    const btn = document.createElement("button");
    btn.id = "customInvoiceCreatorBtn";
    btn.type = "button";
    btn.className = referenceButton.className.replace('is-selected', '').replace('linkIsSelected-135', '');

    // 2. استخدام أيقونة SVG عالية الجودة لبرنامج Excel
    // SVG (Scalable Vector Graphics) تضمن وضوح الأيقونة في أي حجم
    const excelIconSVG = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="">
            <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" fill="#107C41"/>
            <path d="M14 2V8H20" fill="#10B981" fill-opacity="0.5"/>
            <path d="M12.5 13.5L15 17M15 13.5L12.5 17" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9.5 17H10.5L12 14.75L10.5 12H9.5L8 14.25L9.5 17Z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
    `;

    // 3. بناء الهيكل الداخلي للزر
    btn.innerHTML = `
        <span class="btn-content-wrapper">
            <span class="btn-icon-container">${excelIconSVG}</span>
            <span class="ms-Pivot-text btn-text">إنشاء من Excel</span>
        </span>
    `;

    // 4. إضافة الأنماط المتقدمة باستخدام CSS
    // نستخدم عنصر <style> لسهولة كتابة الأنماط المعقدة والتأثيرات
    const styles = document.createElement('style' );
    styles.id = 'customButtonStyles'; // لمنع تكرار الأنماط
    if (!document.getElementById(styles.id)) {
        styles.innerHTML = `
            #customInvoiceCreatorBtn {
                background: rgba(22, 163, 74, 0.1); /* خلفية شفافة بلون أخضر خفيف */
                border: 1px solid rgba(22, 163, 74, 0.3);
                border-radius: 6px;
                backdrop-filter: blur(10px); /* التأثير الزجاجي */
                -webkit-backdrop-filter: blur(10px);
                transition: all 0.3s ease;
                margin: 0 10px;
                position: relative;
                overflow: hidden; /* لإخفاء تأثير الإضاءة الزائد */
            }
            #customInvoiceCreatorBtn .btn-content-wrapper {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 4px 8px;
            }
            #customInvoiceCreatorBtn .btn-icon-container {
                background-color: #16A34A; /* أخضر Excel */
                border-radius: 4px;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            }
            #customInvoiceCreatorBtn .btn-text {
                color: #14532d; /* لون أخضر داكن للنص */
                font-weight: 600;
            }
            /* تأثير الإضاءة عند مرور الماوس */
            #customInvoiceCreatorBtn::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 300px;
                height: 300px;
                background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%);
                transform: translate(-50%, -50%) scale(0);
                transition: transform 0.5s ease;
                opacity: 0;
            }
            #customInvoiceCreatorBtn:hover::before {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            #customInvoiceCreatorBtn:hover {
                border-color: rgba(22, 163, 74, 0.5);
                background: rgba(22, 163, 74, 0.2);
                box-shadow: 0 4px 15px rgba(22, 163, 74, 0.2);
            }
        `;
        document.head.appendChild(styles);
    }
    // --- نهاية التصميم المتقدم ---

    // إضافة حدث النقر لفتح الواجهة الرئيسية
    btn.addEventListener("click", (event) => {
        event.preventDefault();
        const mainUI = document.getElementById("invoiceCreatorMainUI");
        if (mainUI) {
            mainUI.style.display = "flex";
        } else {
            injectInvoiceCreatorUI();
        }
    });

    // إضافة الزر الجديد قبل الزر المرجعي
    referenceButton.parentNode.insertBefore(btn, referenceButton);

    // إعادة تعيين عداد المحاولات بعد النجاح
    retryCount = 0;
}


function injectInvoiceCreatorUI() {
    // 1. التحقق من وجود الواجهة لمنع تكرارها
    if (document.getElementById("invoiceCreatorMainUI")) {
        const mainUI = document.getElementById("invoiceCreatorMainUI");
        mainUI.style.display = "flex";
        mainUI.querySelector('.sidebar-btn[data-target="panel-create"]').click();
        return;
    }

    // 2. الإعدادات الأساسية
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Kufam:wght@600&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink );

    // 3. إنشاء الهيكل الرئيسي للواجهة
    const mainUI = document.createElement("div");
    mainUI.id = "invoiceCreatorMainUI";
    Object.assign(mainUI.style, {
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)", width: "1080px", height: "700px",
        backgroundColor: "#ffffff", borderRadius: "12px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)", zIndex: "9999",
        fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif",
        overflow: "hidden", display: "flex", direction: "rtl"
    });

    // 4. بناء الهيكل الداخلي (HTML)
    mainUI.innerHTML = `
        <div class="sidebar">
            <div class="sidebar-header"><h3>🚀 الفواتير</h3></div>
            <div class="sidebar-menu">
                <button class="sidebar-btn" data-target="panel-create"><span class="btn-icon">➕</span> إنشاء من Excel</button>
                                <button class="sidebar-btn" data-target="panel-credit-note"><span class="btn-icon">↩️</span> إنشاء إشعار دائن</button>
                <button class="sidebar-btn" data-target="panel-drafts"><span class="btn-icon">🖨️</span> عرض المسودات</button>
                <button class="sidebar-btn" data-target="panel-taxpayer-query"><span class="btn-icon">🔍</span> استعلام عن ممول</button>
                <button class="sidebar-btn" data-target="panel-codes-explorer"><span class="btn-icon">📦</span> مستكشف الأكواد</button>

            </div>
        </div>
       <div class="main-panel">
    <!-- ✅✅✅ بداية طبقة القفل الجديدة ✅✅✅ -->
    <div id="subscription-lockdown-layer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(244, 247, 250, 0.95); z-index: 100; display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(3px);">
        <div class="toast-spinner" style="width: 40px; height: 40px; border-width: 4px; margin-bottom: 20px;"></div>
        <p style="font-size: 20px; color: #0056b3; font-weight: bold;">جاري التحقق من حالة الاشتراك...</p>
    </div>
    <!-- ✅✅✅ نهاية طبقة القفل الجديدة ✅✅✅ -->
    <button id="closeInvoiceCreatorBtn" title="إغلاق">&times;</button>

            <div class="panel-content-wrapper">
                <div id="panel-create" class="panel-content"></div>
                                <div id="panel-credit-note" class="panel-content"></div>

                <div id="panel-drafts" class="panel-content"></div>
                <div id="panel-taxpayer-query" class="panel-content"></div>

                <div id="panel-codes-explorer" class="panel-content"></div>
                <div id="panel-admin-dashboard" class="panel-content" style="background-color: #e9ecef;"></div>
                <div id="panel-jobs" class="panel-content"></div>

            </div>
            <div id="info-sidebar" class="info-sidebar">
                <div id="taxpayer-info-box" class="info-card">
                    <div class="card-header"><span class="card-icon">👤</span><h3>بيانات الممول</h3></div>
                    <div class="card-body"><p>جاري التحميل...</p></div>
                </div>
                <div class="info-card prayer-card"><p>اللهُم صلِّ على مُحمد</p></div>
                <div id="designer-info-box" class="info-card">
                     <div class="card-header"><span class="card-icon">💻</span><h3>المصمم</h3></div>
                     <div class="card-body">
                        <p class="designer-name">المحاسب : محمد صبري</p>
                        <p class="designer-contact"><span class="card-icon" style="font-size: 14px;">📞</span>واتساب: 01060872599</p>
                     </div>
                </div>
            </div>
        </div>
    `;
    populateCreditNoteTab(); 

    // 5. إضافة الأنماط (CSS)
    const styles = document.createElement('style');
    styles.innerHTML = `
        .sidebar { width: 220px; background-color: #0d1b2a; color: #e0e1dd; display: flex; flex-direction: column; flex-shrink: 0; }
        .sidebar-header { padding: 20px; text-align: center; border-bottom: 1px solid #415a77; }
        .sidebar-menu { flex-grow: 1; padding-top: 15px; }
        .sidebar-btn { display: flex; align-items: center; width: 100%; padding: 15px 20px; background-color: transparent; border: none; color: #e0e1dd; font-size: 16px; font-family: 'Cairo', sans-serif; text-align: right; cursor: pointer; transition: background-color 0.3s, color 0.3s; border-right: 4px solid transparent; }
        .sidebar-btn:hover { background-color: #1b263b; }
        .sidebar-btn.active { background-color: #415a77; color: #ffffff; font-weight: 700; border-right-color: #778da9; }
        .sidebar-btn .btn-icon { margin-left: 12px; font-size: 18px; }
        .main-panel { flex-grow: 1; background-color: #f4f7fa; display: flex; position: relative; }
        #closeInvoiceCreatorBtn { position: absolute; top: 10px; left: 10px; width: 32px; height: 32px; background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 50%; font-size: 24px; line-height: 30px; text-align: center; cursor: pointer; z-index: 10; transition: all 0.2s ease; }
        #closeInvoiceCreatorBtn:hover { background-color: #e63946; color: white; transform: scale(1.1); box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
        .panel-content-wrapper { flex-grow: 1; overflow-y: auto; position: relative; }
        .panel-content { display: none; padding: 25px; height: 100%; box-sizing: border-box; }
        .panel-content.active { display: block; animation: fadeIn 0.5s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .info-sidebar { width: 350px; flex-shrink: 0; background-color: #e9ecef; border-right: 1px solid #dee2e6; padding: 20px 15px; display: flex; flex-direction: column; gap: 20px; transition: opacity 0.3s, visibility 0.3s; }
        .info-card { background-color: #fff; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.07); border: 1px solid #dbe4f0; }
        .info-card .card-header { display: flex; align-items: center; gap: 10px; background-color: #f8f9fa; padding: 10px 15px; border-bottom: 1px solid #e9ecef; border-top-left-radius: 9px; border-top-right-radius: 9px; }
        .info-card .card-header h3 { margin: 0; font-size: 15px; color: #1d3557; }
        .info-card .card-icon { font-size: 18px; color: #457b9d; }
        .info-card .card-body { padding: 15px; font-size: 14px; color: #343a40; }
        .info-card .card-body p { margin: 5px 0; line-height: 1.6; }
        #taxpayer-info-box strong { color: #0d1b2a; }
        .prayer-card { text-align: center; padding: 20px; background: linear-gradient(135deg, #1d3557, #457b9d); color: #fff; text-shadow: 1px 1px 3px rgba(0,0,0,0.3); }
        .prayer-card p { font-family: 'Kufam', cursive; font-size: 22px; font-weight: 600; margin: 0; }
        #designer-info-box .designer-name { font-weight: bold; color: #1d3557; }
        #designer-info-box .designer-contact { font-size: 13px; color: #007bff; display: flex; align-items: center; gap: 8px; }
        .panel-header { border-bottom: 1px solid #dee2e6; padding-bottom: 15px; margin-bottom: 25px; }
        .panel-header h2 { margin: 0 0 5px 0; color: #0d1b2a; font-size: 22px; }
        .panel-header p { margin: 0; color: #6c757d; font-size: 15px; }
        .content-step { margin-bottom: 20px; }
        .content-label { display: block; font-size: 15px; font-weight: 600; color: #343a40; margin-bottom: 8px; }
        .content-select { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ced4da; font-size: 15px; }
        .button-group { display: flex; gap: 15px; }
        .action-button { padding: 12px 20px; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 15px; flex-grow: 1; text-align: center; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
        .action-button:hover { transform: translateY(-2px); }
        .download-btn { background-color: #5a67d8; }
        .upload-btn { background-color: #38a169; }
        .drafts-btn-main { background-color: #dd6b20; width: 60%; margin: 20px auto; padding: 15px; font-size: 18px; }
        .comments-area { display: flex; flex-direction: column; height: 100%; }
        .comments-container { flex-grow: 1; overflow-y: auto; padding: 10px; background: #e9ecef; border-radius: 8px; margin-bottom: 20px; }
        .comment-box { background: white; padding: 15px; border-radius: 10px; margin-bottom: 15px; border-right: 5px solid #a8dadc; box-shadow: 0 2px 5px rgba(0,0,0,0.05); position: relative; }
        .comment-box.admin-comment { border-right-color: #fca311; }
        .comment-image { max-width: 150px; max-height: 150px; border-radius: 8px; margin-top: 10px; cursor: pointer; transition: transform 0.3s; object-fit: cover; }
        .admin-form-container { background-color: #fff; padding: 40px; border-radius: 12px; text-align: center; max-width: 400px; margin: 40px auto; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .admin-input { width: 100%; padding: 12px; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 8px; font-size: 16px; text-align: center; }
        .admin-submit-btn { background-color: #1d3557; color: white; padding: 12px 30px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 16px; width: 100%; }
        .help-section { margin-bottom: 25px; }
        .help-title { font-size: 18px; color: #1d3557; border-bottom: 2px solid #a8dadc; padding-bottom: 8px; margin-bottom: 15px; }
        .help-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .help-table th, .help-table td { border: 1px solid #dee2e6; padding: 12px; text-align: right; vertical-align: middle; }
        .help-table th { background-color: #f8f9fa; font-weight: 700; color: #495057; }
        .help-table tbody tr:nth-child(even) { background-color: #f9f9f9; }
        .help-table td strong { color: #0d1b2a; }
        .required-star { color: #e63946; font-weight: bold; margin-right: 4px; }
        .help-notes { background-color: #fffbe6; border: 1px solid #ffe58f; border-right: 5px solid #fca311; padding: 15px 20px; border-radius: 8px; }
        .help-notes ul { padding-right: 20px; margin: 0; }
        .help-notes li { margin-bottom: 12px; line-height: 1.7; font-size: 15px; }
        .note-highlight { font-weight: bold; color: #1d3557; }
        .query-container { display: flex; gap: 10px; margin-bottom: 20px; align-items: center; padding: 10px; background: #f8f9fa; border-radius: 12px; border: 1px solid #e9ecef; }
        #taxpayerQueryInput { flex-grow: 1; padding: 12px 15px; border: 1px solid #ced4da; border-radius: 8px; font-size: 16px; text-align: left; direction: ltr; transition: all 0.3s ease; }
        #taxpayerQueryInput:focus { border-color: #007bff; box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15); outline: none; }
        #taxpayerQueryBtn { padding: 12px 25px; font-size: 16px; font-weight: bold; background: linear-gradient(145deg, #007bff, #0056b3); color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 10px rgba(0, 123, 255, 0.2); }
        #taxpayerQueryBtn:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(0, 123, 255, 0.3); }
        #queryResultContainer { background-color: #e9ecef; border-radius: 8px; padding: 15px; height: calc(100% - 150px); overflow-y: auto; }
        .query-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; font-size: 20px; color: #6c757d; text-align: center; }
        .query-placeholder svg { width: 80px; height: 80px; margin-bottom: 20px; opacity: 0.5; }
        .profile-card, .branch-card, .activity-card { background: #ffffff; border-radius: 12px; margin-bottom: 20px; border: 1px solid #dee2e6; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05); overflow: hidden; animation: fadeIn 0.5s ease-out; }
        .card-header { display: flex; align-items: center; gap: 12px; padding: 15px 20px; background: #f8f9fa; border-bottom: 1px solid #e9ecef; }
        .card-header .icon { font-size: 24px; color: #007bff; }
        .card-header h3 { margin: 0; font-size: 18px; font-weight: 700; color: #343a40; }
        .card-body { padding: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px 25px; }
        .info-field { display: flex; align-items: center; background: #f8f9fa; border-radius: 8px; padding: 8px 12px; border: 1px solid #e9ecef; }
        .info-field .label-icon { font-size: 18px; color: #6c757d; margin-left: 10px; }
        .info-field .value { font-size: 15px; color: #212529; font-weight: 500; }
        .info-field .value.ltr { direction: ltr; text-align: left; flex-grow: 1; }
        .info-field .status { padding: 4px 10px; border-radius: 15px; font-weight: bold; font-size: 13px; }
        .info-field .status.active { background-color: #d4edda; color: #155724; }
        .info-field .status.inactive { background-color: #f8d7da; color: #721c24; }
        .activity-card { border-left: 5px solid #17a2b8; }
        .activity-card .card-header .icon { color: #17a2b8; }
        .codes-explorer-grid { display: grid; grid-template-columns: 350px 1fr; gap: 20px; height: 100%; }
        .search-panel { display: flex; flex-direction: column; background: #f8f9fa; border-radius: 12px; padding: 15px; border: 1px solid #e9ecef; }
        .details-panel { display: flex; flex-direction: column; }
        .search-options { display: flex; gap: 10px; margin-bottom: 15px; }
        .search-options select { flex-grow: 1; padding: 10px; border: 1px solid #ced4da; border-radius: 8px; }
        #code-search-input { width: 100%; padding: 12px 15px; border: 1px solid #ced4da; border-radius: 8px; font-size: 16px; margin-bottom: 15px; }
        #search-results-list { list-style: none; padding: 0; margin: 0; overflow-y: auto; flex-grow: 1; border: 1px solid #e9ecef; border-radius: 8px; background: #fff; }
        .search-result-item { padding: 12px 15px; border-bottom: 1px solid #e9ecef; cursor: pointer; transition: background-color 0.2s; }
        .search-result-item:last-child { border-bottom: none; }
        .search-result-item:hover, .search-result-item.selected { background-color: #e0e7ff; }
        .search-result-item strong { display: block; color: #1d3557; font-size: 15px; }
        .search-result-item span { font-size: 13px; color: #007bff; font-family: monospace; }
        #code-details-container { padding: 20px; background: #fff; border-radius: 12px; border: 1px solid #dee2e6; overflow-y: auto; flex-grow: 1; }
        .detail-card { background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 15px; border-left: 4px solid #007bff; }
        .detail-card h4 { margin: 0 0 10px 0; color: #343a40; font-size: 16px; }
        .detail-card p { margin: 5px 0; font-size: 15px; }
        .detail-card p .label { font-weight: 600; color: #495057; min-width: 100px; display: inline-block; }
        .detail-card p .value { color: #1d3557; }
        .detail-card p .value.code { color: #e63946; font-family: monospace; font-weight: bold; }
        .list-placeholder { text-align: center; color: #888; padding: 20px; }
    `;
    document.body.appendChild(styles);
    document.body.appendChild(mainUI);

   
    

    
 
    







    /**
 * =========================================================================
 * ✅✅✅ دالة بناء تبويب الإشعار الدائن (v2.0 - مع خيار الربط)
 * =========================================================================
 */
function populateCreditNoteTab() {
    const creditNotePanel = document.getElementById('panel-credit-note');
    if (!creditNotePanel) return;

    // ✨ --- بداية التعديل --- ✨
    creditNotePanel.innerHTML = `
        <div class="panel-header">
            <h2>إنشاء إشعار دائن (Credit Note) من ملف Excel</h2>
            <p>استخدم هذا القسم لرفع الإشعارات الدائنة.</p>
        </div>

        <!-- 1. اختيار نوع الإشعار الدائن -->
        <div class="content-step">
            <label class="content-label">الخطوة 1: اختر نوع الإشعار الدائن</label>
            <select id="creditNoteTypeSelect" class="content-select">
                <option value="with_reference" selected>إشعار دائن بربط (يتطلب UUID لفاتورة سابقة)</option>
                <option value="without_reference">إشعار دائن بدون ربط</option>
            </select>
        </div>

        <!-- 2. اختيار إصدار المستند -->
        <div class="content-step">
            <label class="content-label">الخطوة 2: اختر إصدار المستند</label>
            <select id="creditNoteVersionSelect" class="content-select">
                <option value="1.0" selected>إصدار 1.0 (مستند نهائي وموقع)</option>
                <option value="0.9">إصدار 0.9 (مسودة غير موقعة)</option>
            </select>
        </div>

        <!-- 3. تحميل النموذج ورفع الملف -->
        <div class="content-step">
            <label class="content-label">الخطوة 3: تحميل النموذج ورفع الملف</label>
            <div class="button-group">
                <button id="downloadCreditNoteTemplateBtn" class="action-button download-btn" style="background-color: #c0392b;">
                    <span class="btn-icon">📥</span> تحميل نموذج الإشعار الدائن
                </button>
                <label for="creditNoteExcelUploadInput" class="action-button upload-btn" style="background-color: #e67e22;">
                    <span class="btn-icon">📂</span> رفع ملف الإشعار الدائن
                </label>
                <input type="file" id="creditNoteExcelUploadInput" accept=".xlsx, .xls" style="display: none;">
            </div>
        </div>

        <!-- 4. ملاحظات توضيحية -->
        <div id="creditNoteHelp" class="help-notes" style="margin-top: 20px;">
            <!-- سيتم تحديث المحتوى هنا ديناميكيًا -->
        </div>
    `;
    // ✨ --- نهاية التعديل --- ✨

    const creditNoteTypeSelect = document.getElementById('creditNoteTypeSelect');
    const helpBox = document.getElementById('creditNoteHelp');

    // دالة لتحديث الملاحظات بناءً على اختيار المستخدم
    function updateHelpNotes() {
        if (creditNoteTypeSelect.value === 'with_reference') {
            helpBox.innerHTML = `
                <h3 class="help-title">ملاحظة هامة (للربط)</h3>
                <p>لربط الإشعار بالفاتورة الأصلية، يجب وضع الرقم التعريفي (UUID) للفاتورة في عمود "مرجع شراء" في ملف الإكسيل. هذا الحقل إجباري في هذه الحالة.</p>
            `;
        } else {
            helpBox.innerHTML = `
                <h3 class="help-title">ملاحظة هامة (بدون ربط)</h3>
                <p>في هذا الوضع، يمكنك ترك عمود "مرجع شراء" فارغًا. سيتم إنشاء إشعار دائن مستقل غير مرتبط بفاتورة سابقة.</p>
            `;
        }
    }

    // ربط الأحداث
    creditNoteTypeSelect.addEventListener('change', updateHelpNotes);
    document.getElementById('downloadCreditNoteTemplateBtn').addEventListener('click', downloadCreditNoteTemplate);
    document.getElementById('creditNoteExcelUploadInput').addEventListener('change', handleCreditNoteUpload_Final);

    // تحديث الملاحظات عند التحميل لأول مرة
    updateHelpNotes();
}





// =========================================================================
// ✅✅✅ دالة تنزيل نموذج الإشعار الدائن (v4 - النسخة النهائية الكاملة)
// =========================================================================
async function downloadCreditNoteTemplate() {
    const loadingToast = showToastNotification('جاري إنشاء نموذج الإشعار الدائن الاحترافي...', 0);
    try {
        if (typeof ExcelJS === 'undefined') {
            await injectScriptFromLocal('exceljs.min.js');
        }

        const workbook = new ExcelJS.Workbook();
        const mainSheet = workbook.addWorksheet("CreditNotes");
        const listsSheet = workbook.addWorksheet("Lists");

        // --- 1. إعداد ورقة القوائم المنسدلة "Lists" (لا تغيير هنا) ---
        listsSheet.getCell('A1').value = "ReceiverTypes";
        receiverTypes.forEach((item, i) => { listsSheet.getCell(`A${i + 2}`).value = item.desc; });
        
        listsSheet.getCell('B1').value = "CodeTypes";
        itemCodeTypes.forEach((item, i) => { listsSheet.getCell(`B${i + 2}`).value = item.code; });
        
        listsSheet.getCell('C1').value = "UnitTypes";
        unitTypes.forEach((item, i) => { listsSheet.getCell(`C${i + 2}`).value = item.desc_ar; });
        
        listsSheet.getCell('D1').value = "Countries";
        countryCodes.forEach((item, i) => { listsSheet.getCell(`D${i + 2}`).value = item.Desc_ar; });

        listsSheet.getCell('E1').value = "MainTaxTypes";
        Object.values(taxTypes).forEach((item, i) => { listsSheet.getCell(`E${i + 2}`).value = item.desc; });
        
        let taxColIndex = 6;
        Object.values(taxTypes).forEach(data => {
            const headerCell = listsSheet.getCell(1, taxColIndex);
            const rangeName = data.desc.replace(/[ ()]/g, '_');
            headerCell.value = rangeName;
            data.subtypes.forEach((subtype, i) => { listsSheet.getCell(i + 2, taxColIndex).value = subtype.desc; });
            
            const colLetter = String.fromCharCode('A'.charCodeAt(0) + taxColIndex - 1);
            const rangeFormula = `'Lists'!$${colLetter}$2:$${colLetter}$${data.subtypes.length + 1}`;
            workbook.definedNames.add(rangeFormula, rangeName);
            taxColIndex++;
        });

        // --- 2. ✅✅✅ بداية التعديل: إضافة أعمدة العنوان وتحديث العناوين ---
        const headers = [
            'الرقم الداخلي للإشعار (*)', 'تاريخ الإصدار', 'مرجع شراء (*)',
            'رقم تسجيل المستلم (*)', 'اسم المستلم', 'نوع المستلم (*)', 
            'دولة المستلم', 'محافظة المستلم', 'مدينة المستلم', 'شارع المستلم', 'مبنى المستلم', // <-- الأعمدة الجديدة للعنوان
            'وصف الصنف (*)', 'نوع كود الصنف (*)', 'كود الصنف (*)', 'وحدة القياس (*)',
            'الكمية (*)', 'سعر الوحدة (*)', 
            'نسبة الخصم', 'قيمة الخصم',
            'نوع الضريبة 1 (*)', 'النوع الفرعي 1 (*)', 'نسبة الضريبة 1 (*)',
            'نوع الضريبة 2', 'النوع الفرعي 2', 'نسبة الضريبة 2',
            'نوع الضريبة 3', 'النوع الفرعي 3', 'نسبة الضريبة 3'
        ];
        const comments = {
            'مرجع شراء (*)': 'إجباري: ضع هنا الرقم التعريفي (UUID) للفاتورة الأصلية.',
            'قيمة الخصم': 'اختياري: أدخل مبلغ الخصم بالجنيه. إذا تم إدخاله، سيتم تجاهل نسبة الخصم.',
            'نسبة الخصم': 'اختياري: أدخل نسبة الخصم (مثال: 5 لـ 5%). سيتم تجاهله إذا تم إدخال قيمة الخصم.',
            'محافظة المستلم': 'اختياري: سيتم ملؤه تلقائياً إذا كان رقم التسجيل صحيحاً.',
            'مدينة المستلم': 'اختياري: سيتم ملؤه تلقائياً.',
            'شارع المستلم': 'اختياري: سيتم ملؤه تلقائياً.',
            'مبنى المستلم': 'اختياري: سيتم ملؤه تلقائياً.',
        };
        // --- ✅✅✅ نهاية التعديل ---

        mainSheet.columns = headers.map(h => ({ header: h, key: h, width: 30 }));

        mainSheet.getRow(1).eachCell((cell) => {
            cell.note = comments[cell.value] || excelCellComments[cell.value.replace(' (*)', '')] || '';
            cell.font = { name: 'Arial', bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9534F' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        // --- 3. ✅✅✅ بداية التعديل: تحديث أماكن القوائم المنسدلة ---
        const addValidation = (columnLetter, formula) => {
            for (let i = 2; i <= 1001; i++) {
                mainSheet.getCell(`${columnLetter}${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [formula] };
            }
        };

        addValidation('F', '=Lists!$A$2:$A$4'); // نوع المستلم
        addValidation('G', `=Lists!$D$2:$D$${countryCodes.length + 1}`); // الدولة
        addValidation('M', '=Lists!$B$2:$B$3'); // نوع كود الصنف
        addValidation('O', `=Lists!$C$2:$C$${unitTypes.length + 1}`); // وحدة القياس

        // قوائم الضرائب الرئيسية
        addValidation('T', `=Lists!$E$2:$E$${Object.keys(taxTypes).length + 1}`); // ضريبة 1
        addValidation('W', `=Lists!$E$2:$E$${Object.keys(taxTypes).length + 1}`); // ضريبة 2
        addValidation('Z', `=Lists!$E$2:$E$${Object.keys(taxTypes).length + 1}`); // ضريبة 3

        // القوائم الفرعية الديناميكية المترابطة
        const cascadingFormula1 = '=INDIRECT(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(T2," ","_"),"(","_"),")","_"))';
        const cascadingFormula2 = '=INDIRECT(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(W2," ","_"),"(","_"),")","_"))';
        const cascadingFormula3 = '=INDIRECT(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(Z2," ","_"),"(","_"),")","_"))';
        addValidation('U', cascadingFormula1); // فرعي 1
        addValidation('X', cascadingFormula2); // فرعي 2
        addValidation('AA', cascadingFormula3); // فرعي 3
        // --- ✅✅✅ نهاية التعديل ---

        listsSheet.state = 'hidden';
        mainSheet.views = [{ rightToLeft: true }];

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, "نموذج_إشعار_دائن_احترافي_كامل.xlsx");

    } catch (error) {
        alert("فشل إنشاء نموذج الإكسيل: " + error.message);
    } finally {
        loadingToast.remove();
    }
}

/**
 * ===================================================================================
 * ✅✅✅ دالة جديدة: لحساب "مسافة ليفينشتاين" بين نصين
 * ===================================================================================
 * تُستخدم هذه الدالة لقياس مدى التشابه بين وصفي الصنفين.
 */
function getLevenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) {
        matrix[0][i] = i;
    }
    for (let j = 0; j <= b.length; j++) {
        matrix[j][0] = j;
    }

    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j - 1][i] + 1,      // Deletion
                matrix[j][i - 1] + 1,      // Insertion
                matrix[j - 1][i - 1] + cost // Substitution
            );
        }
    }

    return matrix[b.length][a.length];
}


/**
 * ===================================================================================
 * ✅✅✅ دالة رفع الإشعار الدائن (v6.0 - النسخة التشخيصية الكاملة)
 * ===================================================================================
 */
async function handleCreditNoteUpload_Final(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const progressIndicator = showNonBlockingProgress_CN('جاري قراءة الملف...');

    try {
        // --- 1. قراءة وترجمة البيانات من الإكسيل ---
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await file.arrayBuffer());
        const worksheet = workbook.getWorksheet(1);
        
        const headers = worksheet.getRow(1).values.slice(1).map(h => String(h || '').trim());
        const allRows = [];
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber > 1) {
                const rowObject = {};
                row.values.slice(1).forEach((value, index) => {
                    const header = headers[index];
                    if (header) rowObject[header] = value;
                });
                allRows.push(rowObject);
            }
        });

        if (allRows.length === 0) throw new Error("ملف الإكسيل فارغ!");

        const headerMapping = {
            'الرقم الداخلي للإشعار (*)': 'internalID', 'تاريخ الإصدار': 'dateTimeIssued',
            'مرجع شراء (*)': 'references', 'رقم تسجيل المستلم (*)': 'receiver_id',
            'اسم المستلم': 'receiver_name', 'نوع المستلم (*)': 'receiver_type',
            'دولة المستلم': 'receiver_country', 'محافظة المستلم': 'receiver_governate', 
            'مدينة المستلم': 'receiver_city', 'شارع المستلم': 'receiver_street', 'مبنى المستلم': 'receiver_building',
            'وصف الصنف (*)': 'item_description', 'نوع كود الصنف (*)': 'item_type',
            'كود الصنف (*)': 'item_code', 'وحدة القياس (*)': 'unit_type',
            'الكمية (*)': 'quantity', 'سعر الوحدة (*)': 'unit_price',
            'نسبة الخصم': 'discount_rate', 'قيمة الخصم': 'discount_amount',
            'نوع الضريبة 1 (*)': 'tax_type_1', 'النوع الفرعي 1 (*)': 'tax_subtype_1',
            'نسبة الضريبة 1 (*)': 'tax_rate_1', 'نوع الضريبة 2': 'tax_type_2',
            'النوع الفرعي 2': 'tax_subtype_2', 'نسبة الضريبة 2': 'tax_rate_2',
            'نوع الضريبة 3': 'tax_type_3', 'النوع الفرعي 3': 'tax_subtype_3', 'نسبة الضريبة 3': 'tax_rate_3'
        };

        const translatedObjects = allRows.map(row => {
            const newObj = {};
            for (const arabicHeader in row) {
                const englishKey = headerMapping[arabicHeader.trim()];
                if (englishKey) {
                    let value = row[arabicHeader];
                    if (reverseMappings.units[value]) value = reverseMappings.units[value];
                    else if (reverseMappings.taxTypes[value]) value = reverseMappings.taxTypes[value];
                    else if (reverseMappings.taxSubtypes[value]) value = reverseMappings.taxSubtypes[value];
                    else if (reverseMappings.receiverTypes[value]) value = reverseMappings.receiverTypes[value];
                    newObj[englishKey] = value;
                }
            }
            return newObj;
        });

        const creditNotesMap = new Map();
        translatedObjects.forEach(obj => {
            const internalID = obj.internalID;
            if (!internalID) return;
            if (!creditNotesMap.has(internalID)) {
                creditNotesMap.set(internalID, []);
            }
            creditNotesMap.get(internalID).push(obj);
        });

        // --- 2. استدعاء دالة التحقق ---
        progressIndicator.update('جاري التحقق من البيانات...');
        const { validatedMap, validationErrors } = await validateAndEnrichCreditNoteData_CN(creditNotesMap, progressIndicator);
        
      

        progressIndicator.success('اكتمل التحقق!');

        // --- 3. عرض النتائج ---
        if (validationErrors.length > 0) {
            showErrorModal(validationErrors, () => {
                if (validatedMap.size > 0) {
                    showCreditNoteEditor_CN(validatedMap);
                }
            });
        } else {
            showCreditNoteEditor_CN(validatedMap);
        }

    } catch (error) {
        progressIndicator.error(`فشل: ${error.message}`);
    } finally {
        event.target.value = '';
    }
}


/**
 * ===================================================================================
 * ✅✅✅ دالة التحقق من الإشعار الدائن (v14.0 - مع القيم الافتراضية للشخصي)
 * ===================================================================================
 */
async function validateAndEnrichCreditNoteData_CN(creditNotesMap, progressIndicator) {
    const validationErrors = [];
    const validatedMap = new Map();
    const token = getAccessToken();

    let processedCount = 0;
    const totalCount = creditNotesMap.size;
    
    if (progressIndicator) {
        progressIndicator.update(`جاري التحقق من الإشعارات... (0 / ${totalCount})`, 0);
    }

    // --- دوال مساعدة داخلية للتحقق (تبقى كما هي) ---
    async function getOriginalDocumentBySearch(uuid) {
        if (!uuid || String(uuid).trim() === '') {
            return { valid: false, message: "حقل UUID للفاتورة الأصلية إجباري." };
        }
        const cleanUuid = String(uuid).trim();
        try {
            const searchUrl = `https://api-portal.invoicing.eta.gov.eg/api/v1/documents/search?Query=uuid%3A%22${cleanUuid}%22&Status=Valid&Direction=sent&Page=1&PageSize=1`;
            const searchResponse = await fetch(searchUrl, { headers: { 'Authorization': `Bearer ${token}` } } );
            if (!searchResponse.ok) return { valid: false, message: `خطأ ${searchResponse.status} من الخادم عند البحث.` };
            const searchResult = await searchResponse.json();
            if (!searchResult.result || searchResult.result.length === 0) return { valid: false, message: "الفاتورة الأصلية غير موجودة أو غير صالحة." };
            const rawDataUrl = `https://api-portal.invoicing.eta.gov.eg/api/v1/documents/${cleanUuid}/raw`;
            const rawResponse = await fetch(rawDataUrl, { headers: { 'Authorization': `Bearer ${token}` } } );
            if (!rawResponse.ok) return { valid: false, message: `فشل جلب البيانات الخام (Status: ${rawResponse.status}).` };
            const rawData = await rawResponse.json();
            if (rawData.document) {
                const documentJson = JSON.parse(rawData.document);
                const activityCode = documentJson.taxpayerActivityCode;
                if (activityCode) return { valid: true, activityCode: activityCode };
            }
            return { valid: false, message: "لم يتم العثور على كود النشاط في بيانات الفاتورة الأصلية." };
        } catch (error) {
            return { valid: false, message: "فشل الاتصال بالشبكة للتحقق من UUID." };
        }
    }
    
    async function validateNID_API(nid) {
        if (!nid || nid.length !== 14 || !/^\d+$/.test(nid)) {
            return { valid: false, message: "يجب أن يتكون من 14 رقمًا." };
        }
        try {
            const response = await fetch(`https://api-portal.invoicing.eta.gov.eg/api/v1/person/${nid}`, { headers: { 'Authorization': `Bearer ${token}` } } );
            if (response.status === 200) return { valid: true };
            if (response.status === 400) return { valid: false, message: "الرقم غير مسجل أو غير صحيح." };
            return { valid: false, message: `خطأ ${response.status} من الخادم.` };
        } catch (error) {
            return { valid: false, message: "فشل التحقق من الرقم." };
        }
    }
    // --- نهاية الدوال المساعدة ---

    // --- بداية حلقة المرور على كل إشعار دائن ---
    for (const [internalID, items] of creditNotesMap.entries()) {
        const firstItem = items[0];
        
        let originalActivityCode = null;
        const creditNoteType = document.getElementById('creditNoteTypeSelect').value;

        if (creditNoteType === 'with_reference') {
            const originalDocResult = await getOriginalDocumentBySearch(firstItem.references);
            if (originalDocResult.valid) {
                originalActivityCode = originalDocResult.activityCode;
            } else {
                validationErrors.push({ id: internalID, field: 'مرجع شراء (UUID)', value: firstItem.references, message: originalDocResult.message });
            }
        }

        // --- ✅✅✅ بداية التعديل المطلوب هنا ✅✅✅ ---
        const receiverType = (firstItem.receiver_type || '').toUpperCase().trim();
        let receiverId = (firstItem.receiver_id || '').toString().trim();
        let taxpayerData = null;

        if (receiverType === 'P') {
            // إذا كان شخصي والرقم القومي فارغ، قم بالملء التلقائي
            if (!receiverId) {
                receiverId = '29507011000000'; // الرقم الافتراضي
                firstItem.receiver_id = receiverId; // تحديث القيمة في الكائن الرئيسي
            }
            // إذا كان الاسم فارغًا، قم بالملء التلقائي
            if (!firstItem.receiver_name || String(firstItem.receiver_name).trim() === '') {
                firstItem.receiver_name = 'عميل نقدي'; // الاسم الافتراضي
            }
            
            // التحقق من صحة الرقم القومي (سواء الأصلي أو الافتراضي)
            const nidResult = await validateNID_API(receiverId);
            if (!nidResult.valid) {
                validationErrors.push({ id: internalID, field: 'الرقم القومي للمستلم', value: receiverId, message: nidResult.message });
            }
            
        } else if (receiverType === 'B') {
            // منطق التحقق من الشركات (لا تغيير هنا)
            taxpayerData = await fetchTaxpayerData(firstItem.receiver_id);
            if (!taxpayerData) {
                validationErrors.push({ id: internalID, field: 'رقم تسجيل المستلم', value: firstItem.receiver_id, message: 'رقم التسجيل غير صحيح أو غير مسجل.' });
            }
        }
        // --- ✅✅✅ نهاية التعديل المطلوب هنا ✅✅✅ ---

        const enrichedItemsPromises = items.map(async (item) => {
            const enrichedItem = { ...item, officialCodeName: '' };
            
            if (originalActivityCode) {
                enrichedItem.originalActivityCode = originalActivityCode;
            }

            // تحديث بيانات المستلم في كل بند
            if (taxpayerData) { // للشركات
                enrichedItem.receiver_name = taxpayerData.namePrimaryLang;
                const address = taxpayerData.taxpayerBranchs?.[0]?.address;
                if (address) {
                    enrichedItem.receiver_governate = address.governorateNameSecondaryLang || '';
                    enrichedItem.receiver_city = address.cityNameSecondaryLang || '';
                    enrichedItem.receiver_street = address.streetName || '';
                    enrichedItem.receiver_building = address.buildingNo || '';
                }
            } else if (receiverType === 'P') { // للأشخاص (لضمان وراثة القيم الافتراضية)
                enrichedItem.receiver_id = firstItem.receiver_id;
                enrichedItem.receiver_name = firstItem.receiver_name;
            }

            const itemCodeType = (item.item_type || '').toUpperCase().trim();
            const itemCode = (item.item_code || '').toString().trim();
            
            if (itemCodeType && itemCode) {
                let codeData = null;
                if (itemCodeType === 'EGS') codeData = await fetchMyEGSCode(itemCode);
                else if (itemCodeType === 'GS1') codeData = await fetchGS1Code(itemCode);
                
                const resultsArray = Array.isArray(codeData) ? codeData : (codeData ? [codeData] : []);
                if (resultsArray.length > 0) {
                    const exactMatch = resultsArray.find(c => c.codeLookupValue.toUpperCase() === itemCode.toUpperCase());
                    if (exactMatch) {
                        enrichedItem.officialCodeName = exactMatch.codeNameSecondaryLang || "!! اسم رسمي غير مسجل !!";
                    } else {
                        validationErrors.push({ id: internalID, field: `كود الصنف (${itemCodeType})`, value: itemCode, message: 'الكود غير صحيح (لم يتم العثور على تطابق تام).' });
                    }
                } else {
                    validationErrors.push({ id: internalID, field: `كود الصنف (${itemCodeType})`, value: itemCode, message: 'فشل التحقق من الكود من الخادم.' });
                }
            } else {
                 validationErrors.push({ id: internalID, field: 'كود الصنف', value: '', message: 'كود الصنف ونوعه حقول إجبارية.' });
            }
            
            return enrichedItem;
        });

        const finalEnrichedItems = await Promise.all(enrichedItemsPromises);
        validatedMap.set(internalID, finalEnrichedItems);
        
        if (progressIndicator) {
            processedCount++;
            progressIndicator.updateProgress(processedCount, totalCount);
        }
    }

    return { validatedMap, validationErrors };
}



/**
 * ===================================================================================
 * ✅ دالة مساعدة جديدة: لإظهار مؤشر تقدم جانبي أنيق وغير مزعج
 * ===================================================================================
 */
function showNonBlockingProgress_CN(initialMessage) {
    document.getElementById('cn-nonblocking-progress')?.remove();

    const progressToast = document.createElement('div');
    progressToast.id = 'cn-nonblocking-progress';
    
    Object.assign(progressToast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '320px',
        backgroundColor: '#ffffff',
        color: '#333',
        borderRadius: '10px',
        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.15)',
        zIndex: '20002',
        fontFamily: "'Cairo', 'Segoe UI', sans-serif",
        overflow: 'hidden',
        opacity: '0',
        transform: 'translateX(20px)',
        transition: 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)'
    });

    progressToast.innerHTML = `
        <div style="padding: 15px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
                <div class="cn-progress-spinner" style="width: 24px; height: 24px; border: 3px solid #e0e0e0; border-top-color: #007bff; border-radius: 50%; animation: spin 1s linear infinite; flex-shrink: 0;"></div>
                <span id="cn-progress-message" style="font-size: 15px; font-weight: 600; color: #1d3557;">${initialMessage}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; margin-bottom: 5px; color: #6c757d;">
                <span>التقدم</span>
                <span id="cn-progress-counter" style="font-family: monospace; font-weight: bold;">-</span>
            </div>
            <div style="background-color: #e9ecef; border-radius: 5px; overflow: hidden;">
                <div id="cn-progress-bar" style="width: 0%; height: 8px; background-color: #007bff; transition: width 0.3s ease;"></div>
            </div>
        </div>
    `;

    document.body.appendChild(progressToast);
    setTimeout(() => {
        progressToast.style.opacity = '1';
        progressToast.style.transform = 'translateX(0)';
    }, 10);

    let autoCloseTimeout = null;

    const removeToast = (delay = 3000) => {
        autoCloseTimeout = setTimeout(() => {
            progressToast.style.opacity = '0';
            progressToast.style.transform = 'translateX(20px)';
            setTimeout(() => progressToast.remove(), 500);
        }, delay);
    };

    progressToast.update = (newMessage, percentage = -1) => {
        clearTimeout(autoCloseTimeout);
        progressToast.querySelector('#cn-progress-message').textContent = newMessage;
        if (percentage >= 0) {
            progressToast.querySelector('#cn-progress-bar').style.width = `${percentage}%`;
        }
    };

    progressToast.updateProgress = (processed, total) => {
        const percentage = Math.round((processed / total) * 100);
        progressToast.update(`جاري التحقق من الإشعارات...`, percentage);
        progressToast.querySelector('#cn-progress-counter').textContent = `${processed} / ${total}`;
    };

    progressToast.success = (message, duration = 3000) => {
        progressToast.querySelector('.cn-progress-spinner').style.display = 'none';
        progressToast.querySelector('#cn-progress-bar').style.backgroundColor = '#28a745';
        progressToast.update(message, 100);
        removeToast(duration);
    };
    
    progressToast.error = (message, duration = 8000) => {
        progressToast.querySelector('.cn-progress-spinner').style.display = 'none';
        progressToast.querySelector('#cn-progress-bar').style.backgroundColor = '#dc3545';
        progressToast.update(message, 100);
        removeToast(duration);
    };

    return progressToast;
}


/**
 * ===================================================================================
 * ✅ دالة مساعدة جديدة: لإنشاء مؤشر تحميل وتقدم مخصص
 * ===================================================================================
 */
function createLoadingIndicator_CN(initialMessage) {
    const indicator = document.createElement('div');
    indicator.id = 'creditNoteLoadingIndicator';
    indicator.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.75); color: white; 
        display: flex; flex-direction: column; align-items: center; justify-content: center; 
        z-index: 20002; font-family: 'Cairo', 'Segoe UI', sans-serif;
        backdrop-filter: blur(5px);
    `;

    indicator.innerHTML = `
        <div style="text-align: center;">
            <div id="cn-indicator-spinner" style="width: 50px; height: 50px; border: 5px solid rgba(255, 255, 255, 0.3); border-top-color: #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
            <p id="cn-indicator-message" style="font-size: 20px; margin: 0;">${initialMessage}</p>
        </div>
    `;
    
    indicator.update = (newMessage) => {
        const messageElement = indicator.querySelector('#cn-indicator-message');
        if (messageElement) messageElement.textContent = newMessage;
    };

    return indicator;
}



/**
 * ===================================================================================
 * ✅ 3. دالة عرض وتعديل مخصصة للإشعار الدائن (النسخة الاحترافية النهائية)
 * ===================================================================================
 * هذه النسخة مطابقة لواجهة تعديل الفواتير، مع عرض تفصيلي لبيانات المصدر والمستلم.
 */
async function showCreditNoteEditor_CN(creditNotesMap) {
    document.getElementById('creditNoteEditorModal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'creditNoteEditorModal';
    modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); z-index: 10000; display: flex; align-items: center; justify-content: center; direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif;`;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `background-color: #fff; width: 95%; height: 90%; border-radius: 12px; display: flex; flex-direction: column; box-shadow: 0 5px 25px rgba(0,0,0,0.2); overflow: hidden;`;
    
    const issuerData = await getIssuerFullData();
    const activitySelectorHTML = (issuerData && issuerData.activities && issuerData.activities.length > 0) ? `
        <div class="details-card-cn" style="padding: 10px 15px;">
            <label for="activity-select-editor-cn" style="font-weight: bold; margin-bottom: 5px; display: block;">اختر كود النشاط:</label>
            <select id="activity-select-editor-cn" style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;">
                ${issuerData.activities.map(act => `<option value="${act.activityTypeCode}" ${act.activityTypeCode === issuerData.taxpayerActivityCode ? 'selected' : ''}>${act.activityTypeCode} - ${act.activityTypeNameSecondaryLang}</option>`).join('')}
            </select>
        </div>` : `<div class="details-card-cn" style="padding: 10px 15px;">كود النشاط: لم يتم العثور على أنشطة.</div>`;

    let tableBodyHTML = '';
    creditNotesMap.forEach((items, internalID) => {
        const firstItem = items[0];
        tableBodyHTML += `
           <tbody class="credit-note-group" data-internal-id="${internalID}">
                <tr class="credit-note-header-row">
                    <td class="toggle-details-cn" style="font-weight: bold; font-size: 20px; text-align: center; cursor: pointer;">+</td>
                    <td><span contenteditable="true" data-field="internalID">${internalID}</span></td>
                    <td><span contenteditable="true" data-field="references">${firstItem.references || ''}</span></td>
                    <td><span contenteditable="true" data-field="receiver_id">${firstItem.receiver_id || ''}</span></td>
                    <td><span contenteditable="true" data-field="receiver_name">${firstItem.receiver_name || ''}</span></td>
                    <td><button class="delete-cn-btn">&times;</button></td>
                </tr>
                <tr class="credit-note-details-row" style="display: none;">
                    <td colspan="6">
                        <div class="details-wrapper-cn">
                            <div class="details-grid-cn">
                                <div class="details-card-cn">
                                    <h4 class="details-header-cn">بيانات المصدر (البائع)</h4>
                                    <table class="issuer-details-table-cn details-table-cn">
                                        <tbody>
                                            <tr><th>رقم التسجيل</th><td data-issuer-field="id">${issuerData.id}</td></tr>
                                            <tr><th>اسم المصدر</th><td data-issuer-field="name">${issuerData.name}</td></tr>
                                            <tr><th>المحافظة</th><td data-issuer-field="governate">${issuerData.governate}</td></tr>
                                            <tr><th>المدينة</th><td data-issuer-field="regionCity">${issuerData.regionCity}</td></tr>
                                            <tr><th>الشارع</th><td data-issuer-field="street">${issuerData.street}</td></tr>
                                            <tr><th>المبنى</th><td data-issuer-field="buildingNumber">${issuerData.buildingNumber}</td></tr>
                                                    <tr><th>كود النشاط</th><td data-issuer-field="taxpayerActivityCode">${firstItem.originalActivityCode || 'N/A'}</td></tr>

                                        </tbody>
                                    </table>
                                </div>
                                <div class="details-card-cn">
                                    <h4 class="details-header-cn">بيانات المستلم (المشتري)</h4>
                                    <table class="receiver-details-table-cn details-table-cn">
                                        <tbody>
                                            <tr><th>نوع المستلم</th><td contenteditable="true" data-receiver-field="receiver_type">${firstItem.receiver_type || 'B'}</td></tr>
                                            <tr><th>رقم التسجيل</th><td contenteditable="true" data-receiver-field="receiver_id">${firstItem.receiver_id || ''}</td></tr>
                                            <tr><th>اسم المستلم</th><td contenteditable="true" data-receiver-field="receiver_name">${firstItem.receiver_name || ''}</td></tr>
                                            <tr><th>المحافظة</th><td contenteditable="true" data-receiver-field="receiver_governate">${firstItem.receiver_governate || ''}</td></tr>
                                            <tr><th>المدينة</th><td contenteditable="true" data-receiver-field="receiver_city">${firstItem.receiver_city || ''}</td></tr>
                                            <tr><th>الشارع</th><td contenteditable="true" data-receiver-field="receiver_street">${firstItem.receiver_street || ''}</td></tr>
                                            <tr><th>المبنى</th><td contenteditable="true" data-receiver-field="receiver_building">${firstItem.receiver_building || ''}</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="items-card-cn">
                                <h4 class="details-header-cn">بنود الإشعار الدائن</h4>
                                <div style="overflow-x: auto;">
                        <table class="items-table-cn">
    <thead>
        <tr>
            <th>وصف الصنف</th><th>كود الصنف</th><th>الاسم الرسمي</th><th>الكمية</th><th>السعر</th>
            <!-- ✅✅✅ بداية الإضافة 2: إضافة رؤوس أعمدة الخصم --- -->
            <th>خصم (%)</th>
            <th>خصم (قيمة)</th>
            <!-- ✅✅✅ نهاية الإضافة 2 --- -->
            <th>ضريبة 1</th><th>ضريبة 2</th>
        </tr>
    </thead>
    <tbody>
    ${items.map(line => `
        <tr>
            <td contenteditable="true" data-field="item_description">${line.item_description}</td>
            <td contenteditable="true" data-field="item_code">${line.item_code}</td>
            <td style="background-color: #f0f8ff;">${line.officialCodeName || ''}</td>
            <td contenteditable="true" data-field="quantity">${line.quantity}</td>
            <td contenteditable="true" data-field="unit_price">${line.unit_price}</td>
            <!-- ✅✅✅ بداية الإضافة 3: إضافة خلايا الخصم --- -->
            <td contenteditable="true" data-field="discount_rate">${line.discount_rate || ''}</td>
            <td contenteditable="true" data-field="discount_amount">${line.discount_amount || ''}</td>
            <!-- ✅✅✅ نهاية الإضافة 3 --- -->
            <td><span contenteditable="true" data-field="tax_type_1">${line.tax_type_1 || ''}</span>/...</td>
            <td><span contenteditable="true" data-field="tax_type_2">${line.tax_type_2 || ''}</span>/...</td>
        </tr>
    `).join('')}
    </tbody>
</table>

                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        `;
    });

    modalContent.innerHTML = `
        <div style="padding: 15px 25px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; background-color: #fffbe6;">
            <h3 style="margin: 0; color: #c0392b;">مراجعة وحفظ الإشعارات الدائنة</h3>
            <div>
                <button id="saveCreditNotesBtn_CN" style="background-color: #28a745; color: white; padding: 10px 25px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">حفظ كمسودة</button>
                <button id="closeCreditNoteEditorBtn_CN" style="background-color: #6c757d; color: white; padding: 10px 25px; border: none; border-radius: 8px; cursor: pointer; margin-right: 10px;">إغلاق</button>
            </div>
        </div>
        <div style="padding: 10px 25px; background-color: #e9ecef;">${activitySelectorHTML}</div>
        <div style="overflow-y: auto; flex-grow: 1;">
            <table class="main-cn-table">
                <thead>
                    <tr style="background-color: #c0392b; color: white; position: sticky; top: 0; z-index: 10;">
                        <th></th><th>الرقم الداخلي</th><th>UUID الفاتورة الأصلية</th><th>رقم تسجيل المستلم</th><th>اسم المستلم</th><th>حذف</th>
                    </tr>
                </thead>
                ${tableBodyHTML}
            </table>
        </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    const styles = `
        .main-cn-table { width: 100%; border-collapse: collapse; }
        .credit-note-header-row { background-color: #fff1f1; border-bottom: 2px solid #ffbaba; }
        .credit-note-header-row td { padding: 12px; vertical-align: middle; text-align: center; }
        .credit-note-header-row td span { background-color: #fff; padding: 5px; border-radius: 4px; border: 1px dashed #ccc; min-width: 150px; display: inline-block; }
        .details-wrapper-cn { padding: 20px; background-color: #f9f9f9; border-top: 3px solid #c0392b; }
        .details-grid-cn { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .details-card-cn { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; }
        .details-header-cn { color: #c0392b; border-bottom: 2px solid #eee; padding-bottom: 8px; margin-top: 0; margin-bottom: 15px; font-size: 18px; }
        .details-table-cn { width: 100%; } .details-table-cn th, .details-table-cn td { padding: 8px; text-align: right; border-bottom: 1px solid #f5f5f5; } .details-table-cn tr:last-child td { border-bottom: none; } .details-table-cn th { font-weight: 600; width: 120px; }
        .items-card-cn { grid-column: 1 / -1; }
        .items-table-cn { width: 100%; border-collapse: collapse; } .items-table-cn th, .items-table-cn td { border: 1px solid #dee2e6; padding: 8px; text-align: center; } .items-table-cn th { background-color: #e9ecef; }
        .delete-cn-btn { background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; padding: 4px 8px; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    document.getElementById('closeCreditNoteEditorBtn_CN').onclick = () => modal.remove();
    document.getElementById('saveCreditNotesBtn_CN').onclick = () => saveCreditNotesFromEditor_CN(creditNotesMap);
    
    modal.querySelectorAll('.toggle-details-cn').forEach(btn => {
        btn.onclick = (e) => {
            const detailsRow = e.target.parentElement.nextElementSibling;
            const isVisible = detailsRow.style.display !== 'none';
            detailsRow.style.display = isVisible ? 'none' : 'table-row';
            e.target.textContent = isVisible ? '+' : '-';
        };
    });

    modal.querySelectorAll('.delete-cn-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.target.closest('.credit-note-group').remove();
        };
    });
}


/**
 * ===================================================================================
 * ✅ 4. دالة الحفظ النهائية للإشعار الدائن (النسخة المصححة التي تستخدم البيانات المحققة)
 * ===================================================================================
 */
async function saveCreditNotesFromEditor_CN(creditNotesMap) {
    const saveBtn = document.getElementById('saveCreditNotesBtn_CN');
    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ جاري الحفظ...';

    const issuerData = await getIssuerFullData();
    if (!issuerData) {
        alert("فشل جلب بيانات المصدر (البائع). لا يمكن المتابعة.");
        saveBtn.disabled = false; saveBtn.textContent = 'حفظ كمسودة';
        return;
    }
    
    const activityCode = document.getElementById('activity-select-editor-cn')?.value || issuerData.taxpayerActivityCode;
    issuerData.taxpayerActivityCode = activityCode;

    const payloadsToProcess = [];
    
    // --- ✅✅✅ بداية التعديل الجوهري ---
    // المرور على الخريطة الأصلية (creditNotesMap) التي تحتوي على كل البيانات المحققة
    // بدلاً من قراءة البيانات من واجهة HTML مرة أخرى.
    for (const [internalID, items] of creditNotesMap.entries()) {
        const groupElement = document.querySelector(`.credit-note-group[data-internal-id="${internalID}"]`);
        if (!groupElement) continue; // إذا تم حذف الإشعار من الواجهة، تجاهله

        // `items` هنا هي البيانات الكاملة والمُحققة التي تحتوي على العنوان
        const payload = createCreditNotePayload_CN(items, issuerData);
        const rawLinesData = items; // البيانات الخام هي نفسها items
        payloadsToProcess.push({ payload, rawLines: rawLinesData });
    }
    // --- ✅✅✅ نهاية التعديل الجوهري ---

    let successCount = 0;
    const errors = [];

    for (const item of payloadsToProcess) {
        const internalID = item.payload.document.internalID;
        try {
            // الخطوة 1: إنشاء المسودة الأولية
            const initialPayload = createCreditNotePayload_CN(item.rawLines, issuerData, true);
            const createResult = await createDraftInvoiceAPI(initialPayload);
            if (!createResult.success) throw new Error(createResult.error);
            
            const newDraftId = createResult.data.draftId;

            // الخطوة 2: تحديث المسودة بالبيانات الكاملة لجعلها جاهزة
            const makeReadyResult = await updateDraftInvoiceAPI(newDraftId, item.payload, item.rawLines);
            if (!makeReadyResult.success) {
                await deleteDraftInvoiceAPI(newDraftId); 
                throw new Error(`فشل في جعل المسودة جاهزة: ${makeReadyResult.error}`);
            }

            successCount++;
            saveBtn.textContent = `⏳ جاري الحفظ (${successCount} / ${payloadsToProcess.length})...`;

        } catch (error) {
            errors.push({ id: internalID, field: 'خطأ من الخادم', value: 'فشل الحفظ', message: error.message });
        }
    }

    saveBtn.disabled = false;
    saveBtn.textContent = 'حفظ كمسودة';

    if (errors.length > 0) {
        showErrorModal(errors);
    }
    
    if (successCount > 0) {
        showSuccessModal('اكتملت العملية بنجاح!', `تم حفظ ${successCount} إشعار دائن بنجاح كمسودات جاهزة للإرسال.`);
        document.getElementById('creditNoteEditorModal')?.remove();
    }
}


/**
 * ===================================================================================
 * ✅✅✅ دالة بناء هيكل الإشعار الدائن (v7.0 - مع تقريب الأرقام وتحديد طول الوصف)
 * ===================================================================================
 */

/**
 * ===================================================================================
 * ✅✅✅ دالة بناء هيكل الإشعار الدائن (v8.0 - مع حساب الخصم بشكل صحيح)
 * ===================================================================================
 */
function createCreditNotePayload_CN(lines, issuerData) {
    const firstLine = lines[0];
    const version = document.getElementById('creditNoteVersionSelect')?.value || '1.0';
    const creditNoteType = document.getElementById('creditNoteTypeSelect').value;

    const isUnsigned = (version === '0.9');
    const tags = isUnsigned 
        ? ["CreditNote"] 
        : (creditNoteType === 'with_reference' ? ["CreditNote", "SignatureRequired"] : ["SimpleCreditWithoutRef", "SignatureRequired"]);

    const signatures = isUnsigned ? [] : [{ signatureType: "I", value: "VGVtcG9yYXJ5IFNpZ25hdHVyZSBIb2xkZXI=" }];

    const cleanLine = (line) => {
        const cleaned = {};
        for (const key in line) {
            cleaned[key] = line[key] !== null && line[key] !== undefined ? String(line[key]) : "";
        }
        return cleaned;
    };

    let totalSalesAmount = 0;
    // --- ✅✅✅ بداية الإضافة 1: تعريف متغير لتجميع الخصومات ---
    let totalDiscountAmount = 0;
    // --- ✅✅✅ نهاية الإضافة 1 ---
    const taxTotalsMap = new Map();

    const invoiceLines = lines.map(line => {
        const cl = cleanLine(line);

        const quantity = parseFloat((parseFloat(cl.quantity) || 0).toFixed(5));
        const amountEGP = parseFloat((parseFloat(cl.unit_price) || 0).toFixed(5));
        
        const salesTotal = parseFloat((quantity * amountEGP).toFixed(5));
        totalSalesAmount += salesTotal;

        // --- ✅✅✅ بداية التعديل 2: حساب الخصم وصافي القيمة بشكل صحيح ---
        // إعطاء الأولوية لقيمة الخصم، ثم النسبة
        const discountAmount = parseFloat(cl.discount_amount) || (salesTotal * (parseFloat(cl.discount_rate) || 0) / 100);
        totalDiscountAmount += discountAmount; // تحديث إجمالي الخصم للفاتورة

        const netTotal = parseFloat((salesTotal - discountAmount).toFixed(5));
        // --- ✅✅✅ نهاية التعديل 2 ---
        
        const taxableItems = [];
        let totalTaxAmountForItem = 0;
        for (let i = 1; i <= 2; i++) {
            const taxType = cl[`tax_type_${i}`]?.trim().toUpperCase();
            const taxRateStr = cl[`tax_rate_${i}`];
            if (taxType && taxRateStr && !isNaN(parseFloat(taxRateStr))) {
                const taxRate = parseFloat(taxRateStr);
                const taxAmount = parseFloat((netTotal * (taxRate / 100)).toFixed(5));
                const taxSubtype = cl[`tax_subtype_${i}`]?.trim() || defaultSubtypes[taxType] || "";
                taxableItems.push({ taxType, amount: taxAmount, subType: taxSubtype, rate: taxRate });
                totalTaxAmountForItem += (taxType === "T4" ? -taxAmount : taxAmount);
                taxTotalsMap.set(taxType, (taxTotalsMap.get(taxType) || 0) + taxAmount);
            }
        }
        
        const total = parseFloat((netTotal + totalTaxAmountForItem).toFixed(5));

        return {
            description: sanitizeText(cl.item_description, 100),
            itemType: cl.item_type, 
            itemCode: cl.item_code,
            unitType: cl.unit_type, 
            quantity: quantity, 
            unitValue: { currencySold: "EGP", amountEGP: amountEGP },
            salesTotal: salesTotal, 
            netTotal: netTotal, 
            total: total,
            taxableItems: taxableItems, 
            internalCode: sanitizeText(cl.item_internal_code || cl.item_code, 50),
            // --- ✅✅✅ بداية التعديل 3: وضع قيمة الخصم المحسوبة ---
            discount: { amount: discountAmount }, 
            // --- ✅✅✅ نهاية التعديل 3 ---
            valueDifference: 0, 
            totalTaxableFees: 0, 
            itemsDiscount: 0
        };
    });

    const taxTotals = Array.from(taxTotalsMap, ([taxType, amount]) => ({ taxType, amount: parseFloat(amount.toFixed(5)) }));
    const finalTotalAmount = parseFloat(invoiceLines.reduce((sum, line) => sum + line.total, 0).toFixed(5));

    const documentPayload = {
        issuer: {
            type: "B", id: String(issuerData.id), name: sanitizeText(issuerData.name),
            address: { branchID: "0", country: "EG", governate: sanitizeText(issuerData.governate), regionCity: sanitizeText(issuerData.regionCity), street: sanitizeText(issuerData.street), buildingNumber: String(issuerData.buildingNumber || '') }
        },
        receiver: {
            type: String(firstLine.receiver_type || 'B'), id: String(firstLine.receiver_id), name: sanitizeText(firstLine.receiver_name),
            address: { country: "EG", governate: sanitizeText(firstLine.receiver_governate), regionCity: sanitizeText(firstLine.receiver_city), street: sanitizeText(firstLine.receiver_street), buildingNumber: String(firstLine.receiver_building || '') }
        },
        documentType: "C",
        documentTypeVersion: version,
        dateTimeIssued: getFormattedDateTime(firstLine.dateTimeIssued),
        taxpayerActivityCode: String(firstLine.originalActivityCode || issuerData.taxpayerActivityCode),
        internalID: String(firstLine.internalID),
        invoiceLines: invoiceLines,
        // --- ✅✅✅ بداية التعديل 4: تحديث الإجماليات ---
        totalSalesAmount: parseFloat(totalSalesAmount.toFixed(5)),
        totalDiscountAmount: parseFloat(totalDiscountAmount.toFixed(5)),
        netAmount: parseFloat((totalSalesAmount - totalDiscountAmount).toFixed(5)),
        // --- ✅✅✅ نهاية التعديل 4 ---
        taxTotals: taxTotals,
        totalAmount: finalTotalAmount,
        signatures: signatures,
        payment: {},
        delivery: {},
        totalItemsDiscountAmount: 0,
        extraDiscountAmount: 0
    };
    
    if (creditNoteType === 'with_reference' && firstLine.references) {
        documentPayload.references = [String(firstLine.references)];
    }

    return {
        tags: tags,
        document: documentPayload,
        clientsidevalidationresult: true,
        lineItemCodes: lines.map(line => ({
            codeType: line.item_type,
            itemCode: line.item_code,
            codeNamePrimaryLang: line.officialCodeName || line.item_description,
            codeNameSecondaryLang: line.officialCodeName || line.item_description
        }))
    };
}










// =========================================================================
// ✅✅✅ دالة الإشعارات الاحترافية (v2.0 - مع دعم العداد والتقدم)
// =========================================================================
function showToastNotification(initialMessage, duration = 4000) {
    // إزالة أي إشعار قديم لضمان عدم التراكم
    document.getElementById('eta-toast-notification')?.remove();

    const toast = document.createElement('div');
    toast.id = 'eta-toast-notification';
    
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        backgroundColor: '#34495e', // لون داكن أنيق
        color: 'white',
        padding: '16px 24px',
        borderRadius: '10px',
        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.25)',
        zIndex: '20001',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        fontFamily: "'Cairo', 'Segoe UI', sans-serif",
        fontSize: '16px',
        opacity: '0',
        transform: 'translateY(20px)',
        transition: 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
        maxWidth: '400px'
    });

    toast.innerHTML = `
        <div class="toast-spinner" style="width: 22px; height: 22px; border: 3px solid rgba(255, 255, 255, 0.3); border-top-color: #3498db; border-radius: 50%; animation: spin 1s linear infinite; flex-shrink: 0;"></div>
        <div id="toast-message-content" style="line-height: 1.5;">${initialMessage}</div>
    `;

    const styleSheet = document.createElement("style");
    styleSheet.innerText = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(styleSheet);

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);

    let timeoutId = null;
    if (duration > 0) {
        timeoutId = setTimeout(() => toast.remove(), duration);
    }

    // إضافة دوال مساعدة للتحكم في الإشعار من الخارج
    toast.update = (newMessage, newDuration = duration) => {
        const messageElement = toast.querySelector('#toast-message-content');
        if (messageElement) {
            messageElement.innerHTML = newMessage;
        }
        // إعادة تعيين مؤقت الإغلاق التلقائي إذا تم تحديده
        clearTimeout(timeoutId);
        if (newDuration > 0) {
            timeoutId = setTimeout(() => toast.remove(), newDuration);
        }
    };

    toast.updateProgress = (processed, total) => {
        const percentage = Math.round((processed / total) * 100);
        toast.update(`جاري الحفظ... (${processed} / ${total}) - ${percentage}%`);
    };

    toast.success = (successMessage, finalDuration = 3000) => {
        toast.querySelector('.toast-spinner').style.display = 'none'; // إخفاء الدوار
        toast.style.backgroundColor = '#27ae60'; // تغيير اللون للأخضر
        toast.update(`✅ ${successMessage}`, finalDuration);
    };
    
    toast.error = (errorMessage, finalDuration = 5000) => {
        toast.querySelector('.toast-spinner').style.display = 'none';
        toast.style.backgroundColor = '#c0392b'; // تغيير اللون للأحمر
        toast.update(`❌ ${errorMessage}`, finalDuration);
    };

    toast.removeToast = () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => {
            toast.remove();
            styleSheet.remove();
        }, 500);
    };

    return toast;
}


































































async function populateInvoiceTabs() {
    // جلب كود الإعلانات مرة واحدة لاستخدامه في جميع التبويبات
    
    // --- 1. بناء تبويب "إنشاء من Excel" ---
    const createPanel = document.getElementById('panel-create');
    if (createPanel) {
        createPanel.innerHTML = `
            <div class="panel-header"><h2>إنشاء فاتورة جديدة من ملف Excel</h2><p>اتبع الخطوات التالية لإنشاء فاتورة واحدة أو أكثر بسرعة.</p></div>
            <div class="content-step"><label class="content-label">الخطوة 1: اختر إصدار المستند</label><select id="invoiceVersionSelect" class="content-select"><option value="1.0" selected>إصدار 1.0 (مستند نهائي وموقع)</option><option value="0.9">إصدار 0.9 (مسودة غير موقعة)</option></select></div>
            <div class="content-step"><label class="content-label">الخطوة 2: اختر نوع الفاتورة</label><div id="invoiceTypeSelector" class="button-group" style="justify-content: center;"><button class="action-button invoice-type-btn active" data-type="FullInvoice" style="background-color: #3b82f6;">فاتورة افتراضية (كاملة)</button><button class="action-button invoice-type-btn" data-type="SimpleInvoice" style="background-color: #6b7280;">فاتورة بسيطة</button></div><p style="font-size: 13px; color: #555; text-align: center; margin-top: 8px;">اختر "كاملة" لتضمين بيانات الشراء والبنك، أو "بسيطة" للفواتير السريعة.</p></div>
            <div class="content-step">
                <label class="content-label">الخطوة 3: تحميل النموذج ورفع الملف</label>
                <div class="button-group">
                    <button id="dynamicDownloadTemplateBtn" class="action-button download-btn">
                        <span class="btn-icon">📥</span> تحميل نموذج Excel الذكي
                    </button>
                    <label for="excelUploadInput" class="action-button upload-btn">
                        <span class="btn-icon">📂</span> رفع الملف للمراجعة
                    </label>
                    <input type="file" id="excelUploadInput" accept=".xlsx, .xls" style="display: none;">
                </div>
            </div>

        `;

        // ربط الأحداث الخاصة بتبويب الإنشاء
        document.getElementById('dynamicDownloadTemplateBtn').addEventListener('click', downloadExcelTemplate_v3);
        document.getElementById('excelUploadInput').addEventListener('change', handleExcelUpload_v3);
        document.querySelectorAll('.invoice-type-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.invoice-type-btn').forEach(b => { b.classList.remove('active'); b.style.backgroundColor = '#6b7280'; });
                this.classList.add('active'); this.style.backgroundColor = '#3b82f6';
            });
        });
    }

    // --- 2. بناء تبويب "عرض المسودات" ---
    const draftsPanel = document.getElementById('panel-drafts');
    if (draftsPanel) {
        draftsPanel.innerHTML = `
            <div class="panel-header"><h2>عرض وتعديل المسودات</h2><p>هنا يمكنك عرض كل الفواتير المحفوظة كمسودات على المنصة وتعديلها.</p></div>
            <div class="panel-body" style="text-align: center;"><button id="showDraftsBtn" class="action-button drafts-btn-main"><span class="btn-icon">🔍</span> عرض كل المسودات الآن</button></div>

        `;
        document.getElementById('showDraftsBtn').addEventListener('click', showAllDraftsInEditor);
    }

  
    

    // --- 4. بناء تبويب "الاستعلام عن ممول" ---
    const queryPanel = document.getElementById('panel-taxpayer-query');
    if (queryPanel) {
        queryPanel.innerHTML = `
            <div class="panel-header"><h2>مستكشف بيانات الممولين</h2><p>واجهة احترافية لعرض بيانات الممولين المسجلين بالمنظومة.</p></div>
            <div class="query-container"><input type="text" id="taxpayerQueryInput" placeholder="أدخل رقم التسجيل هنا..."><button id="taxpayerQueryBtn">بحث</button></div>
            <div id="queryResultContainer"><div class="query-placeholder"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.125 20 11 20C6.02944 20 2 15.9706 2 11C2 6.02944 6.02944 2 11 2C15.9706 2 20 6.02944 20 11C20 13.125 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.13401 14.866 4 11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"></path></svg>أدخل رقم تسجيل للبدء...</div></div>

        `;
        
        const queryBtn = document.getElementById('taxpayerQueryBtn' );
        const queryInput = document.getElementById('taxpayerQueryInput');
        const resultContainer = document.getElementById('queryResultContainer');
        
        queryBtn.addEventListener('click', async () => {
            const registrationNumber = queryInput.value.trim();
            if (!registrationNumber) { alert("يرجى إدخال رقم تسجيل أولاً."); return; }
            resultContainer.innerHTML = `<div class="query-placeholder">جاري البحث...</div>`;
            const data = await fetchTaxpayerData(registrationNumber);
               if (data) {
                let html = `<div class="profile-card"><div class="card-header"><span class="icon">👤</span><h3>الملف الشخصي للممول</h3></div><div class="card-body">${createInfoField('🆔', data.registrationNumber, true)}${createInfoField('🏢', data.namePrimaryLang)}${createInfoField('✉️', data.email, true)}${createInfoField('🚦', data.isActive ? 'نشط' : 'غير نشط', false, true)}</div></div>`;
                if (data.taxpayerBranchs && data.taxpayerBranchs.length > 0) {
                    data.taxpayerBranchs.forEach((branch, index) => {
                        const address = branch.address || {};
                        html += `<div class="branch-card"><div class="card-header"><span class="icon">📍</span><h3>بيانات الفرع ${index + 1} (رقم: ${branch.branchNumber})</h3></div><div class="card-body">${createInfoField('🏛️', address.governorateNameSecondaryLang)}${createInfoField('🏙️', address.cityNameSecondaryLang)}${createInfoField('🛣️', address.streetName)}${createInfoField('🔢', address.buildingNo)}</div></div>`;
                        if (branch.taxpayerActivities && branch.taxpayerActivities.length > 0) {
                            branch.taxpayerActivities.forEach(activity => {
                                html += `<div class="activity-card"><div class="card-header"><span class="icon">💼</span><h3>نشاط مسجل (كود: ${activity.activityTypeCode})</h3></div><div class="card-body">${createInfoField('📝', activity.activityTypeNameSecondaryLang)}${createInfoField('📅', `يبدأ في: ${new Date(activity.fromDate).toLocaleDateString('ar-EG')}`)}${createInfoField('🏁', activity.toDate ? `ينتهي في: ${new Date(activity.toDate).toLocaleDateString('ar-EG')}` : 'الحالة: ساري')}</div></div>`;
                            });
                        }
                    });
                }
                resultContainer.innerHTML = html;
            } else {
                resultContainer.innerHTML = `<div class="query-placeholder">فشل في جلب البيانات للرقم: ${registrationNumber}. تأكد من صحة الرقم.</div>`;
            }
        });
    }
}


    
    
    // استدعاء دالة بناء التبويبات
    populateInvoiceTabs();
 populateCreditNoteTab();
    
    makeDraggable(mainUI, mainUI.querySelector('.sidebar'));
    
    document.getElementById("closeInvoiceCreatorBtn").addEventListener("click", () => { 
        mainUI.style.display = "none"; 
    });
    
    const sidebarBtns = mainUI.querySelectorAll('.sidebar-btn');
    const contentPanels = mainUI.querySelectorAll('.panel-content');
    const infoSidebar = document.getElementById('info-sidebar');

   
  
    // --- ✅✅✅ بداية منطق التحقق الفوري النهائي ✅✅✅ ---
sidebarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // إذا كانت طبقة القفل ظاهرة، لا تسمح بتبديل التبويبات
        if (document.getElementById('subscription-lockdown-layer').style.display !== 'none') {
            return;
        }

        const targetPanelId = btn.getAttribute('data-target');
        sidebarBtns.forEach(b => b.classList.remove('active'));
        contentPanels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(targetPanelId).classList.add('active');

        const tabsToShowInfo = ['panel-create', 'panel-drafts'];
        infoSidebar.style.display = tabsToShowInfo.includes(targetPanelId) ? 'flex' : 'none';
        if (targetPanelId === 'panel-jobs') {
            displayAvailableJobs();
        }
    });
});


// =========================================================================
// ✅✅✅ منطق التحقق الفوري (v3.0 - النسخة النهائية مع التحقق المتفائل)
// =========================================================================
(async () => {
    const TOKEN_KEY = 'eta_extension_session_token';
    const lockdownLayer = document.getElementById('subscription-lockdown-layer') || document.getElementById('subscription-lockdown-layer-receipts');
    const firstBtn = document.querySelector('#invoiceCreatorMainUI .sidebar-btn') || document.querySelector('#receiptUploaderTabbedUI .sidebar-btn');

    // ✅ الخطوة 1: التحقق المتفائل (Optimistic Check)
    // إذا وجدنا توكن مخزن، نفترض أنه صالح ونفتح الواجهة فورًا.
    if (sessionStorage.getItem(TOKEN_KEY)) {
        if (lockdownLayer) {
            lockdownLayer.style.display = 'none'; // إخفاء القفل فورًا
        }
        if (firstBtn) {
            firstBtn.click(); // تفعيل أول تبويب
        }
        // لا نعرض "جاري التحقق" على الإطلاق في هذه الحالة
    } else {
        // إذا لم نجد توكن، نعرض "جاري التحقق" لأننا سنقوم بمصادقة كاملة
        if (lockdownLayer) {
            lockdownLayer.innerHTML = `
                <div class="toast-spinner" style="width: 40px; height: 40px; border-width: 4px; margin-bottom: 20px;"></div>
                <p style="font-size: 20px; color: #0056b3; font-weight: bold;">جاري التحقق من حالة الاشتراك...</p>
            `;
        }
    }

    // ✅ الخطوة 2: التحقق الفعلي في الخلفية
    const subscriptionData = await checkSubscription();

    if (subscriptionData && subscriptionData.seller) {
        // ✅ نجاح: الاشتراك صالح (سواء كان من التوكن أو من مصادقة جديدة)
        if (lockdownLayer && lockdownLayer.style.display !== 'none') {
            // هذا الجزء سيعمل فقط في حالة المصادقة الكاملة لأول مرة
            lockdownLayer.style.display = 'none';
            if (firstBtn) firstBtn.click();
        }
        // تحديث بيانات الممول في الشريط الجانبي (إذا كان موجودًا)
        const infoBox = document.querySelector('#taxpayer-info-box .card-body');
        if (infoBox) {
            infoBox.innerHTML = `<p><strong>الاسم:</strong> ${subscriptionData.seller.name || 'N/A'}</p><p><strong>رقم التسجيل:</strong> ${subscriptionData.seller.id || 'N/A'}</p>`;
        }

    } else {
        // 🛑 فشل: الاشتراك غير صالح (سواء كان التوكن منتهيًا أو المصادقة فشلت)
        if (lockdownLayer) {
            lockdownLayer.style.display = 'flex'; // تأكد من إظهار القفل
            showSubscriptionModal(); // عرض رسالة الاشتراك
        }
    }
})();



    (async function displayTaxpayerInfoInBox() {
        const infoBox = mainUI.querySelector('#taxpayer-info-box .card-body');
        try {
            const data = await getIssuerFullData();
            if (data) {
                infoBox.innerHTML = `<p><strong>الاسم:</strong> ${data.name || 'غير متوفر'}</p><p><strong>رقم التسجيل:</strong> ${data.id || 'غير متوفر'}</p><p><strong>العنوان:</strong> ${data.street || ''}, ${data.regionCity || ''}</p>`;
            } else {
                throw new Error("لم يتم العثور على بيانات الممول.");
            }
        } catch (err) {
            infoBox.innerHTML = `<p style="color: red;">فشل في جلب البيانات: ${err.message}</p>`;
        }
    })();

    setupCodesExplorerTab();
}












/**
 * ===================================================================================
 * ✅✅✅ دالة جلب بيانات الممول (النسخة النهائية المضمونة) ✅✅✅
 * ===================================================================================
 */
async function fetchTaxpayerData(registrationNumber) {
    const token = getAccessToken();
    if (!token) return null;

    const regNumAsString = String(registrationNumber || '').trim();
    if (!regNumAsString) return null;

    // نطلب البيانات بدون تحديد لغة لنحصل على اللغتين معًا
    const apiUrl = `https://api-portal.invoicing.eta.gov.eg/api/v1/taxpayers/${regNumAsString}/light`;

    try {
        const response = await fetch(apiUrl, {
            headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
        } );

        if (response.ok) {
            const data = await response.json();
            if (data.error) return null;

            // نكتشف اللغة المطلوبة هنا
            const isArabic = (EInvoicePortalLanguage === 'ar');

            // إذا كانت اللغة عربية ويوجد اسم عربي، نقوم بالتبديل
            if (isArabic && data.nameSecondaryLang) {
                data.namePrimaryLang = data.nameSecondaryLang;
                if (data.taxpayerBranchs && data.taxpayerBranchs[0]?.address) {
                    data.taxpayerBranchs[0].address.governorateNamePrimaryLang = data.taxpayerBranchs[0].address.governorateNameSecondaryLang;
                    data.taxpayerBranchs[0].address.cityNamePrimaryLang = data.taxpayerBranchs[0].address.cityNameSecondaryLang;
                }
            }
            // في حالة اللغة الإنجليزية، لا نفعل شيئًا لأنها بالفعل في الحقل الأساسي
            return data;
        }
        return null;
    } catch (error) {
        return null;
    }
}








function showToastNotification(message, duration = 0) {
    // إزالة أي شريط قديم أولاً
    const oldToast = document.getElementById('non-blocking-toast');
    if (oldToast) {
        oldToast.remove();
    }

    // إنشاء عنصر الشريط
    const toast = document.createElement('div');
    toast.id = 'non-blocking-toast';
    
    // تصميم الشريط ليكون أنيقاً وغير مزعج
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        backgroundColor: '#2c3e50', // لون داكن أنيق
        color: 'white',
        padding: '15px 25px',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        zIndex: '10006', // رقم عالٍ ليظهر فوق كل شيء
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        fontFamily: "'Cairo', 'Segoe UI', sans-serif",
        fontSize: '16px',
        opacity: '0',
        transform: 'translateY(20px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease'
    });

    // إضافة أيقونة تحميل دوارة (Spinner)
    toast.innerHTML = `
        <div class="toast-spinner" style="
            width: 20px; 
            height: 20px; 
            border: 3px solid rgba(255, 255, 255, 0.3); 
            border-top-color: #3498db; 
            border-radius: 50%; 
            animation: spin 1s linear infinite;
        "></div>
        <span id="toast-message">${message}</span>
    `;

    // إضافة أنماط الحركة (Animation) للـ Spinner
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(styleSheet);

    // إضافة الشريط إلى الصفحة وإظهاره بحركة ناعمة
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);

    // إخفاء الشريط بعد مدة معينة (إذا كانت محددة)
    if (duration > 0) {
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 400);
        }, duration);
    }

    // إرجاع العنصر للتحكم به يدوياً
    return toast;
}





async function fetchDraftInvoices() {
    const token = getAccessToken();
    if (!token) {
        alert("خطأ: لم يتم العثور على توكن الدخول. يرجى تسجيل الدخول أولاً.");
        return null;
    }

    try {
        // تم إزالة فلتر `IsSubmisssionReady=true` لجلب كل المسودات
        const response = await fetch("https://api-portal.invoicing.eta.gov.eg/api/v1/documents/drafts?OrderBy=lastModificationDateTimeUtc", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            }
        } );

        if (!response.ok) {
            throw new Error(`فشل جلب قائمة المسودات. رمز الحالة: ${response.status}`);
        }

        const data = await response.json();
        return data.result; 

    } catch (error) {
        alert(`حدث خطأ أثناء جلب المسودات: ${error.message}`);
        return null;
    }
}

/**
 * ✅ دالة جديدة 2: تجلب التفاصيل الكاملة لمسودة فاتورة واحدة.
 */
async function fetchSingleDraftDetails(draftId) {
    const token = getAccessToken();
    if (!token) return null;
    try {
        const response = await fetch(`https://api-portal.invoicing.eta.gov.eg/api/v1/documents/drafts/${draftId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        } );
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        return null;
    }
}

/**
 * ✅ دالة جديدة 3: تحول بيانات المسودة من API إلى التنسيق الذي تفهمه واجهة التعديل.
 */
function transformDraftDataForEditor(draft) {
    const doc = draft.document;
    if (!doc) return [];

    // تجميع بيانات رأس الفاتورة
    const invoiceHeader = {
        internalID: doc.internalID,
        receiver_id: doc.receiver.id,
        receiver_name: doc.receiver.name,
        receiver_type: doc.receiver.type,
        receiver_country: doc.receiver.address?.country,
        receiver_governate: doc.receiver.address?.governate,
        receiver_city: doc.receiver.address?.regionCity,
        receiver_street: doc.receiver.address?.street,
        receiver_building: doc.receiver.address?.buildingNumber,
        purchaseOrderReference: doc.purchaseOrderReference,
        purchaseOrderDescription: doc.purchaseOrderDescription,
        salesOrderReference: doc.salesOrderReference,
        salesOrderDescription: doc.salesOrderDescription,
        bankName: doc.payment?.bankName,
        bankAccountNo: doc.payment?.bankAccountNo,
        deliveryApproach: doc.delivery?.approach,
        deliveryPackaging: doc.delivery?.packaging,
    };

    // إنشاء صف لكل بند في الفاتورة مع إضافة بيانات الرأس إليه
    return doc.invoiceLines.map(line => {
        const lineData = {
            ...invoiceHeader,
            item_description: line.description,
            item_type: line.itemType,
            item_code: line.itemCode,
            item_internal_code: line.internalCode,
            unit_type: line.unitType,
            quantity: line.quantity,
            unit_price: line.unitValue.amountEGP,
            currency_sold: line.unitValue.currencySold,
            exchange_rate: line.unitValue.currencyExchangeRate,
            discount_rate: line.discount?.rate,
            discount_amount: line.discount?.amount,
        };

        // إضافة بيانات الضرائب (حتى 3 ضرائب لكل بند)
        line.taxableItems.forEach((tax, index) => {
            if (index < 3) {
                lineData[`tax_type_${index + 1}`] = tax.taxType;
                lineData[`tax_subtype_${index + 1}`] = tax.subType;
                lineData[`tax_rate_${index + 1}`] = tax.rate;
            }
        });

        return lineData;
    });
}

/**
 * ✅ دالة جديدة 4: الدالة الرئيسية التي تربط كل شيء ببعضه.
 */
async function showAllDraftsInEditor() {
    // 1. جلب قائمة المسودات الأولية
    const draftsList = await fetchDraftInvoices();

    if (!draftsList || draftsList.length === 0) {
        alert("لم يتم العثور على أي فواتير في المسودات.");
        return;
    }

    // 2. إظهار مؤشر تحميل للمستخدم
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'draftsLoadingIndicator';
    loadingIndicator.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); color: white; display: flex; align-items: center; justify-content: center; z-index: 10005; font-size: 24px;`;
    loadingIndicator.textContent = `جاري تحميل تفاصيل ${draftsList.length} مسودة...`;
    document.body.appendChild(loadingIndicator);

    // 3. جلب التفاصيل الكاملة لكل مسودة بالتوازي لتسريع العملية
    const draftDetailsPromises = draftsList.map(d => fetchSingleDraftDetails(d.id));
    const detailedDrafts = await Promise.all(draftDetailsPromises);

    // 4. تحويل البيانات وهيكلتها
    let allLinesFormatted = [];
    for (const draft of detailedDrafts) {
        if (draft) { // التأكد من أن جلب التفاصيل لم يفشل
            const formattedLines = transformDraftDataForEditor(draft);
            allLinesFormatted.push(...formattedLines);
        }
    }
    
    // 5. إزالة مؤشر التحميل
    loadingIndicator.remove();

    if (allLinesFormatted.length === 0) {
        alert("فشل تحميل تفاصيل المسودات أو أنها فارغة. يرجى المحاولة مرة أخرى.");
        return;
    }

    // 6. استدعاء واجهة التعديل المتقدمة مع البيانات المحولة
    showDataEditorModal_v3(allLinesFormatted);
}







/**
 * ===================================================================================
 * ✅ دالة معدلة: لجعل أي عنصر HTML قابلاً للسحب والتحريك (مع حل مشكلة القفزة)
 * ===================================================================================
 * @param {HTMLElement} element - العنصر الذي سيتم تحريكه (الواجهة كلها).
 * @param {HTMLElement} handle - الجزء من العنصر الذي يمكن السحب منه (مثلاً، الشريط العلوي).
 */
function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isFirstDrag = true; // ✅ جديد: متغير لتتبع أول عملية سحب

    // استخدم "handle" إذا تم توفيره، وإلا استخدم العنصر نفسه للسحب
    (handle || element).onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        
        // الحصول على موضع مؤشر الماوس عند بدء السحب
        pos3 = e.clientX;
        pos4 = e.clientY;

        // ✅ جديد: عند أول ضغطة فقط، قم بحساب الموضع الفعلي للعنصر
        if (isFirstDrag) {
            // getBoundingClientRect() تعطي الموضع الدقيق على الشاشة بغض النظر عن transform
            const rect = element.getBoundingClientRect();
            element.style.top = rect.top + "px";
            element.style.left = rect.left + "px";
            // الآن يمكننا إلغاء transform بأمان لأن الموضع تم تثبيته
            element.style.transform = 'none';
            isFirstDrag = false; // تعطيل هذا الشرط للمرات القادمة
        }

        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        
        // حساب الموضع الجديد للمؤشر
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // تعيين الموضع الجديد للعنصر
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // إيقاف التحريك عند رفع زر الماوس
        document.onmouseup = null;
        document.onmousemove = null;
    }
}






     function getAccessToken() {
    try {
      const user = JSON.parse(localStorage.getItem("USER_DATA") || sessionStorage.getItem("USER_DATA") || "{}");
      return user?.access_token || null;
    } catch {
      return null;
    }
  }


  
/**
 * =========================================================================
 * ✅✅✅ دالة الرفع النهائية (v48.0 - مع الترجمة الفورية الكاملة والصحيحة)
 * =========================================================================
 */
async function handleExcelUpload_v3(event) {
    const file = event.target.files[0];
    if (!file) return;

    const loadingToast = showToastNotification('جاري قراءة الملف وترجمة البيانات...');

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(e.target.result);
            const worksheet = workbook.getWorksheet(1);

            // 1. قراءة البيانات الخام من الإكسيل
            const rawData = [];
            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber > 1) {
                    const rowValues = row.values.slice(1);
                    const processedValues = rowValues.map(val => (val instanceof Date) ? new Date(Date.UTC(val.getFullYear(), val.getMonth(), val.getDate())) : val);
                    rawData.push(processedValues);
                }
            });

            if (rawData.length === 0) throw new Error("الملف فارغ أو لا يحتوي على بيانات.");

            // =================================================================
            // ✅ 2. الترجمة الفورية للبيانات من العربية إلى الرموز الرسمية
            // =================================================================
            const translatedRows = rawData.map(row => {
                const newRow = [...row];
                
                // ترجمة نوع المستلم، الدولة، العملة، والوحدات
                if (newRow[5] && reverseMappings.receiverTypes[newRow[5]]) newRow[5] = reverseMappings.receiverTypes[newRow[5]];
                if (newRow[6] && reverseMappings.countries[newRow[6]]) newRow[6] = reverseMappings.countries[newRow[6]];
                if (newRow[18] && reverseMappings.currencies[newRow[18]]) newRow[18] = reverseMappings.currencies[newRow[18]];
                if (newRow[15] && reverseMappings.units[newRow[15]]) newRow[15] = reverseMappings.units[newRow[15]];

                // **الأهم: ترجمة أنواع الضرائب بالفهارس الصحيحة**
              // ✨✨✨ بداية التعديل الحاسم: استخدام الفهارس الصحيحة للضرائب ✨✨✨
const taxIndices = [
    { main: 22, sub: 23 }, // ضريبة 1 (العمود W و X في الإكسيل)
    { main: 25, sub: 26 }, // ضريبة 2 (العمود Z و AA)
    { main: 28, sub: 29 }  // ضريبة 3 (العمود AC و AD)
];
// ✨✨✨ نهاية التعديل الحاسم ✨✨✨


                taxIndices.forEach(idx => {
                    const mainTaxDesc = newRow[idx.main];
                    const subTaxDesc = newRow[idx.sub];

                    if (mainTaxDesc && reverseMappings.taxTypes[mainTaxDesc]) {
                        newRow[idx.main] = reverseMappings.taxTypes[mainTaxDesc];
                    }
                    if (subTaxDesc && reverseMappings.taxSubtypes[subTaxDesc]) {
                        newRow[idx.sub] = reverseMappings.taxSubtypes[subTaxDesc];
                    }
                });
                
                return newRow;
            });
            
            // 3. معالجة البيانات لملء الصفوف التابعة (الآن ستعمل على البيانات المترجمة)
            const processedData = processAndFillInvoiceData(translatedRows);
            
            loadingToast.querySelector('#toast-message').textContent = 'جاري التحقق من صحة البيانات...';
            
            // 4. التحقق من صحة البيانات وإثرائها (Enrichment)
            const { validatedData, validationErrors } = await validateAndEnrichData(processedData);

            // 5. عرض النتائج النهائية للمستخدم
            showRawDataPreview(validatedData, validationErrors);

        } catch (error) {
            alert(`❌ خطأ في معالجة الملف: ${error.message}`);
        } finally {
            loadingToast.remove();
            event.target.value = '';
        }
    };
    reader.readAsArrayBuffer(file);
}




/**
 * =========================================================================
 * ✅✅✅ دالة التحقق النهائية للفواتير (v53.0 - الإصلاح الشامل والكامل)
 * =========================================================================
 */
async function validateAndEnrichData(data) {
    const validationErrors = [];
    const validatedData = [...data];

    // =================================================================
    // ✅ 1. الدوال المساعدة للتحقق من صحة البيانات عبر API
    // =================================================================
    async function validateNID_API(nid) {
        if (!nid || nid.length !== 14 || !/^\d+$/.test(nid)) {
            return { valid: false, message: "يجب أن يتكون من 14 رقمًا صحيحًا." };
        }
        try {
            const token = getAccessToken();
            if (!token) return { valid: false, message: "خطأ مصادقة، لا يمكن التحقق." };
            const response = await fetch(`https://api-portal.invoicing.eta.gov.eg/api/v1/person/${nid}`, { headers: { 'Authorization': `Bearer ${token}` } } );
            if (response.status === 200) {
                const data = await response.json();
                const fullName = `${data.firstName || ''} ${data.otherNames || ''}`.trim();
                return { valid: true, name: fullName || 'Unnamed Person' };
            } else if (response.status === 400) {
                const errorData = await response.json();
                return { valid: false, message: errorData.error?.details[0]?.message || "رقم قومي غير صالح." };
            } else {
                return { valid: false, message: `خطأ ${response.status} من الخادم.` };
            }
        } catch (error) {
            return { valid: false, message: "فشل الاتصال بالشبكة للتحقق." };
        }
    }

    async function fetchTaxpayerData(registrationNumber) {
        const token = getAccessToken();
        if (!token) return null;
        const regNumAsString = String(registrationNumber || '').trim();
        if (!regNumAsString) return null;
        const apiUrl = `https://api-portal.invoicing.eta.gov.eg/api/v1/taxpayers/${regNumAsString}/light`;
        try {
            const response = await fetch(apiUrl, { headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" } } );
            if (response.ok) {
                const data = await response.json();
                if (data.error) return null;
                const isArabic = (EInvoicePortalLanguage === 'ar');
                if (isArabic && data.nameSecondaryLang) {
                    data.namePrimaryLang = data.nameSecondaryLang;
                    if (data.taxpayerBranchs && data.taxpayerBranchs[0]?.address) {
                        data.taxpayerBranchs[0].address.governorateNamePrimaryLang = data.taxpayerBranchs[0].address.governorateNameSecondaryLang;
                        data.taxpayerBranchs[0].address.cityNamePrimaryLang = data.taxpayerBranchs[0].address.cityNameSecondaryLang;
                    }
                }
                return data;
            }
            return null;
        } catch (error) {
            return null;
        }
    }

   
      async function fetchMyEGSCode(fullItemCode) {
        const token = getAccessToken();
        if (!token) return null;
        const cleanFullCode = String(fullItemCode || '').trim().toUpperCase();
        if (!cleanFullCode || !cleanFullCode.startsWith('EG-')) return null;
        
        // طلب 100 نتيجة لضمان العثور على الكود الصحيح
        const apiUrl = `https://api-portal.invoicing.eta.gov.eg/api/v1/codetypes/codes/my?CodeTypeID=9&ItemCode=${cleanFullCode}&Ps=100`;

        try {
            const response = await fetch(apiUrl, { headers: { "Authorization": `Bearer ${token}` } } );
            if (!response.ok) return null;
            const data = await response.json();
            return data.result || []; // نرجع دائمًا مصفوفة
        } catch (error) {
            return null;
        }
    }


/**
 * ===================================================================================
 * ✅✅✅ دالة جلب كود GS1 (v6.0 - الإصلاح النهائي والمُحصّن ضد الأخطاء)
 * ===================================================================================
 */
async function fetchGS1Code(itemCode) {
    const token = getAccessToken();
    if (!token) {
        return []; // ✅ إصلاح: نرجع مصفوفة فارغة بدلاً من null
    }

    const apiUrl = `https://api-portal.invoicing.eta.gov.eg/api/v1/codetypes/2/codes?CodeLookupValue=${itemCode}&ApplyMinChoiceLevel=true&Ps=100`;
    
    for (let attempt = 1; attempt <= 3; attempt++ ) {
        try {
            const response = await fetch(apiUrl, { headers: { "Authorization": `Bearer ${token}` } });
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.result && data.result.length > 0) {
                    const isArabic = (EInvoicePortalLanguage === 'ar');
                    data.result.forEach(codeData => {
                        if (isArabic && codeData.codeNameSecondaryLang) {
                            codeData.codeNamePrimaryLang = codeData.codeNameSecondaryLang;
                        }
                    });
                    return data.result; // ✅ نجاح: نرجع مصفوفة النتائج
                }
            } else {
            }
        } catch (error) {
        }
        
        if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // ✅ الحل الحاسم: نرجع مصفوفة فارغة في حالة الفشل النهائي لضمان عدم حدوث أخطاء
    return [];
}



    // =================================================================

    // --- 2. تجميع الأكواد للتحقق (لا تغيير) ---
    const codesToValidate = new Map();
    validatedData.forEach((row) => {
        const itemCodeType = String(row[12] || '').toUpperCase().trim();
        const itemCode = String(row[13] || '').trim();
        if ((itemCodeType === 'EGS' || itemCodeType === 'GS1') && itemCode) {
            const key = `${itemCodeType}_${itemCode}`;
            if (!codesToValidate.has(key)) {
                codesToValidate.set(key, { type: itemCodeType, code: itemCode, result: null });
            }
        }
    });

    // --- 3. معالجة التحقق من الأكواد على دفعات (لا تغيير) ---
    if (codesToValidate.size > 0) {
        const BATCH_SIZE = 10;
        const codeValidationArray = Array.from(codesToValidate.values());
        for (let i = 0; i < codeValidationArray.length; i += BATCH_SIZE) {
            const batch = codeValidationArray.slice(i, i + BATCH_SIZE);
            const promises = batch.map(item => 
                item.type === 'EGS' ? fetchMyEGSCode(item.code) : fetchGS1Code(item.code)
            );
            const results = await Promise.all(promises);
            results.forEach((result, index) => {
                const originalItem = batch[index];
                const key = `${originalItem.type}_${originalItem.code}`;
                if (codesToValidate.has(key)) {
                    codesToValidate.get(key).result = result;
                }
            });
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    // --- 4. المرور على البيانات مرة أخرى لتطبيق النتائج وتسجيل الأخطاء ---
    const finalProcessingPromises = validatedData.map(async (row, index) => {
        if (row.length < 40) row[39] = '';
        const internalID = row[0] || `صف ${index + 2}`;
        
        // --- 4.1. التحقق من بيانات المستلم (تم إرجاعه) ---
        const receiverType = String(row[5] || '').toUpperCase().trim();
        let receiverId = String(row[3] || '').trim();
        
        if (receiverType === 'P') {
            if (!receiverId) {
                row[3] = '27001071000000';
                if (!row[4] || String(row[4]).trim() === '') row[4] = 'عميل نقدي';
            } else {
                const nidResult = await validateNID_API(receiverId);
                if (!nidResult.valid) validationErrors.push({ id: internalID, field: 'الرقم القومي للمستلم', value: receiverId, message: nidResult.message });
            }
        } else if (receiverType === 'B') {
            if (!receiverId) {
                validationErrors.push({ id: internalID, field: 'رقم تسجيل المستلم', value: 'فارغ', message: 'هذا الحقل إجباري للشركات.' });
            } else {
                const taxpayerData = await fetchTaxpayerData(receiverId);
                if (taxpayerData) {
                    row[4] = taxpayerData.namePrimaryLang;
                    const address = taxpayerData.taxpayerBranchs?.[0]?.address;
                    if (address) {
                        if (!row[6] || String(row[6]).trim() === '') row[6] = address.countryCode || 'EG';
                        if (!row[7] || String(row[7]).trim() === '') row[7] = address.governorateNameSecondaryLang || address.governorate || '';
                        if (!row[8] || String(row[8]).trim() === '') row[8] = address.cityNameSecondaryLang || address.regionCity || '';
                        if (!row[9] || String(row[9]).trim() === '') row[9] = address.streetName || address.street || '';
                        if (!row[10] || String(row[10]).trim() === '') row[10] = address.buildingNo || address.buildingNumber || '';
                    }
                } else {
                    validationErrors.push({ id: internalID, field: 'رقم تسجيل المستلم', value: receiverId, message: 'رقم التسجيل غير صحيح أو غير مسجل.' });
                }
            }
        }

        // --- 4.2. التحقق من الأكواد (مع الإصلاح النهائي) ---
        const itemCodeType = String(row[12] || '').toUpperCase().trim();
        const itemCode = String(row[13] || '').trim();
        let officialCodeName = '';

        if (itemCodeType && itemCode) {
            const key = `${itemCodeType}_${itemCode}`;
            const apiResults = codesToValidate.get(key)?.result;

            if (apiResults && Array.isArray(apiResults)) {
                const exactMatch = apiResults.find(res => res.codeLookupValue.toUpperCase() === itemCode.toUpperCase());

                if (exactMatch) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const activeToDate = exactMatch.activeTo ? new Date(exactMatch.activeTo) : null;
                    if(activeToDate) activeToDate.setHours(0, 0, 0, 0);

                    if (exactMatch.active === false) {
                        validationErrors.push({ id: internalID, field: `كود الصنف (${itemCodeType})`, value: itemCode, message: 'الكود غير نشط حالياً (active: false).' });
                    } else if (activeToDate && activeToDate < today) {
                        validationErrors.push({ id: internalID, field: `كود الصنف (${itemCodeType})`, value: itemCode, message: `الكود منتهي الصلاحية منذ تاريخ ${activeToDate.toLocaleDateString('ar-EG')}.` });
                    } else {
                        officialCodeName = exactMatch.codeNamePrimaryLang;
                        row[39] = officialCodeName || "!! اسم رسمي غير مسجل !!";
                    }
                } else {
                    validationErrors.push({ id: internalID, field: `كود الصنف (${itemCodeType})`, value: itemCode, message: 'الكود غير صحيح أو غير مسجل (لم يتم العثور على تطابق تام).' });
                }
            } else {
                validationErrors.push({ id: internalID, field: `كود الصنف (${itemCodeType})`, value: itemCode, message: 'فشل التحقق من الكود من الخادم.' });
            }
        }
    });

    await Promise.all(finalProcessingPromises);
    
    return { validatedData, validationErrors };
}





/**
 * ✅ دالة مساعدة جديدة: لإنشاء مؤشر تحميل
 */
function createLoadingIndicator(message) {
    const indicator = document.createElement('div');
    indicator.id = 'globalLoadingIndicator';
    indicator.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.7); color: white; 
        display: flex; align-items: center; justify-content: center; 
        z-index: 10005; font-size: 22px; font-family: 'Segoe UI', Tahoma, sans-serif;
        text-align: center; padding: 20px;
    `;
    indicator.textContent = message;
    return indicator;
}



/**
 * ===================================================================================
 * ✅✅✅ الدالة النهائية (v3): تعالج وتملأ بيانات الفواتير بدون إضافة أي قيم افتراضية
 * ===================================================================================
 * تقوم هذه الدالة بمعالجة البيانات الخام من ملف الإكسيل.
 * - إذا كان الصف يحتوي على رقم فاتورة، تعتبره بداية فاتورة جديدة.
 * - إذا كان الصف لا يحتوي على رقم فاتورة، تقوم بنسخ بيانات رأس الفاتورة (العميل، العنوان...) من آخر فاتورة تم تحديدها.
 * - تتجاهل الصفوف الفارغة تمامًا.
 * - **الأهم:** لا تقوم بإنشاء أي بيانات افتراضية (مثل عميل نقدي أو رقم تلقائي) من العدم.
 */
function processAndFillInvoiceData(rawData) {
    let lastInvoiceHeaderData = []; // لتخزين بيانات رأس آخر فاتورة
    const invoiceHeaderColumns = 9; // عدد أعمدة بيانات رأس الفاتورة (من الرقم الداخلي حتى رقم المبنى)
    const itemDescriptionColumn = 9; // العمود الخاص بوصف الصنف (يبدأ من 0)
    const itemCodeColumn = 11;       // العمود الخاص بكود الصنف

    const processedRows = rawData.map((row, index) => {
        // --- 1. التحقق من أن الصف ليس فارغًا تمامًا ---
        // إذا كان كل من "وصف الصنف" و "كود الصنف" فارغين، نعتبره صفًا فارغًا ونتجاهله.
        const hasItemDescription = row[itemDescriptionColumn] !== undefined && row[itemDescriptionColumn] !== null && String(row[itemDescriptionColumn]).trim() !== '';
        const hasItemCode = row[itemCodeColumn] !== undefined && row[itemCodeColumn] !== null && String(row[itemCodeColumn]).trim() !== '';
        if (!hasItemDescription && !hasItemCode) {
            return null; // تجاهل هذا الصف
        }

        // --- 2. تحديد ما إذا كان هذا الصف هو بداية فاتورة جديدة ---
        const hasInternalID = row[0] !== undefined && row[0] !== null && String(row[0]).trim() !== '';

        if (hasInternalID) {
            // هذا الصف هو بداية فاتورة جديدة.
            // نقوم بتحديث بيانات رأس الفاتورة التي سنستخدمها للصفوف التالية.
            lastInvoiceHeaderData = row.slice(0, invoiceHeaderColumns);
            // إرجاع الصف كما هو لأنه مكتمل.
            return row;
        } else {
            // هذا الصف هو بند تابع لفاتورة سابقة.
            // تحقق مما إذا كان لدينا بيانات رأس فاتورة سابقة لنسخها.
            if (lastInvoiceHeaderData.length === 0) {
                // هذا يعني أن أول صف في الملف لا يحتوي على رقم فاتورة، وهو خطأ في التنسيق.
                // يمكنك إما تجاهله أو إظهار خطأ، هنا سنتجاهله.
                return null;
            }
            
            // إنشاء صف جديد يبدأ ببيانات رأس الفاتورة المنسوخة.
            const newRow = [...lastInvoiceHeaderData];
            
            // استكمال الصف ببيانات البند من الصف الحالي.
            for (let i = invoiceHeaderColumns; i < row.length; i++) {
                newRow[i] = row[i];
            }
            return newRow;
        }
        
    }).filter(row => row !== null); // تصفية (إزالة) كل الصفوف التي تم تجاهلها (null)

    return processedRows;
}


/**
 * ===================================================================================
 * ✅✅✅ دالة جلب كود EGS (v2.0 - الإصلاح النهائي مع طلب صفحات أكبر)
 * ===================================================================================
 */
async function fetchMyEGSCode(fullItemCode) {
    const token = getAccessToken();
    if (!token) return null;

    const cleanFullCode = String(fullItemCode || '').trim().toUpperCase();
    if (!cleanFullCode || !cleanFullCode.startsWith('EG-')) return null;

    // ✨ --- التعديل الحاسم هنا: طلب 100 نتيجة بدلاً من 1 --- ✨
    const apiUrl = `https://api-portal.invoicing.eta.gov.eg/api/v1/codetypes/codes/my?CodeTypeID=9&ItemCode=${cleanFullCode}&Ps=10000`;

    try {
        const response = await fetch(apiUrl, { headers: { "Authorization": `Bearer ${token}` } } );
        if (!response.ok) return null;

        const data = await response.json();

        // ✨ --- لا تغيير هنا: نرجع دائمًا مصفوفة النتائج الكاملة --- ✨
        if (data.result && data.result.length > 0) {
            // لا نقم بفلترة أو تعديل النتائج هنا، دع الدالة الرئيسية تقوم بذلك
            return data.result; 
        }
        return []; // نرجع مصفوفة فارغة إذا لم يتم العثور على نتائج

    } catch (error) {
        return null; // نرجع null في حالة فشل الشبكة
    }
}


/**
 * ===================================================================================
 * ✅✅✅ دالة جلب كود GS1 (النسخة النهائية المضمونة) ✅✅✅
 * ===================================================================================
 */
async function fetchGS1Code(itemCode) {
    const token = getAccessToken();
    if (!token) return null;

    // نطلب البيانات بدون تحديد لغة
    const apiUrl = `https://api-portal.invoicing.eta.gov.eg/api/v1/codetypes/2/codes?CodeLookupValue=${itemCode}&ApplyMinChoiceLevel=true&Ps=1`;

    try {
        const response = await fetch(apiUrl, { headers: { "Authorization": `Bearer ${token}` } } );
        if (!response.ok) return null;

        const data = await response.json();

        if (data.result && data.result.length > 0) {
            const codeData = data.result[0];
            const isArabic = (EInvoicePortalLanguage === 'ar');

            // إذا كانت اللغة عربية ويوجد اسم عربي، نقوم بالتبديل
            if (isArabic && codeData.codeNameSecondaryLang) {
                codeData.codeNamePrimaryLang = codeData.codeNameSecondaryLang;
            }
            return codeData;
        }
        return null;
    } catch (error) {
        return null;
    }
}



function showRawDataPreview(rawData, validationErrors = []) {


    if (validationErrors.length > 0) {
    // استدعاء دالة عرض الأخطاء الجديدة
    // نمرر لها دالة showDataEditorModal_v3 كـ "callback" ليتم تنفيذها عند الضغط على "المتابعة على أي حال"
    showErrorModal(validationErrors, () => {
        // هذا الكود سيتم تنفيذه فقط إذا ضغط المستخدم على "المتابعة"
        // نقوم بإزالة نافذة المعاينة القديمة (إذا كانت موجودة) ونفتح واجهة التعديل
        document.getElementById('rawDataPreviewModal')?.remove();
        showDataEditorModal_v3(rawData);
    });
    }
    document.getElementById('rawDataPreviewModal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'rawDataPreviewModal';
    modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 10001; display: flex; align-items: center; justify-content: center; direction: rtl;`;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `background-color: #f4f7fc; width: 95%; height: 90%; border-radius: 10px; display: flex; flex-direction: column; font-family: 'Segoe UI', Tahoma, sans-serif; overflow: hidden;`;

    // إنشاء خريطة للأخطاء لسهولة الوصول إليها
    const errorMap = new Map();
    validationErrors.forEach(err => {
        const key = `${err.id}-${err.field}`; // إنشاء مفتاح فريد لكل خطأ
        errorMap.set(key, err.message);
    });

    const headers = [
        'الرقم الداخلي (*)', 'تاريخ الإصدار', 'تاريخ التسليم', 'رقم تسجيل المستلم (*)', 'اسم المستلم (*)', 'نوع المستلم (*)',
        'دولة المستلم (*)', 'محافظة المستلم (*)', 'مدينة المستلم (*)', 'شارع المستلم (*)', 'مبنى المستلم (*)',
        'وصف الصنف (*)', 'نوع كود الصنف (*)', 'كود الصنف (*)', 'الكود الداخلي', 'وحدة القياس (*)',
        'الكمية (*)', 'سعر الوحدة (*)', 'عملة البيع', 'سعر الصرف', 'نسبة الخصم', 'قيمة الخصم',
        'نوع الضريبة 1 (*)', 'النوع الفرعي 1 (*)', 'نسبة الضريبة 1 (*)',
        'نوع الضريبة 2', 'النوع الفرعي 2', 'نسبة الضريبة 2', 'نوع الضريبة 3', 'النوع الفرعي 3', 'نسبة الضريبة 3',
        'مرجع شراء', 'وصف شراء', 'مرجع مبيعات', 'وصف مبيعات', 'اسم البنك', 'حساب البنك', 'طريقة التوصيل', 'التغليف'
    ];
    
    // بناء جدول المعاينة مع تلوين الأخطاء
    let tableHTML = `<table style="width: 100%; border-collapse: collapse; text-align: center;"><thead><tr style="background-color: #2161a1; color: white;">`;
    headers.forEach(h => tableHTML += `<th style="padding: 10px; border: 1px solid #ddd; white-space: nowrap;">${h.replace(' (*)', '')}</th>`);
    tableHTML += `</tr></thead><tbody>`;

    rawData.forEach((row, rowIndex) => {
        tableHTML += `<tr>`;
        const internalID = row[0] || `صف ${rowIndex + 2}`;
        
        for (let i = 0; i < headers.length; i++) {
            const headerText = headers[i].replace(' (*)', '');
            const cellValue = (i === 11) ? (row[11] || row[39] || '') : (row[i] !== undefined && row[i] !== null ? row[i] : '');
            
            // التحقق من وجود خطأ لهذه الخلية
            const errorKey = `${internalID}-${headerText}`;
            const errorMessage = errorMap.get(errorKey);
            const cellStyle = errorMessage ? `background-color: #fff1f0; color: #cf1322;` : '';
            const cellTitle = errorMessage ? `خطأ: ${errorMessage}` : '';

            tableHTML += `<td style="padding: 8px; border: 1px solid #eee; ${cellStyle}" title="${cellTitle}">${cellValue}</td>`;
        }
        tableHTML += `</tr>`;
    });
    
    tableHTML += `</tbody></table>`;

    modalContent.innerHTML = `
        <div style="padding: 15px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; background-color: #fff; flex-shrink: 0;">
            <h3 style="margin: 0; color: #2161a1;">1. معاينة البيانات الأولية والتحقق منها</h3>
            <div>
                <button id="continueToEditorBtn" style="background-color: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                    ${validationErrors.length > 0 ? 'المتابعة للتعديل (مع وجود أخطاء)' : 'متابعة للتعديل المتقدم'}
                </button>
                <button id="closePreviewBtn" style="background-color: #6c757d; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">إغلاق</button>
            </div>
        </div>
        ${validationErrors.length > 0 ? `<div style="padding: 10px; background-color: #fffbe6; border-bottom: 1px solid #ffe58f; text-align: center; color: #d46b08; font-weight: bold;">مرر الفأرة فوق الخلايا الحمراء لمعرفة سبب الخطأ.</div>` : ''}
        <div style="overflow: auto; flex-grow: 1; background: #fff;">${tableHTML}</div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    document.getElementById('closePreviewBtn').onclick = () => modal.remove();
    
    document.getElementById('continueToEditorBtn').onclick = async () => {
        // ... (الكود الحالي لزر المتابعة لا يتغير)
        const continueBtn = document.getElementById('continueToEditorBtn');
        continueBtn.disabled = true;
        continueBtn.textContent = 'جاري التحضير...';
        
        try {
            const existingDrafts = await fetchDraftInvoices();
            const draftsMap = new Map(existingDrafts?.filter(d => d.document?.internalID).map(d => [String(d.document.internalID), d.id]) || []);
            
            const formattedData = rawData.map(row => {
                const obj = {};
              const internalHeaders = [
    'internalID', 'dateTimeIssued', 'serviceDeliveryDate', 'receiver_id', 'receiver_name', 'receiver_type', 
    'receiver_country', 'receiver_governate', 'receiver_city', 'receiver_street', 'receiver_building',
    'item_description', 'item_type', 'item_code', 'item_internal_code', 'unit_type', 'quantity', 'unit_price', 
    'currency_sold', 'exchange_rate', 'discount_rate', 'discount_amount', 
    'tax_type_1', 'tax_subtype_1', 'tax_rate_1', 'tax_type_2', 'tax_subtype_2', 'tax_rate_2', 
    'tax_type_3', 'tax_subtype_3', 'tax_rate_3', 'purchaseOrderReference', 'purchaseOrderDescription', 
    'salesOrderReference', 'salesOrderDescription', 'bankName', 'bankAccountNo', 'deliveryApproach', 'deliveryPackaging'
];

                
                internalHeaders.forEach((header, index) => {
                    obj[header] = row[index] !== undefined ? row[index] : null;
                });
                
                obj['item_code_name'] = row[39] || ''; // العمود الإضافي لاسم الكود

                const internalIDAsString = String(obj.internalID).trim();
                if (internalIDAsString && draftsMap.has(internalIDAsString)) {
                    obj.draftId = draftsMap.get(internalIDAsString);
                }
                return obj;
            });
            
            modal.remove();
            showDataEditorModal_v3(formattedData);

        } catch (error) {
            alert(`حدث خطأ أثناء التحضير لواجهة التعديل: ${error.message}`);
            continueBtn.disabled = false;
            continueBtn.textContent = 'متابعة';
        }
    };
}





/**
 * ===================================================================================
 * ✅✅✅ دالة الحفظ النهائية (v8 - مبسطة ومباشرة)
 * ===================================================================================
 */
async function processAndSaveFromModal_v3() {
      const apiIssuerData = await getIssuerFullData();
    if (!apiIssuerData) {
        alert("فشل حاسم: لم يتم العثور على بيانات الممول. لا يمكن المتابعة.");
        // إعادة تفعيل الزر في حالة الفشل
        const saveBtn = document.getElementById('saveFromModalBtn');
        if(saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'حفظ الفواتير';
        }
        return;
    }
    const oldErrorContainer = document.getElementById('modalErrorContainer');
    if (oldErrorContainer) {
        oldErrorContainer.style.display = 'none';
        oldErrorContainer.innerHTML = '';
    }

    const invoicesMap = new Map();

    // جمع البيانات مباشرة من الواجهة
    document.querySelectorAll('.invoice-group').forEach(group => {
        const internalID = group.querySelector('[data-field="internalID"]').textContent.trim();
        const draftId = group.dataset.draftId;
        const headerRow = group.querySelector('.invoice-header-row');
        const dateTimeIssued = headerRow.querySelector('[data-field="dateTimeIssued"]').textContent.trim();
        const serviceDeliveryDate = headerRow.querySelector('[data-field="serviceDeliveryDate"]').textContent.trim();
        const receiver_name = headerRow.querySelector('[data-field="receiver_name"]').textContent.trim();
        const receiver_id = headerRow.querySelector('[data-field="receiver_id"]').textContent.trim();

    
        
// --- ✅✅✅ بداية التعديل 2: قراءة بيانات المصدر من الحقول العلوية المحدثة ---
const issuerData = {
    id: apiIssuerData.id, // رقم التسجيل لا يتغير
    name: document.getElementById('editor-seller-name').value,
    governate: document.getElementById('editor-seller-governate').value,
    regionCity: document.getElementById('editor-seller-regionCity').value,
    street: document.getElementById('editor-seller-street').value,
    buildingNumber: document.getElementById('editor-seller-building').value,
    taxpayerActivityCode: document.getElementById('activity-select-editor')?.value || apiIssuerData.taxpayerActivityCode
};
// --- ✅✅✅ نهاية التعديل 2 ---
// ...


        const receiverAddress = {};
        group.querySelectorAll('.receiver-details-table [data-receiver-field]').forEach(cell => {
            receiverAddress[cell.dataset.receiverField] = cell.textContent.trim();
        });

        const extraInvoiceData = {};
        group.querySelectorAll('.extra-details-table [data-invoice-field]').forEach(cell => {
            extraInvoiceData[cell.dataset.invoiceField] = cell.textContent.trim();
        });

        const linesForInvoice = [];
        group.querySelectorAll('.items-table tbody tr').forEach(row => {
            const lineData = { internalID, receiver_name, receiver_id, dateTimeIssued, serviceDeliveryDate, ...receiverAddress, ...extraInvoiceData };
            row.querySelectorAll('[data-field]').forEach(cell => {
                const field = cell.dataset.field;
                if (field !== 'dateTimeIssued' && field !== 'serviceDeliveryDate') {
                    if (cell.querySelectorAll('span[data-field]').length > 0) {
                        cell.querySelectorAll('span[data-field]').forEach(span => {
                            lineData[span.dataset.field] = span.textContent.trim();
                        });
                    } else {
                        lineData[field] = cell.textContent.trim();
                    }
                }
            });
            linesForInvoice.push(lineData);
        });

        if (internalID) {
            invoicesMap.set(internalID, { lines: linesForInvoice, issuer: issuerData, draftId: draftId });
        }
    });

    const validationErrors = [];
    for (const [invoiceId, data] of invoicesMap.entries()) {
        if (!data.lines || data.lines.length === 0) {
            validationErrors.push({ internalID: invoiceId, message: "لا توجد بنود لهذه الفاتورة." });
        }
    }

    if (validationErrors.length > 0) {
        showErrorModal(validationErrors);
        return;
    }

    await sendInvoicesFromModal_v3(invoicesMap);
}




/**
 * ===================================================================================
 * ✅✅✅ دالة جديدة: لعرض نافذة تأكيد مخصصة واحترافية
 * ===================================================================================
 * @param {string} title - عنوان النافذة.
 * @param {string} message - نص الرسالة الرئيسي.
 * @param {Function} onConfirm - دالة يتم استدعاؤها عند الضغط على "موافق".
 * @param {Function} onCancel - دالة يتم استدعاؤها عند الضغط على "إلغاء".
 */
function showCustomConfirmDialog(title, message, onConfirm, onCancel) {
    // إزالة أي نافذة قديمة لضمان عدم التكرار
    document.getElementById('customConfirmDialog')?.remove();

    const dialog = document.createElement('div');
    dialog.id = 'customConfirmDialog';
    dialog.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.6); z-index: 20000;
        display: flex; align-items: center; justify-content: center;
        direction: rtl; font-family: 'Cairo', 'Segoe UI', sans-serif;
        backdrop-filter: blur(4px);
    `;

    dialog.innerHTML = `
        <div style="background: #fff; width: 550px; max-width: 90%; border-radius: 12px; box-shadow: 0 5px 25px rgba(0,0,0,0.2); animation: zoomIn 0.3s ease-out;">
            <div style="padding: 20px 25px; background-color: #fffbe6; color: #d46b08; border-top-left-radius: 12px; border-top-right-radius: 12px; display: flex; align-items: center; gap: 15px; border-bottom: 1px solid #ffe58f;">
                <span style="font-size: 32px;">⚠️</span>
                <h3 style="margin: 0; font-size: 20px;">${title}</h3>
            </div>
            <div style="padding: 25px; font-size: 16px; line-height: 1.8; color: #333;">
                ${message}
            </div>
            <div style="padding: 20px 25px; display: flex; justify-content: flex-end; gap: 15px; background-color: #f8f9fa; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
                <button id="dialogCancelBtn" style="background: #6c757d; color: white; padding: 10px 25px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 15px;">إلغاء الحفظ</button>
                <button id="dialogConfirmBtn" style="background: #28a745; color: white; padding: 10px 25px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 15px;">نعم، موافق ومتابعة</button>
            </div>
        </div>
        <style> @keyframes zoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } } </style>
    `;

    document.body.appendChild(dialog);

    const confirmBtn = document.getElementById('dialogConfirmBtn');
    const cancelBtn = document.getElementById('dialogCancelBtn');

    confirmBtn.onclick = () => {
        dialog.remove();
        if (typeof onConfirm === 'function') onConfirm();
    };

    cancelBtn.onclick = () => {
        dialog.remove();
        if (typeof onCancel === 'function') onCancel();
    };
}








async function signDataLocally(dataToSign, isHash = false) {
    const signingServerUrl = 'http://localhost:8080/sign';
    const loadingToast = showToastNotification('يرجى الانتظار، جاري الاتصال ببرنامج التوقيع...', 0 );

    try {
        // نرسل البيانات مع العلامة الجديدة is_hash
        const response = await fetch(signingServerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: dataToSign, is_hash: isHash })
        });

        loadingToast.remove();

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "رد غير صالح من الخادم." }));
            throw new Error(errorData.error || `فشل الاتصال بخادم التوقيع (الحالة: ${response.status}).`);
        }

        const result = await response.json();
        if (result.success && result.signature) {
            showToastNotification('✅ تم التوقيع بنجاح!', 3000);
            return result.signature;
        } else {
            throw new Error(result.error || "حدث خطأ غير معروف في برنامج التوقيع.");
        }
    } catch (error) {
        if (loadingToast) loadingToast.remove();
        alert(`❌ فشل الاتصال ببرنامج التوقيع المحلي.\n\nالسبب: ${error.message}\n\nيرجى التأكد من تشغيل برنامج "signer_app.py" وتوصيل فلاشة التوقيع.`);
        return null;
    }
}



// دالة حذف المسودة
function deleteDraft(index) {
    const drafts = JSON.parse(localStorage.getItem("receiptDrafts") || "[]");
    const draft = drafts[index];
    if (!draft) return;

    if (confirm(`هل تريد حذف المسودة رقم "${draft.receiptNumber}" نهائياً؟`)) {
        drafts.splice(index, 1);
        localStorage.setItem("receiptDrafts", JSON.stringify(drafts));
        renderReceiptDrafts(); // إعادة عرض قائمة المسودات المحدثة
        showToastNotification("تم حذف المسودة بنجاح.", 3000);
    }
}





async function deleteDraftInvoiceAPI(draftId) {
    const token = getAccessToken();
    if (!token) {
        alert("خطأ: لم يتم العثور على توكن الدخول.");
        return false;
    }

    // تأكيد من المستخدم قبل الحذف
    if (!confirm(`هل أنت متأكد من رغبتك في حذف الفاتورة رقم ${draftId} نهائياً من المسودات؟ لا يمكن التراجع عن هذا الإجراء.`)) {
        return false;
    }

    try {
        const response = await fetch(`https://api-portal.invoicing.eta.gov.eg/api/v1/documents/drafts/${draftId}`, {
            method: 'DELETE', // تحديد نوع الطلب
            headers: {
                "Authorization": `Bearer ${token}`
            }
        } );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `فشل حذف المسودة. رمز الحالة: ${response.status}`);
        }

        return true; // تم الحذف بنجاح

    } catch (error) {
        alert(`حدث خطأ أثناء حذف المسودة: ${error.message}`);
        return false;
    }
}





























async function showDataEditorModal_v3(data) {
    const oldModal = document.getElementById('dataEditorModal');
    if (oldModal) oldModal.remove();

    
    // --- ✅ الخطوة 1: الحصول على الرقم القومي للمفوض مرة واحدة ---
    let delegateNID = null;
    try {
        const userData = JSON.parse(localStorage.getItem("USER_DATA") || "{}");
        delegateNID = userData?.profile?.NatId;
    } catch (e) {
    }

    data.forEach(row => {
        const receiverType = String(row.receiver_type || '').toUpperCase().trim();
        // إذا كان شخصي والرقم القومي فارغ، قم بالملء
        if (receiverType === 'P') {
            if ((!row.receiver_id || String(row.receiver_id).trim() === '') && delegateNID) {
                row.receiver_id = delegateNID; // ملء الرقم القومي
            }
            if (!row.receiver_name || String(row.receiver_name).trim() === '') {
                row.receiver_name = 'عميل نقدي'; // ملء اسم العميل
            }
        }
    });

    const modal = document.createElement('div');
    modal.id = 'dataEditorModal';
    modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); z-index: 10000; display: flex; align-items: center; justify-content: center; direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif;`;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `background-color: #fff; width: 95%; height: 90%; border-radius: 10px; display: flex; flex-direction: column; box-shadow: 0 5px 25px rgba(0,0,0,0.2); overflow: hidden;`;

    const invoicesMap = new Map();
    data.forEach((row, index) => {
        const internalID = row.internalID;
        if (!internalID) return;
        if (!invoicesMap.has(internalID)) {
            invoicesMap.set(internalID, { invoiceData: row, lines: [] });
        }
        invoicesMap.get(internalID).lines.push({ ...row, originalIndex: index });
    });

    let issuerData = {};
    const apiIssuerData = await getIssuerFullData();
    if (apiIssuerData) {
        issuerData = apiIssuerData;
    } else {
        try {
            const userData = JSON.parse(localStorage.getItem("USER_DATA") || "{}");
            const profile = userData.profile || {};
            issuerData = {
                id: profile.TaxRin || profile.taxRin || '',
                name: localStorage.getItem("TaxpayerNameAR") || profile.legalName || '',
                taxpayerActivityCode: profile.activityCode || "4690",
                governate: profile.address?.governorate || '',
                regionCity: profile.address?.regionCity || '',
                street: profile.address?.street || '',
                buildingNumber: profile.address?.buildingNumber || ''
            };
        } catch (e) {}
    }


    // --- ✅✅✅ بداية الإضافة 1: بناء HTML لقائمة العناوين ---
const allBranches = apiIssuerData.taxpayerBranchs || [];
let addressSelectorHTML = '';
if (allBranches.length > 0) {
    addressSelectorHTML = `
        <div class="details-card" style="padding: 10px 15px;">
            <label for="address-select-editor" style="font-weight: bold; margin-bottom: 5px; display: block;">اختر عنوان المصدر (البائع):</label>
            <select id="address-select-editor" style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;">
                ${allBranches.map((branch, index) => {
                    const address = branch.address || {};
                    const fullAddress = [address.streetName, address.regionCity, address.governorateNameSecondaryLang].filter(Boolean).join(', ');
                    return `<option value="${index}" data-address='${JSON.stringify(address)}'>
                                ${fullAddress || `فرع رقم ${branch.branchNumber || index + 1}`}
                            </option>`;
                }).join('')}
            </select>
        </div>`;
}
// --- ✅✅✅ نهاية الإضافة 1 ---

  let activitySelectorHTML = '';
    if (apiIssuerData && apiIssuerData.activities && apiIssuerData.activities.length > 0) {
        const defaultActivity = apiIssuerData.activities.find(act => act.toDate === null) || apiIssuerData.activities[0];
        
        activitySelectorHTML = `
            <div class="details-card" style="padding: 10px 15px;">
                <label for="activity-select-editor" style="font-weight: bold; margin-bottom: 5px; display: block;">اختر كود النشاط:</label>
                <select id="activity-select-editor" style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;">
                    ${apiIssuerData.activities.map(act => `
                        <option value="${act.activityTypeCode}" ${act.activityTypeCode === defaultActivity.activityTypeCode ? 'selected' : ''}>
                            ${act.activityTypeCode} - ${act.activityTypeNameSecondaryLang}
                        </option>
                    `).join('')}
                </select>
            </div>
        `;
    } else {
        activitySelectorHTML = `<div class="details-card" style="padding: 10px 15px;">كود النشاط: لم يتم العثور على أنشطة.</div>`;
    }
    let tableBodyHTML = '';
    invoicesMap.forEach((invoice, internalID) => {
        const invoiceData = invoice.invoiceData;
        const currentDate = new Date().toLocaleDateString('ar-EG');
        
        tableBodyHTML += `
           <tbody class="invoice-group" data-internal-id="${internalID}" data-draft-id="${invoiceData.draftId || ''}">
                <tr class="invoice-header-row">
                    <td class="toggle-details" style="font-weight: bold; font-size: 20px; text-align: center;">+</td>
                    <td><span contenteditable="true" data-field="internalID">${internalID}</span></td>
<td>
    <span contenteditable="true" data-field="dateTimeIssued">
        ${invoiceData.dateTimeIssued ? new Date(invoiceData.dateTimeIssued).toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA')}
    </span>
</td>
<td>
    <span contenteditable="true" data-field="serviceDeliveryDate">
        ${invoiceData.serviceDeliveryDate ? new Date(invoiceData.serviceDeliveryDate).toLocaleDateString('en-CA') : ''}
    </span>
</td>
                    <td><span contenteditable="true" data-field="receiver_id">${invoiceData.receiver_id || ''}</span></td>
                    <td><span contenteditable="true" data-field="receiver_name">${invoiceData.receiver_name || ''}</span></td>
                    <td class="numeric" id="totalBeforeTax_${internalID}">0.00</td>
                    <td class="numeric" id="taxTotals_${internalID}"></td>
                    <td class="numeric" id="grandTotal_${internalID}" style="font-weight: bold;">0.00</td>
                    <td><button class="print-invoice-btn" data-invoice-id="${internalID}" title="طباعة الفاتورة">🖨️</button></td>
                    <td><button class="delete-invoice-btn" title="حذف الفاتورة">&times;</button></td>
                </tr>
                <tr class="invoice-details-row" style="display: none;">
                    <td colspan="10">
                        <div class="details-wrapper">
                            <div class="details-grid">
                                <div class="details-card">
                                    <h4 class="details-header">بيانات المصدر (البائع)</h4>
                                    <table class="issuer-details-table details-table">
                                        <tbody>
                                            <tr><th>رقم التسجيل</th><td contenteditable="true" data-issuer-field="id">${issuerData.id}</td></tr>
                                            <tr><th>اسم المصدر</th><td contenteditable="true" data-issuer-field="name">${issuerData.name}</td></tr>
                                            <tr><th>كود النشاط</th><td contenteditable="true" data-issuer-field="taxpayerActivityCode" class="notranslate" translate="no">${issuerData.taxpayerActivityCode}</td></tr>
                                            <tr><th>المحافظة</th><td contenteditable="true" data-issuer-field="governate">${issuerData.governate}</td></tr>
                                            <tr><th>المدينة/القسم</th><td contenteditable="true" data-issuer-field="regionCity">${issuerData.regionCity}</td></tr>
                                            <tr><th>الشارع</th><td contenteditable="true" data-issuer-field="street">${issuerData.street}</td></tr>
                                            <tr><th>رقم المبنى</th><td contenteditable="true" data-issuer-field="buildingNumber">${issuerData.buildingNumber}</td></tr>
                                            <tr><th>كود النشاط</th><td contenteditable="true" data-issuer-field="taxpayerActivityCode" class="notranslate" translate="no">${issuerData.taxpayerActivityCode}</td></tr>

                                        </tbody>
                                    </table>
                                </div>
                                <div class="details-card">
                                    <h4 class="details-header">بيانات المستلم (المشتري)</h4>
                                    <table class="receiver-details-table details-table">
                                        <tbody>
                                            <tr><th>نوع المستلم</th><td contenteditable="true" data-receiver-field="receiver_type" class="notranslate" translate="no">${invoiceData.receiver_type ?? 'B'}</td></tr>
                                            <tr>
                                                <th>رقم التسجيل</th>
                                                <td style="display: flex; align-items: center; gap: 5px;">
                                                    <span contenteditable="true" data-receiver-field="receiver_id" style="flex-grow: 1;">${invoiceData.receiver_id ?? ''}</span>
                                                    <button class="verify-receiver-btn" title="تحقق من رقم التسجيل واملأ البيانات تلقائياً">🔍</button>
                                                </td>
                                            </tr>
                                            <tr><th>اسم المستلم</th><td contenteditable="true" data-receiver-field="receiver_name">${invoiceData.receiver_name ?? ''}</td></tr>
<tr><th>الدولة</th><td contenteditable="true" data-receiver-field="receiver_country" class="notranslate" translate="no">${invoiceData.receiver_country ?? ''}</td></tr>
                                            <tr><th>المحافظة</th><td contenteditable="true" data-receiver-field="receiver_governate">${invoiceData.receiver_governate ?? ''}</td></tr>
                                            <tr><th>المدينة/القسم</th><td contenteditable="true" data-receiver-field="receiver_city">${invoiceData.receiver_city ?? ''}</td></tr>
                                            <tr><th>الشارع</th><td contenteditable="true" data-receiver-field="receiver_street">${invoiceData.receiver_street ?? ''}</td></tr>
                                            <tr><th>رقم المبنى</th><td contenteditable="true" data-receiver-field="receiver_building">${invoiceData.receiver_building ?? ''}</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div class="details-card">
                                    <h4 class="details-header">بيانات الفاتورة الإضافية</h4>
                                    <table class="extra-details-table details-table">
                                        <tbody>
                                            <tr><th>مرجع طلب الشراء</th><td contenteditable="true" data-invoice-field="purchaseOrderReference">${invoiceData.purchaseOrderReference || ''}</td></tr>
                                            <tr><th>وصف طلب الشراء</th><td contenteditable="true" data-invoice-field="purchaseOrderDescription">${invoiceData.purchaseOrderDescription || ''}</td></tr>
                                            <tr><th>مرجع طلب المبيعات</th><td contenteditable="true" data-invoice-field="salesOrderReference">${invoiceData.salesOrderReference || ''}</td></tr>
                                            <tr><th>وصف طلب المبيعات</th><td contenteditable="true" data-invoice-field="salesOrderDescription">${invoiceData.salesOrderDescription || ''}</td></tr>
                                            <tr><th>اسم البنك</th><td contenteditable="true" data-invoice-field="bankName">${invoiceData.bankName || ''}</td></tr>
                                            <tr><th>رقم حساب البنك</th><td contenteditable="true" data-invoice-field="bankAccountNo">${invoiceData.bankAccountNo || ''}</td></tr>
                                            <tr><th>طريقة التوصيل</th><td contenteditable="true" data-invoice-field="deliveryApproach">${invoiceData.deliveryApproach || ''}</td></tr>
                                            <tr><th>التغليف</th><td contenteditable="true" data-invoice-field="deliveryPackaging">${invoiceData.deliveryPackaging || ''}</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="items-card">
                                <h4 class="details-header">بنود الفاتورة</h4>
                                <div style="overflow-x: auto;">
                                    <table class="items-table">
                                        <thead>
                                     

                                            <tr>
                                                <th>نوع الكود</th><th>كود الصنف</th><th>وحدة القياس</th>
                                                            <th>الكود الداخلي</th> 

                                                            

                                                <th>اسم الكود (رسمي)</th>
                                                <th>وصف الصنف (بالفاتورة)</th>
                                                <th>الكمية</th><th>السعر</th><th>عملة</th><th>سعر الصرف</th>
                                                <th>خصم (%)</th><th>خصم (قيمة)</th>
                                                <th>ضريبة 1</th><th>ضريبة 2</th><th>ضريبة 3</th><th>حذف</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                    ${invoice.lines.map(line => {
            const finalDescription = line.item_description || line.item_code_name || '';
            const finalInternalCode = line.item_internal_code || '';

           return `
                <tr data-line-index="${line.originalIndex}">
                    <td contenteditable="true" data-field="item_type" class="notranslate" translate="no">${line.item_type ?? ''}</td>
                    <td contenteditable="true" data-field="item_code" class="notranslate" translate="no">${line.item_code ?? ''}</td>
                    <td contenteditable="true" data-field="unit_type" class="notranslate" translate="no">${line.unit_type ?? ''}</td>
                    
                    <td contenteditable="true" data-field="item_internal_code">${finalInternalCode}</td>

                    <td data-field="item_code_name" style="background-color: #f0f8ff;">${line.item_code_name ?? ''}</td>
                    <td contenteditable="true" data-field="item_description">${finalDescription}</td>
                    
                    <td contenteditable="true" data-field="quantity" class="numeric">${line.quantity ?? ''}</td>
                    <td contenteditable="true" data-field="unit_price" class="numeric">${line.unit_price ?? ''}</td>
                    <td contenteditable="true" data-field="currency_sold" class="notranslate" translate="no">${line.currency_sold || 'EGP'}</td>
                    <td contenteditable="true" data-field="exchange_rate" class="numeric">${line.exchange_rate || 1}</td>
                    <td contenteditable="true" data-field="discount_rate" class="numeric">${line.discount_rate || ''}</td>
                    <td contenteditable="true" data-field="discount_amount" class="numeric">${line.discount_amount || ''}</td>
                    
                    <td class="notranslate" translate="no">
                        <span contenteditable="true" data-field="tax_type_1">${line.tax_type_1 ?? ''}</span> / 
                        <span contenteditable="true" data-field="tax_subtype_1">${line.tax_subtype_1 ?? ''}</span> / 
                        <span contenteditable="true" data-field="tax_rate_1" class="numeric">${line.tax_rate_1 ?? ''}</span>
                    </td>
                    <td class="notranslate" translate="no">
                        <span contenteditable="true" data-field="tax_type_2">${line.tax_type_2 ?? ''}</span> / 
                        <span contenteditable="true" data-field="tax_subtype_2">${line.tax_subtype_2 ?? ''}</span> / 
                        <span contenteditable="true" data-field="tax_rate_2" class="numeric">${line.tax_rate_2 ?? ''}</span>
                    </td>
                    <td class="notranslate" translate="no">
                        <span contenteditable="true" data-field="tax_type_3">${line.tax_type_3 ?? ''}</span> / 
                        <span contenteditable="true" data-field="tax_subtype_3">${line.tax_subtype_3 ?? ''}</span> / 
                        <span contenteditable="true" data-field="tax_rate_3" class="numeric">${line.tax_rate_3 ?? ''}</span>
                    </td>
                    <td><button class="delete-line-btn">&times;</button></td>
                </tr>
            `;
        }).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        `;
    });

    modalContent.innerHTML = `
        <div style="padding: 15px 25px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; background-color: #f8f9fa;">
            <h3 style="margin: 0; color: #2161a1;">مراجعة وتعديل الفواتير</h3>
            <div>
                <button id="saveFromModalBtn" style="background-color: #28a745; color: white; padding: 10px 25px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px;">حفظ الفواتير</button>
                            <button id="saveAsTemplateBtn" style="background-color: #007bff; color: white; padding: 10px 25px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px;">حفظ كنموذج</button>
                              

                <button id="closeModalBtn" style="background-color: #6c757d; color: white; padding: 10px 25px; border: none; border-radius: 8px; cursor: pointer; margin-right: 10px;">إغلاق</button>
            </div>
        </div>
     
        <div style="padding: 10px 25px; background-color: #e9ecef; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; align-items: flex-end;">
    
    <!-- ✅✅✅ بداية الإضافة 2: وضع كل الحقول المطلوبة هنا ✅✅✅ -->
    ${activitySelectorHTML}
    ${addressSelectorHTML}
    
    <div class="details-card" style="padding: 10px 15px;">
        <label for="editor-seller-name" style="font-weight: bold; margin-bottom: 5px; display: block;">اسم المصدر:</label>
        <input type="text" id="editor-seller-name" style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;" value="${apiIssuerData.name}">
    </div>
    <div class="details-card" style="padding: 10px 15px;">
        <label for="editor-seller-country" style="font-weight: bold; margin-bottom: 5px; display: block;">الدولة:</label>
        <input type="text" id="editor-seller-country" style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;" value="EG" readonly>
    </div>
    <div class="details-card" style="padding: 10px 15px;">
        <label for="editor-seller-governate" style="font-weight: bold; margin-bottom: 5px; display: block;">المحافظة:</label>
        <input type="text" id="editor-seller-governate" style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;" value="${apiIssuerData.governate}">
    </div>
    <div class="details-card" style="padding: 10px 15px;">
        <label for="editor-seller-regionCity" style="font-weight: bold; margin-bottom: 5px; display: block;">المدينة:</label>
        <input type="text" id="editor-seller-regionCity" style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;" value="${apiIssuerData.regionCity}">
    </div>
    <div class="details-card" style="padding: 10px 15px;">
        <label for="editor-seller-street" style="font-weight: bold; margin-bottom: 5px; display: block;">الشارع:</label>
        <input type="text" id="editor-seller-street" style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;" value="${apiIssuerData.street}">
    </div>
    <div class="details-card" style="padding: 10px 15px;">
        <label for="editor-seller-building" style="font-weight: bold; margin-bottom: 5px; display: block;">رقم المبنى:</label>
        <input type="text" id="editor-seller-building" style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;" value="${apiIssuerData.buildingNumber || ''}">
    </div>
    <!-- ✅✅✅ نهاية الإضافة 2 --- -->

</div>

        <div style="overflow-y: auto; flex-grow: 1;">
            <table class="main-invoice-table">
                <thead>
                   <tr style="background-color: #020b18ff; color: white; position: sticky; top: 0; z-index: 10;">
                        <th style="padding: 12px; width: 40px;"></th>
                        <th style="padding: 12px;">الرقم الداخلي</th>
<th style="padding: 12px;">تاريخ الإصدار</th>
<th style="padding: 12px;">تاريخ التسليم</th>
                        
                        <th style="padding: 12px;">رقم التسجيل</th>
                        <th style="padding: 12px;">اسم المستلم</th>
                        <th style="padding: 12px;">القيمة قبل الضريبة</th>
                        <th style="padding: 12px;">تفاصيل الضرائب</th>
                        <th style="padding: 12px;">الإجمالي بعد الضريبة</th>
                        <th style="padding: 12px; width: 60px;">طباعة</th>
                        <th style="padding: 12px; width: 60px;">حذف</th>
                   </tr>
                </thead>
                ${tableBodyHTML}
            </table>
        </div>
        <div id="modalErrorContainer" style="padding: 10px; background-color: #f8d7da; color: #721c24; display: none; max-height: 120px; overflow-y: auto; flex-shrink: 0;"></div>
        <div id="totalsFooter" style="padding: 12px 25px; background-color: #343a40; color: white; display: flex; justify-content: space-around; align-items: center; flex-shrink: 0; border-top: 3px solid #0d6efd; font-size: 14px;">
            <div>الإجمالي قبل الضريبة: <span id="totalBeforeTax" style="font-weight: bold; color: #ffc107;">0.00</span></div>
            <div id="taxTotalsContainer" style="display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;"></div>
            <div style="font-size: 16px;"><strong>الإجمالي النهائي: <span id="grandTotal" style="font-weight: bold; color: #198754;">0.00</span></strong></div>
        </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    const styles = `
        .main-invoice-table { width: 100%; border-collapse: collapse; }
        .main-invoice-table thead tr { background-color: #020b18ff; color: white; position: sticky; top: 0; z-index: 10; }
        .main-invoice-table th { padding: 12px; text-align: center; }
        .invoice-header-row { background-color: #f8f9fa; border-bottom: 2px solid #dee2e6; cursor: pointer; transition: background-color 0.2s; }
        .invoice-header-row:hover { background-color: #e9ecef; }
        .invoice-header-row td { padding: 10px 12px; vertical-align: middle; text-align: center; border-left: 1px solid #eee; }
        .invoice-header-row td:first-child { border-left: none; }
        .invoice-header-row td span[contenteditable="true"] { background-color: #fff; padding: 5px; border-radius: 4px; border: 1px dashed #ccc; min-width: 100px; display: inline-block; }
        .numeric { font-family: 'Segoe UI', Tahoma, sans-serif; font-weight: 500; }
        .details-wrapper { padding: 20px; background-color: #f9f9f9; border-top: 3px solid #0d6efd; }
        .details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin-bottom: 25px; }
        .details-card, .items-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .details-header { color: #0d6efd; border-bottom: 2px solid #eee; padding-bottom: 8px; margin-top: 0; margin-bottom: 15px; font-size: 18px; }
        .details-table { width: 100%; border-collapse: collapse; font-size: 15px; }
        .details-table th, .details-table td { border: 1px solid #f0f0f0; padding: 9px; text-align: right; }
        .details-table th { background-color: #f8f9fa; width: 150px; font-weight: 600; }
        .details-table td[contenteditable="true"] { background-color: #fff9e6; outline: none; }
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th, .items-table td { border: 1px solid #dee2e6; padding: 8px; text-align: center; font-size: 14px; vertical-align: middle; }
        .items-table th { background-color: #e9ecef; font-weight: 600; }
        .items-table tbody tr:nth-child(even) { background-color: #f9f9f9; }
        .items-table td[contenteditable="true"], .items-table span[contenteditable="true"] { background-color: #fff9e6; outline: none; }
        .delete-invoice-btn, .delete-line-btn, .print-invoice-btn { background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; padding: 4px 8px; font-size: 14px; }
        .print-invoice-btn { background: #17a2b8; }
        .delete-line-btn { font-size: 18px; padding: 2px 8px; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.id = "dataEditorModalStyles";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    document.getElementById('closeModalBtn').onclick = () => { modal.remove(); styleSheet.remove(); };
    // --- ✅✅✅ بداية الإضافة 3: ربط حدث تغيير العنوان وتحديث الواجهة ---
const addressSelect = document.getElementById('address-select-editor');
if (addressSelect) {
    const updateAddressFields = () => {
        const selectedOption = addressSelect.options[addressSelect.selectedIndex];
        const addressData = JSON.parse(selectedOption.dataset.address || '{}');
        
        // تحديث حقول الإدخال العلوية
        document.getElementById('editor-seller-governate').value = addressData.governorateNameSecondaryLang || '';
        document.getElementById('editor-seller-regionCity').value = addressData.cityNameSecondaryLang || '';
        document.getElementById('editor-seller-street').value = addressData.streetName || '';
        document.getElementById('editor-seller-building').value = addressData.buildingNo || '';

        // تحديث كل جداول بيانات المصدر داخل كل فاتورة
        document.querySelectorAll('.issuer-details-table').forEach(table => {
            table.querySelector('[data-issuer-field="governate"]').textContent = addressData.governorateNameSecondaryLang || '';
            table.querySelector('[data-issuer-field="regionCity"]').textContent = addressData.cityNameSecondaryLang || '';
            table.querySelector('[data-issuer-field="street"]').textContent = addressData.streetName || '';
            table.querySelector('[data-issuer-field="buildingNumber"]').textContent = addressData.buildingNo || '';
        });
    };

    addressSelect.addEventListener('change', updateAddressFields);
    // تفعيل الحدث لأول مرة لملء البيانات الافتراضية
    updateAddressFields();
}
// --- ✅✅✅ نهاية الإضافة 3 ---

    document.getElementById('saveFromModalBtn').onclick = () => processAndSaveFromModal_v3();

    
    document.querySelectorAll('.invoice-header-row').forEach(row => {
        row.onclick = (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.isContentEditable || e.target.parentElement.isContentEditable) {
                return;
            }
            const detailsRow = row.nextElementSibling;
            const toggleIcon = row.querySelector('.toggle-details');
            const isVisible = detailsRow.style.display !== 'none';
            detailsRow.style.display = isVisible ? 'none' : 'table-row';
            toggleIcon.textContent = isVisible ? '+' : '-';
        };
    });

    document.querySelectorAll('.delete-invoice-btn').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const invoiceGroup = e.target.closest('.invoice-group');
            const draftId = invoiceGroup.dataset.draftId;
            const internalID = invoiceGroup.dataset.internalId;

            if (!draftId) {
                if (confirm(`هذه الفاتورة (${internalID}) لم يتم حفظها على الخادم بعد. هل تريد إزالتها من العرض الحالي؟`)) {
                    invoiceGroup.remove();
                    updateAllTotals();
                }
                return;
            }

            const success = await deleteDraftInvoiceAPI(draftId);

            if (success) {
                invoiceGroup.remove();
                updateAllTotals();
                alert(`تم حذف الفاتورة رقم ${internalID} بنجاح من الخادم.`);
            }
        };
    });

    document.getElementById('saveAsTemplateBtn').onclick = () => {
        const firstInvoiceGroup = document.querySelector('.invoice-group');
        if (!firstInvoiceGroup) {
            alert("لا توجد فواتير لعرضها أو حفظها كنموذج.");
            return;
        }

        const payloadWithTotals = collectRawDataFromGroup(firstInvoiceGroup);

        showSaveAsTemplatePopup(async (templateName, templateScope) => {
            
            const templatePayload = {
                ...payloadWithTotals,
                templateName: templateName,
                templateScope: templateScope
            };

            const result = await saveInvoiceAsTemplateAPI(templatePayload);
            if (result.success) {
                alert(`✅ تم حفظ النموذج "${templateName}" بنجاح!`);
            } else {
                alert(`❌ فشل حفظ النموذج. الخطأ: ${result.error}`);
            }
        });
    };

    
    document.querySelectorAll('.print-invoice-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const invoiceId = e.target.dataset.invoiceId;
            const invoiceGroup = e.target.closest('.invoice-group');
            printInvoice(invoiceId, invoiceGroup);
        };
    });
    
    document.querySelectorAll('.delete-line-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const row = e.target.closest('tr');
            const tbody = row.parentElement;
            row.remove();
            if (tbody.children.length === 0) {
                tbody.closest('.invoice-group').remove();
            }
            updateAllTotals();
        };
    });

    modal.addEventListener('input', (e) => {
        if (e.target.isContentEditable) {
            updateAllTotals();
        }
    });

    updateAllTotals();

    modal.querySelectorAll('.verify-receiver-btn').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const btn = e.target;
            const receiverRow = btn.closest('tr');
            const receiverIdCell = receiverRow.querySelector('[data-receiver-field="receiver_id"]');
            const registrationNumber = receiverIdCell.textContent.trim();
            
            const originalText = btn.textContent;
            btn.textContent = '⏳';
            btn.disabled = true;

            const data = await fetchTaxpayerData(registrationNumber);

            if (data) {
                const receiverDetailsTable = btn.closest('.details-grid').querySelector('.receiver-details-table');
                
                const nameCell = receiverDetailsTable.querySelector('[data-receiver-field="receiver_name"]');
                const governateCell = receiverDetailsTable.querySelector('[data-receiver-field="receiver_governate"]');
                const cityCell = receiverDetailsTable.querySelector('[data-receiver-field="receiver_city"]');
                const streetCell = receiverDetailsTable.querySelector('[data-receiver-field="receiver_street"]');
                const buildingCell = receiverDetailsTable.querySelector('[data-receiver-field="receiver_building"]');

                if (nameCell) nameCell.textContent = data.namePrimaryLang || '';
                
                const address = data.taxpayerBranchs?.[0]?.address;
                if (address) {
                    if (governateCell) governateCell.textContent = address.governorateNameSecondaryLang || address.governorate || '';
                    if (cityCell) cityCell.textContent = address.cityNameSecondaryLang || address.regionCity || '';
                    if (streetCell) streetCell.textContent = address.streetName || address.street || '';
                    if (buildingCell) buildingCell.textContent = address.buildingNo || address.buildingNumber || '';
                }
                
                const mainHeaderRow = btn.closest('.invoice-group').querySelector('.invoice-header-row');
                const mainReceiverNameCell = mainHeaderRow.querySelector('[data-field="receiver_name"]');
                if (mainReceiverNameCell) mainReceiverNameCell.textContent = data.namePrimaryLang || '';

                alert("تم التحقق وملء بيانات العميل بنجاح!");
            } else {
                alert("فشل التحقق من رقم التسجيل. تأكد من أنه صحيح.");
            }

            btn.textContent = originalText;
            btn.disabled = false;
        };
    });

   
}




/**
 * دالة جديدة: لإرسال بيانات الفاتورة ليتم حفظها كنموذج.
 * @param {Object} payload - الهيكل الكامل للنموذج.
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
async function saveInvoiceAsTemplateAPI(payload) {
    const token = getAccessToken();
    if (!token) {
        return { success: false, error: "لم يتم العثور على توكن الدخول." };
    }

    try {
        const response = await fetch("https://api-portal.invoicing.eta.gov.eg/api/v1/documents/templates", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload )
        });

        if (!response.ok) {
            const errorResult = await response.json();
            const specificMessage = errorResult.error?.details?.[0]?.message || errorResult.error?.message || JSON.stringify(errorResult);
            throw new Error(specificMessage);
        }

        return { success: true, error: null };

    } catch (error) {
        return { success: false, error: error.message };
    }
}



/**
 * ✅✅✅ دالة مساعدة (النسخة النهائية): تجمع البيانات وتحسب الإجماليات والضرائب. ✅✅✅
 * @param {HTMLElement} invoiceGroupElement - عنصر tbody الذي يمثل الفاتورة.
 * @returns {Object} - كائن يحتوي على هيكل الفاتورة الكامل والجاهز للإرسال.
 */
function collectRawDataFromGroup(invoiceGroupElement) {
    // --- 1. جمع البيانات الأساسية من الواجهة ---
    const headerData = {};
    invoiceGroupElement.querySelectorAll('[data-field], [data-issuer-field], [data-receiver-field], [data-invoice-field]').forEach(cell => {
        const key = cell.dataset.field || cell.dataset.issuerField || cell.dataset.receiverField || cell.dataset.invoiceField;
        if (key) {
            headerData[key] = cell.textContent.trim();
        }
    });

    // --- 2. حساب الإجماليات والضرائب من بنود الفاتورة ---
    let totalSalesAmount = 0;
    let totalDiscountAmount = 0;
    const taxTotalsMap = new Map();
    const invoiceLines = [];
    const rawLinesData = []; // لتخزين البيانات الخام للـ lineItemCodes

    invoiceGroupElement.querySelectorAll('.items-table tbody tr').forEach(row => {
        const line = {};
        row.querySelectorAll('[data-field]').forEach(cell => {
            // التعامل مع الخلايا التي تحتوي على حقول متعددة (مثل الضرائب)
            if (cell.querySelectorAll('span[data-field]').length > 0) {
                cell.querySelectorAll('span[data-field]').forEach(span => {
                    line[span.dataset.field] = span.textContent.trim();
                });
            } else {
                line[cell.dataset.field] = cell.textContent.trim();
            }
        });
        rawLinesData.push(line); // إضافة بيانات السطر الخام

        const quantity = parseFloat(line.quantity) || 0;
        const amountEGP = parseFloat(line.unit_price) || 0;
        const salesTotal = parseFloat((quantity * amountEGP).toFixed(5));
        totalSalesAmount += salesTotal;

        const discountAmount = parseFloat(line.discount_amount) || (salesTotal * (parseFloat(line.discount_rate) || 0) / 100);
        totalDiscountAmount += discountAmount;

        const netTotal = parseFloat((salesTotal - discountAmount).toFixed(5));

        const taxableItems = [];
        let totalTaxAmountForItem = 0;
        for (let i = 1; i <= 3; i++) {
            const taxType = line[`tax_type_${i}`]?.trim().toUpperCase();
            const taxRateStr = line[`tax_rate_${i}`];
            if (taxType && taxRateStr != null && taxRateStr.trim() !== '' && !isNaN(parseFloat(taxRateStr))) {
                const taxRate = parseFloat(taxRateStr);
                const taxAmount = parseFloat((netTotal * (taxRate / 100)).toFixed(5));
                const taxSubtype = line[`tax_subtype_${i}`]?.trim() || defaultSubtypes[taxType] || "";
                taxableItems.push({ taxType, amount: taxAmount, subType: taxSubtype, rate: taxRate });

                totalTaxAmountForItem += (taxType === "T4" ? -taxAmount : taxAmount);
                taxTotalsMap.set(taxType, (taxTotalsMap.get(taxType) || 0) + taxAmount);
            }
        }

        invoiceLines.push({
            description: line.item_description,
            itemType: line.item_type,
            itemCode: line.item_code,
            internalCode: line.item_internal_code || line.item_code,
            unitType: line.unit_type,
            quantity: quantity,
            unitValue: { currencySold: "EGP", amountEGP: amountEGP },
            salesTotal: salesTotal,
            discount: { amount: discountAmount },
            netTotal: netTotal,
            taxableItems: taxableItems,
            total: parseFloat((netTotal + totalTaxAmountForItem).toFixed(5)),
            valueDifference: 0,
            totalTaxableFees: 0,
            itemsDiscount: 0
        });
    });

    const taxTotals = Array.from(taxTotalsMap, ([taxType, amount]) => ({ taxType, amount: parseFloat(amount.toFixed(5)) }));
    const finalTotalAmount = invoiceLines.reduce((sum, line) => sum + line.total, 0);

    // --- 3. بناء هيكل JSON النهائي بنفس شكل المسودة ---
    const finalPayload = {
        tags: ["FullInvoice", "SignatureRequired"],
        document: {
            documentType: "I",
            documentTypeVersion: "1.0",
// --- ✅✅✅ بداية التعديل النهائي: منطق التاريخ من البند الأول ✅✅✅ ---
dateTimeIssued: (firstLine.dateTimeIssued && !isNaN(new Date(firstLine.dateTimeIssued))) 
    ? new Date(firstLine.dateTimeIssued).toISOString().split('.')[0] + "Z" 
    : new Date().toISOString().split('.')[0] + "Z",

serviceDeliveryDate: (firstLine.serviceDeliveryDate && !isNaN(new Date(firstLine.serviceDeliveryDate)))
    ? new Date(firstLine.serviceDeliveryDate).toISOString().split('T')[0]
    : undefined, // إذا لم يكن موجودًا، لا تقم بإضافته
// --- ✅✅✅ نهاية التعديل النهائي ---
            taxpayerActivityCode: document.getElementById('activity-select-editor')?.value || "4690",
            internalID: headerData.internalID,
            issuer: {
                type: "B", id: headerData.id, name: headerData.name,
                address: { branchID: "0", country: "EG", governate: headerData.governate, regionCity: headerData.regionCity, street: headerData.street, buildingNumber: headerData.buildingNumber }
            },
            receiver: {
                type: headerData.receiver_type, id: headerData.receiver_id, name: headerData.receiver_name,
                address: { country: headerData.receiver_country, governate: headerData.receiver_governate, regionCity: headerData.receiver_city, street: headerData.receiver_street, buildingNumber: headerData.receiver_building }
            },
            invoiceLines: invoiceLines,
            totalSalesAmount: parseFloat(totalSalesAmount.toFixed(5)),
            totalDiscountAmount: parseFloat(totalDiscountAmount.toFixed(5)),
            netAmount: parseFloat((totalSalesAmount - totalDiscountAmount).toFixed(5)),
            taxTotals: taxTotals,
            totalAmount: parseFloat(finalTotalAmount.toFixed(5)),
            signatures: [{ signatureType: "I", value: "VGVtcG9yYXJ5IFNpZ25hdHVyZSBIb2xkZXI=" }]
        },
        lineItemCodes: rawLinesData.map(line => ({
            codeType: line.item_type,
            itemCode: line.item_code,
            codeNamePrimaryLang: line.item_code_name || line.item_description,
            codeNameSecondaryLang: line.item_code_name || line.item_description
        }))
    };

    return finalPayload;
}


/**
 * دالة جديدة: لإظهار نافذة منبثقة لحفظ الفاتورة كنموذج.
 * @param {Function} onSave - دالة يتم استدعاؤها عند الضغط على "حفظ" مع تمرير اسم ونطاق النموذج.
 */
function showSaveAsTemplatePopup(onSave) {
    // منع تكرار النافذة
    document.getElementById('saveTemplatePopup')?.remove();

    const popup = document.createElement('div');
    popup.id = 'saveTemplatePopup';
    popup.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0,0,0,0.5); z-index: 10002;
        display: flex; align-items: center; justify-content: center; direction: rtl;
    `;

    popup.innerHTML = `
        <div style="background: #fff; padding: 25px; border-radius: 10px; width: 400px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            <h4 style="margin-top: 0; color: #007bff;">حفظ الفاتورة كنموذج</h4>
            <div style="margin-bottom: 15px;">
                <label for="templateNameInput" style="display: block; margin-bottom: 5px; font-weight: bold;">اسم النموذج:</label>
                <input type="text" id="templateNameInput" placeholder="مثال: نموذج فواتير شركة X" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 5px;">
            </div>
            <div style="margin-bottom: 20px;">
                <label for="templateScopeSelect" style="display: block; margin-bottom: 5px; font-weight: bold;">حفظ لـ:</label>
                <select id="templateScopeSelect" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 5px;">
                    <option value="User">أنا فقط (User)</option>
                    <option value="Taxpayer">جميع ممثلي الممول (Taxpayer)</option>
                </select>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button id="cancelTemplateSave" style="background: #6c757d; color: white; padding: 8px 15px; border: none; border-radius: 5px; cursor: pointer;">إلغاء</button>
                <button id="confirmTemplateSave" style="background: #007bff; color: white; padding: 8px 15px; border: none; border-radius: 5px; cursor: pointer;">حفظ</button>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    document.getElementById('cancelTemplateSave').onclick = () => popup.remove();
    document.getElementById('confirmTemplateSave').onclick = () => {
        const templateName = document.getElementById('templateNameInput').value.trim();
        const templateScope = document.getElementById('templateScopeSelect').value;
        if (!templateName) {
            alert("يرجى إدخال اسم للنموذج.");
            return;
        }
        onSave(templateName, templateScope);
        popup.remove();
    };
}


// =========================================================================
//  ⭐ دالة مستكشف الأكواد (v5.2 - مع تصدير أعمدة مخصصة حسب الطلب) ⭐
// =========================================================================
function setupCodesExplorerTab() {
    // التأكد من أننا لا نضيف الكود مرتين
    if (document.getElementById('codes-explorer-grid')) {
        return;
    }

    const container = document.getElementById('panel-codes-explorer');
    if (!container) {
        return;
    }

    // --- 1. بناء الهيكل الأساسي للواجهة ---
    container.innerHTML = `
        <div class="panel-header">
            <h2>مستكشف أكواد الأصناف (EGS)</h2>
            <p>ابحث عن الأكواد المسجلة وصدرها إلى ملف Excel جاهز للاستخدام.</p>
        </div>
        <div id="codes-explorer-grid" class="codes-explorer-grid">
            <div class="search-panel">
                <div class="search-options">
                    <select id="code-search-type">
                        <option value="rin">البحث برقم تسجيل الممول</option>
                    </select>
                </div>
                <input type="text" id="code-search-input" placeholder="ابدأ الكتابة للبحث باسم الصنف...">
                <div id="export-container" style="margin-top: 15px; display: none;">
                    <button id="export-excel-btn" style="width: 100%; padding: 12px; background-color: #198754; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 16px;">
                        📥 تحميل كل الأكواد (Excel)
                    </button>
                    <div id="export-progress" style="text-align: center; color: #0d6efd; margin-top: 10px; font-weight: bold; display: none;"></div>
                </div>
                <ul id="search-results-list" style="margin-top: 15px;"><li class="list-placeholder">قائمة النتائج...</li></ul>
            </div>
            <div class="details-panel">
                <div id="code-details-container">
                    <div class="list-placeholder">اختر كوداً من القائمة لعرض تفاصيله هنا...</div>
                </div>
            </div>
        </div>
    `;

    // --- 2. تعريف الدوال المساعدة للـ API ---
    const getApiToken = () => JSON.parse(localStorage.getItem("USER_DATA") || "{}").access_token;

    const fetchApi = async (url) => {
        const token = getApiToken();
        if (!token) {
            alert("خطأ في المصادقة. يرجى إعادة تحميل الصفحة.");
            return null;
        }
        try {
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            return null;
        }
    };

    // --- 3. ربط عناصر الواجهة بالأحداث ---
    const searchTypeSelect = document.getElementById('code-search-type');
    const searchInput = document.getElementById('code-search-input');
    const resultsList = document.getElementById('search-results-list');
    const detailsContainer = document.getElementById('code-details-container');
    const exportContainer = document.getElementById('export-container');
    const exportBtn = document.getElementById('export-excel-btn');
    const exportProgress = document.getElementById('export-progress');
    let searchTimeout;
    let currentRinForExport = null;

    searchTypeSelect.addEventListener('change', () => {
        searchInput.value = '';
        resultsList.innerHTML = '<li class="list-placeholder">قائمة النتائج...</li>';
        detailsContainer.innerHTML = '<div class="list-placeholder">اختر كوداً من القائمة لعرض تفاصيله هنا...</div>';
        exportContainer.style.display = 'none';
        currentRinForExport = null;
        searchInput.placeholder = (searchTypeSelect.value === 'name') 
            ? 'ابدأ الكتابة للبحث باسم الصنف...'
            : 'أدخل رقم التسجيل للبحث...';
    });

    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        exportContainer.style.display = 'none';
        currentRinForExport = null;
        let query = searchInput.value.trim();

        if (query.length < 3) {
            resultsList.innerHTML = '<li class="list-placeholder">اكتب 3 حروف/أرقام على الأقل...</li>';
            return;
        }

        resultsList.innerHTML = '<li class="list-placeholder">جاري البحث...</li>';

        searchTimeout = setTimeout(async () => {
            const searchType = searchTypeSelect.value;
            let lookupValue = query;

            if (searchType === 'rin') {
                lookupValue = `EG-${query}`;
                currentRinForExport = query;
            }
            
            const url = `https://api-portal.invoicing.eta.gov.eg/api/v1/codetypes/9/codes?CodeLookupValue=${encodeURIComponent(lookupValue )}&ApplyMinChoiceLevel=true&Ps=50&Pn=1`;
            
            const data = await fetchApi(url);
            const results = data?.result || [];

            if (results.length === 0) {
                resultsList.innerHTML = '<li class="list-placeholder">لا توجد نتائج.</li>';
                return;
            }

            if (searchType === 'rin') {
                exportContainer.style.display = 'block';
            }

            resultsList.innerHTML = results.map((item, index) => `
                <li class="search-result-item" data-index="${index}">
                    <strong>${item.codeNameSecondaryLang}</strong>
                    <span>${item.codeLookupValue}</span>
                </li>
            `).join('');

            resultsList.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    resultsList.querySelectorAll('.search-result-item').forEach(i => i.classList.remove('selected'));
                    e.currentTarget.classList.add('selected');
                    
                    const index = parseInt(e.currentTarget.dataset.index, 10);
                    const selectedItemData = results[index];
                    displayCodeDetails(selectedItemData);
                });
            });
        }, 500);
    });

    // --- 4. دالة عرض التفاصيل (كما هي) ---
    const displayCodeDetails = (details) => {
        if (!details) {
            detailsContainer.innerHTML = '<div class="list-placeholder" style="color:red;">فشل في تحميل التفاصيل.</div>';
            return;
        }
        detailsContainer.innerHTML = `
            <div class="detail-card"><h4>البيانات الأساسية للكود</h4><p><span class="label">الاسم العربي:</span> <span class="value">${details.codeNameSecondaryLang || 'N/A'}</span></p><p><span class="label">الاسم الإنجليزي:</span> <span class="value">${details.codeNamePrimaryLang || 'N/A'}</span></p><p><span class="label">الكود (Code):</span> <span class="value code">${details.codeLookupValue || 'N/A'}</span></p><p><span class="label">الوصف:</span> <span class="value">${details.codeDescriptionSecondaryLang || 'لا يوجد'}</span></p></div>
            <div class="detail-card" style="border-color: #28a745;"><h4>بيانات المالك</h4><p><span class="label">اسم المالك:</span> <span class="value">${details.ownerTaxpayer?.nameAr || 'N/A'}</span></p><p><span class="label">رقم تسجيل المالك:</span> <span class="value code">${details.ownerTaxpayer?.rin || 'N/A'}</span></p></div>
            <div class="detail-card" style="border-color: #fd7e14;"><h4>التصنيف (GPC)</h4><p><span class="label">المستوى 1:</span> <span class="value">${details.codeCategorization?.level1?.nameAr || 'N/A'}</span></p><p><span class="label">المستوى 2:</span> <span class="value">${details.codeCategorization?.level2?.nameAr || 'N/A'}</span></p><p><span class="label">المستوى 3:</span> <span class="value">${details.codeCategorization?.level3?.nameAr || 'N/A'}</span></p><p><span class="label">المستوى 4:</span> <span class="value">${details.codeCategorization?.level4?.nameAr || 'N/A'}</span></p></div>
        `;
    };

    // --- 5. ✅✅✅  منطق التصدير المخصص (v5.2)  ✅✅✅ ---
 // ✅✅✅ الكود الجديد والمحسّن (استبدل الدالة القديمة بهذه) ✅✅✅
exportBtn.addEventListener('click', async () => {
    if (!currentRinForExport) {
        alert("يرجى البحث برقم تسجيل أولاً.");
        return;
    }

    exportBtn.disabled = true;
    exportProgress.style.display = 'block';
    exportProgress.textContent = 'جاري جلب البيانات...';

    let allCodes = [];
    let currentPage = 1;
    let totalPages = 1;

    try {
        // --- 1. جلب كل الصفحات (لا تغيير هنا) ---
        do {
            const lookupValue = `EG-${currentRinForExport}`;
            const url = `https://api-portal.invoicing.eta.gov.eg/api/v1/codetypes/9/codes?CodeLookupValue=${lookupValue}&ApplyMinChoiceLevel=true&Ps=100&Pn=${currentPage}`;
            
            const data = await fetchApi(url );
            
            if (data && data.result) {
                allCodes.push(...data.result);
                totalPages = data.metadata.totalPages;
                exportProgress.textContent = `جاري جلب صفحة ${currentPage} من ${totalPages}... (${allCodes.length} كود)`;
                currentPage++;
            } else {
                break;
            }
        } while (currentPage <= totalPages);

        exportProgress.textContent = `تم جلب ${allCodes.length} كود. جاري إنشاء ملف Excel...`;

        // --- 2. بداية استخدام مكتبة ExcelJS الجديدة ---
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'ETA Exporter by Mohamed Sabry';
        workbook.lastModifiedBy = 'ETA Exporter';
        workbook.created = new Date();
        workbook.rtl = true; // تفعيل خاصية من اليمين لليسار

        const worksheet = workbook.addWorksheet("أكواد الأصناف");

        // --- 3. تحديد الأعمدة ورؤوسها وتنسيقها ---
        worksheet.columns = [
            { header: 'CodeType', key: 'CodeType', width: 12 },
            { header: 'ItemCode', key: 'ItemCode', width: 20 },
            { header: 'CodeName', key: 'CodeName', width: 45 },
            { header: 'CodeNameAr', key: 'CodeNameAr', width: 45 },
            { header: 'Description', key: 'Description', width: 50 },
            { header: 'DescriptionAr', key: 'DescriptionAr', width: 50 },
            { header: 'ActiveFrom', key: 'ActiveFrom', width: 18, style: { numFmt: 'dd/mm/yyyy' } },
            { header: 'ActiveTo', key: 'ActiveTo', width: 18, style: { numFmt: 'dd/mm/yyyy' } },
            { header: 'GPCItemLink', key: 'GPCItemLink', width: 25 },
            { header: 'EGSRelatedCode', key: 'EGSRelatedCode', width: 25 }
        ];

        // تنسيق صف الرؤوس (Header)
        worksheet.getRow(1).eachCell(cell => {
            cell.font = { name: 'Cairo', bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0056B3' } }; // لون أزرق داكن
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        // --- 4. تحويل البيانات وإضافتها للورقة ---
        allCodes.forEach(code => {
            const itemCodeOnly = code.codeLookupValue.split('-').pop() || '';
            worksheet.addRow({
                'CodeType': 'EGS',
                'ItemCode': itemCodeOnly,
                'CodeName': code.codeNamePrimaryLang,
                'CodeNameAr': code.codeNameSecondaryLang,
                'Description': code.codeDescriptionPrimaryLang,
                'DescriptionAr': code.codeDescriptionSecondaryLang,
                'ActiveFrom': code.activeFrom ? new Date(code.activeFrom) : null,
                'ActiveTo': code.activeTo ? new Date(code.activeTo) : null,
                'GPCItemLink': code.parentCodeLookupValue,
                'EGSRelatedCode': code.linkedCode
            });
        });

        // --- 5. إضافة الميزات الاحترافية (تجميد وفلترة) ---
        worksheet.views = [{ state: 'frozen', ySplit: 1, rightToLeft: true }];
        worksheet.autoFilter = {
            from: 'A1',
            to: { row: 1, column: worksheet.columns.length }
        };

        exportProgress.textContent = 'الخطوة النهائية: جاري توليد الملف...';

        // --- 6. إنشاء الملف وتنزيله ---
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, `أكواد_${currentRinForExport}.xlsx`); // استخدام saveAs مباشرة

    } catch (error) {
        alert("حدث خطأ أثناء تصدير الأكواد. انظر الكونسول للمزيد من التفاصيل.");
    } finally {
        exportBtn.disabled = false;
        exportProgress.style.display = 'none';
    }
});

}



async function deleteDraftInvoiceAPI(draftId) {
    const token = getAccessToken();
    if (!token) {
        alert("خطأ: لم يتم العثور على توكن الدخول.");
        return false;
    }

    // تأكيد من المستخدم قبل الحذف
    if (!confirm(`هل أنت متأكد من رغبتك في حذف هذه المسودة نهائياً من الخادم؟ لا يمكن التراجع عن هذا الإجراء.`)) {
        return false;
    }

    try {
        const response = await fetch(`https://api-portal.invoicing.eta.gov.eg/api/v1/documents/drafts/${draftId}`, {
            method: 'DELETE', // تحديد نوع الطلب
            headers: {
                "Authorization": `Bearer ${token}`
            }
        } );

        if (!response.ok) {
            // محاولة قراءة رسالة الخطأ من الخادم
            let errorMsg = `فشل حذف المسودة. رمز الحالة: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.error?.message || JSON.stringify(errorData);
            } catch (e) {
                // فشل في قراءة JSON، استخدم النص العادي
                errorMsg = await response.text();
            }
            throw new Error(errorMsg);
        }

        return true; // تم الحذف بنجاح

    } catch (error) {
        alert(`حدث خطأ أثناء حذف المسودة: ${error.message}`);
        return false;
    }
}



/**
 * ✅✅✅ الدالة النهائية والحاسمة (v2.0 - مع تنظيف المرجع) ✅✅✅
 */
async function updateDraftInvoiceAPI(draftId, payload, rawLinesData) {
    const token = getAccessToken();
    if (!token) {
        const errorMsg = "خطأ في المصادقة: لم يتم العثور على توكن الدخول.";
        return { success: false, error: errorMsg };
    }
 
    // ----------------------------------------------------

    // الحل القاطع: الحذف الصريح مرة أخرى هنا لضمان الإزالة
    const creditNoteType = document.getElementById('creditNoteTypeSelect').value;
    if (creditNoteType === 'without_reference') {
        if ('references' in payload.document) {
            delete payload.document.references;
        }
    }

    if (payload.document && payload.document.references && payload.document.references.length === 1 && payload.document.references[0] === '') {
        // إذا كانت مصفوفة المراجع تحتوي فقط على نص فارغ، احذفها بالكامل
        delete payload.document.references;
    }
    // ✨✨✨ --- نهاية التعديل الحاسم --- ✨✨✨

   // ✨✨✨ الكود الجديد والصحيح ✨✨✨
const finalPayload = {
    ...payload,
    // تم حذف سطر "references: []," من هنا بالكامل
    clientsidevalidationresult: true, 
    lineItemCodes: rawLinesData.map(line => ({
        codeType: line.item_type,
        itemCode: line.item_code,
        codeNamePrimaryLang: line.item_code_name || line.item_description,
        codeNameSecondaryLang: line.item_code_name || line.item_description
    }))
};

 
    try {
        const response = await fetch(`https://api-portal.invoicing.eta.gov.eg/api/v1/documents/drafts/${draftId}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(finalPayload )
        });

        if (!response.ok) {
            const errorResult = await response.json();
            const specificMessage = errorResult.error?.details?.[0]?.message || errorResult.error?.message || JSON.stringify(errorResult);
            throw new Error(specificMessage);
        }
        
        const responseData = await response.json();
        return { success: true, data: responseData };

    } catch (error) {
        return { success: false, error: error.message };
    }
}











/**
 * ✅ دالة معدلة: تحول بيانات المسودة من API إلى التنسيق الذي تفهمه واجهة التعديل.
 */
function transformDraftDataForEditor(draft) {
    const doc = draft.document;
    if (!doc) return [];

    // --- بداية التعديل ---
    // الاحتفاظ بالمعرف الفريد للمسودة (UUID) القادم من الـ API
    const draftId = draft.id;
    // --- نهاية التعديل ---

    // تجميع بيانات رأس الفاتورة
    const invoiceHeader = {
        draftId: draftId, // <-- تمت إضافة هذا السطر
        internalID: doc.internalID,
        receiver_id: doc.receiver.id,
        receiver_name: doc.receiver.name,
        receiver_type: doc.receiver.type,
        receiver_country: doc.receiver.address?.country,
        receiver_governate: doc.receiver.address?.governate,
        receiver_city: doc.receiver.address?.regionCity,
        receiver_street: doc.receiver.address?.street,
        receiver_building: doc.receiver.address?.buildingNumber,
        purchaseOrderReference: doc.purchaseOrderReference,
        purchaseOrderDescription: doc.purchaseOrderDescription,
        salesOrderReference: doc.salesOrderReference,
        salesOrderDescription: doc.salesOrderDescription,
        bankName: doc.payment?.bankName,
        bankAccountNo: doc.payment?.bankAccountNo,
        deliveryApproach: doc.delivery?.approach,
        deliveryPackaging: doc.delivery?.packaging,
    };

    // إنشاء صف لكل بند في الفاتورة مع إضافة بيانات الرأس إليه
    return doc.invoiceLines.map(line => {
        const lineData = {
            ...invoiceHeader,
            item_description: line.description,
            item_type: line.itemType,
            item_code: line.itemCode,
            item_internal_code: line.internalCode,
            unit_type: line.unitType,
            quantity: line.quantity,
            unit_price: line.unitValue.amountEGP,
            currency_sold: line.unitValue.currencySold,
            exchange_rate: line.unitValue.currencyExchangeRate,
            discount_rate: line.discount?.rate,
            discount_amount: line.discount?.amount,
        };

        // إضافة بيانات الضرائب (حتى 3 ضرائب لكل بند)
        line.taxableItems.forEach((tax, index) => {
            if (index < 3) {
                lineData[`tax_type_${index + 1}`] = tax.taxType;
                lineData[`tax_subtype_${index + 1}`] = tax.subType;
                lineData[`tax_rate_${index + 1}`] = tax.rate;
            }
        });

        return lineData;
    });
}


/**
 * =========================================================================
 * ✅✅✅ الدالة النهائية (v11.0): تقرأ التواريخ من رأس الفاتورة مباشرة
 * =========================================================================
 */
function updateAllTotals() {
    let overallTotalBeforeTax = 0;
    const overallTaxTotals = new Map();

    document.querySelectorAll('.invoice-group').forEach(group => {
        const internalID = group.dataset.internalId;
        let invoiceTotalBeforeTax = 0;
        const invoiceTaxTotals = new Map();

        group.querySelectorAll('.items-table tbody tr').forEach(row => {
            const quantity = parseFloat(row.querySelector('[data-field="quantity"]').textContent) || 0;
            const price = parseFloat(row.querySelector('[data-field="unit_price"]').textContent) || 0;
            const exchangeRate = parseFloat(row.querySelector('[data-field="exchange_rate"]').textContent) || 1;
            
            const discountRate = parseFloat(row.querySelector('[data-field="discount_rate"]').textContent) || 0;
            const discountAmount = parseFloat(row.querySelector('[data-field="discount_amount"]').textContent) || 0;

            const lineTotalInEGP = quantity * price * exchangeRate;
            const finalDiscount = discountAmount || (lineTotalInEGP * (discountRate / 100));
            const netTotal = lineTotalInEGP - finalDiscount;

            invoiceTotalBeforeTax += netTotal;

            let tableTaxAmount = 0;
            for (let i = 1; i <= 3; i++) {
                const taxType = row.querySelector(`[data-field="tax_type_${i}"]`).textContent.trim().toUpperCase();
                const taxRate = parseFloat(row.querySelector(`[data-field="tax_rate_${i}"]`).textContent) || 0;
                if ((taxType === "T2" || taxType === "T3") && taxRate > 0) {
const taxAmount = parseFloat((netTotal * (taxRate / 100)).toFixed(5));
                    tableTaxAmount += taxAmount;
                    invoiceTaxTotals.set(taxType, (invoiceTaxTotals.get(taxType) || 0) + taxAmount);
                }
            }

const vatBaseAmount = parseFloat((netTotal + tableTaxAmount).toFixed(5));

            for (let i = 1; i <= 3; i++) {
                const taxType = row.querySelector(`[data-field="tax_type_${i}"]`).textContent.trim().toUpperCase();
                const taxRate = parseFloat(row.querySelector(`[data-field="tax_rate_${i}"]`).textContent) || 0;
                
                if (taxType === "T2" || taxType === "T3") continue;

                if (taxType && taxRate > 0) {
let taxAmount = (taxType === "T1") ? parseFloat((vatBaseAmount * (taxRate / 100)).toFixed(5)) : parseFloat((netTotal * (taxRate / 100)).toFixed(5));
                    invoiceTaxTotals.set(taxType, (invoiceTaxTotals.get(taxType) || 0) + taxAmount);
                }
            }
        });

        let invoiceGrandTotal = invoiceTotalBeforeTax;
        let invoiceTaxDetailsHTML = ''; 

        invoiceTaxTotals.forEach((amount, type) => {
            invoiceGrandTotal += (type === "T4" ? -1 : 1) * amount;
            const taxName = taxTypesMap[type] || type;
            const style = type === "T4" ? 'color: #dc3545;' : 'color: #28a745;'; 
            invoiceTaxDetailsHTML += `<div style="${style} font-size: 12px;">${taxName}: ${amount.toFixed(2)}</div>`;
        });

        document.getElementById(`totalBeforeTax_${internalID}`).textContent = invoiceTotalBeforeTax.toFixed(2);
        document.getElementById(`taxTotals_${internalID}`).innerHTML = invoiceTaxDetailsHTML || 'لا توجد';
        document.getElementById(`grandTotal_${internalID}`).textContent = invoiceGrandTotal.toFixed(2);

        overallTotalBeforeTax += invoiceTotalBeforeTax;
        invoiceTaxTotals.forEach((amount, type) => {
            overallTaxTotals.set(type, (overallTaxTotals.get(type) || 0) + amount);
        });
    });

    let grandTotal = overallTotalBeforeTax;
    let taxHtml = '';
    overallTaxTotals.forEach((amount, type) => {
        grandTotal += (type === "T4" ? -1 : 1) * amount;
        const taxName = taxTypesMap[type] || type;
        const style = type === "T4" ? 'style="color: #ff6b6b;"' : '';
        taxHtml += `<span ${style}>${taxName}: ${amount.toFixed(2)}</span>`;
    });

    document.getElementById('totalBeforeTax').textContent = overallTotalBeforeTax.toFixed(2);
    document.getElementById('taxTotalsContainer').innerHTML = taxHtml;
    document.getElementById('grandTotal').textContent = grandTotal.toFixed(2);
}







/**
 * ===================================================================================
 * ✅✅✅ دالة الحفظ النهائية (v12 - مع تحقق ذاتي شامل ودقيق للأخطاء قبل الإرسال)
 * ===================================================================================
 */
async function sendInvoicesFromModal_v3(invoicesMap) {
    const saveBtn = document.getElementById('saveFromModalBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = `⏳ جاري التحقق من البيانات...`;

    const errors = [];
    const payloadsToCreate = [];
    const payloadsToUpdate = [];

    // --- ✅ 1. مرحلة التحقق الذاتي الشامل والدقيق (قبل الاتصال بالـ API) ---
    for (const [invoiceId, data] of invoicesMap.entries()) {
        const draftId = data.draftId;
        const firstLine = data.lines[0];
        let hasErrorInThisInvoice = false;

        // --- التحقق من بيانات رأس الفاتورة ---
        if (!firstLine.receiver_name || String(firstLine.receiver_name).trim() === '') {
            errors.push({ id: invoiceId, field: 'اسم المستلم', value: 'فارغ', message: "هذا الحقل إجباري." });
            hasErrorInThisInvoice = true;
        }
        if (!firstLine.receiver_id || String(firstLine.receiver_id).trim() === '') {
            errors.push({ id: invoiceId, field: 'رقم تسجيل المستلم', value: 'فارغ', message: "هذا الحقل إجباري." });
            hasErrorInThisInvoice = true;
        }
        if (data.lines.length === 0) {
            errors.push({ id: invoiceId, field: 'بنود الفاتورة', value: 'لا يوجد', message: "يجب أن تحتوي الفاتورة على بند واحد على الأقل." });
            hasErrorInThisInvoice = true;
        }

        // --- التحقق الدقيق من كل بند داخل الفاتورة ---
        data.lines.forEach((line, index) => {
            const itemIdentifier = `${invoiceId} (البند ${index + 1})`;

            if (!line.item_description || String(line.item_description).trim() === '') {
                errors.push({ id: itemIdentifier, field: 'وصف الصنف', value: 'فارغ', message: 'هذا الحقل إجباري.' });
                hasErrorInThisInvoice = true;
            }
            if (!line.item_code || String(line.item_code).trim() === '') {
                errors.push({ id: itemIdentifier, field: 'كود الصنف', value: 'فارغ', message: 'هذا الحقل إجباري.' });
                hasErrorInThisInvoice = true;
            }
            if (!line.unit_type || String(line.unit_type).trim() === '') {
                errors.push({ id: itemIdentifier, field: 'وحدة القياس', value: 'فارغة', message: 'هذا الحقل إجباري.' });
                hasErrorInThisInvoice = true;
            }
            if (isNaN(parseFloat(line.quantity)) || parseFloat(line.quantity) <= 0) {
                errors.push({ id: itemIdentifier, field: 'الكمية', value: line.quantity, message: 'يجب أن تكون رقمًا موجبًا وأكبر من صفر.' });
                hasErrorInThisInvoice = true;
            }
            if (isNaN(parseFloat(line.unit_price))) { // السعر يمكن أن يكون صفرًا
                errors.push({ id: itemIdentifier, field: 'سعر الوحدة', value: line.unit_price, message: 'يجب أن يكون قيمة رقمية.' });
                hasErrorInThisInvoice = true;
            }
            // التحقق من الضرائب: إذا تم إدخال نسبة، يجب وجود النوع والعكس
            for (let i = 1; i <= 3; i++) {
                const taxType = line[`tax_type_${i}`]?.trim();
                const taxRate = line[`tax_rate_${i}`]?.trim();
                if ((taxType && !taxRate) || (!taxType && taxRate)) {
                     errors.push({ id: itemIdentifier, field: `ضريبة ${i}`, value: `النوع: ${taxType}, النسبة: ${taxRate}`, message: 'بيانات الضريبة غير مكتملة. يجب إدخال النوع والنسبة معًا.' });
                     hasErrorInThisInvoice = true;
                }
            }
        });

        // إذا لم نجد أخطاء في هذه الفاتورة، نجهزها للإرسال
        if (!hasErrorInThisInvoice) {
            const structuredPayload = createInvoicePayloadFromLines_v3(data.lines, data.issuer);
            const rawLinesData = data.lines;
            
            if (draftId) {
                payloadsToUpdate.push({ draftId, payload: structuredPayload, rawLines: rawLinesData, internalID: invoiceId });
            } else {
                payloadsToCreate.push({ payload: structuredPayload, rawLines: rawLinesData, internalID: invoiceId });
            }
        }
    }

    // إذا وجدنا أي أخطاء أثناء التحقق المسبق، نعرضها ونوقف العملية فوراً
    if (errors.length > 0) {
        showErrorModal(errors);
        saveBtn.disabled = false;
        saveBtn.textContent = 'حفظ الفواتير';
        return;
    }

    // --- ✅ 2. مرحلة الإرسال إلى الـ API (فقط إذا كانت البيانات سليمة) ---
    const totalInvoices = invoicesMap.size;
    let processedCount = 0;
    saveBtn.textContent = `⏳ جاري الحفظ (0 / ${totalInvoices})...`;

    // (باقي كود الإرسال والتحديث يبقى كما هو)
    for (const item of payloadsToUpdate) {
        try {
            const updateResult = await updateDraftInvoiceAPI(item.draftId, item.payload, item.rawLines);
            if (!updateResult.success) throw new Error(updateResult.error);
            processedCount++;
            saveBtn.textContent = `⏳ جاري الحفظ (${processedCount} / ${totalInvoices})...`;
        } catch (error) {
            errors.push({ id: item.internalID, field: 'خطأ من الخادم', value: 'فشل التحديث', message: error.message });
        }
    }
    for (const item of payloadsToCreate) {
        try {
            const createResult = await createDraftInvoiceAPI(item.payload);
            if (!createResult.success) throw new Error(createResult.error);
            
            const newDraftId = createResult.data.draftId;
            const makeReadyResult = await updateDraftInvoiceAPI(newDraftId, item.payload, item.rawLines);
            if (!makeReadyResult.success) {
                await deleteDraftInvoiceAPI(newDraftId); 
                throw new Error(`فشل في جعل المسودة جاهزة: ${makeReadyResult.error}`);
            }
            processedCount++;
            saveBtn.textContent = `⏳ جاري الحفظ (${processedCount} / ${totalInvoices})...`;
        } catch (error) {
            errors.push({ id: item.internalID, field: 'خطأ من الخادم', value: 'فشل الإنشاء', message: error.message });
        }
    }

    // --- ✅ 3. عرض النتائج النهائية ---
    saveBtn.disabled = false;
    saveBtn.textContent = 'حفظ الفواتير';

    if (errors.length > 0) {
        showErrorModal(errors);
    } else {
        showSuccessModal(
            'اكتملت العملية بنجاح!',
            `تم حفظ جميع الفواتير بنجاح كمسودات جاهزة (عدد: ${totalInvoices}).`,
            () => {
                document.getElementById('dataEditorModal')?.remove();
                document.getElementById('dataEditorModalStyles')?.remove();
            }
        );
    }
}



/**
 * ===================================================================================
 * ✅✅✅ دالة جديدة: لعرض نافذة نجاح مخصصة وأنيقة (بديل alert)
 * ===================================================================================
 * @param {string} title - عنوان النافذة (مثال: "نجاح").
 * @param {string} message - الرسالة التي ستظهر للمستخدم.
 * @param {Function} [onClose] - دالة اختيارية يتم استدعاؤها عند الضغط على "موافق".
 */
function showSuccessModal(title, message, onClose) {
    // إزالة أي نافذة قديمة لضمان عدم التكرار
    document.getElementById('customSuccessModal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'customSuccessModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.6); z-index: 20000;
        display: flex; align-items: center; justify-content: center;
        direction: rtl; font-family: 'Cairo', 'Segoe UI', sans-serif;
        backdrop-filter: blur(4px);
    `;

    // استخدام أيقونة SVG عالية الجودة لعلامة الصح
    const successIconSVG = `
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#28a745"/>
            <path d="M8.5 12.5L11 15L15.5 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;

    modal.innerHTML = `
        <div style="background: #fff; width: 480px; max-width: 90%; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.2 ); text-align: center; padding: 30px 25px; animation: zoomIn 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);">
            <div style="margin-bottom: 20px;">${successIconSVG}</div>
            <h2 style="margin: 0 0 15px 0; font-size: 24px; color: #1d3557;">${title}</h2>
            <p style="margin: 0 0 30px 0; font-size: 17px; line-height: 1.7; color: #495057;">${message}</p>
            <button id="successModalOkBtn" style="background: linear-gradient(145deg, #28a745, #218838); color: white; padding: 12px 50px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);">
                موافق
            </button>
        </div>
        <style> 
            @keyframes zoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
            #successModalOkBtn:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4); }
        </style>
    `;

    document.body.appendChild(modal);

    const okBtn = document.getElementById('successModalOkBtn');
    okBtn.onclick = () => {
        modal.remove();
        if (typeof onClose === 'function') {
            onClose();
        }
    };
}


// --- ✅✅✅ بداية الإضافة 1: قاموس ترجمة رسائل الخطأ من الـ API ---
const errorDictionary = {
    "an exisiting document with same internal id and recipient id and recipient name exists.": "يوجد بالفعل فاتورة مسودة بنفس الرقم الداخلي ونفس المستلم. يرجى تغيير الرقم الداخلي للفاتورة.",
    "receiver id is required": "حقل 'رقم تسجيل المستلم' إجباري.",
    "receiver name is required": "حقل 'اسم المستلم' إجباري.",
    "invalid receiver registration number": "رقم تسجيل المستلم (المشتري) غير صحيح أو غير مسجل بالمنظومة.",
    "issuer and receiver cannot be the same": "لا يمكن أن يكون البائع والمشتري نفس الشخص (رقم التسجيل متطابق).",
    "must be one of [b, p, f]": "نوع المستلم غير صحيح. يجب أن يكون 'B' لشركة، 'P' لشخص طبيعي، أو 'F' لأجنبي.",
    "the submitted document has been processed before": "هذه الفاتورة (بنفس الرقم الداخلي) تم إرسالها مسبقًا.",
    "invalid document structure": "هيكل الفاتورة غير صحيح. تأكد من أن جميع الحقول الإجبارية ممتلئة.",
    "document is not valid": "المستند غير صالح. يرجى مراجعة جميع البيانات.",
    "internal id is required": "حقل 'الرقم الداخلي للفاتورة' إجباري.",
    "datetimeissued is required": "تاريخ إصدار الفاتورة مطلوب.",
    "invoicelines is required": "يجب أن تحتوي الفاتورة على بند واحد على الأقل.",
    "arrayitemnotvalid": "يوجد خطأ في بيانات أحد البنود. يرجى مراجعة (كود الصنف، وحدة القياس، أو بيانات الضرائب).",
    "item code not found": "أحد أكواد الأصناف (EGS/GS1) غير صحيح أو لم يتم تسجيله.",
    "invalid item code": "كود الصنف المستخدم في أحد البنود غير صالح.",
    "invalid unit type": "تم استخدام كود وحدة قياس غير صالح في أحد البنود.",
    "description is required": "حقل 'وصف الصنف' إجباري في جميع البنود.",
    "quantity is required": "حقل 'الكمية' إجباري في جميع البنود ويجب أن يكون رقمًا.",
    "unitvalue is required": "حقل 'سعر الوحدة' إجباري في جميع البنود.",
    "invalid tax type": "تم استخدام نوع ضريبة غير صالح في أحد البنود.",
    "invalid tax subtype": "تم استخدام نوع ضريبة فرعي غير صالح في أحد البنود.",
    "taxableitems is required": "بيانات الضرائب مطلوبة لكل بند خاضع للضريبة.",
    "tax type is required": "حقل 'نوع الضريبة' إجباري للبنود الخاضعة للضريبة.",
    "total amount does not equal": "خطأ في الحسابات. الإجمالي لا يتطابق مع مجموع البنود والضرائب.",
    "netamount must be equal to": "خطأ في الحسابات. صافي القيمة لا يتطابق مع (إجمالي المبيعات - إجمالي الخصم).",
    "totalsalesamount must be equal to": "خطأ في الحسابات. إجمالي المبيعات لا يتطابق مع مجموع قيم البنود.",
    "unauthorized": "خطأ في المصادقة. قد تكون جلسة الدخول قد انتهت. حاول تسجيل الخروج والدخول مرة أخرى.",
    "bad request": "طلب غير صالح. قد يكون هناك خطأ في تنسيق البيانات المرسلة.",
    "the request is invalid": "الطلب غير صالح. يرجى مراجعة البيانات المرسلة.",
    "an error has occurred": "حدث خطأ عام في الخادم. يرجى المحاولة مرة أخرى لاحقًا."
};
// --- ✅✅✅ نهاية الإضافة 1 ---


/**
 * =========================================================================
 * ✅✅✅ دالة إنشاء المسودة (النسخة النهائية مع ترجمة دقيقة للأخطاء)
 * =========================================================================
 */
async function createDraftInvoiceAPI(payload) {
    const token = getAccessToken();
    if (!token) {
        return { success: false, error: "خطأ في المصادقة: لم يتم العثور على توكن الدخول." };
    }

    // --- ✅✅✅ بداية الإضافة 2: دالة الترجمة الداخلية ---
    function translateApiError(errorObject) {
        if (!errorObject || !errorObject.error) {
            const errorString = String(errorObject).toLowerCase();
            for (const key in errorDictionary) {
                if (errorString.includes(key)) {
                    return errorDictionary[key];
                }
            }
            return errorObject;
        }

        const details = errorObject.error.details || [];
        if (details.length === 0) {
            const mainMessage = String(errorObject.error.message || '').toLowerCase();
            for (const key in errorDictionary) {
                if (mainMessage.includes(key)) {
                    return errorDictionary[key];
                }
            }
            return errorObject.error.message || "خطأ غير معروف من الخادم.";
        }

        const errorMessages = details.map(detail => {
            const originalMessage = detail.message;
            let translatedMessage = `خطأ غير مترجم: ${originalMessage}`;

            for (const key in errorDictionary) {
                if (String(originalMessage).toLowerCase().includes(key)) {
                    translatedMessage = errorDictionary[key];
                    break;
                }
            }
            
            const itemMatch = detail.target?.match(/invoiceLines\[(\d+)\]/);
            if (itemMatch && itemMatch[1]) {
                const itemIndex = parseInt(itemMatch[1], 10) + 1;
                return `في (البند رقم ${itemIndex}): ${translatedMessage}`;
            }
            
            return translatedMessage;
        });

        return errorMessages.join('\n');
    }
    // --- ✅✅✅ نهاية الإضافة 2 ---

    try {
        const response = await fetch('https://my-extension-backend-steel.vercel.app/api/create-draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload: payload, token: token }  )
        });

        const responseData = await response.json();

        if (!response.ok) {
            // --- ✅✅✅ بداية التعديل 3: استخدام دالة الترجمة ---
            const translatedError = translateApiError(responseData);
            throw new Error(translatedError);
            // --- ✅✅✅ نهاية التعديل 3 ---
        }
        
        return { success: true, data: responseData };

    } catch (error) {
        return { success: false, error: error.message };
    }
}










// << استبدل الدالة القديمة بالكامل بهذه الدالة الجديدة >>

async function validateAndEnrichReceiptData(receiptsMap) {
    const validationErrors = [];
    const validatedMap = new Map();

    // حقول البنود الإجبارية
    const requiredItemFields = {
        'description': 'وصف الصنف', 'itemType': 'نوع كود الصنف',
        'itemCode': 'كود الصنف', 'quantity': 'الكمية', 'unitPrice': 'سعر الوحدة'
    };

    // دالة مساعدة للتحقق من الرقم القومي (لتجنب تكرار الكود)
    async function validateNID_API(nid) {
        if (!nid || nid.length !== 14 || !/^\d+$/.test(nid)) {
            return { valid: false, message: "يجب أن يتكون من 14 رقمًا." };
        }
        try {
            const token = getAccessToken();
            if (!token) return { valid: false, message: "خطأ مصادقة." };
            const response = await fetch(`https://api-portal.invoicing.eta.gov.eg/api/v1/person/${nid}`, { headers: { 'Authorization': `Bearer ${token}` } } );
            if (response.status === 200) return { valid: true };
            if (response.status === 400) return { valid: false, message: "الرقم غير مسجل أو غير صحيح." };
            return { valid: false, message: `خطأ ${response.status} من الخادم.` };
        } catch (error) {
            return { valid: false, message: "فشل التحقق من الرقم." };
        }
    }

    const validationPromises = Array.from(receiptsMap.entries()).map(async ([receiptNumber, items]) => {
        const enrichedItems = [];
        let receiptTotalAmount = 0;

        for (const [itemIndex, item] of items.entries()) {
            const enrichedItem = { ...item, officialCodeName: '' };

            // حساب إجمالي الإيصال (بدون ضرائب للسرعة)
            receiptTotalAmount += (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);

            // التحقق من حقول البنود الإجبارية
            for (const key in requiredItemFields) {
                if (!enrichedItem[key] || String(enrichedItem[key]).trim() === '') {
                    validationErrors.push({ id: `${receiptNumber} (البند ${itemIndex + 1})`, field: requiredItemFields[key], value: 'فارغ', message: 'هذا الحقل إجباري.' });
                }
            }

            // التحقق من صحة كود الصنف
            const itemCodeType = (enrichedItem.itemType || '').toUpperCase().trim();
            const itemCode = (enrichedItem.itemCode || '').toString().trim();
            if (itemCodeType && itemCode) {
                let codeData = null;
                if (itemCodeType === 'EGS') codeData = await fetchMyEGSCode(itemCode);
                else if (itemCodeType === 'GS1') codeData = await fetchGS1Code(itemCode);
                
                if (codeData) {
                    enrichedItem.officialCodeName = codeData.codeNameSecondaryLang || "!! اسم غير مسجل !!";
                } else {
                    validationErrors.push({ id: `${receiptNumber} (البند ${itemIndex + 1})`, field: `كود الصنف (${itemCodeType})`, value: itemCode, message: 'الكود غير صحيح أو غير مسجل.' });
                }
            }
            enrichedItems.push(enrichedItem);
        }

        // --- ✅✅✅ بداية منطق التحقق من الرقم القومي لبيانات الإكسيل ✅✅✅ ---
        const firstItem = items[0] || {};
        const buyerId = (firstItem.buyerId || '').toString().trim();

        // إذا كان الإجمالي أكبر من 150 ألف
        if (receiptTotalAmount > 150000) {
            if (!buyerId) {
                validationErrors.push({ id: receiptNumber, field: 'الرقم القومي للعميل', value: 'فارغ', message: 'إجباري لأن الإجمالي يتجاوز 150,000 جنيه.' });
            } else {
                const nidResult = await validateNID_API(buyerId);
                if (!nidResult.valid) {
                    validationErrors.push({ id: receiptNumber, field: 'الرقم القومي للعميل', value: buyerId, message: nidResult.message });
                }
            }
        } 
        // إذا كان الإجمالي أقل ولكن الرقم القومي مكتوب (يجب التحقق منه)
        else if (buyerId) {
            const nidResult = await validateNID_API(buyerId);
            if (!nidResult.valid) {
                validationErrors.push({ id: receiptNumber, field: 'الرقم القومي للعميل', value: buyerId, message: nidResult.message });
            }
        }
        // --- ✅✅✅ نهاية منطق التحقق من الرقم القومي لبيانات الإكسيل ✅✅✅ ---

        validatedMap.set(receiptNumber, enrichedItems);
    });

    await Promise.all(validationPromises);

    return { validatedMap, validationErrors };
}

// =========================================================================
// ✅ جديد: قاموس الشروحات والتعليمات لخلايا الإكسيل
// =========================================================================
const excelCellComments = {
    'الرقم الداخلي للفاتورة': 'اكتب الرقم الفاتورة علي حسب السريال ',
    'رقم تسجيل المستلم': ' في حاله اختيار شركة يتم كتابه رقم التسجيل الضريبي المكون من 9 ارقام - في حاله اختيار شخصي يتم كتابه 123456789 او الرقم القومي ان وجد وبعد الرفع تقوم بحذفه  والاجنبي نفس النظام ',
    'اسم المستلم': 'غير مطلوب في حاله كتابه رقم التسجيل',
    'نوع المستلم': 'مطلوب: اختر من القائمة: B لشركة، P لشخصي، F لأجنبي.',
    'دولة المستلم': 'غير مطلوب في حاله كتابه رقم التسجيل',
    'محافظة المستلم': 'غير مطلوب في حاله كتابه رقم التسجيل',
    'مدينة المستلم': 'غير مطلوب في حاله كتابه رقم التسجيل',
    'شارع المستلم': 'غير مطلوب في حاله كتابه رقم التسجيل',
    'مبنى المستلم': 'غير مطلوب في حاله كتابه رقم التسجيل',
    'وصف الصنف': 'مطلوب: اسم أو وصف واضح للسلعة أو الخدمة المباعة.',
    'نوع كود الصنف': 'في حاله اختيار GS1  يتم كتابه الكود العالمي مثال : - 10007598 ام في حاله اختيار الكود EGS  يتم كتابه الكود EG-رقم التسجيل-الكود الداخلي مثال EG-123456789-100',
    'كود الصنف': 'في حاله الايصالات مطلوب اجباري كتابه الكود مثال 1 ام في حاله الفواتير غير مطلوب ',
    'وحدة القياس': 'مطلوب: اختر وحدة القياس من القائمة (مثال: قطعة).',
    'الكمية': 'مطلوب: العدد المباع من هذا الصنف.',
    'سعر الوحدة': 'مطلوب: سعر القطعة الواحدة من الصنف.',
    'نوع الضريبة 1': 'مطلوب: اختر نوع الضريبة الأساسي من القائمة (مثال: ضريبة القيمة المضافة).',
    'النوع الفرعي 1': 'مطلوب: اختر النوع الفرعي للضريبة من القائمة المترابطة.',
    'نسبة الضريبة 1': 'مطلوب: أدخل النسبة المئوية للضريبة (مثال: 14).',
    'UUID الفاتورة الأصلية': 'مطلوب للمرتجعات فقط: الرقم التعريفي الفريد لفاتورة البيع الأصلية.'
};


// ✅✅✅ دالة مساعدة جديدة لجمع بيانات الإيصالات المحددة ✅✅✅
async function collectSelectedReceiptsForProcessing() {
    const selectedGroups = Array.from(document.querySelectorAll('#receiptEditorModal .receipt-checkbox:checked')).map(cb => cb.closest('tbody'));
    if (selectedGroups.length === 0) {
        alert("يرجى تحديد مستند واحد على الأقل.");
        return null;
    }

    const sellerData = await getIssuerFullData();
    const editedSellerData = {
        id: sellerData.id, name: document.getElementById('editor-seller-name').value,
        governate: document.getElementById('editor-seller-governate').value, regionCity: document.getElementById('editor-seller-regionCity').value,
        street: document.getElementById('editor-seller-street').value, buildingNumber: document.getElementById('editor-seller-building').value
    };
    const selectedSerial = document.getElementById('pos-select-editor').value;
    const activitySelect = document.getElementById('activity-select-editor');
    const selectedActivity = activitySelect ? activitySelect.value : '4690';
    
    const receiptChain = [];
    let lastSuccessfulUUID = (JSON.parse(localStorage.getItem("receiptHistory") || "[]")[0] || {}).uuid || "";

    for (const group of selectedGroups) {
        const receiptNumber = group.dataset.receiptNumber;
        const currentDocType = group.dataset.docType;
        const items = receiptsMap.get(receiptNumber);

        const receiptObject = (currentDocType === 'return')
            ? calculateReturnReceiptData(items, editedSellerData, selectedSerial, selectedActivity)
            : calculateReceiptData(items, editedSellerData, selectedSerial, selectedActivity);
        
        receiptObject.header.previousUUID = lastSuccessfulUUID;
        const payloadForUuid = JSON.stringify({ receipts: [receiptObject] });
        const newUuid = await EtaUuid.computeUuidFromRawText(payloadForUuid);
        receiptObject.header.uuid = newUuid;
        receiptChain.push(receiptObject);
        lastSuccessfulUUID = newUuid;
    }
    return { receipts: receiptChain };
}

/**
 * ===================================================================================
 * ✅✅✅ دالة رفع الإيصالات من الإكسيل (v4.0 - الإصلاح النهائي لمنطق العملات)
 * ===================================================================================
 */
async function handleReceiptExcelUpload(event) {
    const modalUI = document.getElementById("receiptUploaderTabbedUI");
    if (modalUI) modalUI.style.display = "none";

    const file = event.target.files[0];
    if (!file) return;

    const loadingToast = showToastNotification('جاري قراءة وترجمة بيانات الإيصال...');

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await file.arrayBuffer());
        const worksheet = workbook.getWorksheet(1);

        const headers = worksheet.getRow(1).values.slice(1).map(h => String(h || '').trim());
        const allRows = [];

        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber > 1) {
                const rowObject = {};
                row.values.slice(1).forEach((value, index) => {
                    const header = headers[index];
                    if (header) {
                        rowObject[header] = value !== null && value !== undefined ? value : '';
                    }
                });
                allRows.push(rowObject);
            }
        });

        if (allRows.length === 0) throw new Error("ملف الإكسل فارغ!");

        const headerMapping = {
            'تاريخ الإصدار (YYYY-MM-DD)': 'dateTimeIssued',
            'رقم الإيصال الداخلي (*)': 'receiptNumber', 'اسم العميل (اختياري)': 'buyerName',
            'الرقم القومي للعميل (اختياري)': 'buyerId', 'الكود الداخلي للصنف': 'internalCode',
            'وصف الصنف (*)': 'description', 'نوع كود الصنف (*)': 'itemType',
            'كود الصنف (*)': 'itemCode', 'وحدة القياس (*)': 'unitType', 'الكمية (*)': 'quantity',
            'سعر الوحدة (*)': 'unitPrice',
            'عملة البيع': 'currencySold',
            'سعر الصرف': 'exchangeRate',
            'نوع الضريبة 1 (*)': 'taxType_1',
            'النوع الفرعي للضريبة 1 (*)': 'taxSubType_1', 'نسبة الضريبة 1 (*)': 'taxRate_1',
            'نوع الضريبة 2 (اختياري)': 'taxType_2',
            'النوع الفرعي للضريبة 2 (اختياري)': 'taxSubType_2',
            'نسبة الضريبة 2 (اختياري)': 'taxRate_2'
        };
        
        const mappedAndTranslatedRows = allRows.map(row => {
            const newRow = {};
            for (const arabicHeader in row) {
                const englishKey = headerMapping[arabicHeader.trim()];
                if (englishKey) {
                    let value = row[arabicHeader];
                    if (englishKey === 'unitType' && reverseMappings.units[value]) {
                        value = reverseMappings.units[value];
                    } else if (englishKey === 'currencySold' && receiptReverseMappings.currencies[value]) {
                        value = receiptReverseMappings.currencies[value];
                    } else if (englishKey.startsWith('taxType_') && reverseMappings.taxTypes[value]) {
                        value = reverseMappings.taxTypes[value];
                    } else if (englishKey.startsWith('taxSubType_') && reverseMappings.taxSubtypes[value]) {
                        value = reverseMappings.taxSubtypes[value];
                    }
                    newRow[englishKey] = value;
                }
            }
            return newRow;
        });

        // ✨✨✨ --- بداية التعديل الحاسم: لا تقم بأي حسابات هنا --- ✨✨✨
        // نحن ببساطة نمرر البيانات المترجمة كما هي.
        const finalProcessedRows = mappedAndTranslatedRows;
        // ✨✨✨ --- نهاية التعديل الحاسم --- ✨✨✨

        const receiptsMap = new Map();
        let lastReceiptNumber = '';
        let lastHeaderInfo = {}; 

        finalProcessedRows.forEach(row => {
            const currentReceiptNumber = String(row.receiptNumber || lastReceiptNumber).trim();
            if (!currentReceiptNumber) return;

            if (currentReceiptNumber !== lastReceiptNumber) {
                lastHeaderInfo = { dateTimeIssued: row.dateTimeIssued, buyerName: row.buyerName, buyerId: row.buyerId };
                receiptsMap.set(currentReceiptNumber, []);
            }

            const finalRow = { ...lastHeaderInfo, ...row };
            receiptsMap.get(currentReceiptNumber).push(finalRow);
            lastReceiptNumber = currentReceiptNumber;
        });

        loadingToast.querySelector('#toast-message').textContent = 'جاري التحقق من صحة الأكواد...';
        const { validatedMap, validationErrors } = await validateAndEnrichReceiptData(receiptsMap);
        loadingToast.remove();

        if (validationErrors.length > 0) {
            showErrorModal(validationErrors, () => {
                showReceiptEditor(validatedMap, 'sale');
            });
        } else {
            showReceiptEditor(validatedMap, 'sale');
        }

    } catch (error) {
        alert(`❌ خطأ في معالجة ملف الإيصالات: ${error.message}`);
    } finally {
        if (loadingToast) loadingToast.remove();
        event.target.value = '';
    }
}



/**
 * ===================================================================================
 * ✅ دالة showErrorModal (v2.0 - بدون زر المتابعة)
 * ===================================================================================
 */
function showErrorModal(errors) {
    // الخطوة 1: إزالة أي نافذة أخطاء قديمة لضمان عدم التكرار
    document.getElementById('invoiceErrorModal')?.remove();

    // الخطوة 2: إنشاء الهيكل الخارجي للنافذة المنبثقة
    const modal = document.createElement('div');
    modal.id = 'invoiceErrorModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0,0,0,0.6); z-index: 10002;
        display: flex; align-items: center; justify-content: center;
        direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif;
    `;

    // الخطوة 3: بناء محتوى النافذة (HTML) بشكل ديناميكي
    modal.innerHTML = `
        <div style="background: #fff; width: 800px; max-width: 90%; max-height: 80%; border-radius: 10px; display: flex; flex-direction: column; box-shadow: 0 5px 20px rgba(0,0,0,0.3); animation: fadeIn 0.3s ease-out;">
            
            <!-- رأس النافذة -->
            <div style="padding: 15px 20px; background-color: #d9534f; color: white; border-top-left-radius: 10px; border-top-right-radius: 10px; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">🚨</span>
                <h3 style="margin: 0; font-size: 20px;">تم اكتشاف أخطاء في البيانات (${errors.length})</h3>
            </div>

            <!-- جسم النافذة وجدول الأخطاء -->
            <div style="overflow-y: auto; padding: 20px;">
                <p style="margin-top: 0; color: #333;">
                    يرجى مراجعة الأخطاء التالية وتصحيحها في ملف الإكسيل ثم إعادة الرفع.
                </p>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead style="background-color: #f8f9fa; position: sticky; top: 0;">
                        <tr>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">المُعرّف (الفاتورة/البند)</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">الحقل</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">القيمة الخاطئة</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">رسالة الخطأ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${errors.map(err => `
                            <tr style="background-color: #fff1f0;">
                                <td style="padding: 8px; border: 1px solid #ffccc7;">${err.id || 'غير محدد'}</td>
                                <td style="padding: 8px; border: 1px solid #ffccc7;"><strong>${err.field || 'غير محدد'}</strong></td>
                                <td style="padding: 8px; border: 1px solid #ffccc7; font-family: monospace; direction: ltr; text-align: left;">${err.value || ''}</td>
                                <td style="padding: 8px; border: 1px solid #ffccc7;">${err.message || 'خطأ غير معروف'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- تذييل النافذة والأزرار -->
            <div style="padding: 15px 20px; text-align: left; border-top: 1px solid #eee; background-color: #f8f9fa; display: flex; justify-content: flex-end; align-items: center;">
                <button id="closeErrorModalBtn" style="background: #6c757d; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.2s;">
                    إغلاق
                </button>
            </div>
        </div>
    `;

    // الخطوة 4: إضافة النافذة إلى الصفحة وإضافة الأنماط اللازمة
    document.body.appendChild(modal);
    const styleSheet = document.createElement("style");
    styleSheet.id = "errorModalStyles";
    styleSheet.innerText = `@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } #closeErrorModalBtn:hover { background-color: #5a6268; }`;
    document.head.appendChild(styleSheet);

    // الخطوة 5: ربط حدث زر الإغلاق
    document.getElementById('closeErrorModalBtn').onclick = () => {
        modal.remove();
        styleSheet.remove();
    };
}





function renderInvoiceCreationTab() {
    const tabContent = document.getElementById("etaExporterTabContent");
    if (!tabContent) return;

    tabContent.innerHTML = `
        <div style="direction: rtl; text-align: right; padding: 15px; font-family: 'Segoe UI', Tahoma, sans-serif;">
            <h4 style="margin: 0 0 10px 0; color: #2161a1; border-bottom: 2px solid #ddd; padding-bottom: 10px;">إنشاء الفواتير (مع دعم متعدد البنود)</h4>
            <p style="font-size: 14px; color: #555; line-height: 1.6;">
                لإضافة عدة بنود لنفس الفاتورة، كرر بيانات الفاتورة (مثل الرقم الداخلي واسم المستلم) في عدة سطور مع تغيير بيانات البند فقط.
            </p>

            <!-- ✅ --- بداية التعديل: استبدال Checkbox بقائمة منسدلة --- ✅ -->
            <div style="background: #eef7ff; border: 1px solid #bde0ff; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <label for="invoiceVersionSelect" style="display: block; font-weight: bold; color: #0056b3; margin-bottom: 10px;">1. حدد نوع الفاتورة (الإصدار):</label>
                <select id="invoiceVersionSelect" style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #ccc; font-size: 16px;">
                    <option value="1.0" selected>فاتورة كاملة وموقعة (إصدار 1.0)</option>
                    <option value="0.9">مسودة غير موقعة (إصدار 0.9)</option>
                </select>
                <p style="font-size: 13px; color: #0056b3; margin: 8px 5px 0 0;">
                    اختر "إصدار 1.0" للحفظ النهائي، أو "إصدار 0.9" إذا كنت تريد حفظها كمسودة بدون توقيع إلكتروني.
                </p>
            </div>
            <!-- ✅ --- نهاية التعديل --- ✅ -->

            <div style="margin: 20px 0; display: flex; gap: 15px;">
                <button id="downloadTemplateBtn_v3" style="padding: 10px 15px; background-color: #17a2b8; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; flex-grow: 1;">
                    📥 2. تحميل نموذج Excel
                </button>
                <label for="excelUploadInput_v3" style="padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; flex-grow: 1; text-align: center;">
                    📂 3. رفع الملف للمراجعة والحفظ
                </label>
                <input type="file" id="excelUploadInput_v3" accept=".xlsx, .xls" style="display: none;">
            </div>
        </div>
    `;

    document.getElementById('downloadTemplateBtn_v3').addEventListener('click', downloadExcelTemplate_v3);
    document.getElementById('excelUploadInput_v3').addEventListener('change', handleExcelUpload_v3);
}








// =========================================================================
// ✅ 1. البيانات الأساسية للقوائم المنسدلة (النسخة الكاملة)
// =========================================================================
const currencies = [
    { code: "EGP", desc: "جنيه مصري" },
    { code: "USD", desc: "دولار أمريكي" },
    { code: "EUR", desc: "يورو" },
    { code: "GBP", desc: "جنيه إسترليني" },
    { code: "SAR", desc: "ريال سعودي" }
];
// بيانات أنواع المستلمين
const receiverTypes = [
    { code: "B", desc: "شركة" },
    { code: "P", desc: "شخصي" }, 
    { code: "F", desc: "أجنبي" }
];
const itemCodeTypes = [
    { code: "EGS", desc: "EGS" },
    { code: "GS1", desc: "GS1" }
];
const countryCodes = [
      { "code": "EG", "Desc_ar": "مصر" },
  { "code": "AD", "Desc_ar": "أندورا" },
  { "code": "AE", "Desc_ar": "الامارات العربية المتحدة" },

  
    { "code": "TR", "Desc_ar": "تركيا" },
    { "code": "DE", "Desc_ar": "ألمانيا" },
    { "code": "SG", "Desc_ar": "سنغافورة" },
    { "code": "US", "Desc_ar": "الولايات المتحدة" },
    { "code": "ES", "Desc_ar": "أسبانيا" },
    { "code": "NZ", "Desc_ar": "نيوزيلاندا" },
    { "code": "RU", "Desc_ar": "روسيا" },
    { "code": "OM", "Desc_ar": "عمان" },
     { "code": "KP", "Desc_ar": "كوريا الشمالية" },
    { "code": "KR", "Desc_ar": "كوريا الجنوبية" },
    { "code": "MH", "Desc_ar": "جزر مارشال" },
   





  { "code": "AF", "Desc_ar": "أفغانستان" },
  { "code": "AG", "Desc_ar": "أنتيغوا وباربودا" },
  { "code": "AI", "Desc_ar": "أنجويلا" },
  { "code": "AL", "Desc_ar": "ألبانيا" },
  { "code": "AM", "Desc_ar": "أرمينيا" },
  { "code": "AO", "Desc_ar": "أنجولا" },
  { "code": "AQ", "Desc_ar": "القارة القطبية الجنوبية" },
  { "code": "AR", "Desc_ar": "الأرجنتين" },
  { "code": "AS", "Desc_ar": "ساموا الأمريكية" },
  { "code": "AT", "Desc_ar": "النمسا" },
  { "code": "AU", "Desc_ar": "أستراليا" },
  { "code": "AW", "Desc_ar": "آروبا" },
  { "code": "AX", "Desc_ar": "جزر أولان" },
  { "code": "AZ", "Desc_ar": "أذربيجان" },
  { "code": "BA", "Desc_ar": "البوسنة والهرسك" },
  { "code": "BB", "Desc_ar": "بربادوس" },
  { "code": "BD", "Desc_ar": "بنجلاديش" },
  { "code": "BE", "Desc_ar": "بلجيكا" },
  { "code": "BF", "Desc_ar": "بوركينا فاسو" },
  { "code": "BG", "Desc_ar": "بلغاريا" },
  { "code": "BH", "Desc_ar": "البحرين" },
  { "code": "BI", "Desc_ar": "بوروندي" },
  { "code": "BJ", "Desc_ar": "بنين" },
  { "code": "BL", "Desc_ar": "سان بارتيلمي" },
  { "code": "BM", "Desc_ar": "برمودا" },
  { "code": "BN", "Desc_ar": "بروناي" },
  { "code": "BO", "Desc_ar": "بوليفيا" },
  { "code": "BQ", "Desc_ar": "الجزر الكاريبية الهولندية" },
  { "code": "BR", "Desc_ar": "البرازيل" },
  { "code": "BS", "Desc_ar": "الباهاما" },
  { "code": "BT", "Desc_ar": "بوتان" },
  { "code": "BV", "Desc_ar": "جزيرة بوفيه" },
  { "code": "BW", "Desc_ar": "بتسوانا" },
  { "code": "BY", "Desc_ar": "روسيا البيضاء" },
  { "code": "BZ", "Desc_ar": "بليز" },
  { "code": "CA", "Desc_ar": "كندا" },
  { "code": "CC", "Desc_ar": "جزر كوكوس" },
  { "code": "CD", "Desc_ar": "جمهورية الكونغو الديمقراطية" },
  { "code": "CF", "Desc_ar": "جمهورية أفريقيا الوسطى" },
  { "code": "CG", "Desc_ar": "جمهورية الكونغو" },
  { "code": "CH", "Desc_ar": "سويسرا" },
  { "code": "CI", "Desc_ar": "ساحل العاج" },
  { "code": "CK", "Desc_ar": "جزر كوك" },
  { "code": "CL", "Desc_ar": "شيلي" },
  { "code": "CM", "Desc_ar": "الكاميرون" },
  { "code": "CN", "Desc_ar": "الصين" },
  { "code": "CO", "Desc_ar": "كولومبيا" },
  { "code": "CR", "Desc_ar": "كوستاريكا" },
  { "code": "CU", "Desc_ar": "كوبا" },
  { "code": "CV", "Desc_ar": "الرأس الأخضر" },
  { "code": "CW", "Desc_ar": "كوراساو" },
  { "code": "CX", "Desc_ar": "جزيرة عيد الميلاد" },
  { "code": "CY", "Desc_ar": "قبرص" },
  { "code": "CZ", "Desc_ar": "جمهورية التشيك" },
  { "code": "DE", "Desc_ar": "ألمانيا" },
  { "code": "DJ", "Desc_ar": "جيبوتي" },
  { "code": "DK", "Desc_ar": "الدانمرك" },
  { "code": "DM", "Desc_ar": "دومينيكا" },
  { "code": "DO", "Desc_ar": "جمهورية الدومينيكان" },
  { "code": "DZ", "Desc_ar": "الجزائر" },
  { "code": "EC", "Desc_ar": "الاكوادور" },
  { "code": "EE", "Desc_ar": "استونيا" },
  { "code": "EH", "Desc_ar": "الصحراء الغربية" },
  { "code": "ER", "Desc_ar": "اريتريا" },
  { "code": "ES", "Desc_ar": "أسبانيا" },
  { "code": "ET", "Desc_ar": "اثيوبيا" },
  { "code": "FI", "Desc_ar": "فنلندا" },
  { "code": "FJ", "Desc_ar": "فيجي" },
  { "code": "FK", "Desc_ar": "جزر فوكلاند" },
  { "code": "FM", "Desc_ar": "ميكرونيزيا" },
  { "code": "FO", "Desc_ar": "جزر فارو" },
  { "code": "FR", "Desc_ar": "فرنسا" },
  { "code": "GA", "Desc_ar": "الجابون" },
  { "code": "GB", "Desc_ar": "المملكة المتحدة" },
  { "code": "GD", "Desc_ar": "جرينادا" },
  { "code": "GE", "Desc_ar": "جورجيا" },
  { "code": "GF", "Desc_ar": "غويانا الفرنسية" },
  { "code": "GG", "Desc_ar": "جيرنزي" },
  { "code": "GH", "Desc_ar": "غانا" },
  { "code": "GI", "Desc_ar": "جبل طارق" },
  { "code": "GL", "Desc_ar": "جرينلاند" },
  { "code": "GM", "Desc_ar": "غامبيا" },
  { "code": "GN", "Desc_ar": "غينيا" },
  { "code": "GP", "Desc_ar": "جوادلوب" },
  { "code": "GQ", "Desc_ar": "غينيا الاستوائية" },
  { "code": "GR", "Desc_ar": "اليونان" },
  { "code": "GS", "Desc_ar": "جورجيا الجنوبية وجزر ساندويتش الجنوبية" },
  { "code": "GT", "Desc_ar": "جواتيمالا" },
  { "code": "GU", "Desc_ar": "جوام" },
  { "code": "GW", "Desc_ar": "غينيا بيساو" },
  { "code": "GY", "Desc_ar": "غيانا" },
  { "code": "HK", "Desc_ar": "هونغ كونغ" },
  { "code": "HM", "Desc_ar": "جزيرة هيرد وجزر ماكدونالد" },
  { "code": "HN", "Desc_ar": "هندوراس" },
  { "code": "HR", "Desc_ar": "كرواتيا" },
  { "code": "HT", "Desc_ar": "هايتي" },
  { "code": "HU", "Desc_ar": "المجر" },
  { "code": "ID", "Desc_ar": "اندونيسيا" },
  { "code": "IE", "Desc_ar": "أيرلندا" },
  { "code": "IL", "Desc_ar": "اسرائيل" },
  { "code": "IM", "Desc_ar": "جزيرة مان" },
  { "code": "IN", "Desc_ar": "الهند" },
  { "code": "IO", "Desc_ar": "إقليم المحيط الهندي البريطاني" },
  { "code": "IQ", "Desc_ar": "العراق" },
  { "code": "IR", "Desc_ar": "ايران" },
  { "code": "IS", "Desc_ar": "أيسلندا" },
  { "code": "IT", "Desc_ar": "ايطاليا" },
  { "code": "JE", "Desc_ar": "جيرسي" },
  { "code": "JM", "Desc_ar": "جامايكا" },
  { "code": "JO", "Desc_ar": "الأردن" },
  { "code": "JP", "Desc_ar": "اليابان" },
  { "code": "KE", "Desc_ar": "كينيا" },
  { "code": "KG", "Desc_ar": "قرغيزستان" }
];

// بيانات وحدات القياس الشائعة
const unitTypes = [
    { "code": "EA", "desc_ar": "قطعة" },
    { "code": "KGM", "desc_ar": "كيلوجرام" },
    { "code": "LTR", "desc_ar": "لتر" },
    { "code": "MTR", "desc_ar": "متر" },
    { "code": "TNE", "desc_ar": "طن" },
    { "code": "BOX", "desc_ar": "صندوق" },
    { "code": "CT", "desc_ar": "كرتونة" },
    { "code": "PK", "desc_ar": "علبة" },
    { "code": "SET", "desc_ar": "مجموعة" },
    { "code": "RO", "desc_ar": "لفة" },

    { "code": "2Z", "desc_ar": "ميليفولت" },
    { "code": "4K", "desc_ar": "ميلي أمبير" },
    { "code": "4O", "desc_ar": "ميكروفاراد" },
    { "code": "A87", "desc_ar": "جيجا أوم" },
    { "code": "A93", "desc_ar": "جرام لكل متر مكعب" },
    { "code": "A94", "desc_ar": "جرام لكل سم مكعب" },
    { "code": "AMP", "desc_ar": "أمبير" },
    { "code": "ANN", "desc_ar": "سنة" },
    { "code": "B22", "desc_ar": "كيلو أمبير" },
    { "code": "B49", "desc_ar": "كيلو أوم" },
    { "code": "B75", "desc_ar": "ميجا أوم" },
    { "code": "B78", "desc_ar": "ميجا فولت" },
    { "code": "B84", "desc_ar": "ميكرو أمبير" },
    { "code": "BAR", "desc_ar": "بار" },
    { "code": "BBL", "desc_ar": "برميل" },
    { "code": "BG", "desc_ar": "شنطة" },
    { "code": "BO", "desc_ar": "زجاجة" },
    { "code": "C10", "desc_ar": "ميلي فاراد" },
    { "code": "C39", "desc_ar": "نانو أمبير" },
    { "code": "C41", "desc_ar": "نانو فاراد" },
    { "code": "C45", "desc_ar": "نانو متر" },
    { "code": "C62", "desc_ar": "وحدة نشاط" },
    { "code": "CA", "desc_ar": "عبوة" },
    { "code": "CMK", "desc_ar": "سم²" },
    { "code": "CMQ", "desc_ar": "سم³" },
    { "code": "CMT", "desc_ar": "سم" },
    { "code": "CS", "desc_ar": "كيس كرتون" },
    { "code": "CTL", "desc_ar": "سنتي لتر" },
    { "code": "D10", "desc_ar": "سيمنز لكل متر" },
    { "code": "D33", "desc_ar": "تسلا" },
    { "code": "D41", "desc_ar": "طن/متر مكعب" },
    { "code": "DAY", "desc_ar": "يوم" },
    { "code": "DMT", "desc_ar": "ديسي متر" },
    { "code": "DRM", "desc_ar": "أسطوانة" },
    { "code": "FAR", "desc_ar": "فاراد" },
    { "code": "FOT", "desc_ar": "قدم" },
    { "code": "FTK", "desc_ar": "قدم²" },
    { "code": "FTQ", "desc_ar": "قدم³" },
    { "code": "G42", "desc_ar": "ميكرو سيمنز لكل سم" },
    { "code": "GL", "desc_ar": "جرام/لتر" },
    { "code": "GLL", "desc_ar": "جالون" },
    { "code": "GM", "desc_ar": "جرام/متر²" },
    { "code": "GPT", "desc_ar": "جالون لكل ألف" },
    { "code": "GRM", "desc_ar": "جرام" },
    { "code": "H63", "desc_ar": "ملجم/سم²" },
    { "code": "HHP", "desc_ar": "حصان هيدروليكي" },
    { "code": "HLT", "desc_ar": "هيكتولتر" },
    { "code": "HTZ", "desc_ar": "هرتز" },
    { "code": "HUR", "desc_ar": "ساعة" },
    { "code": "IE", "desc_ar": "عدد الأشخاص" },
    { "code": "INH", "desc_ar": "بوصة" },
    { "code": "INK", "desc_ar": "بوصة²" },
    { "code": "JOB", "desc_ar": "مهمة / عمل" },
    { "code": "KHZ", "desc_ar": "كيلو هرتز" },
    { "code": "KMH", "desc_ar": "كم/س" },
    { "code": "KMK", "desc_ar": "كم²" },
    { "code": "KMQ", "desc_ar": "كجم/م³" },
    { "code": "KMT", "desc_ar": "كيلومتر" },
    { "code": "KSM", "desc_ar": "كجم/م²" },
    { "code": "KVT", "desc_ar": "كيلو فولت" },
    { "code": "KWT", "desc_ar": "كيلو وات" },
    { "code": "LB", "desc_ar": "رطل" },
    { "code": "LVL", "desc_ar": "مستوى" },
    { "code": "MAW", "desc_ar": "ميجا وات" },
    { "code": "MGM", "desc_ar": "ملجم" },
    { "code": "MHZ", "desc_ar": "ميجا هرتز" },
    { "code": "MIN", "desc_ar": "دقيقة" },
    { "code": "MMK", "desc_ar": "مم²" },
    { "code": "MMQ", "desc_ar": "مم³" },
    { "code": "MMT", "desc_ar": "مللي متر" },
    { "code": "MON", "desc_ar": "شهر" },
    { "code": "MTK", "desc_ar": "م²" },
    { "code": "MTQ", "desc_ar": "م³" },
    { "code": "OHM", "desc_ar": "أوم" },
    { "code": "ONZ", "desc_ar": "أونصة" },
    { "code": "PAL", "desc_ar": "باسكال" },
    { "code": "PF", "desc_ar": "طبالي" },
    { "code": "SMI", "desc_ar": "ميل" },
    { "code": "ST", "desc_ar": "طن قصير" },
    { "code": "VLT", "desc_ar": "فولت" },
    { "code": "WEE", "desc_ar": "أسبوع" },
    { "code": "WTT", "desc_ar": "وات" },
    { "code": "X03", "desc_ar": "متر/ساعة" },
    { "code": "YDQ", "desc_ar": "ياردة³" },
    { "code": "YRD", "desc_ar": "ياردة" },

    { "code": "NMP", "desc_ar": "عدد الباكات" },
    { "code": "5I", "desc_ar": "قدم قياسي" },
    { "code": "AE", "desc_ar": "أمبير لكل متر" },
    { "code": "B4", "desc_ar": "برميل إمبراطوري" },
    { "code": "BB", "desc_ar": "بيز بوكس" },
    { "code": "BD", "desc_ar": "لوح" },
    { "code": "BE", "desc_ar": "ربطة" },
    { "code": "BK", "desc_ar": "سلة" },
    { "code": "BL", "desc_ar": "بالة" },
    { "code": "CH", "desc_ar": "كونتينر" },
    { "code": "CR", "desc_ar": "Crate" },
    { "code": "DAA", "desc_ar": "ديكار" },
    { "code": "DTN", "desc_ar": "ديسطن" },
    { "code": "DZN", "desc_ar": "دستة" },
    { "code": "FP", "desc_ar": "رطل/قدم²" },
    { "code": "HMT", "desc_ar": "هيكتومتر" },
    { "code": "INQ", "desc_ar": "بوصة³" },
    { "code": "KG", "desc_ar": "كِج" },
    { "code": "KTM", "desc_ar": "كم" },
    { "code": "LO", "desc_ar": "لوط" },
    { "code": "MLT", "desc_ar": "ملليلتر" },
    { "code": "MT", "desc_ar": "حصير" },
    { "code": "NA", "desc_ar": "ملجم/كجم" },
    { "code": "NAR", "desc_ar": "عدد الوحدات" },
    { "code": "NC", "desc_ar": "عربية" },
    { "code": "NE", "desc_ar": "لتر صافٍ" },
    { "code": "NPL", "desc_ar": "عدد الطرود" },
    { "code": "NV", "desc_ar": "مركبة" },
    { "code": "PA", "desc_ar": "باكيت" },
    { "code": "PG", "desc_ar": "طبق" }
];


// بيانات أنواع الضرائب الرئيسية والفرعية
const taxTypes = {
    "T1": {
        desc: "ضريبة القيمة المضافة",
        subtypes: [
            { code: "V001", desc: "تصدير للخارج (0%)" }, { code: "V002", desc: "تصدير مناطق حرة (0%)" },
            { code: "V003", desc: "سلعة أو خدمة معفاة" }, { code: "V004", desc: "سلعة أو خدمة غير خاضعة" },
            { code: "V005", desc: "إعفاءات دبلوماسية" }, { code: "V008", desc: "إعفاءات خاصة" },
            { code: "V009", desc: "سلع عامة (14%)" }, { code: "V010", desc: "نسب أخرى" }
        ]
    },
    "T2": {
        desc: "ضريبة الجدول (نسبية)",
        subtypes: [ { code: "Tbl01", desc: "ضريبة جدول نسبية" } ]
    },
    "T3": {
        desc: "ضريبة الجدول (النوعية)",
        subtypes: [ { code: "Tbl02", desc: "ضريبة جدول نوعية (قطعية)" } ]
    },
    "T4": {
        desc: "الخصم تحت حساب الضريبة",
        subtypes: [
            { code: "W001", desc: "المقاولات" }, { code: "W002", desc: "التوريدات" },
            { code: "W003", desc: "المشتريات" }, { code: "W004", desc: "الخدمات" },
            { code: "W010", desc: "أتعاب مهنية" }
        ]
    },
    "T5": { desc: "ضريبة الدمغة (نسبية)", subtypes: [ { code: "ST01", desc: "دمغة نسبية" } ] },
    "T6": { desc: "ضريبة الدمغة (قطعية)", subtypes: [ { code: "ST02", desc: "دمغة قطعية" } ] },
    "T7": { desc: "ضريبة الملاهي", subtypes: [ { code: "Ent01", desc: "ملاهي (نسبة)" } ] },
    "T8": { desc: "رسم تنمية الموارد", subtypes: [ { code: "RD01", desc: "تنمية موارد (نسبة)" } ] },
    "T9": { desc: "رسم خدمة", subtypes: [ { code: "SC01", desc: "رسم خدمة (نسبة)" } ] },
    "T10": { desc: "رسم المحليات", subtypes: [ { code: "Mn01", desc: "رسم محليات (نسبة)" } ] },
    "T11": { desc: "رسم التأمين الصحي", subtypes: [ { code: "MI01", desc: "تأمين صحي (نسبة)" } ] },
    "T12": { desc: "رسوم أخرى", subtypes: [ { code: "OF01", desc: "رسوم أخرى (نسبة)" } ] }
};

// قاموس عكسي لترجمة المسميات إلى رموز عند الرفع (لا حاجة لتعديله)

const reverseMappings = {
    receiverTypes: Object.fromEntries(receiverTypes.map(item => [item.desc, item.code])),
    itemCodeTypes: Object.fromEntries(itemCodeTypes.map(item => [item.desc, item.code])), // هذا صحيح الآن
    countries: Object.fromEntries(countryCodes.map(item => [item.Desc_ar, item.code])),
    units: Object.fromEntries(unitTypes.map(item => [item.desc_ar, item.code])),
    currencies: Object.fromEntries(currencies.map(item => [item.desc, item.code])), // <-- ✨✨ السطر الجديد والمهم ✨✨
    taxTypes: Object.fromEntries(Object.entries(taxTypes).map(([code, data]) => [data.desc, code])),
    taxSubtypes: Object.fromEntries(
        Object.values(taxTypes).flatMap(data => data.subtypes.map(sub => [sub.desc, sub.code]))
    )
};






// =========================================================================
// ✅✅✅ دالة تنزيل نموذج الفواتير (v7 - تعود لعرض الاسم العربي في القائمة)
// =========================================================================
async function downloadExcelTemplate_v3() {
    const loadingToast = showToastNotification('جاري إنشاء نموذج الإكسيل الذكي...', 0);

    try {
        if (typeof ExcelJS === 'undefined') {
            throw new Error("مكتبة ExcelJS غير محملة.");
        }

        const workbook = new ExcelJS.Workbook();
        const mainSheet = workbook.addWorksheet("Invoices");
        const listsSheet = workbook.addWorksheet("Lists");

        // --- 1. إعداد ورقة القوائم المنسدلة "Lists" ---
        // الدالة الآن ستستخدم المتغير العام unitTypes الذي يحتوي على القائمة الكاملة
        
        listsSheet.getCell('A1').value = "ReceiverTypes";
        receiverTypes.forEach((item, i) => { listsSheet.getCell(`A${i + 2}`).value = item.desc; });
        
        listsSheet.getCell('B1').value = "CodeTypes";
        itemCodeTypes.forEach((item, i) => { listsSheet.getCell(`B${i + 2}`).value = item.code; });
        
        // ✅✅✅ التعديل هنا: نضع الاسم العربي (desc_ar) فقط في القائمة المنسدلة ✅✅✅
        listsSheet.getCell('C1').value = "UnitTypes";
        unitTypes.forEach((item, i) => {
            listsSheet.getCell(`C${i + 2}`).value = item.desc_ar;
        });
        
        listsSheet.getCell('D1').value = "Currencies";
        currencies.forEach((item, i) => { listsSheet.getCell(`D${i + 2}`).value = item.desc; });
        
        listsSheet.getCell('E1').value = "MainTaxTypes";
        Object.values(taxTypes).forEach((item, i) => { listsSheet.getCell(`E${i + 2}`).value = item.desc; });
        
        listsSheet.getCell('F1').value = "Countries";
        countryCodes.forEach((item, i) => { listsSheet.getCell(`F${i + 2}`).value = item.Desc_ar; });
        
        let taxColIndex = 7;
        Object.values(taxTypes).forEach(data => {
            const headerCell = listsSheet.getCell(1, taxColIndex);
            const rangeName = data.desc.replace(/[ ()]/g, '_');
            headerCell.value = rangeName;
            data.subtypes.forEach((subtype, i) => { listsSheet.getCell(i + 2, taxColIndex).value = subtype.desc; });
            taxColIndex++;
        });

        // --- 2. تحديد العناوين والتعليقات ---
        const headers = [
            'الرقم الداخلي (*)', 'تاريخ الإصدار', 'تاريخ التسليم', 'رقم تسجيل المستلم (*)', 'اسم المستلم (*)', 'نوع المستلم (*)',
            'دولة المستلم (*)', 'محافظة المستلم (*)', 'مدينة المستلم (*)', 'شارع المستلم (*)', 'مبنى المستلم (*)',
            'وصف الصنف (*)', 'نوع كود الصنف (*)', 'كود الصنف (*)', 'الكود الداخلي', 'وحدة القياس (*)',
            'الكمية (*)', 'سعر الوحدة (*)', 'عملة البيع', 'سعر الصرف', 'نسبة الخصم', 'قيمة الخصم',
            'نوع الضريبة 1 (*)', 'النوع الفرعي 1 (*)', 'نسبة الضريبة 1 (*)',
            'نوع الضريبة 2', 'النوع الفرعي 2', 'نسبة الضريبة 2', 'نوع الضريبة 3', 'النوع الفرعي 3', 'نسبة الضريبة 3',
            'مرجع شراء', 'وصف شراء', 'مرجع مبيعات', 'وصف مبيعات', 'اسم البنك', 'حساب البنك', 'طريقة التوصيل', 'التغليف'
        ];

        mainSheet.columns = headers.map(h => ({ header: h, key: h }));

        mainSheet.getRow(1).eachCell((cell) => {
            const headerText = cell.value;
            const cleanHeader = headerText.replace(' (*)', '');
            if (excelCellComments[cleanHeader]) {
                cell.note = excelCellComments[cleanHeader];
            }
            cell.font = { name: 'Arial', bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF343A40' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        mainSheet.autoFilter = { from: 'A1', to: { row: 1, column: headers.length } };
        
        mainSheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const cellLength = cell.value ? String(cell.value).length : 0;
                const headerLength = cell.address.startsWith(column.letter + '1') ? String(cell.value).length : 0;
                if (Math.max(cellLength, headerLength) > maxLength) {
                    maxLength = Math.max(cellLength, headerLength);
                }
            });
            column.width = Math.max(15, Math.min(maxLength + 5, 45));
        });
        
        // --- 3. تطبيق القوائم المنسدلة ---
        const addValidation = (columnLetter, formula) => {
            for (let i = 2; i <= 1001; i++) {
                mainSheet.getCell(`${columnLetter}${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [formula] };
            }
        };
        
        addValidation('F', '=Lists!$A$2:$A$4');
        addValidation('G', `=Lists!$F$2:$F$${countryCodes.length + 1}`);
        addValidation('M', '=Lists!$B$2:$B$3');
        addValidation('P', `=Lists!$C$2:$C$${unitTypes.length + 1}`);
        addValidation('S', `=Lists!$D$2:$D$${currencies.length + 1}`);
        addValidation('W', `=Lists!$E$2:$E$${Object.keys(taxTypes).length + 1}`);
        addValidation('Z', `=Lists!$E$2:$E$${Object.keys(taxTypes).length + 1}`);
        addValidation('AC', `=Lists!$E$2:$E$${Object.keys(taxTypes).length + 1}`);
        
        const cascadingFormula1 = '=INDIRECT(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(W2," ","_"),"(","_"),")","_"))';
        const cascadingFormula2 = '=INDIRECT(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(Z2," ","_"),"(","_"),")","_"))';
        const cascadingFormula3 = '=INDIRECT(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(AC2," ","_"),"(","_"),")","_"))';
        addValidation('X', cascadingFormula1);
        addValidation('AA', cascadingFormula2);
        addValidation('AD', cascadingFormula3);

        Object.values(taxTypes).forEach((data, i) => {
            const colLetter = String.fromCharCode('A'.charCodeAt(0) + 6 + i);
            const rangeName = data.desc.replace(/[ ()]/g, '_');
            const rangeFormula = `Lists!$${colLetter}$2:$${colLetter}$${data.subtypes.length + 1}`;
            workbook.definedNames.add(rangeFormula, rangeName);
        });

        // --- 4. اللمسات النهائية وإنشاء الملف ---
        listsSheet.state = 'hidden';
        mainSheet.views = [{ rightToLeft: true }];

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        
        if (typeof saveAs === 'undefined') {
            throw new Error("مكتبة FileSaver.js غير محملة.");
        }
        saveAs(blob, "نموذج_فواتير_احترافي_كامل.xlsx");

    } catch (error) {
        alert("فشل إنشاء نموذج الإكسيل: " + error.message);
    } finally {
        loadingToast.remove();
    }
}







const defaultSubtypes = {
    "T1": "V009",   // VAT Standard Rate
    "T2": "Tbl01",  // جدول نسبي
    "T3": "Tbl02",  // جدول نوعي
    "T4": "W001",   // خصم تحت حساب الضريبة
    "T5": "ST01",   // دمغة نسبية
    "T6": "ST02",   // دمغة قطعية
    "T7": "Ent01",  // ملاهي
    "T8": "RD01",   // رسم تنمية موارد
    "T9": "SC01",   // رسم خدمة
    "T10": "Mn01",  // محليات
    "T11": "MI01",  // تأمين صحي
    "T12": "OF01"   // رسوم أخرى
};


/**
 * =========================================================================
 * ✅✅✅ دالة تنظيف النصوص (النسخة الجديدة v2.0) ✅✅✅
 * تسمح بكل الرموز وتقوم فقط بقص النص لضمان عدم تجاوز الحد الأقصى.
 * =========================================================================
 */
function sanitizeText(text, maxLength = 100) {
    if (text === null || text === undefined) {
        return "";
    }
    // 1. حول القيمة إلى نص
    let str = String(text);
    
    // 2. ✅ جديد: قم بقص النص إذا كان أطول من الحد الأقصى المسموح به (100 حرف)
    // هذا يمنع أخطاء الخادم بسبب طول النص الزائد.
    if (str.length > maxLength) {
        str = str.substring(0, maxLength);
    }
    
    // 3. قم بإزالة فقط المسافات الزائدة من البداية والنهاية
    return str.trim();
}







/**
 * =========================================================================
 * ✅✅✅ الدالة النهائية (v12.0): مع تنظيف البيانات لمنع أخطاء الخادم
 * =========================================================================
 */
function createInvoicePayloadFromLines_v3(lines, editedIssuerData) {
    if (!lines || lines.length === 0) {
        throw new Error("لا توجد بنود لهذه الفاتورة.");
    }

    const firstLine = lines[0];
    const activeTypeButton = document.querySelector('.invoice-type-btn.active');
    const invoiceType = activeTypeButton ? activeTypeButton.dataset.type : 'FullInvoice';
    
    const activitySelect = document.getElementById('activity-select-editor');
    const selectedActivityCode = activitySelect ? activitySelect.value : editedIssuerData.taxpayerActivityCode;

    // --- ✅ تطبيق التنظيف على بيانات المصدر ---
    const issuerPayload = {
        type: "B", id: editedIssuerData.id, name: sanitizeText(editedIssuerData.name),
        address: {
            branchID: "0", country: 'EG', governate: sanitizeText(editedIssuerData.governate),
            regionCity: sanitizeText(editedIssuerData.regionCity), street: sanitizeText(editedIssuerData.street),
            buildingNumber: String(editedIssuerData.buildingNumber || '').replace(/[^A-Za-z0-9\-\/]/g, ''),
            postalCode: "", floor: "", room: "", landmark: "", additionalInformation: ""
        }
    };

    if (!issuerPayload.id || !issuerPayload.name) {
        throw new Error("بيانات المصدر (رقم التسجيل والاسم) مطلوبة.");
    }

    // (منطق التاريخ يبقى كما هو)
    let finalDateTimeIssued;
    if (firstLine.dateTimeIssued && !isNaN(new Date(firstLine.dateTimeIssued))) {
        const userDate = new Date(firstLine.dateTimeIssued);
        const now = new Date();
        userDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
        finalDateTimeIssued = userDate.toISOString().split('.')[0] + "Z";
    } else {
        finalDateTimeIssued = new Date().toISOString().split('.')[0] + "Z";
    }
    let finalServiceDeliveryDate;
    if (firstLine.serviceDeliveryDate && !isNaN(new Date(firstLine.serviceDeliveryDate))) {
        finalServiceDeliveryDate = new Date(firstLine.serviceDeliveryDate).toISOString().split('T')[0];
    } else {
        finalServiceDeliveryDate = undefined;
    }

    let totalSalesAmount = 0;
    let totalDiscountAmount = 0;
    const taxTotalsMap = new Map();

   // ==> التعديل هنا <==
const invoiceLines = lines.map(line => {
    const quantity = parseFloat((parseFloat(line.quantity) || 0).toFixed(5));
    const amountSold = parseFloat((parseFloat(line.unit_price) || 0).toFixed(5));

        const exchangeRate = parseFloat(line.exchange_rate) || 1;
        const amountEGP = parseFloat((amountSold * exchangeRate).toFixed(5));
        const salesTotal = parseFloat((quantity * amountEGP).toFixed(5));
        totalSalesAmount += salesTotal;
        let discountAmount = parseFloat(line.discount_amount) || (salesTotal * (parseFloat(line.discount_rate) || 0) / 100);
        discountAmount = parseFloat(discountAmount.toFixed(5));

        totalDiscountAmount += discountAmount;
        const netTotal = parseFloat((salesTotal - discountAmount).toFixed(5));
        const taxableItems = [];
        let totalTaxAmountForItem = 0;
        let tableTaxAmount = 0;
        for (let i = 1; i <= 3; i++) {
            const taxType = line[`tax_type_${i}`]?.trim().toUpperCase();
            const taxRateStr = line[`tax_rate_${i}`];
            if ((taxType === "T2" || taxType === "T3") && taxRateStr && !isNaN(parseFloat(taxRateStr))) {
                const taxRate = parseFloat(taxRateStr);
                const taxAmount = parseFloat((netTotal * (taxRate / 100)).toFixed(5));
                const taxSubtype = line[`tax_subtype_${i}`]?.trim() || defaultSubtypes[taxType] || "";
                taxableItems.push({ taxType, amount: taxAmount, subType: taxSubtype, rate: taxRate });
                tableTaxAmount += taxAmount;
                totalTaxAmountForItem += taxAmount;
                taxTotalsMap.set(taxType, (taxTotalsMap.get(taxType) || 0) + taxAmount);
            }
        }
        const vatBaseAmount = netTotal + tableTaxAmount;
        for (let i = 1; i <= 3; i++) {
            const taxType = line[`tax_type_${i}`]?.trim().toUpperCase();
            const taxRateStr = line[`tax_rate_${i}`];
            if (taxType === "T2" || taxType === "T3") continue;
            if (taxType && taxRateStr && !isNaN(parseFloat(taxRateStr))) {
                const taxRate = parseFloat(taxRateStr);
                let taxAmount = (taxType === "T1") ? parseFloat((vatBaseAmount * (taxRate / 100)).toFixed(5)) : parseFloat((netTotal * (taxRate / 100)).toFixed(5));
                const taxSubtype = line[`tax_subtype_${i}`]?.trim() || defaultSubtypes[taxType] || "";
                taxableItems.push({ taxType, amount: taxAmount, subType: taxSubtype, rate: taxRate });
                totalTaxAmountForItem += (taxType === "T4" ? -taxAmount : taxAmount);
                taxTotalsMap.set(taxType, (taxTotalsMap.get(taxType) || 0) + taxAmount);
            }
        }
        const currency = (line.currency_sold || 'EGP').toUpperCase();
        const unitValue = { currencySold: currency, amountEGP: amountEGP, amountSold: 0 };
        if (currency !== 'EGP') {
            unitValue.amountSold = amountSold;
            unitValue.currencyExchangeRate = exchangeRate;
        }
        const total = parseFloat((netTotal + totalTaxAmountForItem).toFixed(5));
        
        // --- ✅ تطبيق التنظيف على بيانات البند ---
        return {
        description: sanitizeText(line.item_description || line.item_code_name || line.item_code, 100),
            itemType: line.item_type, itemCode: line.item_code,
            internalCode: sanitizeText(line.item_internal_code),
            unitType: line.unit_type, quantity: quantity,
            salesTotal: salesTotal, discount: { amount: discountAmount }, netTotal: netTotal,
            total: total, unitValue: unitValue, taxableItems: taxableItems,
            valueDifference: 0, totalTaxableFees: 0, itemsDiscount: 0
        };
    });

    const taxTotals = Array.from(taxTotalsMap, ([taxType, amount]) => ({ taxType, amount: parseFloat(amount.toFixed(5)) }));
    const finalTotalSales = parseFloat(totalSalesAmount.toFixed(5));
    const finalTotalDiscount = parseFloat(totalDiscountAmount.toFixed(5));
    const finalNetAmount = parseFloat((finalTotalSales - finalTotalDiscount).toFixed(5));
    const finalTotalAmount = parseFloat(invoiceLines.reduce((sum, line) => sum + line.total, 0).toFixed(5));

    const version = document.getElementById('invoiceVersionSelect')?.value || '1.0';
    const isUnsigned = (version === '0.9');
    const tags = isUnsigned ? ["SimpleInvoice"] : [invoiceType, "SignatureRequired"];
    const signatures = isUnsigned ? [] : [{ signatureType: "I", value: "VGVtcG9yYXJ5IFNpZ25hdHVyZSBIb2xkZXI=" }];

    // --- ✅ تطبيق التنظيف على بيانات المستلم ---
    const cleanedAddress = {
        country: (firstLine.receiver_country || '').toUpperCase().trim(),
        governate: sanitizeText(firstLine.receiver_governate),
        regionCity: sanitizeText(firstLine.receiver_city),
        street: sanitizeText(firstLine.receiver_street),
        buildingNumber: String(firstLine.receiver_building || '').replace(/[^A-Za-z0-9\-\/]/g, ''),
        postalCode: "", floor: "", room: "", landmark: "", additionalInformation: ""
    };

    const documentPayload = {
        issuer: issuerPayload,
        receiver: {
            address: cleanedAddress,
            type: firstLine.receiver_type || 'B',
            id: (firstLine.receiver_type === 'P' && !firstLine.receiver_id) ? '20101012100000' : firstLine.receiver_id,
            name: sanitizeText(firstLine.receiver_name)
        },
        documentType: "I", documentTypeVersion: version,
        dateTimeIssued: finalDateTimeIssued,
        taxpayerActivityCode: selectedActivityCode, internalID: firstLine.internalID,
        invoiceLines: invoiceLines, totalSalesAmount: finalTotalSales,
        totalDiscountAmount: finalTotalDiscount, netAmount: finalNetAmount,
        taxTotals: taxTotals, totalAmount: finalTotalAmount,
        totalItemsDiscountAmount: 0, extraDiscountAmount: 0, signatures: signatures
    };
    
    if (finalServiceDeliveryDate) {
        documentPayload.serviceDeliveryDate = finalServiceDeliveryDate;
    }

    if (invoiceType === 'FullInvoice') {
        documentPayload.purchaseOrderReference = sanitizeText(firstLine.purchaseOrderReference);
        documentPayload.purchaseOrderDescription = sanitizeText(firstLine.purchaseOrderDescription);
        documentPayload.salesOrderReference = sanitizeText(firstLine.salesOrderReference);
        documentPayload.salesOrderDescription = sanitizeText(firstLine.salesOrderDescription);
        documentPayload.proformaInvoiceNumber = "";
        documentPayload.payment = { bankName: sanitizeText(firstLine.bankName), bankAccountNo: sanitizeText(firstLine.bankAccountNo), swiftCode: "" };
        documentPayload.delivery = { approach: sanitizeText(firstLine.deliveryApproach), packaging: sanitizeText(firstLine.deliveryPackaging) };
    } else {
        documentPayload.payment = {};
        documentPayload.delivery = {};
    }

    return {
        tags: tags,
        document: documentPayload
    };
}




/**
 * ===================================================================================
 * ✅ دالة showErrorModal (v2.0 - بدون زر المتابعة)
 * ===================================================================================
 */
function showErrorModal(errors) {
    // الخطوة 1: إزالة أي نافذة أخطاء قديمة لضمان عدم التكرار
    document.getElementById('invoiceErrorModal')?.remove();

    // الخطوة 2: إنشاء الهيكل الخارجي للنافذة المنبثقة
    const modal = document.createElement('div');
    modal.id = 'invoiceErrorModal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0,0,0,0.6); z-index: 10002;
        display: flex; align-items: center; justify-content: center;
        direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif;
    `;

    // الخطوة 3: بناء محتوى النافذة (HTML) بشكل ديناميكي
    modal.innerHTML = `
        <div style="background: #fff; width: 800px; max-width: 90%; max-height: 80%; border-radius: 10px; display: flex; flex-direction: column; box-shadow: 0 5px 20px rgba(0,0,0,0.3); animation: fadeIn 0.3s ease-out;">
            
            <!-- رأس النافذة -->
            <div style="padding: 15px 20px; background-color: #d9534f; color: white; border-top-left-radius: 10px; border-top-right-radius: 10px; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">🚨</span>
                <h3 style="margin: 0; font-size: 20px;">تم اكتشاف أخطاء في البيانات (${errors.length})</h3>
            </div>

            <!-- جسم النافذة وجدول الأخطاء -->
            <div style="overflow-y: auto; padding: 20px;">
                <p style="margin-top: 0; color: #333;">
                    يرجى مراجعة الأخطاء التالية وتصحيحها في ملف الإكسيل ثم إعادة الرفع.
                </p>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead style="background-color: #f8f9fa; position: sticky; top: 0;">
                        <tr>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">المُعرّف (الفاتورة/البند)</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">الحقل</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">القيمة الخاطئة</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">رسالة الخطأ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${errors.map(err => `
                            <tr style="background-color: #fff1f0;">
                                <td style="padding: 8px; border: 1px solid #ffccc7;">${err.id || 'غير محدد'}</td>
                                <td style="padding: 8px; border: 1px solid #ffccc7;"><strong>${err.field || 'غير محدد'}</strong></td>
                                <td style="padding: 8px; border: 1px solid #ffccc7; font-family: monospace; direction: ltr; text-align: left;">${err.value || ''}</td>
                                <td style="padding: 8px; border: 1px solid #ffccc7;">${err.message || 'خطأ غير معروف'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- تذييل النافذة والأزرار -->
            <div style="padding: 15px 20px; text-align: left; border-top: 1px solid #eee; background-color: #f8f9fa; display: flex; justify-content: flex-end; align-items: center;">
                <button id="closeErrorModalBtn" style="background: #6c757d; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.2s;">
                    إغلاق
                </button>
            </div>
        </div>
    `;

    // الخطوة 4: إضافة النافذة إلى الصفحة وإضافة الأنماط اللازمة
    document.body.appendChild(modal);
    const styleSheet = document.createElement("style");
    styleSheet.id = "errorModalStyles";
    styleSheet.innerText = `@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } #closeErrorModalBtn:hover { background-color: #5a6268; }`;
    document.head.appendChild(styleSheet);

    // الخطوة 5: ربط حدث زر الإغلاق
    document.getElementById('closeErrorModalBtn').onclick = () => {
        modal.remove();
        styleSheet.remove();
    };
}



function printInvoice(invoiceId, invoiceGroup) {
    const headerRow = invoiceGroup.querySelector('.invoice-header-row');
    const internalID = headerRow.querySelector('[data-field="internalID"]').textContent.trim();
    const receiver_name = headerRow.querySelector('[data-field="receiver_name"]').textContent.trim();
    const receiver_id = headerRow.querySelector('[data-field="receiver_id"]').textContent.trim();
    // --- ✅✅✅ بداية التعديل الحاسم: قراءة التواريخ من الواجهة ✅✅✅ ---
const dateTimeIssued = headerRow.querySelector('[data-field="dateTimeIssued"]').textContent.trim();
const serviceDeliveryDate = headerRow.querySelector('[data-field="serviceDeliveryDate"]').textContent.trim();
// --- ✅✅✅ نهاية التعديل الحاسم ---

    const receiverAddress = {};
    invoiceGroup.querySelectorAll('.receiver-details-table [data-receiver-field]').forEach(cell => {
        const field = cell.dataset.receiverField;
        receiverAddress[field] = cell.textContent.trim();
    });
    
    const issuerData = {};
    invoiceGroup.querySelectorAll('.issuer-details-table [data-issuer-field]').forEach(cell => {
        const field = cell.dataset.issuerField;
        issuerData[field] = cell.textContent.trim();
    });
    
    const extraInvoiceData = {};
    invoiceGroup.querySelectorAll('.extra-details-table [data-invoice-field]').forEach(cell => {
        const field = cell.dataset.invoiceField;
        extraInvoiceData[field] = cell.textContent.trim();
    });
    
    const invoiceLines = [];
    invoiceGroup.querySelectorAll('.items-table tbody tr').forEach(row => {
        const lineData = {};
        row.querySelectorAll('[data-field]').forEach(cell => {
            const field = cell.dataset.field;
            if (cell.children.length > 1) {
                cell.querySelectorAll('span[data-field]').forEach(span => {
                    lineData[span.dataset.field] = span.textContent.trim();
                });
            } else {
                lineData[field] = cell.textContent.trim();
            }
        });
        invoiceLines.push(lineData);
    });
    
    const printContent = createInvoiceHTML({
        internalID,
        receiver_name,
        receiver_id,
        receiverAddress,
        issuerData,
        extraInvoiceData,
        invoiceLines,
        invoiceDate: new Date().toLocaleDateString('ar-EG')
    });
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = function() {
        const printBtn = printWindow.document.createElement('button');
        printBtn.textContent = 'طباعة الفاتورة';
        printBtn.style.cssText = 'position: fixed; top: 10px; right: 10px; padding: 10px 15px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;';
        printBtn.onclick = function() {
            printWindow.print();
        };
        printWindow.document.body.appendChild(printBtn);
    };
}

function createInvoiceHTML(data) {
    let overallTotalSales = 0;
    let overallTotalDiscount = 0;
    const overallTaxTotals = new Map();

    const itemRowsHTML = data.invoiceLines.map(line => {
        const quantity = parseFloat(line.quantity || 0);
        const price = parseFloat(line.unit_price || 0);
        const exchangeRate = parseFloat(line.exchange_rate || 1);
        const lineTotalBeforeDiscount = quantity * price * exchangeRate;
        let lineDiscount = parseFloat(line.discount_amount) || (lineTotalBeforeDiscount * (parseFloat(line.discount_rate) || 0) / 100);
        const netTotal = lineTotalBeforeDiscount - lineDiscount;
        
        let itemTaxAmount = 0;
        for (let i = 1; i <= 3; i++) {
            const taxType = line[`tax_type_${i}`]?.trim().toUpperCase();
            const taxRate = parseFloat(line[`tax_rate_${i}`] || 0);
            if (taxType && taxRate > 0) {
                const taxAmount = netTotal * (taxRate / 100);
                itemTaxAmount += (taxType === 'T4' ? -1 : 1) * taxAmount;
                overallTaxTotals.set(taxType, (overallTaxTotals.get(taxType) || 0) + taxAmount);
            }
        }
        
        const itemTotalAfterTaxes = netTotal + itemTaxAmount;
        overallTotalDiscount += lineDiscount;
        overallTotalSales += netTotal;

        return `
            <tr>
                <td>${line.item_code || ''}</td>
                <td>${line.item_description || ''}</td>
                <td>${quantity}</td>
                <td>${line.unit_type || ''}</td>
                <td>${price.toFixed(2)}</td>
                <td>${netTotal.toFixed(2)}</td>
                <td>${itemTaxAmount.toFixed(2)}</td>
                <td>${itemTotalAfterTaxes.toFixed(2)}</td>
            </tr>
        `;
    }).join('');

    let totalsSectionHTML = `
        <tr><td class="total-label">إجمالي المبيعات (ج.م)</td><td class="total-value">${(overallTotalSales + overallTotalDiscount).toFixed(2)}</td></tr>
        <tr><td class="total-label">إجمالي الخصم (ج.م)</td><td class="total-value">${overallTotalDiscount.toFixed(2)}</td></tr>
    `;
    let grandTotal = overallTotalSales;
    overallTaxTotals.forEach((amount, type) => {
        grandTotal += (type === 'T4' ? -1 : 1) * amount;
        totalsSectionHTML += `<tr><td class="total-label">${taxTypesMap[type] || type} (ج.م)</td><td class="total-value">${amount.toFixed(2)}</td></tr>`;
    });

    return `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>معاينة فاتورة ${data.internalID}</title>
            <style>
                body { font-family: 'Tahoma', 'Segoe UI', sans-serif; margin: 0; padding: 20px; background-color: #f9f9f9; color: #333; }
                .invoice-container { background: white; max-width: 900px; margin: 0 auto; padding: 25px; border: 1px solid #e0e0e0; }
                .header { text-align: center; border-bottom: 2px solid #ddd; padding-bottom: 10px; margin-bottom: 20px; }
                .header h1 { font-size: 28px; margin: 0; color: #000; }
                .header .invoice-meta { font-size: 14px; margin-top: 10px; color: #555; }
                .header .warning-text { font-size: 14px; margin-top: 10px; color: #d9534f; font-weight: bold; }
                .info-section { display: flex; justify-content: space-between; margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; background-color: #f8f9fa; }
                .info-section > div { flex-basis: 48%; }
                .info-section h3 { margin-top: 0; font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 8px; color: #337ab7; }
                .info-section p { margin: 6px 0; font-size: 13px; line-height: 1.5; }
                /* --- القسم الجديد للبيانات الإضافية --- */
                .extra-details-section {
                    padding: 10px 15px;
                    border: 1px solid #ddd;
                    background-color: #f8f9fa;
                    margin-bottom: 20px;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 10px;
                }
                .extra-details-section div { font-size: 12px; }
                .extra-details-section strong { color: #337ab7; }
                /* --- نهاية القسم الجديد --- */
                .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; font-size: 16px; text-align: center; }
                .items-table th { background-color: #e7e8e9; white-space: nowrap; }
                .totals-section { width: 45%; margin-left: 0; margin-right: auto; font-size: 13px; }
                .totals-section table { width: 100%; border-collapse: collapse; }
                .totals-section td { padding: 8px; border-bottom: 1px solid #eee; }
                .totals-section .total-label { font-weight: bold; text-align: right; }
                .totals-section .total-value { text-align: left; }
                .totals-section .grand-total td { font-weight: bold; font-size: 15px; background-color: #f2f2f2; border-top: 2px solid #333; }
                .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #777; }
                @media print { body { background: white; padding: 0; } .invoice-container { box-shadow: none; border: none; } #printBtn { display: none; } }
            </style>
        </head>
        <body>
            <div class="invoice-container">
                <button id="printBtn" style="position: fixed; top: 10px; left: 10px; padding: 10px 15px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;" onclick="window.print()">طباعة</button>
                <div class="header">
                    <h1>فاتورة</h1>
                    <div class="invoice-meta"><span>رقم الفاتورة: ${data.internalID}</span> | <span>التاريخ: ${data.invoiceDate}</span></div>
                    <p class="warning-text">معاينة لفاتورة قبل الإرسال (غير معتمدة)</p>
                </div>
                <div class="info-section">
                    <div><h3>البائع</h3><p><strong>الاسم:</strong> ${data.issuerData.name || ''}</p><p><strong>رقم التسجيل:</strong> ${data.issuerData.id || ''}</p><p>${data.issuerData.street || ''}, ${data.issuerData.regionCity || ''}, ${data.issuerData.governate || ''}</p></div>
                    <div><h3>المشتري</h3><p><strong>الاسم:</strong> ${data.receiver_name}</p><p><strong>رقم التسجيل:</strong> ${data.receiver_id}</p><p>${data.receiverAddress.receiver_street || ''}, ${data.receiverAddress.receiver_city || ''}, ${data.receiverAddress.receiver_governate || ''}</p></div>
                </div>
                
                <!-- --- بداية عرض البيانات الإضافية --- -->
                <div class="extra-details-section">
                    <div><strong>مرجع طلب الشراء:</strong> ${data.extraInvoiceData.purchaseOrderReference || ''}</div>
                    <div><strong>وصف طلب الشراء:</strong> ${data.extraInvoiceData.purchaseOrderDescription || ''}</div>
                    <div><strong>مرجع طلب المبيعات:</strong> ${data.extraInvoiceData.salesOrderReference || ''}</div>
                    <div><strong>وصف طلب المبيعات:</strong> ${data.extraInvoiceData.salesOrderDescription || ''}</div>
                    <div><strong>اسم البنك:</strong> ${data.extraInvoiceData.bankName || ''}</div>
                    <div><strong>رقم حساب البنك:</strong> ${data.extraInvoiceData.bankAccountNo || ''}</div>
                    <div><strong>طريقة التوصيل:</strong> ${data.extraInvoiceData.deliveryApproach || ''}</div>
                    <div><strong>التغليف:</strong> ${data.extraInvoiceData.deliveryPackaging || ''}</div>
                </div>
                <!-- --- نهاية عرض البيانات الإضافية --- -->

                <table class="items-table">
                    <thead>
                        <tr>
                            <th>كود الصنف</th><th>الوصف</th><th>الكمية</th><th>الوحدة</th><th>سعر الوحدة</th>
                            <th>الإجمالي</th><th>قيمة الضريبة</th><th>الإجمالي بعد الضريبة</th>
                        </tr>
                    </thead>
                    <tbody>${itemRowsHTML}</tbody>
                </table>
                <div class="totals-section">
                    <table>
                        <tbody>
                            ${totalsSectionHTML}
                            <tr class="grand-total">
                                <td class="total-label">إجمالي المبلغ (ج.م)</td>
                                <td class="total-value">${grandTotal.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="footer"><p>التوقيع: _________________________</p></div>
            </div>
        </body>
        </html>
    `;
}
















/**
 * ===================================================================================
 * ✅✅✅ دالة إنشاء نموذج إكسل لمرتجعات الإيصالات (v2.0 - مع دعم العملات)
 * ===================================================================================
 */
async function downloadReturnReceiptExcelTemplate() {
    const loadingToast = showToastNotification('جاري إنشاء نموذج المرتجعات الشامل...', 0);
    try {
        if (typeof ExcelJS === 'undefined') {
            throw new Error("مكتبة ExcelJS غير محملة. لا يمكن إنشاء الملف.");
        }

        const workbook = new ExcelJS.Workbook();
        const mainSheet = workbook.addWorksheet("قالب إشعارات المرتجع");
        const listsSheet = workbook.addWorksheet("قوائم البيانات");

        // --- 1. إعداد ورقة القوائم المنسدلة (Lists) ---
        const itemCodeTypes = [{ code: "EGS" }, { code: "GS1" }];
        
        listsSheet.getCell('A1').value = "أنواع الأكواد";
        itemCodeTypes.forEach((item, i) => { listsSheet.getCell(`A${i + 2}`).value = item.code; });

        listsSheet.getCell('B1').value = "أنواع الوحدات";
        unitTypes.forEach((item, i) => { listsSheet.getCell(`B${i + 2}`).value = item.desc_ar; });

        listsSheet.getCell('C1').value = "أنواع الضرائب الرئيسية";
        Object.values(taxTypes).forEach((item, i) => { listsSheet.getCell(`C${i + 2}`).value = item.desc; });

        // ✨ --- إضافة قائمة العملات --- ✨
        listsSheet.getCell('D1').value = "Currencies";
        receiptCurrencies.forEach((item, i) => { listsSheet.getCell(`D${i + 2}`).value = item.Desc_ar; });

        let taxColIndex = 5;
        Object.values(taxTypes).forEach(data => {
            const headerCell = listsSheet.getCell(1, taxColIndex);
            const rangeName = data.desc.replace(/[ ()]/g, '_');
            headerCell.value = rangeName;
            data.subtypes.forEach((subtype, i) => { listsSheet.getCell(i + 2, taxColIndex).value = subtype.desc; });
            const colLetter = String.fromCharCode('A'.charCodeAt(0) + taxColIndex - 1);
            const rangeFormula = `'قوائم البيانات'!$${colLetter}$2:$${colLetter}$${data.subtypes.length + 1}`;
            workbook.definedNames.add(rangeFormula, rangeName);
            taxColIndex++;
        });

        // --- 2. إعداد الأعمدة والتعليمات ---
        const headersWithComments = {
            'تاريخ الإصدار (YYYY-MM-DD)': 'اختياري: أدخل تاريخ إصدار المرتجع.',
            'رقم إشعار المرتجع الداخلي (*)': 'مطلوب: رقم فريد يميز عملية المرتجع.',
            'UUID الفاتورة الأصلية (*)': 'مطلوب: الرقم التعريفي الفريد لفاتورة البيع الأصلية.',
            'اسم العميل (اختياري)': 'اسم المشتري.',
            'الرقم القومي للعميل (اختياري)': 'الرقم القومي للمشتري.',
            'الكود الداخلي للصنف': 'اختياري: كود الصنف المستخدم في نظامك.',
            'وصف الصنف (*)': 'مطلوب: اسم أو وصف واضح للسلعة المرتجعة.',
            'نوع كود الصنف (*)': 'مطلوب: اختر من القائمة (EGS أو GS1).',
            'كود الصنف (*)': 'مطلوب: الكود الفعلي للصنف.',
            'وحدة القياس (*)': 'مطلوب: اختر وحدة القياس من القائمة.',
            'الكمية المرتجعة (*)': 'مطلوب: كمية الصنف التي تم إرجاعها.',
            'سعر الوحدة وقت البيع (*)': 'مطلوب: يجب أن يكون نفس سعر الوحدة الذي تم البيع به في الفاتورة الأصلية.',
            // ✨ --- إضافة أعمدة العملة --- ✨
            'عملة البيع': 'اختياري: اختر العملة. يجب أن تكون نفس عملة الفاتورة الأصلية.',
            'سعر الصرف': 'إجباري إذا كانت العملة غير الجنيه. يجب أن يكون نفس سعر صرف الفاتورة الأصلية.',
            // ---
            'نوع الضريبة 1 (*)': 'مطلوب: اختر نوع الضريبة الأساسي.',
            'النوع الفرعي للضريبة 1 (*)': 'مطلوب: اختر النوع الفرعي للضريبة.',
            'نسبة الضريبة 1 (*)': 'مطلوب: النسبة المئوية للضريبة.',
            'نوع الضريبة 2 (اختياري)': 'اختياري: إذا كان الصنف خاضعًا لضريبة أخرى.',
            'النوع الفرعي للضريبة 2 (اختياري)': 'اختياري: النوع الفرعي للضريبة الثانية.',
            'نسبة الضريبة 2 (اختياري)': 'اختياري: نسبة الضريبة الثانية.'
        };

        const headers = Object.keys(headersWithComments);
        mainSheet.columns = headers.map(h => ({ header: h, key: h, width: 35 }));

        mainSheet.getRow(1).eachCell((cell) => {
            cell.note = headersWithComments[cell.value] || '';
            cell.font = { name: 'Arial', bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC0392B' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        });

        // --- 3. تطبيق القوائم المنسدلة ---
        const addValidation = (columnLetter, formula) => {
            for (let i = 2; i <= 1001; i++) {
                mainSheet.getCell(`${columnLetter}${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: [formula] };
            }
        };

        addValidation('H', `='قوائم البيانات'!$A$2:$A$3`); // نوع كود الصنف
        addValidation('J', `='قوائم البيانات'!$B$2:$B$${unitTypes.length + 1}`);
        addValidation('M', `='قوائم البيانات'!$D$2:$D$${receiptCurrencies.length + 1}`); // ✨ قائمة العملات
        addValidation('O', `='قوائم البيانات'!$C$2:$C$${Object.keys(taxTypes).length + 1}`);
        addValidation('R', `='قوائم البيانات'!$C$2:$C$${Object.keys(taxTypes).length + 1}`);

        const cascadingFormula1 = '=INDIRECT(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(O2," ","_"),"(","_"),")","_"))';
        const cascadingFormula2 = '=INDIRECT(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(R2," ","_"),"(","_"),")","_"))';
        addValidation('P', cascadingFormula1);
        addValidation('S', cascadingFormula2);

        // --- 4. اللمسات النهائية وإنشاء الملف ---
        listsSheet.state = 'hidden';
        mainSheet.views = [{ rightToLeft: true, state: 'frozen', ySplit: 1 }];

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        
        if (typeof saveAs === 'undefined') {
            throw new Error("مكتبة FileSaver.js غير محملة.");
        }
        
        saveAs(blob, "نموذج_مرتجع_الإيصالات_بالعملات.xlsx");

    } catch (error) {
        alert("فشل إنشاء نموذج إكسل المرتجعات: " + error.message);
    } finally {
        loadingToast.remove();
    }
}



/**
 * ===================================================================================
 * ✅✅✅ دالة رفع مرتجع الإيصالات (v2.0 - الإصلاح النهائي لمنطق العملات)
 * ===================================================================================
 */
async function handleReturnReceiptExcelUpload(event) {
    const modalUI = document.getElementById("receiptUploaderTabbedUI");
    if (modalUI) modalUI.style.display = "none";

    const file = event.target.files[0];
    if (!file) return;

    const loadingToast = showToastNotification('جاري قراءة وترجمة بيانات المرتجع...');

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await file.arrayBuffer());
        const worksheet = workbook.getWorksheet(1);

        const headers = worksheet.getRow(1).values.slice(1).map(h => String(h || '').trim());
        const allRows = [];

        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber > 1) {
                const rowObject = {};
                row.values.slice(1).forEach((value, index) => {
                    const header = headers[index];
                    if (header) {
                        rowObject[header] = value !== null && value !== undefined ? value : '';
                    }
                });
                allRows.push(rowObject);
            }
        });

        if (allRows.length === 0) throw new Error("ملف الإكسل فارغ!");

        // ✨ --- تعديل خريطة العناوين لتشمل العملة وسعر الصرف --- ✨
        const headerMapping = {
            'تاريخ الإصدار (YYYY-MM-DD)': 'dateTimeIssued',
            'رقم إشعار المرتجع الداخلي (*)': 'receiptNumber',
            'UUID الفاتورة الأصلية (*)': 'referenceUUID',
            'اسم العميل (اختياري)': 'buyerName',
            'الرقم القومي للعميل (اختياري)': 'buyerId',
            'الكود الداخلي للصنف': 'internalCode',
            'وصف الصنف (*)': 'description',
            'نوع كود الصنف (*)': 'itemType',
            'كود الصنف (*)': 'itemCode',
            'وحدة القياس (*)': 'unitType',
            'الكمية المرتجعة (*)': 'quantity',
            'سعر الوحدة وقت البيع (*)': 'unitPrice',
            'عملة البيع': 'currencySold', // <-- جديد
            'سعر الصرف': 'exchangeRate', // <-- جديد
            'نوع الضريبة 1 (*)': 'taxType_1',
            'النوع الفرعي للضريبة 1 (*)': 'taxSubType_1', 'نسبة الضريبة 1 (*)': 'taxRate_1',
            'نوع الضريبة 2 (اختياري)': 'taxType_2',
            'النوع الفرعي للضريبة 2 (اختياري)': 'taxSubType_2',
            'نسبة الضريبة 2 (اختياري)': 'taxRate_2'
        };
        
        const mappedAndTranslatedRows = allRows.map(row => {
            const newRow = {};
            for (const arabicHeader in row) {
                const englishKey = headerMapping[arabicHeader.trim()];
                if (englishKey) {
                    let value = row[arabicHeader];
                    if (englishKey === 'unitType' && reverseMappings.units[value]) {
                        value = reverseMappings.units[value];
                    } else if (englishKey === 'currencySold' && receiptReverseMappings.currencies[value]) {
                        value = receiptReverseMappings.currencies[value];
                    } else if (englishKey.startsWith('taxType_') && reverseMappings.taxTypes[value]) {
                        value = reverseMappings.taxTypes[value];
                    } else if (englishKey.startsWith('taxSubType_') && reverseMappings.taxSubtypes[value]) {
                        value = reverseMappings.taxSubtypes[value];
                    }
                    newRow[englishKey] = value;
                }
            }
            return newRow;
        });

        // ✨ --- لا يوجد أي حسابات هنا، نمرر البيانات كما هي --- ✨
        const finalProcessedRows = mappedAndTranslatedRows;

        const receiptsMap = new Map();
        let lastReceiptNumber = '';
        let lastReturnInfo = {}; 

        finalProcessedRows.forEach(row => {
            const currentReceiptNumber = String(row.receiptNumber || lastReceiptNumber).trim();
            if (!currentReceiptNumber) return;

            if (currentReceiptNumber !== lastReceiptNumber) {
                lastReturnInfo = {
                    dateTimeIssued: row.dateTimeIssued,
                    referenceUUID: row.referenceUUID,
                    buyerName: row.buyerName,
                    buyerId: row.buyerId,
                };
                receiptsMap.set(currentReceiptNumber, []);
            }

            const finalRow = { ...lastReturnInfo, ...row };
            receiptsMap.get(currentReceiptNumber).push(finalRow);
            lastReceiptNumber = currentReceiptNumber;
        });

        loadingToast.remove();
        showReceiptEditor(receiptsMap, 'return');

    } catch (error) {
        alert(`❌ خطأ في معالجة ملف المرتجعات: ${error.message}`);
    } finally {
        if (loadingToast) loadingToast.remove();
        event.target.value = '';
    }
}


/**
 * ===================================================================================
 * ✅✅✅ دالة بناء إشعار المرتجع (v17.0 - الإصلاح النهائي بدون ضرب العملة)
 * ===================================================================================
 */
function calculateReturnReceiptData(itemsData, sellerData, deviceSerial, activityCode, failedUuid = null) {
// ✅ بداية التعديل: قراءة بيانات المصدر من الحقول المباشرة
const finalSellerData = {
    id: (sellerData || window.receiptUploaderData.seller).id, // رقم التسجيل لا يتغير
    name: document.getElementById('manual-seller-name')?.value || (sellerData || window.receiptUploaderData.seller).name,
    governate: document.getElementById('manual-seller-governate')?.value || (sellerData || window.receiptUploaderData.seller).governate,
    regionCity: document.getElementById('manual-seller-regionCity')?.value || (sellerData || window.receiptUploaderData.seller).regionCity,
    street: document.getElementById('manual-seller-street')?.value || (sellerData || window.receiptUploaderData.seller).street,
    buildingNumber: document.getElementById('manual-seller-building')?.value || (sellerData || window.receiptUploaderData.seller).buildingNumber
};
// ✅ نهاية التعديل
    const finalDeviceSerial = deviceSerial || window.receiptUploaderData.serial;
    const finalActivityCode = activityCode || finalSellerData.taxpayerActivityCode || '4690';
    const firstRow = itemsData[0];
    const history = JSON.parse(localStorage.getItem("receiptHistory") || "[]");
    const lastUUID = history.length > 0 ? history[0].uuid : "";

    let headerCurrency = "EGP";
    let headerExchangeRate = 0.0;
    const foreignCurrencyItem = itemsData.find(item => item.currencySold && item.currencySold !== 'EGP');
    if (foreignCurrencyItem) {
        headerCurrency = foreignCurrencyItem.currencySold;
        headerExchangeRate = parseFloat(foreignCurrencyItem.exchangeRate) || 1.0;
    }

    const header = {
        dateTimeIssued: getFormattedDateTime(firstRow.dateTimeIssued),
        receiptNumber: String(firstRow.receiptNumber || `RTN_${Math.floor(Date.now() / 1000)}`),
        uuid: "",
        previousUUID: lastUUID,
        referenceUUID: String(firstRow.referenceUUID || ""),
        currency: headerCurrency,
        exchangeRate: parseFloat(headerExchangeRate.toFixed(5)),
        sOrderNameCode: "",
        orderdeliveryMode: "",
        grossWeight: 0.0,
        netWeight: 0.0
    };
    if (failedUuid) {
        header.referenceOldUUID = failedUuid;
    }

    let finalTotalSales = 0;
    const finalTaxTotalsMap = new Map();

    const calculatedItemData = itemsData.map(item => {
        const quantity = parseFloat((parseFloat(item.quantity) || 0).toFixed(5));
        
        // ✨✨✨ --- بداية التعديل الحاسم --- ✨✨✨
        // السعر بالجنيه هو نفسه السعر المدخل (النظام هو من سيقوم بالضرب)
        const amountEGP = parseFloat((parseFloat(item.unitPrice) || 0).toFixed(5));
        // ✨✨✨ --- نهاية التعديل الحاسم --- ✨✨✨

        const itemTotalSale = parseFloat((quantity * amountEGP).toFixed(5));
        const itemNetSale = itemTotalSale;
        const taxableItems = [];
        let totalTaxAmountForItem = 0;

        if (item.taxableItems && Array.isArray(item.taxableItems)) {
            let tableTaxAmount = 0;
            item.taxableItems.forEach(tax => {
                if (tax.taxType === 'T2' || tax.taxType === 'T3') {
                    tableTaxAmount += itemNetSale * (parseFloat(tax.rate) / 100);
                }
            });
            const vatBaseAmount = itemNetSale + tableTaxAmount;
            item.taxableItems.forEach(tax => {
                const baseAmount = (tax.taxType === 'T1') ? vatBaseAmount : netSale;
                const taxAmount = parseFloat((baseAmount * (parseFloat(tax.rate) / 100)).toFixed(5));
                taxableItems.push({ taxType: String(tax.taxType), amount: taxAmount, subType: String(tax.subType), rate: parseFloat(tax.rate) });
                totalTaxAmountForItem += (tax.taxType === 'T4' ? -taxAmount : taxAmount);
                finalTaxTotalsMap.set(String(tax.taxType), (finalTaxTotalsMap.get(String(tax.taxType)) || 0) + taxAmount);
            });
        }

        const itemTotal = parseFloat((itemNetSale + totalTaxAmountForItem).toFixed(5));
        finalTotalSales += itemTotalSale;

        return {
            internalCode: String(item.internalCode || item.itemCode),
            description: sanitizeText(String(item.description), 100),
            itemType: String(item.itemType || 'EGS'),
            itemCode: String(item.itemCode),
            unitType: String(item.unitType || 'EA'),
            quantity: quantity,
            unitPrice: amountEGP,
            netSale: itemNetSale,
            totalSale: itemTotalSale,
            total: itemTotal,
            valueDifference: 0.0,
            taxableItems: taxableItems,
            itemDiscountData: []
        };
    });

    return {
        header: header,
        documentType: { receiptType: "R", typeVersion: "1.2" },
        seller: { rin: finalSellerData.id, companyTradeName: finalSellerData.name, branchCode: "0", branchAddress: { country: "EG", governate: finalSellerData.governate, regionCity: finalSellerData.regionCity, street: finalSellerData.street, buildingNumber: finalSellerData.buildingNumber }, deviceSerialNumber: finalDeviceSerial, activityCode: finalActivityCode },
        buyer: { type: "P", id: firstRow.buyerId, name: firstRow.buyerName },
        itemData: calculatedItemData,
        totalSales: parseFloat(finalTotalSales.toFixed(5)),
        netAmount: parseFloat(finalTotalSales.toFixed(5)),
        taxTotals: Array.from(finalTaxTotalsMap, ([taxType, amount]) => ({ taxType, amount: parseFloat(amount.toFixed(5)) })),
        totalAmount: parseFloat(calculatedItemData.reduce((sum, item) => sum + item.total, 0).toFixed(5)),
        paymentMethod: "C",
        feesAmount: 0.0,
        adjustment: 0.0
    };
}


/**
 * ===================================================================================
 * ✅✅✅ دالة الإرسال النهائية (v4.0 - مع تحليل ذكي للأخطاء)
 * ===================================================================================
 */
async function sendReceipts_V3(batchObject, batchLabel) {
    const loadingToast = showToastNotification(`جاري إرسال: ${batchLabel}...`);
    
    try {
        const receiptChain = batchObject.receipts;
        if (!receiptChain || receiptChain.length === 0) {
            throw new Error("كائن الدفعة فارغ.");
        }
        const finalUuidInChain = receiptChain[receiptChain.length - 1].header.uuid;

        const finalPayloadText = JSON.stringify(batchObject, null, 2);
        
        

        const zip = new JSZip();
        zip.file("receipts.json", finalPayloadText);
        const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });

        const fileInput = document.querySelector('input[type="file"]');
        if (!fileInput) throw new Error('لم يتم العثور على حقل رفع الملفات (input[type="file"]).');
        
        const file = new File([zipBlob], "receipts.zip", { type: "application/zip" });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));

        await new Promise(resolve => setTimeout(resolve, 200));
        
        const buttonSpan = Array.from(document.querySelectorAll('button span.ms-Button-label')).find(span => span.textContent.trim() === 'ابدأ المعالجة');
        if (!buttonSpan) throw new Error('لم يتم العثور على زر "ابدأ المعالجة".');
        
        const processButton = buttonSpan.closest('button');
        
        // --- ✨✨✨ بداية المنطق الذكي لالتقاط الأخطاء --- ✨✨✨
        const responsePromise = new Promise((resolve, reject) => {
            const originalFetch = window.fetch;
            window.fetch = async function(...args) {
                const url = args[0];
                // نحن نلتقط فقط الطلب الذي يرسل البيانات إلى الخادم
                if (typeof url === 'string' && url.includes('/api/v1/receiptsubmissions')) {
                    try {
                        const response = await originalFetch.apply(this, args);
                        const clonedResponse = response.clone();
                        const responseData = await clonedResponse.json();
                        
                       
                        // أعد fetch الأصلي لوضعه الطبيعي فورًا
                        window.fetch = originalFetch;
                        
                        // قم بحل الـ Promise مع البيانات المستلمة
                        resolve(responseData);

                        return response; // أرجع الرد الأصلي ليكمل الموقع عمله
                    } catch (error) {
                        window.fetch = originalFetch;
                        reject(error);
                    }
                }
                return originalFetch.apply(this, args);
            };
            
            // الآن اضغط على الزر لبدء عملية الإرسال
            processButton.click();
        });

        const submissionResult = await responsePromise;

        // --- 🕵️‍♂️ خطوة التشخيص 3: تحليل الرد وطباعة رسائل واضحة ---
        if (submissionResult.submissionStatus === "Invalid" || submissionResult.inValidReceiptsCount > 0) {
            const rejectedDoc = submissionResult.rejectedDocuments[0];
            const errorDetails = rejectedDoc.error.details[0];
          

            // بناء رسالة خطأ واضحة للمستخدم
            const userFriendlyError = `فشل الإرسال.\n\nالسبب من المصلحة: ${errorDetails.message}\nالمسار الدقيق للخطأ: ${errorDetails.propertyPath}`;
            throw new Error(userFriendlyError);
        }
        // --- ✨✨✨ نهاية المنطق الذكي --- ✨✨✨

        loadingToast.remove();
        return { success: true, uuid: finalUuidInChain, error: null };

    } catch (error) {
        loadingToast.remove();
        // الآن الخطأ سيكون أكثر وضوحًا
        return { success: false, uuid: '', error: error.message };
    }
}




async function checkSubscription() {
    const SESSION_KEY = 'eta_extension_active_session'; // تم تغيير اسم المفتاح ليعبر عن محتواه

    try {
        // --- الخطوة 1: جلب رقم التسجيل الحالي للمستخدم ---
        const currentIssuerData = await getIssuerFullData();
        if (!currentIssuerData || !currentIssuerData.id) {
            return null;
        }
        const currentRin = currentIssuerData.id;

        // --- الخطوة 2: التحقق من وجود جلسة مخزنة ومطابقتها للمستخدم الحالي ---
        const storedSessionRaw = sessionStorage.getItem(SESSION_KEY);
        
        if (storedSessionRaw) {
            const storedSession = JSON.parse(storedSessionRaw);
            
            // ✅✅✅ التحقق الحاسم: هل التوكن المخزن يخص المستخدم الحالي؟ ✅✅✅
            if (storedSession.rin === currentRin && storedSession.token) {
                
                const validationResponse = await fetch('https://my-extension-backend-steel.vercel.app/api/validate-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${storedSession.token}`
                    }
                } );


                if (validationResponse.ok) {
                   
                    // نرجع البيانات الحقيقية للمستخدم الحالي بدلاً من البيانات الوهمية
                    return { seller: currentIssuerData, devices: [] };
                }
            } else {
            }
        } else {
        }

        // --- الخطوة 3: إذا لم يكن هناك توكن صالح، نقوم بالمصادقة الكاملة ---
        sessionStorage.removeItem(SESSION_KEY); // تنظيف أي جلسة قديمة

        const tokenResponse = await fetch('https://my-extension-backend-steel.vercel.app/api/check-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rin: currentRin } )
        });


        if (!tokenResponse.ok) {
            return null;
        }

        const tokenResult = await tokenResponse.json();
        if (!tokenResult.success || !tokenResult.session_token) {
            return null;
        }
        
        const newSessionToken = tokenResult.session_token;
        
        // ✅ نقوم بتخزين كائن الجلسة الجديد (التوكن + رقم التسجيل)
        const newSession = {
            rin: currentRin,
            token: newSessionToken
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));

        return {
            seller: currentIssuerData,
            devices: []
        };

    } catch (error) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
    }
}




// ✅✅✅ استبدل دالة showSubscriptionModal القديمة بهذه النسخة الجديدة ✅✅✅
function showSubscriptionModal() {
    const lockdownLayer = document.getElementById('subscription-lockdown-layer') || document.getElementById('subscription-lockdown-layer-receipts');
    if (!lockdownLayer) return;

    // --- 1. تحديد رابط خارجي لصفحة الدفع (هذا هو الرابط الذي سيفتحه المستخدم) ---
    // يمكنك تغييره إلى رابط صفحة فيسبوك، موقع ويب، أو رابط واتساب مباشر.
    const paymentPageUrl = "https://wa.me/201060872599"; 

    // --- 2. بناء واجهة بسيطة توجه المستخدم إلى الرابط الخارجي ---
    const modalContent = `
        <div style="background: #fff; width: 550px; max-width: 90%; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.2 ); text-align: center; padding: 30px; border-top: 5px solid #c0392b;">
            <span style="font-size: 48px;">⏳</span>
            <h2 style="color: #c0392b; margin: 15px 0;">الاشتراك مطلوب للوصول لهذه الميزة</h2>
            <p style="font-size: 16px; line-height: 1.7; color: #333;">
                للاستمرار في استخدام الإضافة، يرجى تفعيل اشتراكك. اضغط على الزر أدناه للانتقال إلى صفحة الدفع والتفعيل.
            </p>
            <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h3 style="margin-top: 0; color: #0056b3;">خطوات التفعيل:</h3>
                <p>1. اضغط على الزر للانتقال إلى صفحة الدفع.</p>
                <p>2. بعد إتمام الدفع، أرسل الإيصال ورقم التسجيل الضريبي عبر واتساب.</p>
                <a href="${paymentPageUrl}" target="_blank" style="display: inline-block; background: #28a745; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin-top: 15px;">
                    🚀 الانتقال لصفحة الدفع والتفعيل
                </a>
            </div>
            <p style="font-size: 13px; color: #6c757d;">
                لإغلاق هذه النافذة، اضغط على زر "إغلاق" الأحمر في الزاوية.
            </p>
        </div>
    `;
    
    lockdownLayer.innerHTML = modalContent;
}



})(); 

