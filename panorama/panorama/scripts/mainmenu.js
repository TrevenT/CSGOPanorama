"use strict";

                                                                                                    
                                        
                                                                                                    

var MainMenu = ( function() {
	var _m_bPerfectWorld = ( MyPersonaAPI.GetLauncherType() === "perfectworld" );
	var _m_activeTab;
	var _m_sideBarElementContextMenuActive = false;
	var _m_elContentPanel = $( '#JsMainMenuContent' );
	var _m_playedInitalFadeUp = false;

	               
	var _m_elNotificationsContainer = $( '#NotificationsContainer' );
	var _m_notificationSchedule = false;
	var _m_bVanityAnimationAlreadyStarted = false;
	var _m_bHasPopupNotification = false;
	var _m_tLastSeenDisconnectedFromGC = 0;
	var _m_NotificationBarColorClasses = [
		"NotificationRed", "NotificationYellow", "NotificationGreen", "NotificationLoggingOn"
	];

	var _m_storePopupElement = null;
	var m_TournamentPickBanPopup = null;

	var _OnInitFadeUp = function()
	{
		if( !_m_playedInitalFadeUp )
		{
			$( '#MainMenuContainerPanel' ).TriggerClass( 'show' );
			_m_playedInitalFadeUp = true;
		}
	};

	var _SetBackgroundMovie = function()
	{
		var videoPlayer = $( '#MainMenuMovie' );
		var defaultMovie = 'nuke';

		                                                                 
		var overrideMovie = 'blacksite';
		var backgroundMovie = overrideMovie;

		                                                            
		                                                                                   

		                                                                                     
		videoPlayer.SetAttributeString( 'data-type', backgroundMovie );

		                          
		videoPlayer.SetMovie( "file://{resources}/videos/" + backgroundMovie + ".webm" );
		videoPlayer.SetSound( 'UIPanorama.BG_' + backgroundMovie );
		videoPlayer.Play();
	};

	var _OnShowMainMenu = function()
	{
		$.DispatchEvent('PlayMainMenuMusic', true, true );

		                                         
		GameInterfaceAPI.SetSettingString( 'panorama_play_movie_ambient_sound', '1' );

		                                                                  
		                                          
		GameInterfaceAPI.SetSettingString( 'dsp_room', '29' );
		GameInterfaceAPI.SetSettingString( 'snd_soundmixer', 'MainMenu_Mix' );

		_m_bVanityAnimationAlreadyStarted = false;                                               
		_InitVanity();
		_OnInitFadeUp();
		_SetBackgroundMovie();

		                                                   
		$( '#MainMenuNavBarPlay' ).SetHasClass( 'mainmenu-navbar__btn-small--hidden', false );

		                                                    
		_UpdateOverwatch();

		_UpdateNotifications();
		_ShowWeaponUpdatePopup();

		                              
		_GcLogonNotificationReceived();

		                                                                          
		_DeleteSurvivalEndOfMatch();
	};

	var _TournamentDraftUpdate = function ()
	{
		if ( !m_TournamentPickBanPopup || !m_TournamentPickBanPopup.IsValid() )
		{
			m_TournamentPickBanPopup = UiToolkitAPI.ShowCustomLayoutPopup( 'tournament_pickban_popup', 'file://{resources}/layout/popups/popup_tournament_pickban.xml' );
		}
	}

	var _m_bGcLogonNotificationReceivedOnce = false;
	var _GcLogonNotificationReceived = function()
	{
		if ( _m_bGcLogonNotificationReceivedOnce ) return;
		
		var strFatalError = MyPersonaAPI.GetClientLogonFatalError();
		if ( strFatalError )
		{
			_m_bGcLogonNotificationReceivedOnce = true;

			if ( strFatalError === "ShowGameLicenseNeedToLinkAccountsWithMoreInfo" )
			{
				UiToolkitAPI.ShowGenericPopupThreeOptionsBgStyle( "#CSGO_Purchasable_Game_License_Short", "#SFUI_LoginLicenseAssist_PW_NeedToLinkAccounts_WW_hint", "",
					"#UI_Yes", function() { SteamOverlayAPI.OpenURL( "https://community.csgo.com.cn/join/pwlink_csgo" ); },
					"#UI_No", function() {},
					"#ShowFAQ", function() { _OnGcLogonNotificationReceived_ShowFaqCallback(); },
					"dim" );
			}
			else if ( strFatalError === "ShowGameLicenseNeedToLinkAccounts" )
			{
				_OnGcLogonNotificationReceived_ShowLicenseYesNoBox( "#SFUI_LoginLicenseAssist_PW_NeedToLinkAccounts", "https://community.csgo.com.cn/join/pwlink_csgo" );
			}
			else if ( strFatalError === "ShowGameLicenseHasLicensePW" )
			{
				_OnGcLogonNotificationReceived_ShowLicenseYesNoBox( "#SFUI_LoginLicenseAssist_HasLicense_PW", "https://community.csgo.com.cn/join/pwlink_csgo?needlicense=1" );
			}
			else if ( strFatalError === "ShowGameLicenseNoOnlineLicensePW" )
			{
				                                                                                 
				                                                                                     
				                                 
				                                                                                                                                                           
			}
			else if ( strFatalError === "ShowGameLicenseNoOnlineLicense" )
			{
				                                                                                 
				                                                                                     
				                                 
				                                                                                                                                                 
			}
			else
			{
				UiToolkitAPI.ShowGenericPopupOneOptionBgStyle( "#SFUI_LoginPerfectWorld_Title_Error", strFatalError, "",
					"#GameUI_Quit", function() { GameInterfaceAPI.ConsoleCommand( "quit" ); },
					"dim" );
			}

			return;
		}
		
		var nAntiAddictionTrackingState = MyPersonaAPI.GetTimePlayedTrackingState();
		if ( nAntiAddictionTrackingState > 0 )
		{
			_m_bGcLogonNotificationReceivedOnce = true;

			var pszDialogTitle = "#SFUI_LoginPerfectWorld_Title_Info";
			var pszDialogMessageText = "#SFUI_LoginPerfectWorld_AntiAddiction1";
			var pszOverlayUrlToOpen = null;
			if ( nAntiAddictionTrackingState != 2                                        )
			{
				pszDialogMessageText = "#SFUI_LoginPerfectWorld_AntiAddiction2";
				pszOverlayUrlToOpen = "https://community.csgo.com.cn/join/pwcompleteaccountinfo";
			}
			if ( pszOverlayUrlToOpen )
			{
				UiToolkitAPI.ShowGenericPopupYesNo( pszDialogTitle, pszDialogMessageText, "",
					function() { SteamOverlayAPI.OpenURL( pszOverlayUrlToOpen ); },
					function() {} 
				);
			}
			else
			{
				UiToolkitAPI.ShowGenericPopup( pszDialogTitle, pszDialogMessageText, "" );
			}

			return;
		}
	}

	var _OnGcLogonNotificationReceived_ShowLicenseYesNoBox = function ( strTextMessage, pszOverlayUrlToOpen )
	{
		 UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle( "#CSGO_Purchasable_Game_License_Short", strTextMessage, "",
			"#UI_Yes", function() { SteamOverlayAPI.OpenURL( pszOverlayUrlToOpen ); },
			"#UI_No", function() {},
			"dim" );
	}

	var _OnGcLogonNotificationReceived_ShowFaqCallback = function ()
	{
		                         
		SteamOverlayAPI.OpenURL( "https://support.steampowered.com/kb_article.php?ref=6026-IFKZ-7043&l=schinese" );

		                                                                     
		_m_bGcLogonNotificationReceivedOnce = false;
		_GcLogonNotificationReceived();
	}

	var _OnHideMainMenu = function ()
	{
		                        
		var vanityPanel = $( '#JsMainmenu_Vanity' );
		if ( vanityPanel )
		{
			CharacterAnims.CancelScheduledAnim( vanityPanel );
		}

		_CancelNotificationSchedule();

		UiToolkitAPI.CloseAllVisiblePopups();
	};

	var _OnShowPauseMenu = function()
	{
		var elContextPanel = $.GetContextPanel();
		
		elContextPanel.AddClass( 'MainMenuRootPanel--PauseMenuMode' );

		var bMultiplayer = elContextPanel.IsMultiplayer();
		var bQueuedMatchmaking = GameStateAPI.IsQueuedMatchmaking();
		var bTraining = elContextPanel.IsTraining();
		var bGotvSpectating = elContextPanel.IsGotvSpectating();
		var bIsCommunityServer = !_m_bPerfectWorld && MatchStatsAPI.IsConnectedToCommunityServer();

		                                                                        
		                                                                                                         
		$( '#MainMenuNavBarPlay' ).SetHasClass( 'mainmenu-navbar__btn-small--hidden', true );

		$( '#MainMenuNavBarSwitchTeams' ).SetHasClass( 'mainmenu-navbar__btn-small--hidden', ( bTraining || bQueuedMatchmaking || bGotvSpectating ) );
		
		                                                          
		                                                                                                                   
		                                                                                                                                                 
		$( '#MainMenuNavBarVote' ).SetHasClass( 'mainmenu-navbar__btn-small--hidden', ( bTraining ||                      bGotvSpectating ) );

		                                                                                        
		$( '#MainMenuNavBarReportServer' ).SetHasClass( 'mainmenu-navbar__btn-small--hidden', !bIsCommunityServer );

		                                                                                           
		$( '#MainMenuNavBarShowCommunityServerBrowser' ).SetHasClass( 'mainmenu-navbar__btn-small--hidden', !bIsCommunityServer );

		                                                            
		_UpdateSurvivalEndOfMatchInstance();

		                
		_OnHomeButtonPressed();
	};

	var _OnHidePauseMenu = function ()
	{
		$.GetContextPanel().RemoveClass( 'MainMenuRootPanel--PauseMenuMode' );

		_OnHomeButtonPressed();
	};

	var _BCheckTabCanBeOpenedRightNow = function( tab )
	{
		if ( tab === 'JsInventory' )
		{
			var restrictions = LicenseUtil.GetCurrentLicenseRestrictions();
			if ( restrictions !== false )
			{
				LicenseUtil.ShowLicenseRestrictions( restrictions );
				return false;
			}
		}

		if ( tab === 'JsInventory' )
		{
			if ( !MyPersonaAPI.IsInventoryValid() || !MyPersonaAPI.IsConnectedToGC() )
			{
				                                       
				UiToolkitAPI.ShowGenericPopupOk(
					$.Localize( '#SFUI_SteamConnectionErrorTitle' ),
					$.Localize( '#SFUI_Steam_Error_LinkUnexpected' ),
					'',
					function() {},
					function() {}
				);
				return false;
			}
		}

		                          
		return true;
	}

	var _NavigateToTab = function( tab, XmlName )
	{
		                                                        
		                                                   

		if ( !_BCheckTabCanBeOpenedRightNow( tab ) )
		{
			_OnHomeButtonPressed();
			return;	                                                                               
		}

		$.DispatchEvent('PlayMainMenuMusic', true, false );

		                                    
		GameInterfaceAPI.SetSettingString( 'panorama_play_movie_ambient_sound', '0' );

		                                      
		                            
		if( !$.GetContextPanel().FindChildInLayoutFile( tab ) )
		{
			var newPanel = $.CreatePanel('Panel', _m_elContentPanel, tab );
			
			newPanel.Data().elMainMenuRoot = $.GetContextPanel();
			                                                 

			newPanel.BLoadLayout('file://{resources}/layout/' + XmlName + '.xml', false, false );
			newPanel.RegisterForReadyEvents( true );
			
			                                                                          
			                                                       
			newPanel.OnPropertyTransitionEndEvent = function ( panelName, propertyName )
			{
				if( newPanel.id === panelName && propertyName === 'opacity' )
				{
					                                         
					if( newPanel.visible === true && newPanel.BIsTransparent() )
					{
						                                               
						newPanel.visible = false;
						newPanel.SetReadyForDisplay( false );
						return true;
					}
					else if ( newPanel.visible === true )
					{
						$.DispatchEvent( 'MainMenuTabShown', tab );
					}
				}

				return false;
			};

			$.RegisterEventHandler( 'PropertyTransitionEnd', newPanel, newPanel.OnPropertyTransitionEndEvent );
		}
		
		                                                                               
		                             
		if( _m_activeTab !== tab )
		{
			                                       
			if(XmlName) {
				$.DispatchEvent('PlaySoundEffect', 'tab_' + XmlName.replace('/', '_'), 'MOUSE');
			}
			
			                                 
			if( _m_activeTab )
			{
				var panelToHide = $.GetContextPanel().FindChildInLayoutFile( _m_activeTab );
				panelToHide.AddClass( 'mainmenu-content--hidden' );

				                                       
			}
			
			                   
			_m_activeTab = tab;
			var activePanel = $.GetContextPanel().FindChildInLayoutFile( tab );
			activePanel.RemoveClass( 'mainmenu-content--hidden' );

			                                                                         
			activePanel.visible = true;
			activePanel.SetReadyForDisplay( true );
			                                      


			                                           	
			_PauseMainMenuCharacter();
		}

		_ShowContentPanel();
	};


	var _ShowContentPanel = function()
	{
		if ( _m_elContentPanel.BHasClass( 'mainmenu-content--offscreen' ) ) {
			_m_elContentPanel.RemoveClass( 'mainmenu-content--offscreen' );
		}

		$.DispatchEvent( 'ShowContentPanel' );
		_DimMainMenuBackground( false );
		_HideNewsAndStore();
	};

	var _OnHideContentPanel = function()
	{
		_m_elContentPanel.AddClass( 'mainmenu-content--offscreen' );

		                                                     
		var elActiveNavBarBtn = _GetActiveNavBarButton();
		if ( elActiveNavBarBtn && elActiveNavBarBtn.id !== 'MainMenuNavBarHome' ) {
			elActiveNavBarBtn.checked = false;
		}

		_DimMainMenuBackground( true );
		
		                                 
		if ( _m_activeTab )
		{
			var panelToHide = $.GetContextPanel().FindChildInLayoutFile( _m_activeTab );
			panelToHide.AddClass( 'mainmenu-content--hidden' );
			                                        
		}
		
		_m_activeTab = '';

		_ShowNewsAndStore();
	};

	var _GetActiveNavBarButton = function( )
	{
		var elNavBar = $( '#JsMainMenuNavBar' );
		var children = elNavBar.Children();
		var count = children.length;

		for (var i = 0; i < count; i++) 
		{
			if ( children[ i ].IsSelected() ) {
				return children[ i ];
			}
		}
	};


	                                                                                                    
	                                              
	                                                                                                    
	var _ShowHideNavDrawer = function()
	{
		UiToolkitAPI.ShowCustomLayoutPopup('', 'file://{resources}/layout/popups/popup_navdrawer.xml');
	};

	                              
	var _ExpandSidebar = function( )
	{
		var elSidebar = $( '#JsMainMenuSidebar' );

		if(elSidebar.BHasClass( 'mainmenu-sidebar--minimized' ) ) {
			$.DispatchEvent( 'PlaySoundEffect', 'sidemenu_slidein', 'MOUSE' );
		}

		elSidebar.RemoveClass( 'mainmenu-sidebar--minimized' );

		$.DispatchEvent( 'SidebarIsCollapsed', false );
		_DimMainMenuBackground( false );
	};

	var _MinimizeSidebar = function()
	{
		                                                                                                 
		                                                                                               
		                           
		if ( _m_elContentPanel == null ) {
			return;
		}

		                                                                  
		                                    
		if ( _m_sideBarElementContextMenuActive ) {
			return;
		}
		
		var elSidebar = $( '#JsMainMenuSidebar' );

		if(!elSidebar.BHasClass( 'mainmenu-sidebar--minimized' ) ) {
			$.DispatchEvent( 'PlaySoundEffect', 'sidemenu_slideout', 'MOUSE' );
		}

		elSidebar.AddClass( 'mainmenu-sidebar--minimized' );

		                                                            
		                                                                    
		
		$.DispatchEvent( 'SidebarIsCollapsed', true );
		_DimMainMenuBackground( true );
	};

	var _OnSideBarElementContextMenuActive = function( bActive )
	{
		                                               
		_m_sideBarElementContextMenuActive = bActive;

		                                                                              
		                                                                      
		                                        
		var ContextMenuClosedOutsideSidebar = function ()
		{ 
			var isHover =  $( '#JsMainMenuSidebar' ).BHasHoverStyle();
			if( !isHover ) {
				_MinimizeSidebar();
			}
		};

		                                                                                       
		$.Schedule( 0.25, ContextMenuClosedOutsideSidebar );

		_DimMainMenuBackground( false );
	};

	var _DimMainMenuBackground = function( removeDim )
	{		
		if ( removeDim && _m_elContentPanel.BHasClass('mainmenu-content--offscreen') &&
			$('#mainmenu-content__blur-target').BHasHoverStyle() === false) {
			$('#MainMenuBackground').RemoveClass('Dim');
		} else
			$('#MainMenuBackground').AddClass('Dim');
	};

	                                                                                                    
	                         
	                                                                                                    

	function _OnHomeButtonPressed()
	{
		$.DispatchEvent( 'HideContentPanel' );

		                                            	
		var vanityPanel = $( '#JsMainmenu_Vanity' );
		if ( vanityPanel )
		{
			vanityPanel.Pause( false );
		}
	}

	function _OnQuitButtonPressed()
	{	
		UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle( '#UI_ConfirmExitTitle',
			'#UI_ConfirmExitMessage',
			'',
			'#UI_Quit',
			function() {
				QuitGame( 'Option1' );
			},
			'#UI_Return',
			function() {
			},
			'dim'
		);
	}

	function QuitGame( msg )
	{
		                                                 
		GameInterfaceAPI.ConsoleCommand('quit');
	}

	                                                                                                    
	                      
	                                                                                                    
	var _InitFriendsList = function( )
	{
		var friendsList = $.CreatePanel( 'Panel', $.FindChildInContext( '#mainmenu-sidebar__blur-target' ), 'JsFriendsList' );
		friendsList.BLoadLayout( 'file://{resources}/layout/friendslist.xml', false, false );
	};

	var _InitNewsAndStore = function ()
	{	
		_AddStream();
		
		var elNews = $.CreatePanel( 'Panel', $.FindChildInContext( '#JsNewsContainer' ), 'JsNewsPanel' );
		elNews.BLoadLayout( 'file://{resources}/layout/mainmenu_news.xml', false, false );
		
		var elStore = $.CreatePanel( 'Panel', $.FindChildInContext( '#JsNewsContainer' ), 'JsStorePanel' );
		elStore.BLoadLayout( 'file://{resources}/layout/mainmenu_store.xml', false, false );

		$.FindChildInContext( '#JsNewsContainer' ).OnPropertyTransitionEndEvent = function ( panelName, propertyName )
		{
			if( elNews.id === panelName && propertyName === 'opacity')
			{
				                                         
				if( elNews.visible === true && elNews.BIsTransparent() )
				{
					                                               
					elNews.visible = false;
					elNews.SetReadyForDisplay( false );
					return true;
				}
			}

			return false;
		};

		_ShowNewsAndStore();
		                      
	};

	var _AddStream = function()
	{
		var elStream = $.CreatePanel( 'Panel', $.FindChildInContext( '#JsNewsContainer' ), 'JsStreamPanel' );
		elStream.BLoadLayout( 'file://{resources}/layout/mainmenu_stream.xml', false, false );
	};

	var _AddFeaturedPanel = function()
	{
		                  
		var featuredXML = 'file://{resources}/layout/mainmenu_featured.xml';

		var elPanel = $.CreatePanel( 'Panel', $.FindChildInContext( '#JsNewsContainer' ), 'JsFeaturedPanel' );
		elPanel.BLoadLayout( featuredXML, false, false );

		$.FindChildInContext( '#JsNewsContainer' ).MoveChildBefore( elPanel, $.FindChildInContext( '#JsNewsPanel' ) );
		$.FindChildInContext( '#JsNewsPanel' ).AddClass( 'news-panel-style-feature-panel-visible' );
	};

	var _ShowNewsAndStore = function ()
	{
		var elNews = $.FindChildInContext( '#JsNewsContainer' );
		elNews.SetHasClass( 'hidden', false );
	};

	var _HideNewsAndStore = function ()
	{
		var elNews = $.FindChildInContext( '#JsNewsContainer' );
		elNews.SetHasClass( 'hidden', true );
	};

	                                                                                                    
	                     
	                                                                                                    

	var _ForceRestartVanity = function()
	{
		_m_bVanityAnimationAlreadyStarted = false;
		_InitVanity();
	};
	
	var _InitVanity = function()
	{
		                               
		if ( !MyPersonaAPI.IsInventoryValid() ) {
			                                                
			return;
		}
		if ( _m_bVanityAnimationAlreadyStarted ) {
			                                                                         
			return;
		}

		var loadout = {
			itemId: GameInterfaceAPI.GetSettingString( 'ui_vanitysetting_itemid' ),
			model: '',
			team: '',
			loadoutSlot: ''
		};

		var i = 0;
		for ( i = 0; i < 2; ++ i )
		{	                                                                 
			if ( !loadout.itemId )
			{	                                                    
				loadout = _DefaultModelLoadouts();
				loadout.itemId = LoadoutAPI.GetItemID( loadout.team, loadout.loadoutSlot );
				                                          
				GameInterfaceAPI.SetSettingString( 'ui_vanitysetting_itemid', loadout.itemId );
				GameInterfaceAPI.SetSettingString( 'ui_vanitysetting_model', loadout.model );
				GameInterfaceAPI.SetSettingString( 'ui_vanitysetting_team', loadout.team );
				GameInterfaceAPI.SetSettingString( 'ui_vanitysetting_loadoutslot', loadout.loadoutSlot );
				                                                                                                                      
			}
			else
			{	                             
				loadout.model = GameInterfaceAPI.GetSettingString( 'ui_vanitysetting_model' );
				loadout.team = GameInterfaceAPI.GetSettingString( 'ui_vanitysetting_team' );
				loadout.loadoutSlot = GameInterfaceAPI.GetSettingString( 'ui_vanitysetting_loadoutslot' );

				                                            
				                                         
				var arrModels = CharacterAnims.GetValidCharacterModels();
				if ( arrModels.filter( function( entry )
					{
						return entry.model === loadout.model && ( entry.team === loadout.team || entry.team === 'any' );
					} ).length <= 0 )
				{
					                                                                                                                 
					loadout.itemId = null;
					continue;
				}
				if ( !InventoryAPI.IsValidItemID( loadout.itemId ) || !InventoryAPI.IsItemInfoValid( loadout.itemId ) )
				{
					loadout.itemId = LoadoutAPI.GetItemID( loadout.team, loadout.loadoutSlot );
					                                                                                                                    
				}
				else
				{
					                                                        
					if ( !loadout.loadoutSlot || ( ItemInfo.GetSlotSubPosition( loadout.itemId ) !== loadout.loadoutSlot ) )
					{
						                                                                                                                   
						loadout.itemId = null;
						continue;
					}
					
					                                            
					if ( !( ItemInfo.IsItemAnyTeam( loadout.itemId ) ||
						(ItemInfo.IsItemCt( loadout.itemId ) && loadout.team === 'ct') ||
						(ItemInfo.IsItemT( loadout.itemId ) && loadout.team === 't') ) )
					{
						                                                                                                            
						loadout.itemId = null;
						continue;
					}

					                                                                                                                        
				}
			}
			if ( InventoryAPI.IsValidItemID( loadout.itemId ) && InventoryAPI.IsItemInfoValid( loadout.itemId ) )
			{
				break;
			}
		}
		if ( !InventoryAPI.IsValidItemID( loadout.itemId ) || !InventoryAPI.IsItemInfoValid( loadout.itemId ) )
		{
			                                                              
			return;
		}

		var vanityPanel = $( '#JsMainmenu_Vanity' );
		if ( !vanityPanel )
		{
			                                                                 
			return;
		}

		  
		                               
		  
		                                                        
		_m_bVanityAnimationAlreadyStarted = true;
		loadout.panel = vanityPanel;
		loadout.selectedWeapon = ItemInfo.GetItemDefinitionName( loadout.itemId );
		loadout.playIntroAnim = true;
		CharacterAnims.PlayAnimsOnPanel( loadout );

		_SetVanityLightingBasedOnBackgroundMovie( vanityPanel );

		if ( loadout.panel.BHasClass( 'hidden' ) ) {
			loadout.panel.RemoveClass( 'hidden' );
		}
	};

	var _DefaultModelLoadouts = function()
	{
		var loadoutsList = CharacterAnims.GetValidCharacterModels();
		var randomEntry = Math.floor( Math.random() * loadoutsList.length );
		
		                                                                 
		var result = Object.assign( {}, loadoutsList[ randomEntry ] );

		                                                                                                 
		if ( result.team === 'any' )
			result.team = 't';

		  
		                                                       
		  
		var survivalRandomEntry = loadoutsList.length - 3 + Math.floor( Math.random()*3 );
		result.model = loadoutsList[ survivalRandomEntry ].model;

		return result;
	};

	var _SetVanityLightingBasedOnBackgroundMovie = function( vanityPanel )
	{
		var backgroundMap = $.GetContextPanel().FindChildInLayoutFile( 'MainMenuMovie' ).GetAttributeString( 'data-type', 'nuke' );

		if ( backgroundMap === 'cbble' )
		{
			vanityPanel.SetFlashlightAmount( 1.0 );
			vanityPanel.SetFlashlightRotation( 0, 0, 0 );
			vanityPanel.SetFlashlightPosition( 38.67, 40.11, 107.51 );
			                                                           
			vanityPanel.SetFlashlightColor( 0.81, 0.92, 1.00 );
			vanityPanel.SetAmbientLightColor( 0.12, 0.21, 0.46 );

			vanityPanel.SetDirectionalLightModify( 0 );
			vanityPanel.SetDirectionalLightColor( 0.13, 0.14, 0.13 );
			vanityPanel.SetDirectionalLightDirection( -0.81, 0.41, 0.43 );
			
			vanityPanel.SetDirectionalLightModify( 1 );
			vanityPanel.SetDirectionalLightColor( 0.82, 0.19, 0.08 );
			vanityPanel.SetDirectionalLightDirection( 0.62, 0.74, -0.25 );
			vanityPanel.SetDirectionalLightPulseFlicker( 0.25, 0.25, 0.25, 0.25 );

			vanityPanel.SetDirectionalLightModify( 2 );
			vanityPanel.SetDirectionalLightColor( 0.72, 1.40, 1.68 );
			vanityPanel.SetDirectionalLightDirection( 0.50, -0.69, -0.52 );

			                                                   
		}
		else if ( 'blacksite' )
		{
			vanityPanel.SetFlashlightAmount( 1 );
			vanityPanel.SetFlashlightRotation( 0, 0, 0 );
			vanityPanel.SetFlashlightPosition( 47.37, 172.91, 0.00 );
			                                                            
			vanityPanel.SetFlashlightColor( 4, 4, 4);
			vanityPanel.SetAmbientLightColor( 0.16, 0.26, 0.30 );
			
			vanityPanel.SetDirectionalLightModify( 0 );
			vanityPanel.SetDirectionalLightColor( 0.26, 0.35, 0.47 );
			vanityPanel.SetDirectionalLightDirection( -0.50, 0.80, 0.00 );
			
			vanityPanel.SetDirectionalLightModify( 1 );
			vanityPanel.SetDirectionalLightColor( 0.74, 1.01, 1.36 );
			vanityPanel.SetDirectionalLightDirection( 0.47, -0.77, -0.42 );

			vanityPanel.SetDirectionalLightModify( 2 );
			vanityPanel.SetDirectionalLightColor( 0.75, 1.20, 1.94 );
			vanityPanel.SetDirectionalLightDirection( 0.76, 0.48, -0.44 );
		}
	};

	                                                                           
	var _OnEquipSlotChanged = function( slot, oldItemID, newItemID )
	{
	};

	var _OpenPlayMenu = function ()
	{
		                                                      
		if ( MatchStatsAPI.GetUiExperienceType() )
			return;

		_InsureSessionCreated();
		_NavigateToTab( 'JsPlay', 'mainmenu_play' );

		                                           	
		_PauseMainMenuCharacter();		
	};

	var _OpenWatchMenu = function()
	{
		_PauseMainMenuCharacter();
		_NavigateToTab( 'JsWatch', 'mainmenu_watch' );
	}

	var _OpenInventory = function ()
	{
		                                           	
		_PauseMainMenuCharacter();

		_NavigateToTab( 'JsInventory', 'mainmenu_inventory' );

	};

	var _InsureSessionCreated = function()
	{
		if ( !LobbyAPI.IsSessionActive() )
		{
			LobbyAPI.CreateSession();
		}
	};

	var _OnEscapeKeyPressed = function( eSource, nRepeats, focusPanel )
	{
		                                
		if ( $.GetContextPanel().BHasClass( 'MainMenuRootPanel--PauseMenuMode' ) ) {
			$.DispatchEvent( 'CSGOMainMenuResumeGame' );
		}
		else {
			MainMenu.OnHomeButtonPressed();

			var elPlayButton = $( '#MainMenuNavBarPlay' );
			if( elPlayButton && !elPlayButton.BHasClass( 'mainmenu-navbar__btn-small--hidden' ) ) {
				$.DispatchEvent('PlayMainMenuMusic', true, true );
			}
		}
	};

	                                                                                                    
	                    
	                                                                                                    
	var _InventoryUpdated = function()
	{
		_InitVanity();
		_UpdateInventoryBtnAlert();
	};

	var _UpdateInventoryBtnAlert = function()
	{
		var count = AcknowledgeItems.GetItems().length;
		var elNavBar = $.GetContextPanel().FindChildInLayoutFile('JsMainMenuNavBar'),
		elAlert = elNavBar.FindChildInLayoutFile('MainMenuInvAlert');

		elAlert.FindChildInLayoutFile('MainMenuInvAlertText').text = count;
		elAlert.SetHasClass( 'hidden', count < 1 );
	};

	var JsInspectCallback = -1;

	var _OnInventoryInspect = function( id )
	{
		UiToolkitAPI.ShowCustomLayoutPopupParameters(
			'',
			'file://{resources}/layout/popups/popup_inventory_inspect.xml',
			'itemid=' + id +
			'&' + 'inspectonly=true',
			'none'
		);
	};

	var JsInspectCallback = -1;
	var _OnLootlistItemPreview = function( id, params )
	{
		if ( JsInspectCallback != -1 )
		{
			UiToolkitAPI.UnregisterJSCallback( JsInspectCallback );
			JsInspectCallback = -1;
		}

		var ParamsList = params.split( ',' );
		var keyId = ParamsList[ 0 ];
		var caseId = ParamsList[ 1 ];
		var storeId = ParamsList[ 2 ];
		var showMarketLinkDefault = _m_bPerfectWorld ? 'false' : 'true';

		JsInspectCallback = UiToolkitAPI.RegisterJSCallback( _OpenDecodeAfterInspect.bind( undefined, keyId, caseId, storeId ) );

		UiToolkitAPI.ShowCustomLayoutPopupParameters(
			'',
			'file://{resources}/layout/popups/popup_inventory_inspect.xml',
			'itemid=' + id +
			'&' + 'inspectonly=true' +
			'&' + 'allowsave=false' +
			'&' + 'showequip=false' +
			'&' + 'showitemcert=false' +
			'&' + 'showmarketlink='+ showMarketLinkDefault +
			'&' + 'callback=' + JsInspectCallback,
			'none'
		);
	};

	var _OpenDecodeAfterInspect = function( keyId, caseId, storeId )
	{
		                                                                                                               
		                                                                                    
		                              
		var backtostoreiteminspectsettings = storeId ?
			'&' + 'asyncworkitemwarning=no' +
			'&' + 'asyncforcehide=true' +
			'&' + 'storeitemid=' + storeId :
			'';

		UiToolkitAPI.ShowCustomLayoutPopupParameters(
			'',
			'file://{resources}/layout/popups/popup_capability_decodable.xml',
			'key-and-case=' + keyId + ',' + caseId +
			'&' + 'asyncworktype=decodeable' +
			backtostoreiteminspectsettings
		);
	};

	var _WeaponPreviewRequest = function( id )
	{
		UiToolkitAPI.CloseAllVisiblePopups();

		UiToolkitAPI.ShowCustomLayoutPopupParameters(
			'',
			'file://{resources}/layout/popups/popup_inventory_inspect.xml',
			'itemid=' + id +
			'&' + 'inspectonly=true' +
			'&' + 'allowsave=false' +
			'&' + 'showequip=false' +
			'&' + 'showitemcert=true',
			'none'
		);
	};

	var _UpdateOverwatch = function()
	{
		var strCaseDescription = OverwatchAPI.GetAssignedCaseDescription();
		$( '#MainMenuNavBarOverwatch' ).SetHasClass( 'mainmenu-navbar__btn-small--hidden', strCaseDescription == "" );
	};

	function _CancelNotificationSchedule()
	{
		if ( _m_notificationSchedule !== false )
		{
			$.CancelScheduled( _m_notificationSchedule );
			_m_notificationSchedule = false;
		}
	}

	function _AcknowledgePenaltyNotificationsCallback()
	{
		CompetitiveMatchAPI.ActionAcknowledgePenalty();

		_m_bHasPopupNotification = false;
	}

	function _AcknowledgeMsgNotificationsCallback()
	{
		MyPersonaAPI.ActionAcknowledgeNotifications();

		_m_bHasPopupNotification = false;
	}

	function _GetPopupNotification()
	{
		var popupNotification = {
			title: "",
			msg: "",
			color_class: "NotificationYellow",
			callback: function() {}
		};
		
		var nBanRemaining = CompetitiveMatchAPI.GetCooldownSecondsRemaining();
		if ( nBanRemaining < 0 )
		{
			popupNotification.title = "#SFUI_MainMenu_Competitive_Ban_Confirm_Title";
			popupNotification.msg = $.Localize( "#SFUI_CooldownExplanationReason_Expired_Cooldown" ) + $.Localize( CompetitiveMatchAPI.GetCooldownReason() );
			popupNotification.callback = _AcknowledgePenaltyNotificationsCallback;

			return popupNotification;
		}

		var strNotifications = MyPersonaAPI.GetMyNotifications();
		if ( strNotifications !== "" )
		{
			var arrayOfNotifications = strNotifications.split( ',' );
			arrayOfNotifications.forEach( function( notificationType )
			{
				if ( notificationType != 6 )
				{
					popupNotification.color_class = 'NotificationBlue';
				}
				popupNotification.title = '#SFUI_PersonaNotification_Title_' + notificationType;
				popupNotification.msg = '#SFUI_PersonaNotification_Msg_' + notificationType;
				popupNotification.callback = _AcknowledgeMsgNotificationsCallback;

				return true;
			} );

			return popupNotification;
		}

		return null;
	}

	function _UpdatePopupnotification()
	{
		                                                                       
		if ( !_m_bHasPopupNotification )
		{
			var popupNotification = _GetPopupNotification();
			if ( popupNotification != null )
			{
				UiToolkitAPI.ShowGenericPopupOneOption(
					popupNotification.title,
					popupNotification.msg,
					popupNotification.color_class,
					'#SFUI_MainMenu_ConfirmBan',
					popupNotification.callback
				);
		
				_m_bHasPopupNotification = true;
			}
		}
	}

	function _GetNotificationBarData()
	{
		var notification = { color_class: "", title: "", tooltip: "" };

		if ( LicenseUtil.GetCurrentLicenseRestrictions() === false )
		{
			  
			                                                                                              
			  
			var bIsConnectedToGC = MyPersonaAPI.IsConnectedToGC();
			$( '#MainMenuInput' ).SetHasClass( 'GameClientConnectingToGC', !bIsConnectedToGC );
			if ( bIsConnectedToGC )
			{	                                                                 
				_m_tLastSeenDisconnectedFromGC = 0;
			}
			else if ( !_m_tLastSeenDisconnectedFromGC )
			{	                                                                          
				_m_tLastSeenDisconnectedFromGC = + new Date();                                                          
			}
			else if ( Math.abs( ( + new Date() ) - _m_tLastSeenDisconnectedFromGC ) > 7000 )
			{	                                           
				notification.color_class = "NotificationLoggingOn";
				notification.title = $.Localize( "#Store_Connecting_ToGc" );
				notification.tooltip = $.Localize( "#Store_Connecting_ToGc_Tooltip" );
				return notification;
			}
		}

		  
		                             
		  
		var nIsVacBanned = MyPersonaAPI.IsVacBanned();
		if ( nIsVacBanned != 0 )
		{
			notification.color_class = "NotificationRed";

			if ( nIsVacBanned == 1 )
			{
				notification.title = $.Localize( "#SFUI_MainMenu_Vac_Title" );
				notification.tooltip = $.Localize( "#SFUI_MainMenu_Vac_Info" );
			}
			else
			{
				notification.title = $.Localize( "#SFUI_MainMenu_GameBan_Title" );
				notification.tooltip = $.Localize( "#SFUI_MainMenu_GameBan_Info" );
			}
			
			return notification;
		}

		  
		                                  
		  
		if ( NewsAPI.IsNewClientAvailable() )
		{
			notification.color_class = "NotificationYellow";
			notification.title = $.Localize( "#SFUI_MainMenu_Outofdate_Title" );
			notification.tooltip = $.Localize( "#SFUI_MainMenu_Outofdate_Body" );

			return notification;
		}	
		
		  
		                             
		  
		var nBanRemaining = CompetitiveMatchAPI.GetCooldownSecondsRemaining();
		if ( nBanRemaining > 0 )
		{
			notification.tooltip = CompetitiveMatchAPI.GetCooldownReason();

			var strType = CompetitiveMatchAPI.GetCooldownType();
			if ( strType == "global" )
			{
				notification.title = $.Localize( "#SFUI_MainMenu_Global_Ban_Title" );
				notification.color_class = "NotificationRed";
			}
			else if ( strType == "green" )
			{
				notification.title = $.Localize( "#SFUI_MainMenu_Temporary_Ban_Title" );
				notification.color_class = "NotificationGreen";
			}
			else if ( strType == "competitive" )
			{
				notification.title = $.Localize( "#SFUI_MainMenu_Competitive_Ban_Title" );
				notification.color_class = "NotificationYellow";
			}
			
			                                                                                                                
			if ( nBanRemaining <= 49*24*3600 )
			{
				notification.title = notification.title + ' ' + FormatText.SecondsToSignificantTimeString( nBanRemaining );
			}

			return notification;
		}	

		return null;
	}

	function _UpdateNotificationBar()
	{
		var notification = _GetNotificationBarData();

		                   
		_m_NotificationBarColorClasses.forEach( function ( strColorClass )
		{
			var bVisibleColor = false;
			if ( notification !== null )
			{
				bVisibleColor = strColorClass === notification.color_class;
			}
			_m_elNotificationsContainer.SetHasClass( strColorClass, bVisibleColor );
		} );

		                         
		if ( notification !== null )
		{
			$.FindChildInContext( '#MainMenuNotificationTitle' ).text = notification.title;
		}

		_m_elNotificationsContainer.SetHasClass( 'hidden', notification === null );
	}

	var _UpdateNotifications = function()
	{
		_m_notificationSchedule = $.Schedule( 1.0, _UpdateNotifications );

		_UpdatePopupnotification();

		_UpdateNotificationBar();
	};


	                                                                                                    
	                    
	                                                                                                    
	var _m_acknowledgePopupHandler = null;
	var _ShowAcknowledgePopup = function( type, itemid )
	{
		var updatedItemTypeAndItemid = '';
		if ( itemid && type )
			updatedItemTypeAndItemid = 'ackitemid=' + itemid + '&acktype=' + type;
			
		if( !_m_acknowledgePopupHandler ) {
			var jsPopupCallbackHandle;
			jsPopupCallbackHandle = UiToolkitAPI.RegisterJSCallback( MainMenu.ResetAcknowlegeHandler );

			_m_acknowledgePopupHandler = UiToolkitAPI.ShowCustomLayoutPopupParameters( 
				'',
				'file://{resources}/layout/popups/popup_acknowledge_item.xml',
				updatedItemTypeAndItemid + '&callback=' + jsPopupCallbackHandle
			);

			$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.inventory_new_item', 'MOUSE' );
		}
	};

	var _ResetAcknowlegeHandler = function()
	{
		_m_acknowledgePopupHandler = null;
	};

	var _ShowNotificationBarTooltip = function ()
	{
		var notification = _GetNotificationBarData();
		if ( notification !== null )
		{
			UiToolkitAPI.ShowTextTooltip( 'NotificationsContainer', notification.tooltip );
		}
	};

	var _ShowVote = function ()
	{
		var contextMenuPanel = UiToolkitAPI.ShowCustomLayoutContextMenuParametersDismissEvent(
			'MainMenuNavBarVote',
			'',
			'file://{resources}/layout/context_menus/context_menu_vote.xml',
			'',
			function()
			{
				                                    
			}
		);
		contextMenuPanel.AddClass( "ContextMenu_NoArrow" );
	};

	var _HideStoreStatusPanel = function () {
	    if (_m_storePopupElement && _m_storePopupElement.IsValid()) {
	        _m_storePopupElement.DeleteAsync(0);
	    }

	    _m_storePopupElement = null;
	};

	var _ShowStoreStatusPanel = function (strText, bAllowClose, bCancel, strOkCmd)
	{
	    _HideStoreStatusPanel();

	    var paramclose = '0';
	    if (bAllowClose) {
	        paramclose = '1';
	    }

	    var paramcancel = '0';
	    if (bCancel) {
	        paramcancel = '1';
	    }

	    _m_storePopupElement = UiToolkitAPI.ShowCustomLayoutPopupParameters(
            'store_popup',
            'file://{resources}/layout/popups/popup_store_status.xml',
			'text=' + $.UrlEncode( strText ) +
			'&' + 'allowclose=' + paramclose +
			'&' + 'cancel=' + paramcancel +
			'&'+'okcmd=' + $.UrlEncode( strOkCmd ) );
	};

	var _ShowWeaponUpdatePopup = function()
	{
		return;                                                         
		var setVersionTo = '1';
		var currentVersion = GameInterfaceAPI.GetSettingString( 'ui_popup_weaponupdate_version' );

		if ( currentVersion !== setVersionTo )
		{
			                      
			$.Schedule( 1.75, showMp5Popup );

			function showMp5Popup ()
			{
				var defIndex = 23;
				UiToolkitAPI.ShowCustomLayoutPopupParameters(
					'',
					'file://{resources}/layout/popups/popup_weapon_update.xml',
					'defindex=' + defIndex +
					'&' + 'uisettingversion=' + setVersionTo,
					'none'
				);
			}
		}
	};

	var _PauseMainMenuCharacter = function()
	{
		var vanityPanel = $( '#JsMainmenu_Vanity' );

		if ( vanityPanel && UiToolkitAPI.IsPanoramaInECOMode() )
		{
			vanityPanel.Pause( true );
		}
	}

	var _ShowTournamentStore = function() 
	{
		UiToolkitAPI.ShowCustomLayoutPopupParameters(
			'',
			'file://{resources}/layout/popups/popup_tournament_store.xml',
			'',
			'none'
		);
	}; 
	
	                                                                                                    
	                                                
	                                                                                                    
	var _ResetSurvivalEndOfMatch = function()
	{
		_DeleteSurvivalEndOfMatch();

		function CreateEndOfMatchPanel ()
		{
			var elPanel = $.CreatePanel(
				'CSGOSurvivalEndOfMatch',
				$( '#MainMenuBackground' ),
				'PauseMenuSurvivalEndOfMatch',
				{
					class: 'PauseMenuModeOnly'
				}
			);

			
			elPanel.SetAttributeString( 'pausemenu', 'true' );
			_UpdateSurvivalEndOfMatchInstance();
		}

		$.Schedule( 0.1, CreateEndOfMatchPanel );
	};

	var _DeleteSurvivalEndOfMatch = function()
	{
		if ( $( '#PauseMenuSurvivalEndOfMatch' ) )
		{
			$( '#PauseMenuSurvivalEndOfMatch' ).DeleteAsync( 0.0 );
		}
	};

	function _UpdateSurvivalEndOfMatchInstance()
	{
		var elSurvivalPanel = $( '#PauseMenuSurvivalEndOfMatch' );

		if ( elSurvivalPanel && elSurvivalPanel.IsValid() )
		{
			$( '#PauseMenuSurvivalEndOfMatch' ).matchStatus.UpdateFromPauseMenu();
		}
	}

	return {
		OnInitFadeUp						: _OnInitFadeUp,
		OnShowMainMenu						: _OnShowMainMenu,
		OnHideMainMenu	 					: _OnHideMainMenu,
		OnShowPauseMenu	 					: _OnShowPauseMenu,
		OnHidePauseMenu	 					: _OnHidePauseMenu,
		NavigateToTab	 					: _NavigateToTab,
		ShowContentPanel	 				: _ShowContentPanel,
		OnHideContentPanel	 				: _OnHideContentPanel,
		GetActiveNavBarButton	 			: _GetActiveNavBarButton,
		ShowHideNavDrawer	 				: _ShowHideNavDrawer,
		ExpandSidebar	 					: _ExpandSidebar,
		MinimizeSidebar	 					: _MinimizeSidebar,
		OnSideBarElementContextMenuActive	: _OnSideBarElementContextMenuActive,
		InitFriendsList	 					: _InitFriendsList,
		InitNewsAndStore					: _InitNewsAndStore,
		InitVanity							: _InitVanity,
		ForceRestartVanity	 				: _ForceRestartVanity,
		OnEquipSlotChanged	 				: _OnEquipSlotChanged,
		OpenPlayMenu						: _OpenPlayMenu,
		OpenWatchMenu						: _OpenWatchMenu,
		OpenInventory						: _OpenInventory,
		OnHomeButtonPressed					: _OnHomeButtonPressed,
		OnQuitButtonPressed					: _OnQuitButtonPressed,
		OnEscapeKeyPressed					: _OnEscapeKeyPressed,
		GcLogonNotificationReceived			: _GcLogonNotificationReceived,
		InventoryUpdated					: _InventoryUpdated,
		OnInventoryInspect					: _OnInventoryInspect,
		WeaponPreviewRequest				: _WeaponPreviewRequest,
		OnLootlistItemPreview				: _OnLootlistItemPreview,
		UpdateOverwatch						: _UpdateOverwatch,
		UpdateNotifications					: _UpdateNotifications,
		ShowAcknowledgePopup				: _ShowAcknowledgePopup,
		ResetAcknowlegeHandler				: _ResetAcknowlegeHandler,
		ShowNotificationBarTooltip			: _ShowNotificationBarTooltip,
		ShowVote 							: _ShowVote,
		ShowStoreStatusPanel				: _ShowStoreStatusPanel,
		HideStoreStatusPanel				: _HideStoreStatusPanel,
		PauseMainMenuCharacter				: _PauseMainMenuCharacter,
		ShowTournamentStore					: _ShowTournamentStore,
		TournamentDraftUpdate				: _TournamentDraftUpdate,
		ResetSurvivalEndOfMatch				: _ResetSurvivalEndOfMatch
	};
})();


                                                                                                    
                                           
                                                                                                    
(function()
{
	$.RegisterForUnhandledEvent( 'HideContentPanel', MainMenu.OnHideContentPanel );
	$.RegisterForUnhandledEvent( 'SidebarContextMenuActive', MainMenu.OnSideBarElementContextMenuActive );
	$.RegisterForUnhandledEvent( 'UpdateVanityModelData', MainMenu.ForceRestartVanity );
	$.RegisterForUnhandledEvent( 'OpenPlayMenu', MainMenu.OpenPlayMenu );
	$.RegisterForUnhandledEvent( 'OpenInventory', MainMenu.OpenInventory );
	$.RegisterForUnhandledEvent( 'OpenWatchMenu', MainMenu.OpenWatchMenu );
	$.RegisterForUnhandledEvent( 'CSGOShowMainMenu', MainMenu.OnShowMainMenu);
	$.RegisterForUnhandledEvent( 'CSGOHideMainMenu', MainMenu.OnHideMainMenu);
	$.RegisterForUnhandledEvent( 'CSGOShowPauseMenu', MainMenu.OnShowPauseMenu);
	$.RegisterForUnhandledEvent( 'CSGOHidePauseMenu', MainMenu.OnHidePauseMenu);
	$.RegisterForUnhandledEvent( 'OpenSidebarPanel', MainMenu.ExpandSidebar);
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_GcLogonNotificationReceived', MainMenu.GcLogonNotificationReceived );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', MainMenu.InventoryUpdated );
	$.RegisterForUnhandledEvent( 'InventoryItemPreview', MainMenu.OnInventoryInspect );
	$.RegisterForUnhandledEvent( 'LootlistItemPreview', MainMenu.OnLootlistItemPreview );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_Inventory_WeaponPreviewRequest', MainMenu.WeaponPreviewRequest );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_Overwatch_CaseUpdated', MainMenu.UpdateOverwatch );
	$.RegisterForUnhandledEvent( "PanoramaComponent_TournamentMatch_DraftUpdate", MainMenu.TournamentDraftUpdate );

	$.RegisterForUnhandledEvent( 'ShowAcknowledgePopup', MainMenu.ShowAcknowledgePopup );
    $.RegisterForUnhandledEvent( 'ShowStoreStatusPanel', MainMenu.ShowStoreStatusPanel );
	$.RegisterForUnhandledEvent( 'HideStoreStatusPanel', MainMenu.HideStoreStatusPanel );

	$.RegisterForUnhandledEvent( 'ShowVoteContextMenu', MainMenu.ShowVote );
	$.RegisterForUnhandledEvent( 'ShowTournamentStore', MainMenu.ShowTournamentStore );

	$.RegisterForUnhandledEvent( 'OnMapConfigLoaded', MainMenu.ResetSurvivalEndOfMatch );
	
	MainMenu.MinimizeSidebar();
	MainMenu.InitVanity();
	MainMenu.MinimizeSidebar();
	MainMenu.InitFriendsList();
	MainMenu.InitNewsAndStore();

	                                                                                  
	$.RegisterEventHandler( "Cancelled", $.GetContextPanel(), MainMenu.OnEscapeKeyPressed );

})();
