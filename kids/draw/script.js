document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const gallery = document.getElementById('gallery');
    const categoryNav = document.getElementById('category-nav');
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modal-image');
    const closeModalBtn = document.querySelector('.close-button');
    const prevBtn = document.querySelector('.prev-button');
    const nextBtn = document.querySelector('.next-button');
    const randomBtn = document.getElementById('random-button');

    // State
    let currentCategory = Object.keys(imageDatabase)[0];
    let currentImageIndex = 0;

    // --- Core Functions ---

    function renderButtons() {
        categoryNav.innerHTML = '';
        if (!imageDatabase || Object.keys(imageDatabase).length === 0) return;
        
        currentCategory = Object.keys(imageDatabase)[0];

        for (const category in imageDatabase) {
            const button = document.createElement('button');
            button.className = 'category-button';
            button.textContent = category;
            button.dataset.category = category;
            if (category === currentCategory) {
                button.classList.add('active');
            }
            categoryNav.appendChild(button);
        }
    }

    function renderGallery() {
        gallery.innerHTML = '';
        if (!imageDatabase[currentCategory]) return;

        imageDatabase[currentCategory].forEach((src, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.dataset.index = index; // Store index for later
            const img = document.createElement('img');
            img.src = src;
            img.onerror = () => {
                const imageName = encodeURIComponent(src.split('/').pop().split('.')[0]);
                img.src = `https://via.placeholder.com/150/4a90e2/FFFFFF?text=${imageName}`;
                img.alt = imageName;
            };
            item.appendChild(img);
            gallery.appendChild(item);
        });
    }

    function showImageAtIndex(index) {
        const imageList = imageDatabase[currentCategory];
        if (!imageList || index < 0 || index >= imageList.length) return;

        currentImageIndex = index;
        modalImage.src = imageList[index];

        // Toggle visibility of prev/next buttons
        prevBtn.style.display = (index > 0) ? 'block' : 'none';
        nextBtn.style.display = (index < imageList.length - 1) ? 'block' : 'none';
    }

    function openModal(index) {
        modal.classList.add('show');
        showImageAtIndex(index);
    }

    function closeModal() {
        modal.classList.remove('show');
    }

    // --- Event Listeners ---

    categoryNav.addEventListener('click', (e) => {
        if (e.target.matches('.category-button')) {
            currentCategory = e.target.dataset.category;
            document.querySelector('.category-button.active').classList.remove('active');
            e.target.classList.add('active');
            renderGallery();
        }
    });

    gallery.addEventListener('click', (e) => {
        const item = e.target.closest('.gallery-item');
        if (item) {
            const index = parseInt(item.dataset.index, 10);
            openModal(index);
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentImageIndex > 0) {
            showImageAtIndex(currentImageIndex - 1);
        }
    });

    nextBtn.addEventListener('click', () => {
        const imageList = imageDatabase[currentCategory];
        if (currentImageIndex < imageList.length - 1) {
            showImageAtIndex(currentImageIndex + 1);
        }
    });

    randomBtn.addEventListener('click', () => {
        const imageList = imageDatabase[currentCategory];
        let newIndex;
        // Ensure new random index is different from the current one, if possible
        if (imageList.length > 1) {
            do {
                newIndex = Math.floor(Math.random() * imageList.length);
            } while (newIndex === currentImageIndex);
        } else {
            newIndex = 0;
        }
        showImageAtIndex(newIndex);
    });

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // --- Initial Load ---
    renderButtons();
    if(currentCategory) {
        renderGallery();
    }
});
