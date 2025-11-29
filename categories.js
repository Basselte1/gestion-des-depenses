/* ====================================
   GESTION DES CATÉGORIES - categories.js
   Code simplifié pour débuter
   ==================================== */

// ===== 1. RÉCUPÉRER LES DONNÉES DU LOCALSTORAGE =====

// Récupérer les catégories (ou liste vide si aucune)
let categories = JSON.parse(localStorage.getItem('categories')) || [];

// Variable pour savoir quelle catégorie on édite
let idEnEdition = null;

// ===== 2. RÉCUPÉRER LES ÉLÉMENTS HTML =====

const formeCategorie = document.getElementById('formeCategorie');
const champNom = document.getElementById('nomCategorie');
const champDescription = document.getElementById('descriptionCategorie');
const champCouleur = document.getElementById('couleurCategorie');
const listeCategories = document.getElementById('listeCategories');
const champRecherche = document.getElementById('champRecherche');

// ===== 3. AFFICHER LES CATÉGORIES =====

function afficherCategories() {
    // Si aucune catégorie, afficher un message
    if(categories.length === 0) {
        listeCategories.innerHTML = '<p class="empty-message">Aucune catégorie enregistrée</p>';
        return;
    }

    // Créer une copie de la liste
    let categoriesAffichees = categories.slice();

    // Appliquer la recherche
    const textRecherche = champRecherche.value.toLowerCase();
    if(textRecherche) {
        categoriesAffichees = categoriesAffichees.filter(function(cat) {
            return cat.nom.toLowerCase().includes(textRecherche) ||
                   (cat.description && cat.description.toLowerCase().includes(textRecherche));
        });
    }

    // Si aucun résultat
    if(categoriesAffichees.length === 0) {
        listeCategories.innerHTML = '<p class="empty-message">Aucune catégorie trouvée</p>';
        return;
    }

    // Créer le HTML pour chaque catégorie
    let html = '';
    for(let i = 0; i < categoriesAffichees.length; i++) {
        const cat = categoriesAffichees[i];

        // Créer la carte
        html = html + '<div class="carte-element">' +
            '<div style="display: flex; align-items: center; margin-bottom: 8px;">' +
                '<div style="width: 25px; height: 25px; background-color: ' + cat.couleur + '; border-radius: 5px; margin-right: 12px;"></div>' +
                '<h3>' + cat.nom + '</h3>' +
            '</div>' +
            '<p>' + (cat.description || 'Aucune description') + '</p>' +
            '<div class="carte-actions">' +
                '<button class="bouton-petit bouton-modifier" onclick="editerCategorie(\'' + cat.id + '\')">Modifier</button>' +
                '<button class="bouton-petit bouton-supprimer" onclick="supprimerCategorie(\'' + cat.id + '\')">Supprimer</button>' +
            '</div>' +
        '</div>';
    }

    listeCategories.innerHTML = html;
}

// Afficher les catégories au chargement
afficherCategories();

// ===== 4. AJOUTER/MODIFIER UNE CATÉGORIE =====

formeCategorie.addEventListener('submit', function(evenement) {
    evenement.preventDefault();

    // Récupérer les valeurs
    const nom = champNom.value;
    const description = champDescription.value;
    const couleur = champCouleur.value;

    // Vérifier que le nom est rempli
    if(!nom) {
        alert('Le nom de la catégorie est obligatoire');
        return;
    }

    // Créer l'objet catégorie
    const categorie = {
        id: idEnEdition || Date.now().toString(),
        nom: nom,
        description: description,
        couleur: couleur
    };

    if(idEnEdition) {
        // MODE MODIFICATION: Trouver et remplacer
        for(let i = 0; i < categories.length; i++) {
            if(categories[i].id === idEnEdition) {
                categories[i] = categorie;
                break;
            }
        }
        idEnEdition = null;
    } else {
        // MODE AJOUT: Vérifier qu'il n'existe pas déjà
        let existe = false;
        for(let i = 0; i < categories.length; i++) {
            if(categories[i].nom.toLowerCase() === nom.toLowerCase()) {
                existe = true;
                break;
            }
        }

        if(existe) {
            alert('Cette catégorie existe déjà');
            return;
        }

        // Ajouter à la liste
        categories.push(categorie);
    }

    // Sauvegarder dans le localStorage
    localStorage.setItem('categories', JSON.stringify(categories));

    // Réinitialiser le formulaire
    formeCategorie.reset();
    champCouleur.value = '#667eea';

    // Afficher les catégories
    afficherCategories();
});

// ===== 5. ÉDITER UNE CATÉGORIE =====

function editerCategorie(id) {
    // Trouver la catégorie
    let categorie;
    for(let i = 0; i < categories.length; i++) {
        if(categories[i].id === id) {
            categorie = categories[i];
            break;
        }
    }

    if(!categorie) return;

    // Remplir le formulaire
    champNom.value = categorie.nom;
    champDescription.value = categorie.description || '';
    champCouleur.value = categorie.couleur;

    // Mémoriser l'ID en édition
    idEnEdition = id;

    // Scroller vers le formulaire
    formeCategorie.scrollIntoView({ behavior: 'smooth' });
}

// ===== 6. SUPPRIMER UNE CATÉGORIE =====

function supprimerCategorie(id) {
    // Demander confirmation
    if(confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
        // Créer une nouvelle liste sans cet élément
        categories = categories.filter(function(cat) {
            return cat.id !== id;
        });

        // Sauvegarder
        localStorage.setItem('categories', JSON.stringify(categories));

        // Afficher
        afficherCategories();
    }
}

// ===== 7. ÉVÉNEMENT DE RECHERCHE =====

champRecherche.addEventListener('input', afficherCategories);
