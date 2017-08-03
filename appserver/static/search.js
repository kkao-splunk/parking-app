require ([
	'splunkjs/mvc',
	'splunkjs/mvc/simplexml/ready!',
	'jquery',
  'splunkjs/mvc/searchmanager',
  "splunkjs/mvc/tableview",
  "splunkjs/mvc/singleview"

], function(
		mvc,
		ready,
		$,
    SearchManager,
    TableView,
    SingleView,
		) {
      var load = function() {
        var service = mvc.createService({ owner: 'nobody' });
        var tokens = mvc.Components.get('default');
        var address_tok = tokens.get('address');
        if (address_tok) {
          var record = {
            'address': address_tok
          }
          service.request(
          "storage/collections/data/mycollection/",
          "POST",
          null,
          null,
          JSON.stringify(record),
          {"Content-Type": "application/json"},
          null).done(function(response) {
            var service = mvc.createService();
            var req = service.request(path='/address_endpoint');
            req.done(function(answer) {
              var answer = JSON.parse(answer);
              tokens.set("lat", answer.results[0].geometry.location.lat);
              tokens.set("lon", answer.results[0].geometry.location.lng);
              var lat = answer.results[0].geometry.location.lat;
              var lon = answer.results[0].geometry.location.lng;

              var query1 = '|inputlookup  crime.csv| where Y<'+(lat+.1)+'AND X<'+(lon+.1)+'|stats count BY Location| eval color_tok = if(count<=2,"#a2cc3e", "#d6563c")| table count color_tok'
							console.log(query1);
              var query2 = '| inputlookup  meters.csv| eval source=coalesce(source, "meters")| eval loc=coalesce(Location,LOCATION)| rex field=loc "\\((?<lat>[^,]+), (?<lon>[^\\)]+)\\)"|where lon <'+(lon + .014).toString()+'AND lon >'+(lon-.014)+'AND lat<'+(lat+.014).toString()+'AND lat>'+(lat-.014).toString()+'|table STREET_NUM STREETNAME'
              tokens.set("searchQuery1",query1);
              tokens.set('searchQuery2',query2)
              var searchindex1 = new SearchManager({
                  id: "searchindex1",
                  cache: true,
                  search: mvc.tokenSafe("$searchQuery1$"),
                  earliest_time: "-24h@h",
                  latest_time: "now"
                  });

                  var searchindex2 = new SearchManager({
                  id: "searchindex2",
                  cache: true,
                  search: mvc.tokenSafe('$searchQuery2$'),
                  earliest_time: "-24h@h",
                  latest_time: "now"
                  });

                  var example_view = new SingleView({
                   id: "example_view",
                   managerid: "searchindex1",
                   beforeLabel: "Event count:",
                   el: $("#dash1")
                  }).render();

                  var example_table = new TableView({
                   id: "example_table",
                   managerid: "searchindex2",
                   pageSize: "12",
                   el: $("#dash2")
                  }).render();

            })

          });

        }

    }

      $(document).ready(function(){
        load();
    		var token = mvc.Components.get('default');
    		token.on('change:address', function() {
    			var service = mvc.createService({ owner: 'nobody' });
    			service.del('storage/collections/data/mycollection/').done(function() {
					$('#dash1').empty();
					$('#dash2').empty();
						mvc.Components.revokeInstance('searchindex1');
						mvc.Components.revokeInstance('searchindex2');
						mvc.Components.revokeInstance('example_table');
						mvc.Components.revokeInstance('example_view');
						load();
    				return;
    			}).fail(function() {
    				console.log('There is an error - Please try again');
    			});
    		});
    	});

  });
