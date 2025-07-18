import { setConnectedStatus, toggleModal } from "../src/utils.js";

const url = 'http://localhost:5678/api';
const worksUrl = `${url}/works`;
const gallery = document.getElementsByClassName('gallery')[0];
const filterButtons = document.querySelectorAll('.filter-button');

// Mettre à jour le statut de connexion
document.addEventListener('DOMContentLoaded', () => {
  setConnectedStatus();
});

// Fonction pour afficher les images filtrées
function displayWorks(works, filterCategory = 'all') {
  gallery.innerHTML = ''; // Vider la galerie avant d'afficher les nouvelles images

  works.filter(work => filterCategory === 'all' || work.categoryId === filterCategory)
    .forEach(work => {
      const figureElement = document.createElement('figure');
      const imgElement = document.createElement('img');
      const figcaptionElement = document.createElement('figcaption');

      imgElement.src = work.imageUrl;
      imgElement.alt = work.title;
      figcaptionElement.textContent = work.title;

      figureElement.appendChild(imgElement);
      figureElement.appendChild(figcaptionElement);
      gallery.appendChild(figureElement);
    });
}

// Récupérer les données depuis l'API
fetch(worksUrl)
.then(response => {
  if (!response.ok) {
    throw new Error(`Erreur HTTP : ${response.status}`);
  }
  return response.json();
})
.then(works => {
  // Afficher toutes les images par défaut
  displayWorks(works);

  // Ajouter des écouteurs d'événements aux boutons de filtre
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Récupérer la catégorie à partir de l'attribut data-filter
      const filterCategory = button.dataset.filter === 'all' ? 'all' : parseInt(button.dataset.filter);

      // Mettre à jour l'état actif des boutons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Afficher les images filtrées
      displayWorks(works, filterCategory);
    });
  });
})
.catch(error => {
  console.error('Erreur lors de la récupération des données :', error);

  const loader = document.querySelector('.loader');
  loader.style.display = 'flex'; // Afficher le loader en cas d'erreur
});

