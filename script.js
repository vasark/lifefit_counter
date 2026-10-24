(() => {
  "use strict";

  const STORAGE_KEY = "lifefit-counter-visits-v1";
  const MAX_VISIBLE_HISTORY = 5;
  let showAllHistory = false;
  let toastTimer;

  const $ = (id) => document.getElementById(id);
  const els = {
    monthCount: $("month-count"),
    monthLabel: $("month-label"),
    yearCount: $("year-count"),
    yearLabel: $("year-label"),
    recordButton: $("record-button"),
    todayStatus: $("today-status"),
    historyList: $("history-list"),
    historyTotal: $("history-total"),
    emptyState: $("empty-state"),
    toggleHistory: $("toggle-history"),
    resetButton: $("reset-button"),
    toast: $("toast")
  };

  function localDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function loadVisits() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(saved)) return [];
      return [...new Set(saved.filter(
        (item) => typeof item === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item)
      ))].sort((a, b) => b.localeCompare(a));
    } catch (error) {
      console.error("来店記録の読み込みに失敗しました:", error);
      return [];
    }
  }

  function saveVisits(visits) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
      return true;
    } catch (error) {
      console.error("来店記録の保存に失敗しました:", error);
      showToast("保存できませんでした。ブラウザの設定を確認してください。");
      return false;
    }
  }

  function formatJapaneseDate(key) {
    const [year, month, day] = key.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return `${month}月${day}日（${weekdays[date.getDay()]}）`;
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2600);
  }

  function render() {
    const visits = loadVisits();
    const now = new Date();
    const today = localDateKey(now);
    const currentMonth = today.slice(0, 7);
    const currentYear = today.slice(0, 4);
    const monthVisits = visits.filter((date) => date.startsWith(currentMonth)).length;
    const yearVisits = visits.filter((date) => date.startsWith(currentYear)).length;
    const visitedToday = visits.includes(today);

    els.monthCount.textContent = String(monthVisits);
    els.monthLabel.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月`;
    els.yearCount.textContent = String(yearVisits);
    els.yearLabel.textContent = `${now.getFullYear()}年の合計`;
    els.recordButton.disabled = visitedToday;
    els.recordButton.innerHTML = visitedToday
      ? '<span aria-hidden="true">✓</span> 今日の記録は完了'
      : '<span aria-hidden="true">＋</span> 今日の来店を記録';
    els.todayStatus.textContent = visitedToday
      ? "今日は記録済みです。同じ日の重複記録はできません。"
      : "入館したら、このボタンをタップ！";

    els.historyTotal.textContent = `${visits.length}件`;
    els.emptyState.hidden = visits.length > 0;
    els.historyList.replaceChildren();

    const visibleVisits = showAllHistory ? visits : visits.slice(0, MAX_VISIBLE_HISTORY);
    for (const date of visibleVisits) {
      const item = document.createElement("li");
      item.className = "history-item";

      const icon = document.createElement("div");
      icon.className = "history-date-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "✓";

      const details = document.createElement("div");
      const dateText = document.createElement("p");
      dateText.className = "history-date";
      dateText.textContent = formatJapaneseDate(date);
      const subText = document.createElement("p");
      subText.className = "history-sub";
      subText.textContent = date.slice(0, 4) + "年";
      details.append(dateText, subText);

      const check = document.createElement("span");
      check.className = "history-check";
      check.textContent = "記録済み";

      item.append(icon, details, check);
      els.historyList.append(item);
    }

    const hasMore = visits.length > MAX_VISIBLE_HISTORY;
    els.toggleHistory.hidden = !hasMore;
    els.toggleHistory.textContent = showAllHistory ? "履歴を折りたたむ" : "すべての履歴を見る";
  }

  els.recordButton.addEventListener("click", () => {
    const today = localDateKey();
    const visits = loadVisits();
    if (visits.includes(today)) {
      showToast("今日はすでに記録されています。");
      render();
      return;
    }
    const updated = [today, ...visits].sort((a, b) => b.localeCompare(a));
    if (saveVisits(updated)) {
      render();
      showToast("今日の来店を記録しました！");
    }
  });

  els.toggleHistory.addEventListener("click", () => {
    showAllHistory = !showAllHistory;
    render();
  });

  els.resetButton.addEventListener("click", () => {
    const visits = loadVisits();
    if (visits.length === 0) {
      showToast("削除する記録がありません。");
      return;
    }
    const confirmed = window.confirm("来店記録をすべて削除します。この操作は取り消せません。よろしいですか？");
    if (!confirmed) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      showAllHistory = false;
      render();
      showToast("すべての来店記録を削除しました。");
    } catch (error) {
      console.error("来店記録の削除に失敗しました:", error);
      showToast("削除できませんでした。");
    }
  });

  render();
})();
