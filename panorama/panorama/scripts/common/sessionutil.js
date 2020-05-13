                                                                                      

"use strict";

var SessionUtil = ( function ()
{
	var _DoesGameModeHavePrimeQueue = function( gameModeSettingName )
	{
		  
		                                                                                                     
		                                                                       
		   		                                                   
		   		                                
		  
		                                                                                                                  
		                               
		return true;
	}

	var _GetMaxLobbySlotsForGameMode = function( gameMode )
	{
		  
		                                                                            
		var numLobbySlots = 5;                                        
		if ( gameMode == "scrimcomp2v2" ||
			gameMode == "cooperative" ||
			gameMode == "coopmission")
			numLobbySlots = 2;
		else if ( gameMode === "survival" )
			numLobbySlots = 3;
		return numLobbySlots;
	}

	return{
		DoesGameModeHavePrimeQueue : _DoesGameModeHavePrimeQueue,
		GetMaxLobbySlotsForGameMode : _GetMaxLobbySlotsForGameMode
	};
})();