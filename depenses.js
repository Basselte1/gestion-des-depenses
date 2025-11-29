/* ====================================
   GESTION DES DÉPENSES - depenses.js
   Code simplifié pour débuter
   ==================================== */

// ===== 1. RÉCUPÉRER LES DONNÉES DU LOCALSTORAGE =====

// Récupérer les dépenses (ou liste vide si aucune)
let depenses = JSON.parse(localStorage.getItem('depenses')) || [];

// Récupérer les catégories (ou liste vide si aucune)
let categories = JSON.parse(localStorage.getItem('categories')) || [];

// Variable pour savoir quelle dépense on édite (null = ajouter, sinon = modifier)
let idEnEdition = null;

// ===== 2. RÉCUPÉRER LES ÉLÉMENTS HTML =====

const formeDepense = document.getElementById('formeDepense');
const champDescription = document.getElementById('description');
const champMontant = document.getElementById('montant');
const champCategorie = document.getElementById('categorie');
const champDate = document.getElementById('date');
const listeDependances = document.getElementById('listeDependances');
const champRecherche = document.getElementById('champRecherche');
const filtreCategorie = document.getElementById('filtreCategorie');

// Initialiser la date d'aujourd'hui dans le champ date
const aujourd = new Date();
const annee = aujourd.getFullYear();
const mois = String(aujourd.getMonth() + 1).padStart(2, '0');
const jour = String(aujourd.getDate()).padStart(2, '0');
champDate.value = annee + '-' + mois + '-' + jour;

// ===== 3. CHARGER LES CATÉGORIES DANS LE SELECT =====

function chargerCategories() {
    // Vider les select
    champCategorie.innerHTML = '<option value="">-- Sélectionner --</option>';
    filtreCategorie.innerHTML = '<option value="">-- Toutes les catégories --</option>';

    // Ajouter chaque catégorie
    for(let i = 0; i < categories.length; i++) {
        const cat = categories[i];

        // Option pour le champ de catégorie
        const option1 = document.createElement('option');
        option1.value = cat.id;
        option1.textContent = cat.nom;
        champCategorie.appendChild(option1);

        // Option pour le filtre
        const option2 = document.createElement('option');
        option2.value = cat.id;
        option2.textContent = cat.nom;
        filtreCategorie.appendChild(option2);
    }
}

// Appeler la fonction
chargerCategories();

// ===== 4. AFFICHER LES DÉPENSES =====

function afficherDependances() {
    // Si aucune dépense, afficher un message
    if(depenses.length === 0) {
        listeDependances.innerHTML = '<p class="empty-message">Aucune dépense enregistrée</p>';
        return;
    }

    // Créer une copie de la liste pour ne pas la modifier
    let depensesAffichees = depenses.slice();

    // Appliquer le filtre de catégorie
    const categorieSelectionnee = filtreCategorie.value;
    if(categorieSelectionnee) {
        depensesAffichees = depensesAffichees.filter(function(dep) {
            return dep.categorie === categorieSelectionnee;
        });
    }

    // Appliquer la recherche
    const textRecherche = champRecherche.value.toLowerCase();
    if(textRecherche) {
        depensesAffichees = depensesAffichees.filter(function(dep) {
            return dep.description.toLowerCase().includes(textRecherche);
        });
    }

    // Si aucun résultat
    if(depensesAffichees.length === 0) {
        listeDependances.innerHTML = '<p class="empty-message">Aucune dépense trouvée</p>';
        return;
    }

    // Trier par date (récente en premier)
    depensesAffichees.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    // Créer le HTML pour chaque dépense
    let html = '';
    for(let i = 0; i < depensesAffichees.length; i++) {
        const dep = depensesAffichees[i];

        // Trouver la catégorie pour récupérer la couleur
        let couleur = '#667eea';
        for(let j = 0; j < categories.length; j++) {
            if(categories[j].id === dep.categorie) {
                couleur = categories[j].couleur;
                break;
            }
        }

        // Créer la carte
        html = html + '<div class="carte-element">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">' +
                '<h3>' + dep.description + '</h3>' +
                '<span style="background-color: ' + couleur + '; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">' + dep.categorie + '</span>' +
            '</div>' +
            '<p>' + new Date(dep.date).toLocaleDateString('fr-FR') + '</p>' +
            '<div style="display: flex; justify-content: space-between; align-items: center;">' +
                '<strong style="color: #667eea; font-size: 18px;">' + dep.montant + ' FCFA</strong>' +
                '<div class="carte-actions">' +
                    '<button class="bouton-petit bouton-modifier" onclick="editerDependance(\'' + dep.id + '\')">Modifier</button>' +
                    '<button class="bouton-petit bouton-supprimer" onclick="supprimerDependance(\'' + dep.id + '\')">Supprimer</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    listeDependances.innerHTML = html;
}

// Afficher les dépenses au chargement
afficherDependances();

// ===== 5. AJOUTER/MODIFIER UNE DÉPENSE =====

formeDepense.addEventListener('submit', function(evenement) {
    evenement.preventDefault();

    // Récupérer les valeurs
    const description = champDescription.value;
    const montant = champMontant.value;
    const categorie = champCategorie.value;
    const date = champDate.value;

    // Vérifier que tous les champs sont remplis
    if(!description || !montant || !categorie || !date) {
        alert('Tous les champs sont obligatoires');
        return;
    }

    // Créer l'objet dépense
    const dependance = {
        id: idEnEdition || Date.now().toString(), // Utiliser l'ancien ID si on édite, sinon créer un nouveau
        description: description,
        montant: montant,
        categorie: categorie,
        date: date
    };

    if(idEnEdition) {
        // MODE MODIFICATION: Trouver et remplacer
        for(let i = 0; i < depenses.length; i++) {
            if(depenses[i].id === idEnEdition) {
                depenses[i] = dependance;
                break;
            }
        }
        idEnEdition = null;
    } else {
        // MODE AJOUT: Ajouter à la liste
        depenses.push(dependance);
    }

    // Sauvegarder dans le localStorage
    localStorage.setItem('depenses', JSON.stringify(depenses));

    // Réinitialiser le formulaire
    formeDepense.reset();
    champDate.value = annee + '-' + mois + '-' + jour;

    // Afficher les dépenses
    afficherDependances();
});

// ===== 6. ÉDITER UNE DÉPENSE =====

function editerDependance(id) {
    // Trouver la dépense
    let dependance;
    for(let i = 0; i < depenses.length; i++) {
        if(depenses[i].id === id) {
            dependance = depenses[i];
            break;
        }
    }

    if(!dependance) return;

    // Remplir le formulaire
    champDescription.value = dependance.description;
    champMontant.value = dependance.montant;
    champCategorie.value = dependance.categorie;
    champDate.value = dependance.date;

    // Mémoriser l'ID en édition
    idEnEdition = id;

    // Scroller vers le formulaire
    formeDepense.scrollIntoView({ behavior: 'smooth' });
}

// ===== 7. SUPPRIMER UNE DÉPENSE =====

function supprimerDependance(id) {
    // Demander confirmation
    if(confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
        // Créer une nouvelle liste sans cet élément
        depenses = depenses.filter(function(dep) {
            return dep.id !== id;
        });

        // Sauvegarder
        localStorage.setItem('depenses', JSON.stringify(depenses));

        // Afficher
        afficherDependances();
    }
}

// ===== 8. ÉVÉNEMENTS DE RECHERCHE ET FILTRE =====

champRecherche.addEventListener('input', afficherDependances);
filtreCategorie.addEventListener('change', afficherDependances);
