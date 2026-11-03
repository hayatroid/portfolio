const res = await fetch("/api/atcoder");
const { rating, color, counts } = await res.json();

for (const el of document.querySelectorAll(".atcoder-rating")) {
  el.textContent = rating;
  el.style.color = color;
}

for (const el of document.querySelectorAll(".atcoder-count")) {
  el.textContent = counts[el.dataset.language];
}
