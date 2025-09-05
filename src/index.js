import { setConnectedStatus, toggleModal } from "../src/utils.js";

// --- Variables globales et sélecteurs DOM ---
const url = "http://localhost:5678/api";
const worksUrl = `${url}/works`;
const gallery = document.getElementsByClassName("gallery")[0];
const filterButtons = document.querySelectorAll(".filter-button");

// --- Met à jour le statut de connexion à l'ouverture de la page ---
document.addEventListener("DOMContentLoaded", () => {
  setConnectedStatus();
});

// --- Affiche les travaux dans la galerie, avec filtrage par catégorie ---
function displayWorks(works, filterCategory = "all") {
  gallery.innerHTML = ""; // Vide la galerie avant d'afficher les nouvelles images

  works
    .filter(
      (work) => filterCategory === "all" || work.categoryId === filterCategory
    )
    .forEach((work) => {
      // Création des éléments pour chaque travail
      const figureElement = document.createElement("figure");
      const imgElement = document.createElement("img");
      const figcaptionElement = document.createElement("figcaption");

      imgElement.src = work.imageUrl;
      imgElement.alt = work.title;
      figcaptionElement.textContent = work.title;

      figureElement.appendChild(imgElement);
      figureElement.appendChild(figcaptionElement);
      gallery.appendChild(figureElement);
    });
}

// --- Récupère les travaux depuis l'API et initialise les filtres ---
fetch(worksUrl)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }
    return response.json();
  })
  .then((works) => {
    // Affiche toutes les images par défaut
    displayWorks(works);

    // Ajoute les écouteurs d'événements aux boutons de filtre
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Récupère la catégorie à partir de l'attribut data-filter
        const filterCategory =
          button.dataset.filter === "all"
            ? "all"
            : parseInt(button.dataset.filter);

        // Met à jour l'état actif des boutons
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        // Affiche les images filtrées
        displayWorks(works, filterCategory);
      });
    });
  })
  .catch((error) => {
    console.error("Erreur lors de la récupération des données :", error);

    // Affiche le loader en cas d'erreur
    const loader = document.querySelector(".loader");
    loader.style.display = "flex";
  });

// --- Fonction utilitaire pour rafraîchir la galerie depuis l'API ---
function fetchAndDisplayWorks() {
  fetch(worksUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
      return response.json();
    })
    .then((works) => {
      displayWorks(works);
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des données :", error);
    });
}

