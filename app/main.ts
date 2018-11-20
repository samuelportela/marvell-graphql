import { LitElement, html, property } from '@polymer/lit-element';
import { repeat } from 'lit-html/directives/repeat';

function gql(query) {
  return fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query }),
  }).then((r) => r.json());
}

class MyMarvel extends LitElement {
  @property()
  characters;

  constructor() {
    super();
    gql(`{ characters { id, name, thumbnail, favorite } }`).then(
      (json) => (this.characters = json.data.characters),
    );
  }

  createRenderRoot() {
    return this;
  }

  async favorite(id: string, favorite: boolean) {
    gql(`mutation {
      updateCharacter(id: ${id}, input: {
        favorite: ${!favorite}
      }) {
        id
        favorite
      }
    }`).then((json) => {
      const { id, favorite } = json.data.updateCharacter;
      this.characters = this.characters.map((hero) => {
        if (id === hero.id) {
          hero.favorite = favorite;
        }
        return hero;
      });
      this.requestUpdate();
    });
  }

  render() {
    return html`
    <h1>Marvel Heros Universe</h1>
    <div style="display:flex;flex-wrap: wrap">
    ${this.characters &&
      repeat<{
        id: string;
        name: string;
        thumbnail: string;
        favorite: boolean;
      }>(
        this.characters,
        (hero) => hero.id,
        (hero) => html`
        <div style="flex: 1;">
        <h2>${hero.name}
          <span @click="${() => this.favorite(hero.id, hero.favorite)}">${
          hero.favorite ? '⭐️' : '✭'
        }</span>
        </h2>
        <p>
          <img width="250px" src="${hero.thumbnail}">      
        </p>
        </div>
        `,
      )}
      </div>
    `;
  }
}

customElements.define('my-marvel', MyMarvel);
