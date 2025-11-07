/* ============================================
   SCRIPT PRINCIPAL DU PORTFOLIO
   ============================================ */

// Vérifier si on est sur la page des projets
if (window.location.pathname.includes('projects.html')) {
    loadProjectsFromJSON();
}

// Fonction pour charger les projets depuis le fichier JSON
function loadProjectsFromJSON() {
    // D'abord, essayer de charger depuis localStorage
    const savedProjects = localStorage.getItem('portfolioProjects');
    
    if (savedProjects) {
        try {
            const projects = JSON.parse(savedProjects);
            displayProjects(projects);
            return;
        } catch (error) {
            console.error('Erreur lors du parsing du localStorage:', error);
        }
    }

    // Si pas de localStorage, charger depuis le fichier JSON
    fetch('projects.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Fichier projects.json introuvable');
            }
            return response.json();
        })
        .then(projects => {
            displayProjects(projects);
        })
        .catch(error => {
            console.error('Erreur lors du chargement des projets:', error);
            displayErrorMessage();
        });
}

// Fonction pour afficher les projets
function displayProjects(projects) {
    const grid = document.getElementById('projects-grid');
    
    if (!grid) return;

    grid.innerHTML = '';

    if (projects.length === 0) {
        grid.innerHTML = '<p class="error-message">Aucun projet disponible pour le moment.</p>';
        return;
    }

    projects.forEach(project => {
        const card = createProjectCard(project);
        grid.appendChild(card);
    });
}

// Fonction pour créer une carte de projet
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.onclick = () => openProjectModal(project);

    // Image
    const img = document.createElement('img');
    img.src = project.images[0] || 'https://via.placeholder.com/400x250/1e3a8a/ffffff?text=Projet';
    img.alt = project.title;
    img.onerror = function() {
        this.src = 'https://via.placeholder.com/400x250/1e3a8a/ffffff?text=Image+Indisponible';
    };

    // Contenu
    const content = document.createElement('div');
    content.className = 'project-content';

    const title = document.createElement('h3');
    title.textContent = project.title;

    const description = document.createElement('p');
    description.textContent = project.description;

    const date = document.createElement('p');
    date.className = 'project-date';
    date.textContent = project.date;

    const techContainer = document.createElement('div');
    techContainer.className = 'project-technologies';

    if (project.technologies && project.technologies.length > 0) {
        project.technologies.forEach(tech => {
            const badge = document.createElement('span');
            badge.className = 'tech-badge';
            badge.textContent = tech;
            techContainer.appendChild(badge);
        });
    }

    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(date);
    content.appendChild(techContainer);

    card.appendChild(img);
    card.appendChild(content);

    return card;
}

// Fonction pour ouvrir la modal avec les détails du projet
function openProjectModal(project) {
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    document.getElementById('modal-title').textContent = project.title;
    
    const modalImage = document.getElementById('modal-image');
    modalImage.src = project.images[0] || 'https://via.placeholder.com/400x250/1e3a8a/ffffff?text=Projet';
    modalImage.alt = project.title;
    modalImage.onerror = function() {
        this.src = 'https://via.placeholder.com/400x250/1e3a8a/ffffff?text=Image+Indisponible';
    };

    document.getElementById('modal-date').textContent = project.date;
    document.getElementById('modal-details').textContent = project.details || project.description;

    const techContainer = document.getElementById('modal-technologies');
    techContainer.innerHTML = '';
    
    if (project.technologies && project.technologies.length > 0) {
        project.technologies.forEach(tech => {
            const badge = document.createElement('span');
            badge.className = 'tech-badge';
            badge.textContent = tech;
            techContainer.appendChild(badge);
        });
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Fonction pour fermer la modal
function closeModal() {
    const modal = document.getElementById('project-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Fonction pour afficher un message d'erreur
function displayErrorMessage() {
    const grid = document.getElementById('projects-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="error-message">
                <p>Impossible de charger les projets.</p>
                <p>Assurez-vous que le fichier <code>projects.json</code> est présent.</p>
            </div>
        `;
    }
}

// Fermer la modal en cliquant en dehors
window.addEventListener('click', function(event) {
    const modal = document.getElementById('project-modal');
    if (event.target === modal) {
        closeModal();
    }
});

// Fermer la modal avec la touche Échap
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Animation au scroll (optionnel)
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observer les éléments qui doivent s'animer
    const animatedElements = document.querySelectorAll('.project-card, .skill-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
});

// Fonction utilitaire pour sauvegarder dans localStorage
function saveToLocalStorage(projects) {
    try {
        localStorage.setItem('portfolioProjects', JSON.stringify(projects));
        return true;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        return false;
    }
}

// Fonction utilitaire pour récupérer depuis localStorage
function getFromLocalStorage() {
    try {
        const data = localStorage.getItem('portfolioProjects');
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Erreur lors de la récupération:', error);
        return null;
    }
}