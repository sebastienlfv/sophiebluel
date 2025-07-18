export const setConnectedStatus = () => {
  const token = localStorage.getItem('token');
  const connectedStatus = document.querySelectorAll('.connected-status')[0];
  const modifyGalleryButton = document.getElementById('modify-gallery');
  const filterButtons = document.querySelectorAll('.filter-container')[0];
  const editionMode = document.getElementById('edition-mode');
  const header = document.querySelector('header');

  if(token) {
    connectedStatus.innerHTML = 'logout';
    modifyGalleryButton.style.display = 'flex';
    filterButtons.style.display = 'none'; // Masque les boutons de filtre
    editionMode.style.display = 'flex'; // Afficher le mode édition
    header.style.marginTop = '90px'; // Ajuster le margin-top du header
    connectedStatus.addEventListener('click', () => {
      localStorage.removeItem('token'); // Supprimer le token du localStorage
      window.location.href = 'login.html'; // Rediriger vers la page de connexion
    });
  } else {
    connectedStatus.innerHTML = 'login';
    modifyGalleryButton.style.display = 'none';
    filterButtons.style.display = 'flex'; // Affiche les boutons de filtre  
    header.style.marginTop = '50px'; // Réinitialiser le margin-top du header
    editionMode.style.display = 'none'; // Cacher le mode édition
    connectedStatus.addEventListener('click', () => {
      window.location.href = 'login.html'; // Rediriger vers la page de connexion
    });
  }
}

export const toggleModal = (isActive) => {
    const body = document.body;
    const modal = document.getElementById('gallery-modal');
    const closeButton = document.getElementById('close-gallery'); // Bouton de fermeture

    if (isActive) {
        modal.style.display = 'block'; // Affiche la modal
        // Ajouter un écouteur pour fermer la modal
        closeButton.addEventListener('click', () => {
            toggleModal(false); // Fermer la modal
        });
    } else {
        modal.style.display = 'none'; // Cache la modal
        body.classList.remove('no-scroll'); // Réactive le scroll
        // Supprimer l'écouteur pour éviter les doublons
        closeButton.removeEventListener('click', () => {
            toggleModal(false);
        });
    }
};