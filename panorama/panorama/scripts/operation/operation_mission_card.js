
'use strict';
var OperationMissionCard = ( function()
{
	var _m_missionCardPrefix = 'id-mission-card-';
	var _m_missionPrefix = 'id-mission-';
	var _m_missionBacklogIndex = 0;
	var _m_missionUnlockTimerHandler = null;

	var _GetMissionCardDetails = function( i, elParent)
	{
		var nSeasonAccess = OperationUtil.GetOperationInfo().nSeasonAccess;
		var strCardDetails = 'Mission card #' + i;
		var jsoCardDetails = MissionsAPI.GetSeasonalOperationMissionCardDetails( nSeasonAccess, i );
		if ( jsoCardDetails )
		{
			jsoCardDetails.isunlocked = i < InventoryAPI.GetMissionBacklog();

			var elMissonCard = _CreateMissionCard( jsoCardDetails, elParent, i );
			var currentlyPlayingMissionId = GameStateAPI.GetActiveQuestID();
			
			var bShowGiantLock = ( jsoCardDetails.quests.length <= 0 )
				|| ( !jsoCardDetails.isunlocked && !jsoCardDetails.showTimer );

			if ( !bShowGiantLock )
			{
				for ( var iMission = 0; iMission < jsoCardDetails.quests.length; ++iMission) {
					var missionId = jsoCardDetails.quests[ iMission ];
					_CreateMission( elMissonCard, missionId, currentlyPlayingMissionId, nSeasonAccess );
				}
			}

			if ( bShowGiantLock )
			{
				elMissonCard.SetHasClass( 'card-missions-locked', true );
			}
			else if ( GameStateAPI.IsLocalPlayerPlayingMatch() )
			{
				elMissonCard.SetHasClass( 'no-mission-warning',  elMissonCard.Data().playingMissionCount < 1 );
			}

			                                                
			var elMissions = elMissonCard.FindChildInLayoutFile( 'id-mission-card-missions-container' );
			var aMissions = elMissions.Children();
			aMissions.forEach( mission => {
				if( mission.BHasClass( 'complete' ) ){
					elMissions.MoveChildAfter( mission, aMissions[ aMissions.length - 1 ] );
				}
			} );

			elMissonCard.AddClass( 'show' );
			_CancelUnlockTimer();
			_UpdateUnlockTimer( elMissonCard );
			return elMissonCard;
		}
		else
		{
			strCardDetails += ' has undefined details';
			strCardDetails += ' nSeasonAccess='+nSeasonAccess;

			return null;
		}
	};

	var _CreateMissionCard = function( jsoCardDetails, elParent, idx )
	{
		var elMissionCard = null;
		
		if ( !elParent.FindChildInLayoutFile( _m_missionCardPrefix + jsoCardDetails.id ) )
		{
			                                                                     
			elParent.RemoveAndDeleteChildren();
			
			elMissionCard = $.CreatePanel( 'Panel',
				elParent,
				_m_missionCardPrefix + jsoCardDetails.id,
				{
					group: 'mission_cards',
					hittest: false
				} );
			
			elMissionCard.BLoadLayout('file://{resources}/layout/operation/operation_mission_card.xml', false, false );
		}
		else
		{
			elMissionCard = elParent.FindChildInLayoutFile( _m_missionCardPrefix + jsoCardDetails.id );
		}

		elMissionCard.Data().missionCardId = jsoCardDetails.id;
		elMissionCard.Data().idx = idx;
		elMissionCard.Data().isunlocked =  jsoCardDetails.isunlocked;
		_FillOutMissionCard( elMissionCard, jsoCardDetails, idx );

		return elMissionCard;
	};

	var _FillOutMissionCard = function( elMissionCard, jsoCardDetails, idx )
	{
		elMissionCard.FindChildInLayoutFile( 'id-mission-card-bg' ).SetImage( "file://{images}/operations/op9/mission_" + idx + ".png" );
		elMissionCard.FindChildInLayoutFile( 'id-mission-card-tag' ).SetHasClass( 'hidden', idx !== OperationUtil.GetOperationInfo().nActiveCardIndex );
		
		elMissionCard.SetDialogVariable( 'mission_name', $.Localize( jsoCardDetails.name ));
		elMissionCard.SetDialogVariableInt( 'card_points_needed', jsoCardDetails.operational_points );
		_UpdateEarnedPoints( elMissionCard, jsoCardDetails );
		elMissionCard.SetDialogVariableInt( 'card_week', idx + 1 );
	};

	var _UpdateUnlockTimer = function( elMissionCard )
	{
		_m_missionUnlockTimerHandler = null;
		
		if ( _m_missionBacklogIndex !== InventoryAPI.GetMissionBacklog() )
		{
			if ( InventoryAPI.GetMissionBacklog() && InventoryAPI.GetMissionBacklog() > 0 )
			{
				_m_missionBacklogIndex = InventoryAPI.GetMissionBacklog();
				                        
				_GetMissionCardDetails( elMissionCard.Data().idx, elMissionCard.GetParent());
			}
			else
			{
				_m_missionBacklogIndex = 0;
			}

			return;
		}

		                                        
		if ( elMissionCard.Data().idx === _m_missionBacklogIndex )
		{
			var seconds = InventoryAPI.GetSecondsUntilNextMission();

			                                                
			elMissionCard.SetHasClass( 'hastimer', ( seconds && seconds !== 0 ) );
			if ( seconds && seconds !== 0 )
			{
				seconds = seconds <= 60 ? 60 : seconds;
				                  
				elMissionCard.SetDialogVariable( 'unlock_time', FormatText.SecondsToSignificantTimeString( seconds ) );
				                                                           
				                                                                                                                    
			}

			_m_missionUnlockTimerHandler = $.Schedule( 5, _UpdateUnlockTimer.bind( undefined, elMissionCard ) );
			                                                                            
		}
	};

	var _CancelUnlockTimer = function()
	{
		if ( _m_missionUnlockTimerHandler )
		{
			$.CancelScheduled( _m_missionUnlockTimerHandler );
			                                                                                 
			_m_missionUnlockTimerHandler = null;
		}
	};

	var _UpdateEarnedPoints = function( elMissionCard, jsoCardDetails )
	{
		var totalCardPoints = 0;

		for ( var iMission = 0; iMission< jsoCardDetails.quests.length; iMission++ )
		{
			var missionID = jsoCardDetails.quests[ iMission];
			if ( MissionsAPI.GetQuestPoints( missionID, "remaining" ) <= 0 )
				totalCardPoints += parseInt( MissionsAPI.GetQuestDefinitionField( missionID, 'operational_points' ) );
		}

		var nEarnedPoints = totalCardPoints > jsoCardDetails.operational_points ? jsoCardDetails.operational_points : totalCardPoints;
		elMissionCard.SetDialogVariableInt( 'card_points_earned', nEarnedPoints );

		var elLabel = elMissionCard.FindChildInLayoutFile( 'id-mission-card-stars-text' );
		elLabel.text = $.Localize( '#op_mission_card_points', elMissionCard );
		elMissionCard.SetHasClass( 'card-complete', totalCardPoints >= jsoCardDetails.operational_points );
	};


	var _CreateMission = function( elMissonCard, missionId, currentlyPlayingMissionId, nSeasonAccess )
	{
		var elMission= null;
		var elContainer = elMissonCard.FindChildInLayoutFile( 'id-mission-card-missions-container' );
		if ( !elContainer.FindChildInLayoutFile( _m_missionPrefix + missionId ) )
		{
			elMission= $.CreatePanel( 'Button',
				elContainer,
				_m_missionPrefix + missionId
			);
			
			elMission.BLoadLayoutSnippet( "snippet-mission" );
		}
		else
		{
			elMission= elContainer.FindChildInLayoutFile( _m_missionPrefix + missionId );
		}

		elMission.enabled = elMissonCard.Data().isunlocked;
		           
		                                
		           
		_FillOutMission( elMissonCard, elMission, missionId, currentlyPlayingMissionId, nSeasonAccess );

		return elMission;
	};

	var _FillOutMission= function( elMissonCard, elMission, missionId, currentlyPlayingMissionId, nSeasonAccess )
	{
		var MissionItemID = InventoryAPI.GetQuestItemIDFromQuestID( Number( missionId ) );
		elMission.FindChildInLayoutFile( 'id-mission-name' ).text = InventoryAPI.GetItemName( MissionItemID );
		elMission.FindChildInLayoutFile( 'id-mission-desc' ).SetLocalizationString( MissionsAPI.GetQuestDefinitionField( missionId, "loc_description" ) );

		MissionsAPI.ApplyQuestDialogVarsToPanelJS( missionId, elMission);

		var stars = MissionsAPI.GetQuestDefinitionField( missionId, 'operational_points' );
		elMission.SetDialogVariable( 'mission_stars', stars );
		if ( stars === '1' )
		{
			elMission.SetDialogVariable( 'stars_plural', $.Localize( '#op_mission_single_star'));
		}
		else
		{
			elMission.SetDialogVariable( 'stars_plural', $.Localize( '#op_mission_plural_star'));
		}

		var goal = MissionsAPI.GetQuestPoints( missionId, "goal" );
		if ( !goal || goal === -1 )
		{
			return;
		}

		elMission.SetDialogVariableInt( 'mission_points_goal', goal );

		                                      
		var gameMode = InventoryAPI.GetQuestGameMode( MissionItemID );
		var bReplayableMission = ( gameMode === 'cooperative' || gameMode === 'coopmission' );
		var remaining = MissionsAPI.GetQuestPoints( missionId, "remaining" );
		elMission.FindChildInLayoutFile( 'id-mission-card-icon-locked' ).visible = !elMissonCard.Data().isunlocked;
		elMission.FindChildInLayoutFile( 'id-mission-card-icon-complete' ).visible = !bReplayableMission &&
			remaining === 0 &&
			elMissonCard.Data().isunlocked;
		
		elMission.FindChildInLayoutFile( 'id-mission-card-icon-play' ).visible = remaining !== 0 && elMissonCard.Data().isunlocked && currentlyPlayingMissionId !== missionId;
		elMission.FindChildInLayoutFile( 'id-mission-card-spinner' ).visble = elMissonCard.Data().isunlocked && currentlyPlayingMissionId === missionId;
		elMission.FindChildInLayoutFile( 'id-mission-card-icon-play' ).SetImage( 'file://{images}/icons/ui/' + gameMode + '.svg' );

		                                            
		elMission.FindChildInLayoutFile( 'id-mission-card-icon-replay' ).visible = bReplayableMission &&
			remaining === 0 &&
			elMissonCard.Data().isunlocked;
		
		elMission.enabled = elMissonCard.Data().isunlocked && ( remaining !== 0 || bReplayableMission );

		elMission.SetHasClass( 'complete', remaining === 0 && elMissonCard.Data().isunlocked );

		if ( currentlyPlayingMissionId === missionId )
		{
			elMissonCard.Data().playingMissionCount = elMissonCard.Data().playingMissionCount++;
		}

		var uncommitted = MissionsAPI.GetQuestPoints( missionId, "uncommitted" );
		var earned = goal - remaining;
		elMission.SetDialogVariableInt( 'mission_points_earned', earned );
		
		if ( GameStateAPI.IsQueuedMatchmaking() && remaining !== 1 )
		{
			earned += uncommitted;
		}

		var isSingleMatch = MissionsAPI.GetQuestDefinitionField( missionId, "singlematch" ) === '1' ? true : false;

		if ( !isSingleMatch && !bReplayableMission )
		{
			var progressPercent = ( earned / goal ) * 100;
			var elBar = elMission.FindChildInLayoutFile( 'op_mission-card-bar' );
			elBar.style.width = progressPercent + '%;';
		}
		else if( remaining === 0 )
		{
			var elBar = elMission.FindChildInLayoutFile( 'op_mission-card-bar' );
			elBar.style.width = '100%;';
		}

		elMission.SetPanelEvent( 'onactivate', _SetMissionOnActivate.bind( undefined, elMissonCard.Data().missionCardId, MissionItemID, nSeasonAccess ) );
	};

	var _SetMissionOnActivate = function( missionCardId, MissionItemID, nSeasonAccess )
	{
		UiToolkitAPI.ShowCustomLayoutPopupParameters( 
			'',
			'file://{resources}/layout/popups/popup_activate_mission.xml',
			'message=' + $.Localize( '#op_mission_activate' ) +
			'&' + 'requestedMissonCardId=' + missionCardId +
			'&' + 'seasonAccess=' + nSeasonAccess +
			'&' + 'questItemID=' + MissionItemID +
			'&' + 'spinner=1'
		);

		$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.generic_button_press', 'MOUSE' );

	};

	return {
		GetMissionCardDetails: _GetMissionCardDetails,
		MissionCardPrefix: _m_missionCardPrefix,
		CancelUnlockTimer: _CancelUnlockTimer
	};
} )();

( function()
{

} )();