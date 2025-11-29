/* ====================================
   GESTION DES DÉPENSES - SCRIPT PRINCIPAL
   ==================================== */

/* ===== 1. GESTION DE L'INSCRIPTION ===== */

// Récupérer le formulaire d'inscription
const formeInscription = document.getElementById('formeInscription');

// Si le formulaire existe, ajouter un écouteur d'événements
if(formeInscription) {
    formeInscription.addEventListener('submit', function(evenement) {
        // Empêcher la page de se recharger
        evenement.preventDefault();

        // Récupérer les valeurs saisies par l'utilisateur
        const nom = document.getElementById('nom').value;
        const email = document.getElementById('email').value;
        const motDePasse = document.getElementById('motDePasse').value;
        const confirmationMotDePasse = document.getElementById('confirmationMotDePasse').value;

        // Élément pour afficher les messages
        const messageErreur = document.getElementById('messageErreur');
        const messageSucces = document.getElementById('messageSucces');

        // 1. Vérifier que tous les champs sont remplis
        if(!nom || !email || !motDePasse || !confirmationMotDePasse) {
            afficherErreur(messageErreur, 'Tous les champs sont obligatoires');
            return; // Arrêter l'exécution ici
        }

        // 2. Vérifier que le nom a au moins 3 caractères
        if(nom.length < 3) {
            afficherErreur(messageErreur, 'Le nom doit avoir au moins 3 caractères');
            return;
        }

        // 3. Vérifier que le mot de passe a au moins 6 caractères
        if(motDePasse.length < 4) {
            afficherErreur(messageErreur, 'Le mot de passe doit avoir au moins 4 caractères');
            return;
        }

        // 4. Vérifier que les deux mots de passe correspondent
        if(motDePasse !== confirmationMotDePasse) {
            afficherErreur(messageErreur, 'Les mots de passe ne correspondent pas');
            return;
        }

        /* const utilisateurExistant = JSON.parse(localStorage.getItem('utilisateur'));
            if(utilisateur) {
            afficherErreur(mesageErreur, 'Un compte avec cet utilisateur existe deja');
                return ;} 
        */
        // 5. Créer l'objet utilisateur
        const nouvelUtilisateur = {
            nom: nom,
            email: email,
            motDePasse: motDePasse,
            dateCreation: new Date().toLocaleDateString('fr-FR')
        };

        // 7. Sauvegarder l'utilisateur dans le localStorage
        localStorage.setItem('utilisateur', JSON.stringify(nouvelUtilisateur));

        // 8. Afficher un message de succès
        afficherSucces(messageSucces, 'Inscription réussie ! Redirection...');

        // 9. Vider le formulaire
        formeInscription.reset();

        // 10. Rediriger vers la page de connexion après 2 secondes
        setTimeout(function() {
            window.location.href = 'index.html';
        }, 2000);
    });
}

/* ===== 2. GESTION DE LA CONNEXION ===== */

// Récupérer le formulaire de connexion
const formeConnexion = document.getElementById('formeConnexion');

// Si le formulaire existe, ajouter un écouteur d'événements
if(formeConnexion) {
    formeConnexion.addEventListener('submit', function(evenement) {
        // Empêcher la page de se recharger
        evenement.preventDefault();

        // Récupérer les valeurs saisies
        const email = document.getElementById('email').value;
        const motDePasse = document.getElementById('motDePasse').value;

        // Élément pour afficher les messages
        const messageErreur = document.getElementById('messageErreur');

        // Récupérer l'utilisateur enregistré du localStorage
        const utilisateur = JSON.parse(localStorage.getItem('utilisateur'));

        // 1. Vérifier qu'un utilisateur existe
        if(!utilisateur) {
            afficherErreur(messageErreur, 'Aucun compte trouvé. Veuillez d\'abord vous inscrire');
            return;
        }

        // 2. Vérifier que l'email et le mot de passe correspondent
        if(utilisateur.email === email && utilisateur.motDePasse === motDePasse) {
            // Connexion réussie !
            // Sauvegarder l'utilisateur connecté
            localStorage.setItem('utilisateurConnecte', JSON.stringify(utilisateur));

            // Masquer le message d'erreur
            messageErreur.classList.remove('afficher');

            // Rediriger vers le tableau de bord
            window.location.href = 'home.html';
        } else {
            // Email ou mot de passe incorrect
            afficherErreur(messageErreur, 'Email ou mot de passe incorrect');
        }
    });
}

/* ===== 3. TABLEAU DE BORD (home.html) ===== */

