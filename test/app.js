// 상태 관리 변수
let scoreLeft = 0, scoreRight = 0;
let timerSec = 0, timerRunning = false, timerInterval = null;

// 화면 초기 레이아웃 빌더
function initLayout() {
  currentTeamLeft = CONFIG.teamLeft;
  currentTeamRight = CONFIG.teamRight;

  const leftData = dbTeams[currentTeamLeft];
  const rightData = dbTeams[currentTeamRight];

  if (!leftData || !rightData) return alert("팀 설정 매칭 변수 오류!");

  const baseImgUrl = "https://raw.githubusercontent.com/LeahKim-dev/formsi/main/src/";
  document.getElementById('bracket-img').src = baseImgUrl + CONFIG.bracketFileName;

  // 브라우저 타이틀 설정
  document.getElementById('page-title').textContent = `${leftData.name} vs ${rightData.name} — MSI 2026`;

  // 왼쪽 팀 렌더링
  document.getElementById('name-left').textContent = leftData.name;
  document.getElementById('region-left').textContent = leftData.region;
  const bLeft = document.getElementById('badge-left');
  bLeft.style.background = leftData.bgStyle;
  bLeft.style.border = `4px solid ${leftData.color}`;
  bLeft.style.boxShadow = `0 0 50px ${leftData.shadow}`;
  bLeft.innerHTML = `<img src="${leftData.logoUrl}" alt="${leftData.name}">`;
  if (leftData.hasBg) bLeft.classList.add('has-bg');

  // 오른쪽 팀 렌더링
  document.getElementById('name-right').textContent = rightData.name;
  document.getElementById('region-right').textContent = rightData.region;
  const bRight = document.getElementById('badge-right');
  bRight.style.background = rightData.bgStyle;
  bRight.style.border = `4px solid ${rightData.color}`;
  bRight.style.boxShadow = `0 0 50px ${rightData.shadow}`;
  bRight.innerHTML = `<img src="${rightData.logoUrl}" alt="${rightData.name}">`;
  if (rightData.hasBg) bRight.classList.add('has-bg');
}

// 자릿수 보정 유틸
function pad(n) { return String(n).padStart(2, '0'); }

// 상단 실제 KST 시계 기능
function tick() {
  const now = new Date();
  document.getElementById('realtime').textContent =
    pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
}

// 게임 타이머 디스플레이 업데이트
function updateTimerDisplay() {
  document.getElementById('game-timer').textContent =
    pad(Math.floor(timerSec / 60)) + ':' + pad(timerSec % 60);
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  document.getElementById('btn-start').textContent = '▶ 진행 중';
  timerInterval = setInterval(() => { timerSec++; updateTimerDisplay(); }, 1000);
}

function pauseTimer() {
  if (!timerRunning) return;
  timerRunning = false;
  clearInterval(timerInterval);
  document.getElementById('btn-start').textContent = '▶ 재개';
}

function resetTimer() {
  pauseTimer(); timerSec = 0; updateTimerDisplay();
  document.getElementById('input-min').value = 0;
  document.getElementById('input-sec').value = 0;
  document.getElementById('btn-start').textContent = '▶ 시작';
}

function setManualTime() {
  const m = parseInt(document.getElementById('input-min').value) || 0;
  const s = parseInt(document.getElementById('input-sec').value) || 0;
  const was = timerRunning;
  pauseTimer();
  timerSec = m * 60 + Math.min(s, 59);
  updateTimerDisplay();
  if (was) startTimer();
}

// 스코어 팝 애니메이션 제어
function popScore(id) {
  const el = document.getElementById(id);
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}

// 실시간 세트 점수 조절 핸들러
function changeScore(side, delta) {
  if (side === 'left') {
    scoreLeft = Math.max(0, Math.min(3, scoreLeft + delta));
    document.getElementById('set-left').textContent = scoreLeft;
    if (delta > 0) popScore('set-left');
  } else {
    scoreRight = Math.max(0, Math.min(3, scoreRight + delta));
    document.getElementById('set-right').textContent = scoreRight;
    if (delta > 0) popScore('set-right');
  }
  
  const nextGame = Math.min(scoreLeft + scoreRight + 1, 5);
  document.getElementById('game-num').innerHTML = nextGame + '<span class="set-text">세트</span>';
  document.getElementById('game-num-sub').textContent = nextGame;
  checkWinner();
}

// 위너 조건 체크
function checkWinner() {
  const el = document.getElementById('winner-text');
  if (scoreLeft === 3) {
    const team = dbTeams[currentTeamLeft];
    el.textContent = `🏆 ${team.name} 승리!`;
    showWinner(team.name, team.confetti, team.winnerImgUrl, team.effectType);
  } else if (scoreRight === 3) {
    const team = dbTeams[currentTeamRight];
    el.textContent = `🏆 ${team.name} 승리!`;
    showWinner(team.name, team.confetti, team.winnerImgUrl, team.effectType);
  } else {
    el.textContent = '';
  }
}

// 위너 모달 활성화 및 동적 연출 바인딩
function showWinner(name, colors, winnerCustomImg, effectType = 'basicSide') {
  const overlay = document.getElementById('winner-overlay');
  const txt = document.getElementById('winner-text-big');
  const img = document.getElementById('winner-custom-img');

  if (img) {
    if (winnerCustomImg) {
      img.src = winnerCustomImg;
      img.style.display = 'block';
      img.closest('.winner-container').classList.add('has-photo');
    } else {
      img.style.display = 'none';
      img.closest('.winner-container').classList.remove('has-photo');
    }
  }

  if (txt) {
    const shadowColor = (Array.isArray(colors) && colors.length > 0) ? colors[0] : colors;
    txt.style.textShadow = `0 4px 25px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,1), 0 0 15px ${shadowColor}`;
    txt.textContent = '🏆 ' + name + ' WIN!';
  }

  if (overlay) overlay.classList.add('show');

  // effects.js에서 선언된 팩토리 객체에서 효과 로드 실행
  const selectedEffect = ConfettiEffects[effectType] || ConfettiEffects.basicSide;
  const activeEffect = selectedEffect(colors);

  setTimeout(() => {
    if (overlay) overlay.classList.remove('show');
    if (activeEffect && typeof activeEffect.stop === 'function') {
      activeEffect.stop();
    }
  }, activeEffect.duration);
}

// 모달 제어 함수들
function openBracketModal() {
  const el = document.getElementById('bracket-overlay');
  if (el) el.classList.add('show');
}
function closeBracketModal() {
  const el = document.getElementById('bracket-overlay');
  if (el) el.classList.remove('show');
}
function openScheduleModal() {
  const el = document.getElementById('schedule-overlay');
  if (el) el.classList.add('show');
}
function closeScheduleModal() {
  const el = document.getElementById('schedule-overlay');
  if (el) el.classList.remove('show');
}

// 전체 데이터 초기화
function resetAll() {
  if (!confirm('전체 초기화하시겠습니까?')) return;
  scoreLeft = 0; scoreRight = 0;
  document.getElementById('set-left').textContent = 0;
  document.getElementById('set-right').textContent = 0;
  document.getElementById('game-num').innerHTML = '1<span class="set-text">세트</span>';
  document.getElementById('game-num-sub').textContent = 1;
  document.getElementById('winner-text').textContent = '';
  resetTimer();
}

// 스크립트 로드 시 즉시 실행부
document.addEventListener('DOMContentLoaded', () => {
  initLayout();
  tick();
  setInterval(tick, 1000);
});