// --- Gère l'ouverture et le contenu de la modal (GET = galerie, POST = ajout) ---
function toggleGalleryModal(requestType) {
  const modalContent = document.getElementById("gallery-container");
  const modalTitle = modalContent.querySelector("h1");
  const modalItems = modalContent.querySelector("#gallery-items");
  const submitButton = document.querySelector("#submit-button");

  // Ouvre la modal et rafraîchit la galerie à la fermeture
  toggleModal(true, fetchAndDisplayWorks);

  if (requestType === "GET") {
    // --- Affichage de la galerie (GET) ---
    document.getElementById("gallery-back-button").style.display = "none";
    modalTitle.textContent = "Galerie photo";
    modalItems.innerHTML = "";
    modalItems.style.justifyContent = "center";
    modalItems.style.width = "90%";

    submitButton.type = "button";
    submitButton.innerHTML = "Ajouter une photo";
    submitButton.style.backgroundColor = "#1D6154";
    submitButton.disabled = false;

    // Récupère et affiche les travaux dans la modal
    fetch(worksUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`);
        }
        return response.json();
      })
      .then((works) => {
        // Génère le HTML pour chaque travail dans la galerie modale
        modalItems.innerHTML = works
          .map(
            (work) => `
          <div class="img-gallery" data-id="${work.id}">
            <img src="${work.imageUrl}" alt="${work.title}"></img>
            <span class="delete-image">&times;</span>
          </div>
        `
          )
          .join("");
        submitButton.innerHTML = "Ajouter une photo";

        // Ajoute les écouteurs pour la suppression d'image
        const deleteButtons = document.querySelectorAll(".delete-image");
        deleteButtons.forEach((button) => {
          button.addEventListener("click", (event) => {
            event.preventDefault();
            const workId = event.target.parentElement.dataset.id;
            deleteWork(workId);
          });
        });
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des données :", error);
        modalItems.innerHTML = "<p>Erreur lors du chargement des données.</p>";
      });

    // Ouvre la modal d'ajout lors du clic sur le bouton
    submitButton.onclick = () => {
      toggleGalleryModal("POST");
    };
  } else if (requestType === "POST") {
    // --- Affichage du formulaire d'ajout (POST) ---
    document.getElementById("gallery-back-button").style.display = "flex";
    modalTitle.textContent = "Ajouter une photo";
    modalItems.innerHTML = `
      <form id="add-photo-form">
        <div class="form-img">
          <img id="photo-img" src="./assets/icons/picture-svg.png"></img>
          <label for="photo-url" class="file-label">+ Ajouter photo</label>
          <input type="file" id="photo-url" name="image" required>
          <span class="file-info">jpg, png: 4mo max</span>
        </div>
        <div>
          <label for="photo-title">Titre</label>
          <input type="text" id="photo-title" name="title" required>
        </div>
        <div>
          <label for="photo-categorie">Catégorie</label>
          <select id="photo-categorie" name="photo-categorie" required>
            <option value="">-- Sélectionnez une catégorie --</option>
            <option value="1">Objets</option>
            <option value="2">Appartement</option>
            <option value="3">Hôtel & Restaurant</option>
          </select>
        </div>
      </form>
    `;
    modalItems.style.justifyContent = "normal";
    modalItems.style.width = "400px";

    // Remplace le bouton pour supprimer les anciens écouteurs
    const oldSubmitButton = document.querySelector("#submit-button");
    const newSubmitButton = oldSubmitButton.cloneNode(true);
    oldSubmitButton.parentNode.replaceChild(newSubmitButton, oldSubmitButton);

    newSubmitButton.type = "submit";
    newSubmitButton.innerHTML = "Valider";
    newSubmitButton.style.backgroundColor = "#A7A7A7";
    newSubmitButton.disabled = true;

    // Sélection des champs du formulaire d'ajout
    const form = document.getElementById("add-photo-form");
    const titleInput = document.getElementById("photo-title");
    const imageInput = document.getElementById("photo-url");
    const categorySelect = document.getElementById("photo-categorie");
    const formImgDiv = form.querySelector(".form-img");

    // --- Prévisualisation de l'image sélectionnée ---
    imageInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        // Affiche l'aperçu dans le cadre bleu clair
        formImgDiv.innerHTML = "";
        formImgDiv.style.backgroundColor = "#E8F1F6";
        formImgDiv.style.height = "180px";
        formImgDiv.style.display = "flex";
        formImgDiv.style.alignItems = "center";
        formImgDiv.style.justifyContent = "center";
        formImgDiv.style.borderRadius = "5px";
        formImgDiv.style.overflow = "hidden";

        const previewImg = document.createElement("img");
        previewImg.src = URL.createObjectURL(file);
        previewImg.style.width = "100%";
        previewImg.style.height = "100%";
        previewImg.style.objectFit = "contain";
        previewImg.style.borderRadius = "5px";
        formImgDiv.appendChild(previewImg);
      } else {
        // Remet le contenu initial si aucun fichier sélectionné
        formImgDiv.innerHTML = `
        <img id="photo-img" src="./assets/icons/picture-svg.png"></img>
        <label for="photo-url" class="file-label">+ Ajouter photo</label>
        <input type="file" id="photo-url" name="image" required>
        <span class="file-info">jpg, png: 4mo max</span>
      `;
      }
    });

    // --- Active le bouton "Valider" si tous les champs sont remplis ---
    const checkFormCompletion = () => {
      const title = titleInput.value.trim();
      const imageFile = imageInput.files[0];
      const categoryId = categorySelect.value;

      if (title && imageFile && categoryId) {
        newSubmitButton.style.backgroundColor = "#1D6154";
        newSubmitButton.disabled = false;
      } else {
        newSubmitButton.style.backgroundColor = "#A7A7A7";
        newSubmitButton.disabled = true;
      }
    };

    titleInput.addEventListener("input", checkFormCompletion);
    imageInput.addEventListener("input", checkFormCompletion);
    categorySelect.addEventListener("change", checkFormCompletion);

    // --- Gère la soumission du formulaire d'ajout ---
    newSubmitButton.addEventListener("click", (event) => {
      event.preventDefault();

      const title = titleInput.value.trim();
      const imageFile = imageInput.files[0];
      const categoryId = parseInt(categorySelect.value);

      if (!title || !imageFile || isNaN(categoryId)) {
        console.error("Tous les champs doivent être remplis.");
        return;
      }

      addWork(title, imageFile, categoryId);
    });

    // Réinitialise le formulaire à chaque ouverture
    form.reset();
  }
}

// --- Supprime un travail via l'API et retire l'élément du DOM ---
function deleteWork(workId) {
  const token = localStorage.getItem("token");

  fetch(`${worksUrl}/${workId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
      // Retire l'élément supprimé de la galerie modale
      const workElement = document.querySelector(`[data-id="${workId}"]`);
      if (workElement) {
        workElement.remove();
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la suppression du travail :", error);
    });
}

// --- Ajoute un nouveau travail via l'API et met à jour la galerie ---
function addWork(title, imageFile, categoryId) {
  const token = localStorage.getItem("token");

  if (!imageFile) {
    console.error("Aucun fichier sélectionné.");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("image", imageFile);
  formData.append("category", categoryId);

  fetch(worksUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
      return response.json();
    })
    .then((newWork) => {
      // Ajoute dynamiquement le nouveau travail à la galerie principale
      const figureElement = document.createElement("figure");
      const imgElement = document.createElement("img");
      const figcaptionElement = document.createElement("figcaption");

      imgElement.src = newWork.imageUrl;
      imgElement.alt = newWork.title;
      figcaptionElement.textContent = newWork.title;

      figureElement.appendChild(imgElement);
      figureElement.appendChild(figcaptionElement);
      gallery.appendChild(figureElement);

      // Réinitialise le formulaire et le bouton
      const form = document.getElementById("add-photo-form");
      if (form) form.reset();
      const submitBtn = document.querySelector("#submit-button");
      if (submitBtn) {
        submitBtn.style.backgroundColor = "#A7A7A7";
        submitBtn.disabled = true;
      }

      // Ferme la modal après ajout
      toggleModal(false);
    })
    .catch((error) => {
      console.error("Erreur lors de l'ajout du travail :", error);
    });
}

// --- Écouteurs pour ouvrir la modal galerie ou revenir en arrière ---
document.getElementById("modify-gallery").addEventListener("click", () => {
  toggleGalleryModal("GET");
});

document.getElementById("gallery-back-button").addEventListener("click", () => {
  toggleGalleryModal("GET");
});
