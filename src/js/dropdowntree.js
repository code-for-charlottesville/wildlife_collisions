import 'jquery';

/*
@licstart  The following is the entire license notice for the 
JavaScript code in this page.

Copyright (C) 2016  Joseph Safwat Khella

The JavaScript code in this page is free software: you can
redistribute it and/or modify it under the terms of the GNU
General Public License (GNU GPL) as published by the Free Software
Foundation, either version 3 of the License, or (at your option)
any later version.  The code is distributed WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.

As additional permission under GNU GPL version 3 section 7, you
may distribute non-source (e.g., minimized or compacted) forms of
that code without the copy of the GNU GPL normally required by
section 4, provided you include this license notice and a URL
through which recipients can access the Corresponding Source.   


@licend  The above is the entire license notice
for the JavaScript code in this page.
*/

var dropDownOptions = {
	title: 'Dropdown',
	data: [],
	closedArrow: '<i class="fa fa-caret-right" aria-hidden="true"></i>',
	openedArrow: '<i class="fa fa-caret-down" aria-hidden="true"></i>',
	maxHeight: 300,
	multiSelect: false,
	selectChildren: false,
	addChildren: false,
	clickHandler: function (target) {},
	expandHandler: function (target, expanded) {},
	checkHandler: function (target, checked) {},
	rtl: false,
};

var globalTreeIdCounter = 0;

