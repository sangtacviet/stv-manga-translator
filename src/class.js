class PluginMeta {
    constructor({
        name, 
        version = "1.0", 
        domain = null,
        match = null,
    }) {
        this.name = name;
        this.version = version;
        this.domain = domain;
        this.match = match;
    }
}

class RegisteredPlugin {
    constructor(meta, runFunction) {
        this.meta = meta;
        this.run = runFunction;
    }
}

class PluginManager {
    constructor() {
        this.plugins = [];
    }
    register(plugin, runFunction) {
        this.plugins.push(new RegisteredPlugin(plugin, runFunction));
    }
    findPluginForUrl(url) {
        return this.plugins.find(plugin => {
            if (plugin.meta.match) {
                const matchPattern = new RegExp(plugin.meta.match);
                if (matchPattern.test(url)) return plugin;
            }
            return null;
        });
    }
    getAllPlugins() {
        return this.plugins;
    }
}

class TranslateButton {
    static currentImageUrls = [];

    static showTranslateButton(images = []) {
        const btnId = 'stv-translate-button';
        if (document.getElementById(btnId)) return; // Already exists

        TranslateButton.currentImages = images;

        const button = document.createElement('button');
        button.id = btnId;
        button.innerText = 'Translate Manga';
        button.className = 'stv-translate-button';
        button.onclick = () => {
            TranslateWindow.show(TranslateButton.currentImages);
        };
        document.body.appendChild(button);
    }
}

class TranslateWindow {
    static settings = {
        readingStyle: 'vertical',
        translateMode: 'single',
        translatedLanguage: 'english',
        originalLanguage: 'japanese',
        imageWidth: 800,
        displayMode: 'page',
        textFont: 'Arial',
        textScaling: 100,
        geminiApiKey: ''
    };

    static translator = null;
    static images = [];

