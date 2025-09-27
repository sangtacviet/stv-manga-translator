{{HEADER}}

(function() {

    {{CLASS}}

    const cssStyle = `{{CSS}}`;
    const injectStyle = (css) => {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }
    const pluginManager = new PluginManager();

    {{PLUGINS}}

    const pageUrl = window.location.href;
    const matchedPlugin = pluginManager.findPluginForUrl(pageUrl);
    if (matchedPlugin) {
        console.log(`Running plugin: ${matchedPlugin.meta.name} (v${matchedPlugin.meta.version})`);
        try {
            matchedPlugin.run().then(images => {
                if (images && images.length > 0) {
                    console.log(`Found ${images.length} image(s) to translate:`, images);
                    // Here you can add code to process the image URLs, e.g., send them for translation
                    injectStyle(cssStyle);
                    TranslateButton.showTranslateButton(images);
                } else {
                    console.log('No images found by the plugin.');
                }
            }).catch(err => {
                console.error('Error running plugin:', err);
            });
        } catch (err) {
            console.error('Error executing plugin:', err);
        }
    } else {
        console.log('No matching plugin found for this URL.'); // Will be silent in future versions, currently for debugging purposes
    }
})();