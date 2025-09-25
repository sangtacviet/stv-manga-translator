(function() {
    'use strict';
    const run = async function() {
        // this script is a userscript, will search for img element with url: <img src="https://image-comic.pstatic.net/webtoon/821793/3/thumbnail_202x120_17780fa1-8f7d-44a5-9e15-77c6efcc8402.jpg" alt="3" />
        const imgElements = document.querySelector("#sectionContWide").querySelectorAll("img");
        if (imgElements.length > 0) {
            const imageUrls = Array.from(imgElements).map(img => img.src);
            return imageUrls;
        }
        return [];
    };
    pluginManager.register(new PluginMeta({
        name: "Naver Webtoon",
        version: "1.0",
        domain: "comic.naver.com",
        match: "^https?://comic\\.naver\\.com/webtoon/detail"
    }), run);
})();