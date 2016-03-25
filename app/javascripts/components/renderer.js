import * as nunjucks from 'nunjucks';

export class StretchyHeaderRenderer {

	constructor() {
		let self = this;

		self.engine = new nunjucks.Environment();
	}

	async render(path, data = {}) {
		let self = this;

		data = data === null ? {} : data;

		return self.engine.render(`${path}.html`, data);
	}

	hasTemplate(path) {
		return !!window.nunjucksPrecompiled[`${path}.html`];
	}

}
