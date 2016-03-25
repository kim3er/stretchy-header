import { MlRouter } from 'middle-layer/lib/router';

export class StretchyHeaderRouter extends MlRouter {

	resolveRoute(requested) {
		let patten = /:[\w]+/g;

		var ret = {
			action: this.routes.$[requested],
			params: {}
		};

		if (!ret.action) {
			for (var registered in this.routes.$) {
				let matches = registered.match(patten);

				if (matches) {
					let regExp = new RegExp(registered.replace(patten, '[\\w]+'), 'g');

					if (regExp.test(requested)) {
						var regParsed = registered,
							reqParsed = requested;

						for (const param of matches) {
							let startIndex = regParsed.indexOf(param),
								endIndex = reqParsed.indexOf('/', startIndex),
								value = reqParsed.substring(startIndex, endIndex === -1 ? undefined : endIndex);

							ret.params[param.slice(1)] = value;

							regParsed = regParsed.substring(regParsed.indexOf(param) + param.length + 1);
							reqParsed = reqParsed.substring(reqParsed.indexOf(value) + value.length + 1);
						}

						ret.action = this.routes.$[registered];
						break;
					}
				}
			}
		}

		return ret;
	}

	goTo(route, data = {}, $el) {
		let { action, params } = this.resolveRoute(route);

		Object.assign(data, params);

		// Tracking
		let trackableRoute = action ? action.action : route;

		if (window.gaChromeTracker) {
			window.gaChromeTracker.sendAppView(trackableRoute);
		}
		else if (typeof analytics !== 'undefined') {
			analytics.trackView(trackableRoute);
		}

		this.currentRoute = trackableRoute;

		if (action) {
			return this.controllerAction(action, data, $el);
		}
		else {
			return this.switchTemplate(route);
		}
	}

	attachHandlers() {
		let self = this;

		$('body')
			.on('click', 'a[href^="#"]:not([data-router-ignore])', function(evt) {
				evt.preventDefault();

				let $self = $(this),
					href = $self.attr('href').replace('#', '');

				if (href === '') {
					return false;
				}

				self.goTo(href, $self.data(), $self);

			})
			.on('submit', 'form[action^="#"]:not([data-router-ignore])', function(evt) {
				evt.preventDefault();

				let $self = $(this),
					href = $self.attr('action').replace('#', '');

				if (href === '') {
					return false;
				}

				self.formSubmit(href, $self);
			});
	}

}
