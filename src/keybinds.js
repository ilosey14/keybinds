/**
 * Keyboard binding interface.
 * Pair keys and key combinations to actions and behaviors.
 */
const keybinds = {};

/**
 * @typedef BindOptions
 * @property {string} key
 * @property {{(e: KeyboardEvent) => void}} action
 * @property {boolean} ctrl
 * @property {boolean} shift
 * @property {boolean} alt
 * @property {boolean} preventDefault
 * @property {boolean} stopPropagation
 */


/**
 * Key bind object constructor.
 * @constructor
 * @param {BindOptions} options
 */
keybinds.Bind = function (options) {
    if (typeof options.action !== 'function')
        throw 'BindOptions.action must be a function, "' + (typeof options.action) + '" given.';

    this.id = keybinds.index++;

    this.key = options.key;
    this.action = options.action;

    this.ctrl = options.ctrl || false;
    this.shift = options.shift || false;
    this.alt = options.alt || false;

    this.preventDefault = options.preventDefault;
    this.stopPropagation = options.stopPropagation;
};

keybinds.Bind.prototype.isEnabled = true;

keybinds.binds = {};
keybinds.index = 0;

/**
 * Sets a new or overwrites an existing keybind
 * @param {string} key
 * @param {BindOptions} options
 */
keybinds.set = function (key, options) {
    var bind = new this.Bind(Object.assign(options, { key: key }));

    if (this.binds[key])
        this.binds[key].push(bind);
    else
        this.binds[key] = [ bind ];

    return bind;
};

/**
 * Removes a key bind
 * @param {Bind} bind
 * @returns {boolean} Whether the bind was removed successfully
 */
keybinds.remove = function (bind) {
    var binds = this.binds[bind.key];

    if (!binds) return false;

    // for each binding on this key
    for (let i = 0; i < binds.length; i++) {
        if (binds[i].id === bind.id) {
            this.binds[bind.key].splice(i, 1);
            return true;
        }
    }

    return false;
}

/**
 * Invokes a defined keybind from a keyboard event
 * @param {KeyboardEvent} e
 */
keybinds.invoke = function (e) {
    var key = e.key;

    if (!this.binds[key])
        throw 'Error: undefined keybind for key "' + key + '"';

    for (let bind of this.binds[key]) {
        if (!bind.isEnabled) continue;

        if (e.ctrlKey === bind.ctrl &&
            e.shiftKey === bind.shift &&
            e.altKey === bind.alt)
        {
            bind.action(e);

            if (bind.preventDefault)
                e.preventDefault();

            if (bind.stopPropagation)
                e.stopPropagation();

            // continue looping
        }
    }
};

// Attach the event listener
window.addEventListener('keydown', function (e) {
    if (keybinds.binds[e.key]) keybinds.invoke(e);
});