// Fonction pour basculer la modal et gérer les requêtes GET et POST
function toggleGalleryModal(requestType) {
  const modalContent = document.getElementById('gallery-container');
  const modalTitle = modalContent.querySelector('h1');
  const modalItems = modalContent.querySelector('#gallery-items');
  const submitButton = document.querySelector('#submit-button');

  // Afficher la modal
  toggleModal(true);

  if (requestType === 'GET') {
    document.getElementById('gallery-back-button').style.display = 'none'; // Cacher le bouton de retour pour GET

    // Modifier le contenu pour GET
    modalTitle.textContent = 'Galerie photo'; // Titre pour la modal

    // Vider le contenu existant avant de générer les nouvelles images
    modalItems.innerHTML = '';
    modalItems.style.justifyContent = 'center';
    modalItems.style.width = '90%';

    submitButton.type = 'button'
    submitButton.innerHTML = 'Ajouter une photo'; // Modifier le texte du bouton
    submitButton.style.backgroundColor = '#1D6154'; // Changer la couleur du bouton
    submitButton.disabled = false; // Activer le bouton

    // Effectuer une requête GET pour récupérer les travaux
    fetch(worksUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`);
        }
        return response.json();
      })
      .then(works => {
        // Générer le HTML pour les travaux
        modalItems.innerHTML = works.map(work => `
          <div class="img-gallery" data-id="${work.id}">
            <img src="${work.imageUrl}" alt="${work.title}"></img>
            <span class="delete-image">&times;</span>
          </div>
        `).join('');
        submitButton.innerHTML = 'Ajouter une photo'; // Modifier le texte du bouton

        const deleteButtons = document.querySelectorAll('.delete-image');
        deleteButtons.forEach(button => {
          button.addEventListener('click', (event) => {
            event.preventDefault(); // Empêcher le comportement par défaut
            const workId = event.target.parentElement.dataset.id; // Récupérer l'ID de l'image
            deleteWork(workId); // Appeler la fonction de suppression
          });
        });
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des données :', error);
        modalItems.innerHTML = '<p>Erreur lors du chargement des données.</p>';
      });
  } else if (requestType === 'POST') {
    document.getElementById('gallery-back-button').style.display = 'flex'; // Afficher le bouton de retour pour POST

    // Modifier le contenu pour POST
    modalTitle.textContent = 'Ajouter une photo'; // Titre pour POST

    // Vider le contenu existant avant de générer les nouvelles images
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

    modalItems.style.justifyContent = 'normal';
    modalItems.style.width = '400px';

    submitButton.type = 'submit';
    submitButton.innerHTML = 'Valider'; // Modifier le texte du bouton
    submitButton.style.backgroundColor = '#A7A7A7'; // Couleur initiale du bouton (désactivé)
    submitButton.disabled = true; // Désactiver le bouton au départ

    // Ajouter un écouteur d'événements pour surveiller les champs du formulaire
    const form = document.getElementById('add-photo-form');
    const titleInput = document.getElementById('photo-title');
    const imageInput = document.getElementById('photo-url');
    const categorySelect = document.getElementById('photo-categorie');

    const checkFormCompletion = () => {
      const title = titleInput.value.trim();
      const imageFile = imageInput.files[0];
      const categoryId = categorySelect.value;

      if (title && imageFile && categoryId) {
        submitButton.style.backgroundColor = '#1D6154'; // Activer le bouton
        submitButton.disabled = false; // Activer le clic
      } else {
        submitButton.style.backgroundColor = '#A7A7A7'; // Désactiver le bouton
        submitButton.disabled = true; // Désactiver le clic
      }
    };

    // Ajouter des écouteurs sur les champs pour vérifier la complétion
    titleInput.addEventListener('input', checkFormCompletion);
    imageInput.addEventListener('input', checkFormCompletion);
    categorySelect.addEventListener('change', checkFormCompletion);

    // Ajouter un écouteur d'événement directement sur le bouton de soumission
    submitButton.addEventListener('click', (event) => {
      event.preventDefault(); // Empêcher le rechargement de la page

      const title = titleInput.value.trim();
      const imageFile = imageInput.files[0];
      const categoryId = parseInt(categorySelect.value);

      if (!title || !imageFile || isNaN(categoryId)) {
        console.error('Tous les champs doivent être remplis.');
        return;
      }

      addWork(title, imageFile, categoryId); // Appeler la fonction pour ajouter le travail
    });
  }
}

// Fonction pour supprimer une image
function deleteWork(workId) {
  const token = localStorage.getItem('token'); // Récupérer le token JWT depuis le localStorage

  fetch(`${worksUrl}/${workId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Ajouter le token JWT dans l'en-tête Authorization
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }

      // Supprimer dynamiquement l'élément de la galerie
      const workElement = document.querySelector(`[data-id="${workId}"]`);
      if (workElement) {
        workElement.remove();
      }
    })
    .catch(error => {
      console.error('Erreur lors de la suppression du travail :', error);
    });
}

function addWork(title, imageFile, categoryId) {
  const token = localStorage.getItem('token'); // Récupérer le token JWT depuis le localStorage

  if (!imageFile) {
    console.error('Aucun fichier sélectionné.');
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('image', imageFile); // Ajouter le fichier
  formData.append('category', categoryId);

  fetch(worksUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}` // Ajouter le token JWT dans l'en-tête Authorization
    },
    body: formData // Envoyer les données sous forme de FormData
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
      return response.json();
    })
    .then(newWork => {
      // Ajouter dynamiquement le nouveau travail à la galerie
      const figureElement = document.createElement('figure');
      const imgElement = document.createElement('img');
      const figcaptionElement = document.createElement('figcaption');

      imgElement.src = newWork.imageUrl;
      imgElement.alt = newWork.title;
      figcaptionElement.textContent = newWork.title;

      figureElement.appendChild(imgElement);
      figureElement.appendChild(figcaptionElement);
      gallery.appendChild(figureElement);

      // Fermer la modal après ajout
      toggleModal(false);
    })
    .catch(error => {
      console.error('Erreur lors de l\'ajout du travail :', error);
    });
}

// Ajouter des écouteurs d'événements aux boutons
document.getElementById('modify-gallery').addEventListener('click', () => {
  toggleGalleryModal('GET'); // Requête GET pour afficher les travaux
});

document.getElementById('gallery-back-button').addEventListener('click', () => {
  toggleGalleryModal('GET'); // Requête GET pour afficher les travaux
});

document.getElementById('submit-button').addEventListener('click', () => {
  toggleGalleryModal('POST'); // Requête POST pour ajouter une photo
});