// Exécuter ce code uniquement si on est sur la page home.html
if(window.location.pathname.includes('home.html')) {
    // Récupérer l'utilisateur connecté
    const utilisateurConnecte = JSON.parse(localStorage.getItem('utilisateurConnecte'));

    // Récupérer les dépenses enregistrées (liste vide si aucune)
    const depenses = JSON.parse(localStorage.getItem('depenses')) || [];

    // 1. Afficher le message de bienvenue
    const messagesAccueil = document.getElementById('userGreeting');
    if(messagesAccueil && utilisateurConnecte) {
        messagesAccueil.textContent = 'Bienvenue, ' + utilisateurConnecte.nom + ' !';
    }

    // 2. Calculer les statistiques
    function calculerStatistiques() {
        const aujourd = new Date();
        const moisActuel = aujourd.getMonth();
        const anneeActuelle = aujourd.getFullYear();

        // Calculer le total mensuel
        let totalMensuel = 0;
        for(let i = 0; i < depenses.length; i++) {
            const dateDep = new Date(depenses[i].date);
            if(dateDep.getMonth() === moisActuel && dateDep.getFullYear() === anneeActuelle) {
                totalMensuel = totalMensuel + parseFloat(depenses[i].montant);
            }
        }

        // Calculer le total annuel
        let totalAnnuel = 0;
        for(let i = 0; i < depenses.length; i++) {
            const dateDep = new Date(depenses[i].date);
            if(dateDep.getFullYear() === anneeActuelle) {
                totalAnnuel = totalAnnuel + parseFloat(depenses[i].montant);
            }
        }

        // Calculer la moyenne
        let montantMoyen = 0;
        if(depenses.length > 0) {
            let totalDep = 0;
            for(let i = 0; i < depenses.length; i++) {
                totalDep = totalDep + parseFloat(depenses[i].montant);
            }
            montantMoyen = totalDep / depenses.length;
        }

        // Retourner les statistiques
        return {
            totalMensuel: totalMensuel,
            totalAnnuel: totalAnnuel,
            montantMoyen: montantMoyen,
            totalNombre: depenses.length
        };
    }

    // Récupérer les statistiques
    const stats = calculerStatistiques();

    // 3. Afficher les statistiques dans les cartes
    const totalMensuelElement = document.getElementById('totalMonthly');
    if(totalMensuelElement) {
        totalMensuelElement.textContent = stats.totalMensuel.toFixed(0) + ' FCFA';
    }

    const totalAnnuelElement = document.getElementById('totalYearly');
    if(totalAnnuelElement) {
        totalAnnuelElement.textContent = stats.totalAnnuel.toFixed(0) + ' FCFA';
    }

    const montantMoyenElement = document.getElementById('averageAmount');
    if(montantMoyenElement) {
        montantMoyenElement.textContent = stats.montantMoyen.toFixed(0) + ' FCFA';
    }

    const totalNombreElement = document.getElementById('totalExpenses');
    if(totalNombreElement) {
        totalNombreElement.textContent = stats.totalNombre;
    }

    // 4. Afficher les 5 dépenses les plus récentes
    function afficherDependsesRecentes() {
        const listElement = document.getElementById('recentExpensesList');

        if(!listElement) return; // Si l'élément n'existe pas, arrêter

        // Si aucune dépense, afficher un message
        if(depenses.length === 0) {
            listElement.innerHTML = '<p class="empty-message">Aucune dépense enregistrée</p>';
            return;
        }

        // Trier les dépenses par date (récente en premier)
        const depensesTriees = depenses.slice().reverse();

        // Prendre les 5 premières
        const cinqDerniers = depensesTriees.slice(0, 5);

        // Créer le HTML pour chaque dépense
        let html = '';
        for(let i = 0; i < cinqDerniers.length; i++) {
            const dep = cinqDerniers[i];
            html = html + '<div class="expense-item">' +
                '<div class="expense-description">' + dep.description + '</div>' +
                '<div class="expense-category">' + dep.categorie + '</div>' +
                '<div class="expense-amount">' + parseFloat(dep.montant).toFixed(0) + ' FCFA</div>' +
                '</div>';
        }

        // Afficher le HTML
        listElement.innerHTML = html;
    }

    // Appeler la fonction
    afficherDependsesRecentes();
}

/* ===== 4. FONCTIONS UTILITAIRES ===== */

// Fonction pour afficher un message d'erreur
function afficherErreur(element, message) {
    if(element) {
        element.textContent = message;
        element.classList.add('afficher');
    }
}

// Fonction pour afficher un message de succès
function afficherSucces(element, message) {
    if(element) {
        element.textContent = message;
        element.classList.add('afficher');
    }
}

