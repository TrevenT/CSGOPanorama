                                                                                      

"use strict";

var SessionUtil = ( function ()
{
	var _DoesGameModeHavePrimeQueue = function( gameModeSettingName )
	{
		  
		                                                                                                     
		                                                                       
		   		                                                   
		   		                                
		  
		var bPrimeQueueSupported = ( gameModeSettingName === 'competitive' || gameModeSettingName === 'scrimcomp2v2' );
		return bPrimeQueueSupported;
	}

	return{
		DoesGameModeHavePrimeQueue : _DoesGameModeHavePrimeQueue
	};
})();