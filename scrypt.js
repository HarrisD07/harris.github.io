/* ============================================
   SCRIPT PRINCIPAL DU PORTFOLIO
   Gestion synchronisée des projets entre Admin et Site
   ============================================ */

// Variables globales
let allProjects = [];

/**
 * Charger les projets depuis localStorage ou projects.json
 * Priorité: localStorage (admin) > projects.json (fallback)
 */
async function loadProjects() {
    try {
        // Vérifier d'abord localStorage (données de l'admin)
        const savedProjects = localStorage.getItem('portfolioProjects');
        
        if (savedProjects && savedProjects !== '[]') {
            allProjects = JSON.parse(savedProjects);
            console.log(`✅ ${allProjects.length} projet(s) chargé(s) depuis localStorage`);
        } else {
            // Fallback: charger depuis projects.json
            const response = await fetch('projects.json');
            if (!response.ok) {
                throw new Error('Fichier projects.json introuvable');
            }
            allProjects = await response.json();
            console.log(`✅ ${allProjects.length} projet(s) chargé(s) depuis projects.json`);
            
            // Sauvegarder dans localStorage pour synchronisation future
            localStorage.setItem('portfolioProjects', JSON.stringify(allProjects));
        }
        
        return allProjects;
    } catch (error) {
        console.error('❌ Erreur lors du chargement des projets:', error);
        allProjects = [];
        return [];
    }
}

/**
 * Sauvegarder les projets dans localStorage
 */
function saveProjects(projects) {
    try {
        localStorage.setItem('portfolioProjects', JSON.stringify(projects));
        localStorage.setItem('lastUpdate', new Date().toISOString());
        console.log('✅ Projets sauvegardés dans localStorage');
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        return false;
    }
}

/**
 * Obtenir un projet par son ID
 */
function getProjectById(id) {
    return allProjects.find(project => project.id === id);
}

/**
 * Ajouter un nouveau projet
 */
function addProject(project) {
    const newProject = {
        ...project,
        id: project.id || Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    allProjects.unshift(newProject);
    saveProjects(allProjects);
    return newProject;
}

/**
 * Mettre à jour un projet existant
 */
function updateProject(id, updatedData) {
    const index = allProjects.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    allProjects[index] = {
        ...allProjects[index],
        ...updatedData,
        updatedAt: new Date().toISOString()
    };
    
    saveProjects(allProjects);
    return allProjects[index];
}

/**
 * Supprimer un projet
 */
function deleteProject(id) {
    const index = allProjects.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    allProjects.splice(index, 1);
    saveProjects(allProjects);
    return true;
}

/**
 * Filtrer les projets par catégorie
 */
function filterProjects(category) {
    if (category === 'all') {
        return allProjects;
    }
    
    return allProjects.filter(project => {
        const techString = project.technologies?.join(' ').toLowerCase() || '';
        const title = project.title?.toLowerCase() || '';
        const description = project.description?.toLowerCase() || '';
        
        switch(category) {
            case 'web':
                return techString.includes('laravel') || 
                       techString.includes('php') || 
                       techString.includes('next') ||
                       techString.includes('react') ||
                       title.includes('web') ||
                       description.includes('web');
                       
            case 'database':
                return techString.includes('mysql') || 
                       techString.includes('sql') || 
                       techString.includes('database') ||
                       techString.includes('access') ||
                       title.includes('base de données') ||
                       description.includes('base de données');
                       
            case 'frontend':
                return techString.includes('html') || 
                       techString.includes('css') || 
                       techString.includes('javascript') ||
                       techString.includes('react') ||
                       techString.includes('vue') ||
                       title.includes('frontend') ||
                       description.includes('interface');
                       
            default:
                return true;
        }
    });
}

/**
 * Rechercher dans les projets
 */
function searchProjects(query) {
    if (!query) return allProjects;
    
    const searchTerm = query.toLowerCase();
    return allProjects.filter(project => {
        return project.title?.toLowerCase().includes(searchTerm) ||
               project.description?.toLowerCase().includes(searchTerm) ||
               project.details?.toLowerCase().includes(searchTerm) ||
               project.technologies?.some(tech => tech.toLowerCase().includes(searchTerm));
    });
}

/**
 * Obtenir les statistiques des projets
 */
function getProjectsStats() {
    const stats = {
        total: allProjects.length,
        completed: 0,
        inProgress: 0,
        planned: 0,
        technologies: new Set(),
        totalImages: 0,
        lastUpdate: localStorage.getItem('lastUpdate') || null
    };
    
    allProjects.forEach(project => {
        // Statuts
        const status = project.status || 'completed';
        if (status === 'completed') stats.completed++;
        if (status === 'in-progress') stats.inProgress++;
        if (status === 'planned') stats.planned++;
        
        // Technologies
        project.technologies?.forEach(tech => stats.technologies.add(tech));
        
        // Images
        stats.totalImages += (project.images?.length || 0);
    });
    
    stats.technologies = Array.from(stats.technologies);
    return stats;
}

/**
 * Exporter les projets en JSON
 */
function exportProjectsJSON() {
    const dataStr = JSON.stringify(allProjects, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-projects-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
}

/**
 * Importer des projets depuis JSON
 */
function importProjectsJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const importedProjects = JSON.parse(event.target.result);
                
                if (!Array.isArray(importedProjects)) {
                    throw new Error('Le fichier doit contenir un tableau de projets');
                }
                
                // Validation basique
                importedProjects.forEach((project, index) => {
                    if (!project.title || !project.description) {
                        throw new Error(`Projet ${index + 1}: titre et description requis`);
                    }
                });
                
                allProjects = importedProjects;
                saveProjects(allProjects);
                resolve(importedProjects);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = function() {
            reject(new Error('Erreur lors de la lecture du fichier'));
        };
        
        reader.readAsText(file);
    });
}

