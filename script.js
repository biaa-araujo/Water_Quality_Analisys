// Water Quality Predictor — vanilla JS

const FEATURES = [
  {
    key: "ph", name: "Nível de pH (acidez)",
    question: "A água tem gosto/cheiro estranho de azedo ou amargo?",
    tip: "O pH mede se a água é ácida (baixo) ou alcalina (alto). O ideal fica entre 6,5 e 8,5.",
    levels: ["Baixo (ácida)", "Normal", "Alto (alcalina)"],
    values: [4, 7, 10], ideal: [6.5, 8.5], unit: "pH", importance: 0.13
  },
  {
    key: "hardness", name: "Dureza da água",
    question: "A água deixa muitas manchas brancas ou crostas em torneiras/panelas?",
    tip: "Dureza alta significa muito cálcio e magnésio. Causa incrustações mas não é tão perigosa.",
    levels: ["Macia", "Normal", "Muito dura"],
    values: [100, 200, 320], ideal: [120, 250], unit: "mg/L", importance: 0.10
  },
  {
    key: "tds", name: "Sólidos dissolvidos (TDS)",
    question: "A água parece turva, esbranquiçada ou com gosto salgado/metálico?",
    tip: "TDS mede tudo o que está dissolvido na água. Acima de 1000 mg/L já é considerado alto.",
    levels: ["Pouco (limpa)", "Normal", "Muito (turva)"],
    values: [200, 500, 1200], ideal: [100, 600], unit: "mg/L", importance: 0.13
  },
  {
    key: "chloramines", name: "Cheiro de cloro",
    question: "Sente cheiro ou gosto de cloro (como piscina)?",
    tip: "Cloro é usado para tratar a água. Pouco é normal e bom; muito incomoda e pode irritar.",
    levels: ["Nenhum", "Leve", "Forte (piscina)"],
    values: [2, 7, 12], ideal: [4, 8], unit: "ppm", importance: 0.11
  },
  {
    key: "sulfate", name: "Sulfatos",
    question: "A água tem gosto amargo ou já causou desconforto intestinal?",
    tip: "Sulfatos vêm de rochas e solo. Acima de 250 mg/L pode ter efeito laxante.",
    levels: ["Pouco", "Normal", "Muito"],
    values: [200, 320, 480], ideal: [150, 280], unit: "mg/L", importance: 0.12
  },
  {
    key: "conductivity", name: "Condutividade elétrica",
    question: "A fonte da água passa por áreas industriais ou agrícolas?",
    tip: "Mede a quantidade de minerais dissolvidos. Valores muito altos indicam contaminação.",
    levels: ["Baixa", "Normal", "Alta"],
    values: [300, 425, 700], ideal: [200, 500], unit: "μS/cm", importance: 0.10
  },
  {
    key: "carbon", name: "Matéria orgânica",
    question: "A água tem cor amarelada, amarronzada ou cheiro de mofo/terra?",
    tip: "Matéria orgânica vem de plantas e solo. Em excesso reage com cloro e cria subprodutos ruins.",
    levels: ["Pouca", "Normal", "Muita"],
    values: [5, 14, 24], ideal: [2, 12], unit: "mg/L", importance: 0.10
  },
  {
    key: "thm", name: "Subprodutos do cloro",
    question: "É uma água tratada que passa por longos canos antes de chegar?",
    tip: "Trihalometanos (THM) se formam quando o cloro reage com matéria orgânica. Limite seguro: 80 μg/L.",
    levels: ["Pouco", "Normal", "Muito"],
    values: [40, 66, 110], ideal: [10, 80], unit: "μg/L", importance: 0.10
  },
  {
    key: "turbidity", name: "Turbidez (água turva)",
    question: "A água é transparente ou parece turva/com partículas?",
    tip: "Mede quão suja/embaçada está a água. Acima de 5 NTU já está fora do recomendado para consumo.",
    levels: ["Cristalina", "Levemente turva", "Muito turva"],
    values: [2, 4, 6], ideal: [0, 4], unit: "NTU", importance: 0.11
  }
];

const PRESETS = {
  tap:     [1, 1, 1, 1, 1, 1, 1, 1, 0], // água da rede
  well:    [0, 2, 1, 0, 1, 1, 1, 0, 1], // poço
  river:   [1, 1, 2, 0, 2, 2, 2, 0, 2], // rio
  bottled: [1, 1, 0, 0, 1, 0, 0, 0, 0], // engarrafada
};

const state = FEATURES.map(() => 1); // start at "Normal"

const featuresEl = document.getElementById("features");
const presetsEl = document.getElementById("presets");
const resultEl = document.getElementById("result");

