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

    const url = `https://api.unsplash.com/search/photos?page=${page}&query=${keyword}&client_id=${accessKey}&per_page=21`;
    const response = await fetch(url);
    const data = await response.json();

    if (page === 1) {
        // Clear old results but keep template
        searchResult.querySelectorAll("img:not(:first-child)").forEach(el => el.remove());
    }

    const results = data.results;

    if (results.length === 0) {
        showBtn.style.display = "none"; // ❌ kuch nahi mila to hide
        return;
    }



    // const results = data.results;
    // results.map((result) => {
    //     const image = document.createElement("img");
    //     image.src = result.urls.small;
    //     image.style.cursor = "pointer";
    //     image.addEventListener("click", () => openImagePopup(result.urls.full, keyword));
    //     searchResult.appendChild(image);
    // });


    results.forEach((result) => {
        let template = document.querySelector("#search-result img");
        if (!template) return;

        let clone = template.cloneNode(true);
        clone.src = result.urls.small;
        clone.style.cursor = "pointer";
        clone.style.display = "block";  // ✅ ab visible ho

        clone.addEventListener("click", () => openImagePopup(result.urls.full, keyword));

        searchResult.appendChild(clone);
    });

    // ✅ agar images aaye hain to button dikhana hoga
    showBtn.style.display = "block";
}





// ✅ helper function for download
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

    // ✅ update download
    setDownload(fullImageUrl);

    // Fetch related images
    fetchRelatedImages(keyword);
}

async function fetchRelatedImages(keyword) {
    const relatedContainer = document.getElementById("related-images");

    // clear old related images but keep template
    relatedContainer.querySelectorAll("img:not(:first-child)").forEach(el => el.remove());

    const url = `https://api.unsplash.com/search/photos?page=1&query=${keyword}&client_id=${accessKey}&per_page=20`;
    const response = await fetch(url);
    const data = await response.json(); 


    // data.results.forEach((result) => {
    //     const img = document.createElement("img");
    //     img.src = result.urls.thumb;
    //     img.style.width = "100%";
    //     img.style.borderRadius = "5px";
    //     img.style.cursor = "pointer";

    //     img.addEventListener("click", () => {
    //         popupImg.src = result.urls.full; 
    //         setDownload(result.urls.full);   
    //         fetchRelatedImages(keyword);     
    //     });

    //     relatedContainer.appendChild(img);
    // });


    const templateRelated = document.querySelector("#related-images img");
    data.results.forEach((result) => {
        if (!templateRelated) return;

        let clone = templateRelated.cloneNode(true);
        clone.src = result.urls.thumb;
        clone.style.cursor = "pointer";

        // 🔥 yahan bhi add karo:
        clone.style.display = "block";

        clone.addEventListener("click", () => {
            popupImg.src = result.urls.full;
            setDownload(result.urls.full);
            fetchRelatedImages(keyword);
        });

        relatedContainer.appendChild(clone);
    });
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

// Tag functionality
document.querySelectorAll(".tag-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tag-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        keyword = btn.getAttribute("data-tag");
        searchBox.value = keyword; // update search box
        page = 1;
        searchImage();
    });
});

const themeIcon = document.getElementById("theme-icon");
const themeOptions = document.getElementById("theme-options");

// toggle theme layer
themeIcon.addEventListener("click", () => {
  themeOptions.classList.toggle("active");
});

// apply selected theme
document.querySelectorAll(".theme-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.body.className = ""; // reset
    const theme = btn.getAttribute("data-theme");
    document.body.classList.add(`${theme}-theme`);
    themeOptions.classList.remove("active"); // close after select
  });
});
