/* @flow */
import { StretchyHeaderController } from '../components/controller';
import { route } from 'middle-layer/lib/controller';

export class WelcomeController extends StretchyHeaderController {

	@route('welcome')
	async index(): Promise {
		await this.render('welcome/index', {});

		const imageHeight = 200;

		let _scrollTop;

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
						.height(imageHeight + Math.abs(scrollTop));

					if (scrollTop === 0) {
						$imageStretch
							.css('transform', `translateY(0px)`);
					}
				}
				else if (scrollTop > 0 && scrollTop <= imageHeight) {
					$imageStretch
						.css('transform', `translateY(-${scrollTop / 4}px)`);
				}
				else {
					$imageStretch
						.css('transform', `translateY(0px)`);
				}
			})
			.on('touchend', function() {
				const scrollTop = $(this).scrollTop(),
					$imageStretch = $('.image-stretch');

				if (scrollTop < 0) {
					$imageStretch
						.addClass('smooth-operator');

					$imageStretch
						.height(imageHeight);
				}
				else if (scrollTop === 0 || scrollTop >= imageHeight) {
					$imageStretch
						.css('transform', `translateY(0px)`);
				}
			});
	}

}
