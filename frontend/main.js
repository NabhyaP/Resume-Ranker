(() => {
    "use strict";

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const tabs = $$(".mode-tab");
    const modeSingle = $("#mode-single");
    const modeBulk = $("#mode-bulk");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            const mode = tab.dataset.mode;
            modeSingle.hidden = (mode !== "single");
            modeBulk.hidden = (mode !== "bulk");
        });
    });

    const jdFileInput = $("#jd-file");
    const resumeFileInput = $("#resume-file");
    const jdDrop = $("#jd-drop");
    const resumeDrop = $("#resume-drop");
    const rankBtn = $("#rank-btn");
    const btnText = rankBtn.querySelector(".btn-text");
    const btnLoader = rankBtn.querySelector(".btn-loader");
    const resultsSection = $("#results");

    let jdFile = null;
    let resumeFile = null;

    const svg = $(".score-ring");
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6c5ce7"/>
            <stop offset="100%" stop-color="#00cec9"/>
        </linearGradient>`;
    svg.prepend(defs);

    function setupDropZone(dropEl, fileInput, type) {
        ["dragenter", "dragover"].forEach((evt) => {
            dropEl.addEventListener(evt, (e) => {
                e.preventDefault();
                dropEl.classList.add("drag-over");
            });
        });
        ["dragleave", "drop"].forEach((evt) => {
            dropEl.addEventListener(evt, (e) => {
                e.preventDefault();
                dropEl.classList.remove("drag-over");
            });
        });

        dropEl.addEventListener("drop", (e) => {
            const file = e.dataTransfer.files[0];
            if (file) setFile(type, file);
        });

        dropEl.addEventListener("click", (e) => {
            if (e.target.closest(".upload-browse")) return;
            fileInput.click();
        });

        fileInput.addEventListener("change", () => {
            if (fileInput.files[0]) setFile(type, fileInput.files[0]);
        });
    }

    function setFile(type, file) {
        const allowed = ["pdf", "docx", "doc", "txt"];
        const ext = file.name.split(".").pop().toLowerCase();
        if (!allowed.includes(ext)) {
            alert("Unsupported file type. Please upload PDF, DOCX, or TXT.");
            return;
        }
        if (type === "jd") {
            jdFile = file;
            showFileName("jd", file.name);
        } else {
            resumeFile = file;
            showFileName("resume", file.name);
        }
    }

    function showFileName(type, name) {
        const filenameEl = $(`#${type}-filename`);
        const dropEl = $(`#${type}-drop`);
        filenameEl.textContent = "📎 " + name;
        filenameEl.hidden = false;
        dropEl.classList.add("has-file");
    }

    setupDropZone(jdDrop, jdFileInput, "jd");
    setupDropZone(resumeDrop, resumeFileInput, "resume");

    async function rankResume() {
        const formData = new FormData();
        if (resumeFile) formData.append("resume_file", resumeFile);
        if (jdFile) formData.append("jd_file", jdFile);

        const res = await fetch("/api/rank-upload", {
            method: "POST",
            body: formData,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Server error ${res.status}`);
        }
        return res.json();
    }

    function animateCounter(el, target, suffix = "%", duration = 1000) {
        const start = performance.now();
        const from = 0;
        function tick(now) {
            const t = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            const val = from + (target - from) * ease;
            el.textContent = Math.round(val) + suffix;
            if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    function renderResults(data) {
        resultsSection.hidden = false;

        const pct = data.final_score;
        const circumference = 2 * Math.PI * 52;
        const offset = circumference * (1 - pct / 100);
        const ringFg = $("#score-ring-fg");
        ringFg.style.strokeDasharray = circumference;
        ringFg.style.strokeDashoffset = circumference;
        requestAnimationFrame(() => {
            ringFg.style.strokeDashoffset = offset;
        });

        const scoreEl = $("#final-score");
        scoreEl.textContent = "0";
        animateCounter(scoreEl, pct, "", 1200);

        const sections = data.section_scores;
        for (const key of Object.keys(sections)) {
            const scoreSpan = $(`.card-score[data-key="${key}"]`);
            const barFill = $(`.card-bar-fill[data-key="${key}"]`);
            if (scoreSpan) animateCounter(scoreSpan, sections[key]);
            if (barFill) {
                barFill.style.width = "0%";
                requestAnimationFrame(() => {
                    barFill.style.width = sections[key] + "%";
                });
            }
        }

        renderSkillList($("#matched-skills"), data.matched_skills);
        renderSkillList($("#missing-skills"), data.missing_skills);
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function renderSkillList(ul, skills) {
        ul.innerHTML = "";
        if (!skills || skills.length === 0) {
            const li = document.createElement("li");
            li.className = "no-items";
            li.textContent = "None";
            ul.appendChild(li);
            return;
        }
        skills.forEach((skill, i) => {
            const li = document.createElement("li");
            li.textContent = skill;
            li.style.animationDelay = `${i * 0.06}s`;
            ul.appendChild(li);
        });
    }

    rankBtn.addEventListener("click", async () => {
        if (!jdFile || !resumeFile) { shakeBtn(rankBtn); return; }
        setLoading(rankBtn, true);
        try {
            const data = await rankResume();
            renderResults(data);
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setLoading(rankBtn, false);
        }
    });

    const bulkJdFileInput = $("#bulk-jd-file");
    const bulkResumeFilesInput = $("#bulk-resume-files");
    const bulkJdDrop = $("#bulk-jd-drop");
    const bulkResumeDrop = $("#bulk-resume-drop");
    const bulkRankBtn = $("#bulk-rank-btn");
    const bulkBtnText = bulkRankBtn.querySelector(".btn-text");
    const bulkBtnLoader = bulkRankBtn.querySelector(".btn-loader");
    const bulkResults = $("#bulk-results");
    const leaderboardList = $("#leaderboard-list");
    const leaderboardSubtitle = $("#leaderboard-subtitle");
    const resumeCountBadge = $("#resume-count-badge");
    const bulkFileList = $("#bulk-file-list");

    let bulkJdFile = null;
    let bulkResumeFiles = [];

    setupSingleDropZone(bulkJdDrop, bulkJdFileInput, (file) => {
        bulkJdFile = file;
        const el = $("#bulk-jd-filename");
        el.textContent = "📎 " + file.name;
        el.hidden = false;
        bulkJdDrop.classList.add("has-file");
    });

    setupMultiDropZone(bulkResumeDrop, bulkResumeFilesInput);

    function setupSingleDropZone(dropEl, fileInput, onFile) {
        ["dragenter", "dragover"].forEach(evt => {
            dropEl.addEventListener(evt, e => { e.preventDefault(); dropEl.classList.add("drag-over"); });
        });
        ["dragleave", "drop"].forEach(evt => {
            dropEl.addEventListener(evt, e => { e.preventDefault(); dropEl.classList.remove("drag-over"); });
        });
        dropEl.addEventListener("drop", e => {
            const f = e.dataTransfer.files[0];
            if (f) onFile(f);
        });
        dropEl.addEventListener("click", e => {
            if (e.target.closest(".upload-browse")) return;
            fileInput.click();
        });
        fileInput.addEventListener("change", () => {
            if (fileInput.files[0]) onFile(fileInput.files[0]);
        });
    }

    function setupMultiDropZone(dropEl, fileInput) {
        ["dragenter", "dragover"].forEach(evt => {
            dropEl.addEventListener(evt, e => { e.preventDefault(); dropEl.classList.add("drag-over"); });
        });
        ["dragleave", "drop"].forEach(evt => {
            dropEl.addEventListener(evt, e => { e.preventDefault(); dropEl.classList.remove("drag-over"); });
        });
        dropEl.addEventListener("drop", e => {
            handleMultipleFiles(Array.from(e.dataTransfer.files));
        });
        dropEl.addEventListener("click", e => {
            if (e.target.closest(".upload-browse")) return;
            fileInput.click();
        });
        fileInput.addEventListener("change", () => {
            handleMultipleFiles(Array.from(fileInput.files));
        });
    }

    function handleMultipleFiles(files) {
        const allowed = ["pdf", "docx", "doc", "txt"];
        const valid = files.filter(f => allowed.includes(f.name.split(".").pop().toLowerCase()));
        if (valid.length === 0) { alert("No supported files found."); return; }

        const existingNames = new Set(bulkResumeFiles.map(f => f.name));
        valid.forEach(f => { if (!existingNames.has(f.name)) bulkResumeFiles.push(f); });

        renderBulkFileList();
    }

    function renderBulkFileList() {
        bulkFileList.innerHTML = "";
        bulkResumeFiles.forEach((f, idx) => {
            const li = document.createElement("li");
            li.className = "file-list-item";
            li.innerHTML = `
                <span class="file-list-name">📄 ${f.name}</span>
                <button class="file-remove-btn" data-idx="${idx}" title="Remove">✕</button>
            `;
            bulkFileList.appendChild(li);
        });

        bulkFileList.querySelectorAll(".file-remove-btn").forEach(btn => {
            btn.addEventListener("click", e => {
                const idx = parseInt(e.currentTarget.dataset.idx);
                bulkResumeFiles.splice(idx, 1);
                renderBulkFileList();
            });
        });

        const count = bulkResumeFiles.length;
        if (count > 0) {
            resumeCountBadge.textContent = count;
            resumeCountBadge.hidden = false;
            bulkResumeDrop.classList.add("has-file");
        } else {
            resumeCountBadge.hidden = true;
            bulkResumeDrop.classList.remove("has-file");
        }
    }

    async function rankMultiple() {
        const formData = new FormData();
        formData.append("jd_file", bulkJdFile);
        bulkResumeFiles.forEach(f => formData.append("resume_files", f));

        const res = await fetch("/api/rank-multiple", {
            method: "POST",
            body: formData,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Server error ${res.status}`);
        }
        return res.json();
    }

    const MEDALS = ["🥇", "🥈", "🥉"];

    function scoreColor(score) {
        if (score >= 75) return "var(--green)";
        if (score >= 50) return "var(--yellow)";
        return "var(--red)";
    }

    function renderLeaderboard(results) {
        bulkResults.hidden = false;
        leaderboardSubtitle.textContent = `Ranked ${results.length} candidate${results.length !== 1 ? "s" : ""} by match score`;
        leaderboardList.innerHTML = "";

        results.forEach((r, i) => {
            const card = document.createElement("div");
            card.className = "leaderboard-card glass" + (i === 0 ? " top-rank" : "");
            card.style.animationDelay = `${i * 0.08}s`;

            const medal = MEDALS[i] || `#${r.rank}`;
            const color = scoreColor(r.final_score);
            const matchedHtml = (r.matched_skills || []).slice(0, 5).map(s =>
                `<span class="skill-chip matched">${s}</span>`).join("") || "<span class='no-items'>None</span>";
            const missingHtml = (r.missing_skills || []).slice(0, 5).map(s =>
                `<span class="skill-chip missing">${s}</span>`).join("") || "<span class='no-items'>None</span>";

            const allMatchedHtml = (r.matched_skills || []).map(s =>
                `<span class="skill-chip matched">${s}</span>`).join("") || "<span class='no-items'>None</span>";
            const allMissingHtml = (r.missing_skills || []).map(s =>
                `<span class="skill-chip missing">${s}</span>`).join("") || "<span class='no-items'>None</span>";

            const displayName = r.filename.includes(".") ? r.filename.split(".").slice(0, -1).join(".") : r.filename;

            card.innerHTML = `
                <div class="lb-main-info">
                    <div class="lb-rank">${medal}</div>
                    <div class="lb-info">
                        <div class="lb-filename">${displayName}</div>
                        <div class="lb-skills-row">
                            <div class="lb-skills-group">
                                <span class="lb-skills-label">✅ Matched:</span>
                                ${matchedHtml}
                                ${r.matched_skills.length > 5 ? `<span class="skill-chip more">+${r.matched_skills.length - 5}</span>` : ""}
                            </div>
                            <div class="lb-skills-group">
                                <span class="lb-skills-label">❌ Missing:</span>
                                ${missingHtml}
                                ${r.missing_skills.length > 5 ? `<span class="skill-chip more">+${r.missing_skills.length - 5}</span>` : ""}
                            </div>
                        </div>
                        <div class="lb-section-scores">
                            ${Object.entries(r.section_scores).map(([k, v]) =>
                `<span class="section-pill">${k}: <b>${v}%</b></span>`
            ).join("")}
                        </div>
                    </div>
                    <div class="lb-score" style="color: ${color}">
                        <span class="lb-score-value" data-target="${r.final_score}">0</span>
                        <span class="lb-score-label">Match</span>
                    </div>
                    <div class="lb-expand-icon">▼</div>
                </div>
                <div class="lb-details">
                    <div class="lb-details-grid">
                        <div class="lb-details-col">
                            <h4>✅ All Matched Skills (${r.matched_skills.length})</h4>
                            <div class="full-skill-list">${allMatchedHtml}</div>
                        </div>
                        <div class="lb-details-col">
                            <h4>❌ All Missing Skills (${r.missing_skills.length})</h4>
                            <div class="full-skill-list">${allMissingHtml}</div>
                        </div>
                    </div>
                </div>
            `;

            card.addEventListener("click", (e) => {
                // Don't toggle if clicking on a button or link inside (if any)
                if (e.target.closest("button, a")) return;

                const isExpanded = card.classList.contains("is-expanded");

                // Optional: Collapse others (accordion style)
                document.querySelectorAll('.leaderboard-card.is-expanded').forEach(c => {
                    if (c !== card) c.classList.remove('is-expanded');
                });

                card.classList.toggle("is-expanded");
            });

            leaderboardList.appendChild(card);

            const scoreEl = card.querySelector(".lb-score-value");
            animateCounter(scoreEl, r.final_score, "%", 1000 + i * 100);
        });

        bulkResults.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    bulkRankBtn.addEventListener("click", async () => {
        if (!bulkJdFile || bulkResumeFiles.length === 0) {
            shakeBtn(bulkRankBtn);
            return;
        }
        setLoading(bulkRankBtn, true);
        try {
            const data = await rankMultiple();
            renderLeaderboard(data);
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setLoading(bulkRankBtn, false);
        }
    });

    function setLoading(btn, on) {
        btn.disabled = on;
        btn.querySelector(".btn-text").hidden = on;
        btn.querySelector(".btn-loader").hidden = !on;
    }

    function shakeBtn(btn) {
        btn.style.animation = "shake 0.4s ease";
        btn.addEventListener("animationend", () => {
            btn.style.animation = "";
        }, { once: true });
    }

    const shakeStyle = document.createElement("style");
    shakeStyle.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%      { transform: translateX(-6px); }
            40%      { transform: translateX(6px); }
            60%      { transform: translateX(-4px); }
            80%      { transform: translateX(4px); }
        }`;
    document.head.appendChild(shakeStyle);
})();
