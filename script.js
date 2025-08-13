const accessKey = "4EA_f_Vhu5-dY3KiS5c-ssHzKcBJI7z7B1UKOdrBedI";

const searchForm = document.getElementById("search-form");
const searchBox = document.getElementById("search-box");
const searchResult = document.getElementById("search-result");
const showBtn = document.getElementById("show-more-btn");

let keyword = "";
let page = 1;
let typingTimer; // typing delay ka timer

async function searchImage(){
    if (!keyword) return; // agar empty hai to kuch mat karo

    const url = `https://api.unsplash.com/search/photos?page=${page}&query=${keyword}&client_id=${accessKey}&per_page=12`;

    const response = await fetch(url);
    const data = await response.json();

    // Pehle results clear karo agar page = 1
    if (page === 1) searchResult.innerHTML = "";

    const results = data.results;
    results.map((result)=>{
        const image = document.createElement("img");
        image.src = result.urls.small;
        const imageLink = document.createElement("a");
        imageLink.href = result.links.html;
        imageLink.target = "_blank";

        imageLink.appendChild(image);
        searchResult.appendChild(imageLink);
    });
    showBtn.style.display = "block";
}

// Search button wale event ki zarurat nahi, lekin agar rakhna chaho to rakh sakte ho
searchForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    page = 1;
    searchImage();
});

// Live search: input pe call kare
searchBox.addEventListener("input", ()=>{
    clearTimeout(typingTimer);
    typingTimer = setTimeout(()=>{
        keyword = searchBox.value.trim();
        page = 1;
        searchImage();
    }, 500); // 500ms delay to avoid too many API calls
});

showBtn.addEventListener("click", ()=>{
    page++;
    searchImage();
});
