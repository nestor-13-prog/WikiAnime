document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const container = document.getElementById("anime-detail");

  if (!id) {
    container.innerHTML = "<p>Error: ID del anime no proporcionado.</p>";
    return;
  }

  fetch(`https://api.jikan.moe/v4/anime/${id}`)
    .then(res => res.json())
    .then(data => {
      const anime = data.data;

      container.innerHTML = `
        <div class="row g-4">
          <div class="col-md-4">
            <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
          </div>
          <div class="col-md-8 text-start anime-info">
            <h2>${anime.title}</h2>
            <p><strong>Sinopsis:</strong> <span id="animeSynopsisDetail">${anime.synopsis || "Sin sinopsis."}</span></p>
            <button id="translateSynopsisBtn" class="btn btn-warning fw-bold shadow-sm px-4 py-2 mt-3" style="border-radius: 12px; font-size: 1rem;">
              🌍 Traducir Sinopsis
            </button>
            <button id="originalLangBtn" class="btn btn-warning fw-bold shadow-sm px-4 py-2 mt-3" style="border-radius: 12px; font-size: 1rem; display:none; margin-left: 10px;">
              🔙 Volver al idioma original
            </button>
            <p><strong>Episodios:</strong> ${anime.episodes || "?"}</p>
            <p><strong>Estado:</strong> ${anime.status}</p>
            <p><strong>Puntuación:</strong> ${anime.score || "No calificado"}</p>
            <p><strong>Fecha de emisión:</strong> ${anime.aired.string || "?"}</p>
            <a href="${anime.url}" target="_blank" class="btn btn-primary mt-3">Ver en MyAnimeList</a>
          </div>
        </div>
      `;

      const translateBtn = document.getElementById("translateSynopsisBtn");
      const originalBtn = document.getElementById("originalLangBtn");
      const sinopsisSpan = document.getElementById("animeSynopsisDetail");
      const textoOriginal = sinopsisSpan.textContent;
      let traducido = false;

      async function traducir() {
        try {
          let texto = textoOriginal;
          if (texto.length > 500) texto = texto.substring(0, 500);

          const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=en|es`);
          const data = await response.json();

          if (data?.responseData?.translatedText) {
            const traduccion = data.responseData.translatedText;

            if (traduccion.includes("YOU USED ALL AVAILABLE FREE TRANSLATIONS")) {
              showToast("Límite diario de traducciones alcanzado. Por favor, inténtalo más tarde.");
              return;
            }

            sinopsisSpan.textContent = traduccion + " (fragmento traducido)";
            traducido = true;
            translateBtn.style.display = "none";
            originalBtn.style.display = "inline-block";
            showToast("Sinopsis traducida a español.");
          } else {
            showToast("No se pudo traducir la sinopsis.");
          }
        } catch (error) {
          console.error(error);
          showToast("Error al traducir la sinopsis.");
        }
      }

      function volverOriginal() {
        sinopsisSpan.textContent = textoOriginal;
        traducido = false;
        translateBtn.style.display = "inline-block";
        originalBtn.style.display = "none";
      }

      translateBtn.addEventListener("click", traducir);
      originalBtn.addEventListener("click", volverOriginal);
    })
    .catch(error => {
      container.innerHTML = "<p>Error al obtener detalles del anime.</p>";
      console.error(error);
    });
});

// Función para mostrar mensaje toast
function showToast(message, duration = 4000) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast-message";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}
