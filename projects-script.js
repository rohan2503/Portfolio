document.addEventListener('DOMContentLoaded', function() {
    const techButtons = document.querySelectorAll('.tech-btn');
    const projects = document.querySelectorAll('.project');
    let activeFilters = new Set();

    techButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tech = this.getAttribute('data-tech');
            
            if (tech === 'all') {
                activeFilters.clear();
                techButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            } else {
                document.querySelector('[data-tech="all"]').classList.remove('active');
                this.classList.toggle('active');
                
                if (activeFilters.has(tech)) {
                    activeFilters.delete(tech);
                } else {
                    activeFilters.add(tech);
                }
            }

            filterProjects();
        });
    });

    function filterProjects() {
        projects.forEach(project => {
            const projectTechs = project.getAttribute('data-techs').split(' ');
            if (activeFilters.size === 0 || projectTechs.some(tech => activeFilters.has(tech))) {
                project.style.display = '';
            } else {
                project.style.display = 'none';
            }
        });
    }
});