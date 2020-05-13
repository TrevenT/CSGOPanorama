                                                             

"use strict";

var EventUtil = ( function ()
{
	var _eventIdSet = new Set();

	                                                                                                                                
	   
	                                                                                                                                      
	                                                                                                                                    
	                       
	   
	                                                                                                                                   
	  
	var _officialEventIds = [

		                              
		5277,
		5278,
		5279,
		5281,
		5282
	];
	_officialEventIds.forEach( item => _eventIdSet.add( item.toString() ) );

	var _AnnotateOfficialEvents = function( jsonEvents )
	{
		for ( let event of jsonEvents )
		{
			if ( _eventIdSet.has( event.event_id ) )
			{
				event.is_official = true;
			}
		}

		return jsonEvents;
	}

	return{
		AnnotateOfficialEvents: _AnnotateOfficialEvents
	};
})();