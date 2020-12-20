'use strict';

var OperationMainMenu = ( function()
{

	var _m_nSeasonIndex = null;
	var _m_InventoryUpdatedHandler = null;
	var _m_cp = $.GetContextPanel();
	var _m_oNamesFlipModule = null;
	var _m_oNamesFlipModuleMissions = null;
	var _m_DeepStatsEvtHandle = null;

	var _m_oLastMatch = null;

	                        
	                        
	                        
	var _Init = function()
	{
		_RegisterForInventoryUpdate();
		_OnInventoryUpdated();
	};

	var _RegisterForInventoryUpdate = function()
	{
		if ( !_m_InventoryUpdatedHandler )
		{
			_m_InventoryUpdatedHandler = $.RegisterForUnhandledEvent(
				'PanoramaComponent_MyPersona_InventoryUpdated', _OnInventoryUpdated );
		}

		_m_cp.RegisterForReadyEvents( true );

		$.RegisterEventHandler( 'ReadyForDisplay', _m_cp, function()
		{
			if ( !_m_InventoryUpdatedHandler )
			{
				_m_InventoryUpdatedHandler = $.RegisterForUnhandledEvent(
					'PanoramaComponent_MyPersona_InventoryUpdated', _OnInventoryUpdated );
			}
		} );

		$.RegisterEventHandler( 'UnreadyForDisplay', _m_cp, function()
		{
			if ( _m_InventoryUpdatedHandler )
			{
				$.UnregisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', _m_InventoryUpdatedHandler );
				_m_InventoryUpdatedHandler = null;
			}
		} );
	};
	
	var _OnInventoryUpdated = function()
	{
		if ( !MyPersonaAPI.IsInventoryValid() )
		{
			                                                      
			return;
		}

		if ( !_m_nSeasonIndex )
		{
			_m_nSeasonIndex = GameTypesAPI.GetActiveSeasionIndexValue();
		}

		_CheckUsersOperationStatus();
	};
	
	var _CheckUsersOperationStatus = function()
	{
		OperationUtil.ValidateOperationInfo( _m_nSeasonIndex );
		var oStatus = OperationUtil.GetOperationInfo();

		if ( _m_nSeasonIndex === -1 ||
			!_m_nSeasonIndex ||
			oStatus.nCoinRank === -1 ||
			oStatus.nCoinRank === undefined ||
			oStatus.nCoinRank === null )
		{
			return;
		}

		_ShowUpdatePanelBasedOnStatus( oStatus );
		if ( _m_DeepStatsEvtHandle === null ) 
		{
			_m_DeepStatsEvtHandle = $.RegisterForUnhandledEvent( 'DeepStatsReceived', OperationMainMenu.OnStatsReceived );
		}
		_m_cp.RemoveClass( 'hidden' );
		$.DispatchEvent( 'HideMainMenuNewsPanel' );
	};

	var _ShowUpdatePanelBasedOnStatus = function( oStatus )
	{	
		_ShowUpSell();

		if ( !oStatus.bPremiumUser )
		{
			                                               
			if ( oStatus.nActiveCardIndex > -1 )
			{
				_ShowOperationPanel( oStatus );
				_HideUpSell();
				return;
			}
			
			                                            
			_ShowUpSell();
		}
		else
		{
			_ShowOperationPanel( oStatus );
			_HideUpSell();
		}
	};

	var _ShowUpSell = function()
	{
		var onMissionSelect = function()
		{
			UiToolkitAPI.ShowGenericPopupTwoOptions(
				'#op_select_mission_card',
				'#op_play_mission_popup_desc',
				'',
				'#op_select_mission_card',
				function() { _OnMissionSelectPopupBtnPress( 'Option1' ) },
				'Cancel',
				function() { }
			);
		};
		
		var elUpsell = $.GetContextPanel().FindChildInLayoutFile( 'id-op-mainmenu-upsell' );
		elUpsell.AddClass( 'show' );

		var btnPremium = elUpsell.FindChildInLayoutFile( 'id-op-mainmenu-upsell-store' );
		btnPremium.SetPanelEvent( 'onactivate',
			OperationUtil.OpenUpSell.bind( undefined )
		);

		var sUserOwnedOperationPassItemID = InventoryAPI.GetActiveSeasonPassItemId();
		var sFauxPassItemID = OperationUtil.GetPassFauxId();
		
		btnPremium.text = sUserOwnedOperationPassItemID ? '#SFUI_ConfirmBtn_ActivatePassNow' : '#op_get_premium';
		
		elUpsell.FindChildInLayoutFile( 'id-op-mainmenu-upsell-store-image' ).itemid = sFauxPassItemID;

		var elMissions = $.GetContextPanel().FindChildInLayoutFile( 'id-op-mainmenu-mission_select' );
		elMissions.SetPanelEvent( 'onactivate', onMissionSelect );

		  
		                               
		  
		var elPassSaleDiscount = elUpsell.FindChildInLayoutFile( 'id-op-mainmenu-upsell-store-passsalediscount' );
		elPassSaleDiscount.visible = sUserOwnedOperationPassItemID ? false : true;
		var sPctReduction = StoreAPI.GetStoreItemPercentReduction( sFauxPassItemID );
		if ( sPctReduction && sPctReduction !== '-0%' )
			elPassSaleDiscount.text = sPctReduction;
		else
			elPassSaleDiscount.visible = false;
	};

	var _OnMissionSelectPopupBtnPress = function( msg )
	{
		                                                              
		
		             
		var jsoCardDetails = MissionsAPI.GetSeasonalOperationMissionCardDetails( _m_nSeasonIndex, 0 );
		var missionCardId = jsoCardDetails.id;

		                            
		var missionId = jsoCardDetails.quests[ 0 ];
		var MissionItemID = InventoryAPI.GetQuestItemIDFromQuestID( Number( missionId ) );

		UiToolkitAPI.ShowCustomLayoutPopupParameters(
			'',
			'file://{resources}/layout/popups/popup_activate_mission.xml',
			'message=' + $.Localize( '#op_mission_activate' ) +
			'&' + 'requestedMissonCardId=' + missionCardId +
			'&' + 'seasonAccess=' + _m_nSeasonIndex +
			'&' + 'questItemID=' + MissionItemID +
			'&' + 'spinner=1' +
			'&' + 'activateonly=true'
		);
	};

	var _HideUpSell = function()
	{
		var elUpsell = $.GetContextPanel().FindChildInLayoutFile( 'id-op-mainmenu-upsell' );
		elUpsell.RemoveClass( 'show' );
	};

	var _ShowOperationPanel = function( oStatus )
	{
		_SetUpFlipAnimForMissions();
		_ShowStatsPanel( oStatus );
		_ShowPassStatusPanel( oStatus );
		_UpdateMissionsPanel( oStatus );
	};

	var _ShouldShowStorePanel = function()
	{
		return _m_nSeasonIndex !== null && _m_nSeasonIndex >= 9;
	};

	                    
	                   
	                    

	function _OnStatsReceived ()
	{
		var oMatch = DeepStatsAPI.GetLastCachedMatchJS();

		if ( !oMatch )
			return;

		var oStatus = OperationUtil.GetOperationInfo();
		
		if ( _m_oLastMatch !== null && _m_oLastMatch.matches[ 0 ].player.match_id != oMatch.matches[ 0 ].player.match_id )
		{
			_ShowStatsPanel( oStatus );
		}
	}

	var _ShowStatsPanel = function ( oStatus )
	{
		var elStatPanel = _m_cp.FindChildInLayoutFile( 'id-op-mainmenu-stats' );
		var elBtn = _m_cp.FindChildInLayoutFile( 'id-op-mainmenu-open-stats-btn' );
		
		if( !_ShouldShowStorePanel() )
		{
			elStatPanel.SetHasClass( 'hide', true );
			return;
		}

		elStatPanel.SetHasClass( 'hide', false );

		if( !oStatus.bPremiumUser )
		{
			_m_cp.FindChildInLayoutFile( 'id-op-mainmenu-stats-section' ).SetHasClass( 'hide', true );
			_m_cp.FindChildInLayoutFile( 'id-op-mainmenu-stats-upsell' ).SetHasClass( 'hide', false );
			_m_cp.FindChildInLayoutFile( 'id-op-mainmenu-stats-store-image' ).itemid = OperationUtil.GetPassFauxId();

			elBtn.text = $.Localize(
				InventoryAPI.GetActiveSeasonPassItemId() ? 
				'#SFUI_ConfirmBtn_ActivatePassNow' : 
				'#op_get_premium'
				).toUpperCase();

			elBtn.SetPanelEvent( 'onactivate', function()
			{
				OperationUtil.OpenUpSell();
			} );

			_m_cp.FindChildInLayoutFile( 'id-op-mainmenu-stats' ).SetPanelEvent( 'onactivate', function()
			{
				OperationUtil.OpenUpSell();
			} );

			return;
		}
		else
		{
			_m_cp.FindChildInLayoutFile( 'id-op-mainmenu-stats-upsell' ).SetHasClass( 'hide', true );
			_m_cp.FindChildInLayoutFile( 'id-op-mainmenu-stats-section' ).SetHasClass( 'hide', false );

			elBtn.text = $.Localize( '#op_mainmenu_stats_btn_text' );
			elBtn.SetPanelEvent( 
				'onactivate', 
				function(){
					$.DispatchEvent( 'OpenStatsMenu' );
			});

			_m_cp.FindChildInLayoutFile( 'id-op-mainmenu-stats' ).SetPanelEvent( 
				'onactivate', 
				function(){
					$.DispatchEvent( 'OpenStatsMenu' );
			});
		}

		_m_oLastMatch = DeepStatsAPI.GetLastCachedMatchJS();

		var bHasMatchData = _m_oLastMatch != null && _m_oLastMatch.matches.length > 0;
		elStatPanel.SetHasClass( 'no-match-data', !bHasMatchData );

		if( !bHasMatchData )
			return;
		
		                   
		                                      
		var oMatch = _m_oLastMatch.matches[ 0 ].player;

		var elResult = _m_cp.FindChildTraverse( 'id-op-mainmenu-stats-match-result' ); 
		
		elResult.SetHasClass( 'op-mainmenu__stats__match__win-loss--green',( oMatch.match_outcome & 0x3 ) == 1 );
		elResult.SetHasClass( 'op-mainmenu__stats__match__win-loss--red',( oMatch.match_outcome & 0x3 ) == 2 );
		elResult.SetHasClass( 'op-mainmenu__stats__match__win-loss--yellow',( oMatch.match_outcome & 0x3 ) == 0 );

		elResult.SetHasClass( 'op-mainmenu__stats__match__win-loss--dnf', ( oMatch.match_outcome & 0x4 ) );
		
		                
		_MapInfo( DeepStatsAPI.MapIDToString( oMatch.mapid ) );

		var mode = DeepStatsAPI.GetMatchTypeString( oMatch.mm_game_mode );
		var strMode = '';

		switch ( mode )
		{
			case "Competitive":
				strMode = 'SFUI_GameModeCompetitive';
				break;
			
			case "Wingman":
				strMode = 'SFUI_GameModeScrimComp2v2';
				break;
			
			case "CompetitiveCaptains":
				strMode = 'SFUI_GameModeCompetitiveTeams';
				break;
			
			case "CompetitiveScrimmage":
				strMode = 'playerstats_mode_comp_scrim';
				break;				
			
			default:
				strMode = '';
		}
		
		var timestamp = DeepStatsAPI.MatchIDToLocalTime( oMatch.match_id );
		var strTime = DeepStatsAPI.GetRelativeTimeStringForTimestamp( timestamp );

		_MatchTimeAndMode( strTime, $.Localize( strMode ) );
		_UpdateTeammates( oMatch.mates );
		_UpdateStats( oMatch, mode );

		        
		elStatPanel.SetDialogVariable( 'myscore', String( oMatch.rounds_won) );
		elStatPanel.SetDialogVariable( 'enemyscore', String( oMatch.rounds_lost) );
	};

	function _UpdateStats ( oMatch, mode )
	{
		var elStatsContainer = _m_cp.FindChildTraverse( 'id-op-mainmenu-stats-match-stats' );

		elStatsContainer.SetDialogVariable( 'kills', MatchStats.GetTotalKills( oMatch ) );
		elStatsContainer.SetDialogVariable( 'kdr', MatchStats.GetKillsPerDeath( oMatch ) );
		elStatsContainer.SetDialogVariable( 'adr', MatchStats.GetDamagePerRound( oMatch ) );
		elStatsContainer.SetDialogVariable( 'dmg', MatchStats.GetTotalDamage( oMatch ) );
		
		elStatsContainer.SetDialogVariable( 'hsp',  MatchStats.GetHeadShotKillRate( oMatch ) + '%'  );
		elStatsContainer.SetDialogVariable( 'mk', MatchStats.GetTotalMultiKills( oMatch )  );
	}

	var _MapInfo = function( mapName )
	{
		var elMapIcon = _m_cp.FindChildInLayoutFile( "id-op-mainmenu-stats-match-map-icon" );
		elMapIcon.SetImage ( "file://{images}/map_icons/map_icon_" + mapName + ".svg" );
		_m_cp.FindChildInLayoutFile( "id-op-mainmenu-stats-match-map-name" ).text = $.Localize( 'SFUI_Map_' + mapName );

		var elBackground = _m_cp.FindChildInLayoutFile( "id-op-mainmenu-stats-background" );
		elBackground.style.backgroundImage = 'url("file://{images}/map_icons/screenshots/360p/' + mapName + '.png")';
		elBackground.style.backgroundPosition = '50% 50%';
		elBackground.style.backgroundSize = "clip_then_cover";
		elBackground.style.brightness = "0.25";
		elBackground.style.backgroundImgOpacity = ".8";
		elBackground.style.blur = "gaussian( 3, 3, 2)";

	};

	var _MatchTimeAndMode = function( time, mode )
	{
		var elMapTime = _m_cp.FindChildInLayoutFile( "id-op-mainmenu-stats-match-map-time" );

		elMapTime.SetDialogVariable( 'time',  time );
		elMapTime.SetDialogVariable( 'mode', mode );
	};

	var _UpdateTeammates = function( arrMates )
	{
		var elMates = _m_cp.FindChildInLayoutFile( "id-op-mainmenu-stats-match-teammates" );
		elMates.RemoveAndDeleteChildren();

		arrMates.forEach( function( accountId, index )
		{
			var xuid = DeepStatsAPI.GetXUIDByAccountID( accountId );
			var elAvatar = $.CreatePanel( 'CSGOAvatarImage', elMates, index );
			elAvatar.steamid = xuid;
			elAvatar.AddClass( 'avatar-image__icon' );
			
			elAvatar.SetPanelEvent( 'onactivate', function( xuid )
			{
				var contextMenuPanel = UiToolkitAPI.ShowCustomLayoutContextMenuParametersDismissEvent(
					'',
					'',
					'file://{resources}/layout/context_menus/context_menu_playercard.xml',
					'xuid=' + xuid,
					function() {}
				)
				contextMenuPanel.AddClass( "ContextMenu_NoArrow" );

			}.bind( this, xuid ) );
		} );
	};

	                    

	var _ShowMainMenu = function()
	{
		                                      
		                                                                                 
		                                                                        

		_CheckUsersOperationStatus();
	};

	var _HideMainMenu = function()
	{
		if ( OperationMissionCard )
		{
			OperationMissionCard.CancelUnlockTimer();
		}

		                                      
		                                                                                 
		                             
	};

	                    
	                    
	                    
	var _UpdateMissionsPanel = function( oStatus )
	{
		_m_cp.FindChildInLayoutFile( 'id-op-mainmenu-missions' ).RemoveClass( 'hide' );
		_m_cp.SetDialogVariableInt( 'total_missions', oStatus.nMissionsCompleted );

		_m_oNamesFlipModuleMissions.ActiveIndex = ( oStatus.nActiveCardIndex < 0 ? 0 : oStatus.nActiveCardIndex ) - 1;
		_m_oNamesFlipModuleMissions.oData.numMissionCards = MissionsAPI.GetSeasonalOperationMissionCardsCount(
			OperationUtil.GetOperationInfo().nSeasonAccess );
		
		_m_oNamesFlipModuleMissions.UseCallback();

		_UpdateXpDisplay( oStatus );

	};

	var _SetUpFlipAnimForMissions = function()
	{
		if ( !_m_oNamesFlipModuleMissions )
		{
			_m_oNamesFlipModuleMissions = new FlipPanelAnimation.Constructor( {
				controlBtnPrev: _m_cp.FindChildInLayoutFile( 'id-op-mission-prev' ),
				controlBtnNext: _m_cp.FindChildInLayoutFile( 'id-op-mission-next' ),
				animPanelA: _m_cp.FindChildInLayoutFile( 'id-op-mission-name-1' ),
				animPanelB: _m_cp.FindChildInLayoutFile( 'id-op-mission-name-2' ),
				parentPanel: _m_cp.FindChildInLayoutFile( 'id-op-mainmenu-missions' ),
				funcCallback: UpdateMissionDisplay,
				activeIndex: 0
			} );
			_m_oNamesFlipModuleMissions[ 'ControlBtnActions' ]();
		}
	};

	var _UpdateXpDisplay = function( oStatus )
	{
		  
		                                                        
		                                                                                  
		                                               
		                                                       
		  

		var elXpLabel = _m_cp.FindChildInLayoutFile( 'id-mission-card-xp-progress' );
		elXpLabel.GetParent().visible = oStatus.bPremiumUser;

		if ( !oStatus.bPremiumUser )
		{
			return;
		}

		elXpLabel.text = "";                                                                      
	
		var numPreviousMissionsCompletedForReward = 0;
		var numNextMissionsCompletedNeededForReward = null;
		var allThresholds = oStatus.nMissionsRewardThresholds.split( ',' );
		for ( var j = 0; j < allThresholds.length; ++j )
		{
			var numericThreshold = parseInt( allThresholds[ j ] );
			if ( oStatus.nMissionsCompleted < numericThreshold )
			{
				numNextMissionsCompletedNeededForReward = numericThreshold;
				break;                  
			} else
			{
				numPreviousMissionsCompletedForReward = numericThreshold;
				                    
			}
		}
		if ( numNextMissionsCompletedNeededForReward )
		{
			_m_cp.SetDialogVariableInt( 'xp_missions_completed', oStatus.nMissionsCompleted - numPreviousMissionsCompletedForReward );
			_m_cp.SetDialogVariableInt( 'xp_missions_needed', numNextMissionsCompletedNeededForReward - numPreviousMissionsCompletedForReward );
			elXpLabel.text = $.Localize( '#op_mission_card_xp_reward', _m_cp );
		}
	};

	var _SetUpCardUnlockDisplay = function()
	{
		var elPanel = _m_cp.FindChildInLayoutFile( 'id-op-mainmenu-mission-unlock' );
		var numMissionBacklog = InventoryAPI.GetMissionBacklog();
		var bShouldShow = _m_oNamesFlipModuleMissions.ActiveIndex < numMissionBacklog - 1;

		elPanel.SetHasClass( 'hide', !bShouldShow );
		
		if ( !bShouldShow )
		{
			return;
		}
		
		elPanel.SetDialogVariableInt( 'unlocked_week', numMissionBacklog );
		elPanel.SetPanelEvent( 'onactivate', _GotoMissionWeek.bind( undefined, ( numMissionBacklog - 1 )) );
	};

	var _GotoMissionWeek = function( numMissionBacklog )
	{
		_m_oNamesFlipModuleMissions.oData.activeIndex = numMissionBacklog - 1;
		UpdateMissionDisplay( _m_oNamesFlipModuleMissions.oData, false );
	}

	var UpdateMissionDisplay = function( oData, isPrev = false )
	{
		function UpdateData ( oData, isPrev )
		{
			var jsoCardDetails = MissionsAPI.GetSeasonalOperationMissionCardDetails(
				OperationUtil.GetOperationInfo().nSeasonAccess, oData.activeIndex );

			if ( !jsoCardDetails )
			{
				                                                                                              
				return;
			}

			var NextPanel = _m_oNamesFlipModuleMissions.DetermineHiddenPanel( oData.animPanelA, oData.animPanelB );
			_m_oNamesFlipModuleMissions.UpdateTextLabel(
				NextPanel,
				[
					{ name: 'mission_name', value: $.Localize( jsoCardDetails.name ) },
					{ name: 'card_week', value: oData.activeIndex + 1 }
				] );
			                                                                                                                    
			                                                                                      
			                                                                                                

			OperationMissionCard.GetMissionCardDetails(
				oData.activeIndex,
				_m_cp.FindChildInLayoutFile( 'id-op-mainmenu-mission-card' ),
				isPrev
			);

			_SetUpCardUnlockDisplay();
		}

		if ( isPrev )
		{
			--oData.activeIndex;
			UpdateData( oData, true );
			_m_oNamesFlipModuleMissions.BtnPressPrevAnim( oData.animPanelA, oData.animPanelB );
		}
		else
		{
			++oData.activeIndex;
			UpdateData( oData, false );
			_m_oNamesFlipModuleMissions.BtnPressNextAnim( oData.animPanelA, oData.animPanelB );
		}
		$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.generic_button_press', 'MOUSE' );
		oData.controlBtnPrev.enabled = oData.activeIndex > 0;
		oData.controlBtnNext.enabled = oData.activeIndex < oData.numMissionCards - 1;
	};

	var _OpenOperationHub = function( rewardIndexToOpenTo = -1 )
	{
		OperationUtil.OpenPopupCustomLayoutOperationHub( rewardIndexToOpenTo );
	};

	var _OpenOperationStore = function( )
	{
		OperationUtil.OpenPopupCustomLayoutOperationStore( );
	};

	                
	                
	                

	var _ShowPassStatusPanel = function( oStatus )
	{
		if( oStatus.bPremiumUser )
		{
			return;
		}


	};

	return {
		Init: _Init,
		OnInventoryUpdated: _OnInventoryUpdated,
		CheckUsersOperationStatus: _CheckUsersOperationStatus,
		OpenOperationHub: _OpenOperationHub,
		OpenOperationStore: _OpenOperationStore,
		ShowMainMenu: _ShowMainMenu,
		HideMainMenu: _HideMainMenu,
		OnStatsReceived: _OnStatsReceived,
	};
} )();



                             
( function()
{
	$.RegisterForUnhandledEvent( 'CSGOShowMainMenu', OperationMainMenu.ShowMainMenu );
	$.RegisterForUnhandledEvent( 'CSGOHideMainMenu', OperationMainMenu.HideMainMenu );

	OperationMainMenu.Init();
} )();

