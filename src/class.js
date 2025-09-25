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

