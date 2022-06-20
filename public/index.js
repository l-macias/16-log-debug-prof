//Funcion berreta que detecta si el usuario está activo o se fue al baño
const inactivityTime = function () {
  let time;
  window.onload = resetTimer;

  document.onmousemove = resetTimer;
  document.onkeydown = resetTimer;

  function resetTimer() {
    clearTimeout(time);
    time = setTimeout((location.href = "/"), 600000);
  }
};
