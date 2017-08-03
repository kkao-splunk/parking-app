require ([
	'splunkjs/mvc',
	'splunkjs/mvc/simplexml/ready!',
	'jquery'
], function(
		mvc,
		ready,
		$
		) {
      var load = function() {
        var service = mvc.createService({ owner: 'nobody' });
        var tokens = mvc.Components.get('default');
        var address_tok = tokens.get('address');
        console.log(address_tok);
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
              tokens.set("lon", answer.results[0].geometry.location.lon);
              
            })
          });
        }
      }

      $(document).ready(function(){
        var service = mvc.createService({ owner: 'nobody' });
        service.del('storage/collections/data/mycollection/').done(function() {
          load();
        });
    });
  });
