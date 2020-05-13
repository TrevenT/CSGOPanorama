'use strict';


var dictPlayerStatusImage = {
	0: "",
	1: "file://{images}/icons/ui/elimination.svg",
	2: "file://{images}/icons/ui/bomb_c4.svg",
	3: "file://{images}/icons/ui/dominated.svg",
	4: "file://{images}/icons/ui/dominated_dead.svg",
	5: "file://{images}/icons/ui/nemesis.svg",
	6: "file://{images}/icons/ui/nemesis_dead.svg",
	7: "file://{images}/icons/equipment/defuser.svg",
	8: "file://{images}/icons/ui/VoteTeamSwitch.svg",
	9: "file://{images}/icons/ui/switch_teams_dead.svg"
}

var dictRoundResultImage = {
	"win_elimination": "file://{images}/icons/ui/elimination.svg",
	"win_rescue": "file://{images}/icons/ui/rescue.svg",
	"win_defuse": "file://{images}/icons/equipment/defuser.svg",
	"win_time": "file://{images}/icons/ui/timer.svg",
	"win_bomb": "file://{images}/icons/ui/bomb.svg",
}


var dictGamePhases = {
	"GAMEPHASE_WARMUP_ROUND": 0,
	"GAMEPHASE_PLAYING_STANDARD": 1,
	"GAMEPHASE_PLAYING_FIRST_HALF": 2,
	"GAMEPHASE_PLAYING_SECOND_HALF": 3,
	"GAMEPHASE_HALFTIME": 4,
	"GAMEPHASE_MATCH_ENDED": 5
}

var arrSpectatorVisibleStats = [
	"ping",
	"avatar",
	"name"
];

var arrStatsNotToTeamColorize = [
	"ping"
]

