# Electron seamless titlebar tutorial (Windows 10 style)

A guide to creating a seamless Windows 10 title bar in your Electron app.

![Final]

I was inspired by the way [Hyper terminal](https://hyper.is/) achieved a native look, and a tutorial by [Shawn Rakowski](https://github.com/srakowski) (no longer available, it seems).

I'm going to start with the [Electron quick start app](https://github.com/electron/electron-quick-start). The full example source code is located in the [`src` directory](/src) of this repo.

#### Note

Currently, there is a bug with window maximization on Electron versions 6.0.0+ on Windows (see [#6](https://github.com/binaryfunt/electron-seamless-titlebar-tutorial/issues/6)). The latest version of Electron you can use is 5.0.11.

## 1. Add some styles

![S1]

First, I'm just going to add some basic styles to the quick start app make it look a bit better than some sort of web 1.0 site. Create a CSS file

```css
* {margin: 0; padding: 0; border: 0; vertical-align: baseline;}
html {box-sizing: border-box;}
*, *:before, *:after {box-sizing: inherit;}
html, body {height: 100%; margin: 0;}

body {
  font-family: "Segoe UI", sans-serif;
  background: #1A2933;
  color: #FFF;
}
h1 {margin: 0 0 10px 0; font-weight: 600; line-height: 1.2;}
p {margin-top: 10px; color: rgba(255,255,255,0.4);}
```

Add a link to it in the `head` of `index.html`.

## 2. Make the window frameless

![S2]

We're going to remove the standard Windows title bar and border. In `main.js`, modify the `new BrowserWindow()` line so it includes `frame: false`:

```javascript
mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    backgroundColor: '#FFF',
    webPreferences: {
        nodeIntegration: true
    }
});
```

N.B. we have included `backgroundColor: '#FFF'` so that subpixel anti-aliasing is enabled ([see here for details](https://github.com/electron/electron/issues/6344#issuecomment-420371918)). `nodeIntegration` is enabled for the window controls JavaScript to work (which we will get to later).

Tip: uncomment `mainWindow.webContents.openDevTools()` to open developer tools every time the app is run.

If you run the app now, you'll see the title bar is gone. See the [docs](https://electronjs.org/docs/api/frameless-window) for more info on frameless windows.

## 3. Create a replacement title bar

We're going to create our own title bar using HTML and CSS. Let's also put the rest of the app content in its own div:

```html
<body>

  <header id="titlebar"></header>

  <div id="main">
    <h1>Hello World!</h1>
    <p>Lorem ipsum dolor sit amet...</p>
  </div>

  <script>
    require('./renderer.js')
  </script>
</body>
```

The default title bar height in Windows is 32px. We want the titlebar fixed at the top of the DOM. I'm giving it a background colour temporarily so we can see where it is. I've also added a subtle 1px border to the window. We need to add 32px top margin to `#main`, and change the `overflow-y` for `#main` and `body` (`#main` is now replacing `body` as the scrolling content).

```css
body {
  border: 1px solid #48545c;
  overflow-y: hidden;
}

#titlebar {
  display: block;
  position: fixed;
  height: 32px;
  width: calc(100% - 2px); /*Compensate for body 1px border*/
  background: #254053;
}

#main {
  height: calc(100% - 32px);
  margin-top: 32px;
  padding: 20px;
  overflow-y: auto;
}
```

![S3]

Tip: you can do <kbd>ctrl</kbd>+<kbd>R</kbd> to reload the app.

## 4. Make the title bar draggable

You might notice our new titlebar isn't actually draggable. To fix this, we add a div to `#titlebar`:

```html
<header id="titlebar">
  <div id="drag-region"></div>
</header>
```

We need to give it a style of `-webkit-app-region: drag`. The reason we don't just add this style to `#titlebar` is that we also want the cursor to change to resize when we hover near the edge of the window at the top. If the whole title bar was draggable, this wouldn't happen. So we also add some padding to the non-draggable `#titlebar` element.

```css
#titlebar {
  padding: 4px;
}

#titlebar #drag-region {
  width: 100%;
  height: 100%;
  -webkit-app-region: drag;
}
```

If you reload now, you will be able to drag the window around again, and the window can be resized at the top.

## 5. Add window control buttons

It's time to add the minimise, maximise, restore and close buttons. To do this, we'll need the symbols, which are part of the [Segoe MDL2 Assets](https://docs.microsoft.com/en-us/windows/uwp/design/style/segoe-ui-symbol-font) font.

| Symbol   | Unicode |
| -------- | ------- |
| Minimise | E921    |
| Maximise | E922    |
| Restore  | E923    |
| Close    | E8BB    |

We'll put the buttons inside the `#drag-region` div

```html
<header id="titlebar">
  <div id="drag-region">
    <div id="window-controls">
      <div class="button" id="min-button">
        <span>&#xE921;</span>
      </div>
      <div class="button" id="max-button">
        <span>&#xE922;</span>
      </div>
      <div class="button" id="restore-button">
        <span>&#xE923;</span>
      </div>
      <div class="button" id="close-button">
        <span>&#xE8BB;</span>
      </div>
    </div>
  </div>
</header>
```

The buttons are 46px wide & 32px high, and the font size for the symbols is 10px. We'll use [CSS grid](https://css-tricks.com/snippets/css/complete-guide-grid/) to overlap the maximise/restore buttons, and later use JavaScript to alternate between them.

```css
#titlebar {
  color: #FFF;
}

#window-controls {
  display: grid;
  grid-template-columns: repeat(3, 46px);
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  font-family: "Segoe MDL2 Assets";
  font-size: 10px;
}

#window-controls .button {
  grid-row: 1 / span 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
#window-controls #min-button {
  grid-column: 1;
}
#window-controls #max-button, #window-controls #restore-button {
  grid-column: 2;
}
#window-controls #close-button {
  grid-column: 3;
}
```

![S5]

## 6. Style the window control buttons

First of all, the buttons shouldn't be part of the window drag region, so we'll exclude them. Also, we don't want to be able to select the symbols as text, nor do we want to see a text edit cursor when we hover on the buttons. Speaking of hover, let's add hover effects. The default Windows close button colour is `#E81123`. And, we'll hide the restore button by default (again, we'll implement switching between the maximise/restore buttons later).

```css
#window-controls {
  -webkit-app-region: no-drag;
}

#window-controls .button {
  user-select: none;
  cursor: default;
}
#window-controls .button:hover {
  background: rgba(255,255,255,0.1);
}
#window-controls .button:active {
  background: rgba(255,255,255,0.2);
}

#close-button:hover {
  background: #E81123 !important;
}
#close-button:active {
  background: #f1707a !important;
  color: #000;
}

#restore-button {
  display: none !important;
}
```

![S6]

## 7. Add the window title

There are lots of ways you could do this, depending on whether you wanted to add any buttons or file menus to the titlebar, and whether you wanted the title centered or to the left.

![S7]

My way is to put it the left. Add this inside the `#drag-region` div, above the window controls:

```html
<div id="window-title">
  <span>Electron quick start</span>
</div>
```

I've gone with grid, as you can change the template columns to suit whatever you decide to do. Here we have an auto width column and a 138px column (3 * 46px = 138px). The default Windows window title font size is 12px. The default margin/padding on the left of the title is 10px, but 2px is already taken up by `#titlebar`'s padding, so 8px of margin/padding is needed on the left. I've taken the precaution of hiding any overflowing text if the title happens to be very long.

```css
#titlebar #drag-region {
  display: grid;
  grid-template-columns: auto 138px;
}

#window-title {
  grid-column: 1;
  display: flex;
  align-items: center;
  margin-left: 8px;
  overflow: hidden;
  font-family: "Segoe UI", sans-serif;
  font-size: 12px;
}

#window-title span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.5;
}
```

At this point, you can remove the background colour from `#titlebar` and admire your handywork.

![Final]

## 8. Implement window controls functionality

Now, open `renderer.js`. We're going to code the windows controls, which is part of a single BrowserWindow instance and so should be in `renderer.js` as opposed to `main.js` ([see the docs](https://electronjs.org/docs/tutorial/application-architecture)). The code isn't too complex so here it is in its entirety:

```javascript
const remote = require('electron').remote;

// When document has loaded, initialise
document.onreadystatechange = () => {
    if (document.readyState == "complete") {
        handleWindowControls();
    }
};

function handleWindowControls() {

    let win = remote.getCurrentWindow();
    // Make minimise/maximise/restore/close buttons work when they are clicked
    document.getElementById('min-button').addEventListener("click", event => {
        win.minimize();
    });

    document.getElementById('max-button').addEventListener("click", event => {
        win.maximize();
    });

    document.getElementById('restore-button').addEventListener("click", event => {
        win.unmaximize();
    });

    document.getElementById('close-button').addEventListener("click", event => {
        win.close();
    });

    // Toggle maximise/restore buttons when maximisation/unmaximisation occurs
    toggleMaxRestoreButtons();
    win.on('maximize', toggleMaxRestoreButtons);
    win.on('unmaximize', toggleMaxRestoreButtons);

    function toggleMaxRestoreButtons() {
        if (win.isMaximized()) {
            document.body.classList.add('maximized');
        } else {
            document.body.classList.remove('maximized');
        }
    }
}
```

## 9. Adding styling for when the window is maximized

Now all there is to do is to add some CSS for when the window is in the maximized state. When the window is maximized we should be able to drag from the very top down to restore it, so we should remove the drag region padding and set its width to 100%. We also need to swap between the maximize and restore buttons.

```css
.maximized #titlebar {
  width: 100%;
  padding: 0;
}

.maximized #window-title {
  margin-left: 12px;
}

.maximized #restore-button {
  display: flex !important;
}

.maximized #max-button {
  display: none;
}
```


[Final]: screenshots/Final.png
[S1]: screenshots/S1.png
[S2]: screenshots/S2.png
[S3]: screenshots/S3.png
[S5]: screenshots/S5.png
[S6]: screenshots/S6.png
[S7]: screenshots/S7.png
