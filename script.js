let prevPosition = null;
let speedValues = [];

function calculateInstantaneousSpeed(currentPosition, prevPosition) {
    if (!prevPosition) {
        return 0;
    }

    const timeDiff = (currentPosition.timestamp - prevPosition.timestamp) / 1000; // Convert to seconds
    const distance = getDistance(prevPosition.coords, currentPosition.coords);

    // Calculate speed in km/h
    const speed = distance / timeDiff * 3600;
    return speed;
}

function getDistance(coords1, coords2) {
    const R = 6371; // Earth radius in km
    const dLat = deg2rad(coords2.latitude - coords1.latitude);
    const dLon = deg2rad(coords2.longitude - coords1.longitude);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(coords1.latitude)) * Math.cos(deg2rad(coords2.latitude)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function calculateSmoothedSpeed(speed) {
    const windowSize = 10; // 移動平均のウィンドウサイズ
    speedValues.push(speed);

    if (speedValues.length > windowSize) {
        speedValues.shift(); // 配列の先頭から削除してウィンドウサイズを維持
    }

    const averageSpeed = speedValues.reduce((acc, val) => acc + val, 0) / speedValues.length;
    return averageSpeed;
}

function playWarningSound(smoothedSpeed, targetSpeed) {
    if (Math.abs(smoothedSpeed - targetSpeed) !== 4) {
        document.getElementById('warningAudio').play().catch(function(error) {
            console.error('警告音の再生に失敗しました:', error);
        }); // 速度が目標速度から4km/h離れている場合のみ警告音を再生
    }
}

function stopWarningSound(smoothedSpeed, targetSpeed) {
    if (Math.abs(smoothedSpeed - targetSpeed) === 4) {
        document.getElementById('warningAudio').pause(); // 速度が目標速度から4km/h離れている場合のみ警告音を停止
        document.getElementById('warningAudio').currentTime = 0;
    }
}

function success(pos) {
    const speed = calculateInstantaneousSpeed(pos, prevPosition);
    prevPosition = pos;

    const targetSpeed = parseFloat(sessionStorage.getItem('runningSpeed')) || 0;
    const smoothedSpeed = calculateSmoothedSpeed(speed); // smoothedSpeedの宣言

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

    // 警告音の再生・停止
    playWarningSound(smoothedSpeed, targetSpeed);
    stopWarningSound(smoothedSpeed, targetSpeed);
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