/**
 * Réinitialiser tous les projets
 */
function resetAllProjects() {
    allProjects = [];
    localStorage.removeItem('portfolioProjects');
    localStorage.removeItem('lastUpdate');
    return true;
}

/**
 * Valider un projet avant sauvegarde
 */
function validateProject(project) {
    const errors = [];
    
    if (!project.title || project.title.trim() === '') {
        errors.push('Le titre est requis');
    }
    
    if (!project.description || project.description.trim() === '') {
        errors.push('La description est requise');
    }
    
    if (!project.date || project.date.trim() === '') {
        errors.push('La date est requise');
    }
    
    if (!project.technologies || !Array.isArray(project.technologies) || project.technologies.length === 0) {
        errors.push('Au moins une technologie est requise');
    }
    
    if (!project.images || !Array.isArray(project.images) || project.images.length === 0) {
        errors.push('Au moins une image est requise');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Créer un projet par défaut
 */
function createDefaultProject() {
    return {
        id: Date.now(),
        title: '',
        description: '',
        date: '',
        technologies: [],
        images: [],
        details: '',
        github: '',
        demo: '',
        status: 'completed',
        featured: false,
        files: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

/**
 * Synchroniser avec le fichier projects.json (pour GitHub Pages)
 * Cette fonction génère le contenu du fichier à copier manuellement
 */
function generateProjectsJSONContent() {
    return JSON.stringify(allProjects, null, 2);
}

/**
 * Vérifier si des mises à jour sont disponibles
 */
function checkForUpdates() {
    const lastCheck = localStorage.getItem('lastUpdateCheck');
    const now = new Date().getTime();
    
    // Vérifier toutes les 5 minutes
    if (!lastCheck || (now - parseInt(lastCheck)) > 300000) {
        localStorage.setItem('lastUpdateCheck', now.toString());
        return true;
    }
    
    return false;
}

/**
 * Formater une date pour l'affichage
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
}

/**
 * Obtenir la taille approximative du stockage utilisé
 */
function getStorageSize() {
    const projects = localStorage.getItem('portfolioProjects') || '';
    const sizeInBytes = new Blob([projects]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    
    return {
        bytes: sizeInBytes,
        kb: sizeInKB,
        mb: sizeInMB,
        formatted: sizeInBytes > 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`
    };
}

/**
 * Logger pour debug
 */
const logger = {
    info: (message, data) => {
        console.log(`ℹ️ [Portfolio] ${message}`, data || '');
    },
    success: (message, data) => {
        console.log(`✅ [Portfolio] ${message}`, data || '');
    },
    error: (message, error) => {
        console.error(`❌ [Portfolio] ${message}`, error || '');
    },
    warn: (message, data) => {
        console.warn(`⚠️ [Portfolio] ${message}`, data || '');
    }
};

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadProjects,
        saveProjects,
        getProjectById,
        addProject,
        updateProject,
        deleteProject,
        filterProjects,
        searchProjects,
        getProjectsStats,
        exportProjectsJSON,
        importProjectsJSON,
        resetAllProjects,
        validateProject,
        createDefaultProject,
        generateProjectsJSONContent,
        getStorageSize,
        logger
    };
}

// Initialisation automatique si on est sur la page des projets
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePortfolio);
} else {
    initializePortfolio();
}

function initializePortfolio() {
    // Charger les projets au démarrage
    loadProjects().then(projects => {
        logger.success(`Portfolio initialisé avec ${projects.length} projet(s)`);
        
        // Afficher les stats dans la console
        const stats = getProjectsStats();
        logger.info('Statistiques:', {
            total: stats.total,
            technologies: stats.technologies.length,
            stockage: getStorageSize().formatted
        });
    });
}

// Exposer les fonctions principales globalement pour l'admin
window.portfolioAPI = {
    loadProjects,
    saveProjects,
    getProjectById,
    addProject,
    updateProject,
    deleteProject,
    filterProjects,
    searchProjects,
    getProjectsStats,
    exportProjectsJSON,
    importProjectsJSON,
    resetAllProjects,
    validateProject,
    createDefaultProject,
    generateProjectsJSONContent,
    getStorageSize,
    logger
};