(function ($) {
	//data inits from options
	$.fn.DropDownTree = function (options) {
		//helpers
		function RenderData(data, element) {
			for (var i = 0; i < data.length; i++) {
				globalTreeIdCounter++;
				var dataAttrs = '';
				if (typeof data[i].dataAttrs != 'undefined' && data[i].dataAttrs != null) {
					for (var d = 0; d < data[i].dataAttrs.length; d++) {
						dataAttrs += ' data-' + data[i].dataAttrs[d].title + "='" + data[i].dataAttrs[d].data + "' ";
					}
				}
				if (!element.is('li')) {
					element.append(
						'<li class="level' +
							data[i]['dataAttrs'][0].level +
							'"id="TreeElement' +
							globalTreeIdCounter +
							'"' +
							dataAttrs +
							'>' +
							(options.multiSelect
								? '<input class="form-check-input radio-select" type="radio"' + 'name="' + data[i]['dataAttrs'][0].level + '" aria-hidden="true"></input>'
								: '') +
							'<a href="' +
							(typeof data[i].href != 'undefined' && data[i].href != null ? data[i].href : '#') +
							'">' +
							data[i].title +
							'</a></li>'
					);
					if (data[i].data != null && typeof data[i].data != 'undefined') {
						$('#TreeElement' + globalTreeIdCounter).append("<ul class='level" + (data[i]['dataAttrs'][0].level + 1) + "'style='display:none'></ul>");
						$('#TreeElement' + globalTreeIdCounter)
							.find('a')
							.first()
							.prepend('<span class="arrow">' + options.closedArrow + '</span>');
						RenderData(
							data[i].data,
							$('#TreeElement' + globalTreeIdCounter)
								.find('ul')
								.first()
						);
					} else if (options.addChildren) {
						$('#TreeElement' + globalTreeIdCounter)
							.find('a')
							.first()
							.prepend('<span class="arrow">' + options.closedArrow + '</span>');
					}
				} else {
					element
						.find('ul')
						.append(
							'<li id="TreeElement' +
								globalTreeIdCounter +
								'"' +
								dataAttrs +
								'>' +
								(options.multiSelect
									? '<input class="form-check-input" type="radio"' + 'name="' + data[i]['dataAttrs'][0].level + '" aria-hidden="true"></input>'
									: '') +
								'<a href="' +
								(typeof data[i].href != 'undefined' && data[i].href != null ? data[i].href : '#') +
								'">' +
								data[i].title +
								'</a></li>'
						);
					if (data[i].data != null && typeof data[i].data != 'undefined') {
						$('#TreeElement' + globalTreeIdCounter).append("<ul style='display:none'></ul>");
						$('#TreeElement' + globalTreeIdCounter)
							.find('a')
							.first()
							.prepend('<span class="arrow">' + options.closedArrow + '</span>');
						RenderData(
							data[i].data,
							$('#TreeElement' + globalTreeIdCounter)
								.find('ul')
								.first()
						);
					} else if (options.addChildren) {
						$('#TreeElement' + globalTreeIdCounter)
							.find('a')
							.first()
							.prepend('<span class="arrow">' + options.closedArrow + '</span>');
					}
				}
			}
		}

		options = $.extend({}, dropDownOptions, options, { element: this });

		//protos inits
		$(options.element).init.prototype.clickedElement = null;

		var tree = $(options.element);

		//handlers binders
		//element click handler
		$(options.element).on('click', 'li', function (e) {
			// tree.init.prototype.clickedElement = $(this);
			// options.clickHandler(tree.clickedElement, e);
			e.stopPropagation();
			var checked;
			if ($(this).children().siblings('ul')) {
				$(this).children().siblings('ul').first().show();
				$(this).children().siblings('a').find('span').empty(); // remove the closed arrow first
				$(this).children().siblings('a').find('span').prepend(options.openedArrow); // then add the opened arrow
			}
		});

		//arrow click handler close/open
		$(options.element).on('click', '.arrow', function (e) {
			e.stopPropagation();
			$(this).empty();
			var expanded;
			if ($(this).parents('li').first().find('ul').first().is(':visible')) {
				expanded = false;
				$(this).prepend(options.closedArrow);
				$(this).parents('li').first().find('ul').first().hide();
			} else {
				expanded = true;
				$(this).prepend(options.openedArrow);
				$(this).parents('li').first().find('ul').first().show();
			}
			options.expandHandler($(this).parents('li').first(), e, expanded);
		});

		//select radio handler
		$(options.element).on('click', '.radio-select', function (e) {
			e.stopPropagation();
			var checked;
			if ($(this).siblings('ul')) {
				$(this).siblings('ul').first().show();
				$(this).siblings('a').find('span').empty(); // remove the closed arrow first
				$(this).siblings('a').find('span').prepend(options.openedArrow); // then add the opened arrow
			}
			// Clear all necessary radio checks
			if ($(this).attr('name') == 1) {
				$('input:radio[name=2]').prop('checked', false);
				$('input:radio[name=3]').prop('checked', false);
				$('input:radio[name=4]').prop('checked', false);

				// Add circumstances text to input field
				$('#firstDropDownTree').SetTitle($(this).siblings().first().text());
				$('#circumstance').val($(this).siblings().first().text());
			} else if ($(this).attr('name') == 2) {
				$('input:radio[name=3]').prop('checked', false);
				$('input:radio[name=4]').prop('checked', false);
			} else if ($(this).attr('name') == 3) {
				$('input:radio[name=4]').prop('checked', false);
			}

			// Next radio check the parents
			if ($(this).attr('name') > 1) {
				var index = $(this).parents('li').length - 1;
				var circumstancesText = $(this).siblings().first().text();
				for (let i = 1; i <= index; i++) {
					let parentElement = $(this).parents('li')[i];
					parentElement.querySelector('input').checked = true;
					circumstancesText = parentElement.children[1].text + ' / ' + circumstancesText;
				}

				// Add circumstances text to input field
				$('#firstDropDownTree').SetTitle(circumstancesText);
				$('#circumstance').val(circumstancesText);
			}

			if ($(this).hasClass('fa-square-o')) {
				//will select
				checked = true;
				$(this).removeClass('fa-square-o');
				// $(this).addClass('fa-check-square-o');
				if (options.selectChildren) {
					$(this).parents('li').first().find('.select-box').removeClass('fa-square-o');
					// $(this).parents('li').first().find('.select-box').addClass('fa-check-square-o');
				}
			} else {
				//will unselect
				checked = false;
				// $(this).addClass('fa-square-o');
				$(this).removeClass('fa-check-square-o');
				if (options.selectChildren) {
					// $(this).parents('li').first().find('.select-box').addClass('fa-square-o');
					$(this).parents('li').first().find('.select-box').removeClass('fa-check-square-o');
					$(this)
						.parents('li')
						.each(function () {
							$(this).find('.select-box').first().removeClass('fa-check-square-o');
							// $(this).find('.select-box').first().addClass('fa-square-o');
						});
				}
			}
			options.checkHandler($(this).parents('li').first(), e, checked);
		});

		if (options.rtl) {
			$(options.element).addClass('rtl-dropdown-tree');
			if (options.closedArrow.indexOf('fa-caret-right') > -1) {
				options.closedArrow = options.closedArrow.replace('fa-caret-right', 'fa-caret-left');
			}
		}
		$(options.element).append(
			'<button class="btn btn-default form-control" type="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="true"><span class="dropdowntree-name">' +
				options.title +
				'</span><span class="carets"></span></button>'
		);
		$(options.element).append('<ul style="max-height: ' + options.maxHeight + 'px; width: 100%" class="dropdown-menu" aria-labelledby="dropdownMenu1"></ul>');

		RenderData(options.data, $(options.element).find('ul').first());

		//protos inits
		$(options.element).init.prototype.GetParents = function () {
			var jqueryClickedElement = $(options.element).clickedElement;
			return $(jqueryClickedElement).parents('li');
		};

		$(options.element).init.prototype.SetTitle = function (title) {
			$(this).find('.dropdowntree-name').text(title);
		};

		$(options.element).init.prototype.GetSelected = function (title) {
			var selectedElements = [];
			$(this)
				.find('.fa-check-square-o')
				.each(function () {
					selectedElements.push($(this).parents('li').first());
				});
			return selectedElements;
		};

		$(options.element).init.prototype.AddChildren = function (element, arrOfElements) {
			if (options.addChildren && $(element).find('ul').length === 0) $(element).append('<ul></ul>');
			element = $(element).find('ul').first();
			if (element.find('li').length === 0) RenderData(arrOfElements, element);
		};
	};
})(jQuery);
