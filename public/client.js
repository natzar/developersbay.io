App = Ember.Application.create({
	LOG_TRANSITIONS: true, 
	LOG_TRANSITIONS_INTERNAL: true
});

App.Router.reopen({
  notifyGoogleAnalytics: function() {
    return ga('send', 'pageview', {
        'page': this.get('url'),
        'title': this.get('url')
      });
  }.on('didTransition')
});

App.User = DS.Model.extend({
	credits : DS.attr('number')
})
App.Developer = DS.Model.extend({
	name: DS.attr('string'),
	city: DS.attr('string'),
	category: DS.attr('string'),
	hot:DS.attr('boolean'),
	country: DS.attr('string'),
	verified: DS.attr('boolean'),
	languages: DS.attr('string'),
	available: DS.attr('boolean'),
	updated: DS.attr('date'),
	description: DS.attr('string'),
	email: DS.attr('string'),
	skills: DS.attr('string'),
	image: DS.attr('string'),
	website: DS.attr('string')
	
	
});

App.Store = DS.Store.extend({
	adapter:DS.RESTAdapter.extend({
		namespace: 'api'
	})
});

App.ApplicationSerializer = DS.RESTSerializer.extend({

  serialize: function(record, options) {
        options = options ? options : {}; // handle the case where options is undefined
        options.includeId = true;
        return this._super.apply(this, [record, options]); // Call the parent serializer
    },
  normalize: function (type, hash, property) {
    var json = { id: hash._id };
    delete hash._id;
    for (var prop in hash) {
      json[prop.camelize()] = hash[prop];
    }
    return this._super(type, json, property);
  }


});

App.ApplicationRoute = Ember.Route.extend({
setupController: function(controller, model){
   // this._super(controller, model);
    this.store.find("developer");    
  }
  });

App.Router.map(function() {
	this.route('adddeveloper');
	this.route('changelog');
	this.route('roadmap');

	this.route('terms-and-conditions');
	this.resource('developers', function() {
    	this.resource('developer', { path: ':developer_id' });
    	this.route('altas');
    	this.route('info');
  		this.route('requisitos');
	});
});


App.AdddeveloperRoute = Ember.Route.extend({
	
});
App.AdddeveloperView = Ember.View.extend({

    /**
     * @property DragDrop
     * @type DropletView
     */
    DragDrop: DropletView.extend()

});

App.AdddeveloperController = Ember.Controller.extend(DropletController,{
 isCreating: false,	
  actions: {
  edit: function(){
  alert('hello');
  },
    create: function() {    
      this.set('isCreating', true);
    },
       doneCreating: function() {
		console.log('start');
	    this.set('isCreating', false);
	  
		var langs = this.get('country');
		//langs = langs.split(",");
		var skills = this.get('skills');
		//skills = skills.split(",");
		
		var newDeveloper = {
			name: this.get('name'),
			category: this.get('category'),
			city: this.get('city'),
			country: this.get('country'),
			verified: false,
			languages: langs,
			available: true,
			updated: new Date,
			description: this.get('description'),
			email: this.get('email'),
			skills: skills,
			image: this.get('image')
	   };
	   var record = this.store.createRecord('developer',newDeveloper);
	   record.save();
	   
//	   newDeveloper.save();
	   console.log(newDeveloper);
	       console.log('finish editing');
	       this.transitionTo('developers')
      // Create the new Todo model
     	//var aux = this.store.createRecord('developer', newDeveloper);
      //aux.save();
      // Clear the "New Todo" text field
      //this.set('name', '');

      // Save the new model

    }
  },
      /**
     * Path that handles the file uploads.
     *
     * @property dropletUrl
     * @type {String}
     */
    dropletUrl: 'upload',

    /**
     * @property dropletOptions
     * @type {Object}
     */
    dropletOptions: {
        fileSizeHeader: true,
        useArray: false
    },

    /**
     * Specifies the valid MIME types. Can used in an additive fashion by using the
     * property below.
     *
     * @property mimeTypes
     * @type {Array}
     */
    mimeTypes: ['image/bmp'],

    /**
     * Apply this property if you want your MIME types above to be appended to the white-list
     * as opposed to replacing the white-list entirely.
     *
     * @property concatenatedProperties
     * @type {Array}
     */
    concatenatedProperties: ['mimeTypes'],

    /**
     * @method didUploadFiles
     * @param response {Object}
     * @return {void}
     */
    didUploadFiles: function(response) {
        this.set('image',response.files[0]);
    }

});
App.IndexRoute = Ember.Route.extend({
	redirect : function(){
		this.transitionTo('developers')
	}	
});

