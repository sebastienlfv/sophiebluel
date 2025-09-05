// --- Met à jour l'affichage selon le statut de connexion ---
export const setConnectedStatus = () => {
  const token = localStorage.getItem("token");
  const connectedStatus = document.querySelectorAll(".connected-status")[0];
  const modifyGalleryButton = document.getElementById("modify-gallery");
  const filterButtons = document.querySelectorAll(".filter-container")[0];
  const editionMode = document.getElementById("edition-mode");
  const header = document.querySelector("header");

  if (token) {
    // Utilisateur connecté : affiche les éléments d'édition et le bouton logout
    connectedStatus.innerHTML = "logout";
    modifyGalleryButton.style.display = "flex";
    filterButtons.style.display = "none"; // Masque les boutons de filtre
    editionMode.style.display = "flex"; // Affiche le mode édition
    header.style.marginTop = "90px"; // Ajuste le margin-top du header

    // Déconnexion au clic sur "logout"
    connectedStatus.addEventListener("click", () => {
      localStorage.removeItem("token"); // Supprime le token
      window.location.href = "login.html"; // Redirige vers la page de connexion
    });
  } else {
    // Utilisateur non connecté : affiche le bouton login et masque l'édition
    connectedStatus.innerHTML = "login";
    modifyGalleryButton.style.display = "none";
    filterButtons.style.display = "flex"; // Affiche les boutons de filtre
    header.style.marginTop = "50px"; // Réinitialise le margin-top du header
    editionMode.style.display = "none"; // Cache le mode édition

    // Redirige vers la page de connexion au clic sur "login"
    connectedStatus.addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }
};

// --- Gère l'ouverture et la fermeture de la modal galerie ---
// isActive : true pour ouvrir, false pour fermer
// onClose : callback à exécuter à la fermeture
export const toggleModal = (isActive, onClose) => {
  const body = document.body;
  const modal = document.getElementById("gallery-modal");
  const closeButton = document.getElementById("close-gallery"); // Bouton de fermeture

  if (isActive) {
    modal.style.display = "block"; // Affiche la modal

    // Ajoute un écouteur pour fermer la modal
    closeButton.onclick = () => {
      toggleModal(false);
      if (typeof onClose === "function") onClose();
    };
  } else {
    modal.style.display = "none"; // Cache la modal
    body.classList.remove("no-scroll"); // Réactive le scroll
    closeButton.onclick = null; // Nettoie l'écouteur
  }
};
