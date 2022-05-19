$(function () {
	document.querySelectorAll('.form-outline').forEach((formOutline) => {
		new mdb.Input(formOutline).init();
	});

	let addressSelect = $('#select-address')
		.select2({
			width: '100%',
			placeholder: 'Адресс',
			allowClear: true,
			ajax: {
				transport: (data, success, failure) => {
					let params = data.data;
					let maxResultCount = 10;

					params.page = params.page || 1;

					let filter = {};
					filter.skipCount = (params.page - 1) * maxResultCount;

					axios
						.get('https://localhost:7252/api/Weather/GetLocations', {
							params: {
								query: params.term,
								count: maxResultCount,
							},
						})
						.then(function (response) {
							// обработка успешного запроса
							let locations = response.data;
							success({
								results: locations.map((item) => {
									return {
										id: item.name,
										text: item.name,
										lat: item.lat,
										lon: item.lon,
									};
								}),
								pagination: {
									more: params.page * maxResultCount < maxResultCount,
								},
							});
						})
						.catch(function (error) {
							// обработка ошибки
							console.log(error);
						})
						.then(function () {
							// выполняется всегда
						});
				},
				cache: true,
			},
			templateResult: (data) => data.text,
			templateSelection: (data) => data.text,
		})
		.on('select2:select', function (e) {
			let data = e.params.data;
			initWeather(data);

			//Добавление в куки выбранного адреса!!!
			let currentLocation = $('#select-address').text();
			$.cookie('nameCity', currentLocation);
		});

	function initWeather(geo) {
		$('#weather-city').text(geo.text);

		axios
			.get('https://localhost:7252/api/Weather', {
				params: {
					lat: geo.lat,
					lon: geo.lon,
				},
			})
			.then(function (response) {
				// обработка успешного запроса
				let data = response.data;
				$('#weather-img').attr('src', `http://openweathermap.org/img/wn/${data.icon}@2x.png`);
				$('#weather-name').text(data.name);
				$('#weather-temp').text(data.temp);
				$('#weather-wind').text(data.windSpeed);
				$('#weather-time').text(data.time);
				$('#weather-water').text(data.humidity);

				// добавляю в куки координаты выбранной локации!!!
				$.cookie('lat', geo.lat);
				$.cookie('lon', geo.lon);
			})
			.catch(function (error) {
				// обработка ошибки
				console.log(error);
			})
			.then(function () {
				// выполняется всегда
			});
	}

	//Инициализация куки с координатами сохраненной локации и наименованием!!!
	initWeather({
		lat: $.cookie('lat'),
		lon: $.cookie('lon'),
		text: $.cookie('nameCity'),
	});
});
