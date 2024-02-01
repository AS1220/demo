let prevPosition = null;
let speedValues = [];

// ページが読み込まれた後に実行される関数
window.addEventListener('DOMContentLoaded', function() {
    // ページ上のどこかをタップしたときに警告音を再生する
    document.body.addEventListener('click', function() {
        playWarningSound();
    });
});

// 警告音を再生する関数
function playWarningSound() {
    const speed = calculateInstantaneousSpeed(pos, prevPosition);
    const targetSpeed = parseFloat(sessionStorage.getItem('runningSpeed')) || 0;
    const smoothedSpeed = calculateSmoothedSpeed(speed);

    // 速度が目標速度から4km/h離れている場合のみ警告音を再生
    if (Math.abs(smoothedSpeed - targetSpeed) !== 4) {
        // 警告音の<audio>要素を取得する
        const warningAudio = document.getElementById('warningAudio');
        // 警告音が停止中の場合、再生を開始する
        if (warningAudio.paused) {
            warningAudio.play().catch(function(error) {
                console.error('警告音の再生に失敗しました:', error);
            });
        }
    }
}

function success(pos) {
    const speed = calculateInstantaneousSpeed(pos, prevPosition);
    prevPosition = pos;

    const smoothedSpeed = calculateSmoothedSpeed(speed);

    const speedInfo = document.getElementById('speedInfo');
    speedInfo.textContent = `現在の移動速度: ${smoothedSpeed.toFixed(2)} km/h`;

    const locationInfo = document.getElementById('locationInfo');
    locationInfo.textContent = `現在の位置情報: 緯度 ${pos.coords.latitude.toFixed(6)}, 経度 ${pos.coords.longitude.toFixed(6)}`;

    const distance = parseFloat(new URLSearchParams(window.location.search).get('distance')) || 0;
    const time = parseFloat(new URLSearchParams(window.location.search).get('time')) || 0;

    const userInputInfo = document.getElementById('userInputInfo');
    userInputInfo.textContent = `走りたい距離: ${distance} km, 走りたい時間: ${time} 分`;

    const calculationResult = document.getElementById('calculationResult');
    const result = distance / (time / 60);
    calculationResult.textContent = `速度の計算結果: ${result.toFixed(2)} km/h`;

    const currentSpeedResult = document.getElementById('currentSpeedResult');
    currentSpeedResult.textContent = `現在の速度: ${smoothedSpeed.toFixed(2)} km/h`;

    // 警告音の再生
    playWarningSound(smoothedSpeed);
}

function fail(error) {
    window.alert('位置情報の取得に失敗しました。エラーコード：' + error.code);
}

if ('geolocation' in navigator) {
    const options = { enableHighAccuracy: true };
    navigator.geolocation.watchPosition(success, fail, options);
} else {
    window.alert('このブラウザはGeolocation APIをサポートしていません。');
}
