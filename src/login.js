import { setConnectedStatus } from "../src/utils.js";

const url = 'http://localhost:5678/api';
const loginUrl = `${url}/users/login`;

const loginForm = document.getElementById('login-form');
const errorEmail = document.getElementById('error-email');
const errorPassword = document.getElementById('error-password');

document.addEventListener('DOMContentLoaded', () => {
  setConnectedStatus(); // Mettre à jour le statut de connexion
  // Vérifier si l'utilisateur est déjà connecté
  if (localStorage.getItem('token')) {
    window.location.href = 'index.html'; // Rediriger vers la page d'accueil si connecté
  }
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Empêcher le rechargement de la page

  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;

  try {
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      if (response.status === 404) {
        errorEmail.textContent = 'Email incorrect. Veuillez réessayer.'; // Message spécifique pour erreur 404
        errorEmail.style.color = 'red'; // Couleur rouge pour l'erreur
      } else if(response.status === 401) {
        errorPassword.textContent = 'Mot de passe incorrect. Veuillez réessayer.'; // Message spécifique pour erreur 404
        errorPassword.style.color = 'red'; // Couleur
      }
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const data = await response.json();
    localStorage.setItem('token', data.token); // Stocker le token dans le localStorage
    window.location.href = 'index.html'; // Rediriger vers la page d'accueil
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
  }
});