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
let selectedTags = []; 
let lastSelectedTag = null; 

async function searchImage() {
    if (!keyword) return;

    const url = `https://api.unsplash.com/search/photos?page=${page}&query=${keyword}&client_id=${accessKey}&per_page=9`;
    const response = await fetch(url);
    const data = await response.json();

    if (page === 1) {
        searchResult.querySelectorAll("img:not(:first-child)").forEach(el => el.remove());
    }

    const results = data.results;

    if (results.length === 0) {
        showBtn.style.display = "none"; 
        return;
    }
    showBtn.style.display = "block"; 

    results.forEach((result) => {
        let template = document.querySelector("#search-result img");
        if (!template) return;

        let clone = template.cloneNode(true);
        clone.src = result.urls.small;
        clone.style.cursor = "pointer";
        clone.style.display = "block";

        clone.addEventListener("click", () => openImagePopup(result.urls.full, keyword));

        searchResult.appendChild(clone);
    });
}

//  helper function for download
function setDownload(fullImageUrl) {
    popupDownload.onclick = async (e) => {
        e.preventDefault();
        const response = await fetch(fullImageUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "image.jpg";
        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);
    };
}

function openImagePopup(fullImageUrl, keyword) {
    imagePopup.style.display = "flex"; 
    popupImg.src = fullImageUrl;

    setDownload(fullImageUrl);

    fetchRelatedImages(keyword);
}

async function fetchRelatedImages(keyword) {
    const relatedContainer = document.getElementById("related-images");

    relatedContainer.querySelectorAll("img:not(:first-child)").forEach(el => el.remove());

    const url = `https://api.unsplash.com/search/photos?page=1&query=${keyword}&client_id=${accessKey}&per_page=6`;
    const response = await fetch(url);
    const data = await response.json(); 

    const templateRelated = document.querySelector("#related-images img");
    data.results.forEach((result) => {
        if (!templateRelated) return;

        let clone = templateRelated.cloneNode(true);
        clone.src = result.urls.thumb;
        clone.style.cursor = "pointer";
        clone.style.display = "block";

        clone.addEventListener("click", () => {
            popupImg.src = result.urls.full;
            setDownload(result.urls.full);
            fetchRelatedImages(keyword);
        });

        relatedContainer.appendChild(clone);
    });
}

// Close popup
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
    if (lastSelectedTag) {
        page++;
        fetchTagImages(lastSelectedTag, page);
    } else {
        page++;
        searchImage();
    }
});

document.querySelectorAll(".tag-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
        const tag = btn.getAttribute("data-tag");

        if (selectedTags.includes(tag)) {
            selectedTags = selectedTags.filter(t => t !== tag);
            btn.classList.remove("active");

            searchResult.querySelectorAll(`[data-tag="${tag}"]`).forEach(el => el.remove());

            searchBox.value = selectedTags.join(" + ");
            return;
        }
        selectedTags.push(tag);
        lastSelectedTag = tag; //update last selected
        btn.classList.add("active");

        searchBox.value = selectedTags.join(" + ");
        await fetchTagImages(tag, 0);

        const lastImage = searchResult.querySelector("img:last-of-type");
        if (lastImage) {
            lastImage.scrollIntoView({
                behavior: "smooth",
                block: "end"
            });
        }
    });
});

async function fetchTagImages(tag, pageNum = 1) {
    const url = `https://api.unsplash.com/search/photos?page=${pageNum}&query=${tag}&client_id=${accessKey}&per_page=9`;
    const response = await fetch(url);
    const data = await response.json();

    const results = data.results;

    results.forEach((result) => {
        let template = document.querySelector("#search-result img");
        if (!template) return;

        let clone = template.cloneNode(true);
        clone.src = result.urls.small;
        clone.style.cursor = "pointer";
        clone.style.display = "block";
        clone.setAttribute("data-tag", tag); 
        clone.addEventListener("click", () => openImagePopup(result.urls.full, tag));
        searchResult.appendChild(clone);
    });

    showBtn.style.display = "block";
}

// Theme switcher
const themeIcon = document.getElementById("theme-icon");
const themeOptions = document.getElementById("theme-options");

themeIcon.addEventListener("click", () => {
  themeOptions.classList.toggle("active");
});

document.querySelectorAll(".theme-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.body.className = ""; 
    const theme = btn.getAttribute("data-theme");
    document.body.classList.add(`${theme}-theme`);
    themeOptions.classList.remove("active"); 
  });
});


// load function 
document.addEventListener("DOMContentLoaded", async () => {
    const tagButtons = document.querySelectorAll(".tag-btn");

    for (let btn of tagButtons) {
        const tag = btn.getAttribute("data-tag");

        // Unsplash API call per tag (only 1 image)
        const url = `https://api.unsplash.com/search/photos?page=1&query=${tag}&client_id=${accessKey}&per_page=1`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.results.length > 0) {
            const result = data.results[0];

            let template = document.querySelector("#search-result img");
            if (!template) continue;

            let clone = template.cloneNode(true);
            clone.src = result.urls.small;
            clone.style.cursor = "pointer";
            clone.style.display = "block";
            clone.setAttribute("data-tag", tag);

            clone.addEventListener("click", () => openImagePopup(result.urls.full, tag));

            searchResult.appendChild(clone);
        }
    }

    if (searchResult.querySelectorAll("img").length > 0) {
        showBtn.style.display = "block";
    }
});
