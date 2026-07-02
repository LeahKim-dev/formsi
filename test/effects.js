// 모든 컨페티 옵션에 zIndex를 기본 주입하는 헬퍼 함수
function safeConfetti(options) {
  return confetti({
    ...options,
    zIndex: 99999
  });
}

const ConfettiEffects = {
  // 1. 기본 양옆 분수 연출 (일반 팀 기본값)
  basicSide: function(colors) {
    const end = Date.now() + 4000;
    (function frame() {
      safeConfetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 }, colors });
      safeConfetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    return { duration: 4500, stop: () => {} };
  },

  // 2. T1 전용 대형 축포 + 상시 눈송이 연출
  grandSnow: function(colors) {
    const duration = 6000;
    const animationEnd = Date.now() + duration;
    function randomInRange(min, max) { return Math.random() * (max - min) + min; }

    // 양옆 대형 축포 인터벌
    const cannonInterval = setInterval(function() {
      if (Date.now() > animationEnd) return clearInterval(cannonInterval);

      safeConfetti({
        particleCount: 120, angle: 60, spread: 75, startVelocity: 80, gravity: 0.85, ticks: 300,
        origin: { x: -0.1, y: 1 }, colors: colors
      });
      safeConfetti({
        particleCount: 120, angle: 120, spread: 75, startVelocity: 80, gravity: 0.85, ticks: 300,
        origin: { x: 1.1, y: 1 }, colors: colors
      });
    }, 1000);

    // 상시 폭죽 및 눈송이 렌더링 루프
    let frameId;
    function frame() {
      if (Date.now() > animationEnd) return;

      if (Math.random() < 0.04) {
        safeConfetti({
          particleCount: 60, startVelocity: 25, spread: 360, ticks: 200, gravity: 0.6,
          colors: colors, origin: { x: randomInRange(0.1, 0.9), y: randomInRange(0.1, 0.4) }
        });
      }

      if (Math.random() < 0.15) {
        safeConfetti({
          particleCount: 2, startVelocity: 0, ticks: 600, gravity: 0.5, scale: 1.2,
          origin: { x: Math.random(), y: -0.1 }, colors: ['#FFD700', '#ffffff'],
          drift: randomInRange(-0.8, 0.8)
        });
      }

      frameId = requestAnimationFrame(frame);
    }
    frame();

    return {
      duration: 6500,
      stop: () => {
        clearInterval(cannonInterval);
        cancelAnimationFrame(frameId);
      }
    };
  },

  // 3. 중앙 집중형 스타 폭죽 (추가 커스텀 연출)
  centerBurst: function(colors) {
    const end = Date.now() + 3500;
    (function frame() {
      safeConfetti({ particleCount: 5, spread: 100, origin: { x: 0.5, y: 0.6 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    return { duration: 4000, stop: () => {} };
  }
};