# Keybinds

Pair keys and key combinations to actions and behaviors.

---

This library provides a simple interface for creating keyboard shortcuts.

Set a key combination to invoke any action.

```javascript
keybinds.set('f', {
    action: function () {
        document.write('f');
    }
});
```

Remove a shortcut.

```javascript
var myBind = keybinds.set('5', {
    action: function () {
        // do something for 5
    }
});

...

keybinds.remove(myBind);
```

Apply multiple modifier combinations to a key.

```javascript
keybinds.set('a', {
    ctrl: true,
    action: ...
});

keybinds.set('a', {
    ctrl: true,
    alt: true,
    action: ...
});

...
```

Set `preventDefault` and `stopPropagation` flags to control default behavior.

```javascript
keybinds.set('s', {
    ctrl: true,
    preventDefault: true,
    action: function () {
        secretData.save();
    }
})
```

Disable and re-enable keybinds on the fly.

```javascript
var myBind = keybinds.set('§', {
    action: function () {
        hack();
    }
});

...

// for security
myBind.isEnabled = false;
```

## Reference

```typescript
keybinds.set(key: string, options: BindOptions): Bind
```

Sets a new keybind.

*@param* `options`
* *@property* `{{(e: KeyboardEvent) => void}}` `action`
* *@property* `{boolean}` `ctrl`
* *@property* `{boolean}` `shift`
* *@property* `{boolean}` `alt`
* *@property* `{boolean}` `preventDefault`
* *@property* `{boolean}` `stopPropagation`

---

```typescript
keybinds.remove(bind: Bind): void
```

Removes a key bind.

---

```typescript
Bind.prototype.isEnabled: boolean
```

Sets whether a bound action should be invoked.