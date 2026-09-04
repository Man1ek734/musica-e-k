(() => {
  const escapeHtml = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const stars = (rating) => {
    const count = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    return "★".repeat(count) + "☆".repeat(5 - count);
  };

  const formatRating = (rating) => Number(rating || 0).toFixed(1).replace(".", ",");

  async function loadReviews() {
    const grid = document.querySelector(".reviews-grid");
    const ratingNumber = document.querySelector(".rating-number");
    const starsEl = document.querySelector(".stars");
    const ratingText = document.querySelector(".rating-card p");
    const note = document.querySelector(".note");

    if (!grid) return;

    try {
      const response = await fetch(`reviews.json?v=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Brak pliku reviews.json");
      const data = await response.json();

      if (ratingNumber && data.rating != null) ratingNumber.textContent = formatRating(data.rating);
      if (starsEl && data.rating != null) starsEl.textContent = stars(data.rating);

      if (ratingText) {
        const count = Number(data.reviewCount || 0);
        ratingText.textContent = count
          ? `Aktualna ocena MUSICA w Google na podstawie ${count} ${count === 1 ? "opinii" : "opinii"}. Poniżej wyświetlają się recenzje pobrane z wizytówki Google.`
          : "Aktualna ocena i opinie MUSICA są pobierane z wizytówki Google.";
      }

      const reviews = Array.isArray(data.reviews) ? data.reviews : [];

      if (reviews.length) {
        grid.innerHTML = reviews.map((review) => {
          const author = escapeHtml(review.author || "Użytkownik Google");
          const text = escapeHtml(review.text || "");
          const date = escapeHtml(review.relativeTime || review.publishTime || "");
          const rating = Number(review.rating || 0);
          const authorUrl = review.authorUrl ? escapeHtml(review.authorUrl) : "";
          const authorMarkup = authorUrl
            ? `<a href="${authorUrl}" target="_blank" rel="noopener" class="review-author">${author}</a>`
            : `<div class="review-author">${author}</div>`;

          return `
            <article class="review reveal show">
              <div>
                <div class="review-stars" aria-label="Ocena ${rating} na 5">${stars(rating)}</div>
                <p>${text}</p>
              </div>
              <div>
                ${authorMarkup}
                <div class="review-source">Google Maps${date ? ` • ${date}` : ""}</div>
              </div>
            </article>`;
        }).join("");

        if (note) {
          note.textContent = data.updatedAt
            ? `Opinie są synchronizowane automatycznie z Google. Ostatnia aktualizacja: ${new Date(data.updatedAt).toLocaleString("pl-PL")}.`
            : "Opinie są synchronizowane automatycznie z Google.";
        }
      } else {
        grid.innerHTML = `
          <article class="review reveal show" style="grid-column:1/-1;min-height:180px">
            <div>
              <div class="review-stars">★★★★★</div>
              <p>Automatyczne pobieranie opinii jest przygotowane. Gdy synchronizacja z Google zostanie aktywowana, recenzje będą pojawiać się tutaj bez ręcznego dopisywania.</p>
            </div>
            <div>
              <div class="review-author">MUSICA Studium Muzyczne</div>
              <div class="review-source">Google Maps</div>
            </div>
          </article>`;
      }
    } catch (error) {
      console.warn("Nie udało się wczytać opinii:", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadReviews);
  } else {
    loadReviews();
  }
})();
