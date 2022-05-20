//var fx = require('./../libs/money');

//Ожидаем подгрузки страницы а после выполняем код в данной функции
$(function () {
	//Через API получаем курсы валют для библиотеки money.js (используем в конверторе валют)
	$.getJSON(
		// NB: using Open Exchange Rates here, but you can use any source!
		'https://openexchangerates.org/api/latest.json?app_id=3cdd056ec1734a17af02d07491650b31',
		function (data) {
			// Check money.js has finished loading:
			if (typeof fx !== 'undefined' && fx.rates) {
				fx.rates = data.rates;
				fx.base = data.base;
			} else {
				// If not, apply to fxSetup global:
				var fxSetup = {
					rates: data.rates,
					base: data.base,
				};
			}

			//Наполняем выпадающий список валют
			let convertFromSelect = $('#select-from')
				.select2({
					width: '100%',
					placeholder: 'Из',
					allowClear: true,
					data: Object.keys(fx.rates).map((item) => {
						return {
							id: item,
							text: item,
						};
					}),
					templateResult: (data) => data.text,
					templateSelection: (data) => data.text,
				})
				.on('select2:select', function (e) {});

			let convertToSelect = $('#select-to')
				.select2({
					width: '100%',
					placeholder: 'В',
					allowClear: true,
					data: Object.keys(fx.rates).map((item) => {
						return {
							id: item,
							text: item,
						};
					}),
					templateResult: (data) => data.text,
					templateSelection: (data) => data.text,
				})
				.on('select2:select', function (e) {});
		}
	);

	initDailyCurrency();

	//С сайта ЦБ запрашиваем текущий курс валют и у станавливаем
	function initDailyCurrency() {
		axios.get('https://localhost:7252/api/Currency').then(function (response) {
			let data = response.data;

			initCurrency('dailyDollar', data.dollar);
			initCurrency('dailyEuro', data.euro);
			initCurrency('dailyYuan', data.yuan);
		});
	}

	function initCurrency(id, currency) {
		$('#' + id).text(currency.value);

		let $difference = $('#' + id)
			.parent()
			.parent()
			.find('.difference');

		$difference.text(currency.difference);

		if (currency.difference >= 0) {
			$difference.addClass('inc');
		} else {
			$difference.addClass('dec');
		}
	}

	$('#btn-result').click(function () {
		if ($('#convert-sum').val() == '') {
			$('#convert-result').addClass('alert-warning');
			$('#convert-result').text('Не введена сумма!');

			if ($('#convert-result').hasClass('d-none')) {
				$('#convert-result').removeClass('d-none');
			}
			return;
		}

		if ($('#select-from').val() == null) {
			$('#convert-result').addClass('alert-warning');
			$('#convert-result').text('Не введена валюта "Из"!');

			if ($('#convert-result').hasClass('d-none')) {
				$('#convert-result').removeClass('d-none');
			}
			return;
		}

		if ($('#select-to').val() == null) {
			$('#convert-result').addClass('alert-warning');
			$('#convert-result').text('Не введена валюта "В"!');

			if ($('#convert-result').hasClass('d-none')) {
				$('#convert-result').removeClass('d-none');
			}
			return;
		}

		if ($('#convert-result').hasClass('d-none')) {
			$('#convert-result').removeClass('d-none');
		}

		$('#convert-result').removeClass('alert-warning');
		$('#convert-result').addClass('alert-primary');

		let sum = $('#convert-sum').val();
		let result = fx(sum).from($('#select-from').val()).to($('#select-to').val());
		$('#convert-result').text(result);
	});
});
