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
 * @property {boolean} isEnabled
 * @property {EventTarget} target
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
	this.target = options.target;

	this.ctrl = options.ctrl || false;
	this.shift = options.shift || false;
	this.alt = options.alt || false;

	this.isEnabled = (options.isEnabled === undefined) || options.isEnabled;
	this.preventDefault = options.preventDefault;
	this.stopPropagation = options.stopPropagation;
 };

/**
 * Removes this keybind.
 */
keybinds.Bind.prototype.remove = function () {
	keybinds.remove(this);
};

keybinds.binds = {};
keybinds.targetBinds = {};
keybinds.index = 0;

/**
 * Sets a new or overwrites an existing keybind.
 * @param {string} key
 * @param {BindOptions|function} options
 */
keybinds.set = function (key, options) {
	let bindOptions = Object.assign({ key }, (typeof options === 'function') ? { action: options } : options),
		bind = new this.Bind(bindOptions),
		binds;

	// init target
	if (bind.target) {
		let id = bind.target.id || (bind.target.id = Math.random().toString(36).slice(2));

		if (!(id in this.targetBinds)) {
			this.targetBinds[id] = {};
			this.attachListener(bind.target);
		}

		binds = this.targetBinds[id];
	}
	else
		binds = this.binds;

	if (key.length === 1)
		key = key.toLowerCase();

	if (key in binds) {
		binds[key].push(bind);

		if (key.length === 1)
			binds[key.toUpperCase()].push(bind);
	}
	else {
		binds[key] = [ bind ];

		if (key.length === 1)
			binds[key.toUpperCase()] = [ bind ];
	}

	return bind;
};

/**
 * Sets a new or overwrites an existing keybind.
 * @param {string} key
 * @param {BindOptions|function} options
 */
keybinds.setOnce = function (key, options) {
	var bind = this.set(key, options);

	bind.action = () => {
		// run action
		if (typeof options === 'function')
			options();
		else
			options.action?.();

		// remove bind
		window.setTimeout(() => keybinds.remove(bind));
	};

	return bind;
};

/**
 * Removes a key bind.
 * @param {keybinds.Bind} bind
 * @returns {boolean} Whether the bind was removed successfully
 */
keybinds.remove = function (bind) {
	var binds = (bind.key.length === 1)
		? [...this.binds[bind.key.toLowerCase()], ...this.binds[bind.key.toUpperCase()]]
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
 * @param {Object<string,keybinds.Bind>} dict
 */
keybinds.invoke = function (e, dict) {
	if (!dict) dict = this.binds;

	if (!(e.key in dict))
		throw `[keybinds.invoke] Undefined keybind for key "${e.key}".`;

	for (let bind of dict[e.key]) {
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

/**
 * @param {EventTarget} target
 */
keybinds.attachListener = function (target) {
	if (target.id === undefined)
		target.id = Math.random().toString(36).slice(2);

	target.addEventListener('keydown', function (e) {
		let dict = keybinds.targetBinds[this.id];

		if (e.key in dict) keybinds.invoke(e, dict);
	});
};

// Attach the event listener
window.addEventListener('keydown', function (e) {
	if (e.key in keybinds.binds) keybinds.invoke(e);
});
