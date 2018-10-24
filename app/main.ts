import { LitElement, html } from '@polymer/lit-element';

class MyMarvel extends LitElement {
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <h1>Marvel Heros Universe</h1>
    `
  }
}

customElements.define('my-marvel', MyMarvel);
