const accessKey = "4EA_f_Vhu5-dY3KiS5c-ssHzKcBJI7z7B1UKOdrBedI";

const searchForm = document.getElementById("search-form");
const searchBox = document.getElementById("search-box");
const searchResult = document.getElementById("search-result");
const showBtn = document.getElementById("show-more-btn");

const imagePopup = document.getElementById("image-popup");
const popupImg = document.getElementById("popup-img");
const popupDownload = document.getElementById("popup-download");

let keyword = "";
let page = 1;
let typingTimer;

async function searchImage() {
    if (!keyword) return;

    const url = `https://api.unsplash.com/search/photos?page=${page}&query=${keyword}&client_id=${accessKey}&per_page=12`;
    const response = await fetch(url);
    const data = await response.json();

    if (page === 1) searchResult.innerHTML = "";

    const results = data.results;
    results.map((result) => {
        const image = document.createElement("img");
        image.src = result.urls.small;
        image.style.cursor = "pointer";
        image.addEventListener("click", () => openImagePopup(result.urls.full));

        searchResult.appendChild(image);
    });

    showBtn.style.display = "block";
}

function openImagePopup(fullImageUrl) {
    imagePopup.style.display = "flex"; // show popup
    popupImg.src = fullImageUrl;
    popupDownload.href = fullImageUrl; // set download link
}

// Close popup when clicking outside the image
imagePopup.addEventListener("click", (e) => {
    if (e.target === imagePopup) {
        imagePopup.style.display = "none";
    }
});

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    keyword = searchBox.value.trim();
    page = 1;
    searchImage();
});

searchBox.addEventListener("input", () => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        keyword = searchBox.value.trim();
        page = 1;
        searchImage();
    }, 500);
});

showBtn.addEventListener("click", () => {
    page++;
    searchImage();
});
