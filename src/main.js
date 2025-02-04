export default class MaterialSymbolComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const sheet = new CSSStyleSheet();
    sheet.insertRule(
      `:host { display: inline-flex; align-items: center; justify-content: center; width: 1.5em; height: 1.5em }`,
    );
    sheet.insertRule(
      `svg { display: block; fill: currentColor; width: 100%; height: 100%; }`,
    );
    this.shadowRoot.adoptedStyleSheets.push(sheet);
  }

  _refresh() {
    let { family = "outlined", weight = "400", name, filled } = this.dataset;

    weight = Math.round(Number(weight) / 100) * 100;
    filled = filled != undefined;

    if (!weight || !name) return;

    if (["outlined", "rounded", "sharp"].includes(family)) {
      if (weight >= 100 && weight <= 900) {
        this._loadIcon({ family, weight, name, filled });
      }
    }
  }

  /**
   *
   * @param {Object} param0
   * @param {string} param0.family
   * @param {number} param0.weight
   * @param {string} param0.name
   * @param {boolean} param0.filled
   */
  _loadIcon({ family, weight, name, filled }) {
    const keyName = `${family}:${weight}:${name}:${+filled}`;

    let cachedIcons = JSON.parse(
      localStorage.getItem("material-symbols") || "{}",
    );

    if (cachedIcons[keyName]) {
      this.shadowRoot.innerHTML = cachedIcons[keyName];
    } else {
      const CDN = "https://cdn.jsdelivr.net";
      let url = `${CDN}/npm/@material-symbols/svg-${weight}/${family}/${name}${filled ? "-fill" : ""}.svg`;

      const addIcon = async (response) => {
        if (response.ok) {
          this.shadowRoot.innerHTML = cachedIcons[keyName] = await response
            .clone()
            .text();
          localStorage.setItem("material-symbols", JSON.stringify(cachedIcons));
        } else {
          this.shadowRoot.innerHTML = "";
        }
        return response;
      };

      if (keyName in MaterialSymbolComponent.loadedIcons) {
        MaterialSymbolComponent.loadedIcons[keyName].then(addIcon);
      } else {
        MaterialSymbolComponent.loadedIcons[keyName] = fetch(url).then(addIcon);
      }
    }
  }

  connectedCallback() {
    this._refresh();
  }

  attributeChangedCallback() {
    this._refresh();
  }

  static observedAttributes = [
    "data-family",
    "data-weight",
    "data-ame",
    "data-filled",
  ];

  static loadedIcons = {};
}

if ("customElements" in self) {
  self.customElements.define("material-symbol", MaterialSymbolComponent);
}
