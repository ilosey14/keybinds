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
	if (typeof options.key !== 'string')
		throw `[keybinds.Bind] BindOptions.key must be a string, "${typeof options.key}" given.`;
	if (typeof options.action !== 'function')
		throw `[keybinds.Bind] BindOptions.action must be a function, "${options.action}" given.`;

	this.id = keybinds.index++;

	this.key = options.key;
	this.action = options.action;

	this.ctrl = options.ctrl || false;
	this.shift = options.shift || false;
	this.alt = options.alt || false;

	this.isEnabled = true;
	this.preventDefault = options.preventDefault;
	this.stopPropagation = options.stopPropagation;
};

keybinds.binds = {};
keybinds.index = 0;

/**
 * Sets a new or overwrites an existing keybind.
 * @param {string} key
 * @param {BindOptions|function} options
 */
keybinds.set = function (key, options) {
	if (typeof options === 'function')
		options = { action: options };

	var bind = new this.Bind(Object.assign({}, options, { key: key }));

	if (key.length === 1)
		key = key.toLowerCase();

	if (key in this.binds) {
		this.binds[key].push(bind);

		if (key.length === 1)
			this.binds[key.toUpperCase()].push(bind);
	}
	else {
		this.binds[key] = [ bind ];

		if (key.length === 1)
			this.binds[key.toUpperCase()] = [ bind ];
	}

	return bind;
};

/**
 * Removes a key bind.
 * @param {keybinds.Bind} bind
 * @returns {boolean} Whether the bind was removed successfully
 */
keybinds.remove = function (bind) {
	var binds = (bind.key.length === 1)
		? [...this.binds[bind.key.toLowerCase()], ...this.binds[bind.key.toUpperCase]]
		: this.binds[bind.key];

	if (!binds || !binds.length) return false;

	// for each binding on this key
	var removed = 0;

	for (let i = 0; i < binds.length; i++) {
		if (binds[i].id === bind.id) {
			this.binds[bind.key].splice(i, 1);
			removed++;
		}
	}

	return (removed > 0);
};

/**
 * Invokes a defined keybind from a keyboard event.
 * @param {KeyboardEvent} e
 */
keybinds.invoke = function (e) {
	if (!(e.key in this.binds))
		throw `[keybinds.invoke] Undefined keybind for key "${e.key}".`;

	for (let bind of this.binds[e.key]) {
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
	if (e.key in keybinds.binds) keybinds.invoke(e);
});
