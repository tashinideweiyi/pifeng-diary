(function () {
  "use strict";

  const STORAGE_PREFIX = "pifeng-diary:";
  const fields = [
    ["wakeTime", "起床时间"],
    ["sleep", "睡眠情况"],
    ["food", "吃了什么"],
    ["did", "做了什么"],
    ["people", "见了谁 / 聊了什么"],
    ["body", "身体状态"],
    ["learned", "今天知道 / 学到的一件事"],
    ["fact", "今天一个小事实"],
  ];

  const dailyThemes = [
    {
      name: "薄荷云朵",
      emoji: "☁️",
      bg: "#eaf8f3",
      card: "#fffefd",
      accent: "#72c9b6",
      soft: "#dff5ef",
      text: "#304640",
      divider: "☁ · ☁ · ☁",
    },
    {
      name: "草莓牛奶",
      emoji: "🍓",
      bg: "#fff0f4",
      card: "#fffdfd",
      accent: "#f38aa4",
      soft: "#ffe1e8",
      text: "#51323a",
      divider: "🍓 · ✦ · 🍓",
    },
    {
      name: "奶油小熊",
      emoji: "🧸",
      bg: "#fff6e8",
      card: "#fffdf8",
      accent: "#d7a76f",
      soft: "#f8e6c8",
      text: "#4b3d31",
      divider: "🧸 · · 🧸",
    },
    {
      name: "黄油吐司",
      emoji: "🍞",
      bg: "#fff7d7",
      card: "#fffefa",
      accent: "#e7bd4f",
      soft: "#ffefad",
      text: "#4d4329",
      divider: "🍞 · ✿ · 🍞",
    },
    {
      name: "蓝莓气泡",
      emoji: "🫧",
      bg: "#edf4ff",
      card: "#fcfdff",
      accent: "#82aaf0",
      soft: "#dce9ff",
      text: "#2f3d59",
      divider: "○ · 🫧 · ○",
    },
    {
      name: "蜜桃午后",
      emoji: "🍑",
      bg: "#fff1e8",
      card: "#fffdfb",
      accent: "#f2a37f",
      soft: "#ffe0d1",
      text: "#55382e",
      divider: "🍑 · · 🍑",
    },
    {
      name: "月光信纸",
      emoji: "🌙",
      bg: "#f5f1ff",
      card: "#fffefe",
      accent: "#a898dc",
      soft: "#e9e1ff",
      text: "#403a58",
      divider: "🌙 · ✦ · 🌙",
    },
    {
      name: "抹茶拿铁",
      emoji: "🍵",
      bg: "#f1f7e7",
      card: "#fffef9",
      accent: "#98bf73",
      soft: "#e1efcf",
      text: "#384632",
      divider: "🍵 · · 🍵",
    },
    {
      name: "橘子软糖",
      emoji: "🍊",
      bg: "#fff0df",
      card: "#fffdfa",
      accent: "#f2a23a",
      soft: "#ffdfb5",
      text: "#503a25",
      divider: "🍊 · ✦ · 🍊",
    },
    {
      name: "小花晴天",
      emoji: "🌼",
      bg: "#f8f8df",
      card: "#fffef9",
      accent: "#d8c94e",
      soft: "#f2efb5",
      text: "#44442c",
      divider: "🌼 · · 🌼",
    },
  ];

  const notes = [
    "今天也记一点点",
    "写一点，就很好",
    "把今天轻轻收好",
    "只是记事，不必总结",
    "今日份小记录",
    "慢慢写，不着急",
    "留下一天的痕迹",
    "今天也有被留下来",
    "小小一天，也算数",
    "记住一些普通的事",
  ];

  const todayDate = toDateInputValue(new Date());
  let currentDate = todayDate;
  let saveTimer = 0;
  let statusTimer = 0;

  const $ = (selector) => document.querySelector(selector);
  const entryForm = $("#entryForm");
  const historyPanel = $("#historyPanel");
  const historyList = $("#historyList");
  const currentDateEl = $("#currentDate");
  const dailyEmojiEl = $("#dailyEmoji");
  const dailyNoteEl = $("#dailyNote");
  const themeChipEl = $("#themeChip");
  const themeDividerEl = $("#themeDivider");
  const saveStatusEl = $("#saveStatus");
  const datePicker = $("#datePicker");
  const copyButton = $("#copyButton");
  const themeColorMeta = $("#themeColorMeta");
  const backupFile = $("#backupFile");
  const moreButton = $("#moreButton");
  const moreMenu = $("#moreMenu");
  const textareas = Array.from(document.querySelectorAll("textarea"));

  function toDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function displayDate(dateKey) {
    return dateKey.replaceAll("-", ".");
  }

  function dayNumber(dateKey) {
    return Math.floor(new Date(`${dateKey}T00:00:00`).getTime() / 86400000);
  }

  function pickForDate(list, dateKey, offset = 0) {
    const day = dayNumber(dateKey);
    return list[(day + offset) % list.length];
  }

  function storageKey(dateKey) {
    return `${STORAGE_PREFIX}${dateKey}`;
  }

  function getEntry(dateKey) {
    try {
      return JSON.parse(localStorage.getItem(storageKey(dateKey))) || {};
    } catch (error) {
      return {};
    }
  }

  function setEntry(dateKey, entry) {
    localStorage.setItem(storageKey(dateKey), JSON.stringify(entry));
  }

  function removeEntry(dateKey) {
    localStorage.removeItem(storageKey(dateKey));
  }

  function readForm() {
    return fields.reduce((entry, [id]) => {
      entry[id] = document.getElementById(id).value.trimEnd();
      return entry;
    }, {});
  }

  function fillForm(entry) {
    fields.forEach(([id]) => {
      document.getElementById(id).value = entry[id] || "";
    });
    resizeAllTextareas();
  }

  function autoResizeTextarea(textarea) {
    if (!textarea.value) {
      textarea.style.height = "";
      return;
    }
    textarea.style.height = "auto";
    const minHeight = Number.parseFloat(window.getComputedStyle(textarea).minHeight) || 42;
    textarea.style.height = `${Math.max(textarea.scrollHeight, minHeight)}px`;
  }

  function resizeAllTextareas() {
    textareas.forEach(autoResizeTextarea);
  }

  function isEmptyEntry(entry) {
    return fields.every(([id]) => !String(entry[id] || "").trim());
  }

  function formatPlainText(dateKey, entry) {
    const lines = [displayDate(dateKey), ""];
    fields.forEach(([id, label]) => {
      lines.push(`- ${label}：${entry[id] || ""}`);
    });
    return lines.join("\n");
  }

  function formatMarkdown(dateKey, entry) {
    return [`## ${displayDate(dateKey)}`, "", ...fields.map(([id, label]) => `- ${label}：${entry[id] || ""}`)].join(
      "\n",
    );
  }

  function applyDailyTheme(dateKey) {
    const theme = pickForDate(dailyThemes, dateKey);
    const note = pickForDate(notes, dateKey, 3);

    document.documentElement.style.setProperty("--bg", theme.bg);
    document.documentElement.style.setProperty("--card", theme.card);
    document.documentElement.style.setProperty("--accent", theme.accent);
    document.documentElement.style.setProperty("--soft", theme.soft);
    document.documentElement.style.setProperty("--text", theme.text);
    document.documentElement.style.setProperty("--line", `${theme.accent}46`);
    document.documentElement.style.setProperty("--field", `${theme.soft}78`);

    themeColorMeta.setAttribute("content", theme.bg);
    dailyEmojiEl.textContent = theme.emoji;
    themeChipEl.textContent = `今日主题：${theme.name} ${theme.emoji}`;
    themeDividerEl.textContent = theme.divider;
    dailyNoteEl.textContent = note;
  }

  function showStatus(text) {
    clearTimeout(statusTimer);
    saveStatusEl.textContent = text;
    saveStatusEl.classList.add("visible");
    statusTimer = window.setTimeout(() => {
      saveStatusEl.classList.remove("visible");
    }, 2000);
  }

  function saveCurrentEntry() {
    const entry = readForm();
    if (isEmptyEntry(entry)) {
      removeEntry(currentDate);
    } else {
      setEntry(currentDate, entry);
    }
    showStatus("已自动保存");
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveCurrentEntry, 250);
  }

  function loadDate(dateKey) {
    currentDate = dateKey;
    currentDateEl.textContent = displayDate(dateKey);
    datePicker.value = dateKey;
    applyDailyTheme(dateKey);
    fillForm(getEntry(dateKey));
    resizeAllTextareas();
    entryForm.hidden = false;
    historyPanel.hidden = true;
    showStatus(dateKey === todayDate ? "已自动保存" : "正在编辑过去日记");
  }

  function allDiaryDates() {
    const dates = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        dates.push(key.slice(STORAGE_PREFIX.length));
      }
    }
    return dates.sort().reverse();
  }

  function allDiaryEntries() {
    return allDiaryDates()
      .sort()
      .reduce((entries, dateKey) => {
        entries[dateKey] = getEntry(dateKey);
        return entries;
      }, {});
  }

  function renderHistory() {
    saveCurrentEntry();
    entryForm.hidden = true;
    historyPanel.hidden = false;
    historyList.innerHTML = "";

    const dates = allDiaryDates().filter((dateKey) => dateKey !== todayDate);
    if (dates.length === 0) {
      historyList.innerHTML = '<p class="empty-history">还没有过去日记。</p>';
      return;
    }

    dates.forEach((dateKey) => {
      const button = document.createElement("button");
      button.className = "history-item";
      button.type = "button";
      button.textContent = displayDate(dateKey);
      button.addEventListener("click", () => loadDate(dateKey));
      historyList.appendChild(button);
    });
  }

  async function copyToday() {
    saveCurrentEntry();
    const text = formatPlainText(todayDate, getEntry(todayDate));
    const originalText = copyButton.textContent;

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }

    copyButton.textContent = "已复制 ✨";
    showStatus("已复制到剪贴板");
    window.setTimeout(() => {
      copyButton.textContent = originalText;
    }, 1400);
  }

  function clearToday() {
    const confirmed = window.confirm("确定清空今日日记吗？");
    if (!confirmed) return;
    if (currentDate !== todayDate) {
      loadDate(todayDate);
    }
    fillForm({});
    removeEntry(todayDate);
    showStatus("已清空");
  }

  function exportAll() {
    saveCurrentEntry();
    const dates = allDiaryDates().sort();
    if (dates.length === 0) {
      showStatus("还没有可导出的日记");
      return;
    }

    const content = ["# PiFeng日记", "", ...dates.map((dateKey) => formatMarkdown(dateKey, getEntry(dateKey)))].join(
      "\n\n",
    );
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PiFeng日记-${displayDate(dates[0])}-${displayDate(dates[dates.length - 1])}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showStatus("已导出 Markdown 文件");
  }

  function exportBackup() {
    saveCurrentEntry();
    const entries = allDiaryEntries();
    const dates = Object.keys(entries);
    if (dates.length === 0) {
      showStatus("还没有可备份的日记");
      return;
    }

    const backup = {
      app: "PiFeng日记",
      version: 1,
      exportedAt: new Date().toISOString(),
      entries,
    };
    const content = JSON.stringify(backup, null, 2);
    const blob = new Blob([content], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PiFeng日记-备份-${displayDate(dates[0])}-${displayDate(dates[dates.length - 1])}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showStatus("已导出备份");
  }

  function normalizeBackupEntries(data) {
    if (data && typeof data === "object" && data.entries && typeof data.entries === "object") {
      return data.entries;
    }
    if (data && typeof data === "object") {
      const keys = Object.keys(data);
      if (keys.every((key) => /^\d{4}-\d{2}-\d{2}$/.test(key))) {
        return data;
      }
      const storageEntries = keys
        .filter((key) => key.startsWith(STORAGE_PREFIX))
        .reduce((entries, key) => {
          const dateKey = key.slice(STORAGE_PREFIX.length);
          try {
            entries[dateKey] = typeof data[key] === "string" ? JSON.parse(data[key]) : data[key];
          } catch (error) {
            entries[dateKey] = {};
          }
          return entries;
        }, {});
      return Object.keys(storageEntries).length ? storageEntries : null;
    }
    return null;
  }

  function importBackupFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const parsed = JSON.parse(String(reader.result || ""));
        const entries = normalizeBackupEntries(parsed);
        if (!entries) {
          showStatus("备份文件格式不正确");
          return;
        }

        const dateKeys = Object.keys(entries).filter((dateKey) => /^\d{4}-\d{2}-\d{2}$/.test(dateKey));
        if (dateKeys.length === 0) {
          showStatus("备份里没有日记记录");
          return;
        }

        const confirmed = window.confirm("导入会合并/覆盖现有记录，是否继续？");
        if (!confirmed) return;

        const conflicts = dateKeys.filter((dateKey) => localStorage.getItem(storageKey(dateKey)));
        let shouldOverwrite = true;
        if (conflicts.length > 0) {
          shouldOverwrite = window.confirm(`发现 ${conflicts.length} 个同日期记录。是否覆盖这些已有记录？`);
        }

        const wasViewingHistory = !historyPanel.hidden;
        let importedCount = 0;
        let skippedCount = 0;
        dateKeys.forEach((dateKey) => {
          const hasExisting = Boolean(localStorage.getItem(storageKey(dateKey)));
          if (hasExisting && !shouldOverwrite) {
            skippedCount += 1;
            return;
          }

          const entry = fields.reduce((cleanEntry, [id]) => {
            cleanEntry[id] = String(entries[dateKey]?.[id] || "");
            return cleanEntry;
          }, {});
          if (!isEmptyEntry(entry)) {
            setEntry(dateKey, entry);
            importedCount += 1;
          }
        });

        if (wasViewingHistory) {
          renderHistory();
        } else {
          loadDate(currentDate);
        }
        showStatus(`已导入 ${importedCount} 条${skippedCount ? `，跳过 ${skippedCount} 条` : ""}`);
      } catch (error) {
        showStatus("备份文件无法读取");
      } finally {
        backupFile.value = "";
      }
    });
    reader.readAsText(file, "utf-8");
  }

  function closeMoreMenu() {
    moreMenu.hidden = true;
    moreButton.setAttribute("aria-expanded", "false");
  }

  function toggleMoreMenu() {
    const willOpen = moreMenu.hidden;
    moreMenu.hidden = !willOpen;
    moreButton.setAttribute("aria-expanded", String(willOpen));
  }

  function runMenuAction(action) {
    closeMoreMenu();
    action();
  }

  function isKeyboardLikelyOpen() {
    if (!window.visualViewport) return document.body.classList.contains("keyboard-open");
    return window.innerHeight - window.visualViewport.height > 120;
  }

  function scrollTextareaIntoView(textarea) {
    window.setTimeout(() => {
      textarea.scrollIntoView({
        behavior: "smooth",
        block: isKeyboardLikelyOpen() ? "center" : "nearest",
      });
    }, 250);
  }

  function handleTextareaFocus(event) {
    document.body.classList.add("keyboard-open");
    scrollTextareaIntoView(event.currentTarget);
  }

  function handleTextareaBlur() {
    window.setTimeout(() => {
      if (!document.activeElement || document.activeElement.tagName !== "TEXTAREA") {
        document.body.classList.remove("keyboard-open");
      }
    }, 200);
  }

  function syncKeyboardState() {
    if (!window.visualViewport) return;
    const activeTextarea = document.activeElement && document.activeElement.tagName === "TEXTAREA";
    if (activeTextarea && isKeyboardLikelyOpen()) {
      document.body.classList.add("keyboard-open");
      scrollTextareaIntoView(document.activeElement);
    }
  }

  entryForm.addEventListener("input", (event) => {
    if (event.target && event.target.tagName === "TEXTAREA") {
      autoResizeTextarea(event.target);
    }
    scheduleSave();
  });
  textareas.forEach((textarea) => {
    textarea.addEventListener("focus", handleTextareaFocus);
    textarea.addEventListener("blur", handleTextareaBlur);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", syncKeyboardState);
    window.visualViewport.addEventListener("scroll", syncKeyboardState);
  }
  copyButton.addEventListener("click", copyToday);
  $("#historyButton").addEventListener("click", renderHistory);
  moreButton.addEventListener("click", toggleMoreMenu);
  $("#exportButton").addEventListener("click", () => runMenuAction(exportAll));
  $("#backupButton").addEventListener("click", () => runMenuAction(exportBackup));
  $("#importButton").addEventListener("click", () => runMenuAction(() => backupFile.click()));
  $("#clearButton").addEventListener("click", () => runMenuAction(clearToday));
  backupFile.addEventListener("change", () => importBackupFile(backupFile.files[0]));
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".more-actions")) {
      closeMoreMenu();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMoreMenu();
    }
  });
  $("#backTodayButton").addEventListener("click", () => loadDate(todayDate));
  $("#datePickerButton").addEventListener("click", () => {
    if (typeof datePicker.showPicker === "function") {
      datePicker.showPicker();
    } else {
      datePicker.click();
    }
  });
  datePicker.addEventListener("change", () => {
    if (datePicker.value) loadDate(datePicker.value);
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(() => {});
    });
  }

  loadDate(todayDate);
})();