var Scoreboard = ( function()
{

	var UPDATE_INTERVAL_MIN = 0.1;

	var _m_bInit;
	var _m_LocalPlayerID = "";			                                         
	var GetLocalPlayerId = function()
	{
		return function()
		{
			if ( _m_LocalPlayerID == "" )
				_m_LocalPlayerID = GameStateAPI.GetLocalPlayerXuid();
			return _m_LocalPlayerID;
		}
	}();
	var _m_oUpdateStatFns;			                                                                                  
	var _m_schedUpdateJob;			                            
	var _m_updatePlayerIndex;		                                   
	var _m_oTeams = {};					                                  
	var _m_arrSortingPausedRefGetCounter;                                     
	var _m_stateGetCounter;				                                      
	var _m_hDenyInputToGame;		                                                                         

	var _m_dataSetCurrent;
	var _m_dataSetGetCount;

	var _m_areTeamsSwapped;
	var _m_maxRounds;
	var _m_oPlayers;				                               

	var _m_RoundUpdated;			                                                                                               

	var _m_TopCommends;
	var _m_overtime;

	var _m_sortOrder;                                 

	var _m_updatePlayerHandler = null;

	var _m_cP = $.GetContextPanel();

	_Reset();


	                                    
	  
	function team_t( teamName )
	{
		var _m_CommendLeaderboards = {
			'leader': [],
			'teacher': [],
			'friendly': [],
		}

		function player_commend_t ( xuid, value )
		{
			return {
				m_xuid: xuid,
				m_value: value,
			}
		}

		                                                                                                     
		function _CalculateAllCommends ()
		{

			var localTeamName = GameStateAPI.GetPlayerTeamName( GetLocalPlayerId() );

			[ 'leader', 'teacher', 'friendly' ].forEach( function( stat )
			{
				                                                                                 
				                                                        

				_SortCommendLeaderboard( stat );

				_ChangeCommendDisplay( _m_TopCommends[ stat ], stat, false );

				_m_TopCommends[ stat ] = _GetCommendBestXuid( stat );
				_ChangeCommendDisplay( _m_TopCommends[ stat ], stat, true );          
				
				
			} );
		}

		function _UpdateCommendForPlayer ( xuid, stat, value )
		{
			if ( value == 0 )
				return;
			
			var playerCommend = _m_CommendLeaderboards[ stat ].find( p => p.m_xuid === xuid );

			if ( !playerCommend )
			{
				_m_CommendLeaderboards[ stat ].push( player_commend_t( xuid, value ) );
			}
			else
			{
				playerCommend.m_value = value;
			}



		}

		function _DeletePlayerFromCommendsLeaderboards ( xuid )
		{

			[ 'leader', 'teacher', 'friendly' ].forEach( function( stat )
			{
				var index = _m_CommendLeaderboards[ stat ].findIndex( p => p.m_xuid === xuid );

				if ( index != -1 )
				{
					_m_CommendLeaderboards[ stat ].splice( index, 1 );
				}
			} )
			

		}		

		function _ChangeCommendDisplay ( xuid, stat, turnon )
		{
			var oPlayer = _m_oPlayers.GetPlayerByXuid( xuid );
			if ( !oPlayer )
				return;
			
			var elPlayer = oPlayer.m_elPlayer;
			if ( !elPlayer || !elPlayer.IsValid() )
				return;
			
			var elCommendationImage = elPlayer.FindChildTraverse( "id-sb-name__commendations__" + stat );
			if ( !elCommendationImage || !elCommendationImage.IsValid() )
				return;
			
			if ( turnon )
				elCommendationImage.RemoveClass( 'hidden' );	
			else 
				elCommendationImage.AddClass( 'hidden' );
		}



		function _SortCommendLeaderboard ( stat )
		{
			       
			_m_CommendLeaderboards[ stat ].sort( function( a, b ) { return b.m_value - a.m_value } );
		}

		function _GetCommendBestXuid ( stat )
		{
			switch ( stat )
			{
				case 'leader': return _GetCommendTopLeaderXuid(  );
				case 'teacher': return _GetCommendTopTeacherXuid(  );
				case 'friendly': return _GetCommendTopFriendlyXuid( );
			}
		}

		function _GetCommendTopLeaderXuid (  )
		{
			var clb = _m_CommendLeaderboards[ 'leader' ];

			return clb[ 0 ] ? clb[ 0 ].m_xuid : 0;
		}

		function _GetCommendTopTeacherXuid (  )
		{
			var clb = _m_CommendLeaderboards[ 'teacher' ];

			var teacher0 = clb[ 0 ] ? clb[ 0 ].m_xuid : 0;
			var teacher1 = clb[ 1 ] ? clb[ 1 ].m_xuid : 0;
			
			if ( teacher0 != _GetCommendTopLeaderXuid(  ) )
				return teacher0;
			else
				return teacher1;
		}

		function _GetCommendTopFriendlyXuid (  )
		{
			var clb = _m_CommendLeaderboards[ 'friendly' ];

			var friendly0 = clb[ 0 ] ? clb[ 0 ].m_xuid : 0;
			var friendly1 = clb[ 1 ] ? clb[ 1 ].m_xuid : 0;
			var friendly2 = clb[ 2 ] ? clb[ 2 ].m_xuid : 0;

			if ( friendly0 != _GetCommendTopLeaderXuid( ) && friendly0 != _GetCommendTopTeacherXuid(  ) )
				return friendly0;
			else if ( friendly1 != _GetCommendTopLeaderXuid(  ) && friendly1 != _GetCommendTopTeacherXuid(  ) )
				return friendly1;
			else
				return friendly2;
		}



		return {
			m_teamName : 								teamName,
			m_teamClanName: 							"",
			m_teamLogoImagePath: 						"",
			UpdateCommendForPlayer: 					_UpdateCommendForPlayer,
			DeletePlayerFromCommendsLeaderboards:		_DeletePlayerFromCommendsLeaderboards,
			CalculateAllCommends: 						_CalculateAllCommends,
		}

	}

	function player_t ( xuid )
	{
		return {
			m_xuid: xuid,				                
			m_elPlayer: undefined,		                            
			m_elTeam: undefined,		                                                              
			m_oStats: {},				                                        
			m_oElStats: {},			                                         
			m_isMuted: false,			               
			m_oMatchStats: undefined,
		}
	}


	function allplayers_t ()
	{
		var _m_arrPlayers = [];

		function _AddPlayer ( xuid )
		{
			var newPlayer = new player_t( xuid );

			var teamName = GameStateAPI.GetPlayerTeamName( xuid );

			if ( IsTeamASpecTeam( teamName ) )
				teamName = "Spectator";
			
			var elTeam = _m_cP.FindChildInLayoutFile( "players-table-" + teamName );
			if ( !elTeam || !elTeam.IsValid() )
			{
				elTeam = _m_cP.FindChildInLayoutFile( "players-table-ANY" );
			}
			newPlayer.m_elTeam = elTeam;

			_m_arrPlayers.push( newPlayer );

			return newPlayer;
		}

		function _GetPlayerByIndex ( i )
		{
			return _m_arrPlayers[ i ];
		}

		function _GetPlayerByXuid ( xuid )
		{
			var i = _m_arrPlayers.findIndex( p => p.m_xuid === xuid );

			if ( i !== -1 )
				return _m_arrPlayers[ i ];
			else
				return undefined;

		}


		function _GetPlayerIndexByEntIndex ( entindex )
		{
			var xuid = GameStateAPI.GetPlayerXuidStringFromEntIndex( entindex );

			return _GetPlayerIndexByXuid( xuid );
		}

		function _GetPlayerIndexByXuid ( xuid )
		{
			return _m_arrPlayers.findIndex( p => p.m_xuid === xuid );
		}

		function _GetCount ()
		{
			return _m_arrPlayers.length;
		}

		function _DeletePlayerByXuid ( xuid )
		{
			var oPlayer = _GetPlayerByXuid( xuid );

			if ( oPlayer &&
				oPlayer.m_oStats &&
				( 'teamname' in oPlayer.m_oStats ) &&
				( oPlayer.m_oStats[ 'teamname' ] in _m_oTeams ) )
			{
				_m_oTeams[ oPlayer.m_oStats[ 'teamname' ] ].DeletePlayerFromCommendsLeaderboards( xuid );
			}
				
			var i = _GetPlayerIndexByXuid( xuid );

			if ( _m_arrPlayers[ i ].m_elPlayer && _m_arrPlayers[ i ].m_elPlayer.IsValid() )
				_m_arrPlayers[ i ].m_elPlayer.DeleteAsync( .0 );

			_m_arrPlayers.splice( i, 1 );
		}

		function _DeleteAllDisconnectedPlayers ()
		{
			for ( var i = 0; i < _m_arrPlayers.length; i++ )
			{
				var xuid = _m_arrPlayers[ i ].m_xuid;

				if ( !GameStateAPI.IsPlayerConnected( xuid ) )
				{
					_DeletePlayerByXuid( xuid );
				}
			};
		}

		return {

			AddPlayer: _AddPlayer,
			GetPlayerByIndex: _GetPlayerByIndex,
			GetPlayerByXuid: _GetPlayerByXuid,
			GetPlayerIndexByXuid: _GetPlayerIndexByXuid,
			GetPlayerIndexByEntIndex: _GetPlayerIndexByEntIndex,
			GetCount: _GetCount,
			DeletePlayerByXuid: _DeletePlayerByXuid,
			DeleteDisconnectedPlayers: _DeleteAllDisconnectedPlayers,
		}


	}

	function _Reset ()
	{

		_m_bInit = false;
		_m_oPlayers = new allplayers_t();
		_m_oUpdateStatFns = {};
		_m_schedUpdateJob = false;
		_m_updatePlayerIndex = 0;
		_m_oTeams = {};
		_m_arrSortingPausedRefGetCounter = 0;
		_m_hDenyInputToGame = null;
		_m_dataSetCurrent = 0;
		_m_dataSetGetCount = 0;
		_m_areTeamsSwapped = false;
		_m_maxRounds = 0;
		_m_sortOrder = undefined;
		_m_overtime = 0;

		_m_RoundUpdated = {};

		_m_TopCommends = {
			'leader': 0,
			'teacher': 0,
			'friendly': 0,
		};

		_m_cP.RemoveAndDeleteChildren();

		_m_cP.m_bSnippetLoaded = false;
	};

	function _Helper_LoadSnippet ( element, snippet )
	{
		if ( element && !element.m_bSnippetLoaded )
		{
			element.BLoadLayoutSnippet( snippet )
			element.m_bSnippetLoaded = true;
		}
	};


	  
	                                       
	  
	function _PopulatePlayerList ()
	{
		  		                                        

		                      
		var oPlayerList = GameStateAPI.GetPlayerDataJSO();

		if ( !oPlayerList || Object.keys( oPlayerList ).length === 0 )
		{
			                                    
			return false;
		}	
			
		_m_oPlayers.DeleteDisconnectedPlayers();

		                                                    
		for ( var teamName in oPlayerList )
		{
			                                                                                 
			                                                                         

			if ( !_m_oTeams[ teamName ] )
				_m_oTeams[ teamName ] = new team_t( teamName );

			for ( var j in oPlayerList[ teamName ] )
			{
				var xuid = oPlayerList[ teamName ][ j ];

				var oPlayer = _m_oPlayers.GetPlayerByXuid( xuid );

				                                                    
				if ( !oPlayer )
				{
					_CreateNewPlayer( xuid );
				}
				else if ( oPlayer.m_oStats[ 'teamname' ] != teamName )                 
				{
					_ChangeTeams( oPlayer, teamName );
				}
			}
		}

		                                                                  
		if ( !_m_oTeams[ "CT" ] )
		{
			_m_oTeams[ "CT" ] = new team_t( "CT" );
		}

		if ( !_m_oTeams[ "TERRORIST" ] )
		{
			_m_oTeams[ "TERRORIST" ] = new team_t( "TERRORIST" );
		}

		return true;
	};

	function _ChangeTeams ( oPlayer, newTeam )
	{
		                   
		if ( oPlayer.m_oStats[ 'teamname' ] == newTeam )
			return;
		
		var xuid = oPlayer.m_xuid;
		var oldTeam = oPlayer.m_oStats[ 'teamname' ];
		var elPlayer = oPlayer.m_elPlayer;

		                                
		oPlayer.m_oStats[ 'teamname' ] = newTeam;
		
		                                
		if ( oldTeam in _m_oTeams )
		{
			_m_oTeams[ oldTeam ].DeletePlayerFromCommendsLeaderboards( xuid );	
		}
		
		                                                                                        
		oPlayer.m_oStats[ 'leader' ] = -1;
		oPlayer.m_oStats[ 'teacher' ] = -1;
		oPlayer.m_oStats[ 'friendly' ] = -1;
		
		if ( !elPlayer || !elPlayer.IsValid() )
			return;
		
		                                               
		if ( oldTeam )
			elPlayer.RemoveClass( "sb-team--" + oldTeam );
		
		elPlayer.AddClass( "sb-team--" + newTeam );
		
		                                        
		if ( IsTeamASpecTeam( newTeam ) && MatchStatsAPI.IsTournamentMatch() )
		{
			elPlayer.AddClass( 'hidden' );
			
			return;
		}

		                                            
		  
		var elTeam = _m_cP.FindChildInLayoutFile( "players-table-" + newTeam );
		if ( !elTeam && !IsTeamASpecTeam( newTeam ) )
		{
			elTeam = _m_cP.FindChildInLayoutFile( "players-table-ANY" );
		}

		if ( elTeam && elTeam.IsValid() )
		{
			oPlayer.m_elTeam = elTeam;
			elPlayer.SetParent( elTeam );
			elPlayer.RemoveClass( 'hidden' );
		}
		else
		{
			elPlayer.AddClass( 'hidden' );
		}

		                          
		var idx = _m_oPlayers.GetPlayerIndexByXuid( xuid );
		_UpdateAllStatsForPlayer( idx, true );                                               

		_SortPlayer( idx );
	}

	function _CreateNewPlayer ( xuid )
	{
		var oPlayer = _m_oPlayers.AddPlayer( xuid );

		_NewPlayerPanel( oPlayer );

		var idx = _m_oPlayers.GetPlayerIndexByXuid( xuid );
		_UpdateAllStatsForPlayer( idx, true );

		_SortPlayer( idx );

		                                       
		for ( var s in _m_sortOrder )
		{
			_HighlightSortStatLabel( s );
			break;
		}
	}



	  
	                                                                             
	                                           
	  
	function _UpdateNextPlayer ()
	{
		if ( _m_updatePlayerIndex >= _m_oPlayers.GetCount() )
		{
			_PopulatePlayerList();

			_m_updatePlayerIndex = 0;
		}

		_UpdatePlayer( _m_updatePlayerIndex );

		_m_updatePlayerIndex++;
	}


	function _UpdateAllPlayers_delayed ( bSilent = false )
	{
		$.Schedule( 0.01, _ => _UpdateAllPlayers( bSilent ) );
	}


	                                                
	function _UpdateAllPlayers ( bSilent = false )
	{
		if ( !_m_bInit )
			return;

		_PopulatePlayerList();
		_m_updatePlayerIndex = 0;

		                                                         
		                                                               
		                                           


			for ( var i = 0; i < _m_oPlayers.GetCount(); i++ )
			{
				var elPlayer = _m_oPlayers.GetPlayerByIndex( i ).m_elPlayer;
				if ( elPlayer && elPlayer.IsValid() )
					elPlayer.RemoveClass( "sb-row--transition" );
			}

			for ( var i = 0; i < _m_oPlayers.GetCount(); i++ )
			{
				_UpdatePlayer( i, bSilent );
			};
	
			  	                            
			for ( var i = 0; i < _m_oPlayers.GetCount(); i++ )
			{
			 	var elPlayer = _m_oPlayers.GetPlayerByIndex( i ).m_elPlayer;
			 	if ( elPlayer && elPlayer.IsValid() )
			 		elPlayer.AddClass( "sb-row--transition" );
			 }
		
	};

	                   
	function _Pulse ( el )
	{
		el.RemoveClass( "sb-pulse-highlight" );
		el.AddClass( "sb-pulse-highlight" );
	};

	function _UpdatePlayerByEntIndex ( entindex )
	{
		var index = _m_oPlayers.GetPlayerIndexByEntIndex( entindex );

		_UpdatePlayer( index, true );
	}

	function _UpdatePlayerByEntIndex_delayed ( entindex )
	{
		                                                                                                            
		                                               

		$.Schedule( 0.01, _ => _UpdatePlayerByEntIndex( entindex ) );

	}


	                                                
	  
	                  
	                                                        
	  
	function _UpdatePlayer ( idx, bSilent = false )
	{
		var oPlayer = _m_oPlayers.GetPlayerByIndex( idx );
	
		if ( !oPlayer )
			return;
		
		bSilent = bSilent && _m_cP.visible;
		
		var xuid = oPlayer.m_xuid;

		oPlayer.m_oMatchStats = MatchStatsAPI.GetPlayerStatsJSO( xuid );

		                    
		    
		   	       
		    

		if ( !GameStateAPI.IsPlayerConnected( xuid ) )
		{
			_m_oPlayers.DeletePlayerByXuid( xuid );
		}
		else
		{
			_UpdateAllStatsForPlayer( idx, bSilent );
			
			_SortPlayer( idx );
		}
	};
	                                                

	function _UpdateSpectatorButtons()
	{
	    var elButtonPanel = $( "#spec-button-group" );
	    if ( !elButtonPanel || !elButtonPanel.IsValid()  ) 
	        return;

	    var nCameraMan = parseInt( GameInterfaceAPI.GetSettingString( "spec_autodirector_cameraman" ) );
	    var bQ = ( GameStateAPI.IsLocalPlayerHLTV() && nCameraMan > -1 )

	    if ( bQ )
	    {
	        elButtonPanel.visible = true;
	        UpdateCasterButtons();
	    }
	    else
	    {
	        elButtonPanel.visible = false;
	    }  
	}

	var sortOrder_default = {

		'score': 0,
		'mvps': 0,
		'kills': 0,
		'assists': 0,
		'deaths': -1,           
		'leader': 0,
		'teacher': 0,
		'friendly': 0,
		'rank': 0,
		'idx': -1,
		                                                              
		                                                                	
		'money': 0,
		'hsp': 0,
		'kdr': 0,
		'adr':0,
		'utilitydamage': 0,
		'enemiesflashed' :0,
	};


	                            

	   	            
	   	           
	   	            
	   	              
	   	                       
	   	             
	   	               
	   	              
	   	           
	   	        

	     


	var sortOrder_dm = {

		'score': 0,
		'idx': -1,
		                                                              
		                                                                		
		'kills': 0,
		'assists': 0,
		'deaths': -1,           
		'rank': 0,
	}

	var sortOrder_gg = {

		'gglevel': 0,
		'ggleader': 0,
		'idx': -1,
		                                                              
		                                                                
		'score' : 0,
		'kills': 0,
		'assists': 0,
		'deaths': -1,           
	}


	                                                          
	  
	function _SortPlayer ( idx )
	{
		if ( _m_arrSortingPausedRefGetCounter != 0 )
			return;
		
		var oPlayer = _m_oPlayers.GetPlayerByIndex( idx );

		var elTeam = oPlayer.m_elTeam;
		if ( !elTeam || !elTeam.IsValid() )
			return;

		var elPlayer = oPlayer.m_elPlayer;

		if ( !elPlayer || !elPlayer.IsValid() )
			return;	
		

		                                     
		var children = elTeam.Children();
		for ( var i = 0; i < children.length; i++ )
		{
			                              
			if ( oPlayer.m_xuid === children[ i ].m_xuid )
				continue;

			var oCompareTargetPlayer = _m_oPlayers.GetPlayerByXuid( children[ i ].m_xuid );
			if ( !oCompareTargetPlayer )
				continue;

			for ( var stat in _m_sortOrder )
			{

				var p1stat;
				var p2stat;

				if ( _m_sortOrder[ stat ] === -1 )            
				{
					p2stat = Number( oPlayer.m_oStats[ stat ] );
					p1stat = Number( oCompareTargetPlayer.m_oStats[ stat ] );
				}
				else
				{
					p1stat = Number( oPlayer.m_oStats[ stat ] );
					p2stat = Number( oCompareTargetPlayer.m_oStats[ stat ] );
				}

				if ( ( p1stat > p2stat ) ||
						( ( p1stat != undefined ) && ( p2stat == undefined ) ) )
				{

					if ( children[ i - 1 ] != elPlayer )
					{
						elTeam.MoveChildBefore( elPlayer, children[ i ] );

					   	                                                             
					   		     
					   		      
					   		     
					   		        
					   		       
					   		                                                    
					   		     
					   		      
					   		     
					   		      
					      
					}

					return;
				}
				else if ( ( p1stat < p2stat ) ||
				( ( p1stat == undefined ) && ( p2stat != undefined ) ) )
				{

					                                                         
					   	     
					   	      
					   	     
					   	        
					   	       
					   	                                                    
					   	     
					   	      
					   	     
					   	      
					    

					break;
				}
			}
		}
	};

	function IsTeamASpecTeam ( teamname )
	{
		return (
			teamname === "Spectator" ||
			teamname == "Unassigned" ||
			teamname == "Unknown" ||
			teamname == "UNKNOWN TEAM" ||
			teamname === ""
		);
	}

	                                                
	function _UpdateAllStatsForPlayer ( idx, bSilent = false ) 
	{
		var oPlayer = _m_oPlayers.GetPlayerByIndex( idx );

		for ( var stat in _m_oUpdateStatFns )
		{

			if ( typeof ( _m_oUpdateStatFns[ stat ] ) === 'function' )
			{
				_m_oUpdateStatFns[ stat ]( oPlayer, bSilent );
			}
		}
	};


	                                                                          
	function _GenericUpdateStat ( oPlayer, stat, fnGetStat, bSilent = false, pulseDuration = 1.0 )
	{
		                                                  
		var elPanel = oPlayer.m_oElStats[ stat ];

		if ( !elPanel || !elPanel.IsValid() )
			return;
		
		var elLabel = elPanel.FindChildTraverse( 'label' );

		if ( !elLabel || !elLabel.IsValid() )
			return;

		var newStatValue = fnGetStat( oPlayer.m_xuid );
		if ( newStatValue !== oPlayer.m_oStats[ stat ] )
		{
			if ( !bSilent )
			{
				_Pulse( elLabel );
			}

			oPlayer.m_oStats[ stat ] = newStatValue;

			elLabel.text = newStatValue;
		}
	};

	function _GetMatchStatFn ( stat )
	{
		var _fn = function( xuid )
		{
			var oPlayer = _m_oPlayers.GetPlayerByXuid( xuid );
			var allstats = oPlayer.m_oMatchStats;

			if ( allstats )
				return ( allstats[ stat ] == -1 ) ? "-" : allstats[ stat ];
		}

		return _fn;
	}


	                                                            
	                                                                                   
	  
	function _CreateStatUpdateFn ( stat )
	{
		  		                                        
		var fn;

		var bUnhandled = false;

		switch ( stat ) 
		{
			case 'musickit':
				fn = function( oPlayer, bSilent = false )
				{

					if ( GameStateAPI.IsFakePlayer( oPlayer.m_xuid ) )
						return;
					
					var ownerXuid = oPlayer.m_xuid;
					var isLocalPlayer = oPlayer.m_xuid == GetLocalPlayerId();
					var isBorrowed = false;
					var borrowedXuid = 0;

					var borrowedPlayerIndex = parseInt( GameInterfaceAPI.GetSettingString( "cl_borrow_music_from_player_index" ) );

					if ( borrowedPlayerIndex != 0 && isLocalPlayer )
					{
						borrowedXuid = GameStateAPI.GetPlayerXuidStringFromEntIndex( borrowedPlayerIndex );

						if ( GameStateAPI.IsPlayerConnected( borrowedXuid ) )
						{
							ownerXuid = borrowedXuid;
							isBorrowed = true;
						}
					}	

					var newStatValue = InventoryAPI.GetMusicIDForPlayer( ownerXuid );

					if ( newStatValue !== oPlayer.m_oStats[ stat ] )
					{
						oPlayer.m_oStats[ stat ] = newStatValue;

						                                 
						if ( isLocalPlayer )
						{
							var elMusicKit = $( '#id-sb-meta__musickit' );

							if ( !elMusicKit || !elMusicKit.IsValid() )
								return;

							var isValidMusicKit = newStatValue > 0;
							elMusicKit.SetHasClass( 'hidden', !isValidMusicKit );
							if ( isValidMusicKit )
							{
								                          
								_m_cP.FindChildTraverse( "id-sb-meta__musickit-unborrow" ).SetHasClass( 'hidden', !isBorrowed );

								var imagepath = "file://{images_econ}/" + InventoryAPI.GetItemInventoryImageFromMusicID( newStatValue ) + ".png";
								$( '#id-sb-meta__musickit-image' ).SetImage( imagepath );
								$( '#id-sb-meta__musickit-name' ).text = $.Localize( InventoryAPI.GetMusicNameFromMusicID( newStatValue ) );
							}
						}
					}
					
					var elPlayer = oPlayer.m_elPlayer;
					if ( elPlayer && elPlayer.IsValid())
					{
						                                
						                     
						                                
						var elMusicKitIcon = elPlayer.FindChildTraverse( "id-sb-name__musickit" );
						if ( elMusicKitIcon && elMusicKitIcon.IsValid() )
						{
							elMusicKitIcon.SetHasClass( 'hidden', newStatValue <= 1 );
						}
					}
				}
				break;


			case 'teamname':
				fn = function( oPlayer, bSilent = false )
				{
					var newStatValue = GameStateAPI.GetPlayerTeamName( oPlayer.m_xuid );

					_ChangeTeams( oPlayer, newStatValue );
				}
				break;

			case 'ping':
				fn = function( oPlayer, bSilent )
				{
					var elPlayer = oPlayer.m_elPlayer;

					if ( !elPlayer || !elPlayer.IsValid() )
						return;
					
					var elPanel = oPlayer.m_oElStats[ stat ];
					if ( !elPanel || !elPanel.IsValid() )
						return;
					
					var elLabel = elPanel.FindChildTraverse( 'label' );
					if ( !elLabel )
						return;
		
					var szCustomLabel = _GetCustomStatTextValue( 'ping', oPlayer.m_xuid );
					elLabel.SetHasClass( "sb-row__cell--ping__label--bot", !!szCustomLabel );                                                          
					if ( szCustomLabel )
					{
						elLabel.text = $.Localize( szCustomLabel );
						oPlayer.m_oStats[ stat ] = szCustomLabel;                                                                                     
					}
					else
					{
						_GenericUpdateStat( oPlayer, stat, GameStateAPI.GetPlayerPing.bind( GameStateAPI ), true );
					}
					
					
				};
				break;

			case 'kills':
				fn = function( oPlayer, bSilent = false )
				{
					_GenericUpdateStat( oPlayer, stat, GameStateAPI.GetPlayerKills.bind( GameStateAPI ), bSilent, 10.0 );
				};
				break;

			case 'assists':
				fn = function( oPlayer, bSilent = false )
				{
					_GenericUpdateStat( oPlayer, stat, GameStateAPI.GetPlayerAssists.bind( GameStateAPI ), bSilent );
				};
				break;

			case 'deaths':
				fn = function( oPlayer, bSilent = false )
				{
					_GenericUpdateStat( oPlayer, stat, GameStateAPI.GetPlayerDeaths.bind( GameStateAPI ), bSilent );
				};
				break;

			case '3k':
			case '4k':
			case '5k':
			case 'adr':
			case 'hsp':
			case 'utilitydamage':
			case 'enemiesflashed':
				fn = function( oPlayer, bSilent = false )
				{
					_GenericUpdateStat( oPlayer, stat, _GetMatchStatFn( stat ), bSilent );
				};
				break;

			case 'kdr':
				fn = function( oPlayer, bSilent = false )
				{

					var kdr;

					if ( _m_overtime == 0 )
					{
						                                                                        
						                                                                    
						var kdrFn = _GetMatchStatFn( 'kdr' );
						kdr = kdrFn( oPlayer.m_xuid );

						if ( typeof kdr == "number" && kdr > 0 )
						{
							kdr = kdr / 100.0;
						}
					}
					else
					{
					  
					                                                                      
					                                                                 
					                                                                                                          
					  	
						var denom = oPlayer.m_oStats[ 'deaths' ] > 0 ? oPlayer.m_oStats[ 'deaths' ] : 1;
						kdr = oPlayer.m_oStats[ 'kills' ] / denom;
					}

					if ( typeof kdr == "number" )
					{
						kdr = kdr.toFixed( 2 );
					}
					
					_GenericUpdateStat( oPlayer, stat, () => { return kdr; }, bSilent );
				};
				break;

			case 'mvps':

				fn = function( oPlayer, bSilent = false )
				{

					var newStatValue = GameStateAPI.GetPlayerMVPs( oPlayer.m_xuid );
					if ( newStatValue !== oPlayer.m_oStats[ stat ] )
					{

						var elMVPPanel = oPlayer.m_oElStats[ stat ];
						if ( !elMVPPanel || !elMVPPanel.IsValid() )
							return;


						                        
						var elMVPStarImage = elMVPPanel.FindChildTraverse( 'star-image' );
						if ( !elMVPStarImage || !elMVPStarImage.IsValid() )
							return;
					
						                             
						var elMVPStarNumberLabel = elMVPPanel.FindChildTraverse( 'star-count' );
						if ( !elMVPStarNumberLabel || !elMVPStarNumberLabel.IsValid() )
							return;
					
						              

						oPlayer.m_oStats[ stat ] = newStatValue;

						var elMVPStarImage = elMVPPanel.FindChildTraverse( "star-image" );
						var elMVPStarNumberLabel = elMVPPanel.FindChildTraverse( "star-count" );

						elMVPStarImage.SetHasClass( 'hidden', newStatValue == 0 );
						elMVPStarNumberLabel.SetHasClass( 'hidden', newStatValue == 0 );

						elMVPStarNumberLabel.text = newStatValue;

						if ( !bSilent )
						{
							_Pulse( elMVPStarImage );
							_Pulse( elMVPStarNumberLabel );
						}
					}
				};
				break;

			case 'status':
				fn = function( oPlayer, bSilent )
				{
					var newStatValue = GameStateAPI.GetPlayerStatus( oPlayer.m_xuid );
					if ( newStatValue !== oPlayer.m_oStats[ stat ] )
					{
						oPlayer.m_oStats[ stat ] = newStatValue;

						var elPlayer = oPlayer.m_elPlayer;

						if ( !elPlayer || !elPlayer.IsValid() )
							return;
					
						elPlayer.SetHasClass( "sb-player-status-dead", newStatValue === 1 );
					
						var elPanel = oPlayer.m_oElStats[ stat ];
						if ( !elPanel || !elPanel.IsValid() )
							return;

						var elStatusImage = elPanel.FindChildTraverse( "image" );
						if ( !elStatusImage || !elStatusImage.IsValid() )
							return;
					
						                
						elStatusImage.SetImage( dictPlayerStatusImage[ newStatValue ] );
					}
				};
				break;

			case 'score':
				fn = function( oPlayer, bSilent = false )
				{
					_GenericUpdateStat( oPlayer, stat, GameStateAPI.GetPlayerScore.bind( GameStateAPI ) );
				};
				break;

			case 'money':
				fn = function( oPlayer, bSilent = false )
				{

					                                                  
					var elPanel = oPlayer.m_oElStats[ stat ];
					if ( !elPanel || !elPanel.IsValid() )
						return;

						                                                                             
						                                                                                           
						             
						
					var elLabel = elPanel.FindChildTraverse('label');
					if ( !elLabel || !elLabel.IsValid() )
						return;

					var newStatValue = GameStateAPI.GetPlayerMoney( oPlayer.m_xuid );

					oPlayer.m_oStats[ stat ] = newStatValue;

					if ( oPlayer.m_oStats[ stat ] >= 0 )
					{
						elLabel.text = "$" + newStatValue;
					}
					else
					{
						elLabel.text = "";
					}

				}
				break;

			case 'name':
				fn = function( oPlayer, bSilent = false )
				{
					if ( !oPlayer.m_elPlayer || !oPlayer.m_elPlayer.IsValid() )
						return;
					
					oPlayer.m_elPlayer.SetHasClass( "sb-row--localplayer", oPlayer.m_xuid === GetLocalPlayerId()  );

					                                                  
					var elPanel = oPlayer.m_oElStats[ stat ];
					if ( !elPanel || !elPanel.IsValid() )
						return;

					                                
					       
					                                
					var elNameLabel = elPanel.FindChildTraverse( "name" );
					if ( !elNameLabel || !elNameLabel.IsValid() )
						return;

					elNameLabel.SetDialogVariable( 'player_name', GameStateAPI.GetPlayerName( oPlayer.m_xuid ) );

					if ( GameStateAPI.GetPlayerClanTag( oPlayer.m_xuid ) != "" )
					{
						elNameLabel.SetDialogVariable( 'player_clan', GameStateAPI.GetPlayerClanTag( oPlayer.m_xuid ) );
						elNameLabel.text = "#Scoreboard_Player_Name_Clan";
					}
					else
					{
						elNameLabel.text = "#Scoreboard_Player_Name";
					}
				}
				break;
			
			case 'leader':
			case 'teacher':
			case 'friendly':
				fn = function( oPlayer, bSilent = false )
				{
					var newStatValue;

					if (  GameStateAPI.IsDemoOrHltv() || IsTeamASpecTeam( GameStateAPI.GetPlayerTeamName( GetLocalPlayerId() ) ) )
					return;
				
					if ( !GameStateAPI.IsXuidValid( oPlayer.m_xuid ) )
					{
						if ( 0 )                                                              
							newStatValue = oPlayer.m_xuid;
						else
							return;
					}
					else
					{
						switch (stat)
						{
							case 'leader': newStatValue = GameStateAPI.GetPlayerCommendsLeader( oPlayer.m_xuid ); break;
							case 'teacher': newStatValue = GameStateAPI.GetPlayerCommendsTeacher( oPlayer.m_xuid ); break;
							case 'friendly': newStatValue = GameStateAPI.GetPlayerCommendsFriendly( oPlayer.m_xuid ); break;
						}						
					}


							
					                        
					if ( oPlayer.m_oStats[ stat ] != newStatValue )
					{
						oPlayer.m_oStats[ stat ] = newStatValue;
			
						var  oTeam = _m_oTeams[ oPlayer.m_oStats[ 'teamname' ] ];
			
						if ( oTeam )
							oTeam.UpdateCommendForPlayer( oPlayer.m_xuid, stat, newStatValue );							
					}
				}
				break;

			case 'flair':
				fn = function( oPlayer, bSilent = false )
				{

					var newStatValue = InventoryAPI.GetFlairItemId( oPlayer.m_xuid );

					if ( oPlayer.m_oStats[ stat ] !== newStatValue )
					{
						oPlayer.m_oStats[ stat ] = newStatValue;

						var elPanel = oPlayer.m_oElStats[ stat ];
						if ( !elPanel || !elPanel.IsValid() )
							return;

						var elFlairImage = elPanel.FindChildTraverse( "image" );
						if ( !elFlairImage || !elFlairImage.IsValid() )
							return;

						var imagepath = InventoryAPI.GetFlairItemImage( oPlayer.m_xuid );

						elFlairImage.SetImage( 'file://{images_econ}' + imagepath + '_small.png' );
					}
				}
				break;

			case 'avatar':
				fn = function( oPlayer, bSilent = false )
				{

					var elPanel = oPlayer.m_oElStats[ stat ];
					if ( !elPanel || !elPanel.IsValid() )
						return;


					               
					  
					         
					var elAvatarImage = elPanel.FindChildTraverse( "image" );
					if ( !elAvatarImage || !elAvatarImage.IsValid() )
						return;

					         
					if ( GameStateAPI.IsXuidValid( oPlayer.m_xuid ) )
					{
						if ( elAvatarImage.steamid !== oPlayer.m_xuid )
							elAvatarImage.steamid = oPlayer.m_xuid;
					}
					else
					{
						var team = GameStateAPI.GetPlayerTeamName( oPlayer.m_xuid );

						                               
						if ( elAvatarImage.m_team != team )
						{
							elAvatarImage.RemoveClass( "sb-row__cell--avatar--" + elAvatarImage.m_team );
							elAvatarImage.AddClass( "sb-row__cell--avatar--" + team );

							elAvatarImage.m_team = team;
						}
					}
					                                                                         


					             
					  
					var elPlayerColor = elAvatarImage.FindChildTraverse( 'player-color' );
					if ( elPlayerColor && elPlayerColor.IsValid() )
					{
						var teamColor = GameStateAPI.GetPlayerColor( oPlayer.m_xuid );
						if ( teamColor !== "" )
						{
							elPlayerColor.style.borderColor = teamColor;
							elPlayerColor.RemoveClass( "hidden" );
						}
						else
						{
							if ( elPlayerColor && elPlayerColor.IsValid() )
								elPlayerColor.AddClass( "hidden" );
						}
					}
					                          

					             
					  
					var elAvatarMuteImage = elPanel.FindChildTraverse( "mute-image" );
					if ( elAvatarMuteImage && elAvatarMuteImage.IsValid() )
					{
						              
						var isMuted = GameStateAPI.IsSelectedPlayerMuted( oPlayer.m_xuid );
						oPlayer.m_isMuted = isMuted;
						
						var isEnemyTeamMuted = GameInterfaceAPI.GetSettingString( "cl_mute_enemy_team" ) == "1";
						var isEnemy = GameStateAPI.ArePlayersEnemies( oPlayer.m_xuid, GetLocalPlayerId() );

						elAvatarMuteImage.SetHasClass( 'hidden', !isMuted && !( isEnemy && isEnemyTeamMuted ) );

						       
						             
						                                                                            

						                                                              
						 
							                                      

							                   
							 
								                                               
								                                          
								                                                                   
							 
							    
							 
								                                                  
								                                       
							 
						 
						       

					}
				}
				break;


			case 'skillgroup':
				fn = function( oPlayer, bSilent = false )
				{
				
					var newStatValue = GameStateAPI.GetPlayerCompetitiveRanking( oPlayer.m_xuid );

					if ( ( newStatValue != -1 ) && ( oPlayer.m_oStats[ stat ] !== newStatValue ) )
					{

						oPlayer.m_oStats[ stat ] = newStatValue;

						var elPlayer = oPlayer.m_elPlayer;
						if ( elPlayer && elPlayer.IsValid() )
						{
							                                
							                     
							                                
							var elSkillGroupImage = elPlayer.FindChildTraverse( "id-sb-skillgroup-image" );
							if ( elSkillGroupImage && elSkillGroupImage.IsValid() )
							{
								var imagepath = "";

								if ( newStatValue > 0 )
								{
									var mode = GameStateAPI.GetGameModeInternalName( false );
									
									var imagePath = "skillgroup";

									if ( mode == "scrimcomp2v2" )
										imagePath = "wingman";
									
									imagepath = "file://{images}/icons/skillgroups/" + imagePath + newStatValue + ".svg";
									elSkillGroupImage.RemoveClass( "hidden" );
								}
								else
								{
									imagepath = "";
									elSkillGroupImage.AddClass( "hidden" );
								}
		
								elSkillGroupImage.SetImage( imagepath );								
							}
						}
					}
				}
				break;

			case 'rank':
				fn = function( oPlayer, bSilent = false )
				{
					var newStatValue = GameStateAPI.GetPlayerXpLevel( oPlayer.m_xuid );

					if ( ( newStatValue != -1 ) && ( oPlayer.m_oStats[ stat ] !== newStatValue ) )
					{
						oPlayer.m_oStats[ stat ] = newStatValue;

						var elPanel = oPlayer.m_oElStats[ stat ];
						if ( !elPanel || !elPanel.IsValid() )
							return;

						var elRankImage = elPanel.FindChildTraverse( 'image' );
						if ( !elRankImage || !elRankImage.IsValid() )
							return;

						var imagepath = "";

						if ( newStatValue > 0 )
						{
							var imagepath = "file://{images}/icons/xp/level" + newStatValue + ".png";
						}

						elRankImage.SetImage( imagepath );
					}
				}
				break;

			case 'ggleader':
				fn = function( oPlayer, bSilent = false )
				{
					var isGGLeader = GameStateAPI.GetTeamGungameLeaderXuid( oPlayer.m_oStats[ 'teamname' ] ) == oPlayer.m_xuid ? 1 : 0;

					_GenericUpdateStat( oPlayer, stat, () => { return isGGLeader; } );
				}
				break;

			case 'gglevel':
				fn = function( oPlayer, bSilent = false )
				{
					_GenericUpdateStat( oPlayer, stat, GameStateAPI.GetPlayerGungameLevel.bind( GameStateAPI ) );
				}
				break;


			default:
				                                        
				bUnhandled = true;
		}


		                                                                                     
		if ( !bUnhandled )
			_m_oUpdateStatFns[ stat ] = fn;
	}

	function _GetPlayerRowForGameMode ()
	{
		var mode = GameStateAPI.GetGameModeInternalName( false );
		var skirmish = GameStateAPI.GetGameModeInternalName( true );

		switch ( mode )
		{
			case "scrimcomp2v2":
				return "snippet_scoreboard-classic__row--wingman";
			
			case "competitive":
				return "snippet_scoreboard-classic__row--comp";

			case "gungameprogressive":            
				return "snippet_scoreboard__row--armsrace";

			case "training":
				return "snippet_scoreboard__row--training";
			
			case "deathmatch":
				return "snippet_scoreboard__row--deathmatch";

			case "gungametrbomb":
				return "snippet_scoreboard__row--demolition";

			       
			                
				                                           
			       

			case "casual":
				if ( skirmish == "flyingscoutsman" )
					return "snippet_scoreboard__row--demolition";
				else
					return "snippet_scoreboard-classic__row--casual";
				
			default:
				return "snippet_scoreboard-classic__row--casual";

		}

	}

	function _HighlightSortStatLabel ( stat )
	{
		                        
		_m_cP.FindChildrenWithClassTraverse( 'sb-row__cell' ).forEach( function( el )
		{
			if ( el && el.IsValid() )
			{
				if ( el.BHasClass( 'sb-row__cell--' + stat ) )
				{
					el.AddClass( 'sortstat' );
				}
				else
				{
					el.RemoveClass( 'sortstat' );
				}
			}
			
		} );
	}

	function _CreateLabelForStat ( stat, set )
	{
		var elLabelRow = $( "#id-sb-players-table__labels-row" );

		if ( !elLabelRow || !elLabelRow.IsValid() )
			return;

		var elLabelRowOrSet = elLabelRow;

		               
		if ( set !== "" )
		{

			              
			             
			  

			                    
			  				
			  				                              
			  				                              
			  				                              
			  								            
			  						                             
			  						                             
			  						                             
			  							                       
			  						                               
			  						                               
			  						                               
			  				

			                              
			var labelSetContainerId = "id-sb-row__set-container";

			var elLabelSetContainer = $( '#' + labelSetContainerId );
			if ( !elLabelSetContainer || !elLabelSetContainer.IsValid() )
			{
				elLabelSetContainer = $.CreatePanel( "Panel", elLabelRow, labelSetContainerId );
				elLabelSetContainer.BLoadLayoutSnippet( "snippet_sb-label-set-container" );

				                          
				if ( $( "#id-sb-row__set-container" ) )
				{
					$( "#id-sb-meta__cycle" ).RemoveClass( "hidden" );
				}
			}

			var elSetLabels = elLabelSetContainer.FindChildTraverse( "id-sb-row__sets" );

			                    
			var LabelSetId = "id-sb-labels-set-" + set;
			var elLabelSet = elSetLabels.FindChildTraverse( LabelSetId );
			if ( !elLabelSet || !elLabelSet.IsValid() )
			{
				_m_dataSetGetCount++;                                          

				                           
				elLabelSet = $.CreatePanel( "Panel", elSetLabels, LabelSetId );
				elLabelSet.AddClass( 'sb-row--labels' );
				elLabelSet.AddClass( 'sb-row__set' );
				elLabelSet.AddClass( 'no-hover' );

			}

			                                         
			                                           
			   	                                      

			                                                              

			elLabelRowOrSet = elLabelSet;

			                                          
			if ( set != _m_dataSetCurrent )
			{
				elLabelSet.AddClass( 'hidden' );
			}
		}

		                                                
		var elStatPanel = elLabelRowOrSet.FindChildInLayoutFile( "id-sb-" + stat );
		if ( !elStatPanel || !elStatPanel.IsValid() )
		{
			elStatPanel = $.CreatePanel( "Button", elLabelRowOrSet, "id-sb-" + stat );
			elStatPanel.AddClass( "sb-row__cell" );
			elStatPanel.AddClass( "sb-row__cell--" + stat );
			elStatPanel.AddClass( "sb-row__cell--label" );

			var elStatLabel;



			                                                           
			if ( stat === "ping" )
			{
				elStatLabel = $.CreatePanel( "Image", elStatPanel, "label-" + elStatPanel.id );
				elStatLabel.SetImage( "file://{images}/icons/ui/ping_4.svg" );
			}
			else
			{
				elStatLabel = $.CreatePanel( "Label", elStatPanel, "label-" + elStatPanel.id );
				elStatLabel.text = $.Localize( "#Scoreboard_" + stat );
			}

			                     

			var toolTipString = $.Localize( "#Scoreboard_" + stat + "_tooltip" );
			if ( toolTipString !== "" )
			{
				var OnMouseOver = function( _id, _tooltip )
				{
					UiToolkitAPI.ShowTextTooltip( _id, _tooltip );
				}

				elStatLabel.SetPanelEvent( 'onmouseover', OnMouseOver.bind( undefined, elStatLabel.id, toolTipString ) );
				elStatLabel.SetPanelEvent( 'onmouseout', function() { UiToolkitAPI.HideTextTooltip() } );
			}

			function _SetNewSortStat ( stat )
			{
				var newSortOrder = {};

				                                              
				var modeDefaultSortOrder = _GetSortOrderForMode( GameStateAPI.GetGameModeInternalName( false ) );

				                                             
				                                 
				if ( stat in modeDefaultSortOrder )
					newSortOrder[ stat ] = modeDefaultSortOrder[ stat ];
				else
					return;
				
				_HighlightSortStatLabel( stat );

				                                 
				for ( var s in modeDefaultSortOrder )
				{
					if ( s == stat )
						continue;
					
					newSortOrder[ s ] = modeDefaultSortOrder[ s ];
				}

				                                        
				_m_sortOrder = newSortOrder;

				                                
				for ( var i = 0; i < _m_oPlayers.GetCount(); i++ )
				{
					_SortPlayer( i, true );
				};

			}

			elStatPanel.SetPanelEvent( 'onactivate', _SetNewSortStat.bind( undefined, stat ) );

		}
	}

	                              
	function _GetCustomStatTextValue( stat, xuid )
	{
		var szCustomLabel = null;
		if ( stat === 'ping' )
		{
			if ( GameStateAPI.IsFakePlayer( xuid ) )
			{
				szCustomLabel = "#SFUI_scoreboard_lbl_bot";
			}
			else if ( IsTeamASpecTeam( GameStateAPI.GetPlayerTeamName( xuid ) ) )
			{
				szCustomLabel = "#SFUI_scoreboard_lbl_spec";
			}
		}
		return szCustomLabel;
	}

	                      
	function _NewPlayerPanel ( oPlayer )
	{
		if ( !oPlayer.m_elTeam || !oPlayer.m_elTeam.IsValid() )
			return undefined;
		
		oPlayer.m_elPlayer = $.CreatePanel( "Panel", oPlayer.m_elTeam, "player-" + oPlayer.m_xuid );

		oPlayer.m_elPlayer.m_xuid = oPlayer.m_xuid;                                                          

		_Helper_LoadSnippet( oPlayer.m_elPlayer, _GetPlayerRowForGameMode() );

		function _InitStatCell ( elStatCell, oPlayer )
		{
			if ( !elStatCell || !elStatCell.IsValid() )
				return;
			
			var stat = elStatCell.GetAttributeString( "data-stat", "" );
			var set = elStatCell.GetAttributeString( "data-set", "" );

			                                                         
			var children = elStatCell.Children();
			for ( var i = 0; i < children.length; i++ )
			{
				_InitStatCell( children[ i ], oPlayer );
			}

			if ( stat === "" )
			{
				return;
			}

			                                    
			oPlayer.m_oElStats[ stat ] = elStatCell;

			elStatCell.AddClass( "sb-row__cell" );
			elStatCell.AddClass( "sb-row__cell--" + stat );

			             
			   
			if ( set !== "" )
			{
				                              
				var SetContainerId = "id-sb-row__set-container";

				var elSetContainer = oPlayer.m_elPlayer.FindChildTraverse( SetContainerId );
				if ( !elSetContainer || !elSetContainer.IsValid() )
				{
					elSetContainer = $.CreatePanel( "Panel", oPlayer.m_elPlayer, SetContainerId );
					oPlayer.m_elPlayer.MoveChildBefore( elSetContainer, elStatCell );
				}

				                    
				var setId = "id-sb-set-" + set;
				var elSet = elSetContainer.FindChildTraverse( setId );
				if ( !elSet || !elSet.IsValid )
				{
					                           
					elSet = $.CreatePanel( "Panel", elSetContainer, setId );
					elSet.AddClass( 'sb-row__set' );
					elSet.AddClass( 'no-hover' );
				}

				                           
				elStatCell.SetParent( elSet );

				                                          
				if ( set != _m_dataSetCurrent )
				{
					elSet.AddClass( 'hidden' );
				}
			}

			_CreateStatUpdateFn( stat );

		}

		                                                                
		_CreateStatUpdateFn( 'teamname' );
		_CreateStatUpdateFn( 'musickit' );
		_CreateStatUpdateFn( 'status' );
		_CreateStatUpdateFn( 'skillgroup' );

		_CreateStatUpdateFn( 'leader' );
		_CreateStatUpdateFn( 'teacher' );
		_CreateStatUpdateFn( 'friendly' );

		                     
		                                     
		                                      
		  
		var elStatCells = oPlayer.m_elPlayer.Children();
		var cellCount = elStatCells.length;

		for ( var i = 0; i < cellCount; i++ )
		{
			_InitStatCell( elStatCells[ i ], oPlayer );
		}

		                  

		oPlayer.m_oStats = {};                       

		oPlayer.m_oStats[ 'idx' ] = GameStateAPI.GetPlayerIndex( oPlayer.m_xuid );

		               

		oPlayer.m_elPlayer.SetPanelEvent( 'onmouseover', function()
		{
			_m_arrSortingPausedRefGetCounter++;
		} );

		oPlayer.m_elPlayer.SetPanelEvent( 'onmouseout', function()
		{
			_m_arrSortingPausedRefGetCounter--;
		} );

		if ( GameStateAPI.IsXuidValid( oPlayer.m_xuid ) )
		{
			oPlayer.m_elPlayer.SetPanelEvent( 'onactivate', function()
			{

				_m_arrSortingPausedRefGetCounter++;

				var elPlayerCardContextMenu = UiToolkitAPI.ShowCustomLayoutContextMenuParametersDismissEvent(
					'',
					'',
					'file://{resources}/layout/context_menus/context_menu_playercard.xml',
					'xuid=' + oPlayer.m_xuid,
					_OnPlayerCardDismiss.bind( undefined )
				)

				elPlayerCardContextMenu.AddClass( "ContextMenu_NoArrow" );
				if ( !_m_hDenyInputToGame )
				{
					_m_hDenyInputToGame = UiToolkitAPI.AddDenyMouseInputToGame( elPlayerCardContextMenu, "ScoreboardPlayercard" );
				}

			} );
		}

		return oPlayer.m_elPlayer;
	};

	function _OnPlayerCardDismiss ()
	{
		_m_arrSortingPausedRefGetCounter--;
		if ( _m_hDenyInputToGame )
		{
			UiToolkitAPI.ReleaseDenyMouseInputToGame( _m_hDenyInputToGame );
			_m_hDenyInputToGame = null;
		}
	}

	       
	                                     
	 
		                                          
			       

		                                                                          
		 
			         
				                                                                                        
				                                                                                           
				                                                                                           
				      

			         
				                                                                                           
				                                                                                        
				                                                                                           
				      

			         
				                                                                                           
				                                                                                           
				                                                                                        
				      
		 
	 
	       

	       
	                                
	 
		                                                                          

		                            
	 
	       



	function _UpdateMatchInfo ()
	{

		if ( !_m_bInit )
			return;
		
		                                            


		_m_cP.SetDialogVariable( "server_name", GameStateAPI.GetServerName() );
		_m_cP.SetDialogVariable( "map_name", GameStateAPI.GetMapName() );
		_m_cP.SetDialogVariable( "gamemode_name", GameStateAPI.GetGameModeName( true ) );
		_m_cP.SetDialogVariable( "tournament_stage", GameStateAPI.GetTournamentEventStage() );

		var elMapLabel = _m_cP.FindChildTraverse( "id-sb-meta__labels__mode-map" );

		if ( elMapLabel && elMapLabel.IsValid() && elMapLabel.text == "" )
		{
			if ( MatchStatsAPI.IsTournamentMatch() )
			{
				elMapLabel.text = $.Localize( "{s:tournament_stage} | {s:map_name}", _m_cP );
			}
			else
			{
				elMapLabel.text =  $.Localize( "{s:gamemode_name} | {s:map_name}", _m_cP );
			}
		}

		if ( $( "#id-sb-meta__mode__image" ) )
		    $( "#id-sb-meta__mode__image" ).SetImage( GameStateAPI.GetGameModeImagePath() );

		if ( $( "#sb-meta__labels__map" ) )
			$( "#sb-meta__labels__map" ).SetImage( "file://{images}/map_icons/map_icon_" + GameStateAPI.GetMapBSPName() + ".svg" );

		       
		                            
		       

		if ( !GameStateAPI.IsDemoOrHltv() )
		{
			var localTeamName = GameStateAPI.GetPlayerTeamName( GetLocalPlayerId() );
			if ( _m_oTeams[ localTeamName ] )
				_m_oTeams[ localTeamName ].CalculateAllCommends();
		}

		                    

		var bind = GameInterfaceAPI.GetSettingString( "cl_scoreboard_mouse_enable_binding" );

		                                                                                 
		if ( bind.charAt( 0 ) == '+' || bind.charAt( 0 ) == '-' )
			bind = bind.substring( 1 );
	
		
		var elMouseBinding = _m_cP.FindChildInLayoutFile( "id-sb-mouse-instructions" );
		if ( elMouseBinding && elMouseBinding.IsValid() )
		{
			bind = "{v:csgo_bind:bind_" + bind + "}";

			bind = $.Localize( bind, elMouseBinding );
	
			elMouseBinding.SetDialogVariable( "scoreboard_mouse_enable_bind", bind );
			elMouseBinding.text =  $.Localize( "#Scoreboard_Mouse_Enable_Instruction", elMouseBinding );
		}


		var elFooterWebsite = _m_cP.FindChildInLayoutFile( "id-sb-footer-server-website" );
		if ( elFooterWebsite && elFooterWebsite.IsValid() )
		{
			var strWebsiteURL = MatchStatsAPI.GetServerWebsiteURL();
			if ( strWebsiteURL )
			{
				elFooterWebsite.RemoveClass( 'hidden' );

				elFooterWebsite.SetPanelEvent( 'onmouseover', function() {
					UiToolkitAPI.ShowTextTooltip( 'id-sb-footer-server-website', strWebsiteURL );
				} );
				elFooterWebsite.SetPanelEvent( 'onmouseout', function () {
					UiToolkitAPI.HideTextTooltip();
				} );
			}
			else
			{
				elFooterWebsite.AddClass( 'hidden' );
			}
		}
	}

	function _UpdateHLTVViewerNumber( nViewers )
	{

		var elViewers = _m_cP.FindChildTraverse( "id-viewers" );

		if ( elViewers && elViewers.IsValid() )
		{
			if ( nViewers > 0 )
			{
				elViewers.RemoveClass( "hidden" );
				elViewers.SetDialogVariableInt( "viewers", nViewers )
			}
			else
			{
				elViewers.AddClass( "hidden" );
			}
		}
	}

	function _UpdateRound ( rnd, oScoreData, jsoTime )
	{
		if ( !_SupportsTimeline( jsoTime ) )
			return;
		
		if ( !oScoreData )
			return;
		
		if ( !jsoTime )
			return;
			
		if ( !( "teamdata" in oScoreData ) )
			return;

		var elTimeline = _m_cP.FindChildInLayoutFile( "id-sb-timeline__segments" );
		if ( !elTimeline || !elTimeline.IsValid() )
			return;

		var elRnd = elTimeline.FindChildTraverse( rnd );
		if ( !elRnd || !elRnd.IsValid() )
			return;

		var elRndTop = elRnd.FindChildTraverse( "id-sb-timeline__segment__round--top" );
		var elRndBot = elRnd.FindChildTraverse( "id-sb-timeline__segment__round--bot" );

		var elTick = elRnd.FindChildTraverse( "id-sb-timeline__segment__round__tick" );
		elTick.SetHasClass( "hilite", rnd <= jsoTime[ "rounds_played" ] + 1 );
		
		                                                                               
		if ( rnd > jsoTime[ "rounds_played" ] )
		{
			elRndBot.FindChildTraverse( "result" ).SetImage( "" );
			elRndBot.FindChildTraverse( "result" ).RemoveClass( "sb-timeline__segment__round--active" );

			elRndTop.FindChildTraverse( "result" ).SetImage( "" );
			elRndTop.FindChildTraverse( "result" ).RemoveClass( "sb-timeline__segment__round--active" );
			
			elRnd.FindChildTraverse( "id-sb-timeline__segment__round__tick" ).RemoveClass( "sb-team--CT" );
			elRnd.FindChildTraverse( "id-sb-timeline__segment__round__tick__label" ).RemoveClass( "sb-team--CT" );
			elRnd.FindChildTraverse( "id-sb-timeline__segment__round__tick" ).RemoveClass( "sb-team--TERRORIST" );
			elRnd.FindChildTraverse( "id-sb-timeline__segment__round__tick__label" ).RemoveClass( "sb-team--TERRORIST" );

			var _ClearCasualties = function( elRnd )
			{

				for ( var i = 1; i <= 5; i++ )
				{
					var img = elRnd.FindChildTraverse( "casualty-" + i );
					if ( !img )
						break;

					img.AddClass( "hidden" );
				}
				
			}

			_ClearCasualties( elRndTop );
			_ClearCasualties( elRndBot );
			

			return;
		}

		if ( GameStateAPI.AreTeamsPlayingSwitchedSides() !== GameStateAPI.AreTeamsPlayingSwitchedSidesInRound( rnd ) )
		{
			var elTemp = elRndTop;
			elRndTop = elRndBot;
			elRndBot = elTemp;
		}

		                      
		elRndTop.AddClass( "sb-team--CT" );
		elRndBot.AddClass( "sb-team--TERRORIST" );

		var idx;

		if ( MatchStatsAPI.DoesSupportOvertimeStats() )
		{
			idx = rnd - jsoTime[ "first_round_this_period" ] + 1;
		}
		else
		{
			idx = rnd;
		}


		if ( typeof oScoreData[ "rounddata" ][ idx ] !== "object" )
			return;

		var result = oScoreData[ "rounddata" ][ idx ][ "result" ].replace( /^(ct_|t_)/, "" );

		                
		if ( oScoreData[ "rounddata" ][ idx ][ "result" ].charAt( 0 ) === "c" )
		{
			elRndTop.FindChildTraverse( "result" ).SetImage( dictRoundResultImage[ result ] );
			elRndTop.FindChildTraverse( "result" ).AddClass( "sb-timeline__segment__round--active" );

			elRndBot.FindChildTraverse( "result" ).SetImage( "" );
			elRndBot.FindChildTraverse( "result" ).RemoveClass( "sb-timeline__segment__round--active" );

			elRnd.FindChildTraverse( "id-sb-timeline__segment__round__tick" ).AddClass( "sb-team--CT" );
			elRnd.FindChildTraverse( "id-sb-timeline__segment__round__tick__label" ).AddClass( "sb-team--CT" );
			elRnd.FindChildTraverse( "id-sb-timeline__segment__round__tick" ).RemoveClass( "sb-team--TERRORIST" );
			elRnd.FindChildTraverse( "id-sb-timeline__segment__round__tick__label" ).RemoveClass( "sb-team--TERRORIST" );

		}
		else if ( oScoreData[ "rounddata" ][ idx ][ "result" ].charAt( 0 ) === "t" )
		{
			elRndBot.FindChildTraverse( "result" ).SetImage( dictRoundResultImage[ result ] );
			elRndBot.FindChildTraverse( "result" ).AddClass( "sb-timeline__segment__round--active" );

			elRndTop.FindChildTraverse( "result" ).SetImage( "" );
			elRndTop.FindChildTraverse( "result" ).RemoveClass( "sb-timeline__segment__round--active" );			

			elRnd.FindChildTraverse( "id-sb-timeline__segment__round__tick" ).AddClass( "sb-team--TERRORIST" );
			elRnd.FindChildTraverse( "id-sb-timeline__segment__round__tick__label" ).AddClass( "sb-team--TERRORIST" );
			elRnd.FindChildTraverse( "id-sb-timeline__segment__round__tick" ).RemoveClass( "sb-team--CT" );
			elRnd.FindChildTraverse( "id-sb-timeline__segment__round__tick__label" ).RemoveClass( "sb-team--CT" );
		}

		                                             
		var _UpdateCasualties = function( teamName, elRnd )
		{

			if ( _m_oTeams[ teamName ] )
			{
				var livingCount = oScoreData[ "rounddata" ][ idx ][ "players_alive_" + teamName ];

				var nPlayers = 5;

				if ( GameStateAPI.GetGameModeInternalName( false ) == "scrimcomp2v2" )
					nPlayers = 2;

				for ( var i = 1; i <= nPlayers; i++ )
				{
					var img = elRnd.FindChildTraverse( "casualty-" + i );
					if ( !img )
						break;

					img.RemoveClass( "hidden" );

					if ( i > livingCount )
					{
						img.AddClass( "dead-casualty" );
					}
					else
					{
						img.RemoveClass( "dead-casualty" );
					}
				}
			}
		}

		             

		_UpdateCasualties( "CT", elRndTop );
		_UpdateCasualties( "TERRORIST", elRndBot );

	}


	function _ShowSurvivors ( hide = false )
	{
		
		var elTimeline = _m_cP.FindChildInLayoutFile( "id-sb-timeline__segments" );
		if ( !elTimeline || !elTimeline.IsValid() )
			return;

		var arrPanelsToToggleTransparency = [];

		function CollectPanelsToToggleTransparency ( el )
		{
			if ( !el || !el.IsValid() )
				return;
			
			if ( el.Children() )
				el.Children().forEach( CollectPanelsToToggleTransparency );

			if ( el.GetAttributeString( "data-casualty-mouse-over-toggle-transparency", "false" ) == "true" )
				arrPanelsToToggleTransparency.push( el );
		}

		elTimeline.Children().forEach( CollectPanelsToToggleTransparency );

		arrPanelsToToggleTransparency.forEach( el => el.SetHasClass( "transparent", hide ) );
	}


	function _Casualties_OnMouseOver ()
	{
		                                    
		if ( GameInterfaceAPI.GetSettingString( "cl_scoreboard_survivors_always_on" ) == "0" )
			_ShowSurvivors();

		UiToolkitAPI.ShowCustomLayoutTooltipStyled( '1', 'id-tooltip-sb-casualties', 'file://{resources}/layout/tooltips/tooltip_scoreboard_casualties.xml', 'Tooltip_NoArrow' );
	}

	function _Casualties_OnMouseOut ()
	{
		                                    
		if ( GameInterfaceAPI.GetSettingString( "cl_scoreboard_survivors_always_on" ) == "0" )
			_ShowSurvivors( true );

		UiToolkitAPI.HideCustomLayoutTooltip( 'id-tooltip-sb-casualties' );
	}


	function _UpdateTeamInfo ( team )
	{

		if ( !(team in _m_oTeams) )
		{
			_m_oTeams[ team ] = new team_t( team );
		}	

		       
		_m_oTeams[ team ].m_teamClanName = GameStateAPI.GetTeamClanName( team );
		_m_cP.SetDialogVariable( "sb_team_name--" + team, _m_oTeams[ team ].m_teamClanName );

		if ( GameStateAPI.GetTeamLogoImagePath( team ) != "" )
		{
			       
			_m_oTeams[ team ].m_teamLogoImagePath = GameStateAPI.GetTeamLogoImagePath( team );

			_m_cP.FindChildrenWithClassTraverse( "sb-team-logo-background--" + team ).forEach( function( el )
			{
				el.style.backgroundImage = 'url("file://{images}' + _m_oTeams[ team ].m_teamLogoImagePath + '")';
				el.AddClass( "sb-team-logo-bg" );
			} );
		}

		          

		_m_cP.SetDialogVariableInt( team + '_alive', GameStateAPI.GetTeamLivingPlayerCount( team ) );
		_m_cP.SetDialogVariableInt( team + '_total', GameStateAPI.GetTeamTotalPlayerCount( team ) );

	}
	function _UpdateTeams ()
	{
		var oScoreData = GameStateAPI.GetScoreDataJSO();

		                        
		for ( var team in _m_oTeams )
		{
			_UpdateTeamInfo( team );
			        

			if ( !oScoreData || !( "teamdata" in oScoreData ) || !( team in oScoreData[ "teamdata" ] ) )
				continue;

			                                                                                
			                                       

			if ( team in oScoreData[ "teamdata" ] )
			{
				_m_cP.SetDialogVariableInt( "sb_team_score--" + team, oScoreData[ "teamdata" ][ team ][ "score" ] );
			}

			if ( "score_1h" in oScoreData[ "teamdata" ][ team ] )
			{
				_m_cP.SetDialogVariableInt( "sb_team_score_2--" + team, oScoreData[ "teamdata" ][ team ][ "score_1h" ] );
			}

			if ( "score_2h" in oScoreData[ "teamdata" ][ team ] )
			{
				_m_cP.SetDialogVariableInt( "sb_team_score_3--" + team, oScoreData[ "teamdata" ][ team ][ "score_2h" ] );
			}

			if ( "score_ot" in oScoreData[ "teamdata" ][ team ] )
			{
				_m_cP.SetDialogVariableInt( "sb_team_score_ot--" + team, oScoreData[ "teamdata" ][ team ][ "score_ot" ] );
			}

			var elOTScore = _m_cP.FindChildTraverse( "id-sb-timeline__score_ot" )
			if ( elOTScore && elOTScore.IsValid() )
			{
				elOTScore.SetHasClass( "hidden", !( "score_ot" in oScoreData[ "teamdata" ][ team ] ) );
				elOTScore.SetHasClass( "fade", !( "score_ot" in oScoreData[ "teamdata" ][ team ] ) );
			}

		}
	}

	function _InitClassicTeams ()
	{
		_UpdateTeamInfo( "TERRORIST" );
		_UpdateTeamInfo( "CT" );
	}

	function _UpdateAllRounds ()
	{
		var jsoTime = GameStateAPI.GetTimeDataJSO();
		var oScoreData = GameStateAPI.GetScoreDataJSO();

		if ( !jsoTime )
			return;
		
		if ( !oScoreData )
			return;
		
		if ( !_SupportsTimeline( jsoTime ) )
			return;
		
		var lastRound;

		if ( MatchStatsAPI.DoesSupportOvertimeStats() )
		{
			lastRound = jsoTime[ "last_round_this_period" ];
		}
		else
		{
			lastRound = jsoTime[ "maxrounds" ];
		}

		for ( var rnd = 1; rnd <= lastRound; rnd++ )
		{
			_UpdateRound( rnd, oScoreData, jsoTime );
		}
	}

	function _UpdateScore_Classic( bForceUpdate = false )
	{

		                                                                                    
		if ( Object.keys( _m_oTeams ).length === 0 )
		{
			_InitClassicTeams();
		}	

		_UpdateTeams();


		             
		var jsoTime = GameStateAPI.GetTimeDataJSO();

		if ( !jsoTime )
			return;
		
		var currentRound = jsoTime[ "rounds_played" ] + 1;

		_m_overtime = jsoTime[ "overtime" ];

		_m_cP.SetDialogVariable( "match_phase", $.Localize( "gamephase_" + jsoTime[ "gamephase" ] ) );
		_m_cP.SetDialogVariable( "rounds_remaining", jsoTime[ "rounds_remaining" ] );
		_m_cP.SetDialogVariableInt( "scoreboard_ot", jsoTime[ "overtime" ] );

		_m_cP.SetHasClass( "sb-tournament-match", MatchStatsAPI.IsTournamentMatch() );

		                                                                                               
			
		var bResetTimeline = bForceUpdate;

		if ( _m_maxRounds != jsoTime[ "maxrounds_this_period" ] )
		{
			bResetTimeline = true;
			_m_maxRounds = jsoTime[ "maxrounds_this_period" ];
		}
		
		if ( _m_areTeamsSwapped !== GameStateAPI.AreTeamsPlayingSwitchedSides() )
		{
			bResetTimeline = true;
			_m_areTeamsSwapped = GameStateAPI.AreTeamsPlayingSwitchedSides();
		}

		if ( !_SupportsTimeline( jsoTime ) )
		{
			bResetTimeline = true;
		}

		                               
		if ( bResetTimeline || !( currentRound in _m_RoundUpdated ) )
		{

			if ( bResetTimeline )
			{
				_ResetTimeline();
			}

			_UpdateAllRounds();

			_m_RoundUpdated[ currentRound ] = true;

		}
		else
		{
			                                            

			var oScoreData = GameStateAPI.GetScoreDataJSO();

			if ( oScoreData )
			{
				_UpdateRound( currentRound - 1, oScoreData, jsoTime );
			}
		}
		
	};

	function _InsertTimelineDivider ()
	{
		var elTimeline = _m_cP.FindChildInLayoutFile( "id-sb-timeline__segments" );

		if ( !elTimeline || !elTimeline.IsValid() )
			return;

		var elDivider = $.CreatePanel( "Panel", elTimeline, "id-sb-timeline__divider" );
		elDivider.AddClass( "sb-timeline__divider" );
	}


	function _InitTimelineSegment ( startRound, endRound, phase )
	{
		var elTimeline = _m_cP.FindChildInLayoutFile( "id-sb-timeline__segments" );

		if ( !elTimeline || !elTimeline.IsValid() )
			return;

		elTimeline.AddClass( "sb-team-tint" );                                                                       

		var id = "id-sb-timeline__segment--" + phase;

		var elSegment = elTimeline.FindChildTraverse( id );

		if ( !elSegment || !elSegment.IsValid() )
		{
			elSegment = $.CreatePanel( "Panel", elTimeline, id );
			elSegment.BLoadLayoutSnippet( "snippet_scoreboard-classic__timeline__segment");
		}

		var elRoundContainer = elSegment.FindChildTraverse( "id-sb-timeline__round-container" );
		if ( elRoundContainer && elRoundContainer.IsValid() )
		{
			                    
			for ( var rnd = startRound; rnd <= endRound; rnd++ )
			{
				var elRnd = elSegment.FindChildTraverse( rnd );
				if ( !elRnd || !elRnd.IsValid() )
				{
					elRnd = $.CreatePanel( "Panel", elRoundContainer, rnd );

					elRnd.BLoadLayoutSnippet( "snippet_scoreboard-classic__timeline__segment__round" );

					var elTop = elRnd.FindChildTraverse( "id-sb-timeline__segment__round--top" );
					elTop.BLoadLayoutSnippet( "snippet_scoreboard-classic__timeline__segment__round__data" );

					var elBot = elRnd.FindChildTraverse( "id-sb-timeline__segment__round--bot" );
					elBot.BLoadLayoutSnippet( "snippet_scoreboard-classic__timeline__segment__round__data" );

					                                 
					if ( rnd % 5 == 0 )
					{
						elRnd.FindChildTraverse( "id-sb-timeline__segment__round__tick__label" ).text = rnd;
					}
				}
			}
		}

		                                  
		if ( GameStateAPI.AreTeamsPlayingSwitchedSides() !== GameStateAPI.AreTeamsPlayingSwitchedSidesInRound( endRound ) )
		{
			var elCTScore = elSegment.FindChildTraverse( "id-sb-timeline__segment__score__ct" );
			var elTScore = elSegment.FindChildTraverse( "id-sb-timeline__segment__score__t" );

			if ( elCTScore && elCTScore.IsValid() )
			{
				elCTScore.RemoveClass( "sb-color--CT" );
				elCTScore.AddClass( "sb-color--TERRORIST" );
			}

			if ( elTScore && elTScore.IsValid() )
			{
				elTScore.RemoveClass( "sb-color--TERRORIST" );
				elTScore.AddClass( "sb-color--CT" );
			}
		}
	};

	function _SupportsTimeline ( jsoTime )
	{
		if ( jsoTime == undefined )
			jsoTime = GameStateAPI.GetTimeDataJSO();

		var roundCountToEvaluate;

		if ( MatchStatsAPI.DoesSupportOvertimeStats() )
		{
			roundCountToEvaluate = jsoTime[ "maxrounds_this_period" ];
		}
		else
		{
			roundCountToEvaluate = jsoTime[ "maxrounds" ];

		}
		
		return ( roundCountToEvaluate <= 30 );
	}

	function _ResetTimeline ()
	{
		                                      

		var elTimeline = _m_cP.FindChildInLayoutFile( "id-sb-timeline__segments" );

		if ( !elTimeline || !elTimeline.IsValid() )
			return;

		                     
		elTimeline.RemoveAndDeleteChildren();

		var jsoTime = GameStateAPI.GetTimeDataJSO();
		if ( !jsoTime )
			return;
		
		if ( !_SupportsTimeline( jsoTime ) )
			return;
		

		                                           

		var firstRound;
		var lastRound;
		var midRound; 

		if ( MatchStatsAPI.DoesSupportOvertimeStats() )
		{
			firstRound = jsoTime[ "first_round_this_period" ];
			lastRound = jsoTime[ "last_round_this_period" ];	
			
			var elLabel = _m_cP.FindChildTraverse( "id-sb-timeline__round-label" );
			if ( elLabel && elLabel.IsValid() )
			{
				elLabel.SetHasClass( 'hidden', jsoTime[ "overtime" ] == 0 );
			}
		}
		else
		{
			firstRound = 1;
			lastRound = jsoTime[ "maxrounds" ];
		}

		midRound = firstRound + Math.ceil( ( lastRound - firstRound ) / 2 ) - 1; 	

		
		if ( GameStateAPI.HasHalfTime() )
		{
			_InitTimelineSegment( firstRound, midRound, "first-half" );
			_InsertTimelineDivider();
			_InitTimelineSegment( midRound + 1, lastRound, "second-half" );

		}
		else                     
		{
			_InitTimelineSegment( firstRound, lastRound, "no-halves" );
		}

		_UpdateAllRounds();

		if ( GameInterfaceAPI.GetSettingString( "cl_scoreboard_survivors_always_on" ) == "1" )
			_ShowSurvivors();
	};

	function _UnborrowMusicKit ()
	{
		GameInterfaceAPI.SetSettingString( "cl_borrow_music_from_player_index", "0" );

		var oLocalPlayer = _m_oPlayers.GetPlayerByXuid( GetLocalPlayerId() );
		_m_oUpdateStatFns[ 'musickit' ]( oLocalPlayer, true );
	}

	function UpdateCasterButtons()
	{
	    for ( var i = 0; i < 4; i++ )
	    {
	        var buttonName = "#spec-button" + (i+1);
	        var bActive = true;

	        switch ( i )
	        {
	            default:
	            case 0:
	                bActive = !!GetCasterIsCameraman(); break;

	            case 1:
	                bActive = !!GetCasterIsHeard(); break;

	            case 2:
	                bActive = !!GetCasterControlsXray(); break;

	            case 3:
	                bActive = !!GetCasterControlsUI(); break;
	        }

	        ToggleCasterButtonActive( buttonName, bActive );
	    }
	}

	function ToggleCasterButtonActive( buttonName, bActive )
	{
	    var button = $( buttonName );
	    if ( button == null )
	        return;

	    if ( bActive == false && button.BHasClass( 'sb-spectator-control-button-notactive' ) == false )
	    {
	        button.AddClass( 'sb-spectator-control-button-notactive' );
	    }
	    else if ( bActive == true && button.BHasClass( 'sb-spectator-control-button-notactive' ) == true )
	    {
	        button.RemoveClass( 'sb-spectator-control-button-notactive' );
	    }
	}


	function _ToggleSetCasterIsCameraman( val )
	{
	    $.DispatchEvent( 'PlaySoundEffect', 'generic_button_press', 'MOUSE' );

	    var nCameraMan = parseInt( GameInterfaceAPI.GetSettingString( "spec_autodirector_cameraman" ) );
	    if ( GetCasterIsCameraman() )
	    {
	        GameStateAPI.SetCasterIsCameraman( 0 );
	    }
	    else
	    {
	        GameStateAPI.SetCasterIsCameraman( nCameraMan );
	    }	    

	    UpdateCasterButtons();
	}

	function _ToggleSetCasterIsHeard( val )
	{
	    $.DispatchEvent( 'PlaySoundEffect', 'generic_button_press', 'MOUSE' );

	    var nCameraMan = parseInt( GameInterfaceAPI.GetSettingString( "spec_autodirector_cameraman" ) );
	    if ( GetCasterIsHeard() )
	    {
	        GameStateAPI.SetCasterIsHeard( 0 );
	    }
	    else
	    {
	        GameStateAPI.SetCasterIsHeard( nCameraMan );
	    }

	    UpdateCasterButtons();
	}

	function _ToggleSetCasterControlsXray( val )
	{
	    $.DispatchEvent( 'PlaySoundEffect', 'generic_button_press', 'MOUSE' );

	    var nCameraMan = parseInt( GameInterfaceAPI.GetSettingString( "spec_autodirector_cameraman" ) );
	    if ( GetCasterControlsXray() )
	    {
	        GameStateAPI.SetCasterControlsXray( 0 );
	        ToggleCasterButtonActive( "#spec-button3", false );
	    }
	    else
	    {
	        GameStateAPI.SetCasterControlsXray( nCameraMan );
	        ToggleCasterButtonActive( "#spec-button3", true );
	    }    
	}

	function _ToggleSetCasterControlsUI( val )
	{
	    $.DispatchEvent( 'PlaySoundEffect', 'generic_button_press', 'MOUSE' );

	    var nCameraMan = parseInt( GameInterfaceAPI.GetSettingString( "spec_autodirector_cameraman" ) );
	    if ( GetCasterControlsUI() )
	    {
	        GameStateAPI.SetCasterControlsUI( 0 );
	    }
	    else
	    {
	        GameStateAPI.SetCasterControlsUI( nCameraMan );
	    } 

	    UpdateCasterButtons();
	}

	                                                
	function _CycleStats ()
	{

		if ( _m_dataSetGetCount === 0 )
			return;

		{
			_m_dataSetCurrent++;

			if ( _m_dataSetCurrent >= _m_dataSetGetCount )
				_m_dataSetCurrent = 0;
		}

		         

		var elLabelSets = $( "#id-sb-row__sets" );

		for ( var i = 0; i < elLabelSets.Children().length; i++ )
		{
			var elChild = elLabelSets.Children()[ i ];

			if ( elChild.id == "id-sb-labels-set-" + _m_dataSetCurrent )
			{
				elChild.RemoveClass( 'hidden' );
			}
			else
			{
				elChild.AddClass( 'hidden' );
			}
		}

		          

		for ( var i = 0; i < _m_oPlayers.GetCount(); i++ )
		{
			var elPlayer = _m_oPlayers.GetPlayerByIndex( i ).m_elPlayer;

			if ( elPlayer && elPlayer.IsValid() )
			{
				var elSetContainer = elPlayer.FindChildTraverse( "id-sb-row__set-container" );
				if ( elSetContainer && elSetContainer.IsValid() )
				{
					for ( var j = 0; j < elSetContainer.Children().length; j++ )
					{
						var elChild = elSetContainer.Children()[ j ];
	
						if ( elChild.id == "id-sb-set-" + _m_dataSetCurrent )
						{
							elChild.RemoveClass( 'hidden' );
						}
						else
						{
							elChild.AddClass( 'hidden' );
						}
					}
				}
			}	
		}
	}

	function _CreateLabelsForRow ( el )
	{
		if ( !el || !el.IsValid() )
			return;
			
		for ( var i = 0; i < el.Children().length; i++ )
		{
			_CreateLabelsForRow( el.Children()[ i ] );
		}

		var stat = el.GetAttributeString( "data-stat", "" );
		var set = el.GetAttributeString( "data-set", "" );

		if ( stat != "" )
			_CreateLabelForStat( stat, set );
		
	}


	function _GetSortOrderForMode ( mode )
	{
		switch ( mode )
		{
			       
			                
				                          
			       

			case "gungameprogressive":            
				return sortOrder_gg;

			case "deathmatch":
				return sortOrder_dm;

			default:
				return sortOrder_default;
		}	
	}
	                                                
	function _Initialize ()
	{
		                                   

		_Reset();

		var jsoTime = GameStateAPI.GetTimeDataJSO();
		if ( !jsoTime )
			return;
		
		var scoreboardTemplate;

		var mode = GameStateAPI.GetGameModeInternalName( false );
		var skirmish = GameStateAPI.GetGameModeInternalName( true );

		switch ( mode )
		{
			case "competitive":
			case "gungametrbomb":
			case "scrimcomp2v2":
				scoreboardTemplate = "snippet_scoreboard-classic--with-timeline--half-times";
				break;
			
			case "training":
			case "deathmatch":
			case "gungameprogressive":
				scoreboardTemplate = "snippet_scoreboard--no-teams";
				break;

			       		
			                
				                                                    
				      
			       	

			case "casual":
				if ( skirmish == "flyingscoutsman" )
				{
					scoreboardTemplate = "snippet_scoreboard-classic--with-timeline--no-half-times";
				}
				else
				{
					scoreboardTemplate = "snippet_scoreboard-classic--no-timeline";
				}
				break;
			
			default:
				scoreboardTemplate = "snippet_scoreboard-classic--no-timeline";
				break;
		}

		_Helper_LoadSnippet( _m_cP, scoreboardTemplate );


		                                                                               
		  
		  
		if ( GameStateAPI.IsDemoOrHltv() )
			_m_cP.AddClass( "IsDemoOrHltv" );
		
		if ( MatchStatsAPI.IsTournamentMatch() )
			_m_cP.AddClass( "IsTournamentMatch" );
		
		
		                                          

		_m_sortOrder = _GetSortOrderForMode( GameStateAPI.GetGameModeInternalName( false ) );


		             

		var temp = $.CreatePanel( "Panel", _m_cP, "temp" );
		_Helper_LoadSnippet( temp, _GetPlayerRowForGameMode() );
		temp.visible = false;

		_CreateLabelsForRow( temp );

		temp.DeleteAsync( .0 );

		_ResetTimeline();

		_m_bInit = true;

		_UpdateMatchInfo();
	};

	function _RankRevealAll ()
	{
		for ( var i = 0; i < _m_oPlayers.GetCount(); i++ )
		{
			var oPlayer = _m_oPlayers.GetPlayerByIndex( i );

			if ( typeof ( _m_oUpdateStatFns[ 'skillgroup' ] ) === 'function' )
				_m_oUpdateStatFns[ 'skillgroup' ]( oPlayer, true );
		}

	}

	function _UpdateScore ( bForce ) 
	{
		switch ( GameStateAPI.GetGameModeInternalName( false ) )
		{
			case "competitive":
				_UpdateScore_Classic( bForce );
				break;

			       		
			                
			       
			case "deathmatch":
			case "gungameprogressive":
				               
				break;

			default:
			case "casual":
				_UpdateScore_Classic( bForce );
				break;
		}
	};

	function _UpdateJob () 
	{
		_UpdateMatchInfo();
		_UpdateScore();
		_UpdateNextPlayer();
	};

	function _UpdateEverything ()
	{

		if ( !_m_bInit )
		{
			_Initialize();
		}

		_UpdateMatchInfo();
		_UpdateScore( true );
		_UpdateAllPlayers_delayed( true );
		_UpdateSpectatorButtons();

	};

	function _CancelUpdateJob ()
	{

		if ( _m_schedUpdateJob )
		{
			$.CancelScheduled( _m_schedUpdateJob );
			_m_schedUpdateJob = false;
		}
	};

	function _OnMouseActive ()
	{
		var elButtonPanel = _m_cP.FindChildTraverse( 'id-sb-meta__button-panel' );
		if ( elButtonPanel && elButtonPanel.IsValid() )
			elButtonPanel.RemoveClass( "hidden" );
	}

	function _OnMouseInactive ()
	{
		var elButtonPanel = _m_cP.FindChildTraverse( 'id-sb-meta__button-panel' );
		if ( elButtonPanel && elButtonPanel.IsValid() )
			elButtonPanel.AddClass( "hidden" );
	}

	                                                
	function _CloseScoreboard ()
	{
		if( _m_updatePlayerHandler )
		{
			$.UnregisterForUnhandledEvent( "Scoreboard_UpdatePlayerByEntIndex", _m_updatePlayerHandler );
			_m_updatePlayerHandler = null;
		}

		_CancelUpdateJob();

		_m_cP.FindChildrenWithClassTraverse( "timer" ).forEach( el => el.active = false );

		                               
		$.DispatchEvent( 'DismissAllContextMenus' );

		_OnMouseInactive();
	};

	                                                
	function _OpenScoreboard ()
	{
		_UpdateEverything();

		_m_cP.FindChildrenWithClassTraverse( "timer" ).forEach( el => el.active = true );

		_ShowSurvivors( ( GameInterfaceAPI.GetSettingString( "cl_scoreboard_survivors_always_on" ) == "0" ) );

		if( !_m_updatePlayerHandler )
		{
			_m_updatePlayerHandler = $.RegisterForUnhandledEvent( "Scoreboard_UpdatePlayerByEntIndex", Scoreboard.UpdatePlayerByEntIndex );
		}
	};

	                                                

	function _OnEndOfMatch ()
	{
		_Initialize();
		_OpenScoreboard();
	};

	function _GetFreeForAllTopThreePlayers ( winner )
	{
		_UpdateEverything();

		var elTeam = _m_cP.FindChildInLayoutFile( "players-table-ANY" );

		if ( elTeam && elTeam.IsValid() )
		{
			var playerXuid_1 = elTeam.Children()[ 0 ] ? elTeam.Children()[ 0 ].m_xuid : '0';
			var playerXuid_2 = elTeam.Children()[ 1 ] ? elTeam.Children()[ 1 ].m_xuid : '0';
			var playerXuid_3 = elTeam.Children()[ 2 ] ? elTeam.Children()[ 2 ].m_xuid : '0';

			$.DispatchEvent( 'EndOfMatch_GetFreeForAllTopThreePlayers_Response', playerXuid_1, playerXuid_2, playerXuid_3 );
		}
		else
		{
			$.DispatchEvent( 'EndOfMatch_GetFreeForAllTopThreePlayers_Response', 0, 0, 0 );
		}	

	};

	function _GetFreeForAllPlayerPosition ( xuid )
	{
		_UpdateEverything();

		var elTeam = _m_cP.FindChildInLayoutFile( "players-table-ANY" );
		if ( !elTeam || !elTeam.IsValid() )
			return;

		var returnVal = 0;

		for ( var i = 0; i < elTeam.Children().length; i++ )
		{
			if ( elTeam.Children()[ i ].m_xuid == xuid )
				returnVal = i + 1;
		}

		$.DispatchEvent( 'EndOfMatch_GetFreeForAllPlayerPosition_Response', returnVal );

	}

	function GetCasterIsCameraman()
	{
	    var nCameraMan = parseInt( GameInterfaceAPI.GetSettingString( "spec_autodirector_cameraman" ) );

	    var bQ = ( GameStateAPI.IsDemoOrHltv() && nCameraMan != 0 && GameStateAPI.IsHLTVAutodirectorOn() )

	    return bQ;
	}

	function GetCasterIsHeard()
	{
	    var bQ = false;

	    if ( GameStateAPI.IsDemoOrHltv() )
	    {
	        var bVoiceCaster = parseInt( GameInterfaceAPI.GetSettingString( "voice_caster_enable" ) );
	        bQ = bVoiceCaster;
	    }

	    return bQ;
	}

	function GetCasterControlIsDisabled()
	{
	    var bDisableWithControl = parseInt( GameInterfaceAPI.GetSettingString( "spec_cameraman_disable_with_user_control" ) );

	    var bQ = ( GameStateAPI.IsDemoOrHltv() && bDisableWithControl && GameStateAPI.IsHLTVAutodirectorOn() == false );

	    return bQ;
	}

	function GetCasterControlsXray()
	{
	    var bXRay = GameStateAPI.IsDemoOrHltv() && parseInt( GameInterfaceAPI.GetSettingString( "spec_cameraman_xray" ) );

	    return bXRay;
	}

	function GetCasterControlsUI()
	{
	    var bSpecCameraMan = parseInt( GameInterfaceAPI.GetSettingString( "spec_cameraman_ui" ) );

	    var bQ = ( GameStateAPI.IsDemoOrHltv() && bSpecCameraMan );

	    return bQ;
	}

	                      
	return {
		OpenScoreboard: 					_OpenScoreboard,
		CloseScoreboard: 					_CloseScoreboard,
		UpdateMatchInfo: 					_UpdateMatchInfo,
		UpdatePlayerByEntIndex: 			_UpdatePlayerByEntIndex_delayed,
		UpdateEverything: 					_UpdateEverything,
		ResetAndInit: 						_Initialize,
		Casualties_OnMouseOver: 			_Casualties_OnMouseOver,
		Casualties_OnMouseOut: 				_Casualties_OnMouseOut,
		UpdateJob:							_UpdateJob,
		CycleStats: 						_CycleStats,
		OnMouseActive: 						_OnMouseActive,
		OnEndOfMatch: 						_OnEndOfMatch,
		GetFreeForAllTopThreePlayers: 		_GetFreeForAllTopThreePlayers,
		GetFreeForAllPlayerPosition: 		_GetFreeForAllPlayerPosition,
		UnborrowMusicKit: 					_UnborrowMusicKit,

		
		UpdateHLTVViewerNumber:				_UpdateHLTVViewerNumber,

		ToggleSetCasterIsCameraman:         _ToggleSetCasterIsCameraman,
		ToggleSetCasterIsHeard:             _ToggleSetCasterIsHeard,
		ToggleSetCasterControlsXray:        _ToggleSetCasterControlsXray,
		ToggleSetCasterControlsUI:          _ToggleSetCasterControlsUI,

		       
		                                
		       

		RankRevealAll:						_RankRevealAll,

	};


} )();


                                                                                                    
                                           
                                                                                                    
( function()
{
	$.RegisterForUnhandledEvent( "OnOpenScoreboard", Scoreboard.OpenScoreboard );
	$.RegisterForUnhandledEvent( "OnCloseScoreboard", Scoreboard.CloseScoreboard );


	$.RegisterForUnhandledEvent( "GameState_OnLevelLoad", Scoreboard.ResetAndInit );
	$.RegisterForUnhandledEvent( "Scoreboard_ResetAndInit", Scoreboard.ResetAndInit );

	$.RegisterForUnhandledEvent( "Scoreboard_UpdateEverything", Scoreboard.UpdateEverything );

	$.RegisterForUnhandledEvent( "Scoreboard_UpdateJob", Scoreboard.UpdateJob );

	$.RegisterForUnhandledEvent( "Scoreboard_CycleStats", Scoreboard.CycleStats );

	$.RegisterForUnhandledEvent( "Scoreboard_OnMouseActive", Scoreboard.OnMouseActive );

	$.RegisterForUnhandledEvent( "Scoreboard_OnEndOfMatch", Scoreboard.OnEndOfMatch );

	$.RegisterForUnhandledEvent( "Scoreboard_GetFreeForAllTopThreePlayers", Scoreboard.GetFreeForAllTopThreePlayers );
	$.RegisterForUnhandledEvent( "Scoreboard_GetFreeForAllPlayerPosition", Scoreboard.GetFreeForAllPlayerPosition );

	$.RegisterForUnhandledEvent( "Scoreboard_UnborrowMusicKit", Scoreboard.UnborrowMusicKit );

	$.RegisterForUnhandledEvent( "Scoreboard_ToggleSetCasterIsCameraman", Scoreboard.ToggleSetCasterIsCameraman );
	$.RegisterForUnhandledEvent( "Scoreboard_ToggleSetCasterIsHeard", Scoreboard.ToggleSetCasterIsHeard );
	$.RegisterForUnhandledEvent( "Scoreboard_ToggleSetCasterControlsXray", Scoreboard.ToggleSetCasterControlsXray );
	$.RegisterForUnhandledEvent( "Scoreboard_ToggleSetCasterControlsUI", Scoreboard.ToggleSetCasterControlsUI );

	       
	                                                                                      
	       

	$.RegisterForUnhandledEvent( "GameState_RankRevealAll", Scoreboard.RankRevealAll );

	$.RegisterForUnhandledEvent( "Scoreboard_UpdateHLTVViewers", Scoreboard.UpdateHLTVViewerNumber );

	$.RegisterForUnhandledEvent( "Scoreboard_Casualties_OnMouseOver", Scoreboard.Casualties_OnMouseOver );
	$.RegisterForUnhandledEvent( "Scoreboard_Casualties_OnMouseOut", Scoreboard.Casualties_OnMouseOut );

} )();
