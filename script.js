document.addEventListener('DOMContentLoaded', () => {
    // AOSの初期化
    AOS.init({
        duration: 800,
        once: true,
    });

    // projects.jsonを読み込んでプロジェクトカードを生成
    fetch('projects.json')
        .then(response => response.json())
        .then(projects => {
            const projectList = document.getElementById('project-list');
            if (projectList) {
                projects.forEach((project, index) => {
                    const col = document.createElement('div');
                    col.className = 'col-md-4 mb-4';
                    // AOSのアニメーションを遅延させて順番に表示
                    col.setAttribute('data-aos', 'fade-up');
                    col.setAttribute('data-aos-delay', index * 100);

                    col.innerHTML = `
                        <div class="card h-100">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${project.title}</h5>
                                <p class="card-text">${project.description}</p>
                                <a href="${project.path}" class="btn btn-primary mt-auto">詳しく見る</a>
                            </div>
                        </div>
                    `;
                    projectList.appendChild(col);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching projects:', error);
            const projectList = document.getElementById('project-list');
            if (projectList) {
                projectList.innerHTML = '<p class="text-center">プロジェクトの読み込みに失敗しました。</p>';
            }
        });
});
