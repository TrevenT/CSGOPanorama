                                                                                      

"use strict";

var SessionUtil = ( function ()
{
	var _DoesGameModeHavePrimeQueue = function( gameModeSettingName )
	{
		  
		                                                                                                     
		                                                                       
		   		                                                   
		   		                                
		  
		                                                                                                                  
		                               
		return true;
	};

	var _GetMaxLobbySlotsForGameMode = function( gameMode )
	{
		  
		                                                                            
		var numLobbySlots = 5;                                        
		if ( gameMode == "scrimcomp2v2" ||
			gameMode == "cooperative" ||
			gameMode == "coopmission" )
			numLobbySlots = 2;
		else if ( gameMode === "survival" )
			numLobbySlots = 3;
		return numLobbySlots;
	};

	var _AreLobbyPlayersPrime = function()
	{
		var playersCount = PartyListAPI.GetCount();

		for ( var i = 0; i < playersCount; i++ )
		{
			var xuid = PartyListAPI.GetXuidByIndex( i );
			var isFriendPrime = PartyListAPI.GetFriendPrimeEligible( xuid );

			if ( isFriendPrime === false )
			{
				return false;
			}
		}

		return true;
	};

	return{
		DoesGameModeHavePrimeQueue : _DoesGameModeHavePrimeQueue,
		GetMaxLobbySlotsForGameMode: _GetMaxLobbySlotsForGameMode,
		AreLobbyPlayersPrime: _AreLobbyPlayersPrime
	};
})();