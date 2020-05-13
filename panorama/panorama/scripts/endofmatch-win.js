'use strict';

var dictRoundResultImage = {
	"win_elimination"	: "file://{images}/icons/ui/elimination.svg",	
	"win_rescue"		: "file://{images}/icons/ui/rescue.svg", 			
	"win_defuse"		: "file://{images}/icons/equipment/defuser.svg",
	"win_time"			: "file://{images}/icons/ui/timer.svg",		
	"win_bomb"			: "file://{images}/icons/ui/bomb.svg",
};

var EOM_Win = ( function () {


	var _m_pauseBeforeEnd = 7.0;
	var _m_cP = $.GetContextPanel();

                                                     

	var _m_arrTopPlayerXuid = [];
	var _m_localPlayerScoreboardPosition;

	var _m_oMatchEndData = {};
	var _m_oScoreData = {};
	var _m_oTime = {};
	var _m_oResults = {};

	function _GetFreeForAllTopThreePlayers_Response( first, second, third )
	{
		_m_arrTopPlayerXuid[ 0 ] = first;
		_m_arrTopPlayerXuid[ 1 ] = second;
		_m_arrTopPlayerXuid[ 2 ] = third;

		_SetPlayerWinners();
	}	

	function _GetFreeForAllPlayerPosition_Response( pos )
	{
		_m_localPlayerScoreboardPosition = pos;
	}

	function _SetVictoryStatement()
	{
		var _m_oScoreData = GameStateAPI.GetScoreDataJSO();

		if ( !_m_oScoreData ||
			!_m_oScoreData[ "teamdata" ] ||
			!_m_oScoreData[ "teamdata" ][ "CT" ] ||
			!_m_oScoreData[ "teamdata" ][ "TERRORIST" ] )
			return false;

		$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.gameover_show', 'MOUSE' );

		         
		_m_cP.FindChildTraverse( 'WinTeam' ).RemoveClass( 'hidden' );
		var winningTeam;
		var winningTeamNumber = _m_oMatchEndData[ "winning_team_number" ];

		if ( winningTeamNumber == 2 )
		{
			winningTeam = "terrorist";
		}
		else if ( winningTeamNumber == 3 )
		{
			winningTeam = "ct";
		}

		if ( winningTeam )
		{
			var teamAbbreviation = ( winningTeam === 'ct' ) ? winningTeam : 't';
			_SetCoinModel( winningTeam, teamAbbreviation );
			_SetWinTeamText( winningTeam );
			_AnimStart();
		}
		else       
		{
			var elWinnerLabel = $.GetContextPanel().FindChildTraverse( 'WinTeamBackgroundText' );
			elWinnerLabel.text = $.Localize( '#eom-tie' );
			elWinnerLabel.TriggerClass( 'move' );
		}

		return true;
	}

	function _SetCoinModel( winningTeam, team )
	{
		var elModel = _m_cP.FindChildTraverse( 'WinCoinModel' );
		elModel.SetScene( "resource/ui/econ/ItemModelPanelCharWeaponInspect.res",
			'models/inventory_items/scoreboard_logos/logo_' + team + '.mdl',
			false
		);
	}

	function _SetWinTeamText( team )
	{
		var elLabel = _m_cP.FindChildTraverse( 'WinTeamName' );
		var clanName = GameStateAPI.GetTeamClanName( team.toUpperCase() );
		elLabel.text = clanName;
	}

	function _AnimStart ()
	{
		var elCoinModel = $.GetContextPanel().FindChildTraverse( 'WinCoinModel' );
		var elTeamLabel = $.GetContextPanel().FindChildTraverse( 'WinTeamName' );
		var elWinnerLabel = $.GetContextPanel().FindChildTraverse( 'WinTeamBackgroundText' );

		elCoinModel.SetCameraPreset( 1, false );
		elCoinModel.RemoveClass( 'hidden' );
		elCoinModel.SetCameraPreset( 0, true );
		elWinnerLabel.TriggerClass( 'move' );
		elTeamLabel.TriggerClass( 'move' );
	}

	function _SetPlayerWinners()
	{
		var elPlayers = _m_cP.FindChildTraverse( 'WinPlayers' );
		elPlayers.RemoveClass( 'hidden' );

		elPlayers.RemoveAndDeleteChildren();

		for ( var i = 0; i < _m_arrTopPlayerXuid.length; i++ )
		{
			var elPlayer = $.CreatePanel( 'Panel', elPlayers, 'Player + entry' );
			elPlayer.BLoadLayoutSnippet( "PlayerWinner" );

			var elAvatar = elPlayer.FindChildTraverse( 'WinPlayersAvatar' );
			elAvatar.BLoadLayoutSnippet( 'AvatarPlayerCard' );

			elPlayer.FindChildTraverse( 'WinPlacement' ).text = $.Localize( "#scoreboard_arsenal_" + i );
			elPlayer.FindChildTraverse( 'WinPlayerName' ).text = GameStateAPI.GetPlayerName( _m_arrTopPlayerXuid[ i ] );

			Avatar.Init( elAvatar, _m_arrTopPlayerXuid[ i ], 'playercard' );

			if ( GameStateAPI.IsFakePlayer( _m_arrTopPlayerXuid[ i ] ) )
			{
				var team = GameStateAPI.GetPlayerTeamName( _m_arrTopPlayerXuid[ i ] );
				elAvatar.FindChildTraverse( 'JsAvatarImage' ).SetDefaultImage( 'file://{images}/icons/scoreboard/avatar-' + team + '.png' );
			}

			if ( i > 0 )
			{
				elPlayer.AddClass( 'eom-win__player--small' );
			}
		}
	}

	function _DisplayMe() 
	{

   		                                                                        
		  
  		                                             

		_m_oMatchEndData = GameStateAPI.GetMatchEndWinDataJSO();
		_m_oScoreData = GameStateAPI.GetScoreDataJSO();
		_m_oTime = GameStateAPI.GetTimeDataJSO();

		if ( !_m_oMatchEndData )
		{
			return false;
		}

		var bFreeForAll = ( _m_oMatchEndData[ 'winning_player' ] != 0 );

		if ( bFreeForAll )
		{
			                                                 
			                                                                                                  

			                                                
			$.DispatchEvent( 'Scoreboard_GetFreeForAllTopThreePlayers' );
		}
		else             
		{
			return _SetVictoryStatement();
		}

		return true;
	}

	                                                         
	                                                                      
	  
	  

	function _Start() 
	{
		                              

		if ( _DisplayMe() )
		{
			EndOfMatch.SwitchToPanel( 'eom-win' );
			EndOfMatch.StartDisplayTimer( _m_pauseBeforeEnd );
			
			$.Schedule( _m_pauseBeforeEnd, _End );
		}
		else
		{
			_End();
		}
	}

	function _End() 
	{
		                            

		$.DispatchEvent( 'EndOfMatch_ShowNext' );
	}

	function _Shutdown()
	{
	}

	                      
	return	{

		Start									: _Start,
		GetFreeForAllTopThreePlayers_Response	: _GetFreeForAllTopThreePlayers_Response,
		GetFreeForAllPlayerPosition_Response:    _GetFreeForAllPlayerPosition_Response,
		Shutdown: _Shutdown,
	};
})();


                                                                                                    
                                           
                                                                                                    
(function () {

	EndOfMatch.RegisterPanelObject( EOM_Win );

	$.RegisterForUnhandledEvent( "EndOfMatch_GetFreeForAllTopThreePlayers_Response", EOM_Win.GetFreeForAllTopThreePlayers_Response );
	$.RegisterForUnhandledEvent( "EndOfMatch_GetFreeForAllPlayerPosition_Response", EOM_Win.GetFreeForAllPlayerPosition_Response );

})();
