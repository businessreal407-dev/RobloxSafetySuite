fetch("./modules/knownBad.json")
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("badList");

    data.knownBad.forEach(item => {
      const div = document.createElement("div");
      div.className = "bad-item";

      div.innerHTML = `
        <strong>${item.name}</strong><br>
        ID: ${item.id}<br>
        Reason: ${item.reason}
      `;

      list.appendChild(div);
    });
  });
