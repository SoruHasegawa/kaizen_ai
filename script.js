//１スペルミスがあると処理が止まる。
//２querySelectorはHTML要素で取得。


const input=document.getElementById('message');
const charCount=document.getElementById('charCount');
const btn=document.getElementById('btn');
const result=document.getElementById('result');
const form=document.querySelector('form');

input.addEventListener('input', () => {
   charCount.textContent=input.value.length;
});

form.addEventListener('submit',function(event){
    event.preventDefault();
    alert("変換して送信しました。");
});
