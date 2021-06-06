'use strict';


var EOM_Characters = ( function()
{
	var _m_cP = $.GetContextPanel();

	var _m_freeze_time = 7;

	var _m_arrAllPlayersMatchDataJSO = [];

	var _m_localPlayer;
	var _m_teamToShow;

	const ACCOLADE_START_TIME = 2.2;

	                                 
	const DELAY_PER_PLAYER = 1.0;
	const UNFREEZE_TIME = 1.6;

	var m_bNoGimmeAccolades = false;                                              

	function _GetSnippetForMode ( mode )
	{
		switch ( mode )
		{
			case "scrimcomp2v2":
				return "snippet-eom-chars__layout--scrimcomp2v2";

			case "competitive":
			case "casual":
			case "gungametrbomb":
			case "cooperative":
				return "snippet-eom-chars__layout--classic";

			case "gungameprogressive":            
			case "training":
			case "deathmatch":
				return "snippet-eom-chars__layout--ffa";

			default:
				return "snippet-eom-chars__layout--classic";
		}
	}

	function _SetMainTeamLogo ( teamName )
	{
		var elRoot = $( '#id-eom-characters-root' );

		var myTeamLogoPath = "file://{images}/icons/ui/" + ( teamName == "CT" ? "ct_logo_1c.svg" : "t_logo_1c.svg" );
		var elMyTeamLogo = elRoot.FindChildTraverse( "id-eom-chars__layout__logo--myteam" );

		if ( elMyTeamLogo )
		{
			elMyTeamLogo.SetImage( myTeamLogoPath );
		}
	}

	function _SetTeamLogo ( team )
	{
		var elRoot = $( '#id-eom-characters-root' );

		var teamLogoPath = "file://{images}/icons/ui/" + ( team == "ct" ? "ct_logo_1c.svg" : "t_logo_1c.svg" );
		var elTeamLogo = elRoot.FindChildTraverse( "id-eom-chars__layout__logo--" + team );

		if ( elTeamLogo )
		{
			elTeamLogo.SetImage( teamLogoPath );
		}
	}

	function _SetupPanel ( mode )
	{
		var elRoot = $( '#id-eom-characters-root' );

		var snippet = _GetSnippetForMode( mode );

		elRoot.BLoadLayoutSnippet( snippet );

		_SetMainTeamLogo( _m_teamToShow );

		_SetTeamLogo( 't' );
		_SetTeamLogo( 'ct' );

	}

	function _CollectPlayersForMode ( mode )
	{
		var arrPlayerList = [];

		switch ( mode )
		{
			case "competitive":
			case "casual":
			case "gungametrbomb":
			case "cooperative":
			default:
				{
					arrPlayerList = _CollectPlayersOfTeam( _m_teamToShow );
					arrPlayerList = arrPlayerList.sort( _SortByScoreFn );
					m_bNoGimmeAccolades = false;
					break;
				}

			case "deathmatch":
			case "gungameprogressive":            
				{
					var arrPlayerXuids = Scoreboard.GetFreeForAllTopThreePlayers();
					if ( MockAdapter.GetMockData() != undefined )
					{
						arrPlayerXuids = [ "1", "2", "3" ];
					}

					                                                                  
					arrPlayerList[ 0 ] = _m_arrAllPlayersMatchDataJSO.filter( o => o[ 'xuid' ] == arrPlayerXuids[ 0 ] )[ 0 ];
					arrPlayerList[ 1 ] = _m_arrAllPlayersMatchDataJSO.filter( o => o[ 'xuid' ] == arrPlayerXuids[ 1 ] )[ 0 ];
					arrPlayerList[ 2 ] = _m_arrAllPlayersMatchDataJSO.filter( o => o[ 'xuid' ] == arrPlayerXuids[ 2 ] )[ 0 ];
					
					m_bNoGimmeAccolades = true;

					break;
				}

			case "training":
			case "scrimcomp2v2":
				{
					var listCT = _CollectPlayersOfTeam( "CT" ).slice( 0, 2 );
					var listT = _CollectPlayersOfTeam( "TERRORIST" ).slice( 0, 2 );

					arrPlayerList = listCT.concat( listT );

					m_bNoGimmeAccolades = false;

					break;
				}
		}

		if ( arrPlayerList )
			arrPlayerList = arrPlayerList.slice( 0, _GetNumCharsToShowForMode( mode ) );

		return arrPlayerList;
	}

	function _CollectPlayersMatchingXuids ( arrXuids )
	{
		return _m_arrAllPlayersMatchDataJSO.filter( o => arrXuids.includes(  o[ 'xuid' ] ) );
	}

	function _CollectPlayersOfTeam ( teamName )
	{
		var teamNum = 0;
		switch ( teamName )
		{
			case "TERRORIST":
				teamNum = 2;
				break;

			case "CT":
				teamNum = 3;
				break;

		}

		return _m_arrAllPlayersMatchDataJSO.filter( o => o[ 'teamnumber' ] == teamNum );

	}


	function _GetNumCharsToShowForMode ( mode )
	{
		switch ( mode )
		{
			case "scrimcomp2v2":
				return 4;

			case "competitive":
				return 5;

			case "casual":
			case "gungametrbomb":
				return 7;

			case "cooperative":
				return 2;

			case "gungameprogressive":            
			case "deathmatch":
				return 3;

			case "training":
				return 1;

			default:
				return 6;

		}
	}

	function _AddModeSpecificSettings ( mode, settings, index, arrPlayerList )
	{
		switch ( mode )
		{
			case "scrimcomp2v2":
				var zDepth = 1;
				break;

			case "competitive":
			case "casual":
			case "gungametrbomb":
			default:
				var zDepth = Math.abs( Math.floor( arrPlayerList.length / 2 ) - index );

				break;

			case "cooperative":
				var zDepth = 0;
				break;

			case "gungameprogressive":            
			case "deathmatch":
			case "training":
				var positions = [ 1, 0, 2 ];
				var zDepth = positions[ index ];
				break;

		}

		settings[ 'cameraPreset' ] = 10 + zDepth;
		settings[ 'panelPosition' ] = -zDepth;
	}

	function _ShouldDisplayCommendsInMode ( mode )
	{
		if ( MyPersonaAPI.GetElevatedState() !== "elevated" )
		{
			return false; 
		}
		
		switch ( mode )
		{
			case "scrimcomp2v2":
			case "competitive":
			case "casual":
			case "gungametrbomb":
			case "cooperative":
				return true;

			case "gungameprogressive":            
			case "deathmatch":
			case "training":
			default:
				return false;
		}
	}

	var _DisplayMe = function()
	{
		var elRoot = $( "#id-eom-characters-root" );

		var data = MockAdapter.GetAllPlayersMatchDataJSO();

		if ( data && data.allplayerdata && data.allplayerdata.length > 0 )
		{
			_m_arrAllPlayersMatchDataJSO = data.allplayerdata;
		}
		else
		{
			EndOfMatch.ToggleBetweenScoreboardAndCharacters();                      
			return false;
		}

		EndOfMatch.EnableToggleBetweenScoreboardAndCharacters();

		var localPlayerSet = _m_arrAllPlayersMatchDataJSO.filter( oPlayer => oPlayer[ 'xuid' ] == MockAdapter.GetLocalPlayerXuid() );
		var localPlayer = ( localPlayerSet.length > 0 ) ? localPlayerSet[ 0 ] : undefined;

		var teamNumToShow = 3;

		if ( localPlayer )
		{
			_m_localPlayer = localPlayer;
			teamNumToShow = _m_localPlayer[ 'teamnumber' ];
		}
		else
		{
			var oMatchEndData = MockAdapter.GetMatchEndWinDataJSO();
			if ( oMatchEndData )
				teamNumToShow = oMatchEndData[ "winning_team_number" ];
		}

		if ( teamNumToShow == 2 )
		{
			_m_teamToShow = "TERRORIST";
		}
		else if ( teamNumToShow == 3 )
		{
			_m_teamToShow = "CT";
		}

		var mode = MockAdapter.GetGameModeInternalName( false );

		_SetupPanel( mode );

		var arrPlayerList = _CollectPlayersForMode( mode );
		arrPlayerList = _SortPlayers( mode, arrPlayerList );

		_m_freeze_time = arrPlayerList.length + 2;

		var elCLU = elRoot.FindChildTraverse( "id-eom-characters__player-container" );

		var oSettings =
		{
			'numCharacters': arrPlayerList.length,
			'characterShowDelay': DELAY_PER_PLAYER,
			'displayCommendButton': _ShouldDisplayCommendsInMode( mode ),
		}

		CharacterLineUp.Init( elCLU, oSettings );

		                        
		var mapCheers = {};                                          

		                                           
		if ( _m_localPlayer )
		{
			var arrLocalPlayer = _m_localPlayer[ 'items' ].filter( oItem => ItemInfo.IsCharacter( oItem[ 'itemid' ] ) );
			var localPlayerModel = arrLocalPlayer.length > 0 ? arrLocalPlayer[0] : "";	
			var localPlayerCheer = localPlayerModel ? ItemInfo.GetDefaultCheer( localPlayerModel[ 'itemid'] ) : "";
			mapCheers[ localPlayerCheer ] = 1;
		}

		arrPlayerList.forEach( function( oPlayer, index )
		{
			if ( oPlayer )
			{
				var settings =
				{
					display_immediately: false,                                                         
					cameraPreset: 10,
				}

				var cheer = "";

				if ( 'items' in oPlayer )
				{
					var playerModelItem = oPlayer[ 'items' ].filter( oItem => ItemInfo.IsCharacter( oItem[ 'itemid' ] ) )[ 0 ];
					cheer = playerModelItem ? ItemInfo.GetDefaultCheer( playerModelItem[ 'itemid' ] ) : "";

					if ( oPlayer != _m_localPlayer &&
						mapCheers[ cheer ] == 1 )                                         
					{
						cheer = "";
					}

					mapCheers[ cheer ] = 1;
				}

				settings.arrModifiers = [ cheer ];
				settings.activity = cheer == "" ? 'ACT_CSGO_UIPLAYER_WALKUP' : 'ACT_CSGO_UIPLAYER_CELEBRATE';

				_AddModeSpecificSettings( mode, settings, index, arrPlayerList );

				var label = oPlayer[ 'xuid' ];

				CharacterLineUp.AddPlayer( elCLU, label, oPlayer, settings );

				var elCharacter = CharacterLineUp.GetPlayerPanel( elCLU, label );
				elCharacter.AddClass( 'darkmodel' );
			}

		} );

		CharacterLineUp.DisplayAll( elCLU );

		                                                         

		_ApplyAccolades( elCLU, arrPlayerList, m_bNoGimmeAccolades );

		return true;
	}

	function _ApplyAccolades ( elCLU, arrPlayerList, bNoGimmes )
	{
		if ( !arrPlayerList || arrPlayerList.length == 0 )
			return 0;

		var index = 0;

		arrPlayerList.forEach( function( oPlayer ) 
		{
			if ( !oPlayer )
				return;
			
			var elCharacter = CharacterLineUp.GetPlayerPanel( elCLU, oPlayer[ 'xuid' ] );

			var oTitle = oPlayer[ 'nomination' ];                                         

			if ( oTitle == undefined )
			{
				                                                                                     
			}
			else
			{
				var accoladeName = GameStateAPI.GetAccoladeLocalizationString( Number( oTitle[ 'eaccolade' ] ) );
				var value = oTitle[ 'value' ].toString();
				var pos = oTitle[ 'position' ].toString();
				var xuid = oPlayer[ 'xuid' ];

				                                                                                       

				index = arrPlayerList.indexOf( oPlayer );

				var elAccolade = undefined;

				if ( !( bNoGimmes && accoladeName.includes( "gimme_" ) ) )
				{
					elAccolade = $.CreatePanel( "Panel", _m_cP, "id-accolade-" + xuid );
					elAccolade.BLoadLayoutSnippet( "snippet-eom-chars__accolade" );

					  			                                                                         

					elAccolade.SetParent( elCharacter );

					elAccolade.SetDialogVariable( "eom-accolade-the", $.Localize( "accolade_the" ) );

					                                                                                                                                       
					if ( !isNaN( Number( value ) ) )
					{
						value = String( Math.floor( Number( value ) ) );
					}

					elAccolade.SetDialogVariable( "eom-accolade-value-string", value );
					elAccolade.SetDialogVariableTime( "eom-accolade-value-time", Number( value ) );
					elAccolade.SetDialogVariableInt( "eom-accolade-value-int", Number( value ) );

					var secondPlaceSuffix = ( pos != '1' ) ? '_2' : "";
					elAccolade.SetDialogVariable( "eom-accolade-title", $.Localize( "accolade_" + accoladeName + secondPlaceSuffix ) );
					elAccolade.SetDialogVariable( "eom-accolade-desc", $.Localize( "accolade_" + accoladeName + "_desc" + secondPlaceSuffix, elAccolade ) );

					                                                  
					if ( arrPlayerList.length > 5 )
					{
						elAccolade.AddClass( "small" );
					}

				}
			}

			function _DisplayAccolade ( panel, charPanel, index )
			{
				if ( !charPanel || !charPanel.IsValid() )
				{
					          
					                                                      
					                                       
					 
						              
					    
					                  
					          
					return;
				}

				if ( panel && panel.IsValid() )
					panel.AddClass( 'reveal' );

				                                          
				if ( !$.GetContextPanel().BAscendantHasClass( 'scoreboard-visible' ) )
				{
					$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.stats_reveal', 'MOUSE' );
				}
				charPanel.AddClass( 'brightmodel' );

				$.Schedule( 0.1, _ =>
				{
					if ( charPanel && charPanel.IsValid() )
					{
						charPanel.FindChildTraverse( "id-charlineup__model-preview-panel" ).TriggerSlowmo( _m_freeze_time - 1.5 * ( index * DELAY_PER_PLAYER ), UNFREEZE_TIME );
					}
				} );

				  				                                   

			}

			$.Schedule( ACCOLADE_START_TIME + ( index * DELAY_PER_PLAYER ), _DisplayAccolade.bind( undefined, elAccolade, elCharacter, index ) );
			  			                                                                                              
		} )
	}

	function _SortByTeamFn ( a, b )
	{
		var team_a = Number( a[ 'teamnumber' ] );
		var team_b = Number( b[ 'teamnumber' ] );

		var index_a = Number( a[ 'entindex' ] );
		var index_b = Number( b[ 'entindex' ] );

		if ( team_a != team_b )
		{
			return team_b - team_a;
		}
		else
		{
			return index_a - index_b;
		}
	}

	function _SortByScoreFn ( a, b )
	{
		var score_a = MockAdapter.GetPlayerScore( a[ 'xuid' ] );
		var score_b = MockAdapter.GetPlayerScore( b[ 'xuid' ] );

		var index_a = Number( a[ 'entindex' ] );
		var index_b = Number( b[ 'entindex' ] );

		if ( score_a != score_b )
		{
			return score_b - score_a;
		}
		else
		{
			return index_a - index_b;
		}
	}

	function _ReorderForPodium ( arrPlayerList )
	{
		var pos2 = arrPlayerList[ 1 ];
		arrPlayerList[ 1 ] = arrPlayerList[ 0 ];
		arrPlayerList[ 0 ] = pos2;
	}

	function _SortPlayers ( mode, arrPlayerList )
	{
		var midpoint;

		switch ( mode )
		{
			case "scrimcomp2v2":
				arrPlayerList.sort( _SortByTeamFn );
				break;

			case "competitive":
			case "casual":
			case "gungametrbomb":
				if ( _m_localPlayer )
				{
					                                         
					midpoint = Math.floor( arrPlayerList.length / 2 );
					arrPlayerList = arrPlayerList.filter( player => player[ 'xuid' ] != _m_localPlayer[ 'xuid' ] );
					arrPlayerList.splice( midpoint, 0, _m_localPlayer );
				}
				break;

			case "gungameprogressive":            
			case "deathmatch":
				_ReorderForPodium( arrPlayerList );
				break;

			default:
				break;

		}

		return arrPlayerList;
	}

	function _Start () 
	{
		_DisplayMe();
	}

	                      
	return {
		Start: _Start,
	};
} )();


                                                                                                    
                                           
                                                                                                    
( function()
{
} )();
