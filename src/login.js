import { setConnectedStatus } from "../src/utils.js";

// --- Définition des URLs de l'API ---
const url = "http://localhost:5678/api";
const loginUrl = `${url}/users/login`;

// --- Sélecteurs DOM pour le formulaire et les messages d'erreur ---
const loginForm = document.getElementById("login-form");
const errorEmail = document.getElementById("error-email");
const errorPassword = document.getElementById("error-password");

// --- Vérifie le statut de connexion à l'ouverture de la page ---
document.addEventListener("DOMContentLoaded", () => {
  // Si l'utilisateur est déjà connecté, redirige vers la page d'accueil
  if (localStorage.getItem("token")) {
    window.location.href = "index.html";
  }
});

// --- Gestion de la soumission du formulaire de connexion ---
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Empêche le rechargement de la page

  // Récupère les valeurs saisies par l'utilisateur
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  try {
    // Envoie la requête de connexion à l'API
    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    // Gère les erreurs de connexion
    if (!response.ok) {
      if (response.status === 404) {
        // Email incorrect
        errorEmail.textContent = "Email incorrect. Veuillez réessayer.";
        errorEmail.style.color = "red";
      } else if (response.status === 401) {
        // Mot de passe incorrect
        errorPassword.textContent =
          "Mot de passe incorrect. Veuillez réessayer.";
        errorPassword.style.color = "red";
      }
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    // Si la connexion réussit, stocke le token et redirige
    const data = await response.json();
    localStorage.setItem("token", data.token);
    window.location.href = "index.html";
  } catch (error) {
    // Affiche l'erreur dans la console pour le debug
    console.error("Erreur lors de la connexion :", error);
  }
});
