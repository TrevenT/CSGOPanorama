'use strict';

var PlayMenu = ( function()
{
	var k_workshopPanelId = 'gameModeButtonContainer_workshop';

	                                                                   
	var m_mapSelectionButtonContainers = {};
	                                        
	var m_gameModeConfigs = {};
	                                                    
	var m_arrGameModeRadios = [];
	                                                
	var GetMGDetails;
	var GetGameType;

	var m_bPerfectWorld = ( MyPersonaAPI.GetLauncherType() === 'perfectworld' );
	var m_activeMapGroupSelectionPanelID = null;
	var m_permissions = '';

	                                              
	var m_serverSetting = '';
	var m_gameModeSetting = '';
	var m_serverPrimeSetting = null;
	var m_singleSkirmishMapGroup = null;
	var m_arrSingleSkirmishMapGroups = [];
	                                                                                                                                            

	                    
	var m_isWorkshop = false;

	var k_workshopModes = {
		classic: 'casual,competitive',

		casual: 'casual',
		competitive: 'competitive',
		wingman: 'scrimcomp2v2',
		deathmatch: 'deathmatch',
		training: 'training',
		coopstrike: 'coopmission',

		custom: 'custom',

		                 
		armsrace: 'armsrace',
		demolition: 'demolition',
		flyingscoutsman: 'flyingscoutsman',
		retakes: 'retakes'
	};

	var _Init = function()
	{
		                                                                                                     
		                         
		    
		   	                                                              
		   	                                                     
		   	                          
		   	 
		   		                                                    
		   	 
		    
		      

		                                                
		var cfg = GameTypesAPI.GetConfig();
		                                                                                                  
		                                                   
		for ( var type in cfg.gameTypes )
		{
			for ( var mode in cfg.gameTypes[ type ].gameModes )
			{
				m_gameModeConfigs[ mode ] = cfg.gameTypes[ type ].gameModes[ mode ];
			}
		}

		                                                                                  
		                                                                                                                                 
		GetGameType = function( mode )
		{
			for ( var gameType in cfg.gameTypes ) 
			{
				if ( cfg.gameTypes[ gameType ].gameModes.hasOwnProperty( mode ) )
					return gameType;
			}
		};

		GetMGDetails = function( mg )
		{
			return cfg.mapgroups[ mg ];
		};

		                                                                                                  
		                                                                
		                                                
		var elGameModeSelectionRadios = $( '#GameModeSelectionRadios' );
		m_arrGameModeRadios = elGameModeSelectionRadios.Children();
		m_arrGameModeRadios.forEach( function( entry )
		{
			entry.SetPanelEvent( 'onactivate', function()
			{
				m_isWorkshop = false;
				if ( _IsSingleSkirmishString( entry.id ) )
				{
					m_gameModeSetting = 'skirmish';
					m_singleSkirmishMapGroup = _GetSingleSkirmishMapGroupFromSingleSkirmishString( entry.id )
				}
				else
				{
					m_gameModeSetting = entry.id;
					m_singleSkirmishMapGroup = null;
				}

				if (( entry.id === "competitive" || entry.id === 'scrimcomp2v2' ) && !entry.FindChild( 'GameModeAlert' ).BHasClass( 'hidden' ))
				{
					if ( GameInterfaceAPI.GetSettingString( 'ui_show_unlock_competitive_alert' ) !== '1' )
					{
						GameInterfaceAPI.SetSettingString( 'ui_show_unlock_competitive_alert', '1' );
					}
				}
				_ApplySessionSettings();
			} );
		} );

		m_arrGameModeRadios.forEach( function( entry )
		{
			if ( _IsSingleSkirmishString( entry.id ) )
			{
				m_arrSingleSkirmishMapGroups.push( _GetSingleSkirmishMapGroupFromSingleSkirmishString( entry.id ) );
			}
		} );


		var elPrimeButton = $( '#id-play-menu-toggle-prime' );
		elPrimeButton.SetPanelEvent( 'onactivate', function()
		{
			UiToolkitAPI.HideTextTooltip();
			                          
			ApplyPrimeSetting();
		} );

		                         
		var elPermissionsButton = $( '#PermissionsSettings' );
		elPermissionsButton.SetPanelEvent( 'onactivate', function()
		{
			                                                                                                                                  
			var bCurrentlyPrivate = ( LobbyAPI.GetSessionSettings().system.access === "private" );
			var sNewAccessSetting = bCurrentlyPrivate ? "public" : "private";
			var settings = {
				update: {
					System: {
						access: sNewAccessSetting
					}
				}
			};
			GameInterfaceAPI.SetSettingString( 'lobby_default_privacy_bits', ( sNewAccessSetting === "public" ) ? "1" : "0" );
			LobbyAPI.UpdateSessionSettings( settings );
			$.DispatchEvent( 'UIPopupButtonClicked', '' );
		} );

		                           
		var btnStartSearch = $( '#StartMatchBtn' );
		btnStartSearch.SetPanelEvent( 'onactivate', function()
		{
			$.DispatchEvent( 'PlaySoundEffect', 'mainmenu_press_GO', 'MOUSE' );
			btnStartSearch.AddClass( 'pressed' );

	  		                                 

			if ( m_isWorkshop )
			{
				_DisplayWorkshopModePopup();
			}
			else
			{

				                                                                                                                                                       
				if ( !_CheckContainerHasAnyChildChecked( _GetMapListForServerTypeAndGameMode( m_activeMapGroupSelectionPanelID ) ) )
				{
					_NoMapSelectedPopup();

					btnStartSearch.RemoveClass( 'pressed' );

					return;
				}

				let settings = ( LobbyAPI.IsSessionActive() && !_GetTournamentOpponent() ) ? LobbyAPI.GetSessionSettings() : null;
				let stage = _GetTournamentStage();
				                                                                                   
				                                  
				   	                                                
				   	                                       
				   	                                       
				   	                                                              
				    
				   	            
				    

				  
				                                     
				                                                     
				 	                                                             
					                                 
				 
				                                                                      
					                                                              
					                                       
					                                         
				 	                                                                          
					                                                                                                                                                  
					                                                                                                        
					       
				 
				  

				LobbyAPI.StartMatchmaking(	MyPersonaAPI.GetMyOfficialTournamentName(),
											MyPersonaAPI.GetMyOfficialTeamName(),
											_GetTournamentOpponent(),
											stage
										);
			}
		} );

		var btnCancel = $.GetContextPanel().FindChildInLayoutFile( 'PartyCancelBtn' );
		btnCancel.SetPanelEvent( 'onactivate', function()
		{
			LobbyAPI.StopMatchmaking();
			$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.generic_button_press', 'MOUSE' );
		});

		elPermissionsButton.SetPanelEvent( 'onmouseover', function()
		{
			UiToolkitAPI.ShowTextTooltip( 'PermissionsSettings', '#SFUI_Client_PermissionsTitle' );
		} );

		elPermissionsButton.SetPanelEvent( 'onmouseout', function()
		{
			UiToolkitAPI.HideTextTooltip();
		} );

		$( "#WorkshopSearchTextEntry" ).SetPanelEvent( 'ontextentrychange', _UpdateWorkshopMapFilter );

		                                            
		_SyncDialogsFromSessionSettings( LobbyAPI.GetSessionSettings() );
		_ApplySessionSettings();

		                         
		_ShowNewMatchmakingModePopup();

		                                                                        
		var strFavoriteMaps = GameInterfaceAPI.GetSettingString( 'ui_playsettings_custom_preset' );
		if ( strFavoriteMaps === '' )
		{
			_SaveMapSelectionToCustomPreset( true );
		}
		
	};


	function _NoMapSelectedPopup ()
	{
		                                       
		UiToolkitAPI.ShowGenericPopupOk(
			$.Localize( '#no_maps_selected_title' ),
			$.Localize( '#no_maps_selected_text' ),
			'',
			function () { },
			function () { } );
	}

	var _ShowNewMatchmakingModePopup = function()
	{
		return;                                                                                 
		var setVersionTo = '3';
		var currentVersion = GameInterfaceAPI.GetSettingString( 'ui_popup_weaponupdate_version' );

		if ( currentVersion !== setVersionTo )
		{	                                 
			GameInterfaceAPI.SetSettingString( 'ui_popup_weaponupdate_version', setVersionTo );
			UiToolkitAPI.ShowCustomLayoutPopup( 'prime_status', 'file://{resources}/layout/popups/popup_premier_matchmaking.xml' );
			                                               
			  	   
			  	                                                              
			  	                                   
			  	      
			    
		}
	};

	var _SetGameModeRadioButtonAvailableTooltip = function( gameMode, isAvailable, txtTooltip )
	{
		var elGameModeSelectionRadios = $( '#GameModeSelectionRadios' );
		var elTab = elGameModeSelectionRadios ? elGameModeSelectionRadios.FindChildInLayoutFile( gameMode ) : null;
		if ( elTab )
		{
			if ( !isAvailable )
			{
				elTab.SetPanelEvent( 'onmouseover', function()
				{
					UiToolkitAPI.ShowCustomLayoutParametersTooltip( elTab.id,
					'GamemodesLockedneedPrime',
					'file://{resources}/layout/tooltips/tooltip_title_progressbar.xml',
						'titletext=' + 'Game Mode Locked' +
						'&' + 'bodytext=' + txtTooltip +
						'&' + 'usexp=' + 'true'
					);
				} ); 
				elTab.SetPanelEvent( 'onmouseout', function() {UiToolkitAPI.HideCustomLayoutTooltip('GamemodesLockedneedPrime');} );
			}
			else
			{
				elTab.SetPanelEvent( 'onmouseover', function() {} );
				elTab.SetPanelEvent( 'onmouseout', function() {} );
			}
		}
	}

	var _SetGameModeRadioButtonVisible = function( gameMode, isVisible )
	{
		var elGameModeSelectionRadios = $( '#GameModeSelectionRadios' );
		var elTab = elGameModeSelectionRadios ? elGameModeSelectionRadios.FindChildInLayoutFile( gameMode ) : null;
		if ( elTab )
		{
			elTab.visible = isVisible;
		}
	}

	var _IsGameModeAvailable = function( serverType, gameMode )
	{
		var isAvailable = true;
		
		if ( gameMode === "survival" )
		{
			isAvailable = _IsValveOfficialServer( serverType );
			_SetGameModeRadioButtonAvailableTooltip( gameMode, isAvailable, '#PlayMenu_dangerzone_onlineonly' );
			if ( !isAvailable )
				return false;
		}

		if ( gameMode === "cooperative" || gameMode === "coopmission" )
		{
			var questID = GetMatchmakingQuestId();
			var bGameModeMatchesLobby = questID && ( LobbyAPI.GetSessionSettings().game.mode === gameMode );
			var bAvailable = bGameModeMatchesLobby && MissionsAPI.GetQuestDefinitionField( questID, "gamemode" ) === gameMode;
			_SetGameModeRadioButtonVisible( gameMode, bAvailable );                                                  
			return bAvailable;
		}

		                                                                           
		if ( _IsValveOfficialServer( serverType ) &&                                                                                              
			LobbyAPI.BIsHost() && !(                                         
			MyPersonaAPI.HasPrestige() || ( MyPersonaAPI.GetCurrentLevel() >= 2 )
			) )
		{
			                                  
			                                                            
			  
			                                                          
			                                                                             
			  
			                                                                        
			                                                                         
			   
			                                                   
			    
			   	                                                              
			   		                                                                                                        
			   		      
			   	                                                         
			   		                                                                   
			   		      
			    
			isAvailable = ( gameMode == 'deathmatch' || gameMode == 'casual' || gameMode == 'survival' || gameMode == 'skirmish' );
		}
		                                                                                          
		_SetGameModeRadioButtonAvailableTooltip( gameMode, isAvailable, '#PlayMenu_unavailable_newuser_2' );
		return isAvailable;
	}

	var _GetTournamentOpponent = function ()
	{
		var elTeamDropdown = $.GetContextPanel().FindChildInLayoutFile( 'TournamentTeamDropdown' );
		if ( elTeamDropdown.GetSelected() === null )
			return '';
		return elTeamDropdown.GetSelected().GetAttributeString( 'data', '' );
	}

	var _GetTournamentStage = function ()
	{
		var elStageDropdown = $.GetContextPanel().FindChildInLayoutFile( 'TournamentStageDropdown' );
		if ( elStageDropdown.GetSelected() === null )
			return '';
		return elStageDropdown.GetSelected().GetAttributeString( 'data', '' );
	}

	var _UpdateStartSearchBtn = function ( isSearchingForTournament )
	{
		var btnStartSearch = $.GetContextPanel().FindChildInLayoutFile( 'StartMatchBtn' );
		btnStartSearch.enabled = isSearchingForTournament ? ( _GetTournamentOpponent() != '' && _GetTournamentStage() != '' ) : true;
	}

	var _UpdateTournamentButton = function( isHost, isSearching, settingsgamemapgroupname )
	{
		var bIsOfficialCompetitive = m_gameModeSetting === "competitive" && _IsPlayingOnValveOfficial();
		var strTeamName = MyPersonaAPI.GetMyOfficialTeamName();
		var strTournament = MyPersonaAPI.GetMyOfficialTournamentName();
		var isInTournament = isHost && strTeamName != "" && strTournament != "";
		$.GetContextPanel().SetHasClass( "play-menu__tournament", isInTournament );

		var isSearchingForTournament = bIsOfficialCompetitive && isInTournament;

		var elTeamDropdown = $.GetContextPanel().FindChildInLayoutFile( 'TournamentTeamDropdown' );
		var elStageDropdown = $.GetContextPanel().FindChildInLayoutFile( 'TournamentStageDropdown' );
		
		if ( isInTournament )
		{
			function AddDropdownOption( elDropdown, entryID, strText, strData, strSelectedData )
			{
				var newEntry = $.CreatePanel( 'Label', elDropdown, entryID, { data: strData } );
				newEntry.text = strText;
				elDropdown.AddOption( newEntry );

				               
				if ( strSelectedData === strData )
				{
					elDropdown.SetSelected( entryID );
				}
			}

			var strCurrentOpponent = _GetTournamentOpponent();
			var strCurrentStage = _GetTournamentStage();

			                         
			elTeamDropdown.RemoveAllOptions();
			AddDropdownOption( elTeamDropdown, 'PickOpponent', $.Localize( '#SFUI_Tournament_Pick_Opponent' ), '', strCurrentOpponent );
			var teamCount = CompetitiveMatchAPI.GetTournamentTeamCount( strTournament );
			for ( var i = 0; i < teamCount; i++ )
			{
				var strTeam = CompetitiveMatchAPI.GetTournamentTeamNameByIndex( strTournament, i );

				                                  
				if ( strTeamName === strTeam )
					continue;
				
				AddDropdownOption( elTeamDropdown, 'team_' + i, strTeam, strTeam, strCurrentOpponent );
			}
			elTeamDropdown.SetPanelEvent( 'oninputsubmit', _UpdateStartSearchBtn.bind( undefined, isSearchingForTournament ) );

			                          
			elStageDropdown.RemoveAllOptions();
			AddDropdownOption( elStageDropdown, 'PickStage', $.Localize( '#SFUI_Tournament_Stage' ), '', strCurrentStage );
			var stageCount = CompetitiveMatchAPI.GetTournamentStageCount( strTournament );
			for ( var i = 0; i < stageCount; i++ )
			{
				var strStage = CompetitiveMatchAPI.GetTournamentStageNameByIndex( strTournament, i );
				AddDropdownOption( elStageDropdown, 'stage_' + i, strStage, strStage, strCurrentStage );
			}
			elStageDropdown.SetPanelEvent( 'oninputsubmit', _UpdateStartSearchBtn.bind( undefined, isSearchingForTournament ) );
		}
		
		elTeamDropdown.enabled = isSearchingForTournament;
		elStageDropdown.enabled = isSearchingForTournament;

		_UpdateStartSearchBtn( isSearchingForTournament );
		_ShowActiveMapSelectionTab( !isSearchingForTournament );
	}

	var _SyncDialogsFromSessionSettings = function( settings )
	{
		if ( !settings || !settings.game || !settings.system )
		{
			return;
		}

		m_serverSetting = settings.options.server;
		m_permissions = settings.system.access;
		m_gameModeSetting = settings.game.mode;
		m_serverPrimeSetting = settings.game.prime;

		                                       
		m_isWorkshop = settings.game.mapgroupname
			&& settings.game.mapgroupname.includes( '@workshop' );

		                                                     
		m_singleSkirmishMapGroup = null;
		if ( m_gameModeSetting === 'skirmish' && settings.game.mapgroupname && m_arrSingleSkirmishMapGroups.includes( settings.game.mapgroupname ) )
		{
			m_singleSkirmishMapGroup = settings.game.mapgroupname;
		}

		var isHost = LobbyAPI.BIsHost();
		var isSearching = _IsSearching();
		var isEnabled = !isSearching && isHost ? true : false;

		if ( m_isWorkshop )
		{
			_SwitchToWorkshopTab( isEnabled );
			_SelectMapButtonsFromSettings( settings );
		}
		else if ( m_gameModeSetting )
		{
			                                           
			for ( var i = 0; i < m_arrGameModeRadios.length; ++i )
			{
				var strGameModeForButton = m_arrGameModeRadios[i].id;

				                                               
				if ( m_singleSkirmishMapGroup )
				{
					if ( _IsSingleSkirmishString( strGameModeForButton ) )
					{
						if ( m_singleSkirmishMapGroup === _GetSingleSkirmishMapGroupFromSingleSkirmishString( strGameModeForButton ) )
						{
							m_arrGameModeRadios[i].checked = true;
						}
					}
				}
				else if ( !_IsSingleSkirmishString( strGameModeForButton ) )
				{
					if ( strGameModeForButton === m_gameModeSetting )
					{
						m_arrGameModeRadios[i].checked = true;
					}
				}

				                                                                                     
				var isAvailable = _IsGameModeAvailable( m_serverSetting, strGameModeForButton );
				m_arrGameModeRadios[ i ].enabled = isAvailable && isEnabled;

				( strGameModeForButton === 'competitive' || strGameModeForButton === 'scrimcomp2v2' ) &&
					_IsPlayingOnValveOfficial() &&
					GameInterfaceAPI.GetSettingString( 'ui_show_unlock_competitive_alert' ) !== '1' &&
					MyPersonaAPI.HasPrestige()
				
				if ( strGameModeForButton === 'competitive' || strGameModeForButton === 'scrimcomp2v2' )
				{
					var bHide = GameInterfaceAPI.GetSettingString( 'ui_show_unlock_competitive_alert' ) === '1' ||
						MyPersonaAPI.HasPrestige() ||
						MyPersonaAPI.GetCurrentLevel() !== 2 ||
						!_IsPlayingOnValveOfficial();
					
					if ( m_arrGameModeRadios[ i ].FindChildInLayoutFile( 'GameModeAlert' ) )
					{
						m_arrGameModeRadios[ i ].FindChildInLayoutFile( 'GameModeAlert' ).SetHasClass( 'hidden', bHide );
					}
				}
			}

			                                                                   
			_UpdateMapGroupButtons( isEnabled, isSearching, isHost );

			                                                   
			_CancelRotatingMapGroupSchedule();
			if ( settings.game.mode === "survival" )
			{
				_GetRotatingMapGroupStatus( m_gameModeSetting, m_singleSkirmishMapGroup, settings.game.mapgroupname );
			}

			_SelectMapButtonsFromSettings( settings );
		}
		else
		{
			                                                         
			                                                                     
			                                                                           
			m_arrGameModeRadios[0].checked = true;
		}

		_ShowHideStartSearchBtn( isSearching, isHost );
		_ShowCancelSearchButton( isSearching, isHost );

		                           
		_UpdateTournamentButton( isHost, isSearching, settings.game.mapgroupname );

		                   
		_UpdatePrimeBtn( isSearching, isHost );
		_UpdatePermissionBtnText( settings, isEnabled );

		                             
		_UpdateLeaderboardBtn( m_gameModeSetting );

		                                         
		_UpdateSurvivalAutoFillSquadBtn( m_gameModeSetting );

		                                  
		_UpdatePlayDropDown();
		_UpdateBotDifficultyButton();

		$( '#PlayTopNavDropdown' ).enabled = BIsServerTypeDropdownEnabled();
		_SetClientViewLobbySettingsTitle( isHost );

		function BIsServerTypeDropdownEnabled()
		{
			if ( _IsPlayingOnValveOfficial() &&
				( m_gameModeSetting === "cooperative" || m_gameModeSetting === "coopmission" ) )
				return false;
			else
				return isEnabled;
		}
	};

	var _SetClientViewLobbySettingsTitle = function( isHost )
	{
		var elTitle = $.GetContextPanel().FindChildInLayoutFile( 'LobbyLeaderText' );
		
		if ( isHost )
		{
			elTitle.text = $.Localize( '#SFUI_MainMenu_PlayButton' );
			return;
		}

		var xuid = PartyListAPI.GetPartySystemSetting( "xuidHost" );
		var leaderName = FriendsListAPI.GetFriendName( xuid );
		

		elTitle.SetDialogVariable( 'name', leaderName );
		elTitle.text = $.Localize( '#play_lobbyleader_title', elTitle );
	};

	var _GetAvailableMapGroups = function( gameMode, isPlayingOnValveOfficial )
	{
		                                   
		var gameModeCfg = m_gameModeConfigs[ gameMode ];
		if ( gameModeCfg === undefined )
			return [];

		var mapgroup = isPlayingOnValveOfficial ? gameModeCfg.mapgroupsMP : gameModeCfg.mapgroupsSP;
		if ( mapgroup !== undefined && mapgroup !== null )
		{
			return Object.keys( mapgroup );
		}

		if ( ( gameMode === "cooperative" || gameMode === "coopmission" ) && GetMatchmakingQuestId() > 0 )
		{
			return [ LobbyAPI.GetSessionSettings().game.mapgroupname ];
		}

		return [];
	};

	function _GetAvailableQuickSelectMapGroups ()
	{
		if ( m_isWorkshop )
			return [];
		
		var gameModeCfg = m_gameModeConfigs[ m_gameModeSetting ];
		if ( gameModeCfg === undefined ) 
			return [];

		var mapgroup = gameModeCfg.mapgroupsQuickSelectSets;

		if ( mapgroup == undefined || mapgroup == null ) 
			return [];

		return Object.keys( mapgroup );
	}

	var _GetMapGroupPanelID = function ( serverType, gameMode, singleSkirmishMapGroup )
	{
		var gameModeId = gameMode + ( singleSkirmishMapGroup ? '@' + singleSkirmishMapGroup : '' );
		var panelID = 'gameModeButtonContainer_' + gameModeId + '_' + serverType;
		return panelID;
	}

	var _OnActivateMapOrMapGroupButton = function( mapgroupButton )
	{
		var mapGroupNameClicked = mapgroupButton.GetAttributeString( "mapname", '' );
		if ( $.GetContextPanel().BHasClass( 'play-menu__lobbymapveto_activated' ) && mapGroupNameClicked !== 'mg_lobby_mapveto' )
		{	                                                                
			return;
		}

		$.DispatchEvent( 'PlaySoundEffect', 'submenu_leveloptions_select', 'MOUSE' );

		                                                                                                    
		var mapGroupName = mapGroupNameClicked;
		if ( mapGroupName )
		{
			var siblingSuffix = '_scrimmagemap';
			if ( mapGroupName.toLowerCase().endsWith( siblingSuffix ) )
				mapGroupName = mapGroupName.substring( 0, mapGroupName.length - siblingSuffix.length );
			else
				mapGroupName = mapGroupName + siblingSuffix;

			                                   
			var elParent = mapgroupButton.GetParent();
			if ( elParent )
				elParent = elParent.GetParent();
			if ( elParent && elParent.GetAttributeString( 'hassections', '') )
			{
				elParent.Children().forEach( function( section )
				{
					section.Children().forEach( function( tile )
					{
						var mapGroupNameSibling = tile.GetAttributeString( "mapname", '' );
						if ( mapGroupNameSibling.toLowerCase() === mapGroupName.toLowerCase() )
						{	                           
							tile.checked = false;
						}
					} );
				} );
			}
        }
        
        _MatchMapSelectionWithQuickSelect();

		if ( _CheckContainerHasAnyChildChecked( _GetMapListForServerTypeAndGameMode( m_activeMapGroupSelectionPanelID )) )
		{ 
			_ApplySessionSettings();
		}
	};

	var _ShowActiveMapSelectionTab = function( isEnabled )
	{
		var panelID = m_activeMapGroupSelectionPanelID;

		for ( var key in m_mapSelectionButtonContainers )
		{
			if ( key !== panelID )
			{
				m_mapSelectionButtonContainers[key].AddClass( "hidden" );
			}
			else
			{
				                               
				m_mapSelectionButtonContainers[key].RemoveClass( "hidden" );
				m_mapSelectionButtonContainers[key].visible = true;

				                                         
				m_mapSelectionButtonContainers[key].enabled = isEnabled;
			}
		}

		var isWorkshop = panelID === k_workshopPanelId;
		$( '#WorkshopSearchBar' ).visible = isWorkshop;
		$( '#GameModeSelectionRadios' ).visible = !isWorkshop;

		                                         
		$( '#WorkshopVisitButton' ).visible = isWorkshop && !m_bPerfectWorld;
		$( '#WorkshopVisitButton' ).enabled = SteamOverlayAPI.IsEnabled();
	};

	function _GetMapTileContainer ()
	{
		var elMapGroupContainer = $.GetContextPanel().FindChildInLayoutFile( _GetMapGroupPanelID( m_serverSetting, m_gameModeSetting, m_singleSkirmishMapGroup ) );
		
		if ( m_gameModeSetting === 'competitive' && _IsValveOfficialServer( m_serverSetting ) )
			return _GetCreateMapListSection( "comp", elMapGroupContainer );
		else
			return elMapGroupContainer;
	}



                                                                          
    function _OnMapQuickSelect ( mgName )
    {
                                                  
        var arrMapsToSelect = _GetMapsFromQuickSelectMapGroup( mgName );
        var bScrolled = false;

		var prevSelection = _GetSelectedMapsForServerTypeAndGameMode( m_serverSetting, m_gameModeSetting, true );
		
		var elMapGroupContainer = _GetMapTileContainer();
        elMapGroupContainer.Children().forEach( function ( elMapBtn )
        {
            var bFound = false;

                                                              
            if ( mgName === "all" )
            {
                bFound = true;
            }
            else if ( mgName === "none" )
            {
                bFound = false;
            }
            else
            {
                arrMapsToSelect.forEach( function ( mapname )
                {
                    if ( elMapBtn.GetAttributeString( "mapname", "" ) == mapname )
                    {
                        bFound = true;
                    }
                } );
            }

            elMapBtn.checked = bFound;

                                       
            if ( bFound && !bScrolled )
            {
                elMapBtn.ScrollParentToMakePanelFit( 2, false );
                bScrolled = true;
            }
        } );

                                   
        var newSelection = _GetSelectedMapsForServerTypeAndGameMode( m_serverSetting, m_gameModeSetting, true );
        if ( prevSelection != newSelection )
        {
            $.DispatchEvent( 'PlaySoundEffect', 'submenu_leveloptions_select', 'MOUSE' );

                                         
            _MatchMapSelectionWithQuickSelect();

            if ( _CheckContainerHasAnyChildChecked( _GetMapListForServerTypeAndGameMode( m_activeMapGroupSelectionPanelID )) )
            { 
                _ApplySessionSettings();
            }
        }
    }


	                                                                
	function _ValidateMaps ( arrMapList )
	{
		var arrMapTileNames = [];

                                             
		var arrMapButtons = _GetMapListForServerTypeAndGameMode( m_activeMapGroupSelectionPanelID );
		arrMapButtons.forEach( elMapTile => arrMapTileNames.push( elMapTile.GetAttributeString( "mapname", "" )));

                                                                     
		var filteredMapList = arrMapList.filter( strMap => arrMapTileNames.includes( strMap ) );

		return filteredMapList;
	}


    function _GetMapsFromQuickSelectMapGroup ( mgName )
	{
        if ( mgName === ( "favorites" ) )
        {
            var mapsAsString = GameInterfaceAPI.GetSettingString( 'ui_playsettings_custom_preset' );
			if ( mapsAsString === '' )
				return [];
			else
			{
				var arrMapList = mapsAsString.split( ',' );
				var filteredMapList = _ValidateMaps( arrMapList );

				                      
				if ( arrMapList.length != filteredMapList.length )
					GameInterfaceAPI.SetSettingString( 'ui_playsettings_custom_preset', filteredMapList.length > 0 ? filteredMapList.join(',') : "" );
				
				return filteredMapList;
			}
        }
        else
		{
			var mapsAsObject = GetMGDetails( mgName ) ? GetMGDetails( mgName ).maps : {};
            return Object.keys( mapsAsObject );
        }
    }

                                                                                     
    function _MatchMapSelectionWithQuickSelect ()
	{
                                               
        var elQuickSelectContainer = $.GetContextPanel().FindChildInLayoutFile( "jsQuickSelectionSetsContainer" );
		if ( !elQuickSelectContainer || m_isWorkshop )
            return;

        elQuickSelectContainer.Children().forEach( function ( elQuickBtn, index, aMapGroups )
        {
                                            
            var arrQuickSelectMaps = _GetMapsFromQuickSelectMapGroup( elQuickBtn.id );

            var bMatch = true;

                                                                                   
			var elMapGroupContainer = _GetMapTileContainer();

            for ( var i = 0; i < elMapGroupContainer.Children().length; i++ )
            {
                var elMapBtn = elMapGroupContainer.Children()[ i ];
                var mapName = elMapBtn.GetAttributeString( "mapname", "" );

                if ( elQuickBtn.id == "none" )
                {
                    if ( elMapBtn.checked )
                    {
                        bMatch = false;
                        break;
                    }
                } else if ( elQuickBtn.id == "all" )
                {
                    if ( !elMapBtn.checked )
                    {
                        bMatch = false;
                        break;
                    }
                } else
                {
                    if ( elMapBtn.checked != ( arrQuickSelectMaps.includes( mapName ) ) )
                    {
                        bMatch = false;
                        break;
                    }
                }
            }

            elQuickBtn.SetHasClass( "match", bMatch );
        } );
    }

	var _LazyCreateMapListPanel = function( serverType, gameMode, singleSkirmishMapGroup )
	{
		                                                                
		var strRequireTagNameToReuse = null;
		var strRequireTagValueToReuse = null;

		if ( ( gameMode === "cooperative" ) || ( gameMode === "coopmission" ) )
		{
			strRequireTagNameToReuse = 'map-selection-quest-id';
			strRequireTagValueToReuse = '' + GetMatchmakingQuestId();
		}

		var panelID = _GetMapGroupPanelID( serverType, gameMode, singleSkirmishMapGroup );
		if ( panelID in m_mapSelectionButtonContainers )
		{
			var bAllowReuseExistingContainer = true;
			var elExistingContainer = m_mapSelectionButtonContainers[ panelID ];
			if ( elExistingContainer && strRequireTagNameToReuse )
			{
				var strExistingTagValue = elExistingContainer.GetAttributeString( strRequireTagNameToReuse, '' );
				bAllowReuseExistingContainer = ( strExistingTagValue === strRequireTagValueToReuse );
			}

			                                                          
			var elFriendLeaderboards = elExistingContainer ? elExistingContainer.FindChildTraverse( "FriendLeaderboards" ) : null;
			if ( elFriendLeaderboards )
			{
				var strEmbeddedLeaderboardName = elFriendLeaderboards.GetAttributeString( "type", null );
				if ( strEmbeddedLeaderboardName )
				{
					LeaderboardsAPI.Refresh( strEmbeddedLeaderboardName );
				}
			}

			if ( bAllowReuseExistingContainer )
				return panelID;	                                                                
			else
				elExistingContainer.DeleteAsync( 0.0 );                                                         
		}
				
		var container = $.CreatePanel( "Panel", $( '#MapSelectionList' ), panelID, {
			class: 'map-selection-list hidden'
		} );

		                                                                                                                 
		m_mapSelectionButtonContainers[ panelID ] = container;

		                                                                
		var strSnippetNameOverride = "MapSelectionContainer_" + serverType + "_" + gameMode;
		if ( container.BHasLayoutSnippet( strSnippetNameOverride ) )
		{	                                               
			                                                                                                                                                              
			container.BLoadLayoutSnippet( strSnippetNameOverride );
			var elMapTile = container.FindChildTraverse( "MapTile" );
			elMapTile.BLoadLayoutSnippet( "MapGroupSelection" );
			_LoadLeaderboardsLayoutForContainer( container );
		}
		else
		{	                                                                                 
			strSnippetNameOverride = null;
		}

		                                                                                               
		if ( strRequireTagNameToReuse )
		{
			container.SetAttributeString( strRequireTagNameToReuse, strRequireTagValueToReuse );
		}

		var isPlayingOnValveOfficial = _IsValveOfficialServer( serverType );
		var arrMapGroups = _GetAvailableMapGroups( gameMode, isPlayingOnValveOfficial );
		
		if ( gameMode === 'skirmish' && m_singleSkirmishMapGroup )
		{
			_UpdateOrCreateMapGroupTile( m_singleSkirmishMapGroup, container, null, panelID + m_singleSkirmishMapGroup );
		}
		else
		{
			arrMapGroups.forEach( function( item, index, aMapGroups )
			{
				if ( gameMode === 'skirmish' && m_arrSingleSkirmishMapGroups.includes( aMapGroups[ index ] ) )
				{
					return;
				}
				var elSectionContainer = null;
				if ( gameMode === 'competitive' && _IsValveOfficialServer( m_serverSetting ) )
				{
					container.AddClass( 'map-selection-list--competitive-section-container' );
					container.SetAttributeString( 'hassections', 'true' );
					elSectionContainer = _GetCreateMapListSection( 'comp', container );
				}
				else
				{
					elSectionContainer = container;
					if ( strSnippetNameOverride )
						elSectionContainer = container.FindChildTraverse( "MapTile" );
				}
			
				_UpdateOrCreateMapGroupTile( aMapGroups[ index ], elSectionContainer, null, panelID + aMapGroups[ index ] );
			} );
		}

		                                                                          
		container.OnPropertyTransitionEndEvent = function( panelName, propertyName )
		{
			if ( container.id === panelName && propertyName === 'opacity' &&
				!container.id.startsWith( "FriendLeaderboards" ) )
			{
				                                         
				if ( container.visible === true && container.BIsTransparent() )
				{
					container.visible = false;
					return true;
				}
			}
			return false;
		};

		$.RegisterEventHandler( 'PropertyTransitionEnd', container, container.OnPropertyTransitionEndEvent );

		return panelID;
	};

    function _PopulateQuickSelectBar ( isSearching , isHost  )
    {
                                                                  
                                       
        var arrQuickSelectSets = _GetAvailableQuickSelectMapGroups(  );
        var elQuickSelectContainer = $.GetContextPanel().FindChildInLayoutFile( "jsQuickSelectionSetsContainer" );
		if ( !elQuickSelectContainer )
            return;

		elQuickSelectContainer.RemoveAndDeleteChildren();
		
		if ( m_isWorkshop )
			return;

        arrQuickSelectSets.forEach( function ( mgName )
        {
            var elSetBtn = $.CreatePanel( "Button", elQuickSelectContainer, mgName );
            elSetBtn.BLoadLayoutSnippet( "QuickSelectionSetButtonSnippet" );

            var oMG = GetMGDetails( mgName );
            elSetBtn.SetDialogVariable( "quick-selection-set-name", $.Localize( oMG.nameID ) );

            elSetBtn.SetPanelEvent( "onactivate", _OnMapQuickSelect.bind( this, mgName ) );
        } );

        _MatchMapSelectionWithQuickSelect( );
		_EnableDisableQuickSelectBtns( isSearching , isHost );
    }

	function _EnableDisableQuickSelectBtns ( isSearching, isHost )
	{
		var bEnable = !isSearching && isHost;

		var aBtns = $.GetContextPanel().FindChildInLayoutFile( "jsQuickSelectionSetsContainer" ).Children();
		var aOtherBtns = [ 
			$.GetContextPanel().FindChildInLayoutFile( "jsQuickSelectionFavoritesSet" ),
			$.GetContextPanel().FindChildInLayoutFile( "jsQuickSelectAll" ),
			$.GetContextPanel().FindChildInLayoutFile( "jsQuickClearAll" ),
			$.GetContextPanel().FindChildInLayoutFile( "jsQuickSelectionSave" )
		];

		aBtns = aBtns.concat(aOtherBtns);
		aBtns.forEach( element => {
			element.enabled = bEnable;
		});
	}

	function _SaveMapSelectionToCustomPreset ( bSilent = false )
    {
		var selectedMaps = _GetSelectedMapsForServerTypeAndGameMode( m_serverSetting, m_gameModeSetting, true );
		if ( selectedMaps === "" )
		{
  			               
  				                                                                            
			
			_NoMapSelectedPopup();

			return;
		}

        GameInterfaceAPI.SetSettingString( 'ui_playsettings_custom_preset', selectedMaps );

		if ( !bSilent )
		{
			$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.generic_button_press', 'MOUSE' );
			$.GetContextPanel().FindChildInLayoutFile( "jsQuickSelectionSave" ).TriggerClass( 'save');
		}

        _MatchMapSelectionWithQuickSelect();
    }

	var _GetCreateMapListSection = function( type, container )
	{
		var elSectionContainer = container.FindChildInLayoutFile( m_gameModeSetting + '-maps-section-' + type );

		if ( !elSectionContainer )
		{
			elSectionContainer = $.CreatePanel( 'Panel', container, m_gameModeSetting + '-maps-section-' + type );
			
			container.AddClass( 'has-selection-list-section--type-' + type );
			elSectionContainer.AddClass( 'map-selection-list-section--type-' + type );
			
			elSectionContainer.SetHasClass( 'map-selection-list-section--single-column', ( type === 'unranked' ) || ( type === 'capt' ) );
			elSectionContainer.BLoadLayoutSnippet( "MapListSection" );
		}

		return elSectionContainer;
	};

	var _GetPanelTypeForMapGroupTile = function( gameMode, singleSkirmishMapGroup )
	{
		var bIsCompetitive = gameMode === 'competitive';
		var bIsSkirmish = gameMode === 'skirmish' && !singleSkirmishMapGroup;
		var bIsWingman = gameMode === 'scrimcomp2v2';

		return ( ( ( bIsCompetitive || bIsSkirmish || bIsWingman ) && _IsValveOfficialServer( m_serverSetting ) ) ? "ToggleButton" : "RadioButton" );
	};

	var _UpdateOrCreateMapGroupTile = function( mapGroupName, container, elTilePanel, newTileID )
	{
		var mg = GetMGDetails( mapGroupName );
		if ( !mg ) 
			return;

		var p = elTilePanel;                                                            

		if ( !p )
		{
			var panelType = _GetPanelTypeForMapGroupTile( m_gameModeSetting, m_singleSkirmishMapGroup );
			var panelID = newTileID ? newTileID : ( container.id + mapGroupName );
			p = $.CreatePanel( panelType, container, panelID );
			p.BLoadLayoutSnippet( "MapGroupSelection" );
			if ( panelType === "RadioButton" )
			{
				                             
				var radioGroupID;
				if ( panelID.endsWith( mapGroupName ) )
					radioGroupID = panelID.substring( 0, panelID.length - mapGroupName.length );
				else
					radioGroupID = container.id;

				p.group = "radiogroup_" + radioGroupID;
			}
		}

		p.SetAttributeString( "mapname", mapGroupName );
		p.SetPanelEvent( 'onactivate', _OnActivateMapOrMapGroupButton.bind( this, p ) );

		p.SetHasClass( 'map-selection-btn-activedutymap', mg.grouptype === 'active' );
		p.FindChildInLayoutFile( 'ActiveGroupIcon' ).visible = mg.grouptype === 'active';
		p.FindChildInLayoutFile( 'MapGroupName' ).text = $.Localize( mg.nameID );

		var keysList = Object.keys( mg.maps );
		var mapIcon = null;
		var mapImage = null;

		if ( p.GetParent().id === 'MapTile' )
		{
			p.AddClass( 'map-selection-btn--full' );
		}

		                                           
		if ( keysList.length > 1 )
		{
			p.AddClass( 'map-selection-btn--large' );
			p.FindChildInLayoutFile( 'MapSelectionButton' ).AddClass( 'map-selection-btn-container--large' );
			p.FindChildInLayoutFile( 'MapGroupName' ).AddClass( 'fontSize-m' );
		}
		else
		{
			if ( m_gameModeSetting === 'survival' && _IsValveOfficialServer( m_serverSetting ) )
			{
				if ( MyPersonaAPI.GetLauncherType() === "perfectworld" )
				{
					p.FindChildInLayoutFile( 'MapGroupBetaTag' ).RemoveClass( 'hidden' );
				}
			}
			
			var iconPath = mapGroupName === 'random' ? 'file://{images}/icons/ui/random.svg' : 'file://{images}/' + mg.icon_image_path + '.svg';
			var iconSize = GetIconSize();
			var mapGroupIcon = p.FindChildInLayoutFile( 'MapSelectionButton' ).FindChildInLayoutFile( 'MapGroupCollectionIcon' );

			if ( mapGroupIcon )
			{
				mapGroupIcon.SetImage( iconPath );
			}
			else
			{
				mapGroupIcon = $.CreatePanel( 'Image', p.FindChildInLayoutFile( 'MapSelectionButton' ), 'MapGroupCollectionIcon', {
					defaultsrc: 'file://{images}/map_icons/map_icon_NONE.png',
					texturewidth: iconSize,
					textureheight: iconSize,
					src: iconPath,
					class: 'map-selection-btn__map-icon'
				} );
				p.FindChildInLayoutFile( 'MapSelectionButton' ).MoveChildBefore( mapGroupIcon, p.FindChildInLayoutFile( 'MapGroupCollectionMultiIcons' ) );
			}

			function GetIconSize()
			{
				if ( m_gameModeSetting === 'survival' )
					return '256'
				else if ( m_gameModeSetting === 'cooperative' )
					return '256'
				else if ( m_gameModeSetting === 'coopmission' )
					return '256'
					
				return '116';
			}
		}

		if ( mapGroupName === 'random' )
		{
			mapImage = p.FindChildInLayoutFile( 'MapGroupImagesCarousel' ).FindChildInLayoutFile( 'MapSelectionScreenshot' );

			if ( !mapImage )
			{
				mapImage = $.CreatePanel( 'Panel', p.FindChildInLayoutFile( 'MapGroupImagesCarousel' ), 'MapSelectionScreenshot' );
				mapImage.AddClass( 'map-selection-btn__screenshot' );
			}

			mapImage.style.backgroundImage = 'url("file://{images}/map_icons/screenshots/360p/random.png")';
			mapImage.style.backgroundPosition = '50% 0%';
			mapImage.style.backgroundSize = 'auto 100%';
		}
		
		_SetMapGroupModifierLabelElements( mapGroupName, p );

		                              
		var numImagesPerMultiIconRow = ( keysList.length > 6 ) ? 2 : 1;
		for ( var i = 0; i < keysList.length; i++ )
		{
			mapImage = p.FindChildInLayoutFile( 'MapGroupImagesCarousel' ).FindChildInLayoutFile( 'MapSelectionScreenshot' + i );
			if ( !mapImage )
			{
				mapImage = $.CreatePanel( 'Panel', p.FindChildInLayoutFile( 'MapGroupImagesCarousel' ), 'MapSelectionScreenshot' + i );
				mapImage.AddClass( 'map-selection-btn__screenshot' );
			}
			
			if ( m_gameModeSetting === 'survival' )
			{
				mapImage.style.backgroundImage = 'url("file://{resources}/videos/' + keysList[ i ] + '_preview.webm")';
			}
			else
			{
				mapImage.style.backgroundImage = 'url("file://{images}/map_icons/screenshots/360p/' + keysList[ i ] + '.png")';
			}
			mapImage.style.backgroundPosition = '50% 0%';
			mapImage.style.backgroundSize = 'auto 100%';

			                               
			if ( keysList.length > 1 )
			{
				                                   

				var mapIconsContainer = p.FindChildInLayoutFile( 'MapGroupCollectionMultiIcons' );
				if ( numImagesPerMultiIconRow > 1 )
				{
					var subContainerID = 'MultiIconsSubPanel' + Math.floor( i / numImagesPerMultiIconRow );
					var subPanel = mapIconsContainer.FindChildTraverse( subContainerID );
					if ( !subPanel )
					{
						subPanel = $.CreatePanel( 'Panel', mapIconsContainer, subContainerID );
						subPanel.AddClass( 'map-selection-btn__groupmap-icons-subcontainer' );
					}
					mapIconsContainer = subPanel;
				}

				var subMapIconImagePanelID = 'MapIcon' + i;
				mapIcon = mapIconsContainer.FindChildInLayoutFile( subMapIconImagePanelID );
				if ( !mapIcon )
				{
					mapIcon = $.CreatePanel( 'Image', mapIconsContainer, subMapIconImagePanelID, {
						defaultsrc: 'file://{images}/map_icons/map_icon_NONE.png',
						texturewidth: '72',
						textureheight: '72',
						src: 'file://{images}/map_icons/map_icon_' + keysList[ i ] + '.svg'
					} );
						
				}

				mapIcon.AddClass( 'map-selection-btn__map-icon' );
				mapIcon.AddClass( 'map-selection-btn__map-icon-small' );

				IconUtil.SetupFallbackMapIcon( mapIcon, 'file://{images}/map_icons/map_icon_' + keysList[ i ] );
			}
		}

		if ( numImagesPerMultiIconRow > 1 )
		{	                                                     
			p.FindChildInLayoutFile( 'MapGroupCollectionMultiIcons' ).AddClass( 'map-selection-btn__groupmap-icons-2x' );
		}

		          
		if ( mg.tooltipID )
		{
			p.SetPanelEvent( 'onmouseover', OnMouseOverMapTile.bind( undefined, p.id, mg.tooltipID, keysList ) );
			p.SetPanelEvent( 'onmouseout', OnMouseOutMapTile );
		}

		return p;
	};

	var OnMouseOverMapTile = function( id, tooltipText, mapsList )
	{
		tooltipText = $.Localize( tooltipText );

		var mapNamesList = [];

		if ( mapsList.length > 1 )
		{
			mapsList.forEach( function( element )
			{
				mapNamesList.push( $.Localize( 'SFUI_Map_' + element ) );
			} );

			var mapGroupsText = mapNamesList.join( ', ' );
			tooltipText = tooltipText + '<br><br>' + mapGroupsText;
		}

		UiToolkitAPI.ShowTextTooltip( id, tooltipText );
	};

	var OnMouseOutMapTile = function()
	{
		UiToolkitAPI.HideTextTooltip();
	};

	var m_timerMapGroupHandler = null;

	var _GetRotatingMapGroupStatus = function( gameMode, singleSkirmishMapGroup, mapgroupname )
	{
		m_timerMapGroupHandler = null;
		var strSchedule = CompetitiveMatchAPI.GetRotatingOfficialMapGroupCurrentState( gameMode, mapgroupname );
		var elTimer = m_mapSelectionButtonContainers[ m_activeMapGroupSelectionPanelID ].FindChildInLayoutFile( 'PlayMenuMapRotationTimer' );

		if ( elTimer )
		{
			if ( strSchedule )
			{
				var strCurrentMapGroup = strSchedule.split( "+" )[ 0 ];
				var numSecondsRemaining = strSchedule.split( "+" )[ 1 ].split( "=" )[ 0 ];
				var strNextMapGroup = strSchedule.split( "=" )[ 1 ];
				var numWait = FormatText.SecondsToDDHHMMSSWithSymbolSeperator( numSecondsRemaining );

				if ( !numWait )
				{
					elTimer.SetHasClass( 'hidden' );
					return;
				}

				elTimer.RemoveClass( 'hidden' );
				elTimer.SetDialogVariable( 'map-rotate-timer', numWait );

				var mg = GetMGDetails( strNextMapGroup );
				elTimer.SetDialogVariable( 'next-mapname', $.Localize( mg.nameID ) );	

				                               
				                                                                                                 
				var mapGroupPanelID = _GetMapGroupPanelID( m_serverSetting, gameMode, singleSkirmishMapGroup ) + strCurrentMapGroup;
				var mapGroupContainer = m_mapSelectionButtonContainers[ m_activeMapGroupSelectionPanelID ].FindChildTraverse( 'MapTile' );

				var mapGroupPanel = mapGroupContainer.FindChildInLayoutFile( mapGroupPanelID );
				if ( !mapGroupPanel )
				{
					mapGroupContainer.RemoveAndDeleteChildren();
					var btnMapGroup = _UpdateOrCreateMapGroupTile( strCurrentMapGroup, mapGroupContainer, null, mapGroupPanelID );
					
					                                                                            
					btnMapGroup.checked = true;
					_UpdateSurvivalAutoFillSquadBtn( m_gameModeSetting );
				}

				m_timerMapGroupHandler = $.Schedule( 1, _GetRotatingMapGroupStatus.bind( undefined, gameMode, singleSkirmishMapGroup, mapgroupname ) );
				                                                                                                                                                                                                     
			}
			else
			{
				elTimer.SetHasClass( 'hidden' );
			}
		}
	};

	var _StartRotatingMapGroupTimer = function()
	{
		_CancelRotatingMapGroupSchedule();
		
		if ( m_gameModeSetting && m_gameModeSetting === "survival"
			&& m_mapSelectionButtonContainers && m_mapSelectionButtonContainers[ m_activeMapGroupSelectionPanelID ]
			&& m_mapSelectionButtonContainers[ m_activeMapGroupSelectionPanelID ].Children() )
		{
			var btnSelectedMapGroup = m_mapSelectionButtonContainers[ m_activeMapGroupSelectionPanelID ].Children().filter( entry => entry.GetAttributeString( 'mapname', '' ) !== '' );

			if ( btnSelectedMapGroup[ 0 ] )
			{ 
				var mapSelectedGroupName = btnSelectedMapGroup[ 0 ].GetAttributeString( 'mapname', '' );
				if ( mapSelectedGroupName )
				{
					_GetRotatingMapGroupStatus( m_gameModeSetting, m_singleSkirmishMapGroup, mapSelectedGroupName );
				}
			}
		}
	};

	var _CancelRotatingMapGroupSchedule = function()
	{
		if ( m_timerMapGroupHandler )
		{
			$.CancelScheduled( m_timerMapGroupHandler );
			                                                                        
			m_timerMapGroupHandler = null;
		}
	};

	var _SetMapGroupModifierLabelElements = function( mapName, elMapPanel )
	{
		var isUnrankedCompetitive = ( m_gameModeSetting === 'competitive' ) && _IsValveOfficialServer( m_serverSetting ) && ( GameTypesAPI.GetMapGroupAttribute( mapName, 'competitivemod' ) === 'unranked' );
		var isNew = !isUnrankedCompetitive  && ( GameTypesAPI.GetMapGroupAttribute( mapName, 'showtagui' ) === 'new' );

		elMapPanel.FindChildInLayoutFile( 'MapGroupNewTag' ).SetHasClass( 'hidden', !isNew || mapName === "mg_lobby_mapveto");
		elMapPanel.FindChildInLayoutFile( 'MapGroupNewTagYellowLarge' ).SetHasClass( 'hidden', mapName !== "mg_lobby_mapveto" );
		elMapPanel.FindChildInLayoutFile( 'MapSelectionTopRowIcons' ).SetHasClass( 'tall', mapName === "mg_lobby_mapveto" );

		elMapPanel.FindChildInLayoutFile( 'MapGroupUnrankedTag' ).SetHasClass( 'hidden', !isUnrankedCompetitive );
	};

	var _ReloadLeaderboardLayoutGivenSettings = function ( container, lbName, strTitleOverride, strPointsTitle )
	{
		var elFriendLeaderboards = container.FindChildTraverse( "FriendLeaderboards" );
		                                                                                                                                                                                   
		elFriendLeaderboards.SetAttributeString( "type", lbName );
		if ( strPointsTitle )
			elFriendLeaderboards.SetAttributeString( "points-title", strPointsTitle );

		if ( strTitleOverride )
			elFriendLeaderboards.SetAttributeString( "titleoverride", strTitleOverride );

		elFriendLeaderboards.BLoadLayout('file://{resources}/layout/popups/popup_leaderboards.xml', true, false);
		elFriendLeaderboards.AddClass( 'leaderboard_embedded' );
		elFriendLeaderboards.AddClass( 'play_menu_survival' );
		elFriendLeaderboards.RemoveClass( 'Hidden' );
	}

	var _LoadLeaderboardsLayoutForContainer = function( container )
	{
		if ( ( m_gameModeSetting === "cooperative" ) || ( m_gameModeSetting === "coopmission" ) )
		{
			var questID = GetMatchmakingQuestId();
			if ( questID > 0 )
			{
				var lbName = "official_leaderboard_quest_" + questID;
				var elFriendLeaderboards = container.FindChildTraverse( "FriendLeaderboards" );
				if ( elFriendLeaderboards.GetAttributeString( "type", null ) !== lbName  )
				{
					var strTitle = '#CSGO_official_leaderboard_mission_embedded';
					                                                                         
					_ReloadLeaderboardLayoutGivenSettings( container, lbName, strTitle );
				}

				var elDescriptionLabel = container.FindChildTraverse( "MissionDesc" );
				elDescriptionLabel.text = MissionsAPI.GetQuestDefinitionField( questID, "loc_description" )
				MissionsAPI.ApplyQuestDialogVarsToPanelJS( questID, container );
				var arrGameElements = OperationUtil.GetQuestGameElements( questID );
				if ( arrGameElements.length > 0 )
				{
					var elIconContainer = container.FindChildTraverse( "GameElementIcons" );
					arrGameElements.forEach( function ( info, idx )
					{
						$.CreatePanel( 'Image', elIconContainer, 'GameElementIcon_' + idx, {
							texturewidth: 64,
							textureheight: 64,
							src: info.icon,
							class: 'coop-mission__icon'
						} );
					} );
				}
			}
		}
		else if ( m_gameModeSetting === "survival" )
		{
			                                                                          
		}
	}

	var _UpdateMapGroupButtons = function( isEnabled, isSearching, isHost )
	{
		var panelID = _LazyCreateMapListPanel( m_serverSetting, m_gameModeSetting, m_singleSkirmishMapGroup );
		
		                                    
		if ( ( m_gameModeSetting === 'competitive' || m_gameModeSetting === 'scrimcomp2v2' ) && _IsPlayingOnValveOfficial() )
		{
			_UpdateWaitTime( _GetMapListForServerTypeAndGameMode(  panelID ) );
		}

		_SetEnabledStateForMapBtns( m_mapSelectionButtonContainers[ panelID ], isSearching, isHost );

		                    
		m_activeMapGroupSelectionPanelID = panelID;
		_ShowActiveMapSelectionTab( isEnabled );

        _PopulateQuickSelectBar( isSearching, isHost );
    };

	var _SelectMapButtonsFromSettings = function( settings )
	{
		                                                                 
		var mapsGroups = settings.game.mapgroupname.split( ',' );
		var aListMaps = _GetMapListForServerTypeAndGameMode( m_activeMapGroupSelectionPanelID );
		aListMaps.forEach( function( e )
		{
			                                                                      
			var mapName = e.GetAttributeString( "mapname", "invalid" );
			e.checked = mapsGroups.includes( mapName );
		} );
	};

	var _ShowHideStartSearchBtn = function( isSearching, isHost )
	{
		let bShow = !isSearching && isHost ? true : false;
		var btnStartSearch = $.GetContextPanel().FindChildInLayoutFile( 'StartMatchBtn' );

		                                                                    
		                                                                                        
		                                                 
		if ( bShow )
		{
			if ( btnStartSearch.BHasClass( 'pressed' ) )
			{
				btnStartSearch.RemoveClass( 'pressed' );
			}

			btnStartSearch.RemoveClass( 'hidden' );
		}
		                                                                                                     
		                                            
		else if ( !btnStartSearch.BHasClass( 'pressed' ) )
		{
			btnStartSearch.AddClass( 'hidden' );
		}

		  
		                                                     
		  
		let panelPlayMenuControlLobbyUserIcons = $.GetContextPanel().FindChildInLayoutFile( 'PlayMenuControlLobbyUserIcons' );
		let numStyleToShow = 0;
		if ( !isSearching && ( m_gameModeSetting === 'competitive' ) &&
			_IsPlayingOnValveOfficial() && ( PartyListAPI.GetCount() >= PartyListAPI.GetPartySessionUiThreshold() ) )
		{
			numStyleToShow = PartyListAPI.GetCount();
			if ( ( numStyleToShow > 5 ) || ( 0 == PartyListAPI.GetPartySessionUiThreshold() ) )
			{	                                                                                                           
				numStyleToShow = 5;
			}
		}
		numStyleToShow = 0;                                    
		for ( let j = 1; j <= 5; ++ j )
		{
			panelPlayMenuControlLobbyUserIcons.SetHasClass( 'play-menu-controls-lobby-count-' + j, j <= numStyleToShow );
		}
		panelPlayMenuControlLobbyUserIcons.SetHasClass( 'play-menu-controls-lobby-count-host', isHost );
	};

	var _ShowCancelSearchButton = function( isSearching, isHost )
	{
		var btnCancel= $.GetContextPanel().FindChildInLayoutFile( 'PartyCancelBtn' );
		                                                                 
		btnCancel.enabled = ( isSearching && isHost );
	};

	var _UpdatePrimeBtn = function( isSearching, isHost )
	{
		var elPrimePanel = $( '#PrimeStatusPanel' );
		var elGetPrimeBtn = $( '#id-play-menu-get-prime' );
		var elTooglePrimeBtn = $( '#id-play-menu-toggle-prime' );
		var elTextNA = $('#PrimeStatusLabelNA');
		var isPrime = m_serverPrimeSetting === 1 ? true : false;

		                                                                                  
		if ( !_IsPlayingOnValveOfficial() || !MyPersonaAPI.IsInventoryValid() )
		{
			elPrimePanel.visible = false;
			return;
		}

		var btnText = '';
		var tooltipText = '';
		var LocalPlayerHasPrime = PartyListAPI.GetFriendPrimeEligible( MyPersonaAPI.GetXuid() );

		elPrimePanel.SetHasClass( 'play-menu-prime-logo-bg', LocalPlayerHasPrime );
		elPrimePanel.visible = true;
		elGetPrimeBtn.visible = !LocalPlayerHasPrime;
		elTooglePrimeBtn.visible = LocalPlayerHasPrime;
		elTextNA.visible = false;

		elTooglePrimeBtn.checked = isPrime ? true : false;

		if (!LocalPlayerHasPrime )
		{
			               
			                                                                                                                           
			                                
			    
			   	                                                 
			    
			       
			    
			   	                                                                                                                                                              
			   	                                                                                                    
			    

			btnText = "#elevated_status_btn";

			var sPrice = StoreAPI.GetStoreItemSalePrice( InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( 1353, 0 ), 1, '' );
			elGetPrimeBtn.SetDialogVariable( "price", sPrice ? sPrice : '$0' );

			elGetPrimeBtn.SetPanelEvent( 'onactivate', function()
			{
				UiToolkitAPI.HideTextTooltip();
				UiToolkitAPI.ShowCustomLayoutPopup( 'prime_status', 'file://{resources}/layout/popups/popup_prime_status.xml' );
			} );
		}
		else
		{
			                                                
			                                                                               
			if( !SessionUtil.DoesGameModeHavePrimeQueue( m_gameModeSetting ) )
			{
				elTextNA.visible = true;
				elTooglePrimeBtn.visible = false;

				if ( SessionUtil.AreLobbyPlayersPrime() )
				{
					tooltipText = '#tooltip_prime_na';
					btnText = "#elevated_status_toggle_non_prime";
					elTextNA.BHasClass( 'disabled', false );
				}
				else
				{
					                                         
					var oPrimeMembers = _GetPrimePartyMembers();
					elTextNA.SetDialogVariableInt( 'prime_members', oPrimeMembers.prime );
					elTextNA.SetDialogVariableInt('total', oPrimeMembers.total );
					tooltipText = '#tooltip_prime-lobby_has_nonprime_player_na';
					btnText = "#SFUI_Elevated_Status_disabled_party_count";
					elTextNA.BHasClass( 'disabled', true );
				}

				elTextNA.SetPanelEvent( 'onmouseover', function() { UiToolkitAPI.ShowTextTooltip( elTextNA.id, tooltipText ); } );
				elTextNA.SetPanelEvent( 'onmouseout', function() { UiToolkitAPI.HideTextTooltip(); } );

				elTextNA.text = $.Localize( btnText, elTextNA );
			}
			else
			{
				elTooglePrimeBtn.visible = true;
				
				if ( SessionUtil.AreLobbyPlayersPrime() )
				{
					tooltipText = isPrime ? '#tooltip_prime_only_2' : '#tooltip_prime_non_prime_search';
					elTooglePrimeBtn.enabled = ( isHost && !isSearching ) ? true : false;

					btnText = elTooglePrimeBtn.checked ? "#elevated_status_toggle_prime_only" : "#elevated_status_toggle_prime_all";
				}
				else{
					                                         
					var oPrimeMembers = _GetPrimePartyMembers();
					elTooglePrimeBtn.SetDialogVariableInt( 'prime_members', oPrimeMembers.prime );
					elTooglePrimeBtn.SetDialogVariableInt('total', oPrimeMembers.total );
					elTooglePrimeBtn.enabled = false;

					tooltipText = '#tooltip_prime-lobby_has_nonprime_player';
					btnText = "#SFUI_Elevated_Status_disabled_party_count";
				}

				elTooglePrimeBtn.SetPanelEvent( 'onmouseover', function() { UiToolkitAPI.ShowTextTooltip( elTooglePrimeBtn.id, tooltipText ); } );
				elTooglePrimeBtn.SetPanelEvent( 'onmouseout', function() { UiToolkitAPI.HideTextTooltip(); } );

				elTooglePrimeBtn.text = $.Localize( btnText, elTooglePrimeBtn );
			}
		}
	};

	var _GetPrimePartyMembers = function()
	{
		var count = PartyListAPI.GetCount();
		var primeMembers = 0;

		for( var i = 0; i < count; i++ )
		{
			var xuid = PartyListAPI.GetXuidByIndex( i );
			if( PartyListAPI.GetFriendPrimeEligible( xuid ) )
			{
				primeMembers++;
			}
		}

		return { prime: primeMembers, total: count };
	}

	var _IsPrimeChecked = function()
	{
		return $( '#id-play-menu-toggle-prime' ).checked;
	};

	var _UpdatePermissionBtnText = function( settings, isEnabled )
	{
		var elBtn = $( '#PermissionsSettings' );
		var displayText = '';

		var elLockImg = $.GetContextPanel().FindChildInLayoutFile( 'PermissionsSettingsImg' );
		if ( settings.system.access === 'public' )
		{
			displayText = '#permissions_' + settings.system.access;
			elLockImg.SetImage( "file://{images}/icons/ui/unlockedwide.svg" );
		}
		else
		{
			displayText = '#permissions_' + settings.system.access;
			elLockImg.SetImage( "file://{images}/icons/ui/locked.svg" );
		}

		elBtn.FindChild( 'PermissionsSettingsLabel' ).text = $.Localize( displayText ).toUpperCase();

		                                           
		elBtn.enabled = isEnabled;
	};

	function GetMatchmakingQuestId()
	{
		var settings = LobbyAPI.GetSessionSettings();
		if ( settings && settings.game && settings.game.questid )
			return parseInt( settings.game.questid );
		else
			return 0;
	}

	var _UpdateLeaderboardBtn = function( gameMode, isOfficalMatchmaking )
	{
		var elLeaderboardButton = $( '#PlayMenulLeaderboards' );
		
		          
		                                                             
		 
			                                   
			
			                             
			 
				                                             
					   
					                                                          
					                                                                                
					                                                                 
					                                  
					                                             
					      
				  
			  

			                                                               
		 
		                                                                                                       
		 
			                                   
			                                                           
			 
				                                             
					   
					                                                          
					                                                             
					                                                                   
					                                  
					                                               
					          
				  
			    
		 
		    
		          
		{ 
			elLeaderboardButton.visible = false;
		}
	};

	var _UpdateSurvivalAutoFillSquadBtn = function( gameMode )
	{
		var elBtn = $( '#SurvivalAutoSquadToggle' );

		if ( !elBtn )
		{
			return;
		}

		if ( gameMode === 'survival' && _IsPlayingOnValveOfficial() && ( PartyListAPI.GetCount() <= 1 ) )
		{
			elBtn.visible = true;
			var bAutoFill = !( GameInterfaceAPI.GetSettingString( 'ui_playsettings_survival_solo' ) === '1' );
			elBtn.checked = bAutoFill;
			elBtn.enabled = !_IsSearching();

			var _OnActivate = function()
			{
				var bAutoFill = !( GameInterfaceAPI.GetSettingString( 'ui_playsettings_survival_solo' ) === '1' );
				GameInterfaceAPI.SetSettingString( 'ui_playsettings_survival_solo', bAutoFill ? '1' : '0' );
				_UpdateSurvivalAutoFillSquadBtn( 'survival' );
			};

			elBtn.SetPanelEvent( 'onactivate', _OnActivate );
		}
		else
		{
			elBtn.visible = false;
		}

		if ( gameMode === 'survival' )
		{
			var lbType = ( ( elBtn.visible && !elBtn.checked ) ? 'solo' : 'squads' );
			var lbName = "official_leaderboard_survival_" + lbType;
			var container = elBtn.GetParent().GetParent();
			var elFriendLeaderboards = container.FindChildTraverse( "FriendLeaderboards" );
			var sPreviousType = elFriendLeaderboards.GetAttributeString( "type", null );
			if ( sPreviousType !== lbName  )
			{
				                                                                                                        
				_ReloadLeaderboardLayoutGivenSettings( container, lbName, "#CSGO_official_leaderboard_survival_" + lbType, "#Cstrike_TitlesTXT_WINS" );
			}
		}
	};

	var _SetEnabledStateForMapBtns = function( elMapList, isSearching, isHost )
	{
		elMapList.SetHasClass( 'is-client', ( isSearching || !isHost ) );

		var childrenList = _GetMapListForServerTypeAndGameMode();

		var bEnable = !isSearching && isHost;

		childrenList.forEach(element => {
			if ( !element.id.startsWith( "FriendLeaderboards" ) )
			element.enabled = bEnable; 
		});
	};

	var _UpdateWaitTime = function( elMapList )
	{
		var childrenList = elMapList;

		for ( var i = 0; i < childrenList.length; i++ )
		{
			var elWaitTime = childrenList[ i ].FindChildTraverse( 'MapGroupWaitTime' );
			var mapName = childrenList[ i ].GetAttributeString( "mapname", "invalid" );

			if ( mapName === 'invalid' )
			{
				continue;
			}

			var seconds = LobbyAPI.GetMapWaitTimeInSeconds( m_gameModeSetting, mapName );
			var numWait = FormatText.SecondsToDDHHMMSSWithSymbolSeperator( seconds );

			if ( numWait )
			{
				elWaitTime.SetDialogVariable( "time", numWait );
				elWaitTime.FindChild( 'MapGroupWaitTimeLabel' ).text = $.Localize( '#matchmaking_expected_wait_time', elWaitTime );
				elWaitTime.RemoveClass( 'hidden' );
			}
			else
			{
				elWaitTime.AddClass( 'hidden' );
			}
		}
	};

	var _UpdatePlayDropDown = function()
	{
		if ( m_activeMapGroupSelectionPanelID === k_workshopPanelId )
		{
			$( '#PlayTopNavDropdown' ).SetSelected( 'PlayWorkshop' );
		}
		else
		{
			$( '#PlayTopNavDropdown' ).SetSelected( 'Play-' + m_serverSetting );
		}
	};

	var _IsValveOfficialServer = function( serverType )
	{
		return serverType === "official" ? true : false
	}

	var _IsPlayingOnValveOfficial = function()
	{
		return _IsValveOfficialServer( m_serverSetting );
	};

	var _IsSearching = function()
	{
		var searchingStatus = LobbyAPI.GetMatchmakingStatusString();
		return searchingStatus !== '' && searchingStatus !== undefined ? true : false;
	};

	                                                         
	var _GetSelectedMapsForServerTypeAndGameMode = function( serverType, gameMode, bDontToggleMaps = false )
	{
		var isPlayingOnValveOfficial = _IsValveOfficialServer( serverType );
		                                                                         
		                                                                        
		var aListMapPanels = _GetMapListForServerTypeAndGameMode();

		                                                                                                             
		if ( !_CheckContainerHasAnyChildChecked( aListMapPanels ) )
		{
			                                                                      
			var preferencesMapsForThisMode = GameInterfaceAPI.GetSettingString( 'ui_playsettings_maps_' + serverType + '_' + gameMode );

			                                          
			if ( !preferencesMapsForThisMode )
				preferencesMapsForThisMode = '';

			var savedMapIds = preferencesMapsForThisMode.split( ',' );
			savedMapIds.forEach( function( strMapNameIndividual )
			{
				var mapsWithThisName = aListMapPanels.filter( function( map )
				{
					var mapName = map.GetAttributeString( "mapname", "invalid" );
					return mapName === strMapNameIndividual;
				} );
				if ( mapsWithThisName.length > 0 )
                {
                    if ( !bDontToggleMaps )
					    mapsWithThisName[ 0 ].checked = true;
				}
			} );

			if ( aListMapPanels.length > 0 && !_CheckContainerHasAnyChildChecked( aListMapPanels ) )
            {
                if ( !bDontToggleMaps )
				    aListMapPanels[ 0 ].checked = true;
			}
		}

		                                                                   
		if ( serverType === 'official' && gameMode === 'survival' )
		{	                                                    
			return GameInterfaceAPI.GetSettingString( 'ui_playsettings_maps_' + serverType + '_' + gameMode );
		}

		var selectedMaps = aListMapPanels.filter( function( e )
		{
			                                                         
			return e.checked;
		} ).reduce( function( accumulator, e )
		{
			                                              
			var mapName = e.GetAttributeString( "mapname", "invalid" );
			return ( accumulator ) ? ( accumulator + "," + mapName ) : mapName;
		}, '' );

		return selectedMaps;
	};

	var _GetMapListForServerTypeAndGameMode = function( mapGroupOverride )
	{
		var mapGroupPanelID = !mapGroupOverride ? _LazyCreateMapListPanel( m_serverSetting, m_gameModeSetting, m_singleSkirmishMapGroup ) : mapGroupOverride;
		var elParent = m_mapSelectionButtonContainers[ mapGroupPanelID ];

		if ( m_gameModeSetting === 'competitive' && elParent.GetAttributeString( 'hassections', '') )
		{
			var aListMapPanels = [];
			elParent.Children().forEach( function( section )
			{
				section.Children().forEach( function( tile )
				{
					if ( tile.id != 'play-maps-section-header-container' )
					{
						aListMapPanels.push( tile );
					}
				} );
			} );

			return aListMapPanels;
		}
		else if ( _IsPlayingOnValveOfficial() && ( m_gameModeSetting === 'survival'
			|| m_gameModeSetting === 'cooperative' 
			|| m_gameModeSetting === 'coopmission' ) )
		{
			let elMapTile = elParent.FindChildTraverse( "MapTile" );
			if ( elMapTile )
				return elMapTile.Children();
			else
				return elParent.Children();
		}
		else
		{
			return elParent.Children();
		}
	};

	var _GetSelectedWorkshopMapButtons = function()
	{
		var mapGroupPanelID = _LazyCreateWorkshopTab();
		var mapContainer = m_mapSelectionButtonContainers[mapGroupPanelID];
		var children = mapContainer.Children();

		if ( children.length == 0 || !children[0].group )
		{
			                   
			return [];
		}

		                                                                                                             
		if ( !_CheckContainerHasAnyChildChecked( children ) )
		{
			var preferencesMapsForThisMode = GameInterfaceAPI.GetSettingString( 'ui_playsettings_maps_workshop' );

			                                          
			if ( !preferencesMapsForThisMode )
				preferencesMapsForThisMode = '';

			var savedMapIds = preferencesMapsForThisMode.split( ',' );
			savedMapIds.forEach( function ( strMapNameIndividual ) {
				var mapsWithThisName = children.filter( function ( map ) {
					var mapName = map.GetAttributeString( "mapname", "invalid" );
					return mapName === strMapNameIndividual;
				} );
				if ( mapsWithThisName.length > 0 )
				{
					mapsWithThisName[0].checked = true;
				}
			} );

			if ( !_CheckContainerHasAnyChildChecked( children ) && children.length > 0 )
			{
				children[0].checked = true;
			}
		}

		var selectedMaps = children.filter( function ( e ) {
			                                                         
			return e.checked;
		} );

		return Array.from(selectedMaps);
	};

	var _GetSelectedWorkshopMap = function()
	{
		var mapButtons = _GetSelectedWorkshopMapButtons();

		var selectedMaps = mapButtons.reduce( function ( accumulator, e ) {
			                                              
			var mapName = e.GetAttributeString( "mapname", "invalid" );
			return ( accumulator ) ? ( accumulator + "," + mapName ) : mapName;
		}, '' );

		return selectedMaps;
	};

	var _GetSingleSkirmishIdFromMapGroup = function ( mapGroup )
	{
		return mapGroup.replace( 'mg_skirmish_', '' );
	};

	var _GetSingleSkirmishMapGroupFromId = function ( skirmishId )
	{
		return 'mg_skirmish_' + skirmishId;
	};

	var _GetSingleSkirmishIdFromSingleSkirmishString = function ( entry )
	{
		return entry.replace( 'skirmish_', '' );
	};

	var _GetSingleSkirmishMapGroupFromSingleSkirmishString = function ( entry )
	{
		return _GetSingleSkirmishMapGroupFromId( _GetSingleSkirmishIdFromSingleSkirmishString( entry ) );
	};

	var _IsSingleSkirmishString = function ( entry )
	{
		return entry.startsWith( 'skirmish_' );
	};

	                                                                                                    
	                                                    
	                                                                                                    
	var _CheckContainerHasAnyChildChecked = function( aMapList )
	{
		if ( aMapList.length < 1 )
			return false;

		return aMapList.filter( function( map )
		{
			return map.checked;
		} ).length > 0;
	};

	                                                                                                    
	                                                    
	                                                                                                    
	var _ValidateSessionSettings = function()
	{
		if ( m_isWorkshop )
		{
			                                     
			m_serverSetting = "listen";
		}

		if ( !_IsGameModeAvailable( m_serverSetting, m_gameModeSetting ) )
		{
			                                                                
			m_gameModeSetting = GameInterfaceAPI.GetSettingString( "ui_playsettings_mode_" + m_serverSetting );
			m_singleSkirmishMapGroup = null;

			if ( _IsSingleSkirmishString( m_gameModeSetting ) )
			{
				m_singleSkirmishMapGroup = _GetSingleSkirmishMapGroupFromSingleSkirmishString( m_gameModeSetting );
				m_gameModeSetting = 'skirmish';
			}
		
			if ( !_IsGameModeAvailable( m_serverSetting, m_gameModeSetting ) )
			{
				                                                                                                                                            
				  
				                                                          
				                                                                             
				  
				                                   
				  
				                                                                      
				var modes = [
					"deathmatch", "casual",
					"survival", "skirmish",
					"scrimcomp2v2", "competitive",
					];
				
				for ( var i = 0; i < modes.length; i++ )
				{
					if ( _IsGameModeAvailable( m_serverSetting, modes[ i ] ) )
					{
						m_gameModeSetting = modes[ i ];
						m_singleSkirmishMapGroup = null;
						break;
					}
				}
			}
		}
	};

	                                                                                                    
	                                   
	                                                                                                    
	var _ApplySessionSettings = function()
	{
		if ( m_gameModeSetting === 'scrimcomp2v2' )
		{	                                                                                     
			MyPersonaAPI.HintLoadPipRanks( 'wingman' );
		}
		else if ( m_gameModeSetting === 'survival' )
		{	                                                                                     
			MyPersonaAPI.HintLoadPipRanks( 'dangerzone' );
		}
		                                                                      
		$.GetContextPanel().SwitchClass( "gamemode", m_gameModeSetting );
		$.GetContextPanel().SwitchClass( "serversetting", m_serverSetting );

		if ( !LobbyAPI.BIsHost() )
		{
			return;
		}

		                                                     
		_ValidateSessionSettings();

		                                                                                 
		var serverType = m_serverSetting;
		var gameMode = m_gameModeSetting;
		var selectedMaps;

		if ( m_isWorkshop )
			selectedMaps = _GetSelectedWorkshopMap();
		else if ( m_singleSkirmishMapGroup )
			selectedMaps = m_singleSkirmishMapGroup;
		else
			selectedMaps = _GetSelectedMapsForServerTypeAndGameMode( serverType, gameMode );

		var settings = {
			update: {
				Options: {
					action: "custommatch",
					server: serverType
				},
				Game: {
					                                                                  
					mode: gameMode,
					type: GetGameType( gameMode ),
					mapgroupname: selectedMaps
				}
			}
		};

		                                                                                                                                      
		                                                                                                                                      
		                                                                                                                                
		                                                                                                                                      
		                                                                                       
		if ( selectedMaps.startsWith( "random_" ) )
		{
			var arrMapGroups = _GetAvailableMapGroups( gameMode, false );
			var idx = 1 + Math.floor( ( Math.random() * ( arrMapGroups.length - 1 ) ) );
			settings.update.Game.map = arrMapGroups[ idx ].substring( 3 );
		}

		                       
		                                                  
		if ( m_isWorkshop )
		{
			GameInterfaceAPI.SetSettingString( 'ui_playsettings_maps_workshop', selectedMaps );
		}
		else
		{
			var singleSkirmishSuffix = '';
			if ( m_singleSkirmishMapGroup )
			{
				singleSkirmishSuffix = '_' + _GetSingleSkirmishIdFromMapGroup( m_singleSkirmishMapGroup );
			}
			GameInterfaceAPI.SetSettingString('ui_playsettings_mode_' + serverType, m_gameModeSetting + singleSkirmishSuffix );
			GameInterfaceAPI.SetSettingString('ui_playsettings_maps_' + serverType + '_' + m_gameModeSetting + singleSkirmishSuffix, selectedMaps);
		}

		                                                                  
		                                                                                          
		LobbyAPI.UpdateSessionSettings( settings );
	};

	var ApplyPrimeSetting = function()
	{
		if( MyPersonaAPI.IsInventoryValid() )
		{
			var settings = { update: { Game: {}} };
			settings.update.Game.prime = m_serverPrimeSetting === 1 ? false : true;
			                                                 
			LobbyAPI.UpdateSessionSettings( settings );
		}
	}

	                                                                                                    
	                                
	                                                                                                    
	var _SessionSettingsUpdate = function( sessionState ) 
	{
		                                                                
		if ( sessionState === "ready" )
		{
			_Init();                                                                  
		}
		                                                      
		else if ( sessionState === "updated" )
		{
			var settings = LobbyAPI.GetSessionSettings();

			_SyncDialogsFromSessionSettings( settings );
		}
		else if ( sessionState === "closed" )
		{
			                                         
			          
			$.DispatchEvent( 'HideContentPanel' );
		}
	};

	var _ReadyForDisplay = function()
	{
		_StartRotatingMapGroupTimer();
	};

	var _UnreadyForDisplay = function()
	{
		_CancelRotatingMapGroupSchedule();
	};

	var _OnHideMainMenu = function()
	{
		$( '#MapSelectionList' ).FindChildrenWithClassTraverse( "map-selection-btn__carousel" ).forEach( function( entry )
		{
			entry.SetAutoScrollEnabled( false );
		} );
	};

	var _OnShowMainMenu = function()
	{	
		$( '#MapSelectionList' ).FindChildrenWithClassTraverse( "map-selection-btn__carousel" ).forEach( function( entry )
		{
			entry.SetAutoScrollEnabled( true );
		} );
	};

	var _GetPlayType = function()
	{
		var elDropDownEntry = $( '#PlayTopNavDropdown' ).GetSelected();
		var playType = elDropDownEntry.GetAttributeString( 'data-type', '(not_found)' );
		return playType;
	};

	var _InitializeWorkshopTags = function ( panel, mapInfo )
	{
		var mapTags = mapInfo.tags ? mapInfo.tags.split( "," ) : [];

		                          
		var rawModes = [];
		var modes = [];
		var tags = [];

		for ( var i = 0; i < mapTags.length; ++i )
		{
			                               
			                                                  
			var modeTag = mapTags[i].toLowerCase().split( ' ' ).join( '' ).split( '-' ).join( '' );
			if ( modeTag in k_workshopModes )
			{
				var gameTypes = k_workshopModes[modeTag].split(',');
				for( var iType = 0; iType < gameTypes.length; ++iType )
				{
					if( !rawModes.includes( gameTypes[iType] ) )
						rawModes.push( gameTypes[iType] );
				}

				modes.push( $.Localize( '#CSGO_Workshop_Mode_' + modeTag ) );
			}
			else
			{
				tags.push( $.HTMLEscape( mapTags[i] ) );
			}
		}

		                   
		var tooltip = mapInfo.desc ? $.HTMLEscape( mapInfo.desc, true ) : '';

		if ( modes.length > 0 )
		{
			if ( tooltip )
				tooltip += '<br><br>';

			tooltip += $.Localize( "#CSGO_Workshop_Modes" );
			tooltip += ' ';
			tooltip += modes.join(', ');
		}

		if ( tags.length > 0 )
		{
			if ( tooltip )
				tooltip += '<br><br>';

			tooltip += $.Localize( "#CSGO_Workshop_Tags" );
			tooltip += ' ';
			tooltip += tags.join( ', ' );
		}

		panel.SetAttributeString( 'data-tooltip', tooltip );                               
		panel.SetAttributeString( 'data-workshop-modes', rawModes.join( ',' ) );
	}

	var _ShowWorkshopMapInfoTooltip = function ( panel )
	{
		var text = panel.GetAttributeString( 'data-tooltip', '' );

		if ( text )
			UiToolkitAPI.ShowTextTooltip( panel.id, text );
	};

	var _HideWorkshopMapInfoTooltip = function ()
	{
		UiToolkitAPI.HideTextTooltip();
	};


	var _LazyCreateWorkshopTab = function()
	{
		var panelId = k_workshopPanelId;

		if ( panelId in m_mapSelectionButtonContainers )
			return panelId;

		                      
		var container = $.CreatePanel( "Panel", $( '#MapSelectionList' ), panelId, {
			class: 'map-selection-list hidden'
		} );

		                                                                                 
		m_mapSelectionButtonContainers[ panelId ] = container;

		var numMaps = WorkshopAPI.GetNumSubscribedMaps();
		for ( var idxMap = 0; idxMap < numMaps; ++idxMap )
		{
			var strMapId = WorkshopAPI.GetSubscribedMapID( idxMap );
			var mapInfo = WorkshopAPI.GetWorkshopMapInfo( strMapId );
			if ( !mapInfo || !mapInfo.mapgroup )
				continue;

			var p = $.CreatePanel( 'RadioButton', container, panelId + '_' + idxMap );
			p.BLoadLayoutSnippet( 'MapGroupSelection' );
			p.group = 'radiogroup_' + panelId;

			if ( !( mapInfo.imageUrl ) )
				mapInfo.imageUrl = 'file://{images}/map_icons/screenshots/360p/random.png';

			p.SetAttributeString( 'mapname', mapInfo.mapgroup );
			p.SetPanelEvent( 'onactivate', _OnActivateMapOrMapGroupButton.bind( this, p ) );
			p.FindChildInLayoutFile( 'ActiveGroupIcon' ).visible = false;
			p.FindChildInLayoutFile( 'MapGroupName' ).text = mapInfo.name;

			var mapImage = $.CreatePanel( 'Panel', p.FindChildInLayoutFile( 'MapGroupImagesCarousel' ), 'MapSelectionScreenshot0' );
			mapImage.AddClass( 'map-selection-btn__screenshot' );
			mapImage.style.backgroundImage = 'url("' + mapInfo.imageUrl + '")';
			mapImage.style.backgroundPosition = '50% 0%';
			mapImage.style.backgroundSize = 'auto 100%';

			_InitializeWorkshopTags( p, mapInfo );

			p.SetPanelEvent( 'onmouseover', _ShowWorkshopMapInfoTooltip.bind( null, p ) );
			p.SetPanelEvent( 'onmouseout', _HideWorkshopMapInfoTooltip.bind( null ) );
		}

		if ( numMaps == 0 )
		{
			var p = $.CreatePanel( 'Panel', container, undefined );
			p.BLoadLayoutSnippet( 'NoWorkshopMaps' );
		}

		                                        
		_UpdateWorkshopMapFilter();

		return panelId;
	};

	var _SwitchToWorkshopTab = function( isEnabled )
	{
		var panelId = _LazyCreateWorkshopTab();
		m_activeMapGroupSelectionPanelID = panelId;
		_ShowActiveMapSelectionTab( isEnabled );
	};

	var _PlayTopNavDropdownChanged = function()
	{
		var playType = _GetPlayType();

		if ( playType === 'listen' || playType === 'training' || playType === 'workshop' )
		{
			                                       
		}
		else
		{
			var restrictions = LicenseUtil.GetCurrentLicenseRestrictions();
			if ( restrictions !== false )
			{
				LicenseUtil.ShowLicenseRestrictions( restrictions );
				                                                                       
				_UpdatePlayDropDown();
				return false;
			}
		}

		if ( playType === 'official' || playType === 'listen' )
		{
			m_isWorkshop = false;
			m_serverSetting = playType;
			_ApplySessionSettings();
			return;
		}
		else if ( playType === 'training' )
		{
			UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle( 'Training',
				'#play_training_confirm',
				'',
				'#OK',
				function()
				{
					LobbyAPI.LaunchTrainingMap();
				},
				'#Cancel_Button',
				function()
				{
				},
				'dim'
			);
		}
		else if ( playType === 'workshop' )
		{
			_SetPlayDropdownToWorkshop();
			return;
		}
		else if ( playType === 'community' )
		{
			if ( '0' === GameInterfaceAPI.GetSettingString( 'player_nevershow_communityservermessage' ) )
			{
				UiToolkitAPI.ShowCustomLayoutPopup( 'server_browser_popup', 'file://{resources}/layout/popups/popup_serverbrowser.xml' );
			}
			else
			{
				if ( m_bPerfectWorld )
				{
					SteamOverlayAPI.OpenURL( 'https://csgo.wanmei.com/communityserver' );
				}
				else
				{
					GameInterfaceAPI.ConsoleCommand( "gamemenucommand openserverbrowser" );
				}
			}
		}

		                                                   
		_UpdatePlayDropDown();
	};

	var _UpdateBotDifficultyButton = function()
	{
		var playType = _GetPlayType();

		var elDropDown = $( '#BotDifficultyDropdown' );

		var bShowBotDifficultyButton = ( playType === 'listen' || playType === 'workshop' );
		elDropDown.SetHasClass( "hidden", !bShowBotDifficultyButton );

		                         
		var botDiff = GameInterfaceAPI.GetSettingString( 'player_botdifflast_s' );
		GameTypesAPI.SetCustomBotDifficulty( botDiff );
		elDropDown.SetSelected( botDiff );
	};

	var _BotDifficultyChanged = function()
	{
		var elDropDownEntry = $( '#BotDifficultyDropdown' ).GetSelected();
		var botDiff = elDropDownEntry.id;

		GameTypesAPI.SetCustomBotDifficulty( botDiff );

		                                  
		GameInterfaceAPI.SetSettingString( 'player_botdifflast_s', botDiff )
	};

	var _DisplayWorkshopModePopup = function()
	{
		                         
		var elSelectedMaps = _GetSelectedWorkshopMapButtons();
		var modes = [];

		for ( var iMap = 0; iMap < elSelectedMaps.length; ++iMap )
		{
			var mapModes = elSelectedMaps[ iMap ].GetAttributeString( 'data-workshop-modes', '' ).split( ',' );

			                                                          
			if ( iMap == 0 )
				modes = mapModes;
			else
				modes = modes.filter( function( mode ) { return mapModes.includes( mode ); } );
		}

		var strModes = modes.join( ',' );
		UiToolkitAPI.ShowCustomLayoutPopupParameters( 'workshop_map_mode', 'file://{resources}/layout/popups/popup_workshop_mode_select.xml', 'workshop-modes=' + $.UrlEncode( strModes ) );
	};

	var _UpdateWorkshopMapFilter = function()
	{
		var filter = $.HTMLEscape( $( '#WorkshopSearchTextEntry' ).text, true ).toLowerCase();
		var container = m_mapSelectionButtonContainers[ k_workshopPanelId ];

		if ( !container )
			return;                       

		var children = container.Children();

		for ( var i = 0; i < children.length; ++i )
		{
			var panel = children[ i ];

			                                                                        
			var mapname = panel.GetAttributeString( 'mapname', '' );
			if ( mapname === '' )
				continue;

			                               
			if ( filter === '' ) 
			{
				panel.visible = true;
				continue;
			}

			                                                                         
			if ( mapname.toLowerCase().includes( filter ) )
			{
				panel.visible = true;
				continue;
			}

			                                                                
			var modes = panel.GetAttributeString( 'data-workshop-modes', '' );
			if ( modes.toLowerCase().includes( filter ) )
			{
				panel.visible = true;
				continue;
			}

			                                                                                           
			                                             
			var tooltip = panel.GetAttributeString( 'data-tooltip', '' );
			if ( tooltip.toLowerCase().includes( filter ) )
			{
				panel.visible = true;
				continue;
			}

			                                                                                  
			                                                             
			var mapname = panel.FindChildTraverse( 'MapGroupName' );
			if ( mapname && mapname.text && mapname.text.toLowerCase().includes( filter ) )
			{
				panel.visible = true;
				continue;
			}

			panel.visible = false;
		}
	};

	var _SetPlayDropdownToWorkshop = function()
	{
		                                           
		m_serverSetting = 'listen';
		m_isWorkshop = true;
		if ( _GetSelectedWorkshopMap() )
		{
			_ApplySessionSettings();
		}
		else
		{
			                                                                                             
			_SwitchToWorkshopTab( true );
		}
	};

	var _WorkshopSubscriptionsChanged = function()
	{
		var currentMap = '';
		var panel = m_mapSelectionButtonContainers[k_workshopPanelId];
		if ( panel )
		{
			currentMap = _GetSelectedWorkshopMap();
			panel.DeleteAsync( 0.0 );

			                  
			delete m_mapSelectionButtonContainers[k_workshopPanelId];
		}

		if ( m_activeMapGroupSelectionPanelID != k_workshopPanelId )
		{
			                                                                       
			return;
		}

		if ( !LobbyAPI.IsSessionActive() )
		{
			                                                                                                                    
			                                           

			                                                                                                            
			                                                              
			m_activeMapGroupSelectionPanelID = null;
			return;
		}

		                                                
		_SyncDialogsFromSessionSettings( LobbyAPI.GetSessionSettings() );

		                                                                                                                                      
		if ( LobbyAPI.BIsHost() )
		{
			_ApplySessionSettings();

			                                                                                                                          
			_SetPlayDropdownToWorkshop();
		}
	}

	var _InventoryUpdated = function()
	{
		_UpdatePrimeBtn( _IsSearching(), LobbyAPI.BIsHost());
	}


	return {
		Init: _Init,
		SessionSettingsUpdate		: _SessionSettingsUpdate,
		ReadyForDisplay				: _ReadyForDisplay,
		UnreadyForDisplay 			: _UnreadyForDisplay,
		OnHideMainMenu				: _OnHideMainMenu,
		OnShowMainMenu				: _OnShowMainMenu,
		PlayTopNavDropdownChanged	: _PlayTopNavDropdownChanged,
		BotDifficultyChanged		: _BotDifficultyChanged,
		WorkshopSubscriptionsChanged: _WorkshopSubscriptionsChanged,
		InventoryUpdated			: _InventoryUpdated,
		SaveMapSelectionToCustomPreset: _SaveMapSelectionToCustomPreset,
		OnMapQuickSelect			: _OnMapQuickSelect

	};

} )();

                                                                                                    
                                           
                                                                                                    
( function()
{
	PlayMenu.Init();
	$.RegisterEventHandler( "ReadyForDisplay", $.GetContextPanel(), PlayMenu.ReadyForDisplay );
	$.RegisterEventHandler( "UnreadyForDisplay", $.GetContextPanel(), PlayMenu.UnreadyForDisplay );
	$.RegisterForUnhandledEvent( "PanoramaComponent_Lobby_MatchmakingSessionUpdate", PlayMenu.SessionSettingsUpdate );
	$.RegisterForUnhandledEvent( "CSGOHideMainMenu", PlayMenu.OnHideMainMenu );
	$.RegisterForUnhandledEvent( "CSGOHidePauseMenu", PlayMenu.OnHideMainMenu );
	$.RegisterForUnhandledEvent( "CSGOShowMainMenu", PlayMenu.OnShowMainMenu );
	$.RegisterForUnhandledEvent( "CSGOShowPauseMenu", PlayMenu.OnShowMainMenu );
	$.RegisterForUnhandledEvent( "CSGOWorkshopSubscriptionsChanged", PlayMenu.WorkshopSubscriptionsChanged );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', PlayMenu.InventoryUpdated );
} )();