    static show(images = []) {
        if (document.getElementById('stv-manga-translator-screen')) return;

        TranslateWindow.images = images;

        const screen = document.createElement('div');
        screen.id = 'stv-manga-translator-screen';
        screen.className = 'stv-manga-translator-screen';
        screen.style.display = 'flex';

        screen.innerHTML = `
            <div class="stv-translator-window">
                <div class="stv-translator-header">
                    <h3 class="stv-translator-title">STV Manga Translator</h3>
                    <div class="stv-translator-controls">
                        <button class="stv-settings-button" id="stv-settings-btn">⚙️ Settings</button>
                        <button class="stv-close-button" id="stv-close-btn">✕</button>
                    </div>
                </div>
                <div class="stv-translator-content">
                    <div class="stv-translator-field" id="stv-translator-field">
                        <!-- MangaTranslator iframe will be loaded here -->
                    </div>
                    <div class="stv-settings-panel" id="stv-settings-panel">
                        <div class="stv-settings-header">
                            <h4 class="stv-settings-title">Translation Settings</h4>
                            <button class="stv-close-button" id="stv-settings-close-btn">✕</button>
                        </div>
                        <div class="stv-settings-content">
                            <div class="stv-setting-group">
                                <label class="stv-setting-label">Reading Style</label>
                                <select class="stv-setting-select" id="reading-style">
                                    <option value="vertical">Vertical (Manhwa/Manhua)</option>
                                    <option value="horizontal">Horizontal (Manga)</option>
                                    <option value="webtoon">Webtoon</option>
                                </select>
                            </div>
                            
                            <div class="stv-setting-group">
                                <label class="stv-setting-label">Translate Mode</label>
                                <select class="stv-setting-select" id="translate-mode">
                                    <option value="single">Single Page</option>
                                    <option value="double">Double Page</option>
                                    <option value="batch">Batch Process</option>
                                </select>
                            </div>
                            
                            <div class="stv-setting-group">
                                <label class="stv-setting-label">Original Language</label>
                                <select class="stv-setting-select" id="original-language">
                                    <option value="japanese">Japanese</option>
                                    <option value="korean">Korean</option>
                                    <option value="chinese">Chinese (Simplified)</option>
                                    <option value="chinese-traditional">Chinese (Traditional)</option>
                                    <option value="auto">Auto Detect</option>
                                </select>
                            </div>
                            
                            <div class="stv-setting-group">
                                <label class="stv-setting-label">Translated Language</label>
                                <select class="stv-setting-select" id="translated-language">
                                    <option value="english">English</option>
                                    <option value="spanish">Spanish</option>
                                    <option value="french">French</option>
                                    <option value="german">German</option>
                                    <option value="portuguese">Portuguese</option>
                                    <option value="russian">Russian</option>
                                    <option value="vietnamese">Vietnamese</option>
                                </select>
                            </div>
                            
                            <div class="stv-setting-group">
                                <label class="stv-setting-label">Display Mode</label>
                                <select class="stv-setting-select" id="display-mode">
                                    <option value="page">Page View</option>
                                    <option value="linear">Linear View</option>
                                    <option value="left-right">Left to Right</option>
                                    <option value="right-left">Right to Left</option>
                                    <option value="continuous">Continuous Scroll</option>
                                </select>
                            </div>
                            
                            <div class="stv-setting-group">
                                <label class="stv-setting-label">Image Width (px)</label>
                                <div class="stv-radio-group">
                                    <div class="stv-radio-option">
                                        <input type="radio" id="image-width-600" name="image-width" value="600">
                                        <label for="image-width-600">600px</label>
                                    </div>
                                    <div class="stv-radio-option">
                                        <input type="radio" id="image-width-800" name="image-width" value="800" checked>
                                        <label for="image-width-800">800px</label>
                                    </div>
                                    <div class="stv-radio-option">
                                        <input type="radio" id="image-width-1000" name="image-width" value="1000">
                                        <label for="image-width-1000">1000px</label>
                                    </div>
                                    <div class="stv-radio-option">
                                        <input type="radio" id="image-width-1200" name="image-width" value="1200">
                                        <label for="image-width-1200">1200px</label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="stv-setting-group">
                                <label class="stv-setting-label">Text Font</label>
                                <select class="stv-setting-select" id="text-font">
                                    <option value="Arial">Arial</option>
                                    <option value="Helvetica">Helvetica</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Verdana">Verdana</option>
                                    <option value="Trebuchet MS">Trebuchet MS</option>
                                    <option value="Comic Sans MS">Comic Sans MS</option>
                                </select>
                            </div>
                            
                            <div class="stv-setting-group">
                                <label class="stv-setting-label">Text Scaling</label>
                                <input type="range" class="stv-setting-range" id="text-scaling" 
                                       min="50" max="200" value="100" step="5">
                                <div class="stv-range-display" id="text-scaling-display">100%</div>
                            </div>
                            
                            <div class="stv-setting-group stv-api-key-group">
                                <label class="stv-setting-label">Gemini API Key (for AI Translation)</label>
                                <textarea class="stv-setting-textarea" id="gemini-api-key" 
                                          placeholder="Enter your Gemini API key here for AI-powered translation..."></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(screen);

        // Initialize MangaTranslator
        TranslateWindow.initializeMangaTranslator();

        // Load saved settings
        TranslateWindow.loadSettings();

        // Add event listeners
        TranslateWindow.addEventListeners();

        // Close on background click
        screen.addEventListener('click', (e) => {
            if (e.target === screen) {
                TranslateWindow.hide();
            }
        });
    }

    static hide() {
        const screen = document.getElementById('stv-manga-translator-screen');
        if (screen) {
            screen.remove();
        }
        // Clean up translator
        TranslateWindow.translator = null;
    }

    static async initializeMangaTranslator() {
        const translatorField = document.getElementById('stv-translator-field');
        if (!translatorField) return;

        // Create and render MangaTranslator
        TranslateWindow.translator = new MangaTranslator();
        const translatorFrame = TranslateWindow.translator.render();
        translatorField.appendChild(translatorFrame);

        // Initialize the translator
        TranslateWindow.translator.init();

        // Wait for the translator to load and set up images and languages
        try {
            await TranslateWindow.translator.isLoaded;
            
            // Set images if available
            if (TranslateWindow.images && TranslateWindow.images.length > 0) {
                console.log('Setting images for translation:', TranslateWindow.images);
                let first = TranslateWindow.images[0];
                if (first instanceof RemoteImageSrc || first instanceof String || typeof first === 'string') {
                    await TranslateWindow.translator.setImageUrls(TranslateWindow.images);
                } else {
                    await TranslateWindow.translator.setImages(TranslateWindow.images);
                }
            }

            // Set languages based on settings
            await TranslateWindow.translator.setOriginalLanguage(TranslateWindow.settings.originalLanguage);
            await TranslateWindow.translator.setTargetLanguage(TranslateWindow.settings.translatedLanguage);
        } catch (error) {
            console.error('Error initializing MangaTranslator:', error);
        }
    }

    static addEventListeners() {
        // Close button
        document.getElementById('stv-close-btn').addEventListener('click', () => {
            TranslateWindow.hide();
        });

        // Settings button
        document.getElementById('stv-settings-btn').addEventListener('click', () => {
            const panel = document.getElementById('stv-settings-panel');
            panel.classList.toggle('open');
        });

        // Settings close button
        document.getElementById('stv-settings-close-btn').addEventListener('click', () => {
            const panel = document.getElementById('stv-settings-panel');
            panel.classList.remove('open');
        });

        // Settings change listeners
        const settingElements = {
            'reading-style': 'readingStyle',
            'translate-mode': 'translateMode',
            'original-language': 'originalLanguage',
            'translated-language': 'translatedLanguage',
            'display-mode': 'displayMode',
            'text-font': 'textFont',
            'text-scaling': 'textScaling',
            'gemini-api-key': 'geminiApiKey'
        };

        Object.keys(settingElements).forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                element.addEventListener('change', async () => {
                    const settingKey = settingElements[elementId];
                    TranslateWindow.settings[settingKey] = element.value;
                    TranslateWindow.saveSettings();

                    // Update MangaTranslator if needed
                    if (TranslateWindow.translator) {
                        try {
                            if (settingKey === 'originalLanguage') {
                                await TranslateWindow.translator.setOriginalLanguage(element.value);
                            } else if (settingKey === 'translatedLanguage') {
                                await TranslateWindow.translator.setTargetLanguage(element.value);
                            }
                        } catch (error) {
                            console.error('Error updating MangaTranslator settings:', error);
                        }
                    }
                });
            }
        });

        // Handle radio button changes for image width
        const imageWidthRadios = document.querySelectorAll('input[name="image-width"]');
        imageWidthRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    TranslateWindow.settings.imageWidth = radio.value;
                    TranslateWindow.saveSettings();
                }
            });
        });

        // Text scaling display update
        const textScalingRange = document.getElementById('text-scaling');
        const textScalingDisplay = document.getElementById('text-scaling-display');
        if (textScalingRange && textScalingDisplay) {
            textScalingRange.addEventListener('input', () => {
                textScalingDisplay.textContent = textScalingRange.value + '%';
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('stv-manga-translator-screen')) {
                TranslateWindow.hide();
            }
        });
    }

    static loadSettings() {
        // Load from localStorage if available
        Object.keys(TranslateWindow.settings).forEach(key => {
            const saved = localStorage.getItem(`stv-translator-${key}`);
            if (saved !== null) {
                TranslateWindow.settings[key] = saved;
            }
        });

        // Apply settings to UI
        Object.keys(TranslateWindow.settings).forEach(key => {
            if (key === 'imageWidth') {
                // Handle radio buttons for image width
                const radio = document.getElementById(`image-width-${TranslateWindow.settings[key]}`);
                if (radio) {
                    radio.checked = true;
                }
            } else {
                const elementId = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                const element = document.getElementById(elementId);
                if (element) {
                    element.value = TranslateWindow.settings[key];
                    
                    // Update display for range inputs
                    if (element.type === 'range') {
                        const display = document.getElementById(elementId + '-display');
                        if (display) {
                            display.textContent = element.value + '%';
                        }
                    }
                }
            }
        });
    }

    static saveSettings() {
        // Save to localStorage
        Object.keys(TranslateWindow.settings).forEach(key => {
            localStorage.setItem(`stv-translator-${key}`, TranslateWindow.settings[key]);
        });
    }
}

/** 
 * Represent an image source, that can't be readed by server directly(url with auth, scraping blocking, blob, canvas, encrypted,...), the lazy stand for image will load on demand
*/
class LazyImageSrc {
    constructor(loader) {
        this.loader = loader; // function that returns a Promise resolving to an HTMLImageElement/Blob/URL string
    }
    async loadImage() {
        if (typeof this.loader === 'function') {
            const result = await this.loader();
            if (result instanceof HTMLImageElement) {
                this.imgElement = result;
                return result;
            }
            else if (result instanceof Blob) {
                const img = new Image();
                img.src = URL.createObjectURL(result);
                this.imgElement = img;
                return new Promise((resolve, reject) => {
                    img.onload = () => resolve(img);
                    img.onerror = (err) => reject(err);
                });
            }
            else if (typeof result === 'string') {
                const img = new Image();
                img.src = result;
                this.imgElement = img;
                return new Promise((resolve, reject) => {
                    img.onload = () => resolve(img);
                    img.onerror = (err) => reject(err);
                });
            }
            else {
                throw new Error('Loader function must return an HTMLImageElement, Blob, or URL string');
            }
        }
        throw new Error('Loader is not a function');
    }
    async paintToCanvas(canvas, y){
        if (!this.imgElement) {
            await this.loadImage();
        }
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const nWidth = this.imgElement.naturalWidth, nHeight = this.imgElement.naturalHeight;
        ctx.drawImage(this.imgElement, 0, y, width, width * nHeight / nWidth);
        return width * nHeight / nWidth; // return the height painted
    }
}

/** 
 * Represent an image source that can be readed by server directly, no lazy loading needed
*/
class RemoteImageSrc {
    constructor(url) {
        this.url = url;
    }
    async loadImage() {
        return this.url;
    }
}

/**
 * Manhua, Manhwa images are continuous images, we combine pair of images to prevent textbox being cut in half, only for lazy images
 */
class BiLinearImageLoader {
    constructor(images = []) {
        this.images = images; // array of LazyImageSrc
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.cropper = document.createElement('canvas');
        this.cropperCtx = this.cropper.getContext('2d');
    }

    async getPairedImage(index) {
        if (index < 0 || index >= this.images.length) {
            throw new Error('Index out of bounds');
        }
        const img1 = this.images[index];
        const img2 = (index + 1 < this.images.length) ? this.images[index + 1] : null;
        if (!(img1 instanceof LazyImageSrc) || (img2 && !(img2 instanceof LazyImageSrc))) {
            throw new Error('Images must be instances of LazyImageSrc');
        }
        // Reset canvas size
        this.canvas.width = 800; // fixed width
        this.canvas.height = 10000; // temporary height
        let currentY = 0;
        // Paint first image
        currentY += await img1.paintToCanvas(this.canvas, currentY);
        // Paint second image if exists
        if (img2) {
            currentY += await img2.paintToCanvas(this.canvas, currentY);
        }
        // Crop the canvas to actual height
        this.cropper.width = this.canvas.width;
        this.cropper.height = currentY;
        this.cropperCtx.drawImage(this.canvas, 0, 0, this.canvas.width, currentY, 0, 0, this.cropper.width, this.cropper.height);
        // Return base64 data URL
        return this.cropper.toDataURL('image/png');
    }
}

class MangaTranslator {
    constructor() {
        this.isLoaded = new Promise((resolve) => {
            this._resolveLoaded = resolve;
        });
        let frame = this.frame = document.createElement('iframe');
        frame.id = 'stv-manga-translator-frame';
        frame.className = 'stv-manga-translator-frame';
        frame.addEventListener("load", () => {
            setTimeout(() => {
                this._resolveLoaded();
            }, 500); // wait extra 1s to ensure the page is fully loaded
        });
        frame.reload = function() {
            frame.src = frame.src; // Reload the iframe
        }
    }
    render() {
        return this.frame;
    }
    async setImages(imgs) {
        await this.isLoaded;
        this.frame.contentWindow.postMessage({ type: "setComicImgs", data: imgs }, "*");
    }
    async setImageUrls(imageUrls) {
        await this.isLoaded;
        this.frame.contentWindow.postMessage({ type: "setComicImgUrls", data: imageUrls }, "*");
    }
    async setOriginalLanguage(lang) {
        await this.isLoaded;
        this.frame.contentWindow.postMessage({ type: "setOriginalLanguage", originalLanguage: lang }, "*");
    }
    async setTargetLanguage(lang) {
        await this.isLoaded;
        this.frame.contentWindow.postMessage({ type: "setTargetLanguage", targetLanguage: lang }, "*");
    }
    init() {
        // Called after rendered
        const src = "https://sangtacviet.app/comictranslator.php?isolated=true&langhint=auto";
        this.frame.src = src;
    }
}