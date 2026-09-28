const state = {
  papers: [],
  filtered: [],
  sortKey: 'year',
  sortAsc: false,
};

const els = {
  tbody: document.querySelector('#paper-table tbody'),
  search: document.querySelector('#search-input'),
  category: document.querySelector('#category-filter'),
  year: document.querySelector('#year-filter'),
  venue: document.querySelector('#venue-filter'),
  summary: document.querySelector('#summary-row'),
  exportCsv: document.querySelector('#export-csv'),
  categoryBars: document.querySelector('#category-bars'),
  yearBars: document.querySelector('#year-bars'),
  statTotal: document.querySelector('#stat-total'),
  statCategories: document.querySelector('#stat-categories'),
  statYears: document.querySelector('#stat-years'),
};

function normalize(value) {
  return String(value ?? '').toLowerCase().trim();
}

function uniqueSorted(values, numeric = false) {
  const arr = [...new Set(values.filter(Boolean))];
  return numeric ? arr.sort((a, b) => b - a) : arr.sort((a, b) => String(a).localeCompare(String(b)));
}

function buildOptions(select, values, label) {
  select.innerHTML = `<option value="all">All ${label}</option>`;
  values.forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function paperSearchBlob(paper) {
  return normalize([
    paper.title,
    paper.year,
    paper.venue,
    paper.category,
    paper.task,
    paper.dataset,
    paper.modality,
    paper.highlight,
    ...(paper.tags || []),
  ].join(' '));
}

function applyFilters() {
  const q = normalize(els.search.value);
  const category = els.category.value;
  const year = els.year.value;
  const venue = els.venue.value;

  state.filtered = state.papers.filter(paper => {
    const matchesSearch = !q || paperSearchBlob(paper).includes(q);
    const matchesCategory = category === 'all' || paper.category === category;
    const matchesYear = year === 'all' || String(paper.year) === year;
    const matchesVenue = venue === 'all' || paper.venue === venue;
    return matchesSearch && matchesCategory && matchesYear && matchesVenue;
  });

  sortPapers(false);
  renderTable();
  renderSummary();
}

function sortPapers(toggle = true, key = state.sortKey) {
  if (toggle && state.sortKey === key) {
    state.sortAsc = !state.sortAsc;
  } else if (toggle) {
    state.sortKey = key;
    state.sortAsc = key !== 'year';
  }
  const direction = state.sortAsc ? 1 : -1;
  state.filtered.sort((a, b) => {
    const av = a[state.sortKey];
    const bv = b[state.sortKey];
    if (state.sortKey === 'year') return (Number(av) - Number(bv)) * direction;
    return String(av).localeCompare(String(bv)) * direction;
  });
}

function link(label, url) {
  if (!url) return '';
  return `<a class="link-pill" href="${url}" target="_blank" rel="noopener">${label}</a>`;
}

function renderTable() {
  els.tbody.innerHTML = state.filtered.map(paper => {
    const tags = (paper.tags || []).slice(0, 4).map(t => `<span class="tag">${t}</span>`).join('');
    const links = [
      link('Paper', paper.links?.paper),
      link('Code', paper.links?.code),
      link('Project', paper.links?.project),
      link('Dataset', paper.links?.dataset),
    ].filter(Boolean).join('');
    return `
      <tr>
        <td><strong>${paper.year || '-'}</strong></td>
        <td>
          <div class="paper-title">${paper.title}</div>
          <div class="paper-highlight">${paper.highlight || ''}</div>
          <div class="tag-row">${tags}</div>
        </td>
        <td>${paper.venue || '-'}</td>
        <td>${paper.category || '-'}</td>
        <td><strong>${paper.task || '-'}</strong><br><span class="paper-highlight">${paper.dataset || '-'}</span></td>
        <td><div class="link-row">${links || '<span class="paper-highlight">Add links</span>'}</div></td>
      </tr>
    `;
  }).join('');
}

function renderSummary() {
  const categories = uniqueSorted(state.filtered.map(p => p.category));
  const years = uniqueSorted(state.filtered.map(p => p.year), true);
  els.summary.innerHTML = `
    <span class="chip">${state.filtered.length} shown</span>
    <span class="chip">${categories.length} categories</span>
    <span class="chip">${years.length} years</span>
  `;
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || 'Unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function renderBars(container, counts) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, count]) => count), 1);
  container.innerHTML = entries.map(([label, count]) => `
    <div class="bar">
      <div class="bar-label" title="${label}">${label}</div>
      <div class="bar-track"><div class="bar-fill" style="width: ${(count / max) * 100}%"></div></div>
      <div class="bar-value">${count}</div>
    </div>
  `).join('');
}

function renderStats() {
  const categories = uniqueSorted(state.papers.map(p => p.category));
  const years = uniqueSorted(state.papers.map(p => p.year), true);
  els.statTotal.textContent = state.papers.length;
  els.statCategories.textContent = categories.length;
  els.statYears.textContent = years.length;
  renderBars(els.categoryBars, countBy(state.papers, 'category'));
  renderBars(els.yearBars, countBy(state.papers, 'year'));
}

function exportCSV() {
  const columns = ['year', 'title', 'venue', 'category', 'task', 'dataset', 'modality', 'highlight'];
  const escape = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = [columns.join(','), ...state.filtered.map(p => columns.map(c => escape(p[c])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hsi_cv_survey_papers.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function wireEvents() {
  [els.search, els.category, els.year, els.venue].forEach(el => el.addEventListener('input', applyFilters));
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      sortPapers(true, th.dataset.sort);
      renderTable();
    });
  });
  els.exportCsv.addEventListener('click', exportCSV);

  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('#nav-links');
  navToggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  document.querySelector('#year-now').textContent = new Date().getFullYear();
}

async function init() {
  try {
    const response = await fetch('data/papers.json');
    if (!response.ok) throw new Error(`Cannot load data/papers.json: ${response.status}`);
    state.papers = await response.json();
    buildOptions(els.category, uniqueSorted(state.papers.map(p => p.category)), 'categories');
    buildOptions(els.year, uniqueSorted(state.papers.map(p => p.year), true), 'years');
    buildOptions(els.venue, uniqueSorted(state.papers.map(p => p.venue)), 'venues');
    state.filtered = [...state.papers];
    renderStats();
    applyFilters();
  } catch (error) {
    els.tbody.innerHTML = `<tr><td colspan="6">Failed to load paper data. ${error.message}</td></tr>`;
    console.error(error);
  }
  wireEvents();
}

init();
