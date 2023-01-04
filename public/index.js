function sleep(waitSec, callbackFunc) {
  // 経過時間（秒）
  var spanedSec = 0;
  // 1秒間隔で無名関数を実行
  var id = setInterval(function () {
    spanedSec++;
    // 経過時間 >= 待機時間の場合、待機終了。
    if (spanedSec >= waitSec) {
      // タイマー停止
      clearInterval(id);
      // 完了時、コールバック関数を実行
      if (callbackFunc) callbackFunc();
    }
  }, 1000);
}

function updateButtonClick() {
  const result = document.getElementById('updateStatus');
  const updateButton = document.getElementById('updateButton');
  const updateButtonSpinner = document.getElementById('updateButtonSpinner');
  const updateButtonText = document.getElementById('updateButtonText');

  //手動更新ボタンを非活性
  updateButton.disabled = true
  //処理中メッセージを表示
  updateButtonSpinner.classList.remove("d-none")
  updateButtonText.textContent = "更新中..."

  const req = new XMLHttpRequest();
  req.onreadystatechange = function () {
    if (req.readyState == 4) { // 通信の完了時
      if (req.status == 200) { // 通信の成功時
        //処理中メッセージを非表示
        updateButtonSpinner.classList.add("d-none")
        updateButtonText.textContent = "手動更新"
        //処理完了メッセージを表示
        result.classList.remove("d-none");
        //2秒待ってリロード
        sleep(2, function () {
          location.reload()
        });
      }
    }
  }
  req.open('POST', 'updatedata', true);
  req.setRequestHeader('content-type',
    'application/x-www-form-urlencoded;charset=UTF-8');
  req.send();
}