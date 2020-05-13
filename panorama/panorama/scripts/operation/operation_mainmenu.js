'use strict';

var OperationMainMenu = ( function()
{

	var _m_nSeasonIndex = null;
	var _m_InventoryUpdatedHandler = null;
	var _m_cp = $.GetContextPanel();
	var _m_oNamesFlipModule = null;
	var _m_oNamesFlipModuleMissions = null;
	var _m_MissionsSelectPopupHandler = null;

	                        
	                        
	                        
	var _Init = function()
	{
		_RegisterForInventoryUpdate();
		_SetUpFlipAnimForRewards();
		_SetUpFlipAnimForMissions();
		_OnInventoryUpdated();
	};

	var _RegisterForInventoryUpdate = function()
	{
		if ( !_m_InventoryUpdatedHandler )
		{
			_m_InventoryUpdatedHandler = $.RegisterForUnhandledEvent(
				'PanoramaComponent_MyPersona_InventoryUpdated', _OnInventoryUpdated );
		}

		if ( !_m_MissionsSelectPopupHandler )
		{
			_m_MissionsSelectPopupHandler = UiToolkitAPI.RegisterJSCallback( _OnMissionSelectPopupBtnPress );
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
		_m_cp.RemoveClass( 'hidden' );
		$.DispatchEvent( 'HideMainMenuNewsPanel' );
	};

	var _ShowUpdatePanelBasedOnStatus = function( oStatus )
	{
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

		var elPreview = $.GetContextPanel().FindChildInLayoutFile( 'id-op-mainmenu-upsell-preview' );
		elPreview.SetPanelEvent( 'onactivate', _OpenOperationHub );

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
		_UpdateRewardsPanel( oStatus );
		_UpdateMissionsPanel( oStatus );
		_SetupRewardsUpsellAndHubOpenBtns();
	};

	                   
	                   
	                   
	var _UpdateRewardsPanel = function( oStatus )
	{
		_m_cp.FindChildInLayoutFile( 'id-op-mainmenu-rewards' ).RemoveClass( 'hide' );
		_m_cp.SetDialogVariableInt( 'total_reward', oStatus.nTierUnlocked );

		                  
		var oRewardsNoGaps = OperationUtil.GetRewardsData().filter( reward => !reward.isGap );
		                                                   
		_m_oNamesFlipModule.CallbackData = oRewardsNoGaps;

		                                                      
		                                          
		    
		var lockedIndex = 0;
		for ( var i = 0; i < oRewardsNoGaps.length; i++ )
		{
			if ( oRewardsNoGaps[ i ].isUnlocked === false )
			{
				lockedIndex = i;
				break;
			}
		}

		_m_oNamesFlipModule.AddParamToCallbackData( 'nextRewardIndex', lockedIndex );

		                                 
		_m_oNamesFlipModule.ActiveIndex = lockedIndex - 1;
		_m_oNamesFlipModule.UseCallback();
		    
	};

	var _SetUpFlipAnimForRewards = function()
	{
		_m_oNamesFlipModule = new FlipPanelAnimation.Constructor( {
			controlBtnPrev: _m_cp.FindChildInLayoutFile( 'id-op-reward-prev' ),
			controlBtnNext: _m_cp.FindChildInLayoutFile( 'id-op-reward-next' ),
			animPanelA: _m_cp.FindChildInLayoutFile( 'id-op-reward-name-1' ),
			animPanelB: _m_cp.FindChildInLayoutFile( 'id-op-reward-name-2' ),
			parentPanel: _m_cp.FindChildInLayoutFile( 'id-op-mainmenu-rewards' ),
			funcCallback: UpdateRewardDisplay,
			activeIndex: 0,
			oCallbackData: null
		} );
		
		_m_oNamesFlipModule[ 'ControlBtnActions' ]();

		                            
		         
		              
		               
		                             
		                        
		                 
		                      
		                       
		                    
		                             
		            
		        
		    
	};

	var UpdateRewardDisplay = function( oData, isPrev = false )
	{
		function UpdateData ( oData )
		{
			var NextPanel = _m_oNamesFlipModule.DetermineHiddenPanel( oData.animPanelA, oData.animPanelB );
			var id = oData.oCallbackData[ oData.activeIndex ].itempremium.ids[ 0 ];
			                                                                          
	
			var ImagePanel = _m_oNamesFlipModule.DetermineHiddenPanel( imgA, imgB );
			                                                                                   

			if ( oData.oCallbackData[ oData.activeIndex ].imagePath )
			{
				ImagePanel.FindChildInLayoutFile( 'id-op-reward-image-item-image' ).SetImage( 'file://{images}' + oData.oCallbackData[ oData.activeIndex ].imagePath + '.png' );
			}
			else
			{
				ImagePanel.FindChildInLayoutFile( 'id-op-reward-image-item-image' ).itemid = id;
			}

			_m_oNamesFlipModule.UpdateTextLabel(
				NextPanel,
				[
					{ name: 'reward_name', value: InventoryAPI.GetItemName( id ) },
					{ name: 'reward_idx', value: oData.oCallbackData[ oData.activeIndex ].idx + 1 }
				] );
		
			var isPremium = OperationUtil.GetOperationInfo().bPremiumUser;
			var isUnlocked = oData.oCallbackData[ oData.activeIndex ].isUnlocked;

			var elStatusicon = NextPanel.FindChildInLayoutFile( 'id-op-reward-status-icon' );
			var elStatusLabel = NextPanel.FindChildInLayoutFile( 'id-op-reward-status-text' );
			var elStatusTag = elStatusicon.GetParent();
			elStatusTag.SetPanelEvent( 'onmouseover', function() { UiToolkitAPI.HideTextTooltip(); } );

			var elSideTag = NextPanel.FindChildInLayoutFile( 'id-op-reward-image-containter-tag' );
			elSideTag.SetHasClass( 'hidden', oData.oCallbackData.nextRewardIndex !== oData.activeIndex );
			
			if ( isUnlocked && !isPremium )
			{
				elStatusicon.SetImage( 'file://{images}/icons/ui/ticket.svg' );
				elStatusLabel.text = "#op_reward_needs_pass";
				
				elStatusTag.SetPanelEvent( 'onmouseover', function() { UiToolkitAPI.ShowTextTooltip( 'id-op-reward-status-tag', '#op_rewards_pass_tooltip' ); } );
				elStatusTag.SetPanelEvent( 'onmouseout', function() { UiToolkitAPI.HideTextTooltip(); } );
			}
			else if ( !isUnlocked || !isPremium )
			{
				elStatusicon.SetImage( 'file://{images}/icons/ui/locked.svg' );
				elStatusLabel.text = "#CSGO_Fantasy_Team_Locked";

				elStatusTag.SetPanelEvent( 'onmouseover', function() { UiToolkitAPI.ShowTextTooltip( 'id-op-reward-status-tag', '#op_rewards_locked_tooltip' ); } );
				elStatusTag.SetPanelEvent( 'onmouseout', function() { UiToolkitAPI.HideTextTooltip(); } );
			}
			else if ( isUnlocked && isPremium )
			{
				elStatusicon.SetImage( 'file://{images}/icons/ui/check.svg' );
				elStatusLabel.text = "#op_rewards_Claimed";
				
				elStatusTag.SetPanelEvent( 'onmouseover', function() { UiToolkitAPI.ShowTextTooltip( 'id-op-reward-status-tag', '#op_rewards_locked_tooltip' ); } );
				elStatusTag.SetPanelEvent( 'onmouseout', function() { UiToolkitAPI.HideTextTooltip(); } );
			}
		}

		var imgA = _m_cp.FindChildInLayoutFile( 'id-op-reward-image-1' );
		var imgB = _m_cp.FindChildInLayoutFile( 'id-op-reward-image-2' );
		
		if ( isPrev )
		{
			--oData.activeIndex;
			UpdateData( oData );
			_m_oNamesFlipModule.BtnPressPrevAnim( oData.animPanelA, oData.animPanelB );
			_m_oNamesFlipModule.BtnPressPrevAnim( imgA, imgB );
		}
		else
		{
			++oData.activeIndex;
			UpdateData( oData );
			_m_oNamesFlipModule.BtnPressNextAnim( oData.animPanelA, oData.animPanelB );
			_m_oNamesFlipModule.BtnPressNextAnim( imgA, imgB );
		}
		$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.generic_button_press', 'MOUSE' );

		oData.controlBtnPrev.enabled = oData.activeIndex > 0;
		oData.controlBtnNext.enabled = oData.activeIndex < oData.oCallbackData.length - 1;
	};

	var _ShowMainMenu = function()
	{
		var moviePanel = _m_cp.FindChildInLayoutFile( 'id-op-mainmenu-upsell-movie' );
		moviePanel.SetMovie( "file://{resources}/videos/op9_mainmenu.webm" );

		_CheckUsersOperationStatus();
	};

	var _HideMainMenu = function()
	{
		if ( OperationMissionCard )
		{
			OperationMissionCard.CancelUnlockTimer();
		}

		var moviePanel = _m_cp.FindChildInLayoutFile( 'id-op-mainmenu-upsell-movie' );
		moviePanel.SetMovie( "" );
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
		var allThresholds = oStatus.numMissionsRewardThresholds.split( ',' );
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
		function UpdateData ( oData )
		{
			var jsoCardDetails = MissionsAPI.GetSeasonalOperationMissionCardDetails(
				OperationUtil.GetOperationInfo().nSeasonAccess, oData.activeIndex );

			if ( !jsoCardDetails )
			{
				                                                                                              
				return;
			}

			var NextPanel = _m_oNamesFlipModule.DetermineHiddenPanel( oData.animPanelA, oData.animPanelB );
			_m_oNamesFlipModule.UpdateTextLabel(
				NextPanel,
				[
					{ name: 'mission_name', value: $.Localize( jsoCardDetails.name ) },
					{ name: 'card_week', value: oData.activeIndex + 1 }
				] );
			                                                                                                                    
			                                                                                      
			                                                                                                

			OperationMissionCard.GetMissionCardDetails(
				oData.activeIndex,
				_m_cp.FindChildInLayoutFile( 'id-op-mainmenu-mission-card' )
			);

			_SetUpCardUnlockDisplay();
		}

		if ( isPrev )
		{
			--oData.activeIndex;
			UpdateData( oData );
			_m_oNamesFlipModule.BtnPressPrevAnim( oData.animPanelA, oData.animPanelB );
		}
		else
		{
			++oData.activeIndex;
			UpdateData( oData );
			_m_oNamesFlipModule.BtnPressNextAnim( oData.animPanelA, oData.animPanelB );
		}
		$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.generic_button_press', 'MOUSE' );
		oData.controlBtnPrev.enabled = oData.activeIndex > 0;
		oData.controlBtnNext.enabled = oData.activeIndex < oData.numMissionCards - 1;
	};

	var _SetupRewardsUpsellAndHubOpenBtns = function()
	{
		var rewardsBtn = _m_cp.FindChildInLayoutFile( 'id-op-reward-open-operation-hub' );
		var upsellBtn = _m_cp.FindChildInLayoutFile( 'id-op-reward-upsell' );

		var bPremiumUser = OperationUtil.GetOperationInfo().bPremiumUser;

		rewardsBtn.visible = bPremiumUser;
		upsellBtn.visible = !bPremiumUser;

		rewardsBtn.SetPanelEvent( 'onactivate', function()
		{
			_OpenOperationHub();
		} );

		upsellBtn.SetPanelEvent( 'onactivate', function()
		{
			OperationUtil.OpenUpSell();
		} );

		var rewardsImageBtn = _m_cp.FindChildInLayoutFile( 'id-op-reward-image-containter' );
		rewardsImageBtn.SetPanelEvent( 'onactivate', function()
		{
			_OpenOperationHub( _m_oNamesFlipModule.oData.oCallbackData[ _m_oNamesFlipModule.ActiveIndex ].idx );
		} );

		if ( !bPremiumUser )
		{
			var sUserOwnedOperationPassItemID = InventoryAPI.GetActiveSeasonPassItemId();
			var sFauxPassItemID = OperationUtil.GetPassFauxId();
			
			upsellBtn.FindChildInLayoutFile('id-op-reward-open-operation-hub-text').text = $.Localize( sUserOwnedOperationPassItemID ? '#SFUI_ConfirmBtn_ActivatePassNow' : '#op_get_premium' ).toUpperCase();

			  
			                               
			  
			var elPassSaleDiscount = upsellBtn.FindChildInLayoutFile( 'id-op-reward-open-operation-hub-passsalediscount' );
			elPassSaleDiscount.visible = sUserOwnedOperationPassItemID ? false : true;
			var sPctReduction = StoreAPI.GetStoreItemPercentReduction( sFauxPassItemID );
			if ( sPctReduction && sPctReduction !== '-0%' )
				elPassSaleDiscount.text = sPctReduction;
			else
				elPassSaleDiscount.visible = false;
		}
	};

	var _OpenOperationHub = function( rewardIndexToOpenTo = -1 )
	{
		OperationUtil.OpenPopupCustomLayoutOperationHub( rewardIndexToOpenTo );
	};

	return {
		Init: _Init,
		OnInventoryUpdated: _OnInventoryUpdated,
		CheckUsersOperationStatus: _CheckUsersOperationStatus,
		OpenOperationHub: _OpenOperationHub,
		ShowMainMenu: _ShowMainMenu,
		HideMainMenu: _HideMainMenu,
		OnMissionSelectPopupBtnPress: _OnMissionSelectPopupBtnPress
	};
} )();



                             
( function()
{
	$.RegisterForUnhandledEvent( 'CSGOShowMainMenu', OperationMainMenu.ShowMainMenu );
	$.RegisterForUnhandledEvent( 'CSGOHideMainMenu', OperationMainMenu.HideMainMenu );
	OperationMainMenu.Init();
} )();
