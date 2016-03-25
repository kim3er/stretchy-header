import { MlController } from 'middle-layer/lib/controller';

export class StretchyHeaderController extends MlController {

	async render(path, data, opts) {
		opts = Object.assign(
			(opts ? opts : {}),
			{
				direction: 'forward'
			}
		);

		let html = await this.app.renderer.render(path, data);

		return $('.app-content-target')
			.html(html);
	}

	async goTo(path, data) {
		return this.app.router.goTo(path, data);
	}

}
