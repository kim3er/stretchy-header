/* @flow */
import { StretchyHeaderController } from '../components/controller';
import { route } from 'middle-layer/lib/controller';

export class WelcomeController extends StretchyHeaderController {

	@route('welcome')
	async index(): Promise {
		const $html: Object = await this.render('welcome/index', {});

		let _scrollTop;
		let _gestureStart;

		$('.image-stretch')
			.on('webkitTransitionEnd transitionend', function() {
				$(this)
					.removeClass('smooth-operator');
			});

		$('.scroll-parent')
			.on('scroll', function() {
				const scrollTop = $(this).scrollTop();

				if (_scrollTop === scrollTop) {
					return;
				}

				_scrollTop = scrollTop;

				const $imageStretch = $('.image-stretch');

				if (scrollTop <= 0) {
					$imageStretch
						.height(200 + Math.abs(scrollTop));
				}
			})
			.on('touchstart', function(evt) {
				_gestureStart = $(this).scrollTop();
			})
			.on('touchend', function() {
				const scrollTop = $(this).scrollTop();

				if (scrollTop < 0) {
					const $imageStretch = $('.image-stretch');

					$imageStretch
						.addClass('smooth-operator');

					$imageStretch
						.height(200);
				}
			});
	}

}
