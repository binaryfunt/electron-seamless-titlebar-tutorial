const { ipcRenderer } = require("electron");
const ipc = ipcRenderer;
const close = document.getElementById("close-button");
const min = document.getElementById("min-button");
const max = document.getElementById("max-button");
const i = document.getElementById("mxr");

// close app here //
close.addEventListener("click", e => {
    ipc.send('closeApp')
});
// end //

// minimize app here //
min.addEventListener("click", () => {
    ipc.send('minApp');
});
// end //

// maximizeRestore app here //
max.addEventListener("click", () => {
    ipc.send('maxApp');
});
// end //

ipc.on("changeImx", (et, message) => {
    i.setAttribute("srcset", "icons/restore-w-10.png 1x, icons/restore-w-12.png 1.25x, icons/restore-w-15.png 1.5x, icons/restore-w-15.png 1.75x, icons/restore-w-20.png 2x, icons/restore-w-20.png 2.25x, icons/restore-w-24.png 2.5x, icons/restore-w-30.png 3x, icons/restore-w-30.png 3.5x");
});

ipc.on("changeIr", (t, message) => {
    i.setAttribute("srcset", "icons/max-w-10.png 1x, icons/max-w-12.png 1.25x, icons/max-w-15.png 1.5x, icons/max-w-15.png 1.75x, icons/max-w-20.png 2x, icons/max-w-20.png 2.25x, icons/max-w-24.png 2.5x, icons/max-w-30.png 3x, icons/max-w-30.png 3.5x");
})