//学んだこと
//１スペルミスがあると「処理が止まる。」
//２querySelectorは「HTML要素で取得。」
//３addEventListener後の（）の''の中身を「第一引数」,その後ろの関数を「第二引数」と言い、関係性は「第一引数に何かが起こると、第二関数が実行される。」
//４return;は「処理を区切る」ために重要
//５ターミナルで上の改装に移動→「cd ..」下の改装に移動→「cd 移動したい場所」

//工夫したこと
//１18行目のアロー関数をもともとコールバック関数(function())にしていたが、関数の中身にthisが入っていないためアロー関数にして文字数を短くした。（その後別の形に置き換わったが）

//スペルミス集
//１アラート→「alert」
const input = document.getElementById('message');
const charCount = document.getElementById('charCount');
const btn = document.getElementById('btn');
const result = document.getElementById('result');
const form = document.querySelector('form');
const API_URL = 'http://localhost:3000/api/opinions';

input.addEventListener('input', () => {
    charCount.textContent = input.value.length;
});
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const message = input.value.trim();
    if (!message) {
        alert("意見を入力してください。");
        return;
    }

    btn.disabled = true;
    result.textContent = '送信中...';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            result.textContent = data?.error ? `送信に失敗: ${data.error}` : '送信に失敗しました。';
            return;
        }

        alert('送信しました。');
        result.textContent = '送信しました。';
        input.value = '';
        charCount.textContent = '0';
    } catch (e) {
        result.textContent = '送信に失敗しました（サーバーが起動しているか確認してください）。';
    } finally {
        btn.disabled = false;
    }
});

