// Directory page: search, filter, sort, and infinite-scroll rendering of member cards.

const PAGE_SIZE = 60;

const state = {
  all: [],
  filtered: [],
  rendered: 0,
};

const els = {
  grid: document.getElementById("grid"),
  search: document.getElementById("searchInput"),
  gender: document.getElementById("genderFilter"),
  country: document.getElementById("countryFilter"),
  sort: document.getElementById("sortSelect"),
  vip: document.getElementById("vipFilter"),
  verified: document.getElementById("verifiedFilter"),
  online: document.getElementById("onlineFilter"),
  resultCount: document.getElementById("resultCount"),
  emptyState: document.getElementById("emptyState"),
  loadingState: document.getElementById("loadingState"),
  sentinel: document.getElementById("sentinel"),
};

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function populateFilterOptions(users) {
  const genders = new Set();
  const countries = new Set();
  for (const u of users) {
    if (u.gender) genders.add(u.gender);
    if (u.country) countries.add(u.country);
  }

  for (const g of [...genders].sort()) {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    els.gender.appendChild(opt);
  }

  for (const c of [...countries].sort()) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    els.country.appendChild(opt);
  }
}

function applyFilters() {
  const q = els.search.value.trim().toLowerCase();
  const gender = els.gender.value;
  const country = els.country.value;
  const vipOnly = els.vip.checked;
  const verifiedOnly = els.verified.checked;
  const onlineOnly = els.online.checked;
  const sortBy = els.sort.value;

  let list = state.all.filter((u) => {
    if (gender && u.gender !== gender) return false;
    if (country && u.country !== country) return false;
    if (vipOnly && !u.isVIP) return false;
    if (verifiedOnly && !u.isVerified) return false;
    if (onlineOnly && !u.isOnline) return false;
    if (q) {
      const haystack = `${u.name} ${u.bio}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  if (sortBy === "name") {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "newest") {
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } else if (sortBy === "active") {
    list.sort((a, b) => new Date(b.lastActiveAt || 0) - new Date(a.lastActiveAt || 0));
  }

  state.filtered = list;
  state.rendered = 0;
  els.grid.innerHTML = "";
  renderNextPage();

  els.resultCount.textContent = `${list.length.toLocaleString()} member${list.length === 1 ? "" : "s"}`;
  els.emptyState.classList.toggle("hidden", list.length !== 0);
}

function renderNextPage() {
  const next = state.filtered.slice(state.rendered, state.rendered + PAGE_SIZE);
  const frag = document.createDocumentFragment();

  for (const u of next) {
    frag.appendChild(buildCard(u));
  }

  els.grid.appendChild(frag);
  state.rendered += next.length;
}

function buildCard(u) {
  const card = document.createElement("a");
  card.className = "card";
  card.href = `profile.html?id=${encodeURIComponent(u.id)}`;

  const badges = [];
  if (u.isVIP) badges.push('<span class="badge badge-vip">VIP</span>');
  if (u.isVerified) badges.push('<span class="badge badge-verified">✓ Verified</span>');
  if (u.isOnline) badges.push('<span class="badge badge-online">● Online</span>');

  card.innerHTML = `
    <div class="card-photo-wrap">
      <img class="card-photo" />
      ${badges.length ? `<div class="card-badges">${badges.join("")}</div>` : ""}
    </div>
    <div class="card-body">
      <h2 class="card-name">${escapeHtml(u.name)} ${u.countryCode ? flagEmoji(u.countryCode) : ""}</h2>
      <p class="card-location">${escapeHtml(u.country || "Unknown location")}</p>
      ${u.bio ? `<p class="card-bio">${escapeHtml(u.bio)}</p>` : ""}
    </div>
  `;

  const img = card.querySelector(".card-photo");
  setAvatarWithFallback(img, u.photoUrl, u.name);

  return card;
}

function setupInfiniteScroll() {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && state.rendered < state.filtered.length) {
        renderNextPage();
      }
    },
    { rootMargin: "400px" }
  );
  observer.observe(els.sentinel);
}

function init() {
  loadUsers()
    .then((users) => {
      state.all = users;
      populateFilterOptions(users);
      els.loadingState.classList.add("hidden");
      applyFilters();
      setupInfiniteScroll();
    })
    .catch((err) => {
      els.loadingState.textContent = "Failed to load member data. Please try again later.";
      console.error(err);
    });

  els.search.addEventListener("input", debounce(applyFilters, 150));
  els.gender.addEventListener("change", applyFilters);
  els.country.addEventListener("change", applyFilters);
  els.sort.addEventListener("change", applyFilters);
  els.vip.addEventListener("change", applyFilters);
  els.verified.addEventListener("change", applyFilters);
  els.online.addEventListener("change", applyFilters);
}

init();
