document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const fileList = document.getElementById('fileList');
    const logoutButton = document.getElementById('logout');

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(uploadForm);
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            alert('File uploaded and converted!');
            loadFiles();
        } else {
            alert('Failed to upload file.');
        }
    });

    logoutButton.addEventListener('click', () => {
        fetch('/logout').then(() => {
            window.location.href = '/login';
        });
    });

    async function loadFiles() {
        const response = await fetch('/files');
        if (response.ok) {
            const files = await response.json();
            fileList.innerHTML = '';
            files.forEach(file => {
                const li = document.createElement('li');
                li.classList.add('file-item');

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('main-checkbox');
                checkbox.addEventListener('change', () => {
                    const pageCheckboxes = li.querySelectorAll('.page-checkbox');
                    pageCheckboxes.forEach(pageCheckbox => {
                        pageCheckbox.checked = checkbox.checked;
                    });
                });

                const link = document.createElement('a');
                link.href = `/upload/${file.user}/${file.pdf}`;
                link.textContent = file.pdf;

                const viewButton = document.createElement('button');
                viewButton.textContent = 'View';
                viewButton.onclick = () => {
                    window.location.href = `/view?user=${file.user}&file=${file.pdf}`;
                };

                const expandButton = document.createElement('button');
                expandButton.textContent = 'Expand';
                expandButton.onclick = async () => {
                    const expanded = expandButton.getAttribute('data-expanded') === 'true';
                    expandButton.textContent = expanded ? 'Expand' : 'Collapse';
                    expandButton.setAttribute('data-expanded', !expanded);
                    const pageList = li.querySelector('.page-list');
                    if (!expanded) {
                        if (!pageList.innerHTML) {
                            const pages = await fetch(`/images?user=${file.user}&file=${file.pdf}`);
                            const pageImages = await pages.json();
                            pageImages.forEach((image, index) => {
                                const pageLi = document.createElement('li');
                                const pageCheckbox = document.createElement('input');
                                pageCheckbox.type = 'checkbox';
                                pageCheckbox.classList.add('page-checkbox');
                                const pageLink = document.createElement('a');
                                pageLink.href = image;
                                pageLink.textContent = `Page ${index + 1}`;
                                const pageViewButton = document.createElement('button');
                                pageViewButton.textContent = 'View';
                                pageViewButton.onclick = () => {
                                    window.open(image, '_blank');
                                };
                                pageLi.appendChild(pageCheckbox);
                                pageLi.appendChild(pageLink);
                                pageLi.appendChild(pageViewButton);
                                pageList.appendChild(pageLi);
                            });
                        }
                        pageList.style.display = 'block';
                    } else {
                        pageList.style.display = 'none';
                    }
                };

                const pageList = document.createElement('ul');
                pageList.classList.add('page-list');
                pageList.style.display = 'none';

                li.appendChild(link);
                li.appendChild(checkbox);
                li.appendChild(viewButton);
                li.appendChild(expandButton);
                li.appendChild(pageList);
                fileList.appendChild(li);
            });
        }
    }

    loadFiles();
});
