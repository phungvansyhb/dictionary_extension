import { getSavedWords, clearAllWords } from '../content/storageService';
import './style.css';

function initialize() {
  loadWords();
  updateStatsToday();
  const clearBtn = document.getElementById('clear-all-btn');
  clearBtn?.addEventListener('click', clearAll);
}

// Run immediately if DOM is already loaded, otherwise wait
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

async function loadWords(): Promise<void> {
  console.log('📚 Loading words...');
  try {
    const words = await getSavedWords();
    console.log(words)
    const todayWords = words.filter(w => {
      const savedDate = new Date(w.savedAt);
      const now = new Date(); 
      return savedDate.getDate() === now.getDate() &&
             savedDate.getMonth() === now.getMonth() &&
             savedDate.getFullYear() === now.getFullYear();
    });
    updateStats(words.length);
    updateStatsToday(todayWords.length);
  } catch (error) {
    console.error('❌ Error loading words:', error);
  }
}

// Xóa tất cả
async function clearAll(): Promise<void> {
  if (!confirm('Xóa tất cả từ đã lưu? Hành động này không thể hoàn tác!')) return;

  console.log('🗑️ Clearing all words...');
  await clearAllWords();
  loadWords();
}

// Cập nhật thống kê
function updateStats(count: number): void {
  const wordCount = document.getElementById('word-count');
  if (!wordCount) return;

  // Cancel previous animation if any
  const prevRaf = Number(wordCount.dataset.countRaf || 0);
  if (prevRaf) cancelAnimationFrame(prevRaf);

  const duration = 600; // ms
  const startTime = performance.now();
  const initial = Math.max(0, parseInt(wordCount.textContent || '0', 10));
  const target = count;

  if (initial === target) {
    wordCount.textContent = `${target}`;
    delete wordCount.dataset.countRaf;
    return;
  }

  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    // easeOutCubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(initial + (target - initial) * eased);
    wordCount.textContent = `${current}`;

    if (progress < 1) {
      const rafId = requestAnimationFrame(step);
      wordCount.dataset.countRaf = String(rafId);
    } else {
      wordCount.textContent = `${target}`;
      delete wordCount.dataset.countRaf;
    }
  };

  const rafId = requestAnimationFrame(step);
  wordCount.dataset.countRaf = String(rafId);
}

function updateStatsToday(count?: number): void {
  const statsCountEl = document.querySelector('#stats #word-count');
  const todayCountEl = document.getElementById('word-today');
  const wrap = document.getElementById('today-progress-circle');
  const circles = {
    red: wrap!.querySelector('.ring-red') as SVGCircleElement,
    orange: wrap!.querySelector('.ring-orange') as SVGCircleElement,
    yellow: wrap!.querySelector('.ring-yellow') as SVGCircleElement,
    green: wrap!.querySelector('.ring-green') as SVGCircleElement,
  };
  
  const radius = circles.red.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;

  // Khởi tạo tất cả các vòng tròn
  Object.values(circles).forEach(circle => {
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;
  });

  function update(count: number) {
    const numeric = Number.isFinite(+count) ? Math.max(0, Math.floor(+count)) : 0;

    // Reset tất cả về trạng thái ẩn (bắt đầu từ 0)
    Object.values(circles).forEach(circle => {
      circle.style.strokeDashoffset = `${circumference}`;
    });

    // Mỗi phần chiếm 1/4 vòng tròn (90 độ)
    const quarterCircle = circumference * 0.25;

    // Phần đỏ (0-6 từ) - chiếm 1/4 vòng tròn đầu tiên
    if (numeric > 0) {
      const redWords = Math.min(numeric, 6);
      const redProgress = redWords / 6; // Tiến trình trong phạm vi 0-6
      const redLength = quarterCircle * redProgress;
      circles.red.style.strokeDashoffset = `${circumference - redLength}`;
    }
    
    // Phần cam (6-12 từ) - chiếm 1/4 vòng tròn thứ hai
    if (numeric > 6) {
      const orangeWords = Math.min(numeric - 6, 6);
      const orangeProgress = orangeWords / 6;
      const orangeLength = quarterCircle + (quarterCircle * orangeProgress);
      circles.orange.style.strokeDashoffset = `${circumference - orangeLength}`;
    }
    
    // Phần vàng (12-18 từ) - chiếm 1/4 vòng tròn thứ ba
    if (numeric > 12) {
      const yellowWords = Math.min(numeric - 12, 6);
      const yellowProgress = yellowWords / 6;
      const yellowLength = (quarterCircle * 2) + (quarterCircle * yellowProgress);
      circles.yellow.style.strokeDashoffset = `${circumference - yellowLength}`;
    }
    
    // Phần xanh (18-24 từ) - chiếm 1/4 vòng tròn cuối cùng
    if (numeric > 18) {
      const greenWords = Math.min(numeric - 18, 6);
      const greenProgress = greenWords / 6;
      const greenLength = (quarterCircle * 3) + (quarterCircle * greenProgress);
      circles.green.style.strokeDashoffset = `${circumference - greenLength}`;
    }

    if (numeric >= 24) {
      todayCountEl!.textContent = 'Done';
      wrap!.classList.add('progress-done');
    } else {
      todayCountEl!.textContent = String(numeric);
      wrap!.classList.remove('progress-done');
    }
  }

  update(count ?? 0);

  if (statsCountEl) {
    const mo = new MutationObserver(() => update(parseInt(statsCountEl.textContent || '0', 10)));
    mo.observe(statsCountEl, { characterData: true, childList: true, subtree: true });
  }
}