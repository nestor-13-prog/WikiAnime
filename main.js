document.addEventListener("DOMContentLoaded", () => {
  const popularList = document.getElementById("popularList");

  // Cargar animes populares
  fetch("https://api.jikan.moe/v4/anime?order_by=score&sort=desc&limit=12")
    .then(res => res.json())
    .then(data => {
      data.data.forEach(anime => {
        const col = document.createElement("div");
        col.className = "col-md-3 mb-4";

        col.innerHTML = `
          <div class="card h-100 anime-card" onclick="verDetalle(${anime.mal_id})">
            <img src="${anime.images.jpg.image_url}" class="card-img-top" alt="${anime.title}">
            <div class="card-body text-center">
              <h6 class="card-title">${anime.title}</h6>
            </div>
          </div>
        `;
        popularList.appendChild(col);
      });
    })
    .catch(error => {
      popularList.innerHTML = "<p>Error al cargar los animes populares.</p>";
      console.error(error);
    });

  // Añadir listener para traducir sinopsis
  const btn = document.getElementById("translateSynopsisBtn");
  if (btn) {
    btn.addEventListener("click", traducirSinopsis);
  }
});

function buscarAnime() {
  const input = document.getElementById("animeInput").value.trim();
  const card = document.getElementById("animeCard");
  const title = document.getElementById("animeTitle");
  const image = document.getElementById("animeImage");
  const synopsis = document.getElementById("animeSynopsis");
  const episodes = document.getElementById("animeEpisodes");
  const score = document.getElementById("animeScore");

  if (input === "") return;

  fetch(`https://api.jikan.moe/v4/anime?q=${input}&limit=1`)
    .then(res => res.json())
    .then(data => {
      if (data.data.length > 0) {
        const anime = data.data[0];
        title.textContent = anime.title;
        image.src = anime.images.jpg.image_url;
        synopsis.textContent = anime.synopsis || "Sin sinopsis.";
        episodes.textContent = anime.episodes || "Desconocido";
        score.textContent = anime.score || "No calificado";
        card.classList.remove("d-none");
        card.onclick = () => verDetalle(anime.mal_id);
      } else {
        card.innerHTML = "<p>No se encontró ningún anime con ese nombre.</p>";
        card.classList.remove("d-none");
      }
    })
    .catch(error => {
      card.innerHTML = "<p>Error al buscar el anime.</p>";
      card.classList.remove("d-none");
      console.error(error);
    });
}

function verDetalle(id) {
  window.location.href = `anime.html?id=${id}`;
}

// Nueva función para traducir sinopsis usando API pública MyMemory
async function traducirSinopsis() {
  const sinopsisSpan = document.getElementById("animeSynopsis") || document.getElementById("animeSynopsisDetail");
  if (!sinopsisSpan) return;

  let textoOriginal = sinopsisSpan.textContent;
  if (!textoOriginal || textoOriginal.trim() === "") return;

  // ⚠️ Limitar a 500 caracteres para evitar error
  if (textoOriginal.length > 500) {
    textoOriginal = textoOriginal.substring(0, 500);
  }

  try {
    const response = await fetch(
      "https://api.mymemory.translated.net/get?q=" +
        encodeURIComponent(textoOriginal) +
        "&langpair=en|es"
    );
    const data = await response.json();

    if (data && data.responseData && data.responseData.translatedText) {
      sinopsisSpan.textContent = data.responseData.translatedText + " (fragmento traducido)";
      alert("Sinopsis traducida a español (solo primeros 500 caracteres por límite de la API gratuita).");
    } else {
      alert("No se pudo traducir la sinopsis.");
    }
  } catch (error) {
    console.error(error);
    alert("Error al traducir la sinopsis.");
  }
}