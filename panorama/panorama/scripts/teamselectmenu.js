'use strict'; 

var TeamSelectMenu = ( function (){

	var m_errorTimerHandle = false;
	var m_highlightedTeam = 0;

	function _Init() 
	{
		_SetUpTeamSelectBtns();
	}

	function _ShowPanel()
	{
		if ( GameStateAPI.IsDemoOrHltv() )
			return;

		var elBackgroundImage = $.GetContextPanel().FindChildInLayoutFile( 'BackgroundMapImage' );
		var mapName = GameStateAPI.GetMapBSPName();

		elBackgroundImage.SetImage( 'file://{images}/map_icons/screenshots/1080p/' + mapName +'.png' );
		_GetAnimInfo();
		
		_PopulatePlayerList();
		_ShowCancelButton();

		if( m_errorTimerHandle !== false )
		{
			$.CancelScheduled( m_errorTimerHandle );
			m_errorTimerHandle = false;
		}

		var elWarningPanel = $('#TeamJoinError');
		elWarningPanel.AddClass( 'hidden' );
		
		m_highlightedTeam = 0;
	}

	function _HighlightPanel( elModelPanel, layerSequence )
	{
		elModelPanel.SetHasClass( 'highlight', true );

		elModelPanel.LayerSequence( layerSequence, false, false );

		elModelPanel.SetFlashlightAmount( 2.0 );
	}

	function _UnhighlightPanel( elModelPanel )
	{
		elModelPanel.SetHasClass( 'highlight', false );

		elModelPanel.SetFlashlightAmount( 1.0 );
	}

	function _SelectTeam( team )
	{
		var currentTeamNumber = GameStateAPI.GetPlayerTeamNumber( MyPersonaAPI.GetXuid());

		if( team !== "0" && currentTeamNumber.toString() === team )
		{
			                                                        
			_HidePanel();
			return;
		}
		
		_SetTeam( team );
	}

	function _SelectHighlightedTeam()
	{
		_SelectTeam( m_highlightedTeam );
	}

	function _HighlightTTeam()
	{
		var elBtnTeamT = $( '#BtnSelectTeam-TERRORIST' );
		var elBtnTeamCT = $( '#BtnSelectTeam-CT' );

		elBtnTeamT.SetHasClass( 'team-select-icon-title-highlight', true );
		elBtnTeamCT.SetHasClass( 'team-select-icon-title-highlight', false );

		var elCtModel = $( '#TeamCharCT' );
		var elTModel = $( '#TeamCharT' );

		_HighlightPanel( elTModel, 't_loadout_pistol_idle_alt' );
		_UnhighlightPanel( elCtModel );
		m_highlightedTeam = '2';
		elBtnTeamT.SetFocus();
	}

	function _HighlightCTTeam()
	{
		var elBtnTeamT = $( '#BtnSelectTeam-TERRORIST' );
		var elBtnTeamCT = $( '#BtnSelectTeam-CT' );

		elBtnTeamT.SetHasClass( 'team-select-icon-title-highlight', false );
		elBtnTeamCT.SetHasClass( 'team-select-icon-title-highlight', true );

		var elCtModel = $( '#TeamCharCT' );
		var elTModel = $( '#TeamCharT' );

		_HighlightPanel( elCtModel, 'ct_loadout_pistol01_idle_alt' );
		_UnhighlightPanel( elTModel );
		m_highlightedTeam = '3';
		elBtnTeamCT.SetFocus();
	}

	function _SetUpTeamSelectBtns()
	{
		var elCtModel = $( '#TeamCharCT' );
		var elTModel = $( '#TeamCharT' );

		var onActivate = function ( team )
		{
			_SelectTeam( team );
		}

		var elBtnTeamT = $( '#BtnSelectTeam-TERRORIST' );
		elBtnTeamT.SetPanelEvent( 'onmouseover', _HighlightTTeam );
		elBtnTeamT.SetPanelEvent( 'onactivate', onActivate.bind( undefined, '2' ) );

		var elBtnTeamCT = $( '#BtnSelectTeam-CT' );
		elBtnTeamCT.SetPanelEvent( 'onmouseover', _HighlightCTTeam );
		elBtnTeamCT.SetPanelEvent( 'onactivate', onActivate.bind( undefined, '3' ) );

		var elBtnSpectate = $( '#TeamSelectSpectate' );
		elBtnSpectate.SetPanelEvent( 'onactivate', onActivate.bind( undefined, '1' ) );

		var elBtnSpectate = $( '#TeamSelectAuto' );
		elBtnSpectate.SetPanelEvent( 'onactivate', onActivate.bind( undefined, '0' ) );
	}

	var _SetTeam= function ( team )
	{
		  
		            
		           
		                   
		  
		
		GameInterfaceAPI.ConsoleCommand( 'jointeam '+team+' 1' );
	}

	var _SetTeamCT = function()
	{
		_SetTeam( 3 );
	}

	var _SetTeamT = function()
	{
		_SetTeam( 2 );
	}

	var _GetAnimInfo = function ()
	{
		var elCharRight = $.GetContextPanel().FindChildInLayoutFile( 'TeamCharCT' );
		var elCharLeft = $.GetContextPanel().FindChildInLayoutFile( 'TeamCharT' );

		                                      
		                                     

		_SetCharacterAnim( elCharRight,
			{
				team: 'ct',
				model: $.GetContextPanel().GetPlayerModelCT(),
				anims: CharacterAnims.GetAnims('ct', 'secondary0', 'deagle')                                                   
			}
		);

		_SetCharacterAnim( elCharLeft,
			{
				team: 't',
				model: $.GetContextPanel().GetPlayerModelTerrorist(),
				anims: CharacterAnims.GetAnims('t', 'secondary0', '')                                                   
			}
		);
	}

	var _SetCharacterAnim = function ( elPanel, settings )
	{
		elPanel.ResetAnimation( false );
		elPanel.SetPlayerModel( settings.model );
		
		elPanel.EquipPlayerFromLoadout( settings.team, 'secondary0' );

		elPanel.LayerSequence( settings.anims.idle , true, false );
		elPanel.SetCameraPreset( settings.anims.cameraPreset, false );

		elPanel.Pause( false );
	}

	var _PopulatePlayerList = function( )
	{
	    if ( GameStateAPI.IsDemoOrHltv() )
	    {
	        return false;
	    }
		
	                                 

		                       
		var oPlayerList = GameStateAPI.GetPlayerDataJSO();

		                                                            
		var teamNames = ['TERRORIST', 'CT'];
		for ( var iTeam = 0; iTeam < teamNames.length; ++iTeam )
		{

		    var teamName = teamNames[iTeam];

		    var players = {};
		    if ( oPlayerList !== undefined && oPlayerList[teamName] )
            {
		        players = oPlayerList[teamName];
            }

		    var xuidsOnTeam = [];
		    var countBots = 0;

		    for ( var j in players )
		    {
		        var xuid = players[j];
		        _UpdatePlayer( xuid, teamName );
		        xuidsOnTeam.push( xuid );

		        if( GameStateAPI.IsFakePlayer(xuid ))
		            countBots++;
		    }

			                                           
			                                                                                    
			var elList =  $( '#List-'+ teamName );
			var elTeammates = elList.FindChild('Teammates');
			elTeammates.RemoveClass('hidden');
			
			var listOfTeammatesPanels = elTeammates.Children();
			listOfTeammatesPanels.forEach( function( element ) {
				if ( xuidsOnTeam.indexOf( element.id ) === -1 ||
					!GameStateAPI.IsPlayerConnected( element.id ) || 
					teamName !== GameStateAPI.GetPlayerTeamName( element.id )) {

					element.AddClass('hidden');
				}
			});

			_UpdateBotPlayerCount( countBots, xuidsOnTeam.length - countBots, teamName );
		}

		return false;
	}

	var _UpdatePlayer = function( xuid, teamName )
	{
		if( xuid === 0 )
			return;
		
		var elList = $( '#List-'+ teamName );
		var elTeammatesPanels = elList.FindChild('Teammates');
		var elTeammate = elTeammatesPanels.FindChildInLayoutFile( xuid );

		if( !elTeammate )
		{
			elTeammate = $.CreatePanel( 'Panel', elTeammatesPanels, xuid );
			elTeammate.BLoadLayoutSnippet( 'Teammate' );

			var elName = elTeammate.FindChildInLayoutFile( 'TeamSelectTeammateName' );

			var clanTag = GameStateAPI.GetPlayerClanTag(xuid);
			var playerName = GameStateAPI.GetPlayerNameWithNoHTMLEscapes(xuid);
			elName.text = clanTag + " " + playerName;
	
			var elAvatar = $.CreatePanel( 'Panel', elTeammate, xuid, { hittest:'false' } );
			elAvatar.SetAttributeString( 'xuid', xuid );
			elAvatar.BLoadLayout('file://{resources}/layout/avatar.xml', false, false );
			elAvatar.BLoadLayoutSnippet( 'AvatarParty' );

			var elAvatarImage = elAvatar.FindChildInLayoutFile('JsAvatarImage');
			elAvatarImage.SetDefaultImage( 'file://{images}/icons/scoreboard/avatar-' + teamName + '.png' );
			elAvatarImage.AddClass( 'no-hover' );
	
			                                                                           
			Avatar.Init( elAvatar, xuid.toString(), "PlayerCard" );
			elTeammate.RemoveClass('hidden');

			elTeammate.RegisterForReadyEvents( true );
			elTeammate.OnPropertyTransitionEndEvent = function ( panelName, propertyName )
			{
				if( propertyName === 'opacity')
				{
					                                         
					if( elTeammate.visible === true && elTeammate.BIsTransparent() )
					{
						elTeammate.DeleteAsync(.0);
						                                              
						return true;
					}
				}

				return false;
			}

			$.RegisterEventHandler( 'PropertyTransitionEnd', elTeammate, elTeammate.OnPropertyTransitionEndEvent );
		}
		else
		{
			Avatar.Init( elTeammate.FindChild( xuid ), xuid, "PlayerCard" );
			                                                                           
		}
	}

	var _UpdateBotPlayerCount = function( countBots, countPlayers, team )
	{
		var labelCount = $('#BtnSelectTeam-' + team ).FindChildInLayoutFile('PlayerBotCount');

		if( countBots === 1 )
			labelCount.SetDialogVariable( "botlabel", $.Localize( '#team_select_bot' ) );
		else
			labelCount.SetDialogVariable( "botlabel", $.Localize( '#team_select_bots' ) );

		if( countPlayers === 1 )
			labelCount.SetDialogVariable( "playerlabel", $.Localize( '#team_select_player' ) );
		else
			labelCount.SetDialogVariable( "playerlabel", $.Localize( '#team_select_players' ) );

		labelCount.SetDialogVariableInt( "bots", countBots );
		labelCount.SetDialogVariableInt( "players", countPlayers );
		labelCount.text = $.Localize( '#team_select_bot_player_count', labelCount );
	}

	var _ShowCancelButton = function()
	{
		var elTimer = $( '#AutojoinTimer' );
		$('#TeamSelectCancel').visible = !elTimer.visible;
	}

	var _ShowError = function( locString )
	{
		var elLabel = $('#TeamJoinErrorLabel');
		var elWarningPanel = $('#TeamJoinError');

		elLabel.text = $.Localize(locString);
		elWarningPanel.RemoveClass('hidden');
		
		m_errorTimerHandle = $.Schedule(5.0, function () {
			if ( elWarningPanel.IsValid() )
			{
				elWarningPanel.AddClass('hidden');
			}
			m_errorTimerHandle = false;
		});
	}

	var _HidePanel = function()
	{
		$.DispatchEvent( 'CSGOShowTeamSelectMenu', false );
	}

	return {
		Init 					: _Init,
		PopulatePlayerList		: _PopulatePlayerList,
		ShowCancelButton		: _ShowCancelButton,
		SetTeamCT				: _SetTeamCT,
		SetTeamT				: _SetTeamT,
		ShowPanel				: _ShowPanel,
		HidePanel				: _HidePanel,
		ShowError				: _ShowError,
		HighlightTTeam			: _HighlightTTeam,
		HighlightCTTeam			: _HighlightCTTeam,
		SelectHighlightedTeam	: _SelectHighlightedTeam
	 }
})();

                                                                                                    
                                           
                                                                                                    
(function()
{
	TeamSelectMenu.Init();
	                             
	$.RegisterForUnhandledEvent( 'CSGOShowTeamSelectMenu', TeamSelectMenu.ShowPanel );

	                                                     
	                                                                                             
	$.RegisterForUnhandledEvent( 'PlayerTeamChanged', TeamSelectMenu.PopulatePlayerList );

	$.RegisterForUnhandledEvent( 'ServerForcingTeamJoin', TeamSelectMenu.ShowCancelButton );
	$.RegisterForUnhandledEvent( 'TeamJoinFailed', TeamSelectMenu.ShowError );
	
	$.RegisterKeyBind( $( '#TeamSelectMenu' ), 'key_escape', TeamSelectMenu.HidePanel );
	$.RegisterKeyBind( $( '#TeamSelectMenu' ), 'key_2', TeamSelectMenu.SetTeamCT );
	$.RegisterKeyBind( $( '#TeamSelectMenu' ), 'key_1', TeamSelectMenu.SetTeamT );
	$.RegisterKeyBind( $( '#TeamSelectMenu' ), 'key_left', TeamSelectMenu.HighlightTTeam );
	$.RegisterKeyBind( $( '#TeamSelectMenu' ), 'key_right', TeamSelectMenu.HighlightCTTeam );
	$.RegisterKeyBind( $( '#TeamSelectMenu' ), 'key_space', TeamSelectMenu.SelectHighlightedTeam );
	
})();