// Render features
FEATURES.forEach((f, i) => {
  const card = document.createElement("div");
  card.className = "feature";
  card.innerHTML = `
    <header>
      <div>
        <h4>${f.name}</h4>
        <p class="muted" style="font-size:13px;margin-top:4px">${f.question}</p>
      </div>
      <button class="help" type="button" aria-label="Ajuda">?</button>
    </header>
    <div class="tip">${f.tip}</div>
    <div class="slider-wrap">
      <input type="range" min="0" max="2" step="1" value="1" class="slider" data-i="${i}" style="--p:50%" />
      <div class="labels">
        <span>${f.levels[0]}</span><span>${f.levels[1]}</span><span>${f.levels[2]}</span>
      </div>
      <div class="current-label" id="cl-${i}">${f.levels[1]} · ${f.values[1]} ${f.unit}</div>
    </div>
  `;
  featuresEl.appendChild(card);

  card.querySelector(".help").addEventListener("click", () => card.classList.toggle("show-tip"));
  const slider = card.querySelector(".slider");
  slider.addEventListener("input", e => {
    const v = +e.target.value;
    state[i] = v;
    slider.style.setProperty("--p", (v / 2 * 100) + "%");
    document.getElementById("cl-" + i).textContent = `${f.levels[v]} · ${f.values[v]} ${f.unit}`;
  });
});

// Presets
presetsEl.addEventListener("click", e => {
  const btn = e.target.closest(".preset");
  if (!btn) return;
  document.querySelectorAll(".preset").forEach(p => p.classList.remove("active"));
  btn.classList.add("active");
  const arr = PRESETS[btn.dataset.preset];
  arr.forEach((v, i) => {
    state[i] = v;
    const s = document.querySelector(`.slider[data-i="${i}"]`);
    s.value = v;
    s.style.setProperty("--p", (v / 2 * 100) + "%");
    document.getElementById("cl-" + i).textContent =
      `${FEATURES[i].levels[v]} · ${FEATURES[i].values[v]} ${FEATURES[i].unit}`;
  });
});

// Prediction (heuristic, based on feature importance + ideal ranges)
function predict() {
  let score = 0, totalWeight = 0;
  const problems = [];
  FEATURES.forEach((f, i) => {
    const value = f.values[state[i]];
    const [lo, hi] = f.ideal;
    let s;
    if (value >= lo && value <= hi) s = 1;
    else {
      const range = hi - lo;
      const dist = value < lo ? (lo - value) : (value - hi);
      s = Math.max(0, 1 - dist / (range || 1));
    }
    score += s * f.importance;
    totalWeight += f.importance;
    if (s < 0.6) problems.push(f.name);
  });
  const prob = score / totalWeight;
  return { prob, safe: prob >= 0.55, problems };
}

document.getElementById("analyze").addEventListener("click", () => {
  const { prob, safe, problems } = predict();
  const pct = Math.round(prob * 100);
  resultEl.className = "result " + (safe ? "safe" : "unsafe");
  resultEl.innerHTML = `
    <h3><span class="icon">${safe ? "✅" : "⚠️"}</span>${safe ? "Provavelmente segura para beber" : "Cuidado — pode não ser segura"}</h3>
    <p class="muted">Confiança estimada: <strong>${pct}%</strong></p>
    <div class="bar"><span style="width:${pct}%"></span></div>
    ${problems.length ? `<p style="font-size:14px"><strong>Pontos de atenção:</strong></p><ul>${problems.map(p => `<li>${p}</li>`).join("")}</ul>` : ""}
    <div class="recommend">
      ${safe
        ? "💡 Mesmo assim, prefira sempre água tratada de fonte confiável. Em caso de dúvida, leve uma amostra a um laboratório."
        : "💡 Recomendamos: ferva por pelo menos 1 minuto, use um filtro adequado ou opte por água engarrafada até confirmar a qualidade."}
    </div>
  `;
  resultEl.classList.remove("hidden");
  resultEl.scrollIntoView({ behavior: "smooth", block: "center" });
});

// Tech toggle
const techBtn = document.getElementById("toggle-tech");
const tech = document.getElementById("tech");
techBtn.addEventListener("click", () => {
  tech.classList.toggle("hidden");
  techBtn.textContent = tech.classList.contains("hidden") ? "Mostrar detalhes técnicos" : "Esconder detalhes técnicos";
});

// Importance bars
const impEl = document.getElementById("importance");
[...FEATURES].sort((a, b) => b.importance - a.importance).forEach(f => {
  const row = document.createElement("div");
  row.className = "imp-row";
  const pct = Math.round(f.importance * 100);
  row.innerHTML = `<span>${f.name}</span><div class="imp-bar"><div style="width:${pct * 5}%"></div></div><strong>${pct}%</strong>`;
  impEl.appendChild(row);
});