App.DevelopersRoute = Ember.Route.extend({
	model: function(){
		return this.store.all('developer');
	},
	setupController: function(controller, developers) {
    controller.set('filteredContent', developers);
  	}
	
	
	});
App.DevelopersView = Ember.View.extend({
	
});


App.DeveloperRoute = Ember.Route.extend({
	model: function(params){
		return this.store.find('developer', params.developer_id);
	}  



});

 
  
 App.DeveloperView = Ember.View.extend({

    /**
     * @property DragDrop
     * @type DropletView
     */
    DragDrop: DropletView.extend()

});

App.DeveloperController = Ember.Controller.extend(DropletController,{
isEditing: false,
actions:{



doneWritingMessage: function(){
	console.log('sending...!');

console.log('From: '+this.get('from')+ "// Message:"+this.get('message'));
	if (this.get('from') == 'undefined' || this.get('from') == '' || this.get('message') == 'undefined' || this.get('message') == '') {
		alert("Please fill the input fields");
		return false;
	} else {
	var re = /\S+@\S+/;
	var aux=this.get('from');
	var aux_this = this;
	console.log(aux);
	if (!re.test(aux)) {
		alert("Email not valid");
		return false;
	} else {
	
	
	var proms = {
	from: this.get('from'), message: this.get('message')
	};
	console.log("PROMS: "+proms);
	$.post('/sendmessage',proms,function(data){
	
    
    aux_this.set('message','');
    
		
		console.log('After send message: '+data);
		alert("Email sent! You will get a direct response from developer")
	});
	}}
	
},
 edit: function() {    
      this.set('isEditing', true);
    },
     doneEditing: function() {
		console.log('start');
	    this.set('isEditing', false);
	  
	  	var record = this.get('model'); // the model 
	  
	  if (this.get('image'))
	  	record.set('image',this.get('image'));
	  record.save();
	   
//	   newDeveloper.save();
	   console.log(newDeveloper);
	       console.log('finish editing');
      // Create the new Todo model
     	//var aux = this.store.createRecord('developer', newDeveloper);
      //aux.save();
      // Clear the "New Todo" text field
      //this.set('name', '');

      // Save the new model

    }

},  /**
     * Path that handles the file uploads.
     *
     * @property dropletUrl
     * @type {String}
     */
    dropletUrl: 'upload',

    /**
     * @property dropletOptions
     * @type {Object}
     */
    dropletOptions: {
        fileSizeHeader: true,
        useArray: false
    },

    /**
     * Specifies the valid MIME types. Can used in an additive fashion by using the
     * property below.
     *
     * @property mimeTypes
     * @type {Array}
     */
    mimeTypes: ['image/bmp'],

    /**
     * Apply this property if you want your MIME types above to be appended to the white-list
     * as opposed to replacing the white-list entirely.
     *
     * @property concatenatedProperties
     * @type {Array}
     */
    concatenatedProperties: ['mimeTypes'],

    /**
     * @method didUploadFiles
     * @param response {Object}
     * @return {void}
     */
    didUploadFiles: function(response) {
    	console.log(response.files);
        this.set('image',response.files[0]);
    }

});


App.DevelopersController = Ember.Controller.extend({
	filter: '',
	

    search: function() {
    console.log('he');
        this.set("filteredContent", Ember.A() ); // clear possibly non-empty array
        filter = this.get('filter');
        console.log("Filter: "+filter);
        var searchResultsBuilder = this.store.all('developer');
        if (filter != ''){

        	searchResultsBuilder = this.store.find('developer',{filter: filter});
        }
        //...
        //... making modifications to searchResultsBuilder
        //...
        this.set("filteredContent",searchResultsBuilder);
    }.observes("filter")

  	 });
 
  
  Ember.Handlebars.helper('imagepath', function(value, options) {
console.log(value);
  return new Ember.Handlebars.SafeString('<img src="/data/'+value.hash.src+'" class="img-rounded pull-left">');
});

Handlebars.registerHelper('ifCond', function(v1, v2, options) {
console.log(v1+" "+v2);
  if(v1 == String(v2)) {
  
    return options.fn(this);
  }
  return options.inverse(this);
});