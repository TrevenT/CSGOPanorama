'use strict';

var PlayMenu = ( function()
{
    var k_workshopPanelId = 'gameModeButtonContainer_workshop';

	                                                                   
	var m_mapSelectionButtonContainers = {};
	                                        
	var m_gameModeConfigs = {};
	                                                    
	var m_arrGameModeRadios = [];
	                                                
	var GetMGDetails;
	var GetGameType;

	var m_activeMapGroupSelectionPanelID = null;
	var m_allowNearbyUsersToJoinSetting = null;
	var m_steamGroupIdThatCanJoin = '';
	var m_permissions = '';

                                                  
	var m_serverSetting = '';
	var m_gameModeSetting = '';
                                                                                                                                                

                        
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
	    flyingscoutsman: 'flyingscoutsman'
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
			    m_gameModeSetting = entry.id;
				_ApplySessionSettings();
			} );
		} );

		                              
		var elPrimeStatusButton = $( '#PrimeStatusButton' );
		elPrimeStatusButton.SetPanelEvent( 'onactivate', function()
		{
			UiToolkitAPI.HideTextTooltip();
			UiToolkitAPI.ShowCustomLayoutPopup( 'prime_status', 'file://{resources}/layout/popups/popup_prime_status.xml' );
		} );

		                      
		var elPrimeButton = $( '#PrimeButton' );
		elPrimeButton.SetPanelEvent( 'onactivate', function()
		{
			UiToolkitAPI.HideTextTooltip();
			_ApplySessionSettings();
		} );

		                         
		var elPermissionsButton = $( '#PermissionsSettings' );
		elPermissionsButton.SetPanelEvent( 'onactivate', function()
		{
			UiToolkitAPI.ShowCustomLayoutPopup( 'permission_settings', 'file://{resources}/layout/popups/popup_permissions_settings.xml' );
		} );

		                           
		var btnStartSearch = $( '#StartMatchBtn' );
		btnStartSearch.SetPanelEvent( 'onactivate', function()
		{
			$.DispatchEvent( 'PlaySoundEffect', 'mainmenu_press_GO', 'MOUSE' );
			btnStartSearch.AddClass( 'pressed' );

			if ( m_isWorkshop )
			    _DisplayWorkshopModePopup();
            else
			    LobbyAPI.StartMatchmaking();
		} );

		var btnCancel = $.GetContextPanel().FindChildInLayoutFile( 'PartyCancelBtn' );
		btnCancel.SetPanelEvent( 'onactivate', function()
		{
			LobbyAPI.StopMatchmaking();
			$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.generic_button_press', 'MOUSE' );
		});

		elPermissionsButton.SetPanelEvent( 'onmouseover', function()
		{

			var displayString = $.Localize( '#tooltip_permissions_title' );

			if ( m_permissions !== 'private' )
			{
				if ( m_steamGroupIdThatCanJoin )
				{
					var clan = PartyListAPI.GetPartyClanTag();
					elPermissionsButton.SetDialogVariable( "group", clan );
					displayString = displayString + '<br><br>' + $.Localize( 'tooltip_permissions_group', elPermissionsButton );
				}

				if ( m_allowNearbyUsersToJoinSetting === 1 )
				{
					displayString = displayString + '<br>' + $.Localize( 'tooltip_permissions_nearby' );
				}
			}

			UiToolkitAPI.ShowTextTooltip( 'PermissionsSettings', displayString );
		} );

		elPermissionsButton.SetPanelEvent( 'onmouseout', function()
		{
			UiToolkitAPI.HideTextTooltip();
		} );

		$( "#WorkshopSearchTextEntry" ).SetPanelEvent( 'ontextentrychange', _UpdateWorkshopMapFilter );

		                                            
		_SyncDialogsFromSessionSettings( LobbyAPI.GetSessionSettings() );
		_ApplySessionSettings();
	};

	var _IsGameModeAvailable = function( serverType, gameMode )
	{
		       
		                                           
			                           
			 
		 
			             
		 
		       

		return true;
	}

	var _SyncDialogsFromSessionSettings = function( settings )
	{
		m_allowNearbyUsersToJoinSetting = settings.game.nby;
		m_serverSetting = settings.options.server;
		m_steamGroupIdThatCanJoin = settings.game.clanid;
		m_permissions = settings.system.access;
		m_gameModeSetting = settings.game.mode;

	                                           
		m_isWorkshop = settings.game.mapgroupname
            && settings.game.mapgroupname.includes( '@workshop' );

		var isHost = LobbyAPI.BIsHost();
		var searchingStatus = LobbyAPI.GetMatchmakingStatusString();
		var isSearching = searchingStatus !== '' && searchingStatus !== undefined ? true : false;
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

		                                                       
		        if ( strGameModeForButton === m_gameModeSetting )
		        {
		            m_arrGameModeRadios[i].checked = true;
		        }

		                                                                                             
		        m_arrGameModeRadios[i].enabled = isEnabled && _IsGameModeAvailable( m_serverSetting, strGameModeForButton );
		    }

		                                                                       
		    _UpdateMapGroupButtons( isEnabled );
		    _SelectMapButtonsFromSettings( settings );
		}
		else
		{
			                                                         
			                                                                     
			                                                                           
            m_arrGameModeRadios[0].checked = true;
		}

		_ShowHideStartSearchBtn( isEnabled );
		_ShowCancelSearchButton( isSearching, isHost );

	                       
		_UpdatePrimeBtn( settings.game.prime === 1 ? true : false, isEnabled );
		_UpdatePermissionBtnText( settings, isEnabled );

	                                      
		_UpdatePlayDropDown();
		_UpdateBotDifficultyButton();

		$( '#PlayTopNavDropdown' ).enabled = isEnabled;
		_SetClientViewLobbySettingsTitle( isHost );
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
		                                   
		if ( m_gameModeConfigs[ gameMode ] === undefined )
			return [];

		if ( isPlayingOnValveOfficial )
		{
			return Object.keys( m_gameModeConfigs[ gameMode ].mapgroupsMP );
		}
		else
		{
			return Object.keys( m_gameModeConfigs[ gameMode ].mapgroupsSP );
		}
	};

	var _GetMapGroupPanelID = function ( serverType, gameMode )
	{
	    var panelID = 'gameModeButtonContainer_' + gameMode + '_' + serverType;
		return panelID;
	}

	var _OnActivateMapOrMapGroupButton = function( mapgroupButton )
	{
		$.DispatchEvent( 'PlaySoundEffect', 'submenu_leveloptions_select', 'MOUSE' );
		if ( _CheckContainerHasAnyChildChecked( mapgroupButton.GetParent() ) )
		{
			_ApplySessionSettings();
		}
	}
   
	var _ShowActiveMapSelectionTab = function( isEnabled )
	{
	    var panelID = m_activeMapGroupSelectionPanelID;

	    for ( var key in m_mapSelectionButtonContainers )
	    {
	        if ( key !== panelID )
	        {
	            m_mapSelectionButtonContainers[key].AddClass( "Hidden" );
	        }
	        else
	        {
	                                           
	            m_mapSelectionButtonContainers[key].RemoveClass( "Hidden" );
	            m_mapSelectionButtonContainers[key].visible = true;

	                                                     
	            m_mapSelectionButtonContainers[key].enabled = isEnabled;
	        }
	    }

	    var isWorkshop = panelID === k_workshopPanelId;
	    $( '#WorkshopSearchBar' ).visible = isWorkshop;
	    $( '#GameModeSelectionRadios' ).visible = !isWorkshop;

                                                 
	    $( '#WorkshopVisitButton' ).visible = isWorkshop;
	    $( '#WorkshopVisitButton' ).enabled = SteamOverlayAPI.IsEnabled();
	}

	var _LazyCreateMapListPanel = function ( serverType, gameMode )
	{
	                                                                    

	    var panelID = _GetMapGroupPanelID( serverType, gameMode );
	    if ( panelID in m_mapSelectionButtonContainers )
	        return panelID;

	                               

	    var container = $.CreatePanel( "Panel", $( '#MapSelectionList' ), panelID, {
	        class: 'map-selection-list Hidden'
	    } );

	    m_mapSelectionButtonContainers[panelID] = container;

	                                 
	    var OnMouseOver = function ( id, tooltipText, mapsList ) {
	        tooltipText = $.Localize( tooltipText );

	        var mapNamesList = [];

	        if ( mapsList.length > 1 )
	        {
	            mapsList.forEach( function ( element ) {
	                mapNamesList.push( $.Localize( 'SFUI_Map_' + element ) );
	            } );

	            var mapGroupsText = mapNamesList.join( ', ' );
	            tooltipText = tooltipText + '<br><br>' + mapGroupsText;
	        }

	        UiToolkitAPI.ShowTextTooltip( id, tooltipText );
	    };

	    var OnMouseOut = function () {
	        UiToolkitAPI.HideTextTooltip();
	    };

	    var isPlayingOnValveOfficial = _IsValveOfficialServer( serverType );
	    var arrMapGroups = _GetAvailableMapGroups( gameMode, isPlayingOnValveOfficial );
	    var bIsCompetitive = gameMode === 'competitive';
	    var bIsSkirmish = gameMode === 'skirmish';
	    var bIsWingman = gameMode === 'scrimcomp2v2';
	    var panelType = ( ( ( bIsCompetitive || bIsSkirmish || bIsWingman ) && isPlayingOnValveOfficial ) ? "ToggleButton" : "RadioButton" );
	    for ( var k in arrMapGroups )
	    {
	        var mapName = arrMapGroups[k];
	        var mg = GetMGDetails( mapName );
	        var p = $.CreatePanel( panelType, container, panelID + mapName );
	        p.BLoadLayoutSnippet( "MapGroupSelection" );
	        if ( panelType === "RadioButton" )
	            p.group = "radiogroup_" + panelID;

	        p.SetAttributeString( "mapname", mapName );
	        p.SetPanelEvent( 'onactivate', _OnActivateMapOrMapGroupButton.bind( this, p ) );

	        p.FindChildInLayoutFile( 'ActiveGroupIcon' ).visible = mg.grouptype === 'active';
	        p.FindChildInLayoutFile( 'MapGroupName' ).text = $.Localize( mg.nameID );

	        var keysList = Object.keys( mg.maps );
	        var mapIcon = null;
	        var mapImage = null;
	                                                  
	        if ( keysList.length > 1 )
	        {
	            p.AddClass( 'map-selection-btn--large' );
	            p.FindChildInLayoutFile( 'MapSelectionButton' ).AddClass( 'map-selection-btn-container--large' );
	            p.FindChildInLayoutFile( 'MapGroupName' ).AddClass( 'fontSize-m' );
	            p.FindChildInLayoutFile( 'MapGroupCollectionIcon' ).visible = false;
	        }
	        else
	        {
	            mapIcon = p.FindChildInLayoutFile( 'MapGroupCollectionIcon' );
	            mapIcon.visible = true;

	            IconUtil.SetupFallbackMapIcon( mapIcon, 'file://{images}/' + mg.icon_image_path );

	            var mapGroupIcon = mapName === 'random' ? 'file://{images}/icons/ui/random.svg' : 'file://{images}/' + mg.icon_image_path + '.svg';
	            mapIcon.SetImage( mapGroupIcon );
	        }

	        if ( mapName === 'random' )
	        {
	            mapImage = $.CreatePanel( 'Panel', p.FindChildInLayoutFile( 'MapGroupImagesCarousel' ), 'MapSelectionScreenshot' );
	            mapImage.AddClass( 'map-selection-btn__screenshot' );

	            mapImage.style.backgroundImage = 'url("file://{images}/map_icons/screenshots/360p/random.png")';
	            mapImage.style.backgroundPosition = '50% 0%';
	            mapImage.style.backgroundSize = 'auto 100%';
	        }

	                                      
	        for ( var i = 0; i < keysList.length; i++ )
	        {
	            mapImage = $.CreatePanel( 'Panel', p.FindChildInLayoutFile( 'MapGroupImagesCarousel' ), 'MapSelectionScreenshot' + i );
	            mapImage.AddClass( 'map-selection-btn__screenshot' );
	            mapImage.style.backgroundImage = 'url("file://{images}/map_icons/screenshots/360p/' + keysList[i] + '.png")';
	            mapImage.style.backgroundPosition = '50% 0%';
	            mapImage.style.backgroundSize = 'auto 100%';

	                                           
	            if ( keysList.length > 1 )
	            {
	                                                   

	                mapIcon = $.CreatePanel( 'Image', p.FindChildInLayoutFile( 'MapGroupCollectionMultiIcons' ), 'MapIcon' + i, {
	                    defaultsrc: 'file://{images}/map_icons/map_icon_NONE.png',
	                    texturewidth: '72',
	                    textureheight: '72',
	                    src: 'file://{images}/map_icons/map_icon_' + keysList[i] + '.svg'
	                } );
	                mapIcon.AddClass( 'map-selection-btn__map-icon' );
	                mapIcon.AddClass( 'map-selection-btn__map-icon-small' );

	                IconUtil.SetupFallbackMapIcon( mapIcon, 'file://{images}/map_icons/map_icon_' + keysList[i] );
	            }
	        }

	                  
	        if ( mg.tooltipID )
	        {
	            p.SetPanelEvent( 'onmouseover', OnMouseOver.bind( undefined, p.id, mg.tooltipID, keysList ) );
	            p.SetPanelEvent( 'onmouseout', OnMouseOut );
	        }
	    }

	                                                                              
	    container.OnPropertyTransitionEndEvent = function ( panelName, propertyName ) {
	        if ( container.id === panelName && propertyName === 'opacity' )
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
	}


	var _UpdateMapGroupButtons = function( isEnabled )
	{
	    var panelID = _LazyCreateMapListPanel( m_serverSetting, m_gameModeSetting );

                            
	    m_activeMapGroupSelectionPanelID = panelID;
	    _ShowActiveMapSelectionTab( isEnabled );

                                            
	    if ( ( m_gameModeSetting === 'competitive' || m_gameModeSetting === 'scrimcomp2v2' ) && _IsPlayingOnValveOfficial() )
	    {
	        _UpdateWaitTime( m_mapSelectionButtonContainers[panelID] );
	    }
	};

	var _SelectMapButtonsFromSettings = function( settings )
	{
		                                                                 
		var mapsGroups = settings.game.mapgroupname.split( ',' );

		m_mapSelectionButtonContainers[ m_activeMapGroupSelectionPanelID ].Children().forEach( function( e )
		{
			                                                                      
			var mapName = e.GetAttributeString( "mapname", "invalid" );
			e.checked = mapsGroups.includes( mapName );
		} );
	};

	var _ShowHideStartSearchBtn = function( bShow )
	{
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
	};

	var _ShowCancelSearchButton = function( isSearching, isHost )
	{
		var btnCancel= $.GetContextPanel().FindChildInLayoutFile( 'PartyCancelBtn' );
		                                                                 
		btnCancel.enabled = ( isSearching && isHost );
	};

	var _UpdatePrimeBtn = function( isPrime, isEnabled )
	{
		var AreLobbyPlayersPrime = function()
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

		var elPrimeStatusButton = $( '#PrimeStatusButton' );
		elPrimeStatusButton.visible = false;
		var elPrimeButton = $( '#PrimeButton' );
		elPrimeButton.visible = false;
		var tooltipText = '';

		var elActiveButton = null;

		                                                
		                                                                               
		if ( AreLobbyPlayersPrime() && _IsPlayingOnValveOfficial() )
		{
		    var strGameMode = m_gameModeSetting;

			elPrimeButton.visible = true;
			elPrimeButton.enabled = isEnabled && ( strGameMode === 'competitive' || strGameMode === 'scrimcomp2v2' );
			elPrimeButton.checked = isPrime;
			tooltipText = isPrime ? '#tooltip_prime_only' : '#tooltip_prime_priority';

			elActiveButton = elPrimeButton;
		}
		else if ( !PartyListAPI.GetFriendPrimeEligible( MyPersonaAPI.GetXuid() ) )
		{
			var bPrimeUpgradeAvailable = MyPersonaAPI.HasPrestige() || FriendsListAPI.GetFriendLevel( MyPersonaAPI.GetXuid() ) > 20;
			if ( bPrimeUpgradeAvailable )
			{
				tooltipText = "#tooltip_prime_upgrade_available";
			}
			else
			{
				var isPerfectWorld = MyPersonaAPI.GetLauncherType() == "perfectworld" ? true : false;
				tooltipText = isPerfectWorld ? '#tooltip_prime_not_enrolled_pw' : '#tooltip_prime_not_enrolled';
			}

			elPrimeStatusButton.visible = true;
			elPrimeStatusButton.enabled = bPrimeUpgradeAvailable;
			elActiveButton = elPrimeStatusButton;
		}
		else
		{
			elPrimeButton.enabled = false;

			                                                
			if ( !_IsPlayingOnValveOfficial() )
			{
				tooltipText = '#tooltip_prime-playing-offline';
			}
			else
			{
				tooltipText = '#tooltip_prime-lobby_has_nonprime_player';
			}

			elPrimeButton.visible = true;
			elActiveButton = elPrimeButton;
		}

		elActiveButton.SetPanelEvent( 'onmouseover', function() { UiToolkitAPI.ShowTextTooltip( elActiveButton.id, tooltipText ); } );
		elActiveButton.SetPanelEvent( 'onmouseout', function() { UiToolkitAPI.HideTextTooltip(); } );
	};

	var _UpdatePermissionBtnText = function( settings, isEnabled )
	{
		var elBtn = $( '#PermissionsSettings' );
		var displayText = '';

		var elLockImg = $.GetContextPanel().FindChildInLayoutFile( 'PermissionsSettingsImg' );
		if ( settings.system.access === 'public' )
		{
			if ( settings.game.hasOwnProperty( 'clanid' ) && settings.game.clanid !== '' )
				displayText = '#permissions_group';
			else
				displayText = '#permissions_' + settings.system.access;
			
			displayText = settings.game.nby === 1 ? displayText + '_nearby' : displayText;

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

	var _UpdateWaitTime = function( elMapList )
	{
		var childrenList = elMapList.Children();

		for ( var i = 0; i < childrenList.length; i++ )
		{
			var elWaitTime = childrenList[ i ].FindChildTraverse( 'MapGroupWaitTime' );
			var mapName = childrenList[ i ].GetAttributeString( "mapname", "invalid" );
			var seconds = LobbyAPI.GetMapWaitTimeInSeconds( m_gameModeSetting, mapName );
			var numWait = FormatText.SecondsToDDHHMMSSWithSymbolSeperator( seconds );

			if ( numWait )
			{
				elWaitTime.SetDialogVariable( "time", numWait );
				elWaitTime.FindChild( 'MapGroupWaitTimeLabel' ).text = $.Localize( '#matchmaking_expected_wait_time', elWaitTime );
				elWaitTime.RemoveClass( 'Hidden' );
			}
			else
			{
				elWaitTime.AddClass( 'Hidden' );
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

	var _IsPrimeChecked = function()
	{
		return $( '#PrimeButton' ).checked;
	};

                                                             
	var _GetSelectedMapsForServerTypeAndGameMode = function ( serverType, gameMode )
	{
		var isPlayingOnValveOfficial = _IsValveOfficialServer( serverType );
		var mapGroupPanelID = _LazyCreateMapListPanel( serverType, gameMode );
		var mapContainer = m_mapSelectionButtonContainers[ mapGroupPanelID ];

		                                                                                                             
		if ( !_CheckContainerHasAnyChildChecked( mapContainer ) )
		{
		                                                                          
		    var preferencesMapsForThisMode = InventoryAPI.GetUIPreferenceString( 'ui_playsettings_maps_' + serverType + '_' + gameMode );

                                                      
		    if ( !preferencesMapsForThisMode )
		        preferencesMapsForThisMode = '';

			var savedMapIds = preferencesMapsForThisMode.split( ',' );
			savedMapIds.forEach( function( strMapNameIndividual )
			{
				var mapsWithThisName = mapContainer.Children().filter( function( map )
				{
					var mapName = map.GetAttributeString( "mapname", "invalid" );
					return mapName === strMapNameIndividual;
				} );
				if ( mapsWithThisName.length > 0 )
				{
					mapsWithThisName[0].checked = true;
				}
			} );
			if ( !_CheckContainerHasAnyChildChecked( mapContainer ) )
			{
				mapContainer.Children()[0].checked = true;
			}
		}

		var selectedMaps = mapContainer.Children().filter( function( e )
		{
			                                                         
			return e.checked;
		} ).reduce( function( accumulator, e )
		{
			                                              
			var mapName = e.GetAttributeString( "mapname", "invalid" );
			return ( accumulator ) ? ( accumulator + "," + mapName ) : mapName;
		}, '' );

		return selectedMaps;
	}

	var _GetSelectedWorkshopMapButtons = function()
	{
	    var mapGroupPanelID = _LazyCreateWorkshopTab();
	    var mapContainer = m_mapSelectionButtonContainers[mapGroupPanelID];
	    var children = mapContainer.Children();

	    if ( children.length == 0 || !children[0].group )
	    {
	                           
	        return [];
	    }

	                                                                                                                 
	    if ( !_CheckContainerHasAnyChildChecked( mapContainer ) )
	    {
	        var preferencesMapsForThisMode = InventoryAPI.GetUIPreferenceString( 'ui_playsettings_maps_workshop' );

	                                                  
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

	        if ( !_CheckContainerHasAnyChildChecked( mapContainer ) && children.length > 0 )
	        {
	            children[0].checked = true;
	        }
	    }

	    var selectedMaps = mapContainer.Children().filter( function ( e ) {
	                                                                 
	        return e.checked;
	    } );

	    return Array.from(selectedMaps);
	}

	var _GetSelectedWorkshopMap = function()
	{
	    var mapButtons = _GetSelectedWorkshopMapButtons();

        var selectedMaps = mapButtons.reduce( function ( accumulator, e ) {
	                                                      
	        var mapName = e.GetAttributeString( "mapname", "invalid" );
	        return ( accumulator ) ? ( accumulator + "," + mapName ) : mapName;
	    }, '' );

	    return selectedMaps;
	}

	                                                                                                    
	                                                    
	                                                                                                    
	var _CheckContainerHasAnyChildChecked = function( aPanelContainer )
	{
	    if ( !aPanelContainer )
	        return false;

		return aPanelContainer.Children().filter( function( map )
			{
				return map.checked;
			} )
			.length > 0;
	}

                                                                                                        
                                                        
                                                                                                        
	var _ValidateSessionSettings = function()
	{
	    if ( m_isWorkshop )
	    {
	                                             
	        m_serverSetting = "listen";
	    }

	    if ( !_IsGameModeAvailable( m_serverSetting, m_gameModeSetting ) )
	    {
	                                           
              
	                                                           
	        m_gameModeSetting = "casual";
	    }
	}

	                                                                                                    
	                                   
	                                                                                                    
	var _ApplySessionSettings = function()
	{
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
        else
			selectedMaps = _GetSelectedMapsForServerTypeAndGameMode( serverType, gameMode );

		var settings = {
			update: {
				Options: {
					action: "custommatch",
					server: serverType
				},
				Game: {
					prime: _IsPrimeChecked(),
					mode: gameMode,
					type: GetGameType( gameMode ),
					mapgroupname: selectedMaps
				},
			}
		};

	                           
	                                                      
		if ( m_isWorkshop )
		{
		    InventoryAPI.SetUIPreferenceString( 'ui_playsettings_maps_workshop', selectedMaps );
		}
        else
		{
		    InventoryAPI.SetUIPreferenceString( 'ui_playsettings_mode_' + serverType, m_gameModeSetting );
		    InventoryAPI.SetUIPreferenceString( 'ui_playsettings_maps_' + serverType + '_' + m_gameModeSetting, selectedMaps );
		}

	                                                                      
                                                                                                  
		LobbyAPI.UpdateSessionSettings( settings );
	};

	                                                                                                    
	                                
	                                                                                                    
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
		return;
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

	var _GetPlayType = function ()
	{
		var elDropDownEntry = $( '#PlayTopNavDropdown' ).GetSelected();
		var playType = elDropDownEntry.GetAttributeString( 'data-type', '(not_found)' );
		return playType;
	}

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


	var _LazyCreateWorkshopTab = function ()
	{
	    var panelId = k_workshopPanelId;

	    if ( panelId in m_mapSelectionButtonContainers )
	        return panelId;

	                          
	    var container = $.CreatePanel( "Panel", $( '#MapSelectionList' ), panelId, {
	        class: 'map-selection-list Hidden'
	    } );

	    m_mapSelectionButtonContainers[panelId] = container;

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
	        p.FindChildInLayoutFile( 'MapGroupCollectionIcon' ).visible = false;

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
	}

	var _SwitchToWorkshopTab = function( isEnabled )
	{
	    var panelId = _LazyCreateWorkshopTab();
	    m_activeMapGroupSelectionPanelID = panelId;
	    _ShowActiveMapSelectionTab( isEnabled );
	}

	var _PlayTopNavDropdownChanged = function()
	{
		var playType = _GetPlayType();

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
			if ( '0' === InventoryAPI.GetUIPreferenceString( 'player_nevershow_communityservermessage' ) )
			{
				UiToolkitAPI.ShowCustomLayoutPopup( 'server_browser_popup', 'file://{resources}/layout/popups/popup_serverbrowser.xml' );
			}
			else
			{
				GameInterfaceAPI.ConsoleCommand( "gamemenucommand openserverbrowser");
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

		                         
		var botDiff = InventoryAPI.GetUIPreferenceString( 'player_botdifflast_s' );
		GameTypesAPI.SetCustomBotDifficulty( botDiff );
		elDropDown.SetSelected( botDiff );
	}

	var _BotDifficultyChanged = function()
	{
		var elDropDownEntry = $( '#BotDifficultyDropdown' ).GetSelected();
		var botDiff = elDropDownEntry.id;

		GameTypesAPI.SetCustomBotDifficulty( botDiff );

		                                  
		InventoryAPI.SetUIPreferenceString( 'player_botdifflast_s', botDiff )
	}	

	var _DisplayWorkshopModePopup = function ()
	{
	                             
	    var elSelectedMaps = _GetSelectedWorkshopMapButtons();
	    var modes = [];

	    for ( var iMap = 0; iMap < elSelectedMaps.length; ++iMap )
	    {
	        var mapModes = elSelectedMaps[iMap].GetAttributeString( 'data-workshop-modes', '' ).split( ',' );

	                                                                  
	        if ( iMap == 0 )
	            modes = mapModes;
            else
	            modes = modes.filter( function ( mode ) { return mapModes.includes( mode ); } );
	    }

	    var strModes = modes.join( ',' );
	    UiToolkitAPI.ShowCustomLayoutPopupParameters( 'workshop_map_mode', 'file://{resources}/layout/popups/popup_workshop_mode_select.xml', 'workshop-modes=' + $.UrlEncode( strModes ) );
	}

	var _UpdateWorkshopMapFilter = function () {
	    var filter = $.HTMLEscape( $( '#WorkshopSearchTextEntry' ).text ).toLowerCase();
	    var container = m_mapSelectionButtonContainers[k_workshopPanelId];

	    if( !container )
	        return;                       

	    var children = container.Children();

	    for ( var i = 0; i < children.length; ++i )
	    {
	        var panel = children[i];

                                                                                    
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
	        if( tooltip.toLowerCase().includes(filter) )
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
	}

	var _SetPlayDropdownToWorkshop = function ()
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
	}

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

	return {
		Init: _Init,
		SessionSettingsUpdate		: _SessionSettingsUpdate,
		ReadyForDisplay				: _ReadyForDisplay,
		OnHideMainMenu				: _OnHideMainMenu,
		OnShowMainMenu				: _OnShowMainMenu,
		PlayTopNavDropdownChanged	: _PlayTopNavDropdownChanged,
		BotDifficultyChanged		: _BotDifficultyChanged,
        WorkshopSubscriptionsChanged: _WorkshopSubscriptionsChanged,
	};

} )();

                                                                                                    
                                           
                                                                                                    
( function()
{
	PlayMenu.Init();
	$.GetContextPanel().RegisterForReadyEvents( true );
	$.RegisterEventHandler( "ReadyForDisplay", $.GetContextPanel(), PlayMenu.ReadyForDisplay );
	$.RegisterForUnhandledEvent( "PanoramaComponent_Lobby_MatchmakingSessionUpdate", PlayMenu.SessionSettingsUpdate );
	$.RegisterForUnhandledEvent( "CSGOHideMainMenu", PlayMenu.OnHideMainMenu );
	$.RegisterForUnhandledEvent( "CSGOHidePauseMenu", PlayMenu.OnHideMainMenu );
	$.RegisterForUnhandledEvent( "CSGOShowMainMenu", PlayMenu.OnShowMainMenu );
	$.RegisterForUnhandledEvent( "CSGOShowPauseMenu", PlayMenu.OnShowMainMenu );
	$.RegisterForUnhandledEvent( "CSGOWorkshopSubscriptionsChanged", PlayMenu.WorkshopSubscriptionsChanged );
} )();
