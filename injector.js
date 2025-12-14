// injector.js

// =================================================================
// --- الجزء الأول: جسر التواصل بين الصفحة والإضافة ---
// هذا الجزء يستمع للطلبات من السكريبتات المحقونة (مثل eservise.js)
// ويرسلها إلى background.js، ثم يعيد الرد إلى الصفحة.
// =================================================================

window.addEventListener('ETA_HELPER_REQUEST', async (event) => {
    const { action, data, requestId } = event.detail;

    try {
        // إرسال الرسالة إلى background.js (الذي يملك صلاحية التخزين)
        const response = await chrome.runtime.sendMessage({ action, data });
        
        // عند استلام الرد من background.js، قم بإرساله مرة أخرى إلى الصفحة
        window.dispatchEvent(new CustomEvent('ETA_HELPER_RESPONSE', {
            detail: {
                requestId,
                success: true,
                response: response
            }
        }));
    } catch (error) {
        // في حالة حدوث خطأ (مثل إغلاق الإضافة)، أرسل رسالة خطأ للصفحة
        console.error("Injector.js Error:", error);
        window.dispatchEvent(new CustomEvent('ETA_HELPER_RESPONSE', {
            detail: {
                requestId,
                success: false,
                error: error.message
            }
        }));
    }
});

// =================================================================
// --- الجزء الثاني: حقن السكريبتات في الصفحة (الكود الأصلي الخاص بك) ---
// =================================================================

function addScript(src, callback) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = chrome.runtime.getURL(src);
    
    if (callback) {
        script.onload = callback;
    }

    (document.body || document.head || document.documentElement).appendChild(script);
}

// تحميل كل المكتبات والسكريبتات
addScript("code.js");
addScript("content.js");
addScript("jszip.min.js");
addScript("FileSaver.min.js");

addScript("invoice.js"); 
addScript("jspdf.umd.min.js");   
addScript("html2canvas.min.js"); 
addScript("qrcode.min.js"); 


addScript("jspdf.plugin.autotable.min.js"); 
addScript("dawn.js"); 

// تحميل مكتبة ExcelJS ثم السكريبت الذي يعتمد عليها
addScript("exceljs.min.js", function() {
    console.log("✅ تم تحميل exceljs.min.js، سيتم الآن تحميل receipts_exporter.js");
    addScript("receipts_exporter.js");
});
