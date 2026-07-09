// Profile page: looks up a single member by id and renders full details.

const els = {
  loading: document.getElementById("loadingState"),
  notFound: document.getElementById("notFound"),
  card: document.getElementById("profileCard"),
  photo: document.getElementById("profilePhoto"),
  name: document.getElementById("profileName"),
  badges: document.getElementById("profileBadges"),
  location: document.getElementById("profileLocation"),
  bio: document.getElementById("profileBio"),
  gender: document.getElementById("detailGender"),
  language: document.getElementById("detailLanguage"),
  country: document.getElementById("detailCountry"),
  joined: document.getElementById("detailJoined"),
  active: document.getElementById("detailActive"),
  vibesSection: document.getElementById("vibesSection"),
  vibesList: document.getElementById("vibesList"),
  gallerySection: document.getElementById("gallerySection"),
  galleryGrid: document.getElementById("galleryGrid"),
};

function renderProfile(u) {
  document.title = `${u.name} — Member Profile`;

  setAvatarWithFallback(els.photo, u.photoUrl, u.name);

  els.name.textContent = `${u.name} ${u.countryCode ? flagEmoji(u.countryCode) : ""}`;

  const badges = [];
  if (u.isVIP) badges.push('<span class="badge badge-vip">VIP</span>');
  if (u.isVerified) badges.push('<span class="badge badge-verified">✓ Verified</span>');
  if (u.isOnline) badges.push('<span class="badge badge-online">● Online now</span>');
  els.badges.innerHTML = badges.join("");

  els.location.textContent = u.country || "Location unknown";

  els.bio.textContent = u.bio || "This member hasn't written a bio yet.";

  els.gender.textContent = u.gender || "Not specified";
  els.language.textContent = u.nativeLanguage || "Not specified";
  els.country.textContent = u.country || "Not specified";
  els.joined.textContent = formatDate(u.createdAt);
  els.active.textContent = u.isOnline ? "Online now" : timeAgo(u.lastActiveAt);

  if (u.vibes && u.vibes.length) {
    els.vibesSection.classList.remove("hidden");
    els.vibesList.innerHTML = u.vibes
      .map((v) => `<span class="tag">${escapeHtml(v)}</span>`)
      .join("");
  }

  if (u.gallery && u.gallery.length) {
    els.gallerySection.classList.remove("hidden");
    const frag = document.createDocumentFragment();
    for (const url of u.gallery) {
      const img = document.createElement("img");
      img.className = "gallery-photo";
      img.loading = "lazy";
      img.alt = `${u.name}'s gallery photo`;
      img.src = url;
      img.onerror = () => img.remove();
      frag.appendChild(img);
    }
    els.galleryGrid.appendChild(frag);
  }

  els.loading.classList.add("hidden");
  els.card.classList.remove("hidden");
}

function init() {
  const id = getQueryId();
  if (!id) {
    els.loading.classList.add("hidden");
    els.notFound.classList.remove("hidden");
    return;
  }

  loadUsers()
    .then((users) => {
      const user = users.find((u) => u.id === id);
      if (!user) {
        els.loading.classList.add("hidden");
        els.notFound.classList.remove("hidden");
        return;
      }
      renderProfile(user);
    })
    .catch((err) => {
      els.loading.textContent = "Failed to load member data. Please try again later.";
      console.error(err);
    });
}

init();
